from firebase_admin import firestore, initialize_app
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug import exceptions


app = Flask(__name__)
CORS(app)


# Set up Firestore DB client.
initialize_app()
db = firestore.client()


# HELPERS


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


@app.errorhandler(APIException)
def handle_api_exception(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


# API ROUTES


REQUIRED_QUERY_PARAMETERS = ["channel", "versions", "probe"]


@app.route("/api/v1/data", methods=["POST"])
def get_data():
    """
    Fetches histogram data from Firestore.

    Expects a JSON object in the body containing the query parameters, e.g.::

        {
            "query": {
                "channel": "nightly",
                "versions": ["70"],  # OR ["70", "69", "68"]
                "probe": "gc_ms",

                # TODO:
                "build_id": {
                    "from": "20190901",
                    "to": "20190915"
                }
            }
        }

    Returns a JSON object containing the histogram data and metadata, e.g.::

        {
            "data": [
                {
                    "histogram": {
                        "0": 0.0,
                        "1": 0.0028,
                        ...
                    },
                    "metadata": {
                        "agg_type": "summed-histogram",
                        "build_id": "20190901",
                        "channel": "nightly",
                        "key": "",
                        "metric": "gc_ms",
                        "metric_type": "histogram-exponential",
                        "os": "Windows",
                        "version": "70"
                    }
                },
                ...
            ]
        }

    """
    try:
        body = request.get_json()
    except exceptions.BadRequest as e:
        raise APIException(str(e))

    if body is None:
        raise APIException("Missing JSON body or proper mimetype")

    q = body["query"]

    if any([k not in q.keys() for k in REQUIRED_QUERY_PARAMETERS]):
        # Figure out which query parameter is missing.
        missing = set(REQUIRED_QUERY_PARAMETERS) - set(q.keys())
        raise APIException(
            "Missing required query parameters: {}".format(", ".join(missing))
        )

    resp = {"data": []}
    not_found = True

    for version in q.get("versions"):

        collection = "{channel}-{version}".format(channel=q["channel"], version=version)
        query = db.collection(collection)

        if q.get("probe"):
            query = query.where("metric", "==", q.get("probe"))
        if q.get("os"):
            query = query.where("os", "==", q.get("os"))
        else:
            query = query.where("os", "==", None)
        if q.get("build_id"):
            query = query.where("build_id", "==", q.get("build_id"))
        else:
            query = query.where("build_id", "==", None)

        docs = [doc.to_dict() for doc in query.stream()]

        for doc in docs:
            not_found = False
            resp["data"].append(
                {
                    "histogram": doc.pop("aggregates", None),
                    "metadata": dict(**doc, version=version, channel=q["channel"]),
                }
            )

    if not_found:
        raise APIException("No documents found for the given parameters.", 404)

    return jsonify(resp)


@app.route("/api/v1/probes", methods=["GET"])
def get_probes():
    probes = {}

    docs = db.collection("firefox-probes").stream()
    for doc in docs:
        probes[doc.id] = doc.to_dict()

    return jsonify({"probes": probes})


@app.route("/api/v1/probes/<name>", methods=["GET"])
def get_probe(name):
    doc = db.collection("firefox-probes").document(name).get()
    if doc.exists:
        return jsonify({"probe": doc.to_dict()})
    else:
        return APIException("Probe not found", 404)


if __name__ == "__main__":
    import os

    app.run(debug=True, host="0.0.0.0", port=os.environ.get("PORT", "8000"))
