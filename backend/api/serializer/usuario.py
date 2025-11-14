from rest_framework import serializers
from ..models import Usuario 

class UsuarioSerializer(serializers.ModelSerializer):

    nombre_usuario = serializers.CharField(source='username')

    estado = serializers.BooleanField(source='is_active', required=False)

    contraseña = serializers.CharField(
        write_only=True,    
        source='password',   
        style={'input_type': 'password'},
        required=False
    )

    class Meta:
        model = Usuario
        fields = [
            'id',
            'nombre_usuario',
            'email',
            'first_name',
            'last_name',
            'estado',
            'contraseña',
        ]
        extra_kwargs = {
            'email': {'required': True},
        }

    def create(self, validated_data):
        if 'password' not in validated_data:
            raise serializers.ValidationError(
                {"contraseña": "Este campo es requerido."}
            )

        password = validated_data.pop('password')

        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        instance = super().update(instance, validated_data)

        if password:
            instance.set_password(password)
            instance.save()

        return instance
