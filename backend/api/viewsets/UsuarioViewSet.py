from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..serializer import UsuarioSerializer, ChangePasswordSerializer
from ..models import Usuario
from ..filters import UsuarioFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from drf_spectacular.utils import extend_schema

class UsuarioPagination(PageNumberPagination):
    page_size = 10               
    page_size_query_param = 'limit' 
    max_page_size = 100 

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('id')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = UsuarioPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = UsuarioFilter
    ordering_fields = ['id', 'first_name', 'last_name', 'username', 'email']
    ordering = ['id']

    @extend_schema(request=ChangePasswordSerializer, responses={200: {"description": "Contraseña actualizada correctamente"}})
    @action(detail=True, methods=['post'], url_path='cambiar-password')
    def cambiar_password(self, request, pk=None):
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request, 'target_user': user})
        
        if serializer.is_valid():
            user.set_password(serializer.validated_data['password_nueva'])
            user.save()
            return Response({"message": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

