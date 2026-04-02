const iconVariants = {
	none: "",
	user1: "icon-[qlementine-icons--user-16]",
	rightArrow: "icon-[material-symbols--chevron-right]",
	newNotification: "icon-[mingcute--notification-newdot-fill]",
	mapa: "icon-[carbon--map]",
	chip: "icon-[mdi--chip]",
	documento: "icon-[basil--document-outline]",
	funcion: "icon-[hugeicons--function-circle]",
	historial: "icon-[material-symbols--history]",
	regla: "icon-[raphael--ruler]",
	menu_izquierda: "icon-[stash--burger-arrow-left]",
	menu_derecha: "icon-[stash--burger-arrow-right]",
	documentacion: "icon-[fluent--document-code-16-regular]",
	luna: "icon-[solar--moon-broken]",
	sol: "icon-[solar--sun-broken]",
	dashboard: "icon-[mingcute--dashboard-line]",
	editar: "icon-[tabler--edit]",
	eliminar: "icon-[line-md--trash]",
	alerta: "icon-[mingcute--alert-line]",
	file: "icon-[pepicons-pop--file]",
};

export type IconVariants = keyof typeof iconVariants;

type IconProps = {
	className?: string;
	variant?: IconVariants;
};

export default function Icon({ className = "", variant = "none" }: IconProps) {


	return (
		<span className={`${className} ${iconVariants[variant]}`} />
	);
}
