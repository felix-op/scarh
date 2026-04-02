import SeccionInfoGroup from "@componentes/secciones/SeccionInfoGroup";
import SeccionInfoData from "@componentes/secciones/SeccionInfoData";

type DatoLimnigrafo = {
	label: string;
	value: string;
};

type DetallesLimnigrafoProps = {
	datosGenerales: DatoLimnigrafo[];
	mantenimiento: DatoLimnigrafo[];
	especificacionesTecnicas: DatoLimnigrafo[];
	estadoActual: DatoLimnigrafo[];
};

export default function DetallesLimnigrafo({
	datosGenerales,
	mantenimiento,
	especificacionesTecnicas,
	estadoActual,
}: DetallesLimnigrafoProps) {
	return (
		<div className="grid lg:grid-cols-2 gap-4">
			<SeccionInfoGroup>
				<h2 className="text-center">Detalles del Limnígrafo</h2>
				<hr />
				{datosGenerales.map((item) => (
					<SeccionInfoData key={item.label} label={item.label} dir="column">
						{item.value}
					</SeccionInfoData>
				))}
			</SeccionInfoGroup>

			<SeccionInfoGroup>
				<h2 className="text-center">Mantenimiento</h2>
				<hr />
				{mantenimiento.map((item) => (
					<SeccionInfoData key={item.label} label={item.label} dir="column">
						{item.value}
					</SeccionInfoData>
				))}
			</SeccionInfoGroup>

			<SeccionInfoGroup>
				<h2 className="text-center">Especificaciones técnicas</h2>
				<hr />
				{especificacionesTecnicas.map((item) => (
					<SeccionInfoData key={item.label} label={item.label} dir="column">
						{item.value}
					</SeccionInfoData>
				))}
			</SeccionInfoGroup>

			<SeccionInfoGroup>
				<h2 className="text-center">Estado actual</h2>
				<hr />
				{estadoActual.map((item) => (
					<SeccionInfoData key={item.label} label={item.label} dir="column">
						{item.value}
					</SeccionInfoData>
				))}
			</SeccionInfoGroup>
		</div>
	);
}
