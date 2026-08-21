-- STEP 1: build the missing day's metrics delta into _new_v1.
-- _new_v1 is scratch; the next scheduled run overwrites it.
--
-- bq query --use_legacy_sql=false --replace \
--   --project_id=moz-fx-glam-prod --dataset_id=moz-fx-glam-prod:glam_etl \
--   --destination_table=firefox_desktop_glam_release__clients_histogram_aggregates_new_v1 \
--   --parameter=submission_date:DATE:$SUBMISSION_DATE \
--   --reservation_id=moz-fx-bigquery-reserv-global:US.glam \
--   < firefox_desktop_glam_release__step1_delta.sql
SELECT * FROM (
WITH extracted_daily AS (
  SELECT
    * EXCEPT (app_version, histogram_aggregates),
    CAST(app_version AS INT64) AS app_version,
    unnested_histogram_aggregates AS histogram_aggregates
  FROM
    moz-fx-glam-prod.glam_etl.firefox_desktop_glam_release__view_clients_daily_histogram_aggregates_v1,
    UNNEST(histogram_aggregates) unnested_histogram_aggregates
  WHERE
    submission_date = @submission_date
    AND value IS NOT NULL
    AND ARRAY_LENGTH(value) > 0
),
filtered_daily AS (
  SELECT
    sample_id,
    client_id,
    ping_type,
    os,
    app_version,
    app_build_id,
    channel,
    histogram_aggregates.*
  FROM
    extracted_daily
  LEFT JOIN
    moz-fx-glam-prod.glam_etl.firefox_desktop_glam_release__latest_versions_v1
    USING (channel)
  WHERE
      -- allow for builds to be slighly ahead of the current submission date, to
      -- account for a reasonable amount of clock skew
    mozfun.glam.build_hour_to_datetime(app_build_id) < DATE_ADD(@submission_date, INTERVAL 3 DAY)
      -- only keep builds from the last year
    AND mozfun.glam.build_hour_to_datetime(app_build_id) > DATE_SUB(
      @submission_date,
      INTERVAL 365 DAY
    )
    AND app_version
    BETWEEN (latest_version - 3 + 1)
    AND latest_version
),
-- re-aggregate based on the latest version
aggregated_daily AS (
  SELECT
    sample_id,
    client_id,
    ping_type,
    os,
    app_version,
    app_build_id,
    channel,
    metric,
    metric_type,
    key,
    agg_type,
    mozfun.map.sum(ARRAY_CONCAT_AGG(mozfun.glam.histogram_filter_high_values(value))) AS value
  FROM
    filtered_daily
  GROUP BY
    sample_id,
    client_id,
    ping_type,
    os,
    app_version,
    app_build_id,
    channel,
    metric,
    metric_type,
    key,
    agg_type
)
SELECT
  sample_id,
  client_id,
  ping_type,
  os,
  app_version,
  app_build_id,
  channel,
  ARRAY_AGG(
    STRUCT<
      metric STRING,
      metric_type STRING,
      key STRING,
      agg_type STRING,
      aggregates ARRAY<STRUCT<key STRING, value INT64>>
    >(metric, metric_type, key, agg_type, value)
  ) AS histogram_aggregates
FROM
  aggregated_daily
GROUP BY
  sample_id,
  client_id,
  ping_type,
  os,
  app_version,
  app_build_id,
  channel
) WHERE ping_type = 'metrics'
