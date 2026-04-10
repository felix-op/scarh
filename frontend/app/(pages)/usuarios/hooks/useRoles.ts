import { usePutUsuarioRoles } from "@servicios/api/usuarios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UsuarioResponse } from "types/usuarios";
import { TRoleType } from "../types";
import { opcionesRoles } from "../constantes";
import { useNotificar } from "@hooks/useNotificar";

export type TRolOption = {
    type: TRoleType
    isActive: boolean
    value: string
}

export type Permiso = {
    id: string
    entidad: string
    roles: TRolOption[]
}

type UseRolesProps = {
    id: string
    usuario?: UsuarioResponse
}

export default function useRoles({ id, usuario }: UseRolesProps) {
    const notificar = useNotificar();
    const [isLoading, setIsLoading] = useState(true);
    const [isEdited, setIsEdited] = useState(false);
    const [roles, setRoles] = useState<string[]>(usuario ? usuario.roles : []);
    const { mutate: editarPermisos, isPending: isLoadingRoles } = usePutUsuarioRoles({
        params: {
            id,
        },
        configuracion: {
            queriesToInvalidate: ["useGetUsuario", { id }],
            onSettled: () => setIsLoading(false),
            onSuccess: () => {
                notificar({
                    titulo: "Permisos actualizados",
                    mensaje: "Los permisos del usuario han sido actualizados correctamente.",
                    variante: "exito",
                    desaparecerEnMS: 5000,
                })
            },
            onError: (error) => {
                notificar({
                    titulo: "Error",
                    mensaje: error.response?.data.descripcion_usuario || "No se pudo actualizar los permisos.",
                    variante: "error",
                    desaparecerEnMS: false,
                })
            },
        },
    });

    useEffect(() => {
        if (!usuario) return;
        setIsLoading(false);
        setIsEdited(false);
        setRoles(usuario.roles);
    }, [usuario]);

    const permisos: Permiso[] = useMemo(() => (
        opcionesRoles.map((opcion) => ({
            id: opcion.entidad,
            entidad: opcion.entidad,
            roles: opcion.roles.map((rol) => {
                return {
                    type: rol.type,
                    isActive: roles.includes(rol.value),
                    value: rol.value,
                }
            })
        }))
    ), [roles]);

    const handlePermission = useCallback((value: string) => {
        setIsEdited(true);
        setRoles((rolesAnteriores) => {
            const updatedRoles = rolesAnteriores.includes(value)
                ? rolesAnteriores.filter((rol) => rol !== value)
                : [...rolesAnteriores, value];
            return updatedRoles;
        });
    }, []);

    const handleSubmit = useCallback(() => {
        setIsLoading(true);
        editarPermisos({
            data: {
                roles
            },
        })
    }, [])

    return {
        permisos,
        roles,
        isLoading,
        isEdited,
        handlePermission,
        handleSubmit
    }
}
