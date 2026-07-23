"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BotonVolver,
  BotonImportar,
  BotonIconoEliminar,
  SelectorArchivoImportacion,
  SelectorLimnigrafoImportacion,
  TablaMedicionesImportacion,
  VentanaEditarMedicion,
  VentanaEliminarMedicion,
  VentanaConfirmarGuardado,
  detectarFormatoImportacion,
} from "@components";
import { useValidarImportacionMediciones, useImportarMediciones } from "@hooks";
import { useMensajes } from "@services";
import {
  parseImportRowsByFilename,
  revalidarFilas,
  mapearFilasAPayloadImportacion,
  fusionarResultadosValidacion,
} from "@utils";
import type { MedicionRowType } from "@utils";
import type { MedicionImportPayload } from "@models";

export default function ImportarDatosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const mensajes = useMensajes();

  const paramId = Number.parseInt(id, 10);
  const initialLimnigrafo = Number.isInteger(paramId) && paramId > 0 ? paramId : null;

  const [limnigrafoId, setLimnigrafoId] = useState<number | null>(initialLimnigrafo);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<MedicionRowType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingRow, setEditingRow] = useState<MedicionRowType | null>(null);
  const [deletingRow, setDeletingRow] = useState<MedicionRowType | null>(null);
  const [showConfirmDuplicados, setShowConfirmDuplicados] = useState(false);

  const validarImportacion = useValidarImportacionMediciones();
  const importarMediciones = useImportarMediciones();

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

  const buildPayload = (rows: MedicionRowType[]): MedicionImportPayload => ({
    file_name: file?.name ?? "importacion",
    fuente: file?.name.toLowerCase().endsWith(".json") ? "import_json" : "import_csv",
    fallback_limnigrafo_id: limnigrafoId,
    rows: mapearFilasAPayloadImportacion(rows),
  });

  const ejecutarImportacion = async (filas: MedicionRowType[]) => {
    const resultado = await importarMediciones.mutateAsync(buildPayload(filas));
    mensajes.success("Importación completada", `Se importaron ${resultado.imported_rows} mediciones correctamente.`);
    handleReset();
    router.push(`/dashboard/limnigrafos/${limnigrafoId}`);
  };

  const handleGuardar = async () => {
    try {
      const validacion = await validarImportacion.mutateAsync(buildPayload(parsedRows));
      const filasValidadas = fusionarResultadosValidacion(parsedRows, validacion.rows);
      setParsedRows(filasValidadas);

      const tieneErrores = filasValidadas.some((row) => row.status === "error");
      if (tieneErrores) {
        mensajes.error(
          "Hay registros con errores",
          "Corregí o eliminá las filas marcadas en rojo antes de poder importar."
        );
        return;
      }

      const filasValidas = filasValidadas.filter((row) => row.status === "valid");
      const tieneDuplicados = filasValidas.length < filasValidadas.length;

      if (tieneDuplicados) {
        if (filasValidas.length === 0) {
          mensajes.error(
            "Todas las filas están duplicadas",
            "Ya existen en el archivo o en la base de datos. No hay ningún registro nuevo para cargar."
          );
          return;
        }
        setShowConfirmDuplicados(true);
        return;
      }

      await ejecutarImportacion(filasValidas);
    } catch (err) {
      mensajes.error("Error al importar", err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    }
  };

  const handleConfirmarIgnorarDuplicados = async () => {
    setShowConfirmDuplicados(false);
    try {
      const filasAImportar = parsedRows.filter((row) => row.status === "valid");
      await ejecutarImportacion(filasAImportar);
    } catch (err) {
      mensajes.error("Error al importar", err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    }
  };

  const handleSaveEditedRow = (updatedRow: MedicionRowType) => {
    setParsedRows((prev) =>
      revalidarFilas(prev.map((row) => (row.rowNumber === updatedRow.rowNumber ? updatedRow : row)))
    );
    setEditingRow(null);
  };

  const handleConfirmDeleteRow = () => {
    if (!deletingRow) return;
    setParsedRows((prev) => revalidarFilas(prev.filter((row) => row.rowNumber !== deletingRow.rowNumber)));
    setDeletingRow(null);
  };

  const isMutando = validarImportacion.isPending || importarMediciones.isPending;
  const canSave = parsedRows.length > 0 && !isProcessing && !isMutando;
  const hasErrors = parsedRows.some((r) => r.status === "error");

  const duplicateCount = parsedRows.filter(
    (row) => row.status === "duplicate_file" || row.status === "duplicate_database"
  ).length;
  const remainingCount = parsedRows.filter((row) => row.status === "valid").length;

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
            loading={isMutando}
            content="Importar datos"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 items-start">
        {/* PANEL SUPERIOR: Controles */}
        <div className="flex flex-col gap-6 w-full bg-card border border-border p-5 rounded-lg shadow-sm lg:flex-row lg:items-start lg:gap-8">
          <div className="flex-1 min-w-0">
            <SelectorLimnigrafoImportacion
              value={limnigrafoId}
              onChange={handleLimnigrafoChange}
              disabled={isProcessing}
            />
          </div>

          <div className="flex-1 min-w-0 pt-2 border-t border-border lg:pt-0 lg:border-t-0 lg:border-l lg:pl-8">
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

        {/* PANEL INFERIOR: Tabla y vista previa */}
        <div className="flex flex-col w-full bg-card border border-border rounded-lg shadow-sm overflow-hidden min-h-[400px]">
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

              <TablaMedicionesImportacion
                rows={parsedRows}
                onEditRow={(row) => setEditingRow(row)}
                onDeleteRow={(row) => setDeletingRow(row)}
              />
            </div>
          )}
        </div>
      </div>

      <VentanaEditarMedicion
        key={editingRow?.rowNumber ?? "sin-edicion"}
        isOpen={editingRow !== null}
        onClose={() => setEditingRow(null)}
        onSave={handleSaveEditedRow}
        row={editingRow}
        formato={detectarFormatoImportacion(parsedRows)}
      />

      <VentanaEliminarMedicion
        isOpen={deletingRow !== null}
        onClose={() => setDeletingRow(null)}
        onConfirm={handleConfirmDeleteRow}
        rowNumber={deletingRow?.rowNumber ?? null}
      />

      <VentanaConfirmarGuardado
        isOpen={showConfirmDuplicados}
        onClose={() => setShowConfirmDuplicados(false)}
        onConfirm={handleConfirmarIgnorarDuplicados}
        duplicateCount={duplicateCount}
        remainingCount={remainingCount}
        isLoading={importarMediciones.isPending}
      />
    </div>
  );
}
