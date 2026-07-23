import { Chip } from "../ui/chip";
import { IconifyIcon } from "../ui/iconify-icon";
import type { MedicionRowType } from "@utils";

interface ChipEstadoImportacionProps {
  status: MedicionRowType["status"];
  issuesCount?: number;
}

export function ChipEstadoImportacion({ status, issuesCount = 0 }: ChipEstadoImportacionProps) {
  switch (status) {
    case "valid":
      return (
        <Chip variant="success" size="sm" className="gap-1.5 whitespace-nowrap">
          <IconifyIcon variant="check" className="text-sm" />
          Válido
        </Chip>
      );
    case "error":
      return (
        <Chip variant="error" size="sm" className="gap-1.5 whitespace-nowrap">
          <IconifyIcon variant="cancelar" className="text-sm" />
          {issuesCount === 1 ? "1 Error" : `${issuesCount} Errores`}
        </Chip>
      );
    case "duplicate_file":
      return (
        <Chip variant="warn" size="sm" className="gap-1.5 whitespace-nowrap">
          <IconifyIcon variant="alerta" className="text-sm" />
          Duplicado (Archivo)
        </Chip>
      );
    case "duplicate_database":
      return (
        <Chip variant="none" size="sm" className="gap-1.5 whitespace-nowrap">
          <IconifyIcon variant="database" className="text-sm" />
          Duplicado (BD)
        </Chip>
      );
    case "warning":
      return (
        <Chip variant="warn" size="sm" className="gap-1.5 whitespace-nowrap">
          <IconifyIcon variant="alerta" className="text-sm" />
          Advertencia
        </Chip>
      );
    default:
      return null;
  }
}
