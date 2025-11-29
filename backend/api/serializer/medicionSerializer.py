from rest_framework import serializers
from ..models import Medicion
from django.utils import timezone

class MedicionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicion
        fields = [
            'id',
            'fecha_hora',
            'altura',
            'presion',
            'temperatura',
            'nivel_de_bateria',
            'fuente',
            'limnigrafo',
        ]
        read_only_fields = ['id', 'fuente'] 
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        if user and user.is_authenticated:
            validated_data['fuente'] = 'manual'
        else:
            validated_data['fuente'] = 'automatico'
        if 'fecha_hora' not in validated_data or validated_data['fecha_hora'] is None:
            validated_data['fecha_hora'] = timezone.now()

        return Medicion.objects.create(**validated_data)