from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializer.customTokenObtainPairSerializer import CustomTokenObtainPairSerializer
from .serializer.customTokenRefreshView import CustomTokenRefreshSerializer
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
                ),
                'access_token_lifetime': serializers.IntegerField(),
                'refresh_token_lifetime': serializers.IntegerField()
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


@extend_schema(
    responses={
        200: inline_serializer(
            name='RefreshTokenResponse',
            fields={
                'access': serializers.CharField(),
                'refresh': serializers.CharField(),
                'access_token_lifetime': serializers.IntegerField(),
                'refresh_token_lifetime': serializers.IntegerField()
            }
        )
    }
)
class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer


import datetime
from zoneinfo import ZoneInfo
from django.utils import timezone
from django.http import HttpResponse
from rest_framework.decorators import permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
import os
from urllib.parse import unquote_plus

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def save_get_legacy(request):
    dato_raw = request.GET.get('dato')
    if not dato_raw:
        return HttpResponse("Missing 'dato' parameter", status=400)

    try:
        print(f"Legacy GET recibido: dato_raw={dato_raw!r}", flush=True)

        # Django normalmente ya decodifica el query string. Algunos equipos
        # legacy, sin embargo, codifican ``dato`` una segunda vez y hacen que
        # llegue texto como ``20-8-2026%209%3A27...``. Decodificamos hasta dos
        # veces para aceptar ambos formatos sin alterar el caso normal.
        dato_normalizado = dato_raw.strip()
        for _ in range(2):
            dato_decodificado = unquote_plus(dato_normalizado)
            if dato_decodificado == dato_normalizado:
                break
            dato_normalizado = dato_decodificado

        print(f"Legacy GET normalizado: dato={dato_normalizado!r}", flush=True)
        parts = dato_normalizado.split()
        print(f"Legacy GET separado: partes={parts!r} (cantidad={len(parts)})", flush=True)
        if len(parts) not in (3, 4):
            return HttpResponse("Invalid format. Expected date, time, height and optional battery", status=400)

        date_str, time_str, height_str = parts[:3]
        battery_str = parts[3] if len(parts) == 4 else None
        
        # Parse date: DD-MM-YYYY or D-M-YYYY
        day, month, year = map(int, date_str.split('-'))
        # Parse time: HH:MM or H:M
        hour, minute = map(int, time_str.split(':'))
        
        # Build naive datetime
        naive_dt = datetime.datetime(year, month, day, hour, minute)
        
        # Make aware in Ushuaia timezone
        tz = ZoneInfo('America/Argentina/Ushuaia')
        aware_dt = timezone.make_aware(naive_dt, tz)
        
        # Parse height (replace comma with dot)
        height = float(height_str.replace(',', '.'))
        
        # Parse battery (replace comma with dot) when the legacy device sends it.
        battery = float(battery_str.replace(',', '.')) if battery_str is not None else None
        print(
            f"Legacy GET parseado: fecha={aware_dt.isoformat()} altura={height} bateria={battery}",
            flush=True,
        )
        
    except Exception as e:
        print(f"Error parsing legacy GET data {dato_raw!r}: {e}", flush=True)
        return HttpResponse(f"Error parsing data: {str(e)}", status=400)
        
    default_codigo = os.getenv('DEFAULT_LIMNIGRAFO_CODIGO', 'LM-RIO-OLIVIA-01')
    from api.models import Limnigrafo
    try:
        limnigrafo = Limnigrafo.objects.get(codigo=default_codigo)
    except Limnigrafo.DoesNotExist:
        print(f"Default limnigrafo '{default_codigo}' not found.", flush=True)
        return HttpResponse(f"Limnigrafo '{default_codigo}' not found", status=500)

    # El equipo puede reenviar una lectura si no alcanzó a recibir el OK. La
    # combinación limnígrafo/fecha ya es única en la base, por lo que un
    # reintento no debe crear otra medición ni ser tratado como un error.
    from api.models import Medicion
    if Medicion.objects.filter(limnigrafo=limnigrafo, fecha_hora=aware_dt).exists():
        return HttpResponse(status=204)

    from api.serializer.medicionSerializer import MedicionSerializer
    data = {
        'limnigrafo': limnigrafo.id,
        'fecha_hora': aware_dt.isoformat(),
        'altura_agua': height,
        'nivel_de_bateria': battery,
        'fuente': 'automatico',
    }
    
    serializer = MedicionSerializer(data=data)
    if not serializer.is_valid():
        print(f"Validation error saving legacy measurement: {serializer.errors}", flush=True)
        return HttpResponse(f"Validation error: {serializer.errors}", status=400)
        
    try:
        medicion_instance = serializer.save()
        
        # Re-fetch and update limnigrafo state fields
        limnigrafo = medicion_instance.limnigrafo
        
        if medicion_instance.nivel_de_bateria is not None:
            limnigrafo.bateria_actual = medicion_instance.nivel_de_bateria
            
        limnigrafo.ultima_medicion = medicion_instance
        
        from api.utils.estado_limnigrafo import calcular_estado_limnigrafo, calcular_estado_medicion_limnigrafo
        limnigrafo.estado = calcular_estado_limnigrafo(limnigrafo)
        limnigrafo.estado_medicion = calcular_estado_medicion_limnigrafo(limnigrafo)
        limnigrafo.save(update_fields=['bateria_actual', 'ultima_medicion', 'estado', 'estado_medicion'])
        
        from api.utils.alertas import generar_alerta_medicion_fuera_de_rango
        generar_alerta_medicion_fuera_de_rango(medicion_instance)
        
    except Exception as e:
        print(f"Error saving legacy measurement: {e}", flush=True)
        return HttpResponse(f"Server error saving measurement: {str(e)}", status=500)
        
    return HttpResponse(status=204)
