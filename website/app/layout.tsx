import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider, QueryProvider } from "@services";
import "@styles/globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SCARH - Control de Limnígrafos",
  description: "Sistema para el control de limnígrafos. Acceso exclusivo para personal autorizado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
