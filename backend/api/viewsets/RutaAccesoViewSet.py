import os

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import RutaAcceso
from ..permissions import LimnigrafosPermission
from ..serializer import RutaAccesoSerializer
from ..utils.audit import (
    construir_cambios_instancia,
    construir_descripcion_modificacion,
    registrar_accion_auditoria,
)


class RutaAccesoPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit'
    max_page_size = 100


class RutaAccesoViewSet(viewsets.ModelViewSet):
    queryset = RutaAcceso.objects.select_related('limnigrafo', 'ubicacion').all().order_by('id')
    serializer_class = RutaAccesoSerializer
    permission_classes = [IsAuthenticated, LimnigrafosPermission]
    pagination_class = RutaAccesoPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['id', 'nombre', 'tipo_acceso', 'distancia_km', 'creado_en', 'actualizado_en']
    ordering = ['id']

    def get_queryset(self):
        queryset = super().get_queryset()
        limnigrafo_id = self.request.query_params.get('limnigrafo')
        if limnigrafo_id:
            queryset = queryset.filter(limnigrafo_id=limnigrafo_id)
        return queryset

    def perform_create(self, serializer):
        ruta = serializer.save()
        registrar_accion_auditoria(
            request=self.request,
            tipo_accion="created",
            entidad="Ruta de acceso",
            entidad_id=ruta.id,
            descripcion=f"Creó la ruta de acceso '{ruta.nombre}' para el limnígrafo '{ruta.limnigrafo}'.",
            metadata={
                "limnigrafo_id": ruta.limnigrafo_id,
                "formato_origen": ruta.formato_origen,
                "archivo": ruta.archivo_original.name if ruta.archivo_original else "",
            },
        )

    def perform_update(self, serializer):
        archivo_anterior = serializer.instance.archivo_original.name if serializer.instance.archivo_original else ""
        cambios = construir_cambios_instancia(
            serializer.instance,
            serializer.validated_data,
            campos_excluidos=['archivo_original', '_ruta_procesada'],
        )
        reemplaza_archivo = 'archivo_original' in serializer.validated_data
        ruta = serializer.save()

        if reemplaza_archivo:
            cambios.append({
                "field": "archivo_original",
                "old": archivo_anterior,
                "new": ruta.archivo_original.name if ruta.archivo_original else "",
            })
            if archivo_anterior and archivo_anterior != ruta.archivo_original.name:
                ruta.archivo_original.storage.delete(archivo_anterior)

        descripcion = construir_descripcion_modificacion(
            f"Modificó la ruta de acceso '{ruta.nombre}'.",
            cambios,
        )

        registrar_accion_auditoria(
            request=self.request,
            tipo_accion="modified",
            entidad="Ruta de acceso",
            entidad_id=ruta.id,
            descripcion=descripcion,
            metadata={
                "limnigrafo_id": ruta.limnigrafo_id,
                "changes": cambios,
                "archivo_reemplazado": reemplaza_archivo,
            },
        )

    def perform_destroy(self, instance):
        ruta_id = instance.id
        nombre = instance.nombre
        limnigrafo_id = instance.limnigrafo_id
        archivo = instance.archivo_original.name if instance.archivo_original else ""
        storage = instance.archivo_original.storage if instance.archivo_original else None

        instance.delete()
        if storage and archivo:
            storage.delete(archivo)

        registrar_accion_auditoria(
            request=self.request,
            tipo_accion="deleted",
            entidad="Ruta de acceso",
            entidad_id=ruta_id,
            descripcion=f"Eliminó la ruta de acceso '{nombre}'.",
            metadata={
                "limnigrafo_id": limnigrafo_id,
                "archivo": archivo,
            },
        )

    @action(detail=True, methods=['get'], url_path='descargar')
    def descargar(self, request, pk=None):
        ruta = get_object_or_404(self.get_queryset(), pk=pk)
        if not ruta.archivo_original:
            return Response(
                {"detail": "La ruta no tiene un archivo original asociado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        nombre = os.path.basename(ruta.archivo_original.name)
        return FileResponse(
            ruta.archivo_original.open('rb'),
            as_attachment=True,
            filename=nombre,
        )
