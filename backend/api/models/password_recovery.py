from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class PasswordRecoveryCode(models.Model):
    usuario = models.ForeignKey('api.Usuario', on_delete=models.CASCADE, related_name='recovery_codes')
    codigo = models.CharField(max_length=6)
    intentos = models.IntegerField(default=0)
    creado_en = models.DateTimeField(auto_now_add=True)
    expira_en = models.DateTimeField()
    bloqueado_hasta = models.DateTimeField(null=True, blank=True)
    usado = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expira_en:
            expiration_minutes = getattr(settings, 'PASSWORD_RECOVERY_CODE_EXPIRATION_MINUTES', 15)
            self.expira_en = timezone.now() + timedelta(minutes=expiration_minutes)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expira_en

    def is_blocked(self):
        if self.bloqueado_hasta and timezone.now() < self.bloqueado_hasta:
            return True
        return False
