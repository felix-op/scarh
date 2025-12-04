"use client";

import { QueryKey, useMutation, UseMutationOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import { ApiMethodFunction, MutationConfig, onErrorFunction, onSuccessFunction, ParamsBase, UseGetConfig } from "./types";

interface ApiMethods {
    [key: string]: ApiMethodFunction; 
    
    get: ApiMethodFunction;
    post: ApiMethodFunction;
    put: ApiMethodFunction;
    patch: ApiMethodFunction;
    delete: ApiMethodFunction;
}

export const api: ApiMethods = {
	get: (url: string, config: AxiosRequestConfig) => axios.get(url, { ...config, withCredentials: true }),
	post: (url: string, config: AxiosRequestConfig) => axios.post(url, { ...config, withCredentials: true }),
	put: (url: string, config: AxiosRequestConfig) => axios.put(url, { ...config, withCredentials: true }),
	patch: (url: string, config: AxiosRequestConfig) => axios.patch(url, { ...config, withCredentials: true }),
	delete: (url: string, config: AxiosRequestConfig) => axios.delete(url, { ...config, withCredentials: true }),
}

export function urlConParametros<TParams extends ParamsBase>(baseUrl: string, parametros: TParams) {
	let url = baseUrl;

	if (!baseUrl) {
		console.error('❌ Error: La URL base es undefined');
		return "";
	}

	const parametrosEnUrl = url.match(/{\w+}/g);

	if (!!parametrosEnUrl) {
		parametrosEnUrl.forEach((param) => {
			const key = param.replace(/[{}]/g, '');
			if (key === 'queryParams') {
				return;
			}
			if (parametros[key] !== undefined) {
				url = url.replace(param, parametros[key]);
			} else {
				console.warn(`⚠️ Advertencia: Falta el parámetro '${key}' para la URL.`);
			}
		});
	}

	return url;
};

export function generarQueryKey(key: string, params: ParamsBase = {}) {
	const parametrosString = Object.fromEntries(
		Object.entries(params).filter(([_, valor]) => valor !== undefined && valor !== null)
	);

	if (Object.keys(parametrosString).length === 0) {
		return [key];
	}

	return [key, parametrosString];
};


type RequestOptions<TParams extends ParamsBase> = {
	params: TParams,
	token?: string,
	url: string,
	configAxios: AxiosRequestConfig
};

export async function Request<TParams extends ParamsBase>({
	params,
	token,
	url,
	configAxios
}: RequestOptions<TParams>) {
	const authHeader = token ? { Authorization: `Bearer ${token}`} : {};
	const { headers: customHeaders = {}, responseType, ...otherConfig } = configAxios;
	const headers = {
		...authHeader,
		...customHeaders,
	};
	const finalUrl = (Object.keys(params).length > 0) ? urlConParametros(url, params) : url;
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
			throw new Error(errorMessage ?? 'Error desconocido en la petición.');
		}
		throw new Error('Algo salió mal. El error no es un error de red conocido.');
	}
}

export type UseGetOptions<TParams extends ParamsBase> = {
	key: string,
	url: string,
	params: TParams,
	config: UseGetConfig,
};

export default function useGet<TParams extends ParamsBase, TResponse = unknown>({
	key,
	url,
	params,
	config,
}: UseGetOptions<TParams>) {

	const { configAxios = {}, ...otherConfig } = config;

	return useQuery<TResponse>({
		queryKey: generarQueryKey(key, params),
		queryFn: () => Request({
			params,
			token: "",
			url,
			configAxios,
		}),
		gcTime: 1000 * 60 * 60,
		refetchOnWindowFocus: false,
		...otherConfig,
	});
}

type InvalidateOptions = {
	queries: QueryKey | QueryKey[]
	shouldRefetch: boolean
};

function useInvalidateAndRefetch() {
	const queryClient = useQueryClient();

	const invalidateAndRefetch = async ({ queries, shouldRefetch }: InvalidateOptions) => {
		const keys = Array.isArray(queries) ? queries : [queries];
		
		const queryKeys = keys.map((key) => {
			const newKey = Array.isArray(key) ? key : [key];
			return newKey;
		});
		
		await Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
		
		if (shouldRefetch) {
			await Promise.all(
				queryKeys.map((queryKey) => queryClient.refetchQueries({ queryKey }))
			);
		}
	};

	return invalidateAndRefetch;
}

type MethodOptions = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ContentTypeOptions = 'application/json';

type UseGenericMutationProps<TRequest, TResponse, TParams extends ParamsBase> = {
	method: MethodOptions,
	url: string,
	params: TParams,
	data?: TRequest,
	token: string,
	contentType: ContentTypeOptions,
	queriesToInvalidate: QueryKey[],
	onSuccess?: onSuccessFunction<TResponse, TParams, TRequest>, 
	onError?: onErrorFunction<TParams, TRequest>,
	refetch: boolean
	configAxios?: AxiosRequestConfig,
};

function useGenericMutation<
	TRequest, TResponse, TParams extends ParamsBase
>({
	method,
	url,
	params,
	data,
	token,
	contentType,
	queriesToInvalidate = [],
	onSuccess,
	onError,
	refetch,
	configAxios = {},
	...mutationOptions
}: UseGenericMutationProps<TRequest, TResponse, TParams>) {
	const invalidateAndRefetch = useInvalidateAndRefetch();

	return useMutation({
		mutationFn: async (variables = {}) => {
			const finalParams = {
				...params,
				...(variables.params || variables || {}),
			};
			const finalData = variables.data ?? data;
			const resolvedUrl = urlConParametros(url, finalParams);
			const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

			const {
				headers: customHeaders = { 'Content-Type': contentType },
				responseType,
				...otherConfig
			} = configAxios;

			const headers = {
				...authHeader,
				...customHeaders,
			};
			
			const queryParams = params && params.queryParams ? params.queryParams : {};
			const methodKey = method.toLowerCase();
			const finalConfig = {
				params: queryParams,
				headers,
				responseType,
				...otherConfig,
			};
			let response;

			const requiresData = ['post', 'put', 'patch'].includes(methodKey);
			if (methodKey === 'get' || !api[methodKey]) {
				throw new Error(`Método HTTP no soportado para esta función: ${method}`);
			}

			const apiCallFunction = api[methodKey];

			try {
				if (requiresData) {
					response = await apiCallFunction(resolvedUrl, finalData, finalConfig);
				} else {
					response = await apiCallFunction(resolvedUrl, finalConfig);
				}

				return response.data;
			} catch (error) {
				console.error('Error en la mutación:', error);
				throw error;
			}
		},
		onSuccess: async (data, variables, context) => {
			if (Array.isArray(queriesToInvalidate) && queriesToInvalidate.length > 0) {
				try {
					await invalidateAndRefetch({
						queries: queriesToInvalidate,
						shouldRefetch: refetch,
					});
				} catch (e) {
					console.warn('Error al invalidar keys:', e);
				}
			}

			if (typeof onSuccess === 'function') {
				await onSuccess(data as TResponse, variables, context);
			}
		},
		onError,
		...mutationOptions,
	});
};

type MutationBaseProps<TRequest, TResponse, TParams extends ParamsBase> = {
	url: string,
	params: TParams,
	configuracion: MutationConfig<TRequest, TResponse, TParams>,
};

type MutationProps<TRequest, TResponse, TParams extends ParamsBase> =
	MutationBaseProps<TRequest, TResponse, TParams> & UseMutationOptions;


export function usePost<TRequest, TResponse, TParams extends ParamsBase>({
	url,
	params,
	configuracion,
}: MutationProps<TRequest, TResponse, TParams>){
	const {
		refetch = false,
		queriesToInvalidate = [],
		data,
		...rest
	} = configuracion;

	return useGenericMutation({
		method: 'POST',
		contentType: 'application/json',
		url,
		params,
		token: "",
		refetch: refetch ?? false,
		queriesToInvalidate,
		data,
		...rest,
	});
}

export function usePut<TRequest, TResponse, TParams extends ParamsBase>({
	url,
	params,
	configuracion,
}: MutationProps<TRequest, TResponse, TParams>){
	const {
		refetch = false,
		queriesToInvalidate = [],
		data,
		...rest
	} = configuracion;

	return useGenericMutation({
		method: 'PUT',
		contentType: 'application/json',
		url,
		params,
		token: "",
		refetch: refetch ?? false,
		queriesToInvalidate,
		data,
		...rest,
	});
}

export function usePatch<TRequest, TResponse, TParams extends ParamsBase>({
	url,
	params,
	configuracion,
}: MutationProps<TRequest, TResponse, TParams>){
	const {
		refetch = false,
		queriesToInvalidate = [],
		data,
		...rest
	} = configuracion;

	return useGenericMutation({
		method: 'PATCH',
		contentType: 'application/json',
		url,
		params,
		token: "",
		refetch: refetch ?? false,
		queriesToInvalidate,
		data,
		...rest,
	});
}


export function useDelete<TRequest, TResponse, TParams extends ParamsBase>({
	url,
	params,
	configuracion,
}: MutationProps<TRequest, TResponse, TParams>){
	const {
		refetch = false,
		queriesToInvalidate = [],
		data,
		...rest
	} = configuracion;

	return useGenericMutation({
		method: 'DELETE',
		contentType: 'application/json',
		url,
		params,
		token: "",
		refetch: refetch ?? false,
		queriesToInvalidate,
		data,
		...rest,
	});
}