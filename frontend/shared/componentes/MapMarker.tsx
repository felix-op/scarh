"use client";

import { useEffect, useMemo } from "react";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { buildPuntoUbicacionSvg } from "@componentes/icons/Icons";

type MapMarkerProps = {
	position: LatLngExpression;
	size?: number;
	color?: string;
	popupContent?: string;
};

export function MapMarker({
	position,
	size = 32,
	color = "#1D4ED8",
	popupContent,
}: MapMarkerProps) {
	const map = useMap();

	const markerIcon = useMemo(() => {
		if (typeof window === "undefined") {
			return null;
		}

		const svgMarkup = buildPuntoUbicacionSvg({ size, color });

		return L.divIcon({
			html: svgMarkup,
			iconSize: [size, size],
			iconAnchor: [size / 2, size],
			className: "map-marker-icon",
		});
	}, [size, color]);

	useEffect(() => {
		if (!map || !markerIcon) {
			return;
		}

		const marker = L.marker(position, { icon: markerIcon }).addTo(map);

		if (popupContent) {
			marker.bindPopup(popupContent);
		}

		return () => {
			map.removeLayer(marker);
		};
	}, [map, markerIcon, position, popupContent]);

	return null;
}
