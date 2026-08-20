"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConfiguracionLocal } from "@services";

/**
 * Recarga la pantalla de inicio cada tanto.
 *
 * Usa `router.refresh()` y no `fetch`: reejecuta el Server Component con el mismo
 * camino de datos, así no hay una segunda versión de la consulta que mantener
 * sincronizada. Además es una transición, así que no parpadea ni pierde el scroll.
 *
 * **Se detiene con la pestaña oculta.** Sin eso, una pestaña olvidada en segundo
 * plano le pega al backend todo el día sin que nadie mire el resultado; al volver
 * refresca de inmediato, que es cuando el dato importa.
 *
 */
export function AutoRefresco() {
  const router = useRouter();
  const { configuracion } = useConfiguracionLocal();

  const segundos = configuracion.refrescoDashboardSegundos;

  useEffect(() => {
    if (segundos <= 0) return;

    const refrescar = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    const id = window.setInterval(refrescar, segundos * 1000);
    document.addEventListener("visibilitychange", refrescar);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", refrescar);
    };
  }, [segundos, router]);

  return null;
}
