from flask import Blueprint, jsonify, request
from sqlalchemy.sql import and_, select
from werkzeug import exceptions

from server import db
from .models import AggregateTypes, Probe
from .models import FirefoxMeasurement as fxm


bp = Blueprint("api", __name__)


class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv["message"] = self.message
        return rv


@bp.errorhandler(APIException)
def handle_api_exception(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


REQUIRED_QUERY_PARAMETERS = ["channel", "probe", "versions", "aggregationLevel"]


@bp.route("/api/v1/data", methods=["POST"])
def get_aggregate_data():
    """
    Fetches histogram data.

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
    try:
        body = request.get_json()
    except exceptions.BadRequest as e:
        raise APIException(str(e))

    if body is None or body.get("query") is None:
        raise APIException("Unexpected JSON body")

    q = body["query"]

    if any([k not in q.keys() for k in REQUIRED_QUERY_PARAMETERS]):
        # Figure out which query parameter is missing.
        missing = set(REQUIRED_QUERY_PARAMETERS) - set(q.keys())
        raise APIException(
            "Missing required query parameters: {}".format(", ".join(sorted(missing)))
        )

    dimensions = [
        fxm.metric == q.get("probe"),
        fxm.channel == q.get("channel"),
        fxm.version.in_(map(str, q.get("versions"))),
        fxm.os == q.get("os"),
    ]

    # Whether to pull aggregations by version or build_id.
    if q["aggregationLevel"] == "version":
        dimensions.append(fxm.build_id == None)  # noqa
    elif q["aggregationLevel"] == "build_id":
        dimensions.append(fxm.build_id != None)  # noqa

    sql = select([fxm]).where(and_(*dimensions))
    result = db.engine.execute(sql)

    response = {}

    for row in result:

        metadata = {
            "channel": row.channel.name,
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

        new_data = {row.agg_type.name: aggs}
        if row.agg_type == AggregateTypes.histogram:
            new_data["total_users"] = row.total_users
        if value := row.metric_key:
            new_data["key"] = value
        if value := row.client_agg_type:
            new_data["client_agg_type"] = value

        data = record[sub_key].get("data", {})
        data.update(new_data)

        record[sub_key]["data"] = data
        response[key] = record

        # TODO: Attach labels to categorical histograms.

    if not response:
        raise APIException("No documents found for the given parameters.", 404)

    # Strip out the merge keys when returning the response.
    return {
        "response": [
            {"metadata": r.pop("metadata"), "data": [d["data"] for d in r.values()]}
            for r in response.values()
        ]
    }


@bp.route("/api/v1/probes", methods=["GET"])
def get_all_probes():

    response = {
        "probes": {probe.id: probe.info for probe in Probe.query.all()}
    }

    return response
