import type { NextAuthConfig, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { ROLES, puedeVer } from "@utils";
import type { RefreshPayload, RefreshResponse } from "@models";

const API_URL = process.env.API_URL;

// Margen de seguridad: refrescar el access token 1 minuto antes de que expire.
const REFRESH_MARGIN_MS = 60_000;

/**
 * Mapa de prefijos de ruta protegidos bajo `/dashboard` y el permiso requerido para acceder.
 * Se evalúa en orden, así que los prefijos más específicos deben ir antes que los más generales
 * (ej. `/dashboard/admin/usuarios` antes que `/dashboard/admin`).
 */
const RUTAS_PROTEGIDAS: { prefix: string; permiso?: string | string[] }[] = [
  { prefix: "/dashboard/admin/usuarios", permiso: ROLES.USUARIOS_VISUALIZAR },
  { prefix: "/dashboard/admin/historial", permiso: ROLES.HISTORIAL_VISUALIZAR },
  { prefix: "/dashboard/mapa", permiso: ROLES.MAPA_VISUALIZAR },
  { prefix: "/dashboard/limnigrafos", permiso: ROLES.LIMNIGRAFOS_VISUALIZAR },
  { prefix: "/dashboard/mediciones", permiso: ROLES.MEDICIONES_VISUALIZAR },
  { prefix: "/dashboard/estadisticas", permiso: ROLES.ESTADISTICAS_VISUALIZAR },
];

async function refreshAccessToken(token: JWT): Promise<JWT> {
  console.log("[Auth] Intentando refrescar token...");
  if (!token.refreshToken) {
    console.error("[Auth] No hay refreshToken disponible en el JWT.");
    return {
      ...token,
      error: "RefreshAccessTokenError" as const,
    };
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken } satisfies RefreshPayload),
    });

    if (!response.ok) {
      console.error(`[Auth] Falló el refresco de token en Django. Status HTTP: ${response.status}`);
      const text = await response.text();
      console.error(`[Auth] Detalles de la respuesta de Django:`, text);
      throw new Error("No se pudo refrescar el token de acceso");
    }

    const refreshed: RefreshResponse = await response.json();
    console.log("[Auth] Token refrescado exitosamente. Nueva vida útil:", refreshed.access_token_lifetime, "segundos");

    return {
      ...token,
      accessToken: refreshed.access,
      refreshToken: refreshed.refresh,
      accessTokenExpires: Date.now() + refreshed.access_token_lifetime * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error("[Auth] Error atrapado en refreshAccessToken:", error);
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Primer inicio de sesión: se vuelcan los datos recibidos de Django al JWT.
      if (user) {
        console.log("[Auth] Primer inicio de sesión. Guardando token.");
        const u = user as User;
        return {
          ...token,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessTokenExpires: u.accessTokenExpires,
          user: u.usuario,
        };
      }

      // Evaluar la validez del token
      if (token.accessTokenExpires) {
        const timeLeftMs = token.accessTokenExpires - Date.now();
        if (timeLeftMs > REFRESH_MARGIN_MS) {
          // El access token todavía es válido y seguro.
          return token;
        }
        console.warn(`[Auth] El token está vencido o por vencer en ${timeLeftMs} ms. Iniciando rotación...`);
      } else {
        console.warn("[Auth] El token no tiene fecha de expiración. Iniciando rotación por precaución...");
      }

      // Access token vencido (o por vencer): se refresca contra Django.
      // NOTA: este callback corre en el proxy (middleware), que SÍ puede persistir
      // la cookie de sesión. En Server Components el refresh no persistiría.
      return refreshAccessToken(token);
    },
    session({ session, token }) {
      if (token.user) {
        // @ts-expect-error - NextAuth v5 forces AdapterUser type compatibility on session.user
        session.user = token.user;
      }
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const usuario = auth?.user;
      // Si el token falló al refrescarse, lo tratamos como "deslogueado"
      const hasAuthError = (auth as any)?.error === "RefreshAccessTokenError";
      const isLoggedIn = !!usuario && !hasAuthError;

      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        const regla = RUTAS_PROTEGIDAS.find((r) => nextUrl.pathname.startsWith(r.prefix));
        if (regla && !puedeVer(usuario, regla.permiso)) {
          return Response.redirect(new URL("/no-autorizado", nextUrl));
        }

        return true;
      } else if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
