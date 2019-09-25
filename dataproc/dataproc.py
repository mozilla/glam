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


def batch_insert(group):
    firestore_client = firestore.Client()

    logger.info("Processing batch {}.".format(group[0]))

    batch = firestore_client.batch()
    for row in group[1]:
        # Create the document we will store from the columns selected.
        doc = row.asDict()
        # Remap the aggregates instead of ``Row`` objects.
        doc["aggregates"] = {
            d["key"]: round(d["value"], 4)
            for d in map(lambda x: x.asDict(), doc["aggregates"])
        }
        # Pop the `channel` and `app_version` for use in the collection.
        channel = doc.pop("channel")
        app_version = doc.pop("app_version")
        # Generate a document ID so this can be updated each run.
        doc_id = hashlib.blake2b(
            "{metric}-{build_id}-{os}-{agg_type}-{key}".format(**doc).encode()
        ).hexdigest()
        # Store this document in the collection by channel+version.
        collection = "{channel}-{app_version}".format(
            channel=channel, app_version=app_version
        )
        batch.set(firestore_client.collection(collection).document(doc_id), doc)

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
            aggregates
        FROM `{SOURCE_BIGQUERY_TABLE}`
        WHERE {where}
    """

    extract(query)
