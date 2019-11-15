from django.contrib.postgres.fields import JSONField
from django.db import models

from glam.api import constants


class Aggregation(models.Model):
    id = models.BigAutoField(primary_key=True)
    # Partition columns.
    channel = models.IntegerField(choices=constants.CHANNEL_CHOICES)
    version = models.CharField(max_length=100)
    # Dimensions.
    agg_type = models.IntegerField(choices=constants.AGGREGATION_CHOICES)
    os = models.CharField(max_length=100, blank=True, null=True)
    build_id = models.CharField(max_length=100, blank=True, null=True)
    metric = models.CharField(max_length=200)
    metric_key = models.CharField(max_length=200, blank=True, null=True)
    client_agg_type = models.CharField(max_length=100, blank=True, null=True)
    # Data.
    metric_type = models.CharField(max_length=100)
    total_users = models.IntegerField()
    data = JSONField()

    class Meta:
        db_table = "aggregation"
        # This table is a partitioned table, we manage the creation of it ourselves.
        managed = False


class Probe(models.Model):
    id = models.AutoField(primary_key=True)
    key = models.CharField(max_length=100)
    info = JSONField()

    class Meta:
        db_table = "probe"
