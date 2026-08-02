"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Card } from "../ui/cards";
import { Chip } from "../ui/chip";
import { Boton } from "../ui/botones";
import { Avatar } from "../ui/avatar";
import { SeccionAgruparInformacion } from "../ui/seccion-agrupar-informacion";
import { VentanaEditarPerfil } from "./ventana-editar-perfil";
import { RolesMap } from "@utils";
import type { PerfilResponse } from "@models";

/**
 * Ficha del usuario autenticado.
 *
 * Muestra su información y permite editar sólo lo personal. Lo que queda fuera es
 * deliberado: el estado de la cuenta y los roles se ven pero no se tocan —cambiar
 * los propios permisos desde el perfil sería una escalada de privilegios— y la
 * contraseña tampoco, porque cambiarla exige verificar la actual y eso es otro
 * flujo.
 *
 * @property {PerfilResponse} perfil Datos del usuario autenticado.
 */
export interface TarjetaPerfilProps {
  perfil: PerfilResponse;
}

export function TarjetaPerfil({ perfil }: TarjetaPerfilProps) {
  const [editando, setEditando] = useState(false);

  const nombreCompleto = [perfil.first_name, perfil.last_name].filter(Boolean).join(" ");

  return (
    <>
      <Card className="flex flex-col gap-6 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar nombre={nombreCompleto || perfil.nombre_usuario} size="lg" />

          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
            <h2 className="text-xl font-semibold text-foreground-title mb-0!">
              {nombreCompleto || perfil.nombre_usuario}
            </h2>
            <span className="text-sm text-foreground-secondary">@{perfil.nombre_usuario}</span>
            
            <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
              <Chip variant={perfil.estado ? "success" : "none"} size="sm">
                {perfil.estado ? "Activo" : "Inactivo"}
              </Chip>
              {perfil.roles.length === 0 ? (
                <Chip variant="none" size="sm">
                  Sin roles asignados
                </Chip>
              ) : (
                perfil.roles.map((rol) => (
                  <Chip key={rol} variant="info" size="sm">
                    {RolesMap[rol] ?? rol}
                  </Chip>
                ))
              )}
            </div>
          </div>

          <Boton
            content="Editar perfil"
            icon="editar"
            variant="primary"
            onClick={() => setEditando(true)}
          />
        </div>

        <SeccionAgruparInformacion title="Información personal">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Dato etiqueta="Nombre" valor={perfil.first_name} />
            <Dato etiqueta="Apellido" valor={perfil.last_name} />
            <Dato etiqueta="Nombre de usuario" valor={perfil.nombre_usuario} />
            <Dato etiqueta="Legajo" valor={perfil.legajo || "—"} />
            <Dato etiqueta="Correo electrónico" valor={perfil.email} />
          </div>
        </SeccionAgruparInformacion>

        <div className="flex justify-end">
          <Boton
            content="Cerrar sesión"
            icon="logout"
            variant="error"
            onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
          />
        </div>
      </Card>

      <VentanaEditarPerfil
        open={editando}
        perfil={perfil}
        onClose={() => setEditando(false)}
      />
    </>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-foreground-secondary">{etiqueta}</span>
      <span className="text-sm text-foreground">{valor || "—"}</span>
    </div>
  );
}
