from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0028_update_limnigrafo_estado_and_alerta_tipo"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="configuracionlimnigrafo",
            name="bateria_max",
        ),
    ]
