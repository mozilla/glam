# Generated by Django 3.1.13 on 2022-03-04 01:21

from django.db import migrations, models

from glam.api import constants

sql_drop = []
for channel in constants.CHANNEL_NAMES.values():
    sql_drop.extend(
        [
            f"DROP MATERIALIZED VIEW view_glam_desktop_{channel}_aggregation;"
        ]
    )

sql_rename = []
for channel in constants.CHANNEL_NAMES.values():
    sql_rename.extend(
        [
            f"ALTER MATERIALIZED VIEW view_glam_desktop_{channel}_aggregation_backup  RENAME TO view_glam_desktop_{channel}_aggregation;"
        ]
    )

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_create_backup_MV'),
    ]

    operations = [
        migrations.RunSQL(
            [
                "DROP MATERIALIZED VIEW view_glam_fenix_aggregation;"
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fenix_aggregation"],
        ),
       migrations.RunSQL(
            [
                "DROP MATERIALIZED VIEW view_glam_fog_aggregation;"
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fog_aggregation"],
        ),
        migrations.RunSQL(
            sql_drop,
            reverse_sql=[
                f"DROP MATERIALIZED VIEW view_glam_desktop_{channel}_aggregation"
                for channel in constants.CHANNEL_NAMES.values()
            ],
        ),
        migrations.RunSQL(
            [
                "ALTER MATERIALIZED VIEW view_glam_fenix_aggregation_backup  RENAME TO view_glam_fenix_aggregation;"
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fenix_aggregation_backup"],
        ),
        migrations.RunSQL(
            [
                "ALTER MATERIALIZED VIEW view_glam_fog_aggregation_backup  RENAME TO view_glam_fog_aggregation;"
            ],
            reverse_sql=["DROP MATERIALIZED VIEW view_glam_fog_aggregation_backup"],
        ),
        migrations.RunSQL(
            sql_rename,
            reverse_sql=[
                f"DROP MATERIALIZED VIEW view_glam_desktop_{channel}_aggregation_backup"
                for channel in constants.CHANNEL_NAMES.values()
            ],
        ),
    ]