"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import LoginProvider from "./LoginProvider";

type ProvidersProps = {
    children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
	return (
		<LoginProvider>
			<ThemeProvider attribute="class" defaultTheme="system">
				{children}
			</ThemeProvider>
		</LoginProvider>
	);
}
