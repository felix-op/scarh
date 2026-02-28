"use client";

import { useGet, useDelete, usePatch, usePost, usePut } from "./queryHooks";
import { MutationConfig, ParamsBase, UseGetConfig } from "./types";

const NEXT_PROXY_URL = "/api/proxy";

/*
************************
	LIMNIGRAFOS
************************
*/

// TIPOS
export type LimnigrafoResponse = {
	id: number,
	codigo: string,
	descripcion: string,
	ultimo_mantenimiento: string,
	tipo_comunicacion: string,
	bateria_max: number,
	bateria_min: number,
	bateria: number | null, // Nivel actual de batería (bateria_actual del backend) - puede ser null
	memoria: number,
	tiempo_advertencia: number,
	tiempo_peligro: number,
	ultima_conexion: string | null, // Timestamp ISO 8601: "2025-12-05T01:23:28.002536+00:00" o null si nunca se conectó
	estado: string,
	ubicacion: {
		id: number,
		longitud: number,
		latitud: number,
		nombre: string,
	} | null, // Puede ser null si no tiene ubicación asignada
	ultima_medicion: {
		id: number,
		fecha_hora: string,
		altura_agua: number | null,
		temperatura: number | null,
		presion: number | null,
	} | null, // Puede ser null si no tiene mediciones
};

// Respuesta paginada del backend para limnígrafos
export type LimnigrafoPaginatedResponse = {
	count: number,
	next: string | null,
	previous: string | null,
	results: LimnigrafoResponse[],
};

export type LimnigrafoPostRequest = {
	codigo: string,
	descripcion?: string,
	ultimo_mantenimiento?: string,
	tipo_comunicacion: string[],
	bateria_max: number,
	bateria_min: number,
	memoria: number,
	tiempo_advertencia: string,
	tiempo_peligro: string,
	ubicacion_id?: number,
};

export type LimnigrafoPutRequest = {
	codigo: string,
	descripcion: string,
	ultimo_mantenimiento: string,
	tipo_comunicacion: string,
	bateria_max: number,
	bateria_min: number,
	memoria: number,
	tiempo_advertencia: number,
	tiempo_peligro: number,
};

export type LimnigrafoPatchRequest = {
	codigo?: string,
	descripcion?: string,
	ultimo_mantenimiento?: string,
	tipo_comunicacion?: string,
	bateria_max?: number,
	bateria_min?: number,
	memoria?: number,
	tiempo_advertencia?: number,
	tiempo_peligro?: number,
};

// ENDPOINT: GET-LIMNIGRAFOS

type UseGetLimnigrafosOptions = {
	params?: ParamsBase,
	config?: UseGetConfig<LimnigrafoPaginatedResponse>,
}

export function useGetLimnigrafos({ params, config }: UseGetLimnigrafosOptions = {}) {
	const defaultParams = {};
	const defaultConfig = {};

	return useGet<ParamsBase, LimnigrafoPaginatedResponse>({
		key: "useGetLimnigrafos",
		url: `${NEXT_PROXY_URL}/limnigrafos/`,
		params: params ?? defaultParams,
		config: config ?? defaultConfig,
	});
}

// ENDPOINT: GET-LIMNIGRAFO

type UseGetLimnigrafoOptions = {
	params?: {
		id: string,
	}
	configuracion?: UseGetConfig,
}

export function useGetLimnigrafo({ params, configuracion }: UseGetLimnigrafoOptions) {
	const defaultParams = {
		id: "",
	}
	const defaultConfig = {};

	return useGet({
		key: "useGetLimnigrafo",
		url: `${NEXT_PROXY_URL}/limnigrafos/{id}`,
		params: params ?? defaultParams,
		config: configuracion ?? defaultConfig,
	});
}

// ENDPOINT: POST-LIMNIGRAFOS

type UsePostLimngrafoOptions = {
	params?: ParamsBase,
	configuracion?: MutationConfig<
		LimnigrafoPostRequest,
		LimnigrafoResponse,
		ParamsBase
	>
};

export function usePostLimnigrafo({ params, configuracion }: UsePostLimngrafoOptions) {
	const defaultParams = {};
	const defaultConfig = {};

	return usePost<LimnigrafoPostRequest, LimnigrafoResponse, ParamsBase>({
		url: `${NEXT_PROXY_URL}/limnigrafos/`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}

// ENDPOINT: PUT-LIMNIGRAFOS

type UsePutLimngrafoOptions = {
	params?: {
		id: string,
	}
	configuracion?: MutationConfig<
		LimnigrafoPutRequest,
		LimnigrafoResponse,
		ParamsBase
	>
};

export function usePutLimnigrafo({ params, configuracion }: UsePutLimngrafoOptions) {
	const defaultParams = {
		id: "",
	}
	const defaultConfig = {};
	
	return usePut({
		url: `${NEXT_PROXY_URL}/limnigrafos/{id}`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}

// ENDPOINT: PATCH-LIMNIGRAFOS

type UsePachtLimngrafoOptions = {
	params?: {
		id: string,
	}
	configuracion?: MutationConfig<
		LimnigrafoPatchRequest,
		LimnigrafoResponse,
		ParamsBase
	>
};

export function usePachtLimnigrafo({ params, configuracion }: UsePachtLimngrafoOptions) {
	const defaultParams = {
		id: "",
	}
	const defaultConfig = {};
	
	return usePatch({
		url: `${NEXT_PROXY_URL}/limnigrafos/{id}`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}

// ENDPOINT: PATCH-LIMNIGRAFOS

type UseDeleteLimngrafoOptions = {
	params?: {
		id: string,
	}
	configuracion?: MutationConfig<
		LimnigrafoPutRequest,
		LimnigrafoResponse,
		ParamsBase
	>
};

export function useDeleteLimnigrafo({ params, configuracion }: UseDeleteLimngrafoOptions) {
	const defaultParams = {
		id: "",
	}
	const defaultConfig = {};
	
	return useDelete({
		url: `${NEXT_PROXY_URL}/limnigrafos/{id}`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}

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
	presion: number | null, // Presión atmosférica en hPa
	temperatura: number | null, // Temperatura en grados Celsius
	nivel_de_bateria: number | null, // Nivel de batería en porcentaje (0-100)
	fuente: "automatico" | "manual", // Origen de la medición
	limnigrafo: number, // ID del limnígrafo que envió la medición
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
	limnigrafo?: string, // ID del limnígrafo (debe ser string para query params)
	limit?: string, // Cantidad de resultados por página
	page?: string, // Número de página
}

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
		params: params ?? {},
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
}

type UseGetHistorialesOptions = {
	params?: UseGetHistorialesParams,
	configuracion?: UseGetConfig<HistorialResponse>,
}

export function useGetHistoriales({ params, configuracion }: UseGetHistorialesOptions) {
	const defaultParams = {
		queryParams: {
			limit: "10",
			page: "1",
		},
	};
	const defaultConfig = {};

	return useGet({
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
