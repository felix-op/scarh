# Cambios propuestos a los requerimientos

Ajustes a `requerimientos.md` que surgieron al implementar, y que hay que **validar
con el cliente** antes de darlos por cerrados. No son decisiones tomadas: son
propuestas con el motivo escrito, para que la conversación no arranque de cero.

---

## RF [4.05] — Exportación en CSV o Excel

**Propuesta: dejar sólo CSV.**

Estado actual: la exportación a CSV está implementada, se genera en el navegador con
los datos que la tabla ya tiene en memoria (`utils/exportar-estadisticas.ts`). Excel no.

### Por qué Excel no agrega nada

**El CSV que exportamos ya abre en Excel.** `exportarComoCSV` escribe un BOM UTF-8
—sin él Excel rompe los acentos— y usa `;` como separador, que es lo que Excel espera
en configuración regional española. El usuario hace doble clic y se abre en columnas.

Un `.xlsx` de verdad sólo agregaría varias hojas, ancho de columnas con formato de
números, y tipos preservados (una fecha entra como fecha y no como texto). Para una
tabla de ~10 filas por 9 columnas, nada de eso cambia lo que el usuario puede hacer
con el archivo.

El costo, en cambio, es real. En el navegador las opciones son `xlsx` (SheetJS, ~600 KB
minificado, y la versión publicada en npm está desactualizada con CVEs conocidos) o
`exceljs` (~1 MB). Es mucho peso en el bundle para un formato que no habilita ninguna
tarea nueva.

Si el cliente insiste, la implementación correcta es **en el backend con `openpyxl`**:
la dependencia no viaja al navegador, los datos ya están del lado del servidor, y el
mismo endpoint puede servir los dos formatos con los mismos filtros.

### Redacción propuesta

> **RF [4.05]** El sistema debe permitir exportar los datos analizados en formato CSV,
> compatible con planillas de cálculo.

El requerimiento original dice "CSV **o** Excel", así que formalmente ya se cumple con
uno. Este cambio es para que el documento refleje lo que realmente se va a construir y
no quede como funcionalidad faltante.

---

## Funcionalidad implementada sin respaldo documental

Lo inverso del punto anterior: cosas que **existen en el sistema** y no salen de
ningún requerimiento relevado. El cliente no participó de las reuniones donde se
definió esta parte, así que son propuestas del equipo. Conviene registrarlas en el
módulo correspondiente y marcarlas "a validar", para que no queden como
funcionalidad huérfana.

| Funcionalidad | Dónde está | Módulo afín |
|---|---|---|
| **Tablero de inicio** con estado de la flota y totales de la instalación | `/dashboard` | Módulo 1 (Gestión de Dispositivos) |
| **Reparto de mediciones por origen de carga** (automático / manual / CSV / JSON) | Tablero de inicio | Módulo 2 (Recepción y Control de Datos) — es trazabilidad de la ingesta, no análisis hidrológico |
| **Últimas acciones del sistema** como línea de tiempo | Tablero de inicio | Módulo 3 (auditoría) |
| **Velocidad de cambio del nivel** (en cm/h) | Estadísticas → Gráficos | Módulo 4 — información hidrológica accionable: es lo único que muestra velocidad de crecida y no nivel absoluto |
| **Resumen por período** de un mismo sensor (diario / semanal / mensual / anual) | Estadísticas → Resumen | Módulo 4 — cubre parcialmente RF [4.02] |

---

## RF [4.02] — Comparación de limnígrafos y períodos

**Estado: parcialmente cubierto.** Se puede comparar varios limnígrafos en un mismo
rango (pestaña *Comparar dispositivos*) y varios períodos de un mismo limnígrafo
(pestaña *Resumen por período*).

Lo que **no** se puede es comparar dos rangos arbitrarios entre sí —mayo 2025 contra
mayo 2026, lado a lado— que es la lectura más literal de "comparación de períodos".

No está claro si el cliente necesita eso o si el resumen por período ya le resuelve la
pregunta. Conviene mostrarle lo implementado antes de construir la comparación de dos
rangos: es la funcionalidad más costosa que queda del módulo y puede ser que no haga
falta.
