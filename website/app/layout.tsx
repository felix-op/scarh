import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider, QueryProvider, MensajesProvider, THEME_COOKIE } from "@services";
import "@styles/globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SCARH - Control de Limnígrafos",
  description: "Sistema para el control de limnígrafos. Acceso exclusivo para personal autorizado.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="es"
      className={`${outfit.variable} h-full antialiased ${theme}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <MensajesProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </MensajesProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
