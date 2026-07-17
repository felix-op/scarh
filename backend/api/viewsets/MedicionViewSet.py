from rest_framework import viewsets, mixins, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from ..models import Medicion, Limnigrafo
from ..serializer import MedicionSerializer
from ..permissions import MedicionesPermissionWithAPIKey
from ..filters import MedicionFilter
from ..utils.audit import registrar_accion_auditoria_en_commit
from ..utils.alertas import generar_alertas_medicion
from ..utils.estado_limnigrafo import calcular_estado_limnigrafo

class MedicionPagination(PageNumberPagination):
    page_size = 50               
    page_size_query_param = 'limit' 
    max_page_size = 1000 

class MedicionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin, 
    viewsets.GenericViewSet
):
    queryset = Medicion.objects.all().order_by('-fecha_hora')
    serializer_class = MedicionSerializer
    pagination_class = MedicionPagination
    permission_classes = [MedicionesPermissionWithAPIKey] 
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = MedicionFilter
    ordering_fields = ['fecha_hora', 'altura_agua', 'nivel_de_bateria']
    ordering = ['-fecha_hora']

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    
    def perform_create(self, serializer):
        limnigrafo = serializer.validated_data["limnigrafo"]
        estado_anterior = limnigrafo.estado
        medicion_instance = serializer.save()
        limnigrafo = medicion_instance.limnigrafo
        
        # Actualizar batería actual solo si el sensor de batería funcionó
        # Si nivel_de_bateria es None (falla del sensor), mantener el último valor conocido
        if medicion_instance.nivel_de_bateria is not None:
            limnigrafo.bateria_actual = medicion_instance.nivel_de_bateria
        
        # Siempre actualizar última conexión con la marca temporal de la medición
        limnigrafo.ultima_conexion = medicion_instance.fecha_hora
        
        # Calcular estado operativo actual
        nuevo_estado = calcular_estado_limnigrafo(limnigrafo)
        limnigrafo.estado = nuevo_estado
        
        limnigrafo.save(update_fields=['bateria_actual', 'ultima_conexion', 'estado'])
        generar_alertas_medicion(medicion_instance, estado_anterior, nuevo_estado)

        if medicion_instance.fuente == "manual":
            registrar_accion_auditoria_en_commit(
                request=self.request,
                tipo_accion="manual_data_load",
                entidad="Medición",
                entidad_id=medicion_instance.id,
                descripcion=f"Cargó manualmente datos para el limnígrafo '{limnigrafo.codigo}'.",
                metadata={
                    "limnigrafo_id": limnigrafo.id,
                    "limnigrafo_codigo": limnigrafo.codigo,
                    "medicion_id": medicion_instance.id,
                    "fecha_hora_medicion": medicion_instance.fecha_hora.isoformat(),
                },
            )

    @action(detail=False, methods=["post"], url_path="import-summary")
    def import_summary(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "No autorizado."}, status=status.HTTP_401_UNAUTHORIZED)

        file_name = request.data.get("file_name")
        limnigrafo_id = request.data.get("limnigrafo_id")
        loaded_rows = request.data.get("loaded_rows")
        rejected_rows = request.data.get("rejected_rows")
        fuente = request.data.get("fuente")

        if not file_name or not isinstance(file_name, str):
            return Response({"error": "El campo 'file_name' es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        if limnigrafo_id in (None, ""):
            return Response({"error": "El campo 'limnigrafo_id' es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            limnigrafo_id = int(limnigrafo_id)
            loaded_rows = int(loaded_rows)
            rejected_rows = int(rejected_rows)
        except (TypeError, ValueError):
            return Response(
                {"error": "Los campos 'limnigrafo_id', 'loaded_rows' y 'rejected_rows' deben ser numéricos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if loaded_rows < 0 or rejected_rows < 0:
            return Response(
                {"error": "Los campos 'loaded_rows' y 'rejected_rows' no pueden ser negativos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        limnigrafo = Limnigrafo.objects.filter(id=limnigrafo_id).first()
        if limnigrafo is None:
            return Response({"error": "Limnígrafo no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        descripcion = (
            f"Importó {loaded_rows} mediciones desde '{file_name}' para el limnígrafo '{limnigrafo.codigo}'."
        )
        registrar_accion_auditoria_en_commit(
            request=request,
            tipo_accion="import_data_load",
            entidad="Medición",
            entidad_id=limnigrafo.id,
            descripcion=descripcion,
            metadata={
                "file_name": file_name,
                "fuente": fuente,
                "limnigrafo_id": limnigrafo.id,
                "limnigrafo_codigo": limnigrafo.codigo,
                "filas_cargadas": loaded_rows,
                "filas_rechazadas": rejected_rows,
            },
        )

        return Response(
            {
                "message": "Resumen de importación registrado correctamente.",
            },
            status=status.HTTP_201_CREATED,
        )
