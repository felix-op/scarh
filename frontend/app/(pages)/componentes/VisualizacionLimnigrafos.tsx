"use client";

import BotonVariante from "@componentes/botones/BotonVariante";
import { ESTILOS_ESTADO_LIMNIGRAFO } from "@componentes/chips/ChipEstadoLimnigrafo";
import DataTable from "@componentes/tabla/DataTable";
import { ColumnConfig } from "@componentes/tabla/types";
import { useGetLimnigrafos } from "@servicios/api/limnigrafos";
import { useRouter } from "next/navigation";
import { LimnigrafoResponse, UltimaMedicionResponse } from "types/limnigrafos";

const HOME_PAGE_SIZE = 10;

function formatUltimaMedicion(medicion?: UltimaMedicionResponse | null): string {
	if (!medicion?.fecha_hora) {
		return "Sin registros";
	}

	const fecha = new Date(medicion.fecha_hora);
	if (Number.isNaN(fecha.getTime())) {
		return "Sin registros";
	}

	return `${fecha.toLocaleDateString("es-AR")} ${fecha.toLocaleTimeString("es-AR", {
		hour: "2-digit",
		minute: "2-digit",
	})}`;
}

function formatBateria(bateria?: number | null): string {
	if (bateria === null || bateria === undefined) {
		return "Sin registros";
	}

	return `${Math.trunc(bateria)} %`;
}

function ChipEstadoDashboard({ estado }: { estado: LimnigrafoResponse["estado"] }) {
	const variante =
		estado === "fuera_de_rango" || estado === "fuera_de_servicio"
			? "fuera"
			: estado === "normal"
				? "normal"
				: estado;
	const config = ESTILOS_ESTADO_LIMNIGRAFO[variante] ?? ESTILOS_ESTADO_LIMNIGRAFO.normal;

	return (
		<span className={`inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-sm font-semibold ${config.lightClassName} ${config.darkClassName}`}>
			<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white shadow-[0px_0px_0px_1px_rgba(148,163,184,0.18)] dark:bg-[#223149]">
				<span
					className="block h-3.5 w-3.5 rounded-full border"
					style={{ backgroundColor: config.backgroundColor, borderColor: config.borderColor }}
				/>
			</span>
			{config.etiqueta}
		</span>
	);
}

const tableColumns: ColumnConfig<LimnigrafoResponse>[] = [
	{
		id: "estado",
		header: "Estado",
		cell: (row) => (
			<div className="p-4">
				<ChipEstadoDashboard estado={row.estado} />
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
				{formatUltimaMedicion(row.ultima_medicion)}
			</p>
		),
	},
	{
		id: "bateria",
		header: "Batería",
		accessorKey: "bateria",
		cell: (row) => <p className="p-4">{formatBateria(row.bateria)}</p>,
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
				tableClassName: "table-auto",
				scrollY: "auto",
			}}
		/>
	);
}
