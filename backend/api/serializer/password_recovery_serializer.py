from rest_framework import serializers

class SolicitarRecuperacionSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ValidarCodigoRecuperacionSerializer(serializers.Serializer):
    email = serializers.EmailField()
    codigo = serializers.CharField(max_length=6, min_length=6)

class NuevaPasswordRecoverySerializer(serializers.Serializer):
    password = serializers.CharField(required=True, min_length=8)
