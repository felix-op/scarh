import path from 'path';

// Dado que routes.ts se encuentra en website/cli/, su directorio padre es website/
const baseDir = path.resolve(__dirname, '..');

export const rutas = {
  root: baseDir,
  app: path.join(baseDir, 'app'),
  pages: path.join(baseDir, 'app', '(pages)'),
  components: path.join(baseDir, 'app', 'components'),
  hooks: path.join(baseDir, 'app', 'hooks'),
  models: path.join(baseDir, 'app', 'models'),
  screens: path.join(baseDir, 'app', 'screens'),
  services: path.join(baseDir, 'app', 'services'),
  styles: path.join(baseDir, 'app', 'styles'),
  utils: path.join(baseDir, 'app', 'utils'),
};
