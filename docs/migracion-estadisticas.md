# Migración de la Pantalla de Estadísticas

Análisis de la pantalla de estadísticas del frontend legacy (`frontend/app/(pages)/estadisticas/`, Next.js 14) y plan de migración a `website/` (Next.js 16), contrastando lo que hay implementado contra lo que exige `modulo-4-analisis-datos.md` y contra lo que ya resuelve `EstadisticaViewSet` en el backend.

Estado actual en `website`: la ruta `dashboard/estadisticas/page.tsx` es un placeholder de 11 líneas que sólo saluda al usuario. Existen `models/models.estadistica.ts` y `services/api/next-server/estadistica.ts`, ambos incompletos (ver §4). **Todo el módulo está por migrar.**

---

## 1. Qué hay hoy en la pantalla

La página legacy son 694 líneas en un único componente `"use client"`, más 2 hooks de datos, 1 hook de cálculo, 2 archivos de dominio, 5 componentes y 1 helper de exportación. Se organiza en dos pestañas.

### Pestaña “Gráficos”

| Bloque | Contenido | Origen de los datos |
|---|---|---|
| **Filtros** | Variable (`altura_agua` / `presion` / `temperatura`), modo (tiempo real / rango), ventana (1 h, 6 h, 24 h, 7 d, 30 d, 90 d), rango desde–hasta, multi-select de limnígrafos, botón exportar CSV | — |
| **Estadísticas descriptivas** (6 tarjetas) | Promedio (con % de variación vs período previo), Mínimo, Máximo, Desvío estándar, Percentil 90, Registros analizados | **Calculado en el navegador** con `computeSummary()` sobre las mediciones crudas |
| **Panel comparativas** | `AreaChart` multi-serie: una serie por limnígrafo seleccionado, la variable elegida sobre el tiempo | `GET /medicion/` (1 página de 2000), agrupado y recortado en el cliente a 140 puntos |
| **Tasa de cambio del nivel** (sólo si la variable es `altura_agua`) | `LineChart` de m/h con `ReferenceLine` en 0, vista consolidada o por limnígrafo individual, + 5 métricas (intervalos calculados, descartados, tasa promedio, máxima subida, máxima bajada) | **Calculado en el navegador** por `useRateAnalysis` (derivada entre mediciones consecutivas + filtro robusto MAD, z ≤ 6) |
| **Calidad operativa de carga** | `PieChart` de dona con la distribución de mediciones por `fuente` (automático / manual / import CSV / import JSON) + conteos y porcentajes | **Calculado en el navegador** contando `medicion.fuente` |

### Pestaña “Tabla comparativa”

| Bloque | Contenido | Origen de los datos |
|---|---|---|
| **Filtros** | Variable, rango desde–hasta (obligatorio), multi-select de limnígrafos, exportar CSV | — |
| **Tabla** | Una fila por limnígrafo + fila `Global`; columnas: Mínimo, Máximo, Mediana, Moda, Desvío estándar, Percentil 90 | **`GET /estadistica/`** — el endpoint del backend, usado tal cual |

### Fuera de la pantalla de estadísticas, pero consumiendo el mismo endpoint

`app/(pages)/componentes/EstadisticasPorAtributo.tsx` alimenta 3 tarjetas del home (“Promedio Agua”, y las equivalentes de presión y temperatura) con `GET /estadistica/` sobre los últimos 7 días, refrescando cada 30 s.

---

## 2. Qué ofrece el backend y qué se está recalculando al vicio

`GET /api/estadistica/` (`EstadisticaViewSet`, sólo lectura, permiso `EstadisticasPermission`).

**Parámetros** (query string, todos obligatorios): `limnigrafos` (IDs separados por coma, **no puede ir vacío**: el serializer declara `allow_empty=False`), `atributo`, `fecha_inicio`, `fecha_fin` (ISO).

**Respuesta:** un array con un objeto por limnígrafo y, si se pidió más de uno, un objeto extra con `id: null` que agrega todos los valores juntos (fila “Global”):

```json
[{ "id": 3, "atributo": "altura_agua", "maximo": 1.42, "minimo": 0.88,
   "mediana": 1.05, "moda": 1.03, "desvio_estandar": 0.11, "percentil_90": 1.31 }]
```

### 2.1 Duplicación confirmada

| Métrica | La devuelve el endpoint | La recalcula el front | Veredicto |
|---|---|---|---|
| Mínimo | ✅ | ✅ `computeSummary` | 🔴 **Duplicado** |
| Máximo | ✅ | ✅ `computeSummary` | 🔴 **Duplicado** |
| Desvío estándar | ✅ | ✅ `computeSummary` | 🔴 **Duplicado y con resultado distinto** (ver §3.1) |
| Percentil 90 | ✅ | ✅ `computePercentile` | 🔴 **Duplicado** (misma fórmula, interpolación lineal) |
| Mediana | ✅ | ❌ | 🟡 Disponible y no aprovechada en la pestaña Gráficos |
| Moda | ✅ | ❌ | 🟡 Ídem |
| **Promedio** | ❌ | ✅ | 🟠 **Falta en el backend** |
| **Cantidad de registros** | ❌ | ✅ | 🟠 **Falta en el backend** |
| Variación % vs período previo | ❌ | ✅ | 🟢 Legítimo en el front… pero mejor en el backend (§6, Fase 0) |
| Tasa de cambio del nivel (m/h) + filtro MAD | ❌ | ✅ `useRateAnalysis` | 🟢 Legítimo hoy |
| Distribución por `fuente` | ❌ | ✅ | 🟢 Legítimo hoy (es un `COUNT ... GROUP BY`, candidato a backend) |
| Serie temporal para los gráficos | ❌ | ✅ | 🟢 Legítimo: el endpoint devuelve agregados, no series |

### 2.2 El costo real de la duplicación

Para pintar las 6 tarjetas descriptivas, la pestaña “Gráficos” **no llama al endpoint de estadísticas**. En su lugar, `fetchAllMedicionesForStats()` pagina `GET /api/proxy/medicion/` de 1000 en 1000 hasta agotar el rango o llegar a `MAX_FETCH_ROWS = 20000`, y descarga **el doble del rango pedido** (el período actual más el período previo, para la comparativa). En modo tiempo real repite todo cada 30 s.

Es decir: para mostrar 6 números, el navegador puede llegar a bajar 20.000 filas de mediciones y recorrerlas 6 veces con `useMemo`, en lugar de recibir un JSON de ~200 bytes.

Peor: **el filtro por limnígrafo se aplica en el cliente**, iterando el array (`selectedLimnigrafoIdSet.has(medicion.limnigrafo)`), aunque `MedicionFilter` en el backend ya expone `limnigrafo` como filtro múltiple (`NumberInFilter` con `lookup_expr='in'`), además de `fecha_desde`, `fecha_hasta`, `fuente` y `search`. Se descargan mediciones de todos los sensores para después tirar la mayoría.

El panel comparativo tiene el mismo problema en versión silenciosa: pide **una sola página de 2000 mediciones** ordenadas por `-fecha_hora`, sin filtrar por limnígrafo ni por atributo en el servidor, y después recorta a los últimos 140 puntos. Con varios sensores reportando seguido, el gráfico muestra una ventana más corta que la pedida **sin avisar**.

---

## 3. Errores detectados (a corregir durante la migración)

### 3.1 El desvío estándar no coincide entre las dos pestañas

- Backend: `statistics.stdev(values)` → desvío **muestral**, divide por `n − 1`.
- Front (`computeSummary` en `estadisticas-domain.ts`): `variance = Σ(x − μ)² / n` → desvío **poblacional**, divide por `n`.

Mismo limnígrafo, misma variable, mismo rango: “Gráficos” y “Tabla comparativa” muestran números distintos. Con muestras chicas la diferencia es visible. Hay que fijar una definición única (recomendado: muestral, la del backend) y dejar un solo lugar que la calcule.

### 3.2 Dos errores de tipos reales: falta `mediana` en `EstadisticaOutputItem`

El backend devuelve `mediana` y el front la consume (`item.mediana` en la tabla y en el CSV), pero el tipo en `shared/servicios/api/django.api.ts` no la declara. `npx tsc --noEmit` confirma:

```
app/(pages)/estadisticas/componentes/TablaComparativaEstadisticas.tsx(135,32):
  error TS2339: Property 'mediana' does not exist on type 'EstadisticaOutputItem'.
app/(pages)/estadisticas/page.tsx(426,10):
  error TS2339: Property 'mediana' does not exist on type 'EstadisticaOutputItem'.
```

(La compilación pasa porque Next no bloquea el build por errores de tipos en esta configuración.)

### 3.3 El home miente sobre lo que muestra

`EstadisticasPorAtributo.tsx` rotula la tarjeta “Promedio Agua” pero muestra el **percentil 90**, con el comentario admitiéndolo:

```ts
// Usamos el percentil_90 como valor representativo si no hay un promedio explícito en la API.
const num = data[0].percentil_90 ?? data[0].maximo;
```

Además toma `data[0]`, que con varios limnígrafos es el primero de la lista, no el agregado global (el global viene al final, con `id: null`). Se resuelve agregando `promedio` al backend (§6, Fase 0) y leyendo la fila `id === null`.

### 3.4 “Sin datos” es indistinguible de “el valor es cero”

`_calcular_estadisticas` devuelve `0.0` para máximo, mínimo, mediana, desvío y percentil cuando no hay mediciones en el rango. El front formatea eso como `0.00 m`, que para altura de agua es un valor perfectamente plausible. Deben ser `null` (la moda ya lo es) y el front mostrar `-`.

### 3.5 Metadatos de variables duplicados y desincronizados

`ATRIBUTO_METADATA` está definido dos veces, con etiquetas distintas para la misma variable:

- `lib/estadisticas-domain.ts` → `altura_agua: "Nivel del agua"`
- `lib/panel-comparativas-domain.ts` → `altura_agua: "Altura del agua"`

Las tarjetas y el gráfico de la misma pantalla nombran distinto la misma cosa.

### 3.6 Validación de filtros triplicada

`handleApplyFilters`, `handleApplyTablaFilters` y `handleExportTablaCsv` repiten las mismas tres comprobaciones (fechas presentes, parseables, `desde < hasta`). Se unifica con un esquema zod.

### 3.7 Incumplimientos de `Rules.md`

Toda la pantalla viola las reglas vigentes del proyecto y no puede migrarse tal cual:

- **§3 (Material Design)**: hex crudos por todas partes — `PANEL_CHART_COLORS` (8 hex), `accent="#0EA5E9"` en cada `EstadisticaCard`, `fill: "#22C55E"` en el gráfico de fuentes, y clases arbitrarias como `text-[#011018] dark:text-[#E2E8F0]`, `bg-[#1B1F25]`, `shadow-[0px_10px_20px_rgba(0,0,0,0.12)]`.
- **§3 (radios)**: `rounded-[24px]`, `rounded-2xl`, `rounded-xl` en lugar de `rounded-shape-*`.
- **§2 (exportaciones)**: `export default` en todos los componentes y hooks.
- **§4 (nomenclatura)**: archivos en PascalCase (`TarjetaTasaCambioNivel.tsx`, `PanelComparativas.tsx`).
- **§1 (estructura)**: 694 líneas de lógica de negocio dentro de `page.tsx`.

### 3.8 El endpoint escala mal

`_calcular_resultados` hace **una consulta por limnígrafo** y trae todos los valores del rango a memoria de Python (`values_list(atributo, flat=True)`) para calcular sobre listas. Con N sensores y rangos largos son N consultas y N listas completas en RAM. Máximo, mínimo, promedio, desvío y conteo se pueden resolver en una sola consulta agregada (`Max`, `Min`, `Avg`, `StdDev`, `Count` con `values('limnigrafo').annotate(...)`); mediana y percentil con `PercentileCont` en PostgreSQL. No bloquea la migración del front, pero condiciona §6.

---

## 4. Estado de lo ya escrito en `website`

Ambos archivos existentes están mal y hay que rehacerlos:

**`app/models/models.estadistica.ts`** — el tipo de respuesta es el tipo de entrada:

```ts
export type EstadisticaResponse = EstadisticaInput[];   // ⛔ incorrecto
```

Debe declararse el output real del endpoint (`id | null`, `atributo`, `maximo`, `minimo`, `mediana`, `moda`, `desvio_estandar`, `percentil_90`, más `promedio` y `registros` cuando se agreguen), documentado con `@property` según `Rules.md` §8.

**`app/services/api/next-server/estadistica.ts`** — pide `ParamsBase` genérico, sin tipar los query params obligatorios (`limnigrafos`, `atributo`, `fecha_inicio`, `fecha_fin`). Como el backend responde 400 si falta cualquiera, conviene un parámetro tipado y requerido en la firma.

---

## 5. Diseño de la vista

El cliente no participó de las reuniones donde se definió este módulo, así que casi todo lo que hay acá es **propuesta del equipo**, no requerimiento relevado. La decisión de diseño es entregar dos lecturas complementarias y no mezclarlas:

| | **Tablas** | **Gráficos** |
|---|---|---|
| Pregunta que responde | “¿Qué valores tuvo?” | “¿Cuándo pasó algo raro?” |
| Naturaleza | Descriptiva y comparativa | Detección de eventos y outliers |
| Eje temporal | Agregado a un número por período | Explícito, es lo que aporta |
| Salida | CSV con varias estadísticas | Vistazo visual |

**Regla derivada:** media, mediana, moda, desvío y percentiles viven **sólo en la sección de tablas**. No se repiten como tarjetas arriba de los gráficos. Los gráficos no resumen: muestran el tiempo, que es exactamente lo que la tabla no puede mostrar.

Los resúmenes operativos (cantidad de dispositivos, reparto de cargas manual/CSV/JSON/automático) **se van al dashboard** — ver `migracion-home.md`.

### 5.1 Sección de tablas

Un solo componente de tabla con **dos modos de comparación**, elegidos con un `SegmentedControl` (`components/ui/segmented-control.tsx`, ya existe). Las columnas de estadísticas son las mismas en ambos modos; lo único que cambia es qué representa cada fila y, en consecuencia, la primera columna:

| Modo | Una fila es… | Primera columna | Caso de uso |
|---|---|---|---|
| **Por dispositivo** | Un limnígrafo, en un rango común | “Limnígrafo” | Comparar sensores entre sí (+ fila `Global`) |
| **Por período** | Un mes o un año, de un solo limnígrafo | “Período” | Ver la evolución interanual o mensual de un sensor |

Que el rótulo de la primera columna cambie junto con el modo es lo que evita la confusión: el usuario siempre sabe qué está comparando porque la tabla se lo nombra. En modo *Por período* el selector de dispositivos pasa a ser de selección única y aparece el granulado (mes / año).

Filtros (`filtros-tabla`): variable, selección de dispositivos (todos / varios / uno), rango de fechas **o** ventana rápida, y en modo período el granulado. Sin paginado ni acciones → `TablaSimple`.

Exportación CSV **generada en el frontend**: la tabla ya tiene los datos en memoria y son decenas de filas, no miles. No necesita endpoint. (Excel y PDF, si se piden, sí van por backend — ver `justificacion-librerias.md` §2.8.)

**Backend necesario para el modo período:** un parámetro `agrupar_por=mes|anio` en `/estadistica/` que devuelva una fila por período. La alternativa —que el front haga N llamadas, una por mes— es N veces el costo y hay que unir resultados a mano.

### 5.2 Sección de gráficos

Filtros arriba (dispositivos + rango/ventana) y debajo **todos los gráficos ya cargados**. Lo habitual sería que el usuario elija el tipo de informe, pero como no hay nada relevado, mostrar todo es la opción honesta: no podemos adivinar cuál le importa. Cuando el cliente valide, esto se convierte en un selector de informe y el resto se oculta.

Series temporales, en este orden de importancia:

1. `tiempo-altura` — la principal
2. `tiempo-bateria` — salud del dispositivo
3. `tiempo-temperatura`
4. `tiempo-presion`

**No son cuatro componentes.** Es un solo `grafico.tiempo-medicion` parametrizado por variable (label, unidad, decimales, umbrales), instanciado cuatro veces. Cuatro archivos serían cuatro copias del mismo eje temporal, el mismo tooltip y el mismo manejo de huecos, que es donde está toda la dificultad (§5.3).

Se conserva además el gráfico de **tasa de cambio del nivel** (m/h), que es el único que muestra velocidad de crecida y no nivel absoluto.

### 5.3 Decisiones abiertas sobre el eje temporal

Cuatro problemas reales, con la recomendación de cada uno. **Están sin resolver en el código legacy** y hay que cerrarlos antes de escribir el componente.

#### a) Cadencias distintas (5 min vs 15 min)

El legacy usa `XAxis dataKey="date"` sin `type`, es decir un **eje categórico**: recharts reparte los puntos con separación horizontal uniforme, sin importar cuánto tiempo pasó entre uno y otro. Un sensor de 15 min y otro de 5 min se dibujan con el mismo espaciado, y una interrupción de dos horas ocupa lo mismo que un intervalo normal. **El gráfico miente sobre el tiempo.**

**Recomendación:** eje temporal numérico real.

```tsx
<XAxis dataKey="timestamp" type="number" scale="time"
       domain={[desde.getTime(), hasta.getTime()]} />
```

Con el dominio fijado al rango pedido, el ancho del gráfico representa el período completo y cada punto cae donde le corresponde. Esto resuelve la cadencia heterogénea sin tocar los datos.

#### b) Superponer varios dispositivos

Dos problemas distintos que conviene no confundir:

**El técnico** (“tendría que superponerlos”) desaparece con el eje numérico: cada serie puede tener su propio array de puntos (`<Line data={puntosDelDispositivo} />`), sin necesidad de unirlos en una grilla común. El legacy agrupa por *string* de `fecha_hora` exacta — y como dos sensores prácticamente nunca comparten el timestamp al segundo, cada objeto del array queda con una sola serie cargada y el resto en `undefined`, lo que fragmenta las líneas. Ese bug se va solo al pasar a eje numérico y series independientes.

**El de legibilidad** es el de fondo y no lo arregla la técnica: dos limnígrafos en cuencas distintas tienen niveles absolutos distintos, y superponerlos da un gráfico donde una línea está siempre arriba y la otra siempre abajo, sin información. Recomendación por cantidad:

| Selección | Presentación |
|---|---|
| 1 dispositivo | Un gráfico grande con detalle (puntos visibles, umbrales de configuración marcados) |
| 2 a 4 | Superpuestos, un color por dispositivo, eje Y compartido |
| más de 4 | **Small multiples**: un gráfico chico por dispositivo en grilla, **mismo eje Y y mismo eje X en todos** |

Los *small multiples* son la solución estándar para comparar muchas series: comparás formas de un pantallazo y ninguna línea tapa a otra. La condición es que compartan escala; si cada mini-gráfico auto-escala su Y, la comparación visual es falsa.

Nunca dos ejes Y con escalas distintas para variables distintas: invita a leer correlaciones que no existen.

*Opcional, si aparece la necesidad:* un modo “normalizado” que grafique la variación respecto del valor inicial del período (Δ desde el inicio) en lugar del valor absoluto. Permite comparar **formas** de sensores con niveles base muy distintos.

#### c) Huecos en la medición (nada entre 12 y 14)

Esto es lo más importante de la sección, porque la respuesta incorrecta **fabrica datos**: si se dibuja una recta de 12 a 14, el gráfico está afirmando que el nivel evolucionó linealmente durante dos horas en las que nadie midió. Un operador puede tomar decisiones con eso.

**Recomendación, tres partes:**

1. **Cortar la línea.** Insertar un punto `null` en el hueco y usar `connectNulls={false}`. La ausencia de datos se ve como ausencia.
2. **Marcar el hueco.** Un `ReferenceArea` con relleno tenue sobre el intervalo sin datos, y en la leyenda “sin datos”. Un tramo vacío puede confundirse con un problema del gráfico; sombreado, se lee como información.
3. **Cuantificarlo en el encabezado.** “Cobertura: 68 % del período (3 interrupciones)”. Es el dato que el usuario necesita para saber cuánto confiar en lo que está viendo.

**¿Cuándo un intervalo es un hueco?** Acá hay un problema de modelo: `ConfiguracionLimnigrafo` guarda `tiempo_advertencia`, `tiempo_peligro`, umbrales de batería, altura, temperatura y presión — pero **no guarda el intervalo de medición esperado del dispositivo**. Sin eso, el sistema no sabe si 15 minutos sin datos es normal o es una falla.

Opciones, de peor a mejor:

- **Estimarlo** de los propios datos: mediana de las diferencias entre mediciones consecutivas, y considerar hueco todo intervalo mayor a ~3× esa mediana. Funciona sin tocar el backend y es robusto (la mediana no se mueve por unos pocos huecos), pero es una inferencia.
- **Usar `tiempo_advertencia`** como umbral: ya está configurado por dispositivo y su significado es justamente “tiempo sin datos que consideramos anormal”. Es coherente con el resto del sistema — el mismo criterio que pinta el chip de estado pinta el hueco del gráfico.
- **Agregar `intervalo_esperado_segundos` a `ConfiguracionLimnigrafo`** (recomendado). Es el arreglo honesto y habilita algo que hoy no se puede calcular: **completitud de datos** = mediciones recibidas / mediciones esperadas. Ese porcentaje es una estadística mejor que varias de las que hay, y sirve igual para el dashboard.

Recomendación: implementar con `tiempo_advertencia` ahora, y proponer `intervalo_esperado_segundos` como mejora de modelo.

4. **El hueco también rompe la tasa de cambio.** `useRateAnalysis` descarta intervalos **más cortos** que 1 minuto pero no tiene límite superior: con un hueco de 2 horas calcula `Δaltura / 2 h` y lo presenta como una tasa normal. Si el río subió 40 cm durante la interrupción, el gráfico muestra 0,2 m/h — un valor tranquilizador y falso, cuando la realidad es que no se sabe qué pasó. **Hay que descartar los intervalos que exceden el umbral de hueco**, igual que se descartan los demasiado cortos, y contarlos aparte.

#### d) Agregación en rangos largos

En 90 días no se pueden dibujar todos los puntos. El legacy promedia por cubetas (`getRateBucketSizeMs`).

**El promedio es la agregación equivocada para este caso**: aplana justamente los picos que la sección de gráficos existe para detectar. Un pico de crecida de 20 minutos promediado en una cubeta de 3 horas desaparece.

**Recomendación:** agregar por cubetas conservando **mínimo y máximo** de cada una, y dibujar una banda (`Area` entre min y max) con la mediana encima. El pico sobrevive a la agregación y la forma general se sigue leyendo. Y decir en el encabezado qué resolución se está mostrando (“1 punto cada 3 h”), para que nadie lea un valor puntual donde hay un rango.

### 5.4 Terminología: “presión”

El sensor del limnígrafo mide la **presión de la columna de agua** sobre él, que es de donde se deriva la altura. Rotularlo “Presión” a secas invita a confundirlo con presión atmosférica, que es otra cosa y en un sistema hidrológico es una lectura plausible.

Término correcto: **presión hidrostática**. Recomendación de rótulo: `Presión hidrostática`, con `info-tooltip` (el componente ya existe en `components/ui/info-tooltip.tsx`): *“Presión ejercida por la columna de agua sobre el sensor. No es presión atmosférica.”*

Pendiente de verificar con el cliente o con la hoja de datos del sensor: la unidad. El código usa `hPa`, pero si el transductor no está ventilado a la atmósfera lo que reporta es presión **absoluta** (hidrostática + atmosférica), y en ese caso el rótulo correcto es “presión absoluta” y la hidrostática es la diferencia. Conviene confirmarlo antes de fijar el rótulo, porque de eso depende también cómo se calcula la altura.

---

## 6. Plan de migración

### Fase 0 — Backend (habilita el resto)

1. Agregar `promedio` y `registros` a `EstadisticaOutputSerializer` y a `_calcular_estadisticas`. Con esto el front deja de necesitar las mediciones crudas para las tarjetas descriptivas.
2. Devolver `null` en lugar de `0.0` cuando no hay datos (§3.4).
3. Reescribir el cálculo con agregación en base de datos (§3.8).
4. Endpoint de exportación (CSV / Excel / PDF) con los mismos filtros, para RF [4.05] sin librerías de cliente (ver `justificacion-librerias.md` §2.8).
5. *Opcional, evaluar:* endpoint de serie temporal agregada (`GET /medicion/serie/?limnigrafos=&atributo=&desde=&hasta=&bucket=`) que devuelva los puntos ya bucketizados. Hoy el bucketing lo hace el navegador (`getRateBucketSizeMs`) sobre datos que descargó de más; moverlo al servidor elimina el recorte silencioso a 140 puntos del panel comparativo.

### Fase 1 — Contrato de datos en `website`

1. Reescribir `models.estadistica.ts` con el output real y JSDoc `@property`.
2. Tipar `getServerEstadistica` con sus query params obligatorios; mantener `tags: ["estadistica"]`.
3. Agregar el servicio de serie temporal si se implementa el punto 5 de Fase 0.

### Fase 2 — Dominio compartido

Portar a `website/app/utils/` y `website/app/models/`, con exportaciones nombradas y **una sola** definición de cada cosa:

- `ATRIBUTO_METADATA` unificado (§3.5), en `models/` (es dato del dominio).
- Ventanas temporales (`VentanaRealtime`, duraciones, etiquetas) y `resolveCurrentRange`.
- Esquema zod de filtros, compartido entre el formulario y el parseo de `searchParams` (§3.6).
- Formateo de fechas con `date-fns` (§ `justificacion-librerias.md` 2.4), no con `toLocaleString`.
- **No portar** `computeSummary` ni `computePercentile`: los reemplaza el endpoint (§3.1).
- Sí portar `useRateAnalysis` (con el filtro MAD y su umbral documentado) y el conteo por `fuente`, hasta que existan endpoints equivalentes.

### Fase 3 — Página y composición

1. `dashboard/estadisticas/page.tsx` como **Server Component**: lee `searchParams`, valida con zod, llama a `getServerEstadistica` y renderiza. Sin `"use client"` en la página.
2. La lógica de vista va a `screens/` (Rules §1); `page.tsx` sólo orquesta.
3. Los filtros son un componente cliente que escribe en la URL (`searchParams` como fuente de verdad). Beneficio directo sobre el legacy: el estado de la consulta queda compartible y navegable, y desaparecen los cinco `useState` de filtros/aplicados de hoy.
4. Cada gráfico es un cliente hoja con `next/dynamic({ ssr: false })`.
5. React Query **sólo** en las tarjetas de tiempo real (polling de 30 s con `placeholderData`), no en toda la pantalla.

### Fase 4 — Componentes

Se crea `website/app/components/estadisticas/` y, para lo que comparte con el dashboard, `website/app/components/graficos/`.

| Archivo | Rol | Viene de |
|---|---|---|
| `estadisticas/filtros-tabla.tsx` | Variable, dispositivos, rango/ventana, modo de comparación (dispositivos / períodos) y granulado | `FiltrosTablaComparativa.tsx` + nuevo modo |
| `estadisticas/tabla-comparativa.tsx` | Tabla de estadísticas en sus dos modos, sobre `TablaSimple` | `TablaComparativaEstadisticas.tsx` |
| `estadisticas/descripcion-mediciones.tsx` | Bloque descriptivo de la selección actual, en la sección de tablas | `EstadisticaCard` + tarjetas de `page.tsx` |
| `estadisticas/filtros-graficos.tsx` | Dispositivos + rango/ventana para la sección de gráficos | `FiltrosGraficosEstadisticas.tsx` |
| `estadisticas/grafico.tiempo-medicion.tsx` | **Serie temporal parametrizada por variable** (altura, batería, temperatura, presión). Una sola implementación del eje temporal, los huecos y el tooltip | `PanelComparativas.tsx` |
| `estadisticas/grafico.tasa-cambio.tsx` | Tasa de cambio del nivel en m/h | `TarjetaTasaCambioNivel.tsx` |
| `graficos/grafico.circulo.tsx` | Dona genérica (recibe segmentos + total) | `TarjetaCalidadOperativaCarga.tsx` |
| `dashboard/grafico.tipo-carga.tsx` | Reparto por `fuente`; **usa** `grafico.circulo` | ídem — ver `migracion-home.md` |
| `ui/chart.tsx` | Wrapper de recharts con tokens semánticos, sin hex | `components/ui/chart.tsx` (shadcn) |
| `formularios/multi-select-limnigrafos.tsx` | Popover + cmdk; hoy no existe en `website` | `MultiSelect` legacy |
| `utils/exportar-estadisticas.ts` | CSV armado en el cliente desde los datos ya cargados | `lib/exportaciones-estadisticas.ts` |

Sobre la nomenclatura `grafico.*`: el prefijo con punto se usa como namespace, igual que `provider.theme.tsx` o `api.usuarios.ts`. Compatible con `Rules.md` §4 (todo minúsculas y guiones).

`descripcion-mediciones` queda **en la sección de tablas**, no arriba de los gráficos (§5). Todo en kebab-case y con exportaciones nombradas (Rules §2 y §4).

### Fase 5 — Cierre

1. Corregir el home: `promedio` real en lugar de percentil 90, leyendo la fila global (§3.3).
2. `MenuExportar` con CSV / Excel / PDF apuntando al endpoint de exportación.
3. Verificar que `npx tsc --noEmit` no reporte errores en el módulo (§3.2).
4. Contrastar los valores de la pantalla nueva contra la legacy sobre el mismo rango; el desvío estándar **debe** diferir del legacy en la pestaña Gráficos: es la corrección de §3.1.

---

## 7. Cobertura de requerimientos

Contra `modulo-4-analisis-datos.md`:

| RF | Requisito | Estado legacy | Acción en la migración |
|---|---|---|---|
| **4.01** | Historial completo con fecha y limnígrafo | 🟢 Cubierto por la pantalla de historial/mediciones, no por estadísticas | Fuera de alcance de este módulo |
| **4.02** | Comparación de varios limnígrafos y períodos, como tabla o lista | 🟡 Parcial: la tabla comparativa compara **varios limnígrafos en un mismo período**. No permite comparar **períodos distintos** entre sí (el único uso de un segundo período es la variación % del promedio) | Mantener la tabla multi-limnígrafo y **agregar** comparación entre dos rangos de fechas. Es el hueco funcional real del módulo. |
| **4.03** | Gráficos interactivos (líneas, comparaciones, tendencias) | 🟢 Cubierto: área multi-serie, línea de tasa de cambio, dona de fuentes, todos con tooltip | Portar tal cual, con datos desde el servidor |
| **4.04** | Filtros por fecha, palabras clave y otros criterios | 🟡 Parcial: variable, rango/ventana y limnígrafos. Sin búsqueda por texto (el backend ya expone `search` en `MedicionFilter`) y sin filtro por `fuente` a pesar de que la pantalla grafica esa distribución | Filtros a la URL; agregar `fuente` (el backend ya lo soporta). La búsqueda por texto aplica al historial, no a los agregados. |
| **4.05** | Exportación en CSV, Excel o PDF | 🟡 Parcial: sólo CSV, y el de la pestaña Gráficos exporta las métricas calculadas en el cliente | Endpoint de exportación en Django con los tres formatos |

**Además de lo requerido**, la pantalla legacy incluye dos bloques que no salen de `modulo-4-analisis-datos.md`: la **tasa de cambio del nivel** (con filtro robusto MAD) y la **calidad operativa de carga** por fuente. Son valiosos —el primero es información hidrológica accionable, el segundo es trazabilidad de la carga de datos, afín al Módulo 2— y se conservan, pero conviene registrarlos como requerimientos para que no queden como funcionalidad sin respaldo documental.
