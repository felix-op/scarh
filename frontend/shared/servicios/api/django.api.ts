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