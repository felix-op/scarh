import axios, { AxiosRequestConfig } from "axios";
import { ParamsBase } from "./types";
import urlConParametros from "./urlConParametros";
import { api } from "./api";

type RequestOptions<TParams extends ParamsBase> = {
	params: TParams;
	token?: string;
	url: string;
	configAxios: AxiosRequestConfig;
};

export default async function Request<TParams extends ParamsBase>({
	params,
	token,
	url,
	configAxios,
}: RequestOptions<TParams>) {
	const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
	const {
		headers: customHeaders = {},
		responseType,
		...otherConfig
	} = configAxios;
	const headers = {
		...authHeader,
		...customHeaders,
	};
	const finalUrl =
		Object.keys(params).length > 0 ? urlConParametros(url, params) : url;
	const queryParams = params && params.queryParams ? params.queryParams : {};

	try {
		const response = await api.get(finalUrl, {
			params: queryParams,
			headers,
			responseType,
			...otherConfig,
		});

		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			const errorMessage = error.response?.data
				? error.response.data
				: error.message;
			throw new Error(
				errorMessage ?? "Error desconocido en la petición.",
			);
		}
		throw new Error(
			"Algo salió mal. El error no es un error de red conocido.",
		);
	}
}
