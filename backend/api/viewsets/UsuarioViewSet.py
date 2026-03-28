from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..serializer import UsuarioSerializer, ChangePasswordSerializer
from ..models import Usuario, Rol
from ..filters import UsuarioFilter
from ..definicionRoles import PREDEFINED_ROLE_NAMES
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from ..permissions import UsuariosPermission
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from ..utils.audit import (
    registrar_accion_auditoria,
    construir_cambios_instancia,
    construir_descripcion_modificacion,
)
from django.contrib.auth.hashers import make_password
class UsuarioPagination(PageNumberPagination):
    page_size = 10               
    page_size_query_param = 'limit' 
    max_page_size = 100 

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('id')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, UsuariosPermission]
    pagination_class = UsuarioPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = UsuarioFilter
    ordering_fields = ['id', 'first_name', 'last_name', 'username', 'email']
    ordering = ['id']

    def perform_create(self, serializer):
        usuario = serializer.save()
        registrar_accion_auditoria(
            request=self.request,
            tipo_accion="created",
            entidad="Usuario",
            entidad_id=usuario.id,
            descripcion=f"Creó el usuario '{usuario.username}'.",
            metadata={
                "target_username": usuario.username,
            },
        )

    def perform_update(self, serializer):
        cambios = construir_cambios_instancia(
            serializer.instance,
            serializer.validated_data,
            campos_excluidos={"password"},
        )
        usuario = serializer.save()

        descripcion = construir_descripcion_modificacion(
            f"Modificó el usuario '{usuario.username}'.",
            cambios,
        )

        registrar_accion_auditoria(
            request=self.request,
            tipo_accion="modified",
            entidad="Usuario",
            entidad_id=usuario.id,
            descripcion=descripcion,
            metadata={
                "target_username": usuario.username,
                "changes": cambios,
            },
        )

    def perform_destroy(self, instance):
        usuario_id = instance.id
        username = instance.username
        instance.delete()

        registrar_accion_auditoria(
            request=self.request,
            tipo_accion="deleted",
            entidad="Usuario",
            entidad_id=usuario_id,
            descripcion=f"Eliminó el usuario '{username}'.",
            metadata={
                "target_username": username,
            },
        )

    @extend_schema(request=ChangePasswordSerializer, responses={200: {"description": "Contraseña actualizada correctamente"}})
    @action(detail=True, methods=['post'], url_path='cambiar-password')
    def cambiar_password(self, request, pk=None):
        user = self.get_object()
        # Pasamos el usuario objetivo al contexto para validar SU contraseña
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request, 'target_user': user})
        
        if serializer.is_valid():
            user.set_password(serializer.validated_data['password_nueva'])
            user.save()
            return Response({"message": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'], url_path='roles')
    def asignar_roles(self, request, pk=None):
        """Endpoint PUT /usuarios/{id}/roles/ para modificar roles de un usuario."""
        usuario = self.get_object()
        
        # Validar que venga el campo 'roles'
        roles_nombres = request.data.get('roles', None)
        if roles_nombres is None:
            return Response(
                {"error": "El campo 'roles' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que sea una lista
        if not isinstance(roles_nombres, list):
            return Response(
                {"error": "El campo 'roles' debe ser una lista de strings."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que todos los roles sean predefinidos
        roles_set = set(roles_nombres)
        roles_invalidos = roles_set - PREDEFINED_ROLE_NAMES
        if roles_invalidos:
            return Response(
                {"error": f"Roles inválidos: {sorted(roles_invalidos)}. Solo se permiten roles predefinidos."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener los objetos Rol de la base de datos
        roles_objetos = Rol.objects.filter(nombre__in=roles_nombres)
        
        # Validar que todos los roles existan en la DB
        if roles_objetos.count() != len(roles_set):
            roles_encontrados = set(roles_objetos.values_list('nombre', flat=True))
            roles_faltantes = roles_set - roles_encontrados
            return Response(
                {"error": f"Roles no encontrados en la base de datos: {sorted(roles_faltantes)}. Ejecutá: python manage.py loaddata roles.json"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Guardar roles anteriores para auditoría
        roles_anteriores = sorted(set(usuario.roles.values_list('nombre', flat=True)))
        
        # Reemplazar roles del usuario
        usuario.roles.set(roles_objetos)
        
        # Obtener nuevos roles
        roles_nuevos = sorted(set(usuario.roles.values_list('nombre', flat=True)))
        
        # Registrar en auditoría
        registrar_accion_auditoria(
            request=self.request,
            tipo_accion="modified",
            entidad="Usuario",
            entidad_id=usuario.id,
            descripcion=f"Modificó los roles del usuario '{usuario.username}'.",
            metadata={
                "target_username": usuario.username,
                "roles_anteriores": roles_anteriores,
                "roles_nuevos": roles_nuevos,
            },
        )
        
        return Response(
            {
                "message": "Roles actualizados correctamente.",
                "roles": roles_nuevos
            },
            status=status.HTTP_200_OK
        )
