from rest_framework import viewsets
from ..models import Limnigrafo
from ..serializer import LimnigrafoSerializer

class LimnigrafoViewSet(viewsets.ModelViewSet):
    queryset = Limnigrafo.objects.all()
    serializer_class = LimnigrafoSerializer