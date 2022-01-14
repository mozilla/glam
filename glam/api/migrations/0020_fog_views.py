from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0019_fog_aggregation"),
    ]

    operations = [
        migrations.RunSQL(
            [
                "CREATE MATERIALIZED VIEW view_glam_fog_aggregation AS SELECT * FROM glam_fog_aggregation",
                "CREATE UNIQUE INDEX ON view_glam_fog_aggregation (id)",
                "CREATE INDEX ON view_glam_fog_aggregation (version)",
                "CREATE INDEX ON view_glam_fog_aggregation USING HASH (app_id)",
                "CREATE INDEX ON view_glam_fog_aggregation USING HASH (metric)",
                "CREATE INDEX ON view_glam_fog_aggregation USING HASH (os)",
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fog_aggregation"],
        )
    ]
