from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Alerta, Limnigrafo, UsuarioNotificacion


class AlertaTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="alert-user",
            password="testpassword",
            email="alert-user@example.com",
        )
        self.other_user = User.objects.create_user(
            username="other-alert-user",
            password="testpassword",
            email="other-alert-user@example.com",
        )
        self.limnigrafo = Limnigrafo.objects.create(
            codigo="LMG-ALERT",
            descripcion="Limnigrafo alerta",
            memoria=1024,
            tipo_de_comunicacion=["fisico-usb"],
        )

    def test_mark_all_read_updates_only_authenticated_user_notifications(self):
        alerta_1 = Alerta.objects.create(
            limnigrafo=self.limnigrafo,
            tipo="advertencia_limnigrafo",
            condicion="tiempo_advertencia",
            condicion_activa=True,
        )
        alerta_2 = Alerta.objects.create(
            limnigrafo=self.limnigrafo,
            tipo="fuera_rango_medicion",
            condicion="altura_agua.max",
            condicion_activa=True,
        )
        propia_1 = UsuarioNotificacion.objects.create(usuario=self.user, alerta=alerta_1)
        propia_2 = UsuarioNotificacion.objects.create(usuario=self.user, alerta=alerta_2)
        ajena = UsuarioNotificacion.objects.create(usuario=self.other_user, alerta=alerta_1)

        self.client.force_authenticate(user=self.user)
        response = self.client.post(reverse("alertas-mark-all-read"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["updated"], 2)

        propia_1.refresh_from_db()
        propia_2.refresh_from_db()
        ajena.refresh_from_db()
        self.assertEqual(propia_1.estado, "leido")
        self.assertEqual(propia_2.estado, "leido")
        self.assertIsNotNone(propia_1.fecha_leida)
        self.assertEqual(ajena.estado, "nuevo")
