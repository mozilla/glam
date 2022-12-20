import datetime
import io
import os
import re
import tempfile


from django.apps import apps
from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone
from google.cloud import storage
from psycopg2.errors import CharacterNotInRepertoire

from glam.api import constants
from glam.api.models import LastUpdated


# For logging
FILENAME = os.path.basename(__file__).split(".")[0]
APP_TO_MODEL = {
    "nightly": "api.FenixAggregation",
    "beta": "api.FenixAggregation",
    "release": "api.FenixAggregation",
}

PRODUCT_TO_MODEL = {
    "org_mozilla_fenix": "api.FenixAggregation",
    "firefox_desktop": "api.FOGAggregation",
}


def log(app_id, message):
    print(
        f"{datetime.datetime.now().strftime('%x %X')} - "
        f"{FILENAME} - {app_id} - {message}"
    )


class Command(BaseCommand):

    help = "Imports Glean aggregations"

    def add_arguments(self, parser):
        parser.add_argument(
            "app_id",
            choices=APP_TO_MODEL.keys(),
            help="The Glean app_id we are importing data for.",
        )
        parser.add_argument(
            "--bucket",
            default=constants.GCS_BUCKET,
            help="The bucket location for the exported aggregates",
        )

    def handle(self, app_id, bucket, *args, **options):
        self.gcs_client = storage.Client()
        for product in PRODUCT_TO_MODEL.keys():
            model = apps.get_model(PRODUCT_TO_MODEL[product])
            # Find all files in bucket that match the pattern with provided app_id.
            pattern = re.compile(f"glam-extract-{product}_glam_{app_id}-\\d+.csv")
            blobs = self.gcs_client.list_blobs(bucket)
            blobs = [blob for blob in blobs if pattern.fullmatch(blob.name)]

            for blob in blobs:
                # Create temp table for data.
                tmp_table = "tmp_import_glean_{}".format(app_id)
                log(app_id, f"Creating temp table for import: {tmp_table}.")
                with connection.cursor() as cursor:
                    cursor.execute(f"DROP TABLE IF EXISTS {tmp_table}")
                    cursor.execute(
                        f"CREATE TABLE {tmp_table} (LIKE {model._meta.db_table})"
                    )
                    # The incoming CSV files don't have an `id` or `app_id`.
                    cursor.execute(
                        f"ALTER TABLE {tmp_table} DROP COLUMN id, DROP COLUMN app_id"
                    )

                # Download CSV file to local filesystem.
                fp = tempfile.NamedTemporaryFile()
                log(app_id, f"Copying GCS file {blob.name} to local file {fp.name}.")
                blob.download_to_filename(fp.name)

                #  Load CSV into temp table & insert data from temp table into
                #  aggregation tables, using upserts.
                self.import_file(tmp_table, fp, app_id, product)

                #  Drop temp table and remove file.
                log(app_id, "Dropping temp table.")
                with connection.cursor() as cursor:
                    cursor.execute(f"DROP TABLE {tmp_table}")
                log(app_id, f"Deleting local file: {fp.name}.")
                fp.close()

            # Once all files are loaded, refresh the materialized views.

            if blobs:
                with connection.cursor() as cursor:
                    view = f"view_{model._meta.db_table}"
                    log(app_id, f"Refreshing materialized view for {view}")
                    cursor.execute(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view}")
                    log(app_id, "Refresh completed.")

            LastUpdated.objects.update_or_create(
                product=f"fenix-{app_id}", defaults={"last_updated": timezone.now()}
            )

    def sanitize_import_file_quickfix_1804769(self, fp_name):
        """Write and return a sanitized temp file without lines that contain invalid characters."""
        out_fp_name = f"{fp_name}_sanitized"

        with io.open(fp_name, "r", encoding="ascii") as f_in:
            with io.open(out_fp_name, "w+", encoding="utf-8") as f_out:
                for line in f_in:
                    try:
                        if b"\x00" not in line.encode("utf-8"):
                            f_out.write(line)
                    except UnicodeError:
                        # Skip the line if it is not UTF-8 compatible
                        continue
        return out_fp_name

    def import_file(self, tmp_table, fp, app_id, product):

        model = apps.get_model(PRODUCT_TO_MODEL[product])

        csv_columns = [
            f.name for f in model._meta.get_fields() if f.name not in ["id", "app_id"]
        ]

        log(app_id, "Importing file into temp table.")
        with connection.cursor() as cursor:
            with open(fp.name, "r") as tmp_file:
                sql = f"""
                    COPY {tmp_table} ({", ".join(csv_columns)}) FROM STDIN WITH CSV
                """
                try:
                    cursor.copy_expert(sql, tmp_file)
                except CharacterNotInRepertoire:
                    log(
                        app_id,
                        " Postgres found an invalid character while importing this file.",
                    )
                    log(
                        app_id,
                        " Attempting to sanitize file by removing invalid rows...",
                    )
                    sanitized_tmp_file = self.sanitize_import_file_quickfix_1804769(
                        fp.name
                    )
                    with open(sanitized_tmp_file, "r") as s_temp_file:
                        cursor.copy_expert(sql, s_temp_file)

        log(app_id, " Inserting data from temp table into aggregation tables.")
        with connection.cursor() as cursor:
            sql = f"""
                INSERT INTO {model._meta.db_table} (app_id, {", ".join(csv_columns)})
                SELECT '{app_id}', * from {tmp_table}
                ON CONFLICT ON CONSTRAINT {model._meta.constraints[0].name}
                DO UPDATE SET
                    total_users = EXCLUDED.total_users,
                    histogram = EXCLUDED.histogram,
                    percentiles = EXCLUDED.percentiles,
                    total_sample = EXCLUDED.total_sample
            """
            cursor.execute(sql)
