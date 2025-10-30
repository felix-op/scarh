from django.db import models

class Accion(models.Model):
    descripcion = models.CharField(max_length=255)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey('Usuario', on_delete=models.SET_NULL, null=True, related_name='acciones')

    def __str__(self):
        return f"{self.usuario} - {self.descripcion} ({self.fecha_hora.strftime('%Y-%m-%d %H:%M:%S')})"
