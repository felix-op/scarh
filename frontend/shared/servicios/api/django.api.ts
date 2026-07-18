"use client";

import { useGet, usePost } from "./queryHooks";
import { MutationConfig, ParamsBase, UseGetConfig } from "./types";

const NEXT_PROXY_URL = "/api/proxy";

/*
************************
	MEDICIONES
************************
*/

// Representa una medición individual enviada por un limnígrafo
export type MedicionResponse = {
	id: number,
	fecha_hora: string, // ISO 8601: "2025-12-04T18:14:03.142454Z"
	altura_agua: number | null, // Nivel del agua en metros
	presion: number | null, // Presión en hPa
	temperatura: number | null, // Temperatura en grados Celsius
	nivel_de_bateria: number | null, // Nivel de batería en porcentaje (0-100)
	idempotency_key?: string | null,
	fuente: "automatico" | "manual" | "import_csv" | "import_json", // Origen de la medición
	limnigrafo: number, // ID del limnígrafo que envió la medición
};

export type ImportRowStatus =
	| "valid"
	| "error"
	| "duplicate_file"
	| "duplicate_database"
	| "warning";

export type ImportRowIssue = {
	field: string,
	code: string,
	message: string,
};

export type ImportMeasurementRow = {
	rowNumber: number,
	limnigrafoId: number | null,
	fechaHora: string,
	alturaAgua: number | null,
	presion: number | null,
	temperatura: number | null,
	nivelBateria: number | null,
};

export type ImportPreviewRow = ImportMeasurementRow & {
	status: ImportRowStatus,
	issues: ImportRowIssue[],
};

export type MedicionImportRequest = {
	file_name: string,
	fuente: "import_csv" | "import_json",
	fallback_limnigrafo_id?: number | null,
	rows: Array<{
		row_number: number,
		limnigrafo_id?: number | null,
		fecha_hora: string,
		altura_agua: number | null,
		presion: number | null,
		temperatura: number | null,
		nivel_de_bateria: number | null,
	}>,
};

export type MedicionImportValidationResponse = {
	file_name: string,
	fuente: "import_csv" | "import_json",
	is_valid: boolean,
	summary: {
		total_rows: number,
		valid_rows: number,
		error_rows: number,
	},
	rows: ImportPreviewRow[],
};

export type MedicionBulkImportResponse = {
	message: string,
	imported_rows: number,
	rows: ImportPreviewRow[],
};

// Respuesta paginada del backend (50 mediciones por página)
export type MedicionPaginatedResponse = {
	count: number, // Total de mediciones
	next: string | null, // URL de la siguiente página
	previous: string | null, // URL de la página anterior
	results: MedicionResponse[], // Array de mediciones
};

// ENDPOINT: GET-MEDICIONES

type UseGetMedicionesParams = {
	queryParams?: {
		limnigrafo?: string, // ID del limnígrafo
		fuente?: "manual" | "automatico" | "import_csv" | "import_json", // Filtrar por origen
		fecha_desde?: string, // Fecha/hora de inicio ISO 8601
		fecha_hasta?: string, // Fecha/hora de fin ISO 8601
		search?: string, // Búsqueda textual general
		limit?: string, // Cantidad de resultados por página
		page?: string, // Número de página
	}
} & ParamsBase

type UseGetMedicionesOptions = {
	params?: UseGetMedicionesParams,
	config?: UseGetConfig<MedicionPaginatedResponse>,
}

// Hook para obtener mediciones del backend
// Uso: const { data } = useGetMediciones({ params: { limnigrafo: "1", limit: "10" } })
// La respuesta será de tipo MedicionPaginatedResponse
export function useGetMediciones({ params, config }: UseGetMedicionesOptions = {}) {
	return useGet<UseGetMedicionesParams, MedicionPaginatedResponse>({
		key: "useGetMediciones",
		url: `${NEXT_PROXY_URL}/medicion/`,
		params: params ?? { queryParams: {} },
		config: config ?? {},
	});
}

// ENDPOINT: POST-MEDICION

export type MedicionPostRequest = {
	limnigrafo: number,
	fecha_hora?: string,
	altura_agua: number,
	presion?: number | null,
	temperatura?: number | null,
	nivel_de_bateria?: number | null,
	idempotency_key?: string,
	fuente?: "manual" | "automatico" | "import_csv" | "import_json",
};

type UsePostMedicionOptions = {
	params?: ParamsBase,
	configuracion?: MutationConfig<
		MedicionPostRequest,
		MedicionResponse,
		ParamsBase
	>
};

export function usePostMedicion({ params, configuracion }: UsePostMedicionOptions = {}) {
	const defaultConfig = {};

	return usePost<MedicionPostRequest, MedicionResponse, ParamsBase>({
		url: `${NEXT_PROXY_URL}/medicion/`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? {},
	});
}

type UsePostMedicionImportOptions = {
	params?: ParamsBase,
	configuracion?: MutationConfig<
		MedicionImportRequest,
		MedicionImportValidationResponse,
		ParamsBase
	>
};

export function usePostValidarImportacionMediciones({ params, configuracion }: UsePostMedicionImportOptions = {}) {
	return usePost<MedicionImportRequest, MedicionImportValidationResponse, ParamsBase>({
		url: `${NEXT_PROXY_URL}/medicion/validate-import/`,
		configuracion: configuracion ?? {},
		params: params ?? {},
	});
}

type UsePostBulkImportOptions = {
	params?: ParamsBase,
	configuracion?: MutationConfig<
		MedicionImportRequest,
		MedicionBulkImportResponse,
		ParamsBase
	>
};

export function usePostImportarMedicionesLote({ params, configuracion }: UsePostBulkImportOptions = {}) {
	return usePost<MedicionImportRequest, MedicionBulkImportResponse, ParamsBase>({
		url: `${NEXT_PROXY_URL}/medicion/bulk-import/`,
		configuracion: configuracion ?? {},
		params: params ?? {},
	});
}

/*
************************
	ESTADISTICA
************************
*/

export type EstadisticaAtributo = "altura_agua" | "presion" | "temperatura";

export type EstadisticaOutputItem = {
	id: number | null,
	maximo: number,
	minimo: number,
	atributo: EstadisticaAtributo,
	moda: number | null,
	desvio_estandar: number,
	percentil_90: number,
};

type UseGetEstadisticaParams = {
	queryParams?: {
		limnigrafos?: string,
		atributo?: EstadisticaAtributo,
		fecha_inicio?: string,
		fecha_fin?: string,
	}
} & ParamsBase

type UseGetEstadisticaOptions = {
	params?: UseGetEstadisticaParams,
	config?: UseGetConfig<EstadisticaOutputItem[]>,
}

export function useGetEstadistica({ params, config }: UseGetEstadisticaOptions = {}) {
	return useGet<UseGetEstadisticaParams, EstadisticaOutputItem[]>({
		key: "useGetEstadistica",
		url: `${NEXT_PROXY_URL}/estadistica/`,
		params: params ?? { queryParams: {} },
		config: config ?? {},
	});
}






/*
************************
	Historial
************************
*/

// TIPOS

export type HistorialItem = {
	id: number,
	date: string,
	type: string,
	object_id: string,
	model_name: string,
	username: string,
	object_repr: string,
	description: string,
	status: string,
}

export type HistorialResponse = {
	count: number,
	next: string | null,
	previous: string | null,
	results: HistorialItem[]
};

export type HistorialDetailItem = HistorialItem & {
	metadata: Record<string, unknown>,
}

// ENDPOINT: GET-HISTORIALES

type UseGetHistorialesParams = {
	queryParams?: {
		limit?: string,
		page?: string,
		type?: string,
		model?: string,
		usuario?: string,
		desde?: string,
		hasta?: string,
	}
} & ParamsBase

type UseGetHistorialesOptions = {
	params?: UseGetHistorialesParams,
	configuracion?: UseGetConfig<HistorialResponse>,
}

export function useGetHistoriales({ params, configuracion }: UseGetHistorialesOptions = {}) {
	const defaultParams = {
		queryParams: {
			limit: "10",
			page: "1",
		},
	};
	const defaultConfig = {};

	return useGet<UseGetHistorialesParams, HistorialResponse>({
		key: "useGetHistoriales",
		url: `${NEXT_PROXY_URL}/historial/`,
		params: params ?? defaultParams,
		config: configuracion ?? defaultConfig,
	});
}

// ENDPOINT: GET-HISTORIAL

type UseGetHistorialOptions = {
	params?: {
		id: string,
	}
	configuracion?: UseGetConfig<HistorialDetailItem>,
}

export function useGetHistorial({ params, configuracion }: UseGetHistorialOptions) {
	const defaultParams = {
		id: "",
	}
	const defaultConfig = {};

	return useGet<{ id: string }, HistorialDetailItem>({
		key: "useGetHistorial",
		url: `${NEXT_PROXY_URL}/historial/{id}`,
		params: params ?? defaultParams,
		config: configuracion ?? defaultConfig,
	});
}
