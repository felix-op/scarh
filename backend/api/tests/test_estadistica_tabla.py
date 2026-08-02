from datetime import datetime

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import ConfiguracionLimnigrafo, Limnigrafo
from api.models.medicion import Medicion


def _local(anio, mes, dia, hora=12, minuto=0):
    """Datetime aware en la zona horaria del proyecto."""
    return timezone.make_aware(
        datetime(anio, mes, dia, hora, minuto), timezone.get_current_timezone()
    )


def _iso(anio, mes, dia, hora=0, minuto=0):
    """
    Fecha en formato ISO con offset local, para usar como query param.

    La agrupación por período trabaja en hora local: mandar `2024-03-01T00:00:00Z`
    equivale a las 21:00 del 29 de febrero en Argentina y el rango termina un mes
    antes de lo que uno esperaría leyendo el string. Los tests fijan el offset
    explícitamente para expresar el límite que realmente quieren probar.
    """
    return _local(anio, mes, dia, hora, minuto).isoformat()


def _mensaje_error(response):
    """El handler de excepciones del proyecto aplana los errores del serializer."""
    return response.data.get('descripcion_usuario', '')


class EstadisticaTablaTests(APITestCase):
    """Endpoint `/estadisticas/tabla/`: agrupación por dispositivo y por período."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_superuser(
            username='tabla-user', password='testpassword', email='tabla@example.com'
        )
        self.client.force_authenticate(user=self.user)

        self.limnigrafo = self._crear_limnigrafo('LMG-101')
        self.limnigrafo2 = self._crear_limnigrafo('LMG-102')

        self.url = reverse('estadisticas-tabla')

        # LMG-101: enero 2024 -> 1, 2, 3 | febrero 2024 -> 10, 20
        for dia, altura in [(5, 1.0), (10, 2.0), (15, 3.0)]:
            self._crear_medicion(self.limnigrafo, _local(2024, 1, dia), altura)
        for dia, altura in [(5, 10.0), (10, 20.0)]:
            self._crear_medicion(self.limnigrafo, _local(2024, 2, dia), altura)

        # LMG-102: enero 2024 -> 100
        self._crear_medicion(self.limnigrafo2, _local(2024, 1, 7), 100.0)

    def _crear_limnigrafo(self, codigo):
        limnigrafo = Limnigrafo.objects.create(
            codigo=codigo,
            descripcion=f'Limnigrafo {codigo}',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_actual=12.0,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=limnigrafo,
            bateria_min=10.0,
            tiempo_advertencia=3600,
            tiempo_peligro=7200,
        )
        return limnigrafo

    def _crear_medicion(self, limnigrafo, fecha_hora, altura_agua, temperatura=None):
        return Medicion.objects.create(
            limnigrafo=limnigrafo,
            altura_agua=altura_agua,
            temperatura=temperatura,
            fecha_hora=fecha_hora,
            fuente='manual',
        )

    def _params(self, **extra):
        params = {
            'limnigrafos': str(self.limnigrafo.id),
            'atributo': 'altura_agua',
            'fecha_inicio': _iso(2024, 1, 1),
            'fecha_fin': _iso(2024, 3, 1),
        }
        params.update(extra)
        return params

    # ------------------------------------------------------------------ #
    # Agrupación por dispositivo
    # ------------------------------------------------------------------ #

    def test_agrupa_por_dispositivo_por_defecto(self):
        response = self.client.get(self.url, self._params())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['agrupar_por'], 'dispositivo')
        self.assertEqual(len(response.data['filas']), 1)

        fila = response.data['filas'][0]
        self.assertEqual(fila['etiqueta'], 'LMG-101')
        self.assertEqual(fila['limnigrafo'], self.limnigrafo.id)
        self.assertEqual(fila['minimo'], 1.0)
        self.assertEqual(fila['maximo'], 20.0)
        self.assertEqual(fila['total_registros'], 5)
        self.assertAlmostEqual(fila['promedio'], 7.2)

    def test_total_es_nulo_con_un_solo_dispositivo(self):
        response = self.client.get(self.url, self._params())

        self.assertIsNone(response.data['total'])

    def test_fila_global_con_varios_dispositivos(self):
        response = self.client.get(self.url, self._params(
            limnigrafos=f'{self.limnigrafo.id},{self.limnigrafo2.id}',
        ))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['filas']), 2)

        total = response.data['total']
        self.assertIsNotNone(total)
        self.assertIsNone(total['limnigrafo'])
        self.assertEqual(total['minimo'], 1.0)
        self.assertEqual(total['maximo'], 100.0)
        self.assertEqual(total['total_registros'], 6)

    def test_dispositivo_sin_mediciones_devuelve_fila_en_null(self):
        vacio = self._crear_limnigrafo('LMG-103')

        response = self.client.get(self.url, self._params(
            limnigrafos=f'{self.limnigrafo.id},{vacio.id}',
        ))

        fila = next(f for f in response.data['filas'] if f['limnigrafo'] == vacio.id)
        self.assertEqual(fila['total_registros'], 0)
        for clave in ('minimo', 'maximo', 'promedio', 'mediana', 'moda', 'desvio_estandar', 'percentil_90'):
            self.assertIsNone(fila[clave], f"{clave} debería ser null cuando no hay mediciones")

    def test_desvio_es_null_con_una_sola_medicion(self):
        response = self.client.get(self.url, self._params(
            limnigrafos=str(self.limnigrafo2.id),
        ))

        fila = response.data['filas'][0]
        self.assertEqual(fila['total_registros'], 1)
        self.assertIsNone(fila['desvio_estandar'])

    def test_atributo_nullable_ignora_mediciones_sin_valor(self):
        self._crear_medicion(self.limnigrafo, _local(2024, 1, 20), 4.0, temperatura=8.0)

        response = self.client.get(self.url, self._params(atributo='temperatura'))

        fila = response.data['filas'][0]
        self.assertEqual(fila['total_registros'], 1)
        self.assertEqual(fila['promedio'], 8.0)

    def test_limnigrafo_inexistente_devuelve_400(self):
        response = self.client.get(self.url, self._params(limnigrafos='999999'))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ------------------------------------------------------------------ #
    # Agrupación por período
    # ------------------------------------------------------------------ #

    def test_agrupa_por_mes(self):
        response = self.client.get(self.url, self._params(agrupar_por='mes'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        claves = [fila['clave'] for fila in response.data['filas']]
        self.assertEqual(claves, ['2024-01', '2024-02', '2024-03'])

        enero = response.data['filas'][0]
        self.assertEqual(enero['total_registros'], 3)
        self.assertEqual(enero['minimo'], 1.0)
        self.assertEqual(enero['maximo'], 3.0)
        self.assertEqual(enero['mediana'], 2.0)

        febrero = response.data['filas'][1]
        self.assertEqual(febrero['total_registros'], 2)
        self.assertAlmostEqual(febrero['promedio'], 15.0)

    def test_periodo_sin_mediciones_aparece_como_fila_vacia(self):
        response = self.client.get(self.url, self._params(agrupar_por='mes'))

        marzo = response.data['filas'][2]
        self.assertEqual(marzo['clave'], '2024-03')
        self.assertEqual(marzo['total_registros'], 0)
        self.assertIsNone(marzo['promedio'])

    def test_total_del_rango_en_agrupacion_por_periodo(self):
        response = self.client.get(self.url, self._params(agrupar_por='mes'))

        total = response.data['total']
        self.assertEqual(total['clave'], 'total')
        self.assertEqual(total['total_registros'], 5)
        self.assertEqual(total['minimo'], 1.0)
        self.assertEqual(total['maximo'], 20.0)

    def test_agrupa_por_anio(self):
        response = self.client.get(self.url, self._params(agrupar_por='anio'))

        claves = [fila['clave'] for fila in response.data['filas']]
        self.assertEqual(claves, ['2024'])
        self.assertEqual(response.data['filas'][0]['total_registros'], 5)

    def test_agrupa_por_dia_solo_devuelve_el_rango_pedido(self):
        response = self.client.get(self.url, self._params(
            fecha_inicio=_iso(2024, 1, 5),
            fecha_fin=_iso(2024, 1, 7, 23, 59),
            agrupar_por='dia',
        ))

        claves = [fila['clave'] for fila in response.data['filas']]
        self.assertEqual(claves, ['2024-01-05', '2024-01-06', '2024-01-07'])
        self.assertEqual(response.data['filas'][0]['total_registros'], 1)
        self.assertEqual(response.data['filas'][1]['total_registros'], 0)

    def test_agrupa_por_semana_usa_clave_iso(self):
        response = self.client.get(self.url, self._params(
            fecha_inicio=_iso(2024, 1, 8),
            fecha_fin=_iso(2024, 1, 14, 23, 59),
            agrupar_por='semana',
        ))

        self.assertEqual([fila['clave'] for fila in response.data['filas']], ['2024-W02'])

    def test_periodo_expone_inicio_y_fin(self):
        response = self.client.get(self.url, self._params(agrupar_por='mes'))

        enero = response.data['filas'][0]
        self.assertIsNotNone(enero['periodo_inicio'])
        self.assertIsNotNone(enero['periodo_fin'])

    def test_periodo_requiere_un_solo_limnigrafo(self):
        response = self.client.get(self.url, self._params(
            limnigrafos=f'{self.limnigrafo.id},{self.limnigrafo2.id}',
            agrupar_por='mes',
        ))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('limnigrafos', _mensaje_error(response))

    def test_demasiados_periodos_devuelve_400(self):
        response = self.client.get(self.url, self._params(
            fecha_inicio=_iso(2000, 1, 1),
            fecha_fin=_iso(2024, 1, 1),
            agrupar_por='dia',
        ))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('agrupar_por', _mensaje_error(response))

    # ------------------------------------------------------------------ #
    # Validaciones generales
    # ------------------------------------------------------------------ #

    def test_agrupacion_invalida_devuelve_400(self):
        response = self.client.get(self.url, self._params(agrupar_por='quincena'))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sin_limnigrafos_devuelve_400(self):
        response = self.client.get(self.url, self._params(limnigrafos=''))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fechas_invertidas_devuelve_400(self):
        response = self.client.get(self.url, self._params(
            fecha_inicio=_iso(2024, 3, 1),
            fecha_fin=_iso(2024, 1, 1),
        ))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_acepta_nivel_de_bateria_como_atributo(self):
        response = self.client.get(self.url, self._params(atributo='nivel_de_bateria'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['atributo'], 'nivel_de_bateria')

    def test_requiere_autenticacion(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.url, self._params())

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class EstadisticaLegacyCompatibilidadTests(APITestCase):
    """
    El endpoint legacy `/estadistica/` cambió de implementación interna (ahora usa
    `utils.estadisticas`) pero no puede cambiar de contrato: sigue devolviendo
    `0.0` en lugar de `null` y sin `promedio`.
    """

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_superuser(
            username='legacy-user', password='testpassword', email='legacy@example.com'
        )
        self.client.force_authenticate(user=self.user)

        self.limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-201',
            descripcion='Limnigrafo legacy',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_actual=12.0,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=self.limnigrafo,
            bateria_min=10.0,
            tiempo_advertencia=3600,
            tiempo_peligro=7200,
        )
        self.url = reverse('estadistica-list')

    def test_sin_datos_sigue_devolviendo_ceros(self):
        response = self.client.get(self.url, {
            'limnigrafos': str(self.limnigrafo.id),
            'atributo': 'altura_agua',
            'fecha_inicio': '2024-01-01T00:00:00Z',
            'fecha_fin': '2024-01-02T00:00:00Z',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        fila = response.data[0]
        self.assertEqual(fila['minimo'], 0.0)
        self.assertEqual(fila['maximo'], 0.0)
        self.assertEqual(fila['desvio_estandar'], 0.0)
        self.assertIsNone(fila['moda'])
        self.assertNotIn('promedio', fila)
