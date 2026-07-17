from rest_framework import serializers

from ..models import Limnigrafo, RutaAcceso
from ..services.rutas_acceso import procesar_archivo_ruta


class RutaAccesoSerializer(serializers.ModelSerializer):
    limnigrafo_id = serializers.PrimaryKeyRelatedField(
        queryset=Limnigrafo.objects.all(),
        source='limnigrafo',
        write_only=True,
        required=True,
        error_messages={
            'does_not_exist': 'No existe un limnígrafo con el id indicado.',
            'incorrect_type': 'El limnígrafo indicado no es válido.',
        },
    )
    limnigrafo = serializers.PrimaryKeyRelatedField(read_only=True)
    archivo_original = serializers.FileField(write_only=True, required=False)
    archivo_nombre = serializers.SerializerMethodField()
    archivo_url = serializers.SerializerMethodField()

    class Meta:
        model = RutaAcceso
        fields = [
            'id',
            'limnigrafo',
            'limnigrafo_id',
            'nombre',
            'formato_origen',
            'tipo_acceso',
            'tiempo_estimado_minutos',
            'distancia_km',
            'observaciones',
            'archivo_original',
            'archivo_nombre',
            'archivo_url',
            'geometria',
            'creado_en',
            'actualizado_en',
        ]
        read_only_fields = [
            'id',
            'limnigrafo',
            'formato_origen',
            'distancia_km',
            'geometria',
            'creado_en',
            'actualizado_en',
        ]

    def get_archivo_nombre(self, obj):
        if not obj.archivo_original:
            return None
        return obj.archivo_original.name.split('/')[-1]

    def get_archivo_url(self, obj):
        if not obj.pk or not obj.archivo_original:
            return None
        return f"/api/proxy/rutas-acceso/{obj.pk}/descargar/"

    def validate(self, attrs):
        archivo = attrs.get('archivo_original')
        if self.instance is None and archivo is None:
            raise serializers.ValidationError({
                'archivo_original': 'Debe cargar un archivo GPX o KML.'
            })

        if archivo is not None:
            attrs['_ruta_procesada'] = procesar_archivo_ruta(archivo)

        return attrs

    def create(self, validated_data):
        procesada = validated_data.pop('_ruta_procesada')
        limnigrafo = validated_data.get('limnigrafo')
        validated_data['formato_origen'] = procesada.formato_origen
        validated_data['geometria'] = procesada.geometria
        validated_data['distancia_km'] = procesada.distancia_km
        if not validated_data.get('observaciones') and procesada.observaciones_sugeridas:
            validated_data['observaciones'] = procesada.observaciones_sugeridas
        if limnigrafo and getattr(limnigrafo, 'ubicacion_id', None):
            validated_data['ubicacion'] = limnigrafo.ubicacion
        return super().create(validated_data)

    def update(self, instance, validated_data):
        procesada = validated_data.pop('_ruta_procesada', None)
        if procesada is not None:
            validated_data['formato_origen'] = procesada.formato_origen
            validated_data['geometria'] = procesada.geometria
            validated_data['distancia_km'] = procesada.distancia_km
            if not validated_data.get('observaciones') and procesada.observaciones_sugeridas:
                validated_data['observaciones'] = procesada.observaciones_sugeridas
        return super().update(instance, validated_data)
