from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from api.models.limnigrafo import Limnigrafo
from datetime import time, date

class HistorialTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.force_authenticate(user=self.user)
        
        self.limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-H-001',
            descripcion='Historial Test',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_max=12.0,
            bateria_min=10.0,
            bateria_actual=12.0,
            tiempo_advertencia=time(1, 0),
            tiempo_peligro=time(2, 0)
        )
        
        self.list_url = reverse('historial-list')

    def test_list_historial(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)
        
        record = response.data['results'][0]
        self.assertEqual(record['object_id'], self.limnigrafo.id)
        self.assertEqual(record['model_name'], 'Limnígrafo')

    def test_filter_by_type(self):
        self.limnigrafo.descripcion = 'Updated Desc'
        self.limnigrafo.save()
        
        response = self.client.get(self.list_url, {'type': 'created'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for result in response.data['results']:
            self.assertEqual(result['type'], 'created')
            
        response = self.client.get(self.list_url, {'type': 'modified'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for result in response.data['results']:
            self.assertEqual(result['type'], 'modified')

    def test_filter_by_user(self):   
        response = self.client.get(self.list_url, {'usuario': self.user.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_date(self):
        today = date.today().isoformat()
        response = self.client.get(self.list_url, {'desde': today, 'hasta': today})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_retrieve_historial(self):
        list_response = self.client.get(self.list_url)
        history_id = list_response.data['results'][0]['id']
        
        url = reverse('historial-detail', args=[history_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('changes', response.data)

    def test_read_only(self):
        response = self.client.post(self.list_url, {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        
        list_response = self.client.get(self.list_url)
        history_id = list_response.data['results'][0]['id']
        url = reverse('historial-detail', args=[history_id])
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
