from django.core.files.base import ContentFile
from rest_framework import serializers

from ..models import Limnigrafo, RutaAcceso
from ..services.rutas_acceso import insertar_observaciones_en_archivo_ruta, procesar_archivo_ruta


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
        self._insertar_observaciones_en_archivo_subido(validated_data, procesada.formato_origen)
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
            self._insertar_observaciones_en_archivo_subido(validated_data, procesada.formato_origen)

        ruta = super().update(instance, validated_data)

        if procesada is None and 'observaciones' in validated_data:
            self._sincronizar_archivo_guardado(ruta)

        return ruta

    def _insertar_observaciones_en_archivo_subido(self, validated_data, formato_origen):
        archivo = validated_data.get('archivo_original')
        observaciones = (validated_data.get('observaciones') or '').strip()
        if not archivo or not observaciones:
            return

        contenido = archivo.read()
        archivo.seek(0)
        contenido_actualizado = insertar_observaciones_en_archivo_ruta(
            contenido,
            observaciones,
            formato_origen,
        )
        validated_data['archivo_original'] = ContentFile(
            contenido_actualizado,
            name=getattr(archivo, 'name', 'ruta_acceso.xml'),
        )

    def _sincronizar_archivo_guardado(self, ruta):
        observaciones = (ruta.observaciones or '').strip()
        if not ruta.archivo_original or not observaciones:
            return

        nombre = ruta.archivo_original.name
        storage = ruta.archivo_original.storage
        with storage.open(nombre, 'rb') as archivo:
            contenido = archivo.read()

        contenido_actualizado = insertar_observaciones_en_archivo_ruta(
            contenido,
            observaciones,
            ruta.formato_origen,
        )
        storage.delete(nombre)
        nuevo_nombre = storage.save(nombre, ContentFile(contenido_actualizado))
        if nuevo_nombre != nombre:
            ruta.archivo_original.name = nuevo_nombre
            ruta.save(update_fields=['archivo_original'])
