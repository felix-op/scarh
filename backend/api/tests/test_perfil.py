from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Accion, Rol


class PerfilTests(APITestCase):
    """`/usuarios/me/`: cada usuario ve y edita sus propios datos, sin roles."""

    def setUp(self):
        User = get_user_model()
        self.url = reverse('usuarios-me')

        self.usuario = User.objects.create_user(
            username='operador',
            password='clave-original',
            email='operador@example.com',
            first_name='Ana',
            last_name='Pérez',
            legajo='123456/01',
        )
        self.otro = User.objects.create_user(
            username='ajeno', password='x', email='ajeno@example.com'
        )
        self.client.force_authenticate(user=self.usuario)

    # ------------------------------------------------------------------ #
    # Acceso
    # ------------------------------------------------------------------ #

    def test_usuario_sin_roles_ve_sus_datos(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre_usuario'], 'operador')
        self.assertEqual(response.data['email'], 'operador@example.com')
        self.assertEqual(response.data['legajo'], '123456/01')

    def test_usuario_sin_roles_edita_sus_datos(self):
        response = self.client.patch(self.url, {'first_name': 'Ana María'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.first_name, 'Ana María')

    def test_requiere_autenticacion(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_el_listado_de_usuarios_sigue_exigiendo_rol(self):
        """
        Contraste: `me` no pide roles, pero eso no abre el resto del recurso.
        """
        response = self.client.get(reverse('usuarios-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_no_permite_editar_a_otro_usuario(self):
        """El endpoint opera siempre sobre `request.user`; el `id` del body se ignora."""
        self.client.patch(self.url, {'id': self.otro.id, 'first_name': 'Intruso'}, format='json')

        self.otro.refresh_from_db()
        self.usuario.refresh_from_db()
        self.assertNotEqual(self.otro.first_name, 'Intruso')
        self.assertEqual(self.usuario.first_name, 'Intruso')

    # ------------------------------------------------------------------ #
    # Campos que no se pueden tocar desde el perfil
    # ------------------------------------------------------------------ #

    def test_no_puede_desactivarse_a_si_mismo(self):
        self.client.patch(self.url, {'estado': False}, format='json')

        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.is_active)

    def test_no_puede_cambiar_la_contrasenia(self):
        response = self.client.patch(self.url, {'contraseña': 'nueva-clave'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password('clave-original'))

    def test_no_puede_asignarse_roles(self):
        Rol.objects.get_or_create(nombre='administracion')

        self.client.patch(self.url, {'roles': ['administracion']}, format='json')

        self.usuario.refresh_from_db()
        self.assertEqual(list(self.usuario.roles.values_list('nombre', flat=True)), [])

    # ------------------------------------------------------------------ #
    # Auditoría
    # ------------------------------------------------------------------ #

    def test_registra_la_edicion_en_el_historial(self):
        self.client.patch(self.url, {'first_name': 'Ana María'}, format='json')

        accion = Accion.objects.filter(entidad='Usuario').order_by('-fecha_hora').first()
        self.assertIsNotNone(accion)
        self.assertEqual(accion.usuario, self.usuario)
        self.assertIn('propio perfil', accion.descripcion)
