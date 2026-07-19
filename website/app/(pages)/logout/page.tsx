"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    // Al cargar esta página, se limpia la sesión del lado del cliente (borra cookies)
    // y redirige limpiamente al login.
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-semibold animate-pulse text-foreground-secondary">
        Cerrando sesión expirada...
      </p>
    </div>
  );
}
