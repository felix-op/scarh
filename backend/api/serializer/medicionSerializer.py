from rest_framework import serializers
from ..models import Medicion, Limnigrafo
from django.utils import timezone
from django.utils.dateparse import parse_datetime


def validar_datos_medicion(attrs, *, check_duplicates=True):
    limnigrafo = attrs.get('limnigrafo')
    fecha_hora = attrs.get('fecha_hora')
    idempotency_key = attrs.get('idempotency_key')
    altura_agua = attrs.get('altura_agua')
    presion = attrs.get('presion')
    temperatura = attrs.get('temperatura')
    nivel_de_bateria = attrs.get('nivel_de_bateria')

    if idempotency_key is not None:
        idempotency_key = idempotency_key.strip()
        attrs['idempotency_key'] = idempotency_key or None

    if altura_agua is not None and altura_agua < 0:
        raise serializers.ValidationError({
            'altura_agua': 'La altura del agua no puede ser negativa.'
        })

    if presion is not None and presion <= 0:
        raise serializers.ValidationError({
            'presion': 'La presión debe ser mayor a cero.'
        })

    if temperatura is not None and (temperatura < -100 or temperatura > 100):
        raise serializers.ValidationError({
            'temperatura': 'La temperatura está fuera del rango físico permitido.'
        })

    if nivel_de_bateria is not None and nivel_de_bateria < 0:
        raise serializers.ValidationError({
            'nivel_de_bateria': 'El nivel de batería no puede ser negativo.'
        })

    if check_duplicates and limnigrafo is not None and fecha_hora is not None:
        existe_misma_medicion = Medicion.objects.filter(
            limnigrafo=limnigrafo,
            fecha_hora=fecha_hora,
        ).exists()
        if existe_misma_medicion:
            raise serializers.ValidationError({
                'non_field_errors': ['Ya existe una medición para este limnígrafo en esa fecha y hora.']
            })

    if check_duplicates and limnigrafo is not None and attrs.get('idempotency_key'):
        existe_misma_idempotencia = Medicion.objects.filter(
            limnigrafo=limnigrafo,
            idempotency_key=attrs['idempotency_key'],
        ).exists()
        if existe_misma_idempotencia:
            raise serializers.ValidationError({
                'idempotency_key': ['Ya se procesó una medición con esta clave de idempotencia para este limnígrafo.']
            })

    return attrs


class MedicionImportRowSerializer(serializers.Serializer):
    row_number = serializers.IntegerField(min_value=1)
    limnigrafo_id = serializers.IntegerField(required=False, allow_null=True)
    fecha_hora = serializers.CharField()
    altura_agua = serializers.FloatField(required=False, allow_null=True)
    presion = serializers.FloatField(required=False, allow_null=True)
    temperatura = serializers.FloatField(required=False, allow_null=True)
    nivel_de_bateria = serializers.FloatField(required=False, allow_null=True)


class MedicionImportPayloadSerializer(serializers.Serializer):
    file_name = serializers.CharField()
    fuente = serializers.ChoiceField(choices=['import_csv', 'import_json'])
    fallback_limnigrafo_id = serializers.IntegerField(required=False, allow_null=True)
    rows = MedicionImportRowSerializer(many=True)


def normalizar_fecha_importacion(raw_fecha_hora):
    parsed = parse_datetime(raw_fecha_hora)
    if parsed is None:
        raise serializers.ValidationError('La fecha y hora no tiene un formato válido.')

    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, timezone.get_current_timezone())

    return parsed


class MedicionSerializer(serializers.ModelSerializer):
    limnigrafo = serializers.PrimaryKeyRelatedField(
        queryset=Limnigrafo.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Medicion
        fields = [
            'id',
            'fecha_hora',
            'altura_agua',
            'presion',
            'temperatura',
            'nivel_de_bateria',
            'idempotency_key',
            'fuente',
            'limnigrafo',
        ]
        read_only_fields = ['id']
        validators = []  # Evita que el UniqueTogetherValidator automático haga requerido el campo limnígrafo

    def validate(self, attrs):
        request = self.context.get('request')
        
        # 1. saca el id del limnigrafo a partir de la api key, en caso de cambiar como se genera, se tiene que cambiar este metodo
        api_key_limnigrafo = None
        if request:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Api-Key '):
                key = auth_header.split(' ')[1]
                from rest_framework_api_key.models import APIKey
                try:
                    api_key_obj = APIKey.objects.get_from_key(key)
                    name = api_key_obj.name
                    # La clave tiene formato LMG-{id}_{codigo}_{desc}
                    if name.startswith("LMG-"):
                        limnigrafo_id = int(name.split("_")[0].split("-")[1])
                        api_key_limnigrafo = Limnigrafo.objects.get(id=limnigrafo_id)
                except (APIKey.DoesNotExist, Limnigrafo.DoesNotExist, ValueError, IndexError):
                    pass

        # 2. Validar/Asignar limnígrafo
        body_limnigrafo = attrs.get('limnigrafo')

        if api_key_limnigrafo:
            if body_limnigrafo and body_limnigrafo != api_key_limnigrafo:
                raise serializers.ValidationError({
                    "limnigrafo": "El limnígrafo enviado no coincide con la clave de API utilizada."
                })
            attrs['limnigrafo'] = api_key_limnigrafo
        else:
            # Si no es por API Key, se requiere limnígrafo para cargas manuales / de usuario
            if not body_limnigrafo:
                raise serializers.ValidationError({
                    "limnigrafo": "El campo limnígrafo es requerido."
                })

        # 3. Validar combinación única de limnígrafo y fecha_hora
        limnigrafo = attrs.get('limnigrafo')
        fecha_hora = attrs.get('fecha_hora')

        if limnigrafo and fecha_hora:
            query = Medicion.objects.filter(limnigrafo=limnigrafo, fecha_hora=fecha_hora)
            if self.instance:
                query = query.exclude(pk=self.instance.pk)
            if query.exists():
                raise serializers.ValidationError({
                    "fecha_hora": "Ya existe una medición para este limnígrafo en la fecha y hora especificadas.",
                    "non_field_errors": ["Ya existe una medición para este limnígrafo en esa fecha y hora."]
                })

        # 4. Validar clave de idempotencia
        idempotency_key = attrs.get('idempotency_key')
        if limnigrafo and idempotency_key:
            query = Medicion.objects.filter(limnigrafo=limnigrafo, idempotency_key=idempotency_key)
            if self.instance:
                query = query.exclude(pk=self.instance.pk)
            if query.exists():
                raise serializers.ValidationError({
                    "idempotency_key": "Ya se procesó una medición con esta clave de idempotencia para este limnígrafo."
                })

        # 5. Validar otros datos usando validar_datos_medicion (sin chequear duplicados)
        attrs = validar_datos_medicion(attrs, check_duplicates=False)

        return super().validate(attrs)

    def create(self, validated_data):
        user = self.context['request'].user if self.context.get('request') else None

        requested_fuente = validated_data.get('fuente')

        if user and user.is_authenticated:
            if requested_fuente in ('import_csv', 'import_json', 'manual'):
                validated_data['fuente'] = requested_fuente
            else:
                validated_data['fuente'] = 'manual'
        else:
            validated_data['fuente'] = 'automatico'

        if 'fecha_hora' not in validated_data or validated_data['fecha_hora'] is None:
            validated_data['fecha_hora'] = timezone.now()

        return Medicion.objects.create(**validated_data)

