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
  ubicacion: UbicacionResponse;
  ubicacion_id: number | null;
  ultima_medicion: UltimaMedicionResumen | null;
  configuracion: ConfiguracionLimnigrafoResponse | null;
};

export type LimnigrafoPayload = Omit<
  LimnigrafoResponse,
  "id" | "bateria" | "ultima_conexion" | "estado" | "ubicacion" | "ultima_medicion" | "configuracion"
>;

export type PaginatedLimnigrafoResponse = Paginado<LimnigrafoResponse>;

export type ConfiguracionLimnigrafoResponse = {
  id: number;
  tiempo_advertencia: number | null;
  tiempo_peligro: number | null;
  bateria_min: number | null;
  altura_minima_agua: number | null;
  altura_maxima_agua: number | null;
  temperatura_minima: number | null;
  temperatura_maxima: number | null;
  presion_minima: number | null;
  presion_maxima: number | null;
};

export type ConfiguracionLimnigrafoPayload = Omit<ConfiguracionLimnigrafoResponse, "id">;
