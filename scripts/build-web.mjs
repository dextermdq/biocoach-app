/**
 * Build web para GitHub Pages.
 *
 * `expo export` regenera docs/index.html en cada corrida, así que todo lo que
 * agregamos a mano (manifest, íconos, meta de iOS) se inyecta acá después del
 * export. Correr con: npm run build:web
 */
import { execSync } from 'node:child_process';
import { copyFileSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const OUT = 'docs';
const BASE = '/biocoach-app';

console.log('› exportando web…');
rmSync(OUT, { recursive: true, force: true });
execSync(`npx expo export --platform web --output-dir ${OUT}`, { stdio: 'inherit' });

// Sin esto GitHub Pages pasa el sitio por Jekyll, que ignora las carpetas que
// empiezan con guion bajo: el bundle vive en _expo/ y daría 404.
writeFileSync(`${OUT}/.nojekyll`, '');

copyFileSync('assets/icon.png', `${OUT}/icon.png`);

const manifest = {
  name: 'BioCoach',
  short_name: 'BioCoach',
  description: 'Tu semana de entrenamiento, con animaciones y registro de pesos.',
  start_url: `${BASE}/`,
  scope: `${BASE}/`,
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#EEF1EC',
  theme_color: '#EEF1EC',
  icons: [
    { src: `${BASE}/icon.png`, sizes: '1024x1024', type: 'image/png', purpose: 'any' },
    { src: `${BASE}/icon.png`, sizes: '1024x1024', type: 'image/png', purpose: 'maskable' },
  ],
};
writeFileSync(`${OUT}/manifest.webmanifest`, JSON.stringify(manifest, null, 2));

const head = [
  `<link rel="manifest" href="${BASE}/manifest.webmanifest">`,
  `<meta name="theme-color" content="#EEF1EC">`,
  `<meta name="mobile-web-app-capable" content="yes">`,
  // iOS todavía necesita las suyas para abrir sin la barra de Safari.
  `<meta name="apple-mobile-web-app-capable" content="yes">`,
  `<meta name="apple-mobile-web-app-status-bar-style" content="default">`,
  `<meta name="apple-mobile-web-app-title" content="BioCoach">`,
  `<link rel="apple-touch-icon" href="${BASE}/icon.png">`,
].join('\n    ');

const file = `${OUT}/index.html`;
const html = readFileSync(file, 'utf8');
if (!html.includes('</head>')) throw new Error('El index.html exportado no tiene </head>');
writeFileSync(file, html.replace('</head>', `  ${head}\n  </head>`));

console.log(`✓ ${OUT}/ listo para GitHub Pages`);
