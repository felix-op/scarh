import { useEffect } from "react";
import { usePostEstadistica } from "@servicios/api/django.api";
import SeccionEstadistica from "@componentes/secciones/SeccionEstadistica";
import { formatearHora, formatearDiaMes } from "../../../shared/utiles/fechas";
import { EstadisticaAtributo } from "types/estadisticas";

interface Props {
	label: string;
	atributo: EstadisticaAtributo;
	fechaInicio: Date;
	fechaFin: Date;
	limnigrafosIds: number[];
}

export default function EstadisticasPorAtributo({ label, atributo, fechaInicio, fechaFin, limnigrafosIds }: Props) {
	const { mutate: traerEstadisticas, data, isPending } = usePostEstadistica({});

	useEffect(() => {
		if (limnigrafosIds.length === 0) return;

		traerEstadisticas({
			data: {
				atributo,
				fecha_inicio: fechaInicio.toISOString(),
				fecha_fin: fechaFin.toISOString(),
				limnigrafos: limnigrafosIds,
			}
		});
	}, [fechaInicio, fechaFin, atributo, limnigrafosIds, traerEstadisticas]);

	let valor: string | number = "-";
	if (isPending) {
		valor = "...";
	} else if (data && data.length > 0) {
		// Usamos el percentil_90 como valor representativo si no hay un promedio explícito en la API.
		const num = data[0].percentil_90 ?? data[0].maximo;
		valor = typeof num === 'number' ? num.toFixed(2) : num;
	}

	return (
		<SeccionEstadistica
			label={label}
			valor={valor}
			horaActualizacion={formatearHora(fechaFin)}
			fechaInicio={formatearDiaMes(fechaInicio)}
			fechaFin={formatearDiaMes(fechaFin)}
		/>
	);
}
