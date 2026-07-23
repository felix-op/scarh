const BOM_UTF8 = "﻿";

function descargarBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escaparCeldaCSV(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (/[";\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/** Genera y descarga un archivo CSV en el navegador. Incluye BOM UTF-8 para que Excel lo abra bien. */
export function exportarComoCSV(fileName: string, headers: string[], rows: (string | number | null)[][]): void {
  const lineas = [headers, ...rows].map((fila) => fila.map(escaparCeldaCSV).join(";"));
  const contenido = BOM_UTF8 + lineas.join("\n");
  descargarBlob(new Blob([contenido], { type: "text/csv;charset=utf-8;" }), fileName);
}

/** Genera y descarga un archivo JSON en el navegador. */
export function exportarComoJSON(fileName: string, data: unknown): void {
  const contenido = JSON.stringify(data, null, 2);
  descargarBlob(new Blob([contenido], { type: "application/json;charset=utf-8;" }), fileName);
}
