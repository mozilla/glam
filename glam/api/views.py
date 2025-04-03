from datetime import datetime, timezone, timedelta

import os
import dateutil.parser
import orjson
from django.conf import settings
from django.core.cache import caches
from django.db.models import Max, Q, Count
from django.views.decorators.cache import cache_page
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from google.cloud import bigquery
from glam.api.bigquery import build_glean_query, execute_glean_query


from glam.api import constants
from glam.api.models import (
    DesktopNightlyAggregationView,
    FenixAggregationView,
    FOGAggregationView,
    FirefoxBuildRevisions,
    LastUpdated,
    Probe,
    UsageInstrumentation,
)

# Data will be read from tables in this project
GLAM_BQ_PROD_PROJECT = "moz-fx-data-shared-prod"


def get_bq_client():
    return bigquery.Client("efilho-sandbox")


@api_view(["GET"])
def updates(request):
    product = request.GET.get("product")
    query = LastUpdated.objects.all()
    if product:
        query = query.filter(product=product)

    return Response(
        {
            "updates": {
                row.product: row.last_updated.strftime(
                    settings.REST_FRAMEWORK["DATETIME_FORMAT"]
                )
                for row in query
            }
        }
    )


def validate_request_legacy(**kwargs):
    # TODO: When glam starts sending "product", make it required.
    REQUIRED_QUERY_PARAMETERS = ["channel", "probe", "aggregationLevel"]
    if any([k not in kwargs.keys() for k in REQUIRED_QUERY_PARAMETERS]):
        # Figure out which query parameter is missing.
        missing = set(REQUIRED_QUERY_PARAMETERS) - set(kwargs.keys())
        raise ValidationError(
            "Missing required query parameters: {}".format(", ".join(sorted(missing)))
        )
    validated_data = {}
    validated_data["channel"] = kwargs.get("channel")
    validated_data["aggregation_level"] = kwargs.get("aggregationLevel")
    validated_data["metric"] = kwargs.get("probe")
    validated_data["os"] = kwargs.get("os", "*")
    validated_data["num_versions"] = kwargs.get("versions", 3)
    validated_data["process"] = kwargs.get("process")

    if validated_data["channel"] not in ["beta", "nightly", "release"]:
        raise ValidationError("Invalid channel: {}".format(validated_data["channel"]))

    if validated_data["aggregation_level"] not in ["version", "build_id"]:
        raise ValidationError(
            "Invalid aggregation level: {}".format(validated_data["aggregation_level"])
        )

    if validated_data["os"] not in ["Windows", "Darwin", "Mac", "Linux", "*"]:
        raise ValidationError("Invalid os: {}".format(validated_data["os"]))

    if not isinstance(validated_data["num_versions"], int):
        raise ValidationError(
            "Invalid versions: {}".format(validated_data["num_versions"])
        )

    return validated_data


def validate_request_glean(**kwargs):
    REQUIRED_QUERY_PARAMETERS = [
        "aggregationLevel",
        "app_id",
        "ping_type",
        "probe",
        "product",
    ]
    if any([k not in kwargs.keys() for k in REQUIRED_QUERY_PARAMETERS]):
        # Figure out which query parameter is missing.
        missing = set(REQUIRED_QUERY_PARAMETERS) - set(kwargs.keys())
        raise ValidationError(
            "Missing required query parameters: {}".format(", ".join(sorted(missing)))
        )

    validated_data = {}
    validated_data["channel"] = kwargs.get("app_id")
    validated_data["product"] = kwargs.get("product")
    validated_data["aggregation_level"] = kwargs.get("aggregationLevel")
    validated_data["probe"] = kwargs.get("probe")
    validated_data["os"] = kwargs.get("os", "*")
    validated_data["num_versions"] = kwargs.get("versions", 3)
    validated_data["ping_type"] = kwargs.get("ping_type")

    if validated_data["channel"] not in ["beta", "nightly", "release"]:
        raise ValidationError("Invalid channel: {}".format(validated_data["channel"]))

    if validated_data["product"] not in ["fog", "fenix"]:
        raise ValidationError("Invalid product: {}".format(validated_data["product"]))

    if validated_data["aggregation_level"] not in ["version", "build_id"]:
        raise ValidationError(
            "Invalid aggregation level: {}".format(validated_data["aggregation_level"])
        )

    if validated_data["os"] not in [
        "Windows",
        "Darwin",
        "Mac",
        "Linux",
        "*",
        "Android",
    ]:
        raise ValidationError("Invalid os: {}".format(validated_data["os"]))

    if not isinstance(validated_data["num_versions"], int):
        raise ValidationError(
            "Invalid versions: {}".format(validated_data["num_versions"])
        )

    return validated_data


def get_firefox_aggregations(request, **kwargs):
    req_data = validate_request_legacy(**kwargs)
    return get_firefox_aggregations_from_bq(request, req_data)


def get_firefox_aggregations_from_bq(request, req_data):
    bqClient = get_bq_client()
    channel = req_data["channel"]
    aggregation_level = req_data["aggregation_level"]
    # Whether to pull aggregations by version or build_id.
    if aggregation_level == "version":
        build_id_filter = 'AND build_id = "*"'
        # counts = _get_firefox_counts(channel, os, versions, by_build=False)
        shas = {}
    else:
        build_id_filter = 'AND build_id != "*"'
        # counts = _get_firefox_counts(channel, os, versions, by_build=True)
        shas = _get_firefox_shas(channel)

    labels_cache = caches["probe-labels"]
    if labels_cache.get("__labels__") is None:
        Probe.populate_labels_cache()

    query_parameters = [
        bigquery.ScalarQueryParameter("metric", "STRING", req_data["metric"]),
        bigquery.ScalarQueryParameter("os", "STRING", req_data["os"]),
        bigquery.ScalarQueryParameter(
            "num_versions", "INT64", req_data["num_versions"]
        ),
    ]

    process_filter = ""
    if "process" in req_data:
        query_parameters.append(
            bigquery.ScalarQueryParameter("process", "STRING", req_data["process"])
        )
        process_filter = "AND process = @process"

    table = f"glam_desktop_{channel}_aggregates"
    query = f"""
        WITH versions AS (
            SELECT
                ARRAY_AGG(DISTINCT version
                ORDER BY
                version DESC
                LIMIT
                @num_versions) AS selected_versions
            FROM
                `{GLAM_BQ_PROD_PROJECT}.glam_etl.{table}`
            WHERE
                metric = @metric
            )
            SELECT
            * EXCEPT(selected_versions)
            FROM
                `{GLAM_BQ_PROD_PROJECT}.glam_etl.{table}`,
                versions
            WHERE
                metric = @metric
                AND os = @os
                {process_filter}
                {build_id_filter}
                AND version IN UNNEST(versions.selected_versions)
    """

    job_config = bigquery.QueryJobConfig(query_parameters=query_parameters)
    with bqClient as client:
        query_job = client.query(query, job_config=job_config)

    response = []

    for row in query_job:

        data = {
            "version": row.version,
            "os": row.os,
            "build_id": row.build_id,
            "revision": shas.get(row.build_id, ""),
            "process": row.process,
            "metric": row.metric,
            "metric_key": row.metric_key,
            "metric_type": row.metric_type,
            "total_users": (
                int(row.total_users) if row.total_users else None
            ),  # Casting, otherwise this BIGNUMERIC column is read as a string
            "sample_count": (
                int(row.total_sample) if row.total_sample else None
            ),  # Casting, otherwise this BIGNUMERIC column is read as a string
            "histogram": row.histogram and orjson.loads(row.histogram) or "",
            "non_norm_histogram": row.non_norm_histogram
            and orjson.loads(row.non_norm_histogram)
            or "",
            "percentiles": row.percentiles and orjson.loads(row.percentiles) or "",
            "non_norm_percentiles": row.non_norm_percentiles
            and orjson.loads(row.non_norm_percentiles)
            or "",
        }
        if row.client_agg_type:
            if row.metric_type == "boolean":
                data["client_agg_type"] = "boolean-histogram"
            else:
                data["client_agg_type"] = row.client_agg_type

        # Get the total distinct client IDs for this set of dimensions.
        # data["total_addressable_market"] = counts.get(f"{row.version}-{row.build_id}")

        response.append(data)

    if response:
        _log_probe_query(request)

    return response


def _get_firefox_shas(channel, hourly=False):
    shas_full = dict(
        FirefoxBuildRevisions.objects.filter(channel=channel).values_list(
            "build_id", "revision"
        )
    )
    if not hourly:
        return shas_full
    else:
        return {build[:10]: revision for build, revision in shas_full.items()}


def get_glean_aggregations(request, **kwargs):
    req_data = validate_request_glean(**kwargs)
    return get_glean_aggregations_from_bq(request, req_data)


def get_glean_aggregations_from_bq(request, req_data):
    bqClient = get_bq_client()
    channel = req_data["channel"]
    product = req_data["product"]
    probe = req_data["probe"]
    num_versions = req_data["num_versions"]
    ping_type = req_data["ping_type"]
    os = req_data["os"]
    aggregation_level = req_data["aggregation_level"]

    table_id = f"glam_{product}_{channel}_aggregates"
    shas = {}
    if aggregation_level == "version":
        build_id_filter = 'AND build_id = "*"'
    else:
        if product == "fog":
            shas = _get_firefox_shas(channel, hourly=True)
        build_id_filter = 'AND build_id != "*"'
    # Build the SQL query with parameters
    query = f"""
        WITH versions AS (
            SELECT
                ARRAY_AGG(DISTINCT version
                ORDER BY
                version DESC
                LIMIT
                @num_versions) AS selected_versions
            FROM
                `{GLAM_BQ_PROD_PROJECT}.glam_etl.{table_id}`
            WHERE
                metric = @metric
            )
            SELECT
            * EXCEPT(selected_versions)
            FROM
                `{GLAM_BQ_PROD_PROJECT}.glam_etl.{table_id}`,
                versions
            WHERE
                metric = @metric
                AND ping_type = @ping_type
                AND os = @os
                {build_id_filter}
                AND version IN UNNEST(versions.selected_versions)
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("metric", "STRING", probe),
            bigquery.ScalarQueryParameter("ping_type", "STRING", ping_type),
            bigquery.ScalarQueryParameter("os", "STRING", os),
            bigquery.ScalarQueryParameter("num_versions", "INT64", num_versions),
        ]
    )
    with bqClient as client:
        query_job = client.query(query, job_config=job_config)

    response = []

    for row in query_job:
        if aggregation_level != "version" and not row.build_date:
            continue
        else:
            # Remove extra +00
            build_date = (
                None
                if aggregation_level == "version"
                else datetime.fromisoformat(row.build_date[:-3]).replace(
                    tzinfo=timezone.utc
                )
            )
        data = {
            "version": row.version,
            "ping_type": row.ping_type,
            "os": row.os,
            "build_id": row.build_id,
            "revision": shas.get(row.build_id, ""),
            "build_date": build_date,
            "metric": row.metric,
            "metric_type": row.metric_type,
            "metric_key": row.metric_key,
            "client_agg_type": row.client_agg_type,
            "total_users": int(
                row.total_users
            ),  # Casting, otherwise this BIGNUMERIC column is read as a string
            "sample_count": (
                # Casting, otherwise this BIGNUMERIC column is read as a string.
                # Fallback to zero as temp workaround for missing total_sample
                # on labeled_distributions.
                int(row.total_sample)
                if row.total_sample
                else 0
            ),
            "histogram": row.histogram and orjson.loads(row.histogram) or "",
            "non_norm_histogram": row.non_norm_histogram
            and orjson.loads(row.non_norm_histogram)
            or "",
            "percentiles": row.percentiles and orjson.loads(row.percentiles) or "",
            "non_norm_percentiles": row.non_norm_percentiles
            and orjson.loads(row.non_norm_percentiles)
            or "",
        }

        # Get the total distinct client IDs for this set of dimensions.
        # data["total_addressable_market"] = counts.get(f"{row.version}-{row.build_id}")

        response.append(data)
    if response:
        _log_probe_query(request)
    return response


@api_view(["POST"])
def aggregations(request):
    """
    Fetches aggregation data.

    Expects a JSON object in the body containing the query parameters, e.g.::

        {
            "query": {
                "channel": "nightly",
                "probe": "gc_ms",
                "process": "content"
                "versions": 5,  # Defaults to 3 versions.
                "aggregationLevel": "version"  # OR "build_id"
            }
        }

    Returns a JSON object containing the histogram data and metadata, e.g.::

        {
            "response": [
                {
                    "build_id": "*",
                    "client_agg_type": "summed_histogram",
                    "histogram": {
                        "0": 28599.9932,
                        "1": 69122.1505,
                        "2": 31748.8171,
                        ...
                    },
                    "metric": "gc_ms",
                    "metric_key": "",
                    "metric_type": "histogram-exponential",
                    "os": "*",
                    "percentiles": {
                        "5": 1,
                        "25": 12,
                        "50": 40,
                        "75": 96,
                        "95": 268
                    },
                    "process": "content",
                    "total_addressable_market": 118531,
                    "total_users": 1262515,
                    "version": "75"
                },
                ...
            ]
        }

    """
    body = request.data

    if body is None or body.get("query") is None:
        raise ValidationError("Unexpected JSON body")

    # Firefox Desktop is pulling from older telemetry data and will go away in
    # the future. The code path is separated here in anticipation of this and
    # separating out Glean data as the future.

    # Ensure that the product provided is one we support, defaulting to Firefox.
    FIREFOX_LEGACY = constants.PRODUCT_NAMES[constants.PRODUCT_FIREFOX_LEGACY]
    product = body["query"].get("product", FIREFOX_LEGACY)
    if product not in constants.PRODUCT_IDS.keys():
        raise ValidationError(
            "Unsupported product specified. We currently support only: {}".format(
                ", ".join(constants.PRODUCT_IDS.keys())
            )
        )

    # Uncomment the next line to rollback to PostgreSQL
    # data_source = "Postgres"
    if product == FIREFOX_LEGACY:
        response = get_firefox_aggregations(request, **body["query"])
    else:  # Assume everything else is Glean-based.
        response = get_glean_aggregations(request, **body["query"])

    if not response:
        raise NotFound("No documents found for the given parameters")

    return Response({"response": response})


@api_view(["GET"])
def probes(request):
    return Response(
        {"probes": {probe.key: probe.info for probe in Probe.objects.all()}}
    )


def _get_random_probes(data_source, random_percentage, limit):
    # Get a random list of `limit` probes from the Desktop nightly table.
    query_template = """
        SELECT {} metric, histogram
        FROM {}
        WHERE
            build_id='*'
            AND os='*'
            AND metric_key=''
            AND metric_type NOT IN ('boolean', 'histogram-boolean', 'scalar')
            AND {} < {}
        LIMIT {}
    """

    if data_source == "BigQuery":
        table_name = (
            f"`{GLAM_BQ_PROD_PROJECT}.glam_etl.glam_desktop_nightly_aggregates`"
        )
        with get_bq_client() as client:
            aggs = client.query(
                query_template.format(
                    "", table_name, "RAND()", random_percentage, limit
                )
            )
    else:
        table_name = "view_glam_desktop_nightly_aggregation"
        aggs = DesktopNightlyAggregationView.objects.raw(
            query_template.format(
                "id,", table_name, "RANDOM()", random_percentage, limit
            )
        )
    return aggs


def _get_fx_most_used_probes(days=30, limit=9):
    """Retrieve most used probes from BQ

    :param int days: The amount of days to consider for recency
    :param int limit: The max amount of probes to retrieve
    """

    dimensions = []
    today = datetime.now()
    min_date = today - timedelta(days=days)
    dimensions.append(Q(timestamp__gte=min_date))
    dimensions.append(Q(timestamp__lte=today))

    result = UsageInstrumentation.objects.filter(*dimensions)
    most_used_probes = (
        result.values("probe_name")
        .annotate(total=Count("*"))
        .order_by(
            "-total",
        )
    )
    probe_names = [f'{p["probe_name"]}' for p in most_used_probes]

    legacy_table_name = (
        f"`{GLAM_BQ_PROD_PROJECT}.glam_etl.glam_desktop_nightly_aggregates`"
    )

    query = f"""
        WITH fx_metrics AS (
            SELECT
                metric,
                metric_key,
                metric_type,
                version,
                os,
                build_id,
                histogram
            FROM
                {legacy_table_name}),
        selected_version AS (
            SELECT
                ARRAY_AGG(DISTINCT version
                    ORDER BY version DESC
                    LIMIT 2)[SAFE_OFFSET(1)] # Second most recent version has more data
                AS v
            FROM
                fx_metrics
            WHERE
                version < 1000) # Avoids the 1024 version
        SELECT
            distinct metric,
            ARRAY_AGG(histogram)[SAFE_OFFSET(0)] AS histogram
        FROM
            fx_metrics,
            selected_version
        WHERE
            build_id='*'
            AND os='*'
            AND metric_key=''
            AND metric_type NOT IN ('boolean',
                'histogram-boolean',
                'scalar')
            AND metric IN UNNEST(@probe_names)
            AND version = selected_version.v
        GROUP BY metric
        LIMIT {limit}"""

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ArrayQueryParameter("probe_names", "STRING", probe_names),
        ]
    )

    with get_bq_client() as client:
        aggs = client.query(query, job_config=job_config)
    return aggs


@api_view(["GET"])
@cache_page(60 * 60 * 24, cache="pg")
def random_probes(request):

    n = request.GET.get("n", 3)
    try:
        n = int(n)
    except ValueError:
        n = 3
    if os.environ.get("DJANGO_CONFIGURATION") == "Test":
        random_percentage = 1.0
        data_source = "Postgres"
        aggs = _get_random_probes(data_source, random_percentage, n)
    else:
        aggs = _get_fx_most_used_probes(limit=n)

    probes = []
    for agg in aggs:
        try:
            probe = Probe.objects.get(info__name=agg.metric)
        except Probe.DoesNotExist:
            continue

        probes.append({"data": agg.histogram, "info": probe.info})

    return Response({"probes": probes})


def _log_probe_query(request):
    query = request.data["query"]
    UsageInstrumentation(
        action_type=UsageInstrumentation.ACTION_PROBE_SEARCH,
        context=query,
        tracking_id="",  # FIXME use something that allows for accurate analysis
        probe_name=query["probe"],
    ).save()


@api_view(["GET"])
def usage(request):
    """
    Provides individual or aggregated (count) metrics on probe searching.

    Possible query parameters are:
    * fromDate: Date to start the search with.  Format: YYYYMMDD
    * toDate: Date to end the search with.  Format: YYYYMMDD
    * fields: Name of fields to return. See models.UsageInstrumentation for the full
            list. This parameter is needed for aggregation.
    * actionType: The type of action that triggered the metric.
            The only possible value now is: PROBE_SEARCH
    * agg: The "Aggregate" flag. The only possible value now is: count. Note that if
           "fields" is not supplied, this parameter is ignored.
    """
    if request.method == "GET":
        dimensions = []

        if q_action_type := request.GET.get("actionType"):
            dimensions.append(Q(action_type=q_action_type))
        if q_from := request.GET.get("fromDate"):
            min_date = dateutil.parser.parse(q_from)
            dimensions.append(Q(timestamp__gte=min_date))
        if q_to := request.GET.get("toDate"):
            max_date = dateutil.parser.parse(q_to)
            dimensions.append(Q(timestamp__lte=max_date))

        result = UsageInstrumentation.objects.filter(*dimensions)

        if q_fields := request.GET.get("fields"):
            fields = q_fields.split(",")
            response = result.values(*fields)
            if request.GET.get("agg") == "count":
                response = response.annotate(total=Count("*")).order_by("-total")
        else:
            response = result.values("action_type", "timestamp", "probe_name")
        return Response(response, 200)


def validate_glean_request(request):
    """Validate request parameters for Glean-based products."""
    required_params = {
        'aggregationLevel': str,
        'app_id': str,
        'ping_type': str,
        'metric': str,
        'metric_type': str,
        'os': str,
        'timeHorizon': str,
    }

    for param, param_type in required_params.items():
        if param not in request:
            raise ValueError(f"Missing required parameter: {param}")
        if not isinstance(request[param], param_type):
            raise ValueError(f"Invalid type for {param}: expected {param_type}")

    # Validate product-specific parameters
    product = request.get('product')
    if product not in ['fog', 'fenix']:
        raise ValueError(f"Invalid product: {product}")

    # Validate app_id based on product
    valid_app_ids = {
        'fog': ['nightly', 'beta', 'release'],
        'fenix': ['nightly', 'beta', 'release']
    }
    if request['app_id'] not in valid_app_ids[product]:
        raise ValueError(f"Invalid app_id for {product}: {request['app_id']}")

    # Validate ping_type based on product
    valid_ping_types = {
        'fog': ['baseline', 'metrics'],
        'fenix': ['baseline', 'metrics', 'events']
    }
    if request['ping_type'] not in valid_ping_types[product]:
        raise ValueError(f"Invalid ping_type for {product}: {request['ping_type']}")

    return True

def get_glean_data(request):
    """Get data for Glean-based products."""
    validate_glean_request(request)

    product = request['product']
    metric = request['metric']
    metric_type = request['metric_type']
    app_id = request['app_id']
    ping_type = request['ping_type']
    os = request['os']
    time_horizon = request['timeHorizon']

    # Get product-specific configuration
    product_config = get_product_config(product)

    # Build query based on product configuration
    query = build_glean_query(
        product_config,
        metric,
        metric_type,
        app_id,
        ping_type,
        os,
        time_horizon
    )

    # Execute query and return results
    return execute_glean_query(query)
