/** Estado de conexión de un limnígrafo, derivado del tiempo sin reportar. */
export type EstadoConexionLimnigrafo = "en_linea" | "demorado" | "sin_conexion";

/** Estado de la última medición respecto de los umbrales configurados. */
export type EstadoMedicionLimnigrafo = "normal" | "fuera_de_rango";

/** Origen de carga de una medición. */
export type FuenteMedicion = "manual" | "automatico" | "import_csv" | "import_json";

/**
 * Última medición recibida de un dispositivo.
 *
 * @property {string} fecha_hora Momento de la medición, en ISO.
 * @property {number} altura_agua Altura registrada.
 * @property {number | null} nivel_de_bateria Tensión de batería, si el sensor la reportó.
 */
export interface DashboardUltimaMedicion {
  fecha_hora: string;
  altura_agua: number;
  nivel_de_bateria: number | null;
}

/**
 * Estado actual de un limnígrafo para el tablero.
 *
 * @property {number} id Identificador del limnígrafo.
 * @property {string} codigo Código visible.
 * @property {EstadoMedicionLimnigrafo} estado_medicion Si el último valor está en rango.
 * @property {EstadoConexionLimnigrafo} estado_conexion Si el dispositivo está reportando.
 * @property {string[]} tipo_de_comunicacion Medios de comunicación del equipo. Gradúa la
 *   gravedad de "sin conexión": si sólo se descarga por USB, estar offline es lo normal.
 * @property {DashboardUltimaMedicion | null} ultima_medicion Última lectura, o `null` si
 *   el dispositivo nunca reportó.
 */
export interface DashboardLimnigrafo {
  id: number;
  codigo: string;
  estado_medicion: EstadoMedicionLimnigrafo;
  estado_conexion: EstadoConexionLimnigrafo;
  tipo_de_comunicacion: string[];
  ultima_medicion: DashboardUltimaMedicion | null;
}

/**
 * Totales de la instalación.
 *
 * @property {number} cant_dispositivos Limnígrafos dados de alta.
 * @property {Record<FuenteMedicion, number>} mediciones_por_carga Conteo histórico por
 *   origen. El backend emite las cuatro claves siempre, incluso en cero.
 * @property {number} total_mediciones_24hs Mediciones recibidas en las últimas 24 horas.
 */
export interface DashboardResumen {
  cant_dispositivos: number;
  mediciones_por_carga: Record<FuenteMedicion, number>;
  total_mediciones_24hs: number;
}

/**
 * Una acción del historial, en la versión resumida que expone el tablero.
 *
 * No trae `descripcion` ni `metadata`: el detalle vive en `/historial/`, que exige el
 * rol `historial-visualizar`, y este endpoint no pide roles.
 *
 * @property {number} id Identificador de la acción.
 * @property {string} fecha_hora Momento en que ocurrió, en ISO.
 * @property {string} tipo_accion Clave del tipo (`created`, `modified`, …).
 * @property {string} tipo_accion_label Etiqueta legible del tipo.
 * @property {string} entidad Clase de entidad afectada.
 * @property {string} estado `success`, `failed` o `review`.
 * @property {object | null} usuario Autor, o `null` si la hizo el sistema.
 */
export interface DashboardAccion {
  id: number;
  fecha_hora: string;
  tipo_accion: string;
  tipo_accion_label: string;
  entidad: string;
  estado: string;
  usuario: { id: number; username: string } | null;
}

/**
 * Respuesta de `GET /estadisticas/dashboard/`.
 *
 * @property {DashboardLimnigrafo[]} limnigrafos Estado de cada dispositivo, por código.
 * @property {DashboardResumen} resumen Totales de la instalación.
 * @property {DashboardAccion[]} ultimas_acciones Actividad reciente, más nueva primero.
 */
export interface DashboardResponse {
  limnigrafos: DashboardLimnigrafo[];
  resumen: DashboardResumen;
  ultimas_acciones: DashboardAccion[];
}
