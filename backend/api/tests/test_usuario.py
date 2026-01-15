from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model

class UsuarioTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.admin = User.objects.create_superuser(username='admin', password='adminpassword', email='admin@example.com')
        self.client.force_authenticate(user=self.admin)
        self.usuario_data = {
            'nombre_usuario': 'newuser',
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'contraseña': 'newpassword123',
            'estado': True
        }
        self.usuario = User.objects.create_user(
            username='existinguser',
            password='oldpassword',
            email='existing@example.com',
            first_name='Existing',
            last_name='User'
        )
        self.list_url = reverse('usuarios-list')
        self.detail_url = reverse('usuarios-detail', args=[self.usuario.id])

    def test_list_usuarios(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)
        
        user_data = next(u for u in response.data if u['nombre_usuario'] == 'existinguser')
        self.assertEqual(user_data['email'], 'existing@example.com')

    def test_create_usuario(self):
        response = self.client.post(self.list_url, self.usuario_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        User = get_user_model()
        new_user = User.objects.get(username='newuser')
        
        self.assertNotEqual(new_user.password, 'newpassword123')
        self.assertTrue(new_user.check_password('newpassword123'))
        
        self.assertEqual(new_user.username, 'newuser')
        self.assertEqual(new_user.is_active, True)

    def test_retrieve_usuario(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre_usuario'], 'existinguser')

    def test_update_usuario(self):
        update_data = {'first_name': 'Updated', 'last_name': 'Name'}
        response = self.client.patch(self.detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.first_name, 'Updated')
        self.assertEqual(self.usuario.last_name, 'Name')

    def test_update_usuario_password(self):
        update_data = {'contraseña': 'updatedpassword456'}
        response = self.client.patch(self.detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password('updatedpassword456'))

    def test_delete_usuario(self):
        User = get_user_model()
        temp_user = User.objects.create_user(username='todelete', password='pwd', email='del@test.com')
        url = reverse('usuarios-detail', args=[temp_user.id])
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=temp_user.id).exists())

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
