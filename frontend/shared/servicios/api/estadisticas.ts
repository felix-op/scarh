import { EstadisticaPostRequest, EstadisticaResponse } from "types/estadisticas";
import { MutationConfig, ParamsBase } from "./types";
import { usePost } from "./queryHooks";

const NEXT_PROXY_URL = "/api/proxy";

type UsePostEstadisticaOptions = {
	params?: ParamsBase,
	configuracion?: MutationConfig<
		EstadisticaPostRequest,
		EstadisticaResponse[],
		ParamsBase
	>
};

export function usePostEstadistica({ params, configuracion }: UsePostEstadisticaOptions = {}) {
	const defaultConfig = {};

	return usePost<EstadisticaPostRequest, EstadisticaResponse[], ParamsBase>({
		url: `${NEXT_PROXY_URL}/estadistica/`,
		configuracion: configuracion ?? defaultConfig,
		params: params ?? {},
	});
}
