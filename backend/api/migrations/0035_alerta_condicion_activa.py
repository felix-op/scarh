from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0034_remove_rutaacceso_tipo_acceso"),
    ]

    operations = [
        migrations.AddField(
            model_name="alerta",
            name="fecha_cierre",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="alerta",
            name="condicion",
            field=models.CharField(blank=True, max_length=80, null=True),
        ),
        migrations.AddField(
            model_name="alerta",
            name="condicion_activa",
            field=models.BooleanField(default=False),
        ),
        migrations.AddConstraint(
            model_name="alerta",
            constraint=models.UniqueConstraint(
                condition=Q(condicion_activa=True),
                fields=("limnigrafo", "tipo", "condicion"),
                name="uniq_alerta_condicion_activa",
            ),
        ),
    ]
