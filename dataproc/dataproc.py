#!/usr/bin/env python

"""Read a table from the BigQuery Storage API and write to Cloud Firestore."""

import hashlib
import json
import logging
import time
import urllib
from functools import wraps

from google.api_core.exceptions import DeadlineExceeded, ServiceUnavailable
from google.cloud import bigquery, firestore
from pyspark.sql import SparkSession


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# The channels this script will import.
CHANNELS = ["nightly", "beta", "release"]
# The number of historical versions to import for each channel.
NUM_VERSIONS = 3


PRODUCT_DETAILS_URL = "https://product-details.mozilla.org/1.0/firefox_versions.json"
SOURCE_BIGQUERY_TABLE = "moz-fx-data-derived-datasets.telemetry.client_probe_counts_v2"


def retry(exceptions, tries=3, delay=1, backoff=2):
    def fn(f):
        @wraps(f)
        def fn_retry(*args, **kwargs):
            mtries, mdelay = tries, delay
            while mtries > 1:
                try:
                    return f(*args, **kwargs)
                except exceptions as e:
                    logger.error(
                        "Error: {e}, Retrying in {mdelay} seconds...".format(
                            e=e, mdelay=mdelay
                        )
                    )
                    time.sleep(mdelay)
                    mtries -= 1
                    mdelay *= backoff
            else:
                logger.warning("All retries have been consumed.")

            return f(*args, **kwargs)

        return fn_retry  # true decorator

    return fn


@retry((DeadlineExceeded, ServiceUnavailable), tries=8, delay=1, backoff=2)
def commit_batch(batch):
    batch.commit()


def transform(row):
    """
    Takes a BigQuery result `Row` and returns a Python dict representing
    the document to store in Firestore.

    The document looks like the following::

        {
            "build_id": "20190901",
            "metric": "gc_ms",
            "metric_type": "histogram",
            "os": "Windows",
            "data": [
                {
                    "key": ...,
                    "agg_type": ...,
                    "aggregates: {
                        "0": 0.123,
                        ...
                    },
                    "quantiles: {
                        "q05": 0.234,
                        ...
                    }
                }
            ]
        }

    """
    # Create the document we will store from the columns selected.
    doc = row.asDict()

    agg_type = doc.pop("agg_type")
    if agg_type not in ["histogram", "percentiles"]:
        return

    # Pop and remap the `aggregates` instead of ``Row`` objects.
    aggregates = {
        d["key"]: round(d["value"], 4)
        for d in map(lambda x: x.asDict(), doc.pop("aggregates"))
    }

    # If there's a `key` or `client_agg_type`, we are nesting the aggregates.
    # If both exist, we double nest, with `key` as the outside layer.
    key = doc.pop("key")
    client_agg_type = doc.pop("client_agg_type")

    data = {agg_type: aggregates}
    if key:
        data["key"] = key
    if client_agg_type:
        data["client_agg_type"] = client_agg_type

    # Note: We're adding the dict key here so Firestore can merge these in a sane way.
    doc["data"] = {f"{key}-{client_agg_type}": data}

    # Generate a document ID so this can be updated each run.
    doc["doc_id"] = hashlib.blake2b(
        "{metric}-{build_id}-{os}".format(**doc).encode()
    ).hexdigest()

    return doc


def batch_insert(group):
    firestore_client = firestore.Client()

    logger.info("Processing batch {}.".format(group[0]))

    batch = firestore_client.batch()
    for row in group[1]:
        doc = transform(row)

        if not doc:
            continue

        # Pop these from the dict: doc_id, channel, version.
        # We use these to store the data and don't need them in the document itself.
        doc_id = doc.pop("doc_id")
        channel = doc.pop("channel")
        version = doc.pop("app_version")

        # Store this document in the collection by channel+version.
        collection = f"{channel}-{version}"

        batch.set(
            firestore_client.collection(collection).document(doc_id), doc, merge=True
        )

    commit_batch(batch)

    logger.info("Processed batch {}.".format(group[0]))


def extract(query):
    logger.info(query)

    bigquery_client = bigquery.Client()

    # Execute query to get destination dataset.
    job = bigquery_client.query(query)
    job.result()  # Wait for job to complete.

    logger.info("Query complete, processing via Spark.")

    (
        SparkSession.builder.appName("export_to_firestore")
        .getOrCreate()
        .read.format("bigquery")
        .option("parallelism", 0)
        .option("dataset", job.destination.dataset_id)
        .option("table", job.destination.table_id)
        .load()
        .rdd.zipWithIndex()
        .map(lambda pair: (pair[1] // 100, pair[0]))
        .groupByKey()
        .foreach(batch_insert)
    )


def _get_major_version(v):
    return int(v.split(".")[0])


def get_versions():
    j = json.loads(urllib.request.urlopen(PRODUCT_DETAILS_URL).read())
    return {
        "release": _get_major_version(j["LATEST_FIREFOX_VERSION"]),
        "beta": _get_major_version(j["LATEST_FIREFOX_DEVEL_VERSION"]),
        "nightly": _get_major_version(j["FIREFOX_NIGHTLY"]),
    }


if __name__ == "__main__":
    versions = get_versions()
    collections = {
        c: list(map(lambda n: v - n, range(NUM_VERSIONS)))
        for c, v in versions.items()
        if c in CHANNELS
    }

    # Build up the WHERE clause
    where_clauses = []
    for channel, versions in collections.items():
        app_versions = '", "'.join(map(str, versions))
        where_clauses.append(
            f'(channel="{channel}" AND app_version IN ("{app_versions}"))'
        )

    where = "\n OR ".join(where_clauses)

    query = f"""
        SELECT
            channel,
            app_version,
            os,
            app_build_id AS build_id,
            metric,
            metric_type,
            key,
            agg_type,
            client_agg_type,
            aggregates
        FROM `{SOURCE_BIGQUERY_TABLE}`
        WHERE
            metric NOT IN (
                "webext_extension_startup_ms_by_addonid",
                "webext_background_page_load_ms_by_addonid",
                "webext_browseraction_popup_preload_result_count_by_addonid"
            )
            AND {where}
    """

    extract(query)
