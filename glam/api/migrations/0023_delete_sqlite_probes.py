# Generated by Django 3.1.13 on 2022-04-04 20:31

from django.db import migrations


class Migration(migrations.Migration):
    def delete_sqlite_probes(apps, scheme_editor):
        probes_to_remove = {"sqlite_store_open", "sqlite_store_query"}
        target_models = {
            "DesktopReleaseAggregation",
            "DesktopNightlyAggregation",
            "DesktopBetaAggregation",
        }
        for model_name in target_models:
            model = apps.get_model("api", model_name)
            model.objects.filter(metric__in=probes_to_remove).delete()

    dependencies = [
        ("api", "0022_sample_counts"),
    ]

    operations = [migrations.RunPython(delete_sqlite_probes)]
