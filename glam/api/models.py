from django.contrib.postgres.fields import JSONField
from django.core.cache import caches
from django.db import models

from glam.api import constants


class AbstractAggregation(models.Model):
    id = models.BigAutoField(primary_key=True)
    # Partition columns.
    channel = models.IntegerField(choices=constants.CHANNEL_CHOICES)
    # Dimensions.
    version = models.CharField(max_length=100)
    agg_type = models.IntegerField(choices=constants.AGGREGATION_CHOICES)
    os = models.CharField(max_length=100)
    build_id = models.CharField(max_length=100)
    process = models.IntegerField(choices=constants.PROCESS_CHOICES)
    metric = models.CharField(max_length=200)
    metric_key = models.CharField(max_length=200, blank=True)
    client_agg_type = models.CharField(max_length=100, blank=True)
    # Data.
    metric_type = models.CharField(max_length=100)
    total_users = models.IntegerField()
    data = JSONField()

    class Meta:
        abstract = True


class Aggregation(AbstractAggregation):
    class Meta(AbstractAggregation.Meta):
        # This table is a partitioned table, we manage the creation of it ourselves.
        managed = False
        db_table = "glam_aggregation"


class NightlyAggregation(AbstractAggregation):
    class Meta(AbstractAggregation.Meta):
        managed = False
        db_table = "view_glam_aggregation_nightly"


class BetaAggregation(AbstractAggregation):
    class Meta(AbstractAggregation.Meta):
        managed = False
        db_table = "view_glam_aggregation_beta"


class ReleaseAggregation(AbstractAggregation):
    class Meta(AbstractAggregation.Meta):
        managed = False
        db_table = "view_glam_aggregation_release"


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
