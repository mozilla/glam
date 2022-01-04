from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0020_transpose_firefox"),
    ]

    operations = [
         migrations.RunSQL(
            [
                "CREATE MATERIALIZED VIEW view_glam_firefox_aggregation AS SELECT * FROM glam_firefox_aggregation",
                "CREATE UNIQUE INDEX ON view_glam_firefox_aggregation (id)",
                "CREATE INDEX ON view_glam_firefox_aggregation (version)",
                "CREATE INDEX ON view_glam_firefox_aggregation USING HASH (metric)",
                "CREATE INDEX ON view_glam_firefox_aggregation USING HASH (os)",
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_firefox_aggregation"],
        )
    ]
