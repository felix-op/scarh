import BotonVariante, { type ButtonVariant } from "@componentes/botones/BotonVariante";

export type FiltroAccion = {
	key: string;
	label: string;
	icon: string;
	variant: ButtonVariant;
	onClick: () => void;
	disabled?: boolean;
	loading?: boolean;
	className?: string;
};

type FiltrosAccionesProps = {
	acciones: FiltroAccion[];
	className?: string;
};

export default function FiltrosAcciones({
	acciones,
	className = "",
}: FiltrosAccionesProps) {
	return (
		<div className={`flex flex-wrap items-center justify-end gap-3 ${className}`}>
			{acciones.map((accion) => (
				<BotonVariante
					key={accion.key}
					type="button"
					onClick={accion.onClick}
					disabled={accion.disabled}
					loading={accion.loading}
					variant={accion.variant}
					className={accion.className ?? "text-[14px]"}
				>
					<span className={`text-2xl ${accion.loading ? "icon-[line-md--loading-twotone-loop]" : accion.icon}`} />
					<span>{accion.label}</span>
				</BotonVariante>
			))}
		</div>
	);
}
