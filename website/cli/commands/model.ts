import fs from 'fs';
import path from 'path';

function hasFlag(flags: string[], short: string, long: string): boolean {
  return flags.includes(short) || flags.includes(long);
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

// Mapear tipos abreviados
function mapType(type: string): string {
  const t = type.trim();
  if (t === 's') return 'string';
  if (t === 'n') return 'number';
  if (t === 'b') return 'boolean';
  return t;
}

export function modelCommand(
  rutas: Record<string, string>,
  args: string[],
  flags: string[],
  dryRun: boolean
) {
  const isEnum = hasFlag(flags, '-enum', '--enum');

  if (isEnum) {
    // Procesar creación de Enum
    // Formato esperado: npm run g m -enum EstadoUsuario usuarios 0, "suspendido", string, s, number, n
    const argv = process.argv;
    const enumIdx = argv.findIndex(val => val === '-enum' || val === '--enum');
    
    if (enumIdx === -1 || enumIdx + 3 >= argv.length) {
      console.error('Error: Parámetros insuficientes para generar enum.');
      console.error('Uso: npm run g m -enum NombreEnum archivo [valores/tipos separados por coma]');
      return;
    }

    const enumName = argv[enumIdx + 1];
    const fileNameBase = argv[enumIdx + 2];
    
    // Todos los argumentos que vienen después del archivo son los valores del enum (excluyendo flags)
    const rawValues = argv
      .slice(enumIdx + 3)
      .filter(val => !val.startsWith('-'))
      .join(' ');
    // Separar por comas y limpiar espacios
    const parts = rawValues.split(',').map(p => p.trim()).filter(Boolean);

    // Mapear abreviaturas y remover duplicados
    const mappedParts = parts.map(p => mapType(p));
    const uniqueParts = Array.from(new Set(mappedParts));

    const enumFile = `enum.${fileNameBase}.ts`;
    const targetFilePath = path.join(rutas.models, enumFile);
    const barrelPath = path.join(rutas.models, 'index.ts');

    const enumContent = `export type ${enumName} = ${uniqueParts.join(' | ')};\n`;

    console.log(`\n=== Comando MODEL: Crear Enum/Tipo Unión ===`);
    console.log(`Nombre Enum: ${enumName}`);
    console.log(`Valores/Tipos: ${uniqueParts.join(' | ')}`);
    console.log(`Archivo: ${targetFilePath}`);

    if (dryRun) {
      console.log('\n[SIMULACIÓN] Directorios y archivos que se crearían:');
      console.log(`  [FILE] ${targetFilePath}`);
      console.log(`  [CONTENT]\n${enumContent}`);
      updateBarrelFile(barrelPath, `export * from "./enum.${fileNameBase}";`, true);
    } else {
      if (!fs.existsSync(rutas.models)) {
        fs.mkdirSync(rutas.models, { recursive: true });
      }

      fs.writeFileSync(targetFilePath, enumContent, 'utf-8');
      console.log(`Creado archivo: ${targetFilePath}`);

      updateBarrelFile(barrelPath, `export * from "./enum.${fileNameBase}";`, false);
      console.log('\n¡Enum/Tipo unión creado y exportado con éxito!');
    }
  } else {
    // Generación de Modelo Normal (Interface)
    // Formato: npm run g m UsuarioPostResponse usuarios id:n,nombre:s,activo:b
    // Filtrar flags de los argumentos
    const filteredArgs = args.filter(a => !a.startsWith('-'));

    if (filteredArgs.length < 2) {
      console.error('Error: Parámetros de modelo insuficientes.');
      console.error('Uso: npm run g m NombreModelo archivo [propiedades]');
      console.error('Ej: npm run g m UsuarioPostResponse usuarios id:n,nombre:s,activo:b');
      return;
    }

    const modelName = filteredArgs[0];
    const fileNameBase = filteredArgs[1];
    const rawProps = filteredArgs.slice(2).join(',');

    const modelFile = `model.${fileNameBase}.ts`;
    const targetFilePath = path.join(rutas.models, modelFile);
    const barrelPath = path.join(rutas.models, 'index.ts');

    // Parsear propiedades
    // id:n,nombre:s,activo:b -> id: number; nombre: string; activo: boolean;
    const propParts = rawProps.split(',').map(p => p.trim()).filter(Boolean);
    let interfaceProps = '';

    for (const part of propParts) {
      const colIdx = part.indexOf(':');
      if (colIdx === -1) {
        // No tiene tipo especificado, usar any
        interfaceProps += `  ${part}: any;\n`;
      } else {
        const propName = part.substring(0, colIdx).trim();
        const propTypeRaw = part.substring(colIdx + 1).trim();
        const propTypeMapped = mapType(propTypeRaw);
        interfaceProps += `  ${propName}: ${propTypeMapped};\n`;
      }
    }

    const modelContent = `export interface ${modelName} {\n${interfaceProps}}\n`;

    console.log(`\n=== Comando MODEL: Crear/Actualizar Modelo ===`);
    console.log(`Nombre Interfaz: ${modelName}`);
    console.log(`Archivo: ${targetFilePath}`);

    if (dryRun) {
      console.log('\n[SIMULACIÓN] Directorios y archivos que se crearían o modificarían:');
      console.log(`  [FILE] ${targetFilePath} (Se agregaría al final)`);
      console.log(`  [CONTENT]\n${modelContent}`);
      updateBarrelFile(barrelPath, `export * from "./model.${fileNameBase}";`, true);
    } else {
      if (!fs.existsSync(rutas.models)) {
        fs.mkdirSync(rutas.models, { recursive: true });
      }

      let existingContent = '';
      if (fs.existsSync(targetFilePath)) {
        existingContent = fs.readFileSync(targetFilePath, 'utf-8');
        console.log(`El archivo ya existe. Agregando el nuevo modelo al final de: ${targetFilePath}`);
      }

      const separator = existingContent === '' || existingContent.endsWith('\n') ? '' : '\n';
      const finalContent = `${existingContent}${separator}${modelContent}`;

      fs.writeFileSync(targetFilePath, finalContent, 'utf-8');
      console.log(`Guardado archivo: ${targetFilePath}`);

      updateBarrelFile(barrelPath, `export * from "./model.${fileNameBase}";`, false);
      console.log('\n¡Modelo creado/actualizado y exportaciones indexadas con éxito!');
    }
  }
}
