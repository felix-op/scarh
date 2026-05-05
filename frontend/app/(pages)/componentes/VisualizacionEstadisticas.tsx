"use client";

import SeccionCard from "@componentes/secciones/SeccionCard";
import { useGetLimnigrafos } from "@servicios/api/limnigrafos";
import { useEffect, useState } from "react";
import EstadisticasPorAtributo from "./EstadisticasPorAtributo";
import { SeccionEstadisticaPlaceholder } from "@componentes/secciones/SeccionEstadisticaPlaceholder";

const tiempoActualizacion = 30000; // 30 segundos

const HOME_PAGE_SIZE = 1000;

export default function VisualizacionEstadisticas() {
	const [fechasConsulta, setFechasConsulta] = useState(() => {
		const fHoy = new Date();
		const fSemana = new Date();
		fSemana.setDate(fHoy.getDate() - 7);
		return { inicio: fSemana, fin: fHoy };
	});

	const { data: limnigrafos, isSuccess: isSuccessLimnigrafos, isFetching: isFetchingLimnigrafos } = useGetLimnigrafos({
		params: {
			queryParams: {
				limit: String(HOME_PAGE_SIZE),
				page: "1",
			}
		}
	});

	useEffect(() => {
		if (!isSuccessLimnigrafos || !limnigrafos?.results) return;

		const actualizarFechas = () => {
			const fechaHoy = new Date();
			const fechaSemanaAnterior = new Date();
			fechaSemanaAnterior.setDate(fechaHoy.getDate() - 7);

			setFechasConsulta({ inicio: fechaSemanaAnterior, fin: fechaHoy });
		};

		// 1. Ejecutar inmediatamente al cargar
		actualizarFechas();

		// 2. Configurar la ejecución periódica cada 30 segundos
		const intervalo = setInterval(actualizarFechas, tiempoActualizacion);

		return () => clearInterval(intervalo);
	}, [isSuccessLimnigrafos, limnigrafos]);

	if (isFetchingLimnigrafos || !limnigrafos?.results) {
		return (
			<div className="grid grid-cols-4 gap-4">
				<SeccionEstadisticaPlaceholder />
				<SeccionEstadisticaPlaceholder />
				<SeccionEstadisticaPlaceholder />
				<SeccionEstadisticaPlaceholder />
			</div>
		);
	}

	const limnigrafosIds = limnigrafos.results.map((l) => l.id);

	return (
		<div className="grid grid-cols-4 gap-4">
			<SeccionCard className="p-4 shadow-sm flex flex-col justify-between">
				<h3 className="text-lg font-semibold text-gray-700">Limnígrafos Activos</h3>
				<p className="font-bold my-4 text-principal" style={{ fontSize: 40 }}>{limnigrafos.results.length}</p>
				<div className="text-sm text-gray-500">
					<p>Total registrados</p>
				</div>
			</SeccionCard>

			<EstadisticasPorAtributo
				label="Promedio Agua"
				atributo="altura_agua"
				fechaInicio={fechasConsulta.inicio}
				fechaFin={fechasConsulta.fin}
				limnigrafosIds={limnigrafosIds}
			/>

			<EstadisticasPorAtributo
				label="Promedio de Temperatura"
				atributo="temperatura"
				fechaInicio={fechasConsulta.inicio}
				fechaFin={fechasConsulta.fin}
				limnigrafosIds={limnigrafosIds}
			/>

			<EstadisticasPorAtributo
				label="Promedio de Presión"
				atributo="presion"
				fechaInicio={fechasConsulta.inicio}
				fechaFin={fechasConsulta.fin}
				limnigrafosIds={limnigrafosIds}
			/>
		</div>
	);
}