import datetime
import os
import tempfile

from django.apps import apps
from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone
from google.cloud import bigquery, storage

from glam.api import constants
from glam.api.models import LastUpdated


# For logging
FILENAME = os.path.basename(__file__).split(".")[0]
CHANNEL_TO_MODEL = {
    "nightly": "api.DesktopNightlyAggregation",
    "beta": "api.DesktopBetaAggregation",
    "release": "api.DesktopReleaseAggregation",
}


def log(channel, message):
    print(
        f"{datetime.datetime.now().strftime('%x %X')} - "
        f"{FILENAME} - {channel} - {message}"
    )


class Command(BaseCommand):

    help = "Imports aggregation data"

    def add_arguments(self, parser):
        parser.add_argument(
            "channel",
            choices=constants.CHANNEL_IDS.keys(),
        )
        parser.add_argument(
            "--bucket",
            help="The bucket location for the exported aggregates",
            default=constants.GCS_BUCKET,
        )

    def handle(self, bucket, *args, **options):

        channel = options["channel"]
        model = apps.get_model(CHANNEL_TO_MODEL[channel])

        self.gcs_client = storage.Client()
        self.bq_client = bigquery.Client()

        blobs = self.gcs_client.list_blobs(bucket)
        blobs = list(
            filter(lambda b: b.name.startswith(f"aggs-desktop-{channel}"), blobs)
        )

        for blob in blobs:
            # Create temp table for data.
            tmp_table = f"tmp_import_desktop_{channel}"
            log(channel, f"Creating temp table for import: {tmp_table}.")
            with connection.cursor() as cursor:
                cursor.execute(f"DROP TABLE IF EXISTS {tmp_table}")
                cursor.execute(
                    f"CREATE TABLE {tmp_table} (LIKE {model._meta.db_table})"
                )
                cursor.execute(f"ALTER TABLE {tmp_table} DROP COLUMN id")

            # Download CSV file to local filesystem.
            fp = tempfile.NamedTemporaryFile()
            log(channel, f"Copying GCS file {blob.name} to local file {fp.name}.")
            blob.download_to_filename(fp.name)

            #  Load CSV into temp table & insert data from temp table into
            #  aggregation tables, using upserts.
            self.import_file(tmp_table, fp, model, channel)

            #  Drop temp table and remove file.
            log(channel, "Dropping temp table.")
            with connection.cursor() as cursor:
                cursor.execute(f"DROP TABLE {tmp_table}")
            log(channel, f"Deleting local file: {fp.name}.")
            fp.close()

        # Once all files are loaded, refresh the materialized views.

        if blobs:
            with connection.cursor() as cursor:
                view = f"view_{model._meta.db_table}"
                log(channel, f"Refreshing materialized view for {view}")
                cursor.execute(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view}")
                log(channel, "Refresh completed.")

        LastUpdated.objects.update_or_create(
            product="desktop", defaults={"last_updated": timezone.now()}
        )

        # Now import the revisions to match any new build IDs we imported.
        self.import_revisions(channel)

    def import_file(self, tmp_table, fp, model, channel):

        csv_columns = [f.name for f in model._meta.get_fields() if f.name not in ["id"]]

        log(channel, "  Importing file into temp table.")
        with connection.cursor() as cursor:
            with open(fp.name, "r") as tmp_file:
                sql = f"""
                    COPY {tmp_table} ({", ".join(csv_columns)}) FROM STDIN WITH CSV
                """
                cursor.copy_expert(sql, tmp_file)

        log(channel, "  Inserting data from temp table into aggregation tables.")
        with connection.cursor() as cursor:
            sql = f"""
                INSERT INTO {model._meta.db_table} ({", ".join(csv_columns)})
                SELECT * from {tmp_table}
                ON CONFLICT ON CONSTRAINT desktop_{channel}_unique_dimensions
                DO UPDATE SET
                    total_users = EXCLUDED.total_users,
                    histogram = EXCLUDED.histogram,
                    percentiles = EXCLUDED.percentiles,
                    total_sample = EXCLUDED.total_sample
            """
            cursor.execute(sql)

    def import_revisions(self, channel):

        FirefoxBuildRevisions = apps.get_model("api", "FirefoxBuildRevisions")

        known_builds = list(
            FirefoxBuildRevisions.objects.filter(channel=channel).values_list(
                "build_id", flat=True
            )
        )
        known_builds.append("*")

        log(channel, f"We currently have {len(known_builds) - 1} known SHAs")

        aggs_model = apps.get_model(CHANNEL_TO_MODEL[channel])
        build_ids = list(
            aggs_model.objects.exclude(build_id__in=known_builds)
            .distinct("build_id")
            .values_list("build_id", flat=True)
        )

        log(channel, f"We are missing {len(build_ids)} SHAs")

        if len(build_ids) == 0:
            log(channel, "No SHAs to update")
            return

        query = """
            SELECT build.build.id, build.source.revision
            FROM `moz-fx-data-shared-prod.telemetry.buildhub2`
            WHERE build.build.id IN UNNEST(@build_ids)
            AND build.target.channel = @channel
            GROUP BY 1, 2
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ArrayQueryParameter("build_ids", "STRING", build_ids),
                bigquery.ScalarQueryParameter("channel", "STRING", channel),
            ]
        )
        job = self.bq_client.query(query, job_config=job_config)
        for row in job.result():
            FirefoxBuildRevisions.objects.get_or_create(
                channel=channel,
                build_id=row.id,
                defaults={"revision": row.revision},
            )

        log(channel, "SHAs updated")
