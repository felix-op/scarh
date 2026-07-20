"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import DataTable from "@componentes/tabla/DataTable";
import { ActionConfig, ColumnConfig } from "@componentes/tabla/types";
import VentanaAgregrarUsuario from "./componentes/VentanaAgregarUsuario";
import VentanaEditarUsuario from "./componentes/VentanaEditarUsuario";
import VentanaEliminarUsuario from "./componentes/VentanaEliminarUsuario";
import VentanaPermisosMasivos from "./componentes/VentanaPermisosMasivos";
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
import Icon from "@componentes/icons/Icon";
import BotonVariante from "@componentes/botones/BotonVariante";

const queriesToInvalidate = ["useGetUsuarios", "useGetUsuario"];

export default function UsersAdminPage() {
	const [page, setPage] = useState(1);
	const [lengthPages, setLengthPages] = useState(5);
	const [isOpenFiltros, setIsOpenFiltros] = useState(false);
	const [search, setSearch] = useState("");
	const [estado, setEstado] = useState("");
	const [usuarioEditar, setUsuarioEditar] = useState<UsuarioResponse | null>(null);
	const [selectedUsers, setSelectedUsers] = useState<UsuarioResponse[]>([]);
	const esAdministrador = useTieneRol("administracion");
	const esEditor = useTieneRol("usuarios-editar");

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

	const [isBulkPermissionsOpen, setIsBulkPermissionsOpen] = useState(false);
	const handleOpenBulkPermissions = () => setIsBulkPermissionsOpen(true);
	const handleCloseBulkPermissions = () => setIsBulkPermissionsOpen(false);

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

	const usuariosPaginaActual = usuarios?.results || [];
	const selectedUserIds = useMemo(
		() => selectedUsers.map((usuario) => usuario.id),
		[selectedUsers],
	);

	const limpiarSeleccion = useCallback(() => {
		setSelectedUsers([]);
	}, []);

	const toggleUsuarioSeleccionado = useCallback((usuario: UsuarioResponse) => {
		setSelectedUsers((prev) => (
			prev.some((selected) => selected.id === usuario.id)
				? prev.filter((selected) => selected.id !== usuario.id)
				: [...prev, usuario]
		));
	}, []);

	const toggleTodosUsuariosPagina = useCallback((usuariosVisibles: UsuarioResponse[]) => {
		const idsVisibles = usuariosVisibles.map((usuario) => usuario.id);

		setSelectedUsers((prev) => {
			const prevIds = prev.map((usuario) => usuario.id);
			const todosSeleccionados = idsVisibles.every((id) => prevIds.includes(id));
			if (todosSeleccionados) {
				return prev.filter((usuario) => !idsVisibles.includes(usuario.id));
			}

			const nuevosUsuarios = usuariosVisibles.filter((usuario) => !prevIds.includes(usuario.id));
			return [...prev, ...nuevosUsuarios];
		});
	}, []);

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
			...(esAdministrador || esEditor ? [
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

	const topBar = (esAdministrador || esEditor) ? (
		<div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-wrap gap-2">
				<BotonVariante variant="agregar" onClick={handleOpenAdd} />
				<BotonVariante variant="filtro" onClick={() => {
					setIsOpenFiltros((prev) => !prev);
				}} />
				<BotonVariante
					onClick={handleOpenBulkPermissions}
					disabled={selectedUserIds.length === 0}
				>
					<span className="icon-[mdi--shield-account] text-2xl" />
					<span>{`Permisos masivos (${selectedUserIds.length})`}</span>
				</BotonVariante>
				{selectedUserIds.length > 0 && (
					<BotonVariante onClick={limpiarSeleccion}>
						<span className="icon-[mdi--broom] text-2xl" />
						<span>Limpiar selección</span>
					</BotonVariante>
				)}
			</div>
			<div className="text-sm text-foreground-secondary">
				{selectedUserIds.length > 0
					? `${selectedUserIds.length} usuario(s) seleccionado(s)`
					: "Seleccioná usuarios para aplicar permisos en lote"}
			</div>
		</div>
	) : undefined;

	return (
		<PaginaBase>
			<div className="flex flex-col gap-4">
				<h1>Administración de usuarios</h1>
				<p>
					Seleccioná un usuario de la lista para ver o editar su
					información.
				</p>

				{!(esAdministrador || esEditor) && (
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
					data={usuariosPaginaActual}
					columns={columns}
					rowIdKey="id"
					minWidth={320}
					onAdd={(esAdministrador || esEditor) ? handleOpenAdd : undefined}
					onFilter={!topBar ? () => {
						setIsOpenFiltros((prev) => !prev)
					} : undefined}
					actionConfig={actionConfig}
					isLoading={isLoading || isRefetching}
					paginationConfig={paginationConfig}
					topBar={topBar}
					selectionConfig={(esAdministrador || esEditor) ? {
						selectedRows: selectedUserIds,
						onToggleRow: toggleUsuarioSeleccionado,
						onToggleAll: toggleTodosUsuariosPagina,
						ariaLabel: (usuario) => `Seleccionar usuario ${usuario.nombre_usuario}`,
					} : undefined}
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
			<VentanaPermisosMasivos
				open={isBulkPermissionsOpen}
				onClose={handleCloseBulkPermissions}
				usuariosSeleccionados={selectedUsers}
				queriesToInvalidate={queriesToInvalidate}
				onSuccess={limpiarSeleccion}
			/>
		</PaginaBase>
	);
}
