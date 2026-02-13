import { MouseEventHandler } from "react";
import BotonIcono from "./BotonIcono";

type BotonIconoIrProps = {
    onClick?: MouseEventHandler,
};

export default function BotonIconoIr({
	onClick
}: BotonIconoIrProps) {
	return (
		<BotonIcono
			icono="icon-[oui--arrow-right]"
			className="text-default hover:border-default"
			onClick={onClick}
		/>
	);
}
