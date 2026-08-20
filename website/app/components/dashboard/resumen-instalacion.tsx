import { Card } from "../ui/cards";
import { IconifyIcon, type IconVariants } from "../ui/iconify-icon";
import { InfoTooltip } from "../ui/info-tooltip";
import { GraficoCirculo } from "../graficos/grafico.circulo";
import { colorDeSerie, opcionesFuenteMedicion } from "@utils";
import type { DashboardResumen, FuenteMedicion } from "@models";

/**
 * Tira de totales de la instalación, arriba del tablero.
 *
 * Los dos totales van como tarjeta de dato y no como gráfico: cada uno es un solo
 * número, y dibujarlo no agrega nada que el número no diga. El reparto por origen
 * sí es un gráfico, porque ahí lo que importa es la proporción entre partes.
 *
 * @property {DashboardResumen} resumen Totales que devuelve el endpoint del tablero.
 * @property {number} enLinea Dispositivos que están reportando ahora.
 */
export interface ResumenInstalacionProps {
  resumen: DashboardResumen;
  enLinea: number;
}

function obtenerSegmentos(resumen: DashboardResumen) {
  // Cada fuente conserva su color aunque alguna quede en cero: el color sigue a la
  // categoría, no a su posición entre las que tienen datos.
  return (Object.keys(resumen.mediciones_por_carga) as FuenteMedicion[]).map(
    (fuente, indice) => ({
      clave: fuente,
      etiqueta: opcionesFuenteMedicion.find((opcion) => opcion.value === fuente)?.label ?? fuente,
      valor: resumen.mediciones_por_carga[fuente],
      color: colorDeSerie(indice),
    })
  );

}

export function ResumenDispositivos({ resumen, enLinea, className = "" }: ResumenInstalacionProps & { className?: string }) {
  return (
    <TarjetaDato
      icono="chip"
      etiqueta="Dispositivos"
      valor={String(resumen.cant_dispositivos)}
      detalle={`${enLinea} en línea`}
      alerta={enLinea < resumen.cant_dispositivos}
      className={className}
    />
  );
}

export function ResumenMediciones({ resumen, className = "" }: Pick<ResumenInstalacionProps, "resumen"> & { className?: string }) {
  return (
    <TarjetaDato
      icono="database"
      etiqueta="Mediciones"
      valor={resumen.total_mediciones_24hs.toLocaleString("es-AR")}
      detalle="recibidas en las últimas 24 h"
      className={className}
    />
  );
}

export function ResumenOrigenCargas({ resumen, className = "" }: Pick<ResumenInstalacionProps, "resumen"> & { className?: string }) {
  const segmentos = obtenerSegmentos(resumen);

  return (
    <Card className={`flex flex-col gap-2 p-4 ${className}`.trim()}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground-secondary">Origen de las cargas</span>
        <InfoTooltip content="Cómo entraron al sistema todas las mediciones registradas hasta hoy." />
      </div>
      <GraficoCirculo segmentos={segmentos} etiquetaCentro="mediciones" />
    </Card>
  );
}

export function ResumenInstalacion({ resumen, enLinea }: ResumenInstalacionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {/*
        En pantalla ancha los dos totales se apilan en una columna y el reparto se
        queda con dos: la dona necesita más alto que una tarjeta de un número, y
        puestos en tres columnas iguales los totales quedaban estirados con un
        vacío enorme debajo del número.

        `contents` hace que en móvil y tablet este contenedor no exista para la
        grilla y las tarjetas sigan siendo hijas directas, que es donde ya se veían
        bien.
      */}
      <div className="contents xl:flex xl:flex-col xl:gap-4">
        <ResumenDispositivos resumen={resumen} enLinea={enLinea} className="xl:flex-1" />
        <ResumenMediciones resumen={resumen} className="xl:flex-1" />
      </div>
      <ResumenOrigenCargas resumen={resumen} className="sm:col-span-2" />
    </div>
  );
}

function TarjetaDato({
  icono,
  etiqueta,
  valor,
  detalle,
  alerta = false,
  className = "",
}: {
  icono: IconVariants;
  etiqueta: string;
  valor: string;
  detalle: string;
  alerta?: boolean;
  className?: string;
}) {
  return (
    <Card className={`grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2 p-4 ${className}`.trim()}>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-shape-md bg-primary-light/20">
        <IconifyIcon variant={icono} className="text-2xl text-primary" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold tabular-nums text-foreground-title">{valor}</span>
        <span className="text-sm text-foreground-secondary">{etiqueta}</span>
      </div>
      <span className={`col-span-2 text-xs ${alerta ? "text-warn" : "text-foreground-secondary"}`}>
        {detalle}
      </span>
    </Card>
  );
}
