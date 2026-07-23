from django.db import models

class RutaAcceso(models.Model):
    FORMATOS_ORIGEN = [
        ('gpx', 'GPX'),
        ('kml', 'KML'),
    ]

    nombre = models.CharField(max_length=100)
    distancia_km = models.FloatField(blank=True, null=True)
    tiempo_estimado_minutos = models.FloatField(null=True)
    observaciones = models.TextField(blank=True)
    track = models.TextField(null=True, blank=True)#revisar
    ubicacion = models.ForeignKey('Ubicacion', on_delete=models.SET_NULL, related_name='rutas_acceso', blank=True, null=True)
    formato_origen = models.CharField(max_length=3, choices=FORMATOS_ORIGEN, blank=True)
    archivo_original = models.FileField(upload_to='rutas_acceso/', blank=True, null=True)
    geometria = models.JSONField(blank=True, null=True)
    limnigrafo = models.ForeignKey('Limnigrafo', on_delete=models.CASCADE, related_name='rutas_acceso', blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre
