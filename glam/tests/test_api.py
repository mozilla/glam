import pytest

from django.db import connection
from django.urls import reverse

from glam.api import constants
from glam.api.models import Aggregation, Probe
from glam.auth.drf import OIDCTokenAuthentication, TokenUser


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

    def _create_aggregation(self, name="gc_ms", data=None, multiplier=1.0):
        # Create 1 histogram and 1 percentile record.
        _data = {
            "channel": constants.CHANNEL_NIGHTLY,
            "version": "72",
            "os": "Windows",
            "build_id": "*",
            "process": 0,
            "agg_type": constants.AGGREGATION_HISTOGRAM,
            "metric": name,
            "metric_key": "",
            "client_agg_type": "summed-histogram",
            "metric_type": "histogram-exponential",
            "total_users": 111 * multiplier,
            "data": [
                {"key": "0", "value": 10.00001111 * multiplier},
                {"key": "1", "value": 20.00002222 * multiplier},
                {"key": "2", "value": 30.00003333 * multiplier},
                {"key": "3", "value": 40.00004444 * multiplier},
            ],
        }
        if data:
            _data.update(data)
        Aggregation.objects.create(**_data)
        _data.update(
            {
                "agg_type": constants.AGGREGATION_PERCENTILE,
                "data": [
                    {"key": "5", "value": 5 * multiplier},
                    {"key": "50", "value": 50 * multiplier},
                    {"key": "95", "value": 95 * multiplier},
                ],
            }
        )
        Aggregation.objects.create(**_data)

    def _refresh_views(self):
        with connection.cursor() as cursor:
            for channel in constants.CHANNEL_IDS.keys():
                cursor.execute(
                    f"""
                    REFRESH MATERIALIZED VIEW CONCURRENTLY
                    view_glam_aggregation_{channel}
                    """
                )

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
        self._create_aggregation(name="fee")
        self._create_aggregation(name="fii")
        self._create_aggregation(name="foo")
        self._create_aggregation(name="fum")
        self._refresh_views()

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
        self._create_aggregation(name="fee")
        self._create_aggregation(name="fii")
        self._refresh_views()

        resp = client.post(
            self.url, data={"n": 1}, content_type="application/json"
        ).json()
        assert len(resp["probes"]) == 1

    def test_n_too_large(self, client):
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

        # We want 2, but only 1 is left after query exclusions.
        resp = client.post(self.url, data={"n": 3}, content_type="application/json")
        assert resp.status_code == 400

    def test_missing_data(self, client):
        # Test that we skip a probe if it's missing part of its data.
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
        self._create_aggregation(name="fee")
        # Remove the "percentiles" record.
        Aggregation.objects.filter(agg_type=constants.AGGREGATION_PERCENTILE).delete()
        self._create_aggregation(name="fii")
        self._refresh_views()

        resp = client.post(self.url, data={"n": 2}, content_type="application/json")
        assert resp.status_code == 200
        # We asked for 2 but 1 got skipped b/c of incomplete data.
        assert len(resp.json()["probes"]) == 1


class TestAggregationsApi:
    @classmethod
    def setup_class(cls):
        cls.url = reverse("v1-data")

    def _create_aggregation(self, data=None, multiplier=1.0):
        # Create 1 histogram and 1 percentile record.
        _data = {
            "channel": constants.CHANNEL_NIGHTLY,
            "version": "72",
            "os": "*",
            "build_id": "*",
            "process": constants.PROCESS_ANY,
            "agg_type": constants.AGGREGATION_HISTOGRAM,
            "metric": "gc_ms",
            "metric_key": "",
            "client_agg_type": "summed-histogram",
            "metric_type": "histogram-exponential",
            "total_users": 111 * multiplier,
            "data": [
                {"key": "0", "value": 10.00001111 * multiplier},
                {"key": "1", "value": 20.00002222 * multiplier},
                {"key": "2", "value": 30.00003333 * multiplier},
                {"key": "3", "value": 40.00004444 * multiplier},
            ],
        }
        if data:
            _data.update(data)
        Aggregation.objects.create(**_data)
        _data.update(
            {
                "agg_type": constants.AGGREGATION_PERCENTILE,
                "data": [
                    {"key": "5", "value": 5 * multiplier},
                    {"key": "50", "value": 50 * multiplier},
                    {"key": "95", "value": 95 * multiplier},
                ],
            }
        )
        Aggregation.objects.create(**_data)

    def _refresh_views(self):
        with connection.cursor() as cursor:
            for channel in constants.CHANNEL_IDS.keys():
                cursor.execute(
                    f"""
                    REFRESH MATERIALIZED VIEW CONCURRENTLY
                    view_glam_aggregation_{channel}
                    """
                )

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

    def test_histogram(self, client):
        # This test adds 2 histograms, one of which will be in the result.
        self._create_aggregation(multiplier=10)
        self._create_aggregation(data={"os": "Windows"}, multiplier=1.5)
        self._refresh_views()

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
        assert data["response"][0]["data"] == [
            {
                "client_agg_type": "summed-histogram",
                "histogram": {
                    "0": 100.0001,
                    "1": 200.0002,
                    "2": 300.0003,
                    "3": 400.0004,
                },
                "percentiles": {"5": 50, "50": 500, "95": 950},
                "total_users": 1110,
            }
        ]

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

        self._create_aggregation({"channel": constants.CHANNEL_RELEASE})
        self._refresh_views()

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
        self._create_aggregation()
        self._refresh_views()

        query = {
            "query": {
                "channel": "nightly",
                "probe": "gc_ms",
                "versions": [72],
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 200

    def test_process_filter(self, client):
        self._create_aggregation()
        self._create_aggregation({"process": constants.PROCESS_CONTENT})
        self._refresh_views()

        query = {
            "query": {
                "channel": "nightly",
                "process": constants.PROCESS_NAMES[constants.PROCESS_CONTENT],
                "probe": "gc_ms",
                "versions": [72],
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 200

        query["query"]["process"] = constants.PROCESS_NAMES[constants.PROCESS_GPU]
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 404

    def test_half_data_missing(self, client):
        self._create_aggregation()
        # Remove the "percentiles" record.
        Aggregation.objects.filter(agg_type=constants.AGGREGATION_PERCENTILE).delete()
        self._refresh_views()

        query = {
            "query": {
                "channel": "nightly",
                "probe": "gc_ms",
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 404
