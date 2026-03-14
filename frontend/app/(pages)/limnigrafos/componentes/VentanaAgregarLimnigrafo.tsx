import CampoInput from "@componentes/formularios/CampoInput";
import VentanaFormulario from "@componentes/ventanas/VentanaFormulario";
import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import { defaultFormCrearLimnigrafo, opcionesEstado } from "../constantes";
import type { TCrearLimnigrafo } from "../types";
import CampoMultiCheckbox from "@componentes/formularios/CampoMultipleCheckBox";
import { usePostLimnigrafo } from "@servicios/api/limnigrafos";

type VentanaAgregrarLimnigrafoProps = {
	open: boolean,
	onClose: () => void,
	queriesToInvalidate: string[],
	handleMessage: (message: VentanaAceptarOptions) => void
}

export default function VentanaAgregrarLimnigrafo({
	open,
	onClose,
	queriesToInvalidate,
	handleMessage
}: VentanaAgregrarLimnigrafoProps) {

	const { mutate: crearLimnigrafo, isPending } = usePostLimnigrafo({
		configuracion: {
			queriesToInvalidate,
			onSuccess: (data) => {
				onClose();
				handleMessage({
					title: "Creado Correctamente",
					description: `El limnigrafo ${data?.codigo} se creó correctamente`,
					variant: "exito",
				});
			},
			onError: (e) => {
				console.error("Error en el componente VentanaAgregarLimnigrafo: ", e);

				handleMessage({
					title: "Error al crear",
					description: "No se pudo crear el limnigrafo",
					variant: "error",
				});
			},
		},
	});

	const valoresIniciales = defaultFormCrearLimnigrafo;

	const onSubmit = (data: TCrearLimnigrafo) => {
		crearLimnigrafo({
			data: {
				codigo: data.codigo,
				tipo_comunicacion: data.tipo_de_comunicacion,
				memoria: data.memoria,
			},
		});
	};

	return (
		<VentanaFormulario
			open={open}
			onClose={onClose}
			onSubmit={onSubmit}
			titulo="Agregar Limnigrafo"
			valoresIniciales={valoresIniciales}
			classNameContenido="flex flex-col gap-4"
			isLoading={isPending}
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
			<CampoMultiCheckbox
				name="tipo_de_comunicacion"
				options={opcionesEstado}
				className="md:grid-cols-2"
				label="Tipo de comunicación"
			/>
		</VentanaFormulario>
	);
}
