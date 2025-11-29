from rest_framework import viewsets
from ..models import Limnigrafo
from ..serializer import LimnigrafoSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework_api_key.models import APIKey

class LimnigrafoViewSet(viewsets.ModelViewSet):
    queryset = Limnigrafo.objects.all()
    serializer_class = LimnigrafoSerializer

    @action(detail=True, methods=['post'])
    def generate_key(self, request, pk=None):
        limnigrafo = self.get_object()
        key_name_prefix = f"LMG-{limnigrafo.id}"
        APIKey.objects.filter(name__startswith=key_name_prefix).delete()
        
        full_key_name = f"{key_name_prefix}_{limnigrafo.codigo}_{limnigrafo.descripcion[:10]}"
        key_obj, key_secret = APIKey.objects.create_key(name=full_key_name)
        
        return Response({
            "message": "Clave API rotada y generada exitosamente.",
            "limnigrafo_id": limnigrafo.id,
            "key_name": key_obj.name,
            "key_prefix": key_obj.prefix,
            "secret_key": key_secret,
            "warning": "GUARDE ESTA CLAVE. No se puede recuperar después de este momento."
        }, status=status.HTTP_201_CREATED)