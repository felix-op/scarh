"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import ChangePasswordModal from "@componentes/ChangePasswordModal";
import { EstadoChip, EstadoVariant } from "@componentes/EstadoChip";
import VentanaAceptar, { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import {
	useGetHistoriales,
	HistorialItem,
} from "@servicios/api/django.api";
import { useDeleteUsuario, useGetUsuario, useGetUsuarios, usePutUsuario } from "@servicios/api";
import { UsuarioResponse } from "types/usuarios";
import VentanaEditarUsuario from "../componentes/VentanaEditarUsuario";

type UsuarioDetalle = {
	nombre_usuario?: string;
	username?: string;
	first_name?: string;
	last_name?: string;
	legajo?: string;
	email?: string;
	estado?: boolean;
};

const defaultMessage: VentanaAceptarOptions = {
	title: "",
	description: "",
	variant: "info",
};

export default function UsuarioDetallePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const usuarioId = params?.id ?? "";

	const { data: usuario } = useGetUsuario({ params: { id: usuarioId } });
	const { data: usuarios } = useGetUsuarios({});
	const { data: historialData } = useGetHistoriales({
		params: { queryParams: { limit: 10, page: 1 } },
	});
	const { mutate: putUser, isPending: isUpdatingUser } = usePutUsuario({
		configuracion: {
			queriesToInvalidate: [["useGetUsuario"], ["useGetUsuarios"]],
			refetch: true,
			onSuccess: () => setIsEditOpen(false),
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
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
	const [isOpenInfo, setIsOpenInfo] = useState(false);
	const [message, setMessage] = useState(defaultMessage);

	const toDisplayValue = (value?: string | null) => {
		const normalized = value?.trim();
		return normalized ? normalized : "-";
	};

	const usuarioData = (usuario ?? {}) as UsuarioDetalle;
	const username = (usuarioData.nombre_usuario ?? usuarioData.username ?? "").trim();
	const nombre = (usuarioData.first_name ?? "").trim();
	const apellido = (usuarioData.last_name ?? "").trim();
	const legajo = (usuarioData.legajo ?? "").trim();
	const email = (usuarioData.email ?? "").trim();
	const displayUsername = toDisplayValue(username);
	const displayNombre = toDisplayValue(nombre);
	const displayApellido = toDisplayValue(apellido);
	const displayLegajo = toDisplayValue(legajo);
	const displayEmail = toDisplayValue(email);
	const estadoActivo = Boolean(usuarioData.estado ?? true);
	const estadoVariant: EstadoVariant = estadoActivo ? "activo" : "inactivo";

	const _historialUsuario: HistorialItem[] = useMemo(() => {
		const items = Array.isArray(historialData?.results) ? historialData.results : [];
		return items.filter((item) => item.username === username);
	}, [historialData, username]);

	const usuarioParaEditar: UsuarioResponse | null = usuario ? {
		id: Number(usuarioId),
		nombre_usuario: username,
		first_name: nombre,
		last_name: apellido,
		legajo: legajo,
		email: email,
		estado: estadoActivo,
	} : null;

	function handleOpenEdit() {
		setIsEditOpen(true);
	}

	function handleOpenInfo(newMessage: VentanaAceptarOptions) {
		setMessage(newMessage);
		setIsOpenInfo(true);
	}

	function handleOpenChangePassword() {
		setIsChangePasswordOpen(true);
	}

	function handleCancelChangePassword() {
		setIsChangePasswordOpen(false);
	}

	function handleSavePassword(password: string) {
		if (!username.trim() || !email.trim() || !nombre.trim() || !apellido.trim()) {
			alert("No se pudo cambiar la contraseña: faltan datos del usuario.");
			return;
		}

		putUser({
			data: {
				nombre_usuario: username.trim(),
				legajo: String(legajo).trim(),
				email: email.trim(),
				first_name: nombre.trim(),
				last_name: apellido.trim(),
				estado: estadoActivo,
				contraseña: password,
			},
		});
		setIsChangePasswordOpen(false);
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
							<BotonVariante variant="perfilPassword" onClick={handleOpenChangePassword}>
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

					<div className="flex flex-col items-stretch gap-6 xl:flex-row">
						{/* Datos del usuario */}
						<section className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-3xl border border-[#E2E2E2] bg-white p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.12)] xl:flex-[0_0_45%]">
							<h2 className="text-left text-[32px] font-extrabold text-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
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
									className="flex min-h-[72px] min-w-0 items-center gap-2 rounded-2xl px-3 py-3"
								>
									<div className="shrink-0 whitespace-nowrap text-left text-[20px] font-normal text-[#838383] leading-6">
										{row.label}
									</div>
									<div className="min-w-0 text-[24px] font-semibold text-black leading-[28px] break-words [overflow-wrap:anywhere]">
										{row.value}
									</div>
								</div>
							))}

							<div className="flex min-w-0 items-center gap-2 rounded-2xl px-3 py-3">
								<div className="shrink-0 whitespace-nowrap text-left text-[20px] font-normal text-[#838383] leading-6">
									Estado:
								</div>
								<EstadoChip variant={estadoVariant} label={estadoActivo ? "Activo" : "Inactivo"} />
							</div>
						</section>

						{/* Resumen historial */}
						<section className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-3xl border border-[#E2E2E2] bg-white p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.12)] xl:flex-[1_1_55%]">
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

			<VentanaEditarUsuario
				open={isEditOpen}
				onClose={() => setIsEditOpen(false)}
				usuario={usuarioParaEditar}
				usuarios={usuarios ?? []}
				queriesToInvalidate={["useGetUsuario", "useGetUsuarios"]}
				handleMessage={handleOpenInfo}
			/>

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
			{isChangePasswordOpen && (
				<ChangePasswordModal
					open={isChangePasswordOpen}
					onCancel={handleCancelChangePassword}
					onSave={handleSavePassword}
					isSaving={isUpdatingUser}
				/>
			)}
			<VentanaAceptar
				open={isOpenInfo}
				onClose={() => setIsOpenInfo(false)}
				options={message}
			/>
		</PaginaBase>
	);
}
