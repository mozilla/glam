# Generated by Django 3.1.13 on 2022-03-04 01:21

from django.db import migrations, models

from glam.api import constants

sql = []
sql_drop = []
for channel in constants.CHANNEL_NAMES.values():
    sql.extend(
        [
            f"CREATE MATERIALIZED VIEW view_glam_desktop_{channel}_aggregation AS SELECT * FROM glam_desktop_{channel}_aggregation;",
            f"CREATE UNIQUE INDEX ON view_glam_desktop_{channel}_aggregation (id);",
            f"CREATE INDEX ON view_glam_desktop_{channel}_aggregation (version);",
            f"CREATE INDEX ON view_glam_desktop_{channel}_aggregation USING HASH (metric);",
            f"CREATE INDEX ON view_glam_desktop_{channel}_aggregation (os);",
        ]
    )
for channel in constants.CHANNEL_NAMES.values():
    sql_drop.extend(
        [
            f"DROP MATERIALIZED VIEW view_glam_desktop_{channel}_aggregation;",
        ]
    )


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0021_fog_counts"),
    ]

    operations = [
        migrations.RunSQL(
            sql_drop,
            reverse_sql=[
                f"DROP MATERIALIZED VIEW view_glam_desktop_{channel}_aggregation"
                for channel in constants.CHANNEL_NAMES.values()
            ],
        ),
        migrations.RunSQL(
            [
                "DROP MATERIALIZED VIEW view_glam_fenix_aggregation",
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fenix_aggregation"],
        ),
        migrations.RunSQL(
            [
                "DROP MATERIALIZED VIEW view_glam_fog_aggregation",
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fog_aggregation"],
        ),
        migrations.AddField(
            model_name="desktopbetaaggregation",
            name="total_sample",
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="desktopnightlyaggregation",
            name="total_sample",
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="desktopreleaseaggregation",
            name="total_sample",
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="fenixaggregation",
            name="total_sample",
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="fogaggregation",
            name="total_sample",
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="desktopbetaaggregation",
            name="version",
            field=models.BigIntegerField(),
        ),
        migrations.AlterField(
            model_name="desktopnightlyaggregation",
            name="version",
            field=models.BigIntegerField(),
        ),
        migrations.AlterField(
            model_name="desktopreleaseaggregation",
            name="version",
            field=models.BigIntegerField(),
        ),
        migrations.AlterField(
            model_name="fenixaggregation",
            name="version",
            field=models.BigIntegerField(),
        ),
        migrations.AlterField(
            model_name="fogaggregation",
            name="version",
            field=models.BigIntegerField(),
        ),
        migrations.AlterField(
            model_name="fenixcounts",
            name="version",
            field=models.BigIntegerField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name="firefoxcounts",
            name="version",
            field=models.BigIntegerField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name="fogcounts",
            name="version",
            field=models.BigIntegerField(null=True, blank=True),
        ),
        migrations.RunSQL(
            [
                "CREATE MATERIALIZED VIEW view_glam_fenix_aggregation AS SELECT * FROM glam_fenix_aggregation",
                "CREATE UNIQUE INDEX ON view_glam_fenix_aggregation (id)",
                "CREATE INDEX ON view_glam_fenix_aggregation (version)",
                "CREATE INDEX ON view_glam_fenix_aggregation (app_id)",
                "CREATE INDEX ON view_glam_fenix_aggregation USING HASH (metric)",
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fenix_aggregation"],
        ),
        migrations.RunSQL(
            sql,
            reverse_sql=[
                f"DROP MATERIALIZED VIEW view_glam_desktop_{channel}_aggregation"
                for channel in constants.CHANNEL_NAMES.values()
            ],
        ),
        migrations.RunSQL(
            [
                "CREATE MATERIALIZED VIEW view_glam_fog_aggregation AS SELECT * FROM glam_fog_aggregation",
                "CREATE UNIQUE INDEX ON view_glam_fog_aggregation (id)",
                "CREATE INDEX ON view_glam_fog_aggregation (version)",
                "CREATE INDEX ON view_glam_fog_aggregation (app_id)",
                "CREATE INDEX ON view_glam_fog_aggregation USING HASH (metric)",
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fog_aggregation"],
        ),
    ]
