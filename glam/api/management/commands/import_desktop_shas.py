import datetime
import os

from django.apps import apps
from django.core.management.base import BaseCommand
from google.cloud import bigquery


# For logging
FILENAME = os.path.basename(__file__).split(".")[0]

models = {
    "nightly": "DesktopNightlyAggregationView",
    "beta": "DesktopBetaAggregationView",
    "release": "DesktopReleaseAggregationView",
}


def log(message):
    print(f"{datetime.datetime.now().strftime('%x %X')} - {FILENAME} - {message}")


class Command(BaseCommand):

    help = "Imports SHAs based on known builds"

    def handle(self, *args, **options):

        client = bigquery.Client()

        FirefoxBuildRevisions = apps.get_model("api", "FirefoxBuildRevisions")

        for channel in models.keys():

            log(f"Starting import for channel: {channel}")

            known_builds = list(
                FirefoxBuildRevisions.objects.filter(channel=channel).values_list(
                    "build_id", flat=True
                )
            )
            known_builds.append("*")

            log(f"- We currently have {len(known_builds) - 1} known SHAs")

            aggs_model = apps.get_model("api", models[channel])
            build_ids = list(
                aggs_model.objects.exclude(build_id__in=known_builds)
                .distinct("build_id")
                .values_list("build_id", flat=True)
            )

            log(f"- We are missing {len(build_ids)} SHAs")

            if len(build_ids) == 0:
                log("- No SHAs to update")
                continue

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
            job = client.query(query, job_config=job_config)
            for row in job.result():
                FirefoxBuildRevisions.objects.get_or_create(
                    channel=channel,
                    build_id=row.id,
                    defaults={"revision": row.revision},
                )

            log("- SHAs updated")
