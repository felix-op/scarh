from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import Ubicacion
from ..serializer import UbicacionSerializer, UbicacionOutputSerializer
from drf_spectacular.utils import extend_schema

@extend_schema(responses={200: UbicacionOutputSerializer(many=True)})
class UbicacionViewSet(viewsets.ModelViewSet):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [IsAuthenticated]
