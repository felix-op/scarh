import type { Paginado } from "./backend";

export type EstadoEnum = "nuevo" | "leido" | "solucionado";

export type AlertaResponse = {
  id: number;
  alerta_id: number;
  estado: EstadoEnum;
  tipo: string;
  fecha_hora: string;
  descripcion: string;
  limnigrafo: number | null;
  limnigrafo_codigo: string;
  medicion_id: number | null;
  fecha_leida: string | null;
};

export type AlertaPayload = {
  estado: EstadoEnum;
};

export type PaginatedAlertaResponse = Paginado<AlertaResponse>;
