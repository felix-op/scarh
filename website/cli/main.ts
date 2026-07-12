import { parse } from 'path';
import { ParsedInput, CommandRegistry } from './types';
import { rutas } from './routes';
import { commands } from './commands';

// Función para clasificar los tokens de entrada
export function parseArguments(argv: string[]): ParsedInput {
  const tokens = argv.slice(2);
  
  if (tokens.length === 0) {
    return { comando: '', args: [], flags: [] };
  }

  const flags: string[] = [];
  const rawArgs: string[] = [];

  for (const token of tokens) {
    if (token.startsWith('-')) {
      flags.push(token);
    } else {
      rawArgs.push(token);
    }
  }

  // El primer argumento posicional que no es bandera se considera el comando
  const firstNonFlagIndex = tokens.findIndex(t => !t.startsWith('-'));
  let comando = '';
  let args: string[] = [];

  if (firstNonFlagIndex !== -1) {
    comando = tokens[firstNonFlagIndex];
    // Los argumentos reales son los argumentos posicionales restantes
    args = rawArgs.filter(arg => arg !== comando);
  }

  return { comando, args, flags };
}

// Imprime la ayuda interactiva por pantalla
function printHelp() {
  console.log('\n======================================================');
  console.log('          CLI DE DESARROLLO - SCARH (Next.js 16)      ');
  console.log('======================================================');
  console.log('Uso: npm run g <comando> [argumentos] [flags]\n');
  console.log('Banderas globales:');
  console.log('  -d, --dry-run       Simula el comando sin escribir en el disco.\n');
  console.log('Comandos disponibles:\n');

  for (const cmd of commands) {
    const aliasStr = cmd.abreviatura ? ` (alias: ${cmd.abreviatura})` : '';
    console.log(`* comando: ${cmd.comando}${aliasStr}`);
    console.log(`  Descripción: ${cmd.descripcion}`);
    console.log(`  Argumentos:  ${cmd.args.join(' ')}`);
    
    if (cmd.flags.length > 0) {
      console.log('  Banderas:');
      for (const flag of cmd.flags) {
        console.log(`    ${flag.abreviatura.padEnd(4)} o ${flag.nombre.padEnd(16)} - ${flag.descripcion}`);
      }
    }
    
    console.log('  Ejemplos:');
    for (const ex of cmd.examples) {
      console.log(`    $ ${ex}`);
    }
    console.log('------------------------------------------------------');
  }
}

async function main() {
  const { comando, args, flags } = parseArguments(process.argv);
  
  // Detectar bandera dryRun / simulación
  const dryRun = flags.includes('-d') || flags.includes('--dry-run');

  if (!comando) {
    printHelp();
    return;
  }

  // Buscar el comando por nombre o abreviatura
  const matchedCommand = commands.find(
    cmd => cmd.comando === comando.toLowerCase() || cmd.abreviatura === comando.toLowerCase()
  );

  if (!matchedCommand) {
    console.error(`\nError: Comando "${comando}" no reconocido.`);
    printHelp();
    process.exit(1);
  }

  try {
    await matchedCommand.fn(rutas, args, flags, dryRun);
  } catch (error) {
    console.error('\nOcurrió un error inesperado ejecutando el comando:', error);
    process.exit(1);
  }
}

main();
