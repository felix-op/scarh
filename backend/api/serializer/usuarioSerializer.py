from rest_framework import serializers
from ..models import Usuario, Rol
from .rolSerializer import RolSerializer

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
    roles = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Rol.objects.all(), 
        required=False
    )

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

    def to_representation(self, instance):
        # Default serialization gets us the list of IDs from the PrimaryKeyRelatedField
        # We override this to return the fully serialized Rol objects instead.
        representation = super().to_representation(instance)
        
        if hasattr(instance, 'roles') and instance.pk is not None:
            roles_queryset = instance.roles.all()
            representation['roles'] = RolSerializer(roles_queryset, many=True).data
        else:
            representation['roles'] = []
            
        return representation

    def create(self, validated_data):
        if 'password' not in validated_data:
            raise serializers.ValidationError(
                {"contraseña": "Este campo es requerido."}
            )

        password = validated_data.pop('password')
        roles = validated_data.pop('roles', [])

        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()

        if roles:
            user.roles.set(roles)

        return user

    def update(self, instance, validated_data):
        # Eliminamos password de validated_data por seguridad si llegara a venir
        validated_data.pop('password', None)
        roles = validated_data.pop('roles', None)
        
        user = super().update(instance, validated_data)
        
        if roles is not None:
            user.roles.set(roles)
            
        return user
