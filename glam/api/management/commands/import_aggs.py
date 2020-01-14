import json
import tempfile
import urllib.request

from django.core.management.base import BaseCommand
from django.db import connection
from google.cloud import bigquery, storage


BQ_SOURCE = "moz-fx-data-shared-prod.telemetry.client_probe_counts"
PRODUCT_DETAILS_URL = "https://product-details.mozilla.org/1.0/firefox_versions.json"
NUM_VERSIONS = 3
# TODO: Change this to the bucket that's part of the project.
GCS_BUCKET = "mdv2-export"


class Command(BaseCommand):

    help = "Imports aggregation data from BigQuery"

    def handle(self, *args, **kwargs):

        self.bq_client = bigquery.Client()
        self.gcs_client = storage.Client()

        # Get the latest version for each channel
        versions = self.get_latest_versions()

        # Delete blobs to make way for fresh ones.
        all_blobs = self.gcs_client.list_blobs(GCS_BUCKET)
        self.gcs_client.get_bucket(GCS_BUCKET).delete_blobs(all_blobs)

        for channel, versions in versions.items():
            # Export tables as CSVs for each channel and last NUM_VERSIONS
            # versions to GCS.
            self.extract_tables(channel, versions)

            blobs = self.gcs_client.list_blobs(GCS_BUCKET)
            blobs = list(filter(lambda b: b.name.startswith(f"{channel}-"), blobs))

            for blob in blobs:
                # Create temp table for data.
                tmp_table = f"tmp_import_{channel}"
                print(f"[{channel}] Creating temp table for import: {tmp_table}.")
                with connection.cursor() as cursor:
                    cursor.execute(f"DROP TABLE IF EXISTS {tmp_table}")
                    cursor.execute(f"CREATE TABLE {tmp_table} (LIKE glam_aggregation)")
                    cursor.execute(f"ALTER TABLE {tmp_table} DROP COLUMN id")

                # Download CSV file to local filesystem.
                fp = tempfile.NamedTemporaryFile()
                print(
                    f"[{channel}] Copying GCS file {blob.name} to local file {fp.name}."
                )
                blob.download_to_filename(fp.name)

                #  Load CSV into temp table & insert data from temp table into
                #  aggregation tables, using upserts.
                self.import_file(tmp_table, fp)

                #  Drop temp table and remove file.
                print(f"[{channel}] Dropping temp table.")
                with connection.cursor() as cursor:
                    cursor.execute(f"DROP TABLE {tmp_table}")
                print(f"[{channel}] Deleting local file: {fp.name}.")
                fp.close()

    def get_latest_versions(self):

        j = json.loads(urllib.request.urlopen(PRODUCT_DETAILS_URL).read())
        VERSIONS = {
            k: int(v.split(".")[0])
            for k, v in {
                "release": j["LATEST_FIREFOX_VERSION"],
                "beta": j["LATEST_FIREFOX_DEVEL_VERSION"],
                "nightly": j["FIREFOX_NIGHTLY"],
            }.items()
        }

        collections = {
            c: list(map(lambda n: v - n, range(NUM_VERSIONS)))
            for c, v in VERSIONS.items()
        }

        return collections

    def extract_tables(self, channel, versions):
        print(f"[{channel}] Executing query.")
        # TODO: Remove LIMIT after we have destination table space.
        # TODO: Remove de-duping after fixed upstream.
        # TODO: Update process in SELECT when process is added upstream.
        query = """
            WITH duped AS (
                SELECT
                    CASE
                        WHEN channel="nightly" THEN 1
                        WHEN channel="beta" THEN 2
                        WHEN channel="release" THEN 3
                    END AS channel,
                    app_version,
                    CASE
                        WHEN agg_type="histogram" THEN 1
                        WHEN agg_type="percentiles" THEN 2
                    END AS agg_type,
                    COALESCE(os, "*") AS os,
                    COALESCE(app_build_id, "*") AS app_build_id,
                    -- TODO: Update when process type is added.
                    0 AS process,
                    metric,
                    -- BigQuery has some null unicode characters which
                    -- Postgresql doesn't like, so we remove those here.
                    -- Also limit string length to 200 to match column length.
                    SUBSTR(REPLACE(key, r"\x00", ""), 0, 200) AS key,
                    client_agg_type,
                    metric_type,
                    total_users,
                    TO_JSON_STRING(aggregates) AS aggregates
                ,
                ROW_NUMBER() OVER(PARTITION BY
                    os,
                    app_version,
                    app_build_id,
                    channel,
                    metric,
                    metric_type,
                    key,
                    client_agg_type,
                    agg_type
                    ORDER BY total_users DESC) AS rank
                FROM `{table}`
                WHERE
                    channel="{channel}"
                    AND app_version IN ({versions})
            )
            SELECT * EXCEPT(rank)
            FROM duped
            WHERE rank = 1
            LIMIT 100000
        """.format(
            table=BQ_SOURCE,
            channel=channel,
            versions="{}".format(", ".join(["{!r}".format(v) for v in versions])),
        )
        query_config = bigquery.QueryJobConfig()
        # query_config.allow_large_results = True
        job1 = self.bq_client.query(query, job_config=query_config)

        result = job1.result()

        if result.total_rows > 0:
            print(
                "[{channel}] Extracting {n:,} rows.".format(
                    channel=channel, n=result.total_rows
                )
            )
            # filename = f"gs://glam-dev-bespoke-nonprod-dataops-mozgcp-net/{channel}-*.csv"
            filename = f"gs://{GCS_BUCKET}/{channel}-*.csv"
            extract_config = bigquery.ExtractJobConfig()
            extract_config.destination_format = bigquery.DestinationFormat.CSV
            extract_config.print_header = False
            job2 = self.bq_client.extract_table(
                job1.destination, filename, job_config=extract_config
            )
            result = job2.result()
            print("[{channel}] Done.".format(**vars()))
        else:
            print("[{channel}] No rows to extract.".format(**vars()))

    def import_file(self, tmp_table, fp):

        columns = [
            "channel",
            "version",
            "agg_type",
            "os",
            "build_id",
            "process",
            "metric",
            "metric_key",
            "client_agg_type",
            "metric_type",
            "total_users",
            "data",
        ]
        data_columns = [
            "metric_type",
            "total_users",
            "data",
        ]

        print("  Importing file into temp table.")
        with connection.cursor() as cursor:
            with open(fp.name, "r") as tmp_file:
                sql = "COPY {tmp_table} ({columns}) FROM STDIN WITH CSV".format(
                    tmp_table=tmp_table, columns=", ".join(columns)
                )
                cursor.copy_expert(sql, tmp_file)

        print("  Inserting data from temp table into aggregation tables.")
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO glam_aggregation ({columns})
                SELECT * from {tmp_table}
                ON CONFLICT ({conflict_columns})
                DO UPDATE SET
                    total_users = EXCLUDED.total_users,
                    data = EXCLUDED.data
            """.format(
                columns=", ".join(columns),
                tmp_table=tmp_table,
                conflict_columns=", ".join(set(columns) - set(data_columns)),
            )
            cursor.execute(sql)
