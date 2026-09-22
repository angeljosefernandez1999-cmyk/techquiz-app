#!/usr/bin/env node
/* ==========================================================================
   TechQuiz — respaldo al disco
   Copia el registro del proyecto y el repositorio completo a una carpeta del
   disco, una por proyecto. Autónomo: no depende de nada instalado aparte.

   Dónde escribe, por orden de prioridad:
     1. CLAUDE_RESPALDO_DIR (variable de entorno)
     2. ~/.claude/respaldo.json  ->  { "disco": "D:/ClaudeRespaldos" }
     3. ~/ClaudeRespaldos

   Uso:  node tools/respaldo.mjs            respalda ahora
         node tools/respaldo.mjs --donde     dónde iría y si es accesible
   Si el disco no es accesible (sesión remota), avisa y no falla.
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';

const sh = (c, cwd) => {
  try { return execSync(c, { encoding: 'utf8', cwd, stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
};

const raiz = sh('git rev-parse --show-toplevel') || process.cwd();
const proyecto = basename(raiz);

function carpetaDisco() {
  if (process.env.CLAUDE_RESPALDO_DIR) return resolve(process.env.CLAUDE_RESPALDO_DIR);
  const cfg = join(homedir(), '.claude', 'respaldo.json');
  if (existsSync(cfg)) {
    try { const d = JSON.parse(readFileSync(cfg, 'utf8')).disco; if (d) return resolve(d); }
    catch { /* config ilegible: se usa el defecto */ }
  }
  return join(homedir(), 'ClaudeRespaldos');
}

const disco = carpetaDisco();
let accesible = true;
try { mkdirSync(disco, { recursive: true }); } catch { accesible = false; }

const ahora = () => new Date().toISOString().slice(0, 16).replace('T', ' ');
const sello = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

if (process.argv.includes('--donde')) {
  console.log(`disco:    ${disco}`);
  console.log(`proyecto: ${join(disco, proyecto)}`);
  console.log(`estado:   ${accesible ? 'accesible' : 'NO accesible (¿sesión remota?)'}`);
  process.exit(0);
}

if (!accesible) {
  if (!process.argv.includes('--silencioso')) {
    console.log(`respaldo: ${disco} no es accesible desde aquí (sesión remota).`);
    console.log('El registro queda en .claude/ y viaja por git.');
  }
  process.exit(0);
}

const destino = join(disco, proyecto);
mkdirSync(join(destino, 'sesiones'), { recursive: true });

/* --- registro del proyecto ------------------------------------------------ */
const copiados = [];
for (const [src, nombre] of [
  ['.claude/BITACORA.md', 'BITACORA.md'], ['.claude/MAPA.md', 'MAPA.md'],
  ['.claude/PROMPTS.md', 'PROMPTS.md'], ['CLAUDE.md', 'CLAUDE.md'], ['README.md', 'README.md']
]) {
  const abs = join(raiz, src);
  if (existsSync(abs)) { copyFileSync(abs, join(destino, nombre)); copiados.push(nombre); }
}

/* --- repositorio completo en un fichero restaurable ---------------------- */
let bundle = 'omitido';
if (sh('git rev-parse --is-inside-work-tree', raiz) === 'true') {
  try {
    execSync(`git bundle create "${join(destino, 'repo.bundle')}" --all`,
      { cwd: raiz, stdio: ['ignore', 'ignore', 'ignore'] });
    bundle = (statSync(join(destino, 'repo.bundle')).size / 1024 / 1024).toFixed(1) + ' MB';
  } catch { bundle = 'falló'; }
}

/* --- resumen -------------------------------------------------------------- */
const rama = sh('git rev-parse --abbrev-ref HEAD', raiz) || '(sin rama)';
const head = sh('git rev-parse --short HEAD', raiz) || '(sin commit)';
const pendientes = sh('git status --porcelain --untracked-files=all', raiz).split('\n').filter(Boolean).length;
const bita = existsSync(join(raiz, '.claude', 'BITACORA.md'))
  ? readFileSync(join(raiz, '.claude', 'BITACORA.md'), 'utf8').split('\n## ')[1] : null;

const resumen = [
  `# ${proyecto} — ${ahora()}`, '',
  `- Rama: \`${rama}\` · HEAD \`${head}\``,
  `- Ficheros sin commitear: ${pendientes}`,
  `- Repositorio completo: \`repo.bundle\` (${bundle})`,
  `- Copiado: ${copiados.join(', ') || '(nada)'}`, '',
  '## Última entrada de la bitácora', '',
  bita ? '## ' + bita.trimEnd() : '(sin bitácora)', '',
  '## Restaurar', '', '```bash', `git clone repo.bundle ${proyecto}`, '```'
].join('\n');

writeFileSync(join(destino, 'ULTIMO.md'), resumen);
writeFileSync(join(destino, 'sesiones', `${sello()}.md`), resumen);

/* --- índice del disco ----------------------------------------------------- */
const proyectos = readdirSync(disco, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
writeFileSync(join(disco, 'INDICE.md'), [
  '# Respaldos de Claude', '', `Actualizado: ${ahora()} · ${proyectos.length} proyecto(s)`, '',
  ...proyectos.map((p) => {
    const u = join(disco, p, 'ULTIMO.md');
    const f = existsSync(u) ? statSync(u).mtime.toISOString().slice(0, 16).replace('T', ' ') : '—';
    const n = existsSync(join(disco, p, 'sesiones')) ? readdirSync(join(disco, p, 'sesiones')).length : 0;
    return `- **${p}** — última sesión ${f} · ${n} sesión(es) guardadas`;
  }), ''
].join('\n'));

console.log(`respaldo: ${destino} · ${copiados.length} fichero(s) · repo.bundle ${bundle}`);
