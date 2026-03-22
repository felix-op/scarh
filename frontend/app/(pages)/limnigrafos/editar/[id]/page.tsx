"use client";

import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import SeccionInfo from "@componentes/secciones/SeccionInfo";
import VentanaConfirmar from "@componentes/ventanas/VentanaConfirmar";
import { useNotificar } from "@hooks/useNotificar";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { defaultFormEditarLimnigrafo } from "../../constantes";
import { useGetLimnigrafo, usePutLimnigrafo } from "@servicios/api/limnigrafos";
import { normalizarMemoria } from "@lib/normalizarMemoria";
import { TFormEditarLimnigrafo } from "../../types";
import { obtenerMemoria } from "@lib/obtenerMemoria";
import CargandoDatos from "@componentes/animaciones/CargandoDatos";
import MensajeError from "@componentes/mensajes/MensajeError";
import FormularioEditarLimnigrafo from "../../componentes/FormularioEditarLimnigrafo";

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
		refetch,
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

	const valoresIniciales: TFormEditarLimnigrafo = useMemo(() => {
		if (!limnigrafo) return defaultFormEditarLimnigrafo;

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

			{isLoadingLimnigrafo ? (
				<SeccionInfo>
					<CargandoDatos />
				</SeccionInfo>
			) : isErrorLimnigrafo ? (
				<MensajeError titulo="Error" handleReintentar={() => refetch}>
					No se pudo obtener los datos del limnígrafo. Inténtelo de
					nuevo más tarde.
				</MensajeError>
			) : (
				<FormularioEditarLimnigrafo
					valoresIniciales={valoresIniciales}
					handleCancelar={handleCancelar}
					onSubmit={onSubmit}
					onDirty={(dirty) => setEditado(dirty)}
					isLoading={isPendingLimnigrafo}
				/>
			)}

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
