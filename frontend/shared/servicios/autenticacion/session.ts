import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

type SessionOptions = {
	session: Session
	token: JWT
}

export default async function session({ session, token }: SessionOptions) {
	if (token) {
		session.user = {
			id: token.id,
			username: token.username,
			email: token.email,
			roles: token.roles,
			accessToken: token.accessToken,
			refreshToken: token.refreshToken,
			accessTokenExpires: token.accessTokenExpires
		};
		session.error = token.error;
	}
	return session;
}