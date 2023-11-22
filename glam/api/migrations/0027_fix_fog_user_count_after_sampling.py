from django.db import migrations

configs = [
    {
        "model": "fogaggregation",
        "pretty_name": "FOG",
        "filter": {"os": "Windows", "app_id": "release", "version__gt": 118},
    }
]


def do_migration(apps, fwd=True):
    for config in configs:
        model = config["model"]
        print(f"\nMigrating {config['pretty_name']}...")
        table = apps.get_model("api", model).objects.filter(**config["filter"])
        total = table.count()
        table_iter = table.iterator(100000)
        for i, instance in enumerate(table_iter):
            if fwd:
                instance.total_users *= 10
            else:
                instance.total_users /= 10
            instance.save()
            if i % 10000 == 0 or i + 1 == total:
                print(
                    f"{i} out of {total} rows migrated ({round((i+1)/total*100, 1)}%)",
                    end="\r",
                )
    print("\nRefreshing views...")


def multiply_user_count_by_10(apps, schema_editor):
    do_migration(apps)


def divide_user_count_by_10(apps, schema_editor):
    do_migration(apps, False)


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0026_fix_windows_release_sample_count"),
    ]

    operations = [
        migrations.RunPython(
            code=multiply_user_count_by_10, reverse_code=migrations.RunPython.noop
        ),
        migrations.RunSQL(
            "REFRESH MATERIALIZED VIEW CONCURRENTLY view_glam_fog_aggregation",
            reverse_sql="REFRESH MATERIALIZED VIEW CONCURRENTLY view_glam_fog_aggregation",
        ),
        migrations.RunPython(
            code=migrations.RunPython.noop, reverse_code=divide_user_count_by_10
        ),
    ]
