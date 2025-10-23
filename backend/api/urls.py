from django.urls import path
from .views import hola_api

urlpatterns = [
    path('hola/', hola_api),
]
