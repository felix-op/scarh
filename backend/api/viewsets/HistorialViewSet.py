from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError
from django.utils.dateparse import parse_date
from ..models import Limnigrafo
from ..serializer import HistorialListSerializer, HistorialDetailSerializer
from rest_framework.permissions import IsAuthenticated

class HistorialPagination(PageNumberPagination):
    page_size = 50               
    page_size_query_param = 'limit' 
    max_page_size = 1000          

class HistorialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Limnigrafo.history.all().order_by('-history_date')
    pagination_class = HistorialPagination
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HistorialDetailSerializer
        return HistorialListSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        model = self.request.query_params.get('model')
        if model and model.lower() not in ['limnígrafo', 'limnigrafo']:
            return queryset.none()

        type_param = self.request.query_params.get('type')
        if type_param:
            mapa_inverso = {
                'created': '+', 
                'modified': '~', 
                'deleted': '-'
            }
            simbolo = mapa_inverso.get(type_param.lower())
            if simbolo:
                queryset = queryset.filter(history_type=simbolo)

        user_id = self.request.query_params.get('usuario')
        if user_id:
            queryset = queryset.filter(history_user_id=user_id)

        desde = self.request.query_params.get('desde')
        hasta = self.request.query_params.get('hasta')

        if desde:
            fecha_dt = parse_date(desde)
            if fecha_dt:
                queryset = queryset.filter(history_date__date__gte=fecha_dt)
        
        if hasta:
            fecha_dt = parse_date(hasta)
            if fecha_dt:
                queryset = queryset.filter(history_date__date__lte=fecha_dt)

        return queryset