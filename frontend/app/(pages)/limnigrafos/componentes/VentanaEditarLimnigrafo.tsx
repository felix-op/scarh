import CampoInput from "@componentes/formularios/CampoInput";
import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import VentanaFormulario from "@componentes/ventanas/VentanaFormulario";

type VentanaEditarLimnigrafoProps = {
	open: boolean,
	onClose: () => void,
	queriesToInvalidate: string[],
	handleMessage: (message: VentanaAceptarOptions) => void
}

export default function VentanaEditarLimnigrafo({
	open,
	onClose,
	queriesToInvalidate,
	handleMessage
}: VentanaEditarLimnigrafoProps) {

	const valoresIniciales = {};
	
	const onSubmit = () => {};
	
	return (
		<VentanaFormulario
			open={open}
			onClose={onClose}
			onSubmit={onSubmit}
			titulo="Editar Limnigrafo"
			valoresIniciales={valoresIniciales}
			classNameContenido="flex flex-col gap-4"
			//isLoading={isPending}
		>
			<CampoInput
				name="codigo"
				label="Identificador del limnigrafo"
				placeholder="Ingrese un nombre o código para identificar al limnigrafo"
				disabled={isPending}
				required
			/>
			<CampoInput
				name="memoria"
				label="Memoria del dispositivo"
				placeholder="Total de memoria del dispositivo"
				disabled={isPending}
			/>
			{/* <CampoSelector
				name="tipo_de_comunicacion"
				options={opciones}
				label="Tipo de comunicación"
				required
			/> */}
			{/* <CampoInput
				name="batería_min"
				label="Batería mínima (v)"
				placeholder="Batería mínima para notificar"
				disabled={isPending}
				required
			/>
			<CampoInput
				name="batería_max"
				label="Batería máxima (v)"
				placeholder="Batería máxima del limnigrafo"
				disabled={isPending}
				required
			/>
			
			<CampoInput
				name="tiempo_advertencia"
				label="Tiempo mínimo de advertencia"
				placeholder="Límite de tiempo en el debe responder"
				disabled={isPending}
				required
			/>
			<CampoInput
				name="tiempo_peligro"
				label="Tiempo mínimo de peligro"
				placeholder="Límite de tiempo en el que debe resp"
				disabled={isPending}
				required
			/> */}
			<CampoMultiCheckbox
				name="tipo_de_comunicacion"
				options={opcionesEstado}
				className="md:grid-cols-2"
				label="Tipo de comunicación"
			/>
		</VentanaFormulario>
	);
}