"use client";

type EstadoVariant = "activo" | "inactivo" | "pendiente" | "suspendido";

const estadoChipStyles: Record<
	EstadoVariant,
	{ bg: string; dot: string; text: string; label: string }
> = {
	activo: {
		bg: "bg-emerald-50 border-emerald-100",
		dot: "bg-emerald-500",
		text: "text-emerald-800",
		label: "Activo",
	},
	inactivo: {
		bg: "bg-zinc-50 border-zinc-100",
		dot: "bg-zinc-400",
		text: "text-zinc-700",
		label: "Inactivo",
	},
	pendiente: {
		bg: "bg-amber-50 border-amber-100",
		dot: "bg-amber-400",
		text: "text-amber-800",
		label: "Pendiente",
	},
	suspendido: {
		bg: "bg-red-50 border-red-100",
		dot: "bg-red-500",
		text: "text-red-800",
		label: "Suspendido",
	},
};

type EstadoChipProps = {
	variant: EstadoVariant;
	label?: string;
	className?: string;
};

export function EstadoChip({ variant, label, className = "" }: EstadoChipProps) {
	const styles = estadoChipStyles[variant];

	return (
		<span
			className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${styles.bg} ${styles.text} ${className}`}
		>
			<span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
			{label ?? styles.label}
		</span>
	);
}

export type { EstadoVariant };
