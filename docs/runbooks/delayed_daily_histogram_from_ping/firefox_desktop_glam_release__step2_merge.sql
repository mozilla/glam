-- STEP 2, release: merge the metrics delta in _new_v1 into _v1.
--
-- Reads the accumulated side from _snapshot_v1, not _v1, because _v1 is written in 5
-- sample_id chunks and the first chunk empties it. Refresh the snapshot clone first,
-- see README step 4-R.a.
--
-- Run once per sample_id range. First chunk --replace, the rest --append_table --noreplace.
--
-- The accumulated-side build window uses CURRENT_DATE(), not @submission_date, so current
-- builds are not dropped.
--
-- bq query --use_legacy_sql=false --replace \
--   --project_id=moz-fx-glam-prod --dataset_id=moz-fx-glam-prod:glam_etl \
--   --destination_table=firefox_desktop_glam_release__clients_histogram_aggregates_v1 \
--   --parameter=min_sample_id:INT64:0 --parameter=max_sample_id:INT64:2 \
--   --reservation_id=moz-fx-bigquery-reserv-global:US.glam \
--   < firefox_desktop_glam_release__step2_merge.sql
CREATE TEMP FUNCTION udf_merged_user_data(aggs ANY TYPE)
RETURNS ARRAY<
  STRUCT<
    metric STRING,
    metric_type STRING,
    key STRING,
    agg_type STRING,
    value ARRAY<STRUCT<key STRING, value INT64>>
  >
> AS (
  (
    WITH unnested AS (
      SELECT
        *
      FROM
        UNNEST(aggs)
    ),
    aggregated_data AS (
      SELECT AS STRUCT
        metric,
        metric_type,
        key,
        agg_type,
        mozfun.map.sum(ARRAY_CONCAT_AGG(value)) AS value
      FROM
        unnested
      GROUP BY
        metric,
        metric_type,
        key,
        agg_type
    )
    SELECT
      ARRAY_AGG((metric, metric_type, key, agg_type, value))
    FROM
      aggregated_data
  )
);

WITH extracted_accumulated AS (
  SELECT
    *
  FROM
    `moz-fx-glam-prod.glam_etl.firefox_desktop_glam_release__clients_histogram_aggregates_snapshot_v1`
  WHERE
    sample_id >= @min_sample_id
    AND sample_id <= @max_sample_id
),
filtered_accumulated AS (
  SELECT
    sample_id,
    client_id,
    ping_type,
    os,
    app_version,
    app_build_id,
    channel,
    histogram_aggregates
  FROM
    extracted_accumulated
  LEFT JOIN
    `moz-fx-glam-prod.glam_etl.firefox_desktop_glam_release__latest_versions_v1`
    USING (channel)
  WHERE
      -- allow for builds to be slighly ahead of the current submission date, to
      -- account for a reasonable amount of clock skew
    mozfun.glam.build_hour_to_datetime(app_build_id) < DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY)
      -- only keep builds from the last year
    AND mozfun.glam.build_hour_to_datetime(app_build_id) > DATE_SUB(
      CURRENT_DATE(),
      INTERVAL 365 DAY
    )
    AND app_version
    BETWEEN (latest_version - 3 + 1)
    AND latest_version
),
transformed_daily AS (
  SELECT
    *
  FROM
    `moz-fx-glam-prod.glam_etl.firefox_desktop_glam_release__clients_histogram_aggregates_new_v1`
  WHERE
    sample_id >= @min_sample_id
    AND sample_id <= @max_sample_id
)
SELECT
  COALESCE(accumulated.sample_id, daily.sample_id) AS sample_id,
  COALESCE(accumulated.client_id, daily.client_id) AS client_id,
  COALESCE(accumulated.ping_type, daily.ping_type) AS ping_type,
  COALESCE(accumulated.os, daily.os) AS os,
  COALESCE(accumulated.app_version, daily.app_version) AS app_version,
  COALESCE(accumulated.app_build_id, daily.app_build_id) AS app_build_id,
  COALESCE(accumulated.channel, daily.channel) AS channel,
  udf_merged_user_data(
    ARRAY_CONCAT(
      COALESCE(accumulated.histogram_aggregates, []),
      COALESCE(daily.histogram_aggregates, [])
    )
  ) AS histogram_aggregates
FROM
  filtered_accumulated AS accumulated
FULL OUTER JOIN
  transformed_daily AS daily
  USING (sample_id, client_id, ping_type, os, app_version, app_build_id, channel)
