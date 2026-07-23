import type { Paginado } from "./backend";
import type { UbicacionResponse } from "./models.ubicacion";

export type UltimaMedicionResumen = {
  id: number;
  fecha_hora: string;
  altura_agua: number | null;
  temperatura: number | null;
  presion: number | null;
};

export type LimnigrafoResponse = {
  id: number;
  codigo: string;
  descripcion: string;
  ultimo_mantenimiento: string | null;
  tipo_comunicacion: string[];
  bateria: number;
  memoria: number | null;
  radio_cobertura_metros: number | null;
  ultima_conexion: string;
  estado: string;
  estado_conexion: string;
  estado_medicion: string;
  ubicacion: UbicacionResponse;
  ubicacion_id: number | null;
  ultima_medicion: UltimaMedicionResumen | null;
  configuracion: ConfiguracionLimnigrafoResponse | null;
};

/**
 * Payload para POST /limnigrafos/
 * @property {string} codigo Identificador del limnígrafo.
 * @property {string[]} tipo_comunicacion Tipos de comunicación.
 * @property {number | null} [memoria] Memoria en bytes.
 * @property {number | null} [radio_cobertura_metros] Radio de cobertura estimada.
 * @property {number | null} [ubicacion_id] ID de la ubicación asociada.
 */
export type LimnigrafoPostPayload = {
  codigo: string;
  tipo_comunicacion: string[];
  memoria?: number | null;
  radio_cobertura_metros?: number | null;
  ubicacion_id?: number | null;
};

/**
 * Payload para PUT /limnigrafos/{id}/
 * @property {string} codigo Identificador del limnígrafo.
 * @property {string} descripcion Descripción del limnígrafo.
 * @property {string | null} ultimo_mantenimiento Fecha de último mantenimiento (ISO 8601).
 * @property {string[]} tipo_comunicacion Tipos de comunicación.
 * @property {number | null} memoria Memoria en bytes.
 * @property {number | null} radio_cobertura_metros Radio de cobertura estimada.
 * @property {number | null} ubicacion_id ID de la ubicación (se reenvía tal como viene).
 */
export type LimnigrafosPutPayload = {
  codigo: string;
  descripcion: string;
  ultimo_mantenimiento: string | null;
  tipo_comunicacion: string[];
  memoria: number | null;
  radio_cobertura_metros: number | null;
  ubicacion_id: number | null;
};

export type PaginatedLimnigrafoResponse = Paginado<LimnigrafoResponse>;

/**
 * Respuesta de POST /limnigrafos/{id}/generate_key/.
 * @property {string} secret_key Clave en texto plano, sólo visible en esta respuesta (no se puede recuperar después).
 * @property {string} warning Advertencia del backend sobre que la clave no se puede volver a mostrar.
 */
export type LimnigrafoGenerateKeyResponse = {
  message: string;
  limnigrafo_id: number;
  key_name: string;
  key_prefix: string;
  secret_key: string;
  warning: string;
};

export type ConfiguracionLimnigrafoResponse = {
  id: number;
  tiempo_advertencia: number | null;
  tiempo_peligro: number | null;
  bateria_max: number | null;
  bateria_min: number | null;
  altura_minima_agua: number | null;
  altura_maxima_agua: number | null;
  temperatura_minima: number | null;
  temperatura_maxima: number | null;
  presion_minima: number | null;
  presion_maxima: number | null;
};

export type ConfiguracionLimnigrafoPayload = Omit<ConfiguracionLimnigrafoResponse, "id">;

/**
 * Payload combinado para editar un limnígrafo y su configuración en una sola solicitud.
 * El route handler PUT /api/limnigrafos/[id]/editar lo descompone internamente.
 * @property {string} codigo Identificador del limnígrafo.
 * @property {string} descripcion Descripción del limnígrafo.
 * @property {string | null} ultimo_mantenimiento Fecha de último mantenimiento (ISO 8601).
 * @property {string[]} tipo_comunicacion Lista de tipos de comunicación.
 * @property {number | null} memoria Memoria del dispositivo en bytes.
 * @property {number | null} radio_cobertura_metros Radio de cobertura estimada.
 * @property {number | null} ubicacion_id ID de la ubicación (se reenvía tal como viene).
 * @property {number | null} tiempo_advertencia Segundos sin datos antes de estado Advertencia.
 * @property {number | null} tiempo_peligro Segundos sin datos antes de estado Peligro.
 * @property {number | null} bateria_max Voltaje máximo de batería.
 * @property {number | null} bateria_min Voltaje mínimo de batería.
 * @property {number | null} altura_minima_agua Altura mínima del agua.
 * @property {number | null} altura_maxima_agua Altura máxima del agua.
 * @property {number | null} temperatura_minima Temperatura mínima.
 * @property {number | null} temperatura_maxima Temperatura máxima.
 * @property {number | null} presion_minima Presión mínima.
 * @property {number | null} presion_maxima Presión máxima.
 */
export type LimnigrafoEditarPayload = {
  codigo: string;
  descripcion: string;
  ultimo_mantenimiento: string | null;
  tipo_comunicacion: string[];
  memoria: number | null;
  radio_cobertura_metros: number | null;
  ubicacion_id: number | null;
  tiempo_advertencia: number | null;
  tiempo_peligro: number | null;
  bateria_max: number | null;
  bateria_min: number | null;
  altura_minima_agua: number | null;
  altura_maxima_agua: number | null;
  temperatura_minima: number | null;
  temperatura_maxima: number | null;
  presion_minima: number | null;
  presion_maxima: number | null;
};

