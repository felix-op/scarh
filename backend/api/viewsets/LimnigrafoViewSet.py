from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Limnigrafo
from ..serializer import LimnigrafoSerializer, ConfiguracionLimnigrafoSerializer
from ..filters import LimnigrafoFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_api_key.models import APIKey
from ..permissions import LimnigrafosPermission
from ..utils.alertas import generar_alerta_cambio_estado
from ..utils.estado_limnigrafo import calcular_estado_limnigrafo
from ..utils.audit import (
    registrar_accion_auditoria_en_commit,
    construir_cambios_instancia,
    construir_descripcion_modificacion,
    obtener_nombre_ubicacion,
    sanitizar_auditoria,
)

class LimnigrafoPagination(PageNumberPagination):
    page_size = 10               
    page_size_query_param = 'limit' 
    max_page_size = 100 

class LimnigrafoViewSet(viewsets.ModelViewSet):
    queryset = Limnigrafo.objects.all().order_by('id')
    serializer_class = LimnigrafoSerializer
    permission_classes = [IsAuthenticated, LimnigrafosPermission]
    pagination_class = LimnigrafoPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = LimnigrafoFilter
    ordering_fields = ['id', 'codigo', 'estado', 'ultimo_mantenimiento', 'bateria_actual']
    ordering = ['id']

    def _refrescar_estados(self, limnigrafos):
        actualizados = []
        cambios_estado = []
        for limnigrafo in limnigrafos:
            estado_anterior = limnigrafo.estado
            nuevo_estado = calcular_estado_limnigrafo(limnigrafo)
            if nuevo_estado != limnigrafo.estado:
                limnigrafo.estado = nuevo_estado
                actualizados.append(limnigrafo)
                cambios_estado.append((limnigrafo, estado_anterior, nuevo_estado))

        if actualizados:
            Limnigrafo.objects.bulk_update(actualizados, ["estado"])
            for limnigrafo, estado_anterior, nuevo_estado in cambios_estado:
                generar_alerta_cambio_estado(
                    limnigrafo=limnigrafo,
                    estado_anterior=estado_anterior,
                    nuevo_estado=nuevo_estado,
                )

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
        estado_anterior = instance.estado
        nuevo_estado = calcular_estado_limnigrafo(instance)
        if nuevo_estado != instance.estado:
            instance.estado = nuevo_estado
            instance.save(update_fields=["estado"])
            generar_alerta_cambio_estado(
                limnigrafo=instance,
                estado_anterior=estado_anterior,
                nuevo_estado=nuevo_estado,
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        limnigrafo = serializer.save()
        registrar_accion_auditoria_en_commit(
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
        limnigrafo_original = serializer.instance
        ubicacion_anterior = limnigrafo_original.ubicacion
        cambios = construir_cambios_instancia(
            limnigrafo_original,
            serializer.validated_data,
        )
        limnigrafo = serializer.save()
        ubicacion_nueva = limnigrafo.ubicacion

        cambio_ubicacion = next(
            (cambio for cambio in cambios if cambio["field"] == "ubicacion"),
            None,
        )

        if cambio_ubicacion is not None:
            if ubicacion_anterior is None and ubicacion_nueva is not None:
                descripcion = f"Asignó una nueva ubicación al limnígrafo '{limnigrafo.codigo}'."
            elif ubicacion_anterior is not None and ubicacion_nueva is None:
                descripcion = f"Quitó la ubicación del limnígrafo '{limnigrafo.codigo}'."
            else:
                descripcion = f"Reasignó la ubicación del limnígrafo '{limnigrafo.codigo}'."
        else:
            descripcion = construir_descripcion_modificacion(
                f"Modificó el limnígrafo '{limnigrafo.codigo}'.",
                cambios,
            )

        metadata = {
            "codigo": limnigrafo.codigo,
            "changes": cambios,
        }
        if cambio_ubicacion is not None:
            metadata["ubicacion_anterior"] = obtener_nombre_ubicacion(ubicacion_anterior)
            metadata["ubicacion_nueva"] = obtener_nombre_ubicacion(ubicacion_nueva)
            metadata["ubicacion_anterior_id"] = getattr(ubicacion_anterior, "id", None)
            metadata["ubicacion_nueva_id"] = getattr(ubicacion_nueva, "id", None)

        registrar_accion_auditoria_en_commit(
            request=self.request,
            tipo_accion="modified",
            entidad="Limnígrafo",
            entidad_id=limnigrafo.id,
            descripcion=descripcion,
            metadata=sanitizar_auditoria(metadata),
        )

    def perform_destroy(self, instance):
        limnigrafo_id = instance.id
        codigo = instance.codigo
        instance.delete()

        registrar_accion_auditoria_en_commit(
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

        registrar_accion_auditoria_en_commit(
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

    @action(detail=True, methods=['get', 'put', 'patch'], url_path='configuracion', serializer_class=ConfiguracionLimnigrafoSerializer)
    def configuracion(self, request, pk=None):
        limnigrafo = self.get_object()
        configuracion = getattr(limnigrafo, 'configuracion', None)
        if not configuracion:
            from ..models import ConfiguracionLimnigrafo
            configuracion = ConfiguracionLimnigrafo.objects.create(limnigrafo=limnigrafo)
        
        if request.method == 'GET':
            serializer = self.get_serializer(configuracion)
            return Response(serializer.data)
            
        elif request.method in ['PUT', 'PATCH']:
            partial = (request.method == 'PATCH')
            serializer = self.get_serializer(configuracion, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            registrar_accion_auditoria_en_commit(
                request=request,
                tipo_accion="modified",
                entidad="Configuración Limnígrafo",
                entidad_id=configuracion.id,
                descripcion=f"Modificó la configuración del limnígrafo '{limnigrafo.codigo}'.",
                metadata={
                    "codigo": limnigrafo.codigo,
                    "limnigrafo_id": limnigrafo.id,
                    "changes": serializer.validated_data,
                },
            )
            return Response(serializer.data)
