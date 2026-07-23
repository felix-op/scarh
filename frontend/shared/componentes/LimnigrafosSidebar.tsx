"use client";

import { useState } from "react";
import { Input } from "@componentes/components/ui/input";
import { Button } from "@componentes/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@componentes/components/ui/select";
import type { LimnigrafoDetalleData } from "@data/limnigrafos";
import type { VarianteEstadoLimnigrafo } from "./BotonEstadoLimnigrafo";
import { MapPin, Eye } from "lucide-react";

export type LimnigrafosSidebarProps = {
	limnigrafos: LimnigrafoDetalleData[];
	selectedLimnigrafo: LimnigrafoDetalleData | null;
	onSelectLimnigrafo: (limnigrafo: LimnigrafoDetalleData) => void;
	onEditUbicacion?: (limnigrafo: LimnigrafoDetalleData) => void;
	onVerEnMapa?: (limnigrafo: LimnigrafoDetalleData) => void;
};

const estadoColor: Record<string, string> = {
	activo: "#82d987",
	advertencia: "#facc15",
	peligro: "#ef4444",
	fuera: "#d65757",
};

type FiltroEstado = "todos" | VarianteEstadoLimnigrafo;

const opcionesEstado: { label: string; value: FiltroEstado }[] = [
	{ label: "Todos", value: "todos" },
	{ label: "Fuera de rango", value: "fuera" },
	{ label: "Peligro", value: "peligro" },
	{ label: "Advertencia", value: "advertencia" },
	{ label: "Activo", value: "activo" },
];

const prioridadEstado: Record<VarianteEstadoLimnigrafo, number> = {
	fuera: 0,
	peligro: 1,
	advertencia: 2,
	activo: 3,
};

function getEstadoColor(variant?: string) {
	return estadoColor[variant ?? "activo"] ?? "#82d987";
}

function getPrioridadEstado(variant?: VarianteEstadoLimnigrafo) {
	return prioridadEstado[variant ?? "activo"] ?? prioridadEstado.activo;
}

export function LimnigrafosSidebar({
	limnigrafos,
	selectedLimnigrafo,
	onSelectLimnigrafo,
	onEditUbicacion,
	onVerEnMapa,
}: LimnigrafosSidebarProps) {
	const [search, setSearch] = useState("");
	const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
	const [filtroUbicacion, setFiltroUbicacion] = useState<"todos" | "sin-ubicacion">("todos");

	const filtrados = [...limnigrafos]
		.filter((lim) => {
			const matchesSearch =
				lim.nombre.toLowerCase().includes(search.toLowerCase()) ||
				lim.ubicacion.toLowerCase().includes(search.toLowerCase());
			const matchesEstado = filtroEstado === "todos" || lim.estado.variante === filtroEstado;
			const matchesUbicacion = filtroUbicacion === "todos"
				|| (filtroUbicacion === "sin-ubicacion" && (!lim.coordenadas || (lim.coordenadas.lat === 0 && lim.coordenadas.lng === 0)));
			return matchesSearch && matchesEstado && matchesUbicacion;
		})
		.sort((a, b) => {
			if (filtroEstado !== "todos") {
				return a.nombre.localeCompare(b.nombre, "es");
			}

			return (
				getPrioridadEstado(a.estado.variante) - getPrioridadEstado(b.estado.variante)
				|| a.nombre.localeCompare(b.nombre, "es")
			);
		});

	const isSelected = (lim: LimnigrafoDetalleData) => selectedLimnigrafo?.id === lim.id;

	return (
		<aside className="absolute top-4 right-4 z-[1000] w-80 max-h-[calc(100%-2rem)] flex flex-col rounded-[24px] bg-white/95 dark:bg-[#1B1F25]/95 backdrop-blur-md shadow-[0px_8px_24px_rgba(0,0,0,0.2)] border border-white/30 dark:border-white/10">
			<div className="p-4 pb-0">
				<h2 className="text-xl font-semibold mb-3 text-foreground-title">
					Limnigrafos
				</h2>

				<div className="flex gap-2 mb-4">
					<div className="flex-1">
						<Select
							value={filtroEstado}
							onValueChange={(value) => setFiltroEstado(value as FiltroEstado)}
						>
							<SelectTrigger
								size="sm"
								className="h-8 w-full rounded-full border-border/60 bg-white px-3 text-[11px] font-bold text-foreground-title shadow-sm hover:bg-background-muted dark:border-white/10 dark:bg-[#23272F] dark:text-[#F6F6F6] dark:hover:bg-[#292C31]"
								aria-label="Filtrar limnígrafos por estado"
							>
								<SelectValue placeholder="Estado" />
							</SelectTrigger>
							<SelectContent
								align="start"
								className="z-[1100] border-border/70 bg-white text-foreground-title shadow-lg dark:border-white/10 dark:bg-[#23272F] dark:text-[#F6F6F6]"
							>
								{opcionesEstado.map((opcion) => (
									<SelectItem key={opcion.value} value={opcion.value}>
										{opcion.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Filtro Ubicación */}
					<div className="flex-1 flex bg-muted/40 dark:bg-white/5 rounded-full p-0.5 border border-border/40">
						<button
							onClick={() => setFiltroUbicacion("todos")}
							className={`flex-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all ${
								filtroUbicacion === "todos" 
									? "bg-white dark:bg-white/20 shadow-sm text-principal" 
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Ubicación
						</button>
						<div className="w-[1px] bg-border/30 my-1.5" />
						<button
							onClick={() => setFiltroUbicacion("sin-ubicacion")}
							className={`flex-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
								filtroUbicacion === "sin-ubicacion" 
									? "bg-principal text-white shadow-sm" 
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Sin Ubic.
						</button>
					</div>
				</div>

				<div className="mb-3">
					<Input
						placeholder="Busque por nombre o ubicación"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="rounded-full bg-background/80 text-sm h-9"
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto custom-scroll px-4 pb-4 space-y-2">
				{limnigrafos.length === 0 ? (
					<div className="text-center text-muted-foreground mt-8 space-y-3">
						<p className="text-sm">Aun no hay limnígrafos ubicados en el mapa</p>
						<div className="flex justify-center">
							<span className="w-2 h-2 rounded-full border border-current"></span>
						</div>
						<p className="text-sm">Aun no hay limnígrafos cargados en el sistema</p>
					</div>
				) : filtrados.length === 0 ? (
					<div className="text-center text-muted-foreground mt-8">
						<p className="text-sm">No se encontraron limnígrafos con los filtros actuales.</p>
					</div>
				) : (
					filtrados.map((lim) => (
						<div
							key={lim.id}
							className={`w-full rounded-2xl border-2 transition-all ${
								isSelected(lim)
									? "border-principal bg-principal/5 shadow-sm"
									: "border-transparent hover:border-border/50"
							}`}
						>
							<button
								onClick={() => onSelectLimnigrafo(lim)}
								className="w-full text-left p-2.5 focus:outline-none flex items-center gap-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl"
							>
								<div className="flex items-center justify-center shrink-0">
									<div
										className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
										style={{ backgroundColor: getEstadoColor(lim.estado.variante) }}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="text-sm font-semibold text-foreground-title leading-tight truncate">
										{lim.nombre}
									</h3>
									<p className="text-xs text-muted-foreground truncate">
										Ubicacion: {lim.ubicacion || "Desconocida"}
									</p>
								</div>
								<div className="text-[10px] text-muted-foreground border-l border-border/40 pl-2 flex flex-col justify-center shrink-0">
									{lim.coordenadas && lim.coordenadas.lat !== undefined && lim.coordenadas.lng !== undefined ? (
										<>
											<div>alt:{lim.altura || "0.0"}</div>
											<div>x:{Number(lim.coordenadas.lat).toFixed(1)}</div>
											<div>y:{Number(lim.coordenadas.lng).toFixed(1)}</div>
										</>
									) : (
										<div className="text-advertencia italic">Sin coords</div>
									)}
								</div>
							</button>

							{/* Botones expandidos cuando está seleccionado */}
							{isSelected(lim) && (
								<div className="flex gap-2 px-2.5 pb-2.5 pt-1">
									<Button
										variant="outline"
										size="sm"
										className="flex-1 rounded-xl text-[11px] h-7 gap-1"
										onClick={(e) => {
											e.stopPropagation();
											onEditUbicacion?.(lim);
										}}
									>
										<MapPin className="h-3 w-3" />
										Editar Ubicación
									</Button>
									{lim.coordenadas && (
										<Button
											variant="outline"
											size="sm"
											className="flex-1 rounded-xl text-[11px] h-7 gap-1"
											onClick={(e) => {
												e.stopPropagation();
												onVerEnMapa?.(lim);
											}}
										>
											<Eye className="h-3 w-3" />
											Ver en el mapa
										</Button>
									)}
								</div>
							)}
						</div>
					))
				)}
			</div>
		</aside>
	);
}
