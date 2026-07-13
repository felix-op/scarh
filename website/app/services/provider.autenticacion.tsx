"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import type { Usuario } from "@models";

// Cada cuánto (en segundos) el cliente revisa la sesión y dispara el refresh
// proactivo del access token en el callback `jwt` de auth.ts. Es independiente
// de la duración real del token, que Django informa dinámicamente en cada login/refresh.
const REFETCH_INTERVAL = Number(process.env.NEXT_PUBLIC_AUTH_REFRESH_INTERVAL) || 300;

interface AutenticacionContextState {
  usuario: Usuario;
}

const AutenticacionContext = createContext<AutenticacionContextState | undefined>(undefined);

function AutenticacionWatcher({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ redirectTo: "/login" });
    }
  }, [session?.error]);

  if (!session?.user) {
    return null;
  }

  return (
    <AutenticacionContext.Provider value={{ usuario: session.user }}>
      {children}
    </AutenticacionContext.Provider>
  );
}

export function AutenticacionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  return (
    <SessionProvider session={session} refetchInterval={REFETCH_INTERVAL} refetchOnWindowFocus>
      <AutenticacionWatcher>{children}</AutenticacionWatcher>
    </SessionProvider>
  );
}

export function useAutenticacion() {
  const context = useContext(AutenticacionContext);
  if (context === undefined) {
    throw new Error("useAutenticacion debe ser usado dentro de un AutenticacionProvider");
  }
  return context;
}

export default AutenticacionProvider;
