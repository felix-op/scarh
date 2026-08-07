from django.db.models import F
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..filters import AlertaFilter
from ..models import UsuarioNotificacion
from ..serializer import AlertaSerializer


class AlertaPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit'
    max_page_size = 100


class AlertaViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = AlertaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AlertaPagination

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = AlertaFilter
    # `fecha_hora` no es un campo de UsuarioNotificacion sino de la Alerta asociada.
    # Se anota en el queryset para que el front ordene con `?ordering=-fecha_hora`
    # sin conocer el `alerta__` del join. No alcanza con declarar la tupla
    # ('alerta__fecha_hora', 'fecha_hora') acá: el segundo elemento que acepta
    # OrderingFilter es la etiqueta que muestra el formulario, no un alias, así que
    # el término alias llegaría como inválido y se descartaría en silencio.
    ordering_fields = ['fecha_hora', 'estado']
    ordering = ['-fecha_hora']

    def get_notificaciones_del_usuario(self):
        """Notificaciones del usuario autenticado, sin anotaciones ni ordenamiento."""
        return UsuarioNotificacion.objects.filter(usuario=self.request.user)

    def get_queryset(self):
        # Sin `.order_by()` fijo: lo resuelve OrderingFilter a partir de `ordering`.
        return (
            self.get_notificaciones_del_usuario()
            .select_related("alerta", "alerta__limnigrafo", "alerta__medicion", "usuario")
            .annotate(fecha_hora=F("alerta__fecha_hora"))
            .distinct()
        )

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        # Sobre el queryset plano a propósito: `update()` no admite anotaciones.
        updated = self.get_notificaciones_del_usuario().filter(estado="nuevo").update(
            estado="leido",
            fecha_leida=timezone.now(),
        )
        return Response({"updated": updated})
