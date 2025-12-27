import authorize from "@servicios/autenticacion/authorize";
import jwt from "@servicios/autenticacion/jwt";
import session from "@servicios/autenticacion/session";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Usuario", type: "text" },
				password: { label: "Contraseña", type: "password" },
			},
			authorize,
		}),
	],
	callbacks: {
		jwt,
		session,
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
