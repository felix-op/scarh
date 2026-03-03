"use client";

import { FormEvent } from "react";
import TextField from "@componentes/campos/TextField";
import Selector from "@componentes/campos/Selector";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@componentes/components/ui/dialog";

export type ManualFormState = {
	limnigrafo: string;
	fecha_hora: string;
	altura_agua: string;
	presion: string;
	temperatura: string;
	nivel_de_bateria: string;
};

type LimnigrafoOption = {
	id: number;
	codigo: string;
};

type ModalCargaManualMedicionProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	manualForm: ManualFormState;
	limnigrafos: LimnigrafoOption[];
	isSubmitting: boolean;
	onManualFormChange: (field: keyof ManualFormState, value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ModalCargaManualMedicion({
	open,
	onOpenChange,
	manualForm,
	limnigrafos,
	isSubmitting,
	onManualFormChange,
	onSubmit,
}: ModalCargaManualMedicionProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden border border-ventana-secondary bg-ventana p-0">
				<form onSubmit={onSubmit} className="flex h-full flex-col">
					<DialogHeader className="border-b border-ventana-secondary px-6 py-5 text-left">
						<DialogTitle className="text-2xl font-bold text-ventana-foreground">Carga manual</DialogTitle>
						<DialogDescription className="text-sm text-foreground-secondary">
							Registro manual de mediciones con validación de campos.
						</DialogDescription>
					</DialogHeader>

					<div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
						<label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
							Limnígrafo
							<Selector
								value={manualForm.limnigrafo}
								onChange={(event) => onManualFormChange("limnigrafo", event.target.value)}
							>
								<option value="">Seleccionar</option>
								{limnigrafos.map((limnigrafo) => (
									<option key={limnigrafo.id} value={String(limnigrafo.id)}>
										{limnigrafo.codigo}
									</option>
								))}
							</Selector>
						</label>

						<label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
							Fecha y hora
							<TextField
								type="datetime-local"
								value={manualForm.fecha_hora}
								onChange={(event) => onManualFormChange("fecha_hora", event.target.value)}
							/>
						</label>

						<label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
							Altura del agua (m)
							<TextField
								type="text"
								value={manualForm.altura_agua}
								onChange={(event) => onManualFormChange("altura_agua", event.target.value)}
								placeholder="Obligatorio"
							/>
						</label>

						<label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
							Presión (hPa)
							<TextField
								type="text"
								value={manualForm.presion}
								onChange={(event) => onManualFormChange("presion", event.target.value)}
							/>
						</label>

						<label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
							Temperatura (°C)
							<TextField
								type="text"
								value={manualForm.temperatura}
								onChange={(event) => onManualFormChange("temperatura", event.target.value)}
							/>
						</label>

						<label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
							Batería (%)
							<TextField
								type="text"
								value={manualForm.nivel_de_bateria}
								onChange={(event) => onManualFormChange("nivel_de_bateria", event.target.value)}
							/>
						</label>
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
							type="submit"
							disabled={isSubmitting}
							className="rounded-lg bg-principal px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
						>
							{isSubmitting ? "Guardando..." : "Guardar medición"}
						</button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
