from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from api.models.limnigrafo import Limnigrafo
from api.models.medicion import Medicion
from rest_framework_api_key.models import APIKey
from datetime import time

class MedicionTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        
        self.limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-001',
            descripcion='Limnigrafo Test',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_max=12.0,
            bateria_min=10.0,
            bateria_actual=11.5,
            tiempo_advertencia=time(1, 0),
            tiempo_peligro=time(2, 0),
            estado='normal'
        )
        
        self.list_url = reverse('medicion-list')
        
        self.api_key, self.key_secret = APIKey.objects.create_key(name="test-key")

    def test_list_mediciones(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_medicion_manual(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 2.5,
            'nivel_de_bateria': 11.8,
            'presion': 1013,
            'temperatura': 20,
            'fecha_hora': '2024-01-01T10:00:00Z'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['fuente'], 'manual')
        self.assertEqual(Medicion.objects.count(), 1)

    def test_create_medicion_automatico(self):
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f"Api-Key {self.key_secret}")
        
        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 2.6,
            'nivel_de_bateria': 11.7,
            'fecha_hora': '2024-01-01T10:00:00Z'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['fuente'], 'automatico')

    def test_create_medicion_updates_limnigrafo_state(self):
        self.client.force_authenticate(user=self.user)
        
        self.assertEqual(self.limnigrafo.bateria_actual, 11.5)
        
        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 3.0,
            'nivel_de_bateria': 9.0, 
            'fecha_hora': '2024-01-01T10:00:00Z'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.limnigrafo.refresh_from_db()
        
        self.assertEqual(self.limnigrafo.bateria_actual, 9.0)
        
        self.assertIsNotNone(self.limnigrafo.ultima_conexion)
        
        self.assertEqual(self.limnigrafo.estado, 'fuera_de_servicio')

    def test_retrieve_medicion(self):
        self.client.force_authenticate(user=self.user)
        medicion = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.0,
            fecha_hora='2024-01-01T12:00:00Z',
            fuente='manual'
        )
        url = reverse('medicion-detail', args=[medicion.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], medicion.id)

    def test_filter_medicion_by_limnigrafo(self):
        self.client.force_authenticate(user=self.user)
        
        other_limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-002',
            descripcion='Other',
            memoria=1024,
            bateria_max=12,
            bateria_min=10,
            bateria_actual=12,
            tiempo_advertencia=time(1,0),
            tiempo_peligro=time(2,0)
        )
        Medicion.objects.create(limnigrafo=self.limnigrafo, altura_agua=1.0, fecha_hora='2024-01-01T10:00:00Z')
        Medicion.objects.create(limnigrafo=other_limnigrafo, altura_agua=2.0, fecha_hora='2024-01-01T11:00:00Z')
        
        response = self.client.get(self.list_url, {'limnigrafo': self.limnigrafo.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['limnigrafo'], self.limnigrafo.id)
