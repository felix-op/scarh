from rest_framework import serializers
from ..models import Limnigrafo, Ubicacion

class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = ['longitud', 'latitud', 'nombre']

class LimnigrafoSerializer(serializers.ModelSerializer):
    tipo_comunicacion = serializers.ListField(
        child=serializers.CharField(),
        source='tipo_de_comunicacion'
    )
    bateria = serializers.FloatField(source='bateria_actual', read_only=True)
    ubicacion = UbicacionSerializer(read_only=True)
    estado = serializers.CharField(read_only=True) 
    ultima_conexion = serializers.TimeField(read_only=True)
    class Meta:
        model = Limnigrafo
        fields = [
            'id',
            'descripcion',
            'tipo_comunicacion',
            'bateria',
            'memoria',
            'tiempo_advertencia',
            'tiempo_peligro',
            'ultima_conexion',
            'estado',
            'ubicacion',
        ]