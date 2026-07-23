from django.db import models
import sys

try:
    import psycopg2
    HAS_POSTGRES_SUPPORT = True
except ImportError:
    try:
        # pyrefly: ignore [missing-import]
        import psycopg
        HAS_POSTGRES_SUPPORT = True
    except ImportError:
        HAS_POSTGRES_SUPPORT = False

if 'test' in sys.argv or not HAS_POSTGRES_SUPPORT:
    class ArrayField(models.JSONField):
        def __init__(self, base_field=None, **kwargs):
            super().__init__(**kwargs)
else:
    from django.contrib.postgres.fields import ArrayField

import secrets, hashlib
from simple_history.models import HistoricalRecords # type: ignore
class Limnigrafo(models.Model):
    history = HistoricalRecords()
    COMUNICACIONES_CHOICES = [
        ('internet-https-2G', 'Internet HTTPS 2G'),
        ('internet-https-3G', 'Internet HTTPS 3G'),
        ('internet-https-4G', 'Internet HTTPS 4G'),
        ('internet-https-5G', 'Internet HTTPS 5G'),
        ('fisico-usb', 'Físico USB'),
        ('mensajes-sms', 'Mensajes SMS'),
        ('correos-smtp', 'Correos SMTP'),
    ]
    codigo = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True,default="")
    memoria = models.PositiveBigIntegerField(blank=True, null=True)
    tipo_de_comunicacion = ArrayField(models.CharField(max_length=25, choices=COMUNICACIONES_CHOICES), default=list)
    ultimo_mantenimiento = models.DateField(blank=True,null=True)
    bateria_actual = models.FloatField(blank=True,null=True)
    ultima_medicion = models.ForeignKey('Medicion', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    radio_cobertura_metros = models.PositiveIntegerField(blank=True, null=True)
    token_hash = models.CharField(max_length=64, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[('normal', 'Normal'), ('advertencia', 'Advertencia'),('peligro', 'Peligro'), ('sin_conexion', 'Sin conexión')], default='normal')
    estado_medicion = models.CharField(max_length=20, choices=[('normal', 'Normal'), ('fuera_de_rango', 'Fuera de rango')], default='normal')
    ubicacion = models.ForeignKey('Ubicacion', on_delete=models.PROTECT, related_name='limnigrafo', null=True, blank=True)

    def __str__(self):
        return self.codigo

    @property
    def configuracion(self):
        if hasattr(self, '_prefetched_objects_cache') and 'configuraciones' in self._prefetched_objects_cache:
            for conf in self.configuraciones.all():
                if conf.activo:
                    return conf
            return next(iter(self.configuraciones.all()), None)
        return self.configuraciones.filter(activo=True).first() or self.configuraciones.order_by('-id').first()

    @property
    def estado_conexion(self):
        if not self.ultima_medicion:
            return "sin_conexion"
        config = self.configuracion
        if not config:
            return "en_linea"
        from django.utils import timezone
        tiempo_transcurrido = (timezone.now() - self.ultima_medicion.fecha_hora).total_seconds()
        if config.tiempo_peligro is not None and tiempo_transcurrido > config.tiempo_peligro:
            return "sin_conexion"
        if config.tiempo_advertencia is not None and tiempo_transcurrido > config.tiempo_advertencia:
            return "demorado"
        return "en_linea"

    def generar_token(self):
        token = secrets.token_hex(32)
        self.token_hash = hashlib.sha256(token.encode()).hexdigest()
        self.save(update_fields=['token_hash'])
        return token

    def validar_token(self, token):
        return self.token_hash == hashlib.sha256(token.encode()).hexdigest()
