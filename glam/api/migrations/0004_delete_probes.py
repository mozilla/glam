from django.db import migrations


def drop_probes(apps, schema_editor):
    Probe = apps.get_model("api", "Probe")
    Probe.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_probe'),
    ]

    operations = [
        migrations.RunPython(drop_probes)
    ]
