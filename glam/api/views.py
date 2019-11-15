from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response

from glam.api.constants import (
    AGGREGATION_HISTOGRAM, AGGREGATION_NAMES, CHANNEL_IDS, CHANNEL_NAMES)
from glam.api.models import Aggregation, Probe


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
                        "version": "70"
                    }
                }
            ]
        }

    """
    REQUIRED_QUERY_PARAMETERS = ["channel", "probe", "versions", "aggregationLevel"]
    body = request.data

    if body is None or body.get("query") is None:
        raise ValidationError("Unexpected JSON body")

    q = body["query"]

    if any([k not in q.keys() for k in REQUIRED_QUERY_PARAMETERS]):
        # Figure out which query parameter is missing.
        missing = set(REQUIRED_QUERY_PARAMETERS) - set(q.keys())
        raise ValidationError(
            "Missing required query parameters: {}".format(", ".join(sorted(missing)))
        )

    dimensions = [
        Q(metric=q.get("probe")),
        Q(channel=CHANNEL_IDS[q.get("channel")]),
        Q(version__in=map(str, q.get("versions"))),
        Q(os=q.get("os")),
    ]

    # Whether to pull aggregations by version or build_id.
    if q["aggregationLevel"] == "version":
        dimensions.append(Q(build_id=None))
    elif q["aggregationLevel"] == "build_id":
        dimensions.append(~Q(build_id=None))

    result = Aggregation.objects.filter(*dimensions)

    response = {}

    for row in result:

        metadata = {
            "channel": CHANNEL_NAMES[row.channel],
            "version": row.version,
            "os": row.os,
            "build_id": row.build_id,
            "metric": row.metric,
            "metric_type": row.metric_type,
        }
        aggs = {d["key"]: round(d["value"], 4) for d in row.data}

        # We use these keys to merge data dictionaries.
        key = "{channel}-{version}-{metric}-{os}-{build_id}".format(**metadata)
        sub_key = "{key}-{client_agg_type}".format(
            key=row.metric_key, client_agg_type=row.client_agg_type
        )

        record = response.get(key, {})
        if "metadata" not in record:
            record["metadata"] = metadata

        if sub_key not in record:
            record[sub_key] = {}

        new_data = {AGGREGATION_NAMES[row.agg_type]: aggs}
        if row.agg_type == AGGREGATION_HISTOGRAM:
            new_data["total_users"] = row.total_users
        if row.metric_key:
            new_data["key"] = row.metric_key
        if row.client_agg_type:
            new_data["client_agg_type"] = row.client_agg_type

        data = record[sub_key].get("data", {})
        data.update(new_data)

        record[sub_key]["data"] = data
        response[key] = record

        # TODO: Attach labels to categorical histograms.

    if not response:
        raise NotFound("No documents found for the given parameters")

    # Strip out the merge keys when returning the response.
    return Response(
        {
            "response": [
                {"metadata": r.pop("metadata"), "data": [d["data"] for d in r.values()]}
                for r in response.values()
            ]
        }
    )


@api_view(["GET"])
def probes(request):
    return Response(
        {"probes": {probe.key: probe.info for probe in Probe.objects.all()}}
    )
