import datetime
import os
import requests

PRODUCT_DETAILS_URLS = "https://product-details.mozilla.org/1.0/firefox_versions.json"

FILENAME = os.path.basename(__file__).split(".")[0]


def get_versions(product_details):
        return {
            "nightly": product_details["FIREFOX_NIGHTLY"].split(".")[0],
            "beta": product_details["FIREFOX_DEVEDITION"].split(".")[0],
            "release": product_details["LATEST_FIREFOX_VERSION"].split(".")[0],
        }

