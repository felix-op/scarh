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
			first_name: token.first_name,
			last_name: token.last_name,
			roles: token.roles,
			is_superuser: token.is_superuser,
			is_staff: token.is_staff,
			accessToken: token.accessToken,
			refreshToken: token.refreshToken,
			accessTokenExpires: token.accessTokenExpires
		};
		session.error = token.error;
	}
	return session;
}
