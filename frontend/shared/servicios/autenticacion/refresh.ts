import ErrorResponse from "@tipos/ErrorResponse";
import axios from "axios";
import { JWT } from "next-auth/jwt";

type RefreshPost = {
	refresh: string
}

type RefreshData = {
	refresh: string
	access: string
	refresh_token_lifetime: number
	access_token_lifetime: number
}

const REFRESH_URL = `${process.env.API_URL}/auth/refresh/`;

export default async function refresh(token: JWT): Promise<JWT> {
	console.log("🚀 Iniciando petición de refresco para:", token.username);
	
	const payload: RefreshPost = {
		refresh: token.refreshToken
	};

	try {
		const response = await axios.post(REFRESH_URL, payload);

		if (response.status<200 && response.status>=300) {
			const data = response.data as ErrorResponse;
			console.error("❌ Django rechazó el refresh:", data.descripcion_tecnica);
			throw data;
		}

		const data = response.data as RefreshData;
		console.log("✅ Token refrescado con éxito");
		
		return {
			...token,
			accessToken: data.access,
			refreshToken: data.refresh ?? token.refreshToken,
			accessTokenExpires: Date.now() + (data.access_token_lifetime * 1000),
			error: undefined,
		};
	} catch (_) {
		console.error("💥 Error en la operación de refresco");
		return { ...token, error: "RefreshAccessTokenError" };
	}
}