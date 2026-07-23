"use client";

import dynamic from "next/dynamic";
import type { MapaScreenProps } from "./mapa-screen";

// Leaflet necesita `window`; ssr:false sólo puede usarse desde un Client Component.
const MapaScreenSinSSR = dynamic(() => import("./mapa-screen").then((mod) => mod.MapaScreen), {
  ssr: false,
});

export function MapaDynamic(props: MapaScreenProps) {
  return <MapaScreenSinSSR {...props} />;
}

export default MapaDynamic;
