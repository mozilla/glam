-- For a detailed explanation of this query, read the cookbook link:
-- https://docs.telemetry.mozilla.org/cookbooks/main_ping_exponential_histograms.html
--
-- For more info on the tables referenced in this SQL see:
-- https://docs.telemetry.mozilla.org/datasets/main_ping_tables.html

WITH per_build_client_day AS (
  SELECT
    PARSE_DATETIME("%Y%m%d%H%M%S", application.build_id) AS build_id,
    client_id,
    mozfun.hist.normalize(
      mozfun.hist.merge(
        ARRAY_AGG(
          mozfun.hist.extract(
            ${ telemetryPath }
          ) IGNORE NULLS
        )
      )
  ) AS ${ metric }
  FROM
    telemetry.${ table }
  WHERE
    normalized_channel = '${ channel }'
    ${ osFilter }
    AND application.build_id > FORMAT_DATE("%Y%m%d", DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY))
    AND application.build_id <= FORMAT_DATE("%Y%m%d", CURRENT_DATE)
    AND DATE(submission_timestamp) >= DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY)
    AND DATE(submission_timestamp) <= CURRENT_DATE
  GROUP BY
    build_id,
    client_id
),
merged_histograms AS (
  SELECT
    build_id,
    KEY,
    SUM(value) AS value,
  FROM
    per_build_client_day,
    UNNEST(per_build_client_day.${ metric }.VALUES)
  GROUP BY
    KEY,
    build_id
),
as_struct AS (
  SELECT
    build_id,
    STRUCT(ARRAY_AGG(STRUCT(KEY, value)) AS VALUES) AS merged_${ metric }
  FROM
    merged_histograms
  GROUP BY
    build_id
),
percentiles AS (
  SELECT
    build_id,
    udf.histogram_percentiles(
      merged_${ metric },
      [.05, .25, .5, .75, .95]
    ) AS percentile_nested
  FROM
    as_struct
)
SELECT
  build_id,
  percentile,
  value
FROM
  percentiles
CROSS JOIN
  UNNEST(percentiles.percentile_nested);
