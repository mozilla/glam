from google.cloud import bigquery
import orjson

project_id = "moz-fx-data-glam-prod-fca7"
dataset_id = "glam_etl"
table_id = f"firefox_desktop_glam_release__extract_probe_counts_v1"

# Initialize a BigQuery client
client = bigquery.Client(project=project_id)

# Specify the dataset and table
table_ref = client.dataset(dataset_id).table(table_id)
table = client.get_table(table_ref)

# Define the parameters
build_id_filter = 'AND build_id != "*"'

# Build the SQL query with parameters
query = f"""
    WITH
    versions AS (
    SELECT
        ARRAY_AGG(DISTINCT version
        ORDER BY
        version DESC
        LIMIT
        3) AS selected_versions
    FROM
        `moz-fx-data-glam-prod-fca7.glam_etl.firefox_desktop_glam_release__extract_probe_counts_v1`
    WHERE
        metric = "networking_http_3_upload_throughput")
    SELECT
    * EXCEPT(selected_versions)
    FROM
    `moz-fx-data-glam-prod-fca7.glam_etl.firefox_desktop_glam_release__extract_probe_counts_v1`,
    versions
    WHERE
    metric = "networking_http_3_upload_throughput"
    AND build_id != '*'
    AND version IN UNNEST(versions.selected_versions)
"""

# Run the query with parameters
query_job = client.query(query)

response = []

for row in query_job:

    data = {
        "version": row.version,
        "ping_type": row.ping_type,
        "os": row.os,
        "build_id": row.build_id,
        "build_date": row.build_date,
        "metric": row.metric,
        "metric_type": row.metric_type,
        "metric_key": row.metric_key,
        "client_agg_type": row.client_agg_type,
        "total_users": row.total_users,
        "sample_count": row.total_sample,
        "histogram": row.histogram and orjson.loads(row.histogram) or "",
        "percentiles": row.percentiles and orjson.loads(row.percentiles) or "",
    }

    # Get the total distinct client IDs for this set of dimensions.
    # data["total_addressable_market"] = counts.get(f"{row.version}-{row.build_id}")

    response.append(data)

print(response)
