import type { NextAuthConfig } from "next-auth";
import { ROLES, puedeVer } from "@utils";

/**
 * Mapa de prefijos de ruta protegidos bajo `/dashboard` y el permiso requerido para acceder.
 * Se evalúa en orden, así que los prefijos más específicos deben ir antes que los más generales
 * (ej. `/dashboard/admin/usuarios` antes que `/dashboard/admin`).
 */
const RUTAS_PROTEGIDAS: { prefix: string; permiso?: string | string[] }[] = [
  { prefix: "/dashboard/admin/usuarios", permiso: ROLES.USUARIOS_VISUALIZAR },
  { prefix: "/dashboard/admin/historial", permiso: ROLES.HISTORIAL_VISUALIZAR },
  { prefix: "/dashboard/admin/documentacion", permiso: ROLES.ADMINISTRACION },
  {
    prefix: "/dashboard/admin",
    permiso: [ROLES.USUARIOS_VISUALIZAR, ROLES.HISTORIAL_VISUALIZAR, ROLES.ADMINISTRACION],
  },
  { prefix: "/dashboard/mapa", permiso: ROLES.MAPA_VISUALIZAR },
  { prefix: "/dashboard/limnigrafos", permiso: ROLES.LIMNIGRAFOS_VISUALIZAR },
  { prefix: "/dashboard/mediciones", permiso: ROLES.MEDICIONES_VISUALIZAR },
  { prefix: "/dashboard/estadisticas", permiso: ROLES.ESTADISTICAS_VISUALIZAR },
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      if (token.user) {
        // @ts-expect-error - NextAuth v5 forces AdapterUser type compatibility on session.user
        session.user = token.user;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const usuario = auth?.user;
      const isLoggedIn = !!usuario;
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
