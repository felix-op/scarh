from django.db import models

class Medicion(models.Model):
    fecha_hora = models.DateTimeField()#por ahora diria que no se calcula automaticamente
    altura = models.FloatField()
    presion = models.FloatField()
    temperatura = models.FloatField()
    nivel_de_bateria = models.FloatField()
    limnigrafo = models.ForeignKey('Limnigrafo', on_delete=models.PROTECT, related_name='mediciones')

    def __str__(self):
        return f"{self.limnigrafo.codigo} - {self.fecha_hora.strftime('%Y-%m-%d %H:%M:%S')}"
