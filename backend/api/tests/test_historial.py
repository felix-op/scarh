from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Accion, Limnigrafo


class HistorialTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
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
            "bateria_max": 12.0,
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
            entidad="Métrica",
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

    def test_manual_data_load_logged(self):
        limnigrafo = Limnigrafo.objects.create(
            codigo="LMG-H-010",
            descripcion="Historial Test",
            memoria=1024,
            tipo_de_comunicacion=["fisico-usb"],
            bateria_max=12.0,
            bateria_min=10.0,
            bateria_actual=12.0,
            tiempo_advertencia=time(1, 0),
            tiempo_peligro=time(2, 0),
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
        self.assertEqual(history_response.data["results"][0]["model_name"], "Métrica")

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
