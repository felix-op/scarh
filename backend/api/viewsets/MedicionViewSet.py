from rest_framework import viewsets, mixins, status
from rest_framework.permissions import AllowAny 
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
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
        
        limnigrafo.bateria_actual = medicion_instance.nivel_de_bateria
        limnigrafo.ultima_conexion = medicion_instance.fecha_hora
        
        limnigrafo.save(update_fields=['bateria_actual', 'ultima_conexion'])
