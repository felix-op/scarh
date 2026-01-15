from django.db import models

class Ubicacion(models.Model):
    nombre = models.CharField(max_length=100, null=True, blank=True)
    latitud = models.FloatField()
    longitud = models.FloatField()

    def __str__(self):
        return self.nombre
