"use client";

/** Wrapper de escritorio: panel flotante fijo arriba a la derecha del mapa. */

import { LimnigrafosMapaLista, type LimnigrafosMapaListaProps } from "./limnigrafos-mapa-lista";

export type LimnigrafosMapaSidebarProps = LimnigrafosMapaListaProps;

export function LimnigrafosMapaSidebar(props: LimnigrafosMapaSidebarProps) {
  return (
    <aside className="hidden md:absolute md:top-4 md:right-4 md:z-1000 md:flex md:w-80 md:max-h-[calc(100%-2rem)] md:flex-col md:rounded-shape-lg md:border md:border-border md:bg-background-paper/95 md:shadow-card md:backdrop-blur-md">
      <div className="p-4 pb-0 min-w-0">
        <h2 className="text-xl font-semibold text-foreground-title">Limnígrafos</h2>
      </div>
      <LimnigrafosMapaLista {...props} />
    </aside>
  );
}

export default LimnigrafosMapaSidebar;
