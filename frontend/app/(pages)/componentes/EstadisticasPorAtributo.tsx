import { useGetEstadistica } from "@servicios/api/django.api";
import SeccionEstadistica from "@componentes/secciones/SeccionEstadistica";
import { formatearHora, formatearDiaMes } from "../../../shared/utiles/fechas";
import { EstadisticaAtributo } from "types/estadisticas";
import { useMemo } from "react";

interface Props {
	label: string;
	atributo: EstadisticaAtributo;
	fechaInicio: Date;
	fechaFin: Date;
	limnigrafosIds: number[];
}

export default function EstadisticasPorAtributo({ label, atributo, fechaInicio, fechaFin, limnigrafosIds }: Props) {
	const estadisticasRequest = useMemo(() => {
		if (limnigrafosIds.length === 0) {
			return null;
		}

		return {
			limnigrafos: limnigrafosIds.join(","),
			atributo,
			fecha_inicio: fechaInicio.toISOString(),
			fecha_fin: fechaFin.toISOString(),
		};
	}, [atributo, fechaFin, fechaInicio, limnigrafosIds]);

	const { data, isLoading, isFetching } = useGetEstadistica({
		params: estadisticasRequest ? { queryParams: estadisticasRequest } : undefined,
		config: {
			enabled: Boolean(estadisticasRequest),
			placeholderData: (previous) => previous,
		},
	});

	let valor: string | number = "-";
	if (isLoading || isFetching) {
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
