"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LimnigrafoDetailsCard from "@componentes/LimnigrafoDetailsCard";
import Boton from "@componentes/Boton";
import { AddIcon, Edit, Map as MapIcon, Ruler } from "@componentes/icons/Icons";
import {
	useDeleteLimnigrafo,
	useGetLimnigrafo,
	usePatchConfiguracionLimnigrafo,
	usePutLimnigrafo,
} from "@servicios/api/limnigrafos";
import { transformarLimnigrafoConMedicion } from "@lib/transformers/limnigrafoTransformer";
import { useNotificar } from "@hooks/useNotificar";
import { useTieneRol } from "@hooks/useTieneRol";
import RutasAccesoLimnigrafo from "../componentes/RutasAccesoLimnigrafo";
import { CamposFormularioEditarLimnigrafo } from "../componentes/FormularioEditarLimnigrafo";
import { defaultFormEditarLimnigrafo, opcionesTipoComunicacion } from "../constantes";
import type { TFormEditarLimnigrafo } from "../types";
import { normalizarMemoriaExacta } from "@lib/normalizarMemoriaExacta";
import { segundosAHMS } from "@lib/segundosAHMS";
import { hmsASegundos } from "@lib/hmlsASegundos";
import { obtenerMemoria } from "@lib/obtenerMemoria";
import { valuesToLabels } from "@lib/valuesToLabels";
import { memoriaLegible } from "@lib/memoriaLegible";
import { hmsLegibles } from "@lib/hmsLegibles";
import { normalizarFechaAFormatoLatino } from "@lib/normalizarFechaAFormatoLatino";
import VentanaFormulario from "@componentes/ventanas/VentanaFormulario";

function formatUltimaMedicion(value?: string | null): string {
	if (!value) return "-";
	const fecha = new Date(value);
	if (Number.isNaN(fecha.getTime())) return "-";

	return `${fecha.toLocaleDateString("es-AR")} ${fecha.toLocaleTimeString("es-AR", {
		hour: "2-digit",
		minute: "2-digit",
	})}`;
}

function formatUltimaConexion(value?: string | null): string {
	if (!value) return "-";
	const fecha = new Date(value);
	if (Number.isNaN(fecha.getTime())) return "-";

	return `${fecha.toLocaleDateString("es-AR")} ${fecha.toLocaleTimeString("es-AR", {
		hour: "2-digit",
		minute: "2-digit",
	})}`;
}

function formatBattery(value?: number | null): string {
	if (value == null || Number.isNaN(value)) return "-";
	return `${value.toLocaleString("es-AR", {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	})}V`;
}

function formatOptionalMetric(value?: number | null, suffix = ""): string {
	if (value == null || Number.isNaN(value)) return "-";
	return `${value}${suffix}`;
}

const TOP_ACTION_BUTTON_CLASS =
	"relative !mx-0 !h-[44px] !px-6 !rounded-full !bg-white !text-[#64748B] dark:!bg-[#1E293B] dark:!text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#334155] shadow-[0px_4px_4px_rgba(0,0,0,0.18)] hover:!brightness-95 active:!brightness-105 active:scale-95 transition-all duration-100 gap-2 overflow-hidden after:content-[''] after:absolute after:top-0 after:-left-full after:w-1/2 after:h-full after:skew-x-[-25deg] after:bg-linear-to-r after:from-transparent after:via-white/40 after:to-transparent hover:after:animate-shine before:content-[''] before:absolute before:inset-0 before:rounded-full before:transition-opacity before:duration-100 before:opacity-0 active:before:opacity-100 active:before:shadow-[inset_0px_4px_8px_rgba(0,0,0,0.2)]";

function DetalleLimnigrafoContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const notificar = useNotificar();
	const esAdministrador = useTieneRol("administracion");
	const esEditor = useTieneRol("limnigrafos-editar");
	const selectedId = searchParams.get("id");
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const { data: limnigrafoData, isLoading, refetch } = useGetLimnigrafo({
		params: { id: selectedId || "" },
		configuracion: {
			enabled: !!selectedId,
		},
	});

	const { mutate: deleteLimnigrafo } = useDeleteLimnigrafo({
		params: { id: selectedId || "" },
		configuracion: {
			onSuccess: () => {
				router.push("/limnigrafos");
			},
			onError: (error: Error) => {
				setDeleteError(error.message || "Error al eliminar el limnígrafo");
				setIsDeleting(false);
			},
		},
	});

	const { mutateAsync: editarLimnigrafo, isPending: isPendingLimnigrafo } =
		usePutLimnigrafo({
			params: { id: selectedId || "" },
			configuracion: {
				queriesToInvalidate: ["useGetLimnigrafo", "useGetLimnigrafos"],
				onError: (error) => {
					const mensaje = error.response?.data.descripcion_usuario;
					notificar({
						titulo: "Error al editar",
						mensaje: mensaje || "Ocurrió un error imprevisto",
						desaparecerEnMS: 5000,
						variante: "error",
					});
				},
			},
		});

	const {
		mutateAsync: editarConfiguracionLimnigrafo,
		isPending: isPendingConfiguracion,
	} = usePatchConfiguracionLimnigrafo({
		params: { id: selectedId || "" },
		configuracion: {
			queriesToInvalidate: ["useGetLimnigrafo", "useGetLimnigrafos"],
			onError: (error) => {
				const mensaje = error.response?.data.descripcion_usuario;
				notificar({
					titulo: "Error al editar configuración",
					mensaje: mensaje || "Ocurrió un error imprevisto",
					desaparecerEnMS: 5000,
					variante: "error",
				});
			},
		},
	});

	const limnigrafo = useMemo(() => {
		if (!limnigrafoData || Object.keys(limnigrafoData).length === 0) return null;
		return transformarLimnigrafoConMedicion(limnigrafoData as never);
	}, [limnigrafoData]);

	const valoresIniciales: TFormEditarLimnigrafo = useMemo(() => {
		if (!limnigrafoData) return defaultFormEditarLimnigrafo;

		const configuracion = limnigrafoData.configuracion;
		const { value, unit } = normalizarMemoriaExacta(limnigrafoData.memoria);
		const advertencia = segundosAHMS(configuracion?.tiempo_advertencia);
		const peligro = segundosAHMS(configuracion?.tiempo_peligro);

		return {
			codigo: limnigrafoData.codigo,
			descripcion: limnigrafoData.descripcion || "",
			ultimo_mantenimiento: limnigrafoData.ultimo_mantenimiento || "",
			bateria_min: configuracion?.bateria_min || 0,
			altura_minima_agua: configuracion?.altura_minima_agua || 0,
			altura_maxima_agua: configuracion?.altura_maxima_agua || 0,
			temperatura_minima: configuracion?.temperatura_minima || 0,
			temperatura_maxima: configuracion?.temperatura_maxima || 100,
			presion_minima: configuracion?.presion_minima || 0,
			presion_maxima: configuracion?.presion_maxima || 0,
			radio_cobertura_metros:
				limnigrafoData.radio_cobertura_metros != null
					? String(limnigrafoData.radio_cobertura_metros)
					: null,
			tiempo_advertencia_horas: advertencia.horas,
			tiempo_advertencia_minutos: advertencia.minutos,
			tiempo_advertencia_segundos: advertencia.segundos,
			tiempo_peligro_horas: peligro.horas,
			tiempo_peligro_minutos: peligro.minutos,
			tiempo_peligro_segundos: peligro.segundos,
			memoria_value: String(value),
			memoria_unit: unit,
			tipo_comunicacion: limnigrafoData.tipo_comunicacion || [],
		};
	}, [limnigrafoData]);

	const detalles = useMemo(() => {
		if (!limnigrafo || !limnigrafoData) return null;

		const configuracion = limnigrafoData.configuracion;
		const ubicacion = limnigrafoData.ubicacion?.nombre || "Sin ubicación";
		const memoria = memoriaLegible(limnigrafoData.memoria);
		const tipoComunicacion = valuesToLabels(
			limnigrafoData.tipo_comunicacion,
			opcionesTipoComunicacion,
		);

		return {
			identification: [
				{ label: "ID de Limnígrafo", value: limnigrafo.id },
				{ label: "Limnígrafo", value: limnigrafo.nombre },
				{ label: "Ubicación", value: ubicacion },
				{ label: "Memoria total", value: memoria },
				{ label: "Tipo de comunicación", value: tipoComunicacion },
				{
					label: "Último mantenimiento",
					value: normalizarFechaAFormatoLatino(limnigrafoData.ultimo_mantenimiento) || "-",
				},
			],
			measurements: [
				{ label: "Temperatura", value: limnigrafo.temperatura },
				{ label: "Altura", value: limnigrafo.altura },
				{ label: "Presión", value: limnigrafo.presion },
				{
					label: "Última medición",
					value: formatUltimaMedicion(limnigrafoData.ultima_medicion?.fecha_hora),
				},
				{
					label: "Última conexión",
					value: formatUltimaConexion(limnigrafoData.ultima_conexion),
				},
				{ label: "Batería actual", value: formatBattery(limnigrafoData.bateria) },
			],
			extraData: [
				{
					label: "Cobertura",
					value: limnigrafoData.radio_cobertura_metros != null
						? `${limnigrafoData.radio_cobertura_metros}m`
						: "N/D",
				},
				{
					label: "Batería mín",
					value: formatOptionalMetric(configuracion?.bateria_min, "V"),
				},
				{
					label: "Altura mín",
					value: formatOptionalMetric(configuracion?.altura_minima_agua, "m"),
				},
				{
					label: "Altura máx",
					value: formatOptionalMetric(configuracion?.altura_maxima_agua, "m"),
				},
				{
					label: "Temp mín",
					value: formatOptionalMetric(configuracion?.temperatura_minima, "°"),
				},
				{
					label: "Temp máx",
					value: formatOptionalMetric(configuracion?.temperatura_maxima, "°"),
				},
				{
					label: "Presión mín",
					value: formatOptionalMetric(configuracion?.presion_minima),
				},
				{
					label: "Presión máx",
					value: formatOptionalMetric(configuracion?.presion_maxima),
				},
				{
					label: "Advertencia",
					value: hmsLegibles(configuracion?.tiempo_advertencia),
				},
				{
					label: "Peligro",
					value: hmsLegibles(configuracion?.tiempo_peligro),
				},
			],
			description: limnigrafo.descripcion || "",
			status: limnigrafo.estado,
		};
	}, [limnigrafo, limnigrafoData]);

	const isSavingEdit = isPendingLimnigrafo || isPendingConfiguracion;

	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
	};

	const onSubmitEdicion = async (data: TFormEditarLimnigrafo) => {
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
					radio_cobertura_metros: data.radio_cobertura_metros
						? Number(data.radio_cobertura_metros)
						: null,
					tipo_comunicacion: data.tipo_comunicacion,
					ultimo_mantenimiento: data.ultimo_mantenimiento || null,
				},
			});

			await editarConfiguracionLimnigrafo({
				data: {
					bateria_min: data.bateria_min,
					altura_minima_agua: data.altura_minima_agua,
					altura_maxima_agua: data.altura_maxima_agua,
					temperatura_minima: data.temperatura_minima,
					temperatura_maxima: data.temperatura_maxima,
					presion_minima: data.presion_minima,
					presion_maxima: data.presion_maxima,
					tiempo_advertencia,
					tiempo_peligro,
				},
			});

			notificar({
				titulo: "Edición completada",
				mensaje: `El limnígrafo ${data.codigo} se editó correctamente`,
				desaparecerEnMS: 5000,
				variante: "exito",
			});

			setIsEditModalOpen(false);
			refetch();
		} catch {
			// Los errores ya se notifican en los hooks.
		}
	};

	function irAPaginaImportacion() {
		if (!limnigrafo) return;
		router.push(`/limnigrafos/importarDatos?id=${encodeURIComponent(String(limnigrafo.id))}`);
	}

	function irAPaginaMediciones() {
		if (!limnigrafo) return;
		router.push(`/mediciones?limnigrafo=${encodeURIComponent(String(limnigrafo.id))}`);
	}

	function irAPaginaEstadisticas() {
		if (!limnigrafo) return;
		router.push(`/estadisticas?limnigrafo=${encodeURIComponent(String(limnigrafo.id))}`);
	}

	function irAPaginaMapa() {
		if (!limnigrafo) return;
		router.push(`/mapa?limnigrafo=${encodeURIComponent(String(limnigrafo.id))}`);
	}

	function handleDelete() {
		setMostrarConfirmacionEliminar(true);
	}

	function confirmarEliminar() {
		if (!limnigrafo?.id || isDeleting) return;
		setIsDeleting(true);
		setDeleteError(null);
		setMostrarConfirmacionEliminar(false);
		deleteLimnigrafo.mutate({});
	}

	return (
		<div className="flex flex-col h-full w-full">
			<main className="flex flex-1 justify-center bg-[#EEF4FB] px-6 py-10 dark:bg-[#0B1220]">
				<div className="flex w-full max-w-[1350px] flex-col items-center gap-12">
					<div className="flex w-full max-w-[1350px] flex-wrap items-center justify-between gap-6">
						<Link href="/limnigrafos" className="inline-flex">
							<Boton
								type="button"
								className="!mx-0 !bg-white !text-[#7F7F7F] dark:!bg-[#1E293B] dark:!text-[#CBD5E1] !h-[44px] !px-6 shadow-[0px_2px_4px_rgba(0,0,0,0.15)] hover:!bg-[#F6F6F6] dark:hover:!bg-[#334155] border border-[#E2E8F0] dark:border-[#334155]"
							>
								← Volver
							</Boton>
						</Link>

						{detalles ? (
							<div className="flex flex-wrap items-center justify-end gap-4">
								<Boton
									onClick={irAPaginaImportacion}
									className={TOP_ACTION_BUTTON_CLASS}
								>
									<AddIcon size={20} color="currentColor" />
									<span className="text-[15px] font-semibold">Importar datos</span>
								</Boton>

								<Boton
									onClick={irAPaginaEstadisticas}
									className={TOP_ACTION_BUTTON_CLASS}
								>
									<Ruler size={22} color="currentColor" />
									<span className="text-[15px] font-semibold">Estadisticas Del Limnigrafo</span>
								</Boton>

								<Boton
									onClick={irAPaginaMediciones}
									className={TOP_ACTION_BUTTON_CLASS}
								>
									<Ruler size={22} color="currentColor" />
									<span className="text-[15px] font-semibold">Ver mediciones</span>
								</Boton>

								<Boton
									onClick={irAPaginaMapa}
									className={TOP_ACTION_BUTTON_CLASS}
								>
									<MapIcon size={22} color="currentColor" />
									<span className="text-[15px] font-semibold">Ver en el mapa</span>
								</Boton>
							</div>
						) : null}
					</div>

					{detalles ? (
						<>
							<div className="relative flex w-full justify-center">
								{selectedId ? (
									<Boton
										onClick={handleDelete}
										disabled={isDeleting}
										className="!mx-0 !bg-[#FDECEC] !text-[#B42318] dark:!bg-[#3A1818] dark:!text-[#FCA5A5] !h-[40px] !px-5 text-[14px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] hover:!brightness-95 active:!brightness-105 active:scale-95 transition-all duration-100 gap-2 border border-[#FECACA] dark:border-[#7F1D1D] disabled:opacity-60 absolute top-6 left-8 !rounded-full overflow-hidden after:content-[''] after:absolute after:top-0 after:-left-full after:w-1/2 after:h-full after:skew-x-[-25deg] after:bg-linear-to-r after:from-transparent after:via-white/40 after:to-transparent hover:after:animate-shine before:content-[''] before:absolute before:inset-0 before:rounded-full before:transition-opacity before:duration-100 before:opacity-0 active:before:opacity-100 active:before:shadow-[inset_0px_4px_8px_rgba(0,0,0,0.2)]"
									>
										{isDeleting ? "Eliminando..." : "Eliminar limnigrafo"}
									</Boton>
								) : null}

								<LimnigrafoDetailsCard
									title="Datos Limnigrafo"
									identification={detalles.identification}
									measurements={detalles.measurements}
									extraData={detalles.extraData}
									description={detalles.description}
									status={detalles.status}
								/>

								<Boton
									onClick={() => setIsEditModalOpen(true)}
									className="!mx-0 !h-[40px] !px-5 text-[14px] absolute top-6 right-8 gap-2 !rounded-full !bg-[#DDEEFF] !text-[#258CC6] dark:!bg-[#0B2A43] dark:!text-[#93C5FD] border border-[#CFE2F1] dark:border-[#1D4ED8] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] hover:!brightness-95 active:!brightness-105 active:scale-95 transition-all duration-100 overflow-hidden after:content-[''] after:absolute after:top-0 after:-left-full after:w-1/2 after:h-full after:skew-x-[-25deg] after:bg-linear-to-r after:from-transparent after:via-white/40 after:to-transparent hover:after:animate-shine before:content-[''] before:absolute before:inset-0 before:rounded-full before:transition-opacity before:duration-100 before:opacity-0 active:before:opacity-100 active:before:shadow-[inset_0px_4px_8px_rgba(0,0,0,0.2)]"
								>
									<Edit size={18} color="currentColor" />
									Editar
								</Boton>
							</div>

							{deleteError ? (
								<p className="text-sm text-red-500 dark:text-red-400">{deleteError}</p>
							) : null}

							{mostrarConfirmacionEliminar ? (
								<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
									<div className="mx-4 w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-2xl dark:border-[#334155] dark:bg-[#0F172A]">
										<h3 className="mb-4 text-2xl font-bold text-[#4B4B4B] dark:text-[#E2E8F0]">
											¿Eliminar limnígrafo?
										</h3>
										<p className="mb-6 text-[#6B6B6B] dark:text-[#94A3B8]">
											Esta acción no se puede deshacer. El limnígrafo <span className="font-semibold">{limnigrafo?.nombre}</span> será eliminado permanentemente.
										</p>
										<div className="flex justify-end gap-3">
											<Boton
												onClick={() => setMostrarConfirmacionEliminar(false)}
												className="!mx-0 !bg-[#F3F3F3] !text-[#7F7F7F] dark:!bg-[#1E293B] dark:!text-[#CBD5E1] !h-[44px] !px-6 hover:!bg-[#e8e8e8] dark:hover:!bg-[#334155] border border-[#E2E8F0] dark:border-[#334155]"
											>
												Cancelar
											</Boton>
											<Boton
												onClick={confirmarEliminar}
												disabled={isDeleting}
												className="!mx-0 !bg-[#B42318] !text-white dark:!bg-[#7F1D1D] dark:!text-[#FECACA] !h-[44px] !px-6 hover:!bg-[#9a1e13] dark:hover:!bg-[#991B1B] disabled:opacity-60"
											>
												{isDeleting ? "Eliminando..." : "Eliminar"}
											</Boton>
										</div>
									</div>
								</div>
							) : null}

							<div className="w-full max-w-[1350px]">
								<RutasAccesoLimnigrafo
									limnigrafoId={String(limnigrafo.id)}
									limnigrafoCodigo={limnigrafo.codigo}
									ubicacion={limnigrafo.ubicacion}
									puedeEditar={esAdministrador || esEditor}
								/>
							</div>
						</>
					) : (
						<div className="w-full rounded-3xl border border-[#E2E8F0] bg-white p-10 text-center text-[#4B4B4B] dark:border-[#334155] dark:bg-[#1B1F25] dark:text-[#94A3B8]">
							{isLoading
								? "Cargando datos del limnigrafo..."
								: "No hay limnigrafos disponibles para mostrar."}
						</div>
					)}
				</div>
			</main>

			<VentanaFormulario<TFormEditarLimnigrafo>
				open={isEditModalOpen}
				onClose={handleCloseEditModal}
				onSubmit={onSubmitEdicion}
				titulo="Editar limnigrafo"
				descripcion=""
				valoresIniciales={valoresIniciales}
				classNameVentana="md:min-w-[64rem] xl:min-w-[88rem]"
				classNameContenido="px-8 py-7 xl:px-10 xl:py-8"
				isLoading={isSavingEdit}
			>
				<CamposFormularioEditarLimnigrafo
					mostrarAcciones={false}
					variante="modal"
				/>
			</VentanaFormulario>
		</div>
	);
}

export default function DetalleLimnigrafoPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-[#EEF4FB] text-xl text-[#4B4B4B] dark:bg-[#0B1220] dark:text-[#94A3B8]">
					Cargando limnigrafo...
				</div>
			}
		>
			<DetalleLimnigrafoContent />
		</Suspense>
	);
}
