from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from api.models import Rol

class UsuarioTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.admin = User.objects.create_superuser(username='admin', password='adminpassword', email='admin@example.com')
        self.client.force_authenticate(user=self.admin)
        self.usuario_data = {
            'nombre_usuario': 'newuser',
            'legajo': 'L-1001',
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
            legajo='L-0001',
            first_name='Existing',
            last_name='User'
        )
        self.list_url = reverse('usuarios-list')
        self.detail_url = reverse('usuarios-detail', args=[self.usuario.id])
        self.roles_url = reverse('usuarios-asignar-roles', args=[self.usuario.id])
        self.bulk_roles_url = reverse('usuarios-asignar-roles-bulk')
        self.rol_mediciones_visualizar = Rol.objects.create(
            nombre='mediciones-visualizar',
            descripcion='Permite visualizar mediciones.',
        )
        self.rol_historial_visualizar = Rol.objects.create(
            nombre='historial-visualizar',
            descripcion='Permite visualizar historial de acciones.',
        )

    def test_list_usuarios(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Because pagination is applied, the actual list of users is in response.data['results']
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 2)
        
        user_data = next(u for u in results if u['nombre_usuario'] == 'existinguser')
        self.assertEqual(user_data['email'], 'existing@example.com')
        self.assertEqual(user_data['legajo'], 'L-0001')

    def test_create_usuario(self):
        response = self.client.post(self.list_url, self.usuario_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        User = get_user_model()
        new_user = User.objects.get(username='newuser')
        
        self.assertNotEqual(new_user.password, 'newpassword123')
        self.assertTrue(new_user.check_password('newpassword123'))
        
        self.assertEqual(new_user.username, 'newuser')
        self.assertEqual(new_user.is_active, True)
        self.assertEqual(new_user.legajo, 'L-1001')

    def test_retrieve_usuario(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre_usuario'], 'existinguser')
        self.assertEqual(response.data['legajo'], 'L-0001')

    def test_update_usuario(self):
        update_data = {'first_name': 'Updated', 'last_name': 'Name'}
        response = self.client.patch(self.detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.first_name, 'Updated')
        self.assertEqual(self.usuario.last_name, 'Name')

    def test_update_usuario_password_ignored(self):
        update_data = {'contraseña': 'ignoredpassword'}
        response = self.client.patch(self.detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.usuario.refresh_from_db()
        self.assertFalse(self.usuario.check_password('ignoredpassword'))
        self.assertTrue(self.usuario.check_password('oldpassword'))

    def test_change_password_endpoint(self):
        url = reverse('usuarios-cambiar-password', args=[self.usuario.id])
        data = {
            'password_actual': 'oldpassword',
            'password_nueva': 'newsecurepassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password('newsecurepassword'))

    def test_change_password_endpoint_fail(self):
        """
        Verifica que falle si la contraseña actual es incorrecta.
        """
        url = reverse('usuarios-cambiar-password', args=[self.usuario.id])
        data = {
            'password_actual': 'wrongpassword',
            'password_nueva': 'newsecurepassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        self.usuario.refresh_from_db()
        self.assertFalse(self.usuario.check_password('newsecurepassword'))

    def test_assign_roles_to_single_user(self):
        response = self.client.put(
            self.roles_url,
            {'roles': ['mediciones-visualizar']},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertEqual(
            sorted(self.usuario.roles.values_list('nombre', flat=True)),
            ['mediciones-visualizar']
        )

    def test_bulk_add_roles(self):
        segundo_usuario = get_user_model().objects.create_user(
            username='segundousuario',
            password='password123',
            email='segundo@example.com',
        )

        response = self.client.post(
            self.bulk_roles_url,
            {
                'user_ids': [self.usuario.id, segundo_usuario.id],
                'roles': ['mediciones-visualizar'],
                'mode': 'add',
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        segundo_usuario.refresh_from_db()
        self.assertEqual(
            sorted(self.usuario.roles.values_list('nombre', flat=True)),
            ['mediciones-visualizar']
        )
        self.assertEqual(
            sorted(segundo_usuario.roles.values_list('nombre', flat=True)),
            ['mediciones-visualizar']
        )

    def test_bulk_remove_roles(self):
        self.usuario.roles.add(self.rol_mediciones_visualizar, self.rol_historial_visualizar)

        response = self.client.post(
            self.bulk_roles_url,
            {
                'user_ids': [self.usuario.id],
                'roles': ['mediciones-visualizar'],
                'mode': 'remove',
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertEqual(
            sorted(self.usuario.roles.values_list('nombre', flat=True)),
            ['historial-visualizar']
        )

    def test_bulk_replace_roles(self):
        self.usuario.roles.add(self.rol_historial_visualizar)

        response = self.client.post(
            self.bulk_roles_url,
            {
                'user_ids': [self.usuario.id],
                'roles': ['mediciones-visualizar'],
                'mode': 'replace',
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertEqual(
            sorted(self.usuario.roles.values_list('nombre', flat=True)),
            ['mediciones-visualizar']
        )

    def test_bulk_roles_validates_mode(self):
        response = self.client.post(
            self.bulk_roles_url,
            {
                'user_ids': [self.usuario.id],
                'roles': ['mediciones-visualizar'],
                'mode': 'merge',
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

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
