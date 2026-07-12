export interface ParsedInput {
  comando: string;
  args: string[];
  flags: string[];
}

export interface Flag {
  nombre: string;       // Ej: "--ui" o "--omit-error"
  abreviatura: string;  // Ej: "-u" o "-e"
  descripcion: string;  // Detalle de qué hace la bandera
}

export interface CommandRegistry {
  comando: string;       // Nombre principal (ej: "app" o "component")
  abreviatura: string;   // Abreviatura (ej: "a" o "c")
  descripcion: string;   // Descripción del comando
  args: string[];        // Documentación de los argumentos esperados (ej: ["<rutaPage>"])
  flags: Flag[];         // Banderas disponibles
  examples: string[];    // Ejemplos de uso del comando
  fn: (
    rutas: Record<string, string>,
    args: string[],
    flags: string[],
    dryRun: boolean
  ) => void | Promise<void>;
}
