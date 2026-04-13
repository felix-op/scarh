from django.db import migrations


def renombrar_metrica_a_medicion(apps, schema_editor):
    Accion = apps.get_model("api", "Accion")
    Accion.objects.filter(entidad__in=["Métrica", "Metrica", "métrica", "metrica"]).update(
        entidad="Medición"
    )


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0023_passwordrecoverycode"),
    ]

    operations = [
        migrations.RunPython(renombrar_metrica_a_medicion, migrations.RunPython.noop),
    ]
