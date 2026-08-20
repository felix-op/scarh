from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from api.models import Limnigrafo, ConfiguracionLimnigrafo
from api.models.medicion import Medicion
from datetime import datetime
from zoneinfo import ZoneInfo
from unittest.mock import patch
from urllib.parse import quote_plus


class LegacyGetTests(APITestCase):
    def setUp(self):
        # Create default limnígrafo LM-RIO-OLIVIA-01
        self.limnigrafo = Limnigrafo.objects.create(
            codigo='LM-RIO-OLIVIA-01',
            descripcion='Limnígrafo en el Río Olivia, zona este de la ciudad.',
            memoria=2147483647,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_actual=10.6,
            estado='normal'
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=self.limnigrafo,
            tiempo_advertencia=3600,
            tiempo_peligro=7200,
            bateria_min=10.0,
            altura_minima_agua=0.5,
            altura_maxima_agua=2.8,
            temperatura_minima=-5.0,
            temperatura_maxima=35.0,
            presion_minima=950.0,
            presion_maxima=1050.0,
        )
        self.endpoint_url = '/save-get.php'

    def test_successful_legacy_get_ingestion(self):
        # Format: DD-MM-YYYY HH:MM height battery
        dato = "10-08-2026 15:30 12,5 11,8"
        response = self.client.get(self.endpoint_url, {'dato': dato})
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.content, b"")
        
        # Check measurement was saved
        self.assertEqual(Medicion.objects.count(), 1)
        medicion = Medicion.objects.first()
        
        self.assertEqual(medicion.limnigrafo, self.limnigrafo)
        self.assertEqual(medicion.altura_agua, 12.5)
        self.assertEqual(medicion.nivel_de_bateria, 11.8)
        self.assertEqual(medicion.fuente, 'automatico')
        
        # Check datetime is correct in Ushuaia timezone
        tz_ush = ZoneInfo('America/Argentina/Ushuaia')
        expected_dt = datetime(2026, 8, 10, 15, 30, tzinfo=tz_ush)
        self.assertEqual(medicion.fecha_hora, expected_dt)

    def test_legacy_get_missing_dato(self):
        response = self.client.get(self.endpoint_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Missing 'dato'", response.content.decode())
        self.assertEqual(Medicion.objects.count(), 0)

    def test_legacy_get_invalid_format(self):
        # Wrong number of parts
        dato = "10-08-2026 15:30"
        response = self.client.get(self.endpoint_url, {'dato': dato})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Wrong format for parts
        dato = "invalid-date 15:30 12,5 11,8"
        response = self.client.get(self.endpoint_url, {'dato': dato})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Medicion.objects.count(), 0)

    def test_legacy_get_ingestion_without_battery(self):
        dato = "20-08-2026 13:4 47,7"

        response = self.client.get(self.endpoint_url, {'dato': dato})

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        medicion = Medicion.objects.get()
        self.assertEqual(medicion.altura_agua, 47.7)
        self.assertIsNone(medicion.nivel_de_bateria)

    def test_legacy_get_accepts_a_double_url_encoded_value(self):
        dato = quote_plus("10-08-2026 15:30 12,5 11,8")

        response = self.client.get(self.endpoint_url, {'dato': dato})

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Medicion.objects.count(), 1)

    def test_legacy_get_duplicate_is_acknowledged_without_creating_another_measurement(self):
        dato = "10-08-2026 15:30 12,5 11,8"

        first_response = self.client.get(self.endpoint_url, {'dato': dato})
        retry_response = self.client.get(self.endpoint_url, {'dato': dato})

        self.assertEqual(first_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(retry_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(retry_response.content, b"")
        self.assertEqual(Medicion.objects.count(), 1)

    def test_legacy_get_sentinels_success(self):
        sentinels = [-1000.0, -1001.0, -1002.0, -1003.0]
        
        for idx, sentinel in enumerate(sentinels):
            # Format: DD-MM-YYYY HH:MM height battery
            # Using different minutes to avoid duplicates constraint
            dato = f"10-08-2026 15:{10 + idx} {str(sentinel).replace('.', ',')} 11,8"
            response = self.client.get(self.endpoint_url, {'dato': dato})
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT, f"Failed for sentinel {sentinel}")
            
        self.assertEqual(Medicion.objects.count(), len(sentinels))
        for sentinel in sentinels:
            self.assertTrue(Medicion.objects.filter(altura_agua=sentinel).exists())

    def test_legacy_get_custom_default_limnigrafo(self):
        # Create another limnigrafo
        custom_lim = Limnigrafo.objects.create(
            codigo='LM-CUSTOM-01',
            descripcion='Custom Limnigrafo',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_actual=11.0,
            estado='normal'
        )
        
        with patch.dict('os.environ', {'DEFAULT_LIMNIGRAFO_CODIGO': 'LM-CUSTOM-01'}):
            dato = "10-08-2026 15:30 12,5 11,8"
            response = self.client.get(self.endpoint_url, {'dato': dato})
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            
            medicion = Medicion.objects.first()
            self.assertEqual(medicion.limnigrafo, custom_lim)
