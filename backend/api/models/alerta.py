from django.db import models
from jsonschema import ValidationError

class Alerta(models.Model):
    ESTADOS_CHOICES = [
        ('nuevo', 'Nuevo'),
        ('leido', 'Leído'),
        ('solucionado', 'Solucionado'),
    ]

    TIPOS_CHOICES = [
        ('fuera_rango_medicion', 'Por fuera de rango de medición'),
        ('advertencia_limnigrafo', 'Por advertencia de limnígrafo'),
        ('peligro_limnigrafo', 'Por peligro de limnígrafo'),
    ]

    estado = models.CharField(max_length=20, choices=ESTADOS_CHOICES, default='nuevo')
    tipo = models.CharField(max_length=30, choices=TIPOS_CHOICES)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    limnigrafo = models.ForeignKey('Limnigrafo', on_delete=models.SET_NULL, null=True, blank=True, related_name='alertas')
    medicion = models.ForeignKey('Medicion', on_delete=models.SET_NULL, null=True, blank=True, related_name='alertas')
    usuarios = models.ManyToManyField('Usuario', related_name='alertas')
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return f"Alerta {self.tipo} ({self.estado})"

    def clean(self):
        if not self.limnigrafo and not self.medicion:
            raise ValidationError("La alerta debe estar asociada a un limnígrafo o una medición.")

    def save(self, *args, **kwargs):
        if not self.descripcion:
            descripciones = {
                'fuera_rango_medicion': 'Valor de medición fuera del rango establecido.',
                'advertencia_limnigrafo': 'El limnígrafo alcanzó el tiempo de advertencia',
                'peligro_limnigrafo': 'El limnígrafo alcanzó el tiempo de peligro',
            }
            self.descripcion = descripciones.get(self.tipo, 'no hay alerta')
        super().save(*args, **kwargs)