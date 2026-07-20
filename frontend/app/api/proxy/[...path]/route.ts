import { NextResponse } from "next/server";
import getToken from "./getToken";
import getUrl from "./getUrl";
import getOptions from "./getOptions";

const DJANGO_API_URL = process.env.API_URL;

const ERRORS = {
	UNAUTHORIZED: { error: "No autenticado", status: 401 },
	INVALID_PATH: { error: "Ruta de destino inválida", status: 400 },
	SERVER_ERROR: { error: "Fallo interno del servidor", status: 500 },
};

type RequestHandlerOptions = {
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	request: Request;
	context: { params: { path: string[] | undefined } };
};

async function requestHandler({
	method,
	context,
	request,
}: RequestHandlerOptions) {
	const accessToken = await getToken();

	const finalDjangoUrl = getUrl({
		baseUrl: DJANGO_API_URL,
		context,
		request,
	});

	if (!accessToken) {
		return NextResponse.json(ERRORS.UNAUTHORIZED, { status: 401 });
	}

	if (!finalDjangoUrl) {
		return NextResponse.json(ERRORS.INVALID_PATH, { status: 400 });
	}

	try {
		const options = await getOptions({ method, request, accessToken });
		const response = await fetch(finalDjangoUrl, options);
		const status = response.status;

		if (status === 204 || status === 205) {
			return new NextResponse(null, { status: status });
		}

		const responseContentType = response.headers.get("content-type") ?? "";
		if (responseContentType.includes("application/json")) {
			const data = await response.json().catch(() => ({}));
			return NextResponse.json(data, { status: status });
		}

		const headers = new Headers();
		const contentType = response.headers.get("content-type");
		const contentDisposition = response.headers.get("content-disposition");
		const contentLength = response.headers.get("content-length");

		if (contentType) headers.set("content-type", contentType);
		if (contentDisposition) headers.set("content-disposition", contentDisposition);
		if (contentLength) headers.set("content-length", contentLength);

		return new NextResponse(await response.arrayBuffer(), { status, headers });
	} catch (error) {
		console.error("Error en la llamada a Django:", error);
		return NextResponse.json(ERRORS.SERVER_ERROR, { status: 500 });
	}
}

type handlerFn = (
	request: Request,
	context: { params: { path: string[] | undefined } },
) => Promise<Response>;

export const GET: handlerFn = async (request, context) =>
	requestHandler({ method: "GET", request, context });
export const POST: handlerFn = async (request, context) =>
	requestHandler({ method: "POST", request, context });
export const PUT: handlerFn = async (request, context) =>
	requestHandler({ method: "PUT", request, context });
export const PATCH: handlerFn = async (request, context) =>
	requestHandler({ method: "PATCH", request, context });
export const DELETE: handlerFn = async (request, context) =>
	requestHandler({ method: "DELETE", request, context });
