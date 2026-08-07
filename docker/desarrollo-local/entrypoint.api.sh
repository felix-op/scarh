#!/bin/sh
# Arranque del backend en desarrollo local.
#
# Es el ENTRYPOINT de `Dockerfile.api`, así que corre en cada arranque del contenedor
# (`up`, `start`, `restart`), no en el build. Vive en /usr/local/bin y no en /app porque
# el compose monta el código sobre /app y lo taparía.
#
# El compose espera a que Postgres esté `healthy` antes de arrancar este servicio, así
# que acá no hace falta reintentar la conexión.
set -e

cd /app

echo "▶ Aplicando migraciones..."
python manage.py migrate --noinput

if [ "${CARGAR_FIXTURES:-true}" = "true" ]; then
  # Las fixtures traen pks explícitas, así que volver a cargarlas sobrescribiría
  # cualquier cambio hecho a mano durante el desarrollo. Se cargan sólo la primera vez.
  if [ "$(python manage.py shell -c 'from api.models.rol import Rol; print(Rol.objects.exists())')" = "True" ]; then
    echo "▶ Fixtures ya cargadas, se omiten."
  else
    echo "▶ Cargando fixtures: roles, limnígrafos y ubicaciones..."
    python manage.py loaddata roles.json limnigrafos.json ubicaciones.json
  fi
fi

echo "▶ Creando usuarios de ADMIN_* y USER_* si no existen..."
python manage.py createsuperuser_from_env

echo "▶ Backend escuchando en el puerto 8000."
exec python manage.py runserver 0.0.0.0:8000
