from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Accion, Limnigrafo, ConfiguracionLimnigrafo, UsuarioNotificacion, Alerta, Ubicacion


class HistorialTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_superuser(
            username="testuser",
            email="testuser@example.com",
            password="testpassword",
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="otherpassword",
        )
        self.client.force_authenticate(user=self.user)

        self.list_url = reverse("historial-list")
        self.limnigrafo_create_payload = {
            "codigo": "LMG-H-001",
            "descripcion": "Historial Test",
            "memoria": 1024,
            "tipo_comunicacion": ["fisico-usb"],
            "bateria_min": 10.0,
            "tiempo_advertencia": "01:00:00",
            "tiempo_peligro": "02:00:00",
        }

    def _crear_limnigrafo(self, codigo: str = "LMG-H-001"):
        payload = {**self.limnigrafo_create_payload, "codigo": codigo}
        return self.client.post(reverse("limnigrafos-list"), payload, format="json")

    def test_list_historial(self):
        self._crear_limnigrafo()

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["results"]), 1)

        record = response.data["results"][0]
        self.assertEqual(record["model_name"], "Limnígrafo")
        self.assertEqual(record["type"], "created")
        self.assertEqual(record["username"], self.user.username)
        self.assertIn("description", record)
        self.assertIn("status", record)

    def test_filter_by_type(self):
        create_response = self._crear_limnigrafo(codigo="LMG-H-002")
        limnigrafo_id = create_response.data["id"]

        self.client.patch(
            reverse("limnigrafos-detail", args=[limnigrafo_id]),
            {
                "descripcion": "Actualizado",
                "memoria": 4096,
            },
            format="json",
        )

        response = self.client.get(self.list_url, {"type": "created"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for result in response.data["results"]:
            self.assertEqual(result["type"], "created")

        response = self.client.get(self.list_url, {"type": "modified"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for result in response.data["results"]:
            self.assertEqual(result["type"], "modified")

        modified_record = next(
            (
                item
                for item in response.data["results"]
                if str(item["object_id"]) == str(limnigrafo_id)
            ),
            None,
        )
        self.assertIsNotNone(modified_record)
        self.assertIn("old='", modified_record["description"])
        self.assertIn("new='", modified_record["description"])
        self.assertIn("descripcion:", modified_record["description"])
        self.assertIn("memoria:", modified_record["description"])
        self.assertNotIn("cambio(s)", modified_record["description"])

    def test_filter_by_user(self):
        Accion.objects.create(
            tipo_accion="created",
            entidad="Usuario",
            entidad_id="88",
            descripcion="Creó usuario de prueba.",
            usuario=self.user,
        )
        Accion.objects.create(
            tipo_accion="created",
            entidad="Usuario",
            entidad_id="99",
            descripcion="Creó usuario externo.",
            usuario=self.other_user,
        )

        response = self.client.get(self.list_url, {"usuario": str(self.user.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for result in response.data["results"]:
            self.assertEqual(result["username"], self.user.username)

    def test_filter_by_username(self):
        Accion.objects.create(
            tipo_accion="modified",
            entidad="Usuario",
            entidad_id="77",
            descripcion="Actualizó usuario de prueba.",
            usuario=self.user,
        )
        Accion.objects.create(
            tipo_accion="modified",
            entidad="Usuario",
            entidad_id="78",
            descripcion="Actualizó usuario externo.",
            usuario=self.other_user,
        )

        response = self.client.get(self.list_url, {"usuario": self.user.username})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for result in response.data["results"]:
            self.assertEqual(result["username"], self.user.username)

    def test_filter_by_date(self):
        old_action = Accion.objects.create(
            tipo_accion="created",
            entidad="Limnígrafo",
            entidad_id="1",
            descripcion="Acción vieja",
            usuario=self.user,
        )
        old_action.fecha_hora = timezone.now() - timedelta(days=5)
        old_action.save(update_fields=["fecha_hora"])

        Accion.objects.create(
            tipo_accion="created",
            entidad="Limnígrafo",
            entidad_id="2",
            descripcion="Acción de hoy",
            usuario=self.user,
        )

        today = date.today().isoformat()
        response = self.client.get(self.list_url, {"desde": today, "hasta": today})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["results"]), 1)

        for item in response.data["results"]:
            self.assertTrue(item["date"].startswith(today))

    def test_retrieve_historial(self):
        action = Accion.objects.create(
            tipo_accion="manual_data_load",
            entidad="Medición",
            entidad_id="321",
            descripcion="Carga manual.",
            usuario=self.user,
            metadata={"campo": "altura_agua"},
        )

        url = reverse("historial-detail", args=[action.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("metadata", response.data)
        self.assertEqual(response.data["metadata"]["campo"], "altura_agua")

    def test_hidden_technical_actions_are_excluded_from_list(self):
        visible_action = Accion.objects.create(
            tipo_accion="modified",
            entidad="Limnígrafo",
            entidad_id="123",
            descripcion="Modificó el limnígrafo 'LMG-H-010'.",
            usuario=self.user,
            metadata={"visible_in_historial": True},
        )
        hidden_action = Accion.objects.create(
            tipo_accion="modified",
            entidad="Limnígrafo",
            entidad_id="124",
            descripcion="Regeneró la clave API del limnígrafo 'LMG-H-011'.",
            usuario=self.user,
            metadata={"visible_in_historial": False},
        )

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_ids = [item["id"] for item in response.data["results"]]
        self.assertIn(visible_action.id, result_ids)
        self.assertNotIn(hidden_action.id, result_ids)

    def test_legacy_api_key_rotation_actions_are_excluded_from_list(self):
        legacy_hidden = Accion.objects.create(
            tipo_accion="modified",
            entidad="Limnígrafo",
            entidad_id="200",
            descripcion="Regeneró la clave API del limnígrafo 'LMG-H-200'.",
            usuario=self.user,
            metadata={},
        )
        normal_action = Accion.objects.create(
            tipo_accion="modified",
            entidad="Limnígrafo",
            entidad_id="201",
            descripcion="Modificó el limnígrafo 'LMG-H-201'.",
            usuario=self.user,
            metadata={},
        )

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_ids = [item["id"] for item in response.data["results"]]
        self.assertIn(normal_action.id, result_ids)
        self.assertNotIn(legacy_hidden.id, result_ids)

    def test_manual_data_load_logged(self):
        limnigrafo = Limnigrafo.objects.create(
            codigo="LMG-H-010",
            descripcion="Historial Test",
            memoria=1024,
            tipo_de_comunicacion=["fisico-usb"],
            bateria_actual=12.0,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=limnigrafo,
            bateria_min=10.0,
            tiempo_advertencia=3600,
            tiempo_peligro=7200,
        )

        response = self.client.post(
            reverse("medicion-list"),
            {
                "limnigrafo": limnigrafo.id,
                "fecha_hora": timezone.now().isoformat(),
                "altura_agua": 1.2,
                "presion": 1.1,
                "temperatura": 22.0,
                "nivel_de_bateria": 11.8,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        history_response = self.client.get(self.list_url, {"type": "manual_data_load"})
        self.assertEqual(history_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(history_response.data["results"]), 1)
        self.assertEqual(history_response.data["results"][0]["model_name"], "Medición")

    def test_read_only(self):
        response = self.client.post(self.list_url, {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        action = Accion.objects.create(
            tipo_accion="deleted",
            entidad="Usuario",
            entidad_id="11",
            descripcion="Borrado de prueba.",
            usuario=self.user,
        )
        url = reverse("historial-detail", args=[action.id])

        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_create_update_delete_ubicacion_logged(self):
        create_response = self.client.post(
            reverse("ubicacion-list"),
            {
                "nombre": "Río Olivia",
                "latitud": -54.81,
                "longitud": -68.31,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        ubicacion_id = create_response.data["id"]

        update_response = self.client.patch(
            reverse("ubicacion-detail", args=[ubicacion_id]),
            {"nombre": "Río Olivia Norte"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        delete_response = self.client.delete(reverse("ubicacion-detail", args=[ubicacion_id]))
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        acciones = list(Accion.objects.filter(entidad="Ubicación").order_by("id"))
        self.assertEqual([accion.tipo_accion for accion in acciones], ["created", "modified", "deleted"])
        self.assertEqual(acciones[0].descripcion, "Creó la ubicación 'Río Olivia'.")
        self.assertIn("Río Olivia Norte", acciones[1].descripcion)
        self.assertEqual(acciones[2].descripcion, "Eliminó la ubicación 'Río Olivia Norte'.")

    def test_assign_location_to_limnigrafo_logged(self):
        limnigrafo_response = self._crear_limnigrafo(codigo="LMG-H-020")
        self.assertEqual(limnigrafo_response.status_code, status.HTTP_201_CREATED)
        limnigrafo_id = limnigrafo_response.data["id"]

        ubicacion = Ubicacion.objects.create(
            nombre="Río Pipo",
            latitud=-54.79,
            longitud=-68.28,
        )

        response = self.client.patch(
            reverse("limnigrafos-detail", args=[limnigrafo_id]),
            {"ubicacion_id": ubicacion.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        accion = Accion.objects.filter(entidad="Limnígrafo", entidad_id=str(limnigrafo_id)).latest("id")
        self.assertEqual(accion.tipo_accion, "modified")
        self.assertEqual(accion.descripcion, "Asignó una nueva ubicación al limnígrafo 'LMG-H-020'.")
        self.assertEqual(accion.metadata["ubicacion_nueva"], "Río Pipo")

    def test_change_password_logged_without_sensitive_data(self):
        response = self.client.post(
            reverse("usuarios-cambiar-password", args=[self.other_user.id]),
            {
                "password_actual": "otherpassword",
                "password_nueva": "nueva-password-segura",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        accion = Accion.objects.filter(entidad="Usuario", entidad_id=str(self.other_user.id)).latest("id")
        self.assertEqual(accion.descripcion, "Cambió la contraseña del usuario 'otheruser'.")
        metadata_text = str(accion.metadata).lower()
        descripcion_text = accion.descripcion.lower()
        self.assertNotIn("password_actual", metadata_text)
        self.assertNotIn("password_nueva", metadata_text)
        self.assertNotIn("otherpassword", metadata_text)
        self.assertNotIn("nueva-password-segura", metadata_text)
        self.assertNotIn("password", descripcion_text.replace("contraseña", ""))

    def test_password_recovery_reset_logged_without_sensitive_data(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(
            reverse("recuperar_password_nueva"),
            {
                "password": "otra-clave-super-segura",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        accion = Accion.objects.filter(entidad="Usuario", entidad_id=str(self.other_user.id)).latest("id")
        self.assertEqual(accion.descripcion, "Restableció la contraseña del usuario 'otheruser'.")
        metadata_text = str(accion.metadata).lower()
        self.assertNotIn("password", metadata_text)
        self.assertNotIn("otra-clave-super-segura", metadata_text)
        self.client.force_authenticate(user=self.user)

    def test_import_summary_logged_grouped(self):
        limnigrafo = Limnigrafo.objects.create(
            codigo="LMG-H-040",
            descripcion="Import Test",
            memoria=1024,
            tipo_de_comunicacion=["fisico-usb"],
            bateria_actual=12.0,
        )

        response = self.client.post(
            reverse("medicion-import-summary"),
            {
                "file_name": "mediciones_junio.csv",
                "fuente": "import_csv",
                "limnigrafo_id": limnigrafo.id,
                "loaded_rows": 350,
                "rejected_rows": 12,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        accion = Accion.objects.filter(tipo_accion="import_data_load").latest("id")
        self.assertEqual(
            accion.descripcion,
            "Importó 350 mediciones desde 'mediciones_junio.csv' para el limnígrafo 'LMG-H-040'.",
        )
        self.assertEqual(accion.metadata["filas_cargadas"], 350)
        self.assertEqual(accion.metadata["filas_rechazadas"], 12)

    def test_failed_operation_does_not_create_audit_record(self):
        acciones_antes = Accion.objects.count()
        response = self.client.post(
            reverse("ubicacion-list"),
            {
                "nombre": "Inválida",
                "latitud": -54.8,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Accion.objects.count(), acciones_antes)

    def test_generate_key_does_not_store_api_key_secret(self):
        limnigrafo = Limnigrafo.objects.create(
            codigo="LMG-H-050",
            descripcion="Token Test",
            memoria=1024,
            tipo_de_comunicacion=["fisico-usb"],
            bateria_actual=12.0,
        )

        response = self.client.post(reverse("limnigrafos-generate-key", args=[limnigrafo.id]), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        accion = Accion.objects.filter(entidad="Limnígrafo", entidad_id=str(limnigrafo.id)).latest("id")
        self.assertNotIn("secret_key", accion.metadata)
        self.assertNotIn("key_name", accion.metadata)
