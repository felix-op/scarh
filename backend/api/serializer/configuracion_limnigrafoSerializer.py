from rest_framework import serializers
from ..models import ConfiguracionLimnigrafo

class ConfiguracionLimnigrafoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionLimnigrafo
        fields = [
            'id',
            'tiempo_advertencia',
            'tiempo_peligro',
            'bateria_max',
            'bateria_min',
            'altura_minima_agua',
            'altura_maxima_agua',
            'temperatura_minima',
            'temperatura_maxima',
            'presion_minima',
            'presion_maxima',
        ]
        read_only_fields = ['id']
