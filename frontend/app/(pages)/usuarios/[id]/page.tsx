"use client";

import { ReactNode, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import { useGetUsuario } from "@servicios/api";
import VentanaEditarUsuario from "../componentes/VentanaEditarUsuario";
import ResumenHistorialUsuario from "../componentes/ResumenHistorialUsuario";
import VentanaEliminarUsuario from "../componentes/VentanaEliminarUsuario";
import { useNotificar } from "@hooks/useNotificar";
import SeccionInfo from "@componentes/secciones/SeccionInfo";
import SeccionInfoHeader from "@componentes/secciones/SeccionInfoHeader";
import SeccionInfoGroups from "@componentes/secciones/SeccionInfoGroups";
import SeccionInfoGroup from "@componentes/secciones/SeccionInfoGroup";
import ChipEstadoUsuario from "@componentes/chips/ChipEstadoUsuario";
import SeccionInfoData from "@componentes/secciones/SeccionInfoData";
import normalizarString from "@lib/normalizarString";

type InfoItem = {
	label: string;
	value: ReactNode;
};

export default function UsuarioDetallePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const usuarioId = params?.id ?? "";
	const notificar = useNotificar();

	const { data: usuario } = useGetUsuario({ params: { id: usuarioId } });
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);

	const { nombre, apellido, legajo, email, nombre_usuario, estado } =
		useMemo(() => {
			return {
				nombre: normalizarString(usuario?.first_name),
				apellido: normalizarString(usuario?.last_name),
				legajo: normalizarString(usuario?.legajo),
				email: normalizarString(usuario?.email),
				nombre_usuario: normalizarString(usuario?.nombre_usuario),
				estado: usuario?.estado,
			};
		}, [usuario]);

	const info: InfoItem[] = [
		{ label: "Nombre de usuario:", value: nombre_usuario },
		{ label: "Nombre:", value: nombre },
		{ label: "Apellido:", value: apellido },
		{ label: "Legajo:", value: legajo },
		{ label: "Correo electrónico:", value: email },
	];

	const handleOpenEdit = () => {
		setIsEditOpen(true);
	};

	const handleOpenInfo = (newMessage: VentanaAceptarOptions) => {
		notificar({
			titulo: newMessage.title,
			mensaje: newMessage.description,
			variante: newMessage.variant,
			desaparecerEnMS:
				newMessage.variant === "error" ||
				newMessage.variant === "alerta"
					? false
					: 2500,
		});
	};

	const onSuccessDelete = () => {
		router.push("/usuarios");
	};

	return (
		<PaginaBase>
			<BotonVariante
				variant="volver"
				onClick={() => router.push("/usuarios")}
			/>
			<br />
			<SeccionInfo>
				<SeccionInfoHeader>
					<BotonVariante variant="editar" onClick={handleOpenEdit}>
						<span className="icon-[line-md--edit]" />
						<span>Editar</span>
					</BotonVariante>
					<BotonVariante
						variant="ir"
						onClick={() =>
							router.push(`/historial?usuario=${nombre_usuario}`)
						}
					>
						<span className="icon-[oui--arrow-right]" />
						<span>Ver historial de Acciones</span>
					</BotonVariante>
					<BotonVariante
						variant="eliminar"
						onClick={() => setIsDeleteOpen(true)}
					/>
				</SeccionInfoHeader>
				<SeccionInfoGroups>
					<SeccionInfoGroup>
						<h2 className="text-center">Información del Usuario</h2>
						<hr />

						{info.map((item) => (
							<SeccionInfoData
								key={item.label}
								label={item.label}
							>
								{item.value}
							</SeccionInfoData>
						))}

						<div className="flex min-w-0 items-center gap-2 rounded-2xl px-3 py-3">
							<div className="shrink-0 whitespace-nowrap text-left text-[20px] font-normal text-[#838383] leading-6">
								Estado:
							</div>
							<ChipEstadoUsuario
								estado={estado ? "activo" : "inactivo"}
							/>
						</div>
					</SeccionInfoGroup>
					<SeccionInfoGroup>
						<h2 className="text-center">Resumen del Historial</h2>
						<hr />
						<ResumenHistorialUsuario
							username={nombre_usuario}
							maxRecords={6}
						/>
					</SeccionInfoGroup>
				</SeccionInfoGroups>
			</SeccionInfo>

			<VentanaEditarUsuario
				open={isEditOpen}
				onClose={() => setIsEditOpen(false)}
				usuario={usuario}
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
