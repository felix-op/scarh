import { MouseEventHandler } from "react";
import BotonIcono from "./BotonIcono";

type BotonIconoEditarProps = {
    onClick?: MouseEventHandler,
	className?: string
};

export default function BotonIconoEditar({
	onClick,
	className = "",
}: BotonIconoEditarProps) {
	return (
		<BotonIcono
			icono="icon-[tabler--edit]"
			className={`text-exito hover:border-exito ${className}`}
			onClick={onClick}
		/>
	);
}