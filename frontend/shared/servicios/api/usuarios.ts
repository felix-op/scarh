import { UsuarioPatchRequest, UsuarioPostRequest, UsuarioPutRequest, UsuarioResponse } from "types/usuarios";
import { MutationConfig, ParamsBase, UseGetConfig } from "./types";
import { useGet, useDelete, usePatch, usePost, usePut } from "./queryHooks";

const NEXT_PROXY_URL = "/api/proxy";

type UseGetUsuariosOptions = {
	params?: ParamsBase,
	configuracion?: UseGetConfig,
}

export function useGetUsuarios({ params, configuracion }: UseGetUsuariosOptions) {
	const defaultParams = {};
	const defaultConfig = {};

	return useGet<ParamsBase, UsuarioResponse[]>({
		key: "useGetUsuarios",
		url: `${NEXT_PROXY_URL}/usuarios/`,
		params: params ?? defaultParams,
		config: configuracion ?? defaultConfig,
	});
}

type UseGetUsuarioOptions = {
	params?: {
		id: string,
	}
	configuracion?: UseGetConfig,
}

export function useGetUsuario({ params, configuracion }: UseGetUsuarioOptions) {
	const defaultParams = {
		id: "",
	}
	const defaultConfig = {};

	return useGet({
		key: "useGetUsuario",
		url: `${NEXT_PROXY_URL}/usuarios/{id}`,
		params: params ?? defaultParams,
		config: configuracion ?? defaultConfig,
	});
}

type UsePostUsuarioOptions = {
	params?: ParamsBase,
	configuracion?: MutationConfig<
		UsuarioPostRequest,
		UsuarioResponse,
		ParamsBase
	>
};

export function usePostUsuario({ params, configuracion }: UsePostUsuarioOptions) {
	const defaultParams = {};
	const defaultConfig = {};

	return usePost<UsuarioPostRequest, UsuarioResponse, ParamsBase>({
		url: `${NEXT_PROXY_URL}/usuarios/`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}

type UsePutUsuarioOptions = {
	params?: {
		id: string,
	}
	configuracion?: MutationConfig<
		UsuarioPutRequest,
		UsuarioResponse,
		ParamsBase
	>
};

export function usePutUsuario({ params, configuracion }: UsePutUsuarioOptions) {
	const defaultParams = {
		id: "",
	}
	const defaultConfig = {};

	return usePut({
		url: `${NEXT_PROXY_URL}/usuarios/{id}`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}

type UsePachtUsuarioOptions = {
	params?: {
		id: string,
	}
	configuracion?: MutationConfig<
		UsuarioPatchRequest,
		UsuarioResponse,
		ParamsBase
	>
};

export function usePachtUsuario({ params, configuracion }: UsePachtUsuarioOptions) {
	const defaultParams = {
		id: "",
	}
	const defaultConfig = {};

	return usePatch({
		url: `${NEXT_PROXY_URL}/usuarios/{id}`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}

type UseDeleteUsuarioOptions = {
	params?: {
		id: string,
	}
	configuracion?: MutationConfig<
		UsuarioPutRequest,
		UsuarioResponse,
		ParamsBase
	>
};

export function useDeleteUsuario({ params, configuracion }: UseDeleteUsuarioOptions) {
	const defaultParams = {
		id: "",
	}
	const defaultConfig = {};

	return useDelete({
		url: `${NEXT_PROXY_URL}/usuarios/{id}`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}
