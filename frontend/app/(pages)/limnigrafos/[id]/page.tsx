"use client";

import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import SeccionInfo from "@componentes/secciones/SeccionInfo";
import SeccionInfoHeader from "@componentes/secciones/SeccionInfoHeader";
import { useParams, useRouter } from "next/navigation";
import LimnigrafoMenu from "../componentes/LimnigrafoMenu";
import { useGetLimnigrafo } from "@servicios/api/limnigrafos";
import { useMemo, useState } from "react";
import normalizarString from "@lib/normalizarString";
import { opcionesTipoComunicacion } from "../constantes";
import { valuesToLabels } from "@lib/valuesToLabels";
import { memoriaLegible } from "@lib/memoriaLegible";
import { hmsLegibles } from "@lib/hmsLegibles";
import { normalizarFechaAFormatoLatino } from "@lib/normalizarFechaAFormatoLatino";
import Tabs from "@componentes/tabs/Tabs";
import CargandoDatos from "@componentes/animaciones/CargandoDatos";
import MensajeError from "@componentes/mensajes/MensajeError";
import DetallesLimnigrafo from "../componentes/DetallesLimnigrafo";
import ImportarDatos from "app/(pages)/componentes/ImportarDatos";
import { useTieneRol } from "@hooks/useTieneRol";
import Alerta from "@componentes/alertas/Alerta";

export default function DetalleLimnigrafo() {
	const esAdministrador = useTieneRol("administracion");
	const esEditor = useTieneRol("limnigrafos-editar");
	const puedeEditarMediciones = useTieneRol("mediciones-editar");
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const limnigrafoID = params?.id || "";
	const { data: limnigrafo, isFetching: isLoadingLimnigrafo, isError: isErrorLimnigrafo, refetch } = useGetLimnigrafo({
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
		const memoria = memoriaLegible(limnigrafo?.memoria);
		const tipo_comunicacion = valuesToLabels(
			limnigrafo?.tipo_comunicacion,
			opcionesTipoComunicacion,
		);
		const estado = normalizarString(limnigrafo?.estado);
		const ultimo_mantenimiento = normalizarFechaAFormatoLatino(
			limnigrafo?.ultimo_mantenimiento,
		);
		const tiempo_advertencia = hmsLegibles(limnigrafo?.tiempo_advertencia);
		const tiempo_peligro = hmsLegibles(limnigrafo?.tiempo_peligro);
		const ultima_conexion = normalizarString(limnigrafo?.ultima_conexion);
		const ultima_medicion = normalizarString(limnigrafo?.ultima_medicion);
		const bateria =
			limnigrafo?.bateria != null ? `${limnigrafo.bateria}v` : "-";
		const bateria_min =
			limnigrafo?.bateria_min != null
				? `${limnigrafo.bateria_min}v`
				: "-";
		const bateria_max =
			limnigrafo?.bateria_max != null
				? `${limnigrafo.bateria_max}v`
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

	const handleEditar = () => {
		router.push(`/limnigrafos/editar/${limnigrafoID}`);
	};

	const [tab, setTab] = useState(1);
	const handleChange = (t: number) => setTab(t);
	const opciones = [
		{ label: "Detalles", value: 1 },
		{ label: "Importar Datos", value: 2 },
	];

	return (
		<PaginaBase>
			<BotonVariante variant="volver" onClick={handleVolver} />
			{!(esAdministrador || esEditor) && (
				<div className="my-4">
					<Alerta variant="alerta">
						<p>No tenés permisos para editar o eliminar el limnígrafo. Contactá a un administrador si necesitás acceso.</p>
					</Alerta>
				</div>
			)}
			{(puedeEditarMediciones) && (
				<Tabs tab={tab} handleChange={handleChange} options={opciones} />
			)}
			<br />
			{tab === 1 && (
				<SeccionInfo>
					<SeccionInfoHeader>
						{(esAdministrador || esEditor) && (
							<BotonVariante variant="editar" onClick={handleEditar} />
						)}
						<LimnigrafoMenu />
					</SeccionInfoHeader>
					{isLoadingLimnigrafo ? (
						<CargandoDatos />
					) : isErrorLimnigrafo ? (
						<MensajeError titulo="Error" handleReintentar={() => refetch()}>
							No se pudo obtener los datos del limnígrafo. Inténtelo de
							nuevo más tarde.
						</MensajeError>
					) : (
						<DetallesLimnigrafo
							datosGenerales={datosGenerales}
							mantenimiento={mantenimiento}
							especificacionesTecnicas={especificacionesTecnicas}
							estadoActual={estadoActual}
						/>
					)}
				</SeccionInfo>
			)}
			{tab === 2 && (
				<ImportarDatos />
			)}
			<br />
		</PaginaBase>
	);
}
