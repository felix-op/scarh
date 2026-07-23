"use client";

import { Ventana } from "../ui/modals";
import { Boton, BotonCancelar } from "../ui/botones";
import { TokenConClipboard } from "./token-con-clipboard";
import { useGenerarClaveLimnigrafo } from "@hooks";
import { useMensajes } from "@services";
import type { LimnigrafoResponse } from "@models";

export interface VentanaSolicitarTokenProps {
  open: boolean;
  onClose: () => void;
  limnigrafo: LimnigrafoResponse | null;
}

export function VentanaSolicitarToken({ open, onClose, limnigrafo }: VentanaSolicitarTokenProps) {
  const mensajes = useMensajes();
  const { mutate, data, isPending, isSuccess, isError, reset } = useGenerarClaveLimnigrafo();

  const handleSolicitar = () => {
    if (!limnigrafo) return;
    mutate(String(limnigrafo.id), {
      onSuccess: () => {
        mensajes.success("Token generado", `Se generó un nuevo token para el limnígrafo ${limnigrafo.codigo}.`);
      },
      onError: (error: Error) => {
        mensajes.error("Error al generar el token", error.message || "No se pudo generar el token.");
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Ventana open={open} handleClose={handleClose} title={isSuccess ? "Token generado" : "Solicitar nuevo token"}>
      {isSuccess && data ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground-secondary">
            Guardá este token ahora: <strong>no se puede volver a mostrar</strong> una vez que cierres esta ventana.
          </p>
          <TokenConClipboard token={data.secret_key} />
          <div className="flex justify-end">
            <Boton content="Cerrar" onClick={handleClose} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground-secondary">
            {limnigrafo &&
              `Se va a generar un nuevo token de API para el limnígrafo ${limnigrafo.codigo}. El token anterior dejará de funcionar inmediatamente.`}
          </p>
          <div className="flex justify-end gap-3">
            <BotonCancelar onClick={handleClose} disabled={isPending} />
            <Boton
              variant="warn"
              icon="llave"
              content={isError ? "Reintentar" : "Solicitar token"}
              loading={isPending}
              onClick={handleSolicitar}
            />
          </div>
        </div>
      )}
    </Ventana>
  );
}

export default VentanaSolicitarToken;
