import { MouseEventHandler } from "react";
import BotonIcono from "./BotonIcono";

type BotonIconoIrProps = {
    onClick?: MouseEventHandler,
	className?: string,
};

export default function BotonIconoIr({
	onClick,
	className = "",
}: BotonIconoIrProps) {
	return (
		<BotonIcono
			icono="icon-[oui--arrow-right]"
			className={`text-default hover:border-default ${className}`}
			onClick={onClick}
		/>
	);
}
