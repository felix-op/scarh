"use client";

import FilterBar from "@componentes/FilterBar";
import HistorialCard from "@componentes/HistorialCard";
import HistorialTable from "@componentes/HistorialTable";
import { Nav } from "@componentes/Nav";

const FILTER_USERS = [
	"Todos",
	"admin",
	"marcela",
	"federico",
	"ximena",
	"invitado",
];

const FILTER_ACTIONS = [
	"Todos",
	"Creación",
	"Modificación",
	"Eliminación",
	"Carga manual de datos",
	"Edición de métricas",
	"Edición de estadísticas",
];

const FILTER_ENTITIES = [
	"Todas",
	"Limnígrafo",
	"Métrica",
	"Estadística",
	"Usuario",
	"Dashboard",
	"Catálogo",
];

const HISTORIAL_FILAS = [
	{
		id: "h-1",
		usuario: "admin",
		accion: "Modificación",
		entidad: "Limnígrafo",
		descripcion: "Actualizó nivel manual",
		fechaHora: "2025-11-20 14:23",
		registroId: "LMN-0458",
		estado: "Exitoso",
	},
	{
		id: "h-2",
		usuario: "marcela",
		accion: "Creación",
		entidad: "Métrica",
		descripcion: "Agregó valor manual de temperatura",
		fechaHora: "2025-11-21 10:15",
		registroId: "MET-1021",
		estado: "Exitoso",
	},
	{
		id: "h-3",
		usuario: "federico",
		accion: "Eliminación",
		entidad: "Estadística",
		descripcion: "Eliminó datos estadisticos",
		fechaHora: "2025-11-22 09:05",
		registroId: "EST-3304",
		estado: "En revisión",
	},
	{
		id: "h-4",
		usuario: "ximena",
		accion: "Modificación",
		entidad: "Usuario",
		descripcion: "Actualizó permisos",
		fechaHora: "2025-11-23 16:40",
		registroId: "USR-0099",
		estado: "Exitoso",
	},
	{
		id: "h-5",
		usuario: "admin",
		accion: "Carga manual de datos",
		entidad: "Limnígrafo",
		descripcion: "Cargó limnigrafos",
		fechaHora: "2025-11-23 08:20",
		registroId: "LMN-0458",
		estado: "Exitoso",
	},
	{
		id: "h-6",
		usuario: "marcela",
		accion: "Edición de métricas",
		entidad: "Métrica",
		descripcion: "Normalizó valores fuera de rango",
		fechaHora: "2025-11-23 11:10",
		registroId: "MET-1021",
		estado: "Exitoso",
	},
	{
		id: "h-7",
		usuario: "federico",
		accion: "Edición de estadísticas",
		entidad: "Estadística",
		descripcion: "descrip x",
		fechaHora: "2025-11-23 12:45",
		registroId: "EST-3304",
		estado: "Exitoso",
	},
];

export default function HistorialPage() {
	return (
		<div className="flex min-h-screen w-full bg-[#EEF4FB]">
			<Nav
				userName="Juan Perez"
				userEmail="juan.perez@scarh.com"
				onProfileClick={() => {
					try {
						window.location.href = "/perfil";
					} catch {
						// noop
					}
				}}
			/>

			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1568px] flex-col gap-8">
					<header className="flex flex-col gap-1">
						<h1 className="text-[34px] font-semibold text-[#011018]">Historial</h1>
						<p className="text-[16px] text-[#4B4B4B]">
							Registros de acciones sobre limnígrafos, métricas y usuarios.
						</p>
					</header>

					<FilterBar
						users={FILTER_USERS}
						actions={FILTER_ACTIONS}
						entities={FILTER_ENTITIES}
					/>

					<div className="grid gap-6 xl:grid-cols-[3fr_1.2fr]">
						<section className="flex flex-col gap-4 rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
										Historial de acciones
									</p>
								</div>
								<span className="rounded-full bg-[#F1F5F9] px-4 py-1 text-[13px] font-semibold text-[#475569]">
									{HISTORIAL_FILAS.length} registros
								</span>
							</div>

							<HistorialTable rows={HISTORIAL_FILAS} />
						</section>

						<HistorialCard
							actionsToday={7}
							lastAction="Actualizó permisos de usuario"
							lastUser="ximena"
							lastTimestamp="2025-11-23 16:40"
							pendingReviews={1}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
