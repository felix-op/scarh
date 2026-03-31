from django.urls import path, include
from .views import hola_api, CustomTokenObtainPairView, CustomTokenRefreshView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LogoutView
from rest_framework.routers import DefaultRouter
from .viewsets import UsuarioViewSet, LimnigrafoViewSet, HistorialViewSet, MedicionViewSet, UbicacionViewSet, EstadisticaViewSet, RolViewSet, AlertaViewSet
from .views_recovery import SolicitarRecuperacionPasswordView, ValidarCodigoRecuperacionView

router = DefaultRouter()

router.register(r'usuarios', UsuarioViewSet, basename='usuarios')
router.register(r'limnigrafos', LimnigrafoViewSet, basename='limnigrafos') 
router.register(r'historial', HistorialViewSet, basename='historial') 
router.register(r'medicion', MedicionViewSet, basename='medicion') 
router.register(r'ubicacion', UbicacionViewSet, basename='ubicacion') 
router.register(r'estadistica', EstadisticaViewSet, basename='estadistica') 
router.register(r'roles', RolViewSet, basename='roles') 
router.register(r'alertas', AlertaViewSet, basename='alertas') 


urlpatterns = [
    path('hola/', hola_api),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/recuperar-password/solicitar', SolicitarRecuperacionPasswordView.as_view(), name='recuperar_password_solicitar'),
    path('auth/recuperar-password/validar', ValidarCodigoRecuperacionView.as_view(), name='recuperar_password_validar'),
    path('', include(router.urls)),
]
