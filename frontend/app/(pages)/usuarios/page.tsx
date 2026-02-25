"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import DataTable from "@componentes/tabla/DataTable";
import { ActionConfig, ColumnConfig } from "@componentes/tabla/types";
import { EstadoChip, EstadoVariant } from "@componentes/EstadoChip";
import ActionMenu from "@componentes/tabla/ActionMenu";
import VentanaAgregrarUsuario from "./componentes/VentanaAgregarUsuario";
import BotonVariante from "@componentes/botones/BotonVariante";
import { UsuarioResponse } from "types/usuarios";
import { useGetUsuarios } from "@servicios/api";
import BotonIconoIr from "@componentes/botones/BotonIconoIr";
import BotonIconoEditar from "@componentes/botones/BotonIconoEditar";
import VentanaEditarUsuario from "./componentes/VentanaEditarUsuario";
import VentanaAceptar, { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import BotonIconoEliminar from "@componentes/botones/BotonIconoEliminar";
import VentanaEliminarUsuario from "./componentes/VentanaEliminarUsuario";

const queriesToInvalidate = ["useGetUsuarios"];

const defaultMessage: VentanaAceptarOptions = {
	title: "",
	description: "",
	variant: "info",
};

export default function UsersAdminPage() {
	const { data: usuarios, isLoading, isRefetching } = useGetUsuarios({});
	const [usuarioEditar, setUsuarioEditar] = useState<UsuarioResponse | null>(null);
	const [busqueda, setBusqueda] = useState("");
	const [message, setMesage] = useState(defaultMessage);

	// --- Modal añadir ---
	const [isAddOpen, setIsAddOpen] = useState(false);
	const handleOpenAdd = () => setIsAddOpen(true);
	const handleCancelAdd = () => setIsAddOpen(false);

	// --- Modal editar ---
	const [isEditOpen, setIsEditOpen] = useState(false);
	const handleOpenEdit = (row: UsuarioResponse) => {
		setUsuarioEditar(row);
		setIsEditOpen(true);
	}
	const handleCancelEdit = () => {
		setUsuarioEditar(null);
		setIsEditOpen(false);
	}

	// --- Modal eliminar ---
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const handleOpenDelete = (row: UsuarioResponse) => {
		setUsuarioEditar(row);
		setIsDeleteOpen(true);
	}
	const handleCloseDelete = () => {
		setUsuarioEditar(null);
		setIsDeleteOpen(false);
	}

	// --- Modal informar ---
	const [isOpenInfo, setIsOpenInfo] = useState(false);
	const handleOpenInfo = (message: VentanaAceptarOptions) => {
		setMesage(message);
		setIsOpenInfo(true);
	};
	const handleCloseInfo = () => setIsOpenInfo(false);

	const renderEstadoPill = (variant: EstadoVariant, label: string) => {
		return (
			<div className="p-2">
				<EstadoChip variant={variant} label={label} />
			</div>
		);
	};

	const handleViewUser = (usuario: UsuarioResponse) => {
		router.push(`/usuarios/${usuario.id}`);
	};

	// Configuración de la tabla
	const columns: ColumnConfig<UsuarioResponse>[] = [
		{
			id: "estado",
			header: "Estado",
			cell: (row) => renderEstadoPill(row.estado ? "activo" : "inactivo", row.estado ? "Activo" : "Inactivo"),
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
		},
	];

	const actionConfig: ActionConfig<UsuarioResponse> = {
		typeAction: "fila",
		actionColumns: (row) => (
			<ActionMenu>
				<BotonVariante
					variant="editar"
					className="hidden xl:flex"
					onClick={() => {
						handleOpenEdit(row);
					}}
				/>
				<BotonIconoEditar
					className="xl:hidden"
					onClick={() => {
						handleOpenEdit(row);
					}}
				/>
				<BotonVariante
					variant="ir"
					className="hidden xl:flex"
					onClick={() => {
						handleViewUser(row);
					}}
				/>
				<BotonIconoIr
					className="xl:hidden"
					onClick={() => {
						handleViewUser(row);
					}}
				/>
				<BotonVariante
					variant="eliminar"
					className="hidden xl:flex"
					onClick={() => {
						handleOpenDelete(row);
					}}
				/>
				<BotonIconoEliminar
					className="xl:hidden"
					onClick={() => {
						handleOpenDelete(row);
					}}
				/>
			</ActionMenu>
		),
	};

	const filteredUsuarios = useMemo(() => {
		if (!usuarios) return [];
		const term = busqueda.trim().toLowerCase();
		if (!term) return usuarios;
		return usuarios.filter((u) =>
			[u.first_name, u.last_name, u.nombre_usuario, u.legajo, u.email]
				.filter(Boolean)
				.some((field) => String(field).toLowerCase().includes(term)),
		);
	}, [busqueda, usuarios]);

	const router = useRouter();

	return (
		<PaginaBase>
			<div className="flex flex-col gap-4">
				<h1>Administración de usuarios</h1>
				<p>
					Seleccioná un usuario de la lista para ver o editar su
					información.
				</p>

				<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
					<div className="flex flex-1 flex-wrap items-center gap-3">
						<div className="relative w-full max-w-xl">
							<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] icon-[mdi--magnify] text-xl" />
							<input
								type="text"
								value={busqueda}
								onChange={(e) => setBusqueda(e.target.value)}
								placeholder="Buscar por nombre, username, legajo o email"
								className="w-full rounded-full border border-[#E5E7EB] bg-[#F3F3F3] py-2.5 pl-11 pr-4 text-sm text-[#111827] shadow-[3px_4px_4px_rgba(0,0,0,0.19)] focus:border-[#0D76B3] focus:outline-none"
							/>
						</div>						
					</div>
				</div>

				<DataTable
					data={filteredUsuarios}
					columns={columns}
					rowIdKey="id"
					minWidth={320}
					onAdd={handleOpenAdd}
					actionConfig={actionConfig}
					isLoading={isLoading || isRefetching}
				/>
			</div>
			<VentanaAgregrarUsuario
				open={isAddOpen}
				onClose={handleCancelAdd}
				handleMessage={handleOpenInfo}
				queriesToInvalidate={queriesToInvalidate}
			/>
			<VentanaEditarUsuario
				open={isEditOpen}
				onClose={handleCancelEdit}
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
			<VentanaAceptar
				open={isOpenInfo}
				onClose={handleCloseInfo}
				options={message}
			/>
		</PaginaBase>
	);
}
