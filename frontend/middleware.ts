import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PERMISSION_MAP: Record<string, string> = {
	"/usuarios": "usuarios-visualizar",
	"/limnigrafos": "limnigrafos-visualizar",
	"/mediciones": "mediciones-visualizar",
	"/historial": "historial-visualizar",
	"/mapa": "mapa-visualizar",
	"/estadisticas": "estadisticas-visualizar",
	"/ubicaciones": "ubicaciones-visualizar",
};

export default withAuth(
	function middleware(req) {
		const token = req.nextauth.token;

		if (token?.error === "RefreshAccessTokenError") {
			return NextResponse.redirect(new URL("/auth/login", req.url));
		}

		const { pathname } = req.nextUrl;
		const roles = token?.roles ?? [];

		// Buscamos si la ruta actual requiere algún permiso específico
		// Comprobamos si el pathname coincide exactamente o es una subruta
		const restrictedRoute = Object.keys(PERMISSION_MAP).find(
			(route) => pathname === route || pathname.startsWith(`${route}/`)
		);

		if (restrictedRoute) {
			const requiredPermission = PERMISSION_MAP[restrictedRoute];
			const isSuperuser = token?.is_superuser === true;
			const isStaff = token?.is_staff === true;
			const hasRolePermission = roles.includes(requiredPermission) || roles.includes("administracion");

			// Superusuarios tienen acceso total
			// Staff tiene acceso a rutas de visualización general
			const hasPermission = isSuperuser || hasRolePermission || (isStaff && requiredPermission.endsWith("-visualizar"));

			if (!hasPermission) {
				// Si no tiene permiso, lanzamos un 404 (mediante rewrite) para ocultar la página
				return NextResponse.rewrite(new URL("/404", req.url));
			}
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token }) => !!token,
		},
		pages: {
			signIn: "/auth/login",
		},
	}
);

export const config = {
	matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|auth/login|auth/recuperar-password).*)"],
}