from multiprocessing import Pool

from google.cloud import bigquery

from .constants import CHANNELS, NUM_VERSIONS, SOURCE_BIGQUERY_TABLE
from .utils import get_versions


OUTPUT = "gs://{project}/extract/{filename}"


def extract_table(collection):

    client = bigquery.Client()

    channel, version = collection
    print("[{collection}] Executing query.".format(**vars()))
    query = """
        SELECT *
        FROM `{table}`
        WHERE channel = @channel
            AND app_version = @version
        """.format(
        table=SOURCE_BIGQUERY_TABLE
    )
    params = [
        bigquery.ScalarQueryParameter("channel", "STRING", channel),
        bigquery.ScalarQueryParameter("version", "STRING", version),
    ]
    query_config = bigquery.QueryJobConfig()
    query_config.query_parameters = params
    job1 = client.query(query, job_config=query_config)
    result = job1.result()

    if result.total_rows > 0:
        print(
            "[{collection}] Extracting {n:,} rows.".format(
                collection=collection, n=result.total_rows
            )
        )
        filename = OUTPUT.format(
            project=client.project,
            filename="{channel}-{version}.json".format(**vars()),
        )
        extract_config = bigquery.ExtractJobConfig()
        extract_config.destination_format = (
            bigquery.DestinationFormat.NEWLINE_DELIMITED_JSON
        )
        job2 = client.extract_table(
            job1.destination, filename, job_config=extract_config
        )
        result = job2.result()
        print("[{collection}] Done.".format(**vars()))
    else:
        print("[{collection}] No rows to extract.".format(**vars()))


if __name__ == "__main__":
    versions = get_versions()
    collections = []
    for channel, latest_version in versions.items():
        if channel not in CHANNELS:
            continue
        for version in map(lambda n: latest_version - n, range(NUM_VERSIONS)):
            collections.append((channel, version))

    Pool(processes=NUM_VERSIONS).map(extract_table, collections)
