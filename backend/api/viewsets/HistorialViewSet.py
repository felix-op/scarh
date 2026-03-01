from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from django.utils.dateparse import parse_date
from ..models import Accion
from ..serializer import HistorialListSerializer, HistorialDetailSerializer
from rest_framework.permissions import IsAuthenticated

class HistorialPagination(PageNumberPagination):
    page_size = 50               
    page_size_query_param = 'limit' 
    max_page_size = 1000          

class HistorialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Accion.objects.select_related("usuario").all().order_by("-fecha_hora")
    pagination_class = HistorialPagination
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HistorialDetailSerializer
        return HistorialListSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        model = self.request.query_params.get("model")
        if model:
            model_map = {
                "usuario": "Usuario",
                "limnigrafo": "Limnígrafo",
                "limnígrafo": "Limnígrafo",
                "metrica": "Métrica",
                "métrica": "Métrica",
            }
            model_normalizado = model.strip().lower()
            model_filtrado = model_map.get(model_normalizado, model.strip())
            queryset = queryset.filter(entidad__iexact=model_filtrado)

        type_param = self.request.query_params.get("type")
        if type_param:
            mapa_tipo = {
                "created": "created",
                "creacion": "created",
                "modificacion": "modified",
                "modified": "modified",
                "eliminacion": "deleted",
                "deleted": "deleted",
                "manual_data_load": "manual_data_load",
                "carga_manual_de_datos": "manual_data_load",
            }
            tipo = mapa_tipo.get(type_param.lower().strip())
            if tipo:
                queryset = queryset.filter(tipo_accion=tipo)

        usuario = self.request.query_params.get("usuario")
        if usuario:
            if usuario.isdigit():
                queryset = queryset.filter(usuario_id=int(usuario))
            else:
                queryset = queryset.filter(usuario__username__iexact=usuario.strip())

        desde = self.request.query_params.get("desde")
        hasta = self.request.query_params.get("hasta")

        if desde:
            fecha_dt = parse_date(desde)
            if fecha_dt:
                queryset = queryset.filter(fecha_hora__date__gte=fecha_dt)
        
        if hasta:
            fecha_dt = parse_date(hasta)
            if fecha_dt:
                queryset = queryset.filter(fecha_hora__date__lte=fecha_dt)

        return queryset
