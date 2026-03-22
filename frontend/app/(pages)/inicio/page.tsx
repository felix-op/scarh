"use client";

import TablaHome from "@componentes/TablaHome";
import PaginaBase from "@componentes/base/PaginaBase";
import {
	type MedicionPaginatedResponse,
	type MedicionResponse,
	useGetMediciones,
} from "@servicios/api/django.api";
import { useGetLimnigrafos } from "@servicios/api/limnigrafos";
import { Paginado } from "@servicios/api/types";
import { mapearEstado } from "@lib/transformers/limnigrafoTransformer";
import { useMemo } from "react";
import { LimnigrafoResponse } from "types/limnigrafos";

const HOME_PAGE_SIZE = 1000;

// Prioridad de estados para ordenamiento (menor = más urgente)
const estadoPriority: Record<string, number> = {
	fuera: 0,
	peligro: 1,
	advertencia: 2,
	prueba: 3,
	activo: 4,
};

function formatNumber(value: number, decimals = 2): string {
	if (Number.isNaN(value)) {
		return "-";
	}

	return value.toLocaleString("es-AR", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

export default function Home() {
	const { data: limnigrafosData, error: limnigrafosError } = useGetLimnigrafos({
		params: {
			queryParams: {
				limit: String(HOME_PAGE_SIZE),
				page: "1",
			},
		},
		config: {
			refetchInterval: 300000,
		},
	});

	const { data: medicionesRecientesData, error: medicionesRecientesError } = useGetMediciones({
		params: {
			queryParams: {
				limit: String(HOME_PAGE_SIZE),
				page: "1",
			},
		},
		config: {
			refetchInterval: 300000,
		},
	});

	const limnigrafosPayload = limnigrafosData as Paginado<LimnigrafoResponse> | LimnigrafoResponse[] | undefined;
	const limnigrafos = useMemo(
		() => (
			Array.isArray(limnigrafosPayload)
				? limnigrafosPayload
				: limnigrafosPayload?.results ?? []
		),
		[limnigrafosPayload],
	);

	const medicionesRecientes = useMemo(
		() => ((medicionesRecientesData as MedicionPaginatedResponse | undefined)?.results ?? []),
		[medicionesRecientesData],
	);

	const medicionesMap = useMemo(() => {
		const map = new Map<number, MedicionResponse>();

		medicionesRecientes.forEach((medicion) => {
			const current = map.get(medicion.limnigrafo);
			if (!current) {
				map.set(medicion.limnigrafo, medicion);
				return;
			}

			if (new Date(medicion.fecha_hora).getTime() > new Date(current.fecha_hora).getTime()) {
				map.set(medicion.limnigrafo, medicion);
			}
		});

		return map;
	}, [medicionesRecientes]);

	const homeLimnigrafos = useMemo(() => {
		if (limnigrafos.length === 0) {
			return [];
		}

		return limnigrafos
			.map((limnigrafo) => {
				const medicionReciente = medicionesMap.get(limnigrafo.id);
				const fechaUltimoRegistro = medicionReciente?.fecha_hora ?? limnigrafo.ultima_conexion;
				const fechaRegistro = fechaUltimoRegistro ? new Date(fechaUltimoRegistro) : null;
				const ultimoRegistro = fechaRegistro && !Number.isNaN(fechaRegistro.getTime())
					? `${fechaRegistro.toLocaleDateString("es-AR")} ${fechaRegistro.toLocaleTimeString("es-AR", {
						hour: "2-digit",
						minute: "2-digit",
					})}`
					: "Sin registros";

				return {
					id: String(limnigrafo.id),
					nombre: limnigrafo.codigo,
					nivel_de_bateria: medicionReciente?.nivel_de_bateria !== null
						&& medicionReciente?.nivel_de_bateria !== undefined
						? `${formatNumber(medicionReciente.nivel_de_bateria, 1)} %`
						: "-",
					estado: mapearEstado(limnigrafo.estado),
					ultimoRegistro,
					altura: medicionReciente?.altura_agua !== null && medicionReciente?.altura_agua !== undefined
						? `${formatNumber(medicionReciente.altura_agua, 2)} m`
						: "-",
					temperatura: medicionReciente?.temperatura !== null && medicionReciente?.temperatura !== undefined
						? `${formatNumber(medicionReciente.temperatura, 2)} °C`
						: "-",
					presion: medicionReciente?.presion !== null && medicionReciente?.presion !== undefined
						? `${formatNumber(medicionReciente.presion, 2)} hPa`
						: "-",
				};
			})
			.sort((a, b) => {
				const priorityA = estadoPriority[a.estado.variante ?? ""] ?? 4;
				const priorityB = estadoPriority[b.estado.variante ?? ""] ?? 4;
				if (priorityA !== priorityB) {
					return priorityA - priorityB;
				}
				return a.nombre.localeCompare(b.nombre, "es");
			});
	}, [limnigrafos, medicionesMap]);

	const topError = limnigrafosError ?? medicionesRecientesError;

	return (
		<PaginaBase>
			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1568px] flex-col gap-8">
					<header className="flex flex-col gap-1">
						<h1 className="text-[34px] font-semibold text-[#011018] dark:text-[#E2E8F0]">Inicio</h1>
						<p className="text-base text-[#4D5562] dark:text-[#94A3B8]">
							Estado operativo de los limnígrafos en tiempo casi real.
						</p>
					</header>

					{topError ? (
						<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
							No se pudieron cargar todos los datos del inicio. Verificá la conexión con el backend.
						</p>
					) : null}

					<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
						<div className="mb-4">
							<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
								Estados críticos y último registro
							</p>
						</div>
						<TablaHome
							data={homeLimnigrafos}
							className="max-h-[clamp(260px,50vh,620px)] !overflow-y-auto overscroll-y-contain"
						/>
					</section>
				</div>
			</main>
		</PaginaBase>
	);
}
