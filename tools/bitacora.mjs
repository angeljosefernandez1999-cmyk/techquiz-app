#!/usr/bin/env node
/* ==========================================================================
   TechQuiz — Bitácora de cambios
   Registra qué se hizo, por qué y dónde, para que la siguiente sesión no
   tenga que reconstruirlo leyendo el repositorio.

   Uso:  node tools/bitacora.mjs "Título del cambio" "detalle" "otro detalle"
         node tools/bitacora.mjs --ultimas 3     (lee las N últimas entradas)

   La rama, el commit, la fecha y los ficheros tocados se detectan solos.
   Las entradas nuevas van arriba (lo más reciente primero).
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const RUTA = '.claude/BITACORA.md';
const CABECERA = [
  '# Bitácora de TechQuiz',
  '',
  'Registro de cambios, decisiones y sitios tocados. Lo más reciente, arriba.',
  'Se escribe con `node tools/bitacora.mjs "Título" "detalle" …` al terminar cada tarea.',
  'Léela antes de explorar el repositorio: suele contestar el «por qué» que el código no cuenta.',
  '',
  '---',
  ''
].join('\n');

const sh = (cmd) => { try { return execSync(cmd, { encoding: 'utf8' }).trim(); } catch { return ''; } };

/* --- lectura -------------------------------------------------------------- */
const args = process.argv.slice(2);
const iUlt = args.indexOf('--ultimas');

if (iUlt !== -1) {
  if (!existsSync(RUTA)) { console.log('Sin bitácora todavía.'); process.exit(0); }
  const n = parseInt(args[iUlt + 1], 10) || 3;
  const cuerpo = readFileSync(RUTA, 'utf8').split('\n## ').slice(1, n + 1);
  console.log(cuerpo.length ? '## ' + cuerpo.join('\n## ').trimEnd() : 'Sin entradas todavía.');
  process.exit(0);
}

/* --- escritura ------------------------------------------------------------ */
const titulo = args[0];
if (!titulo) {
  console.error('Falta el título.\n  node tools/bitacora.mjs "Título" "detalle" "detalle"\n  node tools/bitacora.mjs --ultimas 3');
  process.exit(2);
}
const detalles = args.slice(1).filter((a) => !a.startsWith('--'));

const fecha = new Date().toISOString().slice(0, 10);
const rama = sh('git rev-parse --abbrev-ref HEAD') || '(sin rama)';
const commit = sh('git rev-parse --short HEAD') || '(sin commit)';

/* Ficheros: lo que hay sin commitear; si está limpio, lo del último commit. */
const limpiar = (l) => l.replace(/^\s*[A-Z?!]{1,2}\s+/, '').split(' -> ').pop()
  .replace(/^"|"$/g, '').trim();
let ficheros = sh('git status --porcelain --untracked-files=all')
  .split('\n').filter(Boolean).map(limpiar);
let origen = 'sin commitear';
if (!ficheros.length) {
  ficheros = sh('git show --name-only --format= HEAD').split('\n').filter(Boolean);
  origen = `commit ${commit}`;
}
ficheros = [...new Set(ficheros)].filter((f) => f !== '.claude/BITACORA.md').sort();

const entrada = [
  `## ${fecha} · ${titulo}`,
  '',
  `**Rama** \`${rama}\` · **commit** \`${commit}\``,
  ''
];
if (detalles.length) {
  detalles.forEach((d) => entrada.push(`- ${d}`));
  entrada.push('');
}
if (ficheros.length) {
  entrada.push(`**Ficheros** (${origen}): ` + ficheros.map((f) => `\`${f}\``).join(' '));
  entrada.push('');
}

mkdirSync('.claude', { recursive: true });
const previo = existsSync(RUTA) ? readFileSync(RUTA, 'utf8') : CABECERA;
const corte = previo.indexOf('\n## ');
const cabecera = corte === -1 ? previo.trimEnd() + '\n' : previo.slice(0, corte + 1);
const resto = corte === -1 ? '' : previo.slice(corte + 1);

writeFileSync(RUTA, cabecera + '\n' + entrada.join('\n') + resto);
console.log(`${RUTA}: registrada «${titulo}» (${ficheros.length} fichero(s))`);
