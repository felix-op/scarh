import axios, { AxiosRequestConfig } from "axios";
import { ApiMethodFunction } from "./types";

interface ApiMethods {
	[key: string]: ApiMethodFunction;

	get: ApiMethodFunction;
	post: ApiMethodFunction;
	put: ApiMethodFunction;
	patch: ApiMethodFunction;
	delete: ApiMethodFunction;
}

export const api: ApiMethods = {
	get: (url: string, config: AxiosRequestConfig = {}) =>
		axios.get(url, { ...config, withCredentials: true }),
	post: (url: string, data?: unknown, config: AxiosRequestConfig = {}) =>
		axios.post(url, data, { ...config, withCredentials: true }),
	put: (url: string, data?: unknown, config: AxiosRequestConfig = {}) =>
		axios.put(url, data, { ...config, withCredentials: true }),
	patch: (url: string, data?: unknown, config: AxiosRequestConfig = {}) =>
		axios.patch(url, data, { ...config, withCredentials: true }),
	delete: (url: string, config: AxiosRequestConfig = {}) =>
		axios.delete(url, { ...config, withCredentials: true }),
};
