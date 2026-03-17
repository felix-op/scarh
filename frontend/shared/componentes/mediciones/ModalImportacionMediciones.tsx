"use client";

import { ChangeEvent } from "react";
import Selector from "@componentes/campos/Selector";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@componentes/components/ui/dialog";

type ParsedMedicionImportRow = {
	fecha_hora?: string;
	altura_agua: number;
	presion: number | null;
	temperatura: number | null;
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
	onFileChange,
	onImportSubmit,
}: ModalImportacionMedicionesProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] w-[95vw] max-w-4xl flex-col gap-0 overflow-hidden border border-ventana-secondary bg-ventana p-0">
				<div className="flex h-full flex-col">
					<DialogHeader className="border-b border-ventana-secondary px-6 py-5 text-left">
						<DialogTitle className="text-2xl font-bold text-ventana-foreground">Importación de datos</DialogTitle>
						<DialogDescription className="text-sm text-foreground/80">
							Cargá archivos JSON o CSV con columnas estándar de mediciones.
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
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
						</label>

						<label className="inline-flex w-fit cursor-pointer items-center rounded-lg border border-border bg-campo-input px-4 py-2 text-sm font-semibold text-foreground">
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

						<div className="max-h-[320px] overflow-auto rounded-lg border border-border">
							<table className="min-w-full text-left text-[13px] text-foreground">
								<thead className="bg-campo-input text-[12px] uppercase tracking-wide text-foreground/80">
									<tr>
										<th className="px-3 py-2">#</th>
										<th className="px-3 py-2">Fecha</th>
										<th className="px-3 py-2">Altura</th>
										<th className="px-3 py-2">Presión</th>
										<th className="px-3 py-2">Temperatura</th>
									</tr>
								</thead>
								<tbody>
									{importRows.length === 0 ? (
										<tr>
											<td colSpan={5} className="px-3 py-4 text-center text-foreground/80">Sin filas cargadas.</td>
										</tr>
									) : (
										importRows.slice(0, 20).map((row, index) => (
											<tr key={`import-row-${index}`} className="border-t border-border">
												<td className="px-3 py-2">{index + 1}</td>
												<td className="px-3 py-2">{row.fecha_hora ? formatDate(row.fecha_hora) : "-"}</td>
												<td className="px-3 py-2">{formatNumber(row.altura_agua, 2)}</td>
												<td className="px-3 py-2">{formatNumber(row.presion, 2)}</td>
												<td className="px-3 py-2">{formatNumber(row.temperatura, 2)}</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>

					<DialogFooter className="border-t border-ventana-secondary px-6 py-4 sm:justify-between">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="rounded-lg border border-border bg-campo-input px-4 py-2 text-sm font-semibold text-foreground"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={onImportSubmit}
							disabled={isImporting || importRows.length === 0}
							className="rounded-lg bg-principal px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
						>
							{isImporting ? "Importando..." : "Importar al backend"}
						</button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
