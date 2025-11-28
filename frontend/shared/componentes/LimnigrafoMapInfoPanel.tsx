"use client";

import { useRouter } from "next/navigation";
import type { LimnigrafoDetalleData } from "@data/limnigrafos";
import { BotonEstadoLimnigrafo } from "./BotonEstadoLimnigrafo";

type LimnigrafoMapInfoPanelProps = {
	limnigrafo: LimnigrafoDetalleData | null;
	onClose?: () => void;
};

export function LimnigrafoMapInfoPanel({
	limnigrafo,
	onClose,
}: LimnigrafoMapInfoPanelProps) {
	const router = useRouter();

	if (!limnigrafo) {
		return null;
	}

	const infoRows = [
		{ label: "Id", value: limnigrafo.id },
		{ label: "Ubicación", value: limnigrafo.ubicacion },
		{ label: "Altura", value: limnigrafo.altura },
		{ label: "Batería", value: limnigrafo.bateria },
		{ label: "Presión", value: limnigrafo.presion },
		{ label: "Temperatura", value: limnigrafo.temperatura },
	];

	return (
		<div className="absolute right-6 top-6 z-[1000] max-w-[420px]">
			<div className="rounded-[32px] bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.25)]">
				<header className="relative px-6 pb-4 pt-5 text-center">
					<h3 className="text-[26px] font-semibold text-[#032C44]">
						Datos del {limnigrafo.nombre}
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="absolute right-4 top-4 text-[#6B6B6B]"
						aria-label="Cerrar panel"
					>
						✕
					</button>
				</header>

				<div className="px-4">
					<div className="grid grid-cols-2 border-b border-[#D8D8D8] px-4 py-2 text-center text-xs font-medium text-[#8E8E8E]">
						<span>Elemento</span>
						<span>Dato</span>
					</div>
					{infoRows.map((row) => (
						<div
							key={row.label}
							className="grid grid-cols-2 items-center gap-4 border-b border-dashed border-[#D8D8D8] px-4 py-2 text-center text-lg font-semibold text-[#4B4B4B]"
						>
							<span>{row.label}</span>
							<span>{row.value}</span>
						</div>
					))}
					<div className="grid grid-cols-2 items-center gap-4 px-4 py-3 text-center">
						<span className="text-lg font-semibold text-[#4B4B4B]">
							Estado
						</span>
						<BotonEstadoLimnigrafo estado={limnigrafo.estado} />
					</div>
				</div>

				<div className="flex items-center justify-center px-6 py-4">
					<button
						type="button"
						onClick={() =>
							router.push(
								`/limnigrafos/detalleLimnigrafo?id=${encodeURIComponent(
									limnigrafo.id,
								)}`,
							)
						}
						className="w-full rounded-2xl bg-[#F4F4F4] px-6 py-3 text-lg font-medium text-[#898989] shadow-[0px_4px_6px_rgba(0,0,0,0.2)] hover:bg-[#E6E6E6]"
					>
						Ver más
					</button>
				</div>
			</div>
		</div>
	);
}
