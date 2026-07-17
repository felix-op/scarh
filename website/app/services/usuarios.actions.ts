"use server";

import { putUsuarioRoles, getUsuario } from "./api/usuarios";
import { revalidateTag } from "next/cache";

export type ActionState = {
  status: "ok" | "error" | "none";
  message?: string;
  timestamp?: number;
};

export async function guardarPermisosIndividualAction(
  prevState: ActionState,
  formData: FormData,
  id: string,
  roles: string[]
): Promise<ActionState> {
  try {
    if (!id) return { status: "none" };
    
    await putUsuarioRoles(id, { roles });
    revalidateTag("usuarios");
    revalidateTag(`usuario-${id}`);
    
    return {
      status: "ok",
      message: "Permisos actualizados correctamente.",
      timestamp: Date.now(),
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error?.message || "No se pudieron actualizar los permisos",
      timestamp: Date.now(),
    };
  }
}

export async function guardarPermisosMasivosAction(
  prevState: ActionState,
  formData: FormData,
  ids: string[],
  rolesAfectados: string[],
  modo: "reemplazar" | "agregar" | "quitar"
): Promise<ActionState> {
  try {
    if (!ids || ids.length === 0) return { status: "none" };

    for (const id of ids) {
      if (modo === "reemplazar") {
        await putUsuarioRoles(id, { roles: rolesAfectados });
      } else {
        // Necesitamos conocer los roles actuales para agregar o quitar
        const user = await getUsuario(id);
        const rolesActuales = user.roles || [];
        
        let nuevosRoles = [...rolesActuales];
        if (modo === "agregar") {
          for (const r of rolesAfectados) {
            if (!nuevosRoles.includes(r)) nuevosRoles.push(r);
          }
        } else if (modo === "quitar") {
          nuevosRoles = nuevosRoles.filter(r => !rolesAfectados.includes(r));
        }

        await putUsuarioRoles(id, { roles: nuevosRoles });
      }
      revalidateTag(`usuario-${id}`);
    }
    revalidateTag("usuarios");

    return {
      status: "ok",
      message: `Permisos actualizados para ${ids.length} usuario(s).`,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error?.message || "Ocurrió un error al actualizar permisos masivos.",
      timestamp: Date.now(),
    };
  }
}
