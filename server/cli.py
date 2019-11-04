import json
import urllib.request
from itertools import islice

import click
from flask.cli import with_appcontext
from sqlalchemy import inspect
from sqlalchemy.exc import ProgrammingError

from server import db
from server.api.models import Probe


PROBES_URL = "https://probeinfo.telemetry.mozilla.org/firefox/all/main/all_probes"
PRODUCT_DETAILS_URL = "https://product-details.mozilla.org/1.0/firefox_versions.json"
VERSIONS = {}
# The channels we are tracking.
CHANNELS = ("nightly", "beta", "release")
# The number of versions we are tracking historically.
NUM_VERSIONS = 10


@click.group()
def cli():
    pass


@cli.command(short_help="Create the SQL tables")
@with_appcontext
def init_tables():
    # Initialize the SQL tables.

    # NOTE: We want to be explicit and not run `create_all` on the measurements
    # tables since they are partitioned.
    db.Model.metadata.create_all(db.engine, tables=[Probe.__table__], checkfirst=True)

    tables = inspect(db.engine).get_table_names()

    # Check if base `fx_measurement` table exists.
    if "fx_measurement" not in tables:
        try:
            db.engine.execute(
                "CREATE TYPE channel AS ENUM ({})".format(
                    ", ".join(('"{}"'.format(c) for c in CHANNELS))
                )
            )
        except ProgrammingError:
            pass
        try:
            db.engine.execute(
                "CREATE TYPE agg_type AS ENUM ('histogram', 'percentiles')"
            )
        except ProgrammingError:
            pass

        # The base table for measurements.
        db.engine.execute(
            """
            CREATE TABLE fx_measurement (
                -- partition columns
                channel channel NOT NULL,
                version varchar(8) NOT NULL,
                -- dimensions
                agg_type agg_type NOT NULL,
                os varchar(16),
                build_id varchar(16),
                metric varchar(128) NOT NULL,
                metric_key varchar(128),
                client_agg_type varchar(32),
                -- data
                metric_type varchar(32) NOT NULL,
                total_users integer,
                data jsonb
            ) PARTITION BY LIST(channel)
            """
        )
        # HASH indexing for smaller indexes and because we only ever do `==` checking.
        db.engine.execute("CREATE INDEX ON fx_measurement USING HASH (os)")
        db.engine.execute("CREATE INDEX ON fx_measurement USING HASH (metric)")
        # `build_id` will often use range queries.
        db.engine.execute("CREATE INDEX ON fx_measurement (build_id)")

        # The channel partition tables.
        for channel in CHANNELS:
            db.engine.execute(
                f"""
                CREATE TABLE fx_measurement_{channel}
                PARTITION OF fx_measurement
                FOR VALUES IN ('{channel}')
                PARTITION BY LIST(version)
                """
            )


@cli.command(short_help="Check for new Firefox Versions and add tables as needed")
@with_appcontext
def update_tables():
    """
    Adds new tables as new Firefox releases come out.

    Intended to be run daily to check for new versions to avoid new
    aggregations not having a table to go to.

    """
    collections = {
        c: list(map(str, map(lambda n: v - n, range(NUM_VERSIONS))))
        for c, v in VERSIONS.items()
        if c in CHANNELS
    }

    tables = inspect(db.engine).get_table_names()

    for channel, versions in collections.items():
        for version in versions:
            if f"fx_measurement_{channel}_{version}" not in tables:
                db.engine.execute(
                    f"""
                    CREATE TABLE fx_measurement_{channel}_{version}
                    PARTITION OF fx_measurement_{channel}
                    FOR VALUES IN ('{version}')
                    """
                )


@cli.command(short_help="Import probe info")
@with_appcontext
def import_probes():

    probes = extract()
    print("{} probes extracted".format(len(probes)))

    probes = map(transform, probes)

    for batch in chunk(probes, 200):
        batch_load(batch)

    print("Probes imported.")


#
# HELPER METHODS
#


def _get_major_version(v):
    return int(v.split(".")[0])


def get_versions():
    global VERSIONS

    if not VERSIONS:
        j = json.loads(urllib.request.urlopen(PRODUCT_DETAILS_URL).read())
        VERSIONS = {
            "release": _get_major_version(j["LATEST_FIREFOX_VERSION"]),
            "beta": _get_major_version(j["LATEST_FIREFOX_DEVEL_VERSION"]),
            "nightly": _get_major_version(j["FIREFOX_NIGHTLY"]),
        }

    return VERSIONS


def get_latest_nightly_version():
    versions = json.loads(urllib.request.urlopen(PRODUCT_DETAILS_URL).read())
    return int(versions["FIREFOX_NIGHTLY"].split(".")[0])


def get_name(name):
    # Returns name with `histogram/` or `scalar/` removed, dots to underscores,
    # and lower case.

    prefix, name = name.split("/")

    if prefix in ["histogram", "scalar"]:
        name = name.replace(".", "_").lower()
        return name
    else:
        return name


def get_probe_versions(channel, probe):
    # Return an array with first version and last version.
    try:
        return [
            probe["history"][channel][-1]["versions"]["first"],
            probe["history"][channel][0]["versions"]["last"],
        ]
    except (KeyError, IndexError):
        return [None, None]


def get_optout(channel, probe):
    # Returns the optout info or None
    try:
        return probe["history"][channel][0]["optout"]
    except (KeyError, IndexError):
        return None


def chunk(it, size):
    it = iter(it)
    return iter(lambda: tuple(islice(it, size)), ())


def extract():
    # Read in all probes.
    probes_dict = json.loads(urllib.request.urlopen(PROBES_URL).read())
    # Filter probes by histograms or scalars only.
    keys = [k for k in probes_dict.keys() if k.startswith(("histogram/", "scalar/"))]
    # Restructure from one global dict to a list of dicts per probe, with `key`
    # being the original probe dict key.
    probes = [dict(probes_dict[k], key=k) for k in keys]

    return probes


def transform(probe):
    # Takes a single probe dict, and returns a Probe object we want to insert.

    latest_history = (
        probe["history"].get("nightly")
        or probe["history"].get("beta")
        or probe["history"].get("release")
    )[0]
    nightly_versions = get_probe_versions("nightly", probe)
    name = get_name(probe["key"])
    expiry = latest_history.get("expiry_version")

    id = probe["key"].replace("/", "::").lower()
    info = {
        "name": name,
        "apiName": name,
        "description": latest_history["description"],
        "type": probe["type"],
        "kind": latest_history["details"].get("kind"),
        "labels": latest_history["details"].get("labels"),
        "versions": {
            "nightly": nightly_versions,
            "beta": get_probe_versions("beta", probe),
            "release": get_probe_versions("release", probe),
        },
        "optout": {
            "nightly": get_optout("nightly", probe),
            "beta": get_optout("beta", probe),
            "release": get_optout("release", probe),
        },
        "bugs": latest_history["bug_numbers"],
        # active (bool): TRUE if last recorded nightly version is equal to
        # the latest nightly version.
        "active": expiry == "never" or int(expiry) > int(nightly_versions[1]),
        # prelease (bool): TRUE if "optout" is false on the "release"
        # channel, i.e., it's recorded by default on all channels.
        "prerelease": get_optout("release", probe) is False,
    }

    return Probe(id=id, info=info)


def batch_load(chunk):

    for probe in chunk:
        db.session.add(probe)

    return db.session.commit()


if __name__ == "__main__":
    get_versions()
    cli()
