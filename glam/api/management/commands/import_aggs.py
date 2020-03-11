import datetime
import tempfile

from django.core.management.base import BaseCommand
from django.db import connection
from google.cloud import storage

from glam.api import constants


BQ_SOURCE = "moz-fx-data-shared-prod.telemetry.client_probe_counts"
GCS_BUCKET = "glam-dev-bespoke-nonprod-dataops-mozgcp-net"


def log(message):
    print(
        "{stamp} - {message}".format(
            stamp=datetime.datetime.now().strftime("%x %X"), message=message
        )
    )


class Command(BaseCommand):

    help = "Imports aggregation data from BigQuery"

    def add_arguments(self, parser):
        parser.add_argument(
            "channel", choices=constants.CHANNEL_IDS.keys(),
        )

    def handle(self, *args, **options):

        channel = options["channel"]

        self.gcs_client = storage.Client()

        blobs = self.gcs_client.list_blobs(GCS_BUCKET)
        blobs = list(
            filter(lambda b: b.name.startswith(f"extract-desktop-{channel}"), blobs)
        )

        for blob in blobs:
            # Create temp table for data.
            tmp_table = f"tmp_import_{channel}"
            log(f"Creating temp table for import: {tmp_table}.")
            with connection.cursor() as cursor:
                cursor.execute(f"DROP TABLE IF EXISTS {tmp_table}")
                cursor.execute(f"CREATE TABLE {tmp_table} (LIKE glam_aggregation)")
                cursor.execute(f"ALTER TABLE {tmp_table} DROP COLUMN id")

            # Download CSV file to local filesystem.
            fp = tempfile.NamedTemporaryFile()
            log(f"Copying GCS file {blob.name} to local file {fp.name}.")
            blob.download_to_filename(fp.name)

            #  Load CSV into temp table & insert data from temp table into
            #  aggregation tables, using upserts.
            self.import_file(tmp_table, fp)

            #  Drop temp table and remove file.
            log("Dropping temp table.")
            with connection.cursor() as cursor:
                cursor.execute(f"DROP TABLE {tmp_table}")
            log(f"Deleting local file: {fp.name}.")
            fp.close()

        # Once all files are loaded, refresh the materialized views.
        if blobs:
            with connection.cursor() as cursor:
                log(f"Refreshing materialized view for view_glam_aggregation_{channel}")
                cursor.execute(
                    f"""
                    REFRESH MATERIALIZED VIEW CONCURRENTLY
                    view_glam_aggregation_{channel}
                    """
                )

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

        log("  Importing file into temp table.")
        with connection.cursor() as cursor:
            with open(fp.name, "r") as tmp_file:
                sql = "COPY {tmp_table} ({columns}) FROM STDIN WITH CSV".format(
                    tmp_table=tmp_table, columns=", ".join(columns)
                )
                cursor.copy_expert(sql, tmp_file)

        log("  Inserting data from temp table into aggregation tables.")
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
