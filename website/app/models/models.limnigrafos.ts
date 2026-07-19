import type { Paginado } from "./backend";
import type { UbicacionResponse } from "./models.ubicacion";

export type LimnigrafoResponse = {
  id: number;
  codigo: string;
  descripcion: string;
  ultimo_mantenimiento: string | null;
  tipo_comunicacion: string[];
  bateria: number;
  memoria: number | null;
  ultima_conexion: string;
  estado: string;
  ubicacion: UbicacionResponse;
  ubicacion_id: number | null;
};

export type LimnigrafoPayload = Omit<LimnigrafoResponse, "id" | "bateria" | "ultima_conexion" | "estado" | "ubicacion">;

export type PaginatedLimnigrafoResponse = Paginado<LimnigrafoResponse>;

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
};

export type ConfiguracionLimnigrafoPayload = Omit<ConfiguracionLimnigrafoResponse, "id">;
