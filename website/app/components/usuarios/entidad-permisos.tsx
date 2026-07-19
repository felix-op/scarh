import { opcionesRoles } from "@utils";
import { Checkbox } from "@/components/shadcn/checkbox";

export interface EntidadPermisosProps {
  selectedRoles: string[];
  toggleRole: (_roleValue: string) => void;
  hasAdmin: boolean;
  isDisabled?: boolean;
}

export function EntidadPermisos({
  selectedRoles,
  toggleRole,
  hasAdmin,
  isDisabled = false,
}: EntidadPermisosProps) {
  return (
    <div className="flex flex-col gap-4">
      {opcionesRoles.map((entidad, idx) => (
        <div key={idx} className="flex flex-col">
          <h3 className="font-semibold text-foreground-title bg-background-muted px-4 py-2 text-sm rounded-t-shape-md border border-border">
            {entidad.entidad}
          </h3>
          
          <div className="flex flex-col border-x border-b border-border rounded-b-shape-md divide-y divide-border">
            {entidad.roles
              .filter((rol) => rol.value !== "usuarios-editar")
              .map((rol) => {
                const isChecked = selectedRoles.includes(rol.value);
                const roleDisabled = isDisabled || (hasAdmin && rol.value !== "administracion");
                
                return (
                  <div
                    key={rol.value}
                    className={`flex items-start gap-3 p-3 transition-colors ${
                      isChecked ? "bg-primary-light/5" : "bg-transparent"
                    } ${roleDisabled && !isChecked ? "opacity-50" : ""}`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <Checkbox
                        id={rol.value}
                        name={rol.value}
                        checked={isChecked}
                        onCheckedChange={() => toggleRole(rol.value)}
                        disabled={roleDisabled}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <label
                        htmlFor={rol.value}
                        className={`text-sm font-medium ${
                          roleDisabled && !isChecked ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        {rol.label}
                      </label>
                      <span className="text-xs text-foreground-secondary mt-0.5">
                        {rol.help}
                      </span>
                      
                      {/* Advertencia para Administración */}
                      {rol.value === "administracion" && isChecked && (
                        <div className="mt-2">
                          <span className="text-xs font-semibold text-warn">
                            Atención: Este permiso sobrescribe los demás permisos y otorga acceso irrestricto a todas las funciones del sistema.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EntidadPermisos;
