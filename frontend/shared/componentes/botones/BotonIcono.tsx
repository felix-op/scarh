import { MouseEventHandler } from "react";

type BotonIconoProps = {
    icono: string,
    className?: string,
	onClick?: MouseEventHandler,
};

export default function BotonIcono({
	icono,
	className = "",
	onClick
}: BotonIconoProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`cursor-pointer active:hover:scale-90 active:brightness-110 border-b-4 border-transparent ${className}`}
		>
			<span className={`text-3xl ${icono}`} />
		</button>
	);
}