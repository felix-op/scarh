from rest_framework import viewsets, mixins, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from ..models import Medicion
from ..serializer import MedicionSerializer
from ..permissions import IsAutomaticOrManual
from ..filters import MedicionFilter
from ..utils.audit import registrar_accion_auditoria
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
    permission_classes = [IsAutomaticOrManual] 
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = MedicionFilter
    ordering_fields = ['fecha_hora', 'altura_agua', 'nivel_de_bateria']
    ordering = ['-fecha_hora']

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    
    def perform_create(self, serializer):
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

        if medicion_instance.fuente == "manual":
            registrar_accion_auditoria(
                request=self.request,
                tipo_accion="manual_data_load",
                entidad="Métrica",
                entidad_id=medicion_instance.id,
                descripcion=f"Cargó manualmente datos para el limnígrafo '{limnigrafo.codigo}'.",
                metadata={
                    "limnigrafo_id": limnigrafo.id,
                    "limnigrafo_codigo": limnigrafo.codigo,
                    "medicion_id": medicion_instance.id,
                    "fecha_hora_medicion": medicion_instance.fecha_hora.isoformat(),
                },
            )
