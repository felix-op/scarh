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

  // Normalizar saltos de línea y limpiar espacios
  const lines = content.split('\n').map(l => l.trim());

  if (lines.includes(exportLine.trim()) || lines.some(l => l.replace(/['"]/g, "'") === exportLine.replace(/['"]/g, "'").trim())) {
    console.log(`  [BARREL-SKIP] La línea de exportación ya existe en: ${barrelPath}`);
    return;
  }

  // Agregar exportación al final
  const newContent = content.endsWith('\n') || content === '' 
    ? `${content}${exportLine}\n` 
    : `${content}\n${exportLine}\n`;

  fs.writeFileSync(barrelPath, newContent, 'utf-8');
  console.log(`  [BARREL-OK] Archivo barrel actualizado: ${barrelPath}`);
}

export function componentCommand(
  rutas: Record<string, string>,
  args: string[],
  flags: string[],
  dryRun: boolean
) {
  if (args.length === 0) {
    console.error('Error: Debes especificar el nombre del componente. Ej: BotonPersonalizado');
    return;
  }

  const componentName = args[0];

  // Determinar la subcarpeta destino según el flag
  let subDirName = '';
  if (hasFlag(flags, '-f', '--form')) subDirName = 'forms';
  else if (hasFlag(flags, '-l', '--layout')) subDirName = 'layout';
  else if (hasFlag(flags, '-u', '--ui')) subDirName = 'ui';
  else if (hasFlag(flags, '-m', '--modal')) subDirName = 'modals';

  if (!subDirName) {
    console.error('Error: Debes especificar la clasificación del componente mediante uno de los siguientes flags:');
    console.error('  -f, --form     para componentes en app/components/forms/');
    console.error('  -l, --layout   para componentes en app/components/layout/');
    console.error('  -u, --ui       para componentes en app/components/ui/');
    console.error('  -m, --modal    para componentes en app/components/modals/');
    return;
  }

  const targetDir = path.join(rutas.components, subDirName);
  const componentFilePath = path.join(targetDir, `${componentName}.tsx`);
  const subBarrelPath = path.join(targetDir, 'index.ts');
  const globalBarrelPath = path.join(rutas.components, 'index.ts');

  console.log(`\n=== Comando COMPONENT: Crear Componente ===`);
  console.log(`Nombre: ${componentName}`);
  console.log(`Subcarpeta de clasificación: ${subDirName}`);
  console.log(`Ruta del archivo: ${componentFilePath}`);

  const componentContent = `export interface ${componentName}Props {
  // definir props aquí
}

export function ${componentName}({}: ${componentName}Props) {
  return (
    <div>
      ${componentName} Works!
    </div>
  );
}
`;

  if (dryRun) {
    console.log('\n[SIMULACIÓN] Directorios y archivos que se crearían:');
    console.log(`  [DIR]  ${targetDir}`);
    console.log(`  [FILE] ${componentFilePath}`);
    updateBarrelFile(subBarrelPath, `export { ${componentName} } from "./${componentName}";`, true);
    updateBarrelFile(globalBarrelPath, `export * from "./${subDirName}";`, true);
  } else {
    // Crear el directorio si no existe
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Creado directorio: ${targetDir}`);
    }

    // Crear el archivo del componente
    if (fs.existsSync(componentFilePath)) {
      console.error(`Error: El componente "${componentName}" ya existe en ${componentFilePath}`);
      return;
    }
    fs.writeFileSync(componentFilePath, componentContent, 'utf-8');
    console.log(`Creado archivo: ${componentFilePath}`);

    // Actualizar index.ts de la subcarpeta
    updateBarrelFile(subBarrelPath, `export { ${componentName} } from "./${componentName}";`, false);

    // Actualizar index.ts global de componentes
    updateBarrelFile(globalBarrelPath, `export * from "./${subDirName}";`, false);

    console.log('\n¡Componente creado y exportaciones indexadas con éxito!');
  }
}
