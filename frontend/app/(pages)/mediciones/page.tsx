"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import {
	useGetLimnigrafos,
	useGetMediciones,
	type LimnigrafoPaginatedResponse,
	type MedicionPaginatedResponse
} from "@servicios/api/django.api";
import { transformarLimnigrafos } from "@lib/transformers/limnigrafoTransformer";

type MedicionRow = {
	id: string;
	timestamp: string;
	temperatura: string;
	altura: string;
	presion: string;
};

function formatTimestamp(timestamp: string) {
	const fecha = new Date(timestamp);
	if (Number.isNaN(fecha.getTime())) {
		return timestamp;
	}

	return `${fecha.toLocaleDateString("es-AR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	})} ${fecha.toLocaleTimeString("es-AR", {
		hour: "2-digit",
		minute: "2-digit",
	})}`;
}

export default function MedicionesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [selectedLimnigrafoId, setSelectedLimnigrafoId] = useState("");

	// Consultar datos reales del backend con auto-refresh cada 5 minutos
	const { data: limnigrafosData, isLoading: isLoadingLimnigrafos } = useGetLimnigrafos({
		config: {
			refetchInterval: 300000, // 5 minutos (sincronizado con simulador)
		}
	});
	const { data: medicionesData, isLoading: isLoadingMediciones } = useGetMediciones({
		config: {
			refetchInterval: 300000, // 5 minutos (sincronizado con simulador)
		}
	});

	// Cast explícito para TypeScript
	const limnigrafos = limnigrafosData as LimnigrafoPaginatedResponse | undefined;
	const mediciones = medicionesData as MedicionPaginatedResponse | undefined;

	// Transformar datos del backend a formato frontend
	const limnigrafosTransformados = useMemo(() => {
		// Manejar tanto respuesta paginada como array directo
		const limnigrafosArray = Array.isArray(limnigrafos) 
			? limnigrafos 
			: limnigrafos?.results;
			
		const medicionesArray = mediciones?.results || [];
		
		if (!limnigrafosArray || limnigrafosArray.length === 0) return [];

		// Convertir array de mediciones a Map para búsqueda eficiente
		const medicionesMap = new Map(
			medicionesArray.map(m => [m.limnigrafo, m])
		);

		// Transformar formato backend a formato frontend
		return transformarLimnigrafos(
			limnigrafosArray,
			medicionesMap
		);
	}, [limnigrafos, mediciones]);

	// Seleccionar limnímgrafo automáticamente desde URL o primero de la lista
	useEffect(() => {
		const paramId = searchParams?.get("id");
		if (paramId && paramId !== selectedLimnigrafoId) {
			setSelectedLimnigrafoId(paramId);
		} else if (!paramId && !selectedLimnigrafoId && limnigrafosTransformados[0]) {
			setSelectedLimnigrafoId(limnigrafosTransformados[0].id);
		}
	}, [searchParams, limnigrafosTransformados, selectedLimnigrafoId]);

	const selectedLimnigrafo = useMemo(() => {
		return (
			limnigrafosTransformados.find((item) => item.id === selectedLimnigrafoId) ??
			limnigrafosTransformados[0] ??
			null
		);
	}, [limnigrafosTransformados, selectedLimnigrafoId]);

	// Filtrar mediciones del limnímgrafo seleccionado y formatearlas para la tabla
	const medicionesFiltered = useMemo(() => {
		if (!selectedLimnigrafo || !mediciones?.results) {
			return [];
		}

		// Obtener ID numérico del limnímgrafo seleccionado
		const limnigrafoIdNum = Number(selectedLimnigrafo.id);

		// Filtrar mediciones de este limnímgrafo
		return mediciones.results
			.filter(m => m.limnigrafo === limnigrafoIdNum)
			.sort((a, b) => {
				// Ordenar por fecha descendente (más reciente primero)
				const fechaA = new Date(a.fecha_hora).getTime();
				const fechaB = new Date(b.fecha_hora).getTime();
				return fechaB - fechaA;
			})
			.map(m => ({
				id: m.id.toString(),
				timestamp: m.fecha_hora,
				temperatura: m.temperatura != null ? `${m.temperatura.toFixed(1)} C` : '-',
				altura: m.altura_agua != null ? `${m.altura_agua.toFixed(2)} mts` : '-',
				presion: m.presion != null ? `${m.presion.toFixed(2)} bar` : '-',
			}));
	}, [selectedLimnigrafo, mediciones]);

	// Obtener la medición más reciente para mostrar valores actuales
	const latestMedicion = useMemo(() => medicionesFiltered[0], [medicionesFiltered]);

	const temperaturaActual =
		latestMedicion?.temperatura ?? selectedLimnigrafo?.temperatura ?? "-";
	const alturaActual =
		latestMedicion?.altura ?? selectedLimnigrafo?.altura ?? "-";
	const presionActual =
		latestMedicion?.presion ?? selectedLimnigrafo?.presion ?? "-";

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">

				<main className="flex flex-1 items-start justify-center px-6 py-10">
					<div className="flex w-full max-w-[1568px] flex-col gap-6">
						<section className="rounded-3xl bg-white p-6 shadow-[0px_12px_30px_rgba(27,39,94,0.08)]">
							<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
								<div>
									<h1 className="text-3xl font-semibold text-[#0D1B2A]">
										Mediciones
									</h1>
								<p className="text-base text-[#4D5562]">
									Consulta la temperatura, altura y presion reportada por cada
									limnigrafo segun la fecha del registro.
								</p>
							</div>								<div className="flex w-full max-w-sm flex-col gap-2">
									<label
										htmlFor="limnigrafo-selector"
										className="text-sm font-semibold text-[#4D5562]"
									>
										Seleccionar limnigrafo
									</label>
									<select
										id="limnigrafo-selector"
										className="rounded-2xl border border-[#CFD8E3] bg-white px-4 py-3 text-base font-medium text-[#0F172A] outline-none focus:border-[#1D9BF0]"
										value={selectedLimnigrafoId}
										onChange={(event) => setSelectedLimnigrafoId(event.target.value)}
									>
										{limnigrafosTransformados.map((limnigrafo) => (
											<option key={limnigrafo.id} value={limnigrafo.id}>
												{limnigrafo.nombre}
											</option>
										))}
									</select>
								</div>
							</div>

							{selectedLimnigrafo && (
								<div className="mt-6 grid gap-4 md:grid-cols-3">
									<div className="rounded-2xl bg-[#F4F8FF] px-4 py-3">
										<p className="text-sm text-[#4D5562]">Temperatura actual</p>
										<p className="text-2xl font-semibold text-[#0D1B2A]">
											{temperaturaActual}
										</p>
									</div>
									<div className="rounded-2xl bg-[#F4F8FF] px-4 py-3">
										<p className="text-sm text-[#4D5562]">Altura actual</p>
										<p className="text-2xl font-semibold text-[#0D1B2A]">
											{alturaActual}
										</p>
									</div>
									<div className="rounded-2xl bg-[#F4F8FF] px-4 py-3">
										<p className="text-sm text-[#4D5562]">Presion actual</p>
										<p className="text-2xl font-semibold text-[#0D1B2A]">
											{presionActual}
										</p>
									</div>
								</div>
							)}
						</section>

						<section className="rounded-3xl bg-white p-6 shadow-[0px_12px_30px_rgba(27,39,94,0.08)]">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-semibold text-[#0D1B2A]">
									Registros por fecha
								</h2>
								<p className="text-sm text-[#64748B]">
									{selectedLimnigrafo
										? `${medicionesFiltered.length} registros`
										: "Sin limnigrafo seleccionado"}
								</p>
							</div>

							<div className="mt-6 overflow-x-auto">
								<table className="min-w-full border-separate border-spacing-y-3">
									<thead>
										<tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
											<th className="rounded-l-2xl bg-[#F8FAFC] px-4 py-3">
												Fecha
											</th>
											<th className="bg-[#F8FAFC] px-4 py-3">Temperatura</th>
											<th className="bg-[#F8FAFC] px-4 py-3">Altura</th>
											<th className="rounded-r-2xl bg-[#F8FAFC] px-4 py-3">
												Presion
											</th>
										</tr>
									</thead>
									<tbody>
										{medicionesFiltered.map((medicion) => (
											<tr
												key={medicion.id}
												className="text-base text-[#0F172A]"
											>
												<td className="rounded-l-2xl bg-white px-4 py-4 shadow-[0px_6px_16px_rgba(15,23,42,0.08)]">
													<div className="font-semibold">
														{formatTimestamp(medicion.timestamp)}
													</div>
													<p className="text-sm text-[#64748B]">
														{selectedLimnigrafo?.nombre}
													</p>
												</td>
												<td className="bg-white px-4 py-4 shadow-[0px_6px_16px_rgba(15,23,42,0.08)]">
													{medicion.temperatura}
												</td>
												<td className="bg-white px-4 py-4 shadow-[0px_6px_16px_rgba(15,23,42,0.08)]">
													{medicion.altura}
												</td>
												<td className="rounded-r-2xl bg-white px-4 py-4 shadow-[0px_6px_16px_rgba(15,23,42,0.08)]">
													{medicion.presion}
												</td>
											</tr>
										))}
									</tbody>
								</table>

								{(isLoadingLimnigrafos || isLoadingMediciones) ? (
									<p className="py-8 text-center text-sm text-[#6F6F6F]">
										Cargando mediciones desde el backend...
									</p>
								) : medicionesFiltered.length === 0 ? (
									<p className="py-8 text-center text-sm text-[#6F6F6F]">
										{selectedLimnigrafo
											? "No hay mediciones registradas para este limnígrafo."
											: "Selecciona un limnigrafo para ver sus mediciones."}
									</p>
								) : null}
							</div>
						</section>
					</div>
				</main>
			</div>
		</PaginaBase>
	);
}
