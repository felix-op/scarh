type GetFetchOptions = {
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	request: Request;
	accessToken?: string;
};

export default async function getOptions({
	method,
	accessToken,
	request,
}: GetFetchOptions): Promise<RequestInit> {
	// 0. Inicialización de headers
	const headersToSend: HeadersInit = {};
	let bodyToSend: BodyInit | null = null;

	// 1. Manejo de Token
	if (accessToken) {
		headersToSend["Authorization"] = `Bearer ${accessToken}`;
	}

	// 2. Se optiene el content-type
	const clientHeaders = request.headers;
	const clientContentType = clientHeaders.get("content-type");
	const esMultipart = clientContentType?.includes("multipart/form-data") ?? false;

	// 3. Se adjunta body si no es GET o DELETE
	const shouldHaveBody = !["GET", "DELETE"].includes(method);
	if (shouldHaveBody) {
		if (esMultipart) {
			// Se reenvía el FormData tal cual; fetch genera su propio boundary,
			// por lo que no debe fijarse manualmente el header Content-Type.
			bodyToSend = await request.formData().catch(() => null);
		} else {
			const clientBody = await request.json().catch(() => null);
			bodyToSend = clientBody ? JSON.stringify(clientBody) : null;
		}
	}

	if (!esMultipart) {
		if (clientContentType) {
			headersToSend["Content-Type"] = clientContentType;
		} else if (bodyToSend) {
			// Si hay cuerpo pero no se especificó Content-Type, asumimos JSON
			headersToSend["Content-Type"] = "application/json";
		}
	}

	return {
		method,
		headers: headersToSend,
		cache: "no-store",
		body: bodyToSend
	};
}
