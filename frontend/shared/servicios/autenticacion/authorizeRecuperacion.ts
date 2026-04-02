import ErrorResponse from "@tipos/ErrorResponse";
import Usuario from "@tipos/Usuario";
import axios from "axios";

type AuthorizeRecuperacionCredentials = Record<"email" | "codigo", string> | undefined;

const RECOVER_URL = `${process.env.API_URL}/auth/recuperar-password/validar`;

type LoginResponse = {
    refresh: string
    access: string
    user: Usuario
    access_token_lifetime: number
    refresh_token_lifetime: number
}

export default async function authorizeRecuperacion(credentials: AuthorizeRecuperacionCredentials) {
	if (!credentials?.email || !credentials?.codigo) {
		return null;
	}

	const payload = {
		email: credentials.email,
		codigo: credentials.codigo,
	};

	try {
        // We use POST as requested by the user for step 2: "Enviar solicitud a /auth/recuperar-password/verificar"
		const response = await axios.post(RECOVER_URL, payload);

		if (response.status < 200 || response.status >= 300) {
			const data = response.data as ErrorResponse;
			console.error("❌ Django rechazó el código de verificación:", data.descripcion_tecnica);
			throw data;
		}

		const data = response.data; // The backend only returns accessToken and refreshToken here

		// Decode the JWT to get the user_id and expiration
		const base64Url = data.accessToken.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
		const decoded = JSON.parse(jsonPayload);
		
		const expirationTime = decoded.exp * 1000;

		return {
			id: decoded.user_id?.toString() || "0",
			username: credentials.email.split('@')[0], // placeholder
			email: credentials.email,
			first_name: "Usuario",
			last_name: "Recuperación",
			roles: ["basico"], // placeholder so NextAuth doesn't crash
			accessToken: data.accessToken,
			refreshToken: data.refreshToken,
			accessTokenExpires: expirationTime,
		};
	} catch (error) {
		console.error("Error durante la autorización de recuperación:", error);
		if (axios.isAxiosError(error) && error.response) {
             throw new Error(error.response.data?.descripcion_tecnica || "Código inválido o expirado");
        }
		throw error;
	}
}
