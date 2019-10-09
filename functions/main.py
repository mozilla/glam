# Cloud function to import probe data into firestore
#
# This uses the background cloud function in response to an event.

import json
import time
import urllib.request
from functools import wraps
from itertools import islice

from google.api_core.exceptions import DeadlineExceeded, ServiceUnavailable
from google.cloud import firestore


firestore_client = firestore.Client()
PROBES_URL = "https://probeinfo.telemetry.mozilla.org/firefox/all/main/all_probes"
PRODUCT_DETAILS_URL = "https://product-details.mozilla.org/1.0/firefox_versions.json"
latest_nightly = None


def retry(exceptions, tries=3, delay=1, backoff=2):
    def fn(f):
        @wraps(f)
        def fn_retry(*args, **kwargs):
            mtries, mdelay = tries, delay
            while mtries > 1:
                try:
                    return f(*args, **kwargs)
                except exceptions as e:
                    print(
                        "Error: {e}, Retrying in {mdelay} seconds...".format(
                            e=e, mdelay=mdelay
                        )
                    )
                    time.sleep(mdelay)
                    mtries -= 1
                    mdelay *= backoff
            else:
                print("All retries have been consumed.")

            return f(*args, **kwargs)

        return fn_retry  # true decorator

    return fn


def get_latest_nightly_version():
    versions = json.loads(urllib.request.urlopen(PRODUCT_DETAILS_URL).read())
    return int(versions["FIREFOX_NIGHTLY"].split(".")[0])


def get_name(name):
    # Returns a tuple of (<name>, <api_name>)
    #
    # The name is with `histogram/` or `scalar/` removed, dots to underscores,
    # and lower case.
    #
    # The API name is the same as above except s/scalar/scalar_parent_/ to
    # match the BigQuery table.
    #
    # See the bigquery-etl project for the naming transformation.

    prefix, name = name.split("/")

    if prefix == "histogram":
        name = name.replace(".", "_").lower()
        return (name, name)
    elif prefix == "scalar":
        name = name.replace(".", "_")
        return (name, f"scalar_parent_{name}")
    else:
        return (name, name)


def get_versions(channel, probe):
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
    # Takes a single probe dict, and returns a new probe dict (the document) we
    # want to insert into Firestore.

    latest_history = (
        probe["history"].get("nightly")
        or probe["history"].get("beta")
        or probe["history"].get("release")
    )[0]
    nightly_versions = get_versions("nightly", probe)
    name, api_name = get_name(probe["key"])

    doc = {
        "id": probe["key"].replace("/", "::").lower(),
        "name": name,
        "apiName": api_name,
        "description": latest_history["description"],
        "type": probe["type"],
        "kind": latest_history["details"].get("kind"),
        "labels": latest_history["details"].get("labels"),
        "versions": {
            "nightly": nightly_versions,
            "beta": get_versions("beta", probe),
            "release": get_versions("release", probe),
        },
        "optout": {
            "nightly": get_optout("nightly", probe),
            "beta": get_optout("beta", probe),
            "release": get_optout("release", probe),
        },
        "bugs": latest_history["bug_numbers"],
        # active (bool): TRUE if last recorded nightly version is equal to
        # the latest nightly version.
        "active": nightly_versions[1] == latest_nightly or False,
        # prelease (bool): TRUE if "optout" is false on the "release"
        # channel, i.e., it's recorded by default on all channels.
        "prerelease": get_optout("release", probe) is False,
    }

    return doc


def batch_load(chunk):
    batch = firestore_client.batch()

    for doc in chunk:
        doc_id = doc.pop("id")
        batch.set(firestore_client.collection("firefox-probes").document(doc_id), doc)

    return commit_batch(batch)


@retry((DeadlineExceeded, ServiceUnavailable), tries=8, delay=1, backoff=2)
def commit_batch(batch):
    return batch.commit()


def main(request):
    global latest_nightly

    print("Function triggered by HTTP request: {}".format(request))

    # Get latest nightly version for future logic.
    latest_nightly = get_latest_nightly_version()
    print("Latest nightly version: {}".format(latest_nightly))

    probes = extract()
    print("{} probes extracted".format(len(probes)))

    docs = map(transform, probes)

    for batch in chunk(docs, 500):
        batch_load(batch)

    print("All batches loaded")

    return "Probes imported."
