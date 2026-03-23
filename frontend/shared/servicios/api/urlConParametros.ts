import { ParamsBase } from "./types";

export default function urlConParametros<TParams extends ParamsBase>(
	baseUrl: string,
	parametros: TParams,
) {
	let url = baseUrl;

	if (!baseUrl) {
		console.error("❌ Error: La URL base es undefined");
		return "";
	}

	const parametrosEnUrl = url.match(/{\w+}/g);

	if (!!parametrosEnUrl) {
		parametrosEnUrl.forEach((param) => {
			const key = param.replace(/[{}]/g, "");
			if (key === "queryParams") {
				return;
			}
			const paramValue = parametros[key];
			if (typeof paramValue === "string") {
				url = url.replace(param, paramValue);
			} else {
				console.warn(
					`⚠️ Advertencia: Falta el parámetro '${key}' para la URL.`,
				);
			}
		});
	}

	return url;
}
