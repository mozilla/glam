import datetime
import os
import tempfile

from django.apps import apps
from django.core.management.base import BaseCommand
from django.db import connection
from google.cloud import storage

from glam.api import constants


# For logging
FILENAME = os.path.basename(__file__).split(".")[0]
MAPPING = {
    "fenix": {
        "model": "api.FenixCounts",
        "schema_name": "org_mozilla_fenix",
        "apps": ["nightly", "beta", "release"],
    },
    "fog": {
        "model": "api.FOGCounts",
        "schema_name": "firefox_desktop",
        "apps": ["nightly", "beta", "release"],
    },
}


def log(message):
    print(f"{datetime.datetime.now().strftime('%x %X')} - {FILENAME} - {message}")


class Command(BaseCommand):

    help = "Imports user counts"

    def add_arguments(self, parser):
        parser.add_argument(
            "--bucket",
            default=constants.GCS_BUCKET,
            help="The bucket location for the exported aggregates",
        )

    def handle(self, bucket, *args, **options):

        gcs_client = storage.Client()
        bucket = gcs_client.get_bucket(bucket)

        for product, opts in MAPPING.items():
            model = apps.get_model(opts["model"])
            schema = opts["schema_name"]
            for app_id in opts["apps"]:
                filename = f"glam-extract-{schema}_glam_{app_id}-counts.csv"
                blob = bucket.get_blob(filename)

                if not blob:
                    continue

                # Create temp table for data.
                tmp_table = f"tmp_import_{product}_counts"
                log(f"Creating temp table for import: {tmp_table}.")
                with connection.cursor() as cursor:
                    cursor.execute(f"DROP TABLE IF EXISTS {tmp_table}")
                    cursor.execute(
                        f"CREATE TABLE {tmp_table} (LIKE glam_{product}_counts)"
                    )
                    cursor.execute(
                        f"ALTER TABLE {tmp_table} DROP COLUMN id, DROP COLUMN app_id"
                    )

                # Download CSV file to local filesystem.
                fp = tempfile.NamedTemporaryFile()
                log(f"Copying GCS file {blob.name} to local file {fp.name}.")
                blob.download_to_filename(fp.name)

                #  Load CSV into temp table & insert data from temp table into
                #  aggregation tables, using upserts.
                self.import_file(tmp_table, fp, model, app_id)

                #  Drop temp table and remove file.
                log("Dropping temp table.")
                with connection.cursor() as cursor:
                    cursor.execute(f"DROP TABLE {tmp_table}")
                log(f"Deleting local file: {fp.name}.")
                fp.close()

    def import_file(self, tmp_table, fp, model, app_id):

        csv_columns = [
            f.name for f in model._meta.get_fields() if f.name not in ["id", "app_id"]
        ]
        conflict_columns = model._meta.constraints[0].fields

        log("  Importing file into temp table.")
        with connection.cursor() as cursor:
            with open(fp.name, "r") as tmp_file:
                sql = f"""
                    COPY {tmp_table} ({", ".join(csv_columns)}) FROM STDIN WITH CSV
                """
                cursor.copy_expert(sql, tmp_file)

        log("  Inserting data from temp table into aggregation tables.")
        with connection.cursor() as cursor:
            sql = f"""
                INSERT INTO {model._meta.db_table} (app_id, {", ".join(csv_columns)})
                SELECT '{app_id}', * from {tmp_table}
                ON CONFLICT ({", ".join(conflict_columns)})
                DO UPDATE SET
                    total_users = EXCLUDED.total_users
            """
            cursor.execute(sql)
