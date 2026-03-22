import { MemoryUnit } from "@tipos/Memoria";

export type TCrearLimnigrafo = {
	codigo: string;
	memoria: number;
	tipo_de_comunicacion: string[];
};

export type TFormEditarLimnigrafo = {
  codigo: string;
  descripcion: string;
  ultimo_mantenimiento: string;
  bateria_min: number;
  bateria_max: number;
  tiempo_advertencia: string;
  tiempo_peligro: string;
  memoria_value: number;
  memoria_unit: MemoryUnit;
  tipo_comunicacion: string[];
};
