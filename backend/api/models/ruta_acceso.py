from django.db import models

class RutaAcceso(models.Model):
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50)
    distancia_km = models.FloatField()
    tiempo_estimado_minutos = models.FloatField(null=True)
    observaciones = models.TextField(blank=True)
    track = models.LineStringField(srid=4326, null=True, blank=True)
    ubicacion = models.ForeignKey('Ubicacion', on_delete=models.CASCADE, related_name='rutas_acceso')

    def __str__(self):
        return self.nombre
