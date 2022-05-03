SELECT
  os,
  app_version,
  app_build_id,
  channel,
  metric,
  metric_type,
  key,
  process,
  client_agg_type,
  agg_type,
  total_users,
  mozfun.glam.histogram_cast_json(aggregates) AS aggregates
FROM
  `moz-fx-data-shared-prod.telemetry.client_probe_counts`
WHERE
  metric="${ metric }"
  AND channel="${ channel }"
  AND ${ osFilter }
  AND ${ buildIdFilter }
  ${ processFilter }
