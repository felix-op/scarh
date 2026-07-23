import { MedicionRowType, ImportIssue } from "./mediciones.schemas";

/**
 * Parsea un contenido CSV manejando saltos de línea dentro de comillas
 * y detectando automáticamente el separador.
 */
function customParseCsv(content: string, separator: string = ";"): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Comillas escapadas ""
        currentCell += '"';
        i++; // Saltar la siguiente comilla
      } else {
        // Entrar o salir de las comillas
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
    } else if ((char === "\n" || (char === "\r" && nextChar === "\n")) && !inQuotes) {
      if (char === "\r") i++; // Saltar el \n de \r\n
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  // Empujar la última celda/fila si quedó algo en memoria
  if (currentCell !== "" || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

/** Detecta si el archivo usa comas o punto y coma analizando la primera línea */
function detectSeparator(content: string): string {
  const firstLine = content.split("\n")[0] || "";
  return firstLine.includes(";") ? ";" : ",";
}

/** Transforma valores string en números (soportando comas como decimales) */
function parseNumeric(val: string | undefined): number | null {
  if (!val) return null;
  const cleaned = val.trim().replace(",", ".");
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

/** Convierte los distintos formatos de fecha (separado o ISO) a un string ISO */
function parseFechaHora(obj: Record<string, string>): string | null {
  // Formato Nuevo: "fecha_hora"
  if (obj.fecha_hora) {
    const d = new Date(obj.fecha_hora.trim());
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  // Formato Viejo: "fecha" y "hora" (DD/MM/YYYY y HH:MM)
  if (obj.fecha && obj.hora) {
    const [day, month, year] = obj.fecha.trim().split("/");
    if (day && month && year) {
      const isoStr = `${year}-${month}-${day}T${obj.hora.trim()}:00`;
      const d = new Date(isoStr);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
  }
  return null;
}

/** Normaliza la cabecera del CSV */
function normalizeHeader(val: string): string {
  return val
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function createIssue(field: string, code: string, message: string): ImportIssue {
  return { field, code, message };
}

/**
 * Orquestador principal: recibe el contenido del archivo y devuelve filas tipadas.
 */
export function parseImportRowsByFilename(content: string, fileName: string): MedicionRowType[] {
  const lowerName = fileName.toLowerCase();
  let rawObjects: any[] = [];

  if (lowerName.endsWith(".json")) {
    try {
      const parsed = JSON.parse(content);
      rawObjects = Array.isArray(parsed) ? parsed : [parsed];
      rawObjects.forEach((obj, i) => (obj._rowNumber = i + 1));
    } catch {
      return [];
    }
  } else if (lowerName.endsWith(".csv")) {
    const separator = detectSeparator(content);
    let rawRows = customParseCsv(content, separator);

    // Limpiar filas vacías puras
    rawRows = rawRows.filter((row) => row.some((cell) => cell.trim() !== ""));

    // Identificar dónde empiezan realmente las cabeceras (para saltear "Limnigrafo Digital Recursos Hidricos;;")
    let headerIndex = 0;
    for (let i = 0; i < Math.min(5, rawRows.length); i++) {
      const rowStr = rawRows[i].join("").toLowerCase();
      if (rowStr.includes("fecha") || rowStr.includes("altura")) {
        headerIndex = i;
        break;
      }
    }

    const headers = rawRows[headerIndex].map(normalizeHeader);
    const dataRows = rawRows.slice(headerIndex + 1);

    rawObjects = dataRows.map((row, index) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] ? row[i].trim() : "";
      });
      // Guardar el número real de fila en el archivo (1-indexed)
      obj._rowNumber = headerIndex + 2 + index; 
      return obj;
    });
  }

  // Transformar los objetos puros a nuestro Schema de mediciones con validaciones
  const parsedRows: MedicionRowType[] = rawObjects.map((obj) => {
    const issues: ImportIssue[] = [];
    
    // Extracción de limnígrafo
    let limnigrafoId = parseNumeric(obj.limnigrafo || obj.limnigrafo_id || obj.id_limnigrafo);

    // Fechas y valores numéricos
    const fechaHora = parseFechaHora(obj);
    const alturaAgua = parseNumeric(obj.altura_agua || obj.altura_escala || obj.altura);
    const presion = parseNumeric(obj.presion);
    const temperatura = parseNumeric(obj.temperatura);
    const nivelBateria = parseNumeric(obj.nivel_de_bateria || obj.bateria);

    if (!fechaHora) {
      issues.push(createIssue("fecha_hora", "required", "La fecha y hora es obligatoria o tiene formato inválido."));
    }
    if (alturaAgua === null) {
      issues.push(createIssue("altura_agua", "required", "La altura del agua es obligatoria."));
    }

    return {
      rowNumber: obj._rowNumber,
      limnigrafoId: limnigrafoId !== null ? Math.trunc(limnigrafoId) : null,
      fechaHora,
      alturaAgua,
      presion,
      temperatura,
      nivelBateria,
      status: issues.length > 0 ? "error" : "valid",
      issues,
    };
  });

  return markDuplicateRows(parsedRows);
}

/**
 * Identifica duplicados dentro del mismo archivo para advertir al usuario.
 */
function markDuplicateRows(rows: MedicionRowType[]): MedicionRowType[] {
  const keyToCount = new Map<string, number>();

  rows.forEach((row) => {
    // Si no tienen limnigrafoId definido todavía, usamos 'none' para la validación local provisoria
    const idKey = row.limnigrafoId ?? "none";
    if (!row.fechaHora) return;
    const key = `${idKey}::${row.fechaHora}`;
    keyToCount.set(key, (keyToCount.get(key) ?? 0) + 1);
  });

  return rows.map((row) => {
    const idKey = row.limnigrafoId ?? "none";
    if (!row.fechaHora) return row;

    const key = `${idKey}::${row.fechaHora}`;
    if ((keyToCount.get(key) ?? 0) > 1) {
      const alreadyMarked = row.issues.some((i) => i.code === "duplicate_file");
      if (!alreadyMarked) {
        row.issues.push(createIssue("fecha_hora", "duplicate_file", "Ya existe otra fila en el archivo con fecha/hora idéntica."));
        row.status = "duplicate_file";
      }
    }
    return row;
  });
}
