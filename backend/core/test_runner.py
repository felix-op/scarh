"""Runner de tests que crea el schema de la base antes de migrar.

Django está configurado con `search_path=limnigrafos` (ver `DATABASES` en `settings.py`).
En la base de desarrollo ese schema lo crea `init/001_create_schema.sql` cuando arranca el
contenedor de Postgres, pero la base de tests la crea Django en el momento y arranca vacía:
sin el schema, la primera sentencia falla con

    MigrationSchemaMissing: Unable to create the django_migrations table
    (no schema has been selected to create in)

Este runner se mete entre la creación de la base de tests y la corrida de las migraciones
para crear el schema. Con eso, `manage.py test` funciona sin preparar nada a mano.
"""

try:
    import psycopg2 as psycopg_conn
except ImportError:
    try:
        import psycopg as psycopg_conn
    except ImportError:
        psycopg_conn = None

from django.db import connections
from django.test.runner import DiscoverRunner

SCHEMA = "limnigrafos"


def _crear_schema(connection, nombre_base):
    ajustes = connection.settings_dict
    
    # Si la base de datos es SQLite, no hay necesidad de crear esquemas
    if "sqlite" in ajustes.get("ENGINE", ""):
        return

    if psycopg_conn is None:
        raise ImportError("No se encontró psycopg2 ni psycopg instalado para configurar el esquema de PostgreSQL.")

    # psycopg 3 y psycopg 2 aceptan los mismos parámetros de conexión básicos
    conexion = psycopg_conn.connect(
        dbname=nombre_base,
        user=ajustes["USER"],
        password=ajustes["PASSWORD"],
        host=ajustes["HOST"],
        port=ajustes["PORT"],
    )
    try:
        conexion.autocommit = True
        with conexion.cursor() as cursor:
            cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA}")
    finally:
        conexion.close()


class SchemaTestRunner(DiscoverRunner):
    def setup_databases(self, **kwargs):
        for connection in connections.all():
            creacion = connection.creation
            original = creacion._create_test_db

            def crear(verbosity, autoclobber=False, keepdb=False, _original=original, _connection=connection):
                nombre_base = _original(verbosity, autoclobber, keepdb)
                _crear_schema(_connection, nombre_base)
                return nombre_base

            creacion._create_test_db = crear

        return super().setup_databases(**kwargs)

