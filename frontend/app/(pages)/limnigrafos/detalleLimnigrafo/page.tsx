"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LimnigrafoDetailsCard from "@componentes/LimnigrafoDetailsCard";
import Boton from "@componentes/Boton";
import { AddIcon, Documet, Edit, Map as MapIcon, Ruler } from "@componentes/icons/Icons";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@componentes/components/ui/dialog";
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
				setEstaEditandoDatos(false);
				setEstaEditandoDescripcion(false);
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
					{ label: "ID", value: limnigrafo.id, editable: false },
					{ 
						label: "Limnigrafo", 
						value: nombre,
						editable: true,
						onEdit: () => {
							setNombreTemporal(nombre);
							setEstaEditandoDatos(true);
						}
					},
					{ label: "Bateria", value: limnigrafo.bateria, editable: false },
					{
						label: "Ultimo Mantenimiento",
						value: ultimoMantenimiento || "Sin información",
						editable: true,
						onEdit: () => {
							setUltimoMantenimientoTemporal(ultimoMantenimiento);
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
				description: descripcion,
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
		
		// Cerrar modal
		setEstaEditandoDescripcion(false);
	}

	function guardarDatos() {
		const data = limnigrafoData as any;
		if (!data?.id) return;
		
		const regexFecha = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
		if (ultimoMantenimientoTemporal && !regexFecha.test(ultimoMantenimientoTemporal)) {
			setErrorDatos("El formato debe ser DD/MM/AAAA");
			return;
		}

		// Convertir DD/MM/AAAA a YYYY-MM-DD para el backend
		let fechaBackend: string | null = null;
		if (ultimoMantenimientoTemporal) {
			const [dia, mes, año] = ultimoMantenimientoTemporal.split('/');
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
		// Cerrar modal
		setEstaEditandoDatos(false);
	}

	function handleDescripcionDialogChange(isOpen: boolean) {
		if (isOpen) {
			setDescripcionTemporal(descripcion);
		}
		setEstaEditandoDescripcion(isOpen);
	}

	function handleDatosDialogChange(isOpen: boolean) {
		if (isOpen) {
			setNombreTemporal(nombre);
			setUltimoMantenimientoTemporal(ultimoMantenimiento);
			setErrorDatos(null);
		} else {
			setErrorDatos(null);
		}
		setEstaEditandoDatos(isOpen);
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

	async function handleDelete() {
		if (!limnigrafo?.id || isDeleting) {
			return;
		}

		setIsDeleting(true);
		setDeleteError(null);
		deleteLimnigrafo.mutate({});
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
									<div className="absolute -top-16 right-8 flex gap-3">
										<Boton
											onClick={() => {
												setEstaEditandoDatos(false);
												setEstaEditandoDescripcion(false);
												setNombreTemporal(nombre);
												setUltimoMantenimientoTemporal(ultimoMantenimiento);
												setDescripcionTemporal(descripcion);
											}}
											className="
												!mx-0
												!bg-[#F3F3F3]
												!text-[#7F7F7F]
												!h-[40px]
												!px-5
												text-[14px]
												shadow-[0px_3px_6px_rgba(0,0,0,0.15)]
												hover:!bg-[#e8e8e8]
											"
										>
											Cancelar
										</Boton>
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
											"
										>
											Guardar
										</Boton>
									</div>
								)}
								<LimnigrafoDetailsCard
									title="Datos Limnigrafo"
									identification={detalles.identification}
									measurements={detalles.measurements}
									extraData={detalles.extraData}
									description={detalles.description}
									status={detalles.status}
									onEditDescription={() => {
										setDescripcionTemporal(descripcion);
										setEstaEditandoDescripcion(true);
									}}
								/>
								<Boton
									onClick={handleDelete}
									disabled={isDeleting}
									className={`
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
										transition-all
										duration-200
										${estaEditando ? 'right-[calc(100%+2rem)]' : 'right-8'}
									`}
								>
									{isDeleting ? "Eliminando..." : "Eliminar limnigrafo"}
								</Boton>
							</div>
							{deleteError ? (
								<p className="text-sm text-red-500">{deleteError}</p>
							) : null}

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

							{/* Modal para editar datos del limnígrafo */}
							<Dialog open={estaEditandoDatos} onOpenChange={setEstaEditandoDatos}>
								<DialogContent className="w-full max-w-[640px] rounded-2xl border-none bg-white p-6 shadow-[0px_12px_30px_rgba(0,0,0,0.25)]">
									<DialogHeader className="items-start">
										<p className="text-[14px] font-medium uppercase tracking-[0.08em] text-[#0982C8]">
											Datos limnigrafo
										</p>
										<DialogTitle className="text-[24px] font-semibold text-[#4B4B4B]">
											Editar limnigrafo
										</DialogTitle>
										<DialogDescription className="text-[15px] text-[#6B6B6B]">
											Modifica el nombre y la fecha de último mantenimiento.
										</DialogDescription>
									</DialogHeader>

									<div className="mt-5 flex flex-col gap-4">
										<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B]">
											Limnigrafo
											<input
												type="text"
												value={nombreTemporal}
												onChange={(event) => setNombreTemporal(event.target.value)}
												className="
													rounded-xl
													border
													border-[#D3D4D5]
													p-3
													text-[16px]
													text-[#4B4B4B]
													outline-none
													focus:border-[#0982C8]
												"
												placeholder="Nombre del limnigrafo"
											/>
										</label>

										<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B]">
											Último mantenimiento (DD/MM/AAAA)
											<input
												type="text"
												value={ultimoMantenimientoTemporal}
												onChange={(event) =>
													setUltimoMantenimientoTemporal(event.target.value)
												}
												className="
													rounded-xl
													border
													border-[#D3D4D5]
													p-3
													text-[16px]
													text-[#4B4B4B]
													outline-none
													focus:border-[#0982C8]
												"
												placeholder="DD/MM/AAAA"
											/>
											{errorDatos ? (
												<span className="text-[14px] font-normal text-red-500">
													{errorDatos}
												</span>
											) : null}
										</label>
									</div>
								</DialogContent>
							</Dialog>

							{/* Modal para editar descripción */}
							<Dialog open={estaEditandoDescripcion} onOpenChange={setEstaEditandoDescripcion}>
								<DialogContent className="w-full max-w-[640px] rounded-2xl border-none bg-white p-6 shadow-[0px_12px_30px_rgba(0,0,0,0.25)]">
									<DialogHeader className="items-start">
										<p className="text-[14px] font-medium uppercase tracking-[0.08em] text-[#0982C8]">
											Descripcion
										</p>
										<DialogTitle className="text-[24px] font-semibold text-[#4B4B4B]">
											Editar descripcion
										</DialogTitle>
									</DialogHeader>

									<div className="mt-5">
										<label className="mb-2 block text-[16px] font-semibold text-[#4B4B4B]">
											Nueva descripcion
										</label>
										<textarea
											value={descripcionTemporal}
											onChange={(event) =>
												setDescripcionTemporal(event.target.value)
											}
											className="
												w-full
												rounded-xl
												border
												border-[#D3D4D5]
												p-3
												text-[16px]
												text-[#4B4B4B]
												outline-none
												focus:border-[#0982C8]
											"
											rows={5}
										/>
									</div>
								</DialogContent>
							</Dialog>
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
