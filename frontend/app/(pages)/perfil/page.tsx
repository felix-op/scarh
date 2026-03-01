"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ProfileCard from "@componentes/navbar/ProfileCard";
import PaginaBase from "@componentes/base/PaginaBase";
import ChangePasswordModal from "@componentes/ChangePasswordModal";
import { useGetUsuario, usePutUsuario } from "@servicios/api";

type SessionUserExtended = {
	id?: string;
	username?: string;
	email?: string | null;
	image?: string | null;
	first_name?: string;
	last_name?: string;
};

const MODAL_CANCEL_BUTTON_CLASS =
	"inline-flex h-11 items-center gap-2 rounded-full border border-[#EFCAD5] bg-[#F7E0E8] px-6 text-sm font-semibold text-[#F05275] shadow-[0px_4px_10px_rgba(240,82,117,0.2)] transition hover:bg-[#F3D3DE] disabled:cursor-not-allowed disabled:opacity-70";

const MODAL_SAVE_BUTTON_CLASS =
	"inline-flex h-11 items-center gap-2 rounded-full border border-[#CFE2F1] bg-[#DDEEFF] px-6 text-sm font-semibold text-[#258CC6] shadow-[0px_4px_10px_rgba(37,140,198,0.22)] transition hover:bg-[#CFE5FB] disabled:cursor-not-allowed disabled:opacity-70";

export default function ProfilePage() {
	const { data: session } = useSession();
	const sessionUser = session?.user as SessionUserExtended | undefined;
	const userId = sessionUser?.id ?? "";

	const { data: usuarioApi } = useGetUsuario({
		params: { id: userId },
		configuracion: { enabled: Boolean(userId) },
	});
	const { mutate: putUser, isPending: isUpdatingUser } = usePutUsuario({
		params: { id: userId },
		configuracion: {
			queriesToInvalidate: [["useGetUsuario"], ["useGetUsuarios"]],
			refetch: true,
			onSuccess: () => {
				setIsEditOpen(false);
				setIsChangePasswordOpen(false);
			},
		},
	});

	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
	const [editUsername, setEditUsername] = useState("");
	const [editFirstName, setEditFirstName] = useState("");
	const [editLastName, setEditLastName] = useState("");
	const [editLegajo, setEditLegajo] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [editEstado, setEditEstado] = useState(true);

	const currentUsername = usuarioApi?.nombre_usuario ?? sessionUser?.username ?? sessionUser?.email ?? "Usuario";
	const currentFirstName = usuarioApi?.first_name ?? sessionUser?.first_name ?? "";
	const currentLastName = usuarioApi?.last_name ?? sessionUser?.last_name ?? "";
	const currentEmail = usuarioApi?.email ?? sessionUser?.email ?? "";
	const currentLegajo = usuarioApi?.legajo ?? userId;
	const currentEstado = Boolean(usuarioApi?.estado ?? true);

	const handleLogout = () => {
		signOut({
			callbackUrl: "/auth/login",
			redirect: true,
		});
	};

	const handleOpenEdit = () => {
		setEditUsername(currentUsername);
		setEditFirstName(currentFirstName);
		setEditLastName(currentLastName);
		setEditLegajo(String(currentLegajo ?? ""));
		setEditEmail(currentEmail ?? "");
		setEditEstado(currentEstado);
		setIsEditOpen(true);
	};

	const handleSaveEdit = () => {
		if (!editFirstName.trim() || !editLastName.trim() || !editUsername.trim() || !editEmail.trim()) {
			alert("Completá al menos nombre, apellido, username y email.");
			return;
		}
		if (!userId) {
			alert("No se pudo editar: no hay un ID de usuario disponible.");
			return;
		}

		putUser({
			data: {
				nombre_usuario: editUsername.trim(),
				legajo: editLegajo.trim(),
				email: editEmail.trim(),
				first_name: editFirstName.trim(),
				last_name: editLastName.trim(),
				estado: editEstado,
			},
		});
	};

	const handleChangePassword = () => {
		setIsChangePasswordOpen(true);
	};

	const handleSavePassword = (password: string) => {
		if (!userId) {
			alert("No se pudo cambiar la contraseña: no hay un ID de usuario disponible.");
			return;
		}

		putUser({
			data: {
				nombre_usuario: currentUsername.trim(),
				legajo: String(currentLegajo ?? "").trim(),
				email: (currentEmail ?? "").trim(),
				first_name: currentFirstName.trim(),
				last_name: currentLastName.trim(),
				estado: currentEstado,
				contraseña: password,
			},
		});
	};

	const userData = {
		username: currentUsername,
		firstName: currentFirstName,
		lastName: currentLastName,
		email: currentEmail ?? undefined,
		legajo: String(currentLegajo ?? ""),
		avatarUrl: sessionUser?.image ?? undefined,
		statusLabel: currentEstado ? "Activo" : "Inactivo",
		statusVariant: (currentEstado ? "activo" : "inactivo") as const,
	};

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB] dark:bg-[rgb(35,39,47)]">

				<main className="flex flex-1 flex-col items-stretch px-4 sm:px-6 py-8 sm:py-10">


					{/* Contenido principal: tarjeta de usuario centrada */}
					<div className="mt-4 flex flex-1 items-start justify-center">
						<ProfileCard
							variant="detail"
							{...userData}
							onEditProfile={handleOpenEdit}
							onChangePassword={handleChangePassword}
							onLogout={handleLogout}
						/>
					</div>
				</main>
			</div>

			{isEditOpen && (
				<div className="fixed inset-0 z-50 bg-black/40" role="dialog" aria-modal="true">
					<div className="absolute inset-y-0 right-0 flex h-full w-full sm:max-w-xl">
						<div className="flex h-full w-full flex-col bg-white shadow-[-10px_0_28px_rgba(0,0,0,0.2)]">
							<div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
								<h2 className="text-xl font-semibold text-[#111827]">Editar perfil</h2>
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
											value={editFirstName}
											onChange={(event) => setEditFirstName(event.target.value)}
											disabled={isUpdatingUser}
										/>
									</label>

									<label className="flex flex-col gap-1">
										<span className="text-sm font-medium text-[#374151]">Apellido</span>
										<input
											className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D76B3] focus:outline-none"
											placeholder="Apellido"
											value={editLastName}
											onChange={(event) => setEditLastName(event.target.value)}
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
								</div>
							</div>

							<div className="flex shrink-0 justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
								<button
									type="button"
									onClick={() => setIsEditOpen(false)}
									className={MODAL_CANCEL_BUTTON_CLASS}
									disabled={isUpdatingUser}
								>
									<span className="icon-[mdi--close-thick] text-base" aria-hidden="true" />
									<span>Cancelar</span>
								</button>
								<button
									type="button"
									onClick={handleSaveEdit}
									className={MODAL_SAVE_BUTTON_CLASS}
									disabled={isUpdatingUser}
								>
									<span className="icon-[mdi--content-save] text-base" aria-hidden="true" />
									<span>{isUpdatingUser ? "Guardando..." : "Guardar cambios"}</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{isChangePasswordOpen && (
				<ChangePasswordModal
					open={isChangePasswordOpen}
					onCancel={() => setIsChangePasswordOpen(false)}
					onSave={handleSavePassword}
					isSaving={isUpdatingUser}
				/>
			)}
		</PaginaBase>
	);
}
