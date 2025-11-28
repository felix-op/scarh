"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import AuthProvider from "./AuthProvider";

type ProvidersProps = {
    children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
	return (
		<AuthProvider>
			<ThemeProvider attribute="class" defaultTheme="system">
				{children}
			</ThemeProvider>
		</AuthProvider>
	);
}
