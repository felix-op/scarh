from rest_framework import serializers

from ..models import Usuario


class PerfilSerializer(serializers.ModelSerializer):
    """
    Datos propios del usuario autenticado, para `/usuarios/me/`.

    **No reutiliza `UsuarioSerializer` a propósito.** Ese permite escribir `estado`
    (`is_active`) y acepta `contraseña`, y acá el usuario se está editando a sí
    mismo: nadie debería poder desactivar su propia cuenta desde el perfil, ni
    cambiar la contraseña por una vía que no pide la actual.

    Lo editable es sólo información personal. `roles` y `estado` se exponen para
    mostrarlos pero son de sólo lectura; cambiarlos sigue siendo tarea de
    `/usuarios/{id}/`, que exige el rol `usuarios-editar`.

    @property {int} id Identificador del usuario.
    @property {str} nombre_usuario Nombre de usuario.
    @property {str} [legajo] Legajo administrativo.
    @property {str} email Correo electrónico.
    @property {str} first_name Nombre.
    @property {str} last_name Apellido.
    @property {bool} estado Si la cuenta está activa. Sólo lectura.
    @property {list[str]} roles Roles asignados. Sólo lectura.
    """

    nombre_usuario = serializers.CharField(source='username')
    estado = serializers.BooleanField(source='is_active', read_only=True)
    roles = serializers.SerializerMethodField()

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
            'roles',
        ]
        extra_kwargs = {
            'email': {'required': True},
        }

    def get_roles(self, instance):
        return sorted(set(instance.roles.values_list('nombre', flat=True)))

    def validate_legajo(self, value):
        if value == "" or value is None:
            return None
        return value

    def validate(self, attrs):
        # El cambio de contraseña no pasa por acá: exige verificar la actual, y este
        # endpoint no la pide. Se rechaza explícitamente en lugar de ignorarlo en
        # silencio, para que un cliente mal escrito no crea que la cambió.
        if 'contraseña' in self.initial_data or 'password' in self.initial_data:
            raise serializers.ValidationError({
                "contraseña": "La contraseña no se cambia desde el perfil."
            })
        return attrs
