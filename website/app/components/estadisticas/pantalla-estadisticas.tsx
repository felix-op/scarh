"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs } from "../ui/tabs";
import { Alert } from "../ui/alerts";
import { Boton } from "../ui/botones";
import type { OpcionLimnigrafo } from "../formularios/multi-select-limnigrafos";
import { FiltrosEstadisticas } from "./filtros-estadisticas";
import { TablaEstadisticas } from "./tabla-estadisticas";
import { SeccionGraficos } from "./seccion-graficos";
import {
  AGRUPACION_METADATA,
  AGRUPACION_POR_DEFECTO,
  ATRIBUTO_POR_DEFECTO,
  VENTANA_POR_DEFECTO,
  VISTAS_ESTADISTICAS,
  construirParamsEstadisticas,
  obtenerRangoVentana,
  validarFiltrosEstadisticas,
  type FiltrosEstadisticasState as TFiltrosEstadisticas,
  type VistaEstadistica,
} from "@utils";
import type { EstadisticaTablaResponse, MedicionSerieResponse } from "@models";

/**
 * Pantalla de estadísticas: tres vistas sobre la misma consulta.
 *
 * Las pestañas están nombradas por el eje de comparación ("Comparar dispositivos",
 * "Resumen por período") en lugar del formato de salida, de modo que el rótulo ya
 * dice cuántos dispositivos admite cada una. El selector de dispositivos se adapta
 * a la vista y no al revés: si la vista dependiera de cuántos sensores hay
 * elegidos, agregar uno haría desaparecer la pantalla que el usuario está mirando.
 *
 * @property {TFiltrosEstadisticas} filtros Filtros vigentes, ya parseados de la URL.
 * @property {OpcionLimnigrafo[]} limnigrafos Limnígrafos disponibles.
 * @property {EstadisticaTablaResponse | null} datos Respuesta del endpoint de tabla, o
 *   `null` si no había selección suficiente para consultarlo.
 * @property {MedicionSerieResponse | null} serie Series temporales, sólo en la vista
 *   de gráficos.
 * @property {string} [errorCarga] Mensaje del backend si la consulta falló.
 */
export interface PantallaEstadisticasProps {
  filtros: TFiltrosEstadisticas;
  limnigrafos: OpcionLimnigrafo[];
  datos: EstadisticaTablaResponse | null;
  serie: MedicionSerieResponse | null;
  errorCarga?: string;
}

export function PantallaEstadisticas({
  filtros,
  limnigrafos,
  datos,
  serie,
  errorCarga,
}: PantallaEstadisticasProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [pendientes, setPendientes] = useState<TFiltrosEstadisticas>(filtros);
  const [aplicados, setAplicados] = useState<TFiltrosEstadisticas>(filtros);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Cuando la navegación trae filtros nuevos (botón atrás, link compartido), el
  // formulario se resincroniza con lo que dice la URL.
  if (JSON.stringify(filtros) !== JSON.stringify(aplicados)) {
    setAplicados(filtros);
    setPendientes(filtros);
    setErrores({});
  }

  const navegar = (siguientes: TFiltrosEstadisticas) => {
    startTransition(() => {
      router.push(`${pathname}?${construirParamsEstadisticas(siguientes).toString()}`);
    });
  };

  const handleAplicar = () => {
    const problemas = validarFiltrosEstadisticas(pendientes);
    setErrores(problemas);
    if (Object.keys(problemas).length === 0) navegar(pendientes);
  };

  const handleRestablecer = () => {
    const rango = obtenerRangoVentana(VENTANA_POR_DEFECTO)!;
    const reset: TFiltrosEstadisticas = {
      vista: filtros.vista,
      atributo: ATRIBUTO_POR_DEFECTO,
      limnigrafos: limnigrafos.map((limnigrafo) => limnigrafo.id),
      ventana: VENTANA_POR_DEFECTO,
      agrupar: AGRUPACION_POR_DEFECTO,
      ...rango,
    };
    setPendientes(reset);
    setErrores({});
    navegar(reset);
  };

  /**
   * Vuelve a ejecutar el Server Component con los mismos filtros.
   *
   * `router.refresh()` y no `location.reload()`: si el error fue transitorio no
   * hace falta descartar el bundle ni el estado del formulario, sólo repetir la
   * consulta.
   */
  const handleReintentar = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  /**
   * Cambiar de pestaña navega de inmediato con los filtros ya aplicados: la vista
   * no es un campo del formulario que haya que confirmar con "Aplicar".
   */
  const handleVista = (vista: string) => {
    const siguientes = { ...aplicados, vista: vista as VistaEstadistica };
    setPendientes(siguientes);
    setErrores({});
    navegar(siguientes);
  };

  // El resumen analiza el primero de la selección. La lista completa se conserva
  // igual en la URL para que volver a las otras pestañas no la pierda.
  const dispositivoActivo =
    filtros.limnigrafos.length > 0
      ? limnigrafos.find((item) => item.id === filtros.limnigrafos[0])?.codigo
      : undefined;

  /**
   * El error ocupa el lugar de la tabla en lugar de sumarse arriba.
   *
   * Casi siempre es el backend rechazando esta combinación de filtros, no una
   * pantalla caída: mostrar además una tabla vacía sugiere que la consulta salió
   * bien y no dio resultados, que es lo contrario de lo que pasó.
   */
  const contenido = () => {
    if (errorCarga) {
      return (
        <div className="flex flex-col gap-4">
          <Alert variant="error" title="No se pudieron calcular las estadísticas">
            {errorCarga}
          </Alert>
          <Boton
            content="Reintentar"
            icon="restablecer"
            className="self-start"
            loading={isPending}
            disabled={isPending}
            onClick={handleReintentar}
          />
        </div>
      );
    }

    if (filtros.vista === "graficos") {
      return serie ? (
        <SeccionGraficos
          datos={serie}
          atributo={filtros.atributo}
          estadisticas={datos?.filas ?? []}
        />
      ) : (
        <Alert variant="alerta" title="Sin dispositivos seleccionados">
          Elegí al menos un limnígrafo para ver sus gráficos.
        </Alert>
      );
    }

    if (filtros.vista === "comparativa") {
      return (
        <TablaEstadisticas
          filas={datos?.filas ?? []}
          total={datos?.total ?? null}
          atributo={filtros.atributo}
          agrupacion="dispositivo"
          isLoading={isPending}
          nombreArchivo={`estadisticas-comparativa-${filtros.atributo}.csv`}
        />
      );
    }

    return (
      <TablaEstadisticas
        filas={datos?.filas ?? []}
        total={datos?.total ?? null}
        atributo={filtros.atributo}
        agrupacion={filtros.agrupar}
        isLoading={isPending}
        nombreArchivo={`estadisticas-resumen-${filtros.atributo}-${filtros.agrupar}.csv`}
        mensajeVacio="Elegí un limnígrafo para ver su resumen por período."
        subtitulo={
          dispositivoActivo
            ? `${AGRUPACION_METADATA[filtros.agrupar].plural} de ${dispositivoActivo}`
            : undefined
        }
      />
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        options={VISTAS_ESTADISTICAS.map(({ value, label }) => ({ value, label }))}
        value={filtros.vista}
        onChange={handleVista}
      />

      <FiltrosEstadisticas
        pendientes={pendientes}
        aplicados={aplicados}
        limnigrafos={limnigrafos}
        errores={errores}
        isPending={isPending}
        onChange={(cambios) => setPendientes((previos) => ({ ...previos, ...cambios }))}
        onAplicar={handleAplicar}
        onRestablecer={handleRestablecer}
      />

      {contenido()}
    </div>
  );
}

