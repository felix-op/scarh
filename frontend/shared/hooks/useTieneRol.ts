"use client";

import { useSession } from "next-auth/react";

/**
 * Permisos que un usuario con is_staff tiene automáticamente,
 * incluso si no tiene roles asignados en la base de datos.
 */
const PERMISOS_STAFF: string[] = [
	"mapa-visualizar",
	"limnigrafos-visualizar",
	"mediciones-visualizar",
	"estadisticas-visualizar",
	"usuarios-visualizar",
	"historial-visualizar",
];

/**
 * Hook para verificar si el usuario actual tiene uno o varios roles específicos.
 * 
 * - Si el usuario es superusuario (is_superuser), siempre retorna true.
 * - Si el usuario es staff (is_staff), tiene acceso a los permisos de visualización generales.
 * - Caso contrario, verifica contra los roles asignados en la base de datos.
 * 
 * @param rol - El rol o roles a verificar (string o string[]).
 * @returns boolean - true si el usuario tiene el permiso solicitado.
 */
export const useTieneRol = (rol: string | string[]): boolean => {
	const { data: session } = useSession();

	// Los superusuarios tienen acceso a todo
	if (session?.user?.is_superuser) {
		return true;
	}

	// Obtenemos los roles del usuario de la sesión.
	const rolesUsuario = session?.user?.roles || [];

	// Si es staff, agregar los permisos de staff como fallback
	const todosLosRoles = session?.user?.is_staff
		? [...new Set([...rolesUsuario, ...PERMISOS_STAFF])]
		: rolesUsuario;

	if (Array.isArray(rol)) {
		return rol.some((r) => todosLosRoles.includes(r));
	}

	return todosLosRoles.includes(rol);
};
