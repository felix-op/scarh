"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import { Nav } from "@componentes/Nav";
import {
	LIMNIGRAFOS,
	type LimnigrafoDetalleData,
	type LimnigrafoMedicion,
} from "@data/limnigrafos";

type MedicionRow = {
	id: string;
	timestamp: string;
	temperatura: string;
	altura: string;
	presion: string;
};

type LimnigrafoStorePayload = {
	limnigrafos: LimnigrafoDetalleData[];
	mediciones: Record<string, LimnigrafoMedicion[]>;
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

function buildMediciones(limnigrafo: LimnigrafoDetalleData): MedicionRow[] {
	const baseTemperatura = Number.parseFloat(limnigrafo.temperatura) || 0;
	const baseAltura = Number.parseFloat(limnigrafo.altura) || 0;
	const basePresion = Number.parseFloat(limnigrafo.presion) || 0;
	const totalRegistros = 8;

	return Array.from({ length: totalRegistros }, (_, index) => {
		const fecha = new Date();
		fecha.setDate(fecha.getDate() - index);
		fecha.setHours(6 + (index % 4) * 3, (index * 11) % 60, 0, 0);

		const temperatura = `${(baseTemperatura + (index - 2) * 0.3).toFixed(1)} C`;
		const altura = `${(baseAltura + ((index % 3) - 1) * 0.4).toFixed(1)} mts`;
		const presion = `${(basePresion + ((index % 4) - 1.5) * 0.05).toFixed(2)} bar`;

		return {
			id: `${limnigrafo.id}-med-${index}`,
			timestamp: fecha.toISOString(),
			temperatura,
			altura,
			presion,
		};
	});
}

const MEDICIONES_POR_LIMNIGRAFO: Record<string, MedicionRow[]> = LIMNIGRAFOS.reduce(
	(acc, limnigrafo) => {
		acc[limnigrafo.id] = buildMediciones(limnigrafo);
		return acc;
	},
	{} as Record<string, MedicionRow[]>,
);

export default function MedicionesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [limnigrafosData, setLimnigrafosData] =
		useState<LimnigrafoDetalleData[]>(LIMNIGRAFOS);
	const [medicionesPersistidas, setMedicionesPersistidas] = useState<
		Record<string, LimnigrafoMedicion[]>
	>({});
	const [selectedLimnigrafoId, setSelectedLimnigrafoId] = useState("");
	const [isLoadingStore, setIsLoadingStore] = useState(true);
	const [storeError, setStoreError] = useState<string | null>(null);

	useEffect(() => {
		let cancelado = false;

		async function cargarStore() {
			try {
				const response = await fetch("/api/limnigrafos");
				if (!response.ok) {
					throw new Error("No se pudo leer el archivo de limnigrafos.");
				}

				const data = (await response.json()) as LimnigrafoStorePayload;
				if (cancelado) {
					return;
				}

				const dataset =
					data.limnigrafos && data.limnigrafos.length
						? data.limnigrafos
						: LIMNIGRAFOS;
				setLimnigrafosData(dataset);
				setMedicionesPersistidas(data.mediciones ?? {});
				setStoreError(null);
			} catch (error) {
				if (!cancelado) {
					setStoreError(
						error instanceof Error
							? error.message
							: "No se pudo cargar el archivo de limnigrafos.",
					);
				}
			} finally {
				if (!cancelado) {
					setIsLoadingStore(false);
				}
			}
		}

		void cargarStore();

		return () => {
			cancelado = true;
		};
	}, []);

	useEffect(() => {
		const paramId = searchParams?.get("id");
		if (paramId && paramId !== selectedLimnigrafoId) {
			setSelectedLimnigrafoId(paramId);
		} else if (!paramId && !selectedLimnigrafoId && limnigrafosData[0]) {
			setSelectedLimnigrafoId(limnigrafosData[0].id);
		}
	}, [searchParams, limnigrafosData, selectedLimnigrafoId]);

	const selectedLimnigrafo = useMemo(() => {
		return (
			limnigrafosData.find((item) => item.id === selectedLimnigrafoId) ??
			limnigrafosData[0] ??
			null
		);
	}, [limnigrafosData, selectedLimnigrafoId]);

	const mediciones = useMemo(() => {
		if (!selectedLimnigrafo) {
			return [];
		}

		const persistidas = medicionesPersistidas[selectedLimnigrafo.id];
		if (persistidas && persistidas.length > 0) {
			return [...persistidas]
				.sort((a, b) => {
					const fechaA = new Date(a.timestamp ?? "").getTime();
					const fechaB = new Date(b.timestamp ?? "").getTime();
					return Number.isNaN(fechaB) ? -1 : fechaB - fechaA;
				})
				.map((item) => ({
					id: item.id,
					timestamp: item.timestamp,
					temperatura: item.temperatura ?? "-",
					altura: item.altura ?? "-",
					presion: item.presion ?? "-",
				}));
		}

		return buildMediciones(selectedLimnigrafo);
	}, [selectedLimnigrafo, medicionesPersistidas]);

	const latestMedicion = useMemo(() => mediciones[0], [mediciones]);

	const temperaturaActual =
		latestMedicion?.temperatura?.trim()
			? latestMedicion.temperatura
			: selectedLimnigrafo?.temperatura ?? "-";
	const alturaActual =
		latestMedicion?.altura?.trim()
			? latestMedicion.altura
			: selectedLimnigrafo?.altura ?? "-";
	const presionActual =
		latestMedicion?.presion?.trim()
			? latestMedicion.presion
			: selectedLimnigrafo?.presion ?? "-";

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">
				<Nav
					userName="Juan Perez"
					userEmail="juan.perez@scarh.com"
					onProfileClick={() => router.push("/perfil")}
				/>

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
									{storeError ? (
										<p className="text-sm text-red-500">{storeError}</p>
									) : null}
								</div>

								<div className="flex w-full max-w-sm flex-col gap-2">
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
										{limnigrafosData.map((limnigrafo) => (
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
										? `${mediciones.length} registros`
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
										{mediciones.map((medicion) => (
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

								{isLoadingStore ? (
									<p className="py-8 text-center text-sm text-[#6F6F6F]">
										Cargando mediciones guardadas...
									</p>
								) : mediciones.length === 0 ? (
									<p className="py-8 text-center text-sm text-[#6F6F6F]">
										Selecciona un limnigrafo para ver sus mediciones.
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
