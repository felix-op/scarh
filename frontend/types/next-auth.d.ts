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
	error?: "RefreshAccessTokenError";
	user: {
		id: string;
            username: string;
			first_name: string;
			last_name: string;
			email: string;
			roles: string[];
			accessToken: string;
			refreshToken: string;
			accessTokenExpires: number,
	} & DefaultSession["user"];
	}
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
        roles: string[];
        accessToken: string;
        refreshToken: string; 
        accessTokenExpires: number;
        error?: "RefreshAccessTokenError";
    }
}
