import { useGet, usePatch, usePost } from "./queryHooks";
import { MutationConfig, ParamsBase, UseGetConfig } from "./types";

const NEXT_PROXY_URL = "/api/proxy";

export type AlertaResponse = {
	id: number;
	estado: "nuevo" | "leido" | "solucionado";
	tipo: string;
	fecha_hora: string;
	descripcion: string;
	limnigrafo: number | null;
	limnigrafo_codigo?: string;
	medicion_id?: number | null;
};

export type AlertaPatchRequest = {
	estado?: "nuevo" | "leido" | "solucionado";
};

export type AlertasMarkAllReadResponse = {
	updated: number;
};

type UseGetAlertasOptions = {
	params?: ParamsBase;
	configuracion?: UseGetConfig<AlertaResponse[]>;
};

export function useGetAlertas({ params, configuracion }: UseGetAlertasOptions = {}) {
	const defaultParams = {};
	const defaultConfig = {};

	return useGet<ParamsBase, AlertaResponse[]>({
		key: "useGetAlertas",
		url: `${NEXT_PROXY_URL}/alertas/`,
		params: params ?? defaultParams,
		config: configuracion ?? defaultConfig,
	});
}

type UsePatchAlertaOptions = {
	params?: {
		id: string;
	};
	configuracion?: MutationConfig<
		AlertaPatchRequest,
		AlertaResponse,
		ParamsBase
	>;
};

export function usePatchAlerta({ params, configuracion }: UsePatchAlertaOptions) {
	const defaultParams = {
		id: "",
	};
	const defaultConfig = {};

	return usePatch({
		url: `${NEXT_PROXY_URL}/alertas/{id}/`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? defaultParams,
	});
}

type UsePostAlertasMarkAllReadOptions = {
	configuracion?: MutationConfig<
		Record<string, never>,
		AlertasMarkAllReadResponse,
		ParamsBase
	>;
};

export function usePostAlertasMarkAllRead({ configuracion }: UsePostAlertasMarkAllReadOptions = {}) {
	const defaultConfig = {};

	return usePost({
		url: `${NEXT_PROXY_URL}/alertas/mark-all-read/`,
		configuracion: configuracion ?? defaultConfig,
		params: {},
	});
}
