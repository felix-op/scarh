from rest_framework import serializers
from ..models import Limnigrafo, Ubicacion
from .ubicacionSerializer import UbicacionSerializer

    
class LimnigrafoSerializer(serializers.ModelSerializer):
    tipo_comunicacion = serializers.ListField(
        child=serializers.CharField(),
        source='tipo_de_comunicacion'
    )
    bateria = serializers.FloatField(source='bateria_actual', read_only=True)
    ubicacion = UbicacionSerializer(read_only=True)
    estado = serializers.CharField(read_only=True)
    ultima_conexion = serializers.TimeField(read_only=True)
    ubicacion_id = serializers.PrimaryKeyRelatedField(
        queryset=Ubicacion.objects.all(),
        source='ubicacion',
        write_only=True
    )
    class Meta:
        model = Limnigrafo
        fields = [
            'id',
            'codigo',
            'descripcion',
            'ultimo_mantenimiento',
            'tipo_comunicacion',
            'bateria_max',
            'bateria_min',
            'bateria',
            'memoria',
            'tiempo_advertencia',
            'tiempo_peligro',
            'ultima_conexion',
            'estado',
            'ubicacion',
            'ubicacion_id',
        ]