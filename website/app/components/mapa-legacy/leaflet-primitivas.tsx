"use client";

/**
 * Puerto reducido (sólo lo que usa mapa-screen.tsx) del kit de primitivas de
 * Leaflet del frontend legacy (`shared/componentes/components/ui/map.tsx`,
 * 1544 líneas originales). Se dejaron afuera MapDraw*, MapLayers*,
 * MapMarkerClusterGroup, MapLocateControl, MapSearchControl y
 * MapFullscreenControl porque la pantalla de mapa original no los usa (usa la
 * Fullscreen API del navegador directamente). Si en el futuro se necesitan,
 * portar desde el archivo legacy citado arriba.
 *
 * TODO(migración-mapa): esto vive en `mapa-legacy` como puerto rápido; migrar
 * a primitivas propias en `components/ui/mapa.tsx` según `docs/migracion-mapa.md`.
 */

import { cn } from "@utils";
import type {
  Circle,
  DivIconOptions,
  LatLngExpression,
  Map as LeafletMap,
  Marker,
  PointExpression,
  TileLayer,
  Tooltip,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
  type Ref,
} from "react";
import { renderToString } from "react-dom/server";
import {
  useMap,
  useMapEvents,
  type CircleProps,
  type MapContainerProps,
  type MarkerProps,
  type TileLayerProps,
  type TooltipProps,
} from "react-leaflet";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createLazyComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const LazyComponent = lazy(factory);

  function LazyMountedComponent(props: React.ComponentProps<T>) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      return null;
    }

    return (
      <Suspense>
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  return LazyMountedComponent;
}

const LeafletMapContainer = createLazyComponent(() =>
  import("react-leaflet").then((mod) => ({ default: mod.MapContainer }))
);
const LeafletTileLayer = createLazyComponent(() =>
  import("react-leaflet").then((mod) => ({ default: mod.TileLayer }))
);
const LeafletMarker = createLazyComponent(() =>
  import("react-leaflet").then((mod) => ({ default: mod.Marker }))
);
const LeafletTooltip = createLazyComponent(() =>
  import("react-leaflet").then((mod) => ({ default: mod.Tooltip }))
);
const LeafletCircle = createLazyComponent(() =>
  import("react-leaflet").then((mod) => ({ default: mod.Circle }))
);

export function Mapa({
  zoom = 15,
  maxZoom = 18,
  className,
  ...props
}: Omit<MapContainerProps, "zoomControl"> & {
  center: LatLngExpression;
  ref?: Ref<LeafletMap>;
}) {
  return (
    <LeafletMapContainer
      zoom={zoom}
      maxZoom={maxZoom}
      attributionControl={false}
      zoomControl={false}
      className={cn("z-50 size-full min-h-96 flex-1 rounded-md", className)}
      {...props}
    />
  );
}

export function MapaCapaBase({
  url,
  attribution,
  darkUrl,
  darkAttribution,
  ...props
}: Partial<TileLayerProps> & {
  darkUrl?: string;
  darkAttribution?: string;
  ref?: Ref<TileLayer>;
}) {
  const map = useMap();
  if (map.attributionControl) {
    map.attributionControl.setPrefix("");
  }

  const DEFAULT_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
  const DEFAULT_DARK_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

  const { resolvedTheme } = useTheme();
  const resolvedUrl =
    resolvedTheme === "dark" ? (darkUrl ?? url ?? DEFAULT_DARK_URL) : (url ?? DEFAULT_URL);
  const resolvedAttribution =
    resolvedTheme === "dark" && darkAttribution
      ? darkAttribution
      : (attribution ??
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>');

  return <LeafletTileLayer url={resolvedUrl} attribution={resolvedAttribution} {...props} />;
}

export function MapaMarcador({
  icon = <MapPinIcon className="size-6" />,
  iconAnchor = [12, 12],
  bgPos,
  popupAnchor,
  tooltipAnchor,
  ...props
}: Omit<MarkerProps, "icon"> &
  Pick<DivIconOptions, "iconAnchor" | "bgPos" | "popupAnchor" | "tooltipAnchor"> & {
    icon?: ReactNode;
    ref?: Ref<Marker>;
  }) {
  const { L } = useLeaflet();
  if (!L) return null;

  return (
    <LeafletMarker
      icon={L.divIcon({
        html: renderToString(icon),
        iconAnchor,
        ...(bgPos ? { bgPos } : {}),
        ...(popupAnchor ? { popupAnchor } : {}),
        ...(tooltipAnchor ? { tooltipAnchor } : {}),
      })}
      riseOnHover
      {...props}
    />
  );
}

export function MapaCirculo({ className, ...props }: CircleProps & { ref?: Ref<Circle> }) {
  return (
    <LeafletCircle className={cn("fill-foreground stroke-foreground stroke-2", className)} {...props} />
  );
}

export function MapaTooltip({
  className,
  children,
  side = "top",
  sideOffset = 15,
  ...props
}: Omit<TooltipProps, "offset"> & {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  ref?: Ref<Tooltip>;
}) {
  const ARROW_POSITION_CLASSES = {
    top: "bottom-0.5 left-1/2 -translate-x-1/2 translate-y-1/2",
    bottom: "top-0.5 left-1/2 -translate-x-1/2 -translate-y-1/2",
    left: "right-0.5 top-1/2 translate-x-1/2 -translate-y-1/2",
    right: "left-0.5 top-1/2 -translate-x-1/2 -translate-y-1/2",
  };
  const DEFAULT_OFFSET = {
    top: [0, -sideOffset] satisfies PointExpression,
    bottom: [0, sideOffset] satisfies PointExpression,
    left: [-sideOffset, 0] satisfies PointExpression,
    right: [sideOffset, 0] satisfies PointExpression,
  };

  return (
    <LeafletTooltip
      className={cn(
        "relative z-50 w-fit text-xs text-balance transition-opacity",
        className
      )}
      data-side={side}
      direction={side}
      offset={DEFAULT_OFFSET[side]}
      opacity={1}
      {...props}
    >
      {children}
      <div
        className={cn(
          "bg-foreground fill-foreground absolute z-50 size-2.5 rotate-45 rounded-[2px]",
          ARROW_POSITION_CLASSES[side]
        )}
      />
    </LeafletTooltip>
  );
}

export function MapaControlContainer({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const { L } = useLeaflet();
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!L) return;
    const element = containerRef.current;
    if (!element) return;
    L.DomEvent.disableClickPropagation(element);
    L.DomEvent.disableScrollPropagation(element);
  }, [L]);

  return <div ref={containerRef} className={cn("absolute z-1000 size-fit cursor-default", className)} {...props} />;
}

export function MapaControlZoom({
  position = "top-1 left-1",
  className,
}: {
  position?: string;
  className?: string;
}) {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => {
      setZoomLevel(map.getZoom());
    },
  });

  return (
    <MapaControlContainer className={cn(position, className)}>
      <div className="flex flex-col rounded-md border bg-background-paper shadow-md overflow-hidden">
        <button
          type="button"
          aria-label="Acercar"
          title="Acercar"
          className="p-1.5 text-foreground hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={zoomLevel >= map.getMaxZoom()}
          onClick={() => map.zoomIn()}
        >
          <PlusIcon className="size-4" />
        </button>
        <div className="h-px bg-border" />
        <button
          type="button"
          aria-label="Alejar"
          title="Alejar"
          className="p-1.5 text-foreground hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={zoomLevel <= map.getMinZoom()}
          onClick={() => map.zoomOut()}
        >
          <MinusIcon className="size-4" />
        </button>
      </div>
    </MapaControlContainer>
  );
}

/** Carga leaflet en el cliente (evita `window is not defined` durante SSR). */
export function useLeaflet() {
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    if (L) return;
    if (typeof window === "undefined") return;

    import("leaflet").then((leaflet) => setL(leaflet.default));
  }, [L]);

  return { L };
}
