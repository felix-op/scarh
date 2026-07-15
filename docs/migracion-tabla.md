# Plan: Migrar y rediseñar el sistema de tablas (DataTable) a primitivos + variantes

> Estado: planificado, **pendiente de implementación**.

## Contexto

El `DataTable` legacy (`frontend/shared/componentes/tabla/DataTable.tsx` + `DataTableRow.tsx` + `types.ts`) es un componente monolítico y genérico `<T>` que intenta cubrir todos los casos de uso (con/sin paginación, con/sin buscador, 3 tipos de acciones) mediante un objeto `styles: DataTableStyles<T>` de más de 10 className overrides ad-hoc, y define colores propios (`bg-table-header`, `hover:bg-table-hover`) que no existen como tokens en `website/app`. Es difícil de mantener y no sigue el sistema de diseño (Material Design / tokens semánticos) que ya rige el resto de `website/app/components`.

El objetivo es reconstruirlo desde cero en `website/app`, separado en:
- **Primitivos de presentación pura** en `components/ui/table/` (+`scroll-view` y `paginado` sueltos en `ui/`, reusables fuera de tabla).
- **4 variantes de tabla compuestas** en `components/tabla/` (fuera de `ui/`, siguiendo el mismo patrón que `components/sidebar/`): `TablaSimple`, `TablaScroll`, `TablaPaginada`, `TablaEntidad`. Cada variante es un componente propio (composición, no un único componente configurable a fuerza de props condicionales).
- Sin colores propios: la tabla usa exclusivamente tokens semánticos ya definidos en `tema.css`/`tema-claro.css`/`tema-oscuro.css` (como haría MUI con su `theme`), sin agregar ningún `--color-table-*` nuevo.

Decisiones ya confirmadas con el usuario:
- El estado vacío/loading se resuelve **de forma uniforme dentro del primitivo compartido** `table-content` (no opt-in por variante).
- `ActionConfig.typeAction` se simplifica a `"fila" | "menu"` (se elimina `"funcion"`, sin uso real en los 7 usos actuales).
- En `TablaEntidad`, el buscador es puramente presentacional: expone `onSearch(value: string)` y el filtrado es responsabilidad del padre (mismo patrón que `onAdd`/`onFilter` actuales).
- Migrar los 7 usos reales en `frontend/app/(pages)/...` queda **fuera de alcance** (tarea futura).

---

## Estructura de archivos a crear

### 1. Primitivos — `website/app/components/ui/table/`

```
website/app/components/ui/table/
├── table-header.tsx       # <thead> wrapper genérico (Server Component, solo envuelve children en <thead>)
├── table-columns.tsx      # Renderiza los <th> a partir de columnas (tipo local estructural, NO importa ColumnConfig del dominio)
├── table-row.tsx          # <tr> de body: hover/animated/onClick (onClick ya cerrado en closure por la variante)
├── table-placeholder.tsx  # Fila(s) skeleton de loading (columnCount, rowCount)
├── table-content.tsx      # "use client" — <tbody>: resuelve isLoading / isEmpty / children (filas ya armadas)
└── index.ts                # barrel: export * de los 5 archivos
```

Regla de capas importante (evita que `ui/` dependa de `components/tabla/`): los primitivos tipan `columns`/props con tipos **mínimos y locales** (ej. `{ id: string; header: string | ReactNode }`), nunca importando `ColumnConfig<T>` desde `components/tabla/tabla.types.ts`. Como TS usa tipado estructural, las variantes pasan su `ColumnConfig<T>[]` sin cast.

- `table-header.tsx`: `<thead className="bg-background-muted border-b border-border">{children}</thead>`. Solo layout, sin conocer columnas.
- `table-columns.tsx`: recibe `{ columns: TableColumn[]; hasActionsColumn?: boolean; actionsAlign?: "left"|"center" }`, devuelve `<tr>{...<th className="py-4 px-4 text-foreground-title">...}</tr>` (para uso dentro de `TableHeader`).
- `table-row.tsx`: `{ hover?=true; animated?=true; index?=0; onClick?; className?; children }` → clases `hover:bg-hover`, `border border-border`, animación `opacity-0 animate-fade-in-up` con `animationDelay: index*0.05s` si `animated`.
- `table-placeholder.tsx`: `{ columnCount; rowCount?=5 }` → filas `animate-pulse` con `<div className="h-2 w-full bg-default-light rounded-shape-sm" />` (reemplaza el `bg-foreground-title` semánticamente incorrecto del legacy).
- `table-content.tsx` (`"use client"`): `{ isLoading?; isEmpty; noResults?; columnCount; loadingRowCount?=5; emptyStateContent?; children }`. Si `isLoading` → `<TablePlaceholder>`; si `isEmpty` → mensaje genérico (`noResults` alterna entre "No se encontraron resultados para su búsqueda" y "No hay datos cargados en el sistema"), con override opcional vía `emptyStateContent`; si no, `<tbody>{children}</tbody>`.

### 2. Sueltos en `ui/` (no exclusivos de tabla)

```
website/app/components/ui/scroll-view.tsx
website/app/components/ui/paginado.tsx
```

- `scroll-view.tsx`: `{ children; maxHeight?; axis?: "x"|"y"|"both"=both; className? }`, usa `.custom-scroll` (ya existe en `styles/scroll.css`) + `overflow-*` según `axis`.
- `paginado.tsx` (`"use client"`, controlado por el padre): define y exporta `PaginationConfig` (`{ page; maxPage; onPrev; onNext; pageLength; pageLengthOptions; onChangePageLength }`) y `Paginado({ config, idSuffix? })`. Usa `BotonIcono` con `chevronLeft`/`chevronRight` (ya existen en `iconify-icon.tsx`) y `Select` (ya migrado) con `label="Filas"` para elegir cantidad por página — `idSuffix` evita colisión de `name` cuando el paginado se muestra arriba y abajo a la vez.

### 3. Botón faltante

En el archivo **existente** `website/app/components/ui/botones.tsx`, agregar `BotonAgregar` (mismo patrón que `BotonFiltro`, `variant="primary"`, `icon="agregar"` — icono ya existe en `iconify-icon.tsx`).

### 4. Variantes — `website/app/components/tabla/`

```
website/app/components/tabla/
├── tabla.types.ts     # ColumnConfig<T>, TableMenuOption<T>, ActionConfig<T> (sin "funcion"), TablaBaseProps<T>
├── tabla-simple.tsx    # export TablaSimple  — columnas + filas, sin scroll
├── tabla-scroll.tsx    # export TablaScroll  — columnas sticky + maxHeight, scroll solo en body (usa ScrollView)
├── tabla-paginada.tsx  # export TablaPaginada — + Paginado, paginationPosition: "top"|"bottom"|"both"
├── tabla-entidad.tsx   # export TablaEntidad  — + buscador (TextField) + BotonAgregar + BotonFiltro + paginado opcional
└── index.ts             # barrel: export * de los 4 componentes + tabla.types
```

Carpeta `tabla/` (no `data-table/`): sigue el mismo patrón ya existente en `components/sidebar/` (carpeta de dominio en español ↔ componentes `Sidebar*`), consistente con la convención `Boton*`/`Tabla*` en español para componentes, e inglés para tipos (`ColumnConfig`, `ActionConfig`, igual que el legacy).

Props base compartidas (`TablaBaseProps<T>` en `tabla.types.ts`):
```ts
columns: ColumnConfig<T>[]; data: T[]; rowIdKey: keyof T; actionConfig?: ActionConfig<T>;
isLoading?: boolean; noResults?: boolean; loadingRowCount?: number; emptyStateContent?: ReactNode; minWidth?: number | string;
```
- `TablaSimpleProps<T> = TablaBaseProps<T>`.
- `TablaScrollProps<T> = TablaBaseProps<T> & { maxHeight: number | string }`.
- `TablaPaginadaProps<T> = TablaBaseProps<T> & { pagination: PaginationConfig; paginationPosition?: "top"|"bottom"|"both" }` (importa `PaginationConfig` desde `ui/paginado`, no la redefine).
- `TablaEntidadProps<T> = TablaBaseProps<T> & { pagination?: PaginationConfig; paginationPosition?; onSearch?: (value: string) => void; searchPlaceholder?: string; onAdd?: () => void; onFilter?: () => void }`.

`ActionConfig<T>` (sin `"funcion"`):
```ts
export type TableMenuOption<T> = Omit<MenuItemConfig, "action"> & { onClick: (row: T) => void };
export type ActionConfig<T> = {
  typeAction: "fila" | "menu";
  options?: TableMenuOption<T>[];       // typeAction === "menu"
  actionColumns?: (row: T) => ReactNode; // typeAction === "fila"
};
```
`typeAction === "menu"` se resuelve reutilizando `Menu` (ya migrado en `ui/menu.tsx`), cerrando `row` en un closure al armar `items` por fila — no se crea ningún componente de menú nuevo.

Todas las variantes envuelven la tabla en `Card` (`ui/cards.tsx`, ya migrado) en vez de `SeccionCard` legacy.

---

## Tokens de color (sin CSS nuevo)

| Parte | Clase | Token |
|---|---|---|
| Fondo `<thead>` | `bg-background-muted` | `--color-background-muted` |
| Texto de header | `text-foreground-title` | `--color-foreground-title` |
| Bordes | `border-border` | `--color-border` |
| Hover de fila | `hover:bg-hover` | `--color-hover` |
| Texto de celda | `text-foreground` | `--color-foreground` |
| Skeleton loading | `bg-default-light` | `--color-default-light` |
| Empty state | `text-foreground-disabled` | `--color-foreground-disabled` |

No se crea `styles/tabla.css` ni ningún `--color-table-*`. Clases utilitarias inline con Tailwind alcanzan.

---

## Orden de implementación

1. `BotonAgregar` en `botones.tsx` (desbloquea `TablaEntidad` y `paginado.tsx`).
2. Primitivos `ui/table/`: `table-placeholder.tsx` → `table-header.tsx` → `table-columns.tsx` → `table-row.tsx` → `table-content.tsx`.
3. `ui/scroll-view.tsx` (independiente, en paralelo al paso 2).
4. `ui/paginado.tsx`.
5. Barrels: `ui/table/index.ts`, actualizar `ui/index.ts` (agregar `export * from "./table"` y `export * from "./paginado"` y `export * from "./scroll-view"`).
6. `components/tabla/tabla.types.ts`.
7. Variantes en orden de complejidad creciente: `tabla-simple.tsx` → `tabla-scroll.tsx` → `tabla-paginada.tsx` → `tabla-entidad.tsx`.
8. Barrel `components/tabla/index.ts` + actualizar `components/index.ts` (agregar `export * from "./tabla";`).

## Verificación

1. `tsc --noEmit` (o script equivalente de `website/package.json`) tras cada paso, en particular por la genericidad `<T>` en las variantes.
2. Página de prueba temporal en `website/app/(pages)/dashboard/_tabla-preview/page.tsx` (permite `export default`, es ruta) con datos mock, probando las 4 variantes, `typeAction` `"fila"` y `"menu"`, loading, empty y `noResults`, en tema claro y oscuro (toggle ya existente). Eliminarla al terminar — es solo un harness manual, no parte del entregable.
3. `next build` al final para detectar Client/Server Component mal etiquetados.
4. Grep manual de colores hardcodeados (`#`, `rgb(`, `bg-[`, `text-blue`, etc.) en los archivos nuevos para confirmar cero violaciones de Rules.md.

## Fuera de alcance

Migrar los 7 usos reales del `DataTable` legacy (`historial/page.tsx`, `estadisticas/.../TablaComparativaEstadisticas.tsx`, `componentes/VisualizacionLimnigrafos.tsx`, `limnigrafos/page.tsx`, `usuarios/page.tsx`, `usuarios/permisos/[id]/page.tsx`, `mediciones/.../SeccionHistorialMediciones.tsx`) a las nuevas variantes queda para una tarea posterior de migración de pantallas.
