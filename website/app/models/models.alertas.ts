import type { Paginado } from "./backend";

/** Estado de la notificación del usuario (`UsuarioNotificacion.estado`). */
export type EstadoEnum = "nuevo" | "leido" | "solucionado";

/** Tipos de `Alerta.TIPOS_CHOICES` del backend. */
export type TipoAlerta =
  | "fuera_rango_medicion"
  | "advertencia_limnigrafo"
  | "peligro_limnigrafo"
  | "sin_conexion_limnigrafo";

/**
 * Una alerta tal como la ve un usuario: es la fila de `UsuarioNotificacion`
 * con los datos de la `Alerta` asociada aplanados encima.
 *
 * Conviven dos estados distintos y conviene no mezclarlos:
 * `estado` es de este usuario ("la leí"), `condicion_activa` es global
 * ("la condición que la disparó sigue pasando").
 *
 * @property {number} [id] ID de la notificación. Es el que va en el PATCH.
 * @property {number} [alerta_id] ID de la alerta subyacente, compartida entre usuarios.
 * @property {EstadoEnum} [estado] Lectura de este usuario.
 * @property {TipoAlerta} [tipo] Qué disparó la alerta.
 * @property {string} [fecha_hora] Momento en que se generó, en ISO.
 * @property {string} [descripcion] Texto que arma el backend según el tipo.
 * @property {number | null} [limnigrafo] ID del limnígrafo, o null si se borró.
 * @property {string | null} [limnigrafo_codigo] Código del limnígrafo, o null si se borró.
 * @property {number | null} [medicion_id] Medición que la originó, si aplica.
 * @property {string | null} [fecha_leida] Cuándo la leyó este usuario.
 * @property {string | null} [condicion] Clave de deduplicación de la condición.
 * @property {boolean} [condicion_activa] Si la condición sigue vigente.
 * @property {string | null} [fecha_cierre] Cuándo se resolvió la condición.
 */
export type AlertaResponse = {
  id: number;
  alerta_id: number;
  estado: EstadoEnum;
  tipo: TipoAlerta;
  fecha_hora: string;
  descripcion: string;
  limnigrafo: number | null;
  limnigrafo_codigo: string | null;
  medicion_id: number | null;
  fecha_leida: string | null;
  condicion: string | null;
  condicion_activa: boolean;
  fecha_cierre: string | null;
};

export type AlertaPayload = {
  estado: EstadoEnum;
};

/** Respuesta de `POST /alertas/mark-all-read/`. */
export type MarcarTodasLeidasResponse = {
  updated: number;
};

/**
 * Query params que acepta `GET /alertas/`.
 *
 * @property {EstadoEnum} [estado] Estado exacto de la notificación.
 * @property {boolean} [leida] `false` trae sólo `nuevo`; `true` trae el resto.
 * @property {boolean} [activa] Filtra por `condicion_activa`.
 * @property {string} [limnigrafo] ID de limnígrafo; admite lista separada por comas.
 * @property {TipoAlerta} [tipo] Tipo de alerta.
 * @property {string} [fecha_desde] Límite inferior de `fecha_hora`, en ISO.
 * @property {string} [fecha_hasta] Límite superior de `fecha_hora`, en ISO.
 * @property {string} [ordering] `fecha_hora` o `-fecha_hora`.
 * @property {string} [search] Busca en descripción y código de limnígrafo.
 */
export type FiltrosAlertasQuery = {
  estado?: EstadoEnum;
  leida?: boolean;
  activa?: boolean;
  limnigrafo?: string;
  tipo?: TipoAlerta;
  fecha_desde?: string;
  fecha_hasta?: string;
  ordering?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type PaginatedAlertaResponse = Paginado<AlertaResponse>;
