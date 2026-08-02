"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconifyIcon } from "../ui/iconify-icon";
import { useConfiguracionLocal } from "@services";

/**
 * Recarga la pantalla de inicio cada tanto y muestra hace cuánto se actualizó.
 *
 * Usa `router.refresh()` y no `fetch`: reejecuta el Server Component con el mismo
 * camino de datos, así no hay una segunda versión de la consulta que mantener
 * sincronizada. Además es una transición, así que no parpadea ni pierde el scroll.
 *
 * **Se detiene con la pestaña oculta.** Sin eso, una pestaña olvidada en segundo
 * plano le pega al backend todo el día sin que nadie mire el resultado; al volver
 * refresca de inmediato, que es cuando el dato importa.
 *
 * @property {number} generadoEn Momento en que el servidor resolvió los datos, en
 *   milisegundos. Viene de la página y no de un estado propio: al refrescar, el
 *   Server Component vuelve a renderizar y la marca llega actualizada sola, de modo
 *   que no hay dos relojes que puedan desincronizarse. Además la hora es correcta
 *   desde el primer pintado, sin esperar al primer ciclo.
 */
export interface AutoRefrescoProps {
  generadoEn: number;
}

/** Cada cuánto se recalcula el texto "hace X". No dispara peticiones. */
const TICK_MS = 15_000;

export function AutoRefresco({ generadoEn }: AutoRefrescoProps) {
  const router = useRouter();
  const { configuracion } = useConfiguracionLocal();
  const [, forzarRedibujo] = useState(0);

  const segundos = configuracion.refrescoDashboardSegundos;

  // Un tick propio para que "hace 2 min" envejezca aunque no haya refresco de datos.
  useEffect(() => {
    const id = window.setInterval(() => forzarRedibujo((n) => n + 1), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

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

  return (
    <span className="flex items-center gap-1.5 text-xs text-foreground-secondary">
      <IconifyIcon variant="restablecer" className="text-sm" />
      Actualizado {hace(generadoEn)}
      {segundos <= 0 && " · actualización automática desactivada"}
    </span>
  );
}

/** "recién", "hace 3 min", "hace 2 h". */
function hace(desde: number): string {
  const minutos = Math.floor((Date.now() - desde) / 60_000);

  if (minutos < 1) return "recién";
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  return `hace ${horas} h`;
}
