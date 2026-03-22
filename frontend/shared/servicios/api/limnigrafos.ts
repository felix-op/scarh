import { LimnigrafoPatchtRequest, LimnigrafoPostRequest, LimnigrafoPutRequest, LimnigrafoResponse } from "types/limnigrafos";
import { useDelete, useGet, usePatch, usePost, usePut } from "./queryHooks";
import { MutationConfig, Paginado, ParamsBase, UseGetConfig } from "./types";

const NEXT_PROXY_URL = "/api/proxy";

type UseGetLimnigrafosOptions = {
	params?: ParamsBase,
	config?: UseGetConfig<Paginado<LimnigrafoResponse>>,
}

export function useGetLimnigrafos({ params, config }: UseGetLimnigrafosOptions = {}) {
	const defaultParams = {};
	const defaultConfig = {};

	return useGet<ParamsBase, Paginado<LimnigrafoResponse>>({
		key: "useGetLimnigrafos",
		url: `${NEXT_PROXY_URL}/limnigrafos/`,
		params: params ?? defaultParams,
		config: config ?? defaultConfig,
	});
}

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

	return useGet<ParamsBase, LimnigrafoResponse>({
		key: "useGetLimnigrafo",
		url: `${NEXT_PROXY_URL}/limnigrafos/{id}`,
		params: params ?? defaultParams,
		config: configuracion ?? defaultConfig,
	});
}

type UsePostLimngrafoOptions = {
	params?: ParamsBase,
	configuracion?: MutationConfig<
		LimnigrafoPostRequest,
		LimnigrafoResponse,
		ParamsBase
	>
}

export function usePostLimnigrafo({ params, configuracion }: UsePostLimngrafoOptions) {
	const defaultParams = {};
	const defaultConfig = {};

	return usePost<LimnigrafoPostRequest, LimnigrafoResponse, ParamsBase>({
		url: `${NEXT_PROXY_URL}/limnigrafos/`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}

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

	return usePut<LimnigrafoPutRequest, LimnigrafoResponse, ParamsBase>({
		url: `${NEXT_PROXY_URL}/limnigrafos/{id}`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}

type UsePachtLimngrafoOptions = {
	params?: {
		id: string,
	}
	configuracion?: MutationConfig<
		LimnigrafoPatchtRequest,
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
