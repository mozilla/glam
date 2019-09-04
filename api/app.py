from firebase_admin import firestore, initialize_app
from flask import Flask, jsonify


app = Flask(__name__)


# Set up Firestore DB client.
initialize_app()
db = firestore.client()


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
        return "Probe not found", 404


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
