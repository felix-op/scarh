import { Providers } from "@componentes/providers/Providers";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "SCARH",
	description: "Sistema de Control y Análisis de Recursos Hídricos",
};

export default function RootLayout({
	children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	return (
		<html lang="es" suppressHydrationWarning className="w-full h-full">
			<body
				className={`${outfit.variable} font-outfit antialiased w-full h-full`}
			>
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}
