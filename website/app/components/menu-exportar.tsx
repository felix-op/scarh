"use client";

import { Menu } from "./ui/menu";
import { Boton } from "./ui/botones";

export interface MenuExportarProps {
  handleExportCSV: () => void;
  handleExportExcel: () => void;
  handleExportPDF: () => void;
  disabled?: boolean;
}

export function MenuExportar({
  handleExportCSV,
  handleExportExcel,
  handleExportPDF,
  disabled = false,
}: MenuExportarProps) {
  return (
    <Menu
      trigger={<Boton content="Exportar" icon="descargar" disabled={disabled} />}
      items={[
        { label: "Excel", action: handleExportExcel, disabled },
        { label: "CSV", action: handleExportCSV, disabled },
        { label: "PDF", action: handleExportPDF, disabled },
      ]}
    />
  );
}

export default MenuExportar;
