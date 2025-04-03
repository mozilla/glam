def get_glean_table_config(product):
    """Get BigQuery table configuration for Glean-based products."""
    table_configs = {
        'fog': {
            'dataset': 'moz-fx-data-shared-prod',
            'table_prefix': 'org_mozilla_firefox',
            'metrics_table': 'metrics',
            'baseline_table': 'baseline',
            'events_table': 'events'
        },
        'fenix': {
            'dataset': 'moz-fx-data-shared-prod',
            'table_prefix': 'org_mozilla_fenix',
            'metrics_table': 'metrics',
            'baseline_table': 'baseline',
            'events_table': 'events'
        }
    }
    return table_configs.get(product)

def build_glean_query(config, metric, metric_type, app_id, ping_type, os, time_horizon):
    """Build BigQuery query for Glean-based products."""
    table_config = get_glean_table_config(config['product'])
    if not table_config:
        raise ValueError(f"Invalid product: {config['product']}")

    # Determine which table to query based on ping_type
    table_name = f"{table_config['dataset']}.{table_config['table_prefix']}_{table_config[ping_type + '_table']}"

    # Build the query based on metric type
    if metric_type in ['timing_distribution', 'memory_distribution', 'custom_distribution']:
        query = f"""
        SELECT
            submission_date,
            {metric} as value,
            COUNT(*) as count
        FROM {table_name}
        WHERE
            submission_date >= DATE_SUB(CURRENT_DATE(), INTERVAL {time_horizon} DAY)
            AND app_id = '{app_id}'
            AND os = '{os}'
            AND ping_type = '{ping_type}'
        GROUP BY submission_date, {metric}
        ORDER BY submission_date DESC
        """
    else:
        raise ValueError(f"Unsupported metric type: {metric_type}")

    return query

def execute_glean_query(query):
    """Execute BigQuery query for Glean-based products."""
    client = bigquery.Client("efilho-sandbox")
    query_job = client.query(query)
    return query_job.result()
