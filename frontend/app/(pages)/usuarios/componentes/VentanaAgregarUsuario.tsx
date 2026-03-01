import CampoInput from "@componentes/formularios/CampoInput";
import CampoPassword from "@componentes/formularios/CampoPassword";
import VentanaFormulario from "@componentes/ventanas/VentanaFormulario";
import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import { usePostUsuario } from "@servicios/api";
import { UsuarioResponse } from "types/usuarios";
import { defaultFormCrearUsuario } from "../constantes";
import { TCrearUsuario } from "../types";

type VentanaAgregrarUsuarioProps = {
	open: boolean,
	onClose: () => void,
	usuarios: UsuarioResponse[],
	queriesToInvalidate: string[],
	handleMessage: (message: VentanaAceptarOptions) => void
}

export default function VentanaAgregrarUsuario({
	open,
	onClose,
	usuarios,
	queriesToInvalidate,
	handleMessage
}: VentanaAgregrarUsuarioProps) {
	const esNombreUsuarioDuplicado = (valor: string) => {
		const valorNormalizado = valor.trim().toLowerCase();
		return usuarios.some((usuario) => usuario.nombre_usuario.trim().toLowerCase() === valorNormalizado);
	};

	const esLegajoDuplicado = (valor: string) => {
		const valorNormalizado = valor.trim().toLowerCase();
		return usuarios.some((usuario) => usuario.legajo.trim().toLowerCase() === valorNormalizado);
	};

	const { mutate: crearUsuario, isPending } = usePostUsuario({
		configuracion: {
			queriesToInvalidate,
			onSuccess: (data) => {
				onClose();
				handleMessage({
					title: "Creado Correctamente",
					description: `El usuario ${data?.nombre_usuario} se creó correctamente`,
					variant: "exito",
				});
			},
			onError: (e) => {
				console.error("Error en el componente VentanaAgregarUsuario: ", e);

				const errores = (e.response?.data ?? {}) as Record<string, unknown>;
				const existeNombreUsuario = Boolean(errores.nombre_usuario) || Boolean(errores.username);
				const existeLegajo = Boolean(errores.legajo);
				let descripcion = "No se pudo crear el usuario";

				if (existeNombreUsuario && existeLegajo) {
					descripcion = "El nombre de usuario y el legajo ya existen";
				} else if (existeNombreUsuario) {
					descripcion = "El nombre de usuario ya existe";
				} else if (existeLegajo) {
					descripcion = "El legajo ya existe";
				}

				handleMessage({
					title: "Error al crear",
					description: descripcion,
					variant: "error",
				});
			},
		},
	});

	const valoresIniciales = defaultFormCrearUsuario;

	const onSubmit: TCrearUsuario = (data) => {
		if (esNombreUsuarioDuplicado(data.nombre_usuario)) {
			handleMessage({
				title: "Error al crear",
				description: "El nombre de usuario ya existe",
				variant: "error",
			});
			return;
		}

		if (esLegajoDuplicado(data.legajo)) {
			handleMessage({
				title: "Error al crear",
				description: "El legajo ya existe",
				variant: "error",
			});
			return;
		}

		crearUsuario({
			data: {
				nombre_usuario: data.nombre_usuario,
				first_name: data.first_name,
				last_name: data.last_name,
				legajo: data.legajo,
				email: data.email,
				contraseña: data.password1,
				estado: true,
			},
		});
	};

	return (
		<VentanaFormulario
			open={open}
			onClose={onClose}
			onSubmit={onSubmit}
			titulo="Agregar Usuario"
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
			<CampoPassword
				name="password1"
				label="Contraseña"
				placeholder="Ingrese una contraseña de 8 caracteres con al menos un caracter especial"
				disabled={isPending}
			/>
			<CampoPassword
				name="password2"
				label="Confirmar Contraseña"
				placeholder="Confirme la contraseña"
				targetName="password1"
				disabled={isPending}
				isConfirm
			/>
		</VentanaFormulario>
	);
}
