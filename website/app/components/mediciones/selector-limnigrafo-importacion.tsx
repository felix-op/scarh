"use client";

import { useGetLimnigrafos } from "@hooks";
import { Select } from "../ui/select";
import { IconifyIcon } from "../ui/iconify-icon";

interface SelectorLimnigrafoImportacionProps {
  value: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
}

export function SelectorLimnigrafoImportacion({ 
  value, 
  onChange, 
  disabled 
}: SelectorLimnigrafoImportacionProps) {
  const { data, isLoading } = useGetLimnigrafos();

  // Mapeamos los limnígrafos de la respuesta paginada
  const limnigrafos = data?.results || [];
  
  const options = limnigrafos.map((limnigrafo: any) => ({
    value: String(limnigrafo.id),
    label: `${limnigrafo.codigo} - ${limnigrafo.descripcion || "Sin descripción"}`,
  }));

  if (limnigrafos.length === 0 && !isLoading) {
    options.push({ value: "", label: "No hay limnígrafos disponibles" });
  }

  return (
    <div className="flex flex-col gap-2">
      <Select
        label="Limnígrafo de destino"
        name="limnigrafo"
        options={options}
        required
        disabled={disabled || isLoading}
        value={value ? String(value) : undefined}
        onChange={(val) => {
          if (val) onChange(Number(val));
        }}
        placeholder={isLoading ? "Cargando limnígrafos..." : "Seleccioná un limnígrafo"}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Este limnígrafo se asignará a todos los registros del archivo importado.
      </p>
    </div>
  );
}
