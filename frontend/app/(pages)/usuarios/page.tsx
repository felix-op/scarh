"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import DataTable from "@componentes/tabla/DataTable";
import { ActionConfig, ColumnConfig } from "@componentes/tabla/types";
import ActionMenu from "@componentes/tabla/ActionMenu";
import VentanaAgregrarUsuario from "./componentes/VentanaAgregarUsuario";
import BotonVariante from "@componentes/botones/BotonVariante";
import { UsuarioResponse } from "types/usuarios";
import { useGetUsuarios } from "@servicios/api";
import BotonIconoEditar from "@componentes/botones/BotonIconoEditar";
import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import usePaginadoBackend from "@hooks/usePaginadoBackend";
import FiltrosContenedor from "@componentes/filtros/FiltrosContenedor";
import FiltroBusqueda from "@componentes/filtros/FiltroBusqueda";
import FiltroOpciones from "@componentes/filtros/FiltroOpciones";
import { opcionesEstado } from "./constantes";
import ChipEstadoUsuario from "@componentes/chips/ChipEstadoUsuario";
import { useNotificar } from "@hooks/useNotificar";

const queriesToInvalidate = ["useGetUsuarios"];

export default function UsersAdminPage() {
	const [page, setPage] = useState(1);
	const [lengthPages, setLengthPages] = useState(5);
	const [isOpenFiltros, setIsOpenFiltros] = useState(false);
	const [search, setSearch] = useState("");
	const [estado, setEstado] = useState("");
	
	const { data: usuarios, isLoading, isRefetching } = useGetUsuarios({
		params: {
			queryParams: {
				page: String(page),
				limit: String(lengthPages),
				search,
				is_active: estado,
			},
		}
	});
	
	const [usuarioEditar, setUsuarioEditar] = useState<UsuarioResponse | null>(null);
	const notificar = useNotificar();

	// --- Modal añadir ---
	const [isAddOpen, setIsAddOpen] = useState(false);
	const handleOpenAdd = () => setIsAddOpen(true);
	const handleCancelAdd = () => setIsAddOpen(false);

	// --- Modal editar ---
	const [isEditOpen, setIsEditOpen] = useState(false);
	const handleCancelEdit = () => {
		setUsuarioEditar(null);
		setIsEditOpen(false);
	}

	// --- Modal eliminar ---
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const handleCloseDelete = () => {
		setUsuarioEditar(null);
		setIsDeleteOpen(false);
	}

	const handleOpenInfo = (message: VentanaAceptarOptions) => {
		notificar({
			titulo: message.title,
			mensaje: message.description,
			variante: message.variant,
			desaparecerEnMS: message.variant === "error" || message.variant === "alerta" ? false : 2500,
		});
	};

	const handleViewUser = (usuario: UsuarioResponse) => {
		router.push(`/usuarios/${usuario.id}`);
	};

	// Configuración de la tabla
	const columns: ColumnConfig<UsuarioResponse>[] = [
		{
			id: "estado",
			header: "Estado",
			cell: (row) => <div className="px-4"><ChipEstadoUsuario estado={row.estado ? "activo" : "inactivo"} /></div>,
		},
		{
			id: "nombre",
			header: "Nombre",
			cell: (row) => <p className="p-4">{`${row.first_name} ${row.last_name}`}</p>,
		},
		{
			id: "legajo",
			header: "Legajo",
			accessorKey: "legajo",
			cell: (row) => <p className="p-4">{row.legajo || "No cargado"}</p>,
		},
	];

	const actionConfig: ActionConfig<UsuarioResponse> = {
		typeAction: "fila",
		actionColumns: (row) => (
			<ActionMenu>
				<BotonVariante
					variant="editar"
					className="hidden lg:flex"
					onClick={() => {
						handleViewUser(row);
					}}
				/>
				<BotonIconoEditar
					className="lg:hidden"
					onClick={() => {
						handleViewUser(row);
					}}
				/>
			</ActionMenu>
		),
	};

	const paginationConfig = usePaginadoBackend({
		data: usuarios,
		page,
		setPage,
		lengthOptions: [5, 10, 20],
		lengthPages,
		setLengthPages,
	});

	const router = useRouter();

	const onSearch = useCallback((value: string) => {
		setPage(1);
		setSearch(value);
	}, [setPage, setSearch]);

	return (
		<PaginaBase>
			<div className="flex flex-col gap-4">
				<h1>Administración de usuarios</h1>
				<p>
					Seleccioná un usuario de la lista para ver o editar su
					información.
				</p>

				<FiltrosContenedor open={isOpenFiltros}>
					<h4>Filtros</h4>
					<div className="flex flex-col lg:flex-row lg:items-center gap-4">
						<div className="flex-2">
							<FiltroBusqueda
								label="Buscar"
								onSearch={onSearch}
								placeholder="Por nombre, apellido, email, documento o nombre de usuario"
							/>
						</div>
						<div className="flex-1">
							<FiltroOpciones
								title="Estado"
								options={opcionesEstado}
								onSelect={(value) => {
									setPage(1);
									setEstado(value);
								}}
							/>
						</div>
					</div>
				</FiltrosContenedor>

				<DataTable
					data={usuarios?.results || []}
					columns={columns}
					rowIdKey="id"
					minWidth={320}
					onAdd={handleOpenAdd}
					onFilter={() => {
						setIsOpenFiltros((prev) => !prev)
					}}
					actionConfig={actionConfig}
					isLoading={isLoading || isRefetching}
					paginationConfig={paginationConfig}
				/>
			</div>
			<VentanaAgregrarUsuario
				open={isAddOpen}
				onClose={handleCancelAdd}
				usuarios={[]}
				handleMessage={handleOpenInfo}
				queriesToInvalidate={queriesToInvalidate}
			/>
			<VentanaEditarUsuario
				open={isEditOpen}
				onClose={handleCancelEdit}
				usuarios={[]}
				handleMessage={handleOpenInfo}
				usuario={usuarioEditar}
				queriesToInvalidate={queriesToInvalidate}
			/>
			<VentanaEliminarUsuario
				open={isDeleteOpen}
				onClose={handleCloseDelete}
				handleMessage={handleOpenInfo}
				usuario={usuarioEditar}
				queriesToInvalidate={queriesToInvalidate}
			/>
		</PaginaBase>
	);
}
