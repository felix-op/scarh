import django_filters
from django.db.models import Q
from .models import Usuario, Limnigrafo, Medicion

class UsuarioFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search', label='Búsqueda general (username, email, nombres, legajo)')
    is_active = django_filters.BooleanFilter(field_name='is_active')
    class Meta:
        model = Usuario
        fields = ['is_active']

    def filter_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(username__icontains=value) |
                Q(email__icontains=value) |
                Q(first_name__icontains=value) |
                Q(last_name__icontains=value) |
                Q(legajo__icontains=value)
            )
        return queryset

class LimnigrafoFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search', label='Búsqueda general (código, descripción)')
    estado = django_filters.CharFilter(field_name='estado', lookup_expr='iexact')

    class Meta:
        model = Limnigrafo
        fields = ['estado']

    def filter_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(codigo__icontains=value) |
                Q(descripcion__icontains=value)
            )
        return queryset

class MedicionFilter(django_filters.FilterSet):
    limnigrafo = django_filters.NumberFilter(field_name='limnigrafo__id')
    fecha_desde = django_filters.DateTimeFilter(field_name='fecha_hora', lookup_expr='gte')
    fecha_hasta = django_filters.DateTimeFilter(field_name='fecha_hora', lookup_expr='lte')
    fuente = django_filters.CharFilter(field_name='fuente', lookup_expr='iexact')

    class Meta:
        model = Medicion
        fields = ['limnigrafo', 'fuente']
