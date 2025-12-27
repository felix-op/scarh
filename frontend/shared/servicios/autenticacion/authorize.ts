import ErrorResponse from "@tipos/ErrorResponse";
import Usuario from "@tipos/Usuario";
import axios from "axios";

type AuthorizeCredentials = Record<"username" | "password", string> | undefined

const LOGIN_URL = `${process.env.API_URL}/auth/login/`;

type LoginCredentials = {
	username: string
    password: string
}

type LoginResponse = {
    refresh: string
    access: string
    user: Usuario
    access_token_lifetime: number
    refresh_token_lifetime: number
}

export default async function authorize(credentials: AuthorizeCredentials) {
	if (!credentials?.username || !credentials?.password) {
		return null;
	}

	const payload: LoginCredentials = {
		username: credentials.username,
		password: credentials.password,
	};

	try {
		const response = await axios.post(LOGIN_URL, payload);

		if (response.status<200 && response.status>=300) {
			const data = response.data as ErrorResponse;
			console.error("❌ Django rechazó el login:", data.descripcion_tecnica);
			throw data;
		}

		const data = response.data as LoginResponse;

		const roles: string[] = [];
		if (data.user.is_staff) roles.push("staff");
		if (data.user.is_superuser) roles.push("admin");

		return {
			id: data.user.id.toString(),
			username: data.user.username,
			email: data.user.email,
			first_name: data.user.first_name,
			last_name: data.user.last_name,
			roles,
			accessToken: data.access,
			refreshToken: data.refresh,
			accessTokenExpires: Date.now() + (data.access_token_lifetime * 1000),
		};
	} catch (error) {
		console.error("Error durante la autorización:", error);
		return null;
	}
}