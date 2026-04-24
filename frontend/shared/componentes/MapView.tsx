"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Map, MapTileLayer, MapZoomControl, MapMarker, MapTooltip } from "@componentes/components/ui/map";
import { useMapEvents } from "react-leaflet";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@componentes/components/ui/button";
import { ButtonGroup } from "@componentes/components/ui/button-group";
import { LimnigrafoMapInfoPanel } from "@componentes/LimnigrafoMapInfoPanel";
import { LimnigrafosSidebar } from "./LimnigrafosSidebar";
import {
	type LimnigrafoDetalleData,
	LIMNIGRAFOS,
} from "@data/limnigrafos";
import {
	useGetMediciones,
	type MedicionPaginatedResponse,
} from "@servicios/api/django.api";
import { transformarLimnigrafos } from "@lib/transformers/limnigrafoTransformer";
import { useGetLimnigrafos } from "@servicios/api/limnigrafos";
import { Paginado } from "@servicios/api/types";
import { LimnigrafoResponse } from "types/limnigrafos";
import { Maximize, Minimize, X } from "lucide-react";

export type MapViewProps = {
	resizeToken?: number;
};

const DEFAULT_CENTER: [number, number] = [-54.79930469196583, -68.30601485928138];

const estadoColor: Record<string, string> = {
	activo: "#82d987",
	prueba: "#0EA5E9",
	advertencia: "#facc15",
	fuera: "#d65757",
};

function getEstadoColor(variant?: string) {
	return estadoColor[variant ?? "activo"] ?? "#82d987";
}

// Componente para capturar clicks en el mapa y cambiar el cursor
function MapClickHandler({ onClick, active }: { onClick: (e: any) => void, active: boolean }) {
	const map = useMapEvents({
		click: (e) => {
			if (active) onClick(e);
		},
	});

	useEffect(() => {
		if (active) {
			const container = map.getContainer();
			const oldCursor = container.style.cursor;
			container.style.cursor = "crosshair";
			return () => {
				container.style.cursor = oldCursor;
			};
		}
	}, [map, active]);

	return null;
}

// Componente para mover la cámara del mapa
function ChangeMapView({ center }: { center: [number, number] }) {
	const map = useMapEvents({});
	useEffect(() => {
		map.setView(center, map.getZoom(), {
			animate: true,
			duration: 1
		});
	}, [center, map]);
	return null;
}

const MapView: React.FC<MapViewProps> = ({ resizeToken = 0 }) => {
	const [viewMode, setViewMode] = useState<"limpio" | "lista">("lista");
	const [mapStyle, setMapStyle] = useState<"claro" | "satelite">("claro");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [placementMode, setPlacementMode] = useState<LimnigrafoDetalleData | null>(null);
	const [tempMarker, setTempMarker] = useState<{ lat: number, lng: number } | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();

	const {
		data: limnigrafosData,
	} = useGetLimnigrafos({
		config: {
			refetchInterval: 300000,
		},
	});
	const {
		data: medicionesData,
	} = useGetMediciones({
		config: {
			refetchInterval: 300000,
		},
	});

	const limnigrafosResponse =
		limnigrafosData as Paginado<LimnigrafoResponse> | undefined;
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
		const medicionesMap = new globalThis.Map(
			medicionesArray.map((medicion) => [medicion.limnigrafo, medicion]),
		);

		return transformarLimnigrafos(limnigrafosArray, medicionesMap);
	}, [limnigrafosResponse, medicionesResponse]);

	const limnigrafos =
		limnigrafosTransformados.length > 0 ? limnigrafosTransformados : LIMNIGRAFOS;
	const [selectedLimnigrafo, setSelectedLimnigrafo] =
		useState<LimnigrafoDetalleData | null>(null);
	const [cameraCenter, setCameraCenter] = useState<[number, number]>(DEFAULT_CENTER);

	const markers = useMemo(
		() =>
			limnigrafos.filter(
				(limnigrafo): limnigrafo is LimnigrafoDetalleData & {
					coordenadas: { lat: number; lng: number };
				} => Boolean(limnigrafo.coordenadas)
			),
		[limnigrafos]
	);

	useEffect(() => {
		if (markers.length > 0 && cameraCenter === DEFAULT_CENTER) {
			setCameraCenter([markers[0].coordenadas.lat, markers[0].coordenadas.lng]);
		}
	}, [markers, cameraCenter]);

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			containerRef.current?.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable fullscreen: ${err.message}`);
			});
		} else {
			document.exitFullscreen();
		}
	};

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, []);

	const handleEditUbicacion = useCallback((lim: LimnigrafoDetalleData) => {
		setPlacementMode(lim);
		setTempMarker(null);
	}, []);

	const handleCancelPlacement = useCallback(() => {
		setPlacementMode(null);
		setTempMarker(null);
	}, []);

	const handleVerEnMapa = useCallback((lim: LimnigrafoDetalleData) => {
		setSelectedLimnigrafo(lim);
		if (lim.coordenadas) {
			setCameraCenter([lim.coordenadas.lat, lim.coordenadas.lng]);
		}
	}, []);

	const handleMapClickForPlacement = useCallback((e: any) => {
		if (!placementMode) return;

		const { lat, lng } = e.latlng;
		setTempMarker({ lat, lng });

		const saveLocation = async () => {
			try {
				// 1. Crear ubicación
				const ubicacionRes = await fetch("/api/proxy/ubicacion/", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ latitud: lat, longitud: lng, nombre: `Ubicación ${placementMode.nombre}` }),
				});

				if (!ubicacionRes.ok) {
					const errorData = await ubicacionRes.json().catch(() => ({}));
					throw new Error(errorData.detail || errorData.error || "Error al crear ubicación");
				}
				const ubicacionData = await ubicacionRes.json();

				// 2. Asignar al limnígrafo
				const patchRes = await fetch(`/api/proxy/limnigrafos/${placementMode.id}/`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ubicacion_id: ubicacionData.id }),
				});

				if (!patchRes.ok) {
					const errorData = await patchRes.json().catch(() => ({}));
					throw new Error(errorData.detail || errorData.error || "Error al actualizar limnígrafo");
				}

				// 3. Refrescar datos
				queryClient.invalidateQueries({ queryKey: ["useGetLimnigrafos"] });
				setPlacementMode(null);
				setTempMarker(null);
			} catch (err: any) {
				console.error("Error guardando ubicación:", err);
				alert(`No se pudo guardar la ubicación: ${err.message}`);
				setTempMarker(null);
			}
		};

		saveLocation();
	}, [placementMode, queryClient]);

	return (
		<div ref={containerRef} className="relative h-full w-full overflow-hidden bg-background">
			<div className="relative h-full w-full">
				<Map
					center={cameraCenter}
					zoom={15}
					className="h-full w-full"
				>
					<MapClickHandler onClick={handleMapClickForPlacement} active={!!placementMode} />
					<ChangeMapView center={cameraCenter} />
					
					{mapStyle === "claro" ? (
						<MapTileLayer 
							url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
							attribution="&copy; <a href='https://carto.com/'>CARTO</a>"
						/>
					) : (
						<MapTileLayer 
							url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
							attribution="Tiles &copy; Esri"
						/>
					)}

					<MapZoomControl position="bottom-4 left-4" />

					{/* Marcador temporal durante la edición */}
					{tempMarker && (
						<MapMarker position={[tempMarker.lat, tempMarker.lng]}>
							<MapTooltip permanent>Guardando...</MapTooltip>
						</MapMarker>
					)}

					{markers.map((limnigrafo) => {
						const color = getEstadoColor(limnigrafo.estado.variante);
						return (
							<MapMarker
								key={limnigrafo.id}
								position={[limnigrafo.coordenadas.lat, limnigrafo.coordenadas.lng]}
								iconAnchor={[12, 12]}
								eventHandlers={{
									click: () => setSelectedLimnigrafo(limnigrafo)
								}}
								icon={
									<div 
										className={`w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform ${selectedLimnigrafo?.id === limnigrafo.id ? 'ring-4 ring-principal' : ''}`}
										style={{ backgroundColor: color }}
									/>
								}
							>
								<MapTooltip>{limnigrafo.nombre} - Click para ver detalles</MapTooltip>
							</MapMarker>
						);
					})}
				</Map>

				{/* Controles Top Left */}
				<div className="absolute top-4 left-4 z-[1000] flex gap-3">
					<Button 
						variant="secondary" 
						size="icon" 
						onClick={toggleFullscreen}
						className="shadow-md bg-white text-foreground hover:bg-gray-100"
					>
						{isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
					</Button>

					<ButtonGroup className="shadow-md bg-white rounded-md">
						<Button 
							variant="ghost"
							onClick={() => setMapStyle("claro")}
							className={mapStyle === "claro" ? "bg-[#f4f4f4] text-[#121212]" : "text-muted-foreground"}
						>
							MAP
						</Button>
						<Button 
							variant="ghost"
							onClick={() => setMapStyle("satelite")}
							className={mapStyle === "satelite" ? "bg-[#f4f4f4] text-[#121212]" : "text-muted-foreground"}
						>
							Satélite
						</Button>
					</ButtonGroup>

					<ButtonGroup className="shadow-md bg-white rounded-md">
						<Button 
							variant="ghost"
							onClick={() => setViewMode("limpio")}
							className={viewMode === "limpio" ? "bg-[#f4f4f4] text-[#121212]" : "text-muted-foreground"}
						>
							Limpio
						</Button>
						<Button 
							variant="ghost"
							onClick={() => setViewMode("lista")}
							className={viewMode === "lista" ? "bg-[#f4f4f4] text-[#121212]" : "text-muted-foreground"}
						>
							Lista
						</Button>
					</ButtonGroup>
				</div>

				{/* Banner de modo edición */}
				{placementMode && (
					<div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1002] flex items-center gap-3 rounded-2xl bg-principal px-5 py-2.5 text-white shadow-lg">
						<span className="text-sm font-medium">📍 Hacé click en el mapa para ubicar <strong>{placementMode.nombre}</strong></span>
						<button onClick={handleCancelPlacement} className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors">
							<X className="h-4 w-4" />
						</button>
					</div>
				)}

				{/* Info Panel Flotante */}
				{!placementMode && (
					<LimnigrafoMapInfoPanel
						limnigrafo={selectedLimnigrafo}
						onClose={() => setSelectedLimnigrafo(null)}
					/>
				)}
				{/* Sidebar Flotante Condicional */}
				{viewMode === "lista" && !placementMode && (
					<LimnigrafosSidebar
						limnigrafos={limnigrafos}
						selectedLimnigrafo={selectedLimnigrafo}
						onSelectLimnigrafo={setSelectedLimnigrafo}
						onEditUbicacion={handleEditUbicacion}
						onVerEnMapa={handleVerEnMapa}
					/>
				)}
			</div>
		</div>
	);
};

export default MapView;
