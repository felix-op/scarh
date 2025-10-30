from django.contrib.gis.db import models

class SectorRio(models.Model):
    nombre_rio = models.CharField(max_length=100)
    nombre_sector = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    cuenca = models.CharField(max_length=100)
    geometria = models.LineStringField(srid=4326, null=True, blank=True)

    def __str__(self):
        return f"{self.nombre_rio} - {self.nombre_sector}"
