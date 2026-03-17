"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import { EstadoChip, EstadoVariant } from "@componentes/EstadoChip";
import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import { useGetUsuario, useGetUsuarios } from "@servicios/api";
import { UsuarioResponse } from "types/usuarios";
import VentanaEditarUsuario from "../componentes/VentanaEditarUsuario";
import ResumenHistorialUsuario from "../componentes/ResumenHistorialUsuario";
import VentanaEliminarUsuario from "../componentes/VentanaEliminarUsuario";
import Separador from "@componentes/Separador";
import { useNotificar } from "@hooks/useNotificar";

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
	const notificar = useNotificar();

	const { data: usuario } = useGetUsuario({ params: { id: usuarioId } });
	const { data: usuarios } = useGetUsuarios({});
	const usuarioData = (usuario ?? {}) as UsuarioDetalle;
	const username = (usuarioData.nombre_usuario ?? usuarioData.username ?? "").trim();
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);

	const toDisplayValue = (value?: string | null) => {
		const normalized = value?.trim();
		return normalized ? normalized : "-";
	};

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

	const handleOpenInfo = (newMessage: VentanaAceptarOptions) => {
		notificar({
			titulo: newMessage.title,
			mensaje: newMessage.description,
			variante: newMessage.variant,
			desaparecerEnMS: newMessage.variant === "error" || newMessage.variant === "alerta" ? false : 2500,
		});
	};

	const onSuccessDelete = () => {
		router.push('/usuarios');
	};

	return (
		<PaginaBase>
			<BotonVariante className="w-30 mb-2" variant="volver" onClick={() => router.push("/usuarios")} />
			<div className="flex w-full max-w-screen-2xl flex-col gap-6 rounded-[32px] bg-background-muted p-6 shadow-[0px_4px_18px_rgba(0,0,0,0.18)]">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col md:flex-row flex-wrap gap-2 md:self-end">
						<BotonVariante variant="editar" onClick={handleOpenEdit} >
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
						<BotonVariante
							variant="eliminar"
							onClick={() => setIsDeleteOpen(true)}
						/>
					</div>
				</div>

				<div className="flex flex-col items-stretch gap-6 xl:flex-row">
					{/* Datos del usuario */}
					<section className="flex flex-col gap-2 flex-1">
						<h2 className="text-center">Información del Usuario</h2>
						<hr />
						{[
							{ label: "Username:", value: displayUsername },
							{ label: "Nombre:", value: displayNombre },
							{ label: "Apellido:", value: displayApellido },
							{ label: "Legajo:", value: displayLegajo },
							{ label: "email:", value: displayEmail },
						].map((row) => (
							<div
								key={row.label}
								className="flex min-w-0 items-center gap-2 rounded-2xl px-3"
							>
								<div className="shrink-0 whitespace-nowrap text-left text-[20px] font-normal leading-6">
									{row.label}
								</div>
								<div className="min-w-0 text-[24px] font-semibold text-foreground leading-[28px] wrap-break-word">
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

					<Separador direction="vertical" className="hidden lg:block"/>

					<section className="flex flex-col gap-2 flex-1">
						<h2 className="text-center">Resumen del Historial</h2>
						<hr />
						<ResumenHistorialUsuario username={username} maxRecords={6} />
					</section>
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

			<VentanaEliminarUsuario
				open={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				handleMessage={handleOpenInfo}
				queriesToInvalidate={["useGetUsuarios"]}
				onSuccess={onSuccessDelete}
				usuario={usuario}
			/>
		</PaginaBase>
	);
}
