import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import type { LoginPayload, LoginResponse } from "@models";

const API_URL = process.env.API_URL;

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
});
