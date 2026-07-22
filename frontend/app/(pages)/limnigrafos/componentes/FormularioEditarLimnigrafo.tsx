import CampoFecha from "@componentes/formularios/CampoFecha";
import CampoSelector from "@componentes/formularios/CampoSelector";
import Formulario from "@componentes/formularios/Formulario";
import SeccionInfo from "@componentes/secciones/SeccionInfo";
import Separador from "@componentes/Separador";
import { opcionesMemoria, opcionesTipoComunicacion } from "../constantes";
import CampoMultiCheckbox from "@componentes/formularios/CampoMultipleCheckBox";
import BotonVariante from "@componentes/botones/BotonVariante";
import CampoInput from "@componentes/formularios/CampoInput";
import { TFormEditarLimnigrafo } from "../types";
import Label from "@componentes/formularios/Label";

type FormularioEditarLimnigrafoProps = {
	valoresIniciales: TFormEditarLimnigrafo;
	onSubmit: (data: TFormEditarLimnigrafo) => void;
	onDirty: (dirty: boolean) => void;
	handleCancelar: () => void;
	isLoading?: boolean;
};

export function CamposFormularioEditarLimnigrafo({
	handleCancelar,
	isLoading = false,
	mostrarAcciones = true,
	variante = "panel",
}: {
	handleCancelar?: () => void;
	isLoading?: boolean;
	mostrarAcciones?: boolean;
	variante?: "panel" | "modal";
}) {
	const esModal = variante === "modal";
	const wrapperClassName = esModal
		? "flex w-full flex-col gap-5"
		: "flex w-full max-w-screen-2xl flex-col gap-6 rounded-[32px] bg-background-muted p-6 shadow-[0px_4px_18px_rgba(0,0,0,0.18)]";
	const cardClassName = esModal
		? "flex flex-col gap-4 rounded-[20px] border border-border/80 bg-background-muted/50 px-5 py-5 shadow-[0px_8px_20px_rgba(0,0,0,0.10)]"
		: "flex flex-col gap-4";
	const sectionTitleClassName = esModal
		? "text-[1.25rem] font-semibold text-foreground"
		: "";
	const sectionSubtitleClassName = esModal
		? "text-xs leading-5 text-muted-foreground"
		: "hidden";
	const dividerClassName = esModal ? "bg-border/70" : "";
	const titleBlockClassName = esModal ? "flex flex-col gap-1" : "";
	const formGridClassName = esModal ? "grid grid-cols-1 gap-4 md:grid-cols-2" : "";

	return (
		<div className={wrapperClassName}>
			{esModal ? (
				<div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
					<p className="text-xs leading-5 text-muted-foreground">
						Editá datos generales, comunicación y umbrales. El estado se calcula automáticamente según la última conexión.
					</p>
				</div>
			) : null}

			<div className="flex flex-col gap-4 xl:flex-row">
				<div className={`${cardClassName} flex-1`}>
					<div className={titleBlockClassName}>
						<h2 className={sectionTitleClassName || undefined}>Datos del limnígrafo</h2>
						<p className={sectionSubtitleClassName}>
							Identificación, descripción y tiempos base de mantenimiento.
						</p>
					</div>
					<Separador direction="horizontal" className={dividerClassName} />
					<div className={formGridClassName}>
						<CampoInput
							name="codigo"
							label="Identificador:"
							placeholder="Ingrese un identificador para el limnígrafo"
							required
						/>
						<CampoInput
							name="descripcion"
							label="Descripción:"
							placeholder="Información adicional para el limnígrafo"
						/>
					</div>
					<div className={esModal ? "pt-1" : "pt-3"}>
						<h3 className={esModal ? "text-base font-semibold text-foreground" : "text-xl font-semibold text-foreground"}>Mantenimiento</h3>
					</div>
					<Separador direction="horizontal" className={dividerClassName} />
					<CampoFecha
						name="ultimo_mantenimiento"
						label="Último mantenimiento:"
					/>
					<Label text="Tiempo máximo antes de Advertencias:" />
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<CampoInput
							name="tiempo_advertencia_horas"
							placeholder="Horas"
							label="Horas:"
							type="number"
						/>
						<CampoInput
							name="tiempo_advertencia_minutos"
							placeholder="Minutos"
							label="Minutos:"
							type="number"
						/>
						<CampoInput
							name="tiempo_advertencia_segundos"
							placeholder="Segundos"
							label="Segundos:"
							type="number"
						/>
					</div>
					<Label text="Tiempo máximo antes de Fuera de rango:" />
					<p className={esModal ? "text-xs leading-5 text-muted-foreground" : "text-sm leading-6 text-muted-foreground"}>
						Si no llegan mediciones dentro de este plazo, el sistema marcará el
						limnígrafo como fuera de rango automáticamente.
					</p>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<CampoInput
							name="tiempo_peligro_horas"
							placeholder="Horas"
							label="Horas:"
							type="number"
						/>
						<CampoInput
							name="tiempo_peligro_minutos"
							placeholder="Minutos"
							label="Minutos:"
							type="number"
						/>
						<CampoInput
							name="tiempo_peligro_segundos"
							placeholder="Segundos"
							label="Segundos:"
							type="number"
						/>
					</div>
				</div>

				{esModal ? null : <Separador direction="vertical" />}

				<div className={`${cardClassName} flex-1`}>
					<div className={titleBlockClassName}>
						<h2 className={sectionTitleClassName || undefined}>Especificaciones técnicas</h2>
						<p className={sectionSubtitleClassName}>
							Parámetros de operación, cobertura y límites configurables.
						</p>
					</div>
					<Separador direction="horizontal" className={dividerClassName} />
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_112px] sm:items-end">
						<div className="grow">
							<CampoInput
								type="integer"
								name="memoria_value"
								label="Memoria del dispositivo:"
							/>
						</div>
						<div className="w-20">
							<CampoSelector
								name="memoria_unit"
								label="Unidad:"
								options={opcionesMemoria}
							/>
						</div>
					</div>
					<div className={formGridClassName}>
						<CampoInput
							type="number"
							name="bateria_min"
							label="Cantidad mínima de batería:"
						/>
						<CampoInput
							type="integer"
							name="radio_cobertura_metros"
							label="Radio de cobertura estimada (m):"
							placeholder="Ej. 500"
						/>
						<CampoInput
							type="number"
							name="altura_maxima_agua"
							label="Máxima altura del nivel del agua:"
						/>
						<CampoInput
							type="number"
							name="altura_minima_agua"
							label="Mínima altura del nivel del agua:"
						/>
						<CampoInput
							type="number"
							name="temperatura_minima"
							label="Temperatura mínima:"
						/>
						<CampoInput
							type="number"
							name="temperatura_maxima"
							label="Temperatura máxima:"
						/>
						<CampoInput
							type="number"
							name="presion_minima"
							label="Presión mínima:"
						/>
						<CampoInput
							type="number"
							name="presion_maxima"
							label="Presión máxima:"
						/>
					</div>
					<CampoMultiCheckbox
						name="tipo_comunicacion"
						options={opcionesTipoComunicacion}
						className="md:grid-cols-2"
						label="Tipo de comunicación"
					/>
				</div>
			</div>

			{mostrarAcciones ? (
				<>
					<br />
					<hr />
					<br />
					<div className="flex w-full justify-between">
						<BotonVariante
							variant="cancelar"
							onClick={handleCancelar}
						/>
						<BotonVariante
							variant="guardar"
							type="submit"
							loading={isLoading}
						/>
					</div>
				</>
			) : null}
		</div>
	);
}

export default function FormularioEditarLimnigrafo({
	valoresIniciales,
	onSubmit,
	onDirty,
	handleCancelar,
	isLoading = false,
}: FormularioEditarLimnigrafoProps) {
	return (
		<Formulario
			valoresIniciales={valoresIniciales}
			onSubmit={onSubmit}
			onDirty={onDirty}
		>
			<SeccionInfo>
				<CamposFormularioEditarLimnigrafo
					handleCancelar={handleCancelar}
					isLoading={isLoading}
				/>
			</SeccionInfo>
		</Formulario>
	);
}
