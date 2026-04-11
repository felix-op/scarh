"use client";

import { useSession } from "next-auth/react";

/**
 * Hook para verificar si el usuario actual tiene uno o varios roles específicos.
 * 
 * @param rol - El rol o roles a verificar (string o string[]).
 * @returns boolean - true si el usuario de la sesión tiene el rol (o al menos uno de los roles) solicitado.
 */
export const useTieneRol = (rol: string | string[]): boolean => {
	const { data: session } = useSession();

	// Obtenemos los roles del usuario de la sesión.
	const rolesUsuario = session?.user?.roles || [];

	if (Array.isArray(rol)) {
		return rol.some((r) => rolesUsuario.includes(r));
	}

	return rolesUsuario.includes(rol);
};
