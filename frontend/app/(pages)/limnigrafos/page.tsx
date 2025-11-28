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

const ESTADOS: VarianteEstadoLimnigrafo[] = [
	"activo",
	"prueba",
	"advertencia",
	"fuera",
];

const FORM_STATE = {
	id: "",
	nombre: "",
	ubicacion: "",
	bateria: "",
	tiempoUltimoDato: "",
	estado: "activo" as VarianteEstadoLimnigrafo,
	temperatura: "",
	altura: "",
	presion: "",
	ultimoMantenimiento: "",
	descripcion: "",
	latitud: "",
	longitud: "",
};

export default function Home() {
	const router = useRouter();
	const [searchValue, setSearchValue] = useState("");
	const [extraLimnigrafos, setExtraLimnigrafos] = useState<
    LimnigrafoDetalleData[]
  >([]);
	const [mostrarFormulario, setMostrarFormulario] = useState(false);
	const [formValues, setFormValues] = useState(FORM_STATE);
	const [formError, setFormError] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		const stored = window.localStorage.getItem(EXTRA_LIMNIGRAFOS_STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as LimnigrafoDetalleData[];
				setExtraLimnigrafos(parsed);
			} catch {
				setExtraLimnigrafos([]);
			}
		}
	}, []);

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

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!formValues.nombre || !formValues.ubicacion) {
			setFormError("Nombre y ubicaci+¦n son obligatorios.");
			return;
		}

		const lat = Number.parseFloat(formValues.latitud);
	const lng = Number.parseFloat(formValues.longitud);
	const nuevoLimnigrafo: LimnigrafoDetalleData = {
			id: formValues.id || `lim-extra-${Date.now()}`,
			nombre: formValues.nombre,
			ubicacion: formValues.ubicacion,
			bateria: formValues.bateria || "Bateria 100%",
			tiempoUltimoDato: formValues.tiempoUltimoDato || "Hace instantes",
			estado: { variante: formValues.estado },
			temperatura: formValues.temperatura || "0-¦",
			altura: formValues.altura || "0 mts",
			presion: formValues.presion || "0 bar",
			ultimoMantenimiento: formValues.ultimoMantenimiento || "Sin datos",
			descripcion:
        formValues.descripcion ||
        "Sin descripci+¦n. Actualice la informaci+¦n cuando est+® disponible.",
			datosExtra: [
				{ label: "Dato 1", value: "N/A" },
				{ label: "Dato 2", value: "N/A" },
				{ label: "Dato 3", value: "N/A" },
			],
		coordenadas:
			Number.isFinite(lat) && Number.isFinite(lng)
				? { lat, lng }
				: undefined,
		};

		setExtraLimnigrafos((prev) => [nuevoLimnigrafo, ...prev]);
		setMostrarFormulario(false);
		resetForm();
	}

	return (
		<div className="flex min-h-screen w-full bg-[#EEF4FB]">
			<Nav
				userName="Juan Perez"
				userEmail="juan.perez@scarh.com"
				onProfileClick={() => router.push("/perfil")}
			/>

			<main className="flex flex-1 items-start justify-center px-6 py-10">
				<div className="flex w-full max-w-[1568px] flex-col gap-6">
					<div className="flex justify-end">
						<Boton
							type="button"
							onClick={() => setMostrarFormulario((prev) => !prev)}
							className="
                !mx-0
                !bg-white
                !text-[#0982C8]
                !h-[48px]
                !px-8
                border border-[#0982C8]
                shadow-[0px_2px_6px_rgba(9,130,200,0.25)]
                hover:!bg-[#E6F3FB]
              "
						>
							{mostrarFormulario ? "Cerrar formulario" : "A+¦adir Limnigrafo"}
						</Boton>
					</div>

					{mostrarFormulario ? (
						<section
							className="
                rounded-[24px]
                bg-white
                p-6
                shadow-[0px_4px_12px_rgba(0,0,0,0.15)]
              "
						>
							<h2 className="text-[24px] font-semibold text-[#333]">
								Nuevo Limnigrafo
							</h2>
							<p className="text-[16px] text-[#666]">
								Completa los datos principales y presiona &quot;Importar dato&quot;.
							</p>
							{formError ? (
								<p className="mt-3 text-[15px] text-red-500">{formError}</p>
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
										Ubicaci+¦n *
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
				<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
					Latitud (opcional)
					<input
						type="number"
						step="any"
						value={formValues.latitud}
						onChange={(event) =>
							handleChange("latitud", event.target.value)
						}
						className="rounded-xl border border-[#D3D4D5] p-2.5"
						placeholder="-54.79"
					/>
				</label>
				<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
					Longitud (opcional)
					<input
						type="number"
						step="any"
						value={formValues.longitud}
						onChange={(event) =>
							handleChange("longitud", event.target.value)
						}
						className="rounded-xl border border-[#D3D4D5] p-2.5"
						placeholder="-68.30"
					/>
				</label>
									<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
										Bater+¡a
										<input
											type="text"
											value={formValues.bateria}
											onChange={(event) =>
												handleChange("bateria", event.target.value)
											}
											className="rounded-xl border border-[#D3D4D5] p-2.5"
										/>
									</label>
									<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
										Tiempo +¦ltimo dato
										<input
											type="text"
											value={formValues.tiempoUltimoDato}
											onChange={(event) =>
												handleChange("tiempoUltimoDato", event.target.value)
											}
											className="rounded-xl border border-[#D3D4D5] p-2.5"
										/>
									</label>
									<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
										Estado
										<select
											value={formValues.estado}
											onChange={(event) =>
												handleChange("estado", event.target.value)
											}
											className="rounded-xl border border-[#D3D4D5] p-2.5"
										>
											{ESTADOS.map((estado) => (
												<option key={estado} value={estado}>
													{estado}
												</option>
											))}
										</select>
									</label>
									<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
										Temperatura
										<input
											type="text"
											value={formValues.temperatura}
											onChange={(event) =>
												handleChange("temperatura", event.target.value)
											}
											className="rounded-xl border border-[#D3D4D5] p-2.5"
										/>
									</label>
									<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
										Altura
										<input
											type="text"
											value={formValues.altura}
											onChange={(event) =>
												handleChange("altura", event.target.value)
											}
											className="rounded-xl border border-[#D3D4D5] p-2.5"
										/>
									</label>
									<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
										Presi+¦n
										<input
											type="text"
											value={formValues.presion}
											onChange={(event) =>
												handleChange("presion", event.target.value)
											}
											className="rounded-xl border border-[#D3D4D5] p-2.5"
										/>
									</label>
									<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
										+Ültimo mantenimiento
										<input
											type="text"
											value={formValues.ultimoMantenimiento}
											onChange={(event) =>
												handleChange("ultimoMantenimiento", event.target.value)
											}
											className="rounded-xl border border-[#D3D4D5] p-2.5"
										/>
									</label>
								</div>

								<label className="flex flex-col gap-1 text-[15px] font-medium text-[#555]">
									Descripci+¦n
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
									<Boton
										type="button"
										onClick={() => {
											setMostrarFormulario(false);
											resetForm();
										}}
										className="!mx-0 !bg-[#F6F6F6] !text-[#7F7F7F] !h-[44px] !px-8"
									>
										Cancelar
									</Boton>

									<Boton
										type="submit"
										className="!mx-0 !h-[44px] !px-8"
									>
										Importar dato
									</Boton>
								</div>
							</form>
						</section>
					) : null}

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
	);
}

