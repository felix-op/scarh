import { MouseEventHandler } from "react";
import BotonIcono from "./BotonIcono";

type BotonIconoEditarProps = {
    onClick?: MouseEventHandler,
};

export default function BotonIconoEditar({
	onClick
}: BotonIconoEditarProps) {
	return (
		<BotonIcono
			icono="icon-[tabler--edit]"
			className="text-exito hover:border-exito"
			onClick={onClick}
		/>
	);
}