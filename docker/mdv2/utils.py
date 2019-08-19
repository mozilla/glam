import json
import urllib.request

from .constants import PRODUCT_DETAILS_URL


def _get_major_version(v):
    return int(v.split(".")[0])


def get_versions():
    j = json.loads(urllib.request.urlopen(PRODUCT_DETAILS_URL).read())
    return {
        "release": _get_major_version(j["LATEST_FIREFOX_VERSION"]),
        "beta": _get_major_version(j["LATEST_FIREFOX_DEVEL_VERSION"]),
        "nightly": _get_major_version(j["FIREFOX_NIGHTLY"]),
    }
