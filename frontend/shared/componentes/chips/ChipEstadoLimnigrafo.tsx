import { EstadoLimnigrafo } from "types/limnigrafos";
import ChipEstado from "./ChipEstado";

type ChipEstadoLimnigrafoProps = {
	estado: EstadoLimnigrafo,
}

export const ESTILOS_ESTADO_LIMNIGRAFO = {
	normal: {
		etiqueta: "Normal",
		backgroundColor: "#1ED760",
		borderColor: "#0F780F69",
	},
	prueba: {
		etiqueta: "Prueba",
		backgroundColor: "#FFEB0C",
		borderColor: "#ABB800",
	},
	fuera: {
		etiqueta: "Fuera",
		backgroundColor: "#64748B",
		borderColor: "#334155",
	},
	peligro: {
		etiqueta: "Peligro",
		backgroundColor: "#FF3B30",
		borderColor: "#9A1A14",
	},
	advertencia: {
		etiqueta: "Advertencia",
		backgroundColor: "#FF9800",
		borderColor: "#AD5C00",
	},
};

export default function ChipEstadoLimnigrafo({ estado }: ChipEstadoLimnigrafoProps) {
	return (
		<ChipEstado
			{...ESTILOS_ESTADO_LIMNIGRAFO[estado]}
		/>
	);
}
