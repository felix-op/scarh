import { User } from "next-auth";
import { JWT } from "next-auth/jwt";
import refresh from "./refresh";

type jwtOptions = {
    token: JWT
    user: User
}

const REFRESH_THRESHOLD = Number(process.env.AUTH_REFRESH_THRESHOLD) || 30000;

export default async function jwt({ token, user }: jwtOptions) {
	if (user) {
		return {
			...token,
			...user,
		};
	}

	const tokenExpiry = (token.accessTokenExpires) || 0;
	const timeUntilExpiry = tokenExpiry - Date.now();

	if (timeUntilExpiry > REFRESH_THRESHOLD) {
		return token;
	}

	return refresh(token);
}