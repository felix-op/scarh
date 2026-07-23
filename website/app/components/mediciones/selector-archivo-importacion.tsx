"use client";

import { useState } from "react";
import { IconifyIcon } from "../ui/iconify-icon";

interface SelectorArchivoImportacionProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function SelectorArchivoImportacion({ onFileSelect, isProcessing }: SelectorArchivoImportacionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSelectFile = (file: File) => {
    setError(null);
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".csv") && !lowerName.endsWith(".json")) {
      setError("Extensión no válida. Por favor subí un archivo .csv o .json");
      return;
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es demasiado grande (máximo 5MB).");
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[250px] border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/10"
            : "border-border bg-background hover:bg-muted/50"
        } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <IconifyIcon variant="upload" className="w-12 h-12 mb-4 text-muted-foreground text-4xl" />
          <p className="mb-2 text-sm text-foreground">
            <span className="font-semibold text-primary">Haz click para buscar</span> o arrastrá el archivo acá
          </p>
          <p className="text-xs text-muted-foreground">CSV o JSON (MAX. 5MB)</p>
          
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <IconifyIcon variant="documento" className="text-base" /> Formato Nuevo / Viejo (.csv)
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <IconifyIcon variant="file" className="text-base" /> Formato Nuevo (.json)
            </div>
          </div>
        </div>
        
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".csv,.json,text/csv,application/json"
          onChange={handleChange}
          disabled={isProcessing}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive mt-1 bg-destructive/10 p-3 rounded-md">
          <IconifyIcon variant="alerta" className="text-lg shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
