"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BotonVolver, 
  BotonImportar, 
  BotonIconoEliminar,
  SelectorArchivoImportacion,
  SelectorLimnigrafoImportacion
} from "@components";
import { parseImportRowsByFilename } from "@utils";
import type { MedicionRowType } from "@utils";

export default function ImportarDatosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const paramId = Number.parseInt(id, 10);
  const initialLimnigrafo = Number.isInteger(paramId) && paramId > 0 ? paramId : null;

  const [limnigrafoId, setLimnigrafoId] = useState<number | null>(initialLimnigrafo);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<MedicionRowType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Parsear el archivo localmente
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    try {
      const content = await selectedFile.text();
      let rows = parseImportRowsByFilename(content, selectedFile.name);
      
      // Si el usuario ya había seleccionado un limnígrafo destino, lo aplicamos
      if (limnigrafoId !== null) {
        rows = rows.map((r) => ({
          ...r,
          limnigrafoId: r.limnigrafoId ?? limnigrafoId,
        }));
      }
      setParsedRows(rows);
    } catch (err) {
      console.error("Error parseando archivo", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-aplicar el limnígrafo destino masivamente si el usuario lo cambia después de subir el archivo
  const handleLimnigrafoChange = (newId: number) => {
    setLimnigrafoId(newId);
    if (parsedRows.length > 0) {
      setParsedRows((prev) =>
        prev.map((r) => ({
          ...r,
          limnigrafoId: newId,
        }))
      );
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
  };

  const handleGuardar = () => {
    // TODO: Enviar al backend para validación y bulk_create
    console.log("Guardando...", parsedRows);
  };

  const canSave = parsedRows.length > 0 && !isProcessing;
  const hasErrors = parsedRows.some(r => r.status === "error");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground-title">Importar mediciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cargá un archivo con el historial de mediciones para integrarlo al sistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BotonVolver onClick={() => router.back()} />
          <BotonImportar 
            onClick={handleGuardar} 
            disabled={!canSave || hasErrors}
            content="Importar datos"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* PANEL IZQUIERDO: Controles (1/4 de la pantalla en desktop) */}
        <div className="flex flex-col gap-6 lg:col-span-1 bg-card border border-border p-5 rounded-lg shadow-sm">
          <SelectorLimnigrafoImportacion
            value={limnigrafoId}
            onChange={handleLimnigrafoChange}
            disabled={isProcessing}
          />
          
          <div className="pt-2 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Archivo de datos</h3>
            {!file ? (
              <SelectorArchivoImportacion 
                onFileSelect={handleFileSelect} 
                isProcessing={isProcessing} 
              />
            ) : (
              <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-md border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate pr-4" title={file.name}>
                    {file.name}
                  </span>
                  <BotonIconoEliminar onClick={handleReset} className="h-8 w-8 shrink-0 bg-transparent border-0" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span className="font-medium text-foreground">{parsedRows.length} registros</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: Tabla y vista previa (3/4 de la pantalla en desktop) */}
        <div className="flex flex-col lg:col-span-3 bg-card border border-border rounded-lg shadow-sm overflow-hidden min-h-[400px]">
          {parsedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-muted-foreground">
              <p>Seleccioná un archivo para previsualizar los datos aquí.</p>
            </div>
          ) : (
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Previsualización de datos</h3>
              
              {hasErrors && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 flex items-center gap-2">
                  <span className="font-semibold">Atención:</span> Hay registros con errores. Corregilos o eliminalos antes de poder importar.
                </div>
              )}

              {/* TODO: Montar <TablaMedicionesImportacion /> aquí */}
              <div className="border border-border border-dashed rounded-md h-[300px] flex items-center justify-center bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  [Aquí irá la Tabla Dinámica de {parsedRows.length} filas]
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
