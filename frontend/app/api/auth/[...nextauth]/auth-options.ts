import LoginResponse from "@tipos/LoginResponse";
import { AuthOptions, JWT } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const URL = process.env.NEXT_PUBLIC_API_URL;
const LOGIN_URL = `${URL}/auth/login/`;
const REFRESH_URL = `${URL}/auth/refresh/`;

// Sincronizado con backend: 60 minutos
const ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000; // 60 minutos
const EXPIRATION_THRESHOLD = 30 * 1000; // Refrescar 30 segundos antes de expirar

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

export const authOptions: AuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Usuario", type: "text" },
				password: { label: "Contraseña", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials?.password) {
					return null;
				}

				try {
					const response = await fetch(LOGIN_URL, {
						...POST_CONFIG,
						body: JSON.stringify({
							username: credentials.username,
							password: credentials.password,
						}),
					});

					const user: LoginResponse = await response.json();

					if (response.ok && user) {
						return {
							id: user.user.id.toString(),
							username: user.user.username,
							email: user.user.email,
							first_name: user.user.first_name,
							last_name: user.user.last_name,
							is_staff: user.user.is_staff,
							is_superuser: user.user.is_superuser,
							accessToken: user.access,
							refreshToken: user.refresh,
							accessTokenExpires: Date.now() + (ACCESS_TOKEN_EXPIRY),
						} as any;
					}

					return null;
				} catch (error) {
					console.error("Error durante la autorización:", error);
					return null;
				}
			},
		}),
	],

	callbacks: {
		async jwt({ token, user, trigger }) {
			if (user) {
				return {
					...token,
					...user,
				};
			}

			const timeNow = Date.now();
			const tokenExpiry = (token.accessTokenExpires as number) || 0;
			const timeUntilExpiry = tokenExpiry - timeNow;

			if (timeUntilExpiry > EXPIRATION_THRESHOLD) {
				return token;
			}

			return refreshAccessToken(token as any);
		},
		async session({ session, token }) {
			if (token) {
				session.user = {
					id: token.id as string,
					username: token.username as string,
					email: token.email as string,
					accessToken: token.accessToken as string,
					refreshToken: token.refreshToken as string,
				} as any;
			}
			return session;
		},
	},

	pages: {
		signIn: "/auth/login",
	},

	session: {
		strategy: "jwt",
		maxAge: 60 * 60 * 24,
	},

	secret: process.env.NEXTAUTH_SECRET,
	debug: process.env.NODE_ENV === "development",
}
