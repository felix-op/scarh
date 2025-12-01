import LoginResponse from "@tipos/LoginResponse";
import NextAuth, { JWT } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const URL = process.env.NEXT_PUBLIC_API_URL;
const LOGIN_URL = `${URL}/auth/login/`;
const REFRESH_URL = `${URL}/auth/refresh/`;
// const LOGOUT_URL = `${URL}/auth/logout`;

const ACCESS_TOKEN_EXPIRY = 30 * 1000; // 30 segundos
const EXPIRATION_THRESHOLD = 10 * 1000; // 10 segundos antes

const POST_CONFIG = {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
}

async function refreshAccessToken(token: JWT) {
	console.log("Intentando refrescar token de acceso para el usuario:", token.username);
	try {
		const response = await fetch(REFRESH_URL, {
			...POST_CONFIG,
			body: JSON.stringify({ refresh: token.refreshToken }), 
		});

		const refreshedData = await response.json();

		if (!response.ok) {
			console.error("Fallo de la API al refrescar token:", response.status, refreshedData);
			throw refreshedData;
		}

		console.log("Token refrescado con éxito para el usuario:", token.username);

		return {
			...token,
			refreshToken: refreshedData.refresh ?? token.refreshToken,
			accessTokenExpires: Date.now() + (ACCESS_TOKEN_EXPIRY),
		};
	} catch (error) {
		console.error("Error al refrescar token de acceso: Fallo de red o excepción", error);
		return { ...token, error: "RefreshAccessTokenError" };
	}
}

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				username: { label: "username", type: "text", placeholder: "nombredeusuario" },
				password: { label: "password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials || !credentials.username || !credentials.password) {
					console.log("Intento de login fallido: Credenciales incompletas");
					return null;
				}

				console.log("Intentando login para el usuario:", credentials.username);

				try {
					const response = await fetch(LOGIN_URL, {
						...POST_CONFIG,
						body: JSON.stringify(credentials),
					});

					if (!response.ok) {
						const errorData = await response.json();
						console.error("Error en el login: Credenciales incorrectas o API status", response.status, errorData);
						return null;
					}

					const data: LoginResponse = await response.json();
					
					if (data?.user && data.access && data.refresh) {
						console.log("Login exitoso para el usuario:", data.user.username);
						return {
							id: String(data.user.id),
							name: data.user.first_name + " " + data.user.last_name,
							username: data.user.username,
							email: data.user.email,
							first_name: data.user.first_name,
							last_name: data.user.last_name,
							roles: [
								data.user.is_staff ? "staff" : "",
								data.user.is_superuser ? "admin" : "",
							].filter(Boolean),
							accessToken: data.access,
							refreshToken: data.refresh,
							accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRY,
						}
					}

					console.error("Login fallido: Datos de respuesta de Django incompletos");
					return null;
				} catch (error) {	
					console.error("Error en el login: Fallo de red o excepción", error);
					return null;
				}
			}
		}),
	],
	pages: {
		signIn: "/auth/login",
	},
	callbacks: {
		async jwt({ token, user }) {
			const miToken = token as JWT;

			if (user) {
				console.log("Callback JWT: Creando token inicial para el usuario:", user.username);
				return { 
					...token,
					...user,
				};
			}

			if (Date.now() < miToken.accessTokenExpires - EXPIRATION_THRESHOLD) {
				console.log("Callback JWT: Token aún válido para:", miToken.username);
				return token;
			}

			console.log("Callback JWT: Token expirado, iniciando proceso de refresco para:", miToken.username);
			return refreshAccessToken(miToken);
		},
		
		async session({ session, token }) {
			const { roles, accessToken, refreshToken } = token as JWT;

			session.user.roles = roles;
			session.user.accessToken = accessToken;
			session.user.refreshToken = refreshToken;

			return session;
		},
	},
});

export { handler as GET, handler as POST };
