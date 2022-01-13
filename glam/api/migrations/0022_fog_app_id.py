
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_fog_views'),
    ]

    operations = [
        migrations.AddField(
            model_name='fogaggregation',
            name='app_id',
            field=models.CharField(default='firefox_desktop', max_length=100),
            preserve_default=False,
        ),
        migrations.RemoveConstraint(
            model_name='fogaggregation',
            name='fog_unique_dimensions',
        ),
        migrations.AddConstraint(
            model_name='fogaggregation',
            constraint=models.UniqueConstraint(fields=('app_id', 'channel', 'version', 'ping_type', 'os', 'build_id', 'metric', 'metric_type', 'metric_key', 'client_agg_type'), name='fog_unique_dimensions'),
        ),
        migrations.RunSQL(
            [
                "DROP MATERIALIZED VIEW view_glam_fog_aggregation",
                "CREATE MATERIALIZED VIEW view_glam_fog_aggregation AS SELECT * FROM glam_fog_aggregation",
                "CREATE UNIQUE INDEX ON view_glam_fog_aggregation (id)",
                "CREATE INDEX ON view_glam_fog_aggregation (version)",
                "CREATE INDEX ON view_glam_fog_aggregation USING HASH (app_id)",
                "CREATE INDEX ON view_glam_fog_aggregation USING HASH (metric)",
                "CREATE INDEX ON view_glam_fog_aggregation USING HASH (os)",
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fog_aggregation"],
        ),
    ]
