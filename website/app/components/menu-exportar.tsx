"use client";

import { Menu } from "./ui/menu";
import { Boton } from "./ui/botones";

export interface MenuExportarProps {
  handleExportCSV: () => void;
  handleExportJSON: () => void;
  disabled?: boolean;
}

export function MenuExportar({
  handleExportCSV,
  handleExportJSON,
  disabled = false,
}: MenuExportarProps) {
  return (
    <Menu
      trigger={<Boton content="Exportar" icon="descargar" disabled={disabled} />}
      items={[
        { label: "CSV", action: handleExportCSV, disabled },
        { label: "JSON", action: handleExportJSON, disabled },
      ]}
    />
  );
}

export default MenuExportar;
