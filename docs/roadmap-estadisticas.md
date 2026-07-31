# Roadmap de Estadísticas

- Backend:
1. Agregar promedio, total_registros y cambiar el endpoint a `/estadisticas/tabla`.
2. Devolver `null` en lugar de `0.0` cuando no hay datos.
3. Exportar con `/estadisticas/exportar?tipo={tipo}` -> tipo: excel, csv (evaluar antes de implementar si hace falta librería o si se puede exportar a excel también desde el frontend).
4. Escalar la consulta con agregación, no hacer los calculos en ram.
5. Crear endpoint `/medicion/serie/` con auto-cálculo de bucket dinámico. Recibirá un parámetro `max_puntos` (ej. 200) y calculará la agrupación necesaria (downsampling) para no saturar al cliente.
6. Crear endpoint público (sin protección de rol) `/estadisticas/dashboard`. Debe devolver:
   - `limnigrafos`: array con `{ id, codigo, estado_medicion, estado_conexion, ultima_medicion }`.
   - `resumen`: objeto con `{ cant_dispositivos, medicionesPorCarga: { JSON, CSV, manual, automatico }, total_mediciones_24hs }`. (Se agregó `total_mediciones_24hs` como dato útil adicional).

- Frontend:
1. Crear los modelos (interfaces/tipos) para reflejar las respuestas de los 2 endpoints principales (`/estadisticas/tabla` y `/medicion/serie/`).
2. Crear las funciones de fetching de datos del lado del servidor (SSR): `getSSREstadisticasTabla` y `getSSREstadisticasGrafico`.
