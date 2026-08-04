# Roadmap del Simulador de Limnígrafos

Plan de trabajo para que `simulator-go/` deje de generar ruido aleatorio y pase a simular el
comportamiento real del hardware descrito en `limnigrafo-firmware.ino`, escalando a
100 dispositivos.

El documento tiene dos partes:

- **Parte A — Simulador**: el motor. Genera mediciones físicamente plausibles y se comporta
  como el equipo real (adquiere cada N minutos, guarda en memoria, transmite o no según su
  tipo, pierde datos cuando falla).
- **Parte B — CLI**: la herramienta de interacción. Levanta y detiene la simulación, sincroniza
  la lista de dispositivos con el backend, rota tokens y fuerza escenarios (clima, hora, época).

Temas derivados que quedan fuera:
`docs/roadmaps/roadmap-alertas.md` (alertas y estados de error) y `docs/deuda-tecnica.md`.

---

## Separación de responsabilidades

Esto define el límite entre los tres componentes y hay que respetarlo en todas las tareas:

| | Crea dispositivos | Configura el dispositivo | Umbrales de alerta | Genera mediciones |
|---|---|---|---|---|
| **Frontend / backend** | ✅ único lugar | ❌ nunca | ✅ único lugar | ❌ |
| **CLI del simulador** | ❌ sólo lee | ✅ único lugar | ❌ | ❌ |
| **Simulador** | ❌ | ❌ lee su carpeta | ❌ | ✅ |

Reglas:

1. Los dispositivos se **crean, editan y eliminan desde el frontend**. El CLI sólo los lee.
2. La **configuración del dispositivo** (clase, intervalo de recolección, intervalo de envío,
   perfil físico, calibración, semilla) vive en la carpeta local del dispositivo y **se edita
   desde el CLI** — igual que en la realidad, donde se configura por USB con el menú serial del
   firmware (`cambiaTAcq`, `seteaIntTransmision`, `cambiaCal`). El backend no la conoce ni la
   puede cambiar.
3. Los **umbrales de `ConfiguracionLimnigrafo`** (altura/temperatura/presión/batería máximas y
   mínimas, tiempos de advertencia y peligro) son configuración **de alertas del sistema**,
   no del dispositivo. Se editan desde el frontend. El simulador no los lee ni los escribe:
   un equipo real no sabe cuál es su umbral de alerta.
4. Lo **único** que se sincroniza entre backend y simulador es el **token**. Si el token
   guardado en la carpeta del dispositivo deja de funcionar, se resetea desde el CLI.
5. Lo único que el simulador lee del backend, además del token, son los **datos de
   inventario** que no puede inventar: qué dispositivos existen, su `codigo`, su
   `tipo_de_comunicacion` (define la clase inicial) y su `memoria` (dimensiona el buffer).
6. El **clima, la hora y la época son estado interno del simulador**. No se persisten en el
   backend, no viven en `Ubicacion`, no se envían en ninguna medición. El sistema real no debe
   enterarse de que existen: sólo ve las mediciones que producen.

---

# PARTE A — Simulador

## A.0 Limpieza previa

- [ ] Eliminar `simulator-go/config.yaml` del repo (`git rm --cached` + agregarlo al
      `.gitignore`, cuyo patrón hoy está vacío). Los tokens actuales son de prueba y sólo los
      usa el simulador, así que **no hace falta rotarlos**; el archivo desaparece igual porque
      lo reemplazan las carpetas por dispositivo (A.1).
- [ ] Eliminar el binario compilado `simulator-go/scarh-simulator` del repo.
- [ ] Eliminar `setup_tokens.go` por completo. Su función pasa a `auth.go` (Parte B), que
      autentica contra `POST /auth/login/` — el endpoint que `setup_tokens.go` usaba
      (`/usuarios/token/`) no existe, así que el setup nunca funcionó.
- [ ] Eliminar `simulator-go/README.md` y escribir uno nuevo al final (A.8). El actual
      describe comportamiento que no existe: "variaciones naturales", "descarga gradual de
      batería 0.1%-0.5% por medición" y "fallas 5%" son todas falsas (todo es uniforme
      independiente y la probabilidad de sensor nulo es 10%, `generator.go:47`).
- [ ] Limpiar código muerto: `LimnigrafoState.BateriaActual` (`generator.go:24`, declarado y
      nunca usado), `estado_anterior` (`main.go:82`).
- [ ] Unificar la versión de Go: `go.mod` dice `1.20`, el `Dockerfile` compila con
      `golang:1.25-alpine`.
- [ ] `compose.simulator.yml` inyecta `BACKEND_URL=${API_URL}` pero `config.go` nunca lee
      variables de entorno. Esa variable pasa a usarla `auth.go` (Parte B).

## A.1 Estructura por dispositivo

Reemplaza el `config.yaml` monolítico. La configuración se commitea (es reproducible y
revisable); el estado, las mediciones y los tokens no.

```
simulator-go/
├── devices/
│   ├── LM-ARROYO-GRANDE-01/
│   │   ├── device.yaml     # COMMITEADO: perfil físico y de comportamiento
│   │   ├── token           # IGNORADO: API Key (fase B.5)
│   │   ├── state.json      # IGNORADO: estado vivo (nivel, evento en curso, buffer)
│   │   └── mediciones.csv  # IGNORADO: memoria del equipo, formato legacy (A.5)
│   └── ...
└── scenarios/              # COMMITEADO: escenarios reproducibles (A.4)
```

- [ ] `.gitignore`: ignorar `devices/*/token`, `devices/*/state.json`,
      `devices/*/mediciones.csv`. Los `device.yaml` **sí** se commitean.
- [ ] `device.yaml` con:
      - `codigo` (clave de reconciliación con el backend)
      - `clase` — se actualiza automáticamente desde el backend, ver A.2
      - `intervalo_adquisicion_min` y `adquisiciones_por_transmision`
      - perfil hidrológico: `nivel_base`, `tiempo_recesion_h`, `area_cuenca_relativa`
      - perfil térmico y perfil de batería (capacidad, panel solar)
      - calibración `m` / `b` (los mismos que el firmware guarda en EEPROM)
      - probabilidades de falla (sensor, GSM)
      - `seed` para reproducibilidad
- [ ] **Restringir el intervalo de adquisición a los valores que el firmware admite**:
      `i_acq()` sólo acepta **1, 5, 15, 30, 60 o 120 minutos**, y `establece_alarma()` alinea
      la alarma al **siguiente múltiplo de reloj** (con intervalo 15 las mediciones caen en
      :00, :15, :30, :45 — nunca en instantes arbitrarios). El simulador actual usa floats
      arbitrarios (0.3–3 min) que ningún equipo real produce. El alineamiento se ve en los
      gráficos del frontend y vale replicarlo.
- [ ] **Separar adquisición de transmisión**, como el firmware: se mide cada `inter_envio` y se
      guarda; se transmite recién cuando `nTransmAcc == nTransmSet`, enviando el lote acumulado.
      `adquisiciones_por_transmision: -1` = nunca transmite (el `nTransmSet = -1` del firmware).
- [ ] `state.json` con escritura atómica (`.tmp` + `rename`) para retomar donde quedó tras un
      reinicio. **Excepción: la batería no se persiste** — ver A.3.4.
- [ ] Dimensionar el buffer en anillo con el campo `memoria` del backend. Cuando se llena,
      sobreescribe los registros más viejos (2 EEPROM, direcciones 80 y 81, `maxdir = 131071`,
      8 bytes por registro → ~32 766 registros; a 15 min son ~341 días).
- [ ] Actualizar el `Dockerfile`: hoy hace `COPY config.yaml .`. Montar `devices/` como
      volumen para que el estado sobreviva al contenedor.

## A.2 Clases de dispositivo

Nomenclatura: **`actual`** es el firmware que está hoy en el campo (`limnigrafo-firmware.ino`);
**`futuro`** es el firmware corregido que todavía no existe. No son "viejo/nuevo": el equipo
actual es el que está funcionando.

| Clase | Transmite | Formato de archivo local | Descripción |
|---|---|---|---|
| `actual-usb` | ❌ | legacy (A.5.1) | Mide y guarda. Los datos entran por **importación manual** desde el frontend. |
| `actual-get` | ✅ `GET` | legacy (A.5.1) | Transmite como el firmware actual: `GET` con los datos en la query string. Ver D2. |
| `futuro-usb` | ❌ | importable (A.5.2) | Mide y guarda en el formato que el importador ya acepta. Importación manual sin fricción. |
| `futuro-post` | ✅ `POST` | importable (A.5.2) | `POST /medicion/` con `Authorization: Api-Key` y body completo. |

- [ ] La clase se guarda en `device.yaml` y **se edita desde el CLI** (B.3). Al crear la carpeta
      se deriva un valor inicial de `tipo_de_comunicacion` del backend:
      `fisico-usb` → `actual-usb`, cualquier `internet-*` → `actual-get`. A partir de ahí
      la configuración local manda (regla 2).
- [ ] Las cuatro clases **siempre escriben su archivo local**, transmitan o no: el equipo real
      guarda en EEPROM en todos los casos y recién después decide si envía.
- [ ] Las clases que no transmiten (`*-usb`) no generan conflictos de duplicados ni de
      idempotencia: sus datos entran sólo cuando alguien importa el archivo a mano.

### Protocolo de los dispositivos `futuro-post`

- [ ] `POST /medicion/` con `Authorization: Api-Key <token>` y body completo:
      `fecha_hora` (ISO-8601 con zona), `altura_agua`, `temperatura`, `presion`,
      `nivel_de_bateria`, `idempotency_key`. Es lo que ya hace `client.go`.
- [ ] **Los dispositivos no se autentican**: no hay login ni refresh de JWT en el simulador.
      Sólo mandan su token en el header. El JWT es exclusivo del CLI (Parte B).
- [ ] Transmisión en lote real vía `POST /medicion/bulk/` — la action ya existe
      (`MedicionViewSet.bulk_create`, acepta una lista o `{"mediciones": [...]}`) y con una sola
      API Key todas las filas se atribuyen al mismo limnígrafo. Un equipo que acumuló 8
      registros los manda en **un** request.
- [ ] No mandar `limnigrafo` en el body: `MedicionSerializer.validate` resuelve el dispositivo
      desde la API Key, y si el body trae otro, rechaza.
- [ ] Reintento con backoff + `idempotency_key` (ya tiene constraint único en `Medicion`), para
      que un reintento sea seguro y no se pierdan registros. El simulador debe tratar el error
      de idempotencia como éxito.
- [ ] **Un cliente HTTP por dispositivo**, no compartido, con `DisableKeepAlives` según la
      clase — ver A.6.

## A.3 Motor físico

Reemplaza `generator.go` completo. Hoy todo es `min + rand.Float64()*(max-min)`: uniforme
independiente, sin memoria ni correlación temporal.

### A.3.1 Temperatura del agua — ciclos anidados

- [ ] Componente estacional: `T_est(d) = T_media + A_anual · sin(2π(d − d₀)/365)`.
      **Hemisferio sur**, máximo a mediados de enero. Ushuaia, agua de río:
      `T_media ≈ 6 °C`, `A_anual ≈ 4` → rango ~2–10 °C.
- [ ] Componente diaria: `A_dia · sin(2π(t − t₀)/24)`, con el pico desfasado a **~16-17 h**
      (el agua retrasa el forzante solar, no coincide con el mediodía).
      `A_dia ≈ 1.5 °C` en verano, `≈ 0.4 °C` en invierno.
- [ ] Atenuación por nubosidad: `A_dia · (1 − 0.7 · nubosidad)`. Un día tapado casi no tiene
      ciclo diario.
- [ ] Ruido blanco del sensor: ±0.2 °C.
- [ ] Enfriamiento por evento: la escorrentía de lluvia baja la temperatura 0.5–1.5 °C
      durante la crecida.
- [ ] Piso físico: nunca por debajo de ~0 °C. El rango `-5 a 25` del `config.yaml` actual no
      corresponde a agua de río en Ushuaia.
- [ ] Nota: el firmware usa la temperatura **sólo** para calcular el peso específico y de ahí
      la profundidad (`sensor_profundidad()`), y no la transmite en el protocolo legacy.

### A.3.2 Altura del agua — caudal base + hidrograma

- [ ] Nivel base con deriva estacional: el **deshielo de primavera** (oct–dic) eleva el caudal
      base en Ushuaia.
- [ ] Ruido de oleaje / error del sensor en régimen estable: ±1–2 unidades de la resolución.
- [ ] **Crecida**: ascenso rápido (30–90 min) hasta el pico, con `Δh` proporcional a
      intensidad × duración de la lluvia × `area_cuenca_relativa`.
- [ ] **Recesión exponencial** hacia el nivel base, con la asimetría clásica del hidrograma
      (sube casi vertical, baja en pendiente suave).
- [ ] **La recesión debe ser independiente del intervalo de muestreo.** Un
      `nivel = nivel_anterior × 0.95` por muestra decae 60× más rápido en un equipo de 1 min
      que en uno de 60 min, y el firmware admite intervalos de 1 a 120. Usar reservorio lineal:

      ```
      k = exp(−Δt / T_recesion)
      nivel = nivel_base + (nivel_anterior − nivel_base) · k
      ```

      con `T_recesion` por dispositivo (6–18 h: cuenca chica y empinada = recesión rápida).
      Así el mismo evento produce la misma curva en tiempo real sin importar cada cuánto mida
      el equipo, y sigue siendo correcto cuando el reloj se acelere (A.4, A.6).
- [ ] Permitir que el pico supere el rango normal: es lo que tiene que disparar las alertas
      de peligro del backend.
- [ ] **Cuantizar a 1 decimal** antes de guardar o transmitir — ver A.3.5.

### A.3.3 Presión — derivada de la altura

- [ ] Presión hidrostática `p = ρ · g · h`, usando **el mismo peso específico que el firmware**
      (firmware:689-695) para que simulador y equipo real sean consistentes:

      ```
      T ≤ 15 °C → pesp = 9810 N/m³
      T > 15 °C → pesp = 0.0001·T⁴ − 0.0162·T³ + 0.7749·T² − 17.998·T + 9953.7
      p_hidrostatica[Pa] = pesp · h[m]
      ```

      En Ushuaia el agua casi siempre está ≤ 15 °C, así que en la práctica `p ≈ 98.1 · h` hPa.
      (Con la altura en centímetros: `p[hPa] ≈ 0.981 · h[cm]`.)
- [ ] Coherencia obligatoria: si se reportan altura y presión, tienen que derivar de la misma
      `h` y el mismo `pesp`, porque el equipo real las obtiene una de la otra.
      Test del ida y vuelta `h → p → h` contra `sensor_profundidad()` (A.7).
- [ ] **Presión relativa (manométrica)**, no absoluta — ver D3, resuelta: `sensor_profundidad()`
      calcula la altura sin ningún término de compensación atmosférica, lo que sólo es correcto
      si el sensor entrega presión relativa. Reportar `p = pesp · h`, sin sumar atmósfera.
- [ ] Consecuencia: la presión queda **redundante con la altura** (es la misma señal por una
      constante). Sirve para verificar consistencia, no aporta información nueva. La única
      contribución independiente es la temperatura vía `pesp`, y sólo por encima de 15 °C
      (raro en Ushuaia).
- [ ] **Umbrales de alerta existentes**: las 6 configuraciones tienen `presion_minima/maxima`
      en el orden de 950–1050, que son valores de presión **atmosférica**. Con presión relativa
      el rango real es ~0–200 hPa. Recalcularlos.

### A.3.4 Batería — arranca al máximo y se descarga

- [ ] **Al iniciar la simulación, todos los dispositivos arrancan con la batería al máximo** y
      se descargan desde ahí. No se persiste el nivel entre ejecuciones (simplifica el estado).
      El CLI puede reiniciar la batería de uno o de todos, lo que la vuelve al máximo (B.3).
- [ ] Modelar estado de carga integrado en el tiempo y derivar el voltaje, en vez de sortear
      volts sueltos: `dSOC = (P_solar(hora, nubosidad, época) − P_consumo) · Δt / C`.
- [ ] Voltaje desde SOC, en **volts** (unidad real: las fixtures traen `bateria_actual: 12.4`
      y `Bat()` del firmware devuelve volts de una batería de 12 V):
      ~11.8 V al 20 % de SOC, ~12.7 V al 100 %, ~13.8 V mientras el panel carga.
- [ ] **Estacionalidad fuerte**: Ushuaia tiene ~7 h de luz en invierno y ~17 h en verano.
      El invierno genera déficit acumulado → caída lenta del voltaje a lo largo de días →
      batería baja. Es uno de los escenarios más valiosos para probar el sistema.
- [ ] Consumo extra por transmisión (el pico de TX del GSM es el mayor consumo del equipo).
- [ ] **Umbrales del firmware**, que producen comportamiento observable:
      - `graba_pagina()` sólo guarda si `Bat() > 5 V` → por debajo, el equipo no registra nada.
      - El bloque de envío sólo corre si `readVcc() > 4750 mV` → con batería baja **mide pero
        no transmite**: los datos se acumulan y salen todos juntos cuando recupera. Eso produce
        un hueco seguido de una ráfaga, patrón que el backend y el frontend tienen que tolerar.
- [ ] Transmitir con **un decimal** (`b1,b2` en `leepagina`).
- [ ] Verificar y corregir la unidad en el frontend: si hoy renderiza "%" con un valor de 12.4,
      está mostrando "12.4 %" para una batería sana (ver `docs/deuda-tecnica.md`).

### A.3.5 Unidad y resolución de la altura: centímetros

**Decidido: la altura se expresa en centímetros**, tal como la mide y reporta el dispositivo.
Nada convierte a metros en ningún punto de la cadena.

Evidencia del CSV real (`descarga20052026115617.csv`, 4744 registros de 06/2025 a 05/2026):

- **Los 4744 valores terminan en `0`** en el segundo decimal (`63.20`, `62.70`, `7.00`).
  El segundo decimal es un artefacto de formato de `String(float)` de Arduino: la
  **resolución real es 1 decimal**.
- Rango observado: **6.70 a 139.40 cm** — de 6.7 cm en estiaje a 1.39 m en crecida, coherente
  con un arroyo. "Altura de escala" en centímetros es además la convención hidrométrica local.
- Cadena de unidades del firmware: `graba_pagina()` guarda `int h = sensor_profundidad() * 10`
  (entero) y `leepagina()` hace `ha = altura / 10` → **almacena milímetros como entero y
  reporta centímetros con un decimal**. Resolución efectiva: **1 mm**.

Tareas:

- [ ] Trabajar internamente con el **entero en milímetros**, como el firmware, y cuantizar a
      **1 decimal en centímetros** al guardar o transmitir.
- [ ] Perfiles hidrológicos en centímetros: `nivel_base` del orden de 60–80 cm, crecidas a
      120–200 cm. El `config.yaml` viejo usaba 0.5–3.5 (metros), 100× más chico.
- [ ] **Frontend**: rotular `cm`. Si hoy muestra "m" sobre un valor en centímetros, está
      mostrando un río 100× más profundo. Ver `docs/deuda-tecnica.md`.
- [ ] **Umbrales de alerta existentes**: las 6 `ConfiguracionLimnigrafo` tienen
      `altura_minima_agua` / `altura_maxima_agua` pensados en metros. Recalcularlos a
      centímetros o las alertas de peligro se disparan con cualquier medición.

### A.3.6 Fallas de sensor

- [ ] Fallas **correlacionadas y persistentes**, no independientes por muestra: un sensor que
      falla tiende a seguir fallando varias muestras (racha) y después se recupera.
      Hoy es un `rand.Float64() < 0.1` por medición, sin memoria.
- [ ] Enviar los centinelas reales del firmware, **como ya los envía el simulador hoy**:
      `-1000` (checksum), `-1001` (sin ACK tras 20 reintentos), `-1002` (sin respuesta),
      `-1003` (batería baja). Van en el campo de altura.
      Que el backend los reciba y genere la alerta/estado correspondiente es tarea de
      `docs/roadmaps/roadmap-alertas.md`, no del simulador.
- [ ] Deriva de calibración: dejar que `m`/`b` se desvíen lentamente en algún dispositivo
      (sensor descalibrado) → offset sistemático, caso de prueba distinto al ruido.
- [ ] Deriva del RTC: `cambia_alarma()` suma el intervalo a la hora leída, así que el error se
      **acumula**. Simular unos segundos de drift por día en algún equipo.
- [ ] **Pérdida de datos en fallo de red** (sólo para clases que transmiten): tras intentar
      transmitir, el firmware hace `nro_pagina = 0` (firmware:1973) **incluso si el registro a
      la red falló y no se envió nada**. Esos registros quedan en memoria pero nunca se
      retransmiten → **hueco permanente**. Es la causa más probable de los huecos que se ven
      en producción, y el argumento técnico para justificar el recambio de hardware: el
      protocolo `futuro-post` con `idempotency_key` y reintento no pierde datos.

### A.3.7 Zona horaria

- [ ] El simulador trabaja en **`America/Argentina/Ushuaia`**, igual que el RTC del equipo.
      El firmware transmite `DD-MM-YYYY HH:MM` en hora local sin zona y con resolución de
      minuto (los segundos se leen en `tomahora()` pero no se guardan).
- [ ] Los dispositivos `futuro-*` usan `fecha_hora` ISO-8601 **con** zona explícita y segundos.

## A.4 Clima, hora y época

**Son estado interno y global del simulador.** No se persisten en el backend, no se guardan en
`Ubicacion`, no viajan en ninguna medición y no existe ningún campo del modelo que los
represente. El sistema real sólo ve las mediciones que producen; que hayan sido causadas por una
"tormenta" es invisible para él.

- [ ] Un único estado global de clima, hora y época para toda la flota, en memoria del proceso
      del motor. Nada de esto se escribe en `device.yaml` ni se manda al backend.
- [ ] Estados de clima: `tormenta`, `lluvia`, `nieve`, `nublado`, `despejado`.
      Máquina de estados con transiciones dependientes de la época.
- [ ] `nieve`: precipitación que **no** genera escorrentía inmediata — se acumula y derrite
      después. Buen caso de borde (precipita y el río no sube).
- [ ] Épocas: `invierno` y `verano` (hemisferio sur). Afectan amplitud térmica, horas de luz
      (batería), frecuencia de lluvia y deshielo.
- [ ] Franjas horarias: `mañana`, `mediodía`, `noche`. Se implementan como **offset del reloj
      simulado**, no como un flag: cambiar la hora mueve el reloj del dispositivo, y de ahí
      salen solos el ciclo térmico y el balance solar.
- [ ] **Transición acelerada.** Cuando el CLI cambia clima, hora o época, el efecto debe verse
      rápido: aplicar un factor de aceleración a la tasa de cambio durante una ventana corta
      (ej. convergencia al régimen nuevo en 1–2 minutos reales) y después **volver al ritmo
      normal** mientras el estado se mantenga. Esto es lo que hace la simulación usable para
      demostrar algo sin esperar horas.
- [ ] Requiere un **reloj virtual**: abstraer `time.Now()` / `time.Sleep()` detrás de una
      interfaz `Clock` con implementación real y acelerada. Es un refactor estructural que
      conviene hacer **junto con** A.3, porque todo el motor físico depende de `Δt`.
      (Otra razón para la recesión `exp(−Δt/T)`: con reloj acelerado sigue siendo correcta.)
- [ ] `scenarios/*.yaml` commiteados y reproducibles con semilla fija:
      `tormenta-extrema`, `deshielo-primavera`, `invierno-bateria-critica`, `red-degradada`.
- [ ] Mantener un equivalente al `force_alerts` actual: un modo que dispare cada tipo de
      condición a demanda, sin esperar a que la probabilidad lo haga.

## A.5 Almacenamiento local: dos formatos según la clase

Todos los dispositivos escriben `mediciones.csv`, pero el formato depende de la clase, así se
pueden probar los dos caminos de importación:

- **`actual-usb` / `actual-get`** → formato legacy de la app de Electron (A.5.1).
- **`futuro-usb` / `futuro-post`** → formato que el importador ya acepta sin fricción (A.5.2).

### A.5.1 Formato legacy (clases `actual-*`)

**El formato exacto que exporta la aplicación legacy de Electron**, para probar la importación
con archivos indistinguibles de los reales.

Formato verificado sobre `descarga20052026115617.csv`:

```
Limnigrafo Digital Recursos Hidricos;;
Fecha;Hora;Altura Escala
20/05/2026;11:00;"63.20
"
20/05/2026;10:00;"62.70
"
```

Detalles a replicar **byte a byte**:

- [ ] Separador `;`. Primera línea de título con **dos `;` al final**.
- [ ] Segunda línea de encabezado: `Fecha;Hora;Altura Escala`.
- [ ] Fecha `DD/MM/YYYY`, hora `HH:MM` (sin segundos).
- [ ] El valor de altura va **entre comillas dobles y con un `CR` antes de la comilla de
      cierre** (`"63.20\r"`): es el `Serial.println` del firmware capturado por la app de
      Electron. Todas las líneas terminan en `CRLF`.
- [ ] Dos decimales de formato, **pero el segundo siempre `0`** (resolución real de 1 decimal,
      ver A.3.5).
- [ ] Orden **descendente** por fecha/hora (el registro más nuevo primero), porque
      `leepagina()` recorre la EEPROM hacia atrás desde la última dirección.
- [ ] **No incluye batería, temperatura ni presión**: el volcado por USB sólo trae fecha, hora
      y altura. Los otros campos existen en el equipo pero no en esta exportación.
- [ ] Nombre de archivo con el patrón `descargaDDMMYYYYHHMMSS.csv` al exportar desde el CLI.
- [ ] Usar `mediciones_mal_formadas.csv` (raíz del repo) como referencia del mismo formato con
      datos inválidos: fechas `MM/DD/YYYY`, alturas negativas. Sirve para probar el camino de
      errores del importador.

### A.5.2 Formato importable (clases `futuro-*`)

El importador del frontend (`website/app/utils/mediciones.utiles.ts:107`) normaliza las
cabeceras (minúsculas, sin tildes, espacios → `_`), autodetecta el separador y acepta estos
nombres de columna:

| Campo | Cabeceras aceptadas |
|---|---|
| Fecha y hora | `fecha_hora`, o `fecha` + `hora` en columnas separadas |
| Altura | `altura_agua`, `altura_escala`, `altura` |
| Temperatura | `temperatura` |
| Presión | `presion` |
| Batería | `nivel_de_bateria`, `bateria` |
| Limnígrafo | `limnigrafo`, `limnigrafo_id`, `id_limnigrafo` |

- [ ] Emitir con separador `;` y cabecera
      `fecha_hora;altura_agua;temperatura;presion;nivel_de_bateria`.
- [ ] `fecha_hora` en ISO-8601 con zona (`parse_datetime` de Django lo acepta directo en
      `normalizar_fecha_importacion`), con segundos.
- [ ] Incluir **todos** los campos: a diferencia del volcado legacy, el firmware futuro sí
      expone temperatura, presión y batería.
- [ ] **BOM UTF-8** al principio, como hace `exportarComoCSV`
      (`website/app/utils/exportar.utiles.ts:23`), para que Excel lo abra bien.
- [ ] Orden **ascendente** por fecha/hora (el legacy va descendente por cómo recorre la EEPROM;
      acá no hay razón para invertirlo).
- [ ] No emitir la columna `limnigrafo`: el importador permite elegir un limnígrafo por defecto
      (`fallback_limnigrafo_id`) y así el mismo archivo sirve para cualquier dispositivo.

## A.6 Independencia entre dispositivos y escala a 100

Principio: **cada dispositivo es un proceso lógico aislado. Ningún mutex, ningún estado
mutable compartido.** Un equipo real no coordina con otro.

- [ ] **RNG propio por dispositivo** (`*rand.Rand` con semilla derivada de `device.yaml`),
      no el `rand` global. El `rand` global de Go tiene un mutex interno: con 100 goroutines
      es contención y además rompe la independencia (el orden de ejecución afecta la secuencia
      de cada dispositivo). Con RNG propio, cada dispositivo es reproducible por separado.
      Bonus: elimina el `rand.Seed` de `main.go:30`, deprecado desde Go 1.20.
- [ ] **Cliente HTTP propio por dispositivo**, no uno compartido. Cada dispositivo simula su
      propio módem: `DisableKeepAlives: true` para que cada envío abra y cierre su conexión TCP,
      como hace el firmware con `CIPSTART` → `CIPSEND` → `CIPCLOSE` y `Connection: close`.
      Los `futuro-post` sí pueden reusar conexión dentro de un mismo lote.
      A esta escala no hay riesgo de agotar sockets: 100 equipos a 15 min son ~0.1 req/s.
- [ ] **Sin limitador global de tasa** (sería un mutex compartido). Para evitar el pico
      sincronizado que genera el alineamiento a reloj, usar **jitter por dispositivo derivado
      de su propia semilla** — descentralizado, sin coordinación. El desfase inicial que ya
      existe (`main.go:99-104`) va en esa dirección.
- [ ] **Estado por dispositivo en su propio archivo**, sin estructura compartida en memoria.
- [ ] **Apagado ordenado**: hoy `wg.Wait()` espera para siempre y no hay manejo de señales.
      Escuchar SIGTERM/SIGINT, cancelar por `context` y flushear el `state.json` de cada
      dispositivo. Sin esto, cada `docker compose restart` pierde el estado.
- [ ] **Logging**: el recuadro ASCII por medición (`main.go:142-165`) es ilegible con 100
      dispositivos. Niveles vía `LOG_LEVEL`, formato de una línea y resumen periódico
      agregado (enviadas / fallidas / en falla / batería baja).
- [ ] **Modo backfill histórico**: generar N días de mediciones pasadas y cargarlas por
      `POST /medicion/bulk/` en tandas, para que las estadísticas y los gráficos tengan datos
      desde el primer día. Ojo: `bulk_create` evalúa alertas por cada medición del lote
      (ver `docs/roadmaps/roadmap-alertas.md`).

## A.7 Tests — sólo la parte matemática

Deliberadamente acotado: **no** hacer suite de integración ni tests de la capa HTTP, para no
gastar más tiempo del necesario.

- [ ] La recesión es invariante al `Δt`: el mismo evento muestreado a 1, 15 y 60 min da la
      misma curva en tiempo real.
- [ ] Conversión `h → p → h` contra la fórmula de `sensor_profundidad()` del firmware.
- [ ] Cuantización a 1 decimal y round-trip del entero interno.
- [ ] Ciclos senoidales: el pico diario de temperatura cae a la hora esperada y el estacional
      en el mes esperado (hemisferio sur).
- [ ] Formato exacto del CSV legacy (incluido el `CR` dentro de las comillas y el `CRLF`).

## A.8 Documentación nueva

- [ ] Escribir `simulator-go/README.md` de cero, después de A.1–A.6, describiendo lo que el
      simulador **realmente** hace. Incluir la tabla de separación de responsabilidades y la
      justificación de las decisiones físicas.
- [x] Eliminar `docs/SINCRONIZACION_LIMNIGRAFOS.md`: documentaba un comando
      `sincronizar_simulador` que no existe y un flujo (Django escribe el `config.yaml` del
      simulador) que la Parte B invierte. Ver `docs/deuda-tecnica.md`.

---

# PARTE B — CLI del simulador

Herramienta interactiva para operar el simulador: iniciarlo, detenerlo, sincronizar la flota
con el backend, rotar tokens y forzar escenarios.

## B.1 Arranque y autenticación

- [ ] **Login una sola vez, al entrar al CLI.** `POST /auth/login/` con las credenciales de
      administrador tomadas del `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`, que
      `compose.simulator.yml` ya inyecta con `env_file`). URL del backend desde
      `BACKEND_URL`/`API_URL`.
- [ ] Si responde **401**: mostrar un mensaje de error claro y **salir del CLI**. No reintentar
      ni pedir credenciales por stdin.
- [ ] **Sin refresh de JWT.** El CLI es de sesión corta; el access token alcanza. (Los
      dispositivos no se autentican: sólo mandan su API Key.)
- [ ] Módulo `auth.go`, que reemplaza a `setup_tokens.go`.

## B.2 Sincronización de la flota

- [ ] **Primer GET al entrar**: `GET /limnigrafos/?limit=9999`.
      El paginado del backend obliga a esto; su eliminación queda anotada en
      `docs/deuda-tecnica.md`.
- [ ] **Crear automáticamente la carpeta de cada dispositivo** que no la tenga, con un
      `device.yaml` de perfil por defecto derivado de su ubicación. Si la carpeta ya existe,
      **omitir el paso sin tocar nada**: la configuración local es la fuente de verdad del
      dispositivo y el backend no la puede sobreescribir.
- [ ] **Derivar la `clase` inicial** de `tipo_de_comunicacion` sólo al **crear** la carpeta
      (`fisico-usb` → `actual-usb`, cualquier `internet-*` → `actual-get`). En las
      sincronizaciones siguientes **no** sobreescribirla: la clase se configura desde el menú
      del CLI (B.3, ítem 9) y la configuración local es la fuente de verdad del dispositivo.
- [ ] Reconciliar por **`codigo`**, no por `id`: el `id` cambia si se recrea la base, el
      `codigo` es `unique` y estable.
- [ ] El CLI **no crea, edita ni elimina** limnígrafos: eso se hace desde el frontend.
- [ ] El CLI **no configura umbrales**: son configuración de alertas y se editan desde el
      frontend.
- [ ] Ubicaciones: usar **sólo las 6 existentes** de `backend/api/fixtures/ubicaciones.json`
      (Arroyo Grande/Ruta 3, Río Pipo/PN TdF, Arroyo Buena Esperanza/Centro, Río Olivia/Zona
      Este, Arroyo Mackinlay/Puerto, Río Carbajal/Valle Tierra Mayor). No generar más.
      Una mejor representación del modelo queda en `docs/deuda-tecnica.md`.

## B.3 Menú

Después del login y la sincronización:

```
 0. Iniciar / detener simulación       ← implícito en "interactuar para iniciarlo y pararlo"
 1. Listar dispositivos
 2. Rotar todas las claves
 3. Rotar una clave
 4. Reiniciar todas las baterías
 5. Reiniciar una batería
 6. Cambiar clima (tormenta, lluvia, nieve, nublado, despejado)
 7. Cambiar hora (mañana, mediodía, noche)
 8. Cambiar época (invierno, verano)
 9. Configurar dispositivo                                    ← A.1 / A.2
      · clase (actual-usb, actual-get, futuro-post, futuro-usb)
      · intervalo de recolección (1, 5, 15, 30, 60, 120 min)
      · intervalo de envío (cada N recolecciones; -1 = nunca)
```

- [ ] **Listar dispositivos**: código, clase, ubicación, estado de la simulación, última
      medición generada, batería actual, y si tiene token válido. El clima/hora/época vigentes
      se muestran aparte, en la cabecera, porque son globales.
- [ ] **Rotar claves** (todas o una): ver B.5.
- [ ] **Reiniciar baterías** (todas o una): vuelve el nivel al máximo (A.3.4).
- [ ] **Cambiar clima / hora / época**: **globales**, aplican a toda la flota. Efecto visible
      rápido por la transición acelerada de A.4. Nunca se persisten en el backend.
- [ ] **Configurar dispositivo**: escribe el `device.yaml` de la carpeta. Es el equivalente al
      menú serial del firmware (`cambiaTAcq` → intervalo de adquisición,
      `seteaIntTransmision` → cada cuántas adquisiciones transmite). Validar que el intervalo
      de recolección sea uno de los seis valores admitidos.
- [ ] Aplicar el cambio de configuración **en caliente** si la simulación está corriendo, o
      dejar claro que requiere reiniciarla. Recomendado: releer el `device.yaml` del dispositivo
      afectado, sin tocar a los demás (respeta la independencia de A.6).
- [ ] **Iniciar / detener**: arranca o para el motor de simulación sin salir del CLI.
- [ ] Confirmación explícita en las acciones destructivas (rotar todas las claves invalida las
      anteriores).

## B.4 Arquitectura CLI ↔ simulador

- [ ] **Un solo binario, dos modos**: `simulator run` (motor, es lo que corre en Docker) y
      `simulator cli` (menú interactivo). El CLI le habla al motor por una **API de control
      local** (HTTP en `localhost`), no por memoria compartida.
      Razón: en Docker el motor corre sin TTY (`restart: always`), así que el menú no puede
      ser parte del mismo proceso; y con una API de control el mismo CLI sirve para un motor
      local o uno en el contenedor.
- [ ] Endpoints de control mínimos: `GET /status`, `POST /start`, `POST /stop`,
      `POST /devices/{codigo}/battery/reset`, `POST /weather`, `POST /time`, `POST /season`.
- [ ] Que la API de control **escuche sólo en loopback**: no expone nada al exterior.

## B.5 Tokens

- [ ] `POST /limnigrafos/{id}/generate_key/` (con guion **bajo**; el comentario de
      `setup_tokens.go:26` decía `generate-key`, que es incorrecto). Devuelve `secret_key`
      **una sola vez** y el backend borra las claves previas con prefijo `LMG-{id}`
      (`LimnigrafoViewSet.py:166`): regenerar **invalida** la anterior.
- [ ] Guardar el token en `devices/<codigo>/token`, **gitignoreado**. Nunca commitear tokens.
- [ ] Rotar **todas** las claves o **una** sola, desde el menú.
- [ ] Si el token guardado no funciona (`401`/`403` al transmitir), el dispositivo lo reporta en
      el estado y **se resetea desde el CLI** — la rotación no es automática, porque requiere el
      JWT de administrador que sólo tiene el CLI.
- [ ] Nunca loguear la clave completa: ya existe `previewToken` (`main.go:216`), usarla en
      todos los caminos.

---

# PARTE C — Cambios en el backend

Todo lo que hay que tocar del lado de Django para que las partes A y B funcionen. Están
separados porque son de otro repo lógico, otro lenguaje y probablemente otra tanda de trabajo.

Ninguno de estos cambios es requisito para **arrancar** las partes A y B: se puede construir el
simulador completo con dispositivos `futuro-post` y `*-usb` sin tocar el backend. Los de C.1 y
C.2 son los que desbloquean los casos que faltan.

## C.1 Unidades y umbrales (bloquea las alertas, no la simulación)

Consecuencia directa de las decisiones D1 (altura en centímetros) y D3 (presión relativa).
Las 6 `ConfiguracionLimnigrafo` existentes tienen umbrales en unidades que no corresponden a lo
que mide el equipo, así que en cuanto el simulador genere datos realistas las alertas se
disparan permanentemente.

- [ ] Recalcular `altura_minima_agua` / `altura_maxima_agua` a **centímetros** (hoy están
      pensados en metros).
- [ ] Recalcular `presion_minima` / `presion_maxima` al rango de presión **relativa**
      (~0–200 hPa). Hoy están en 950–1050, que son valores de presión **atmosférica**.
- [ ] Recalcular `bateria_min` / `bateria_max` en **volts** (plomo-ácido 12 V: ~11.5 a ~13.8 V).
      Las fixtures ya traen `bateria_actual: 12.4`, así que el dato de medición ya está en volts;
      son los umbrales los que están en otra escala.
- [ ] Actualizar `backend/api/fixtures/limnigrafos.json` en consecuencia.
- [ ] Documentar la unidad de cada campo en el modelo (docstring o `help_text`), porque el
      origen de todo este lío es que ningún campo declara su unidad.
- [ ] Frontend: rotular `cm`, `hPa` y `V`. Ver `docs/deuda-tecnica.md`.

## C.2 Endpoint legacy para `actual-get`

**Sólo si se resuelve D2 a favor de implementar `actual-get`.** Es el único cambio de backend
que requiere código nuevo y no sólo ajuste de datos.

- [ ] Endpoint nuevo que acepte `GET` con los datos en la query string, **sin autenticación por
      API Key** (el firmware no manda ninguna credencial).
- [ ] Parsear el formato `dato=DD-MM-YYYY%20HH:MM%20<alt_ent>,<alt_dec>%20<bat_ent>,<bat_dec>`
      que arma `leepagina()`.
- [ ] **Resolver la identidad del dispositivo**: el request no trae identificador alguno.
      Es el nudo de D2 y hay que definir el mecanismo (path por código, parámetro extra, mapeo
      por IP/SIM) sabiendo que el firmware actual no produce ninguno de los tres.
- [ ] Asumir zona `America/Argentina/Ushuaia` para el timestamp (viene sin zona y con
      resolución de minuto).
- [ ] Guardar con `fuente: automatico`.
- [ ] Mapear los centinelas negativos de altura — ver C.3.
- [ ] Responder algo, pero sin esperar que el equipo lo lea: el firmware **nunca parsea la
      respuesta HTTP**, no distingue un 200 de un 500.

## C.3 Estados de error y alertas → `docs/roadmaps/roadmap-alertas.md`

Se ignora por ahora. Lo que el simulador necesita de ahí, cuando se retome:

- [ ] Que la ingesta **acepte** los centinelas `-1000` / `-1001` / `-1002` / `-1003` en lugar de
      rechazarlos con `400`. Hoy `validar_datos_medicion`
      (`backend/api/serializer/medicionSerializer.py:20`) rechaza `altura_agua < 0`, así que
      **el simulador no puede enviar fallas de sensor a la API** aunque las genere.
      Mientras no esté, los dispositivos `futuro-post` sólo pueden reportar los centinelas en su
      archivo local, no por la API.
- [ ] Los cuatro estados nuevos de `estado_medicion` y el tipo de alerta de error de sensor.
- [ ] Decidir si las cargas masivas (importación y backfill) generan alertas retroactivas.

## C.4 Ajustes menores

- [ ] **`TIME_ZONE`**: `backend/core/settings.py:158` usa
      `America/Argentina/Buenos_Aires`. Debería ser `America/Argentina/Ushuaia`.
      Hoy es **inocuo** (ambas son UTC−3 sin horario de verano, así que el offset es idéntico),
      pero `normalizar_fecha_importacion` resuelve las fechas sin zona con
      `timezone.get_current_timezone()`, y el nombre correcto evita sorpresas si alguna vez
      cambia la política de husos.
- [ ] **Campo `memoria`**: las fixtures traen `2147483647` (placeholder). El simulador lo lee
      para dimensionar su buffer en anillo, así que necesita el valor real (~32 766 registros:
      2 EEPROM, 8 bytes por registro). Ver `docs/deuda-tecnica.md`.
- [ ] **Paginado de `/limnigrafos/`**: mientras exista, el CLI consulta con `?limit=9999` (B.2).
      Su eliminación está en `docs/deuda-tecnica.md`.
- [ ] **Relación `Limnigrafo` ↔ `APIKey`**: hoy la identidad se deduce parseando el nombre de la
      clave (`LMG-{id}_{codigo}_{desc}`). Frágil, pero **no bloquea** al simulador. Está en
      `docs/deuda-tecnica.md`.
- [ ] **`signals.py`**: eliminar los receivers de `Limnigrafo`, que sólo imprimen a stdout y
      llaman a una función con el cuerpo comentado. La Parte B invierte el flujo (el CLI
      consulta al backend; el backend no escribe nada del simulador), así que quedan sin sentido.
      `docs/SINCRONIZACION_LIMNIGRAFOS.md` ya fue eliminado.

---

## Orden de ejecución sugerido

```
A.0 limpieza
 │
 ├─▶ A.1 carpetas ──▶ B.1 login ──▶ B.2 sincronización ──▶ B.5 tokens ──▶ B.3/B.4 menú
 │
 ├─▶ C.1 unidades y umbrales        (independiente, pero sin esto las alertas son ruido)
 │
 └─▶ A.3 motor físico + reloj virtual (A.4) ──▶ A.4 clima/hora/época
                    │
                    ├─▶ A.2 clases y protocolos ──▶ A.5 CSV legacy
                    │
                    └─▶ A.6 independencia y escala ──▶ A.7 tests ──▶ A.8 docs
```

Las ramas A y B son independientes y se pueden trabajar en paralelo. El reloj virtual (A.4)
tiene que entrar junto con el motor físico (A.3), no después.

La Parte C es independiente de todo: el simulador se puede construir y correr completo, con
dispositivos `futuro-post` y `*-usb`, sin tocar el backend. Lo único que no se puede hacer sin
C es enviar fallas de sensor por la API (C.3) e implementar `actual-get` (C.2), y sin C.1 las
alertas que se generen no significan nada.

## Decisiones tomadas

- **D1 — Unidad de la altura: centímetros.** Tal como la mide el dispositivo, sin conversión
  en ningún punto. Internamente milímetros enteros, se reporta con un decimal en cm. Ver A.3.5.
- **D3 — Presión: relativa (manométrica).** `sensor_profundidad()` del firmware calcula la
  altura sin ningún término de compensación atmosférica, lo que sólo es correcto si el sensor
  entrega presión relativa (sensor ventilado). Se reporta `p = pesp · h`, sin sumar atmósfera.
  Ver A.3.3.
- **D4 — Clima, hora y época: globales del simulador.** No se persisten en el backend ni en
  `Ubicacion`, y el sistema real no se entera de que existen. Ver A.4.

## Decisiones pendientes

- **D2 — ¿Se implementa `actual-get`?** Es la única clase que requiere un endpoint nuevo en el
  backend, y arrastra un problema sin solución limpia: el `GET /save-get.php?dato=...` del
  firmware **no lleva ningún identificador de dispositivo** (el firmware sólo configura el
  *host* en `cambiaServer()`, el path está hardcodeado en `leepagina()`), así que el backend no
  puede saber qué limnígrafo escribió. Habría que inventar un mecanismo de atribución
  (path por código, parámetro extra, mapeo por IP/SIM) que el firmware actual **no** produce,
  o sea que el simulador estaría simulando algo que el equipo real no hace.
  Si en el campo los equipos actuales se descargan por USB, `actual-get` no aporta nada y
  conviene no implementarlo. Bloquea sólo esa clase; las otras tres son independientes.
