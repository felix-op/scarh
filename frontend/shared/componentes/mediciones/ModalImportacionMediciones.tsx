"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { ImportPreviewRow } from "@servicios/api/django.api";
import Selector from "@componentes/campos/Selector";
import BotonVariante from "@componentes/botones/BotonVariante";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerTitle,
} from "@componentes/components/ui/drawer";

type LimnigrafoOption = {
	id: number;
	codigo: string;
};

type ModalImportacionMedicionesProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	limnigrafos: LimnigrafoOption[];
	importFallbackLimnigrafo: string;
	onImportFallbackChange: (value: string) => void;
	importFileName: string;
	importRows: ImportPreviewRow[];
	isImportValidated: boolean;
	isValidating: boolean;
	isImporting: boolean;
	actionError?: string | null;
	actionMessage?: string | null;
	onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onValidateSubmit: () => void;
	onImportSubmit: () => void;
};

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}
	return new Intl.DateTimeFormat("es-AR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

function formatNumber(value: number | null, digits = 2): string {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return "-";
	}
	return value.toFixed(digits);
}

function getStatusBadgeClasses(status: ImportPreviewRow["status"]): string {
	if (status === "valid") {
		return "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534] dark:border-[#14532D] dark:bg-[#0F2E1A] dark:text-[#86EFAC]";
	}
	if (status === "warning") {
		return "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] dark:border-[#92400E] dark:bg-[#2C1B04] dark:text-[#FCD34D]";
	}
	return "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]";
}

export default function ModalImportacionMediciones({
	open,
	onOpenChange,
	limnigrafos,
	importFallbackLimnigrafo,
	onImportFallbackChange,
	importFileName,
	importRows,
	isImportValidated,
	isValidating,
	isImporting,
	actionError = null,
	actionMessage = null,
	onFileChange,
	onValidateSubmit,
	onImportSubmit,
}: ModalImportacionMedicionesProps) {
	const [expandedRows, setExpandedRows] = useState<number[]>([]);
	const limnigrafoCodeById = useMemo(() => {
		const map = new Map<number, string>();
		limnigrafos.forEach((limnigrafo) => {
			map.set(limnigrafo.id, limnigrafo.codigo);
		});
		return map;
	}, [limnigrafos]);
	const rowsWithLimnigrafo = useMemo(
		() => importRows.filter((row) => typeof row.limnigrafoId === "number" && Number.isInteger(row.limnigrafoId)).length,
		[importRows],
	);
	const rowsWithoutLimnigrafo = importRows.length - rowsWithLimnigrafo;
	const isFallbackSelected = importFallbackLimnigrafo.trim() !== "";
	const validRows = useMemo(() => importRows.filter((row) => row.status === "valid").length, [importRows]);
	const invalidRows = importRows.length - validRows;
	const primaryLoading = isValidating || isImporting;
	const hasBlockingRows = importRows.some((row) => row.status !== "valid");
	const primaryDisabled = primaryLoading || importRows.length === 0 || hasBlockingRows;
	const primaryLabel = isImportValidated ? "Confirmar importación" : "Validar lote";
	const hasErroredRows = invalidRows > 0;

	const handleClose = () => {
		if (isImporting || isValidating) {
			return;
		}
		onOpenChange(false);
	};

	const toggleExpandedRow = (rowNumber: number) => {
		setExpandedRows((current) => (
			current.includes(rowNumber)
				? current.filter((value) => value !== rowNumber)
				: [...current, rowNumber]
		));
	};

	return (
		<Drawer open={open} onClose={handleClose} direction="right" dismissible={!isImporting}>
			<DrawerContent className="bg-transparent border-none py-4 pr-2 min-w-full md:min-w-[54rem] xl:min-w-[80rem]">
				<div className="flex h-full w-full flex-col rounded-lg border border-ventana-secondary bg-ventana dark:border">
					<DrawerTitle className="flex items-start justify-between gap-4 p-5 shrink-0">
						<div className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-ventana-foreground">Importación de datos</span>
							<DrawerDescription className="text-sm text-foreground/80">
								Primero validá el lote completo y después confirmá la importación transaccional.
							</DrawerDescription>
						</div>
						<button
							type="button"
							aria-label="Cerrar"
							onClick={handleClose}
							disabled={isImporting || isValidating}
							className="flex rounded-full bg-ventana-secondary p-2 text-foreground transition hover:text-error disabled:cursor-not-allowed disabled:opacity-60"
						>
							<span className="icon-[material-symbols--close] text-2xl" />
						</button>
					</DrawerTitle>

					<hr className="h-[2px] bg-ventana-secondary" />

					<div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
						{actionError ? (
							<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
								{actionError}
							</p>
						) : null}
						{actionMessage ? (
							<p className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[14px] text-[#166534] dark:border-[#14532D] dark:bg-[#0F2E1A] dark:text-[#86EFAC]">
								{actionMessage}
							</p>
						) : null}
						{hasErroredRows ? (
							<div className="rounded-xl border border-[#FCD34D] bg-[#FFFBEB] px-4 py-4 text-[#92400E] dark:border-[#B45309] dark:bg-[#2C1B04] dark:text-[#FDE68A]">
								<p className="text-sm font-semibold">
									El archivo tiene errores de mediciones y no se puede importar hasta corregirlos.
								</p>
								<p className="mt-1 text-sm leading-6">
									Revisá las filas marcadas. Puede tratarse de mediciones duplicadas por misma fecha y hora en el mismo limnígrafo,
									duplicados dentro del archivo, duplicados ya cargados en la base, limnígrafos inexistentes o campos obligatorios faltantes.
								</p>
							</div>
						) : null}
						<label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
							Limnígrafo por defecto (opcional)
							<Selector
								value={importFallbackLimnigrafo}
								onChange={(event) => onImportFallbackChange(event.target.value)}
							>
								<option value="">Sin selección</option>
								{limnigrafos.map((limnigrafo) => (
									<option key={limnigrafo.id} value={String(limnigrafo.id)}>
										{limnigrafo.codigo}
									</option>
								))}
							</Selector>
							<p className="text-xs font-normal text-foreground/70">
								Este selector solo se usa en filas donde el archivo no trae limnígrafo.
							</p>
						</label>

						<label className="inline-flex w-fit cursor-pointer items-center rounded-lg border border-border bg-campo-input px-4 py-2 text-sm font-semibold text-foreground transition hover:brightness-95">
							Seleccionar archivo
							<input
								type="file"
								accept=".json,.csv"
								onChange={onFileChange}
								className="hidden"
							/>
						</label>

						{importFileName ? (
							<p className="text-sm text-foreground/80">
								Archivo: <span className="font-semibold text-foreground">{importFileName}</span>
							</p>
						) : null}
						{importRows.length > 0 ? (
							<div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 dark:border-[#475569] dark:bg-[#0F172A]">
								<p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#475569] dark:text-[#94A3B8]">
									Resumen del archivo
								</p>
								<div className="mt-2 grid gap-2 text-[13px] text-foreground sm:grid-cols-2">
									<p>
										Con limnígrafo en archivo: <span className="font-semibold">{rowsWithLimnigrafo}</span>
									</p>
									<p>
										Sin limnígrafo (usan por defecto): <span className="font-semibold">{rowsWithoutLimnigrafo}</span>
									</p>
									<p>
										Filas válidas: <span className="font-semibold">{validRows}</span>
									</p>
									<p>
										Filas con observaciones: <span className="font-semibold">{invalidRows}</span>
									</p>
								</div>
								{rowsWithoutLimnigrafo > 0 ? (
									isFallbackSelected ? (
										<p className="mt-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-xs text-[#166534] dark:border-[#14532D] dark:bg-[#0F2E1A] dark:text-[#86EFAC]">
											Las filas sin limnígrafo se guardarán usando el limnígrafo por defecto seleccionado.
										</p>
									) : (
										<p className="mt-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
											Hay filas sin limnígrafo y está en <span className="font-semibold">Sin selección</span>:
											esas filas <span className="font-semibold">no se guardarán</span>.
										</p>
									)
								) : null}
							</div>
						) : null}

						<div className="max-h-[460px] overflow-auto rounded-lg border border-border">
							<table className="min-w-full text-left text-[13px] text-foreground">
								<thead className="bg-campo-input text-[12px] uppercase tracking-wide text-foreground/80">
									<tr>
										<th className="px-3 py-2">#</th>
										<th className="px-3 py-2">Estado</th>
										<th className="px-3 py-2">Limnígrafo</th>
										<th className="px-3 py-2">Fecha</th>
										<th className="px-3 py-2">Altura</th>
										<th className="px-3 py-2">Presión</th>
										<th className="px-3 py-2">Temperatura</th>
										<th className="px-3 py-2">Observaciones</th>
									</tr>
								</thead>
								<tbody>
									{importRows.length === 0 ? (
										<tr>
											<td colSpan={8} className="px-3 py-4 text-center text-foreground/80">Sin filas cargadas.</td>
										</tr>
									) : (
										importRows.slice(0, 25).map((row) => {
											const rowLimnigrafoId = row.limnigrafoId;
											const isExpanded = expandedRows.includes(row.rowNumber);
											const hasIssues = row.issues.length > 0;
											return (
												<tr key={`import-row-${row.rowNumber}`} className="border-t border-border align-top">
													<td className="px-3 py-2">{row.rowNumber}</td>
													<td className="px-3 py-2">
														<span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${getStatusBadgeClasses(row.status)}`}>
															{row.status === "valid"
																? "Válida"
																: row.status === "warning"
																	? "Requiere revisión"
																	: row.status === "duplicate_file"
																		? "Duplicada en archivo"
																		: row.status === "duplicate_database"
																			? "Duplicada en base"
																			: "Con error"}
														</span>
													</td>
													<td className="px-3 py-2">
														{rowLimnigrafoId !== null
															? (limnigrafoCodeById.get(rowLimnigrafoId) ?? `ID ${rowLimnigrafoId}`)
															: "Por defecto"}
													</td>
													<td className="px-3 py-2">{row.fechaHora ? formatDate(row.fechaHora) : "-"}</td>
													<td className="px-3 py-2">{formatNumber(row.alturaAgua, 2)}</td>
													<td className="px-3 py-2">{formatNumber(row.presion, 2)}</td>
													<td className="px-3 py-2">{formatNumber(row.temperatura, 2)}</td>
													<td className="px-3 py-2 text-xs text-foreground/80">
														{hasIssues ? (
															<div className="flex flex-col gap-2">
																<button
																	type="button"
																	onClick={() => toggleExpandedRow(row.rowNumber)}
																	className="inline-flex w-fit items-center rounded-full border border-[#F59E0B] bg-[#FFF7ED] px-3 py-1 text-xs font-semibold text-[#B45309] transition hover:bg-[#FFEDD5] dark:border-[#B45309] dark:bg-[#2C1B04] dark:text-[#FCD34D] dark:hover:bg-[#3A2406]"
																>
																	{isExpanded ? "Ocultar error" : "Ver error"}
																</button>
																{isExpanded ? (
																	<div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-xs leading-5 text-[#92400E] dark:border-[#92400E] dark:bg-[#2C1B04] dark:text-[#FDE68A]">
																		{row.issues.map((issue, index) => (
																			<p key={`${row.rowNumber}-${issue.code}-${index}`}>
																				{issue.message}
																			</p>
																		))}
																	</div>
																) : null}
															</div>
														) : (
															"Sin observaciones"
														)}
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</div>

					<hr className="h-[2px] bg-ventana-secondary" />

					<DrawerFooter className="sm:flex-row justify-between p-5 shrink-0">
						<BotonVariante variant="cancelar" onClick={handleClose} disabled={isImporting || isValidating} />
						<BotonVariante
							variant="guardar"
							onClick={isImportValidated ? onImportSubmit : onValidateSubmit}
							loading={primaryLoading}
							disabled={primaryDisabled}
						>
							<span className={`text-2xl ${primaryLoading ? "icon-[line-md--loading-twotone-loop]" : isImportValidated ? "icon-[mdi--upload]" : "icon-[mdi--check-decagram-outline]"}`} />
							<span>
								{primaryLoading
									? (isImporting ? "Importando..." : "Validando...")
									: primaryLabel}
							</span>
						</BotonVariante>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
