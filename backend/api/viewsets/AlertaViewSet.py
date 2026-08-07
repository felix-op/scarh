from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from ..models import UsuarioNotificacion
from ..serializer import AlertaSerializer


class AlertaViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = AlertaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            UsuarioNotificacion.objects.filter(usuario=self.request.user)
            .select_related("alerta", "alerta__limnigrafo", "alerta__medicion", "usuario")
            .order_by("-alerta__fecha_hora")
            .distinct()
        )

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(estado="nuevo").update(
            estado="leido",
            fecha_leida=timezone.now(),
        )
        return Response({"updated": updated})
