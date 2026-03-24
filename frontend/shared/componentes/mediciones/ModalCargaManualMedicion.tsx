"use client";

import { FormEvent } from "react";
import TextField from "@componentes/campos/TextField";
import Selector from "@componentes/campos/Selector";
import BotonVariante from "@componentes/botones/BotonVariante";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerTitle,
} from "@componentes/components/ui/drawer";

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
	actionError?: string | null;
	actionMessage?: string | null;
	onManualFormChange: (field: keyof ManualFormState, value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ModalCargaManualMedicion({
	open,
	onOpenChange,
	manualForm,
	limnigrafos,
	isSubmitting,
	actionError = null,
	actionMessage = null,
	onManualFormChange,
	onSubmit,
}: ModalCargaManualMedicionProps) {
	const fieldLabelClass = "flex w-full max-w-[24rem] flex-col gap-1 text-sm font-semibold text-foreground";
	const unitClass =
		"inline-flex min-w-[4.25rem] items-center justify-center rounded-lg border-2 border-border bg-campo-input px-3 py-3 text-sm font-semibold text-foreground/80";

	const handleClose = () => {
		if (isSubmitting) {
			return;
		}
		onOpenChange(false);
	};

	return (
		<Drawer open={open} onClose={handleClose} direction="right" dismissible={!isSubmitting}>
			<DrawerContent className="min-w-full border-none bg-transparent py-4 pr-2 md:min-w-100 xl:min-w-150">
				<div className="flex h-full w-full flex-col rounded-lg border border-ventana-secondary bg-ventana dark:border">
					<DrawerTitle className="shrink-0 p-5">
						<div className="flex items-start justify-between gap-4">
							<div className="flex flex-col gap-1">
								<span className="text-2xl font-bold text-ventana-foreground">Carga manual</span>
								<DrawerDescription className="text-sm text-foreground/80">
									Registro manual de mediciones con validación de campos.
								</DrawerDescription>
							</div>
							<button
								type="button"
								aria-label="Cerrar"
								onClick={handleClose}
								disabled={isSubmitting}
								className="flex rounded-full bg-ventana-secondary p-2 text-foreground transition hover:text-error disabled:cursor-not-allowed disabled:opacity-60"
							>
								<span className="icon-[material-symbols--close] text-2xl" />
							</button>
						</div>
					</DrawerTitle>

					<hr className="h-[2px] bg-ventana-secondary" />

					<form onSubmit={onSubmit} className="flex h-full min-h-0 flex-1 flex-col">
						<div className="grid min-h-0 flex-1 auto-rows-min content-start grid-cols-1 gap-y-2 overflow-y-auto px-5 py-4">
							{actionError ? (
								<p className="mb-1 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
									{actionError}
								</p>
							) : null}
							{actionMessage ? (
								<p className="mb-1 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[14px] text-[#166534] dark:border-[#14532D] dark:bg-[#0F2E1A] dark:text-[#86EFAC]">
									{actionMessage}
								</p>
							) : null}
							<label className={fieldLabelClass}>
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

							<label className={fieldLabelClass}>
								Fecha y hora
								<TextField
									type="datetime-local"
									value={manualForm.fecha_hora}
									onChange={(event) => onManualFormChange("fecha_hora", event.target.value)}
								/>
							</label>

							<label className={fieldLabelClass}>
								Altura del agua
								<div className="flex items-center gap-2">
									<div className="min-w-0 flex-1">
										<TextField
											type="text"
											value={manualForm.altura_agua}
											onChange={(event) => onManualFormChange("altura_agua", event.target.value)}
											placeholder="Obligatorio"
										/>
									</div>
									<span className={unitClass}>m</span>
								</div>
							</label>

							<label className={fieldLabelClass}>
								Presión
								<div className="flex items-center gap-2">
									<div className="min-w-0 flex-1">
										<TextField
											type="text"
											value={manualForm.presion}
											onChange={(event) => onManualFormChange("presion", event.target.value)}
										/>
									</div>
									<span className={unitClass}>hPa</span>
								</div>
							</label>

							<label className={fieldLabelClass}>
								Temperatura
								<div className="flex items-center gap-2">
									<div className="min-w-0 flex-1">
										<TextField
											type="text"
											value={manualForm.temperatura}
											onChange={(event) => onManualFormChange("temperatura", event.target.value)}
										/>
									</div>
									<span className={unitClass}>°C</span>
								</div>
							</label>

							<label className={fieldLabelClass}>
								Batería
								<div className="flex items-center gap-2">
									<div className="min-w-0 flex-1">
										<TextField
											type="text"
											value={manualForm.nivel_de_bateria}
											onChange={(event) => onManualFormChange("nivel_de_bateria", event.target.value)}
										/>
									</div>
									<span className={unitClass}>%</span>
								</div>
							</label>
						</div>

						<hr className="h-[2px] bg-ventana-secondary" />

						<DrawerFooter className="shrink-0 justify-between p-4 sm:flex-row">
							<BotonVariante variant="cancelar" onClick={handleClose} disabled={isSubmitting} />
							<BotonVariante variant="guardar" type="submit" loading={isSubmitting} disabled={isSubmitting}>
								<span className={`text-2xl ${isSubmitting ? "icon-[line-md--loading-twotone-loop]" : "icon-[material-symbols--save]"}`} />
								<span>{isSubmitting ? "Guardando..." : "Guardar medición"}</span>
							</BotonVariante>
						</DrawerFooter>
					</form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
