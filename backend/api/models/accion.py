from django.db import models

class Accion(models.Model):
    TIPO_ACCION_CHOICES = [
        ("created", "Creación"),
        ("modified", "Modificación"),
        ("deleted", "Eliminación"),
        ("manual_data_load", "Carga manual de datos"),
    ]

    ESTADO_CHOICES = [
        ("success", "Exitoso"),
        ("failed", "Fallido"),
        ("review", "En revisión"),
    ]

    tipo_accion = models.CharField(max_length=32, choices=TIPO_ACCION_CHOICES, db_index=True, default="modified")
    entidad = models.CharField(max_length=80, db_index=True, default="")
    entidad_id = models.CharField(max_length=64, blank=True, default="")
    descripcion = models.TextField()
    estado = models.CharField(max_length=16, choices=ESTADO_CHOICES, default="success")
    metadata = models.JSONField(default=dict, blank=True)
    fecha_hora = models.DateTimeField(auto_now_add=True, db_index=True)
    usuario = models.ForeignKey("Usuario", on_delete=models.SET_NULL, null=True, related_name="acciones")

    def __str__(self):
        actor = self.usuario.username if self.usuario else "Sistema"
        return f"[{self.tipo_accion}] {actor} - {self.descripcion} ({self.fecha_hora.strftime('%Y-%m-%d %H:%M:%S')})"
