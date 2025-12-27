"use client";
import { useSession, signOut } from "next-auth/react";
import { ReactNode, useEffect } from "react";

type AuthGuardProps = {
	children: ReactNode
}

const CHECK_INTERVAL = Number(process.env.NEXT_PUBLIC_AUTH_CHECK_INTERVAL) || 10000;

export default function AuthGuard({ children }: AuthGuardProps) {
	const { data: session, status } = useSession();

	useEffect(() => {
		if (status === "loading") return;

		const checkAuth = () => {
			// 1. Reacción por error explícito (viene del callback JWT)
			if (session?.error === "RefreshAccessTokenError") {
				console.log("Sesión inválida por error de refresh");
				signOut({ callbackUrl: "/auth/login" });
				return;
			}

			// 2. Reacción por expiración de tiempo proactiva
			const now = Date.now();
			if (session?.user?.accessTokenExpires && now > session.user.accessTokenExpires) {
				console.log("Sesión expirada por tiempo");
				signOut({ callbackUrl: "/auth/login" });
				return;
			}

			// 3. Si no hay sesión directamente
			if (status === "unauthenticated") {
				window.location.href = "/auth/login";
			}
		};

		checkAuth();
		const interval = setInterval(checkAuth, CHECK_INTERVAL);
		
		return () => clearInterval(interval);
	}, [session, status]);

	return <>{children}</>;
}