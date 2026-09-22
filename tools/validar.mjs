#!/usr/bin/env node
/* ==========================================================================
   TechQuiz — Validador del banco de preguntas
   Uso:  node tools/validar.mjs           (informe completo)
         node tools/validar.mjs --resumen (solo conteos)
   Sale con código 1 si hay errores. Sin dependencias.
   ========================================================================== */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'data/cursos';
const DIFS = ['basico', 'medio', 'avanzado'];
const soloResumen = process.argv.includes('--resumen');

const errores = [];
const avisos = [];
const cursos = [];

const err = (f, m) => errores.push(`${f}: ${m}`);
const avi = (f, m) => avisos.push(`${f}: ${m}`);

/* --- carga: los ficheros de curso llaman a TQ.curso({...}) ---------------- */
const ficheros = readdirSync(DIR).filter((f) => f.endsWith('.js')).sort();

for (const f of ficheros) {
  const code = readFileSync(join(DIR, f), 'utf8');
  try {
    new Function('TQ', code)({ curso: (def) => cursos.push({ ...def, _file: f }) });
  } catch (e) {
    err(f, `no se puede evaluar (¿sintaxis?): ${e.message}`);
  }
}

/* --- validación ----------------------------------------------------------- */
const idsVistos = new Map();
const textoVisto = new Map();
const porCategoria = new Map();
const porDificultad = new Map();

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').replace(/[¿?¡!.,;:]/g, '').trim();

for (const c of cursos) {
  const f = c._file;

  if (!c.id) err(f, 'curso sin "id"');
  else if (idsVistos.has(c.id)) err(f, `id de curso duplicado "${c.id}" (ya en ${idsVistos.get(c.id)})`);
  else idsVistos.set(c.id, f);

  if (!c.nombre) err(f, 'curso sin "nombre"');
  if (!c.emoji) avi(f, 'curso sin "emoji" (se usará 📘)');
  if (!c.desc) avi(f, 'curso sin "desc"');
  if (!Array.isArray(c.preguntas) || !c.preguntas.length) { err(f, 'curso sin preguntas'); continue; }

  c.preguntas.forEach((p, i) => {
    const ref = `${f} #${i + 1}`;
    const corta = String(p.q || '').slice(0, 55);

    if (!p.q || !String(p.q).trim()) err(ref, 'pregunta vacía ("q")');
    if (!Array.isArray(p.o)) { err(ref, `"o" no es un array — ${corta}`); return; }
    if (p.o.length < 2 || p.o.length > 6) err(ref, `${p.o.length} opciones (se admiten 2-6) — ${corta}`);
    if (p.o.some((o) => !String(o).trim())) err(ref, `opción vacía — ${corta}`);

    const opts = p.o.map(norm);
    if (new Set(opts).size !== opts.length) err(ref, `opciones repetidas — ${corta}`);

    if (!Number.isInteger(p.r)) err(ref, `"r" debe ser un entero, no ${JSON.stringify(p.r)} — ${corta}`);
    else if (p.r < 0 || p.r >= p.o.length) err(ref, `"r": ${p.r} fuera de rango 0-${p.o.length - 1} — ${corta}`);

    if (!DIFS.includes(p.d)) err(ref, `"d": ${JSON.stringify(p.d)} no es ${DIFS.join('|')} — ${corta}`);
    if (!p.c || !String(p.c).trim()) err(ref, `sin categoría "c" — ${corta}`);
    if (!p.e || String(p.e).trim().length < 15) avi(ref, `explicación ausente o muy corta — ${corta}`);

    const k = norm(p.q);
    if (textoVisto.has(k)) err(ref, `enunciado duplicado (ya en ${textoVisto.get(k)}) — ${corta}`);
    else textoVisto.set(k, ref);

    const cat = p.c || '(sin categoría)';
    porCategoria.set(cat, (porCategoria.get(cat) || 0) + 1);
    porDificultad.set(p.d, (porDificultad.get(p.d) || 0) + 1);
  });
}

/* --- ¿está cada fichero cargado en index.html? ---------------------------- */
let html = '';
try { html = readFileSync('index.html', 'utf8'); } catch { avi('index.html', 'no encontrado'); }
if (html) {
  for (const f of ficheros) {
    if (!html.includes(`${DIR}/${f}`)) err('index.html', `falta <script src="${DIR}/${f}"></script>`);
  }
}

/* --- informe -------------------------------------------------------------- */
const total = cursos.reduce((n, c) => n + (c.preguntas?.length || 0), 0);

console.log(`\nTechQuiz — ${cursos.length} cursos, ${total} preguntas, ${porCategoria.size} categorías\n`);
for (const c of cursos) {
  console.log(`  ${(c.emoji || '📘')} ${String(c.nombre).padEnd(32)} ${String(c.preguntas?.length || 0).padStart(4)}  ${c._file}`);
}
console.log('\n  Dificultad: ' + DIFS.map((d) => `${d} ${porDificultad.get(d) || 0}`).join(' · '));

if (!soloResumen) {
  console.log('\n  Categorías:');
  [...porCategoria.entries()].sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`    ${String(n).padStart(4)}  ${c}`));
}

if (avisos.length) {
  console.log(`\n⚠  ${avisos.length} aviso(s):`);
  avisos.slice(0, 40).forEach((a) => console.log('   · ' + a));
  if (avisos.length > 40) console.log(`   … y ${avisos.length - 40} más`);
}

if (errores.length) {
  console.log(`\n✗ ${errores.length} error(es):`);
  errores.forEach((e) => console.log('   · ' + e));
  console.log('');
  process.exit(1);
}

console.log('\n✓ Banco de preguntas válido\n');
