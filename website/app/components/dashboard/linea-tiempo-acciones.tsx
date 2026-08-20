import Link from "next/link";
import { Card } from "../ui/cards";
import { IconifyIcon, type IconVariants } from "../ui/iconify-icon";
import { formatFechaHora } from "@utils";
import type { DashboardAccion } from "@models";

/**
 * Actividad reciente del sistema, como línea de tiempo.
 *
 * Muestra el resumen de cada acción —quién, qué tipo, sobre qué entidad y con qué
 * resultado— sin la descripción detallada. El detalle vive en `/historial/`, que
 * exige el rol `historial-visualizar`; incluirlo acá convertiría al tablero, que no
 * pide roles, en una vía para leer el historial completo sin permiso.
 *
 * @property {DashboardAccion[]} acciones Acciones, más recientes primero.
 */
export interface LineaTiempoAccionesProps {
  acciones: DashboardAccion[];
  className?: string;
}

/** Ícono por tipo de acción, para reconocer el evento sin leer el texto. */
const ICONO_POR_TIPO: Record<string, IconVariants> = {
  created: "agregar",
  modified: "editar",
  deleted: "eliminar",
  manual_data_load: "guardar",
  import_data_load: "importar",
};

/** Color del punto según el resultado. Los tres son estados, no identidades. */
const COLOR_POR_ESTADO: Record<string, string> = {
  success: "text-success",
  failed: "text-error",
  review: "text-warn",
};

export function LineaTiempoAcciones({ acciones, className = "" }: LineaTiempoAccionesProps) {
  return (
    <Card className={`flex h-full min-h-0 flex-col gap-4 p-4 ${className}`.trim()}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground-title">Actividad reciente</h2>
        <Link
          href="/dashboard/admin/historial"
          className="text-xs font-medium text-primary no-underline hover:underline"
        >
          Ver historial
        </Link>
      </div>

      {acciones.length === 0 ? (
        <p className="text-sm text-foreground-disabled">Todavía no hay actividad registrada.</p>
      ) : (
        <ol className="flex min-h-0 flex-col overflow-y-auto">
          {acciones.map((accion, indice) => (
            <li key={accion.id} className="flex gap-3">
              {/* Riel de la línea de tiempo: el punto marca el evento y la línea lo
                  conecta con el siguiente. El último no lleva línea. */}
              <div className="flex flex-col items-center">
                <IconifyIcon
                  variant="circle"
                  className={`text-[8px] ${COLOR_POR_ESTADO[accion.estado] ?? "text-foreground-disabled"}`}
                />
                {indice < acciones.length - 1 && <div className="w-px flex-1 bg-border" />}
              </div>

              <div className="flex flex-1 flex-col gap-0.5 pb-4">
                <div className="flex items-center gap-1.5">
                  <IconifyIcon
                    variant={ICONO_POR_TIPO[accion.tipo_accion] ?? "documento"}
                    className="text-sm text-foreground-secondary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {accion.tipo_accion_label}
                  </span>
                  <span className="text-sm text-foreground-secondary">· {accion.entidad}</span>
                </div>

                <span className="text-xs text-foreground-secondary">
                  {accion.usuario ? (
                    <Link
                      href={`/dashboard/admin/usuarios?buscar=${encodeURIComponent(accion.usuario.username)}`}
                      className="text-primary no-underline hover:underline"
                    >
                      {accion.usuario.username}
                    </Link>
                  ) : (
                    "Sistema"
                  )}
                  {" · "}
                  {formatFechaHora(accion.fecha_hora)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
