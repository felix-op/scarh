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
import ChipEstadoLimnigrafo from "@componentes/chips/ChipEstadoLimnigrafo";
import FiltroFecha from "@componentes/filtros/FiltroFecha";

type EstadoFiltro = "" | EstadoLimnigrafo;

const queriesToInvalidate = ["useGetLimnigrafos"];

export default function Home() {
	const router = useRouter();
	
	const [page, setPage] = useState(1);
	const [lengthPages, setLengthPages] = useState(5);
	const [search, setSearch] = useState("");
	const [estado, setEstadoFilter] = useState<EstadoFiltro>("");
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
			cell: (row) => <div className="px-2"><ChipEstadoLimnigrafo estado={row.estado} /></div>,
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
				<p className="p-4">{row.bateria || "No disponible"}</p>
			),
		},
		{
			id: "ultima_conexion",
			header: "Tiem. Último Dato",
			cell: (row) => (
				<p className="p-4">{row.ultima_conexion || "No disponible"}</p>
			),
		},
	];

	const handleEdit = (row: LimnigrafoResponse) => {
		router.push(`/limnigrafos/detalleLimnigrafo?id=${row.id}`);
	}

	const actionConfig: ActionConfig<LimnigrafoResponse> = {
		typeAction: "fila",
		actionColumns: (row) => (
			<ActionMenu>
				<BotonVariante
					variant="editar"
					className="hidden lg:flex"
					onClick={() => {
						handleEdit(row);
					}}
				/>
				<BotonIconoEditar
					className="lg:hidden"
					onClick={() => {
						handleEdit(row);
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
				<FiltrosContenedor open={isOpenFiltros}>
					<h4>Filtros</h4>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1">
								<FiltroBusqueda
									label="Buscar"
									placeholder="Por código o ubicación"
									initialSearch={search}
									onSearch={(value) => setSearch(value)}
								/>
							</div>
							<div className="w-full md:max-w-[240px]">
								<FiltroOpciones
									title="Estado"
									options={opcionesEstado}
									onSelect={(value) => setEstadoFilter(value as EstadoFiltro)}
								/>
							</div>
						</div>
						<div>
							<FiltroFecha
								title="Tiempo desde el último dato"
								onChangeInicio={() => {}}
								onChangeFin={() => {}}
							/>
						</div>
					</div>
				</FiltrosContenedor>
				<DataTable
					data={limnigrafos?.results || []}
					columns={columns}
					rowIdKey="id"
					minWidth={600}
					onAdd={handleOpenAdd}
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
