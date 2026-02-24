import AlertaErrorBackend from "@componentes/alertas/AlertaErrorBackend";
import CampoInput from "@componentes/formularios/CampoInput";
import CampoPassword from "@componentes/formularios/CampoPassword";
import VentanaFormulario from "@componentes/ventanas/VentanaFormulario";
import { usePostUsuario } from "@servicios/api";
import { useState } from "react";
import { TCrearUsuario, TError } from "../types";
import { defaultFormCrearUsuario } from "../constantes";

type VentanaAgregrarUsuarioProps = {
	open: boolean,
	onClose: () => void,
	queriesToInvalidate: string[],
}

export default function VentanaAgregrarUsuario({
	open,
	onClose,
	queriesToInvalidate,
}: VentanaAgregrarUsuarioProps) {
	const [error, setError] = useState<TError>(null);
	const { mutate: crearUsuario } = usePostUsuario({
		configuracion: {
			queriesToInvalidate,
			onSuccess: () => {
				setError(null);
				onClose();
			},
			onError: (e) => {
				console.error("Error en el componente VentanaAgregarUsuario: ", e);
				setError(e);
			},
		},
	});

	const valoresIniciales = defaultFormCrearUsuario;

	const onSubmit: TCrearUsuario = (data) => {
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
		>
			<AlertaErrorBackend error={error} />
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
			<CampoPassword
				name="password1"
				label="Contraseña"
				placeholder="Ingrese una contraseña de 8 caracteres con al menos un caracter especial"
			/>
			<CampoPassword
				name="password2"
				label="Confirmar Contraseña"
				placeholder="Confirme la contraseña"
				targetName="password1"
				isConfirm
			/>
		</VentanaFormulario>
	);
}