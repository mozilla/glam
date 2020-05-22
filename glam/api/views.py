from random import shuffle

import orjson
from django.core.cache import caches
from django.db.models import Max, Q, Value
from django.db.models.functions import Concat
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response

from glam.api import constants
from glam.api.models import (
    DesktopBetaAggregationView,
    DesktopNightlyAggregationView,
    DesktopReleaseAggregationView,
    FenixAggregation,
    FirefoxCounts,
    Probe,
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

    # If release channel, make sure the user is authenticated.
    if channel == constants.CHANNEL_NAMES[constants.CHANNEL_RELEASE]:
        if not request.user.is_authenticated:
            raise PermissionDenied()

    MODEL_MAP = {
        "firefox-nightly": DesktopNightlyAggregationView,
        "firefox-beta": DesktopBetaAggregationView,
        "firefox-release": DesktopReleaseAggregationView,
    }

    try:
        model = MODEL_MAP[model_key]
    except KeyError:
        raise ValidationError("Product not currently supported.")

    # Check if a version was provided and if not, get the MAX version from our
    # data to select the last 3 versions by default.
    if "versions" not in kwargs or not kwargs["versions"]:
        try:
            max_version = int(model.objects.aggregate(Max("version"))["version__max"])
        except (ValueError, KeyError):
            raise ValidationError("Query version cannot be determined")
        kwargs["versions"] = list(range(max_version, max_version - 3, -1))

    labels_cache = caches["probe-labels"]
    if labels_cache.get("__labels__") is None:
        Probe.populate_labels_cache()

    probe = kwargs["probe"]
    versions = list(map(str, kwargs["versions"]))
    os = kwargs.get("os", "*")

    dimensions = [
        Q(metric=probe),
        Q(version__in=versions),
        Q(os=os),
    ]

    aggregation_level = kwargs["aggregationLevel"]
    # Whether to pull aggregations by version or build_id.
    if aggregation_level == "version":
        dimensions.append(Q(build_id="*"))
        counts = _get_firefox_counts(channel, os, versions, by_build=False)
    elif aggregation_level == "build_id":
        dimensions.append(~Q(build_id="*"))
        counts = _get_firefox_counts(channel, os, versions, by_build=True)

    if "process" in kwargs:
        dimensions.append(Q(process=kwargs["process"]))
    result = model.objects.filter(*dimensions)

    response = []

    for row in result:

        data = {
            "version": row.version,
            "os": row.os,
            "build_id": row.build_id,
            "process": row.process,
            "metric": row.metric,
            "metric_key": row.metric_key,
            "metric_type": row.metric_type,
            "total_users": row.total_users,
            "histogram": row.histogram and orjson.loads(row.histogram) or "",
            "percentiles": row.percentiles and orjson.loads(row.percentiles) or "",
        }
        if row.client_agg_type:
            if row.metric_type == "boolean":
                data["client_agg_type"] = "boolean-histogram"
            else:
                data["client_agg_type"] = row.client_agg_type

        # Get the total distinct client IDs for this set of dimensions.
        data["total_addressable_market"] = counts.get(f"{row.version}-{row.build_id}")

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


def get_glean_aggregations(request, **kwargs):
    REQUIRED_QUERY_PARAMETERS = ["product", "probe", "aggregationLevel"]
    if any([k not in kwargs.keys() for k in REQUIRED_QUERY_PARAMETERS]):
        # Figure out which query parameter is missing.
        missing = set(REQUIRED_QUERY_PARAMETERS) - set(kwargs.keys())
        raise ValidationError(
            "Missing required query parameters: {}".format(", ".join(sorted(missing)))
        )

    MODEL_MAP = {
        "fenix": FenixAggregation,
    }

    try:
        model = MODEL_MAP[kwargs.get("product")]
    except KeyError:
        raise ValidationError("Product not currently supported.")

    # Check if a version was provided and if not, get the MAX version from our
    # data to select the last 3 versions by default.
    if "versions" not in kwargs or not kwargs["versions"]:
        try:
            max_version = int(model.objects.aggregate(Max("version"))["version__max"])
        except (ValueError, KeyError):
            raise ValidationError("Query version cannot be determined")
        kwargs["versions"] = list(range(max_version, max_version - 3, -1))

    dimensions = [
        Q(metric=kwargs["probe"]),
        Q(version__in=list(map(str, kwargs["versions"]))),
        Q(os=kwargs.get("os") or "*"),
    ]

    aggregation_level = kwargs["aggregationLevel"]
    # Whether to pull aggregations by version or build_id.
    if aggregation_level == "version":
        dimensions.append(Q(build_id="*"))
    elif aggregation_level == "build_id":
        dimensions.append(~Q(build_id="*"))

    result = model.objects.filter(*dimensions)

    response = {}

    for row in result:

        metadata = {
            "channel": row.channel,
            "version": row.version,
            "os": row.os,
            "build_id": row.build_id,
            "metric": row.metric,
            "metric_type": row.metric_type,
            "ping_type": row.ping_type,
        }
        aggs = {d["key"]: round(d["value"], 4) for d in row.data}

        # We use these keys to merge data dictionaries.
        key = "{channel}-{version}-{metric}-{os}-{build_id}-{ping_type}".format(
            **metadata
        )
        sub_key = "{key}-{client_agg_type}".format(
            key=row.metric_key, client_agg_type=row.client_agg_type
        )

        record = response.get(key, {})
        if "metadata" not in record:
            record["metadata"] = metadata

        if sub_key not in record:
            record[sub_key] = {}

        new_data = {}
        new_data[row.agg_type] = aggs

        if row.agg_type == constants.AGGREGATION_HISTOGRAM:
            new_data["total_users"] = row.total_users

        if row.metric_key:
            new_data["key"] = row.metric_key

        if row.client_agg_type:
            new_data["client_agg_type"] = row.client_agg_type

        data = record[sub_key].get("data", {})
        data.update(new_data)

        record[sub_key]["data"] = data
        response[key] = record

    # Restructure data and remove keys only used for merging data.
    response = [
        {"metadata": r.pop("metadata"), "data": [d["data"] for d in r.values()]}
        for r in response.values()
    ]

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
                "versions": ["70"],  # Optional. Defaults to last 3 versions.
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
    FIREFOX = constants.PRODUCT_NAMES[constants.PRODUCT_FIREFOX]
    product = body["query"].get("product", FIREFOX)
    if product not in constants.PRODUCT_IDS.keys():
        raise ValidationError(
            "Unsupported product specified. We currently support only: {}".format(
                ", ".join(constants.PRODUCT_IDS.keys())
            )
        )

    if product == FIREFOX:
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
    channel = request.data.get("channel", "nightly")
    process = request.data.get("process", "parent")
    os = request.data.get("os", "Windows")
    try:
        n = int(n)
    except ValueError:
        n = 3

    probe_ids = list(
        Probe.objects.exclude(info__kind="string")
        .exclude(info__kind="boolean")
        .values_list("id", flat=True)
    )
    if n > len(probe_ids):
        raise ValidationError("Not enough probes to select `n` items.")

    shuffle(probe_ids)
    probes = []

    for id in probe_ids:
        probe = Probe.objects.get(id=id)
        # do not proceed if the probe is a boolean scalar
        if not (probe.info["type"] == "scalar" and probe.info["kind"] == "boolean"):
            try:
                aggregations = get_firefox_aggregations(
                    request,
                    probe=probe.info["name"],
                    channel=channel,
                    os=os,
                    process=process,
                    aggregationLevel="version",
                )
            except NotFound:
                continue
            if aggregations:
                probes.append({"data": aggregations, "info": probe.info})
            if n <= len(probes):
                break

    return Response({"probes": probes})
