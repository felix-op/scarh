"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import { EstadoChip, EstadoVariant } from "@componentes/EstadoChip";
import {
	useGetHistoriales,
	useGetUsuario,
	HistorialItem,
	useDeleteUsuario,
	usePutUsuario,
} from "@servicios/api/django.api";

type UsuarioDetalle = {
	nombre_usuario?: string;
	username?: string;
	first_name?: string;
	last_name?: string;
	legajo?: string;
	email?: string;
	estado?: boolean;
};

export default function UsuarioDetallePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const usuarioId = params?.id ?? "";

	const { data: usuario } = useGetUsuario({ params: { id: usuarioId } });
	const { data: historialData } = useGetHistoriales({
		params: { queryParams: { limit: 10, page: 1 } },
	});
	const { mutate: putUser, isPending: isUpdatingUser } = usePutUsuario({
		configuracion: {
			queriesToInvalidate: [["useGetUsuario"], ["useGetUsuarios"]],
			refetch: true,
			onSuccess: () => {
				setIsEditOpen(false);
				setEditPassword("");
			},
		},
		params: { id: usuarioId },
	});
	const { mutate: deleteUser } = useDeleteUsuario({
		configuracion: {
			queriesToInvalidate: [["useGetUsuarios"]],
			refetch: true,
			onSuccess: () => {
				setIsDeleting(false);
				setIsDeleteOpen(false);
				router.push("/usuarios");
			},
			onSettled: () => setIsDeleting(false),
			onError: () => setIsDeleteOpen(false),
		},
		params: { id: usuarioId },
	});
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [editUsername, setEditUsername] = useState("");
	const [editNombre, setEditNombre] = useState("");
	const [editApellido, setEditApellido] = useState("");
	const [editLegajo, setEditLegajo] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [editPassword, setEditPassword] = useState("");

	const usuarioData = (usuario ?? {}) as UsuarioDetalle;
	const username = usuarioData.nombre_usuario ?? usuarioData.username ?? "";
	const nombre = usuarioData.first_name ?? "";
	const apellido = usuarioData.last_name ?? "";
	const legajo = usuarioData.legajo ?? "";
	const email = usuarioData.email ?? "";
	const displayUsername = username || "usuario1";
	const displayNombre = nombre || "Nombre de la persona";
	const displayApellido = apellido || "Apellido de la persona";
	const displayLegajo = legajo || "-";
	const displayEmail = email || "ejemplo@email.com";
	const estadoActivo = Boolean(usuarioData.estado ?? true);
	const estadoVariant: EstadoVariant = estadoActivo ? "activo" : "inactivo";

	const _historialUsuario: HistorialItem[] = useMemo(() => {
		const items = Array.isArray(historialData?.results) ? historialData.results : [];
		return items.filter((item) => item.username === username);
	}, [historialData, username]);

	function handleOpenEdit() {
		setEditUsername(username);
		setEditNombre(nombre);
		setEditApellido(apellido);
		setEditLegajo(String(legajo));
		setEditEmail(email);
		setEditPassword("");
		setIsEditOpen(true);
	}

	function handleSaveEdit() {
		if (!editNombre.trim() || !editApellido.trim() || !editUsername.trim() || !editEmail.trim()) {
			alert("Completá al menos nombre, apellido, username y email.");
			return;
		}

		putUser({
			data: {
				nombre_usuario: editUsername.trim(),
				legajo: editLegajo.trim(),
				email: editEmail.trim(),
				first_name: editNombre.trim(),
				last_name: editApellido.trim(),
				estado: estadoActivo,
				...(editPassword.trim() ? { contraseña: editPassword } : {}),
			},
		});
	}


	return (
		<PaginaBase noPadding>
			<div className="flex min-h-screen w-full justify-center bg-[#EEF4FB] px-4 py-8">
				<div className="flex w-full max-w-screen-2xl flex-col gap-6 rounded-[32px] bg-white p-6 shadow-[0px_4px_18px_rgba(0,0,0,0.18)]">
					{/* Cabecera + botones */}
					<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div className="space-y-1">
							<h1 className="text-3xl font-bold text-[#011018]">Información del usuario</h1>
							<p className="text-sm text-[#4B4B4B]">
								Detalle y últimas acciones para el usuario seleccionado.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<BotonVariante variant="default" onClick={() => router.push("/usuarios")}>
								<span className="icon-[mdi--arrow-left]" />
								<span>Volver</span>
							</BotonVariante>
							<BotonVariante variant="editar"
								onClick={handleOpenEdit}
							>
								<span className="icon-[line-md--edit]" />
								<span>Editar</span>
							</BotonVariante>
							<BotonVariante
								variant="ir"
								onClick={() => router.push(`/historial?usuario=${displayUsername}`)}
							>
								<span className="icon-[oui--arrow-right]" />
								<span>Ver historial de Acciones</span>
							</BotonVariante>
							<BotonVariante variant="perfilPassword">
								<span className="icon-[solar--lock-password-bold]" />
								<span>Cambiar contraseña</span>
							</BotonVariante>
							<BotonVariante
								variant="eliminar"
								onClick={() => setIsDeleteOpen(true)}
							>
								<span className="icon-[line-md--trash]" />
								<span>Eliminar</span>
							</BotonVariante>
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-[480px,1fr]">
						{/* Datos del usuario */}
						<section className="flex flex-col gap-4 rounded-3xl border border-[#E2E2E2] bg-white p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.12)]">
							<h2 className="text-center text-[32px] font-extrabold text-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
								Información del Usuario
							</h2>
							<div className="h-px w-full bg-[#E2E2E2]" />

							{[
								{ label: "Username:", value: displayUsername },
								{ label: "Nombre:", value: displayNombre },
								{ label: "Apellido:", value: displayApellido },
								{ label: "Legajo:", value: displayLegajo },
								{ label: "email:", value: displayEmail },
							].map((row) => (
								<div
									key={row.label}
									className="flex min-h-[72px] items-center gap-4 rounded-2xl px-3 py-3"
								>
									<div className="w-48 text-center text-[20px] font-normal text-[#838383] leading-6">
										{row.label}
									</div>
									<div className="text-[24px] font-semibold text-black leading-[28px]">
										{row.value}
									</div>
								</div>
							))}

							<div className="flex items-center gap-4 rounded-2xl px-3 py-3">
								<div className="w-48 text-center text-[20px] font-normal text-[#838383] leading-6">
									Estado:
								</div>
								<EstadoChip variant={estadoVariant} label={estadoActivo ? "Activo" : "Inactivo"} />
							</div>
						</section>

						{/* Resumen historial */}
						<section className="flex flex-col gap-4 rounded-3xl border border-[#E2E2E2] bg-white p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.12)]">
							<h2 className="text-center text-[32px] font-extrabold text-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
								Resumen del Historial
							</h2>
							<div className="h-px w-full bg-[#E2E2E2]" />

							<div className="flex flex-col gap-4">
								
							</div>
						</section>
					</div>
				</div>
			</div>

			{isEditOpen && (
				<div className="fixed inset-0 z-50 bg-black/40" role="dialog" aria-modal="true">
					<div className="absolute inset-y-0 right-0 flex h-full w-full sm:max-w-xl">
						<div className="flex h-full w-full flex-col bg-white shadow-[-10px_0_28px_rgba(0,0,0,0.2)]">
							<div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
								<div>
									<h2 className="text-xl font-semibold text-[#111827]">Editar usuario</h2>
								</div>
								<button
									onClick={() => setIsEditOpen(false)}
									className="text-2xl text-[#9CA3AF] hover:text-[#4B5563]"
									aria-label="Cerrar"
									disabled={isUpdatingUser}
								>
									×
								</button>
							</div>

							<div className="flex-1 overflow-y-auto px-6 py-5">
								<div className="grid grid-cols-1 gap-4">
									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium text-[#374151]">Nombre</span>
										<input
											className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
											placeholder="Nombre"
											value={editNombre}
											onChange={(event) => setEditNombre(event.target.value)}
											disabled={isUpdatingUser}
										/>
									</label>

									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium text-[#374151]">Apellido</span>
										<input
											className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
											placeholder="Apellido"
											value={editApellido}
											onChange={(event) => setEditApellido(event.target.value)}
											disabled={isUpdatingUser}
										/>
									</label>

									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium text-[#374151]">Username</span>
										<input
											className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
											placeholder="usuario1"
											value={editUsername}
											onChange={(event) => setEditUsername(event.target.value)}
											disabled={isUpdatingUser}
										/>
									</label>

									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium text-[#374151]">Legajo</span>
										<input
											className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
											placeholder="123456/01"
											value={editLegajo}
											onChange={(event) => setEditLegajo(event.target.value)}
											disabled={isUpdatingUser}
										/>
									</label>

									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium text-[#374151]">Email</span>
										<input
											type="email"
											className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
											placeholder="usuario@mail.com"
											value={editEmail}
											onChange={(event) => setEditEmail(event.target.value)}
											disabled={isUpdatingUser}
										/>
									</label>

									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium text-[#374151]">Contraseña</span>
										<input
											type="password"
											className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
											placeholder="********"
											value={editPassword}
											onChange={(event) => setEditPassword(event.target.value)}
											disabled={isUpdatingUser}
										/>
									</label>
								</div>
							</div>

							<div className="flex shrink-0 justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
								<button
									type="button"
									onClick={() => setIsEditOpen(false)}
									className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6]"
									disabled={isUpdatingUser}
								>
									Cancelar
								</button>
								<button
									type="button"
									onClick={handleSaveEdit}
									className="rounded-lg bg-[#0D76B3] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b679b] disabled:cursor-not-allowed disabled:opacity-70"
									disabled={isUpdatingUser}
								>
									{isUpdatingUser ? "Guardando..." : "Guardar cambios"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{isDeleteOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
					<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
						<h3 className="text-xl font-semibold text-[#111827] mb-2">Eliminar usuario</h3>
						<p className="text-sm text-[#4B5563] mb-6">
							Esta acción es irreversible. ¿Confirmás la eliminación de <strong>{displayNombre || displayUsername}</strong>?
						</p>
						<div className="flex justify-end gap-3">
							<button
								type="button"
								className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6]"
								onClick={() => setIsDeleteOpen(false)}
								disabled={isDeleting}
							>
								Cancelar
							</button>
							<button
								type="button"
								className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-70"
								onClick={() => {
									setIsDeleting(true);
									deleteUser({ params: { id: usuarioId } });
								}}
								disabled={isDeleting}
							>
								{isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
							</button>
						</div>
					</div>
				</div>
			)}
		</PaginaBase>
	);
}
