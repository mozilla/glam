# Generated by Django 3.0.8 on 2020-07-29 18:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0013_lastupdated"),
    ]

    operations = [
        migrations.AddField(
            model_name="fenixaggregation",
            name="app_id",
            field=models.CharField(default="org_mozilla_fenix", max_length=100),
            preserve_default=False,
        ),
        migrations.RemoveConstraint(
            model_name="fenixaggregation",
            name="fenix_unique_dimensions",
        ),
        migrations.AddConstraint(
            model_name="fenixaggregation",
            constraint=models.UniqueConstraint(
                fields=(
                    "app_id",
                    "channel",
                    "version",
                    "ping_type",
                    "os",
                    "build_id",
                    "metric",
                    "metric_type",
                    "metric_key",
                    "client_agg_type",
                ),
                name="fenix_unique_dimensions",
            ),
        ),
        migrations.RunSQL(
            [
                "DROP MATERIALIZED VIEW view_glam_fenix_aggregation",
                "CREATE MATERIALIZED VIEW view_glam_fenix_aggregation AS SELECT * FROM glam_fenix_aggregation",
                "CREATE UNIQUE INDEX ON view_glam_fenix_aggregation (id)",
                "CREATE INDEX ON view_glam_fenix_aggregation (version)",
                "CREATE INDEX ON view_glam_fenix_aggregation USING HASH (app_id)",
                "CREATE INDEX ON view_glam_fenix_aggregation USING HASH (metric)",
                "CREATE INDEX ON view_glam_fenix_aggregation USING HASH (os)",
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fenix_aggregation"],
        ),
    ]
