# Generated by Django 3.1 on 2020-08-10 17:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0014_fenix_app_id"),
    ]

    operations = [
        migrations.AlterField(
            model_name="probe",
            name="info",
            field=models.JSONField(),
        ),
    ]
