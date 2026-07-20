import { RutaAccesoResponse } from "types/rutas-acceso";
import { useDelete, useGet, usePatch, usePost } from "./queryHooks";
import { MutationConfig, Paginado, ParamsBase, UseGetConfig } from "./types";

const NEXT_PROXY_URL = "/api/proxy";

type UseGetRutasAccesoOptions = {
	params?: {
		queryParams?: {
			limnigrafo?: string;
			limit?: string;
			page?: string;
		}
	} & ParamsBase,
	config?: UseGetConfig<Paginado<RutaAccesoResponse>>,
}

export function useGetRutasAcceso({ params, config }: UseGetRutasAccesoOptions = {}) {
	return useGet<ParamsBase, Paginado<RutaAccesoResponse>>({
		key: "useGetRutasAcceso",
		url: `${NEXT_PROXY_URL}/rutas-acceso/`,
		params: params ?? { queryParams: {} },
		config: config ?? {},
	});
}

type RutaAccesoMutationOptions = {
	params?: ParamsBase,
	configuracion?: MutationConfig<FormData, RutaAccesoResponse, ParamsBase>,
}

export function usePostRutaAcceso({ params, configuracion }: RutaAccesoMutationOptions = {}) {
	return usePost<FormData, RutaAccesoResponse, ParamsBase>({
		url: `${NEXT_PROXY_URL}/rutas-acceso/`,
		params: params ?? {},
		configuracion: configuracion ?? {
			configAxios: { headers: {} },
		},
	});
}

type RutaAccesoDetailMutationOptions = {
	params?: {
		id: string;
	},
	configuracion?: MutationConfig<FormData, RutaAccesoResponse, ParamsBase>,
}

export function usePatchRutaAcceso({ params, configuracion }: RutaAccesoDetailMutationOptions) {
	return usePatch<FormData, RutaAccesoResponse, ParamsBase>({
		url: `${NEXT_PROXY_URL}/rutas-acceso/{id}/`,
		params: params ?? { id: "" },
		configuracion: configuracion ?? {
			configAxios: { headers: {} },
		},
	});
}

type UseDeleteRutaAccesoOptions = {
	params?: {
		id: string;
	},
	configuracion?: MutationConfig<unknown, unknown, ParamsBase>,
}

export function useDeleteRutaAcceso({ params, configuracion }: UseDeleteRutaAccesoOptions) {
	return useDelete<unknown, unknown, ParamsBase>({
		url: `${NEXT_PROXY_URL}/rutas-acceso/{id}/`,
		params: params ?? { id: "" },
		configuracion: configuracion ?? {},
	});
}
