"use client";

import { useMemo, useState } from "react";
import LimnigrafoTable from "@componentes/LimnigrafoTable";
import type { LimnigrafoDetalleData } from "@data/limnigrafos";
import type { VarianteEstadoLimnigrafo } from "@componentes/BotonEstadoLimnigrafo";
import Boton from "@componentes/Boton";
import PaginaBase from "@componentes/base/PaginaBase";
import {
	useGetLimnigrafos,
	useGetMediciones,
	usePostLimnigrafo,
	usePutLimnigrafo,
	type LimnigrafoPaginatedResponse,
	type MedicionPaginatedResponse
} from "@servicios/api/django.api";
import { transformarLimnigrafos } from "@lib/transformers/limnigrafoTransformer";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@componentes/components/ui/dialog";

const DATOS_EXTRA_PLACEHOLDER = [
	{ label: "Dato 1", value: "N/A" },
	{ label: "Dato 2", value: "N/A" },
	{ label: "Dato 3", value: "N/A" },
];

const DEFAULT_ESTADO_VARIANTE: VarianteEstadoLimnigrafo = "activo";

const FORM_STATE = {
	codigo: "",
	descripcion: "",
	memoria: "",
	tipo_comunicacion: [] as string[],
	bateria_max: "",
	bateria_min: "",
	tiempo_advertencia: "",
	tiempo_peligro: "",
	ultimo_mantenimiento: "",
	ubicacion_id: "",
};

type LimnigrafoStorePayload = {
	limnigrafos?: LimnigrafoDetalleData[];
};

export default function Home() {
	const [searchValue, setSearchValue] = useState("");
	const [mostrarFormulario, setMostrarFormulario] = useState(false);
	const [modoEdicion, setModoEdicion] = useState(false);
	const [limnigrafoEditando, setLimnigrafoEditando] = useState<string | null>(null);
	const [formValues, setFormValues] = useState(FORM_STATE);
	const [formError, setFormError] = useState<string | null>(null);
	const [persistError, setPersistError] = useState<string | null>(null);
	const [isPersisting, setIsPersisting] = useState(false);

	// Consultar datos reales del backend con auto-refresh cada 5 minutos
	const { data: limnigrafosData, isLoading: isLoadingLimnigrafos, refetch: refetchLimnigrafos } = useGetLimnigrafos({
		config: {
			refetchInterval: 300000, // 5 minutos (sincronizado con simulador)
		}
	});
	const { data: medicionesData, isLoading: isLoadingMediciones } = useGetMediciones({
		config: {
			refetchInterval: 300000, // 5 minutos (sincronizado con simulador)
		}
	});

	// Hook para crear nuevos limnígrafos
	const postLimnigrafo = usePostLimnigrafo({
		params: {},
		configuracion: {
			onSuccess: () => {
				setMostrarFormulario(false);
				resetForm();
				refetchLimnigrafos();
			},
			onError: (error: Error) => {
				setPersistError(error.message || "Error al crear el limnígrafo");
			},
		}
	});

	// Hook para editar limnígrafos existentes
	const putLimnigrafo = usePutLimnigrafo({
		params: { id: limnigrafoEditando || "" },
		configuracion: {
			onSuccess: () => {
				setMostrarFormulario(false);
				resetForm();
				refetchLimnigrafos();
			},
			onError: (error: Error) => {
				setPersistError(error.message || "Error al actualizar el limnígrafo");
			},
		}
	});

	// Cast explícito para TypeScript
	const limnigrafos = limnigrafosData as LimnigrafoPaginatedResponse | undefined;
	const mediciones = medicionesData as MedicionPaginatedResponse | undefined;

	// Transformar datos del backend a formato frontend
	const todosLimnigrafos = useMemo(() => {
		// Manejar tanto respuesta paginada como array directo
		const limnigrafosArray = Array.isArray(limnigrafos) 
			? limnigrafos 
			: limnigrafos?.results;
			
		const medicionesArray = mediciones?.results || [];
		
		if (!limnigrafosArray || limnigrafosArray.length === 0) {
			return [];
		}

		// Convertir array de mediciones a Map para búsqueda eficiente
		const medicionesMap = new Map(
			medicionesArray.map(m => [m.limnigrafo, m])
		);

		// Transformar formato backend a formato frontend
		const transformados = transformarLimnigrafos(
			limnigrafosArray,
			medicionesMap
		);
		
		return transformados;
	}, [limnigrafos, mediciones]);

	const filteredData = useMemo(() => {
		if (!searchValue) {
			return todosLimnigrafos;
		}

		const normalizedSearch = searchValue.toLowerCase();

		return todosLimnigrafos.filter((item) =>
			[item.nombre, item.ubicacion].some((field) =>
				field.toLowerCase().includes(normalizedSearch),
			),
		);
	}, [searchValue, todosLimnigrafos]);

	function handleChange(field: keyof typeof FORM_STATE, value: string | string[]): void {
		setFormValues((prev) => ({ ...prev, [field]: value }));
	}

	function resetForm() {
		setFormValues(FORM_STATE);
		setFormError(null);
		setModoEdicion(false);
		setLimnigrafoEditando(null);
	}

	function abrirFormularioCrear() {
		resetForm();
		setMostrarFormulario(true);
	}

	function abrirFormularioEditar(limnigrafoRow: { id: string; nombre: string }) {
		// Buscar el limnígrafo original del backend usando el ID
		const limnigrafosArray = Array.isArray(limnigrafos) 
			? limnigrafos 
			: limnigrafos?.results;
		
		// Extraer el número del ID (ej: "lim-1" -> 1)
		const idNumerico = parseInt(limnigrafoRow.id.replace(/\D/g, ''));
		const limnigrafoBackend = limnigrafosArray?.find(l => l.id === idNumerico);
		
		if (limnigrafoBackend) {
			setFormValues({
				codigo: limnigrafoBackend.codigo,
				descripcion: limnigrafoBackend.descripcion || "",
				memoria: limnigrafoBackend.memoria.toString(),
				tipo_comunicacion: [],
				bateria_max: limnigrafoBackend.bateria_max.toString(),
				bateria_min: limnigrafoBackend.bateria_min.toString(),
				tiempo_advertencia: limnigrafoBackend.tiempo_advertencia.toString(),
				tiempo_peligro: limnigrafoBackend.tiempo_peligro.toString(),
				ultimo_mantenimiento: limnigrafoBackend.ultimo_mantenimiento || "",
				ubicacion_id: limnigrafoBackend.ubicacion?.id?.toString() || "",
			});
			setLimnigrafoEditando(limnigrafoBackend.id.toString());
			setModoEdicion(true);
			setMostrarFormulario(true);
		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		
		// Validaciones
		if (!formValues.codigo) {
			setFormError("El código es obligatorio.");
			return;
		}
		if (!formValues.memoria || parseInt(formValues.memoria) <= 0) {
			setFormError("La memoria debe ser un número positivo.");
			return;
		}
		if (!formValues.bateria_max || parseFloat(formValues.bateria_max) <= 0) {
			setFormError("La batería máxima debe ser un número positivo.");
			return;
		}
		if (!formValues.bateria_min || parseFloat(formValues.bateria_min) <= 0) {
			setFormError("La batería mínima debe ser un número positivo.");
			return;
		}
		if (parseFloat(formValues.bateria_min) >= parseFloat(formValues.bateria_max)) {
			setFormError("La batería mínima debe ser menor que la máxima.");
			return;
		}
		if (!formValues.tiempo_advertencia) {
			setFormError("El tiempo de advertencia es obligatorio.");
			return;
		}
		if (!formValues.tiempo_peligro) {
			setFormError("El tiempo de peligro es obligatorio.");
			return;
		}

		setIsPersisting(true);
		setPersistError(null);
		setFormError(null);

		const payload: any = {
			codigo: formValues.codigo,
			descripcion: formValues.descripcion || "",
			memoria: parseInt(formValues.memoria),
			tipo_comunicacion: [],
			bateria_max: parseFloat(formValues.bateria_max),
			bateria_min: parseFloat(formValues.bateria_min),
			tiempo_advertencia: formValues.tiempo_advertencia,
			tiempo_peligro: formValues.tiempo_peligro,
		};

		// Agregar campos opcionales solo si tienen valor
		if (formValues.ultimo_mantenimiento) {
			payload.ultimo_mantenimiento = formValues.ultimo_mantenimiento;
		}
		if (formValues.ubicacion_id) {
			payload.ubicacion_id = parseInt(formValues.ubicacion_id);
		}

		console.log("Payload a enviar:", payload);

		try {
			if (modoEdicion) {
				await putLimnigrafo.mutateAsync({ data: payload });
			} else {
				await postLimnigrafo.mutateAsync({ data: payload });
			}
			// onSuccess del hook se encargará de cerrar el modal y resetear el form
		} catch (error: any) {
			// onError del hook se encargará de mostrar el error
			console.error("Error al crear limnígrafo:", error);
			console.error("Respuesta del servidor:", error?.response?.data);
			if (error?.response?.data) {
				const errorMessages = Object.entries(error.response.data)
					.map(([key, value]) => `${key}: ${value}`)
					.join(', ');
				setPersistError(`Error del servidor: ${errorMessages}`);
			}
		} finally {
			setIsPersisting(false);
		}
	}

	function handleDialogOpenChange(isOpen: boolean) {
		if (!isOpen) {
			resetForm();
		}
		setMostrarFormulario(isOpen);
	}

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">

				<main className="flex flex-1 items-start justify-center px-6 py-10">
					<div className="flex w-full max-w-[1568px] flex-col gap-6">
						<header className="flex flex-col gap-1">
							<h1 className="text-[34px] font-semibold text-[#011018]">
								Limnigrafos
							</h1>
							<p className="text-base text-[#4D5562]">
								Gestiona el inventario de limnigrafos, agrega nuevos equipos y
								revisa su ubicacion y estado general.
							</p>
						</header>
						<Dialog open={mostrarFormulario} onOpenChange={handleDialogOpenChange}>
							<div className="flex justify-end">
								<DialogTrigger asChild>
									<Boton
										type="button"
										onClick={abrirFormularioCrear}
										className="
	                !mx-0
	                !bg-[#F4F4F4]
	                !text-[#6F6F6F]
	                !h-[48px]
	                !rounded-[28px]
	                !px-8
	                gap-3
	                border border-[#E0E0E0]
	                shadow-[0px_3px_12px_rgba(0,0,0,0.12)]
	                hover:!bg-[#EAEAEA]
	              "
									>
										<span className="text-[17px] font-semibold">
											Añadir Limnígrafo
										</span>
									</Boton>
								</DialogTrigger>
							</div>

					<DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-[24px] border-none bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.15)]">
						<DialogHeader className="text-left">
							<DialogTitle className="text-[24px] text-[#333]">
								{modoEdicion ? "Editar Limnigrafo" : "Nuevo Limnigrafo"}
							</DialogTitle>
							<DialogDescription className="text-[16px] text-[#666]">
								{modoEdicion 
									? "Modifica los datos y presiona \"Actualizar Limnigrafo\"."
									: "Completa los datos principales y presiona \"Crear Limnigrafo\"."
								}
							</DialogDescription>
						</DialogHeader>
								{formError ? (
									<p className="mt-1 text-[15px] text-red-500">{formError}</p>
								) : null}
								{persistError ? (
									<p className="text-[15px] text-red-500">{persistError}</p>
								) : null}

								<form onSubmit={handleSubmit} className="mt-4 grid gap-4">
							{/* Código (requerido, único) */}
							<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
								Código *
								<input
									type="text"
									placeholder="Ej: LIM-001"
									value={formValues.codigo}
									onChange={(event) => handleChange("codigo", event.target.value)}
									className="rounded-xl border border-[#D3D4D5] p-2.5"
									required
								/>
							</label>

							<div className="grid gap-4 md:grid-cols-2">
								{/* Memoria (requerido) */}
								<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
									Memoria (MB) *
									<input
										type="number"
										placeholder="Ej: 512"
										value={formValues.memoria}
										onChange={(event) => handleChange("memoria", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-2.5"
										min="1"
										required
									/>
								</label>

								{/* Batería Máxima (requerido) */}
								<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
									Batería Máxima (V) *
									<input
										type="number"
										step="0.01"
										placeholder="Ej: 12.6"
										value={formValues.bateria_max}
										onChange={(event) => handleChange("bateria_max", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-2.5"
										min="0.01"
										required
									/>
								</label>

								{/* Batería Mínima (requerido) */}
								<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
									Batería Mínima (V) *
									<input
										type="number"
										step="0.01"
										placeholder="Ej: 10.5"
										value={formValues.bateria_min}
										onChange={(event) => handleChange("bateria_min", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-2.5"
										min="0.01"
										required
									/>
								</label>								{/* Último Mantenimiento (opcional) */}
								<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
									Último Mantenimiento
									<input
										type="date"
										value={formValues.ultimo_mantenimiento}
										onChange={(event) => handleChange("ultimo_mantenimiento", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-2.5"
									/>
								</label>

								{/* Ubicación ID (opcional) */}
								<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
									Ubicación (ID)
									<input
										type="number"
										placeholder="ID ubicación (opcional)"
										value={formValues.ubicacion_id}
										onChange={(event) => handleChange("ubicacion_id", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-2.5"
										min="1"
									/>
								</label>

								{/* Tiempo Advertencia (requerido) */}
								<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
									Tiempo Advertencia (HH:MM:SS) *
									<input
										type="text"
										placeholder="00:30:00"
										value={formValues.tiempo_advertencia}
										onChange={(event) => handleChange("tiempo_advertencia", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-2.5"
										pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
										required
									/>
								</label>

								{/* Tiempo Peligro (requerido) */}
								<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
									Tiempo Peligro (HH:MM:SS) *
									<input
										type="text"
										placeholder="01:00:00"
										value={formValues.tiempo_peligro}
										onChange={(event) => handleChange("tiempo_peligro", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-2.5"
										pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
										required
									/>
								</label>
							</div>								{/* Descripción (opcional) - AL FINAL */}
								<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
									Descripción
									<textarea
										value={formValues.descripcion}
										onChange={(event) => handleChange("descripcion", event.target.value)}
										rows={3}
										className="rounded-xl border border-[#D3D4D5] p-2.5"
										placeholder="Descripción del limnígrafo..."
									/>
								</label>									<div className="mt-4 flex flex-wrap items-center justify-end gap-4">
										<DialogClose asChild>
											<Boton
												type="button"
												className="!mx-0 !bg-[#F6F6F6] !text-[#7F7F7F] !h-[44px] !px-8"
											>
												Cancelar
											</Boton>
										</DialogClose>

										<Boton
											type="submit"
											disabled={isPersisting}
											className="!mx-0 !h-[44px] !px-8 disabled:opacity-60"
										>
											{isPersisting 
												? (modoEdicion ? "Actualizando..." : "Guardando...") 
												: (modoEdicion ? "Actualizar Limnigrafo" : "Crear Limnigrafo")
											}
										</Boton>
									</div>
								</form>
							</DialogContent>
						</Dialog>

						<LimnigrafoTable
							data={filteredData}
							searchValue={searchValue}
							onSearchChange={setSearchValue}
							onFilterClick={() => {
								console.log("Filtro por aplicar");
							}}
							onEditClick={abrirFormularioEditar}
							showActions
						/>
						{(isLoadingLimnigrafos || isLoadingMediciones) ? (
							<p className="text-center text-sm text-[#6F6F6F]">
								Cargando limnigrafos desde el backend...
							</p>
						) : null}
					</div>
				</main>
			</div>
		</PaginaBase>
	);
}
