"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import AuthProvider from "./AuthProvider";
import NotificacionesProvider from "./NotificacionesProvider";
import QueryProvider from "./QueryProvider";

type ProvidersProps = {
    children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
	return (
		<AuthProvider>
			<QueryProvider>
				<ThemeProvider attribute="class" defaultTheme="system">
					<NotificacionesProvider>
						{children}
					</NotificacionesProvider>
				</ThemeProvider>
			</QueryProvider>
		</AuthProvider>
	);
}
