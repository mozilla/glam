import pytest
from flask import url_for

from server.api.models import Probe


@pytest.mark.usefixtures("db")
class TestProbesApi:
    def test_probes_ok(self, client):
        client.get(url_for("api.get_all_probes")).status_code == 200

    def test_probes_response_empty(self, client):
        resp = client.get(url_for("api.get_all_probes")).json
        assert resp["probes"] == {}

    def test_probes_response_single(self, db, client):
        db.session.add(Probe(id="gc_ms", info={"test": True}))
        db.session.commit()

        resp = client.get(url_for("api.get_all_probes")).json
        assert resp["probes"] == {"gc_ms": {"test": True}}

    def test_probes_response_multiple(self, db, client):
        db.session.add(Probe(id="foo", info={"test": True}))
        db.session.add(Probe(id="bar", info={"test": False}))
        db.session.commit()

        resp = client.get(url_for("api.get_all_probes")).json
        assert resp["probes"] == {"foo": {"test": True}, "bar": {"test": False}}
