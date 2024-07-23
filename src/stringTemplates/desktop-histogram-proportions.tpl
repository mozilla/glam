-- For more info on the tables referenced in this SQL see:
-- https://docs.telemetry.mozilla.org/datasets/main_ping_tables.html
--
-- For charting in STMO, one can use:
-- chart type == line, x column == build_id, y columns == proportion, group by == KEY

WITH per_build_client_day AS (
  SELECT
    PARSE_DATETIME("%Y%m%d%H%M%S", application.build_id) AS build_id,
    client_id,
    <% if(normalized) { %>mozfun.hist.normalize(
      mozfun.hist.merge(
        ARRAY_AGG(
          mozfun.hist.extract(
            ${ telemetryPath }
          ) IGNORE NULLS
        )
      )
    )<% } else { %>mozfun.hist.merge(
      ARRAY_AGG(
        mozfun.hist.extract(
          ${ telemetryPath }
        ) IGNORE NULLS
      )
    )<% } %> AS ${ metric }
  FROM
    moz-fx-data-shared-prod.telemetry.${ table }
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
client_count_filter AS (
  SELECT
    build_id,
    COUNT(DISTINCT(client_id)) AS client_count,
  FROM
    per_build_client_day
  GROUP BY
    build_id
  HAVING
    client_count > 100
),
merged_histograms AS (
  SELECT
    build_id,
    KEY,
    SUM(value) AS value
  FROM
    per_build_client_day
  CROSS JOIN
    UNNEST(per_build_client_day.${ metric }.VALUES)
  GROUP BY
    KEY,
    build_id
),
filtered AS (
  SELECT
    *
  FROM
    merged_histograms
  RIGHT JOIN
    client_count_filter
  USING
    (build_id)
),
proportions AS (
  SELECT
    build_id,
    KEY,
    value,
    SAFE_DIVIDE(value, SUM(value) OVER(PARTITION BY build_id)) AS proportion,
    client_count
  FROM
    filtered
)

SELECT
  build_id,
  KEY,
  value,
  proportion
FROM
  proportions
ORDER BY
  build_id desc,
  KEY ASC;
