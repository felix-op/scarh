from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Alerta, ConfiguracionLimnigrafo, Limnigrafo, UsuarioNotificacion
from api.models.medicion import Medicion


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


class GenerarAlertaCommandTests(APITestCase):
    """El comando `generar_alerta` es el único que crea y cierra alertas de estado."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="command-user",
            password="testpassword",
            email="command-user@example.com",
        )
        self.limnigrafo = Limnigrafo.objects.create(
            codigo="LMG-CMD",
            descripcion="Limnigrafo comando",
            memoria=1024,
            tipo_de_comunicacion=["fisico-usb"],
            bateria_actual=12.0,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=self.limnigrafo,
            bateria_min=10.0,
            tiempo_advertencia=1800,
            tiempo_peligro=3600,
            altura_maxima_agua=3.0,
        )

    def _registrar_medicion(self, *, altura_agua=2.0, minutos_atras=0):
        medicion = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=altura_agua,
            fecha_hora=timezone.now() - timedelta(minutes=minutos_atras),
            fuente="automatico",
        )
        self.limnigrafo.ultima_medicion = medicion
        self.limnigrafo.save(update_fields=["ultima_medicion"])
        return medicion

    def test_no_duplica_alerta_activa_por_tiempo_advertencia(self):
        self._registrar_medicion(minutos_atras=45)

        call_command("generar_alerta")
        call_command("generar_alerta")

        alertas = Alerta.objects.filter(
            limnigrafo=self.limnigrafo,
            tipo="advertencia_limnigrafo",
            condicion="tiempo_advertencia",
        )
        self.assertEqual(alertas.count(), 1)
        self.assertTrue(alertas.get().condicion_activa)
        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.estado, "advertencia")

    def test_notifica_a_los_usuarios_activos(self):
        self._registrar_medicion(minutos_atras=45)

        call_command("generar_alerta")

        alerta = Alerta.objects.get(
            limnigrafo=self.limnigrafo,
            condicion="tiempo_advertencia",
        )
        self.assertTrue(
            UsuarioNotificacion.objects.filter(alerta=alerta, usuario=self.user).exists()
        )

    def test_cierra_alerta_activa_cuando_vuelve_a_normal(self):
        alerta = Alerta.objects.create(
            limnigrafo=self.limnigrafo,
            tipo="advertencia_limnigrafo",
            condicion="tiempo_advertencia",
            condicion_activa=True,
        )
        self._registrar_medicion(minutos_atras=0)

        call_command("generar_alerta")

        alerta.refresh_from_db()
        self.assertFalse(alerta.condicion_activa)
        self.assertEqual(alerta.estado, "solucionado")
        self.assertIsNotNone(alerta.fecha_cierre)
        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.estado, "normal")

    def test_genera_alerta_de_sin_conexion(self):
        self._registrar_medicion(minutos_atras=120)

        call_command("generar_alerta")

        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.estado, "sin_conexion")
        alerta = Alerta.objects.get(
            limnigrafo=self.limnigrafo,
            tipo="sin_conexion_limnigrafo",
            condicion="tiempo_peligro",
        )
        self.assertTrue(alerta.condicion_activa)

    def test_cambio_de_estado_cierra_la_condicion_del_estado_anterior(self):
        self._registrar_medicion(minutos_atras=45)
        call_command("generar_alerta")

        advertencia = Alerta.objects.get(
            limnigrafo=self.limnigrafo,
            tipo="advertencia_limnigrafo",
            condicion="tiempo_advertencia",
        )

        self._registrar_medicion(minutos_atras=120)
        call_command("generar_alerta")

        advertencia.refresh_from_db()
        self.assertFalse(advertencia.condicion_activa)
        self.assertEqual(advertencia.estado, "solucionado")
        self.assertTrue(
            Alerta.objects.filter(
                limnigrafo=self.limnigrafo,
                tipo="sin_conexion_limnigrafo",
                condicion_activa=True,
            ).exists()
        )
