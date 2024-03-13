-- GLAM public aggregates data for Firefox Desktop Nightly and Beta

SELECT os,
    app_version,
    app_build_id,
    channel,
    metric,
    metric_type,
    KEY,
    process,
    client_agg_type,
    agg_type,
    total_users,
    mozfun.glam.histogram_cast_json(aggregates) AS aggregates
FROM `mozilla-public-data.glam_derived.client_probe_counts_firefox_desktop_nightly_v1` 
--   for `beta` channel data: mozilla-public-data.glam_derived.client_probe_counts_firefox_desktop_beta_v1
WHERE metric="${ metric }"
AND channel="${ channel }"
AND ${ osFilter }
AND ${ buildIdFilter } ${ processFilter }