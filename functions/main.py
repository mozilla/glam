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

# TODO: Remove this.
# Only import probes in this list.
PROBES = [
    "a11y_backplate",
    "a11y_consumers",
    "a11y_iatable_usage_flag",
    "a11y_instantiated_flag",
    "a11y_isimpledom_usage_flag",
    "a11y_theme",
    "a11y_tree_update_timing_ms",
    "browser_engagement_active_ticks",
    "browser_engagement_max_concurrent_tab_count",
    "browser_engagement_max_concurrent_tab_pinned_count",
    "browser_engagement_max_concurrent_window_count",
    "browser_engagement_navigation_about_home",
    "browser_engagement_navigation_about_newtab",
    "browser_engagement_navigation_contextmenu",
    "browser_engagement_navigation_searchbar",
    "browser_engagement_navigation_urlbar",
    "browser_engagement_navigation_webextension",
    "browser_engagement_tab_open_event_count",
    "browser_engagement_tab_pinned_event_count",
    "browser_engagement_total_uri_count",
    "browser_engagement_unfiltered_uri_count",
    "browser_engagement_unique_domains_count",
    "browser_engagement_window_open_event_count",
    "cryptominers_blocked_count",
    "devtools_browserconsole_opened_count",
    "devtools_onboarding_is_devtools_user",
    "fxa_configured",
    "gc_ms",
    "gc_reason_2",
    "http_scheme_upgrade_type",
    "scalar_parent_timestamps_first_paint",
    "ssl_auth_algorithm_full",
    "ssl_auth_ecdsa_curve_full",
    "ssl_auth_rsa_key_size_full",
    "ssl_bytes_before_cert_callback",
    "ssl_cert_error_overrides",
    "ssl_cert_verification_errors",
    "ssl_cipher_suite_full",
    "ssl_cipher_suite_resumed",
    "ssl_ct_policy_compliant_connections_by_ca",
    "ssl_ct_policy_non_compliant_connections_by_ca",
    "ssl_handshake_result",
    "ssl_handshake_type",
    "ssl_handshake_version",
    "ssl_initial_failed_cert_validation_time_mozillapkix",
    "ssl_kea_dhe_key_size_full",
    "ssl_kea_ecdhe_curve_full",
    "ssl_kea_rsa_key_size_full",
    "ssl_key_exchange_algorithm_full",
    "ssl_key_exchange_algorithm_resumed",
    "ssl_npn_type",
    "ssl_ocsp_stapling",
    "ssl_permanent_cert_error_overrides",
    "ssl_reasons_for_not_false_starting",
    "ssl_resumed_session",
    "ssl_scts_origin",
    "ssl_scts_per_connection",
    "ssl_scts_verification_status",
    "ssl_server_auth_eku",
    "ssl_succesful_cert_validation_time_mozillapkix",
    "ssl_symmetric_cipher_full",
    "ssl_symmetric_cipher_resumed",
    "ssl_time_until_handshake_finished_keyed_by_ka",
    "ssl_time_until_ready",
    "ssl_tls12_intolerance_reason_pre",
    "ssl_tls13_intolerance_reason_post",
    "ssl_tls13_intolerance_reason_pre",
    "ssl_version_fallback_inappropriate",
    "wr_framebuild_time",
    "wr_render_time",
    "wr_scenebuild_time",
    "wr_sceneswap_time",
]


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
    # Returns with `histogram/` or `scalar/` removed, dots to underscores,
    # and lower case.

    prefix, name = name.split("/")

    if prefix in ["histogram", "scalar"]:
        name = name.replace(".", "_").lower()

    return name


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

    # TODO: Remove this.
    # Temporarily only import probes chosen probes.
    keys = [k for k in keys if get_name(k) in PROBES]

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
    name = get_name(probe["key"])
    expiry = latest_history.get("expiry_version")

    doc = {
        "id": probe["key"].replace("/", "::").lower(),
        "name": name,
        "apiName": name,
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
        # active (bool): TRUE if not expired.
        "active": expiry == "never" or int(expiry) > int(nightly_versions[1]),
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
