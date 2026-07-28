# Justificación de Librerías (Módulo de Estadísticas)

Documento de análisis de las dependencias que hoy sostienen la pantalla de estadísticas en el frontend legacy (`frontend/`, Next.js 14 + React 18) y decisión sobre cuáles se conservan, reemplazan o descartan en el frontend nuevo (`website/`, Next.js 16 + React 19).

Criterio de aceptación de una librería:

1. Resuelve un problema que no es razonable resolver con la plataforma (browser + React + Next).
2. Su costo en bundle de cliente se justifica frente a la alternativa de resolverlo en el servidor (Django o Server Component).
3. Es compatible con React 19 / Next 16 y está mantenida.
4. No duplica otra dependencia ya presente.

---

## 1. Inventario: qué usa hoy la pantalla de estadísticas

| Librería | Versión en `frontend` | ¿En `website`? | Uso concreto en estadísticas |
|---|---|---|---|
| `recharts` | 2.15.4 | ❌ **falta** | Los 3 gráficos: `AreaChart` (comparativa multi-limnígrafo), `LineChart` + `ReferenceLine` (tasa de cambio del nivel), `PieChart` + `Cell`/`Label` (distribución por fuente). Envuelto en `shared/componentes/components/ui/chart.tsx` (wrapper de shadcn, 357 líneas). |
| `@tanstack/react-query` | 5.90.11 | ✅ 5.101.2 | `useGetEstadistica` y `useGetMediciones` de la tabla comparativa y del panel comparativo: cache por key, `placeholderData` para evitar parpadeo y `refetchInterval: 30000` para el modo tiempo real. |
| `axios` | 1.13.2 | ✅ 1.18.1 | Cliente HTTP debajo de los hooks `useGet`. En estadísticas el rol es puramente de lectura. |
| `@radix-ui/*` (`react-dialog`, `react-dropdown-menu`, `react-slot`) + `radix-ui` (paquete monolítico) | 1.1.15 / 2.1.16 / 1.0.2 / 1.4.3 | ✅ (solo los individuales) | Primitivos de `Tabs` (Gráficos / Tabla comparativa), `MultiSelect` de limnígrafos y tooltips de los filtros. |
| `cmdk` | 1.1.1 | ✅ 1.1.1 | Buscador dentro del `MultiSelect` de limnígrafos. |
| `clsx` + `tailwind-merge` + `class-variance-authority` | — | ✅ | Composición de clases del wrapper de charts y de `EstadisticaCard`. |
| `lucide-react` | 0.475.0 | ✅ 0.475.0 | Iconos de los primitivos shadcn. En `website` el estándar propio es `@iconify/*` vía `iconify-icon.tsx`. |
| `next-themes` | 0.4.6 | ✅ 0.4.6 | Modo oscuro; el wrapper de charts inyecta CSS por tema (`THEMES = { light: "", dark: ".dark" }`). |
| `leaflet` y satélites | varias | ✅ | **No participa** de estadísticas. Fuera de alcance de este documento (ver `migracion-mapa.md`). |
| — (código propio) | — | — | Cálculo estadístico (`computeSummary`, `computePercentile`), agregación temporal (`getRateBucketSizeMs`), formateo de fechas (`formatDateTick`, `formatDateTime`) y exportación CSV (`downloadCsvRows`). Sin librería. |

Dependencias de `website` que hoy **no** usa estadísticas pero son candidatas naturales al migrar: `date-fns` (4.4.0), `zod` (3.25.17), `react-day-picker` (10.0.1), `@hookform/resolvers` (5.4.0).

---

## 2. Decisiones

### 2.1 `recharts` — **se conserva, actualizando a 3.x**

Es la única dependencia realmente “nueva” que hay que agregar a `website`.

**Justificación.** Los tres gráficos requeridos por el RF [4.03] (líneas, comparación multi-serie, distribución) son gráficos cartesianos estándar sobre series temporales de hasta ~140 puntos. Recharts es declarativo (`<AreaChart><XAxis/><Area/></AreaChart>`), lo que mantiene la lógica de presentación en JSX y deja el cálculo afuera, y ya existe un wrapper propio con tokens de tema y tooltips resueltos: migrarlo es portar un archivo, no rediseñar la capa de gráficos.

**Alternativas descartadas:**

| Alternativa | Por qué no |
|---|---|
| `chart.js` / `react-chartjs-2` | API imperativa sobre canvas: los tooltips y leyendas custom que ya existen habría que rehacerlos, y el resultado no es inspeccionable ni estilable con Tailwind. |
| `visx` / `d3` directo | Da control total y bundle mínimo, pero exige escribir ejes, escalas y tooltips a mano. Costo de desarrollo desproporcionado para 3 gráficos convencionales. |
| `echarts` | Más potente (y más pesado, >300 kB). Necesario recién si aparecen requisitos de zoom sobre millones de puntos o mapas de calor. Hoy no están en `modulo-4-analisis-datos.md`. |
| `@nivo/*` | Equivalente funcional a recharts pero con más superficie de API y peor integración con el ecosistema shadcn ya adoptado. |

**Condiciones de uso obligatorias:**

- Instalar **`recharts@3.10.1`** (última estable), no 2.15.4: la 3.x declara `react: ^19` en `peerDependencies` — la 2.x no, y forzaría un `override` como el que ya hay que mantener para `react-leaflet-markercluster` en `frontend`.
- Recharts sólo corre en cliente. Cada tarjeta de gráfico debe ser un componente `"use client"` **hoja**, cargado con `next/dynamic` (`ssr: false`) desde un Server Component que ya traiga los datos. El objetivo de la migración (SSR mayoritario, TTI rápido) se rompe si la página entera se marca como cliente para poder dibujar un gráfico, que es exactamente lo que pasa hoy: `frontend/app/(pages)/estadisticas/page.tsx` es `"use client"` completo, 694 líneas.
- El wrapper se porta a `website/app/components/ui/chart.tsx` (kebab-case, `export function ChartContainer`, sin `export default`) y debe reemplazar los hex hardcodeados por tokens semánticos, según `Rules.md` §3. Hoy `PANEL_CHART_COLORS` es una lista de 8 hex crudos y cada `EstadisticaCard` recibe un `accent="#0EA5E9"`.

### 2.2 `@tanstack/react-query` — **se conserva, con alcance recortado**

**Justificación.** Está explícitamente habilitada por `migracion-next-16.md` §2 para comportamiento reactivo de cliente. En estadísticas hay un caso que la justifica sin discusión: el **modo tiempo real**, que refresca cada 30 s manteniendo el valor previo visible (`placeholderData: (previous) => previous`). Implementar eso con `fetch` + `useEffect` es lo que hace hoy `useEstadisticasMediciones.ts` — 178 líneas con `refreshTick`, banderas `cancelled`, tres `useState` de estado de carga y su propio manejo de error. Es reescribir react-query peor.

**Recorte:** la carga inicial y todo lo que no se auto-refresca (tabla comparativa, tarjetas de una consulta por rango de fechas) va por `RequestSSR` (ver `fetch.md`) desde Server Components, con `tags: ["estadistica"]` para revalidación. React Query queda sólo para las tarjetas en polling.

### 2.3 `axios` — **se conserva, pero no en estadísticas**

Estadísticas es 100 % lectura: no hay POST/PUT/DELETE en `/estadistica/` (el ViewSet declara `http_method_names = ['get', 'head', 'options']`). Por lo tanto no necesita axios: `fetch` nativo vía `RequestSSR` alcanza y evita sumar ~15 kB al bundle de la ruta. Axios sigue justificado en el proyecto para mutaciones (importación de mediciones, formularios), no acá.

### 2.4 `date-fns` — **se adopta para reemplazar el formateo propio**

Ya es dependencia de `website` (la trae `react-day-picker`), así que su costo marginal es cero, y es tree-shakeable por función.

Reemplaza el formateo hecho a mano en `estadisticas-domain.ts`:

- `formatDateTime` / `formatDateTick` → `format(date, "dd/MM/yyyy HH:mm", { locale: es })`. El código actual usa `toLocaleString("es-AR", ...)`, que **produce salida distinta en servidor y en cliente** según el ICU y la zona horaria del proceso: es fuente directa de errores de hidratación cuando estas tarjetas pasen a renderizarse en el servidor.
- `toIsoString` / `toDatetimeLocalInputValue` → `parseISO` / `formatISO`.

Lo que **no** debe hacer date-fns: aritmética de ventanas temporales (`getWindowDurationMs`, `WINDOW_DURATION_MS`). Son constantes en milisegundos, correctas y triviales; envolverlas en `subHours`/`subDays` no aporta nada.

### 2.5 `zod` — **se adopta para los filtros**

Ya es dependencia. Los filtros de estadísticas son el único formulario del módulo y hoy se validan a mano y de forma duplicada: `handleApplyFilters`, `handleApplyTablaFilters` y `handleExportTablaCsv` repiten las mismas tres comprobaciones (fechas presentes, fechas parseables, `desde < hasta`) en tres lugares de `page.tsx`. Un esquema zod único, compartido con el parseo de `searchParams` (`?limnigrafo=`, hoy validado con `/^\d+$/.test(...)`), elimina la triplicación y da tipos derivados en lugar de tipos escritos a mano.

Con `@hookform/resolvers` + `react-hook-form` (ambos ya presentes) queda además el manejo de errores de campo resuelto.

### 2.6 Radix / `cmdk` / shadcn — **se conservan; se elimina el paquete `radix-ui` monolítico**

`Tabs`, `Select` y el `MultiSelect` con búsqueda son necesarios y `website` ya tiene los primitivos individuales (`@radix-ui/react-select`, `react-popover`, etc.) más envoltorios propios (`ui/tabs.tsx`, `ui/select.tsx`). Falta únicamente portar el `MultiSelect` de limnígrafos (Popover + cmdk).

`frontend` tiene además el paquete agregador `radix-ui@1.4.3` **junto con** los individuales: dos copias de los mismos primitivos en el árbol de dependencias. No se replica en `website`.

### 2.7 Iconos: `lucide-react` vs `@iconify` — **unificar en `iconify-icon`**

`Rules.md` y el componente `components/ui/iconify-icon.tsx` fijan `@iconify` como estándar del proyecto. `lucide-react` permanece sólo porque los primitivos shadcn lo importan directamente (chevrons, check). No se deben usar iconos de lucide en código propio de estadísticas.

### 2.8 Exportación (RF [4.05]) — **sin librerías de cliente; se resuelve en Django**

El requisito pide CSV, Excel y PDF. Hoy sólo hay CSV, generado a mano en `lib/exportaciones-estadisticas.ts` (armado de filas + `Blob` + `URL.createObjectURL`).

- **CSV**: se conserva el generador propio. Son ~40 líneas, no justifica `papaparse`.
- **Excel y PDF**: **no** agregar `xlsx`/`exceljs`/`jspdf`/`pdfmake` al cliente. Son entre 300 kB y 1 MB de bundle que se descargarían en cada visita a la pantalla para una acción ocasional, y el navegador ya no tiene el dataset completo cuando las estadísticas se calculan en el servidor (que es la dirección de esta migración, ver `migracion-estadisticas.md`). Corresponde un endpoint de exportación en Django (`openpyxl` / `reportlab` o WeasyPrint) que devuelva el archivo con los mismos filtros de la consulta. Bundle de cliente añadido: cero.
- `MenuExportar` (`website/app/components/menu-exportar.tsx`) ya existe y expone CSV/JSON; se extiende con Excel/PDF apuntando a ese endpoint.

### 2.9 Librería de estadística en el cliente — **rechazada**

Podría tentarnos `simple-statistics` o `d3-array` para media, desvío y percentiles. Se rechaza: **esos valores los debe devolver el backend**, que ya calcula mediana, moda, desvío, percentil 90, máximo y mínimo en `EstadisticaViewSet`. Sumar una librería de estadística al cliente institucionalizaría la duplicación de lógica que hoy hace que la misma variable, mismo rango, muestre un desvío distinto en la pestaña “Gráficos” que en “Tabla comparativa”. El detalle de esa discrepancia y el plan para eliminarla están en `migracion-estadisticas.md`.

---

## 3. Resumen de acciones sobre `website/package.json`

| Acción | Paquete | Motivo |
|---|---|---|
| ➕ Agregar | `recharts@3.10.1` | Única dependencia nueva. Soporte declarado de React 19. |
| ✅ Usar lo existente | `@tanstack/react-query` | Sólo para el polling de tiempo real. |
| ✅ Usar lo existente | `date-fns`, `zod`, `react-hook-form`, `@hookform/resolvers` | Formateo de fechas y validación de filtros. |
| ✅ Usar lo existente | `@radix-ui/*`, `cmdk`, `clsx`, `tailwind-merge`, `cva` | Tabs, MultiSelect, composición de clases. |
| ⛔ No migrar | `radix-ui` (monolítico) | Duplica los primitivos individuales. |
| ⛔ No agregar | `xlsx`, `exceljs`, `jspdf`, `pdfmake` | Excel/PDF se generan en Django. |
| ⛔ No agregar | `simple-statistics`, `d3-array`, `papaparse` | El cálculo es del backend; el CSV ya está resuelto. |
| ➖ No usar en código propio | `axios`, `lucide-react` | Lectura por `RequestSSR`; iconos por `iconify-icon`. |
