"use client";

import DataTable from "@componentes/tabla/DataTable";
import { ColumnConfig } from "@componentes/tabla/types";
import {
	BotonEstadoLimnigrafo,
	type EstadoLimnigrafo,
} from "./BotonEstadoLimnigrafo";

type TablaHomeRow = {
	id: string;
	nombre: string;
	nivel_de_bateria: string;
	ultimoRegistro: string;
	altura: string;
	temperatura: string;
	presion: string;
	estado: EstadoLimnigrafo;
};

type TablaHomeProps = {
	data: TablaHomeRow[];
	className?: string;
};

const tableColumns: ColumnConfig<TablaHomeRow>[] = [
	{
		id: "estado",
		header: "Estado",
		cell: (row) => <BotonEstadoLimnigrafo estado={row.estado} />,
	},
	{
		id: "nombre",
		header: "Limnígrafo",
		cell: (row) => <span className="font-medium">{row.nombre}</span>,
	},
	{
		id: "ultimoRegistro",
		header: "Último registro",
		accessorKey: "ultimoRegistro",
	},
	{
		id: "altura",
		header: "Altura",
		accessorKey: "altura",
	},
	{
		id: "temperatura",
		header: "Temperatura",
		accessorKey: "temperatura",
	},
	{
		id: "presion",
		header: "Presión",
		accessorKey: "presion",
	},
	{
		id: "nivel_de_bateria",
		header: "Batería",
		accessorKey: "nivel_de_bateria",
	},
];

export default function TablaHome({ data, className = "" }: TablaHomeProps) {
	return (
		<DataTable
			data={data}
			columns={tableColumns}
			rowIdKey="id"
			showTopBar={false}
			enableRowAnimation={false}
			minWidth={1100}
			emptyStateContent={(
				<span className="text-[#6B7280] dark:text-[#94A3B8]">
					No hay limnígrafos para mostrar.
				</span>
			)}
			styles={{
				rootClassName: "pb-0",
				cardClassName: "rounded-[20px] border-[#E5E7EB] bg-white shadow-[0px_8px_16px_rgba(0,0,0,0.08)] dark:border-[#334155] dark:bg-[#0F172A] dark:shadow-[0px_10px_20px_rgba(0,0,0,0.45)]",
				scrollerClassName: `relative overflow-x-auto ${className}`.trim(),
				tableClassName: "min-w-full text-left text-[13px] text-[#2F2F2F] dark:text-[#CBD5E1]",
				theadClassName: "bg-[#F7F9FB] text-[13px] uppercase tracking-wide text-[#6B6B6B] border-none dark:bg-[#111923] dark:text-[#94A3B8]",
				headerCellClassName: "sticky top-0 z-10 px-3 py-2 bg-[#F7F9FB] dark:bg-[#111923]",
				tbodyClassName: "divide-y divide-[#EAEAEA] dark:divide-[#334155]",
				rowClassName: "border-0 hover:bg-[#F9FBFF] dark:hover:bg-[#1E293B]",
				cellClassName: "align-middle px-3 py-2",
				emptyCellClassName: "px-4 py-8 text-center",
			}}
		/>
	);
}
