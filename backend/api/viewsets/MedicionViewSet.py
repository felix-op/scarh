from rest_framework import viewsets, mixins, status
from rest_framework.permissions import AllowAny 
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from datetime import datetime, timedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from ..models import Medicion
from ..serializer import MedicionSerializer
from ..models import Limnigrafo 
from ..permissions import IsAutomaticOrManual

class MedicionPagination(PageNumberPagination):
    page_size = 50               
    page_size_query_param = 'limit' 
    max_page_size = 1000 

class MedicionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin, 
    viewsets.GenericViewSet
):
    queryset = Medicion.objects.all().order_by('-fecha_hora')
    serializer_class = MedicionSerializer
    pagination_class = MedicionPagination
    
    permission_classes = [IsAutomaticOrManual] 

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='limnigrafo',
                description='ID del limnígrafo para filtrar las mediciones',
                required=False,
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        limnigrafo_id = self.request.query_params.get('limnigrafo')
        if limnigrafo_id:
            queryset = queryset.filter(limnigrafo_id=limnigrafo_id)
        return queryset
    
    def perform_create(self, serializer):
        medicion_instance = serializer.save()
        limnigrafo = medicion_instance.limnigrafo
        
        # Actualizar batería actual (valor enviado por el limnígrafo)
        limnigrafo.bateria_actual = medicion_instance.nivel_de_bateria
        limnigrafo.ultima_conexion = medicion_instance.fecha_hora
        
        # Calcular estado del limnígrafo
        nuevo_estado = self._calcular_estado(limnigrafo, medicion_instance.fecha_hora)
        limnigrafo.estado = nuevo_estado
        
        limnigrafo.save(update_fields=['bateria_actual', 'ultima_conexion', 'estado'])

    def _calcular_estado(self, limnigrafo, fecha_hora_medicion):
        """
        Calcula el estado del limnígrafo basándose en:
        1. Porcentaje de batería: (bateria_actual / bateria_max) * 100
        2. Tiempo sin conexión (comparado con tiempo_advertencia y tiempo_peligro)
        
        Estados:
        - 'fuera_de_servicio': batería <= bateria_min o tiempo > tiempo_peligro
        - 'peligro': batería crítica o tiempo > tiempo_peligro
        - 'advertencia': batería baja o tiempo > tiempo_advertencia
        - 'normal': todo OK
        """
        # Calcular porcentaje de batería
        bateria_critica = False
        bateria_baja = False
        
        if limnigrafo.bateria_actual is not None and limnigrafo.bateria_max > 0:
            # Calcular porcentaje: (actual / max) * 100
            porcentaje_bateria = (limnigrafo.bateria_actual / limnigrafo.bateria_max) * 100
            porcentaje_min = (limnigrafo.bateria_min / limnigrafo.bateria_max) * 100
            
            # Batería crítica: porcentaje <= porcentaje_min
            if porcentaje_bateria <= porcentaje_min:
                bateria_critica = True
            # Batería baja: porcentaje <= porcentaje_min + 10%
            elif porcentaje_bateria <= porcentaje_min + 10:
                bateria_baja = True
        
        # Verificar tiempo sin conexión
        tiempo_peligro_excedido = False
        tiempo_advertencia_excedido = False
        
        if limnigrafo.ultima_conexion:
            # Convertir tiempo_advertencia y tiempo_peligro a timedelta
            tiempo_transcurrido = timezone.now() - fecha_hora_medicion
            
            # Convertir TimeField a timedelta
            advertencia_delta = timedelta(
                hours=limnigrafo.tiempo_advertencia.hour,
                minutes=limnigrafo.tiempo_advertencia.minute,
                seconds=limnigrafo.tiempo_advertencia.second
            )
            
            peligro_delta = timedelta(
                hours=limnigrafo.tiempo_peligro.hour,
                minutes=limnigrafo.tiempo_peligro.minute,
                seconds=limnigrafo.tiempo_peligro.second
            )
            
            if tiempo_transcurrido > peligro_delta:
                tiempo_peligro_excedido = True
            elif tiempo_transcurrido > advertencia_delta:
                tiempo_advertencia_excedido = True
        
        # Determinar estado final (prioridad: fuera_de_servicio > peligro > advertencia > normal)
        if bateria_critica or tiempo_peligro_excedido:
            return 'fuera_de_servicio'
        elif bateria_baja or tiempo_advertencia_excedido:
            return 'advertencia'
        else:
            return 'normal'

