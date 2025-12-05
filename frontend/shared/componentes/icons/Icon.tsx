export type IconVariants =
	"none" | "user1" | "rightArrow" | "newNotification" |
	"mapa" | "chip" | "documento" | "funcion" | "regla" |
	"menu_izquierda" | "menu_derecha" | "historial";

type IconProps = {
    className?: string;
    variant?: IconVariants;
};

export default function Icon({ className = "", variant = "none" }: IconProps) {
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
	};

	return (
		<span className={`${className} ${iconVariants[variant]}`}/>
	);
}