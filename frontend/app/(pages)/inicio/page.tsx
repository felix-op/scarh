"use client";

import { useRouter } from "next/navigation";
import TablaHome from "@componentes/TablaHome";
import { Nav } from "@componentes/Nav";
import { LIMNIGRAFOS, toLimnigrafoRowData } from "@data/limnigrafos";
import PaginaBase from "@componentes/base/PaginaBase";
import { useDeleteLimnigrafo, useGetLimnigrafos, usePostLimnigrafo, usePutLimnigrafo } from "@servicios/api/django.api";
import BotonFeo from "./componentes/BotonFeo";
import { useEffect } from "react";

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
	const { data: limnigrafos } = useGetLimnigrafos({});
	const { mutate: crearLimnigrafo } = usePostLimnigrafo({});
	const { mutate: editarLimnigrafo } = usePutLimnigrafo({
		params: { id: "1" },
	});
	const { mutate: eliminarLimnigrafo } = useDeleteLimnigrafo({
		params: { id: "2" },
	});

	useEffect(() => {
		if (limnigrafos) {
			console.log("Limnigrafos: ", limnigrafos);
		}
	}, [limnigrafos]);

	const onPost = () => {
		crearLimnigrafo({ data: {
			codigo: 'uncodigo',
			descripcion: 'Una descripcion',
			bateria_max: 29039,
			bateria_min: 10837,
			memoria: 2000,
			tiempo_advertencia: "12:01:01.009Z",
			tiempo_peligro: "12:01:01.009Z",
			ultimo_mantenimiento: "2025-12-03",
			tipo_comunicacion: ["fisico-usb"],
		}});
	}

	const onPut = () => {
		editarLimnigrafo({ data: {
			codigo: 'Un codigo Editado',
			descripcion: 'Una descripcion editada',
			bateria_max: 29039,
			bateria_min: 10837,
			memoria: 2000,
			tiempo_advertencia: "12:01:01.009Z",
			tiempo_peligro: "12:01:01.009Z",
			ultimo_mantenimiento: "2025-12-03",
			tipo_comunicacion: ["fisico-usb"],
		}});
	}

	const onDelete = () => {
		eliminarLimnigrafo({});
	}

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">
				<Nav
					userName="Juan Perez"
					userEmail="juan.perez@scarh.com"
					onProfileClick={() => router.push("/perfil")}
				/>

				<main className="flex flex-1 items-start justify-center px-6 py-10">
					<BotonFeo onClick={onPost}>Probando POST</BotonFeo>
					<BotonFeo onClick={onPut}>Probando PUT</BotonFeo>
					<BotonFeo onClick={onDelete}>Probando DELETE</BotonFeo>
					<TablaHome
						data={HOME_LIMNIGRAFOS}
						className="max-h-[50vh] overflow-y-auto"
					/>
				</main>
			</div>
		</PaginaBase>
	);
}
