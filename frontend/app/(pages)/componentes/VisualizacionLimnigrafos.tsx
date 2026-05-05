"use client";

import BotonVariante from "@componentes/botones/BotonVariante";
import ChipEstadoLimnigrafo from "@componentes/chips/ChipEstadoLimnigrafo";
import DataTable from "@componentes/tabla/DataTable";
import { ColumnConfig } from "@componentes/tabla/types";
import { useGetLimnigrafos } from "@servicios/api/limnigrafos";
import { useRouter } from "next/navigation";
import { LimnigrafoResponse } from "types/limnigrafos";

const HOME_PAGE_SIZE = 10;

const tableColumns: ColumnConfig<LimnigrafoResponse>[] = [
	{
		id: "estado",
		header: "Estado",
		cell: (row) => (
			<div className="p-4">
				<ChipEstadoLimnigrafo estado={row.estado} />
			</div>
		),
	},
	{
		id: "nombre",
		header: "Limnígrafo",
		accessorKey: "codigo",
	},
	{
		id: "ultima_medicion",
		header: "Último registro",
		accessorKey: "ultima_medicion",
		cell: (row) => (
			<p className="p-4">
				{(row.ultima_medicion) || "Sin registros"}
			</p>
		),
	},
	{
		id: "bateria",
		header: "Batería",
		accessorKey: "bateria",
		cell: (row) => <p className="p-4">{(row.bateria) || "Sin registros"}</p>,
	},
];

export default function VisualizacionLimnigrafos() {
	const router = useRouter();
	const { data: limnigrafos, error: limnigrafosError } = useGetLimnigrafos({
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

	if (limnigrafosError) return null;

	return (
		<DataTable
			data={limnigrafos?.results || []}
			columns={tableColumns}
			rowIdKey="id"
			enableRowAnimation={false}
			emptyStateContent={(
				<span className="text-[#6B7280] dark:text-[#94A3B8]">
					No hay limnígrafos para mostrar.
				</span>
			)}
			topBar={(
				<div className="flex justify-between p-4">
					<h2>Estado de limnigrafos</h2>
					<BotonVariante variant="ir" onClick={() => router.push("/limnigrafos")} />
				</div>
			)}
			styles={{
				scrollerClassName: "max-h-100",
				scrollY: "auto",
			}}
		/>
	);
}