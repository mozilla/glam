from django.contrib.postgres.fields import JSONField
from django.core.cache import caches
from django.db import models

from glam.api import constants


class Probe(models.Model):
    id = models.AutoField(primary_key=True)
    key = models.CharField(max_length=100)
    info = JSONField()

    class Meta:
        db_table = "glam_probe"

    @classmethod
    def populate_labels_cache(cls):
        cache = caches["probe-labels"]

        for probe in cls.objects.all():
            if probe.info["labels"]:
                cache.set(probe.info["name"], probe.info["labels"])

        # Add a key/value to check if we've populated the cache.
        # Note: This assumes locmem cache and this sentinal going away on restart.
        cache.set("__labels__", True)


class AbstractDesktopAggregation(models.Model):
    id = models.BigAutoField(primary_key=True)
    # Dimensions.
    version = models.CharField(max_length=100)
    os = models.CharField(max_length=100)
    build_id = models.CharField(max_length=100)
    process = models.CharField(max_length=50)
    metric = models.CharField(max_length=200)
    metric_key = models.CharField(max_length=200, blank=True)
    client_agg_type = models.CharField(max_length=100, blank=True)
    # Data.
    metric_type = models.CharField(max_length=100)
    total_users = models.IntegerField()
    histogram = models.TextField(null=True, blank=True)
    percentiles = models.TextField(null=True, blank=True)
    # TODO: Update these fields to not allow NULLs.

    class Meta:
        abstract = True


DESKTOP_CONSTRAINT_FIELDS = [
    "version",
    "os",
    "build_id",
    "process",
    "metric",
    "metric_key",
    "client_agg_type",
]


class DesktopNightlyAggregation(AbstractDesktopAggregation):
    class Meta(AbstractDesktopAggregation.Meta):
        db_table = "glam_desktop_nightly_aggregation"
        constraints = [
            models.UniqueConstraint(
                name="desktop_nightly_unique_dimensions",
                fields=DESKTOP_CONSTRAINT_FIELDS,
            )
        ]


class DesktopNightlyAggregationView(AbstractDesktopAggregation):
    class Meta:
        managed = False
        db_table = "view_glam_desktop_nightly_aggregation"


class DesktopBetaAggregation(AbstractDesktopAggregation):
    class Meta(AbstractDesktopAggregation.Meta):
        db_table = "glam_desktop_beta_aggregation"
        constraints = [
            models.UniqueConstraint(
                name="desktop_beta_unique_dimensions",
                fields=DESKTOP_CONSTRAINT_FIELDS,
            )
        ]


class DesktopBetaAggregationView(AbstractDesktopAggregation):
    class Meta:
        managed = False
        db_table = "view_glam_desktop_beta_aggregation"


class DesktopReleaseAggregation(AbstractDesktopAggregation):
    class Meta(AbstractDesktopAggregation.Meta):
        db_table = "glam_desktop_release_aggregation"
        constraints = [
            models.UniqueConstraint(
                name="desktop_release_unique_dimensions",
                fields=DESKTOP_CONSTRAINT_FIELDS,
            )
        ]


class DesktopReleaseAggregationView(AbstractDesktopAggregation):
    class Meta:
        managed = False
        db_table = "view_glam_desktop_release_aggregation"


class FirefoxCounts(models.Model):
    id = models.AutoField(primary_key=True)
    channel = models.IntegerField(
        choices=constants.CHANNEL_CHOICES, null=True, blank=True
    )
    version = models.CharField(max_length=100, null=True, blank=True)
    build_id = models.CharField(max_length=100)
    os = models.CharField(max_length=100)
    total_users = models.IntegerField()

    class Meta:
        db_table = "glam_firefox_counts"
        constraints = [
            models.UniqueConstraint(
                name="unique_dimensions",
                fields=["channel", "version", "build_id", "os"],
            )
        ]


class FenixAggregation(models.Model):
    id = models.BigAutoField(primary_key=True)
    channel = models.CharField(max_length=100)
    version = models.CharField(max_length=100)
    ping_type = models.CharField(max_length=100)
    os = models.CharField(max_length=100)
    build_id = models.CharField(max_length=100)
    metric = models.CharField(max_length=200)
    metric_type = models.CharField(max_length=100)
    metric_key = models.CharField(max_length=200, blank=True)
    client_agg_type = models.CharField(max_length=100, blank=True)
    agg_type = models.CharField(max_length=100)
    total_users = models.IntegerField()
    data = JSONField()

    class Meta:
        db_table = "glam_fenix_aggregation"
        constraints = [
            models.UniqueConstraint(
                name="fenix_unique_dimensions",
                fields=[
                    "channel",
                    "version",
                    "ping_type",
                    "os",
                    "build_id",
                    "metric",
                    "metric_type",
                    "metric_key",
                    "client_agg_type",
                    "agg_type",
                ],
            )
        ]
