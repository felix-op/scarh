"use client";

import { useEffect, useRef } from "react";

let ventanasAbiertas = 0;

/**
 * Permite cerrar una ventana/drawer con el botón o gesto de "atrás" del navegador/teléfono,
 * en vez de que esa acción navegue fuera de la pantalla actual.
 *
 * No hace `history.back()` al cerrarse por la UI (botón, confirmar, etc.): ese back()
 * dispara un `popstate` global que escuchan también otras ventanas abiertas al mismo tiempo
 * (ej. el diálogo de "¿Descartar cambios?" sobre un formulario), haciendo que se cierren y
 * vuelvan a abrir en cadena. En cambio, cada ventana registra su profundidad al abrirse y solo
 * reacciona a un "atrás" real si sigue siendo la última en abrirse, así una sola pulsación
 * cierra un único diálogo a la vez.
 * @property {boolean} open Si la ventana está abierta.
 * @property {() => void} onClose Handler a invocar cuando se detecta la navegación hacia atrás.
 */
export function useCerrarConAtras(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const profundidad = useRef(0);

  useEffect(() => {
    if (!open) return;

    ventanasAbiertas += 1;
    profundidad.current = ventanasAbiertas;
    history.pushState({ ventanaAbierta: true }, "");

    const handlePopState = () => {
      if (profundidad.current !== ventanasAbiertas) return;
      ventanasAbiertas -= 1;
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (profundidad.current === ventanasAbiertas) {
        ventanasAbiertas -= 1;
      }
    };
  }, [open]);
}
