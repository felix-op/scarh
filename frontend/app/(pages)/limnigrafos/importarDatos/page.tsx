"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Boton from "@componentes/Boton";
import { LIMNIGRAFOS } from "@data/limnigrafos";
import {
	useGetLimnigrafos,
	useGetMediciones,
	type LimnigrafoPaginatedResponse,
	type MedicionPaginatedResponse,
} from "@servicios/api/django.api";
import { transformarLimnigrafos } from "@lib/transformers/limnigrafoTransformer";

type RegistroImportado = {
	id: string;
	presion: string;
	altura: string;
	temperatura: string;
	fecha?: string;
};

const MANUAL_DEFAULT = {
	presion: "",
	altura: "",
	temperatura: "",
};

function parseDatoNumerico(valor: string): number | null {
	if (!valor) {
		return null;
	}

	const normalizado = valor.replace(/[^\d.,-]/g, "").replace(",", ".");
	if (!normalizado) {
		return null;
	}

	const numero = Number.parseFloat(normalizado);
	return Number.isFinite(numero) ? numero : null;
}

function TablaDatos({ registros }: { registros: RegistroImportado[] }) {
	return (
		<div className="w-full overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-[0px_6px_10px_rgba(0,0,0,0.1)] dark:border-[#334155] dark:bg-[#0F172A] dark:shadow-[0px_10px_20px_rgba(0,0,0,0.45)]">
			<table className="w-full border-collapse text-left text-[16px] font-medium text-[#4B4B4B] dark:text-[#CBD5E1]">
				<thead className="bg-[#F5F5F5] text-[15px] uppercase text-[#7D7D7D] dark:bg-[#111923] dark:text-[#94A3B8]">
					<tr>
						<th className="px-6 py-3">Presión</th>
						<th className="px-6 py-3">Altura</th>
						<th className="px-6 py-3">Temperatura</th>
					</tr>
				</thead>
				<tbody>
					{registros.length === 0 ? (
						<tr>
							<td
								className="px-6 py-5 text-center text-[15px] text-[#9CA3AF] dark:text-[#94A3B8]"
								colSpan={3}
							>
								No hay datos importados todavía.
							</td>
						</tr>
					) : (
						registros.map((registro) => (
							<tr key={registro.id} className="border-t border-[#E3E3E3] dark:border-[#334155]">
								<td className="px-6 py-4">{registro.presion || "—"}</td>
								<td className="px-6 py-4">{registro.altura || "—"}</td>
								<td className="px-6 py-4">{registro.temperatura || "—"}</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}

function FormularioManual({
	valores,
	onChange,
}: {
	valores: typeof MANUAL_DEFAULT;
	onChange: (campo: keyof typeof MANUAL_DEFAULT, valor: string) => void;
}) {
	return (
		<div className="w-full rounded-[32px] border border-[#E2E8F0] bg-white p-6 shadow-[0px_8px_16px_rgba(0,0,0,0.15)] dark:border-[#334155] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
			<div className="grid gap-4 md:grid-cols-3">
				{(["presion", "altura", "temperatura"] as const).map((campo) => (
					<label
						key={campo}
						className="flex flex-col gap-1 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]"
					>
						{campo === "presion"
							? "Presión"
							: campo === "altura"
								? "Altura"
								: "Temperatura"}
						<input
							type="text"
							value={valores[campo]}
							onChange={(event) => onChange(campo, event.target.value)}
							className="rounded-2xl border border-[#D3D4D5] bg-white px-3 py-2.5 text-[16px] text-[#4B4B4B] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
							placeholder={
								campo === "presion"
									? "Ej: 1.2 bar"
									: campo === "altura"
										? "Ej: 45 mts"
										: "Ej: 20°"
							}
						/>
					</label>
				))}
			</div>
		</div>
	);
}

function ImportarDatosContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const {
		data: limnigrafosData,
		isLoading: isLoadingLimnigrafos,
		error: errorLimnigrafos,
	} = useGetLimnigrafos({
		config: {
			refetchInterval: 300000,
		},
	});
	const {
		data: medicionesData,
		isLoading: isLoadingMediciones,
		error: errorMediciones,
	} = useGetMediciones({
		config: {
			refetchInterval: 300000,
		},
	});
	const limnigrafosResponse =
		limnigrafosData as LimnigrafoPaginatedResponse | undefined;
	const medicionesResponse =
		medicionesData as MedicionPaginatedResponse | undefined;
	const limnigrafosTransformados = useMemo(() => {
		const limnigrafosArray = Array.isArray(limnigrafosResponse)
			? limnigrafosResponse
			: limnigrafosResponse?.results;

		if (!limnigrafosArray || limnigrafosArray.length === 0) {
			return [];
		}

		const medicionesArray = medicionesResponse?.results ?? [];
		const medicionesMap = new Map(
			medicionesArray.map((medicion) => [medicion.limnigrafo, medicion]),
		);

		return transformarLimnigrafos(limnigrafosArray, medicionesMap);
	}, [limnigrafosResponse, medicionesResponse]);
	const limnigrafosDisponibles =
		limnigrafosTransformados.length > 0 ? limnigrafosTransformados : LIMNIGRAFOS;
	const [selectedLimnigrafoId, setSelectedLimnigrafoId] = useState("");
	const [registros, setRegistros] = useState<RegistroImportado[]>([]);
	const [manualValues, setManualValues] = useState(MANUAL_DEFAULT);
	const [mensaje, setMensaje] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const inputArchivoRef = useRef<HTMLInputElement | null>(null);
	const backendError =
		errorLimnigrafos?.message ?? errorMediciones?.message ?? null;
	const isLoadingStore = isLoadingLimnigrafos || isLoadingMediciones;

	useEffect(() => {
		const paramId = searchParams.get("id");
		if (paramId && paramId !== selectedLimnigrafoId) {
			setSelectedLimnigrafoId(paramId);
		} else if (!paramId && !selectedLimnigrafoId && limnigrafosDisponibles[0]) {
			setSelectedLimnigrafoId(limnigrafosDisponibles[0].id);
		}
	}, [searchParams, limnigrafosDisponibles, selectedLimnigrafoId]);

	const limnigrafo = useMemo(() => {
		if (!limnigrafosDisponibles.length) {
			return null;
		}
		return (
			limnigrafosDisponibles.find((item) => item.id === selectedLimnigrafoId) ??
			limnigrafosDisponibles[0]
		);
	}, [limnigrafosDisponibles, selectedLimnigrafoId]);

	function handleManualChange(
		campo: keyof typeof MANUAL_DEFAULT,
		valor: string,
	) {
		setManualValues((prev) => ({ ...prev, [campo]: valor }));
	}

	function agregarRegistroManual() {
		if (
			!manualValues.presion &&
			!manualValues.altura &&
			!manualValues.temperatura
		) {
			setError("Ingresá al menos un dato para agregar manualmente.");
			setMensaje(null);
			return;
		}

		const nuevoRegistro: RegistroImportado = {
			id: `manual-${Date.now()}`,
			...manualValues,
			fecha: new Date().toISOString(),
		};

		setRegistros((prev) => [nuevoRegistro, ...prev]);
		setManualValues(MANUAL_DEFAULT);
		setError(null);
		setMensaje("Dato manual agregado correctamente.");
	}

	function quitarRegistro() {
		setRegistros((prev) => prev.slice(0, -1));
		setMensaje("Se quitó el último registro.");
		setError(null);
	}

	function manejarArchivo(event: React.ChangeEvent<HTMLInputElement>) {
		const archivo = event.target.files?.[0];
		if (!archivo) {
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			try {
				const contenido = reader.result?.toString() ?? "";
				const json = JSON.parse(contenido);
				const lista = Array.isArray(json) ? json : [json];

				const registrosDesdeArchivo: RegistroImportado[] = lista
					.map((item, index) => ({
						id: `json-${Date.now()}-${index}`,
						presion: item.presion ?? "",
						altura: item.altura ?? "",
						temperatura: item.temperatura ?? "",
						fecha:
							typeof item.fecha === "string"
								? item.fecha
								: new Date().toISOString(),
					}))
					.filter(
						(item) => item.presion || item.altura || item.temperatura,
					);

				if (registrosDesdeArchivo.length === 0) {
					throw new Error(
						"El archivo no contiene registros con presión, altura o temperatura.",
					);
				}

				setRegistros((prev) => [...registrosDesdeArchivo, ...prev]);
				setMensaje(`Se importaron ${registrosDesdeArchivo.length} registros.`);
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "No se pudo leer el archivo seleccionado.",
				);
				setMensaje(null);
			} finally {
				event.target.value = "";
			}
		};
		reader.readAsText(archivo);
	}

	async function guardarCambios() {
		if (!limnigrafo) {
			setError("No se encontró un limnígrafo seleccionado.");
			return;
		}

		if (registros.length === 0) {
			setError("Necesitas agregar al menos un registro antes de guardar.");
			return;
		}

		const limnigrafoIdNumero = Number.parseInt(limnigrafo.id, 10);
		if (Number.isNaN(limnigrafoIdNumero)) {
			setError(
				"El limnígrafo seleccionado no tiene un identificador válido del backend.",
			);
			return;
		}

		const payload = registros.map((registro) => ({
			limnigrafo: limnigrafoIdNumero,
			fecha_hora: registro.fecha ?? new Date().toISOString(),
			temperatura: parseDatoNumerico(registro.temperatura),
			altura_agua: parseDatoNumerico(registro.altura),
			presion: parseDatoNumerico(registro.presion),
			nivel_de_bateria: null,
		}));

		setIsSaving(true);
		setError(null);
		setMensaje(null);

		try {
			for (const medicion of payload) {
				const response = await fetch("/api/proxy/medicion/", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(medicion),
				});

				if (!response.ok) {
					const detail = await response.json().catch(() => ({}));
					const detalleMensaje =
						typeof detail === "string"
							? detail
							: detail?.detail ?? detail?.error ?? null;
					throw new Error(
						detalleMensaje ?? "No se pudieron almacenar las mediciones.",
					);
				}
			}

			setMensaje("Las mediciones se enviaron al backend correctamente.");
			setRegistros([]);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Error desconocido al guardar las mediciones.",
			);
		} finally {
			setIsSaving(false);
		}
	}


	return (
		<div className="flex flex-col w-full h-full">
			<main className="flex flex-1 justify-center bg-[#EEF4FB] px-6 py-10 dark:bg-[#0B1220]">
				<div className="flex w-full max-w-[1400px] flex-col gap-8">
					<header className="flex items-center justify-between">
						<h1 className="text-[32px] font-semibold text-[#1F2937] dark:text-[#E2E8F0]">
							Importar datos
						</h1>
						<p className="text-[18px] text-[#6B7280] dark:text-[#94A3B8]">
							Limnigrafo:{" "}
							<span className="font-semibold text-[#111827] dark:text-[#E2E8F0]">
								{limnigrafo?.nombre ?? "Sin datos"}
							</span>
						</p>
					</header>
					{backendError ? (
						<p className="text-sm text-red-500 dark:text-red-400">{backendError}</p>
					) : null}
					{isLoadingStore ? (
						<p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
							Cargando limnígrafos desde el backend...
						</p>
					) : null}
					{!isLoadingStore && limnigrafosTransformados.length === 0 ? (
						<p className="text-sm text-amber-700 dark:text-amber-400">
							Mostrando datos simulados mientras el backend no responde.
						</p>
					) : null}

					<section className="flex flex-col gap-4 rounded-[32px] bg-[#F8F9FB] p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.1)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
						<div className="flex items-center justify-between">
							<h2 className="text-[24px] font-semibold text-[#1F2937] dark:text-[#E2E8F0]">
								Datos importados
							</h2>
							<div className="flex flex-wrap gap-3">
								<Boton
									type="button"
									onClick={quitarRegistro}
									className="!mx-0 !h-[40px] !bg-[#F3F4F6] !px-5 !text-[#111827] dark:!bg-[#1E293B] dark:!text-[#CBD5E1] dark:border dark:border-[#334155]"
								>
									− Quitar
								</Boton>
								<Boton
									type="button"
									onClick={() => inputArchivoRef.current?.click()}
									className="!mx-0 !h-[40px] !bg-white !px-5 !text-[#0982C8] border border-[#E2E8F0] dark:!bg-[#0F172A] dark:border-[#334155] dark:!text-[#7DD3FC]"
								>
									📄 Agregar JSON
								</Boton>
								<input
									type="file"
									accept=".json,application/json"
									ref={inputArchivoRef}
									onChange={manejarArchivo}
									className="hidden"
								/>
							</div>
						</div>

						<TablaDatos registros={registros} />
					</section>

					<section className="flex flex-col gap-4">
						<h3 className="text-[20px] font-semibold text-[#1F2937] dark:text-[#E2E8F0]">
							Cargar datos manualmente
						</h3>
						<FormularioManual valores={manualValues} onChange={handleManualChange} />
						<div className="flex justify-end">
							<Boton
								type="button"
								onClick={agregarRegistroManual}
								className="!mx-0 !h-[44px] !bg-white !px-6 !text-[#111827] border border-[#E2E8F0] shadow-[0px_2px_6px_rgba(0,0,0,0.15)] dark:!bg-[#1E293B] dark:border-[#334155] dark:!text-[#CBD5E1]"
							>
								+ Agregar
							</Boton>
						</div>
					</section>

					{error ? (
						<p className="text-[15px] text-red-500 dark:text-red-400">{error}</p>
					) : null}
					{mensaje ? (
						<p className="text-[15px] text-emerald-600 dark:text-emerald-400">{mensaje}</p>
					) : null}

					<section className="flex flex-col gap-3 rounded-[32px] border border-[#E2E8F0] bg-white p-6 shadow-[0px_8px_16px_rgba(0,0,0,0.15)] dark:border-[#334155] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
						<p className="text-[18px] font-semibold text-[#4B4B4B] dark:text-[#E2E8F0]">Resumen</p>
						<div className="flex flex-wrap gap-6 text-[16px] text-[#6B7280] dark:text-[#94A3B8]">
							<span>
								Total de registros:{" "}
								<strong className="text-[#111827] dark:text-[#E2E8F0]">{registros.length}</strong>
							</span>
							<span>
								Último dato agregado:{" "}
								<strong className="text-[#111827] dark:text-[#E2E8F0]">
									{registros[0]?.presion || registros[0]?.altura || registros[0]?.temperatura
										? "Disponible"
										: "Sin datos"}
								</strong>
							</span>
						</div>
					</section>

					<div className="mt-4 flex flex-wrap justify-end gap-4">
						<Boton
							type="button"
							onClick={() => router.back()}
							className="!mx-0 !h-[48px] !bg-[#E5E7EB] !px-9 !text-[#374151] dark:!bg-[#1E293B] dark:!text-[#CBD5E1] dark:border dark:border-[#334155]"
						>
							Cancelar
						</Boton>
						<Boton
							type="button"
							onClick={guardarCambios}
							disabled={isSaving}
							className="!mx-0 !px-9 !h-[48px] disabled:opacity-60"
						>
							{isSaving ? "Guardando..." : "Guardar"}
						</Boton>
					</div>
				</div>
			</main>
		</div>
	);
}

export default function ImportarDatosPage() {
	return <ImportarDatosContent />;
}
