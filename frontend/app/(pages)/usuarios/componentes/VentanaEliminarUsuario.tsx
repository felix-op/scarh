import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import VentanaConfirmar from "@componentes/ventanas/VentanaConfirmar";
import { useDeleteUsuario } from "@servicios/api";
import { UsuarioResponse } from "types/usuarios";

type VentanaEliminarUsuarioProps = {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
	usuario?: UsuarioResponse | null;
	queriesToInvalidate: string[]
	handleMessage: (message: VentanaAceptarOptions) => void
};

export default function VentanaEliminarUsuario({
	open,
	onClose,
	onSuccess,
	usuario,
	queriesToInvalidate,
	handleMessage,
}: VentanaEliminarUsuarioProps) {
	const { mutate: eliminarUsuario } = useDeleteUsuario({
		params: { id: String(usuario?.id) },
		configuracion: {
			queriesToInvalidate,
			onSuccess: () => {
				onSuccess();
			},
			onError: () => {
				onClose();
				handleMessage({
					title: "Error al eliminar",
					description: `El usuario ${usuario?.id} no se pudo eliminar`,
					variant: "error",
				});
			},
		},
	});

	const onConfirm = () => {
		eliminarUsuario({});
	};

	return (
		<VentanaConfirmar
			open={open}
			onClose={onClose}
			onConfirm={onConfirm}
			title="Eliminar Usuario"
			description={`¿Está seguro de que desea eliminar el usuario ${usuario?.nombre_usuario || ""}?`}
			variant="eliminar"
		/>
	);
}
