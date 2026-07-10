"use client";

import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import SeccionInfo from "@componentes/secciones/SeccionInfo";
import VentanaConfirmar from "@componentes/ventanas/VentanaConfirmar";
import { useNotificar } from "@hooks/useNotificar";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { defaultFormEditarLimnigrafo } from "../../constantes";
import { useGetLimnigrafo, usePatchConfiguracionLimnigrafo, usePutLimnigrafo } from "@servicios/api/limnigrafos";
import { TFormEditarLimnigrafo } from "../../types";
import { obtenerMemoria } from "@lib/obtenerMemoria";
import CargandoDatos from "@componentes/animaciones/CargandoDatos";
import MensajeError from "@componentes/mensajes/MensajeError";
import FormularioEditarLimnigrafo from "../../componentes/FormularioEditarLimnigrafo";
import { segundosAHMS } from "@lib/segundosAHMS";
import { hmsASegundos } from "@lib/hmlsASegundos";
import { normalizarMemoriaExacta } from "@lib/normalizarMemoriaExacta";

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
	const { mutateAsync: editarLimnigrafo, isPending: isPendingLimnigrafo } =
		usePutLimnigrafo({
			params: {
				id: limnigrafoID,
			},
			configuracion: {
				queriesToInvalidate: ["useGetLimnigrafo"],
				onError: (error) => {
					const mensaje = error.response?.data.descripcion_usuario;
					console.error("Error en usePutLimnigrafo en el componente PaginaEditarLimnigrafo ", error);
					notificar({
						titulo: "Error al editar",
						mensaje: mensaje || "Ocurrió un error imprevisto",
						desaparecerEnMS: 5000,
						variante: "error",
					});
				},
			}
		});
	const { mutateAsync: editarConfiguracionLimnigrafo, isPending: isPendingConfiguracion } =
		usePatchConfiguracionLimnigrafo({
			params: {
				id: limnigrafoID,
			},
			configuracion: {
				queriesToInvalidate: ["useGetLimnigrafo"],
				onError: (error) => {
					const mensaje = error.response?.data.descripcion_usuario;
					console.error("Error en usePatchConfiguracionLimnigrafo en PaginaEditarLimnigrafo", error);
					notificar({
						titulo: "Error al editar configuración",
						mensaje: mensaje || "Ocurrió un error imprevisto",
						desaparecerEnMS: 5000,
						variante: "error",
					});
				},
			}
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
		const configuracion = limnigrafo.configuracion;

		const { value, unit } = normalizarMemoriaExacta(limnigrafo.memoria);
		const {
			horas: tiempo_advertencia_horas,
			minutos: tiempo_advertencia_minutos,
			segundos: tiempo_advertencia_segundos,
		} = segundosAHMS(configuracion?.tiempo_advertencia);

		const {
			horas: tiempo_peligro_horas,
			minutos: tiempo_peligro_minutos,
			segundos: tiempo_peligro_segundos,
		} = segundosAHMS(configuracion?.tiempo_peligro);

		return {
			codigo: limnigrafo.codigo,
			descripcion: limnigrafo.descripcion || "",
			ultimo_mantenimiento: limnigrafo.ultimo_mantenimiento || "",
			bateria_min: configuracion?.bateria_min || 0,
			bateria_max: configuracion?.bateria_max || 0,
			tiempo_advertencia_horas,
			tiempo_advertencia_minutos,
			tiempo_advertencia_segundos,
			tiempo_peligro_horas,
			tiempo_peligro_minutos,
			tiempo_peligro_segundos,
			memoria_value: String(value),
			memoria_unit: unit,
			tipo_comunicacion: limnigrafo.tipo_comunicacion || [],
		};
	}, [limnigrafo]);

	const onSubmit = async (data: TFormEditarLimnigrafo) => {
		const tiempo_advertencia = hmsASegundos({
			horas: data.tiempo_advertencia_horas,
			minutos: data.tiempo_advertencia_minutos,
			segundos: data.tiempo_advertencia_segundos,
		});

		const tiempo_peligro = hmsASegundos({
			horas: data.tiempo_peligro_horas,
			minutos: data.tiempo_peligro_minutos,
			segundos: data.tiempo_peligro_segundos,
		});

		try {
			await editarLimnigrafo({
				data: {
					codigo: data.codigo,
					descripcion: data.descripcion,
					memoria: obtenerMemoria({
						unit: data.memoria_unit,
						value: Number(data.memoria_value),
					}),
					tipo_comunicacion: data.tipo_comunicacion,
					ultimo_mantenimiento: data.ultimo_mantenimiento || null,
				},
			});

			await editarConfiguracionLimnigrafo({
				data: {
					bateria_min: data.bateria_min,
					bateria_max: data.bateria_max,
					tiempo_advertencia,
					tiempo_peligro,
				},
			});

			notificar({
				titulo: "Edición Completada",
				mensaje: `El limnígrafo ${data.codigo} se editó correctamente`,
				desaparecerEnMS: 5000,
				variante: "exito",
			});
			router.back();
		} catch {
			// Los errores ya se notifican en los hooks.
		}
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
				<MensajeError titulo="Error" handleReintentar={() => refetch()}>
					No se pudo obtener los datos del limnígrafo. Inténtelo de
					nuevo más tarde.
				</MensajeError>
			) : (
				<FormularioEditarLimnigrafo
					valoresIniciales={valoresIniciales}
					handleCancelar={handleCancelar}
					onSubmit={onSubmit}
					onDirty={(dirty) => setEditado(dirty)}
					isLoading={isPendingLimnigrafo || isPendingConfiguracion}
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
