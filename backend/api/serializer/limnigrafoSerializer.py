from rest_framework import serializers
from ..models import Limnigrafo, Ubicacion, ConfiguracionLimnigrafo
from .ubicacionSerializer import UbicacionSerializer
from .configuracion_limnigrafoSerializer import ConfiguracionLimnigrafoSerializer

    
class LimnigrafoSerializer(serializers.ModelSerializer):
    tipo_comunicacion = serializers.ListField(
        child=serializers.CharField(),
        source='tipo_de_comunicacion'
    )
    bateria = serializers.FloatField(source='bateria_actual', read_only=True)
    ubicacion = UbicacionSerializer(read_only=True)
    estado = serializers.CharField(read_only=True)
    ultima_conexion = serializers.DateTimeField(read_only=True)
    ultima_medicion = serializers.SerializerMethodField()
    configuracion = ConfiguracionLimnigrafoSerializer(read_only=True, allow_null=True)
    radio_cobertura_metros = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    ubicacion_id = serializers.PrimaryKeyRelatedField(
        queryset=Ubicacion.objects.all(),
        source='ubicacion',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    def get_ultima_medicion(self, obj):
        """Retorna la última medición del limnígrafo con altura, temperatura y presión"""
        ultima = obj.mediciones.order_by('-fecha_hora').first()
        if ultima:
            return {
                'id': ultima.id,
                'fecha_hora': ultima.fecha_hora,
                'altura_agua': ultima.altura_agua,
                'temperatura': ultima.temperatura,
                'presion': ultima.presion,
            }
        return None

    def create(self, validated_data):
        limnigrafo = Limnigrafo.objects.create(**validated_data)
        ConfiguracionLimnigrafo.objects.create(limnigrafo=limnigrafo)
        return limnigrafo
    class Meta:
        model = Limnigrafo
        fields = [
            'id',
            'codigo',
            'descripcion',
            'ultimo_mantenimiento',
            'tipo_comunicacion',
            'bateria',
            'memoria',
            'radio_cobertura_metros',
            'ultima_conexion',
            'estado',
            'ubicacion',
            'ubicacion_id',
            'ultima_medicion',
            'configuracion',
        ]
