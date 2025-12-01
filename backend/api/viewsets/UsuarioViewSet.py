from rest_framework import viewsets
from ..serializer import UsuarioSerializer
from ..models import Usuario
from rest_framework.permissions import IsAuthenticated
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

