import json
import pytest

from django.db import connection
from django.urls import reverse

from glam.api import constants
from glam.api.models import (
    DesktopNightlyAggregation,
    DesktopReleaseAggregation,
    FirefoxCounts,
    Probe,
)
from glam.auth.drf import OIDCTokenAuthentication, TokenUser


def _create_aggregation(data=None, multiplier=1.0, model=None):
    model = model or DesktopNightlyAggregation
    _data = {
        "version": "72",
        "os": "*",
        "build_id": "*",
        "process": "parent",
        "metric": "gc_ms",
        "metric_key": "",
        "client_agg_type": "summed-histogram",
        "metric_type": "histogram-exponential",
        "total_users": 111 * multiplier,
        "histogram": json.dumps(
            {
                "0": round(10.00001111 * multiplier, 4),
                "1": round(20.00002222 * multiplier, 4),
                "2": round(30.00003333 * multiplier, 4),
                "3": round(40.00004444 * multiplier, 4),
            }
        ),
        "percentiles": json.dumps(
            {
                "5": 5 * multiplier,
                "25": 25 * multiplier,
                "50": 50 * multiplier,
                "75": 75 * multiplier,
                "95": 95 * multiplier,
            }
        ),
    }
    if data:
        _data.update(data)
    model.objects.create(**_data)

    for channel in ["nightly", "beta", "release"]:
        FirefoxCounts.objects.get_or_create(
            channel=constants.CHANNEL_IDS[channel],
            version=_data["version"],
            build_id=_data["build_id"],
            os=_data["os"],
            total_users=999,
        )

    with connection.cursor() as cursor:
        view = f"view_{model._meta.db_table}"
        cursor.execute(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view}")


class TestProbesApi:
    @classmethod
    def setup_class(cls):
        cls.url = reverse("v1-probes")

    def test_ok(self, client):
        assert client.get(self.url).status_code == 200

    def test_response(self, client):
        Probe.objects.create(key="foo", info={"test": True})
        Probe.objects.create(key="bar", info={"test": False})

        resp = client.get(self.url).json()
        assert resp["probes"] == {"foo": {"test": True}, "bar": {"test": False}}


class TestRandomProbesApi:
    @classmethod
    def setup_class(cls):
        cls.url = reverse("v1-random-probes")

    def test_response(self, client):
        Probe.objects.create(
            key="fee",
            info={
                "name": "fee",
                "labels": None,
                "type": "histogram",
                "kind": "enumerated",
            },
        )
        Probe.objects.create(
            key="fii",
            info={
                "name": "fii",
                "labels": None,
                "type": "histogram",
                "kind": "enumerated",
            },
        )
        Probe.objects.create(
            key="foo",
            info={
                "name": "foo",
                "labels": None,
                "type": "histogram",
                "kind": "enumerated",
            },
        )
        Probe.objects.create(
            key="fum",
            info={
                "name": "fum",
                "labels": None,
                "type": "histogram",
                "kind": "enumerated",
            },
        )
        _create_aggregation(data={"metric": "fee"})
        _create_aggregation(data={"metric": "fii"})
        _create_aggregation(data={"metric": "foo"})
        _create_aggregation(data={"metric": "fum"})

        resp = client.post(self.url, content_type="application/json").json()
        assert len(resp["probes"]) == 3

        # Test that a non-integer defaults to 3
        resp = client.post(
            self.url, data={"n": "abc"}, content_type="application/json"
        ).json()
        assert len(resp["probes"]) == 3

    def test_response_with_n(self, client):
        Probe.objects.create(
            key="fee",
            info={
                "name": "fee",
                "labels": None,
                "type": "histogram",
                "kind": "enumerated",
            },
        )
        Probe.objects.create(
            key="fii",
            info={
                "name": "fii",
                "labels": None,
                "type": "histogram",
                "kind": "enumerated",
            },
        )
        _create_aggregation(data={"metric": "fee"})
        _create_aggregation(data={"metric": "fii"})

        resp = client.post(
            self.url, data={"n": 1}, content_type="application/json"
        ).json()
        assert len(resp["probes"]) == 1


class TestAggregationsApi:
    @classmethod
    def setup_class(cls):
        cls.url = reverse("v1-data")

    def test_aggs_method(self, client):
        assert client.get(self.url).status_code == 405

    def test_empty_body(self, client):
        resp = client.post(self.url, data={}, content_type="application/json")
        assert resp.status_code == 400
        assert resp.json()[0] == "Unexpected JSON body"

    @pytest.mark.parametrize(
        "query, missing",
        [
            ({"channel": None, "probe": None, "versions": []}, "aggregationLevel"),
            ({"channel": None, "versions": [], "aggregationLevel": None}, "probe"),
            ({"probe": None, "versions": [], "aggregationLevel": None}, "channel"),
            ({"channel": None, "probe": None}, "aggregationLevel"),
            ({"channel": None}, "aggregationLevel, probe"),
            ({}, "aggregationLevel, channel, probe"),
        ],
    )
    def test_required_params(self, client, query, missing):
        resp = client.post(
            self.url, data={"query": query}, content_type="application/json"
        )
        assert resp.status_code == 400
        assert resp.json()[0] == f"Missing required query parameters: {missing}"

    def test_channel_required_if_firefox(self, client):
        query = {
            "query": {
                "product": "firefox",
                "probe": "gc_ms",
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 400
        assert resp.json()[0].startswith("Missing required query parameters")

        # Also test an invalid channel.
        query["query"]["channel"] = "ohrora"
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 400
        assert resp.json()[0].startswith("Product not currently supported")

    def test_invalid_product(self, client):
        resp = client.post(
            self.url,
            data={
                "query": {
                    "product": "feenicks",
                    "probe": "gc_ms",
                    "aggregationLevel": "version",
                }
            },
            content_type="application/json",
        )
        assert resp.status_code == 400
        assert resp.json()[0].startswith("Unsupported product specified.")

    def test_histogram(self, client):
        # This test adds 2 histograms, one of which will be in the result.
        _create_aggregation(multiplier=10)
        _create_aggregation(data={"os": "Windows"}, multiplier=1.5)

        query = {
            "query": {
                "channel": "nightly",
                "probe": "gc_ms",
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["response"]) == 1
        assert data["response"][0] == {
            "build_id": "*",
            "client_agg_type": "summed-histogram",
            "histogram": {"0": 100.0001, "1": 200.0002, "2": 300.0003, "3": 400.0004},
            "metric": "gc_ms",
            "metric_key": "",
            "metric_type": "histogram-exponential",
            "os": "*",
            "percentiles": {"5": 50, "25": 250, "50": 500, "75": 750, "95": 950},
            "process": "parent",
            "total_addressable_market": 999,
            "total_users": 1110,
            "version": "72",
        }

    def test_release_denied(self, client):
        query = {
            "query": {
                "channel": "release",
                "probe": "gc_ms",
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 403

    def test_release_allowed(self, client, monkeypatch):
        monkeypatch.setattr(
            OIDCTokenAuthentication,
            "authenticate",
            lambda self, request: (TokenUser(), {"scope": "read:foo"}),
        )

        _create_aggregation(model=DesktopReleaseAggregation)

        query = {
            "query": {
                "channel": "release",
                "probe": "gc_ms",
                "aggregationLevel": "version",
            }
        }
        resp = client.post(
            self.url,
            data=query,
            content_type="application/json",
            HTTP_AUTHORIZATION="Bearer token",
        )
        assert resp.status_code == 200

    def test_versions_provided(self, client, monkeypatch):
        _create_aggregation()

        query = {
            "query": {
                "channel": "nightly",
                "probe": "gc_ms",
                "versions": 1,
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 200

    def test_versions_count(self, client, monkeypatch):
        # Max version in the test data is 72. If we pass versions=4 we should
        # get 4 records back, even though we have 7 in the db.
        _create_aggregation()
        _create_aggregation({"version": 71})
        _create_aggregation({"version": 70})
        _create_aggregation({"version": 69})
        _create_aggregation({"version": 68})
        _create_aggregation({"version": 67})
        _create_aggregation({"version": 66})

        query = {
            "query": {
                "channel": "nightly",
                "probe": "gc_ms",
                "versions": 4,
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["response"]) == 4

    def test_process_filter(self, client):
        _create_aggregation()
        _create_aggregation({"process": "content"})

        query = {
            "query": {
                "channel": "nightly",
                "process": "content",
                "probe": "gc_ms",
                "versions": 2,
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 200

        query["query"]["process"] = "gpu"
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 404
