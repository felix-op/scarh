import fs from 'fs';
import path from 'path';

function hasFlag(flags: string[], short: string, long: string): boolean {
  return flags.includes(short) || flags.includes(long);
}

function getFlagValue(flagNames: string[]): string | null {
  const argv = process.argv;
  for (const name of flagNames) {
    const idx = argv.indexOf(name);
    if (idx !== -1 && idx + 1 < argv.length) {
      const val = argv[idx + 1];
      if (!val.startsWith('-')) {
        return val;
      }
    }
  }
  return null;
}

function updateBarrelFile(barrelPath: string, exportLine: string, dryRun: boolean) {
  if (dryRun) {
    console.log(`  [BARREL-UPDATE] Se agregaría a ${barrelPath}: "${exportLine}"`);
    return;
  }

  let content = '';
  if (fs.existsSync(barrelPath)) {
    content = fs.readFileSync(barrelPath, 'utf-8');
  }

  const lines = content.split('\n').map(l => l.trim());
  if (lines.includes(exportLine.trim()) || lines.some(l => l.replace(/['"]/g, "'") === exportLine.replace(/['"]/g, "'").trim())) {
    console.log(`  [BARREL-SKIP] La línea de exportación ya existe en: ${barrelPath}`);
    return;
  }

  const newContent = content.endsWith('\n') || content === '' 
    ? `${content}${exportLine}\n` 
    : `${content}\n${exportLine}\n`;

  fs.writeFileSync(barrelPath, newContent, 'utf-8');
  console.log(`  [BARREL-OK] Archivo barrel actualizado: ${barrelPath}`);
}

export function serviceCommand(
  rutas: Record<string, string>,
  args: string[],
  flags: string[],
  dryRun: boolean
) {
  // Para los argumentos, debemos filtrar aquellos que son valores de los flags
  // Por ejemplo, en: npm run g s -api get,post -endpoint users usuarios
  // args contiene: ["get,post", "users", "usuarios"]
  // Queremos identificar cuál es el nombre del servicio real.
  const apiVal = getFlagValue(['-api', '--api']);
  const endpointVal = getFlagValue(['-endpoint', '--endpoint']);
  const providerVal = getFlagValue(['-provider', '--provider', '-p', '--p']);

  // Filtrar los valores de los flags para quedarnos con el nombre real del archivo del servicio
  const filteredArgs = args.filter(arg => arg !== apiVal && arg !== endpointVal && arg !== providerVal);

  if (filteredArgs.length === 0) {
    console.error('Error: Debes especificar el nombre del servicio. Ej: usuarios');
    return;
  }

  const serviceName = filteredArgs[0];
  const serviceNameCapitalized = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

  let fileName = `service.${serviceName}.ts`;
  let fileContent = '';
  let modeMessage = 'Servicio Básico';

  const isProvider = hasFlag(flags, '-p', '--provider');
  const isApi = hasFlag(flags, '-api', '--api');

  if (isProvider) {
    modeMessage = 'React Context Provider';
    fileName = `provider.${serviceName}.tsx`;
    fileContent = `import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ${serviceNameCapitalized}State {
  // Definir estado aquí
}

const ${serviceNameCapitalized}Context = createContext<${serviceNameCapitalized}State | undefined>(undefined);

export function ${serviceNameCapitalized}Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<any>({});

  return (
    <${serviceNameCapitalized}Context.Provider value={state}>
      {children}
    </${serviceNameCapitalized}Context.Provider>
  );
}

export function use${serviceNameCapitalized}() {
  const context = useContext(${serviceNameCapitalized}Context);
  if (context === undefined) {
    throw new Error('use${serviceNameCapitalized} debe ser usado dentro de un ${serviceNameCapitalized}Provider');
  }
  return context;
}
`;
  } else if (isApi) {
    modeMessage = 'API Client Wrapper';
    fileName = `api.${serviceName}.ts`;
    const endpoint = endpointVal || `/${serviceName}`;
    const methodsStr = apiVal || 'get';
    const methods = methodsStr.split(',').map(m => m.trim().toLowerCase());

    let methodsCode = '';

    for (const m of methods) {
      if (m === 'get') {
        methodsCode += `\nexport async function obtener${serviceNameCapitalized}<T>(options?: any): Promise<T> {\n  return apiClient<T>('${endpoint}', { method: 'GET', ...options });\n}\n`;
      } else if (m === 'post') {
        methodsCode += `\nexport async function crear${serviceNameCapitalized}<T>(body: any, options?: any): Promise<T> {\n  return apiClient<T>('${endpoint}', {\n    method: 'POST',\n    body: JSON.stringify(body),\n    ...options\n  });\n}\n`;
      } else if (m === 'put') {
        methodsCode += `\nexport async function actualizar${serviceNameCapitalized}<T>(id: string | number, body: any, options?: any): Promise<T> {\n  return apiClient<T>(\`\${'${endpoint}'}/\${id}\`, {\n    method: 'PUT',\n    body: JSON.stringify(body),\n    ...options\n  });\n}\n`;
      } else if (m === 'patch') {
        methodsCode += `\nexport async function modificar${serviceNameCapitalized}<T>(id: string | number, body: any, options?: any): Promise<T> {\n  return apiClient<T>(\`\${'${endpoint}'}/\${id}\`, {\n    method: 'PATCH',\n    body: JSON.stringify(body),\n    ...options\n  });\n}\n`;
      } else if (m === 'del' || m === 'delete') {
        methodsCode += `\nexport async function eliminar${serviceNameCapitalized}<T>(id: string | number, options?: any): Promise<T> {\n  return apiClient<T>(\`\${'${endpoint}'}/\${id}\`, {\n    method: 'DELETE',\n    ...options\n  });\n}\n`;
      }
    }

    fileContent = `import { apiClient } from './apiClient';

// Métodos de API autogenerados para el endpoint: ${endpoint}
${methodsCode}`;
  } else {
    // Servicio genérico vacío
    fileContent = `// Lógica de servicio para ${serviceName}
export const ${serviceName}Service = {
  // definir métodos del servicio aquí
};
`;
  }

  const serviceFilePath = path.join(rutas.services, fileName);
  const barrelPath = path.join(rutas.services, 'index.ts');
  const exportBase = fileName.replace(/\.tsx?$/, '');

  console.log(`\n=== Comando SERVICE: Crear Servicio ===`);
  console.log(`Nombre: ${serviceName}`);
  console.log(`Tipo: ${modeMessage}`);
  console.log(`Archivo: ${serviceFilePath}`);

  if (dryRun) {
    console.log('\n[SIMULACIÓN] Directorios y archivos que se crearían:');
    console.log(`  [FILE] ${serviceFilePath}`);
    updateBarrelFile(barrelPath, `export * from "./${exportBase}";`, true);
  } else {
    // Crear el directorio de servicios si no existe
    if (!fs.existsSync(rutas.services)) {
      fs.mkdirSync(rutas.services, { recursive: true });
      console.log(`Creado directorio: ${rutas.services}`);
    }

    if (fs.existsSync(serviceFilePath)) {
      console.error(`Error: El servicio "${fileName}" ya existe en ${serviceFilePath}`);
      return;
    }

    fs.writeFileSync(serviceFilePath, fileContent, 'utf-8');
    console.log(`Creado archivo: ${serviceFilePath}`);

    // Actualizar index.ts de servicios
    updateBarrelFile(barrelPath, `export * from "./${exportBase}";`, false);

    console.log('\n¡Servicio creado y exportaciones indexadas con éxito!');
  }
}
