"use client";

import { Fragment, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Eye, EyeOff, FileUp, Plus } from "lucide-react";
import { useMap } from "react-leaflet";

import Boton from "@componentes/Boton";
import BotonIconoEditar from "@componentes/botones/BotonIconoEditar";
import BotonIconoEliminar from "@componentes/botones/BotonIconoEliminar";
import { Button } from "@componentes/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@componentes/components/ui/dialog";
import { Input } from "@componentes/components/ui/input";
import { Map, MapMarker, MapPolyline, MapTileLayer, MapTooltip, MapZoomControl } from "@componentes/components/ui/map";
import { Textarea } from "@componentes/components/ui/textarea";
import SeccionInfoGroup from "@componentes/secciones/SeccionInfoGroup";
import VentanaConfirmar from "@componentes/ventanas/VentanaConfirmar";
import { useNotificar } from "@hooks/useNotificar";
import {
	useDeleteRutaAcceso,
	useGetRutasAcceso,
	usePatchRutaAcceso,
	usePostRutaAcceso,
} from "@servicios/api/rutas-acceso";
import type { RutaAccesoResponse } from "types/rutas-acceso";

type RutasAccesoLimnigrafoProps = {
	limnigrafoId: string;
	limnigrafoCodigo?: string;
	ubicacion?: UbicacionLimnigrafo | null;
	puedeEditar: boolean;
};

type UbicacionLimnigrafo = {
	latitud?: number;
	longitud?: number;
	geometry?: {
		coordinates?: number[];
	};
};

type RutaFormState = {
	nombre: string;
	tiempo_estimado_minutos: string;
	observaciones: string;
	archivo: File | null;
};

const estadoInicial: RutaFormState = {
	nombre: "",
	tiempo_estimado_minutos: "",
	observaciones: "",
	archivo: null,
};

function extraerMensajeError(error: unknown) {
	const data = (error as { response?: { data?: unknown }, message?: string })?.response?.data;
	if (data && typeof data === "object") {
		const record = data as Record<string, unknown>;
		const primerValor = Object.values(record)[0];
		if (Array.isArray(primerValor)) return String(primerValor[0]);
		if (typeof primerValor === "string") return primerValor;
	}
	return (error as { message?: string })?.message || "No se pudo completar la operación.";
}

function normalizarLineas(ruta: RutaAccesoResponse | null) {
	const geometry = ruta?.geometria?.features?.[0]?.geometry;
	if (!geometry) return [];

	if (geometry.type === "LineString") {
		const linea = geometry.coordinates
			.map(([lng, lat]) => [lat, lng] as [number, number])
			.filter(esCoordenadaValida);

		return linea.length >= 2 ? [linea] : [];
	}

	return geometry.coordinates.map((segmento) =>
		segmento
			.map(([lng, lat]) => [lat, lng] as [number, number])
			.filter(esCoordenadaValida),
	).filter((segmento) => segmento.length >= 2);
}

function esCoordenadaValida(coordenada: [number, number]) {
	const [lat, lng] = coordenada;
	return Number.isFinite(lat) && Number.isFinite(lng);
}

function normalizarUbicacion(ubicacion?: UbicacionLimnigrafo | null): [number, number] | null {
	if (!ubicacion) return null;

	if (typeof ubicacion.latitud === "number" && typeof ubicacion.longitud === "number") {
		const coordenada: [number, number] = [ubicacion.latitud, ubicacion.longitud];
		return esCoordenadaValida(coordenada) ? coordenada : null;
	}

	const [longitud, latitud] = ubicacion.geometry?.coordinates ?? [];
	if (typeof latitud === "number" && typeof longitud === "number") {
		const coordenada: [number, number] = [latitud, longitud];
		return esCoordenadaValida(coordenada) ? coordenada : null;
	}

	return null;
}

function normalizarPuntoGeoJson(punto?: number[] | null): [number, number] | null {
	if (!Array.isArray(punto) || punto.length < 2) return null;

	const coordenada: [number, number] = [punto[1], punto[0]];
	return esCoordenadaValida(coordenada) ? coordenada : null;
}

function obtenerExtremosRuta(ruta: RutaAccesoResponse, lineas: [number, number][][]) {
	const puntos = lineas.flat();
	const propiedades = ruta.geometria?.features?.[0]?.properties;

	return {
		inicio: normalizarPuntoGeoJson(propiedades?.start_coordinate) ?? puntos[0] ?? null,
		fin: normalizarPuntoGeoJson(propiedades?.destination_coordinate) ?? puntos[puntos.length - 1] ?? null,
		ultimo: normalizarPuntoGeoJson(propiedades?.end_coordinate) ?? puntos[puntos.length - 1] ?? null,
		esIdaVuelta: Boolean(propiedades?.is_round_trip),
	};
}

function AjustarVistaRuta({
	lineas,
	ubicacion,
}: {
	lineas: [number, number][][];
	ubicacion: [number, number] | null;
}) {
	const map = useMap();

	useEffect(() => {
		const puntos = lineas.flat();
		if (ubicacion) {
			puntos.push(ubicacion);
		}
		if (puntos.length >= 2) {
			map.fitBounds(puntos, { padding: [28, 28] });
		} else if (puntos.length === 1) {
			map.setView(puntos[0], 15);
		}
	}, [lineas, map, ubicacion]);

	return null;
}

function RutaAccesoMapa({
	ruta,
	ubicacion,
}: {
	ruta: RutaAccesoResponse;
	ubicacion?: UbicacionLimnigrafo | null;
}) {
	const lineas = normalizarLineas(ruta);
	const ubicacionNormalizada = normalizarUbicacion(ubicacion);
	const { inicio, fin, ultimo, esIdaVuelta } = obtenerExtremosRuta(ruta, lineas);
	const centro: [number, number] = ubicacionNormalizada ?? lineas[0]?.[0] ?? [-54.79930469196583, -68.30601485928138];

	return (
		<div className="h-[360px] overflow-hidden rounded-md border border-foreground/10">
			<Map center={centro} zoom={14} className="h-full min-h-[360px] w-full rounded-md">
				<MapTileLayer
					url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
					attribution="&copy; CARTO"
				/>
				<MapZoomControl position="bottom-4 left-4" />
				<AjustarVistaRuta lineas={lineas} ubicacion={ubicacionNormalizada} />
				{lineas.map((linea, index) => (
					<Fragment key={`${ruta.id}-${index}`}>
						<MapPolyline
							key={`${ruta.id}-${index}-halo`}
							positions={linea}
							className="[stroke:#FFFFFF]"
							pathOptions={{ color: "#FFFFFF", weight: 12, opacity: 1 }}
						/>
						<MapPolyline
							key={`${ruta.id}-${index}-borde`}
							positions={linea}
							className="[stroke:#0B1F3A]"
							pathOptions={{ color: "#0B1F3A", weight: 8, opacity: 0.95 }}
						/>
						<MapPolyline
							key={`${ruta.id}-${index}`}
							positions={linea}
							className="[stroke:#FBBF24]"
							pathOptions={{ color: "#FBBF24", weight: 5, opacity: 1 }}
						/>
					</Fragment>
				))}
				{inicio && (
					<MapMarker
						position={inicio}
						iconAnchor={[8, 8]}
						icon={<span className="block h-4 w-4 rounded-full border-2 border-white bg-[#2563EB] shadow-[0_0_0_3px_rgba(37,99,235,0.35)]" />}
					>
						<MapTooltip>Inicio de la ruta</MapTooltip>
					</MapMarker>
				)}
				{fin && (
					<MapMarker
						position={fin}
						iconAnchor={[9, 9]}
						icon={<span className="block h-[18px] w-[18px] rounded-full border-2 border-white bg-[#F97316] shadow-[0_0_0_4px_rgba(249,115,22,0.35)]" />}
					>
						<MapTooltip>{esIdaVuelta ? "Destino de la ruta" : "Fin de la ruta"}</MapTooltip>
					</MapMarker>
				)}
				{esIdaVuelta && ultimo && (
					<MapMarker
						position={ultimo}
						iconAnchor={[7, 7]}
						icon={<span className="block h-3.5 w-3.5 rounded-full border-2 border-white bg-[#64748B] shadow-[0_0_0_3px_rgba(100,116,139,0.25)]" />}
					>
						<MapTooltip>Regreso al inicio</MapTooltip>
					</MapMarker>
				)}
				{ubicacionNormalizada && (
					<MapMarker
						position={ubicacionNormalizada}
						iconAnchor={[12, 12]}
						icon={<span className="block h-6 w-6 rounded-full border-[3px] border-white bg-[#22C55E] shadow-[0_0_0_5px_rgba(34,197,94,0.35),0_2px_8px_rgba(15,23,42,0.45)]" />}
					>
						<MapTooltip>Limnígrafo</MapTooltip>
					</MapMarker>
				)}
			</Map>
		</div>
	);
}

export default function RutasAccesoLimnigrafo({
	limnigrafoId,
	limnigrafoCodigo,
	ubicacion,
	puedeEditar,
}: RutasAccesoLimnigrafoProps) {
	const queryClient = useQueryClient();
	const notificar = useNotificar();
	const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaAccesoResponse | null>(null);
	const [modalAbierto, setModalAbierto] = useState(false);
	const [rutaEditando, setRutaEditando] = useState<RutaAccesoResponse | null>(null);
	const [form, setForm] = useState<RutaFormState>(estadoInicial);
	const [rutaEliminar, setRutaEliminar] = useState<RutaAccesoResponse | null>(null);

	const rutasQuery = useGetRutasAcceso({
		params: { queryParams: { limnigrafo: limnigrafoId, limit: "100" } },
		config: { enabled: !!limnigrafoId },
	});

	const invalidateRutas = async () => {
		await queryClient.invalidateQueries({ queryKey: ["useGetRutasAcceso"] });
	};

	const crearRuta = usePostRutaAcceso({
		configuracion: {
			configAxios: { headers: {} },
			onSuccess: async (ruta) => {
				await invalidateRutas();
				setRutaSeleccionada(ruta);
				cerrarModal();
				notificar({ titulo: "Ruta cargada", mensaje: "La ruta de acceso se guardó correctamente.", variante: "exito" });
			},
			onError: (error) => {
				notificar({ titulo: "No se pudo cargar la ruta", mensaje: extraerMensajeError(error), variante: "error" });
			},
		},
	});

	const editarRuta = usePatchRutaAcceso({
		params: { id: rutaEditando ? String(rutaEditando.id) : "" },
		configuracion: {
			configAxios: { headers: {} },
			onSuccess: async (ruta) => {
				await invalidateRutas();
				setRutaSeleccionada((actual) => actual?.id === ruta.id ? ruta : actual);
				cerrarModal();
				notificar({ titulo: "Ruta actualizada", mensaje: "Los cambios se guardaron correctamente.", variante: "exito" });
			},
			onError: (error) => {
				notificar({ titulo: "No se pudo actualizar la ruta", mensaje: extraerMensajeError(error), variante: "error" });
			},
		},
	});

	const eliminarRuta = useDeleteRutaAcceso({
		params: { id: rutaEliminar ? String(rutaEliminar.id) : "" },
		configuracion: {
			onSuccess: async () => {
				await invalidateRutas();
				setRutaSeleccionada((actual) => actual?.id === rutaEliminar?.id ? null : actual);
				setRutaEliminar(null);
				notificar({ titulo: "Ruta eliminada", mensaje: "La ruta de acceso se eliminó correctamente.", variante: "exito" });
			},
			onError: (error) => {
				notificar({ titulo: "No se pudo eliminar la ruta", mensaje: extraerMensajeError(error), variante: "error" });
			},
		},
	});

	const rutas = rutasQuery.data?.results ?? [];

	const abrirNueva = () => {
		setRutaEditando(null);
		setForm(estadoInicial);
		setModalAbierto(true);
	};

	const abrirEditar = (ruta: RutaAccesoResponse) => {
		setRutaEditando(ruta);
		setForm({
			nombre: ruta.nombre,
			tiempo_estimado_minutos: ruta.tiempo_estimado_minutos?.toString() ?? "",
			observaciones: ruta.observaciones ?? "",
			archivo: null,
		});
		setModalAbierto(true);
	};

	const cerrarModal = () => {
		setModalAbierto(false);
		setRutaEditando(null);
		setForm(estadoInicial);
	};

	async function extraerObservacionesDesdeArchivo(archivo: File) {
		try {
			const texto = await archivo.text();
			if (!texto.trim()) return "";

			const parser = new DOMParser();
			const doc = parser.parseFromString(texto, "application/xml");
			if (doc.querySelector("parsererror")) return "";

			const buscarTexto = (tagName: string) => {
				const elementos = Array.from(doc.getElementsByTagName(tagName));
				for (const elemento of elementos) {
					const valor = elemento.textContent?.trim();
					if (valor) return valor;
				}
				const elementosNS = Array.from(doc.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1", tagName));
				for (const elemento of elementosNS) {
					const valor = elemento.textContent?.trim();
					if (valor) return valor;
				}
				return "";
			};

			const textoDescRaiz = buscarTexto("desc");
			if (textoDescRaiz) return textoDescRaiz;

			const textoCmt = buscarTexto("cmt");
			if (textoCmt) return textoCmt;

			return buscarTexto("name");
		} catch {
			return "";
		}
	}

	const handleArchivo = async (archivo: File | null) => {
		if (!archivo) {
			setForm((actual) => ({ ...actual, archivo: null }));
			return;
		}

		const extensionValida = /\.(gpx|kml)$/i.test(archivo.name);
		if (!extensionValida) {
			notificar({ titulo: "Archivo inválido", mensaje: "Seleccioná un archivo .gpx o .kml.", variante: "error" });
			return;
		}
		if (archivo.size > 5 * 1024 * 1024) {
			notificar({ titulo: "Archivo inválido", mensaje: "El archivo no puede superar los 5 MB.", variante: "error" });
			return;
		}

		const observacionesDesdeArchivo = await extraerObservacionesDesdeArchivo(archivo);
		setForm((actual) => ({
			...actual,
			archivo,
			observaciones: actual.observaciones.trim() || observacionesDesdeArchivo || actual.observaciones,
		}));
	};

	const submitRuta = () => {
		if (!form.nombre.trim()) {
			notificar({ titulo: "Faltan datos", mensaje: "Ingresá un nombre para la ruta.", variante: "alerta" });
			return;
		}
		if (!rutaEditando && !form.archivo) {
			notificar({ titulo: "Faltan datos", mensaje: "Seleccioná un archivo GPX o KML.", variante: "alerta" });
			return;
		}

		const data = new FormData();
		data.append("limnigrafo_id", limnigrafoId);
		data.append("nombre", form.nombre.trim());
		data.append("observaciones", form.observaciones);
		if (form.tiempo_estimado_minutos) {
			data.append("tiempo_estimado_minutos", form.tiempo_estimado_minutos);
		}
		if (form.archivo) {
			data.append("archivo_original", form.archivo);
		}

		if (rutaEditando) {
			editarRuta.mutate({ data, params: { id: String(rutaEditando.id) } });
		} else {
			crearRuta.mutate({ data });
		}
	};

	const descargarRuta = async (ruta: RutaAccesoResponse) => {
		if (!ruta.archivo_url) return;
		try {
			const response = await fetch(ruta.archivo_url);
			if (!response.ok) throw new Error("No se pudo descargar el archivo.");
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = ruta.archivo_nombre || `ruta-${ruta.id}.${ruta.formato_origen}`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			notificar({ titulo: "Descarga fallida", mensaje: extraerMensajeError(error), variante: "error" });
		}
	};

	const guardando = crearRuta.isPending || editarRuta.isPending;

	return (
		<SeccionInfoGroup>
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-xl font-semibold">Rutas de acceso</h2>
						<p className="text-sm text-foreground/60">{limnigrafoCodigo ? `Limnígrafo ${limnigrafoCodigo}` : "Rutas asociadas"}</p>
					</div>
					{puedeEditar && (
						<Button type="button" onClick={abrirNueva} className="gap-2">
							<Plus className="h-4 w-4" />
							Cargar ruta
						</Button>
					)}
				</div>

				{rutasQuery.isLoading ? (
					<p className="text-sm text-foreground/70">Cargando rutas de acceso...</p>
				) : rutasQuery.isError ? (
					<div className="flex items-center justify-between gap-3 rounded-md border border-error/40 p-3 text-sm text-error">
						<span>No se pudieron cargar las rutas de acceso.</span>
						<Button type="button" variant="outline" onClick={() => rutasQuery.refetch()}>Reintentar</Button>
					</div>
				) : rutas.length === 0 ? (
					<p className="rounded-md border border-dashed border-foreground/20 p-4 text-sm text-foreground/70">No hay rutas de acceso cargadas para este limnígrafo.</p>
				) : (
					<div className="grid gap-3">
						{rutas.map((ruta) => (
							<div key={ruta.id} className="rounded-md border border-foreground/10 p-4">
								<div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<h3 className="font-semibold">{ruta.nombre}</h3>
											<span className="rounded-md bg-foreground/10 px-2 py-0.5 text-xs uppercase">{ruta.formato_origen}</span>
										</div>
										<p className="mt-1 text-sm text-foreground/70">
											{ruta.tiempo_estimado_minutos ? `${ruta.tiempo_estimado_minutos} min` : "Sin tiempo estimado"}
											{ruta.distancia_km != null ? ` · ${ruta.distancia_km} km` : ""}
										</p>
										{ruta.observaciones && (
											<p className="mt-2 text-sm text-foreground/80">{ruta.observaciones}</p>
										)}
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setRutaSeleccionada(rutaSeleccionada?.id === ruta.id ? null : ruta)}>
											{rutaSeleccionada?.id === ruta.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
											{rutaSeleccionada?.id === ruta.id ? "Ocultar" : "Ver en mapa"}
										</Button>
										<Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => descargarRuta(ruta)}>
											<Download className="h-4 w-4" />
											Descargar
										</Button>
										{puedeEditar && (
											<>
												<BotonIconoEditar onClick={() => abrirEditar(ruta)} />
												<BotonIconoEliminar onClick={() => setRutaEliminar(ruta)} />
											</>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{rutaSeleccionada && (
					<RutaAccesoMapa ruta={rutaSeleccionada} ubicacion={ubicacion} />
				)}
			</div>

			<Dialog open={modalAbierto} onOpenChange={(open) => !open && cerrarModal()}>
				<DialogContent className="bg-ventana">
					<DialogTitle>{rutaEditando ? "Modificar ruta de acceso" : "Cargar ruta de acceso"}</DialogTitle>
					<DialogDescription>
						{rutaEditando ? "Podés modificar los datos y reemplazar el archivo asociado." : "Cargá un archivo GPX o KML y completá sus datos descriptivos."}
					</DialogDescription>
					<div className="grid gap-4">
						<label className="grid gap-1 text-sm">
							<span>Nombre</span>
							<Input value={form.nombre} onChange={(event) => setForm((actual) => ({ ...actual, nombre: event.target.value }))} />
						</label>
						<label className="grid gap-1 text-sm">
							<span>Tiempo estimado en minutos</span>
							<Input type="number" min="0" value={form.tiempo_estimado_minutos} onChange={(event) => setForm((actual) => ({ ...actual, tiempo_estimado_minutos: event.target.value }))} />
						</label>
						<label className="grid gap-1 text-sm">
							<span>Observaciones</span>
							<Textarea value={form.observaciones} onChange={(event) => setForm((actual) => ({ ...actual, observaciones: event.target.value }))} />
						</label>
						<label className="grid gap-1 text-sm">
							<span>{rutaEditando ? "Reemplazar archivo" : "Archivo GPX o KML"}</span>
							<Input type="file" accept=".gpx,.kml" onChange={(event) => handleArchivo(event.target.files?.[0] ?? null)} />
							{rutaEditando?.archivo_nombre && !form.archivo && (
								<span className="text-xs text-foreground/60">Archivo actual: {rutaEditando.archivo_nombre}</span>
							)}
							{form.archivo && (
								<span className="text-xs text-foreground/60">Archivo seleccionado: {form.archivo.name}</span>
							)}
						</label>
					</div>
					<div className="flex justify-between gap-3">
						<Button type="button" variant="outline" onClick={cerrarModal}>Cancelar</Button>
						<Boton type="button" className="mx-0 gap-2" onClick={submitRuta} disabled={guardando}>
							<FileUp className="h-4 w-4" />
							{guardando ? "Guardando..." : "Guardar"}
						</Boton>
					</div>
				</DialogContent>
			</Dialog>

			<VentanaConfirmar
				open={!!rutaEliminar}
				onClose={() => setRutaEliminar(null)}
				onConfirm={() => eliminarRuta.mutate({ params: { id: String(rutaEliminar?.id ?? "") } })}
				title="Eliminar ruta de acceso"
				description={`¿Está seguro que desea eliminar la ruta "${rutaEliminar?.nombre ?? ""}"?`}
				variant="eliminar"
			/>
		</SeccionInfoGroup>
	);
}
