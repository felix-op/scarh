# Migración del Dashboard (Home)

Documento de diseño del dashboard de `website/app/(pages)/dashboard/page.tsx`.

Surge de una decisión de alcance tomada al analizar estadísticas: **el dashboard responde “¿cómo está el sistema ahora?” y la pantalla de estadísticas responde “¿qué pasó con el agua en tal período?”**. Todo lo que hoy vive en estadísticas y en realidad es un resumen operativo del sistema se muda acá.

---

## 1. Estado actual

**`website`**: `dashboard/page.tsx` **no es un dashboard**. Son ~330 líneas de *playground* de componentes: previews de `TablaSimple`, `TablaConAcciones`, `TablaPaginada`, `TablaConAccionesPaginada` y una fila de botones, con un array `PERSONAS` de datos falsos. Es útil como referencia visual, pero no puede quedar en la ruta raíz del dashboard.

> **Acción:** mover ese contenido a `dashboard/admin/documentacion/tablas/page.tsx`, junto a las páginas de documentación que ya existen (`documentacion/botones`, `documentacion/endpoints`), y liberar `dashboard/page.tsx`.

**`frontend` (legacy)**: el home tiene dos bloques.

- `VisualizacionEstadisticas`: 4 tarjetas — “Limnígrafos Activos” (que en realidad cuenta el **total** registrado, no los activos) y tres tarjetas de agua/presión/temperatura que **muestran el percentil 90 rotulado como “Promedio”** (ver `migracion-estadisticas.md` §3.3). Refresca cada 30 s recreando el rango de 7 días.
- `VisualizacionLimnigrafos`: tabla de los primeros 10 limnígrafos con chip de estado, último registro y batería.

Es decir: de los 4 números del home actual, uno está mal contado y tres están mal rotulados. No se porta tal cual.

---

## 2. Qué se muda desde estadísticas

| Bloque | Hoy | Motivo de la mudanza |
|---|---|---|
| **Cantidad de dispositivos** | Tarjeta en el home legacy | Es inventario del sistema, no análisis hidrológico |
| **Distribución de cargas** (automático / manual / import CSV / import JSON) | Dona “Calidad operativa de carga” en estadísticas | No dice nada sobre el agua: es trazabilidad de la ingesta. Conceptualmente pertenece al Módulo 2 |
| **Estados de los dispositivos** | Tabla en el home legacy + chips | Estado operativo en vivo |

Y se agrega algo que hoy no está en ninguna pantalla de resumen: **las últimas acciones del historial de auditoría**.

---

## 3. Composición propuesta

De arriba hacia abajo, priorizando lo que un operador necesita ver en los primeros 3 segundos.

### 3.1 Fila de KPIs

Cuatro tarjetas (`components/ui/cards.tsx`, ya existe):

| KPI | Cálculo | Fuente |
|---|---|---|
| Dispositivos totales | `count` del listado | `GET /limnigrafo/` (`count` del paginado) |
| Dispositivos en línea | Cuentan por `estado_conexion` | ídem |
| Dispositivos con alerta | Cuentan por `estado` ∈ `peligro` / `fuera_de_rango` | ídem |
| Alertas nuevas | Alertas con `estado: "nuevo"` | `GET /alertas/?estado=nuevo` |

Regla: si la tarjeta dice “activos”, tiene que contar activos. El error del home legacy fue rotular como activo un total, y es el tipo de cosa que hace que el usuario deje de confiar en el tablero.

### 3.2 Estado de los dispositivos

Tabla con `TablaSimple` (`components/ui/tabla/tabla-simple.tsx`): estado (chip), código, último registro, batería. Sin paginado ni acciones — el listado completo ya vive en la pantalla de limnígrafos, esto es un vistazo. Fila clickeable hacia el detalle del dispositivo.

Ordenar por criticidad, no por ID: primero `fuera_de_rango`, después `peligro`, `advertencia`, `normal`. Lo que está roto va arriba.

### 3.3 Distribución de cargas

Dona con el reparto de mediciones por `fuente` en la ventana elegida (por defecto 7 días), con conteo y porcentaje por segmento. Reutiliza el componente genérico `grafico.circulo` (ver §5).

Lectura para el usuario: si el porcentaje de `manual` + `import_csv` sube, los sensores estuvieron caídos y alguien tapó el hueco a mano.

### 3.4 Últimas acciones (auditoría)

Lista de las últimas ~8 entradas de `GET /historial/`: fecha, usuario, tipo de acción y descripción. Enlace a la pantalla de historial completa.

El modelo ya está tipado en `models.historial.ts` (`date`, `type`, `username`, `description`, `status`) y el servicio existe (`getServerHistorial`). No hace falta backend nuevo.

### 3.5 Alertas recientes *(a confirmar)*

`AlertaResponse` ya trae `tipo`, `fecha_hora`, `descripcion`, `limnigrafo_codigo` y `estado`. Un bloque de alertas nuevas sería el complemento natural del KPI de §3.1, pero **puede ser redundante** con la pantalla de alertas y con el estado de los dispositivos. Decisión pendiente: incluirlo sólo si no duplica §3.2.

---

## 4. Datos: qué falta en el backend

Todos los bloques se pueden armar hoy con los endpoints existentes, pero de forma ineficiente:

1. **Conteo por estado (§3.1)**: hoy habría que pedir el listado completo de limnígrafos y contar en el cliente, que es lo que hace el legacy (`limit=1000`). Conviene un endpoint de resumen o un `?estado=` con `count` por valor.
2. **Distribución por `fuente` (§3.3)**: mismo problema y peor — el legacy descarga las mediciones y las cuenta con un `forEach`. Es un `COUNT(*) ... GROUP BY fuente` con filtro de fechas. **Debe resolverse en Django.**
3. **Propuesta:** un único `GET /api/dashboard/resumen/?desde=&hasta=` que devuelva los conteos de dispositivos por estado, el reparto por fuente y el total de alertas nuevas. El dashboard pasa a ser un Server Component con **una** llamada, sin cálculo en el cliente y con `tags: ["dashboard"]` para revalidar.

Mientras ese endpoint no exista, se puede armar el dashboard con las llamadas actuales, pero registrándolo como deuda: es el mismo antipatrón de “bajar todo y contar en el navegador” que estamos sacando de estadísticas.

---

## 5. Componentes

Ubicación: `website/app/components/dashboard/` (nueva), reutilizando `components/ui/`.

| Componente | Archivo | Nota |
|---|---|---|
| Fila de KPIs | `dashboard/tarjetas-resumen.tsx` | Sobre `ui/cards.tsx` |
| Estado de dispositivos | `dashboard/tabla-estado-dispositivos.tsx` | `TablaSimple` + chip de estado |
| Distribución de cargas | `dashboard/grafico.tipo-carga.tsx` | **Usa** `grafico.circulo`, no lo reimplementa |
| Últimas acciones | `dashboard/ultimas-acciones.tsx` | Lista, no tabla |

**Sobre `grafico.circulo`:** conviene que el genérico viva en `components/graficos/grafico.circulo.tsx` (recibe segmentos `{ label, valor, color }` y opcionalmente un total al centro) y que `grafico.tipo-carga` sea sólo el uso concreto que le pasa los datos de `fuente`. Así el mismo círculo sirve para “dispositivos por estado”, “alertas por tipo” o cualquier reparto futuro, sin duplicar la lógica de la dona. La carpeta `graficos/` es compartida entre dashboard y estadísticas.

Todo en kebab-case y con exportaciones nombradas (`Rules.md` §2 y §4). El dashboard es Server Component; sólo los gráficos son clientes hoja con `next/dynamic({ ssr: false })`.

---

## 6. Orden de trabajo

1. Mover el playground de tablas a `dashboard/admin/documentacion/tablas/`.
2. Crear `components/graficos/grafico.circulo.tsx` (genérico, con tokens de Material Design, sin hex).
3. Armar el dashboard con los endpoints actuales: KPIs, tabla de estado, últimas acciones.
4. Portar la dona de cargas desde estadísticas usando `grafico.circulo`.
5. Backend: `GET /api/dashboard/resumen/` y reemplazar los conteos de cliente.
6. Corregir el rótulo del conteo de dispositivos (activos ≠ total).

---

## 7. Nota de trazabilidad

Ni el dashboard ni la dona de cargas están pedidos en `requerimientos.md`. El cliente no participó de las reuniones donde se definió esta parte, así que estas decisiones son **propuestas del equipo**, no requerimientos relevados:

- El resumen operativo es afín al Módulo 1 (Gestión de Dispositivos) y al Módulo 2 (Recepción y Control de Datos).
- El bloque de auditoría es afín al Módulo 3 (RF de auditoría).

Conviene registrarlas como requerimientos propuestos en los módulos correspondientes para que no queden como funcionalidad sin respaldo documental, y marcarlas como “a validar con el cliente”.
