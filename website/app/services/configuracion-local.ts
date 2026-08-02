"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Preferencias de visualización del usuario, guardadas en el navegador.
 *
 * Van en `localStorage` y no en el backend porque son de **este** dispositivo: cada
 * cuánto refrescar depende de si la pantalla está en un monitor de sala o en el
 * celular de alguien con datos móviles, no de quién es el usuario.
 *
 * @property {number} refrescoDashboardSegundos Cada cuánto se recarga el tablero.
 *   `0` desactiva el refresco automático.
 */
export interface ConfiguracionLocal {
  refrescoDashboardSegundos: number;
}

export const CONFIGURACION_POR_DEFECTO: ConfiguracionLocal = {
  refrescoDashboardSegundos: 30,
};

/**
 * Opciones del selector de refresco.
 *
 * Los sensores reportan cada varios minutos, así que refrescar más seguido que eso
 * son peticiones que devuelven lo mismo. Se ofrecen intervalos cortos igual porque
 * el tablero también muestra actividad del sistema, que sí cambia cuando alguien
 * está operando.
 */
export const OPCIONES_REFRESCO: { value: string; label: string }[] = [
  { value: "0", label: "Desactivado" },
  { value: "10", label: "Cada 10 segundos" },
  { value: "30", label: "Cada 30 segundos" },
  { value: "60", label: "Cada minuto" },
  { value: "300", label: "Cada 5 minutos" },
];

const CLAVE = "scarh:configuracion";

/**
 * Evento propio para notificar cambios hechos en esta misma pestaña: el navegador
 * dispara `storage` en las **otras**, nunca en la que escribe.
 */
const EVENTO_CAMBIO = "scarh:configuracion-cambio";

/**
 * Última lectura, cacheada por el string crudo.
 *
 * `useSyncExternalStore` compara instantáneas con `Object.is`, así que devolver un
 * objeto nuevo en cada llamada lo haría re-renderizar sin fin. Se reparsea sólo
 * cuando el contenido de `localStorage` cambió de verdad.
 */
let crudoCacheado: string | null | undefined;
let valorCacheado: ConfiguracionLocal = CONFIGURACION_POR_DEFECTO;

function parsear(crudo: string | null): ConfiguracionLocal {
  if (!crudo) return CONFIGURACION_POR_DEFECTO;

  try {
    const guardado = JSON.parse(crudo) as Partial<ConfiguracionLocal>;
    return { ...CONFIGURACION_POR_DEFECTO, ...guardado };
  } catch {
    // Un JSON corrupto no puede tumbar la pantalla: se cae a los valores por
    // defecto, que siempre son utilizables.
    return CONFIGURACION_POR_DEFECTO;
  }
}

function instantanea(): ConfiguracionLocal {
  let crudo: string | null = null;
  try {
    crudo = window.localStorage.getItem(CLAVE);
  } catch {
    // Almacenamiento bloqueado (modo privado, permisos): se usa el default.
    return CONFIGURACION_POR_DEFECTO;
  }

  if (crudo !== crudoCacheado) {
    crudoCacheado = crudo;
    valorCacheado = parsear(crudo);
  }
  return valorCacheado;
}

/** En el servidor no hay `localStorage`; el HTML se arma con los valores por defecto. */
function instantaneaServidor(): ConfiguracionLocal {
  return CONFIGURACION_POR_DEFECTO;
}

function suscribir(alCambiar: () => void): () => void {
  window.addEventListener("storage", alCambiar);
  window.addEventListener(EVENTO_CAMBIO, alCambiar);
  return () => {
    window.removeEventListener("storage", alCambiar);
    window.removeEventListener(EVENTO_CAMBIO, alCambiar);
  };
}

/**
 * Lee y actualiza las preferencias locales.
 *
 * Usa `useSyncExternalStore` en lugar de estado con efecto: `localStorage` es un
 * almacén externo compartido entre pestañas, y esta API es la que React provee para
 * eso. Resuelve sola la hidratación —renderiza el default en el servidor y el valor
 * real después— y mantiene sincronizados a todos los componentes montados.
 *
 * @returns `configuracion` vigente y `guardar` para actualizarla parcialmente.
 */
export function useConfiguracionLocal() {
  const configuracion = useSyncExternalStore(suscribir, instantanea, instantaneaServidor);

  const guardar = useCallback((cambios: Partial<ConfiguracionLocal>) => {
    const siguiente = { ...instantanea(), ...cambios };

    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(siguiente));
    } catch {
      // No persiste (cuota llena o modo privado), pero la sesión actual sigue
      // funcionando: la caché en memoria ya tiene el valor nuevo.
    }

    crudoCacheado = JSON.stringify(siguiente);
    valorCacheado = siguiente;
    window.dispatchEvent(new Event(EVENTO_CAMBIO));
  }, []);

  return { configuracion, guardar };
}
