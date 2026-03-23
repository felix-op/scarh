import { EstadisticaAtributo } from "@servicios/api/django.api";

export type FuenteFiltro = "" | "manual" | "automatico" | "import_csv" | "import_json";

export type ComparativasFilters = {
	desde: string;
	hasta: string;
	atributo: EstadisticaAtributo;
};

export type HistorialFilters = {
	limnigrafo: string;
	fuente: FuenteFiltro;
	desde: string;
	hasta: string;
	busqueda: string;
};

export type MedicionRow = {
	id: string;
	limnigrafo: string;
	fuente: string;
	fecha: string;
	hora: string;
	altura: string;
	presion: string;
	temperatura: string;
	bateria: string;
};
