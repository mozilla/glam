from random import shuffle

from django.core.cache import caches
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response

from glam.api.constants import (
    AGGREGATION_HISTOGRAM,
    AGGREGATION_NAMES,
    CHANNEL_IDS,
    CHANNEL_NAMES,
    PROCESS_NAMES,
)
from glam.api.models import Aggregation, Probe


def get_aggregations(**kwargs):
    REQUIRED_QUERY_PARAMETERS = ["channel", "probe", "versions", "aggregationLevel"]

    labels_cache = caches["probe-labels"]
    if labels_cache.get("__labels__") is None:
        Probe.populate_labels_cache()

    if any([k not in kwargs.keys() for k in REQUIRED_QUERY_PARAMETERS]):
        # Figure out which query parameter is missing.
        missing = set(REQUIRED_QUERY_PARAMETERS) - set(kwargs.keys())
        raise ValidationError(
            "Missing required query parameters: {}".format(", ".join(sorted(missing)))
        )

    dimensions = [
        Q(metric=kwargs["probe"]),
        Q(channel=CHANNEL_IDS[kwargs["channel"]]),
        Q(version__in=list(map(str, kwargs["versions"]))),
        Q(os=kwargs.get("os") or "*"),
    ]

    aggregation_level = kwargs["aggregationLevel"]
    # Whether to pull aggregations by version or build_id.
    if aggregation_level == "version":
        dimensions.append(Q(build_id="*"))
    elif aggregation_level == "build_id":
        dimensions.append(~Q(build_id="*"))

    result = Aggregation.objects.filter(*dimensions)

    response = {}

    for row in result:

        metadata = {
            "channel": CHANNEL_NAMES[row.channel],
            "version": row.version,
            "os": row.os,
            "build_id": row.build_id,
            "process": PROCESS_NAMES[row.process],
            "metric": row.metric,
            "metric_type": row.metric_type,
        }
        aggs = {d["key"]: round(d["value"], 4) for d in row.data}

        # We use these keys to merge data dictionaries.
        key = "{channel}-{version}-{metric}-{os}-{build_id}-{process}".format(**metadata)
        sub_key = "{key}-{client_agg_type}".format(
            key=row.metric_key, client_agg_type=row.client_agg_type
        )

        record = response.get(key, {})
        if "metadata" not in record:
            record["metadata"] = metadata

        if sub_key not in record:
            record[sub_key] = {}

        new_data = {}

        if row.agg_type == AGGREGATION_HISTOGRAM:
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

        new_data[AGGREGATION_NAMES[row.agg_type]] = aggs

        if row.metric_key:
            new_data["key"] = row.metric_key

        if row.client_agg_type:
            new_data["client_agg_type"] = row.client_agg_type

        data = record[sub_key].get("data", {})
        data.update(new_data)

        record[sub_key]["data"] = data
        response[key] = record

    # Restructure data and remove keys only used for merging data.
    return [
        {"metadata": r.pop("metadata"), "data": [d["data"] for d in r.values()]}
        for r in response.values()
    ]


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

    response = get_aggregations(**body["query"])

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

    probe_ids = list(
        Probe.objects.exclude(info__kind="string").values_list("id", flat=True)
    )
    if n > len(probe_ids):
        raise ValidationError("Not enough probes to select `n` items.")

    shuffle(probe_ids)
    probes = []

    for id in probe_ids:
        probe = Probe.objects.get(id=id)
        # do not proceed if the probe is a boolean scalar
        if not (probe.info["type"] == 'scalar' and probe.info["kind"] == "boolean"):
            aggregations = get_aggregations(
                probe=probe.info["name"],
                channel="nightly",
                os="Windows",
                # TODO: Update to get latest version.
                versions=["72"],
                aggregationLevel="version",
            )
            if aggregations:
                probes.append({"data": aggregations, "info": probe.info})
            if n <= len(probes):
                break

    return Response({"probes": probes})
