from rest_framework import serializers
from ..models import Usuario, Rol


class UsuarioSerializer(serializers.ModelSerializer):

    nombre_usuario = serializers.CharField(source='username')

    estado = serializers.BooleanField(source='is_active', required=False)

    contraseña = serializers.CharField(
        write_only=True,    
        source='password',   
        style={'input_type': 'password'},
        required=False
    )

    # For reading, we want the full object. For writing, we want a list of IDs.
    # To use the same name "roles" for both without conflicts, we use a PrimaryKeyRelatedField
    # for input, and override to_representation for output.
    roles = serializers.SerializerMethodField() #lo calcula como un metodo y devuelve string 

    class Meta:
        model = Usuario
        fields = [
            'id',
            'nombre_usuario',
            'legajo',
            'email',
            'first_name',
            'last_name',
            'estado',
            'contraseña',
            'roles',
        ]
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate_legajo(self, value):
        if value == "" or value is None:
            return None
        return value

    def get_roles(self, instance):
        if not instance.pk:
            return []
        return sorted(set(instance.roles.values_list('nombre', flat=True)))

    def create(self, validated_data):
        if 'password' not in validated_data:
            raise serializers.ValidationError(
                {"contraseña": "Este campo es requerido."}
            )
        password = validated_data.pop('password')
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance