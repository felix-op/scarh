import type { ParamsBase } from "@models";

export function urlConParametros<TParams extends ParamsBase>(
  baseUrl: string,
  parametros: TParams,
): string {
  let url = baseUrl;

  if (!baseUrl) {
    console.error("❌ Error: La URL base es undefined");
    return "";
  }

  const parametrosEnUrl = url.match(/{\w+}/g);

  if (parametrosEnUrl) {
    parametrosEnUrl.forEach((param) => {
      const key = param.replace(/[{}]/g, "");
      if (key === "queryParams") {
        return;
      }
      const paramValue = parametros[key];
      if (paramValue !== undefined && paramValue !== null) {
        url = url.replace(param, String(paramValue));
      } else {
        console.warn(
          `⚠️ Advertencia: Falta el parámetro '${key}' para la URL.`,
        );
      }
    });
  }

  return url;
}

export default urlConParametros;
