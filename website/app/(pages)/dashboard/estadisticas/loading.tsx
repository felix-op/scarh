import { FiltersPlaceholder, TablePlaceholder } from "@components";
import { VISTAS_ESTADISTICAS } from "@utils";

/**
 * Skeleton de la carga inicial.
 *
 * Uno solo para las tres vistas: comparten pestañas, barra de filtros y una tabla,
 * y al cambiar de pestaña o aplicar filtros la navegación es una transición (la
 * tabla muestra su propio estado de carga), así que este archivo sólo se ve al
 * entrar a la pantalla.
 */
export default function EstadisticasLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Tira de pestañas */}
      <div className="flex gap-2 border-b border-border pb-3 animate-pulse">
        {VISTAS_ESTADISTICAS.map(({ value }) => (
          <div key={value} className="h-6 w-36 rounded-shape-sm bg-background-muted" />
        ))}
      </div>

      <FiltersPlaceholder count={4} />
      <TablePlaceholder rows={6} />
    </div>
  );
}
