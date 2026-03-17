import { EstadoUsuario } from "types/usuarios";
import ChipEstado from "./ChipEstado";

type ChipEstadoUsuarioProps = {
	estado: EstadoUsuario,
}

export const ESTILOS_ESTADO_USUARIO = {
	activo: {
		etiqueta: "Activo",
		backgroundColor: "#1ED760",
		borderColor: "#0F780F69",
	},
	inactivo: {
		etiqueta: "Inactivo",
		backgroundColor: "#64748B",
		borderColor: "#334155",
	},
};

export default function ChipEstadoUsuario({ estado }: ChipEstadoUsuarioProps) {
	return (
		<ChipEstado
			{...ESTILOS_ESTADO_USUARIO[estado]}
		/>
	);
}
