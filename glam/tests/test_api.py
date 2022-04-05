import json

import pytest
from django.conf import settings
from django.db import connection
from django.urls import reverse
from django.utils import timezone

from glam.api import constants
from glam.api.models import (
    DesktopNightlyAggregation,
    FenixAggregation,
    FenixCounts,
    FOGCounts,
    FirefoxBuildRevisions,
    FirefoxCounts,
    LastUpdated,
    Probe,
)


def _create_aggregation(data=None, multiplier=1.0, model=None):
    model = model or DesktopNightlyAggregation
    _data = {
        "version": 72,
        "os": "*",
        "build_id": "*",
        "process": "parent",
        "metric": "gc_ms",
        "metric_key": "",
        "client_agg_type": "summed-histogram",
        "metric_type": "histogram-exponential",
        "total_users": 111 * multiplier,
        "total_sample": 1000,
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


def _create_glean_aggregation(model, data=None, multiplier=1.0):
    _data = {
        "channel": "production",
        "app_id": "nightly",
        "version": 2,
        "ping_type": "*",
        "os": "*",
        "build_id": "*",
        "build_date": None,
        "metric": "events_total_uri_count",
        "metric_type": "counter",
        "metric_key": "",
        "client_agg_type": "avg",
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

    for app_id in ["nightly", "beta", "release"]:
        FenixCounts.objects.get_or_create(
            app_id=app_id,
            version=_data["version"],
            ping_type=_data["ping_type"],
            build_id=_data["build_id"],
            os=_data["os"],
            total_users=888,
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


class TestDesktopAggregationsApi:
    @classmethod
    def setup_class(cls):
        cls.url = reverse("v1-data")

    def test_aggs_method(self, client):
        assert client.get(self.url).status_code == 405

    def test_empty_body(self, client):
        resp = client.post(self.url, data={}, content_type="application/json")
        assert resp.status_code == 400
        assert resp.json()[0] == "Unexpected JSON body"

    def test_empty_data(self, client):
        # Test no data doesn't trigger a 500.
        query = {
            "query": {
                "channel": "nightly",
                "probe": "gc_ms",
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 404

    @pytest.mark.parametrize(
        "query, missing",
        [
            (
                {"product": "firefox", "probe": None, "aggregationLevel": None},
                "channel",
            ),
            ({"channel": None, "probe": None}, "aggregationLevel"),
            ({"channel": None, "aggregationLevel": None}, "probe"),
            ({"probe": None, "aggregationLevel": None}, "channel"),
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

    def test_invalid_channel_if_firefox(self, client):
        query = {
            "query": {
                "product": "firefox",
                "channel": "ohrora",
                "probe": "gc_ms",
                "aggregationLevel": "version",
            }
        }
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
            "revision": "",
            "client_agg_type": "summed-histogram",
            "histogram": {"0": 100.0001, "1": 200.0002, "2": 300.0003, "3": 400.0004},
            "metric": "gc_ms",
            "metric_key": "",
            "metric_type": "histogram-exponential",
            "os": "*",
            "percentiles": {"5": 50, "25": 250, "50": 500, "75": 750, "95": 950},
            "process": "parent",
            #"total_addressable_market": 999,
            "total_users": 1110,
            "sample_count": 1000,
            "version": 72,
        }

    def test_revision_lookup(self, client):
        build_id = "20210504113355"
        revision = "abcdefg1234567"

        _create_aggregation()
        _create_aggregation(data={"build_id": build_id}, multiplier=10)

        FirefoxBuildRevisions.objects.create(
            channel="nightly", build_id=build_id, revision=revision
        )

        query = {
            "query": {
                "channel": "nightly",
                "probe": "gc_ms",
                "aggregationLevel": "build_id",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["response"]) == 1
        assert data["response"][0] == {
            "build_id": build_id,
            "revision": revision,
            "client_agg_type": "summed-histogram",
            "histogram": {"0": 100.0001, "1": 200.0002, "2": 300.0003, "3": 400.0004},
            "metric": "gc_ms",
            "metric_key": "",
            "metric_type": "histogram-exponential",
            "os": "*",
            "percentiles": {"5": 50, "25": 250, "50": 500, "75": 750, "95": 950},
            "process": "parent",
            #"total_addressable_market": 999,
            "total_users": 1110,
            "sample_count": 1000,
            "version": 72,
        }

    def test_versions_provided(self, client):
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

    def test_versions_count(self, client):
        # Max version in the test data is 72. If we pass versions=4 we should
        # get 4 records back, even though we have 7 in the db.
        _create_aggregation()
        _create_aggregation({"version": 101})
        _create_aggregation({"version": 100})
        _create_aggregation({"version": 99})
        _create_aggregation({"version": 98})
        _create_aggregation({"version": 97})

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
        versions = sorted([d["version"] for d in data["response"]])
        assert versions == sorted([101, 100, 99, 98])

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


class TestGleanAggregationsApi:
    @classmethod
    def setup_class(cls):
        cls.url = reverse("v1-data")

    def test_empty_data(self, client):
        # Test no data doesn't trigger a 500.
        query = {
            "query": {
                "product": "fenix",
                "app_id": "nightly",
                "ping_type": "baseline",
                "probe": "gc_ms",
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 404

    @pytest.mark.parametrize(
        # Not testing all possible combinations here, just the boundaries and
        # spot checking.
        "query, missing",
        [
            ({"ping_type": None, "probe": None}, "aggregationLevel, app_id"),
            ({"aggregationLevel": None, "ping_type": None, "probe": None}, "app_id"),
            ({"aggregationLevel": None, "app_id": None, "probe": None}, "ping_type"),
            ({"aggregationLevel": None, "app_id": None, "ping_type": None}, "probe"),
            ({}, "aggregationLevel, app_id, ping_type, probe"),
        ],
    )
    def test_required_glean_params(self, client, query, missing):
        query["product"] = "fenix"
        resp = client.post(
            self.url, data={"query": query}, content_type="application/json"
        )
        assert resp.status_code == 400
        assert resp.json()[0] == f"Missing required query parameters: {missing}"

    def test_histogram(self, client):
        # This test adds 2 histograms, one of which will be in the result.
        _create_glean_aggregation(model=FenixAggregation, multiplier=10)
        _create_glean_aggregation(
            model=FenixAggregation, data={"os": "Android"}, multiplier=1.5
        )

        query = {
            "query": {
                "product": "fenix",
                "app_id": "nightly",
                "probe": "events_total_uri_count",
                "ping_type": "*",
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["response"]) == 1
        assert data["response"][0] == {
            "build_date": None,
            "build_id": "*",
            "client_agg_type": "avg",
            "histogram": {"0": 100.0001, "1": 200.0002, "2": 300.0003, "3": 400.0004},
            "metric": "events_total_uri_count",
            "metric_key": "",
            "metric_type": "counter",
            "os": "*",
            "percentiles": {"5": 50, "25": 250, "50": 500, "75": 750, "95": 950},
            "ping_type": "*",
            "total_users": 1110,
            "version": 2,
            #"total_addressable_market": 888,
        }

    def test_versions_count(self, client):
        # Create 6 versions, max being version=6.
        _create_glean_aggregation(model=FenixAggregation, data={"version": 6})
        _create_glean_aggregation(model=FenixAggregation, data={"version": 5})
        _create_glean_aggregation(model=FenixAggregation, data={"version": 4})
        _create_glean_aggregation(model=FenixAggregation, data={"version": 3})
        _create_glean_aggregation(model=FenixAggregation, data={"version": 2})
        _create_glean_aggregation(model=FenixAggregation, data={"version": 1})

        query = {
            "query": {
                "product": "fenix",
                "app_id": "nightly",
                "ping_type": "*",
                "probe": "events_total_uri_count",
                "versions": 4,
                "aggregationLevel": "version",
            }
        }
        resp = client.post(self.url, data=query, content_type="application/json")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["response"]) == 4
        versions = sorted([d["version"] for d in data["response"]])
        assert versions == sorted([6, 5, 4, 3])


class TestUpdatesApi:
    @classmethod
    def setup_class(cls):
        cls.url = reverse("v1-updates")
        cls.datetime1 = timezone.datetime(year=2020, month=1, day=1).replace(
            tzinfo=timezone.utc
        )
        cls.datetime2 = timezone.datetime(year=2020, month=2, day=2).replace(
            tzinfo=timezone.utc
        )

    def _create_stamps(self):
        LastUpdated.objects.create(product="desktop", last_updated=self.datetime1)
        LastUpdated.objects.create(
            product="org_mozilla_fenix", last_updated=self.datetime2
        )

    def test_no_params(self, client):
        self._create_stamps()

        resp = client.get(self.url)
        data = resp.json()
        assert len(data["updates"]) == 2
        assert data["updates"]["desktop"] == self.datetime1.strftime(
            settings.REST_FRAMEWORK["DATETIME_FORMAT"]
        )
        assert data["updates"]["org_mozilla_fenix"] == self.datetime2.strftime(
            settings.REST_FRAMEWORK["DATETIME_FORMAT"]
        )

    def test_params(self, client):
        self._create_stamps()

        resp = client.get(self.url, data={"product": "desktop"})
        data = resp.json()
        assert len(data["updates"]) == 1
        assert data["updates"]["desktop"] == self.datetime1.strftime(
            settings.REST_FRAMEWORK["DATETIME_FORMAT"]
        )
