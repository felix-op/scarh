"use client";

import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import CampoHora from "@componentes/formularios/CampoHora";
import CampoInput from "@componentes/formularios/CampoInput";
import CampoMultiCheckbox from "@componentes/formularios/CampoMultipleCheckBox";
import Formulario from "@componentes/formularios/Formulario";
import SeccionInfo from "@componentes/secciones/SeccionInfo";
import VentanaConfirmar from "@componentes/ventanas/VentanaConfirmar";
import { useNotificar } from "@hooks/useNotificar";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { opcionesMemoria, opcionesTipoComunicacion } from "../../constantes";
import { useGetLimnigrafo, usePutLimnigrafo } from "@servicios/api/limnigrafos";
import CampoSelector from "@componentes/formularios/CampoSelector";
import { normalizarMemoria } from "@lib/normalizarMemoria";
import { TFormEditarLimnigrafo } from "../../types";
import { obtenerMemoria } from "@lib/obtenerMemoria";
import CargandoDatos from "@componentes/animaciones/CargandoDatos";
import Separador from "@componentes/Separador";
import CampoFecha from "@componentes/formularios/CampoFecha";

export default function PaginaEditarLimnigrafo() {
	const router = useRouter();
	const notificar = useNotificar();
	const params = useParams<{ id: string }>();
	const limnigrafoID = params?.id || "";
	const [editado, setEditado] = useState(false);
	const [isOpenConfirmar, setIsOpenConfirmar] = useState(false);
	const {
		data: limnigrafo,
		isFetching: isLoadingLimnigrafo,
		isError: isErrorLimnigrafo,
	} = useGetLimnigrafo({
		params: {
			id: limnigrafoID,
		},
		configuracion: {
			enabled: !!limnigrafoID,
		},
	});
	const { mutate: editarLimnigrafo, isPending: isPendingLimnigrafo } =
		usePutLimnigrafo({
			params: {
				id: limnigrafoID,
			},
		});

	const handleCancelar = () => {
		if (editado) {
			setIsOpenConfirmar(true);
		} else {
			router.back();
		}
	};

	const handleConfirmCancel = () => {
		router.back();
	};

	const handleGuardar = () => {};

	const valoresIniciales = useMemo(() => {
		if (!limnigrafo) return {};

		const { value, unit } = normalizarMemoria(limnigrafo.memoria);

		return {
			codigo: limnigrafo.codigo,
			descripcion: limnigrafo.descripcion || "",
			ultimo_mantenimiento: limnigrafo.ultimo_mantenimiento || "",
			bateria_min: limnigrafo.bateria_min || 0,
			bateria_max: limnigrafo.bateria_max || 0,
			tiempo_advertencia: limnigrafo.tiempo_advertencia || "",
			tiempo_peligro: limnigrafo.tiempo_peligro || "",
			memoria_value: value,
			memoria_unit: unit,
			tipo_comunicacion: limnigrafo.tipo_comunicacion || [],
		};
	}, [limnigrafo]);

	const onSubmit = (data: TFormEditarLimnigrafo) => {
		editarLimnigrafo({
			data: {
				codigo: data.codigo,
				descripcion: data.descripcion,
				memoria: obtenerMemoria({
					unit: data.memoria_unit,
					value: data.memoria_value,
				}),
				bateria_min: data.bateria_min,
				bateria_max: data.bateria_max,
				tipo_comunicacion: data.tipo_comunicacion,
				tiempo_advertencia: data.tiempo_advertencia || null,
				tiempo_peligro: data.tiempo_peligro || null,
				ultimo_mantenimiento: data.ultimo_mantenimiento || null,
			},
		});
		notificar({
			titulo: "Datos enviados",
			mensaje: JSON.stringify(data),
			desaparecerEnMS: 5000,
			variante: "info",
		});
	};

	const handleVolver = () => {
		router.back();
	};

	return (
		<PaginaBase>
			<div className="flex flex-col gap-4">
				<div>
					<BotonVariante variant="volver" onClick={handleVolver} />
				</div>
				<h1 className="text-center">Editar limnígrafo</h1>
			</div>
			<br />

			<SeccionInfo>
				{isLoadingLimnigrafo ? (
					<CargandoDatos />
				) : isErrorLimnigrafo ? (
					<div>
						Error: No se pudo obtener los datos del limnígrafo.
					</div>
				) : (
					<Formulario
						valoresIniciales={valoresIniciales}
						onSubmit={onSubmit}
						onDirty={(isDirty) => setEditado(isDirty)}
					>
						<div className="flex flex-col lg:flex-row gap-4">
							<div className="flex flex-col gap-4 grow">
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
								<CampoHora
									name="tiempo_advertencia"
									label="Tiempo máximo antes de advertencias:"
									placeholder="HH:mm"
								/>
								<CampoHora
									name="tiempo_peligro"
									label="Tiempo máximo antes de peligro:"
								/>
							</div>
							<Separador direction="vertical" />
							<div className="flex flex-col gap-4 grow">
								<h2>Especificaciones técnicas</h2>
								<hr />
								<div className="flex items-end gap-2 w-full">
									<div className="grow">
										<CampoInput
											type="number"
											name="memoria_value"
											label="Máxima cantidad de memoria:"
										/>
									</div>
									<div className="w-20">
										<CampoSelector
											name="memoria_unit"
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
								onClick={handleGuardar}
								loading={isPendingLimnigrafo}
							/>
						</div>
					</Formulario>
				)}
			</SeccionInfo>
			<br />
			<VentanaConfirmar
				open={isOpenConfirmar}
				title="Descartar Cambios"
				description="¿Está seguro que desea descartas los cambios realizados?"
				onConfirm={handleConfirmCancel}
				variant="cierre"
				onClose={() => setIsOpenConfirmar(false)}
			/>
		</PaginaBase>
	);
}
