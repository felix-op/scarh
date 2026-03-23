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
				<div className="flex flex-col lg:flex-row gap-4">
					<div className="flex flex-col gap-4 flex-1">
						<h2>Datos del limnígrafo</h2>
						<Separador direction="horizontal" />
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
						<h2>Mantenimiento</h2>
						<hr />
						<CampoFecha
							name="ultimo_mantenimiento"
							label="Último mantenimiento:"
						/>
						<Label text="Tiempo máximo antes de Advertencias:"  />
						<div className="flex gap-2">
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
						<Label text="Tiempo máximo antes de Peligro:"  />
						<div className="flex gap-2">
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
					<Separador direction="vertical" />
					<div className="flex flex-col gap-4 flex-1">
						<h2>Especificaciones técnicas</h2>
						<hr />
						<div className="flex items-start gap-2 w-full">
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
						<CampoInput
							type="number"
							name="bateria_min"
							label="Cantidad mínima de batería:"
						/>
						<CampoInput
							type="number"
							name="bateria_max"
							label="Cantidad máxima de batería:"
						/>
						<CampoMultiCheckbox
							name="tipo_comunicacion"
							options={opcionesTipoComunicacion}
							className="md:grid-cols-2"
							label="Tipo de comunicación"
						/>
					</div>
				</div>
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
			</SeccionInfo>
		</Formulario>
	);
}
