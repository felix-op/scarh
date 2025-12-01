from django.urls import path, include
from .views import hola_api, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LogoutView
from rest_framework.routers import DefaultRouter
from .viewsets import UsuarioViewSet, LimnigrafoViewSet, HistorialViewSet, MedicionViewSet

router = DefaultRouter()

router.register(r'usuarios', UsuarioViewSet, basename='usuarios')
router.register(r'limnigrafos', LimnigrafoViewSet, basename='limnigrafos') 
router.register(r'historial', HistorialViewSet, basename='historial') 
router.register(r'medicion', MedicionViewSet, basename='medicion') 


urlpatterns = [
    path('hola/', hola_api),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('', include(router.urls)),
]

