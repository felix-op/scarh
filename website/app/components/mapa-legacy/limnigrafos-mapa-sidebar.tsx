"use client";

/** Wrapper de escritorio: listado desplegable fijo arriba a la derecha del mapa. */

import { Acordeon } from "../ui/acordeon";
import { LimnigrafosMapaLista, type LimnigrafosMapaListaProps } from "./limnigrafos-mapa-lista";

export interface LimnigrafosMapaSidebarProps extends LimnigrafosMapaListaProps {
  abierto: boolean;
  onAbiertoChange: (_abierto: boolean) => void;
}

export function LimnigrafosMapaSidebar({ abierto, onAbiertoChange, ...listaProps }: LimnigrafosMapaSidebarProps) {
  return (
    <Acordeon
      titulo="Limnígrafos"
      abierto={abierto}
      onAbiertoChange={onAbiertoChange}
      className={`hidden md:absolute md:right-4 md:top-4 md:z-1000 md:flex md:w-80 md:flex-col md:bg-background-paper/95 md:shadow-card md:backdrop-blur-md md:transition-[height] md:duration-300 md:ease-in-out ${
        abierto ? "md:h-[calc(100%-2rem)]" : "md:h-14"
      }`}
      contenidoClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <LimnigrafosMapaLista {...listaProps} />
    </Acordeon>
  );
}

export default LimnigrafosMapaSidebar;
