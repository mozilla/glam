import datetime
import os
import tempfile

from django.core.management.base import BaseCommand
from django.db import connection
from google.cloud import storage

from glam.api.models import FirefoxCounts


# For logging
FILENAME = os.path.basename(__file__).split(".")[0]
GCS_BUCKET = "glam-dev-bespoke-nonprod-dataops-mozgcp-net"


def log(message):
    print(f"{datetime.datetime.now().strftime('%x %X')} - {FILENAME} - {message}")


class Command(BaseCommand):

    help = "Imports user counts"

    def handle(self, *args, **options):

        self.gcs_client = storage.Client()

        blobs = self.gcs_client.list_blobs(GCS_BUCKET)
        blobs = list(
            filter(
                lambda b: b.name.startswith("glam-extract-firefox-counts"), blobs
            )
        )

        for blob in blobs:
            # Create temp table for data.
            tmp_table = "tmp_import_desktop_counts"
            log(f"Creating temp table for import: {tmp_table}.")
            with connection.cursor() as cursor:
                cursor.execute(f"DROP TABLE IF EXISTS {tmp_table}")
                cursor.execute(f"CREATE TABLE {tmp_table} (LIKE glam_firefox_counts)")
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

        csv_columns = [
            f.name for f in FirefoxCounts._meta.get_fields()
            if f.name not in ["id"]
        ]
        conflict_columns = [
            f for f in FirefoxCounts._meta.constraints[0].fields
            if f not in ["id", "total_users"]
        ]

        log("  Importing file into temp table.")
        with connection.cursor() as cursor:
            with open(fp.name, "r") as tmp_file:
                sql = "COPY {tmp_table} ({columns}) FROM STDIN WITH CSV".format(
                    tmp_table=tmp_table, columns=", ".join(csv_columns)
                )
                cursor.copy_expert(sql, tmp_file)

        log("  Inserting data from temp table into aggregation tables.")
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO glam_firefox_counts ({columns})
                SELECT * from {tmp_table}
                ON CONFLICT ({conflict_columns})
                DO UPDATE SET
                    total_users = EXCLUDED.total_users
            """.format(
                columns=", ".join(csv_columns),
                tmp_table=tmp_table,
                conflict_columns=", ".join(conflict_columns),
            )
            cursor.execute(sql)
