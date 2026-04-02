from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from .models import Usuario, PasswordRecoveryCode
from .serializer.password_recovery_serializer import SolicitarRecuperacionSerializer, ValidarCodigoRecuperacionSerializer, NuevaPasswordRecoverySerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
import random

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class SolicitarRecuperacionPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = SolicitarRecuperacionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        
        email = serializer.validated_data['email']
        
        try:
            usuario = Usuario.objects.get(email=email)
            # Generar código numérico de 6 dígitos
            codigo = str(random.randint(100000, 999999))
            
            # Invalidar códigos anteriores del usuario no usados
            PasswordRecoveryCode.objects.filter(usuario=usuario, usado=False).update(usado=True)

            # Crear nuevo código
            PasswordRecoveryCode.objects.create(
                usuario=usuario,
                codigo=codigo
            )

            print(f"==========================================")
            print(f"CÓDIGO DE RECUPERACIÓN PARA {email}: {codigo}")
            print(f"==========================================")

            # Enviar correo
            try:
                send_mail(
                    subject='Código de recuperación de contraseña',
                    message=f'Tu código de recuperación es: {codigo}. Este código expirará pronto.',
                    from_email=getattr(settings, 'EMAIL_HOST_USER', 'noreply@tudominio.com'),
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Advertencia: No se pudo enviar el correo a través de SMTP: {e}")
                # En desarrollo, permitimos que el flujo continúe

        except Usuario.DoesNotExist:
            # Por razones de seguridad, se envía el mismo mensaje para no revelar si el mail existe.
            pass

        return Response({
            "mensaje": "Si el correo está registrado, se enviará un email"
        })

class ValidarCodigoRecuperacionView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = ValidarCodigoRecuperacionSerializer(data=request.data)
        # Si hay un error de validación genérico
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        email = serializer.validated_data['email']
        codigo_ingresado = serializer.validated_data['codigo']

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({
                "codigo": 404,
                "titulo": "Usuario no encontrado",
                "descripcion_tecnica": "El email provisto no pertenece a ningún usuario registrado.",
                "descripcion_usuario": "El usuario no existe."
            }, status=404)

        # Buscar el último código activo para el usuario
        codigo_obj = PasswordRecoveryCode.objects.filter(
            usuario=usuario, 
            usado=False
        ).order_by('-creado_en').first()

        if not codigo_obj:
            return Response({
                "codigo": 400,
                "titulo": "No hay código activo",
                "descripcion_tecnica": "No se ha solicitado un código o ya fue utilizado.",
                "descripcion_usuario": "No has solicitado recuperar tu contraseña o el código ya fue usado."
            }, status=400)

        # Verificar si está bloqueado temporalmente
        if codigo_obj.is_blocked():
            minutos = getattr(settings, 'PASSWORD_RECOVERY_BLOCK_MINUTES', 30)
            return Response({
                "codigo": 403,
                "titulo": "Intentos excedidos",
                "descripcion_tecnica": f"El usuario superó el límite de intentos. Bloqueado hasta {codigo_obj.bloqueado_hasta}",
                "descripcion_usuario": f"Has excedido el número de intentos. Por favor, espera {minutos} minutos e intenta solicitar uno nuevo."
            }, status=403)

        # Verificar si expiró
        if codigo_obj.is_expired():
            return Response({
                "codigo": 410,
                "titulo": "Código expirado",
                "descripcion_tecnica": "El código de recuperación ha superado su tiempo de validez",
                "descripcion_usuario": "El código ha expirado, solicitá uno nuevo"
            }, status=410)

        # Verificar si el código no coincide
        if codigo_obj.codigo != codigo_ingresado:
            codigo_obj.intentos += 1
            
            # Bloquear si se alcanzan 3 intentos fallidos
            if codigo_obj.intentos >= 3:
                minutos_bloqueo = getattr(settings, 'PASSWORD_RECOVERY_BLOCK_MINUTES', 30)
                codigo_obj.bloqueado_hasta = timezone.now() + timedelta(minutes=minutos_bloqueo)
                codigo_obj.save()
                return Response({
                    "codigo": 403,
                    "titulo": "Intentos excedidos",
                    "descripcion_tecnica": f"El código falló 3 veces. Bloqueo temporal establecido por {minutos_bloqueo} minutos.",
                    "descripcion_usuario": "Has agotado tus 3 intentos. Debes solicitar un código nuevo luego de esperar."
                }, status=403)
                
            codigo_obj.save()
            return Response({
                "codigo": 400,
                "titulo": "Código inválido",
                "descripcion_tecnica": "El código ingresado no coincide con el generado",
                "descripcion_usuario": "El código ingresado es incorrecto"
            }, status=400)

        # Código correcto
        codigo_obj.usado = True
        codigo_obj.save()

        # Emitir tokens
        refresh = RefreshToken.for_user(usuario)
        
        return Response({
            "accessToken": str(refresh.access_token),
            "refreshToken": str(refresh)
        })

class NuevaPasswordRecoveryView(APIView):
    # Requiere estar autenticado. Nuestro JWT emitido en validar será el permiso.
    permission_classes = [] 

    def post(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "No autorizado"}, status=401)
            
        serializer = NuevaPasswordRecoverySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        password_nueva = serializer.validated_data['password']
        
        # Establecemos la nueva contraseña 
        user = request.user
        user.set_password(password_nueva)
        user.save()
        
        return Response({"mensaje": "Contraseña actualizada exitosamente."})
