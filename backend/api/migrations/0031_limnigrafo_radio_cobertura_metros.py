from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0030_medicion_idempotency_and_uniques"),
    ]

    operations = [
        migrations.AddField(
            model_name="historicallimnigrafo",
            name="radio_cobertura_metros",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="limnigrafo",
            name="radio_cobertura_metros",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
