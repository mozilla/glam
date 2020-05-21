import orjson

from django.db import migrations


def compress_json(s):
    if s is None:
        return None

    new_obj = {obj["key"]: round(obj["value"], 4) for obj in orjson.loads(s)}
    return orjson.dumps(new_obj).decode("utf-8", "ignore")


def migrate_json(apps, schema_editor):
    model = apps.get_model("api", "DesktopNightlyAggregation")
    for row in model.objects.iterator(chunk_size=1000):
        row.histogram = compress_json(row.histogram)
        row.percentiles = compress_json(row.percentiles)
        row.save()

    model = apps.get_model("api", "DesktopBetaAggregation")
    for row in model.objects.iterator(chunk_size=1000):
        row.histogram = compress_json(row.histogram)
        row.percentiles = compress_json(row.percentiles)
        row.save()

    model = apps.get_model("api", "DesktopReleaseAggregation")
    for row in model.objects.iterator(chunk_size=1000):
        row.histogram = compress_json(row.histogram)
        row.percentiles = compress_json(row.percentiles)
        row.save()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0008_migrate_data"),
    ]

    operations = [migrations.RunPython(migrate_json, migrations.RunPython.noop)]
