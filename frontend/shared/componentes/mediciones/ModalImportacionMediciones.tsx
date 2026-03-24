"use client";

import { ChangeEvent, useMemo } from "react";
import Selector from "@componentes/campos/Selector";
import BotonVariante from "@componentes/botones/BotonVariante";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerTitle,
} from "@componentes/components/ui/drawer";

type ParsedMedicionImportRow = {
	fecha_hora?: string;
	altura_agua: number;
	presion: number | null;
	temperatura: number | null;
	nivel_de_bateria: number | null;
	limnigrafo?: number;
};

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
	importRows: ParsedMedicionImportRow[];
	isImporting: boolean;
	actionError?: string | null;
	actionMessage?: string | null;
	onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
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

export default function ModalImportacionMediciones({
	open,
	onOpenChange,
	limnigrafos,
	importFallbackLimnigrafo,
	onImportFallbackChange,
	importFileName,
	importRows,
	isImporting,
	actionError = null,
	actionMessage = null,
	onFileChange,
	onImportSubmit,
}: ModalImportacionMedicionesProps) {
	const limnigrafoCodeById = useMemo(() => {
		const map = new Map<number, string>();
		limnigrafos.forEach((limnigrafo) => {
			map.set(limnigrafo.id, limnigrafo.codigo);
		});
		return map;
	}, [limnigrafos]);
	const rowsWithLimnigrafo = useMemo(
		() => importRows.filter((row) => typeof row.limnigrafo === "number" && Number.isInteger(row.limnigrafo)).length,
		[importRows],
	);
	const rowsWithoutLimnigrafo = importRows.length - rowsWithLimnigrafo;
	const isFallbackSelected = importFallbackLimnigrafo.trim() !== "";

	const handleClose = () => {
		if (isImporting) {
			return;
		}
		onOpenChange(false);
	};

	return (
		<Drawer open={open} onClose={handleClose} direction="right" dismissible={!isImporting}>
			<DrawerContent className="bg-transparent border-none py-4 pr-2 min-w-full md:min-w-[54rem] xl:min-w-[80rem]">
				<div className="flex h-full w-full flex-col rounded-lg border border-ventana-secondary bg-ventana dark:border">
					<DrawerTitle className="flex items-start justify-between gap-4 p-5 shrink-0">
						<div className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-ventana-foreground">Importación de datos</span>
							<DrawerDescription className="text-sm text-foreground/80">
								Si el archivo incluye limnígrafo por fila (`limnigrafo` o `limnigrafo_id`), se respeta esa asignación.
							</DrawerDescription>
						</div>
						<button
							type="button"
							aria-label="Cerrar"
							onClick={handleClose}
							disabled={isImporting}
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
										<th className="px-3 py-2">Limnígrafo</th>
										<th className="px-3 py-2">Fecha</th>
										<th className="px-3 py-2">Altura</th>
										<th className="px-3 py-2">Presión</th>
										<th className="px-3 py-2">Temperatura</th>
									</tr>
								</thead>
								<tbody>
									{importRows.length === 0 ? (
										<tr>
											<td colSpan={6} className="px-3 py-4 text-center text-foreground/80">Sin filas cargadas.</td>
										</tr>
									) : (
										importRows.slice(0, 20).map((row, index) => {
											const rowLimnigrafoId =
												typeof row.limnigrafo === "number" && Number.isInteger(row.limnigrafo)
													? row.limnigrafo
													: null;
											return (
												<tr key={`import-row-${index}`} className="border-t border-border">
													<td className="px-3 py-2">{index + 1}</td>
													<td className="px-3 py-2">
														{rowLimnigrafoId !== null
															? (limnigrafoCodeById.get(rowLimnigrafoId) ?? `ID ${rowLimnigrafoId}`)
															: "Por defecto"}
													</td>
													<td className="px-3 py-2">{row.fecha_hora ? formatDate(row.fecha_hora) : "-"}</td>
													<td className="px-3 py-2">{formatNumber(row.altura_agua, 2)}</td>
													<td className="px-3 py-2">{formatNumber(row.presion, 2)}</td>
													<td className="px-3 py-2">{formatNumber(row.temperatura, 2)}</td>
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
						<BotonVariante variant="cancelar" onClick={handleClose} disabled={isImporting} />
						<BotonVariante
							variant="guardar"
							onClick={onImportSubmit}
							loading={isImporting}
							disabled={isImporting || importRows.length === 0}
						>
							<span className={`text-2xl ${isImporting ? "icon-[line-md--loading-twotone-loop]" : "icon-[mdi--upload]"}`} />
							<span>{isImporting ? "Importando..." : "Importar al backend"}</span>
						</BotonVariante>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
