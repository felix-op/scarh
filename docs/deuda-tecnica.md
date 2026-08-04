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
      (ver `docs/roadmaps/roadmap-simulador.md`, Parte B).
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

### Estadísticas: el cálculo se hace en memoria, no en la base

**Decisión tomada: se posterga a propósito.** No es un pendiente olvidado — está evaluado y
tiene condición de disparo.

`EstadisticaViewSet` trae todas las mediciones del rango a memoria de Python y calcula sobre
listas (`api/utils/estadisticas.py`). Todo lo que hace se puede resolver con una sola consulta
agregada: `Min`, `Max`, `Avg`, `Count` y `StdDev(sample=True)` son agregados del ORM, y mediana,
percentil 90 y moda son *ordered-set aggregates* de PostgreSQL (`WITHIN GROUP`) que requieren
declarar dos clases `Aggregate` propias. El bucketing por período lo puede hacer
`TruncDay/Week/Month/Year(tzinfo=...)`, que ya traduce a `date_trunc(... AT TIME ZONE ...)`.

Con la flota proyectada —10 dispositivos, una medición cada 5 min = 2.880 filas/día— el volumen
no justifica el cambio todavía:

| Consulta | Filas leídas | Hoy |
|---|---|---|
| 1 mes, flota completa | ~86.000 | irrelevante |
| 3 meses, flota completa | ~260.000 | 1–2 s, aceptable |
| 1 año, flota completa | ~1.050.000 | ~5 s y cientos de MB, molesto |
| 5 años, flota completa | ~5.300.000 | roto |

- [ ] **Condición de disparo — migrar a agregación en base cuando se cumpla cualquiera de las dos:**
      `Medicion` supera el millón de filas (`SELECT count(*) FROM medicion`), o una consulta de
      `/estadisticas/tabla/` tarda más de 3 segundos.

Por qué conviene esperar, además del costo: el modo de falla de esta refactorización es
**devolver números equivocados en silencio**. Un `Meta.ordering` que se filtra al `GROUP BY`, un
`sample=True` olvidado, o la fila Global derivada de las otras filas (promediar medianas no da la
mediana) producen respuestas bien formadas y falsas. La única defensa es un test de paridad entre
la implementación vieja y la nueva sobre los mismos datos — y con un dispositivo y pocos
registros ese test es evidencia débil: las medianas coinciden por casualidad y la diferencia
entre desvío muestral y poblacional se disimula con muestras chicas. Con un año de datos reales
de 10 sensores es evidencia fuerte. **Migrar más tarde no es sólo más barato, es más seguro.**

Cuando llegue el momento, lo que hay que tocar:

- `api/utils/estadisticas.py`: entran `PercentileCont`, `Mode` y el mapa de truncadores; salen
  `calcular_estadisticas`, `calcular_percentil`, `_calcular_moda` y `clave_de_medicion`.
  **Quedan** `generar_periodos` y compañía: la base no devuelve los períodos sin datos y la
  grilla de períodos vacíos hay que seguir armándola en Python.
- `api/viewsets/EstadisticaViewSet.py`: los dos modos de agrupación pasan de bucles a querysets.
  La fila Global/Total necesita su propia consulta `.aggregate()`, no se puede derivar de las filas.
  Migrar **también** el endpoint legacy `list`, o quedan dos implementaciones de las mismas fórmulas.
- `.order_by()` explícito y vacío en cada agrupación: si alguien agrega `Meta.ordering` a
  `Medicion`, Django suma esas columnas al `GROUP BY` y la consulta devuelve una fila por medición
  en lugar de una por grupo, sin error.
- `api/tests/test_estadistica_tabla.py`: **no se toca**. Los 22 tests son la red; si alguno falla
  es una diferencia de semántica a investigar, no un test a ajustar.

Dos cosas que **no** hay que hacer todavía, evaluadas y descartadas:

- **Índice BRIN en `fecha_hora`**: sería ideal para datos que llegan en orden temporal, pero el
  índice compuesto que ya crea `UniqueConstraint(limnigrafo, fecha_hora)` cubre exactamente el
  patrón de acceso de estas consultas. Agregar índices sin medir es la misma trampa en chico.
- **Tope de filas de entrada**: hoy es inalcanzable, no se pueden pedir 5 millones de filas que no
  existen, y `MAX_PERIODOS = 500` ya bloquea los casos patológicos de salida. Cuando haya un año
  de datos, conviene un `Count` previo (consulta indexada, milisegundos) que rechace con un
  mensaje claro en lugar de dejar que el contenedor se quede sin memoria.

### Filtro por origen de carga en estadísticas

- [ ] Las estadísticas se calculan sobre **todas** las mediciones del rango, sin poder
      separarlas por `fuente` (`automatico`, `manual`, `import_csv`, `import_json`).
      El caso de uso es de calidad de datos: si un sensor estuvo caído y alguien tapó
      el hueco cargando valores a mano de una planilla, esas lecturas tienen otra
      procedencia y otra confiabilidad. Poder pedir "el promedio sólo de las
      automáticas" es una pregunta legítima que hoy no se puede hacer.
      **El backend ya lo soporta**: `MedicionFilter` expone `fuente`, y
      `/estadisticas/tabla/` y `/medicion/serie/` sólo tendrían que aceptarlo y
      pasarlo al filtro. Del lado del front es un `Select` más en la barra de filtros
      y una clave más en el esquema zod y en la URL.
      Prioridad baja: con la ingesta mayormente automática es un filtro que puede no
      usar nadie, y el frontend legacy tampoco lo tenía — graficaba esa distribución
      pero no dejaba filtrar por ella, que es la inconsistencia que originó la nota.

### Gestión de contraseñas

Las dos entradas salieron al construir el perfil (`/dashboard/perfil`): quedó fuera
a propósito porque cambiar una contraseña necesita más que un campo de texto.

- [ ] **El usuario no puede cambiar su propia contraseña.** `/usuarios/me/` rechaza
      explícitamente el campo (`PerfilSerializer.validate`), y con razón: hacerlo bien
      exige **pedir la contraseña actual**, y ese endpoint no la pide. Sin esa
      verificación, cualquiera que agarre una sesión abierta —un equipo desbloqueado,
      una cookie robada— se apodera de la cuenta cambiando la clave.
      Hoy el único camino es "olvidé mi contraseña" desde el login, que valida por
      correo (`/auth/recuperar-password/*`). Funciona, pero obliga a desloguearse.
      Lo que falta: un endpoint que reciba `contraseña_actual` + `contraseña_nueva`,
      la verifique con `check_password` y aplique los validadores de Django. Existe
      `ChangePasswordSerializer` y una acción en `UsuarioViewSet`, pero está pensada
      para que un administrador la use sobre otro usuario — revisar si sirve de base.

- [ ] **El administrador no puede blanquear la contraseña de un usuario.** Es el caso
      real y frecuente: alguien perdió el acceso y no tiene el correo a mano, o la
      cuenta usa un correo institucional que ya no existe. Hoy la única salida es el
      admin de Django.
      Dos formas, de menor a mayor esfuerzo:
      1. **Blanqueo**: el admin genera una contraseña temporal y el sistema fuerza el
         cambio en el próximo ingreso (requiere una bandera `debe_cambiar_password`
         en `Usuario` y un chequeo en el login).
      2. **Reenvío del flujo de recuperación** desde la ficha del usuario, sin que el
         admin llegue a ver ninguna contraseña. Más seguro, pero depende de que el
         correo del usuario sea válido.
      Sea cual sea, tiene que quedar auditado en `Accion` con el admin como autor: es
      la operación más sensible del sistema.

## Simulador

- [ ] `signals.py` quedó como código muerto: los receivers de `post_save`/`post_delete` de
      `Limnigrafo` sólo imprimen a stdout y llaman a `sincronizar_async()`, cuyo cuerpo es un
      `pass` con la llamada real comentada (`backend/api/signals.py:27`). El comando
      `sincronizar_simulador` **no existe** (el documento que lo describía se eliminó junto
      con esta constatación).
      Eliminar signals + documento cuando se implemente la Parte B del roadmap del simulador
      (el flujo se invierte: el CLI consulta al backend, el backend no escribe nada del simulador).

## Frontend

- [ ] Verificar y corregir la unidad que se muestra para `bateria` y para `altura_agua`.
      El dispositivo reporta **volts** para la batería (fixtures: `bateria_actual: 12.4`) y
      **centímetros** para la altura (decidido, ver `docs/roadmaps/roadmap-simulador.md` A.3.5).
      Si el frontend rotula "%" o "m", está mostrando una batería sana como "12.4 %" y un
      arroyo de 63 cm como 63 metros.
- [ ] Los umbrales de las 6 `ConfiguracionLimnigrafo` están en unidades inconsistentes con lo
      que mide el equipo: altura pensada en metros (debe ser cm) y presión en el orden de
      950–1050, que es presión **atmosférica**, cuando el sensor entrega presión **relativa**
      (~0–200 hPa). Recalcularlos o las alertas se disparan permanentemente.

### El calendario de `DateField` usa la zona del navegador

- [ ] `DateField` (`website/app/components/ui/datefield.tsx`) delega en `Calendar` de shadcn, que
      resuelve "hoy" con la zona horaria del navegador. El resto del módulo de estadísticas trabaja
      explícitamente en la zona del proyecto (`ZONA_PROYECTO` en
      `website/app/utils/estadisticas.utiles.ts`), porque es la misma que usa Django para agrupar
      los períodos y el contenedor de Next corre en UTC.
      Consecuencia: para un usuario cuyo navegador no esté en `America/Argentina/Buenos_Aires`,
      el rango que calcula una ventana rápida puede terminar en una fecha que su calendario
      resalta como "ayer". Ejemplo: alguien en Madrid a las 02:00 del 16 de enero ve
      `hasta = 2026-01-15` (correcto: en Argentina todavía es el 15) mientras el calendario le
      marca el 16 como hoy.
      No afecta a nadie hoy —todos los usuarios están en Ushuaia— y el ida y vuelta de las fechas
      es correcto en cualquier zona (`aDateDesdeFecha` / `aFechaDesdeDate` trabajan por
      componentes). Arreglarlo requiere que `DateField` acepte una zona o un `today` explícito,
      que es un cambio en un componente compartido por varias pantallas.
