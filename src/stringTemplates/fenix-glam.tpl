-- GLAM Fenix aggregates data (note that this is an internal table)

SELECT ping_type,
    os,
    app_version,
    app_build_id,
    metric,
    metric_type,
    KEY,
    client_agg_type,
    agg_type,
    total_users,
    mozfun.glam.histogram_cast_json(aggregates) AS aggregates,
FROM `moz-fx-data-glam-prod.glam_etl.org_mozilla_fenix_glam_${ app_id }__view_probe_counts_v1`
WHERE metric="${ metric }"
AND os="${ os }"
AND ping_type="${ ping_type }"
AND ${ buildIdFilter }
