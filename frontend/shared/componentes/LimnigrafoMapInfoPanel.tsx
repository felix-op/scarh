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
		<div className="absolute left-4 bottom-4 z-[1001] w-[320px]">
			<div className="rounded-2xl bg-white dark:bg-[#1B1F25] shadow-[0px_8px_24px_rgba(0,0,0,0.2)] dark:shadow-[0px_8px_24px_rgba(0,0,0,0.5)] border border-border/30">
				<header className="relative px-4 pb-2 pt-3 text-center">
					<h3 className="text-base font-semibold text-foreground-title">
						Datos del {limnigrafo.nombre}
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
						aria-label="Cerrar panel"
					>
						✕
					</button>
				</header>

				<div className="px-3">
					<div className="grid grid-cols-2 border-b border-border px-3 py-1.5 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
						<span>Elemento</span>
						<span>Dato</span>
					</div>
					{infoRows.map((row) => (
						<div
							key={row.label}
							className="grid grid-cols-2 items-center gap-2 border-b border-dashed border-border/60 px-3 py-1.5 text-center text-sm font-semibold text-foreground"
						>
							<span className="text-muted-foreground font-medium">{row.label}</span>
							<span>{row.value}</span>
						</div>
					))}
					<div className="grid grid-cols-2 items-center gap-2 px-3 py-2 text-center overflow-hidden">
						<span className="text-sm font-medium text-muted-foreground">
							Estado
						</span>
						<div className="scale-[0.65] origin-center">
							<BotonEstadoLimnigrafo estado={limnigrafo.estado} />
						</div>
					</div>
				</div>

				<div className="flex items-center justify-center px-4 py-3">
					<button
						type="button"
						onClick={() =>
							router.push(
								`/limnigrafos/detalleLimnigrafo?id=${encodeURIComponent(
									limnigrafo.id,
								)}`,
							)
						}
						className="w-full rounded-xl bg-default-claro dark:bg-[#2a2e36] px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm hover:bg-hover dark:hover:bg-[#363a44] transition-colors"
					>
						Ver más
					</button>
				</div>
			</div>
		</div>
	);
}

