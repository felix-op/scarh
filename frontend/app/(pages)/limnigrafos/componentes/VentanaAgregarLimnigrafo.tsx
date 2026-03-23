import CampoInput from "@componentes/formularios/CampoInput";
import VentanaFormulario from "@componentes/ventanas/VentanaFormulario";
import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import { opcionesMemoria, opcionesTipoComunicacion } from "../constantes";
import type { TCrearLimnigrafo } from "../types";
import CampoMultiCheckbox from "@componentes/formularios/CampoMultipleCheckBox";
import { usePostLimnigrafo } from "@servicios/api/limnigrafos";
import CampoSelector from "@componentes/formularios/CampoSelector";
import { obtenerMemoria } from "@lib/obtenerMemoria";

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

	const valoresIniciales: TCrearLimnigrafo = {
		codigo: "",
		memoria_unit: "B",
		memoria_value: "",
		tipo_de_comunicacion: [],
	};

	const onSubmit = (data: TCrearLimnigrafo) => {
		crearLimnigrafo({
			data: {
				codigo: data.codigo,
				tipo_comunicacion: data.tipo_de_comunicacion,
				memoria: obtenerMemoria({
					unit: data.memoria_unit,
					value: Number(data.memoria_value),
				}),
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
				placeholder="Nombre o código para identificar"
				disabled={isPending}
				required
			/>
			<div className="flex items-start gap-2 w-full">
				<div className="grow">
					<CampoInput
						type="integer"
						name="memoria_value"
						label="Memoria del dispositivo:"
						placeholder="Total de memoria"
						disabled={isPending}
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
			<CampoMultiCheckbox
				name="tipo_de_comunicacion"
				options={opcionesTipoComunicacion}
				className="md:grid-cols-2"
				label="Tipo de comunicación"
			/>
		</VentanaFormulario>
	);
}
