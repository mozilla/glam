import os

import orjson
from django.conf import settings
from django.core.cache import caches
from django.db.models import Max, Q, Value
from django.db.models.functions import Concat
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response

from glam.api import constants
from glam.api.models import (
    DesktopBetaAggregationView,
    DesktopNightlyAggregationView,
    DesktopReleaseAggregationView,
    FenixAggregationView,
    FOGAggregationView,
    FenixCounts,
    FOGCounts,
    FirefoxBuildRevisions,
    FirefoxCounts,
    LastUpdated,
    Probe,
)


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


def get_firefox_aggregations(request, **kwargs):
    # TODO: When glam starts sending "product", make it required.
    REQUIRED_QUERY_PARAMETERS = ["channel", "probe", "aggregationLevel"]
    if any([k not in kwargs.keys() for k in REQUIRED_QUERY_PARAMETERS]):
        # Figure out which query parameter is missing.
        missing = set(REQUIRED_QUERY_PARAMETERS) - set(kwargs.keys())
        raise ValidationError(
            "Missing required query parameters: {}".format(", ".join(sorted(missing)))
        )

    # Ensure that the product provided is one we support, defaulting to Firefox.
    product = "firefox"
    channel = kwargs.get("channel")
    model_key = f"{product}-{channel}"

    MODEL_MAP = {
        "firefox-nightly": DesktopNightlyAggregationView,
        "firefox-beta": DesktopBetaAggregationView,
        "firefox-release": DesktopReleaseAggregationView,
    }

    try:
        model = MODEL_MAP[model_key]
    except KeyError:
        raise ValidationError("Product not currently supported.")

    num_versions = kwargs.get("versions", 3)
    try:
        max_version = int(model.objects.aggregate(Max("version"))["version__max"])
    except (ValueError, KeyError):
        raise ValidationError("Query version cannot be determined")
    except TypeError:
        # This happens when `version_max` is NULL and cannot be converted to an int,
        # suggesting that we have no data for this model.
        raise NotFound("No data found for the provided parameters")

    versions = list(map(str, range(max_version, max_version - num_versions, -1)))

    labels_cache = caches["probe-labels"]
    if labels_cache.get("__labels__") is None:
        Probe.populate_labels_cache()

    os = kwargs.get("os", "*")

    dimensions = [
        Q(metric=kwargs["probe"]),
        Q(version__in=versions),
        Q(os=os),
    ]

    aggregation_level = kwargs["aggregationLevel"]
    # Whether to pull aggregations by version or build_id.
    if aggregation_level == "version":
        dimensions.append(Q(build_id="*"))
        #counts = _get_firefox_counts(channel, os, versions, by_build=False)
        shas = {}
    elif aggregation_level == "build_id":
        dimensions.append(~Q(build_id="*"))
        #counts = _get_firefox_counts(channel, os, versions, by_build=True)
        shas = _get_firefox_shas(channel)

    if "process" in kwargs:
        dimensions.append(Q(process=kwargs["process"]))
    result = model.objects.filter(*dimensions)

    response = []

    for row in result:

        data = {
            "version": row.version,
            "os": row.os,
            "build_id": row.build_id,
            "revision": shas.get(row.build_id, ""),
            "process": row.process,
            "metric": row.metric,
            "metric_key": row.metric_key,
            "metric_type": row.metric_type,
            "total_users": row.total_users,
            "sample_count": row.total_sample,
            "histogram": row.histogram and orjson.loads(row.histogram) or "",
            "percentiles": row.percentiles and orjson.loads(row.percentiles) or "",
        }
        if row.client_agg_type:
            if row.metric_type == "boolean":
                data["client_agg_type"] = "boolean-histogram"
            else:
                data["client_agg_type"] = row.client_agg_type

        # Get the total distinct client IDs for this set of dimensions.
        #data["total_addressable_market"] = counts.get(f"{row.version}-{row.build_id}")

        response.append(data)

    return response


def _get_firefox_counts(channel, os, versions, by_build):
    """
    Helper method to gather the `FirefoxCounts` data in a single query.

    Returns the data as a Python dict keyed by "{version}-{build_id}" for
    quick lookup.

    """
    query = FirefoxCounts.objects.filter(
        channel=constants.CHANNEL_IDS[channel], os=os, version__in=versions
    )
    if by_build:
        query = query.exclude(build_id="*")
    else:
        query = query.filter(build_id="*")
    query = query.annotate(key=Concat("version", Value("-"), "build_id"))
    data = {
        row["key"]: row["total_users"] for row in query.values("key", "total_users")
    }

    return data


def _get_firefox_shas(channel):
    return dict(
        FirefoxBuildRevisions.objects.filter(channel=channel).values_list(
            "build_id", "revision"
        )
    )


def get_glean_aggregations(request, **kwargs):
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

    MODEL_MAP = {
        "fenix": FenixAggregationView,
        "fog": FOGAggregationView,
    }
    model = MODEL_MAP[kwargs.get("product")]
    product = kwargs.get("product")

    num_versions = kwargs.get("versions", 3)
    try:
        max_version = int(model.objects.aggregate(Max("version"))["version__max"])
    except (ValueError, KeyError):
        raise ValidationError("Query version cannot be determined")
    except TypeError:
        # This happens when `version_max` is NULL and cannot be converted to an int,
        # suggesting that we have no data for this model.
        raise NotFound("No data found for the provided parameters")

    versions = list(map(str, range(max_version, max_version - num_versions, -1)))

    app_id = kwargs["app_id"]
    probe = kwargs["probe"]
    ping_type = kwargs["ping_type"]
    os = kwargs.get("os", "*")

    dimensions = [
        Q(app_id=app_id),
        Q(metric=probe),
        Q(ping_type=ping_type),
        Q(version__in=versions),
        Q(os=os),
    ]

    aggregation_level = kwargs["aggregationLevel"]
    # Whether to pull aggregations by version or build_id.
    if aggregation_level == "version":
        if product == 'fenix':
            dimensions.append(Q(build_id="*"))
            # counts = _get_fenix_counts(app_id, versions, ping_type, os, by_build=False)
        if product == 'fog':
            dimensions.append(~Q(build_id="*"))
            # counts = _get_fog_counts(app_id, versions, ping_type, os, by_build=False)

    if aggregation_level == "build_id":
        if product == 'fenix':
            dimensions.append(~Q(build_id="*"))
            #counts = _get_fenix_counts(app_id, versions, ping_type, os, by_build=True)
        if product == 'fog':
            dimensions.append(~Q(build_id="*"))
            #counts = _get_fog_counts(app_id, versions, ping_type, os, by_build=True)

    result = model.objects.filter(*dimensions)

    response = []

    for row in result:

        data = {
            "version": row.version,
            "ping_type": row.ping_type,
            "os": row.os,
            "build_id": row.build_id,
            "build_date": row.build_date,
            "metric": row.metric,
            "metric_type": row.metric_type,
            "metric_key": row.metric_key,
            "client_agg_type": row.client_agg_type,
            "total_users": row.total_users,
            "histogram": row.histogram and orjson.loads(row.histogram) or "",
            "percentiles": row.percentiles and orjson.loads(row.percentiles) or "",
        }

        # Get the total distinct client IDs for this set of dimensions.
        #data["total_addressable_market"] = counts.get(f"{row.version}-{row.build_id}")

        response.append(data)

    return response


def _get_fenix_counts(app_id, versions, ping_type, os, by_build):
    """
    Helper method to gather the `FenixCounts` data in a single query.

    Returns the data as a Python dict keyed by "{version}-{build_id}" for
    quick lookup.

    """
    query = FenixCounts.objects.filter(
        app_id=app_id, version__in=versions, ping_type=ping_type, os=os
    )
    if by_build:
        query = query.exclude(build_id="*")
    else:
        query = query.filter(build_id="*")
    query = query.annotate(key=Concat("version", Value("-"), "build_id"))
    data = {
        row["key"]: row["total_users"] for row in query.values("key", "total_users")
    }

    return data

def _get_fog_counts(app_id, versions, ping_type, os, by_build):
    """
    Helper method to gather the `FOGCounts` data in a single query.

    Returns the data as a Python dict keyed by "{version}-{build_id}" for
    quick lookup.

    """
    query = FOGCounts.objects.filter(
        app_id=app_id, version__in=versions, ping_type=ping_type, os=os
    )
    if by_build:
        query = query.exclude(build_id="*")
    else:
        query = query.filter(build_id="*")
    query = query.annotate(key=Concat("version", Value("-"), "build_id"))
    data = {
        row["key"]: row["total_users"] for row in query.values("key", "total_users")
    }

    return data


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


@api_view(["POST"])
def random_probes(request):
    n = request.data.get("n", 3)
    try:
        n = int(n)
    except ValueError:
        n = 3

    probes = []

    random_percentage = 0.1
    if os.environ.get("DJANGO_CONFIGURATION") == "Test":
        random_percentage = 1.0

    # Get a random list of `n` probes from the Desktop nightly table.
    aggs = DesktopNightlyAggregationView.objects.raw(
        """
        SELECT id, metric, histogram
        FROM view_glam_desktop_nightly_aggregation
        WHERE
            build_id='*'
            AND os='*'
            AND metric_key=''
            AND metric_type NOT IN ('boolean', 'histogram-boolean', 'scalar')
            AND RANDOM() < %s
        LIMIT %s
    """,
        [random_percentage, n],
    )

    for agg in aggs:
        try:
            probe = Probe.objects.get(info__name=agg.metric)
        except Probe.DoesNotExist:
            continue

        probes.append({"data": agg.histogram, "info": probe.info})

    return Response({"probes": probes})
