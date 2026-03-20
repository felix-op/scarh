from django.db import models


class UsuarioNotificacion(models.Model):
    ESTADOS_CHOICES = [
        ("nuevo", "Nuevo"),
        ("leido", "Leído"),
        ("solucionado", "Solucionado"),
    ]

    usuario = models.ForeignKey("Usuario", on_delete=models.CASCADE, related_name="notificaciones")
    alerta = models.ForeignKey("Alerta", on_delete=models.CASCADE, related_name="notificaciones_usuario")
    estado = models.CharField(max_length=20, choices=ESTADOS_CHOICES, default="nuevo")
    fecha_leida = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("usuario", "alerta")

    def __str__(self):
        return f"{self.usuario} - {self.alerta_id} ({self.estado})"
