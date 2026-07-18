import shutil
import tempfile
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase, override_settings
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Limnigrafo, Rol, RutaAcceso, Ubicacion


FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


def fixture_file(nombre):
    return (FIXTURES_DIR / nombre).read_bytes()


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class RutaAccesoTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(settings.MEDIA_ROOT, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_superuser(
            username='admin',
            password='testpassword',
            email='admin@example.com',
        )
        self.client.force_authenticate(user=self.user)
        self.ubicacion = Ubicacion.objects.create(
            nombre='Ubicación prueba',
            latitud=-54.8,
            longitud=-68.3,
        )
        self.limnigrafo = Limnigrafo.objects.create(
            codigo='LMG-RUTA',
            descripcion='Limnígrafo con ruta',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            ubicacion=self.ubicacion,
        )
        self.list_url = reverse('rutas-acceso-list')

    def archivo(self, nombre, content_type='application/xml'):
        return SimpleUploadedFile(nombre, fixture_file(nombre), content_type=content_type)

    def data_base(self, archivo=None, limnigrafo_id=None):
        data = {
            'limnigrafo_id': limnigrafo_id or self.limnigrafo.id,
            'nombre': 'Ruta de acceso test',
            'tiempo_estimado_minutos': '35',
            'observaciones': 'Observación de prueba',
        }
        if archivo is not None:
            data['archivo_original'] = archivo
        return data

    def crear_ruta(self, archivo=None):
        response = self.client.post(
            self.list_url,
            self.data_base(archivo or self.archivo('ruta_minima.gpx')),
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response

    def test_carga_gpx_valido(self):
        response = self.crear_ruta(self.archivo('ruta_minima.gpx'))
        self.assertEqual(response.data['formato_origen'], 'gpx')
        self.assertEqual(response.data['geometria']['type'], 'FeatureCollection')
        self.assertEqual(response.data['geometria']['features'][0]['geometry']['type'], 'LineString')
        self.assertGreater(response.data['distancia_km'], 0)

    def test_gpx_ida_vuelta_marca_destino_en_punto_mas_alejado(self):
        response = self.crear_ruta(self.archivo('ruta_ida_vuelta.gpx'))
        properties = response.data['geometria']['features'][0]['properties']

        self.assertTrue(properties['is_round_trip'])
        self.assertEqual(properties['start_coordinate'][:2], [-68.3, -54.8])
        self.assertEqual(properties['destination_coordinate'][:2], [-68.305, -54.805])
        self.assertEqual(properties['end_coordinate'][:2], [-68.3001, -54.8001])

    def test_carga_gpx_completa_observaciones_desde_comentario_si_estan_vacias(self):
        data = self.data_base(self.archivo('ruta_minima.gpx'))
        data['observaciones'] = ''

        response = self.client.post(self.list_url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['observaciones'], 'Descripción de prueba del archivo GPX')

    def test_carga_kml_valido(self):
        response = self.crear_ruta(self.archivo('ruta_minima.kml'))
        self.assertEqual(response.data['formato_origen'], 'kml')
        self.assertEqual(response.data['geometria']['features'][0]['geometry']['type'], 'LineString')
        self.assertGreater(response.data['distancia_km'], 0)

    def test_extension_no_permitida(self):
        archivo = SimpleUploadedFile('ruta.txt', fixture_file('ruta_minima.gpx'))
        response = self.client.post(self.list_url, self.data_base(archivo), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(RutaAcceso.objects.count(), 0)

    def test_xml_invalido(self):
        archivo = SimpleUploadedFile('ruta.gpx', b'<gpx><trk>', content_type='application/xml')
        response = self.client.post(self.list_url, self.data_base(archivo), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(RutaAcceso.objects.count(), 0)

    def test_archivo_vacio(self):
        archivo = SimpleUploadedFile('ruta.gpx', b'', content_type='application/xml')
        response = self.client.post(self.list_url, self.data_base(archivo), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(RutaAcceso.objects.count(), 0)

    def test_archivo_sin_ruta(self):
        archivo = SimpleUploadedFile(
            'ruta.gpx',
            b'<?xml version="1.0"?><gpx version="1.1" creator="test"></gpx>',
            content_type='application/xml',
        )
        response = self.client.post(self.list_url, self.data_base(archivo), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(RutaAcceso.objects.count(), 0)

    def test_archivo_superior_a_5mb(self):
        archivo = SimpleUploadedFile('ruta.gpx', b' ' * (5 * 1024 * 1024 + 1), content_type='application/xml')
        response = self.client.post(self.list_url, self.data_base(archivo), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(RutaAcceso.objects.count(), 0)

    def test_asociacion_con_limnigrafo_inexistente(self):
        response = self.client.post(
            self.list_url,
            self.data_base(self.archivo('ruta_minima.gpx'), limnigrafo_id=999999),
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(RutaAcceso.objects.count(), 0)

    def test_listado_filtrado_por_limnigrafo(self):
        self.crear_ruta()
        otro = Limnigrafo.objects.create(
            codigo='LMG-OTRO',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
        )
        RutaAcceso.objects.create(
            limnigrafo=otro,
            nombre='Otra ruta',
            formato_origen='gpx',
            geometria={'type': 'FeatureCollection', 'features': []},
        )

        response = self.client.get(self.list_url, {'limnigrafo': self.limnigrafo.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['limnigrafo'], self.limnigrafo.id)

    def test_descarga_archivo(self):
        created = self.crear_ruta()
        url = reverse('rutas-acceso-descargar', args=[created.data['id']])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('attachment', response['Content-Disposition'])
        contenido = b''.join(response.streaming_content)
        self.assertIn(b'Observaci\xc3\xb3n de prueba', contenido)

    def test_guarda_archivo_con_observaciones(self):
        created = self.crear_ruta()
        ruta = RutaAcceso.objects.get(pk=created.data['id'])

        with ruta.archivo_original.open('rb') as archivo:
            contenido = archivo.read()

        self.assertIn(b'Observaci\xc3\xb3n de prueba', contenido)

    def test_actualiza_archivo_guardado_al_editar_observaciones(self):
        created = self.crear_ruta()
        ruta = RutaAcceso.objects.get(pk=created.data['id'])

        response = self.client.patch(
            reverse('rutas-acceso-detail', args=[ruta.id]),
            {'observaciones': 'Observación editada'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ruta.refresh_from_db()
        with ruta.archivo_original.open('rb') as archivo:
            contenido = archivo.read()

        self.assertIn(b'Observaci\xc3\xb3n editada', contenido)

    def test_permisos_lectura_y_edicion(self):
        ruta = RutaAcceso.objects.create(
            limnigrafo=self.limnigrafo,
            nombre='Ruta existente',
            formato_origen='gpx',
            geometria={'type': 'FeatureCollection', 'features': []},
        )
        User = get_user_model()
        lector = User.objects.create_user(username='lector', password='test', email='lector@example.com')
        Rol.objects.create(nombre='limnigrafos-visualizar').usuarios.add(lector)
        self.client.force_authenticate(user=lector)

        self.assertEqual(self.client.get(self.list_url).status_code, status.HTTP_200_OK)
        response = self.client.patch(
            reverse('rutas-acceso-detail', args=[ruta.id]),
            {'nombre': 'Sin permiso'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        editor = User.objects.create_user(username='editor', password='test', email='editor@example.com')
        Rol.objects.create(nombre='limnigrafos-editar').usuarios.add(editor)
        self.client.force_authenticate(user=editor)
        response = self.client.patch(
            reverse('rutas-acceso-detail', args=[ruta.id]),
            {'nombre': 'Con permiso'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reemplazo_de_archivo(self):
        created = self.crear_ruta(self.archivo('ruta_minima.gpx'))
        ruta = RutaAcceso.objects.get(pk=created.data['id'])
        archivo_anterior = ruta.archivo_original.name

        response = self.client.patch(
            reverse('rutas-acceso-detail', args=[ruta.id]),
            {'archivo_original': self.archivo('ruta_minima.kml')},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ruta.refresh_from_db()
        self.assertEqual(ruta.formato_origen, 'kml')
        self.assertNotEqual(ruta.archivo_original.name, archivo_anterior)

    def test_eliminacion(self):
        created = self.crear_ruta()
        response = self.client.delete(reverse('rutas-acceso-detail', args=[created.data['id']]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(RutaAcceso.objects.count(), 0)

    def test_no_modifica_ubicacion_del_limnigrafo(self):
        ubicacion_id = self.limnigrafo.ubicacion_id
        latitud = self.limnigrafo.ubicacion.latitud
        longitud = self.limnigrafo.ubicacion.longitud
        self.crear_ruta()
        self.limnigrafo.refresh_from_db()
        self.limnigrafo.ubicacion.refresh_from_db()
        self.assertEqual(self.limnigrafo.ubicacion_id, ubicacion_id)
        self.assertEqual(self.limnigrafo.ubicacion.latitud, latitud)
        self.assertEqual(self.limnigrafo.ubicacion.longitud, longitud)


class RutaAccesoMigrationTests(TransactionTestCase):
    migrate_from = [('api', '0027_remove_limnigrafo_sector_rio_and_more')]
    migrate_to = [('api', '0028_rutas_acceso_limnigrafos')]

    def setUp(self):
        self.executor = MigrationExecutor(connection)
        self.executor.migrate(self.migrate_from)
        old_apps = self.executor.loader.project_state(self.migrate_from).apps

        UbicacionOld = old_apps.get_model('api', 'Ubicacion')
        LimnigrafoOld = old_apps.get_model('api', 'Limnigrafo')
        RutaAccesoOld = old_apps.get_model('api', 'RutaAcceso')

        ubicacion = UbicacionOld.objects.create(nombre='Ubicación histórica', latitud=-54.8, longitud=-68.3)
        LimnigrafoOld.objects.create(
            codigo='LMG-HIST',
            memoria=1024,
            tipo_de_comunicacion=['fisico-usb'],
            ubicacion=ubicacion,
        )
        RutaAccesoOld.objects.create(
            nombre='Ruta histórica',
            tipo='vehiculo',
            distancia_km=1.2,
            tiempo_estimado_minutos=20,
            observaciones='Dato previo',
            ubicacion=ubicacion,
        )

        self.executor = MigrationExecutor(connection)
        self.executor.migrate(self.migrate_to)
        self.apps = self.executor.loader.project_state(self.migrate_to).apps

    def test_preserva_y_asocia_rutas_existentes_durante_migracion(self):
        RutaAccesoMigrada = self.apps.get_model('api', 'RutaAcceso')
        ruta = RutaAccesoMigrada.objects.get(nombre='Ruta histórica')
        self.assertEqual(ruta.distancia_km, 1.2)
        self.assertIsNotNone(ruta.ubicacion_id)
        self.assertIsNotNone(ruta.limnigrafo_id)
