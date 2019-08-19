PRODUCT_DETAILS_URL = (
    "https://product-details.mozilla.org/1.0/firefox_versions.json"
)

# The number of historical versions to import for each channel.
NUM_VERSIONS = 10
# The channels to import data for.
# CHANNELS = ("release", "beta", "nightly")
CHANNELS = ("nightly",)

SOURCE_BIGQUERY_TABLE = (
    "moz-fx-data-derived-datasets.telemetry.client_probe_counts_v2"
)
