from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Accion, ConfiguracionLimnigrafo, Limnigrafo
from api.models.medicion import Medicion


class EstadisticaDashboardTests(APITestCase):
    """
    Endpoint `/estadisticas/dashboard/`: pide sesión pero ningún rol.
    """

    def setUp(self):
        self.url = reverse('estadisticas-dashboard')
        self.ahora = timezone.now()

        # Usuario común, sin roles ni permisos de estadísticas: es el caso que el
        # endpoint tiene que servir.
        User = get_user_model()
        self.usuario = User.objects.create_user(
            username='sin-roles', password='testpassword', email='sinroles@example.com'
        )
        self.client.force_authenticate(user=self.usuario)

        self.limnigrafo = self._crear_limnigrafo('LMG-D1')
        self.sin_datos = self._crear_limnigrafo('LMG-D2')

        reciente = Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.5,
            nivel_de_bateria=12.1,
            fecha_hora=self.ahora - timedelta(minutes=5),
            fuente='automatico',
        )
        self.limnigrafo.ultima_medicion = reciente
        self.limnigrafo.save(update_fields=['ultima_medicion'])

        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.4,
            fecha_hora=self.ahora - timedelta(hours=40),
            fuente='manual',
        )
        Medicion.objects.create(
            limnigrafo=self.limnigrafo,
            altura_agua=1.3,
            fecha_hora=self.ahora - timedelta(hours=2),
            fuente='import_csv',
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

    # ------------------------------------------------------------------ #
    # Acceso
    # ------------------------------------------------------------------ #

    def test_usuario_sin_roles_puede_acceder(self):
        """A diferencia de `/estadisticas/tabla/`, no exige `estadisticas-visualizar`."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_requiere_autenticacion(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_la_tabla_de_estadisticas_si_exige_rol(self):
        """
        Contraste: el mismo usuario sin roles no puede usar el endpoint de tabla.
        Confirma que quitar el rol es una decisión de este endpoint y no un agujero
        en el permiso de estadísticas.
        """
        response = self.client.get(reverse('estadisticas-tabla'), {
            'limnigrafos': str(self.limnigrafo.id),
            'atributo': 'altura_agua',
            'fecha_inicio': (self.ahora - timedelta(days=1)).isoformat(),
            'fecha_fin': self.ahora.isoformat(),
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------ #
    # Limnígrafos
    # ------------------------------------------------------------------ #

    def test_lista_todos_los_limnigrafos_con_su_estado(self):
        response = self.client.get(self.url)

        limnigrafos = response.data['limnigrafos']
        self.assertEqual(len(limnigrafos), 2)
        self.assertEqual([item['codigo'] for item in limnigrafos], ['LMG-D1', 'LMG-D2'])
        for item in limnigrafos:
            self.assertIn('estado_medicion', item)
            self.assertIn('estado_conexion', item)
            # El tablero grada la gravedad de "sin conexión" según el medio: sin este
            # campo, un equipo con enlace remoto caído se vería tan benigno como uno
            # que sólo se descarga por USB.
            self.assertEqual(item['tipo_de_comunicacion'], ['fisico-usb'])

    def test_incluye_la_ultima_medicion(self):
        response = self.client.get(self.url)

        con_datos = next(i for i in response.data['limnigrafos'] if i['codigo'] == 'LMG-D1')
        self.assertEqual(con_datos['ultima_medicion']['altura_agua'], 1.5)
        self.assertEqual(con_datos['ultima_medicion']['nivel_de_bateria'], 12.1)

    def test_limnigrafo_sin_mediciones_va_con_ultima_medicion_nula(self):
        response = self.client.get(self.url)

        sin_datos = next(i for i in response.data['limnigrafos'] if i['codigo'] == 'LMG-D2')
        self.assertIsNone(sin_datos['ultima_medicion'])
        self.assertEqual(sin_datos['estado_conexion'], 'sin_conexion')

    # ------------------------------------------------------------------ #
    # Resumen
    # ------------------------------------------------------------------ #

    def test_resumen_cuenta_dispositivos_y_mediciones_por_carga(self):
        response = self.client.get(self.url)

        resumen = response.data['resumen']
        self.assertEqual(resumen['cant_dispositivos'], 2)
        self.assertEqual(resumen['mediciones_por_carga']['automatico'], 1)
        self.assertEqual(resumen['mediciones_por_carga']['manual'], 1)
        self.assertEqual(resumen['mediciones_por_carga']['import_csv'], 1)

    def test_emite_todas_las_fuentes_aunque_esten_en_cero(self):
        response = self.client.get(self.url)

        por_carga = response.data['resumen']['mediciones_por_carga']
        self.assertEqual(
            set(por_carga.keys()), {'manual', 'automatico', 'import_csv', 'import_json'}
        )
        self.assertEqual(por_carga['import_json'], 0)

    def test_total_de_las_ultimas_24_horas_excluye_lo_anterior(self):
        response = self.client.get(self.url)

        # Hay 3 mediciones, pero una es de hace 40 horas.
        self.assertEqual(response.data['resumen']['total_mediciones_24hs'], 2)

    # ------------------------------------------------------------------ #
    # Historial de acciones
    # ------------------------------------------------------------------ #

    def test_devuelve_las_ultimas_10_acciones_mas_recientes_primero(self):
        for i in range(13):
            Accion.objects.create(
                tipo_accion='modified',
                entidad='Limnígrafo',
                entidad_id=str(i),
                descripcion=f'Acción {i}',
                estado='success',
            )

        response = self.client.get(self.url)

        acciones = response.data['ultimas_acciones']
        self.assertEqual(len(acciones), 10)
        fechas = [accion['fecha_hora'] for accion in acciones]
        self.assertEqual(fechas, sorted(fechas, reverse=True))

    def test_traduce_el_tipo_de_accion(self):
        Accion.objects.create(
            tipo_accion='manual_data_load',
            entidad='Medición',
            descripcion='Carga manual',
            estado='success',
        )

        response = self.client.get(self.url)

        accion = response.data['ultimas_acciones'][0]
        self.assertEqual(accion['tipo_accion'], 'manual_data_load')
        self.assertEqual(accion['tipo_accion_label'], 'Carga manual de datos')

    def test_incluye_el_autor_para_poder_enlazar_a_su_ficha(self):
        User = get_user_model()
        autor = User.objects.create_user(
            username='operador', password='x', email='operador@example.com'
        )
        Accion.objects.create(
            tipo_accion='modified',
            entidad='Limnígrafo',
            descripcion='Cambió la ubicación.',
            estado='success',
            usuario=autor,
        )

        response = self.client.get(self.url)

        accion = response.data['ultimas_acciones'][0]
        self.assertEqual(accion['usuario']['id'], autor.id)
        self.assertEqual(accion['usuario']['username'], 'operador')

    def test_accion_del_sistema_va_con_usuario_nulo(self):
        Accion.objects.create(
            tipo_accion='created',
            entidad='Alerta',
            descripcion='Alerta automática.',
            estado='success',
        )

        response = self.client.get(self.url)

        self.assertIsNone(response.data['ultimas_acciones'][0]['usuario'])

    def test_no_expone_el_detalle_del_historial(self):
        """
        Las descripciones de auditoría incluyen diffs campo a campo (por ejemplo
        `email: old='...' -> new='...'`). El detalle completo vive en `/historial/`,
        que exige el rol `historial-visualizar`; este endpoint no pide roles, así que
        no puede volverse una vía para leerlo sin permiso.
        """
        Accion.objects.create(
            tipo_accion='modified',
            entidad='Usuario',
            entidad_id='7',
            descripcion="Modificó el usuario. email: old='viejo@example.com' -> new='nuevo@example.com'",
            estado='success',
            metadata={'ip': '10.0.0.1'},
        )

        response = self.client.get(self.url)
        accion = response.data['ultimas_acciones'][0]

        for campo in ('descripcion', 'metadata', 'entidad_id'):
            self.assertNotIn(campo, accion)

        cuerpo = str(response.data)
        self.assertNotIn('viejo@example.com', cuerpo)
        self.assertNotIn('10.0.0.1', cuerpo)

    def test_sin_acciones_devuelve_lista_vacia(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data['ultimas_acciones'], [])
