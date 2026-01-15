from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from api.models.limnigrafo import Limnigrafo
from datetime import time
from rest_framework_api_key.models import APIKey

class LimnigrafoTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.force_authenticate(user=self.user)

        self.limnigrafo_data = {
            'codigo': 'LMG-001',
            'descripcion': 'Limnigrafo de prueba',
            'memoria': 1024,
            'tipo_comunicacion': ['internet-https-4G'],
            'bateria_max': 14.5,
            'bateria_min': 11.0,
            'tiempo_advertencia': '01:00:00',
            'tiempo_peligro': '02:00:00',
            'estado': 'normal'
        }
        self.limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-EXISTING',
            descripcion='Limnigrafo existente',
            memoria=2048,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_max=12.0,
            bateria_min=10.0,
            tiempo_advertencia=time(0, 30),
            tiempo_peligro=time(1, 0)
        )
        self.list_url = reverse('limnigrafos-list')
        self.detail_url = reverse('limnigrafos-detail', args=[self.limnigrafo.id])

    def test_list_limnigrafos(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_limnigrafo(self):
        response = self.client.post(self.list_url, self.limnigrafo_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Limnigrafo.objects.count(), 2)
        self.assertEqual(Limnigrafo.objects.get(codigo='LMG-001').descripcion, 'Limnigrafo de prueba')

    def test_create_limnigrafo_duplicate_code(self):
        duplicate_data = self.limnigrafo_data.copy()
        duplicate_data['codigo'] = 'LMG-EXISTING'
        response = self.client.post(self.list_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_limnigrafo(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['codigo'], self.limnigrafo.codigo)

    def test_update_limnigrafo(self):
        update_data = {'descripcion': 'Descripcion actualizada'}
        response = self.client.patch(self.detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.descripcion, 'Descripcion actualizada')

    def test_delete_limnigrafo(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Limnigrafo.objects.count(), 0)


    def test_generate_key_action(self):
        url = reverse('limnigrafos-generate-key', args=[self.limnigrafo.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('secret_key', response.data)
        self.assertIn('key_prefix', response.data)

    def test_key_rotation_invalidates_old_key(self):
        url = reverse('limnigrafos-generate-key', args=[self.limnigrafo.id])
        response1 = self.client.post(url)
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        key_prefix1 = response1.data['key_prefix']
        self.assertTrue(APIKey.objects.filter(prefix=key_prefix1).exists())
        response2 = self.client.post(url)
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        key_prefix2 = response2.data['key_prefix']
        self.assertFalse(APIKey.objects.filter(prefix=key_prefix1).exists())
        self.assertTrue(APIKey.objects.filter(prefix=key_prefix2).exists())

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
