import hashlib

from firebase_admin import firestore, initialize_app
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug import exceptions


app = Flask(__name__)
CORS(app)


# Set up Firestore DB client.
initialize_app()
db = firestore.client()


# Get the labeled probes for categorical histograms.
LABELED_PROBES = {}
for probe in db.collection("firefox-probes").stream():
    doc = probe.to_dict()
    if doc["labels"] is not None:
        LABELED_PROBES[doc["name"]] = doc["labels"]


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


REQUIRED_QUERY_PARAMETERS = ["channel", "probe", "versions", "aggregationLevel"]


@app.route("/api/v1/data", methods=["POST"])
def get_data():
    """
    Fetches histogram data from Firestore.

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
                            }
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

    if body is None:
        raise APIException("Missing JSON body or proper mimetype")

    q = body["query"]

    if any([k not in q.keys() for k in REQUIRED_QUERY_PARAMETERS]):
        # Figure out which query parameter is missing.
        missing = set(REQUIRED_QUERY_PARAMETERS) - set(q.keys())
        raise APIException(
            "Missing required query parameters: {}".format(", ".join(missing))
        )

    resp = {"response": []}
    docs = []

    agg_level = q["aggregationLevel"]

    if agg_level == "version":

        for version in q.get("versions"):
            collection = "{channel}-{version}".format(
                channel=q["channel"], version=version
            )
            query = db.collection(collection)

            # Try to get the document by document ID hash.
            doc_key = "{metric}-{build_id}-{os}".format(
                metric=q.get("probe"), build_id=q.get("build_id"), os=q.get("os")
            )
            doc_id = hashlib.blake2b(doc_key.encode()).hexdigest()
            results = query.document(doc_id).get()

            if not results.exists:
                continue

            doc = results.to_dict()
            doc["channel"] = q["channel"]
            doc["version"] = version
            docs.append(doc)

    elif agg_level == "build_id":

        for version in q.get("versions"):
            collection = "{channel}-{version}".format(
                channel=q["channel"], version=version
            )
            query = db.collection(collection)

            query = query.where("metric", "==", q["probe"])
            if q.get("os"):
                query = query.where("os", "==", q.get("os"))
            else:
                query = query.where("os", "==", None)

            for result in query.stream():
                doc = result.to_dict()
                # Since we can't query Firestore by `build_id != None`, we
                # iterate and skip it instead.
                if doc["build_id"] is not None:
                    doc["channel"] = q["channel"]
                    doc["version"] = version
                    docs.append(doc)

    if not docs:
        raise APIException("No documents found for the given parameters.", 404)

    for doc in docs:
        data = list(doc.pop("data", {}).values())
        metadata = doc

        if metadata["metric"] in LABELED_PROBES:
            labels = LABELED_PROBES[metadata["metric"]]
            hist = {}
            for i, item in enumerate(data):
                for k, v in item.get("histogram", {}).items():
                    try:
                        hist[labels[int(k)]] = v
                    except IndexError:
                        pass
                data[i]["histogram"] = hist

        resp["response"].append({"data": data, "metadata": metadata})

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
