from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0011_transpose_fenix"),
    ]

    operations = [
        migrations.RunSQL(
            [
                "CREATE MATERIALIZED VIEW view_glam_fenix_aggregation AS SELECT * FROM glam_fenix_aggregation",
                "CREATE UNIQUE INDEX ON view_glam_fenix_aggregation (id)",
                "CREATE INDEX ON view_glam_fenix_aggregation (version)",
                "CREATE INDEX ON view_glam_fenix_aggregation USING HASH (metric)",
                "CREATE INDEX ON view_glam_fenix_aggregation USING HASH (os)",
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fenix_aggregation"],
        )
    ]
