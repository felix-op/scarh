"use client";

import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import SeccionInfo from "@componentes/secciones/SeccionInfo";
import SeccionInfoGroup from "@componentes/secciones/SeccionInfoGroup";
import SeccionInfoHeader from "@componentes/secciones/SeccionInfoHeader";
import { useParams, useRouter } from "next/navigation";
import LimnigrafoMenu from "../componentes/LimnigrafoMenu";
import { useGetLimnigrafo } from "@servicios/api/limnigrafos";
import { useMemo } from "react";
import normalizarString from "@lib/normalizarString";
import SeccionInfoData from "@componentes/secciones/SeccionInfoData";
import { opcionesTipoComunicacion } from "../constantes";
import { valuesToLabels } from "@lib/valuesToLabels";

export default function DetalleLimnigrafo() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const limnigrafoID = params?.id || "";
	const { data: limnigrafo } = useGetLimnigrafo({
		params: { id: limnigrafoID },
		configuracion: {
			enabled: !!limnigrafoID,
		},
	});

	const {
		datosGenerales,
		mantenimiento,
		especificacionesTecnicas,
		estadoActual,
	} = useMemo(() => {
		const codigo = normalizarString(limnigrafo?.codigo);
		const descripcion = normalizarString(limnigrafo?.descripcion);
		const memoria = limnigrafo?.memoria
			? `${limnigrafo.memoria} bytes`
			: "-";
		const tipo_comunicacion = valuesToLabels(
			limnigrafo?.tipo_comunicacion,
			opcionesTipoComunicacion,
		);
		const estado = normalizarString(limnigrafo?.estado);
		const ultimo_mantenimiento = normalizarString(
			limnigrafo?.ultimo_mantenimiento,
		);
		const tiempo_advertencia = normalizarString(
			limnigrafo?.tiempo_advertencia,
		);
		const tiempo_peligro = normalizarString(limnigrafo?.tiempo_peligro);
		const ultima_conexion = normalizarString(limnigrafo?.ultima_conexion);
		const ultima_medicion = normalizarString(limnigrafo?.ultima_medicion);
		const bateria =
			limnigrafo?.bateria != null ? `${limnigrafo.bateria}%` : "-";
		const bateria_min =
			limnigrafo?.bateria_min != null
				? `${limnigrafo.bateria_min}%`
				: "-";
		const bateria_max =
			limnigrafo?.bateria_max != null
				? `${limnigrafo.bateria_max}%`
				: "-";
		const ubicacion = limnigrafo?.ubicacion
			? limnigrafo.ubicacion.nombre
			: "-";

		return {
			datosGenerales: [
				{ label: "Identificador:", value: codigo },
				{ label: "Descripción:", value: descripcion },
				{ label: "Ubicación:", value: ubicacion },
			],
			mantenimiento: [
				{ label: "Último mantenimiento:", value: ultimo_mantenimiento },
				{
					label: "Tiempo máximo antes de advertencias:",
					value: tiempo_advertencia,
				},
				{
					label: "Tiempo máximo antes de peligro:",
					value: tiempo_peligro,
				},
			],
			especificacionesTecnicas: [
				{ label: "Memoria total:", value: memoria },
				{ label: "Tipo de comunicación:", value: tipo_comunicacion },
				{ label: "Batería mínima:", value: bateria_min },
				{ label: "Batería máxima:", value: bateria_max },
			],
			estadoActual: [
				{ label: "Estado:", value: estado },
				{ label: "Última conexión:", value: ultima_conexion },
				{ label: "Última medición:", value: ultima_medicion },
				{ label: "Batería actual:", value: bateria },
			],
		};
	}, [limnigrafo]);

	const handleVolver = () => {
		router.push("/limnigrafos");
	};

	return (
		<PaginaBase>
			<BotonVariante variant="volver" onClick={handleVolver} />
			<br />
			<SeccionInfo>
				<SeccionInfoHeader>
					<BotonVariante variant="editar" />
					<LimnigrafoMenu />
				</SeccionInfoHeader>
				<div className="grid lg:grid-cols-2 gap-4">
					<SeccionInfoGroup>
						<h2 className="text-center">Detalles del Limnígrafo</h2>
						<hr />
						{datosGenerales.map((item) => (
							<SeccionInfoData
								key={item.label}
								label={item.label}
								dir="column"
							>
								{item.value}
							</SeccionInfoData>
						))}
					</SeccionInfoGroup>

					<SeccionInfoGroup>
						<h2 className="text-center">Mantenimiento</h2>
						<hr />
						{mantenimiento.map((item) => (
							<SeccionInfoData
								key={item.label}
								label={item.label}
								dir="column"
							>
								{item.value}
							</SeccionInfoData>
						))}
					</SeccionInfoGroup>

					<SeccionInfoGroup>
						<h2 className="text-center">
							Especificaciones técnicas
						</h2>
						<hr />
						{especificacionesTecnicas.map((item) => (
							<SeccionInfoData
								key={item.label}
								label={item.label}
								dir="column"
							>
								{item.value}
							</SeccionInfoData>
						))}
					</SeccionInfoGroup>

					<SeccionInfoGroup>
						<h2 className="text-center">Estado actual</h2>
						<hr />
						{estadoActual.map((item) => (
							<SeccionInfoData
								key={item.label}
								label={item.label}
								dir="column"
							>
								{item.value}
							</SeccionInfoData>
						))}
					</SeccionInfoGroup>
				</div>
			</SeccionInfo>
		</PaginaBase>
	);
}
