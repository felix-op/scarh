"use client";

import { useRouter } from "next/navigation";
import TablaHome from "@componentes/TablaHome";
import { Nav } from "@componentes/Nav";
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
	const router = useRouter();
	
	// Consultar datos reales del backend
	const { data: limnigrafosData, isLoading: loadingLimnigrafos } = useGetLimnigrafos({});
	const { data: medicionesData, isLoading: loadingMediciones } = useGetMediciones({});

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

		const transformados = transformarLimnigrafos(
			limnigrafos.results,
			medicionesMap
		);

		return transformados
			.filter(
				(item) =>
					item.estado.variante === "advertencia" ||
					item.estado.variante === "fuera"
			)
			.sort((a, b) => {
				const priorityA = estadoPriority[a.estado.variante ?? ""] ?? 4;
				const priorityB = estadoPriority[b.estado.variante ?? ""] ?? 4;
				return priorityA - priorityB;
			});
	}, [limnigrafos, mediciones]);

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">
				<Nav
					userName="Juan Perez"
					userEmail="juan.perez@scarh.com"
					onProfileClick={() => router.push("/perfil")}
				/>

				<main className="flex flex-col flex-1 items-start justify-center px-6 py-10">
					<TablaHome
						data={homeLimnigrafos}
						className="max-h-[50vh] overflow-y-auto"
					/>
				</main>
			</div>
		</PaginaBase>
	);
}
