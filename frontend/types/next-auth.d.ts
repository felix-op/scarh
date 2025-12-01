import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
	interface User {
		id: string;
		username: string;
		email: string;
		first_name: string;
		last_name: string;
		roles: string[];
		accessToken: string;
		refreshToken: string;
		accessTokenExpires: number;
	}

	interface Session {
		user: {
			roles: string[];
			accessToken: string;
			refreshToken: string;
		} & DefaultSession["user"];
	}

	interface JWT extends DefaultJWT {
        roles: string[];
        accessToken: string;
        refreshToken: string; 
        accessTokenExpires: number;
    }
}