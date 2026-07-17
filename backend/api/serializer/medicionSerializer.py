from rest_framework import serializers
from ..models import Medicion, Limnigrafo
from django.utils import timezone

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
                    "fecha_hora": "Ya existe una medición para este limnígrafo en la fecha y hora especificadas."
                })

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

