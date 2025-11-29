from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializer.customTokenObtainPairSerializer import CustomTokenObtainPairSerializer

from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers

@extend_schema(
    responses={
        200: inline_serializer(
            name='LoginResponse',
            fields={
                'access': serializers.CharField(),
                'refresh': serializers.CharField(),
                'user': inline_serializer(
                    name='UserResponse',
                    fields={
                        'id': serializers.IntegerField(),
                        'username': serializers.CharField(),
                        'email': serializers.EmailField(),
                        'first_name': serializers.CharField(),
                        'last_name': serializers.CharField(),
                        'is_superuser': serializers.BooleanField(),
                        'is_staff': serializers.BooleanField(),
                    }
                )
            }
        )
    }
)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # Agrega el token a la lista negra
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def hola_api(request):
    return Response({'mensaje': 'Hola desde Django REST Framework con estructura core!'})
