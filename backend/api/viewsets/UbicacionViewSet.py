from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import Ubicacion
from ..permissions import UbicacionesPermission
from ..serializer import UbicacionSerializer, UbicacionOutputSerializer
from drf_spectacular.utils import extend_schema
from ..utils.audit import (
    registrar_accion_auditoria_en_commit,
    construir_cambios_instancia,
    construir_descripcion_modificacion,
)

@extend_schema(responses={200: UbicacionOutputSerializer(many=True)})
class UbicacionViewSet(viewsets.ModelViewSet):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [IsAuthenticated, UbicacionesPermission]

    def perform_create(self, serializer):
        ubicacion = serializer.save()
        registrar_accion_auditoria_en_commit(
            request=self.request,
            tipo_accion="created",
            entidad="Ubicación",
            entidad_id=ubicacion.id,
            descripcion=f"Creó la ubicación '{ubicacion.nombre}'.",
            metadata={
                "nombre": ubicacion.nombre,
                "latitud": ubicacion.latitud,
                "longitud": ubicacion.longitud,
            },
        )

    def perform_update(self, serializer):
        ubicacion_original = serializer.instance
        cambios = construir_cambios_instancia(
            ubicacion_original,
            serializer.validated_data,
        )
        ubicacion = serializer.save()
        descripcion = construir_descripcion_modificacion(
            f"Modificó la ubicación '{ubicacion.nombre}'.",
            cambios,
        )
        registrar_accion_auditoria_en_commit(
            request=self.request,
            tipo_accion="modified",
            entidad="Ubicación",
            entidad_id=ubicacion.id,
            descripcion=descripcion,
            metadata={
                "nombre": ubicacion.nombre,
                "changes": cambios,
            },
        )

    def perform_destroy(self, instance):
        ubicacion_id = instance.id
        nombre = instance.nombre
        instance.delete()
        registrar_accion_auditoria_en_commit(
            request=self.request,
            tipo_accion="deleted",
            entidad="Ubicación",
            entidad_id=ubicacion_id,
            descripcion=f"Eliminó la ubicación '{nombre}'.",
            metadata={
                "nombre": nombre,
            },
        )
