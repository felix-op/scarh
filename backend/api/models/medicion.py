from django.db import models

class Medicion(models.Model):
    fecha_hora = models.DateTimeField()#por ahora diria que no se calcula automaticamente
    altura = models.FloatField()
    presion = models.FloatField(null=True, blank=True)
    temperatura = models.FloatField(null=True, blank=True)
    nivel_de_bateria = models.FloatField(null=True, blank=True)
    fuente = models.CharField(max_length=20, choices=[('manual', 'Manual'), ('automatico', 'Automático')], default='automatico')
    limnigrafo = models.ForeignKey('Limnigrafo', on_delete=models.PROTECT, related_name='mediciones')

    def __str__(self):
        return f"{self.limnigrafo.codigo} - {self.fecha_hora.strftime('%Y-%m-%d %H:%M:%S')}"
