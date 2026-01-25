"use client";

import BotonVariante from "@componentes/botones/BotonVariante";
import { ActionConfig, ColumnConfig } from "./types";

type DataTableProps<T> = {
	noResults?: boolean;
    isLoading?: boolean;
    data: T[];
    columns: ColumnConfig<T>[];
	minWidth?: number | string;
    rowIdKey: keyof T;
	onAdd?: () => void;
	actionConfig?: ActionConfig<T>;
}

export default function DataTable<T>({ onAdd, actionConfig, noResults = false, isLoading = false, data, columns, minWidth = 300, rowIdKey }: DataTableProps<T>) {
	const handleAction = (row: T) => {
		if (!actionConfig || !(actionConfig.typeAction==="funcion") || !(actionConfig?.actionFn)) return;
		actionConfig.actionFn(row);
	}

	return (
		<div className="pb-4">
			<div  className="bg-table rounded-xl overflow-hidden border  dark:border-white/5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
				<div className="overflow-x-auto overflow-y-hidden custom-scroll">
					{(onAdd) && (
						<div className="p-4">
							<BotonVariante variant="agregar" onClick={() => onAdd()} />
						</div>
					)}
					<table className="w-full border-collapse" style={{ minWidth }}>
						<thead className="text-left bg-table-header border dark:border-white/5">
							<tr>
								{columns.map((column) => {
									if (typeof column.header === "string") {
										return <th key={column.id} className="py-4 px-4 text-foreground-title">{column.header}</th>
									}
									return <th key={column.id}>{column.header}</th>
								})}
								{actionConfig && actionConfig.typeAction==="fila" && (
									<tr>
										<th className="py-4 px-4 text-foreground-title">Acciones</th>
									</tr>
								)}
							</tr>
						</thead>
						<tbody>
							{isLoading
								? Array.from({ length: 5 }).map((_, rowIndex) => (
									<tr key={`skeleton-row-${rowIndex}`} className="animate-pulse">
										{columns.map((column) => (
											<td key={column.id} className="p-4">
												<div className="h-2 w-full bg-foreground-title" />
											</td>
										))}
									</tr>
								))
								: (data.length===0) ? (
									<tr>
										<td colSpan={columns.length} className="p-4">
											<div className="flex w-full items-center justify-center gap-2">
												<span className={`${noResults ? "icon-[fluent--search-info-20-regular]" : "icon-[tabler--ghost-2]"} text-4xl`} />
												{noResults ? "No se encontraron resultados para su búsqueda" : "No hay nada aquí"}
											</div>
										</td>
									</tr>
								) : data.map((row, index) => (
									<tr
										key={String(row[rowIdKey])}
										className="border dark:border-white/5 hover:bg-table-hover opacity-0 animate-fade-in-up"
										style={{ 
											animationDelay: `${index * 0.05}s`
										}}
										onClick={() => handleAction(row)}
									>
										{columns.map((column) => {
											const key = column?.accessorKey || (column.id as keyof T);
											const value = key ? row[key] : null;

											return (
												<td
													key={column.id}
													className={column.cell ? "" : "p-4"}
												>
													{column.cell ? column.cell(row) : String(value)}
												</td>
											);
										})}
										{
											actionConfig &&
											actionConfig.typeAction==="fila" &&
											actionConfig?.actionColumns &&
											<td>{actionConfig.actionColumns(row)}</td>
										}
									</tr>
								))}
						</tbody>

					</table>
				</div>
			</div>
		</div>
	)
}