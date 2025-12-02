"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LimnigrafoTable from "@componentes/LimnigrafoTable";
import { Nav } from "@componentes/Nav";
import {
	EXTRA_LIMNIGRAFOS_STORAGE_KEY,
	type LimnigrafoDetalleData,
	LIMNIGRAFOS,
} from "@data/limnigrafos";
import type { VarianteEstadoLimnigrafo } from "@componentes/BotonEstadoLimnigrafo";
import Boton from "@componentes/Boton";
import PaginaBase from "@componentes/base/PaginaBase";
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
	id: "",
	nombre: "",
	ubicacion: "",
	descripcion: "",
};

export default function Home() {
	const router = useRouter();
	const [searchValue, setSearchValue] = useState("");
		const [extraLimnigrafos, setExtraLimnigrafos] = useState<
			LimnigrafoDetalleData[]
		>(() => {
			if (typeof window === "undefined") {
				return [];
			}
		const stored = window.localStorage.getItem(EXTRA_LIMNIGRAFOS_STORAGE_KEY);
		if (!stored) {
			return [];
		}
		try {
			return JSON.parse(stored) as LimnigrafoDetalleData[];
		} catch {
			return [];
		}
		});
		const [mostrarFormulario, setMostrarFormulario] = useState(false);
		const [formValues, setFormValues] = useState(FORM_STATE);
		const [formError, setFormError] = useState<string | null>(null);
		const [persistError, setPersistError] = useState<string | null>(null);
		const [isPersisting, setIsPersisting] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		window.localStorage.setItem(
			EXTRA_LIMNIGRAFOS_STORAGE_KEY,
			JSON.stringify(extraLimnigrafos),
		);
	}, [extraLimnigrafos]);

	const todosLimnigrafos = useMemo(
		() => [...extraLimnigrafos, ...LIMNIGRAFOS],
		[extraLimnigrafos],
	);

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

	function handleChange(
		field: keyof typeof FORM_STATE,
		value: string,
	): void {
		setFormValues((prev) => ({ ...prev, [field]: value }));
	}

	function resetForm() {
		setFormValues(FORM_STATE);
		setFormError(null);
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!formValues.nombre || !formValues.ubicacion) {
			setFormError("Nombre y ubicaci+??n son obligatorios.");
			return;
		}

		const nuevoLimnigrafo: LimnigrafoDetalleData = {
			id: formValues.id || `lim-extra-${Date.now()}`,
			nombre: formValues.nombre,
			ubicacion: formValues.ubicacion,
			bateria: "Bateria 100%",
			tiempoUltimoDato: "Hace instantes",
			estado: { variante: DEFAULT_ESTADO_VARIANTE },
			temperatura: "0??",
			altura: "0 mts",
			presion: "0 bar",
			ultimoMantenimiento: "Sin datos",
			descripcion:
        formValues.descripcion ||
        "Sin descripci+??n. Actualice la informaci+??n cuando est+?? disponible.",
			datosExtra: DATOS_EXTRA_PLACEHOLDER.map((item) => ({ ...item })),
			coordenadas: undefined,
		};

		setIsPersisting(true);
		setPersistError(null);

		try {
			const response = await fetch("/api/limnigrafos", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ limnigrafo: nuevoLimnigrafo }),
			});

			if (!response.ok) {
				throw new Error("No se pudo guardar el limnigrafo en el archivo.");
			}

			setExtraLimnigrafos((prev) => [nuevoLimnigrafo, ...prev]);
			setMostrarFormulario(false);
			resetForm();
		} catch (error) {
			setPersistError(
				error instanceof Error
					? error.message
					: "Error desconocido al guardar.",
			);
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
				<Nav
					userName="Juan Perez"
					userEmail="juan.perez@scarh.com"
					onProfileClick={() => router.push("/perfil")}
				/>

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
											{mostrarFormulario ? "Cerrar formulario" : "Añadir Limnigrafo"}
										</span>
									</Boton>
								</DialogTrigger>
							</div>

							<DialogContent className="max-w-4xl rounded-[24px] border-none bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.15)]">
								<DialogHeader className="text-left">
									<DialogTitle className="text-[24px] text-[#333]">
										Nuevo Limnigrafo
									</DialogTitle>
									<DialogDescription className="text-[16px] text-[#666]">
										Completa los datos principales y presiona &quot;Importar dato&quot;.
									</DialogDescription>
								</DialogHeader>
								{formError ? (
									<p className="mt-1 text-[15px] text-red-500">{formError}</p>
								) : null}
								{persistError ? (
									<p className="text-[15px] text-red-500">{persistError}</p>
								) : null}

								<form onSubmit={handleSubmit} className="mt-4 grid gap-4">
									<div className="grid gap-4 md:grid-cols-2">
										<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
											Identificador
											<input
												type="text"
												value={formValues.id}
												onChange={(event) => handleChange("id", event.target.value)}
												className="rounded-xl border border-[#D3D4D5] p-2.5"
											/>
										</label>
										<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
											Nombre *
											<input
												type="text"
												value={formValues.nombre}
												onChange={(event) =>
													handleChange("nombre", event.target.value)
												}
												className="rounded-xl border border-[#D3D4D5] p-2.5"
												required
											/>
										</label>
										<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
											Ubicación *
											<input
												type="text"
												value={formValues.ubicacion}
												onChange={(event) =>
													handleChange("ubicacion", event.target.value)
												}
												className="rounded-xl border border-[#D3D4D5] p-2.5"
												required
											/>
										</label>
									</div>

									<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
										Descripción
										<textarea
											value={formValues.descripcion}
											onChange={(event) =>
												handleChange("descripcion", event.target.value)
											}
											rows={4}
											className="rounded-xl border border-[#D3D4D5] p-2.5"
										/>
									</label>

									<div className="mt-4 flex flex-wrap items-center justify-end gap-4">
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
											{isPersisting ? "Guardando..." : "Crear Limnigrafo"}
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
							showActions
						/>
					</div>
				</main>
			</div>
		</PaginaBase>
	);
}
