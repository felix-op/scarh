import { CommandRegistry } from '../types';
import { appCommand } from './app';
import { componentCommand } from './component';
import { serviceCommand } from './service';
import { modelCommand } from './model';
import { genericCommand } from './generic';

export const commands: CommandRegistry[] = [
  {
    comando: 'app',
    abreviatura: 'a',
    descripcion: 'Genera una nueva página y ruta en el directorio website/app/(pages).',
    args: ['<rutaPage>'],
    flags: [
      { nombre: '--omit-loading', abreviatura: '-l', descripcion: 'Evita crear el archivo loading.tsx' },
      { nombre: '--omit-error', abreviatura: '-e', descripcion: 'Evita crear el archivo error.tsx' },
      { nombre: '--omit-not-found', abreviatura: '-nf', descripcion: 'Evita crear el archivo not-found.tsx' }
    ],
    examples: [
      'npm run generate app dashboard/admin --omit-error',
      'npm run g a dashboard/admin -e',
      'npm run g a (auth)/login -l -nf'
    ],
    fn: appCommand
  },
  {
    comando: 'component',
    abreviatura: 'c',
    descripcion: 'Genera un componente React estructurado en app/components y actualiza sus barrels.',
    args: ['<nombreComponente>'],
    flags: [
      { nombre: '--form', abreviatura: '-f', descripcion: 'Ubica el componente en app/components/forms/' },
      { nombre: '--layout', abreviatura: '-l', descripcion: 'Ubica el componente en app/components/layout/' },
      { nombre: '--ui', abreviatura: '-u', descripcion: 'Ubica el componente en app/components/ui/' },
      { nombre: '--modal', abreviatura: '-m', descripcion: 'Ubica el componente en app/components/modals/' }
    ],
    examples: [
      'npm run generate component BotonPersonalizado --ui',
      'npm run g c ConfirmDeleteModal -m'
    ],
    fn: componentCommand
  },
  {
    comando: 'service',
    abreviatura: 's',
    descripcion: 'Genera un archivo de servicios, un cliente HTTP basado en API o un Context Provider en app/services/.',
    args: ['<nombreServicio>'],
    flags: [
      { nombre: '--provider', abreviatura: '-p', descripcion: 'Genera un React Context Provider y su hook de consumo' },
      { nombre: '--api', abreviatura: '-api', descripcion: 'Especifica los métodos CRUD deseados separados por coma (get,post,put,patch,del)' },
      { nombre: '--endpoint', abreviatura: '-endpoint', descripcion: 'Especifica la URL base o endpoint asociado al servicio de la API' }
    ],
    examples: [
      'npm run g s usuarios -api get,put,patch,del,post -endpoint users',
      'npm run g s autenticacion -p'
    ],
    fn: serviceCommand
  },
  {
    comando: 'model',
    abreviatura: 'm',
    descripcion: 'Genera interfaces de tipos o enums de TypeScript en app/models/ agregándolos al final del archivo si ya existe.',
    args: ['<nombreModelo/Enum>', '<archivo>', '[propiedades:tipo]'],
    flags: [
      { nombre: '--enum', abreviatura: '-enum', descripcion: 'Genera un enum / tipo unión de valores en un archivo separado' }
    ],
    examples: [
      'npm run g m UsuarioPostResponse usuarios id:n,nombre:s,activo:b,roles:"admin"|"user"',
      'npm run g m -enum EstadoUsuario usuarios 0, "suspendido", string, s, number, n'
    ],
    fn: modelCommand
  },
  {
    comando: 'hook',
    abreviatura: 'h',
    descripcion: 'Genera un Hook de React personalizado en app/hooks/ y actualiza su barrel.',
    args: ['<nombreHook>'],
    flags: [],
    examples: [
      'npm run generate hook useAuth',
      'npm run g h useWindowSize'
    ],
    fn: (rutas, args, flags, dryRun) => genericCommand('hooks', rutas, args, flags, dryRun)
  },
  {
    comando: 'screen',
    abreviatura: 'scr',
    descripcion: 'Genera una Screen visual en app/screens/ y actualiza su barrel.',
    args: ['<nombreScreen>'],
    flags: [],
    examples: [
      'npm run generate screen DashboardOverview',
      'npm run g scr UserSettings'
    ],
    fn: (rutas, args, flags, dryRun) => genericCommand('screens', rutas, args, flags, dryRun)
  },
  {
    comando: 'style',
    abreviatura: 'sty',
    descripcion: 'Genera un archivo de estilos CSS en app/styles/ y actualiza su barrel.',
    args: ['<nombreEstilo>'],
    flags: [],
    examples: [
      'npm run g sty sidebar',
      'npm run generate style custom-button'
    ],
    fn: (rutas, args, flags, dryRun) => genericCommand('styles', rutas, args, flags, dryRun)
  },
  {
    comando: 'utils',
    abreviatura: 'ut',
    descripcion: 'Genera funciones utilitarias en app/utils/ y actualiza su barrel.',
    args: ['<nombreUtil>'],
    flags: [],
    examples: [
      'npm run g ut formatters',
      'npm run generate utils date-helpers'
    ],
    fn: (rutas, args, flags, dryRun) => genericCommand('utils', rutas, args, flags, dryRun)
  }
];
