"use client";

import { useRouter } from "next/navigation";
import TablaHome from "@componentes/TablaHome";
import { Nav } from "@componentes/Nav";
import { LIMNIGRAFOS, toLimnigrafoRowData } from "@data/limnigrafos";
import PaginaBase from "@componentes/base/PaginaBase";

const BASE_LIMNIGRAFOS = toLimnigrafoRowData(LIMNIGRAFOS);
const estadoPriority: Record<string, number> = {
	fuera: 0,
	advertencia: 1,
	prueba: 2,
	activo: 3,
};

// Datos que se muestran en el HOME:
// solo estados "advertencia" y "fuera", ordenados por prioridad
const HOME_LIMNIGRAFOS = [...BASE_LIMNIGRAFOS]
	.filter(
		(item) =>
			item.estado.variante === "advertencia" ||
			item.estado.variante === "fuera",
	)
	.sort((a, b) => {
		const priorityA = estadoPriority[a.estado.variante ?? ""] ?? 4;
		const priorityB = estadoPriority[b.estado.variante ?? ""] ?? 4;
		return priorityA - priorityB;
	});

export default function Home() {
	const router = useRouter();

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">
				<Nav
					userName="Juan Perez"
					userEmail="juan.perez@scarh.com"
					onProfileClick={() => router.push("/perfil")}
				/>

				<main className="flex flex-1 items-start justify-center px-6 py-10">
					<TablaHome
						data={HOME_LIMNIGRAFOS}
						className="max-h-[50vh] overflow-y-auto"
					/>
				</main>
			</div>
		</PaginaBase>
	);
}
