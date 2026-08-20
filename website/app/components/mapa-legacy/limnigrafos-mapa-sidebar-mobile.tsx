"use client";

/** Wrapper mobile: listado desplegable sobre el navbar. */

import { Acordeon } from "../ui/acordeon";
import { LimnigrafosMapaLista, type LimnigrafosMapaListaProps } from "./limnigrafos-mapa-lista";

export interface LimnigrafosMapaSidebarMobileProps extends LimnigrafosMapaListaProps {
  abierto: boolean;
  onAbiertoChange: (_abierto: boolean) => void;
}

export function LimnigrafosMapaSidebarMobile({ abierto, onAbiertoChange, ...listaProps }: LimnigrafosMapaSidebarMobileProps) {
  return (
    <Acordeon
      titulo="Limnígrafos"
      abierto={abierto}
      onAbiertoChange={onAbiertoChange}
      className={`fixed inset-x-0 bottom-24 z-[1050] mx-auto flex w-[90%] flex-col bg-background-paper/95 shadow-card backdrop-blur-md transition-[height] duration-300 ease-in-out md:hidden ${
        abierto ? "h-[65vh]" : "h-14"
      }`}
      encabezadoClassName="shrink-0"
      contenidoClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <LimnigrafosMapaLista {...listaProps} />
    </Acordeon>
  );
}

export default LimnigrafosMapaSidebarMobile;
