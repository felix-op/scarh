from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0029_alter_historicallimnigrafo_estado"),
        ("api", "0029_remove_configuracionlimnigrafo_bateria_max"),
    ]

    operations = [
        migrations.AddField(
            model_name="medicion",
            name="idempotency_key",
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddConstraint(
            model_name="medicion",
            constraint=models.UniqueConstraint(
                fields=("limnigrafo", "fecha_hora"),
                name="uniq_medicion_limnigrafo_fecha_hora",
            ),
        ),
        migrations.AddConstraint(
            model_name="medicion",
            constraint=models.UniqueConstraint(
                condition=Q(idempotency_key__isnull=False),
                fields=("limnigrafo", "idempotency_key"),
                name="uniq_medicion_limnigrafo_idempotency_key",
            ),
        ),
    ]
