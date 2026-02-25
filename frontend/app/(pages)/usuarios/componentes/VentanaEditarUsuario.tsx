import CampoCheckbox from "@componentes/formularios/CampoCheckBox";
import CampoInput from "@componentes/formularios/CampoInput";
import VentanaFormulario from "@componentes/ventanas/VentanaFormulario";
import { usePutUsuario } from "@servicios/api";
import { TEditarUsuario } from "../types";
import { UsuarioResponse } from "types/usuarios";
import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";

type VentanaEditarUsuarioProps = {
	open: boolean,
	onClose: () => void,
	usuario: UsuarioResponse | null,
	queriesToInvalidate: string[],
	handleMessage: (message: VentanaAceptarOptions) => void
}

export default function VentanaEditarUsuario({
	open,
	onClose,
	usuario,
	queriesToInvalidate,
	handleMessage
}: VentanaEditarUsuarioProps) {
	const { mutate: editarUsuario, isPending } = usePutUsuario({
		configuracion: {
			queriesToInvalidate,
			onSuccess: () => {
				onClose();
				handleMessage({
					title: "Editado Correctamente",
					description: `El usuario ${usuario?.nombre_usuario} se editó correctamente`,
					variant: "exito",
				});
			},
			onError: (e) => {
				console.error("Error en el componente VentanaEditarUsuario: ", e);
				handleMessage({
					title: "Error al editar",
					description: `El usuario ${usuario?.nombre_usuario} no se pudo editar`,
					variant: "error",
				});
			},
		},
	});

	const onSubmit: TEditarUsuario = (data) => {
		editarUsuario({
			params: { id: String(usuario?.id) },
			data: {
				nombre_usuario: data.nombre_usuario,
				first_name: data.first_name,
				last_name: data.last_name,
				legajo: data.legajo,
				email: data.email,
				estado: data.estado,
			},
		});
	};

	const valoresIniciales = usuario ? {
		nombre_usuario: usuario.nombre_usuario,
		first_name: usuario.first_name,
		last_name: usuario.last_name,
		legajo: usuario.legajo,
		email: usuario.email,
		estado: usuario.estado,
	} : {};

	return (
		<VentanaFormulario
			open={open}
			onClose={onClose}
			onSubmit={onSubmit}
			titulo="Editar Usuario"
			valoresIniciales={valoresIniciales}
			classNameContenido="flex flex-col gap-4"
			isLoading={isPending}
		>
			<CampoInput
				name="first_name"
				label="Nombre"
				placeholder="Ingrese el o los nombres del usuario"
				required
			/>
			<CampoInput
				name="last_name"
				label="Apellido"
				placeholder="Ingrese el o los apellidos del usuario"
				required
			/>
			<CampoInput
				name="nombre_usuario"
				label="Nombre de usuario"
				placeholder="Ingrese el nombre de usuario para acceder al sistema"
				required
			/>
			<CampoInput
				name="legajo"
				label="Legajo"
				type="number"
				placeholder="Ingrese el o los nombres del usuario"
				required
			/>
			<CampoInput
				name="email"
				label="Correo Electrónico"
				type="email"
				placeholder="Ingrese el correo electrónico para el usuario"
				required
			/>
			<CampoCheckbox
				name="estado"
				label="Estado"
			/>
		</VentanaFormulario>
	);
}