"use client";

import { useState, useEffect, useRef } from "react";
import { Mensaje } from "@services";

export function useMensajeConfig(mensaje: Mensaje, onRemove: (_id: string) => void) {
  const [isHovered, setIsHovered] = useState(false);

  const initialDuration = typeof mensaje.tiempo === "number" 
    ? mensaje.tiempo 
    : (mensaje.tiempo === true ? 5000 : null);

  const remainingTime = useRef(initialDuration);
  const startTimestamp = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onRemoveRef = useRef(onRemove);

  // Actualizamos la referencia para siempre tener la última versión sin que afecte los hooks
  useEffect(() => {
    onRemoveRef.current = onRemove;
  }, [onRemove]);

  useEffect(() => {
    if (initialDuration === null) return;

    if (!isHovered) {
      // Reanudar o iniciar el timer
      startTimestamp.current = Date.now();
      timerRef.current = setTimeout(() => {
        onRemoveRef.current(mensaje.id);
      }, remainingTime.current!);
    } else {
      // Pausar timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (startTimestamp.current !== null && remainingTime.current !== null) {
        const elapsed = Date.now() - startTimestamp.current;
        remainingTime.current = Math.max(0, remainingTime.current - elapsed);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isHovered, initialDuration, mensaje.id]);

  return { isHovered, setIsHovered, initialDuration };
}
