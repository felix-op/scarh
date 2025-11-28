import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: any
    user: {
      id?: any
    } & DefaultSession["user"]
  }

  interface User {
    accessToken?: any
    refreshToken?: any
    id?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: any
    refreshToken?: any
    id?: any
  }
}
