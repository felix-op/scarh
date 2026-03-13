"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@componentes/Boton";
import {
	BotonEstadoLimnigrafo,
	type EstadoLimnigrafo,
	type VarianteEstadoLimnigrafo,
} from "@componentes/BotonEstadoLimnigrafo";
import PaginaBase from "@componentes/base/PaginaBase";
import DataTable from "@componentes/tabla/DataTable";
import type { ActionConfig, ColumnConfig } from "@componentes/tabla/types";
import FiltrosContenedor from "@componentes/filtros/FiltrosContenedor";
import FiltroBusqueda from "@componentes/filtros/FiltroBusqueda";
import FiltroOpciones from "@componentes/filtros/FiltroOpciones";
import {
	useGetLimnigrafos,
	useGetMediciones,
	usePostLimnigrafo,
	usePutLimnigrafo,
	type LimnigrafoPaginatedResponse,
	type MedicionPaginatedResponse,
} from "@servicios/api/django.api";
import { transformarLimnigrafos } from "@lib/transformers/limnigrafoTransformer";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@componentes/components/ui/dialog";

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

type LimnigrafoRowData = {
	id: string;
	nombre: string;
	ubicacion: string;
	bateria: string;
	tiempoUltimoDato: string;
	estado: EstadoLimnigrafo;
};

type EstadoFiltro = "todos" | VarianteEstadoLimnigrafo;

type LimnigrafoUpsertPayload = {
	codigo: string;
	descripcion: string;
	memoria: number;
	tipo_comunicacion: string[];
	bateria_max: number;
	bateria_min: number;
	tiempo_advertencia: string;
	tiempo_peligro: string;
	ultimo_mantenimiento?: string;
	ubicacion_id?: number;
};

function formatServerError(data: unknown): string {
	if (typeof data === "string") {
		return data;
	}

	if (Array.isArray(data)) {
		return data.map((item) => formatServerError(item)).join(", ");
	}

	if (data && typeof data === "object") {
		return Object.entries(data as Record<string, unknown>)
			.map(([key, value]) => `${key}: ${formatServerError(value)}`)
			.join(", ");
	}

	return "Error desconocido";
}

export default function Home() {
	const router = useRouter();
	const [isOpenFiltros, setIsOpenFiltros] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [estadoFilter, setEstadoFilter] = useState<EstadoFiltro>("todos");
	const [mostrarFormulario, setMostrarFormulario] = useState(false);
	const [modoEdicion, setModoEdicion] = useState(false);
	const [limnigrafoEditando, setLimnigrafoEditando] = useState<string | null>(null);
	const [formValues, setFormValues] = useState(FORM_STATE);
	const [formError, setFormError] = useState<string | null>(null);
	const [persistError, setPersistError] = useState<string | null>(null);
	const [isPersisting, setIsPersisting] = useState(false);

	const {
		data: limnigrafosData,
		isLoading: isLoadingLimnigrafos,
		refetch: refetchLimnigrafos,
	} = useGetLimnigrafos({
		config: {
			refetchInterval: 300000,
		},
	});

	const { data: medicionesData, isLoading: isLoadingMediciones } = useGetMediciones({
		config: {
			refetchInterval: 300000,
		},
	});

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
		},
	});

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
		},
	});

	const limnigrafos = limnigrafosData as LimnigrafoPaginatedResponse | undefined;
	const mediciones = medicionesData as MedicionPaginatedResponse | undefined;

	const todosLimnigrafos = useMemo<LimnigrafoRowData[]>(() => {
		const limnigrafosArray = Array.isArray(limnigrafos)
			? limnigrafos
			: (limnigrafos?.results ?? []);
		const medicionesArray = mediciones?.results ?? [];

		if (limnigrafosArray.length === 0) {
			return [];
		}

		const medicionesMap = new Map<number, MedicionPaginatedResponse["results"][number]>();
		medicionesArray.forEach((medicion) => {
			const existing = medicionesMap.get(medicion.limnigrafo);
			if (!existing || new Date(medicion.fecha_hora).getTime() > new Date(existing.fecha_hora).getTime()) {
				medicionesMap.set(medicion.limnigrafo, medicion);
			}
		});

		return transformarLimnigrafos(limnigrafosArray, medicionesMap).map((item) => ({
			id: item.id,
			nombre: item.nombre,
			ubicacion: item.ubicacion,
			bateria: item.bateria,
			tiempoUltimoDato: item.tiempoUltimoDato,
			estado: item.estado,
		}));
	}, [limnigrafos, mediciones]);

	const filteredData = useMemo(() => {
		const normalizedSearch = searchValue.trim().toLowerCase();

		return todosLimnigrafos.filter((item) => {
			const matchesSearch = normalizedSearch.length === 0
				|| [item.nombre, item.ubicacion].some((field) =>
					field.toLowerCase().includes(normalizedSearch),
				);

			const matchesEstado = estadoFilter === "todos"
				|| item.estado.variante === estadoFilter;

			return matchesSearch && matchesEstado;
		});
	}, [estadoFilter, searchValue, todosLimnigrafos]);

	const columns = useMemo<ColumnConfig<LimnigrafoRowData>[]>(() => [
		{
			id: "estado",
			header: "Estado",
			cell: (row) => <BotonEstadoLimnigrafo estado={row.estado} />,
		},
		{
			id: "nombre",
			header: "Limnígrafo",
			cell: (row) => <span className="font-medium">{row.nombre}</span>,
		},
		{
			id: "ubicacion",
			header: "Ubicación de Limnígrafo",
			accessorKey: "ubicacion",
		},
		{
			id: "bateria",
			header: "Batería",
			accessorKey: "bateria",
		},
		{
			id: "tiempoUltimoDato",
			header: "Tiem. Último Dato",
			accessorKey: "tiempoUltimoDato",
		},
	], []);

	function handleViewMore(row: LimnigrafoRowData) {
		router.push(`/limnigrafos/detalleLimnigrafo?id=${encodeURIComponent(row.id)}`);
	}

	function handleChange(field: keyof typeof FORM_STATE, value: string | string[]): void {
		setFormValues((prev) => ({ ...prev, [field]: value }));
	}

	function resetForm() {
		setFormValues(FORM_STATE);
		setFormError(null);
		setPersistError(null);
		setModoEdicion(false);
		setLimnigrafoEditando(null);
	}

	function abrirFormularioCrear() {
		resetForm();
		setMostrarFormulario(true);
	}

	function abrirFormularioEditar(limnigrafoRow: LimnigrafoRowData) {
		const limnigrafosArray = Array.isArray(limnigrafos)
			? limnigrafos
			: (limnigrafos?.results ?? []);

		const idNumerico = Number.parseInt(limnigrafoRow.id, 10);
		if (Number.isNaN(idNumerico)) {
			return;
		}

		const limnigrafoBackend = limnigrafosArray.find((item) => item.id === idNumerico);
		if (!limnigrafoBackend) {
			return;
		}

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

	const actionConfig: ActionConfig<LimnigrafoRowData> = {
		typeAction: "fila",
		actionColumns: (row) => (
			<div className="flex w-full items-center justify-end gap-2 py-1 pr-3">
				<Boton
					type="button"
					onClick={() => abrirFormularioEditar(row)}
					className="
						!mx-0
						!h-[42px]
						!rounded-[24px]
						!px-[18px]
						!bg-[#E8F4FB]
						!text-[#0982C8]
						dark:!bg-[#113149]
						dark:!text-[#7DD3FC]
						gap-2
						border
						border-[#0982C8]/20
						dark:border-[#0EA5E9]/30
						shadow-[0px_2px_6px_rgba(0,0,0,0.12)]
						hover:!bg-[#D0E9F7]
						dark:hover:!bg-[#16425F]
					"
				>
					<span className="text-[16px] font-medium">Editar</span>
				</Boton>
				<Boton
					type="button"
					onClick={() => handleViewMore(row)}
					className="
						!mx-0
						!h-[42px]
						!rounded-[24px]
						!px-[18px]
						!bg-[#F3F3F3]
						!text-[#7F7F7F]
						dark:!bg-[#1E293B]
						dark:!text-[#CBD5E1]
						gap-2
						border
						border-[#E0E0E0]
						dark:border-[#334155]
						shadow-[0px_2px_6px_rgba(0,0,0,0.12)]
						hover:!bg-[#E8E8E8]
						dark:hover:!bg-[#334155]
					"
				>
					<span className="text-[16px] font-medium">Ver más</span>
				</Boton>
			</div>
		),
	};

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!formValues.codigo) {
			setFormError("El código es obligatorio.");
			return;
		}
		if (!formValues.memoria || Number.parseInt(formValues.memoria, 10) <= 0) {
			setFormError("La memoria debe ser un número positivo.");
			return;
		}
		if (!formValues.bateria_max || Number.parseFloat(formValues.bateria_max) <= 0) {
			setFormError("La batería máxima debe ser un número positivo.");
			return;
		}
		if (!formValues.bateria_min || Number.parseFloat(formValues.bateria_min) <= 0) {
			setFormError("La batería mínima debe ser un número positivo.");
			return;
		}
		if (Number.parseFloat(formValues.bateria_min) >= Number.parseFloat(formValues.bateria_max)) {
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

		const payload: LimnigrafoUpsertPayload = {
			codigo: formValues.codigo,
			descripcion: formValues.descripcion || "",
			memoria: Number.parseInt(formValues.memoria, 10),
			tipo_comunicacion: [],
			bateria_max: Number.parseFloat(formValues.bateria_max),
			bateria_min: Number.parseFloat(formValues.bateria_min),
			tiempo_advertencia: formValues.tiempo_advertencia,
			tiempo_peligro: formValues.tiempo_peligro,
		};

		if (formValues.ultimo_mantenimiento) {
			payload.ultimo_mantenimiento = formValues.ultimo_mantenimiento;
		}
		if (formValues.ubicacion_id) {
			payload.ubicacion_id = Number.parseInt(formValues.ubicacion_id, 10);
		}

		try {
			if (modoEdicion) {
				await putLimnigrafo.mutateAsync({ data: payload });
			} else {
				await postLimnigrafo.mutateAsync({ data: payload });
			}
		} catch (error: unknown) {
			const errorInfo = error as {
				message?: string;
				response?: {
					data?: unknown;
				};
			};

			if (errorInfo.response?.data) {
				setPersistError(`Error del servidor: ${formatServerError(errorInfo.response.data)}`);
			} else {
				setPersistError(errorInfo.message || "Error al guardar el limnígrafo.");
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
			<div className="flex min-h-screen w-full bg-[#EEF4FB] dark:bg-[#0B1220]">
				<main className="flex flex-1 items-start justify-center px-6 py-10">
					<div className="flex w-full max-w-[1568px] flex-col gap-6">
						<header className="flex flex-col gap-1">
							<h1 className="text-[34px] font-semibold text-[#011018] dark:text-[#E2E8F0]">
								Limnigrafos
							</h1>
							<p className="text-base text-[#4D5562] dark:text-[#94A3B8]">
								Gestiona el inventario de limnigrafos, agrega nuevos equipos y revisa su ubicacion y estado general.
							</p>
						</header>

						<FiltrosContenedor open={isOpenFiltros}>
							<h4>Filtros</h4>
							<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
								<div className="flex-1">
									<FiltroBusqueda
										label="Buscar"
										placeholder="Por código o ubicación"
										initialSearch={searchValue}
										onSearch={(value) => setSearchValue(value)}
									/>
								</div>
								<div className="w-full lg:max-w-[240px]">
									<FiltroOpciones
										title="Estado"
										options={[
											{ label: "Todos", value: "todos" },
											{ label: "Activo", value: "activo" },
											{ label: "Advertencia", value: "advertencia" },
											{ label: "Peligro", value: "peligro" },
											{ label: "Fuera", value: "fuera" },
										]}
										onSelect={(value) => setEstadoFilter(value as EstadoFiltro)}
									/>
								</div>
							</div>
						</FiltrosContenedor>

						<DataTable
							data={filteredData}
							columns={columns}
							rowIdKey="id"
							minWidth={1100}
							onAdd={abrirFormularioCrear}
							onFilter={() => setIsOpenFiltros((prev) => !prev)}
							actionConfig={actionConfig}
							isLoading={isLoadingLimnigrafos || isLoadingMediciones}
							enableRowAnimation={false}
							emptyStateContent={<span className="text-[#6B7280] dark:text-[#94A3B8]">No hay limnígrafos para mostrar.</span>}
							styles={{
								rootClassName: "pb-0",
								cardClassName: "rounded-[20px] border-[#E5E7EB] bg-white shadow-[0px_8px_16px_rgba(0,0,0,0.08)] dark:border-[#334155] dark:bg-[#1B1F25] dark:shadow-[0px_10px_20px_rgba(0,0,0,0.45)]",
								scrollerClassName: "overflow-x-auto",
								tableClassName: "min-w-full text-left text-[14px] text-[#2F2F2F] dark:text-[#CBD5E1]",
								theadClassName: "bg-[#F7F9FB] text-[13px] uppercase tracking-wide text-[#6B6B6B] border-none dark:bg-[#111923] dark:text-[#94A3B8]",
								headerCellClassName: "px-4 py-3",
								tbodyClassName: "divide-y divide-[#EAEAEA] dark:divide-[#334155]",
								rowClassName: "border-0 hover:bg-[#F9FBFF] dark:hover:bg-[#1E293B]",
								cellClassName: "align-middle p-4",
								emptyCellClassName: "px-4 py-8 text-center",
							}}
						/>

						<Dialog open={mostrarFormulario} onOpenChange={handleDialogOpenChange}>
							<DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.15)] dark:border-[#334155] dark:bg-[#0F172A]">
								<DialogHeader className="text-left">
									<DialogTitle className="text-[24px] text-[#333] dark:text-[#E2E8F0]">
										{modoEdicion ? "Editar Limnigrafo" : "Nuevo Limnigrafo"}
									</DialogTitle>
									<DialogDescription className="text-[16px] text-[#666] dark:text-[#94A3B8]">
										{modoEdicion
											? "Modifica los datos y presiona \"Actualizar Limnigrafo\"."
											: "Completa los datos principales y presiona \"Crear Limnigrafo\"."}
									</DialogDescription>
								</DialogHeader>

								{formError ? (
									<p className="mt-1 text-[15px] text-red-500 dark:text-red-400">{formError}</p>
								) : null}
								{persistError ? (
									<p className="text-[15px] text-red-500 dark:text-red-400">{persistError}</p>
								) : null}

								<form onSubmit={handleSubmit} className="mt-4 grid gap-4">
									<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555] dark:text-[#CBD5E1]">
										Código *
										<input
											type="text"
											placeholder="Ej: LIM-001"
											value={formValues.codigo}
											onChange={(event) => handleChange("codigo", event.target.value)}
											className="rounded-xl border border-[#D3D4D5] bg-white p-2.5 text-[#0F172A] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#111827] dark:text-[#E2E8F0] dark:placeholder:text-[#94A3B8] dark:focus:border-[#38BDF8]"
											required
										/>
									</label>

									<div className="grid gap-4 md:grid-cols-2">
										<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555] dark:text-[#CBD5E1]">
											Memoria (MB) *
											<input
												type="number"
												placeholder="Ej: 512"
												value={formValues.memoria}
												onChange={(event) => handleChange("memoria", event.target.value)}
												className="rounded-xl border border-[#D3D4D5] bg-white p-2.5 text-[#0F172A] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#111827] dark:text-[#E2E8F0] dark:placeholder:text-[#94A3B8] dark:focus:border-[#38BDF8]"
												min="1"
												required
											/>
										</label>

										<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555] dark:text-[#CBD5E1]">
											Batería Máxima (V) *
											<input
												type="number"
												step="0.01"
												placeholder="Ej: 12.6"
												value={formValues.bateria_max}
												onChange={(event) => handleChange("bateria_max", event.target.value)}
												className="rounded-xl border border-[#D3D4D5] bg-white p-2.5 text-[#0F172A] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#111827] dark:text-[#E2E8F0] dark:placeholder:text-[#94A3B8] dark:focus:border-[#38BDF8]"
												min="0.01"
												required
											/>
										</label>

										<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555] dark:text-[#CBD5E1]">
											Batería Mínima (V) *
											<input
												type="number"
												step="0.01"
												placeholder="Ej: 10.5"
												value={formValues.bateria_min}
												onChange={(event) => handleChange("bateria_min", event.target.value)}
												className="rounded-xl border border-[#D3D4D5] bg-white p-2.5 text-[#0F172A] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#111827] dark:text-[#E2E8F0] dark:placeholder:text-[#94A3B8] dark:focus:border-[#38BDF8]"
												min="0.01"
												required
											/>
										</label>

										<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555] dark:text-[#CBD5E1]">
											Último Mantenimiento
											<input
												type="date"
												value={formValues.ultimo_mantenimiento}
												onChange={(event) => handleChange("ultimo_mantenimiento", event.target.value)}
												className="rounded-xl border border-[#D3D4D5] bg-white p-2.5 text-[#0F172A] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#111827] dark:text-[#E2E8F0] dark:placeholder:text-[#94A3B8] dark:focus:border-[#38BDF8]"
											/>
										</label>

										<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555] dark:text-[#CBD5E1]">
											Ubicación (ID)
											<input
												type="number"
												placeholder="ID ubicación (opcional)"
												value={formValues.ubicacion_id}
												onChange={(event) => handleChange("ubicacion_id", event.target.value)}
												className="rounded-xl border border-[#D3D4D5] bg-white p-2.5 text-[#0F172A] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#111827] dark:text-[#E2E8F0] dark:placeholder:text-[#94A3B8] dark:focus:border-[#38BDF8]"
												min="1"
											/>
										</label>

										<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555] dark:text-[#CBD5E1]">
											Tiempo Advertencia (HH:MM:SS) *
											<input
												type="text"
												placeholder="00:30:00"
												value={formValues.tiempo_advertencia}
												onChange={(event) => handleChange("tiempo_advertencia", event.target.value)}
												className="rounded-xl border border-[#D3D4D5] bg-white p-2.5 text-[#0F172A] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#111827] dark:text-[#E2E8F0] dark:placeholder:text-[#94A3B8] dark:focus:border-[#38BDF8]"
												pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
												required
											/>
										</label>

										<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555] dark:text-[#CBD5E1]">
											Tiempo Peligro (HH:MM:SS) *
											<input
												type="text"
												placeholder="01:00:00"
												value={formValues.tiempo_peligro}
												onChange={(event) => handleChange("tiempo_peligro", event.target.value)}
												className="rounded-xl border border-[#D3D4D5] bg-white p-2.5 text-[#0F172A] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#111827] dark:text-[#E2E8F0] dark:placeholder:text-[#94A3B8] dark:focus:border-[#38BDF8]"
												pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
												required
											/>
										</label>
									</div>

									<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555] dark:text-[#CBD5E1]">
										Descripción
										<textarea
											value={formValues.descripcion}
											onChange={(event) => handleChange("descripcion", event.target.value)}
											rows={3}
											className="rounded-xl border border-[#D3D4D5] bg-white p-2.5 text-[#0F172A] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#111827] dark:text-[#E2E8F0] dark:placeholder:text-[#94A3B8] dark:focus:border-[#38BDF8]"
											placeholder="Descripción del limnígrafo..."
										/>
									</label>

									<div className="mt-4 flex flex-wrap items-center justify-end gap-4">
										<DialogClose asChild>
											<Boton
												type="button"
												className="!mx-0 !h-[44px] !px-8 !bg-[#F6F6F6] !text-[#7F7F7F] dark:!bg-[#1E293B] dark:!text-[#CBD5E1] dark:border dark:border-[#334155]"
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
												: (modoEdicion ? "Actualizar Limnigrafo" : "Crear Limnigrafo")}
										</Boton>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</main>
			</div>
		</PaginaBase>
	);
}
