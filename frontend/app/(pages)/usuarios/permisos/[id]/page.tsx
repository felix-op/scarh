"use client";
import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import Icon from "@componentes/icons/Icon";
import SeccionInfoData from "@componentes/secciones/SeccionInfoData";
import DataTable from "@componentes/tabla/DataTable";
import { ColumnConfig } from "@componentes/tabla/types";
import { useGetUsuario } from "@servicios/api";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useRoles, { Permiso } from "../../hooks/useRoles";
import VentanaConfirmar from "@componentes/ventanas/VentanaConfirmar";

export default function Permisos() {
    const [isOpenConfirm, setIsOpenConfirm] = useState(false);
    const { id } = useParams();
    const { data: usuario } = useGetUsuario({
        params: {
            id: id as string,
        },
        configuracion: {
            enabled: !!id,
        }
    });
    const router = useRouter();
    const { permisos, isLoading, isEdited, handlePermission, handleSubmit } = useRoles({
        id: id as string,
        usuario
    })

    const handleVolver = () => {
        router.back();
    }

    const openConfirm = () => {
        if (!isEdited) {
            handleVolver();
            return;
        }
        setIsOpenConfirm(true);
    }

    const closeConfirm = () => {
        setIsOpenConfirm(false);
    }

    const columnas: ColumnConfig<Permiso>[] = useMemo(() => [
        { id: "entidad", header: "Entidad" },
        {
            id: "acciones",
            header: "Acciones",

            cell: (row: Permiso) => (
                <div className="flex gap-2">
                    {row.roles.map((rol) => {
                        const icon = rol.type === "ver" ? (rol.isActive ? "ver" : "ocultar") : (rol.isActive ? "editar" : "noEditar");
                        const className = rol.type === "ver" ? "text-principal" : "text-exito";

                        return (
                            <button
                                key={`boton-rol-${rol.value}`}
                                type="button"
                                className="flex gap-4 p-4 text-2xl hover:bg-hover cursor-pointer"
                                onClick={() => handlePermission(rol.value)}
                            >
                                <Icon variant={icon} className={className} />
                            </button>
                        );
                    })}
                </div>
            )
        }
    ], [handlePermission]);

    const nombre_completo = usuario ? `${usuario.first_name} ${usuario.last_name}` : "Cargando...";

    return (
        <PaginaBase>
            <div className="flex flex-col gap-4">
                <div>
                    <BotonVariante variant="volver" onClick={openConfirm} />
                </div>
                <h2 className="text-center">Editar Permisos</h2>
                <div className="p-4">
                    <div className="flex justify-between">
                        <SeccionInfoData label="Usuario:">
                            {usuario?.nombre_usuario}
                        </SeccionInfoData>
                        <SeccionInfoData label="Nombre:">
                            {nombre_completo}
                        </SeccionInfoData>
                    </div>
                </div>
                {isEdited && (
                    <div className="flex justify-end">
                        <BotonVariante
                            type="button"
                            variant="guardar"
                            loading={isLoading}
                            onClick={handleSubmit}
                        />
                    </div>
                )}
                <DataTable
                    data={permisos}
                    rowIdKey="id"
                    columns={columnas}
                    showTopBar={false}
                    isLoading={isLoading}
                    styles={{
                        hiddenRowHover: true,
                    }}
                />
                <VentanaConfirmar
                    open={isOpenConfirm}
                    onClose={closeConfirm}
                    onConfirm={handleVolver}
                    title="Confirmar"
                    description="¿Está seguro de que desea descartar los cambios?"
                    variant="cierre"
                />
            </div>
        </PaginaBase>
    );
}