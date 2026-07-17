import django_filters
from django.db.models import CharField, Q
from django.db.models.functions import Cast
from .models import Usuario, Limnigrafo, Medicion

class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    pass

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
    ultima_conexion_desde = django_filters.DateTimeFilter(field_name='ultima_conexion', lookup_expr='gte')
    ultima_conexion_hasta = django_filters.DateTimeFilter(field_name='ultima_conexion', lookup_expr='lte')

    class Meta:
        model = Limnigrafo
        fields = ['estado', 'ultima_conexion_desde', 'ultima_conexion_hasta']

    def filter_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(codigo__icontains=value) |
                Q(descripcion__icontains=value)
            )
        return queryset

class MedicionFilter(django_filters.FilterSet):
    limnigrafo = NumberInFilter(field_name='limnigrafo__id', lookup_expr='in')
    fecha_desde = django_filters.DateTimeFilter(field_name='fecha_hora', lookup_expr='gte')
    fecha_hasta = django_filters.DateTimeFilter(field_name='fecha_hora', lookup_expr='lte')
    fuente = django_filters.CharFilter(field_name='fuente', lookup_expr='iexact')
    search = django_filters.CharFilter(method='filter_search', label='Búsqueda general (limnígrafo, fuente y valores)')

    class Meta:
        model = Medicion
        fields = ['limnigrafo', 'fuente']

    def filter_search(self, queryset, name, value):
        search_value = (value or '').strip()
        if not search_value:
            return queryset

        queryset = queryset.annotate(
            id_text=Cast('id', output_field=CharField()),
            fecha_hora_text=Cast('fecha_hora', output_field=CharField()),
            altura_agua_text=Cast('altura_agua', output_field=CharField()),
            presion_text=Cast('presion', output_field=CharField()),
            temperatura_text=Cast('temperatura', output_field=CharField()),
            nivel_de_bateria_text=Cast('nivel_de_bateria', output_field=CharField()),
        )

        return queryset.filter(
            Q(id_text__icontains=search_value) |
            Q(limnigrafo__codigo__icontains=search_value) |
            Q(limnigrafo__descripcion__icontains=search_value) |
            Q(fuente__icontains=search_value) |
            Q(fecha_hora_text__icontains=search_value) |
            Q(altura_agua_text__icontains=search_value) |
            Q(presion_text__icontains=search_value) |
            Q(temperatura_text__icontains=search_value) |
            Q(nivel_de_bateria_text__icontains=search_value)
        )
