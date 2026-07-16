import type { ReactNode } from "react";
import type { MenuItemConfig } from "../menu";
import type { IconVariants } from "../iconify-icon";

/**
 * Definición de una columna de la tabla.
 * @property {string} id Identificador único de la columna.
 * @property {string | ReactNode} header Contenido del encabezado.
 * @property {keyof T} [accessorKey] Clave del dato a mostrar si no hay `cell`.
 * @property {(row: T) => ReactNode} [cell] Renderer personalizado de la celda.
 * @property {() => void} [sort] Si se provee, muestra un botón de ordenamiento a la derecha
 *   del header. La lógica de ordenamiento (estado, dirección) vive en el padre.
 */
export interface TableColumn<T> {
  id: string;
  header: string | ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  sort?: () => void;
}

/**
 * Opción de acción por fila. Extiende `MenuItemConfig` sin cambios de nombre:
 * `action` es el callback de clic del ítem en el dropdown.
 * @property {(row: T) => ReactNode} [render] Renderer alternativo utilizado cuando
 *   `ActionConfig.menu` es `false`. Permite mostrar botones de ícono directos, links, etc.
 */
export interface TableMenuOption<T> extends MenuItemConfig {
  render?: (row: T) => ReactNode;
}

/**
 * Configuración de la columna de acciones de la tabla.
 * @property {TableMenuOption<T>[]} options Lista de acciones disponibles por fila.
 * @property {boolean} [menu] Si `true` (default), muestra un botón de 3 puntos con dropdown.
 *   Si `false`, renderiza las acciones directamente: usa `option.render(row)` si está definido,
 *   o bien un `BotonIcono` con `option.icon` como fallback.
 */
export interface ActionConfig<T> {
  options: TableMenuOption<T>[];
  menu?: boolean;
}

/**
 * Configuración de la columna de selección (checkbox) de la tabla.
 * El estado de filas seleccionadas se mantiene internamente en `TablaConAcciones`.
 * @property {(selectedRows: T[]) => void} onSelectionChange Callback invocado cada vez
 *   que cambia la selección. Recibe el array completo de filas actualmente seleccionadas.
 */
export interface CheckboxConfig<T> {
  onSelectionChange: (selectedRows: T[]) => void;
}

/**
 * Props base compartidas por todas las variantes de tabla.
 * @property {TableColumn<T>[]} columns Definición de columnas.
 * @property {T[]} data Datos a mostrar.
 * @property {keyof T} rowIdKey Clave única por fila, usada como `key` de React.
 * @property {boolean} [isLoading] Muestra skeleton de carga cuando es `true`.
 * @property {number} [loadingRowCount] Cantidad de filas skeleton. Default: 5.
 * @property {ReactNode} [emptyStateContent] Contenido a mostrar cuando `data` está vacío.
 *   Se renderiza debajo de la tabla y antes del paginado.
 */
export interface TablaBaseProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowIdKey: keyof T;
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyStateContent?: ReactNode;
}
