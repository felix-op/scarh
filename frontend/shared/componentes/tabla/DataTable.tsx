"use client";

import BotonVariante from "@componentes/botones/BotonVariante";
import { ActionConfig, ColumnConfig, DataTableStyles, PaginationConfig } from "./types";
import Selector from "@componentes/campos/Selector";
import BotonAnterior from "@componentes/botones/BotonAnterior";
import BotonSiguiente from "@componentes/botones/BotonSiguiente";
import { ReactNode } from "react";
import MenuAcciones from "@componentes/menu/MenuAcciones";
import DataTableRow from "./DataTableRow";

type DataTableProps<T> = {
	noResults?: boolean;
	isLoading?: boolean;
	data: T[];
	columns: ColumnConfig<T>[];
	minWidth?: number | string;
	rowIdKey: keyof T;
	onAdd?: () => void;
	onFilter?: () => void;
	actionConfig?: ActionConfig<T>;
	paginationConfig?: PaginationConfig;
	showTopBar?: boolean;
	showBottomPagination?: boolean;
	enableRowAnimation?: boolean;
	loadingRows?: number;
	emptyStateContent?: ReactNode;
	styles?: DataTableStyles<T>;
}

export default function DataTable<T>({
	onAdd,
	onFilter,
	actionConfig,
	paginationConfig,
	noResults = false,
	isLoading = false,
	data,
	columns,
	minWidth = 300,
	rowIdKey,
	showTopBar = true,
	showBottomPagination = false,
	enableRowAnimation = true,
	loadingRows = 5,
	emptyStateContent,
	styles,
}: DataTableProps<T>) {
	const handleAction = (row: T) => {
		if (!actionConfig || !(actionConfig.typeAction === "funcion") || !(actionConfig?.actionFn)) return;
		actionConfig.actionFn(row);
	}

	const renderPaginationControls = (position: "top" | "bottom") => {
		if (!paginationConfig) return null;

		return (
			<div className="flex gap-2 items-center self-end sm:self-auto">
				<div>
					{paginationConfig.page} <span className="text-foreground">
						de {paginationConfig.maxPage}
					</span>
				</div>
				<BotonAnterior
					onClick={() => paginationConfig.prevPage(paginationConfig.page)}
					disabled={paginationConfig.page === 1}
				/>
				<BotonSiguiente
					onClick={() => paginationConfig.nextPage(paginationConfig.page)}
					disabled={paginationConfig.page === paginationConfig.maxPage}
				/>
				<Selector
					name={`data-table-page-length-${position}`}
					value={String(paginationConfig.lengthPages)}
					onChange={(event) => paginationConfig.changeLength(Number(event.target.value))}
					style={{ width: "80px" }}
				>
					{paginationConfig.lengthOptions.map((option) => (
						<option
							key={`data-table-page-length-${position}-option-${option}`}
							value={String(option)}
						>
							{option}
						</option>
					))}
				</Selector>
			</div>
		);
	};

	return (
		<div className={`pb-4 ${styles?.rootClassName ?? ""}`.trim()}>
			<div className={`bg-table rounded-xl overflow-hidden border dark:border-white/5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ${styles?.cardClassName ?? ""}`.trim()}>
				<div className={`overflow-x-auto overflow-y-hidden custom-scroll ${styles?.scrollerClassName ?? ""}`.trim()}>
					{showTopBar && (
						<div
							className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 ${styles?.topBarClassName ?? ""}`.trim()}
						>
							<div className="flex gap-2">
								{(onAdd) && (<BotonVariante variant="agregar" onClick={onAdd} />)}
								{(onFilter) && (<BotonVariante variant="filtro" onClick={onFilter} />)}
							</div>
							{renderPaginationControls("top")}
						</div>
					)}
					<table className={`w-full border-collapse ${styles?.tableClassName ?? ""}`.trim()} style={{ minWidth }}>
						<thead className={`text-left bg-table-header border dark:border-white/5 ${styles?.theadClassName ?? ""}`.trim()}>
							<tr className={styles?.headerRowClassName}>
								{columns.map((column) => {
									if (typeof column.header === "string") {
										return <th key={column.id} className={`py-4 px-4 text-foreground-title ${styles?.headerCellClassName ?? ""}`.trim()}>{column.header}</th>
									}
									return <th key={column.id}>{column.header}</th>
								})}
								{actionConfig && (
									<th className={`py-4 px-4 text-foreground-title ${styles?.headerCellClassName ?? ""} ${actionConfig.typeAction === "menu" ? "text-center" : ""}`.trim()}>Acciones</th>
								)}
							</tr>
						</thead>
						<tbody className={styles?.tbodyClassName}>
							{isLoading
								? Array.from({ length: loadingRows }).map((_, rowIndex) => (
									<tr key={`skeleton-row-${rowIndex}`} className="animate-pulse">
										{columns.map((column) => (
											<td key={column.id} className={`p-4 ${styles?.cellClassName ?? ""}`.trim()}>
												<div className="h-2 w-full bg-foreground-title" />
											</td>
										))}
									</tr>
								))
								: (data.length === 0) ? (
									<tr>
										<td colSpan={columns.length + (actionConfig?.typeAction === "fila" ? 1 : 0)} className={`p-4 ${styles?.emptyCellClassName ?? ""}`.trim()}>
											<div className="flex w-full items-center justify-center gap-2">
												{emptyStateContent ?? (
													<>
														<span className={`${noResults ? "icon-[fluent--search-info-20-regular]" : "icon-[tabler--ghost-2]"} text-4xl`} />
														{noResults ? "No se encontraron resultados para su búsqueda" : "No hay nada aquí"}
													</>
												)}
											</div>
										</td>
									</tr>
								) : data.map((row, index) => (
									<DataTableRow
										key={String(row[rowIdKey])}
										row={row}
										index={index}
										handleAction={handleAction}
										hover={!styles?.hiddenRowHover}
										border
										animation={enableRowAnimation}
										className={styles?.rowClassName}
									>
										{columns.map((column) => {
											const key = column?.accessorKey || (column.id as keyof T);
											const value = key ? row[key] : null;

											return (
												<td
													key={column.id}
													className={column.cell ? styles?.cellClassName : `p-4 ${styles?.cellClassName ?? ""}`.trim()}
												>
													{column.cell ? column.cell(row) : String(value)}
												</td>
											);
										})}
										{actionConfig && (
											<td>
												{(actionConfig.typeAction === "menu") ? (
													<div className="flex w-full justify-center">
														<MenuAcciones
															opciones={actionConfig?.options?.map(
																(option, index) => ({
																	...option,
																	value: `ActionMenu-${String(row[rowIdKey])}-${index}`,
																	onClick: () => option.onClick(row)
																})
															) || []}
														/>
													</div>
												) : (actionConfig.typeAction === "fila" && actionConfig?.actionColumns) && (
													actionConfig.actionColumns(row)
												)}
											</td>
										)}
									</DataTableRow>
								))}
						</tbody>

					</table>
				</div>
				{showBottomPagination && paginationConfig && (
					<div
						className={`flex justify-end p-4 border-t dark:border-white/5 ${styles?.topBarClassName ?? ""}`.trim()}
					>
						{renderPaginationControls("bottom")}
					</div>
				)}
			</div>
		</div>
	)
}
