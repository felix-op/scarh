"use client";

import { Card } from "../ui/cards";
import { Select } from "../ui/select";
import { InfoTooltip } from "../ui/info-tooltip";
import { OPCIONES_REFRESCO, useConfiguracionLocal } from "@services";

/**
 * Preferencias de visualización, guardadas en el navegador.
 *
 * Van acá y no en el servidor porque describen **este** dispositivo: el intervalo
 * que tiene sentido en un monitor de sala no es el mismo que en un celular con
 * datos móviles, aunque sea la misma persona.
 */
export function PreferenciasLocales() {
  const { configuracion, guardar } = useConfiguracionLocal();

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground-title">Preferencias</h2>
        <p className="text-sm text-foreground-secondary">
          Se guardan en este navegador, no en tu cuenta: si entrás desde otro equipo
          vuelven a los valores por defecto.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Select
              label="Actualizar el inicio"
              name="refresco"
              options={OPCIONES_REFRESCO}
              value={String(configuracion.refrescoDashboardSegundos)}
              onChange={(valor) => guardar({ refrescoDashboardSegundos: Number(valor) })}
            />
            <InfoTooltip
              className="mt-6"
              content="Cada cuánto la pantalla de inicio vuelve a pedir los datos. Los limnígrafos reportan cada varios minutos, así que intervalos muy cortos repiten la misma información."
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
