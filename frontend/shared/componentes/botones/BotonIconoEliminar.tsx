import { MouseEventHandler } from "react";
import BotonIcono from "./BotonIcono";

type BotonIconoEliminarProps = {
    onClick?: MouseEventHandler,
};

export default function BotonIconoEliminar({
	onClick
}: BotonIconoEliminarProps) {
	return (
		<BotonIcono
			icono="icon-[line-md--trash]"
			className="text-error hover:border-error"
			onClick={onClick}
		/>
	);
}