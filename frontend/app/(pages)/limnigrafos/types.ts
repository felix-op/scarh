import { MemoryUnit } from "@tipos/Memoria";

export type TCrearLimnigrafo = {
	codigo: string;
	memoria_value: string | null;
	memoria_unit: MemoryUnit;
	tipo_de_comunicacion: string[];
};

export type TFormEditarLimnigrafo = {
  codigo: string;
  descripcion: string;
  ultimo_mantenimiento: string;
  bateria_min: number;
  bateria_max: number;
  tiempo_advertencia_segundos?: string | null;
  tiempo_advertencia_minutos?: string | null;
  tiempo_advertencia_horas?: string | null;
  tiempo_peligro_segundos?: string | null;
  tiempo_peligro_minutos?: string | null;
  tiempo_peligro_horas?: string | null;
  memoria_value: string | null;
  memoria_unit: MemoryUnit;
  tipo_comunicacion: string[];
};
