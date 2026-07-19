import type { Paginado } from "./backend";

export type HistorialResponse = {
  id: number;
  date: string;
  type: string;
  object_id: string;
  model_name: string;
  username: string;
  object_repr: string;
  description: string;
  status: string;
  metadata?: Record<string, unknown>;
};

export type PaginatedHistorialResponse = Paginado<Omit<HistorialResponse, "metadata">>;
