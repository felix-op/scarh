from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Limnigrafo
from ..serializer import LimnigrafoSerializer
from ..filters import LimnigrafoFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_api_key.models import APIKey
from ..utils.estado_limnigrafo import calcular_estado_limnigrafo
from ..utils.audit import (
    registrar_accion_auditoria,
    construir_cambios_instancia,
    construir_descripcion_modificacion,
)

class LimnigrafoPagination(PageNumberPagination):
    page_size = 10               
    page_size_query_param = 'limit' 
    max_page_size = 100 

class LimnigrafoViewSet(viewsets.ModelViewSet):
    queryset = Limnigrafo.objects.all().order_by('id')
    serializer_class = LimnigrafoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LimnigrafoPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = LimnigrafoFilter
    ordering_fields = ['id', 'codigo', 'estado', 'ultimo_mantenimiento', 'bateria_actual']
    ordering = ['id']

    def _refrescar_estados(self, limnigrafos):
        actualizados = []
        for limnigrafo in limnigrafos:
            nuevo_estado = calcular_estado_limnigrafo(limnigrafo)
            if nuevo_estado != limnigrafo.estado:
                limnigrafo.estado = nuevo_estado
                actualizados.append(limnigrafo)

        if actualizados:
            Limnigrafo.objects.bulk_update(actualizados, ["estado"])

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            self._refrescar_estados(page)
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        items = list(queryset)
        self._refrescar_estados(items)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        nuevo_estado = calcular_estado_limnigrafo(instance)
        if nuevo_estado != instance.estado:
            instance.estado = nuevo_estado
            instance.save(update_fields=["estado"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        limnigrafo = serializer.save()
        registrar_accion_auditoria(
            request=self.request,
            tipo_accion="created",
            entidad="Limnígrafo",
            entidad_id=limnigrafo.id,
            descripcion=f"Creó el limnígrafo '{limnigrafo.codigo}'.",
            metadata={
                "codigo": limnigrafo.codigo,
            },
        )

    def perform_update(self, serializer):
        cambios = construir_cambios_instancia(
            serializer.instance,
            serializer.validated_data,
        )
        limnigrafo = serializer.save()

        descripcion = construir_descripcion_modificacion(
            f"Modificó el limnígrafo '{limnigrafo.codigo}'.",
            cambios,
        )

        registrar_accion_auditoria(
            request=self.request,
            tipo_accion="modified",
            entidad="Limnígrafo",
            entidad_id=limnigrafo.id,
            descripcion=descripcion,
            metadata={
                "codigo": limnigrafo.codigo,
                "changes": cambios,
            },
        )

    def perform_destroy(self, instance):
        limnigrafo_id = instance.id
        codigo = instance.codigo
        instance.delete()

        registrar_accion_auditoria(
            request=self.request,
            tipo_accion="deleted",
            entidad="Limnígrafo",
            entidad_id=limnigrafo_id,
            descripcion=f"Eliminó el limnígrafo '{codigo}'.",
            metadata={
                "codigo": codigo,
            },
        )

    @action(detail=True, methods=['post'])
    def generate_key(self, request, pk=None):
        limnigrafo = self.get_object()
        key_name_prefix = f"LMG-{limnigrafo.id}"
        APIKey.objects.filter(name__startswith=key_name_prefix).delete()
        
        full_key_name = f"{key_name_prefix}_{limnigrafo.codigo}_{limnigrafo.descripcion[:10]}"
        key_obj, key_secret = APIKey.objects.create_key(name=full_key_name)

        registrar_accion_auditoria(
            request=request,
            tipo_accion="modified",
            entidad="Limnígrafo",
            entidad_id=limnigrafo.id,
            descripcion=f"Regeneró la clave API del limnígrafo '{limnigrafo.codigo}'.",
            metadata={
                "codigo": limnigrafo.codigo,
                "key_prefix": key_obj.prefix,
                # Evento técnico: se conserva en auditoría, pero no se muestra en historial funcional.
                "visible_in_historial": False,
            },
        )
        
        return Response({
            "message": "Clave API rotada y generada exitosamente.",
            "limnigrafo_id": limnigrafo.id,
            "key_name": key_obj.name,
            "key_prefix": key_obj.prefix,
            "secret_key": key_secret,
            "warning": "GUARDE ESTA CLAVE. No se puede recuperar después de este momento."
        }, status=status.HTTP_201_CREATED)
