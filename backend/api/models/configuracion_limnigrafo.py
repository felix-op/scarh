from django.db import models
from .limnigrafo import Limnigrafo

class ConfiguracionLimnigrafo(models.Model):

    limnigrafo = models.OneToOneField(Limnigrafo, on_delete=models.CASCADE, related_name='configuracion')
    tiempo_advertencia = models.PositiveBigIntegerField(blank=True, null=True)
    tiempo_peligro = models.PositiveBigIntegerField(blank=True, null=True)
    bateria_max = models.FloatField(blank=True, null=True)
    bateria_min = models.FloatField(blank=True, null=True)
    altura_minima_agua = models.FloatField(blank=True, null=True)
    altura_maxima_agua = models.FloatField(blank=True, null=True)
    temperatura_minima = models.FloatField(default=0)
    temperatura_maxima = models.FloatField(default=100)
    presion_minima = models.FloatField(blank=True, null=True)
    presion_maxima = models.FloatField(blank=True, null=True)

    class Meta:
        verbose_name = "Configuración de Limnígrafo"
        verbose_name_plural = "Configuraciones de Limnígrafos"

    def __str__(self):
        return f"Configuración de {self.limnigrafo.codigo}"

    def save(self, *args, **kwargs):
        if self.limnigrafo and hasattr(self.limnigrafo, 'configuracion'):
            self.pk = self.limnigrafo.configuracion.pk
        super().save(*args, **kwargs)