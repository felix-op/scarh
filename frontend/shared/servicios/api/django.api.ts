"use client";

import useGet, { useDelete, usePatch, usePost, usePut } from "./queryHooks";
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
	memoria: number,
	tiempo_advertencia: number,
	tiempo_peligro: number,
	ultima_conexion: number,
	estado: string,
	ubicacion: {
		id: number,
		longitud: number,
		latitud: number,
		nombre: string,
	}
};

export type LimnigrafoPostRequest = {
	codigo: string,
	descripcion: string,
	ultimo_mantenimiento: string,
	tipo_comunicacion: string[],
	bateria_max: number,
	bateria_min: number,
	memoria: number,
	tiempo_advertencia: string,
	tiempo_peligro: string,
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
	config?: UseGetConfig,
}

export function useGetLimnigrafos({ config }: UseGetLimnigrafosOptions) {
	return useGet({
		key: "useGetLimnigrafos",
		url: `${NEXT_PROXY_URL}/limnigrafos/`,
		params: {},
		config: config ?? {},
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
		LimnigrafoPutRequest,
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

// TIPOS
// Representa una medición individual enviada por un limnígrafo
export type MedicionResponse = {
	id: number,
	fecha_hora: string, // ISO 8601: "2025-12-04T18:14:03.142454Z"
	altura: number | null, // Nivel del agua en metros
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
	config?: UseGetConfig,
}

// Hook para obtener mediciones del backend
// Uso: const { data } = useGetMediciones({ params: { limnigrafo: "1", limit: "10" } })
// La respuesta será de tipo MedicionPaginatedResponse
export function useGetMediciones({ params, config }: UseGetMedicionesOptions = {}) {
	return useGet({
		key: "useGetMediciones",
		url: `${NEXT_PROXY_URL}/medicion/`,
		params: params ?? {},
		config: config ?? {},
	});
}