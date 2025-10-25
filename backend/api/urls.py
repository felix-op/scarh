from django.urls import path
from .views import hola_api
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from .views import LogoutView

urlpatterns = [
    path('hola/', hola_api),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
]


