"use server";

import { putUsuarioRoles, getUsuario, putUsuario } from "./api/usuarios";
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

export async function editarUsuarioAction(
  prevState: ActionState,
  formData: FormData,
  id: string
): Promise<ActionState> {
  try {
    if (!id) return { status: "none" };

    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const nombre_usuario = formData.get("nombre_usuario") as string;
    const legajo = formData.get("legajo") as string;
    const email = formData.get("email") as string;

    await putUsuario(id, {
      first_name,
      last_name,
      nombre_usuario,
      legajo,
      email,
    });
    revalidateTag("usuarios");
    revalidateTag(`usuario-${id}`);

    return {
      status: "ok",
      message: "Los datos del usuario se actualizaron correctamente.",
      timestamp: Date.now(),
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error?.message || "No se pudo editar el usuario.",
      timestamp: Date.now(),
    };
  }
}

export async function toggleUsuarioEstadoAction(
  id: string,
  nuevoEstado: boolean
): Promise<ActionState> {
  try {
    if (!id) return { status: "none" };

    const user = await getUsuario(id);
    await putUsuario(id, {
      first_name: user.first_name,
      last_name: user.last_name,
      nombre_usuario: user.nombre_usuario,
      legajo: user.legajo,
      email: user.email,
      estado: nuevoEstado,
    });
    
    revalidateTag("usuarios");
    revalidateTag(`usuario-${id}`);

    return {
      status: "ok",
      message: `El usuario fue ${nuevoEstado ? "activado" : "desactivado"} correctamente.`,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error?.message || `No se pudo ${nuevoEstado ? "activar" : "desactivar"} el usuario.`,
      timestamp: Date.now(),
    };
  }
}
