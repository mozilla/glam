from unittest import TestCase

import pytest
from flask import url_for

from server.api.models import FirefoxMeasurement, Probe, ChannelTypes, AggregateTypes


@pytest.mark.usefixtures("db")
class TestProbesApi:
    def test_ok(self, client):
        assert client.get(url_for("api.get_all_probes")).status_code == 200

    def test_response(self, db, client):
        db.session.add(Probe(id="foo", info={"test": True}))
        db.session.add(Probe(id="bar", info={"test": False}))
        db.session.commit()

        resp = client.get(url_for("api.get_all_probes")).json
        assert resp["probes"] == {"foo": {"test": True}, "bar": {"test": False}}


@pytest.mark.usefixtures("db")
class TestAggregationsApi:
    def test_aggs_ok(self, client):
        print(url_for("api.get_aggregate_data"))
        assert client.get(url_for("api.get_aggregate_data")).status_code == 404

    def test_empty_body(self, client):
        resp = client.post(url_for("api.get_aggregate_data"), json={})
        assert resp.status_code == 400
        assert resp.json["message"] == "Unexpected JSON body"

    @pytest.mark.parametrize(
        "query, missing",
        [
            ({"channel": None, "probe": None, "versions": []}, "aggregationLevel"),
            ({"channel": None, "probe": None, "aggregationLevel": None}, "versions"),
            ({"channel": None, "versions": [], "aggregationLevel": None}, "probe"),
            ({"probe": None, "versions": [], "aggregationLevel": None}, "channel"),
            ({"channel": None, "probe": None}, "aggregationLevel, versions"),
            ({"channel": None}, "aggregationLevel, probe, versions"),
            ({}, "aggregationLevel, channel, probe, versions"),
        ],
    )
    def test_required_params(self, client, query, missing):
        resp = client.post(url_for("api.get_aggregate_data"), json={"query": query})
        assert resp.status_code == 400
        assert resp.json["message"] == f"Missing required query parameters: {missing}"

    def test_histogram(self, db, client):
        # This test adds 2 histograms, one of which will be in the result.
        db.session.add(
            FirefoxMeasurement(
                channel="nightly",
                version="70",
                os=None,
                build_id=None,
                agg_type="histogram",
                metric="gc_ms",
                metric_key=None,
                client_agg_type="summed-histogram",
                metric_type="histogram-exponential",
                total_users=1234,
                data=[
                    {"key": "0", "value": 100.00001111},
                    {"key": "1", "value": 200.00001111},
                    {"key": "2", "value": 300.00001111},
                ],
            )
        )
        db.session.add(
            FirefoxMeasurement(
                channel="nightly",
                version="70",
                os="Windows",
                build_id=None,
                agg_type="histogram",
                metric="gc_ms",
                metric_key=None,
                client_agg_type="summed-histogram",
                metric_type="histogram-exponential",
                total_users=123,
                data=[
                    {"key": "0", "value": 10.00001111},
                    {"key": "1", "value": 20.00001111},
                    {"key": "2", "value": 30.00001111},
                ],
            )
        )
        db.session.commit()

        query = {
            "query": {
                "channel": "nightly",
                "probe": "gc_ms",
                "versions": ["70"],
                "aggregationLevel": "version",
            }
        }
        resp = client.post(url_for("api.get_aggregate_data"), json=query)
        assert resp.status_code == 200
        data = resp.json
        assert len(data["response"]) == 1
        assert data["response"][0]["data"] == [
            {
                "client_agg_type": "summed-histogram",
                "histogram": {"0": 100.0, "1": 200.0, "2": 300.0},
                "total_users": 1234,
            }
        ]

