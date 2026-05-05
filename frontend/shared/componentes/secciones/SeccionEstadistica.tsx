import React from "react";
import SeccionCard from "./SeccionCard";

export interface SeccionEstadisticaProps {
	label: string;
	valor: string | number;
	horaActualizacion: string;
	fechaInicio: string;
	fechaFin: string;
}

export default function SeccionEstadistica({
	label,
	valor,
	horaActualizacion,
	fechaInicio,
	fechaFin
}: SeccionEstadisticaProps) {
	return (
		<SeccionCard className="p-4 shadow-sm flex flex-col justify-between">
			<h3 className="text-lg font-semibold text-foreground">{label}</h3>
			<span className="font-bold my-4 text-principal" style={{ fontSize: 40 }}>{valor}</span>
			<div className="text-sm text-gray-500">
				<p>Actualizado desde las {horaActualizacion} hrs</p>
				<p>Desde {fechaInicio} hasta hoy {fechaFin}</p>
			</div>
		</SeccionCard>
	);
}
