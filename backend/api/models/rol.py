from django.db import models

class Rol(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    usuarios = models.ManyToManyField('Usuario', related_name='roles')

    def __str__(self):
        return self.nombre