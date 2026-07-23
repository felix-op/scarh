import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { TableColumn } from "../ui/tabla";
import { ChipEstadoImportacion } from "./chip-estado-importacion";
import type { MedicionRowType } from "@utils";

export type FormatoImportacionMediciones = "viejo" | "nuevo";

/**
 * El formato viejo sólo trae fecha, hora y altura de escala; el resto de los
 * campos numéricos llega siempre null. Si al menos una fila tiene algún otro
 * dato cargado, se interpreta que el archivo es del formato nuevo.
 */
export function detectarFormatoImportacion(rows: MedicionRowType[]): FormatoImportacionMediciones {
  const esNuevo = rows.some(
    (row) => row.presion !== null || row.temperatura !== null || row.nivelBateria !== null
  );
  return esNuevo ? "nuevo" : "viejo";
}

function celdaFechaHora(row: MedicionRowType) {
  if (row.fechaHora) {
    const date = new Date(row.fechaHora);
    if (!Number.isNaN(date.getTime())) {
      return format(date, "dd/MM/yyyy HH:mm", { locale: es });
    }
  }

  // No se pudo interpretar: mostramos el valor original para que el usuario vea qué está mal.
  if (row.fechaHoraOriginal) {
    return <span className="text-error italic">{row.fechaHoraOriginal}</span>;
  }

  return "-";
}

function formatNumero(valor: number | null, sufijo: string, digitos = 2): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "-";
  return `${valor.toFixed(digitos)} ${sufijo}`;
}

/** Resalta en rojo el valor de la celda cuando tiene un issue asociado a ese campo. */
function celdaNumero(row: MedicionRowType, campo: string, valor: number | null, sufijo: string, digitos = 2) {
  const texto = formatNumero(valor, sufijo, digitos);
  const tieneError = row.issues.some((issue) => issue.field === campo);
  return tieneError ? <span className="text-error font-medium">{texto}</span> : texto;
}

interface ColumnasImportacionOptions {
  limnigrafoCodeById?: Map<number, string>;
}

/**
 * Devuelve las columnas preestablecidas para la tabla de previsualización de
 * importación, según el formato detectado del archivo.
 */
export function getColumnasImportacionMediciones(
  formato: FormatoImportacionMediciones,
  { limnigrafoCodeById }: ColumnasImportacionOptions = {}
): TableColumn<MedicionRowType>[] {
  const columnasBase: TableColumn<MedicionRowType>[] = [
    {
      id: "rowNumber",
      header: "Fila",
      cell: (row) => `#${row.rowNumber}`,
    },
    {
      id: "fecha_hora",
      header: "Fecha y hora",
      cell: (row) => celdaFechaHora(row),
    },
    {
      id: "altura_agua",
      header: "Altura de agua",
      cell: (row) => celdaNumero(row, "altura_agua", row.alturaAgua, "m"),
    },
  ];

  const columnasFormatoNuevo: TableColumn<MedicionRowType>[] = [
    {
      id: "limnigrafo",
      header: "Limnígrafo",
      cell: (row) =>
        row.limnigrafoId !== null
          ? limnigrafoCodeById?.get(row.limnigrafoId) ?? `ID ${row.limnigrafoId}`
          : "-",
    },
    {
      id: "presion",
      header: "Presión",
      cell: (row) => celdaNumero(row, "presion", row.presion, "hPa"),
    },
    {
      id: "temperatura",
      header: "Temperatura",
      cell: (row) => celdaNumero(row, "temperatura", row.temperatura, "°C"),
    },
    {
      id: "nivel_de_bateria",
      header: "Batería",
      cell: (row) => celdaNumero(row, "nivel_de_bateria", row.nivelBateria, "%", 1),
    },
  ];

  const columnaEstado: TableColumn<MedicionRowType> = {
    id: "status",
    header: "Estado",
    cell: (row) => <ChipEstadoImportacion status={row.status} issuesCount={row.issues.length} />,
  };

  return formato === "nuevo"
    ? [...columnasBase, ...columnasFormatoNuevo, columnaEstado]
    : [...columnasBase, columnaEstado];
}
