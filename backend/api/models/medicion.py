from django.db import models
from django.db.models import Q

class Medicion(models.Model):
    fecha_hora = models.DateTimeField()#por ahora diria que no se calcula automaticamente
    altura_agua = models.FloatField()
    presion = models.FloatField(null=True, blank=True)
    temperatura = models.FloatField(null=True, blank=True)
    nivel_de_bateria = models.FloatField(null=True, blank=True)
    idempotency_key = models.CharField(max_length=128, null=True, blank=True)
    fuente = models.CharField(
        max_length=20,
        choices=[
            ('manual', 'Manual'),
            ('automatico', 'Automático'),
            ('import_csv', 'Importación CSV'),
            ('import_json', 'Importación JSON'),
        ],
        default='automatico',
    )
    limnigrafo = models.ForeignKey('Limnigrafo', on_delete=models.PROTECT, related_name='mediciones')

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['limnigrafo', 'fecha_hora'],
                name='uniq_medicion_limnigrafo_fecha_hora',
            ),
            models.UniqueConstraint(
                fields=['limnigrafo', 'idempotency_key'],
                condition=Q(idempotency_key__isnull=False),
                name='uniq_medicion_limnigrafo_idempotency_key',
            ),
        ]

    def __str__(self):
        return f"{self.limnigrafo.codigo} - {self.fecha_hora.strftime('%Y-%m-%d %H:%M:%S')}"
