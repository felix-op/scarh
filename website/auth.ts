import NextAuth, { type User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import type { LoginPayload, LoginResponse, RefreshPayload, RefreshResponse } from "@models";

const API_URL = process.env.API_URL;

// Margen de seguridad: refrescar el access token 1 minuto antes de que expire.
const REFRESH_MARGIN_MS = 60_000;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
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
      throw new Error("No se pudo refrescar el token de acceso");
    }

    const refreshed: RefreshResponse = await response.json();

    return {
      ...token,
      accessToken: refreshed.access,
      refreshToken: refreshed.refresh,
      accessTokenExpires: Date.now() + refreshed.access_token_lifetime * 1000,
      error: undefined,
    };
  } catch (_error) {
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const payload: LoginPayload = {
          username: credentials.username as string,
          password: credentials.password as string,
        };

        const response = await fetch(`${API_URL}/auth/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          return null;
        }

        const data: LoginResponse = await response.json();

        return {
          id: String(data.user.id),
          usuario: data.user,
          accessToken: data.access,
          refreshToken: data.refresh,
          accessTokenExpires: Date.now() + data.access_token_lifetime * 1000,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // Primer inicio de sesión: se vuelcan los datos recibidos de Django al JWT.
      if (user) {
        const u = user as User;
        return {
          ...token,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessTokenExpires: u.accessTokenExpires,
          user: u.usuario,
        };
      }

      // El access token todavía es válido.
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - REFRESH_MARGIN_MS) {
        return token;
      }

      // Access token vencido (o por vencer): se refresca contra Django.
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.user) {
        // @ts-expect-error - NextAuth v5 forces AdapterUser type compatibility on session.user
        session.user = token.user;
      }
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
});
