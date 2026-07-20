"use client";

import CampoSelector from "@componentes/formularios/CampoSelector";
import WrapperCampo from "@componentes/formularios/WrapperCampo";
import Icon from "@componentes/icons/Icon";
import SeccionCard from "@componentes/secciones/SeccionCard";
import VentanaFormulario from "@componentes/ventanas/VentanaFormulario";
import { usePostUsuarioRolesBulk } from "@servicios/api";
import { useNotificar } from "@hooks/useNotificar";
import { UsuarioResponse } from "types/usuarios";
import { defaultFormPermisosMasivos, opcionesModoPermisosMasivos, opcionesRoles } from "../constantes";
import { TFormPermisosMasivos, TRole } from "../types";

type VentanaPermisosMasivosProps = {
	open: boolean;
	onClose: () => void;
	usuariosSeleccionados: UsuarioResponse[];
	queriesToInvalidate: Array<string | readonly unknown[]>;
	onSuccess: () => void;
};

function TablaPermisosMasivos() {
	return (
		<WrapperCampo<TFormPermisosMasivos>
			name="roles"
			label="Permisos"
			rules={{
				validate: (value) => (
					Array.isArray(value) && value.length > 0
						? true
						: "Seleccioná al menos un permiso."
				),
			}}
			render={({ field }) => {
				const rolesActivos = Array.isArray(field.value) ? field.value : [];

				const toggleRole = (rol: TRole) => {
					const nextRoles = rolesActivos.includes(rol.value)
						? rolesActivos.filter((value: string) => value !== rol.value)
						: [...rolesActivos, rol.value];

					field.onChange(nextRoles);
				};

				return (
					<SeccionCard className="overflow-hidden border border-border/70">
						<table className="w-full table-fixed border-collapse">
							<thead className="bg-table-header text-left">
								<tr>
									<th className="w-[44%] px-3 py-2 text-center text-sm font-semibold text-foreground-title">Entidad</th>
									<th className="w-[56%] px-3 py-2 text-sm font-semibold text-foreground-title text-center">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{opcionesRoles.map((permiso) => (
									<tr key={permiso.entidad} className="border-t border-border/60">
										<td className="px-3 py-2.5 text-base text-foreground">{permiso.entidad}</td>
										<td className="px-3 py-1.5">
											<div className="flex flex-wrap items-center justify-center gap-1">
												{permiso.roles.map((rol) => {
													const isActive = rolesActivos.includes(rol.value);
													const icon = rol.type === "ver"
														? (isActive ? "ver" : "ocultar")
														: (isActive ? "editar" : "noEditar");
													const className = rol.type === "ver" ? "text-principal" : "text-exito";
													const actionLabel = isActive ? "Quitar" : "Agregar";

													return (
														<button
															key={rol.value}
															type="button"
															className="flex cursor-pointer items-center rounded-md p-1.5 text-lg transition-colors hover:bg-hover"
															title={`${actionLabel} permiso: ${rol.label}`}
															aria-label={`${actionLabel} permiso: ${rol.label}`}
															onClick={() => toggleRole(rol)}
														>
															<Icon variant={icon} className={className} />
														</button>
													);
												})}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</SeccionCard>
				);
			}}
		/>
	);
}

export default function VentanaPermisosMasivos({
	open,
	onClose,
	usuariosSeleccionados,
	queriesToInvalidate,
	onSuccess,
}: VentanaPermisosMasivosProps) {
	const notificar = useNotificar();
	const cantidadUsuarios = usuariosSeleccionados.length;

	const { mutate: actualizarPermisos, isPending } = usePostUsuarioRolesBulk({
		configuracion: {
			queriesToInvalidate,
			onSuccess: (response) => {
				onClose();
				onSuccess();
				notificar({
					titulo: "Permisos actualizados",
					mensaje: `${response.updated_users.length} usuario(s) fueron actualizados correctamente.`,
					variante: "exito",
					desaparecerEnMS: 5000,
				});
			},
			onError: (error) => {
				notificar({
					titulo: "Error",
					mensaje: error.response?.data?.descripcion_usuario || "No se pudieron actualizar los permisos seleccionados.",
					variante: "error",
					desaparecerEnMS: false,
				});
			},
		},
	});

	const onSubmit = (data: TFormPermisosMasivos) => {
		actualizarPermisos({
			data: {
				user_ids: usuariosSeleccionados.map((usuario) => usuario.id),
				roles: data.roles,
				mode: data.mode,
			},
		});
	};

	return (
		<VentanaFormulario<TFormPermisosMasivos>
			key={`${open}-${usuariosSeleccionados.map((usuario) => usuario.id).join("-")}`}
			open={open}
			onClose={onClose}
			onSubmit={onSubmit}
			valoresIniciales={defaultFormPermisosMasivos}
			titulo="Permisos masivos"
			descripcion={`Vas a aplicar cambios sobre ${cantidadUsuarios} usuario(s) seleccionados.`}
			classNameFormulario="overflow-hidden text-center"
			classNameContenido="flex flex-col gap-4 overflow-hidden p-4"
			isLoading={isPending}
		>
			<div className="rounded-lg border border-border bg-campo-input p-3 text-sm">
				<p className="font-semibold text-foreground-title">Usuarios seleccionados</p>
				<p className="mt-1 line-clamp-2 text-sm text-foreground">
					{usuariosSeleccionados.map((usuario) => usuario.nombre_usuario).join(", ")}
				</p>
			</div>

			<CampoSelector<TFormPermisosMasivos>
				name="mode"
				label="Operación"
				options={opcionesModoPermisosMasivos}
				disabled={isPending}
				required
			/>

			<TablaPermisosMasivos />
		</VentanaFormulario>
	);
}
