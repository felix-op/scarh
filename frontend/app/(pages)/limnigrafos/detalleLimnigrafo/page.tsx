"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LimnigrafoDetailsCard from "@componentes/LimnigrafoDetailsCard";
import Boton from "@componentes/Boton";
import { AddIcon, Documet, Edit, Map as MapIcon, Ruler } from "@componentes/icons/Icons";
import {
	useGetLimnigrafo,
	useDeleteLimnigrafo,
	usePachtLimnigrafo,
} from "@servicios/api/django.api";
import { transformarLimnigrafoConMedicion } from "@lib/transformers/limnigrafoTransformer";

function DetalleLimnigrafoContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const selectedId = searchParams.get("id");
	
	// Obtener limnígrafo del backend
	const { data: limnigrafoData, isLoading, refetch } = useGetLimnigrafo({
		params: { id: selectedId || "" },
		configuracion: {
			enabled: !!selectedId, // Solo hacer fetch si hay ID
		}
	});
	
	// Hook para eliminar limnígrafo
	const deleteLimnigrafo = useDeleteLimnigrafo({
		params: { id: selectedId || "" },
		configuracion: {
			onSuccess: () => {
				router.push("/limnigrafos");
			},
			onError: (error: Error) => {
				setDeleteError(error.message || "Error al eliminar el limnígrafo");
				setIsDeleting(false);
			},
		}
	});
	
	// Hook para actualizar limnígrafo (PATCH)
	const patchLimnigrafo = usePachtLimnigrafo({
		params: { id: selectedId || "" },
		configuracion: {
			onSuccess: () => {
				refetch(); // Recargar datos actualizados
			},
			onError: (error: Error) => {
				setErrorDatos(error.message || "Error al actualizar el limnígrafo");
			},
		}
	});

	// Transformar datos del backend a formato frontend
	const limnigrafo = useMemo(() => {
		if (!limnigrafoData || Object.keys(limnigrafoData).length === 0) return null;
		// Cast para asegurar el tipo correcto
		return transformarLimnigrafoConMedicion(limnigrafoData as any);
	}, [limnigrafoData]);

	const [descripcion, setDescripcion] = useState("");
	const [estaEditandoDescripcion, setEstaEditandoDescripcion] = useState(false);
	const [descripcionTemporal, setDescripcionTemporal] = useState("");
	const [nombre, setNombre] = useState("");
	const [ultimoMantenimiento, setUltimoMantenimiento] = useState("");
	const [estaEditandoDatos, setEstaEditandoDatos] = useState(false);
	const [nombreTemporal, setNombreTemporal] = useState("");
	const [ultimoMantenimientoTemporal, setUltimoMantenimientoTemporal] =
		useState("");
	const [errorDatos, setErrorDatos] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
	const estaEditando = estaEditandoDescripcion || estaEditandoDatos;

	useEffect(() => {
		if (!limnigrafo) {
			return;
		}
		setDescripcion(limnigrafo.descripcion);
		setDescripcionTemporal(limnigrafo.descripcion);
		setNombre(limnigrafo.nombre);
		setNombreTemporal(limnigrafo.nombre);
		setUltimoMantenimiento(limnigrafo.ultimoMantenimiento);
		setUltimoMantenimientoTemporal(limnigrafo.ultimoMantenimiento);
		setErrorDatos(null);
	}, [limnigrafo]);

	const detalles = limnigrafo
		? {
				identification: [
					{ label: "ID de Limnígrafo", value: limnigrafo.id, editable: false },
					{ 
						label: "Limnigrafo", 
						value: estaEditandoDatos ? nombreTemporal : nombre,
						editable: true,
						isEditing: estaEditandoDatos,
						onChange: (value: string) => setNombreTemporal(value),
						onEdit: () => {
							setNombreTemporal(nombre);
							setEstaEditandoDatos(true);
						}
					},
					{ label: "Bateria", value: limnigrafo.bateria, editable: false },
					{
						label: "Ultimo Mantenimiento",
						value: estaEditandoDatos ? ultimoMantenimientoTemporal : (ultimoMantenimiento || "Sin información"),
						editable: true,
						isEditing: estaEditandoDatos,
						onChange: (value: string) => setUltimoMantenimientoTemporal(value),
						placeholder: "DD/MM/AAAA",
						onEdit: () => {
							setUltimoMantenimientoTemporal(ultimoMantenimiento || "");
							setEstaEditandoDatos(true);
						}
					},
				],
				measurements: [
					{ label: "Temperatura", value: limnigrafo.temperatura, editable: false },
					{ label: "Altura", value: limnigrafo.altura, editable: false },
					{ label: "Presion", value: limnigrafo.presion, editable: false },
				],
				extraData: limnigrafo.datosExtra.map(item => ({ ...item, editable: false })),
				description: estaEditandoDescripcion ? descripcionTemporal : descripcion,
				isEditingDescription: estaEditandoDescripcion,
				onDescriptionChange: (value: string) => setDescripcionTemporal(value),
				status: limnigrafo.estado,
			}
		: null;

	function guardarDescripcion() {
		const data = limnigrafoData as any;
		if (!data?.id) return;
		
		// Actualizar estado local inmediatamente
		setDescripcion(descripcionTemporal);
		
		// Actualizar en backend
		patchLimnigrafo.mutate({
			data: {
				descripcion: descripcionTemporal.trim()
			}
		});
		
		// Salir del modo edición
		setEstaEditandoDescripcion(false);
	}

	function guardarDatos() {
		const data = limnigrafoData as any;
		if (!data?.id) return;
		
		const regexFecha = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
		
		// Limpiar el valor (considerar "Sin información" como vacío)
		const fechaLimpia = ultimoMantenimientoTemporal && ultimoMantenimientoTemporal.trim() !== "" && ultimoMantenimientoTemporal !== "Sin información" 
			? ultimoMantenimientoTemporal.trim() 
			: "";
		
		if (fechaLimpia && !regexFecha.test(fechaLimpia)) {
			setErrorDatos("El formato debe ser DD/MM/AAAA");
			return;
		}

		// Convertir DD/MM/AAAA a YYYY-MM-DD para el backend
		let fechaBackend: string | null = null;
		if (fechaLimpia) {
			const [dia, mes, año] = fechaLimpia.split('/');
			fechaBackend = `${año}-${mes}-${dia}`;
		}

		// Actualizar estados locales inmediatamente
		setNombre(nombreTemporal);
		setUltimoMantenimiento(ultimoMantenimientoTemporal);
		
		// Actualizar en backend
		patchLimnigrafo.mutate({
			data: {
				codigo: nombreTemporal.trim() || data.codigo,
				ultimo_mantenimiento: fechaBackend || undefined
			}
		});
		
		setErrorDatos(null);
		// Salir del modo edición
		setEstaEditandoDatos(false);
	}

	function cancelarEdicion() {
		// Restaurar valores originales
		setNombreTemporal(nombre);
		setUltimoMantenimientoTemporal(ultimoMantenimiento || "");
		setDescripcionTemporal(descripcion);
		// Cerrar modo edición
		setEstaEditandoDatos(false);
		setEstaEditandoDescripcion(false);
		setErrorDatos(null);
	}

	function irAPaginaImportacion() {
		if (!limnigrafo) {
			return;
		}
		const url = `/limnigrafos/importarDatos?id=${encodeURIComponent(
			String(limnigrafo.id),
		)}`;
		router.push(url);
	}

	function irAPaginaMediciones() {
		if (!limnigrafo) {
			return;
		}
		const url = `/mediciones?id=${encodeURIComponent(String(limnigrafo.id))}`;
		router.push(url);
	}

	function handleDelete() {
		setMostrarConfirmacionEliminar(true);
	}

	async function confirmarEliminar() {
		if (!limnigrafo?.id || isDeleting) {
			return;
		}

		setIsDeleting(true);
		setDeleteError(null);
		setMostrarConfirmacionEliminar(false);
		deleteLimnigrafo.mutate({});
	}

	function cancelarEliminar() {
		setMostrarConfirmacionEliminar(false);
	}

	return (
		<div className="flex flex-col w-full h-full">
			<main className="flex flex-1 justify-center px-6 py-10 bg-[#EEF4FB]">
				<div className="flex w-full max-w-[1350px] flex-col items-center gap-12">
					<div className="flex w-full max-w-[1350px] justify-start">
						<a href="/limnigrafos" className="inline-flex">
							<Boton
								type="button"
								className="
                  !mx-0
                  !bg-white
                  !text-[#7F7F7F]
                  !h-[44px]
                  !px-6
                  shadow-[0px_2px_4px_rgba(0,0,0,0.15)]
                  hover:!bg-[#F6F6F6]
                "
							>
								← Volver
							</Boton>
						</a>
					</div>

					{detalles ? (
						<>
					<div className="relative flex w-full justify-center">
						{estaEditando && (
							<Boton
								onClick={cancelarEdicion}
								className="
									!mx-0
									!bg-[#F3F3F3]
									!text-[#7F7F7F]
									!h-[40px]
									!px-5
									text-[14px]
									shadow-[0px_3px_6px_rgba(0,0,0,0.15)]
									hover:!bg-[#e8e8e8]
									absolute
									top-6
									left-8
								"
							>
								Cancelar
							</Boton>
						)}
						
						{/* Botón Eliminar - solo visible cuando NO está editando */}
						{!estaEditando && (
							<Boton
								onClick={handleDelete}
								disabled={isDeleting}
								className="
									!mx-0
									!bg-[#FDECEC]
									!text-[#B42318]
									!h-[40px]
									!px-5
									text-[14px]
									shadow-[0px_3px_6px_rgba(0,0,0,0.15)]
									hover:!bg-[#f8dede]
									gap-2
									disabled:opacity-60
									absolute
									top-6
									left-8
								"
							>
								{isDeleting ? "Eliminando..." : "Eliminar limnigrafo"}
							</Boton>
						)}								<LimnigrafoDetailsCard
									title="Datos Limnigrafo"
									identification={detalles.identification}
									measurements={detalles.measurements}
									extraData={detalles.extraData}
									description={detalles.description}
									isEditingDescription={detalles.isEditingDescription}
									onDescriptionChange={detalles.onDescriptionChange}
									status={detalles.status}
									onEditDescription={() => {
										setDescripcionTemporal(descripcion);
										setEstaEditandoDescripcion(true);
									}}
								/>
								
								{/* Botón Guardar - lado derecho (solo cuando está editando) */}
								{estaEditando && (
									<Boton
										onClick={() => {
											if (estaEditandoDatos) guardarDatos();
											if (estaEditandoDescripcion) guardarDescripcion();
										}}
										className="
											!mx-0
											!h-[40px]
											!px-5
											text-[14px]
											shadow-[0px_3px_6px_rgba(0,0,0,0.15)]
											absolute
											top-6
											right-8
										"
									>
										Guardar
									</Boton>
								)}
							</div>
							{deleteError ? (
								<p className="text-sm text-red-500">{deleteError}</p>
							) : null}

							{/* Modal de confirmación de eliminación */}
							{mostrarConfirmacionEliminar && (
								<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
									<div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
										<h3 className="text-2xl font-bold text-[#4B4B4B] mb-4">
											¿Eliminar limnígrafo?
										</h3>
										<p className="text-[#6B6B6B] mb-6">
											Esta acción no se puede deshacer. El limnígrafo <span className="font-semibold">{limnigrafo?.nombre}</span> será eliminado permanentemente.
										</p>
										<div className="flex gap-3 justify-end">
											<Boton
												onClick={cancelarEliminar}
												className="
													!mx-0
													!bg-[#F3F3F3]
													!text-[#7F7F7F]
													!h-[44px]
													!px-6
													hover:!bg-[#e8e8e8]
												"
											>
												Cancelar
											</Boton>
											<Boton
												onClick={confirmarEliminar}
												disabled={isDeleting}
												className="
													!mx-0
													!bg-[#B42318]
													!text-white
													!h-[44px]
													!px-6
													hover:!bg-[#9a1e13]
													disabled:opacity-60
												"
											>
												{isDeleting ? "Eliminando..." : "Eliminar"}
											</Boton>
										</div>
									</div>
								</div>
							)}

							<div className="flex w-full max-w-[1200px] flex-wrap items-center justify-center gap-4">
								<Boton
									onClick={irAPaginaImportacion}
									className="
										!mx-0
										!bg-white
										!text-[#898989]
										!h-[48px]
										!px-8
										!rounded-[28px]
										shadow-[0px_2px_4px_rgba(0,0,0,0.15)]
										hover:!bg-[#F6F6F6]
										gap-2
									"
								>
									<AddIcon size={20} color="#898989" />
									<span className="text-[16px] font-medium">Importar datos</span>
								</Boton>

								<Boton
									className="
										!mx-0
										!bg-white
										!text-[#898989]
										!h-[48px]
										!px-8
										shadow-[0px_2px_4px_rgba(0,0,0,0.15)]
										hover:!bg-[#F6F6F6]
										gap-2
									"
								>
									<Ruler size={24} color="#898989" />
									<span className="text-[16px] font-medium">
										Estadisticas Del Limnigrafo
									</span>
								</Boton>
								
								<Boton
									onClick={irAPaginaMediciones}
									className="
										!mx-0
										!bg-white
										!text-[#898989]
										!h-[48px]
										!px-8
										shadow-[0px_2px_4px_rgba(0,0,0,0.15)]
										hover:!bg-[#F6F6F6]
										gap-2
									"
								>
									<Ruler size={24} color="#898989" />
									<span className="text-[16px] font-medium">
										Ver mediciones
									</span>
								</Boton>

								<Boton
									className="
										!mx-0
										!bg-white
										!text-[#898989]
										!h-[48px]
										!px-8
										shadow-[0px_2px_4px_rgba(0,0,0,0.15)]
										hover:!bg-[#F6F6F6]
										gap-2
									"
								>
									<MapIcon size={24} color="#7F7F7F" />
									<span className="text-[16px] font-medium">Agregar ubicacion</span>
								</Boton>
							</div>
						</>
					) : (
						<div className="w-full rounded-3xl bg-white p-10 text-center text-[#4B4B4B]">
							{isLoading
								? "Cargando datos del limnigrafo..."
								: "No hay limnigrafos disponibles para mostrar."}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

export default function DetalleLimnigrafoPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-[#EEF4FB] text-xl text-[#4B4B4B]">
					Cargando limnigrafo...
				</div>
			}
		>
			<DetalleLimnigrafoContent />
		</Suspense>
	);
}
