from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0027_remove_limnigrafo_sector_rio_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="alerta",
            name="tipo",
            field=models.CharField(
                choices=[
                    ("fuera_rango_medicion", "Por fuera de rango de medición"),
                    ("advertencia_limnigrafo", "Por advertencia de limnígrafo"),
                    ("peligro_limnigrafo", "Por peligro de limnígrafo"),
                    ("fuera_de_rango_limnigrafo", "Por fuera de rango del limnígrafo"),
                ],
                max_length=30,
            ),
        ),
        migrations.AlterField(
            model_name="limnigrafo",
            name="estado",
            field=models.CharField(
                choices=[
                    ("normal", "Normal"),
                    ("advertencia", "Advertencia"),
                    ("peligro", "Peligro"),
                    ("fuera_de_rango", "Fuera de rango"),
                ],
                default="normal",
                max_length=20,
            ),
        ),
    ]
