"use client";

import { useRouter } from "next/navigation";
import TablaHome from "@componentes/TablaHome";
import PaginaBase from "@componentes/base/PaginaBase";
import { 
	useGetLimnigrafos, 
	useGetMediciones,
	type LimnigrafoPaginatedResponse,
	type MedicionPaginatedResponse 
} from "@servicios/api/django.api";
import { transformarLimnigrafos } from "@lib/transformers/limnigrafoTransformer";
import { useMemo } from "react";

// Prioridad de estados para ordenamiento (menor = más urgente)
const estadoPriority: Record<string, number> = {
	fuera: 0,
	advertencia: 1,
	prueba: 2,
	activo: 3,
};

export default function Home() {
	// Consultar datos reales del backend con auto-refresh cada 5 minutos
	const { data: limnigrafosData, isLoading: loadingLimnigrafos } = useGetLimnigrafos({
		config: {
			refetchInterval: 300000, // 5 minutos (sincronizado con simulador)
		}
	});
	const { data: medicionesData, isLoading: loadingMediciones } = useGetMediciones({
		config: {
			refetchInterval: 300000, // 5 minutos (sincronizado con simulador)
		}
	});

	// Cast explícito para TypeScript
	const limnigrafos = limnigrafosData as LimnigrafoPaginatedResponse | undefined;
	const mediciones = medicionesData as MedicionPaginatedResponse | undefined;

	// Transformar y filtrar datos para el HOME
	// Solo mostramos estados "advertencia" y "fuera", ordenados por prioridad
	const homeLimnigrafos = useMemo(() => {
		if (!limnigrafos?.results || !mediciones?.results) return [];

		// Convertir array de mediciones a Map para búsqueda eficiente
		const medicionesMap = new Map(
			mediciones.results.map(m => [m.limnigrafo, m])
		);

		// Transformar formato backend a formato frontend
		const transformados = transformarLimnigrafos(
			limnigrafos.results,
			medicionesMap
		);

		// Filtrar solo estados problemáticos (advertencia o fuera de línea)
		return transformados
			.filter(
				(item) =>
					item.estado.variante === "advertencia" ||
					item.estado.variante === "fuera"
			)
			// Ordenar por prioridad (fuera=0 más urgente, activo=3 menos urgente)
			.sort((a, b) => {
				const priorityA = estadoPriority[a.estado.variante ?? ""] ?? 4;
				const priorityB = estadoPriority[b.estado.variante ?? ""] ?? 4;
				return priorityA - priorityB;
			});
	}, [limnigrafos, mediciones]);

	return (
		<PaginaBase>
			<main className="flex flex-col flex-1 items-start justify-center px-6 py-10">
				<TablaHome
					data={homeLimnigrafos}
					className="max-h-[50vh] overflow-y-auto"
				/>
			</main>
		</PaginaBase>
	);
}
