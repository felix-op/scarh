"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LimnigrafoDetailsCard from "@componentes/LimnigrafoDetailsCard";
import Boton from "@componentes/Boton";
import { Documet, Edit, Map as MapIcon, Ruler } from "@componentes/icons/Icons";
import { Nav } from "@componentes/Nav";
import {
	EXTRA_LIMNIGRAFOS_STORAGE_KEY,
	type LimnigrafoDetalleData,
	LIMNIGRAFOS,
} from "@data/limnigrafos";

function DetalleLimnigrafoContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const selectedId = searchParams.get("id");
	const [extraLimnigrafos] = useState<LimnigrafoDetalleData[]>(() => {
		if (typeof window === "undefined") {
			return [];
		}
		const stored = window.localStorage.getItem(EXTRA_LIMNIGRAFOS_STORAGE_KEY);
		if (stored) {
			try {
				return JSON.parse(stored) as LimnigrafoDetalleData[];
			} catch {
				return [];
			}
		}
		return [];
	});

	const dataset = useMemo(
		() => [...extraLimnigrafos, ...LIMNIGRAFOS],
		[extraLimnigrafos],
	);

	const limnigrafo = useMemo(() => {
		if (!selectedId) {
			return dataset[0];
		}
		return dataset.find((item) => item.id === selectedId) ?? dataset[0];
	}, [selectedId, dataset]);

	const [descripcion, setDescripcion] = useState(limnigrafo.descripcion);
	const [estaEditandoDescripcion, setEstaEditandoDescripcion] = useState(false);
	const [descripcionTemporal, setDescripcionTemporal] = useState(descripcion);
	const [nombre, setNombre] = useState(limnigrafo.nombre);
	const [ultimoMantenimiento, setUltimoMantenimiento] = useState(
		limnigrafo.ultimoMantenimiento,
	);
	const [estaEditandoDatos, setEstaEditandoDatos] = useState(false);
	const [nombreTemporal, setNombreTemporal] = useState(nombre);
	const [ultimoMantenimientoTemporal, setUltimoMantenimientoTemporal] =
		useState(ultimoMantenimiento);
	const [errorDatos, setErrorDatos] = useState<string | null>(null);
	const estaEditando = estaEditandoDescripcion || estaEditandoDatos;

	const detalles = {
		identification: [
			{ label: "ID", value: limnigrafo.id },
			{ label: "Limnigrafo", value: nombre },
			{ label: "Bateria", value: limnigrafo.bateria },
			{
				label: "Ultimo Mantenimiento",
				value: ultimoMantenimiento,
			},
		],
		measurements: [
			{ label: "Temperatura", value: limnigrafo.temperatura },
			{ label: "Altura", value: limnigrafo.altura },
			{ label: "Presion", value: limnigrafo.presion },
		],
		extraData: limnigrafo.datosExtra,
		description: descripcion,
		status: limnigrafo.estado,
	};

	function abrirEdicionDescripcion() {
		setDescripcionTemporal(descripcion);
		setEstaEditandoDescripcion(true);
	}

	function cerrarEdicionDescripcion() {
		setEstaEditandoDescripcion(false);
	}

	function guardarDescripcion() {
		setDescripcion(descripcionTemporal);
		setEstaEditandoDescripcion(false);
	}

	function abrirEdicionDatos() {
		setNombreTemporal(nombre);
		setUltimoMantenimientoTemporal(ultimoMantenimiento);
		setErrorDatos(null);
		setEstaEditandoDatos(true);
	}

	function cerrarEdicionDatos() {
		setEstaEditandoDatos(false);
		setErrorDatos(null);
	}

	function guardarDatos() {
		const regexFecha = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
		if (!regexFecha.test(ultimoMantenimientoTemporal)) {
			setErrorDatos("El formato debe ser DD/MM/AAAA");
			return;
		}

		setNombre(nombreTemporal.trim() || nombre);
		setUltimoMantenimiento(ultimoMantenimientoTemporal);
		setEstaEditandoDatos(false);
		setErrorDatos(null);
	}

	return (
		<div
			className={`relative flex min-h-screen w-full bg-[#EEF4FB] ${
				estaEditando ? "overflow-hidden" : ""
			}`}
		>
			<Nav
				userName="Juan Perez"
				userEmail="juan.perez@scarh.com"
				onProfileClick={() => router.push("/perfil")}
			/>

			<main className="flex flex-1 justify-center px-6 py-10">
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
					<div className="flex w-full justify-center">
						<LimnigrafoDetailsCard
							title="Datos Limnigrafo"
							identification={detalles.identification}
							measurements={detalles.measurements}
							extraData={detalles.extraData}
							description={detalles.description}
							status={detalles.status}
						/>
					</div>

					<div className="flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-10 px-12">
						<Boton
							onClick={abrirEdicionDatos}
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
							<Edit size={24} color="#898989" />
							<span className="text-[16px] font-medium">Editar Limnigrafo</span>
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
							onClick={abrirEdicionDescripcion}
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
							<Documet size={24} color="#898989" />
							<span className="text-[16px] font-medium">Editar Descripcion</span>
						</Boton>
					</div>

					<div className="flex w-full max-w-[520px] flex-col items-center gap-4">
						<Boton
							className="
                !mx-auto
                !bg-white
                !text-[#7F7F7F]
                !h-[70px]
                !px-10
                w-full
                text-[24px]
                shadow-[0px_4px_8px_rgba(0,0,0,0.15)]
                hover:!bg-[#F6F6F6]
                gap-3
              "
						>
							<MapIcon size={30} color="#7F7F7F" />
							<span className="font-semibold">Agregar ubicacion</span>
						</Boton>
					</div>
				</div>
			</main>

			{estaEditandoDescripcion ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D2B]/35 backdrop-blur-[3px] px-4 py-8">
					<div className="w-full max-w-[640px] rounded-2xl bg-white p-6 shadow-[0px_12px_30px_rgba(0,0,0,0.25)]">
						<div className="flex items-start justify-between gap-3">
							<div className="flex-1">
								<p className="text-[14px] font-medium uppercase tracking-[0.08em] text-[#0982C8]">
									Descripcion
								</p>
							</div>
						</div>

						<div className="mt-5">
							<label className="mb-2 block text-[16px] font-semibold text-[#4B4B4B]">
								Nueva descripcion
							</label>
							<textarea
								value={descripcionTemporal}
								onChange={(event) => setDescripcionTemporal(event.target.value)}
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

						<div className="mt-6 flex items-center justify-end gap-4">
							<Boton
								type="button"
								onClick={cerrarEdicionDescripcion}
								className="!mx-0 !bg-[#F3F3F3] !text-[#7F7F7F] !h-[44px] !px-7"
							>
								Cancelar
							</Boton>
							<Boton
								type="button"
								onClick={guardarDescripcion}
								className="!mx-0 !h-[44px] !px-7"
							>
								Guardar
							</Boton>
						</div>
					</div>
				</div>
			) : null}

			{estaEditandoDatos ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D2B]/35 backdrop-blur-[3px] px-4 py-8">
					<div className="w-full max-w-[640px] rounded-2xl bg-white p-6 shadow-[0px_12px_30px_rgba(0,0,0,0.25)]">
						<div className="flex items-start justify-between gap-3">
							<div className="flex-1">
								<p className="text-[14px] font-medium uppercase tracking-[0.08em] text-[#0982C8]">
									Datos limnigrafo
								</p>
								<h3 className="mt-1 text-[24px] font-semibold text-[#4B4B4B]">
									Editar limnigrafo
								</h3>
								<p className="text-[15px] text-[#6B6B6B]">
									Modifica el nombre y la fecha de último mantenimiento.
								</p>
							</div>
						</div>

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

						<div className="mt-6 flex items-center justify-end gap-4">
							<Boton
								type="button"
								onClick={cerrarEdicionDatos}
								className="!mx-0 !bg-[#F3F3F3] !text-[#7F7F7F] !h-[44px] !px-7"
							>
								Cancelar
							</Boton>
							<Boton
								type="button"
								onClick={guardarDatos}
								className="!mx-0 !h-[44px] !px-7"
							>
								Guardar
							</Boton>
						</div>
					</div>
				</div>
			) : null}
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
