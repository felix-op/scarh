"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import DataTable from "@componentes/tabla/DataTable";
import { ActionConfig, ColumnConfig } from "@componentes/tabla/types";
import VentanaAgregrarUsuario from "./componentes/VentanaAgregarUsuario";
import VentanaEditarUsuario from "./componentes/VentanaEditarUsuario";
import VentanaEliminarUsuario from "./componentes/VentanaEliminarUsuario";
import { UsuarioResponse } from "types/usuarios";
import { useGetUsuarios } from "@servicios/api";
import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import usePaginadoBackend from "@hooks/usePaginadoBackend";
import FiltrosContenedor from "@componentes/filtros/FiltrosContenedor";
import FiltroBusqueda from "@componentes/filtros/FiltroBusqueda";
import FiltroOpciones from "@componentes/filtros/FiltroOpciones";
import { opcionesEstado } from "./constantes";
import ChipEstadoUsuario from "@componentes/chips/ChipEstadoUsuario";
import { useNotificar } from "@hooks/useNotificar";
import { useTieneRol } from "@hooks/useTieneRol";
import Alerta from "@componentes/alertas/Alerta";
import MenuAcciones from "@componentes/menu/MenuAcciones";
import Icon from "@componentes/icons/Icon";

const queriesToInvalidate = ["useGetUsuarios"];

export default function UsersAdminPage() {
	const [page, setPage] = useState(1);
	const [lengthPages, setLengthPages] = useState(5);
	const [isOpenFiltros, setIsOpenFiltros] = useState(false);
	const [search, setSearch] = useState("");
	const [estado, setEstado] = useState("");
	const [usuarioEditar, setUsuarioEditar] = useState<UsuarioResponse | null>(null);
	const puedeEditar = useTieneRol("administracion");

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

	const notificar = useNotificar();

	// --- Modal añadir ---
	const [isAddOpen, setIsAddOpen] = useState(false);
	const handleOpenAdd = () => setIsAddOpen(true);
	const handleCancelAdd = () => setIsAddOpen(false);

	// --- Modal editar ---
	const [isEditOpen, setIsEditOpen] = useState(false);
	const handleOpenEdit = (usuario: UsuarioResponse) => {
		setUsuarioEditar(usuario);
		setIsEditOpen(true);
	};
	const handleCancelEdit = () => {
		setIsEditOpen(false);
		setUsuarioEditar(null);
	};

	// --- Modal eliminar ---
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const handleOpenDelete = (usuario: UsuarioResponse) => {
		setUsuarioEditar(usuario);
		setIsDeleteOpen(true);
	};
	const handleCancelDelete = () => {
		setIsDeleteOpen(false);
		setUsuarioEditar(null);
	};

	const handleOpenInfo = (message: VentanaAceptarOptions) => {
		notificar({
			titulo: message.title,
			mensaje: message.description,
			variante: message.variant,
			desaparecerEnMS: message.variant === "error" || message.variant === "alerta" ? false : 2500,
		});
	};

	const handlePermissions = (usuario: UsuarioResponse) => {
		router.push(`/usuarios/permisos/${usuario.id}`);
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
		typeAction: "menu",
		options: [
			{
				label: (
					<p className="flex items-center gap-2">
						<Icon variant="documento" className="text-2xl text-principal" />
						Detalles
					</p>
				),
				onClick: handleViewUser,
			},
			...(puedeEditar ? [
				{
					label: (
						<p className="flex items-center gap-2">
							<Icon variant="llave" className="text-2xl text-advertencia" />
							Permisos
						</p>
					),
					onClick: handlePermissions,
				},
				{
					label: (
						<p className="flex items-center gap-2">
							<Icon variant="editar" className="text-2xl text-exito" />
							Editar
						</p>
					),
					onClick: (usuario: UsuarioResponse) => handleOpenEdit(usuario),
				},
				{
					label: (
						<p className="flex items-center gap-2">
							<Icon variant="eliminar" className="text-2xl text-error" />
							Eliminar
						</p>
					),
					onClick: (usuario: UsuarioResponse) => handleOpenDelete(usuario),
				},
			] : []),
		]
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

				{!puedeEditar && (
					<Alerta variant="alerta">
						<p>No tenés permisos para agregar, editar o eliminar usuarios. Contactá a un administrador si necesitás acceso.</p>
					</Alerta>
				)}

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
					onAdd={puedeEditar ? handleOpenAdd : undefined}
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
				usuario={usuarioEditar}
				queriesToInvalidate={queriesToInvalidate}
				handleMessage={handleOpenInfo}
			/>
			<VentanaEliminarUsuario
				open={isDeleteOpen}
				onClose={handleCancelDelete}
				handleMessage={handleOpenInfo}
				queriesToInvalidate={queriesToInvalidate}
				onSuccess={handleCancelDelete}
				usuario={usuarioEditar}
			/>
		</PaginaBase>
	);
}
