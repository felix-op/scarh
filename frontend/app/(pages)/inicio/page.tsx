"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LimnigrafoTable from "@componentes/LimnigrafoTable";
import { Nav } from "@componentes/Nav";
import { LIMNIGRAFOS, toLimnigrafoRowData } from "@data/limnigrafos";

const BASE_LIMNIGRAFOS = toLimnigrafoRowData(LIMNIGRAFOS);
const estadoPriority: Record<string, number> = {
	fuera: 0,
	advertencia: 1,
	prueba: 2,
	activo: 3,
};

export default function Home() {
	const router = useRouter();
	const [searchValue, setSearchValue] = useState("");

	const filteredData = useMemo(() => {
		const normalizedSearch = searchValue.trim().toLowerCase();
		const baseListado = normalizedSearch
			? BASE_LIMNIGRAFOS.filter((item) =>
					[item.nombre, item.ubicacion].some((field) =>
						field.toLowerCase().includes(normalizedSearch)
					)
				)
			: BASE_LIMNIGRAFOS;

		return [...baseListado].sort((a, b) => {
			const priorityA = estadoPriority[a.estado.variante ?? ""] ?? 4;
			const priorityB = estadoPriority[b.estado.variante ?? ""] ?? 4;
			return priorityA - priorityB;
		});
	}, [searchValue]);

	return (
		<div className="flex min-h-screen w-full bg-[#EEF4FB]">
			<Nav
				userName="Juan Perez"
				userEmail="juan.perez@scarh.com"
				onProfileClick={() => router.push("/perfil")}
			/>

			<main className="flex flex-1 items-start justify-center px-6 py-10">
				<LimnigrafoTable
					data={filteredData}
					searchValue={searchValue}
					onSearchChange={setSearchValue}
					onFilterClick={() => {
						console.log("Filtro por aplicar");
					}}
					className="max-h-[50vh] overflow-y-auto"
				/>
			</main>
		</div>
	);
}
