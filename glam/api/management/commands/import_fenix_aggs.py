import datetime
import tempfile

from django.core.management.base import BaseCommand
from django.db import connection
from google.cloud import storage


GCS_BUCKET = "glam-dev-bespoke-nonprod-dataops-mozgcp-net"


def log(message):
    print(
        "{stamp} - {message}".format(
            stamp=datetime.datetime.now().strftime("%x %X"), message=message
        )
    )


class Command(BaseCommand):

    help = "Imports aggregation data from BigQuery"

    def handle(self, *args, **kwargs):

        self.gcs_client = storage.Client()

        blobs = self.gcs_client.list_blobs(GCS_BUCKET)
        blobs = list(filter(lambda b: b.name.startswith("fenix-extract-"), blobs))

        for blob in blobs:
            # Create temp table for data.
            tmp_table = "tmp_import"
            log(f"Creating temp table for import: {tmp_table}.")
            with connection.cursor() as cursor:
                cursor.execute(f"DROP TABLE IF EXISTS {tmp_table}")
                # TODO: Abstract LIKE table.
                cursor.execute(
                    f"CREATE TABLE {tmp_table} (LIKE glam_fenix_aggregation)"
                )
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

    def import_file(self, tmp_table, fp):

        # TODO: Generalize this. Pull from the Django model and constraint?
        columns = [
            "channel",
            "version",
            "ping_type",
            "os",
            "build_id",
            "metric",
            "metric_type",
            "metric_key",
            "client_agg_type",
            "agg_type",
            "total_users",
            "data",
        ]
        data_columns = [
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
        # TODO: Abstract table
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO glam_fenix_aggregation ({columns})
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
