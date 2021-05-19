import datetime
import os

from django.db import migrations
from google.cloud import bigquery


CHANNEL_TO_MODEL = {
    "nightly": "api.DesktopNightlyAggregation",
    "beta": "api.DesktopBetaAggregation",
    "release": "api.DesktopReleaseAggregation",
}


def log(channel, message):
    print(f"{datetime.datetime.now().strftime('%x %X')} - " f"{channel} - {message}")


def import_revisions(apps, schema_editor):

    # Don't run under tests.
    if os.environ.get("PYTEST_RUNNING") == "true":
        return

    bq_client = bigquery.Client()
    FirefoxBuildRevisions = apps.get_model("api", "FirefoxBuildRevisions")

    for channel in CHANNEL_TO_MODEL.keys():
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
        job = bq_client.query(query, job_config=job_config)
        for row in job.result():
            FirefoxBuildRevisions.objects.get_or_create(
                channel=channel,
                build_id=row.id,
                defaults={"revision": row.revision},
            )

        log(channel, "SHAs updated")


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0017_add_shas_table"),
    ]

    operations = [migrations.RunPython(import_revisions, migrations.RunPython.noop)]
