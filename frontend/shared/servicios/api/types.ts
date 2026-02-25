import { UseQueryOptions } from "@tanstack/react-query";
import { AxiosError, AxiosRequestConfig } from "axios";

export type ParamsBase = Record<string, string> & {
	queryParams?: Record<string, string>,
};

export type UseGetConfig<TResponse = unknown> = Omit<UseQueryOptions<TResponse, Error, TResponse, readonly unknown[]>, 'queryKey' | 'queryFn'> & {
    configAxios?: AxiosRequestConfig,
};

export type GenericMutationVariables<TParams extends ParamsBase, TRequest> = {
	params?: TParams
	data?: TRequest
}

export type onSuccessFunction<TResponse, TParams extends ParamsBase, TRequest> = (
	data: TResponse,
	variables: GenericMutationVariables<TParams, TRequest>,
	context: unknown
) => void | Promise<void>;

export type onErrorFunction<TParams extends ParamsBase, TRequest> = (
	error: AxiosError<BackendError>,
	variables: GenericMutationVariables<TParams, TRequest>,
	context: unknown
) => void | Promise<void>

export type MutationConfig<TRequest, TResponse, TParams extends ParamsBase> = {
	queriesToInvalidate?: string[],
	data?: TRequest,
	onSuccess?: onSuccessFunction<TResponse, TParams, TRequest>, 
	onError?: onErrorFunction<TParams, TRequest>,
	refetch?: boolean,
	configAxios?: AxiosRequestConfig
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiMethodFunction = (url: string, ...args: any[]) => Promise<any>;

export type BackendError = {
    codigo: number;
    descripcion_tecnica: string;
    descripcion_usuario: string;
    titulo: string;
};
