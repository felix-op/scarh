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
import {
	useGetLimnigrafos,
	useGetMediciones,
	type LimnigrafoPaginatedResponse,
	type MedicionPaginatedResponse,
} from "@servicios/api/django.api";
import { transformarLimnigrafos } from "@lib/transformers/limnigrafoTransformer";

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
	const {
		data: limnigrafosData,
		isLoading: isLoadingLimnigrafos,
	} = useGetLimnigrafos({
		config: {
			refetchInterval: 300000,
		},
	});
	const {
		data: medicionesData,
		isLoading: isLoadingMediciones,
	} = useGetMediciones({
		config: {
			refetchInterval: 300000,
		},
	});

	const limnigrafosResponse =
		limnigrafosData as LimnigrafoPaginatedResponse | undefined;
	const medicionesResponse =
		medicionesData as MedicionPaginatedResponse | undefined;

	const limnigrafosTransformados = useMemo(() => {
		const limnigrafosArray = Array.isArray(limnigrafosResponse)
			? limnigrafosResponse
			: limnigrafosResponse?.results;

		if (!limnigrafosArray || limnigrafosArray.length === 0) {
			return [];
		}

		const medicionesArray = medicionesResponse?.results ?? [];
		const medicionesMap = new Map(
			medicionesArray.map((medicion) => [medicion.limnigrafo, medicion]),
		);

		return transformarLimnigrafos(limnigrafosArray, medicionesMap);
	}, [limnigrafosResponse, medicionesResponse]);

	const limnigrafos =
		limnigrafosTransformados.length > 0 ? limnigrafosTransformados : LIMNIGRAFOS;
	const [selectedLimnigrafo, setSelectedLimnigrafo] =
		useState<LimnigrafoDetalleData | null>(null);

	useEffect(() => {
		if (!limnigrafos.length) {
			if (selectedLimnigrafo !== null) {
				setSelectedLimnigrafo(null);
			}
			return;
		}

		if (!selectedLimnigrafo) {
			setSelectedLimnigrafo(limnigrafos[0]);
			return;
		}

		const actualizado = limnigrafos.find(
			(item) => item.id === selectedLimnigrafo.id,
		);

		if (!actualizado) {
			setSelectedLimnigrafo(limnigrafos[0]);
		} else if (actualizado !== selectedLimnigrafo) {
			setSelectedLimnigrafo(actualizado);
		}
	}, [limnigrafos, selectedLimnigrafo]);

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
	const estaCargando = isLoadingLimnigrafos || isLoadingMediciones;
	const usandoDatosSimulados = limnigrafosTransformados.length === 0;

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
			{estaCargando ? (
				<div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow">
					Cargando limnígrafos desde el backend...
				</div>
			) : null}
			{!estaCargando && usandoDatosSimulados ? (
				<div className="absolute left-1/2 top-4 z-[900] -translate-x-1/2 rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900 shadow">
					Mostrando datos simulados (sin respuesta del backend)
				</div>
			) : null}
		</div>
	);
};

export default MapView;
