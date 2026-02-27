import CampoCheckbox from "@componentes/formularios/CampoCheckBox";
import CampoInput from "@componentes/formularios/CampoInput";
import VentanaFormulario from "@componentes/ventanas/VentanaFormulario";
import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import { usePutUsuario } from "@servicios/api";
import { UsuarioResponse } from "types/usuarios";
import { TEditarUsuario } from "../types";

type VentanaEditarUsuarioProps = {
	open: boolean,
	onClose: () => void,
	usuario: UsuarioResponse | null,
	usuarios: UsuarioResponse[],
	queriesToInvalidate: string[],
	handleMessage: (message: VentanaAceptarOptions) => void
}

export default function VentanaEditarUsuario({
	open,
	onClose,
	usuario,
	usuarios,
	queriesToInvalidate,
	handleMessage
}: VentanaEditarUsuarioProps) {
	const esNombreUsuarioDuplicado = (valor: string) => {
		const valorNormalizado = valor.trim().toLowerCase();
		return usuarios.some((usuarioExistente) => (
			usuarioExistente.id !== usuario?.id
			&& usuarioExistente.nombre_usuario.trim().toLowerCase() === valorNormalizado
		));
	};

	const esLegajoDuplicado = (valor: string) => {
		const valorNormalizado = valor.trim().toLowerCase();
		return usuarios.some((usuarioExistente) => (
			usuarioExistente.id !== usuario?.id
			&& usuarioExistente.legajo.trim().toLowerCase() === valorNormalizado
		));
	};

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

				const errores = (e.response?.data ?? {}) as Record<string, unknown>;
				const existeNombreUsuario = Boolean(errores.nombre_usuario) || Boolean(errores.username);
				const existeLegajo = Boolean(errores.legajo);
				let descripcion = `El usuario ${usuario?.nombre_usuario} no se pudo editar`;

				if (existeNombreUsuario && existeLegajo) {
					descripcion = "El nombre de usuario y el legajo ya existen";
				} else if (existeNombreUsuario) {
					descripcion = "El nombre de usuario ya existe";
				} else if (existeLegajo) {
					descripcion = "El legajo ya existe";
				}

				handleMessage({
					title: "Error al editar",
					description: descripcion,
					variant: "error",
				});
			},
		},
	});

	const onSubmit: TEditarUsuario = (data) => {
		if (esNombreUsuarioDuplicado(data.nombre_usuario)) {
			handleMessage({
				title: "Error al editar",
				description: "El nombre de usuario ya existe",
				variant: "error",
			});
			return;
		}

		if (esLegajoDuplicado(data.legajo)) {
			handleMessage({
				title: "Error al editar",
				description: "El legajo ya existe",
				variant: "error",
			});
			return;
		}

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
				disabled={isPending}
				required
			/>
			<CampoInput
				name="last_name"
				label="Apellido"
				placeholder="Ingrese el o los apellidos del usuario"
				disabled={isPending}
				required
			/>
			<CampoInput
				name="nombre_usuario"
				label="Nombre de usuario"
				placeholder="Ingrese el nombre de usuario para acceder al sistema"
				validate={(value) => !esNombreUsuarioDuplicado(value) || "El nombre de usuario ya existe"}
				disabled={isPending}
				required
			/>
			<CampoInput
				name="legajo"
				label="Legajo"
				type="number"
				placeholder="Ingrese el legajo del usuario"
				validate={(value) => !esLegajoDuplicado(value) || "El legajo ya existe"}
				disabled={isPending}
				required
			/>
			<CampoInput
				name="email"
				label="Correo Electrónico"
				type="email"
				placeholder="Ingrese el correo electrónico para el usuario"
				disabled={isPending}
				required
			/>
			<CampoCheckbox
				name="estado"
				label="Estado"
				disabled={isPending}
			/>
		</VentanaFormulario>
	);
}
