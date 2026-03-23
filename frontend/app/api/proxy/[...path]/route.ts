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

export async function RequestHandler({
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

		const data = await response.json().catch(() => ({}));
		return NextResponse.json(data, { status: status });
	} catch (error) {
		console.error("Error en la llamada a Django:", error);
		return NextResponse.json(ERRORS.SERVER_ERROR, { status: 500 });
	}
}

type handlerFn = (
	request: Request,
	context: { params: { path: string[] | undefined } },
) => Promise<NextResponse<unknown>>;

export const GET: handlerFn = async (request, context) =>
	RequestHandler({ method: "GET", request, context });
export const POST: handlerFn = async (request, context) =>
	RequestHandler({ method: "POST", request, context });
export const PUT: handlerFn = async (request, context) =>
	RequestHandler({ method: "PUT", request, context });
export const PATCH: handlerFn = async (request, context) =>
	RequestHandler({ method: "PATCH", request, context });
export const DELETE: handlerFn = async (request, context) =>
	RequestHandler({ method: "DELETE", request, context });
