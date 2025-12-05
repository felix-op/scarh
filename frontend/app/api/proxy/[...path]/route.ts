import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '../../auth/[...nextauth]/auth-options';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
	request: Request,
	context: { params: { path: string[] | undefined } }
) {
	const { params: paramsPromise } = context;
	const session = await getServerSession(authOptions); 
	const accessToken = session?.user?.accessToken;

	const params = await paramsPromise;

	if (!accessToken) {
		return NextResponse.json({ error: "No autenticado" }, { status: 401 });
	}

	if (params.path === undefined) {
		return NextResponse.json({ error: "No hay nada aquí" }, { status: 400 });
	}	

	const djangoPath = params.path.join('/');
	const url = new URL(request.url);
	const searchParams = url.search; 
	const finalDjangoUrl = `${DJANGO_API_URL}/${djangoPath}${searchParams}`;

	try {
		const response = await fetch(finalDjangoUrl, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			cache: 'no-store', 
		});

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });

	} catch (error) {
		console.error("Error en la llamada a Django:", error);
		return NextResponse.json({ error: "Fallo interno del servidor" }, { status: 500 });
	}
}

export async function POST(
	request: Request,
	context: { params: { path: string[] | undefined } }
) {
	// 1. Manejo de la sesión (Seguridad)
	const session = await getServerSession(authOptions); 
	const accessToken = session?.user?.accessToken;
	const { params: paramsPromise } = context;

	if (!accessToken) {
		return NextResponse.json({ error: "No autenticado" }, { status: 401 });
	}

	// 2. Manejo de la ruta y URL
	const params = await paramsPromise;
	const djangoPath = params.path ? params.path.join('/') : '';

	console.log("Que esta pasando: ", djangoPath);
	

	if (!djangoPath) {
		// TODO: devolver 404 o 400 si la URL del endpoint de Django es requerida
		return NextResponse.json({ error: "Ruta de destino inválida" }, { status: 400 });
	}

	const url = new URL(request.url);
	const searchParams = url.search; 
	const finalDjangoUrl = `${DJANGO_API_URL}/${djangoPath}/${searchParams}`;

	// 3. Obtener el cuerpo de la petición del cliente
	const clientBody = await request.json().catch(() => null); 

	const bodyToSend = clientBody ? JSON.stringify(clientBody) : null; 

	// 4. Gestión de Cabeceras (Content-Type)

	// Obtener las cabeceras originales de la petición del cliente
	const clientHeaders = request.headers;

	// Iniciar las cabeceras para Django con la autorización
	const headersToSend: HeadersInit = {
		'Authorization': `Bearer ${accessToken}`,
	};

	// Copiar Content-Type si existe en el cliente, si no, lo dejamos sin definir (o definir como JSON si enviamos bodyToSend)
	const clientContentType = clientHeaders.get('content-type');

	if (clientContentType) {
		headersToSend['Content-Type'] = clientContentType;
	} else if (bodyToSend) {
		// Si hay cuerpo pero no se especificó Content-Type, asumimos JSON
		headersToSend['Content-Type'] = 'application/json';
	}


	// 5. Realizar la petición Server-to-Server a Django
	try {
		const response = await fetch(finalDjangoUrl, {
			method: 'POST',
			headers: headersToSend, // Usamos las cabeceras construidas
			cache: 'no-store',
			body: bodyToSend, // Usamos el cuerpo serializado
		});

		// 6. Reenviar la respuesta a TanStack Query
		const data = await response.json().catch(() => ({}));
		return NextResponse.json(data, { status: response.status });

	} catch (error) {
		console.error("Error en la llamada a Django:", error);
		return NextResponse.json({ error: "Fallo interno del servidor" }, { status: 500 });
	}
}

export async function PUT(
	request: Request,
	context: { params: { path: string[] | undefined } }
) {
	// 1. Manejo de la sesión (Seguridad)
	const session = await getServerSession(authOptions); 
	const accessToken = session?.user?.accessToken;
	const { params: paramsPromise } = context;

	if (!accessToken) {
		return NextResponse.json({ error: "No autenticado" }, { status: 401 });
	}

	// 2. Manejo de la ruta y URL
	const params = await paramsPromise;
	const djangoPath = params.path ? params.path.join('/') : '';

	console.log("Que esta pasando: ", djangoPath);
	

	if (!djangoPath) {
		// TODO: devolver 404 o 400 si la URL del endpoint de Django es requerida
		return NextResponse.json({ error: "Ruta de destino inválida" }, { status: 400 });
	}

	const url = new URL(request.url);
	const searchParams = url.search; 
	const finalDjangoUrl = `${DJANGO_API_URL}/${djangoPath}/${searchParams}`;

	// 3. Obtener el cuerpo de la petición del cliente
	const clientBody = await request.json().catch(() => null); 

	const bodyToSend = clientBody ? JSON.stringify(clientBody) : null; 

	// 4. Gestión de Cabeceras (Content-Type)

	// Obtener las cabeceras originales de la petición del cliente
	const clientHeaders = request.headers;

	// Iniciar las cabeceras para Django con la autorización
	const headersToSend: HeadersInit = {
		'Authorization': `Bearer ${accessToken}`,
	};

	// Copiar Content-Type si existe en el cliente, si no, lo dejamos sin definir (o definir como JSON si enviamos bodyToSend)
	const clientContentType = clientHeaders.get('content-type');

	if (clientContentType) {
		headersToSend['Content-Type'] = clientContentType;
	} else if (bodyToSend) {
		// Si hay cuerpo pero no se especificó Content-Type, asumimos JSON
		headersToSend['Content-Type'] = 'application/json';
	}


	// 5. Realizar la petición Server-to-Server a Django
	try {
		const response = await fetch(finalDjangoUrl, {
			method: 'PUT',
			headers: headersToSend, // Usamos las cabeceras construidas
			cache: 'no-store',
			body: bodyToSend, // Usamos el cuerpo serializado
		});

		// 6. Reenviar la respuesta a TanStack Query
		const data = await response.json().catch(() => ({}));
		return NextResponse.json(data, { status: response.status });

	} catch (error) {
		console.error("Error en la llamada a Django:", error);
		return NextResponse.json({ error: "Fallo interno del servidor" }, { status: 500 });
	}
}

export async function PATCH(
	request: Request,
	context: { params: { path: string[] | undefined } }
) {
	// 1. Manejo de la sesión (Seguridad)
	const session = await getServerSession(authOptions); 
	const accessToken = session?.user?.accessToken;
	const { params: paramsPromise } = context;

	if (!accessToken) {
		return NextResponse.json({ error: "No autenticado" }, { status: 401 });
	}

	// 2. Manejo de la ruta y URL
	const params = await paramsPromise;
	const djangoPath = params.path ? params.path.join('/') : '';

	console.log("Que esta pasando: ", djangoPath);
	

	if (!djangoPath) {
		// TODO: devolver 404 o 400 si la URL del endpoint de Django es requerida
		return NextResponse.json({ error: "Ruta de destino inválida" }, { status: 400 });
	}

	const url = new URL(request.url);
	const searchParams = url.search; 
	const finalDjangoUrl = `${DJANGO_API_URL}/${djangoPath}/${searchParams}`;

	// 3. Obtener el cuerpo de la petición del cliente
	const clientBody = await request.json().catch(() => null); 

	const bodyToSend = clientBody ? JSON.stringify(clientBody) : null; 

	// 4. Gestión de Cabeceras (Content-Type)

	// Obtener las cabeceras originales de la petición del cliente
	const clientHeaders = request.headers;

	// Iniciar las cabeceras para Django con la autorización
	const headersToSend: HeadersInit = {
		'Authorization': `Bearer ${accessToken}`,
	};

	// Copiar Content-Type si existe en el cliente, si no, lo dejamos sin definir (o definir como JSON si enviamos bodyToSend)
	const clientContentType = clientHeaders.get('content-type');

	if (clientContentType) {
		headersToSend['Content-Type'] = clientContentType;
	} else if (bodyToSend) {
		// Si hay cuerpo pero no se especificó Content-Type, asumimos JSON
		headersToSend['Content-Type'] = 'application/json';
	}


	// 5. Realizar la petición Server-to-Server a Django
	try {
		const response = await fetch(finalDjangoUrl, {
			method: 'PATCH',
			headers: headersToSend, // Usamos las cabeceras construidas
			cache: 'no-store',
			body: bodyToSend, // Usamos el cuerpo serializado
		});

		// 6. Reenviar la respuesta a TanStack Query
		const data = await response.json().catch(() => ({}));
		return NextResponse.json(data, { status: response.status });

	} catch (error) {
		console.error("Error en la llamada a Django:", error);
		return NextResponse.json({ error: "Fallo interno del servidor" }, { status: 500 });
	}
}

export async function DELETE(
	request: Request,
	context: { params: { path: string[] | undefined } }
) {
	// 1. Manejo de la sesión (Seguridad)
	const session = await getServerSession(authOptions); 
	const accessToken = session?.user?.accessToken;
	const { params: paramsPromise } = context;

	if (!accessToken) {
		return NextResponse.json({ error: "No autenticado" }, { status: 401 });
	}

	// 2. Manejo de la ruta y URL
	const params = await paramsPromise;
	const djangoPath = params.path ? params.path.join('/') : '';

	console.log("Que esta pasando: ", djangoPath);
	

	if (!djangoPath) {
		// TODO: devolver 404 o 400 si la URL del endpoint de Django es requerida
		return NextResponse.json({ error: "Ruta de destino inválida" }, { status: 400 });
	}

	const url = new URL(request.url);
	const searchParams = url.search; 
	const finalDjangoUrl = `${DJANGO_API_URL}/${djangoPath}/${searchParams}`;

	// 3. Iniciar las cabeceras para Django con la autorización
	const headersToSend: HeadersInit = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${accessToken}`,
	};

	// 4. Realizar la petición Server-to-Server a Django
	try {
		const response = await fetch(finalDjangoUrl, {
			method: 'DELETE',
			headers: headersToSend,
			cache: 'no-store',
		});

		const status = response.status;

		if (status === 204 || status === 205) {
			return new NextResponse(null, { status: status }); 
		}

		const data = await response.json().catch(() => ({}));
		
		// Devolvemos la respuesta con los datos y el estado original
		return NextResponse.json(data, { status: status });

	} catch (error) {
		console.error("Error en la llamada a Django:", error);
		return NextResponse.json({ error: "Fallo interno del servidor" }, { status: 500 });
	}
}