"use client";

import { useState } from "react";

/**
 * Muestra el saludo del tablero y **congela el primero que recibe**.
 *
 * Existe por una razón concreta: el saludo se elige en el servidor y varía en cada
 * request, pero `router.refresh()` del auto-refresco vuelve a ejecutar el Server
 * Component cada 30 segundos. Sin congelarlo, el encabezado cambiaría solo mientras
 * el usuario mira la pantalla, que es exactamente el tipo de movimiento que
 * distrae en un tablero de monitoreo.
 *
 * `useState` con el valor inicial es lo que lo logra: React ignora los cambios
 * posteriores de la prop y conserva el estado del componente cliente a través de un
 * refresh. Al navegar o recargar de verdad el componente se remonta y sale otro.
 *
 * @property {string} inicial Saludo resuelto en el servidor para este request.
 */
export interface SaludoProps {
  inicial: string;
}

export function Saludo({ inicial }: SaludoProps) {
  const [saludo] = useState(inicial);
  return <>{saludo}</>;
}
