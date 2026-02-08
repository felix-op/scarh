"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AddUserModal, { NewUserData } from "@componentes/AddUserModal";
import ChangePasswordModal from "@componentes/ChangePasswordModal";
import PaginaBase from "@componentes/base/PaginaBase";
import { useGetUsuarios, usePostUsuario, usePutUsuario } from "@servicios/api/django.api";
import DataTable from "@componentes/tabla/DataTable";
import { ColumnConfig } from "@componentes/tabla/types";
import BotonVariante from "@componentes/botones/BotonVariante";
import { EstadoChip, EstadoVariant } from "@componentes/EstadoChip";

type Usuario = {
	id: string;
	nombre: string;
	username: string;
	legajo: string;
	email: string;
	estadoLabel: string;
	estadoVariant: EstadoVariant;
};

export default function UsersAdminPage() {
	const { data: users, isLoading } = useGetUsuarios({});
	const { mutate: postUser, isPending: isCreatingUser } = usePostUsuario({
		configuracion: {
			queriesToInvalidate: [["useGetUsuarios"]],
			refetch: true,
			onSuccess: (created) => {
				setIsAddOpen(false);
				// Seleccionar el nuevo usuario si viene en la respuesta
				const newId = (created as any)?.id ?? (created as any)?.nombre_usuario;
				if (newId) setSelectedId(String(newId));
			},
		},
	});
	const { mutate: putUser, isPending: isUpdatingUser } = usePutUsuario({
		configuracion: {
			queriesToInvalidate: [["useGetUsuarios"]],
			refetch: true,
		},
	});

	const [usuarios, setUsuarios] = useState<Usuario[]>([]);
	const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
	const [busqueda, setBusqueda] = useState("");
	const searchParams = useSearchParams();
	// --- Modal edición ---
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [editNombre, setEditNombre] = useState("");
	const [editUsername, setEditUsername] = useState("");
	const [editLegajo, setEditLegajo] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
	const [passwordTarget, setPasswordTarget] = useState<Usuario | undefined>(undefined);

	const normalizeApiUsuarios = (data: any): Usuario[] => {
		const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

		return list.map((u: any, idx: number) => {
			const nombreCompleto = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();
			const estadoActivo = Boolean(u?.estado);

			return {
				id: String(u?.id ?? u?.nombre_usuario ?? idx),
				nombre: nombreCompleto || u?.nombre_usuario || "Sin nombre",
				username: u?.nombre_usuario ?? String(u?.id ?? idx),
				legajo: String(u?.legajo ?? u?.id ?? u?.nombre_usuario ?? idx),
				email: u?.email ?? "-",
				estadoLabel: estadoActivo ? "Activo" : "Inactivo",
				estadoVariant: estadoActivo ? "activo" : "inactivo",
			};
		});
	};

	useEffect(() => {
		if (!users) return;
		const parsed = normalizeApiUsuarios(users);
		setUsuarios(parsed);
		if (parsed.length && (!selectedId || !parsed.some((u) => u.id === selectedId))) {
			setSelectedId(parsed[0].id);
		}
	}, [users, selectedId]);

	// Abrir modal de edición si viene editId en la URL
	useEffect(() => {
		const editId = searchParams.get("editId");
		if (!editId || !usuarios.length) return;
		const target = usuarios.find((u) => u.id === editId);
		if (!target) return;
		setSelectedId(target.id);
		setEditNombre(target.nombre);
		setEditUsername(target.username);
		setEditLegajo(target.legajo);
		setEditEmail(target.email);
		setIsEditOpen(true);
	}, [searchParams, usuarios]);

	const selectedUser = useMemo(
		() => usuarios.find((u) => u.id === selectedId),
		[usuarios, selectedId],
	);

	const renderEstadoPill = (variant: EstadoVariant, label: string) => {
		return <EstadoChip variant={variant} label={label} />;
	};

	const columns = useMemo<ColumnConfig<Usuario>[]>(() => [
		{
			id: "estado",
			header: "Estado",
			cell: (row) => renderEstadoPill(row.estadoVariant, row.estadoLabel),
		},
		{
			id: "nombre",
			header: "Nombre",
			accessorKey: "nombre",
		},
		{
			id: "legajo",
			header: "Legajo",
			accessorKey: "legajo",
		},
	], []);

	const filteredUsuarios = useMemo(() => {
		const term = busqueda.trim().toLowerCase();
		if (!term) return usuarios;
		return usuarios.filter((u) =>
			[u.nombre, u.username, u.legajo, u.email]
				.filter(Boolean)
				.some((field) => String(field).toLowerCase().includes(term)),
		);
	}, [busqueda, usuarios]);

	const router = useRouter();


	// --- Modal añadir ---
	const [isAddOpen, setIsAddOpen] = useState(false);

	const handleSelectUser = (usuario: Usuario) => {
		setSelectedId(usuario.id);
	};

	const handleViewUser = (usuario: Usuario) => {
		handleSelectUser(usuario);
		router.push(`/usuarios/${usuario.id}`);
	};

	function handleOpenEdit(usuario?: Usuario) {
		const targetUser = usuario ?? selectedUser;
		if (!targetUser) return;

		setSelectedId(targetUser.id);
		setEditNombre(targetUser.nombre);
		setEditUsername(targetUser.username);
		setEditLegajo(targetUser.legajo);
		setEditEmail(targetUser.email);
		setIsEditOpen(true);
	}

	function handleSaveEdit() {
		if (!selectedUser) return;
		if (!editNombre.trim() || !editUsername.trim() || !editEmail.trim()) {
			alert("Completá al menos nombre, username y email.");
			return;
		}
		const nameParts = editNombre.trim().split(/\s+/);
		const firstName = nameParts[0] ?? "";
		const lastName = nameParts.slice(1).join(" ");

		putUser({
			params: { id: selectedUser.id },
			data: {
				nombre_usuario: editUsername.trim(),
				legajo: editLegajo.trim(),
				email: editEmail.trim(),
				first_name: firstName,
				last_name: lastName,
				estado: selectedUser.estadoVariant === "activo",
			},
		});

		setUsuarios((prev) =>
			prev.map((u) =>
				u.id === selectedUser.id
					? {
						...u,
						nombre: editNombre,
						username: editUsername,
						legajo: editLegajo,
						email: editEmail,
					}
					: u,
			),
		);

		setIsEditOpen(false);
	}

	function handleCancelEdit() {
		setIsEditOpen(false);
	}

	function handleOpenChangePassword(usuario?: Usuario) {
		const targetUser = usuario ?? selectedUser;
		if (!targetUser) return;
		setPasswordTarget(targetUser);
		setIsChangePasswordOpen(true);
	}

	function handleCancelChangePassword() {
		setIsChangePasswordOpen(false);
		setPasswordTarget(undefined);
	}

	function handleSavePassword(password: string) {
		const targetUser = passwordTarget ?? selectedUser;
		if (!targetUser) return;

		const nameParts = targetUser.nombre.trim().split(/\s+/);
		const firstName = nameParts[0] ?? "";
		const lastName = nameParts.slice(1).join(" ");

		putUser({
			params: { id: targetUser.id },
			data: {
				nombre_usuario: targetUser.username.trim(),
				legajo: targetUser.legajo.trim(),
				email: targetUser.email.trim(),
				first_name: firstName,
				last_name: lastName,
				estado: targetUser.estadoVariant === "activo",
				contraseña: password,
			},
		});

		setIsChangePasswordOpen(false);
		setPasswordTarget(undefined);
	}

	function handleOpenAdd() {
		setIsAddOpen(true);
	}

	function handleCancelAdd() {
		setIsAddOpen(false);
	}

	function handleSaveAdd(data: NewUserData) {
		if (isCreatingUser) return;
		if (!data.nombre.trim() || !data.apellido.trim() || !data.username.trim() || !data.email.trim()) {
			alert("Completá al menos nombre, apellido, username y email.");
			return;
		}

		postUser({
			data: {
				email: data.email,
				first_name: data.nombre.trim(),
				last_name: data.apellido.trim(),
				legajo: data.legajo.trim(),
				estado: true,
				contraseña: data.password || "123456",
				nombre_usuario: data.username,
			},
		});
	}

	const actionConfig = {
		typeAction: "fila" as const,
		actionColumns: (row: Usuario) => (
			<div className="flex flex-wrap gap-2">
				<BotonVariante
					variant="editar"
					onClick={(event) => {
						event.stopPropagation();
						handleOpenEdit(row);
					}}
				/>
				<BotonVariante
					variant="ir"
					onClick={(event) => {
						event.stopPropagation();
						handleViewUser(row);
					}}
				/>
			</div>
		),
	};

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">

				<main className="flex flex-1 justify-center px-6 py-10">
					<div className="flex w-full max-w-[1350px] flex-col gap-8">
						<header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
							<div className="flex flex-col gap-1">
								<h1 className="text-2xl font-semibold text-[#1E293B]">
									Administración de usuarios
								</h1>
								<p className="text-sm text-[#6B7280]">
									Seleccioná un usuario de la lista para ver o editar su
									información.
								</p>
							</div>

						</header>

						<div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
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

							<DataTable<Usuario>
								data={filteredUsuarios}
								columns={columns}
								rowIdKey="id"
								minWidth={820}
								onAdd={handleOpenAdd}
								actionConfig={actionConfig}
								isLoading={isLoading}
							/>
						</div>
					</div>
				</main>

				{/* Modal edición */}
				{isEditOpen && (
					<div className="fixed inset-0 z-50 bg-black/40" role="dialog" aria-modal="true">
						<div className="absolute inset-y-0 right-0 flex h-full w-full sm:max-w-xl">
							<div className="flex h-full w-full flex-col bg-white shadow-[-10px_0_28px_rgba(0,0,0,0.2)]">
								<div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
									<h2 className="text-xl font-semibold text-[#1E293B]">Editar usuario</h2>
									<button
										onClick={handleCancelEdit}
										className="text-2xl text-[#9CA3AF] hover:text-[#4B5563]"
										aria-label="Cerrar"
									>
										×
									</button>
								</div>

								<div className="flex-1 overflow-y-auto px-6 py-5">
									<div className="grid grid-cols-1 gap-4">
										<label className="flex flex-col gap-1">
											<span className="text-sm font-medium text-[#374151]">Nombre y apellido</span>
											<input
												className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
												placeholder="Nombre completo"
												value={editNombre}
												onChange={(event) => setEditNombre(event.target.value)}
											/>
										</label>

										<label className="flex flex-col gap-1">
											<span className="text-sm font-medium text-[#374151]">Username</span>
											<input
												className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
												placeholder="usuario1"
												value={editUsername}
												onChange={(event) => setEditUsername(event.target.value)}
											/>
										</label>

										<label className="flex flex-col gap-1">
											<span className="text-sm font-medium text-[#374151]">Legajo</span>
											<input
												className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
												placeholder="123456/01"
												value={editLegajo}
												onChange={(event) => setEditLegajo(event.target.value)}
											/>
										</label>

										<label className="flex flex-col gap-1">
											<span className="text-sm font-medium text-[#374151]">Email</span>
											<input
												type="email"
												className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
												placeholder="usuario@scarh.com"
												value={editEmail}
												onChange={(event) => setEditEmail(event.target.value)}
											/>
										</label>
									</div>
								</div>

								<div className="flex shrink-0 justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
									<button
										type="button"
										onClick={() => handleOpenChangePassword(selectedUser)}
										className="rounded-lg border border-[#0D76B3] px-4 py-2 text-sm font-medium text-[#0D76B3] hover:bg-[#EFF6FF]"
									>
										Cambiar contraseña
									</button>
									<button
										type="button"
										onClick={handleCancelEdit}
										className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6]"
									>
										Cancelar
									</button>
									<button
										type="button"
										className="rounded-lg bg-[#0D76B3] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b679b]"
										onClick={handleSaveEdit}
									>
										Guardar cambios
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				
				{/* Modal añadir */}
				<AddUserModal
					open={isAddOpen}
					onCancel={handleCancelAdd}
					onSave={handleSaveAdd}
					isSaving={isCreatingUser}
				/>
				{isChangePasswordOpen && (
					<ChangePasswordModal
						open={isChangePasswordOpen}
						onCancel={handleCancelChangePassword}
						onSave={handleSavePassword}
						isSaving={isUpdatingUser}
					/>
				)}
			</div>
		</PaginaBase>
	);
}
