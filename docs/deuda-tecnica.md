# Deuda Técnica

Cosas que funcionan pero están mal resueltas, detectadas al trabajar en otras tareas.
No bloquean nada hoy.

---

## Backend

### Paginado de limnígrafos

- [ ] **Quitar el paginado de `LimnigrafoViewSet`.** `LimnigrafoPagination` obliga a que
      cualquier consumidor recorra páginas para tener la flota completa, cuando la cantidad de
      dispositivos es y va a seguir siendo chica (decenas, no miles).
      Mientras siga existiendo, el CLI del simulador consulta con `?limit=9999`
      (ver `docs/roadmap-simulador.md`, Parte B).
      Al quitarlo hay que revisar los consumidores del frontend que esperan
      `{count, next, previous, results}`.

### Identidad de dispositivo acoplada al nombre de la API Key

- [ ] `MedicionSerializer.validate` (`backend/api/serializer/medicionSerializer.py:117-142`)
      resuelve el limnígrafo **parseando el nombre de la API Key** con formato
      `LMG-{id}_{codigo}_{descripcion}`. Si alguien renombra la clave desde el admin de Django,
      la ingesta de ese dispositivo se rompe en silencio (cae al camino de "sin API Key" y pide
      `limnigrafo` en el body). Debería existir una relación explícita entre `Limnigrafo` y
      `APIKey` (FK o tabla intermedia) en lugar de codificar el ID en un string.

### Modelo de ubicaciones

- [ ] `Ubicacion` (`backend/api/models/ubicacion.py`) es sólo `nombre + latitud + longitud`.
      Para una red hidrométrica falta:
      - **Cuenca / curso de agua** al que pertenece la estación (hoy está embebido en el texto
        del nombre: "Arroyo Grande - Ruta 3"). Sin esto no se puede agrupar por río, ni ordenar
        estaciones aguas arriba / aguas abajo, ni correlacionar una crecida entre estaciones del
        mismo curso.
      - **Cota / altitud** y **cero de escala** (el datum al que se refiere la altura medida).
        Sin el cero de escala, una lectura de escala no es interpretable entre estaciones.
      - **Progresiva o orden aguas abajo**, para poder modelar el tiempo de viaje del agua.
      Hoy son 6 ubicaciones fijas y alcanza; el modelo se queda corto en cuanto la red crezca.

### Campo `memoria`

- [ ] Las fixtures traen `memoria: 2147483647` (int max, placeholder). El equipo real tiene
      2 EEPROM I2C con ~32 766 registros en total. Cargar el valor real por dispositivo:
      el simulador lo lee del backend para dimensionar su buffer en anillo.

### `tipo_de_comunicacion` vs realidad

- [ ] `Limnigrafo.COMUNICACIONES_CHOICES` incluye `internet-https-2G..5G`, pero el firmware
      abre TCP al **puerto 80 en texto plano** (`AT+CIPSTART=\"TCP\",\"<host>\",\"80\"`), sin
      TLS. Los valores `https` son aspiracionales para el hardware viejo.

## Simulador

- [ ] `signals.py` quedó como código muerto: los receivers de `post_save`/`post_delete` de
      `Limnigrafo` sólo imprimen a stdout y llaman a `sincronizar_async()`, cuyo cuerpo es un
      `pass` con la llamada real comentada (`backend/api/signals.py:27`). El comando
      `sincronizar_simulador` que documenta `docs/SINCRONIZACION_LIMNIGRAFOS.md` **no existe**.
      Eliminar signals + documento cuando se implemente la Parte B del roadmap del simulador
      (el flujo se invierte: el CLI consulta al backend, el backend no escribe nada del simulador).

## Frontend

- [ ] Verificar y corregir la unidad que se muestra para `bateria` y para `altura_agua`.
      El dispositivo reporta **volts** para la batería (fixtures: `bateria_actual: 12.4`) y
      **centímetros** para la altura (decidido, ver `docs/roadmap-simulador.md` A.3.5).
      Si el frontend rotula "%" o "m", está mostrando una batería sana como "12.4 %" y un
      arroyo de 63 cm como 63 metros.
- [ ] Los umbrales de las 6 `ConfiguracionLimnigrafo` están en unidades inconsistentes con lo
      que mide el equipo: altura pensada en metros (debe ser cm) y presión en el orden de
      950–1050, que es presión **atmosférica**, cuando el sensor entrega presión **relativa**
      (~0–200 hPa). Recalcularlos o las alertas se disparan permanentemente.
