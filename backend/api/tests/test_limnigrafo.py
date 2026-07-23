from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.models import Limnigrafo, ConfiguracionLimnigrafo
from api.models.medicion import Medicion
from datetime import time, timedelta
from rest_framework_api_key.models import APIKey

class LimnigrafoTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_superuser(username='testuser', password='testpassword', email='testuser@example.com')
        self.client.force_authenticate(user=self.user)

        self.limnigrafo_data = {
            'codigo': 'LMG-001',
            'descripcion': 'Limnigrafo de prueba',
            'memoria': 1024,
            'tipo_comunicacion': ['internet-https-4G'],
            'bateria_min': 11.0,
            'tiempo_advertencia': '01:00:00',
            'tiempo_peligro': '02:00:00',
            'estado': 'normal'
        }
        self.limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-EXISTING',
            descripcion='Limnigrafo existente',
            memoria=2048,
            tipo_de_comunicacion=['fisico-usb'],
            radio_cobertura_metros=350,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=self.limnigrafo,
            bateria_min=10.0,
            tiempo_advertencia=1800,  # 30 minutos (1800 segundos)
            tiempo_peligro=3600,      # 1 hora (3600 segundos)
            altura_maxima_agua=3.0,
        )
        self.list_url = reverse('limnigrafos-list')
        self.detail_url = reverse('limnigrafos-detail', args=[self.limnigrafo.id])

    def test_list_limnigrafos(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_limnigrafo(self):
        response = self.client.post(self.list_url, self.limnigrafo_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Limnigrafo.objects.count(), 2)
        self.assertEqual(Limnigrafo.objects.get(codigo='LMG-001').descripcion, 'Limnigrafo de prueba')

    def test_create_limnigrafo_duplicate_code(self):
        duplicate_data = self.limnigrafo_data.copy()
        duplicate_data['codigo'] = 'LMG-EXISTING'
        response = self.client.post(self.list_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_limnigrafo(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['codigo'], self.limnigrafo.codigo)
        self.assertEqual(response.data['radio_cobertura_metros'], 350)

    def test_list_refreshes_estado_by_time_threshold(self):
        medicion = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=2.0,
            fecha_hora=timezone.now() - timedelta(minutes=45),
            fuente='automatico',
        )
        self.limnigrafo.ultima_medicion = medicion
        self.limnigrafo.estado = 'normal'
        self.limnigrafo.save(update_fields=['ultima_medicion', 'estado'])

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.estado, 'advertencia')

    def test_list_sets_sin_conexion_when_time_exceeds_peligro_threshold(self):
        medicion = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=2.0,
            fecha_hora=timezone.now() - timedelta(hours=2),
            fuente='automatico',
        )
        self.limnigrafo.ultima_medicion = medicion
        self.limnigrafo.estado = 'normal'
        self.limnigrafo.save(update_fields=['ultima_medicion', 'estado'])

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.estado, 'sin_conexion')

    def test_list_recovers_estado_from_sin_conexion_when_sensor_recovers(self):
        medicion = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=2.0,
            fecha_hora=timezone.now(),
            fuente='automatico',
        )
        self.limnigrafo.ultima_medicion = medicion
        self.limnigrafo.bateria_actual = 12.0
        self.limnigrafo.estado = 'sin_conexion'
        self.limnigrafo.save(update_fields=['ultima_medicion', 'bateria_actual', 'estado'])

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.estado, 'normal')

    def test_list_sets_peligro_when_water_height_reaches_maximum(self):
        medicion = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=3.2,
            fecha_hora=timezone.now(),
            fuente='automatico',
        )
        self.limnigrafo.ultima_medicion = medicion
        self.limnigrafo.estado = 'normal'
        self.limnigrafo.save(update_fields=['ultima_medicion', 'estado'])

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.estado, 'peligro')

    def test_update_limnigrafo(self):
        update_data = {
            'descripcion': 'Descripcion actualizada',
            'radio_cobertura_metros': 900,
        }
        response = self.client.patch(self.detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.descripcion, 'Descripcion actualizada')
        self.assertEqual(self.limnigrafo.radio_cobertura_metros, 900)

    def test_filter_limnigrafos_by_ultima_conexion_desde(self):
        reciente = timezone.now() - timedelta(hours=1)
        antigua = timezone.now() - timedelta(days=4)

        medicion_reciente = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=2.0,
            fecha_hora=reciente,
            fuente='automatico',
        )
        self.limnigrafo.ultima_medicion = medicion_reciente
        self.limnigrafo.save(update_fields=['ultima_medicion'])

        limnigrafo_antiguo = Limnigrafo.objects.create(
            codigo='LMG-OLD',
            descripcion='Limnigrafo antiguo',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
        )
        medicion_antigua = Medicion.objects.create(
            limnigrafo=limnigrafo_antiguo,
            altura_agua=2.0,
            fecha_hora=antigua,
            fuente='automatico',
        )
        limnigrafo_antiguo.ultima_medicion = medicion_antigua
        limnigrafo_antiguo.save(update_fields=['ultima_medicion'])
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=limnigrafo_antiguo,
            bateria_min=10.0,
            tiempo_advertencia=1800,
            tiempo_peligro=3600
        )

        response = self.client.get(self.list_url, {
            'ultima_conexion_desde': (timezone.now() - timedelta(days=1)).isoformat(),
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        codigos = {item['codigo'] for item in response.data['results']}
        self.assertIn('LMG-EXISTING', codigos)
        self.assertNotIn('LMG-OLD', codigos)

    def test_filter_limnigrafos_by_ultima_conexion_hasta(self):
        reciente = timezone.now() - timedelta(hours=1)
        antigua = timezone.now() - timedelta(days=4)

        medicion_reciente = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=2.0,
            fecha_hora=reciente,
            fuente='automatico',
        )
        self.limnigrafo.ultima_medicion = medicion_reciente
        self.limnigrafo.save(update_fields=['ultima_medicion'])

        limnigrafo_antiguo = Limnigrafo.objects.create(
            codigo='LMG-OLDER',
            descripcion='Limnigrafo mas antiguo',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
        )
        medicion_antigua = Medicion.objects.create(
            limnigrafo=limnigrafo_antiguo,
            altura_agua=2.0,
            fecha_hora=antigua,
            fuente='automatico',
        )
        limnigrafo_antiguo.ultima_medicion = medicion_antigua
        limnigrafo_antiguo.save(update_fields=['ultima_medicion'])
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=limnigrafo_antiguo,
            bateria_min=10.0,
            tiempo_advertencia=1800,
            tiempo_peligro=3600
        )

        response = self.client.get(self.list_url, {
            'ultima_conexion_hasta': (timezone.now() - timedelta(days=2)).isoformat(),
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        codigos = {item['codigo'] for item in response.data['results']}
        self.assertIn('LMG-OLDER', codigos)
        self.assertNotIn('LMG-EXISTING', codigos)

    def test_delete_limnigrafo(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Limnigrafo.objects.count(), 0)


    def test_generate_key_action(self):
        url = reverse('limnigrafos-generate-key', args=[self.limnigrafo.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('secret_key', response.data)
        self.assertIn('key_prefix', response.data)

    def test_key_rotation_invalidates_old_key(self):
        url = reverse('limnigrafos-generate-key', args=[self.limnigrafo.id])
        response1 = self.client.post(url)
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        key_prefix1 = response1.data['key_prefix']
        self.assertTrue(APIKey.objects.filter(prefix=key_prefix1).exists())
        response2 = self.client.post(url)
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        key_prefix2 = response2.data['key_prefix']
        self.assertFalse(APIKey.objects.filter(prefix=key_prefix1).exists())
        self.assertTrue(APIKey.objects.filter(prefix=key_prefix2).exists())

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_configuracion_action(self):
        url = reverse('limnigrafos-configuracion', args=[self.limnigrafo.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bateria_min'], 10.0)

    def test_update_configuracion_action(self):
        url = reverse('limnigrafos-configuracion', args=[self.limnigrafo.id])
        update_data = {
            'bateria_min': 10.5,
            'tiempo_advertencia': 900
        }
        response = self.client.post(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['bateria_min'], 10.5)
        self.assertEqual(response.data['tiempo_advertencia'], 900)
        self.assertTrue(response.data['activo'])
        self.assertIsNotNone(response.data['fecha_inicio'])
        self.assertIsNone(response.data['fecha_fin'])
        
        # Verify the new active configuration is retrieved
        config_activa = self.limnigrafo.configuracion
        self.assertEqual(config_activa.bateria_min, 10.5)
        self.assertTrue(config_activa.activo)

    def test_get_historial_configuracion_action(self):
        url = reverse('limnigrafos-configuracion', args=[self.limnigrafo.id])
        update_data = {
            'bateria_min': 10.5,
            'tiempo_advertencia': 900
        }
        self.client.post(url, update_data, format='json')
        
        history_url = reverse('limnigrafos-historial-configuracion', args=[self.limnigrafo.id])
        response = self.client.get(history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_verificar_conexiones_command_updates_state(self):
        from django.core.management import call_command
        from api.models import Alerta
        
        # Simular desconexión creando una última medición en el pasado
        medicion = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=2.0,
            fecha_hora=timezone.now() - timedelta(minutes=45),
            fuente='automatico',
        )
        self.limnigrafo.ultima_medicion = medicion
        self.limnigrafo.estado = 'normal'
        self.limnigrafo.save(update_fields=['ultima_medicion', 'estado'])
        
        # Ejecutar comando
        call_command('verificar_conexiones')
        
        self.limnigrafo.refresh_from_db()
        self.assertEqual(self.limnigrafo.estado, 'advertencia')
        self.assertTrue(Alerta.objects.filter(tipo='advertencia_limnigrafo', limnigrafo=self.limnigrafo).exists())
