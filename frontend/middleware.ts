import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	function middleware(req) {
		const token = req.nextauth.token;
		
		if (token?.error === "RefreshAccessTokenError") {
			return NextResponse.redirect(new URL("/auth/login", req.url));
		}
	},
	{
		callbacks: {
			authorized: ({ token }) =>!!token,
		},
		pages: {
			signIn: "/auth/login",
		},
	}
);

export const config = {
	matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"],
}