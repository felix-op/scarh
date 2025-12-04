"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapMarker } from "@componentes/MapMarker";
import { LimnigrafoMapInfoPanel } from "@componentes/LimnigrafoMapInfoPanel";
import {
	type LimnigrafoDetalleData,
	LIMNIGRAFOS,
} from "@data/limnigrafos";

export type MapViewProps = {
	resizeToken?: number;
};

const DEFAULT_CENTER = { lat: -54.79930469196583, lng: -68.30601485928138 };

const estadoColor: Record<string, string> = {
	activo: "#1D4ED8",
	prueba: "#0EA5E9",
	advertencia: "#F97316",
	fuera: "#DC2626",
};

function getEstadoColor(variant?: string) {
	return estadoColor[variant ?? "activo"] ?? "#1D4ED8";
}

function AutoResizeMap({ resizeToken = 0 }: { resizeToken: number }) {
	const map = useMap();

	useEffect(() => {
		const timeout = setTimeout(() => {
			map.invalidateSize();
		}, 50);

		return () => {
			clearTimeout(timeout);
		};
	}, [map, resizeToken]);

	return null;
}

const MapView: React.FC<MapViewProps> = ({ resizeToken = 0 }) => {
	const [limnigrafos, setLimnigrafos] =
		useState<LimnigrafoDetalleData[]>(LIMNIGRAFOS);

	useEffect(() => {
		let cancelado = false;

		async function cargarStore() {
			try {
				const response = await fetch("/api/limnigrafos");
				if (!response.ok) {
					throw new Error("No se pudo leer el archivo de limnigrafos.");
				}

				const data = (await response.json()) as {
					limnigrafos?: LimnigrafoDetalleData[];
				};
				if (cancelado) {
					return;
				}

				if (data.limnigrafos && data.limnigrafos.length > 0) {
					setLimnigrafos(data.limnigrafos);
				} else {
					setLimnigrafos(LIMNIGRAFOS);
				}
			} catch {
				if (!cancelado) {
					setLimnigrafos(LIMNIGRAFOS);
				}
			}
		}

		void cargarStore();

		return () => {
			cancelado = true;
		};
	}, []);

	const markers = useMemo(
		() =>
			limnigrafos.filter(
				(limnigrafo): limnigrafo is LimnigrafoDetalleData & {
					coordenadas: { lat: number; lng: number };
				} => Boolean(limnigrafo.coordenadas)
			),
		[limnigrafos]
	);

	const mapCenter = markers[0]?.coordenadas ?? DEFAULT_CENTER;
	const [selectedLimnigrafo, setSelectedLimnigrafo] =
		useState<LimnigrafoDetalleData | null>(null);

	return (
		<div className="relative h-full w-full">
			<MapContainer
				center={mapCenter}
				zoom={15}
				className="h-full w-full min-h-[400px]"
				scrollWheelZoom={false}
			>
				<TileLayer
					url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				/>

				{markers.map((limnigrafo) => (
					<MapMarker
						key={limnigrafo.id}
						position={[
							limnigrafo.coordenadas.lat,
							limnigrafo.coordenadas.lng,
						]}
						color={getEstadoColor(limnigrafo.estado.variante)}
						popupContent={`${limnigrafo.nombre} – ${limnigrafo.ubicacion}`}
						onMarkerClick={() => setSelectedLimnigrafo(limnigrafo)}
					/>
				))}

				<AutoResizeMap resizeToken={resizeToken} />
			</MapContainer>

			<LimnigrafoMapInfoPanel
				limnigrafo={selectedLimnigrafo}
				onClose={() => setSelectedLimnigrafo(null)}
			/>
		</div>
	);
};

export default MapView;
