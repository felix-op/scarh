"use client";

/** Wrapper mobile: panel inferior colapsado sobre el navbar, se expande hacia arriba al tocarlo. */

import { useState } from "react";
import { cn } from "@utils";
import { IconifyIcon } from "../ui/iconify-icon";
import { LimnigrafosMapaLista, type LimnigrafosMapaListaProps } from "./limnigrafos-mapa-lista";

export type LimnigrafosMapaSidebarMobileProps = LimnigrafosMapaListaProps;

export function LimnigrafosMapaSidebarMobile(props: LimnigrafosMapaSidebarMobileProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={cn(
        "fixed inset-x-0 bottom-24 z-[1050] mx-auto flex w-[90%] flex-col overflow-hidden rounded-shape-lg border border-border bg-background-paper/95 backdrop-blur-md shadow-card transition-[height] duration-300 ease-in-out md:hidden",
        expanded ? "h-[65vh]" : "h-14",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={!expanded ? () => setExpanded(true) : undefined}
        onKeyDown={(e) => {
          if (!expanded && (e.key === "Enter" || e.key === " ")) setExpanded(true);
        }}
        className={cn("flex shrink-0 items-center justify-between gap-3 p-4", !expanded && "cursor-pointer")}
      >
        <h2 className="text-xl font-semibold text-foreground-title">Limnígrafos</h2>
        {expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Cerrar lista"
            className="shrink-0 rounded-shape-full p-1 hover:bg-hover"
          >
            <IconifyIcon variant="cerrar" className="text-xl" />
          </button>
        ) : (
          <IconifyIcon variant="chevronUp" className="text-xl shrink-0 text-foreground-secondary" />
        )}
      </div>

      <div className={cn("min-h-0 flex-1 flex-col", expanded ? "flex" : "hidden")}>
        <LimnigrafosMapaLista {...props} />
      </div>
    </aside>
  );
}

export default LimnigrafosMapaSidebarMobile;
