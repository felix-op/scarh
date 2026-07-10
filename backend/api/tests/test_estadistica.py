from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from api.models import Limnigrafo, ConfiguracionLimnigrafo
from api.models.medicion import Medicion
from datetime import time, datetime
import math

class EstadisticaTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_superuser(username='testuser', password='testpassword', email='testuser@example.com')
        self.client.force_authenticate(user=self.user)
        
        self.limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-001',
            descripcion='Limnigrafo Test',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_actual=12.0,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=self.limnigrafo,
            bateria_max=12.0,
            bateria_min=10.0,
            tiempo_advertencia=3600,
            tiempo_peligro=7200
        )
        self.limnigrafo2 = Limnigrafo.objects.create(
            codigo='LMG-002',
            descripcion='Limnigrafo Test 2',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_actual=12.0,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=self.limnigrafo2,
            bateria_max=12.0,
            bateria_min=10.0,
            tiempo_advertencia=3600,
            tiempo_peligro=7200
        )
        
        self.url = reverse('estadistica-list') 
        for i in range(1, 6):
            Medicion.objects.create(
                limnigrafo=self.limnigrafo,
                altura_agua=float(i),
                presion=float(i*10),
                temperatura=float(i*2),
                fecha_hora=f'2024-01-01T1{i}:00:00Z',
                fuente='manual'
            )
        for i in range(1, 3):
             Medicion.objects.create(
                limnigrafo=self.limnigrafo2,
                altura_agua=float(i*10),
                fecha_hora=f'2024-01-01T1{i}:00:00Z',
                fuente='manual'
            )

    def test_calculate_statistics_temperatura(self):
        params = {
            'limnigrafos': str(self.limnigrafo.id),
            'atributo': 'temperatura',
            'fecha_inicio': '2024-01-01T00:00:00Z',
            'fecha_fin': '2024-01-02T00:00:00Z'
        }
        response = self.client.get(self.url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        result = response.data[0]
        self.assertEqual(result['minimo'], 2.0)
        self.assertEqual(result['maximo'], 10.0)
        self.assertEqual(result['moda'], 2.0)
        self.assertAlmostEqual(result['desvio_estandar'], 3.16227766, places=4)
        
    def test_calculate_statistics_altura(self):
        params = {
            'limnigrafos': str(self.limnigrafo.id),
            'atributo': 'altura_agua',
            'fecha_inicio': '2024-01-01T00:00:00Z',
            'fecha_fin': '2024-01-02T00:00:00Z'
        }
        response = self.client.get(self.url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        result = response.data[0]
        self.assertEqual(result['minimo'], 1.0) 
        self.assertEqual(result['maximo'], 5.0)
        self.assertEqual(result['moda'], 1.0)

    def test_global_statistics(self):
        params = {
            'limnigrafos': f'{self.limnigrafo.id},{self.limnigrafo2.id}',
            'atributo': 'altura_agua',
            'fecha_inicio': '2024-01-01T00:00:00Z',
            'fecha_fin': '2024-01-02T00:00:00Z'
        }
        response = self.client.get(self.url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertEqual(len(response.data), 3)
        
        global_stat = next(r for r in response.data if r['id'] is None)
        self.assertEqual(global_stat['minimo'], 1.0)
        self.assertEqual(global_stat['maximo'], 20.0)
        self.assertEqual(global_stat['moda'], 1.0)

    def test_mode_statistics(self):
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=3.0,
            fecha_hora='2024-01-01T16:00:00Z',
            fuente='manual'
        )

        params = {
            'limnigrafos': str(self.limnigrafo.id),
            'atributo': 'altura_agua',
            'fecha_inicio': '2024-01-01T00:00:00Z',
            'fecha_fin': '2024-01-02T00:00:00Z'
        }
        response = self.client.get(self.url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result = response.data[0]
        self.assertEqual(result['moda'], 3.0)

    def test_validation_dates(self):
        params = {
            'limnigrafos': str(self.limnigrafo.id),
            'atributo': 'temperatura',
            'fecha_inicio': '2024-01-02T00:00:00Z',
            'fecha_fin': '2024-01-01T00:00:00Z'
        }
        response = self.client.get(self.url, params)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_calculate_statistics_with_get(self):
        response = self.client.get(self.url, {
            'limnigrafos': f'{self.limnigrafo.id},{self.limnigrafo2.id}',
            'atributo': 'altura_agua',
            'fecha_inicio': '2024-01-01T00:00:00Z',
            'fecha_fin': '2024-01-02T00:00:00Z'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        global_stat = next(r for r in response.data if r['id'] is None)
        self.assertEqual(global_stat['minimo'], 1.0)
        self.assertEqual(global_stat['maximo'], 20.0)
