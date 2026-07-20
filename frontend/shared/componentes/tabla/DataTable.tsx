"use client";

import BotonVariante from "@componentes/botones/BotonVariante";
import { ActionConfig, ColumnConfig, DataTableStyles, PaginationConfig, SelectionConfig } from "./types";
import Selector from "@componentes/campos/Selector";
import BotonAnterior from "@componentes/botones/BotonAnterior";
import BotonSiguiente from "@componentes/botones/BotonSiguiente";
import { ReactNode } from "react";
import MenuAcciones from "@componentes/menu/MenuAcciones";
import DataTableRow from "./DataTableRow";
import SeccionCard from "@componentes/secciones/SeccionCard";

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
	topBar?: ReactNode,
	selectionConfig?: SelectionConfig<T>;
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
	topBar = null,
	showBottomPagination = false,
	enableRowAnimation = true,
	loadingRows = 5,
	emptyStateContent,
	styles,
	selectionConfig,
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

	const xScrollClass = styles?.scrollX === "hidden" ? "overflow-x-hidden" : "overflow-x-auto";
	const yScrollClass = styles?.scrollY === "auto" ? "overflow-y-auto" : "overflow-y-hidden";
	const allRowsSelected = data.length > 0 && data.every((row) => {
		if (selectionConfig?.isRowSelected) {
			return selectionConfig.isRowSelected(row);
		}
		return selectionConfig?.selectedRows.includes(row[rowIdKey] as string | number);
	});

	return (
		<div className={`pb-4 ${styles?.rootClassName ?? ""}`.trim()}>
			<SeccionCard className={styles?.cardClassName ?? ""}>
				{topBar || (showTopBar && (
					<div
						className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 ${styles?.topBarClassName ?? ""}`.trim()}
					>
						<div className="flex gap-2">
							{(onAdd) && (<BotonVariante variant="agregar" onClick={onAdd} />)}
							{(onFilter) && (<BotonVariante variant="filtro" onClick={onFilter} />)}
						</div>
						{renderPaginationControls("top")}
					</div>
				))}
				<div className={`${xScrollClass} ${yScrollClass} custom-scroll ${styles?.scrollerClassName ?? ""}`.trim()}>
					<table className={`w-full border-collapse ${styles?.tableClassName ?? ""}`.trim()} style={{ minWidth }}>
						<thead className={`sticky top-0 z-10 text-left bg-table-header border dark:border-white/5 ${styles?.theadClassName ?? ""}`.trim()}>
							<tr className={styles?.headerRowClassName}>
								{selectionConfig && (
									<th className={`py-4 px-4 text-foreground-title w-12 ${styles?.headerCellClassName ?? ""}`.trim()}>
										<div className="flex items-center justify-center">
											<input
												type="checkbox"
												checked={allRowsSelected}
												aria-label={typeof selectionConfig.headerLabel === "string" ? selectionConfig.headerLabel : "Seleccionar todas las filas"}
												onChange={() => selectionConfig.onToggleAll(data)}
												className="h-4 w-4 cursor-pointer accent-principal"
											/>
										</div>
									</th>
								)}
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
										{selectionConfig && (
											<td className={`p-4 ${styles?.cellClassName ?? ""}`.trim()}>
												<div className="h-2 w-4 bg-foreground-title" />
											</td>
										)}
										{columns.map((column) => (
											<td key={column.id} className={`p-4 ${styles?.cellClassName ?? ""}`.trim()}>
												<div className="h-2 w-full bg-foreground-title" />
											</td>
										))}
									</tr>
								))
								: (data.length === 0) ? (
									<tr>
										<td colSpan={columns.length + (actionConfig ? 1 : 0) + (selectionConfig ? 1 : 0)} className={`p-4 ${styles?.emptyCellClassName ?? ""}`.trim()}>
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
										{selectionConfig && (
											<td className={`p-4 ${styles?.cellClassName ?? ""}`.trim()}>
												<div className="flex items-center justify-center">
													<input
														type="checkbox"
														checked={selectionConfig.isRowSelected
															? selectionConfig.isRowSelected(row)
															: selectionConfig.selectedRows.includes(row[rowIdKey] as string | number)}
														aria-label={selectionConfig.ariaLabel?.(row) ?? "Seleccionar fila"}
														onChange={() => selectionConfig.onToggleRow(row)}
														className="h-4 w-4 cursor-pointer accent-principal"
													/>
												</div>
											</td>
										)}
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
			</SeccionCard>
		</div>
	)
}
