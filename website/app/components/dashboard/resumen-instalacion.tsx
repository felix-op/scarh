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

export function ResumenInstalacion({ resumen, enLinea }: ResumenInstalacionProps) {
  // Cada fuente conserva su color aunque alguna quede en cero: el color sigue a la
  // categoría, no a su posición entre las que tienen datos.
  const segmentos = (Object.keys(resumen.mediciones_por_carga) as FuenteMedicion[]).map(
    (fuente, indice) => ({
      clave: fuente,
      etiqueta: opcionesFuenteMedicion.find((opcion) => opcion.value === fuente)?.label ?? fuente,
      valor: resumen.mediciones_por_carga[fuente],
      color: colorDeSerie(indice),
    })
  );

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
        <TarjetaDato
          icono="chip"
          etiqueta="Dispositivos"
          valor={String(resumen.cant_dispositivos)}
          detalle={`${enLinea} en línea`}
          // El estado de la flota es lo primero que se mira: si hay alguno caído, el
          // detalle lo dice sin tener que recorrer las tarjetas de abajo.
          alerta={enLinea < resumen.cant_dispositivos}
          className="xl:flex-1"
        />

        <TarjetaDato
          icono="database"
          etiqueta="Mediciones (24 h)"
          valor={resumen.total_mediciones_24hs.toLocaleString("es-AR")}
          detalle="recibidas en el último día"
          className="xl:flex-1"
        />
      </div>

      <Card className="flex flex-col gap-2 p-4 sm:col-span-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-secondary">Origen de las cargas</span>
          <InfoTooltip content="Cómo entraron al sistema todas las mediciones registradas hasta hoy." />
        </div>

        <GraficoCirculo segmentos={segmentos} etiquetaCentro="mediciones" />
      </Card>
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
    <Card className={`flex items-center gap-4 p-4 ${className}`.trim()}>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-shape-md bg-primary-light/20">
        <IconifyIcon variant={icono} className="text-2xl text-primary" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-foreground-secondary">{etiqueta}</span>
        <span className="text-2xl font-semibold tabular-nums text-foreground-title">{valor}</span>
        <span className={`text-xs ${alerta ? "text-warn" : "text-foreground-secondary"}`}>
          {detalle}
        </span>
      </div>
    </Card>
  );
}
