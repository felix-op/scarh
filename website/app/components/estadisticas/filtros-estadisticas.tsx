"use client";

import { Card } from "../ui/cards";
import { Select } from "../ui/select";
import { DateField } from "../ui/datefield";
import { Chip } from "../ui/chip";
import { Boton } from "../ui/botones";
import { InfoTooltip } from "../ui/info-tooltip";
import { MultiSelectLimnigrafos, type OpcionLimnigrafo } from "../formularios/multi-select-limnigrafos";
import {
  AGRUPACION_METADATA,
  ATRIBUTO_METADATA,
  VENTANAS_ESTADISTICAS,
  aDateDesdeFecha,
  aFechaDesdeDate,
  obtenerRangoVentana,
  opcionesAgrupacionPeriodo,
  opcionesAtributoEstadistica,
  type FiltrosEstadisticasState,
} from "@utils";
import type { AgrupacionEstadistica, AtributoEstadistica } from "@models";

/**
 * Barra de filtros de la pantalla de estadísticas.
 *
 * Es una sola barra para las tres vistas y siempre está en el mismo lugar: lo
 * único que cambia entre pestañas es si el selector de dispositivos admite varios
 * y si aparece la granularidad. Así cambiar de vista no reordena la pantalla.
 *
 * @property {FiltrosEstadisticasState} pendientes Valores editados, todavía sin aplicar.
 * @property {FiltrosEstadisticasState} aplicados Valores vigentes, los que están en la URL.
 * @property {OpcionLimnigrafo[]} limnigrafos Limnígrafos disponibles.
 * @property {Record<string, string>} errores Mensajes de validación por campo.
 * @property {boolean} [isPending] Bloquea todo el formulario mientras se aplica la
 *   consulta. No alcanza con deshabilitar los botones: al aterrizar la navegación,
 *   el formulario se resincroniza con la URL y descartaría lo editado mientras tanto.
 * @property {(cambios: Partial<FiltrosEstadisticasState>) => void} onChange Aplica cambios parciales.
 * @property {() => void} onAplicar Confirma los filtros pendientes.
 * @property {() => void} onRestablecer Vuelve a los valores por defecto.
 */
export interface FiltrosEstadisticasProps {
  pendientes: FiltrosEstadisticasState;
  aplicados: FiltrosEstadisticasState;
  limnigrafos: OpcionLimnigrafo[];
  errores: Record<string, string>;
  isPending?: boolean;
  onChange: (_cambios: Partial<FiltrosEstadisticasState>) => void;
  onAplicar: () => void;
  onRestablecer: () => void;
}

export function FiltrosEstadisticas({
  pendientes,
  aplicados,
  limnigrafos,
  errores,
  isPending = false,
  onChange,
  onAplicar,
  onRestablecer,
}: FiltrosEstadisticasProps) {
  const esResumen = pendientes.vista === "resumen";
  const esRangoPersonalizado = pendientes.ventana === "personalizado";

  const fechasBloqueadas = !esRangoPersonalizado || isPending;

  // Con una ventana rápida las fechas son un resultado, no una entrada: se
  // recalculan solas. El tooltip explica el motivo y cómo desbloquearlas, en lugar
  // de dejar dos campos apagados sin justificación.
  //
  // El bloqueo por `isPending` no lleva tooltip: dura lo que la consulta y su
  // motivo es evidente porque todo el formulario se apaga junto.
  const ayudaFechas = esRangoPersonalizado
    ? undefined
    : 'Las fechas las calcula la ventana de tiempo elegida. Para editarlas a mano, elegí "Rango personalizado" en Ventana de tiempo.';

  const handleVentana = (ventana: string) => {
    const rango = obtenerRangoVentana(ventana);
    onChange(rango ? { ventana, ...rango } : { ventana });
  };

  const handleLimnigrafos = (ids: number[]) => {
    // En resumen el selector es de selección única, pero se conservan los demás
    // IDs elegidos en otras vistas: cambiar de pestaña no debería perder la
    // selección. El elegido pasa al frente porque es el que consulta esa vista.
    if (!esResumen) {
      onChange({ limnigrafos: ids });
      return;
    }

    const [elegido] = ids;
    if (elegido === undefined) {
      onChange({ limnigrafos: [] });
      return;
    }

    onChange({ limnigrafos: [elegido, ...pendientes.limnigrafos.filter((id) => id !== elegido)] });
  };

  const seleccionVisible = esResumen ? pendientes.limnigrafos.slice(0, 1) : pendientes.limnigrafos;

  const codigoDe = (id: number) => limnigrafos.find((item) => item.id === id)?.codigo ?? `ID ${id}`;

  // La `key` es el campo y no el texto: dos chips pueden coincidir en contenido
  // (un limnígrafo llamado igual que una ventana, por ejemplo) y React necesita
  // identidades estables para no confundir nodos al reordenar.
  const chipsActivos: { campo: string; texto: string }[] = [
    {
      campo: "atributo",
      texto: `Variable: ${ATRIBUTO_METADATA[aplicados.atributo].label}`,
    },
    {
      campo: "limnigrafos",
      texto:
        aplicados.limnigrafos.length > 0
          ? `Dispositivos: ${
              aplicados.vista === "resumen"
                ? codigoDe(aplicados.limnigrafos[0])
                : aplicados.limnigrafos.map(codigoDe).join(", ")
            }`
          : "Dispositivos: ninguno",
    },
    {
      campo: "rango",
      texto:
        aplicados.ventana === "personalizado"
          ? `Rango: ${aplicados.desde} a ${aplicados.hasta}`
          : `Ventana: ${VENTANAS_ESTADISTICAS.find((v) => v.value === aplicados.ventana)?.label ?? aplicados.ventana}`,
    },
    ...(aplicados.vista === "resumen"
      ? [{ campo: "agrupar", texto: `Agrupado: ${AGRUPACION_METADATA[aplicados.agrupar].label}` }]
      : []),
  ];

  return (
    <Card className="p-2">
      <div className="flex flex-col gap-4">
        {/*
          Qué se mide y de dónde: son las dos decisiones que el usuario toma
          primero y las que cambian el significado de todo lo demás.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <Select
            label="Variable"
            name="atributo"
            options={opcionesAtributoEstadistica}
            value={pendientes.atributo}
            disabled={isPending}
            onChange={(valor) => onChange({ atributo: valor as AtributoEstadistica })}
          />

          <MultiSelectLimnigrafos
            label={esResumen ? "Dispositivo" : "Dispositivos"}
            opciones={limnigrafos}
            value={seleccionVisible}
            onChange={handleLimnigrafos}
            seleccionUnica={esResumen}
            disabled={isPending}
            error={errores.limnigrafos}
          />
        </div>

        <div className="h-px w-full bg-border" />

        {/* Recorte temporal: ventana o rango, y con qué granularidad se agrupa. */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full ${esResumen ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
          <Select
            label="Ventana de tiempo"
            name="ventana"
            options={VENTANAS_ESTADISTICAS.map(({ value, label }) => ({ value, label }))}
            value={pendientes.ventana}
            disabled={isPending}
            onChange={handleVentana}
          />

          {esResumen && (
            <Select
              label="Agrupar por"
              name="agrupar"
              options={opcionesAgrupacionPeriodo}
              value={pendientes.agrupar}
              disabled={isPending}
              onChange={(valor) => onChange({ agrupar: valor as AgrupacionEstadistica })}
            />
          )}

          <InfoTooltip content={ayudaFechas} className="w-full">
            <DateField
              label="Desde"
              name="desde"
              disabled={fechasBloqueadas}
              value={aDateDesdeFecha(pendientes.desde)}
              onChange={(fecha) => fecha && onChange({ desde: aFechaDesdeDate(fecha) })}
              errors={errores.desde ? [errores.desde] : undefined}
            />
          </InfoTooltip>

          <InfoTooltip content={ayudaFechas} className="w-full">
            <DateField
              label="Hasta"
              name="hasta"
              disabled={fechasBloqueadas}
              value={aDateDesdeFecha(pendientes.hasta)}
              onChange={(fecha) => fecha && onChange({ hasta: aFechaDesdeDate(fecha) })}
              errors={errores.hasta ? [errores.hasta] : undefined}
            />
          </InfoTooltip>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full">
          {chipsActivos.map(({ campo, texto }) => (
            <Chip key={campo} variant="info" size="sm">
              {texto}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 w-full">
          <Boton content="Restablecer" icon="restablecer" onClick={onRestablecer} disabled={isPending} />
          <Boton
            content="Aplicar filtros"
            icon="filtro"
            variant="primary"
            onClick={onAplicar}
            disabled={isPending}
          />
        </div>
      </div>
    </Card>
  );
}
