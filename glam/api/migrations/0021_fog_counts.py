# Generated by Django 3.1.13 on 2022-01-21 13:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0020_fog_views"),
    ]

    operations = [
        migrations.CreateModel(
            name="FOGCounts",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("app_id", models.CharField(max_length=100)),
                ("channel", models.CharField(max_length=100)),
                ("version", models.CharField(max_length=100)),
                ("ping_type", models.CharField(max_length=100)),
                ("build_id", models.CharField(max_length=100)),
                ("build_date", models.DateTimeField(null=True)),
                ("os", models.CharField(max_length=100)),
                ("total_users", models.IntegerField()),
            ],
            options={
                "db_table": "glam_fog_counts",
            },
        ),
        migrations.AddConstraint(
            model_name="fogcounts",
            constraint=models.UniqueConstraint(
                fields=("app_id", "channel", "version", "ping_type", "build_id", "os"),
                name="fog_counts_unique_dimensions",
            ),
        ),
    ]
