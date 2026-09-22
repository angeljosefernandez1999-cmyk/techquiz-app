#!/usr/bin/env node
/* ==========================================================================
   TechQuiz — Generador del mapa del código
   Escribe .claude/MAPA.md: índice de funciones con su línea, secciones de CSS,
   pantallas e ids del HTML e inventario del banco de preguntas.
   Uso:  node tools/mapa.mjs            (regenera el mapa)
         node tools/mapa.mjs --resumen  (una línea, para el hook de sesión)
   Se regenera solo; NO editar .claude/MAPA.md a mano.
   ========================================================================== */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SALIDA = '.claude/MAPA.md';
const JS = ['assets/js/audio.js', 'assets/js/data.js', 'assets/js/app.js'];
const soloResumen = process.argv.includes('--resumen');

const leer = (p) => { try { return readFileSync(p, 'utf8'); } catch { return ''; } };

/* --- funciones de cada fichero JS ----------------------------------------- */
function funciones(src) {
  const out = [];
  src.split('\n').forEach((l, i) => {
    let m = l.match(/^\s*function\s+([A-Za-z_$][\w$]*)\s*\(/);
    if (m) { out.push({ n: m[1], l: i + 1, tipo: 'fn' }); return; }
    m = l.match(/^\s{4}([A-Za-z_$][\w$]*)\s*:\s*function\s*\(/);
    if (m) out.push({ n: m[1], l: i + 1, tipo: 'metodo' });
  });
  return out;
}

/* --- secciones de CSS ----------------------------------------------------- */
function seccionesCss(src) {
  const out = [];
  src.split('\n').forEach((l, i) => {
    const m = l.match(/^\/\*\s*-+\s*(.+?)\s*-+\s*\*\/$/);
    if (m) out.push({ n: m[1], l: i + 1 });
  });
  return out;
}

function variablesCss(src) {
  const bloque = src.match(/:root\s*\{([\s\S]*?)\}/);
  if (!bloque) return [];
  return [...bloque[1].matchAll(/--([\w-]+)\s*:/g)].map((m) => '--' + m[1]);
}

/* --- pantallas e ids del HTML --------------------------------------------- */
function pantallas(src) {
  const lineas = src.split('\n');
  const out = [];
  let actual = null;
  lineas.forEach((l, i) => {
    const sec = l.match(/<section[^>]*id="([^"]+)"/);
    if (sec) { actual = { id: sec[1], l: i + 1, ids: [] }; out.push(actual); return; }
    if (/<\/section>/.test(l)) actual = null;
    const ids = [...l.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    if (actual) actual.ids.push(...ids);
  });
  return out;
}

function idsFuera(src, dentro) {
  const todos = [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const set = new Set(dentro);
  return todos.filter((i) => !set.has(i));
}

/* --- inventario de cursos ------------------------------------------------- */
function cursos() {
  const dir = 'data/cursos';
  const out = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.js')).sort()) {
    try {
      new Function('TQ', readFileSync(join(dir, f), 'utf8'))({
        curso: (d) => out.push({ ...d, _file: f })
      });
    } catch { /* lo reporta el validador */ }
  }
  return out;
}

/* --- construcción --------------------------------------------------------- */
const html = leer('index.html');
const css = leer('assets/css/style.css');
const pant = pantallas(html);
const listaCursos = cursos();
const totalPreg = listaCursos.reduce((n, c) => n + (c.preguntas?.length || 0), 0);
const cats = new Set();
listaCursos.forEach((c) => (c.preguntas || []).forEach((p) => cats.add(p.c)));

if (soloResumen) {
  console.log(`${listaCursos.length} cursos · ${totalPreg} preguntas · ${cats.size} categorías`);
  process.exit(0);
}

const hoy = new Date().toISOString().slice(0, 10);
const L = [];
L.push('# Mapa del código (autogenerado)');
L.push('');
L.push(`> Generado por \`node tools/mapa.mjs\` el ${hoy}. **No editar a mano.**`);
L.push('> Las líneas son orientativas: si no cuadran, regenera el mapa.');
L.push('');

/* JS */
for (const f of JS) {
  const src = leer(f);
  if (!src) continue;
  const fns = funciones(src);
  const lineas = src.split('\n').length;
  L.push(`## ${f} — ${lineas} líneas, ${fns.length} funciones`);
  L.push('');
  const cab = src.split('\n').slice(1, 5)
    .map((s) => s.replace(/[=*/]+/g, ' ').trim())
    .filter((s) => s.length > 3 && !s.includes('{')).join(' · ');
  if (cab) L.push(`_${cab}_`);
  L.push('');
  L.push('```');
  let linea = '';
  for (const fn of fns) {
    const tok = `${fn.n}:${fn.l}`.padEnd(26);
    if (linea.length + tok.length > 78) { L.push(linea.trimEnd()); linea = ''; }
    linea += tok;
  }
  if (linea.trim()) L.push(linea.trimEnd());
  L.push('```');
  L.push('');
}

/* CSS */
const secs = seccionesCss(css);
L.push(`## assets/css/style.css — ${css.split('\n').length} líneas`);
L.push('');
L.push('```');
L.push(secs.map((s) => `${s.n}:${s.l}`).join(' · '));
L.push('```');
L.push('');
L.push('Variables de `:root`: ' + variablesCss(css).map((v) => `\`${v}\``).join(' '));
L.push('');

/* HTML */
L.push(`## index.html — ${html.split('\n').length} líneas`);
L.push('');
for (const p of pant) {
  L.push(`- **#${p.id}** (línea ${p.l}) — ${p.ids.length} ids`);
  if (p.ids.length) L.push('  `' + p.ids.join('` `') + '`');
}
const fuera = idsFuera(html, pant.flatMap((p) => p.ids).concat(pant.map((p) => p.id)));
if (fuera.length) {
  L.push(`- **fuera de pantallas** (topbar, overlays) — ${fuera.length} ids`);
  L.push('  `' + fuera.join('` `') + '`');
}
L.push('');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
L.push('Orden de `<script>`: ' + scripts.map((s) => `\`${s.replace('assets/js/', '').replace('data/cursos/', '')}\``).join(' → '));
L.push('');

/* Cursos */
L.push(`## Banco de preguntas — ${listaCursos.length} cursos, ${totalPreg} preguntas, ${cats.size} categorías`);
L.push('');
L.push('| Fichero | id | Curso | Preguntas | Categorías |');
L.push('|---|---|---|---|---|');
for (const c of listaCursos) {
  const cc = [...new Set((c.preguntas || []).map((p) => p.c))];
  L.push(`| \`${c._file}\` | \`${c.id}\` | ${c.emoji || ''} ${c.nombre} | ${c.preguntas?.length || 0} | ${cc.join(' · ')} |`);
}
L.push('');

mkdirSync('.claude', { recursive: true });
writeFileSync(SALIDA, L.join('\n'));
console.log(`${SALIDA} regenerado — ${listaCursos.length} cursos · ${totalPreg} preguntas · ${cats.size} categorías`);
