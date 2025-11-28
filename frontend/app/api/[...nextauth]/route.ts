import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				refresh: token.refreshToken,
			}),
		}
	);

	const data = await res.json();

	if (res.ok && data.access) {
		token.accessToken = data.access;
	}

	return token;
}

const authOptions: AuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Django API",
			credentials: {
				username: {
					label: "Usuario",
					type: "text",
					placeholder: "nombredeusuario",
				},
				password: { label: "Contraseña", type: "password" },
			},
			async authorize(credentials, req) {
				if (
					!credentials ||
					credentials.username === "" ||
					credentials.password === ""
				) {
					return null;
				}

				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							username: credentials.username,
							password: credentials.password,
						}),
					}
				);

				const data = await res.json();

				if (res.ok && data.access) {
					return {
						id: data.user_id,
						name: credentials.username,
						accessToken: data.access,
						refreshToken: data.refresh,
					};
				}

				return null;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				console.log(
					"LOG 1: 🟢 INICIO DE SESIÓN: Usuario recibido y fusionando data."
				);
				console.log(`LOG 1: ID de usuario: ${user.id}`);
				token.accessToken = user.accessToken;
				token.refreshToken = user.refreshToken;
				token.id = user.id;
			}

			// const timeLeft = 60 * 1000;
			// const tiempo = Date.now();
			// if (tiempo < tiempo +timeLeft) {
			//     return refreshAccessToken(token);
			// }

			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.user.id = token.id;
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
