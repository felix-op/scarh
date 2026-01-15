from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from api.models.ubicacion import Ubicacion

class UbicacionTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.force_authenticate(user=self.user)

        self.ubicacion_data = {
            'nombre': 'Ubicacion Test',
            'latitud': -34.6037,
            'longitud': -58.3816
        }
        self.ubicacion = Ubicacion.objects.create(
            nombre='Ubicacion Existente',
            latitud=-32.9468,
            longitud=-60.63932
        )
        self.list_url = reverse('ubicacion-list')
        self.detail_url = reverse('ubicacion-detail', args=[self.ubicacion.id])

    def test_list_ubicaciones_geojson_format(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertGreaterEqual(len(response.data), 1)
        first_item = response.data[0]
        
        self.assertEqual(first_item['type'], 'Feature')
        self.assertIn('id', first_item)
        self.assertIn('geometry', first_item)
        self.assertEqual(first_item['geometry']['type'], 'Point')
        self.assertIsInstance(first_item['geometry']['coordinates'], list)
        self.assertEqual(len(first_item['geometry']['coordinates']), 2)
        self.assertIsInstance(first_item['geometry']['coordinates'][0], float)
        self.assertIsInstance(first_item['geometry']['coordinates'][1], float)
        self.assertIn('nombre', first_item)

    def test_create_ubicacion(self):
        response = self.client.post(self.list_url, self.ubicacion_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ubicacion.objects.count(), 2)
        
        self.assertEqual(response.data['type'], 'Feature')
        self.assertEqual(response.data['nombre'], 'Ubicacion Test')
        self.assertEqual(response.data['geometry']['coordinates'], [self.ubicacion_data['longitud'], self.ubicacion_data['latitud']])

    def test_retrieve_ubicacion_geojson(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertEqual(response.data['type'], 'Feature')
        self.assertEqual(response.data['id'], self.ubicacion.id)
        self.assertEqual(response.data['nombre'], self.ubicacion.nombre)
        self.assertEqual(response.data['geometry']['coordinates'], [self.ubicacion.longitud, self.ubicacion.latitud])

    def test_update_ubicacion(self):
        update_data = {'nombre': 'Nombre Actualizado'}
        response = self.client.patch(self.detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.ubicacion.refresh_from_db()
        self.assertEqual(self.ubicacion.nombre, 'Nombre Actualizado')
        self.assertEqual(response.data['nombre'], 'Nombre Actualizado')

    def test_delete_ubicacion(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Ubicacion.objects.count(), 0)

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
