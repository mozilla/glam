import json
import urllib.request

from django.core.management.base import BaseCommand
from django.db import connection


PRODUCT_DETAILS_URL = "https://product-details.mozilla.org/1.0/firefox_versions.json"
VERSIONS = {}
# The channels we are tracking.
CHANNELS = ("nightly", "beta", "release")
# The number of versions we are tracking historically.
NUM_VERSIONS = 10


class Command(BaseCommand):
    """
    Adds new tables as new Firefox releases come out.

    Intended to be run daily to check for new versions to avoid new
    aggregations not having a destination partition table.

    """

    help = "Creates the version level partition tables for aggregations."

    def handle(self, *args, **kwargs):
        def get_major_version(v):
            return int(v.split(".")[0])

        j = json.loads(urllib.request.urlopen(PRODUCT_DETAILS_URL).read())
        VERSIONS = {
            "release": get_major_version(j["LATEST_FIREFOX_VERSION"]),
            "beta": get_major_version(j["LATEST_FIREFOX_DEVEL_VERSION"]),
            "nightly": get_major_version(j["FIREFOX_NIGHTLY"]),
        }

        collections = {
            c: list(map(str, map(lambda n: v - n, range(NUM_VERSIONS))))
            for c, v in VERSIONS.items()
            if c in CHANNELS
        }

        tables = [
            t.name for t in connection.introspection.get_table_list(connection.cursor())
        ]

        with connection.cursor() as cursor:
            for channel, versions in collections.items():
                for version in versions:
                    table = f"glam_aggregation_{channel}_{version}"
                    if table not in tables:
                        cursor.execute(
                            f"""
                            CREATE TABLE {table}
                            PARTITION OF glam_aggregation_{channel}
                            FOR VALUES IN ('{version}')
                            """
                        )
                        self.stdout.write(
                            self.style.SUCCESS(f"Creating table: {table}")
                        )
