import { MouseEventHandler } from "react";
import BotonIcono from "./BotonIcono";

type BotonIconoEliminarProps = {
    onClick?: MouseEventHandler,
	className?: string
};

export default function BotonIconoEliminar({
	onClick,
	className
}: BotonIconoEliminarProps) {
	return (
		<BotonIcono
			icono="icon-[line-md--trash]"
			className={`text-error hover:border-error ${className}`}
			onClick={onClick}
		/>
	);
}