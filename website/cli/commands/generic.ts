import fs from 'fs';
import path from 'path';

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

export function genericCommand(
  targetFolderKey: 'hooks' | 'screens' | 'styles' | 'utils',
  rutas: Record<string, string>,
  args: string[],
  flags: string[],
  dryRun: boolean
) {
  if (args.length === 0) {
    console.error(`Error: Debes especificar el nombre a crear en la carpeta "${targetFolderKey}". Ej: miRecurso`);
    return;
  }

  const name = args[0];
  const targetDir = rutas[targetFolderKey];
  
  let ext = '.ts';
  let fileContent = '';

  if (targetFolderKey === 'hooks') {
    ext = '.ts';
    fileContent = `export function ${name}() {\n  // Lógica del hook\n  return null;\n}\n`;
  } else if (targetFolderKey === 'screens') {
    ext = '.tsx';
    fileContent = `export function ${name}() {\n  return (\n    <div>\n      ${name} Screen Works!\n    </div>\n  );\n}\n`;
  } else {
    ext = '.ts';
    fileContent = `// Código para ${name}\nexport {};\n`;
  }

  const fileName = `${name}${ext}`;
  const filePath = path.join(targetDir, fileName);
  const barrelPath = path.join(targetDir, 'index.ts');

  console.log(`\n=== Comando ${targetFolderKey.toUpperCase()}: Crear Recurso ===`);
  console.log(`Nombre: ${name}`);
  console.log(`Archivo destino: ${filePath}`);

  if (dryRun) {
    console.log('\n[SIMULACIÓN] Directorios y archivos que se crearían:');
    console.log(`  [FILE] ${filePath}`);
    updateBarrelFile(barrelPath, `export * from "./${name}";`, true);
  } else {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      console.error(`Error: El archivo "${fileName}" ya existe en ${filePath}`);
      return;
    }

    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(`Creado archivo: ${filePath}`);

    // Actualizar index.ts de la carpeta
    updateBarrelFile(barrelPath, `export * from "./${name}";`, false);

    console.log(`\n¡Recurso en "${targetFolderKey}" creado e indexado con éxito!`);
  }
}
