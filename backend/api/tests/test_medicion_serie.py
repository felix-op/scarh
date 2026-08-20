from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import ConfiguracionLimnigrafo, Limnigrafo
from api.models.medicion import Medicion


def _local(anio, mes, dia, hora=0, minuto=0):
    return timezone.make_aware(
        datetime(anio, mes, dia, hora, minuto), timezone.get_current_timezone()
    )


class MedicionSerieTests(APITestCase):
    """Endpoint `/medicion/serie/`: downsampling con cubetas de ancho automático."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_superuser(
            username='serie-user', password='testpassword', email='serie@example.com'
        )
        self.client.force_authenticate(user=self.user)

        self.limnigrafo = self._crear_limnigrafo('LMG-S1')
        self.limnigrafo2 = self._crear_limnigrafo('LMG-S2')

        self.url = reverse('medicion-serie')

        # LMG-S1: una medición cada 30 min durante el 10/01/2024 (48 en total).
        self.base = _local(2024, 1, 10)
        for i in range(48):
            Medicion.objects.create(
                limnigrafo=self.limnigrafo,
                altura_agua=1.0 + i * 0.01,
                fecha_hora=self.base + timedelta(minutes=30 * i),
                fuente='automatico',
            )

    def _crear_limnigrafo(self, codigo):
        limnigrafo = Limnigrafo.objects.create(
            codigo=codigo,
            descripcion=f'Sensor {codigo}',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            bateria_actual=12.0,
        )
        ConfiguracionLimnigrafo.objects.create(
            limnigrafo=limnigrafo, bateria_min=10.0, tiempo_advertencia=3600, tiempo_peligro=7200
        )
        return limnigrafo

    def _params(self, **extra):
        params = {
            'limnigrafos': str(self.limnigrafo.id),
            'atributo': 'altura_agua',
            'fecha_inicio': _local(2024, 1, 10).isoformat(),
            'fecha_fin': _local(2024, 1, 11).isoformat(),
        }
        params.update(extra)
        return params

    # ------------------------------------------------------------------ #
    # Cubetas
    # ------------------------------------------------------------------ #

    def test_devuelve_una_serie_por_limnigrafo(self):
        response = self.client.get(self.url, self._params(
            limnigrafos=f'{self.limnigrafo.id},{self.limnigrafo2.id}',
        ))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['series']), 2)
        self.assertEqual(
            [serie['codigo'] for serie in response.data['series']], ['LMG-S1', 'LMG-S2']
        )

    def test_todas_las_series_comparten_la_misma_grilla(self):
        response = self.client.get(self.url, self._params(
            limnigrafos=f'{self.limnigrafo.id},{self.limnigrafo2.id}',
        ))

        total = response.data['total_puntos']
        for serie in response.data['series']:
            self.assertEqual(len(serie['puntos']), total)

        inicios = [[punto['inicio'] for punto in serie['puntos']] for serie in response.data['series']]
        self.assertEqual(inicios[0], inicios[1])

    def test_respeta_el_techo_de_puntos(self):
        response = self.client.get(self.url, self._params(max_puntos=10))

        self.assertLessEqual(response.data['total_puntos'], 11)
        self.assertGreaterEqual(response.data['bucket_segundos'], 2 * 3600)

    def test_no_afina_la_cubeta_mas_alla_de_la_cadencia_real(self):
        """
        Con 48 mediciones y un techo de 200 puntos, la cubeta no debe bajar de la
        separación real entre mediciones: si lo hiciera, la mayoría quedarían
        vacías y la serie se vería cortada por huecos inexistentes.
        """
        response = self.client.get(self.url, self._params(max_puntos=200, agrupar_siempre=True))

        self.assertGreaterEqual(response.data['bucket_segundos'], 30 * 60)
        self.assertLessEqual(response.data['total_puntos'], 49)

        vacios = [p for p in response.data['series'][0]['puntos'] if p['total_registros'] == 0]
        self.assertEqual(vacios, [], "no debería haber cubetas vacías con datos continuos")

    def test_no_agrupa_mediciones_escasas_aunque_el_rango_sea_amplio(self):
        escaso = self._crear_limnigrafo('LMG-S5')
        fechas = [_local(2024, 5, 24, 8), _local(2024, 5, 25, 12), _local(2024, 5, 27, 16)]
        for indice, fecha in enumerate(fechas):
            Medicion.objects.create(
                limnigrafo=escaso,
                altura_agua=3.0 + indice,
                fecha_hora=fecha,
                fuente='automatico',
            )

        response = self.client.get(self.url, self._params(
            limnigrafos=str(escaso.id),
            fecha_inicio=_local(2024, 1, 1).isoformat(),
            fecha_fin=_local(2025, 1, 1).isoformat(),
            max_puntos=400,
        ))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bucket_segundos'], 0)
        self.assertEqual(response.data['total_puntos'], 3)
        self.assertTrue(response.data['fecha_inicio'].startswith('2024-05-24'))
        self.assertTrue(response.data['fecha_fin'].startswith('2024-05-27'))
        self.assertTrue(all(punto['total_registros'] == 1 for punto in response.data['series'][0]['puntos']))

    def test_agrega_minimo_maximo_y_promedio_por_cubeta(self):
        response = self.client.get(self.url, self._params(max_puntos=12))

        punto = response.data['series'][0]['puntos'][0]
        self.assertGreater(punto['total_registros'], 1)
        self.assertLess(punto['minimo'], punto['maximo'])
        self.assertGreaterEqual(punto['promedio'], punto['minimo'])
        self.assertLessEqual(punto['promedio'], punto['maximo'])

    def test_la_cubeta_sin_mediciones_va_en_null(self):
        """
        Un dispositivo que dejó de reportar a mitad del rango: las cubetas del tramo
        muerto tienen que aparecer con `total_registros = 0` y valores en `null`,
        para que el gráfico corte la línea en vez de interpolar.
        """
        intermitente = self._crear_limnigrafo('LMG-S3')
        # Cada 30 min, pero sólo durante las primeras 12 horas del día.
        for i in range(24):
            Medicion.objects.create(
                limnigrafo=intermitente,
                altura_agua=2.0 + i * 0.01,
                fecha_hora=self.base + timedelta(minutes=30 * i),
                fuente='automatico',
            )

        response = self.client.get(
            self.url, self._params(limnigrafos=str(intermitente.id), max_puntos=12)
        )

        puntos = response.data['series'][0]['puntos']
        con_datos = [punto for punto in puntos if punto['total_registros'] > 0]
        sin_datos = [punto for punto in puntos if punto['total_registros'] == 0]

        self.assertTrue(con_datos, "la primera mitad del día sí tiene mediciones")
        self.assertTrue(sin_datos, "la segunda mitad del día no tiene mediciones")

        for punto in sin_datos:
            self.assertIsNone(punto['minimo'])
            self.assertIsNone(punto['maximo'])
            self.assertIsNone(punto['promedio'])

    def test_un_dispositivo_con_pocas_mediciones_no_genera_cubetas_vacias(self):
        """
        Contracara del clamp: con una sola medición en el rango, la cubeta se
        ensancha hasta cubrirlo entero en lugar de devolver 11 huecos falsos.
        """
        escaso = self._crear_limnigrafo('LMG-S4')
        Medicion.objects.create(
            limnigrafo=escaso,
            altura_agua=5.0,
            fecha_hora=self.base + timedelta(hours=1),
            fuente='automatico',
        )

        response = self.client.get(self.url, self._params(limnigrafos=str(escaso.id), max_puntos=12))

        self.assertEqual(response.data['total_puntos'], 1)
        self.assertEqual(response.data['series'][0]['puntos'][0]['total_registros'], 1)

    def test_las_cubetas_se_alinean_al_reloj_local(self):
        response = self.client.get(self.url, self._params(max_puntos=12))

        primero = timezone.localtime(
            timezone.datetime.fromisoformat(response.data['series'][0]['puntos'][0]['inicio'])
        )
        self.assertEqual(primero.minute, 0)
        self.assertEqual(primero.second, 0)

    def test_total_registros_de_la_serie(self):
        response = self.client.get(self.url, self._params())

        self.assertEqual(response.data['series'][0]['total_registros'], 48)

    def test_ignora_mediciones_sin_valor_en_el_atributo(self):
        response = self.client.get(self.url, self._params(atributo='temperatura'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['series'][0]['total_registros'], 0)

    # ------------------------------------------------------------------ #
    # Validaciones
    # ------------------------------------------------------------------ #

    def test_max_puntos_fuera_de_rango_devuelve_400(self):
        self.assertEqual(
            self.client.get(self.url, self._params(max_puntos=5000)).status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertEqual(
            self.client.get(self.url, self._params(max_puntos=1)).status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_fechas_invertidas_devuelve_400(self):
        response = self.client.get(self.url, self._params(
            fecha_inicio=_local(2024, 1, 11).isoformat(),
            fecha_fin=_local(2024, 1, 10).isoformat(),
        ))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sin_limnigrafos_devuelve_400(self):
        response = self.client.get(self.url, self._params(limnigrafos=''))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_limnigrafo_inexistente_devuelve_400(self):
        response = self.client.get(self.url, self._params(limnigrafos='999999'))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_atributo_invalido_devuelve_400(self):
        response = self.client.get(self.url, self._params(atributo='humedad'))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_requiere_autenticacion(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url, self._params())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
