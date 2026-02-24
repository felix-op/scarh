import VentanaConfirmar from "@componentes/ventanas/VentanaConfirmar";
import { useDeleteUsuario } from "@servicios/api";

type VentanaEliminarUsuarioProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	id: string;
	elemento: string;
};

export default function VentanaEliminarUsuario({
	open,
	onClose,
	id,
	elemento,
}: VentanaEliminarUsuarioProps) {
	const { mutate: eliminarUsuario } = useDeleteUsuario({
		params: { id },
		configuracion: {
			onSuccess: () => {
				onClose();
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
			description={`¿Está seguro de que desea eliminar el usuario ${elemento}?`}
			variant="eliminar"
		/>
	);
}
