#!/bin/sh
# Generador periódico de alertas para desarrollo local.
#
# En producción esto lo dispara un cron de Hostinger. Acá no hay cron, así que el
# equivalente es este bucle: un contenedor que llama al mismo `manage.py generar_alerta`
# cada N segundos. Es el único que genera las alertas de estado del limnígrafo
# (advertencia, peligro y sin conexión) y, sobre todo, el único que **cierra** las
# condiciones que dejaron de cumplirse. Sin él, una alerta resuelta queda con
# `condicion_activa=True` para siempre y el filtro "Sólo vigentes" del listado muestra
# alertas viejas como si siguieran pasando.
#
# Las alertas de `fuera_rango_medicion` no dependen de esto: se generan en el
# `POST /mediciones/`, cuando entra cada medición.
#
# Es el ENTRYPOINT del servicio `alertas`, que reusa la imagen del backend. El compose
# espera a que `api` esté `healthy`, así que las migraciones ya corrieron y acá no hace
# falta reintentar la conexión a la base.

cd /app

INTERVALO="${ALERTAS_INTERVALO_SEGUNDOS:-30}"

# Sin trap, un `docker compose stop` se quedaría esperando el timeout de 10 s en cada
# corte, porque la señal llega mientras el shell está bloqueado en `sleep`. Con el
# `sleep` en segundo plano y un `wait`, el trap se atiende en el momento.
trap 'echo "⏹ Generador de alertas detenido."; exit 0' TERM INT

echo "▶ Generador de alertas activo: una pasada cada ${INTERVALO}s."

while true; do
  # El intervalo es entre el fin de una pasada y el comienzo de la siguiente, no un
  # período fijo. En desarrollo la diferencia es de milisegundos y no vale la pena
  # corregir la deriva.
  if ! python manage.py generar_alerta; then
    # Un fallo no puede matar el contenedor: durante el desarrollo es normal que la
    # base se reinicie o que una migración a medio aplicar rompa una pasada suelta.
    echo "⚠ La pasada falló. Se reintenta en ${INTERVALO}s."
  fi

  sleep "$INTERVALO" &
  wait $!
done
