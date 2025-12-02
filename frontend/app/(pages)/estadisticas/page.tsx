"use client";

import PaginaBase from "@componentes/base/PaginaBase";
import ContenedorGrafico from "@componentes/ContenedorGrafico";
import EstadisticaCard from "@componentes/EstadisticaCard";
import { Nav } from "@componentes/Nav";
import { useRouter } from "next/navigation";

const LIMNIGRAFOS = ["Limnígrafo Norte", "Limnígrafo Sur", "Limnígrafo Río"];

const ESTADISTICAS_GENERALES = [
	{ title: "Promedio de nivel", value: "--", detail: "Placeholder" },
	{ title: "Máximo del período", value: "1.80 m", detail: "Valor ficticio" },
	{ title: "Mínimo del período", value: "1.10 m", detail: "Valor ficticio" },
	{ title: "Lluvia acumulada", value: "12.5 mm", detail: "Dato de ejemplo" },
	{ title: "Variación porcentual", value: "N/D", detail: "Placeholder" },
	{
		title: "Cantidad de registros analizados",
		value: "320",
		detail: "Muestra estática",
	},
];

const ESTADISTICAS_AVANZADAS = [
	{ title: "Percentil P90", value: "—", detail: "Placeholder" },
	{ title: "Percentil P95", value: "—", detail: "Placeholder" },
	{ title: "Desviación estándar", value: "N/D", detail: "Sin cálculo" },
	{ title: "Racha máxima del período", value: "--", detail: "Placeholder" },
	{
		title: "Nivel mínimo histórico en rango",
		value: "0.98 m",
		detail: "Dato ficticio",
	},
];

const COMPARACION_FILAS = [
	{ metrica: "Nivel actual", valores: ["1.22 m", "1.15 m", "—"] },
	{ metrica: "Promedio", valores: ["1.30 m", "--", "N/D"] },
	{ metrica: "Máximo", valores: ["1.80 m", "1.60 m", "—"] },
	{ metrica: "Mínimo", valores: ["1.10 m", "1.05 m", "--"] },
	{ metrica: "Lluvia acumulada", valores: ["12.5 mm", "8.0 mm", "N/D"] },
];

export default function EstadisticasPage() {
	const router = useRouter();

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">
				<Nav
					userName="Juan Perez"
					userEmail="juan.perez@scarh.com"
					onProfileClick={() => router.push("/perfil")}
				/>

				<main className="flex flex-1 justify-center px-6 py-10">
					<div className="flex w-full max-w-[1568px] flex-col gap-8">
						<header className="flex flex-col gap-1">
							<h1 className="text-[34px] font-semibold text-[#011018]">
								Estadísticas
							</h1>
							<p className="text-base text-[#4D5562]">
								Analiza tendencias y comparaciones para entender el comportamiento
								historico de los limnigrafos en cada periodo.
							</p>
						</header>

						<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
								<div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
									<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B]">
										Limnígrafo
										<select className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]">
											{LIMNIGRAFOS.map((item) => (
												<option key={item}>{item}</option>
											))}
										</select>
									</label>
									<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B]">
										Fecha desde
										<input
											type="date"
											className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
											value=""
											onChange={() => {}}
										/>
									</label>
									<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B]">
										Fecha hasta
										<input
											type="date"
											className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
											value=""
											onChange={() => {}}
										/>
									</label>
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<button
										type="button"
										className="rounded-xl bg-[#0982C8] px-5 py-3 text-[15px] font-semibold text-white shadow-[0px_4px_10px_rgba(9,130,200,0.35)]"
									>
										Aplicar filtros
									</button>
									<button
										type="button"
										className="rounded-xl border border-[#0982C8] px-5 py-3 text-[15px] font-semibold text-[#0982C8] bg-white shadow-[0px_4px_10px_rgba(9,130,200,0.15)]"
									>
										Exportar datos
									</button>
								</div>
							</div>
						</section>

						<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
										Estadísticas generales
									</p>
									<p className="text-[16px] text-[#6B6B6B]">
										Valores de referencia estáticos para el rango seleccionado.
									</p>
								</div>
								<div className="h-10 w-10 rounded-full bg-[#E6F3FB] shadow-[0px_4px_10px_rgba(0,0,0,0.08)]" />
							</div>

							<div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{ESTADISTICAS_GENERALES.map((item) => (
									<EstadisticaCard
										key={item.title}
										title={item.title}
										value={item.value}
										detail={item.detail}
									/>
								))}
							</div>
						</section>

						<section className="grid gap-6 lg:grid-cols-2">
							<ContenedorGrafico
								title="Gráfico de nivel del agua"
								subtitle="Línea - no implementado"
							/>
							<ContenedorGrafico
								title="Gráfico de caudal"
								subtitle="Área - no implementado"
							/>
							<ContenedorGrafico
								title="Gráfico de precipitación"
								subtitle="Barras - no implementado"
							/>
							<ContenedorGrafico
								title="Gráfico de tendencia"
								subtitle="Línea suavizada - no implementado"
							/>
						</section>

						<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
										Comparaciones entre limnígrafos
									</p>
									<p className="text-[16px] text-[#6B6B6B]">
										Placeholder de comparación multi-sitio.
									</p>
								</div>
								<div className="h-10 w-10 rounded-full bg-[#F5F7FB] shadow-[0px_4px_10px_rgba(0,0,0,0.08)]" />
							</div>

							<div className="mt-4 flex flex-col gap-4">
								<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] md:max-w-sm">
									Seleccionar limnígrafos
									<select
										multiple
										className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									>
										{LIMNIGRAFOS.map((item) => (
											<option key={item}>{item}</option>
										))}
									</select>
								</label>

								<div className="overflow-hidden rounded-2xl border border-[#E1E4E8]">
									<table className="min-w-full text-left text-[14px] text-[#4B4B4B]">
										<thead className="bg-[#F7F9FB] text-[13px] uppercase text-[#6B6B6B]">
											<tr>
												<th className="px-4 py-3">Métrica</th>
												{LIMNIGRAFOS.map((nombre) => (
													<th key={nombre} className="px-4 py-3">
														{nombre}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{COMPARACION_FILAS.map((fila) => (
												<tr key={fila.metrica} className="border-t border-[#EAEAEA]">
													<td className="px-4 py-3 font-semibold text-[#011018]">
														{fila.metrica}
													</td>
													{fila.valores.map((valor, idx) => (
														<td key={`${fila.metrica}-${idx}`} className="px-4 py-3">
															{valor}
														</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<ContenedorGrafico
									title="Comparación entre limnígrafos"
									subtitle="Placeholder de gráfico comparativo"
									heightClass="h-[220px]"
								/>
							</div>
						</section>

						<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
										Estadísticas avanzadas
									</p>
									<p className="text-[16px] text-[#6B6B6B]">
										Placeholder informativo, sin cálculo real.
									</p>
								</div>
								<div className="h-10 w-10 rounded-full bg-[#E9F5FF] shadow-[0px_4px_10px_rgba(0,0,0,0.08)]" />
							</div>

							<div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{ESTADISTICAS_AVANZADAS.map((item) => (
									<EstadisticaCard
										key={item.title}
										title={item.title}
										value={item.value}
										detail={item.detail}
										accent="#9CA3AF"
									/>
								))}
							</div>
						</section>
					</div>
				</main>
			</div>
		</PaginaBase>
	);
}