"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import DataTable from "@componentes/tabla/DataTable";
import type { ActionConfig, ColumnConfig } from "@componentes/tabla/types";
import FiltrosContenedor from "@componentes/filtros/FiltrosContenedor";
import FiltroBusqueda from "@componentes/filtros/FiltroBusqueda";
import FiltroOpciones from "@componentes/filtros/FiltroOpciones";
import ActionMenu from "@componentes/tabla/ActionMenu";
import BotonVariante from "@componentes/botones/BotonVariante";
import BotonIconoEditar from "@componentes/botones/BotonIconoEditar";
import { EstadoLimnigrafo, LimnigrafoResponse } from "types/limnigrafos";
import usePaginadoBackend from "@hooks/usePaginadoBackend";
import VentanaAgregrarLimnigrafo from "./componentes/VentanaAgregarLimnigrafo";
import VentanaAceptar, { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import { defaultMessage, opcionesEstado } from "./constantes";
import { useGetLimnigrafos } from "@servicios/api/limnigrafos";
import { ESTILOS_ESTADO_LIMNIGRAFO } from "@componentes/chips/ChipEstadoLimnigrafo";
import FiltroFecha from "@componentes/filtros/FiltroFecha";
import BotonIconoIr from "@componentes/botones/BotonIconoIr";
import { useTieneRol } from "@hooks/useTieneRol";
import Alerta from "@componentes/alertas/Alerta";

type EstadoFiltro = "" | EstadoLimnigrafo;

const queriesToInvalidate = ["useGetLimnigrafos"];

function toStartOfDayIso(value: string): string | undefined {
	if (!value) {
		return undefined;
	}

	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) {
		return undefined;
	}

	return date.toISOString();
}

function toEndOfDayIso(value: string): string | undefined {
	if (!value) {
		return undefined;
	}

	const date = new Date(`${value}T23:59:59.999`);
	if (Number.isNaN(date.getTime())) {
		return undefined;
	}

	return date.toISOString();
}

function formatUltimoRegistro(value?: string | null): string {
	if (!value) {
		return "Sin registros";
	}

	const fecha = new Date(value);
	if (Number.isNaN(fecha.getTime())) {
		return "Sin registros";
	}

	return `${fecha.toLocaleDateString("es-AR")} ${fecha.toLocaleTimeString("es-AR", {
		hour: "2-digit",
		minute: "2-digit",
	})}`;
}

function formatBateria(value?: number | null): string {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return "No disponible";
	}

	return `${Math.trunc(value)} %`;
}

function ChipEstadoTabla({ estado }: { estado: LimnigrafoResponse["estado"] }) {
	const variante =
		estado === "fuera_de_rango" || estado === "fuera_de_servicio"
			? "fuera"
			: estado === "normal"
				? "normal"
				: estado;
	const config = ESTILOS_ESTADO_LIMNIGRAFO[variante] ?? ESTILOS_ESTADO_LIMNIGRAFO.normal;

	return (
		<span className={`inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-sm font-semibold ${config.lightClassName} ${config.darkClassName}`}>
			<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white shadow-[0px_0px_0px_1px_rgba(148,163,184,0.18)] dark:bg-[#223149]">
				<span
					className="block h-3.5 w-3.5 rounded-full border"
					style={{ backgroundColor: config.backgroundColor, borderColor: config.borderColor }}
				/>
			</span>
			{config.etiqueta}
		</span>
	);
}

export default function Home() {
	const router = useRouter();
	const esAdministrador = useTieneRol("administracion");
	const esEditor = useTieneRol("limnigrafos-editar");

	const [page, setPage] = useState(1);
	const [lengthPages, setLengthPages] = useState(5);
	const [search, setSearch] = useState("");
	const [estado, setEstadoFilter] = useState<EstadoFiltro>("");
	const [ultimaConexionDesde, setUltimaConexionDesde] = useState("");
	const [ultimaConexionHasta, setUltimaConexionHasta] = useState("");
	const [message, setMessage] = useState(defaultMessage);

	// --- Modal añadir ---
	const [isAddOpen, setIsAddOpen] = useState(false);
	const handleOpenAdd = () => setIsAddOpen(true);
	const handleCancelAdd = () => setIsAddOpen(false);

	// --- Modal informar ---
	const [isOpenInfo, setIsOpenInfo] = useState(false);
	const handleOpenInfo = (m: VentanaAceptarOptions) => {
		setMessage(m);
		setIsOpenInfo(true);
	};
	const handleCloseInfo = () => setIsOpenInfo(false);

	const [isOpenFiltros, setIsOpenFiltros] = useState(false);

	const { data: limnigrafos, isFetching: isLoadingLimnigrafos } = useGetLimnigrafos({
		params: {
			queryParams: {
				page: String(page),
				limit: String(lengthPages),
				search,
				estado,
				...(toStartOfDayIso(ultimaConexionDesde) ? { ultima_conexion_desde: toStartOfDayIso(ultimaConexionDesde) } : {}),
				...(toEndOfDayIso(ultimaConexionHasta) ? { ultima_conexion_hasta: toEndOfDayIso(ultimaConexionHasta) } : {}),
			}
		}
	});

	const paginationConfig = usePaginadoBackend({
		data: limnigrafos,
		page,
		setPage,
		lengthOptions: [5, 10, 20],
		lengthPages,
		setLengthPages,
	});

	const columns: ColumnConfig<LimnigrafoResponse>[] = [
		{
			id: "estado",
			header: "Estado",
			cell: (row) => <div className="p-4"><ChipEstadoTabla estado={row.estado} /></div>,
		},
		{
			id: "codigo",
			header: "Limnígrafo",
			accessorKey: "codigo",
		},
		{
			id: "ubicacion",
			header: "Ubicación",
			cell: (row) => {
				const ubicacion = row.ubicacion;
				return (
					<p className="p-4">{ubicacion ? ubicacion.nombre : "No asignada"}</p>
				);
			},
		},
		{
			id: "bateria",
			header: "Batería",
			cell: (row) => (
				<p className="p-4">{formatBateria(row.bateria)}</p>
			),
		},
		{
			id: "ultima_conexion",
			header: "Tiem. Último Dato",
			cell: (row) => (
				<p className="p-4">{formatUltimoRegistro(row.ultima_conexion)}</p>
			),
		},
	];

	const handleVerMas = (row: LimnigrafoResponse) => {
		router.push(`/limnigrafos/detalleLimnigrafo?id=${encodeURIComponent(String(row.id))}`);
	}

	const handleEdit = (row: LimnigrafoResponse) => {
		router.push(`/limnigrafos/editar/${row.id}`);
	}

	const handleSearch = (value: string) => {
		setPage(1);
		setSearch(value);
	};

	const handleEstadoFilter = (value: string) => {
		setPage(1);
		setEstadoFilter(value as EstadoFiltro);
	};

	const handleUltimaConexionDesde = (value: string) => {
		setPage(1);
		setUltimaConexionDesde(value);
	};

	const handleUltimaConexionHasta = (value: string) => {
		setPage(1);
		setUltimaConexionHasta(value);
	};

	const actionConfig: ActionConfig<LimnigrafoResponse> = {
		typeAction: "fila",
		actionColumns: (row) => (
			<ActionMenu>
				{(esAdministrador || esEditor) && (
					<>
						<BotonVariante
							variant="editar"
							className="hidden xl:flex"
							onClick={() => {
								handleEdit(row);
							}}
						/>
						<BotonIconoEditar
							className="xl:hidden"
							onClick={() => {
								handleEdit(row);
							}}
						/>
					</>
				)}
				<BotonVariante
					variant="ir"
					className="hidden xl:flex"
					onClick={() => {
						handleVerMas(row);
					}}
				/>
				<BotonIconoIr
					className="xl:hidden"
					onClick={() => {
						handleVerMas(row);
					}}
				/>
			</ActionMenu>
		),
	};

	return (
		<PaginaBase>
			<div className="flex flex-col gap-4">
				<h1>Limnigrafos</h1>
				<p>
					Gestiona el inventario de limnigrafos, agrega nuevos equipos y revisa su ubicacion y estado general.
				</p>
				{!(esAdministrador || esEditor) && (
					<Alerta variant="alerta">
						<p>No tenés permisos para agregar, editar o eliminar limnígrafos. Contactá a un administrador si necesitás acceso.</p>
					</Alerta>
				)}
				<FiltrosContenedor open={isOpenFiltros}>
					<h4>Filtros</h4>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1">
								<FiltroBusqueda
									label="Buscar"
									placeholder="Por código o ubicación"
									initialSearch={search}
									onSearch={handleSearch}
								/>
							</div>
							<div className="w-full md:max-w-[240px]">
								<FiltroOpciones
									title="Estado"
									options={opcionesEstado}
									onSelect={handleEstadoFilter}
								/>
							</div>
						</div>
						<div>
							<FiltroFecha
								title="Tiempo desde el último dato"
								onChangeInicio={handleUltimaConexionDesde}
								onChangeFin={handleUltimaConexionHasta}
							/>
						</div>
					</div>
				</FiltrosContenedor>
				<DataTable
					data={limnigrafos?.results || []}
					columns={columns}
					rowIdKey="id"
					minWidth={600}
					onAdd={(esAdministrador || esEditor) ? handleOpenAdd : undefined}
					onFilter={() => setIsOpenFiltros((prev) => !prev)}
					actionConfig={actionConfig}
					paginationConfig={paginationConfig}
					isLoading={isLoadingLimnigrafos}
				/>
			</div>
			<VentanaAgregrarLimnigrafo
				open={isAddOpen}
				onClose={handleCancelAdd}
				queriesToInvalidate={queriesToInvalidate}
				handleMessage={handleOpenInfo}
			/>
			<VentanaAceptar
				open={isOpenInfo}
				onClose={handleCloseInfo}
				options={message}
			/>
		</PaginaBase>
	);
}
