from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.models import Alerta, ConfiguracionLimnigrafo, Limnigrafo, UsuarioNotificacion
from api.models.medicion import Medicion
from rest_framework_api_key.models import APIKey
from datetime import timedelta
from django.utils.dateparse import parse_datetime

class MedicionTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_superuser(username='testuser', password='testpassword', email='testuser@example.com')
        
        self.limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-001',
            descripcion='Limnigrafo Test',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_actual=11.5,
            estado='normal'
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=self.limnigrafo,
            bateria_min=10.0,
            tiempo_advertencia=3600,
            tiempo_peligro=7200,
            altura_minima_agua=0.5,
            altura_maxima_agua=2.8,
            temperatura_minima=-5.0,
            temperatura_maxima=35.0,
            presion_minima=950.0,
            presion_maxima=1050.0,
        )
        
        self.list_url = reverse('medicion-list')
        self.validate_import_url = reverse('medicion-validate-import')
        self.bulk_import_url = reverse('medicion-bulk-import')
        
        self.api_key, self.key_secret = APIKey.objects.create_key(name="test-key")
    def test_list_mediciones(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_medicion_manual(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 2.5,
            'nivel_de_bateria': 11.8,
            'presion': 1013,
            'temperatura': 20,
            'fecha_hora': '2024-01-01T10:00:00Z'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['fuente'], 'manual')
        self.assertEqual(Medicion.objects.count(), 1)

    def test_create_medicion_import_csv(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 2.55,
            'nivel_de_bateria': 11.6,
            'fecha_hora': '2024-01-01T10:05:00Z',
            'fuente': 'import_csv',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['fuente'], 'import_csv')

    def test_create_medicion_automatico(self):
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f"Api-Key {self.key_secret}")
        
        fecha_hora = '2024-01-01T10:00:00Z'
        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 2.6,
            'nivel_de_bateria': 11.7,
            'fecha_hora': fecha_hora
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['fuente'], 'automatico')
        self.assertEqual(
            Medicion.objects.get().fecha_hora,
            parse_datetime(fecha_hora),
        )

    def test_create_medicion_automatico_sin_limnigrafo_en_body(self):
        # Generar clave de API estructurada como LMG-{id}
        key_name = f"LMG-{self.limnigrafo.id}_LM99_desc"
        _, key_secret = APIKey.objects.create_key(name=key_name)
        
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f"Api-Key {key_secret}")
        
        data = {
            'altura_agua': 2.65,
            'nivel_de_bateria': 11.9,
            'fecha_hora': '2024-01-01T10:00:00Z'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['fuente'], 'automatico')
        self.assertEqual(response.data['limnigrafo'], self.limnigrafo.id)

    def test_create_medicion_automatico_con_limnigrafo_distinto_falla(self):
        # Crear otro limnígrafo
        otro_limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-999',
            descripcion='Otro Limnigrafo',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_actual=11.5,
            estado='normal'
        )
        
        # Generar clave de API estructurada para el primer limnígrafo
        key_name = f"LMG-{self.limnigrafo.id}_LM99_desc"
        _, key_secret = APIKey.objects.create_key(name=key_name)
        
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f"Api-Key {key_secret}")
        
        # Intentar enviar datos indicando el ID del otro limnígrafo en el body
        data = {
            'limnigrafo': otro_limnigrafo.id,
            'altura_agua': 2.65,
            'nivel_de_bateria': 11.9,
            'fecha_hora': '2024-01-01T10:00:00Z'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('descripcion_tecnica', response.data)
        self.assertIn("El limnígrafo enviado no coincide con la clave de API utilizada.", response.data['descripcion_tecnica'])
    

    
    def test_create_medicion_manual_sin_limnigrafo_falla(self):
        self.client.force_authenticate(user=self.user)
        # Intentar crear una medición manual sin pasar el campo limnigrafo
        data = {
            'altura_agua': 2.5,
            'nivel_de_bateria': 11.8,
            'presion': 1013,
            'temperatura': 20,
            'fecha_hora': '2024-01-01T10:00:00Z'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('descripcion_tecnica', response.data)
        self.assertIn("El campo limnígrafo es requerido.", response.data['descripcion_tecnica'])

    def test_reject_duplicate_medicion_for_same_limnigrafo_and_fecha_hora(self):
        self.client.force_authenticate(user=self.user)
        fecha_hora = '2024-01-01T10:00:00Z'
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=2.5,
            fecha_hora=fecha_hora,
            fuente='manual',
        )

        response = self.client.post(self.list_url, {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 2.7,
            'fecha_hora': fecha_hora,
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Ya existe una medición para este limnígrafo en esa fecha y hora.', response.data['descripcion_usuario'])

    def test_allow_same_fecha_hora_for_different_limnigrafos(self):
        self.client.force_authenticate(user=self.user)
        other_limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-010',
            descripcion='Other',
            memoria=1024,
            bateria_actual=12,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=other_limnigrafo,
            bateria_min=10,
            tiempo_advertencia=3600,
            tiempo_peligro=7200,
        )

        fecha_hora = '2024-01-01T10:00:00Z'
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=2.5,
            fecha_hora=fecha_hora,
            fuente='manual',
        )

        response = self.client.post(self.list_url, {
            'limnigrafo': other_limnigrafo.id,
            'altura_agua': 2.7,
            'fecha_hora': fecha_hora,
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_reject_duplicate_idempotency_key_for_same_limnigrafo(self):
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f"Api-Key {self.key_secret}")

        first_response = self.client.post(self.list_url, {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 2.1,
            'fecha_hora': '2024-01-01T10:00:00Z',
            'idempotency_key': 'lm-1-20240101-100000',
        }, format='json')
        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)

        second_response = self.client.post(self.list_url, {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 2.2,
            'fecha_hora': '2024-01-01T10:05:00Z',
            'idempotency_key': 'lm-1-20240101-100000',
        }, format='json')

        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Ya se procesó una medición con esta clave de idempotencia', second_response.data['descripcion_usuario'])

    def test_reject_impossible_values_before_saving(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.list_url, {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': -1,
            'presion': 0,
            'temperatura': 140,
            'nivel_de_bateria': -2,
            'fecha_hora': '2024-01-01T10:00:00Z',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Medicion.objects.count(), 0)
        self.assertIn('altura_agua', response.data['descripcion_usuario'])

    def test_create_medicion_updates_limnigrafo_state(self):
        self.client.force_authenticate(user=self.user)
        
        self.assertEqual(self.limnigrafo.bateria_actual, 11.5)
        
        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 3.0,
            'nivel_de_bateria': 9.0, 
            'fecha_hora': timezone.now().isoformat()
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.limnigrafo.refresh_from_db()
        
        self.assertEqual(self.limnigrafo.bateria_actual, 9.0)
        
        self.assertIsNotNone(self.limnigrafo.ultima_conexion)
        
        self.assertEqual(self.limnigrafo.estado, 'advertencia')
        self.assertTrue(Alerta.objects.filter(tipo='advertencia_limnigrafo', limnigrafo=self.limnigrafo).exists())
        self.assertTrue(UsuarioNotificacion.objects.filter(usuario=self.user).exists())

    def test_create_medicion_sets_peligro_when_water_height_reaches_maximum(self):
        self.client.force_authenticate(user=self.user)

        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 3.0,
            'nivel_de_bateria': 11.5,
            'fecha_hora': timezone.now().isoformat()
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.estado, 'peligro')
        self.assertTrue(Alerta.objects.filter(tipo='peligro_limnigrafo', limnigrafo=self.limnigrafo).exists())

    def test_create_medicion_creates_out_of_range_alert(self):
        self.client.force_authenticate(user=self.user)

        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 4.2,
            'nivel_de_bateria': 11.2,
            'presion': 1105,
            'temperatura': 42,
            'fecha_hora': timezone.now().isoformat(),
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        alerta = Alerta.objects.filter(tipo='fuera_rango_medicion', limnigrafo=self.limnigrafo).latest('id')
        self.assertIn('altura_agua', alerta.descripcion)
        self.assertIn('temperatura', alerta.descripcion)
        self.assertIn('presion', alerta.descripcion)
        self.assertTrue(UsuarioNotificacion.objects.filter(alerta=alerta, usuario=self.user).exists())

    def test_create_medicion_sets_fuera_de_rango_when_time_exceeds_peligro_threshold(self):
        self.client.force_authenticate(user=self.user)

        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 2.0,
            'nivel_de_bateria': 11.0,
            'fecha_hora': (timezone.now() - timedelta(hours=7)).isoformat()
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.estado, 'fuera_de_rango')

    def test_retrieve_medicion(self):
        self.client.force_authenticate(user=self.user)
        medicion = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.0,
            fecha_hora='2024-01-01T12:00:00Z',
            fuente='manual'
        )
        url = reverse('medicion-detail', args=[medicion.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], medicion.id)

    def test_filter_medicion_by_limnigrafo(self):
        self.client.force_authenticate(user=self.user)
        
        other_limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-002',
            descripcion='Other',
            memoria=1024,
            bateria_actual=12,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=other_limnigrafo,
            bateria_min=10,
            tiempo_advertencia=3600,
            tiempo_peligro=7200,
        )
        Medicion.objects.create(limnigrafo=self.limnigrafo, altura_agua=1.0, fecha_hora='2024-01-01T10:00:00Z')
        Medicion.objects.create(limnigrafo=other_limnigrafo, altura_agua=2.0, fecha_hora='2024-01-01T11:00:00Z')
        
        response = self.client.get(self.list_url, {'limnigrafo': self.limnigrafo.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['limnigrafo'], self.limnigrafo.id)

    def test_filter_medicion_by_multiple_limnigrafos(self):
        self.client.force_authenticate(user=self.user)

        other_limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-003',
            descripcion='Other multi',
            memoria=1024,
            bateria_actual=12,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=other_limnigrafo,
            bateria_min=10,
            tiempo_advertencia=3600,
            tiempo_peligro=7200,
        )
        another_limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-004',
            descripcion='Other excluded',
            memoria=1024,
            bateria_actual=12,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=another_limnigrafo,
            bateria_min=10,
            tiempo_advertencia=3600,
            tiempo_peligro=7200,
        )

        Medicion.objects.create(limnigrafo=self.limnigrafo, altura_agua=1.0, fecha_hora='2024-01-01T10:00:00Z')
        Medicion.objects.create(limnigrafo=other_limnigrafo, altura_agua=2.0, fecha_hora='2024-01-01T11:00:00Z')
        Medicion.objects.create(limnigrafo=another_limnigrafo, altura_agua=3.0, fecha_hora='2024-01-01T12:00:00Z')

        response = self.client.get(self.list_url, {'limnigrafo': f'{self.limnigrafo.id},{other_limnigrafo.id}'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        self.assertSetEqual(
            {row['limnigrafo'] for row in response.data['results']},
            {self.limnigrafo.id, other_limnigrafo.id},
        )

    def test_filter_medicion_by_fuente(self):
        self.client.force_authenticate(user=self.user)
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.1,
            fecha_hora='2024-01-01T10:00:00Z',
            fuente='manual'
        )
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.2,
            fecha_hora='2024-01-01T11:00:00Z',
            fuente='automatico'
        )

        response = self.client.get(self.list_url, {'fuente': 'manual'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['fuente'], 'manual')


    def test_filter_medicion_by_date_range(self):
        self.client.force_authenticate(user=self.user)
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.0,
            fecha_hora='2024-01-01T08:00:00Z',
            fuente='manual'
        )
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=2.0,
            fecha_hora='2024-01-01T10:00:00Z',
            fuente='manual'
        )
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=3.0,
            fecha_hora='2024-01-01T12:00:00Z',
            fuente='manual'
        )

        response = self.client.get(self.list_url, {
            'fecha_desde': '2024-01-01T09:00:00Z',
            'fecha_hasta': '2024-01-01T11:00:00Z',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['altura_agua'], 2.0)

    def test_create_medicion_duplicate_limnigrafo_and_fecha_hora_fails(self):
        self.client.force_authenticate(user=self.user)
        # Crear primera medición
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.5,
            fecha_hora='2024-01-01T10:00:00Z',
            fuente='manual'
        )
        # Intentar crear una segunda medición para el mismo limnígrafo y fecha_hora
        data = {
            'limnigrafo': self.limnigrafo.id,
            'altura_agua': 2.5,
            'nivel_de_bateria': 11.8,
            'fecha_hora': '2024-01-01T10:00:00Z'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('descripcion_tecnica', response.data)
        self.assertIn("Ya existe una medición para este limnígrafo en la fecha y hora especificadas.", response.data['descripcion_tecnica'])

    def test_filter_medicion_by_search_matches_limnigrafo_code(self):
        self.client.force_authenticate(user=self.user)

        other_limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-SEARCH',
            descripcion='Punto de control norte',
            memoria=1024,
            bateria_actual=12,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=other_limnigrafo,
            bateria_min=10,
            tiempo_advertencia=3600,
            tiempo_peligro=7200,
        )

        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.0,
            fecha_hora='2024-01-01T10:00:00Z',
            fuente='manual'
        )
        target = Medicion.objects.create(
            limnigrafo=other_limnigrafo,
            altura_agua=2.0,
            fecha_hora='2024-01-01T11:00:00Z',
            fuente='automatico'
        )

        response = self.client.get(self.list_url, {'search': 'search'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], target.id)

    def test_filter_medicion_by_search_matches_numeric_value(self):
        self.client.force_authenticate(user=self.user)

        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.45,
            fecha_hora='2024-01-01T10:00:00Z',
            fuente='manual'
        )
        target = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=9.99,
            presion=1005.4,
            temperatura=6.7,
            nivel_de_bateria=87.0,
            fecha_hora='2024-01-01T11:00:00Z',
            fuente='import_csv'
        )

        response = self.client.get(self.list_url, {'search': '1005.4'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], target.id)

    def test_validate_import_detects_duplicate_in_file_and_database(self):
        self.client.force_authenticate(user=self.user)
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.2,
            fecha_hora='2024-01-01T10:00:00Z',
            fuente='manual',
        )

        response = self.client.post(
            self.validate_import_url,
            {
                "file_name": "mediciones.csv",
                "fuente": "import_csv",
                "rows": [
                    {
                        "row_number": 2,
                        "limnigrafo_id": self.limnigrafo.id,
                        "fecha_hora": "2024-01-01T10:00:00Z",
                        "altura_agua": 1.2,
                        "presion": 1000.0,
                        "temperatura": 12.0,
                        "nivel_de_bateria": 11.0,
                    },
                    {
                        "row_number": 3,
                        "limnigrafo_id": self.limnigrafo.id,
                        "fecha_hora": "2024-01-01T11:00:00Z",
                        "altura_agua": 1.3,
                        "presion": 1001.0,
                        "temperatura": 12.5,
                        "nivel_de_bateria": 11.1,
                    },
                    {
                        "row_number": 4,
                        "limnigrafo_id": self.limnigrafo.id,
                        "fecha_hora": "2024-01-01T11:00:00Z",
                        "altura_agua": 1.4,
                        "presion": 1002.0,
                        "temperatura": 13.0,
                        "nivel_de_bateria": 11.2,
                    },
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_valid"])
        rows_by_number = {row["rowNumber"]: row for row in response.data["rows"]}
        self.assertEqual(rows_by_number[2]["status"], "duplicate_database")
        self.assertEqual(rows_by_number[3]["status"], "duplicate_file")
        self.assertEqual(rows_by_number[4]["status"], "duplicate_file")

    def test_bulk_import_creates_measurements_transactionally(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.bulk_import_url,
            {
                "file_name": "mediciones_lote.csv",
                "fuente": "import_csv",
                "rows": [
                    {
                        "row_number": 2,
                        "limnigrafo_id": self.limnigrafo.id,
                        "fecha_hora": "2024-01-01T10:00:00Z",
                        "altura_agua": 1.2,
                        "presion": 1000.0,
                        "temperatura": 12.0,
                        "nivel_de_bateria": 10.5,
                    },
                    {
                        "row_number": 3,
                        "limnigrafo_id": self.limnigrafo.id,
                        "fecha_hora": "2024-01-01T11:00:00Z",
                        "altura_agua": 1.4,
                        "presion": 1001.0,
                        "temperatura": 13.0,
                        "nivel_de_bateria": 10.2,
                    },
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["imported_rows"], 2)
        self.assertEqual(Medicion.objects.count(), 2)

        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.bateria_actual, 10.2)
        self.assertEqual(self.limnigrafo.ultima_conexion, parse_datetime("2024-01-01T11:00:00Z"))

    def test_bulk_import_rejects_invalid_batch_without_saving(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.bulk_import_url,
            {
                "file_name": "mediciones_invalidas.csv",
                "fuente": "import_csv",
                "rows": [
                    {
                        "row_number": 2,
                        "limnigrafo_id": self.limnigrafo.id,
                        "fecha_hora": "2024-01-01T10:00:00Z",
                        "altura_agua": 1.2,
                        "presion": 1000.0,
                        "temperatura": 12.0,
                        "nivel_de_bateria": 10.5,
                    },
                    {
                        "row_number": 3,
                        "limnigrafo_id": self.limnigrafo.id,
                        "fecha_hora": "2024-01-01T11:00:00Z",
                        "altura_agua": None,
                        "presion": 1001.0,
                        "temperatura": 13.0,
                        "nivel_de_bateria": 10.2,
                    },
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Medicion.objects.count(), 0)
