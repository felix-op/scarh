from rest_framework import serializers

class SolicitarRecuperacionSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ValidarCodigoRecuperacionSerializer(serializers.Serializer):
    email = serializers.EmailField()
    codigo = serializers.CharField(max_length=6, min_length=6)
