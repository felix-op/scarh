import { QueryKey, UseQueryOptions } from "@tanstack/react-query";
import { AxiosRequestConfig } from "axios";

export type ParamsBase = Record<string, string> & {
	queryParams?: Record<string, string>,
};

export type UseGetConfig = Omit<UseQueryOptions, 'queryKey' | 'queryFn'> & {
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
	error: Error,
	variables: GenericMutationVariables<TParams, TRequest>,
	context: unknown
) => void | Promise<void>

export type MutationConfig<TRequest, TResponse, TParams extends ParamsBase> = {
	queriesToInvalidate?: QueryKey[],
	data?: TRequest,
	onSuccess?: onSuccessFunction<TResponse, TParams, TRequest>, 
	onError?: onErrorFunction<TParams, TRequest>,
	refetch?: boolean,
	configAxios?: AxiosRequestConfig
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiMethodFunction = (url: string, ...args: any[]) => Promise<any>;