import datetime
import os

from django.apps import apps
from django.core.management.base import BaseCommand
from google.cloud import bigquery

from glam.api import constants

# For logging
FILENAME = os.path.basename(__file__).split(".")[0]


def log(channel, message):
    print(
        f"{datetime.datetime.now().strftime('%x %X')} - "
        f"{FILENAME} - {channel} - {message}"
    )


class Command(BaseCommand):

    help = "Imports builds SHA revisions"

    channel_choices = list(constants.CHANNEL_IDS.keys()) + ["all"]

    def add_arguments(self, parser):
        parser.add_argument(
            "--channel",
            choices=self.channel_choices,
            default="all",
            required=False,
        )

    def handle(self, *args, **options):
        self.bq_client = bigquery.Client()
        channels = (
            [options["channel"]]
            if options["channel"] != "all"
            else ["nightly", "beta", "release"]
        )
        for channel in channels:
            self.import_revisions(channel)

    def import_revisions(self, channel):

        FirefoxBuildRevisions = apps.get_model("api", "FirefoxBuildRevisions")

        known_builds = list(
            FirefoxBuildRevisions.objects.filter(channel=channel).values_list(
                "build_id", flat=True
            )
        )
        known_builds.append("*")

        log(channel, f"We currently have {len(known_builds) - 1} known SHAs")

        aggregates_table = (
            f"moz-fx-data-shared-prod.glam_etl.glam_desktop_{channel}_aggregates"
        )
        new_builds_query = f"""
            SELECT ARRAY_AGG(DISTINCT(build_id)) AS builds
            FROM {aggregates_table}
            WHERE build_id NOT IN UNNEST(@known_builds)
        """
        new_builds_job_cfg = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ArrayQueryParameter("known_builds", "STRING", known_builds),
            ]
        )
        new_builds_job = self.bq_client.query(
            new_builds_query, job_config=new_builds_job_cfg
        )
        new_builds = next(new_builds_job.result()).builds

        log(channel, f"We are missing {len(new_builds)} SHAs")

        if len(new_builds) == 0:
            log(channel, "No SHAs to update")
            return

        query = """
            SELECT build.build.id, build.source.revision
            FROM `moz-fx-data-shared-prod.telemetry.buildhub2`
            WHERE build.build.id IN UNNEST(@new_builds)
            AND build.target.channel = @channel
            GROUP BY 1, 2
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ArrayQueryParameter("new_builds", "STRING", new_builds),
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
