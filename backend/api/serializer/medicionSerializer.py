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
            'fuente',
            'limnigrafo',
        ]
        read_only_fields = ['id']

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
