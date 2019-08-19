import hashlib
import json
import sys
from multiprocessing import Pool

from google.api_core.exceptions import DeadlineExceeded, ServiceUnavailable
from google.cloud import firestore, storage

from .constants import CHANNELS, NUM_VERSIONS
from .utils import get_versions


def _commit_batch(client, batch, retries):
    try:
        batch.commit()
    except (DeadlineExceeded, ServiceUnavailable):
        retries.append(batch)
    except:  # noqa
        print("Unexpected error:", sys.exc_info()[0])

    return client.batch()


def import_collection(collection):

    # Each thread needs its own clients, so this is done here.
    STORAGE = storage.Client()
    BUCKET = STORAGE.get_bucket(STORAGE.project)
    FIRESTORE = firestore.Client()
    RETRIES = []

    print(
        "[{collection}] Starting inserting of batched documents.".format(
            **vars()
        )
    )

    json_file = BUCKET.get_blob("extract/{collection}.json".format(**vars()))
    if not json_file:
        print("[{collection}] No records imported.".format(**vars()))
        return

    json_str = json_file.download_as_string().decode("utf-8")
    try:
        json_data = [json.loads(line) for line in json_str.split("\n") if line]
    except json.JSONDecodeError:
        print("JSON decoding error in file {collection}.json".format(**vars()))
        return

    i = None
    batch = FIRESTORE.batch()
    collection_ref = FIRESTORE.collection(collection)

    for i, data in enumerate(json_data):

        # Every 500 records commit the batch.
        if i % 500 == 0 and i > 0:
            batch = _commit_batch(FIRESTORE, batch, RETRIES)

        # For every 1k records, print a notification for progress.
        if i % 1000 == 0 and i > 0:
            print("[{collection}] Processed {i:,} records.".format(**vars()))

        # TODO: Combine aggregates with a key into a keyed aggregates dict and
        # remove `key` from `doc_id`.
        # NOTE: The fields `app_build_id` and `os` can be missing from the
        # extracted data if they are NULL in bigquery.
        try:
            doc = {
                "metric": data["metric"],
                "build_id": data.get("app_build_id"),
                "os": data.get("os"),
                "agg_type": data["agg_type"],
                "aggregates": data["aggregates"],
                "key": data["key"],
                "metric_type": data["metric_type"],
            }
        except KeyError:
            print("Missing expected key in data")
            print(data)
            raise

        # Note: If needed, the equivalent call in nodejs would be the
        # following, using the "blakejs" lib:
        # ```
        # var blake = require("blakejs");
        # blake.blake2bHex("test")
        # ```
        doc_id = hashlib.blake2b(
            "{metric}-{build_id}-{os}-{agg_type}-{key}".format(**doc).encode()
        ).hexdigest()

        batch.set(collection_ref.document(doc_id), doc)

    _commit_batch(FIRESTORE, batch, RETRIES)
    print("[{collection}] Imported {i:,} record(s).".format(**vars()))

    if RETRIES:
        retries = RETRIES.copy()
        RETRIES.clear()

        for batch in retries:
            _commit_batch(FIRESTORE, batch, RETRIES)

        print(
            "[{collection}] Imported {n} failed batches.".format(
                collection=collection, n=len(retries)
            )
        )


if __name__ == "__main__":
    versions = get_versions()
    collections = []
    for channel, latest_version in versions.items():
        if channel not in CHANNELS:
            continue
        for version in map(lambda n: latest_version - n, range(NUM_VERSIONS)):
            collections.append("{channel}-{version}".format(**vars()))

    Pool(processes=4).map(import_collection, collections)

    print("Import complete")
