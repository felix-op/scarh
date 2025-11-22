from django.db import models
from django.contrib.postgres.fields import ArrayField
import secrets, hashlib
from simple_history.models import HistoricalRecords
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
    descripcion = models.TextField(blank=True)
    memoria = models.PositiveIntegerField()
    tipo_de_comunicacion = ArrayField(models.CharField(max_length=25, choices=COMUNICACIONES_CHOICES), default=list)
    bateria_max = models.FloatField()
    bateria_min = models.FloatField()
    bateria_actual = models.FloatField(null=True)
    ultima_conexion= models.TimeField(null=True)
    tiempo_advertencia = models.TimeField()
    tiempo_peligro = models.TimeField()
    token_hash = models.CharField(max_length=64, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[('normal', 'Normal'), ('advertencia', 'Advertencia'),('peligro', 'Peligro'), ('fuera_de_servicio', 'Fuera de servicio')], default='normal')
    ubicacion = models.ForeignKey('Ubicacion', on_delete=models.PROTECT, related_name='limnigrafo')
    sector_rio = models.ForeignKey('SectorRio', on_delete=models.PROTECT, related_name='limnigrafos')

    def __str__(self):
        return self.codigo

    def generar_token(self):
        token = secrets.token_hex(32)
        self.token_hash = hashlib.sha256(token.encode()).hexdigest()
        self.save(update_fields=['token_hash'])
        return token

    def validar_token(self, token):
        return self.token_hash == hashlib.sha256(token.encode()).hexdigest()
