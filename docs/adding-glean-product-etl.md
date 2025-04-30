# Adding a New Product to GLAM ETL

## Overview
This guide explains how to add a new product to the GLAM (Glean Aggregated Metrics) ETL. The ETL currently supports Firefox Desktop and Firefox for Android, and can be extended to support additional products.

## Prerequisites
1. The product must use Glean telemetry and use the `metrics` ping
2. The product must have a stable app_id or product identifier

## Limitations
The ETL currently supports `metrics` and `baseline` pings only

## Implementation Steps

### 1. Add Product Configuration
In `generate.py`, add your product configuration to the `config` dictionary. For each channel (nightly, beta, release), you'll need to specify:

```python
"your_product_id_glam_channel": {
    "build_date_udf": "mozfun.glam.build_hour_to_datetime",  # or custom UDF
    "filter_version": True,  # whether to filter by version
    "num_versions_to_keep": 3,  # number of versions to maintain
    "total_users": 10,  # minimum user threshold
    "minimum_client_count": X,  # minimum client count (should be ~0.5% of WAU)
}
```

### 2. Add Channel Prefixes
Add your product's channel prefixes to the `channel_prefixes` dictionary:

```python
"your_product_id_glam_nightly": "nightly",
"your_product_id_glam_beta": "beta",
"your_product_id_glam_release": "release",
```

### 3. Supported Metric types and SQL Templates
The system uses the following SQL templates (located in `templates/`) for all supported metric types:
- `clients_daily_scalar_aggregates.sql`
- `clients_daily_histogram_aggregates.sql`
- `clients_scalar_aggregates.sql`
- `clients_histogram_aggregates.sql`
- `scalar_bucket_counts.sql`
- `histogram_bucket_counts.sql`
- `probe_counts.sql`
- `user_counts.sql`
- `sample_counts.sql`

### 4. Testing
1. Generate the ETL queries for your product:
```bash
python -m bigquery_etl.glam.generate --prefix your_product_id_glam_channel
```

2. Verify the generated SQL files in the output directory

3. Test the ETL process with a small dataset

## Configuration Parameters

### Required Parameters
- `build_date_udf`: Function to convert build IDs to datetime
- `filter_version`: Whether to filter by version
- `num_versions_to_keep`: Number of versions to maintain
- `total_users`: Minimum user threshold

### Optional Parameters
- `minimum_client_count`: Minimum client count threshold (defaults to ~0.5% of WAU)

## Best Practices
1. Start with a small subset of metrics
2. Test with a development environment first
3. Monitor data quality and volume
4. Adjust thresholds based on your product's usage patterns
5. Document any custom UDFs or modifications needed

## Common Issues
1. Missing required fields in telemetry data
2. Incorrect build ID format
3. Insufficient user count for aggregation
4. Version filtering issues
5. Channel identification problems