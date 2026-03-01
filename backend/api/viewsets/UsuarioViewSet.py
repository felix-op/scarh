from rest_framework import viewsets
from ..serializer import UsuarioSerializer, ChangePasswordSerializer
from ..models import Usuario
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from ..utils.audit import (
    registrar_accion_auditoria,
    construir_cambios_instancia,
    construir_descripcion_modificacion,
)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

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
