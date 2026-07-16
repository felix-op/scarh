from rest_framework import serializers
from ..models import Medicion
from django.utils import timezone

class MedicionSerializer(serializers.ModelSerializer):

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

    def validate(self, attrs):
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

        if limnigrafo is not None and fecha_hora is not None:
            existe_misma_medicion = Medicion.objects.filter(
                limnigrafo=limnigrafo,
                fecha_hora=fecha_hora,
            ).exists()
            if existe_misma_medicion:
                raise serializers.ValidationError({
                    'non_field_errors': ['Ya existe una medición para este limnígrafo en esa fecha y hora.']
                })

        if limnigrafo is not None and attrs.get('idempotency_key'):
            existe_misma_idempotencia = Medicion.objects.filter(
                limnigrafo=limnigrafo,
                idempotency_key=attrs['idempotency_key'],
            ).exists()
            if existe_misma_idempotencia:
                raise serializers.ValidationError({
                    'idempotency_key': ['Ya se procesó una medición con esta clave de idempotencia para este limnígrafo.']
                })

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user

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
