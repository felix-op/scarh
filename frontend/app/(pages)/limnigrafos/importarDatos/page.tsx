"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Boton from "@componentes/Boton";
import { Nav } from "@componentes/Nav";
import { type LimnigrafoDetalleData, LIMNIGRAFOS } from "@data/limnigrafos";

type LimnigrafoStorePayload = {
	limnigrafos?: LimnigrafoDetalleData[];
};

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

function TablaDatos({ registros }: { registros: RegistroImportado[] }) {
	return (
		<div className="w-full overflow-hidden rounded-3xl bg-white shadow-[0px_6px_10px_rgba(0,0,0,0.1)]">
			<table className="w-full border-collapse text-left text-[16px] font-medium text-[#4B4B4B]">
				<thead className="bg-[#F5F5F5] text-[15px] uppercase text-[#7D7D7D]">
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
								className="px-6 py-5 text-center text-[15px] text-[#9CA3AF]"
								colSpan={3}
							>
								No hay datos importados todavía.
							</td>
						</tr>
					) : (
						registros.map((registro) => (
							<tr key={registro.id} className="border-t border-[#E3E3E3]">
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
		<div className="w-full rounded-[32px] bg-white p-6 shadow-[0px_8px_16px_rgba(0,0,0,0.15)]">
			<div className="grid gap-4 md:grid-cols-3">
				{(["presion", "altura", "temperatura"] as const).map((campo) => (
					<label
						key={campo}
						className="flex flex-col gap-1 text-[15px] font-semibold text-[#4B4B4B]"
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
							className="rounded-2xl border border-[#D3D4D5] px-3 py-2.5 text-[16px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
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
	const [limnigrafosData, setLimnigrafosData] = useState<LimnigrafoDetalleData[]>([]);
	const [selectedLimnigrafoId, setSelectedLimnigrafoId] = useState("");
	const [isLoadingStore, setIsLoadingStore] = useState(true);
	const [storeError, setStoreError] = useState<string | null>(null);
	const [registros, setRegistros] = useState<RegistroImportado[]>([]);
	const [manualValues, setManualValues] = useState(MANUAL_DEFAULT);
	const [mensaje, setMensaje] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const inputArchivoRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		let cancelado = false;

		async function cargarStore() {
			try {
				const response = await fetch("/api/limnigrafos");
				if (!response.ok) {
					throw new Error("No se pudo leer el archivo de limnigrafos.");
				}

				const data = (await response.json()) as LimnigrafoStorePayload;
				if (cancelado) {
					return;
				}

				if (data.limnigrafos && data.limnigrafos.length > 0) {
					setLimnigrafosData(data.limnigrafos);
				} else {
					setLimnigrafosData(LIMNIGRAFOS);
				}
				setStoreError(null);
			} catch (err) {
				if (!cancelado) {
					setStoreError(
						err instanceof Error
							? err.message
							: "No se pudo cargar el archivo de limnigrafos.",
					);
					setLimnigrafosData(LIMNIGRAFOS);
				}
			} finally {
				if (!cancelado) {
					setIsLoadingStore(false);
				}
			}
		}

		void cargarStore();

		return () => {
			cancelado = true;
		};
	}, []);

	useEffect(() => {
		const paramId = searchParams.get("id");
		if (paramId && paramId !== selectedLimnigrafoId) {
			setSelectedLimnigrafoId(paramId);
		} else if (!paramId && !selectedLimnigrafoId && limnigrafosData[0]) {
			setSelectedLimnigrafoId(limnigrafosData[0].id);
		}
	}, [searchParams, limnigrafosData, selectedLimnigrafoId]);

	const limnigrafo = useMemo(() => {
		if (!limnigrafosData.length) {
			return null;
		}
		return (
			limnigrafosData.find((item) => item.id === selectedLimnigrafoId) ??
			limnigrafosData[0]
		);
	}, [limnigrafosData, selectedLimnigrafoId]);

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
			setError("No se encontro un limnigrafo seleccionado.");
			return;
		}

		if (registros.length === 0) {
			setError("Necesitas agregar al menos un registro antes de guardar.");
			return;
		}

		const payload = registros.map((registro, index) => ({
			id: registro.id || `registro-${Date.now()}-${index}`,
			temperatura: registro.temperatura,
			altura: registro.altura,
			presion: registro.presion,
			timestamp: registro.fecha ?? new Date().toISOString(),
		}));

		setIsSaving(true);
		setError(null);
		setMensaje(null);

		try {
			const response = await fetch(`/api/limnigrafos/${limnigrafo.id}/mediciones`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ mediciones: payload }),
			});

			if (!response.ok) {
				throw new Error("No se pudieron almacenar las mediciones.");
			}

			setMensaje("Las mediciones se guardaron en el archivo correctamente.");
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
		<div className="flex min-h-screen w-full bg-[#EEF4FB]">
			<Nav
				userName="Juan Perez"
				userEmail="juan.perez@scarh.com"
				onProfileClick={() => router.push("/perfil")}
			/>

			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1400px] flex-col gap-8">
					<header className="flex items-center justify-between">
						<h1 className="text-[32px] font-semibold text-[#1F2937]">
							Importar datos
						</h1>
						<p className="text-[18px] text-[#6B7280]">
							Limnigrafo:{" "}
							<span className="font-semibold text-[#111827]">
								{limnigrafo?.nombre ?? "Sin datos"}
							</span>
						</p>
					</header>
					{storeError ? (
						<p className="text-sm text-red-500">{storeError}</p>
					) : null}

					<section className="flex flex-col gap-4 rounded-[32px] bg-[#F8F9FB] p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.1)]">
						<div className="flex items-center justify-between">
							<h2 className="text-[24px] font-semibold text-[#1F2937]">
								Datos importados
							</h2>
							<div className="flex flex-wrap gap-3">
								<Boton
									type="button"
									onClick={quitarRegistro}
									className="!mx-0 !bg-[#F3F4F6] !text-[#111827] !px-5 !h-[40px]"
								>
									− Quitar
								</Boton>
								<Boton
									type="button"
									onClick={() => inputArchivoRef.current?.click()}
									className="!mx-0 !bg-white !text-[#0982C8] !px-5 !h-[40px]"
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
						<h3 className="text-[20px] font-semibold text-[#1F2937]">
							Cargar datos manualmente
						</h3>
						<FormularioManual valores={manualValues} onChange={handleManualChange} />
						<div className="flex justify-end">
							<Boton
								type="button"
								onClick={agregarRegistroManual}
								className="!mx-0 !bg-white !text-[#111827] !px-6 !h-[44px] shadow-[0px_2px_6px_rgba(0,0,0,0.15)]"
							>
								+ Agregar
							</Boton>
						</div>
					</section>

					{error ? (
						<p className="text-[15px] text-red-500">{error}</p>
					) : null}
					{mensaje ? (
						<p className="text-[15px] text-emerald-600">{mensaje}</p>
					) : null}

					<section className="flex flex-col gap-3 rounded-[32px] bg-white p-6 shadow-[0px_8px_16px_rgba(0,0,0,0.15)]">
						<p className="text-[18px] font-semibold text-[#4B4B4B]">Resumen</p>
						<div className="flex flex-wrap gap-6 text-[16px] text-[#6B7280]">
							<span>
								Total de registros:{" "}
								<strong className="text-[#111827]">{registros.length}</strong>
							</span>
							<span>
								Último dato agregado:{" "}
								<strong className="text-[#111827]">
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
							className="!mx-0 !bg-[#E5E7EB] !text-[#374151] !px-9 !h-[48px]"
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
