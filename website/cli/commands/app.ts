import fs from 'fs';
import path from 'path';

function hasFlag(flags: string[], short: string, long: string): boolean {
  return flags.includes(short) || flags.includes(long);
}

export function appCommand(
  rutas: Record<string, string>,
  args: string[],
  flags: string[],
  dryRun: boolean
) {
  if (args.length === 0) {
    console.error('Error: Debes especificar el nombre de la página o ruta. Ej: dashboard/usuarios');
    return;
  }

  const routePath = args[0];
  const targetDir = path.join(rutas.pages, routePath);

  const omitLoading = hasFlag(flags, '-l', '--omit-loading');
  const omitError = hasFlag(flags, '-e', '--omit-error');
  const omitNotFound = hasFlag(flags, '-nf', '--omit-not-found');

  console.log(`\n=== Comando APP: Crear Página/Ruta ===`);
  console.log(`Ruta solicitada: ${routePath}`);
  console.log(`Directorio destino: ${targetDir}`);
  console.log(`Omisiones: Loading (${omitLoading}), Error (${omitError}), Not-Found (${omitNotFound})`);

  const filesToCreate = [
    { name: 'page.tsx', content: `export default function Page() {\n  return (\n    <div>\n      <h1>Page works!</h1>\n    </div>\n  );\n}\n` }
  ];

  if (!omitLoading) {
    filesToCreate.push({
      name: 'loading.tsx',
      content: `export default function Loading() {\n  return <div>Cargando...</div>;\n}\n`
    });
  }

  if (!omitError) {
    filesToCreate.push({
      name: 'error.tsx',
      content: `'use client';\n\nimport { useEffect } from 'react';\n\nexport default function Error({\n  error,\n  reset,\n}: {\n  error: Error & { digest?: string };\n  reset: () => void;\n}) {\n  useEffect(() => {\n    console.error(error);\n  }, [error]);\n\n  return (\n    <div>\n      <h2>¡Algo salió mal!</h2>\n      <button onClick={() => reset()}>Intentar de nuevo</button>\n    </div>\n  );\n}\n`
    });
  }

  if (!omitNotFound) {
    filesToCreate.push({
      name: 'not-found.tsx',
      content: `import Link from 'next/link';\n\nexport default function NotFound() {\n  return (\n    <div>\n      <h2>No encontrado</h2>\n      <p>No se pudo encontrar el recurso solicitado</p>\n      <Link href="/">Volver al inicio</Link>\n    </div>\n  );\n}\n`
    });
  }

  if (dryRun) {
    console.log('\n[SIMULACIÓN] Directorios y archivos que se crearían:');
    console.log(`  [DIR]  ${targetDir}`);
    for (const file of filesToCreate) {
      console.log(`  [FILE] ${path.join(targetDir, file.name)}`);
    }
    console.log('\n[SIMULACIÓN] No se realizaron cambios en el disco.');
  } else {
    // Crear directorio de forma recursiva
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Creado directorio: ${targetDir}`);

    // Escribir los archivos
    for (const file of filesToCreate) {
      const filePath = path.join(targetDir, file.name);
      fs.writeFileSync(filePath, file.content, 'utf-8');
      console.log(`Creado archivo: ${filePath}`);
    }
    console.log('\n¡Página y archivos complementarios creados con éxito!');
  }
}
