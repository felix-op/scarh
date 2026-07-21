"use client";

import { useState } from "react";
import { Boton } from "../ui/botones";
import { IconifyIcon } from "../ui/iconify-icon";
import { VentanaConfirmar } from "../ui/modals";
import { RutaAccesoCard } from "./ruta-acceso-card";
import { VentanaCargarRuta } from "./ventana-cargar-ruta";
import { useGetRutasAcceso, useDeleteRutaAcceso } from "@hooks";
import { useMensajes } from "@services";
import type { RutaAccesoResponse } from "@models";

export interface RutasAccesoLimnigrafoProps {
  limnigrafoId: number;
  puedeEditar: boolean;
}

export function RutasAccesoLimnigrafo({ limnigrafoId, puedeEditar }: RutasAccesoLimnigrafoProps) {
  const mensajes = useMensajes();
  const { data, isPending } = useGetRutasAcceso(limnigrafoId);
  const { mutate: eliminarRuta, isPending: eliminando } = useDeleteRutaAcceso(limnigrafoId);

  const [cargarOpen, setCargarOpen] = useState(false);
  const [rutaEditar, setRutaEditar] = useState<RutaAccesoResponse | null>(null);
  const [rutaEliminar, setRutaEliminar] = useState<RutaAccesoResponse | null>(null);

  const rutas = data?.results || [];

  const abrirCrear = () => {
    setRutaEditar(null);
    setCargarOpen(true);
  };

  const abrirEditar = (ruta: RutaAccesoResponse) => {
    setRutaEditar(ruta);
    setCargarOpen(true);
  };

  const confirmarEliminar = () => {
    if (!rutaEliminar) return;
    eliminarRuta(rutaEliminar.id, {
      onSuccess: () => {
        mensajes.success("Ruta eliminada", `La ruta ${rutaEliminar.nombre} se eliminó correctamente.`);
        setRutaEliminar(null);
      },
      onError: (error: Error) => {
        mensajes.error("Error al eliminar la ruta", error.message || "No se pudo eliminar la ruta de acceso");
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground-title">Rutas de acceso</h2>
        {puedeEditar && (
          <Boton content="Cargar ruta" variant="primary" icon="importar" onClick={abrirCrear} />
        )}
      </div>

      {isPending ? (
        <p className="text-sm text-foreground-secondary">Cargando rutas…</p>
      ) : rutas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-shape-md border border-dashed border-border p-6 text-center">
          <IconifyIcon variant="mapa" className="text-2xl text-foreground-disabled" />
          <p className="text-sm text-foreground-secondary">No hay rutas de acceso cargadas para este limnígrafo.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rutas.map((ruta) => (
            <RutaAccesoCard
              key={ruta.id}
              ruta={ruta}
              puedeEditar={puedeEditar}
              onEditar={abrirEditar}
              onEliminar={setRutaEliminar}
            />
          ))}
        </div>
      )}

      <VentanaCargarRuta
        open={cargarOpen}
        onClose={() => setCargarOpen(false)}
        limnigrafoId={limnigrafoId}
        ruta={rutaEditar}
      />

      <VentanaConfirmar
        open={!!rutaEliminar}
        onClose={() => setRutaEliminar(null)}
        onConfirm={confirmarEliminar}
        variant="eliminar"
        title="Eliminar ruta de acceso"
        description={rutaEliminar ? `¿Seguro que deseas eliminar la ruta ${rutaEliminar.nombre}?` : ""}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isLoading={eliminando}
      />
    </div>
  );
}

export default RutasAccesoLimnigrafo;
