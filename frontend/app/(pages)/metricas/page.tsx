"use client";

import PaginaBase from "@componentes/base/PaginaBase";
import MetricaCard from "@componentes/MetricaCard";
import { Nav } from "@componentes/Nav";
import { useRouter } from "next/navigation";

function GraphPlaceholder({
	title,
	subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
	return (
		<div className="flex h-[240px] flex-col justify-between rounded-2xl bg-white p-4 shadow-[0px_8px_16px_rgba(0,0,0,0.12)]">
			<div>
				<p className="text-[15px] font-medium uppercase tracking-[0.08em] text-[#6B6B6B]">
					{title}
				</p>
				{subtitle ? (
					<p className="text-[14px] text-[#8A8A8A]">{subtitle}</p>
				) : null}
			</div>
			<div className="h-full rounded-xl border border-dashed border-[#D3D4D5] bg-[#F7F9FB]" />
		</div>
	);
}

const HIDROMETE_METRICAS = [
	{
		title: "Nivel actual del agua",
		value: "1.25 m",
		detail: "Referencia local",
		accent: "#0982C8",
	},
	{
		title: "Variación inmediata",
		value: "±0.00 m",
		detail: "Placeholder",
		accent: "#00A7B5",
	},
	{
		title: "Tendencia",
		value: "Estable",
		detail: "Sin cambios recientes",
		accent: "#F59E0B",
	},
	{
		title: "Caudal estimado",
		value: "No configurado",
		detail: "Pendiente de calibración",
		accent: "#9CA3AF",
	},
	{
		title: "Precipitación",
		value: "Acumulada: 0.0 mm",
		detail: "Intensidad: --",
		accent: "#6366F1",
	},
	{
		title: "Estado de batería",
		value: "Batería 100%",
		detail: "Operativa",
		accent: "#10B981",
	},
	{
		title: "Última transmisión",
		value: "Hace instantes",
		detail: "Sincronizado",
		accent: "#0EA5E9",
	},
];

const METEORO_METRICAS = [
	{
		title: "Temperatura del aire",
		value: "22 °C",
		detail: "Registro puntual",
		accent: "#F97316",
	},
	{
		title: "Humedad relativa",
		value: "60 %",
		detail: "Placeholder",
		accent: "#14B8A6",
	},
	{
		title: "Punto de rocío",
		value: "—",
		detail: "Placeholder",
		accent: "#A855F7",
	},
	{
		title: "Presión atmosférica",
		value: "1013 hPa",
		detail: "Referencia local",
		accent: "#0EA5E9",
	},
];

export default function MetricasPage() {
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
								Métricas
							</h1>
						</header>

						<section className="rounded-[28px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
										Métricas Hidrometeorológicas
									</p>
									<p className="text-[16px] text-[#6B6B6B]">
										Indicadores clave del cuerpo de agua (placeholders).
									</p>
								</div>
								<div className="h-10 w-10 rounded-full bg-[#E6F3FB] shadow-[0px_4px_10px_rgba(0,0,0,0.08)]" />
							</div>

							<div className="mt-6 grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
								{HIDROMETE_METRICAS.map((item) => (
									<MetricaCard
										key={item.title}
										title={item.title}
										value={item.value}
										detail={item.detail}
										accent={item.accent}
									/>
								))}
							</div>
						</section>

						<section className="rounded-[28px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
										Métricas Meteorológicas
									</p>
									<p className="text-[16px] text-[#6B6B6B]">
										Condiciones del entorno, valores de muestra (sin cálculo).
									</p>
								</div>
								<div className="h-10 w-10 rounded-full bg-[#F5F7FB] shadow-[0px_4px_10px_rgba(0,0,0,0.08)]" />
							</div>

							<div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{METEORO_METRICAS.map((item) => (
									<MetricaCard
										key={item.title}
										title={item.title}
										value={item.value}
										detail={item.detail}
										accent={item.accent}
									/>
								))}
							</div>
						</section>

						<section className="rounded-[28px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
										Gráficos de referencia
									</p>
									<p className="text-[16px] text-[#6B6B6B]">
										Placeholder de gráficos lineales / barras.
									</p>
								</div>
								<div className="h-10 w-10 rounded-full bg-[#E9F5FF] shadow-[0px_4px_10px_rgba(0,0,0,0.08)]" />
							</div>

							<div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<GraphPlaceholder
									title="Nivel del agua en el tiempo"
									subtitle="Gráfico placeholder"
								/>
								<GraphPlaceholder
									title="Precipitación"
									subtitle="Acumulada e intensidad"
								/>
								<GraphPlaceholder
									title="Temperatura"
									subtitle="Serie temporal"
								/>
							</div>
						</section>
					</div>
				</main>
			</div>
		</PaginaBase>
	);
}
