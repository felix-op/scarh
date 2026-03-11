from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from ..models import Alerta
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
            Alerta.objects.filter(usuarios=self.request.user)
            .select_related("limnigrafo", "medicion")
            .prefetch_related("usuarios")
            .order_by("-fecha_hora")
            .distinct()
        )
