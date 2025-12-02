from rest_framework import serializers

class EstadisticaInputSerializer(serializers.Serializer):
    limnigrafos = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    atributo = serializers.ChoiceField(
        choices=['altura', 'presion', 'temperatura'],
        help_text="Opciones disponibles: altura, presion, temperatura"
    )
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField()

    def validate(self, data):
        if data['fecha_inicio'] > data['fecha_fin']:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        return data

class EstadisticaOutputSerializer(serializers.Serializer):
    id = serializers.IntegerField(allow_null=True)
    maximo = serializers.FloatField()
    minimo = serializers.FloatField()
    atributo = serializers.CharField()
    desvio_estandar = serializers.FloatField()
    percentil_90 = serializers.FloatField()
