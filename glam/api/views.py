from random import shuffle

from django.core.cache import caches
from django.db.models import Max, Q
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response

from glam.api import constants
from glam.api.models import (
    BetaAggregation,
    FirefoxCounts,
    NightlyAggregation,
    ReleaseAggregation,
    Probe,
)


def get_aggregations(request, **kwargs):
    # TODO: When glam starts sending "product", make it required.
    # TODO: Consider combining product + channel for Firefox.
    REQUIRED_QUERY_PARAMETERS = ["probe", "aggregationLevel"]
    if any([k not in kwargs.keys() for k in REQUIRED_QUERY_PARAMETERS]):
        # Figure out which query parameter is missing.
        missing = set(REQUIRED_QUERY_PARAMETERS) - set(kwargs.keys())
        raise ValidationError(
            "Missing required query parameters: {}".format(", ".join(sorted(missing)))
        )

    # Ensure that the product provided is one we support, defaulting to Firefox.
    product = kwargs.get("product", "firefox")
    if product not in constants.PRODUCT_IDS.keys():
        raise ValidationError(
            "Unsupported product specified. We currently support only: {}".format(
                ", ".join(constants.PRODUCT_IDS.keys())
            )
        )

    channel = None
    model_key = product

    # If Firefox is the product, channel is required.
    if product == constants.PRODUCT_NAMES[constants.PRODUCT_FIREFOX]:
        channel = kwargs.get("channel")
        if not channel or channel not in constants.CHANNEL_IDS.keys():
            raise ValidationError(
                "Unsupported or missing channel. We currently support: {}".format(
                    ", ".join(constants.CHANNEL_IDS.keys())
                )
            )

        # If release channel, make sure the user is authenticated.
        if channel == constants.CHANNEL_NAMES[constants.CHANNEL_RELEASE]:
            if not request.user.is_authenticated:
                raise PermissionDenied()

        model_key = f"{product}-{channel}"

    MODEL_MAP = {
        "firefox-nightly": NightlyAggregation,
        "firefox-beta": BetaAggregation,
        "firefox-release": ReleaseAggregation,
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

    if "process" in kwargs:
        dimensions.append(Q(process=constants.PROCESS_IDS[kwargs["process"]]))

    result = model.objects.filter(*dimensions)

    response = {}

    for row in result:

        metadata = {
            "channel": constants.CHANNEL_NAMES[row.channel],
            "version": row.version,
            "os": row.os,
            "build_id": row.build_id,
            "process": constants.PROCESS_NAMES[row.process],
            "metric": row.metric,
            "metric_type": row.metric_type,
        }
        aggs = {d["key"]: round(d["value"], 4) for d in row.data}

        # We use these keys to merge data dictionaries.
        key = "{channel}-{version}-{metric}-{os}-{build_id}-{process}".format(
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

        if row.agg_type == constants.AGGREGATION_HISTOGRAM:
            new_data["total_users"] = row.total_users
            # Check for labels.
            labels = labels_cache.get(metadata["metric"])
            if labels is not None:
                # Replace the numeric indexes with their labels.
                aggs_w_labels = {}
                for k, v in aggs.items():
                    try:
                        aggs_w_labels[labels[int(k)]] = v
                    except IndexError:
                        pass
                aggs = aggs_w_labels

        new_data[constants.AGGREGATION_NAMES[row.agg_type]] = aggs

        # Get the total distinct client IDs for this set of dimensions.
        try:
            client_count = FirefoxCounts.objects.get(
                channel=row.channel,
                version=row.version,
                build_id=row.build_id,
                os=row.os,
            )
        except FirefoxCounts.DoesNotExist:
            client_count = None
        new_data["total_addressable_market"] = client_count and client_count.total_users

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

    # Check for data with one of "histogram" or "percentiles", but not both.
    for row in response:
        if row["metadata"]["metric_type"] == "boolean":
            continue
        for data in row["data"]:
            if "histogram" not in data or "percentiles" not in data:
                raise NotFound("Incomplete data for probe")

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
                "versions": ["70"],  # OR ["70", "69", "68"]
                "aggregationLevel": "version"  # OR "build_id"
            }
        }

    Returns a JSON object containing the histogram data and metadata, e.g.::

        {
            "response": [
                {
                    "data": [
                        {
                            "client_agg_type": "summed-histogram",
                            "histogram": {
                                "0": 0.0,
                                "1": 1920.963,
                                ...
                            },
                            "percentiles": {
                                "0": 1.0,
                                "10": 1.0259,
                                ...
                            },
                            "total_users": 1604
                        }
                    ],
                    "metadata": {
                        "build_id": null,
                        "channel": "nightly",
                        "metric": "gc_ms",
                        "metric_type": "histogram-exponential",
                        "os": "Linux",
                        "process": "any",
                        "version": "70"
                    }
                }
            ]
        }

    """
    body = request.data

    if body is None or body.get("query") is None:
        raise ValidationError("Unexpected JSON body")

    response = get_aggregations(request, **body["query"])

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
    channel = request.data.get(
        "channel", constants.CHANNEL_NAMES[constants.CHANNEL_NIGHTLY]
    )
    process = request.data.get(
        "process", constants.PROCESS_NAMES[constants.PROCESS_CONTENT]
    )
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
                aggregations = get_aggregations(
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
