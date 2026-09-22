#!/usr/bin/env node
/* ==========================================================================
   TechQuiz — Alta y ampliación de cursos
   Escribe el fichero del curso con el formato canónico, lo registra en
   index.html y refresca los conteos del README. Evita escribir la plantilla
   a mano y evita que el formato se desvíe entre cursos.

   Uso:
     node tools/curso.mjs curso.json          crea o fusiona según el id
     node tools/curso.mjs --en <id> pregs.json  añade preguntas a un curso
     node tools/curso.mjs --readme            solo refresca el README
     ... --dry                                enseña qué haría sin tocar nada

   curso.json:  { "nombre": "...", "emoji": "🗄️", "desc": "...",
                  "preguntas": [ { "q": "...", "o": ["A","B"], "r": 0,
                                   "d": "basico", "c": "Cat", "e": "..." } ] }
   pregs.json:  el array de preguntas suelto, o un objeto con "preguntas".
   ========================================================================== */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const DIR = 'data/cursos';
const ANCHO = 78;
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const soloReadme = args.includes('--readme');
const iEn = args.indexOf('--en');
const destino = iEn !== -1 ? args[iEn + 1] : null;
const json = args.find((a) => a.endsWith('.json'));

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').replace(/[¿?¡!.,;:]/g, '').trim();
const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

/* --- cursos existentes ---------------------------------------------------- */
function cargar() {
  const out = [];
  for (const f of readdirSync(DIR).filter((x) => x.endsWith('.js')).sort()) {
    new Function('TQ', readFileSync(join(DIR, f), 'utf8'))({
      curso: (d) => out.push({ ...d, _file: f })
    });
  }
  return out;
}

/* --- emisión canónica del fichero ----------------------------------------- */
function separador(cat) {
  const izq = '-'.repeat(30);
  const base = `    /* ${izq} ${cat} `;
  const der = '-'.repeat(Math.max(3, ANCHO - base.length - 3));
  return `${base}${der} */`;
}

function emitirPregunta(p) {
  const o = '[' + p.o.map(q).join(', ') + ']';
  return `    { q: ${q(p.q)}, o: ${o}, r: ${p.r}, d: ${q(p.d)}, c: ${q(p.c)}, e: ${q(p.e)} },`;
}

function emitir(c) {
  const cats = [...new Set(c.preguntas.map((p) => p.c))];
  const L = [`/* Curso: ${c.nombre} — banco de preguntas de TechQuiz */`, 'TQ.curso({'];
  L.push(`  id: ${q(c.id)},`);
  L.push(`  nombre: ${q(c.nombre)},`);
  L.push(`  emoji: ${q(c.emoji || '📘')},`);
  L.push(`  desc: ${q(c.desc || '')},`);
  L.push(`  autor: ${q(c.autor || 'TechQuiz')},`);
  L.push('  preguntas: [');
  cats.forEach((cat, i) => {
    if (i) L.push('');
    L.push(separador(cat));
    c.preguntas.filter((p) => p.c === cat).forEach((p) => L.push(emitirPregunta(p)));
  });
  /* la última pregunta no lleva coma final */
  const ult = L.length - 1;
  L[ult] = L[ult].replace(/,$/, '');
  L.push('  ]');
  L.push('});');
  return L.join('\n') + '\n';
}

/* --- index.html ----------------------------------------------------------- */
function registrarScript(fichero) {
  const p = 'index.html';
  let s = readFileSync(p, 'utf8');
  const tag = `<script src="${DIR}/${fichero}"></script>`;
  if (s.includes(`${DIR}/${fichero}`)) return false;
  const ancla = '<script src="assets/js/app.js"></script>';
  if (!s.includes(ancla)) throw new Error('no encuentro el <script> de app.js en index.html');
  s = s.replace(ancla, tag + '\n' + ancla);
  if (!dry) writeFileSync(p, s);
  return true;
}

/* --- README: tabla de cursos y conteos ------------------------------------ */
function refrescarReadme(cursos) {
  const p = 'README.md';
  let s = readFileSync(p, 'utf8');
  const total = cursos.reduce((n, c) => n + c.preguntas.length, 0);
  const cats = new Set();
  cursos.forEach((c) => c.preguntas.forEach((x) => cats.add(x.c)));

  const filas = cursos.map((c) => {
    const temas = [...new Set(c.preguntas.map((x) => x.c))].join(', ');
    return `| ${c.emoji || '📘'} ${c.nombre} | ${c.preguntas.length} | ${temas} |`;
  });
  const cab = '| Curso | Preguntas | Temas |\n|---|---|---|\n';
  const re = new RegExp(cab.replace(/[|]/g, '\\|') + '(?:\\|.*\\|\\n?)+');
  if (re.test(s)) s = s.replace(re, cab + filas.join('\n') + '\n');

  s = s.replace(/\*\*\d+ preguntas\*\* \| \d+ cursos incorporados y \d+ categorías/,
    `**${total} preguntas** | ${cursos.length} cursos incorporados y ${cats.size} categorías`);

  if (!dry) writeFileSync(p, s);
  return { total, cursos: cursos.length, cats: cats.size };
}

/* --- flujo ---------------------------------------------------------------- */
const existentes = cargar();

if (soloReadme) {
  const r = refrescarReadme(existentes);
  console.log(`README${dry ? ' (dry)' : ''}: ${r.cursos} cursos · ${r.total} preguntas · ${r.cats} categorías`);
  process.exit(0);
}

if (!json) {
  console.error('Falta el .json. Mira la cabecera de tools/curso.mjs para el formato.');
  process.exit(2);
}

const entrada = JSON.parse(readFileSync(json, 'utf8'));
const nuevas = (Array.isArray(entrada) ? entrada : entrada.preguntas || []);
if (!nuevas.length) { console.error('El JSON no trae preguntas.'); process.exit(2); }

const id = destino || entrada.id || slug(entrada.nombre || '');
if (!id) { console.error('Falta "id" o "nombre" en el JSON (o usa --en <id>).'); process.exit(2); }

let curso = existentes.find((c) => c.id === id);
let fichero;
let creado = false;

if (curso) {
  /* --- fusión: descarta enunciados repetidos ----------------------------- */
  const vistos = new Set(curso.preguntas.map((p) => norm(p.q)));
  const añadir = nuevas.filter((p) => !vistos.has(norm(p.q)));
  const saltadas = nuevas.length - añadir.length;
  fichero = curso._file;
  curso = {
    ...curso,
    nombre: entrada.nombre || curso.nombre,
    emoji: entrada.emoji || curso.emoji,
    desc: entrada.desc || curso.desc,
    preguntas: curso.preguntas.concat(añadir)
  };
  console.log(`Fusiona en ${fichero}: +${añadir.length} preguntas` +
    (saltadas ? ` (${saltadas} repetida(s) descartada(s))` : ''));
} else {
  const nums = readdirSync(DIR).map((f) => parseInt(f.slice(0, 2), 10)).filter((n) => !isNaN(n));
  const nn = String(Math.max(0, ...nums) + 1).padStart(2, '0');
  fichero = `${nn}-${slug(entrada.nombre || id)}.js`;
  curso = { ...entrada, id, preguntas: nuevas };
  creado = true;
  console.log(`Crea ${DIR}/${fichero} con ${nuevas.length} preguntas`);
}

const salida = emitir(curso);
if (dry) {
  console.log('\n--- ' + fichero + ' (dry) ---\n' + salida.split('\n').slice(0, 14).join('\n') + '\n…');
} else {
  writeFileSync(join(DIR, fichero), salida);
}

if (creado && registrarScript(fichero)) console.log(`Registra <script> de ${fichero} en index.html`);

const r = refrescarReadme(dry ? existentes : cargar());
console.log(`README: ${r.cursos} cursos · ${r.total} preguntas · ${r.cats} categorías`);

if (dry) { console.log('\n(dry: no se ha escrito nada)'); process.exit(0); }

console.log('');
try {
  execSync('node tools/mapa.mjs', { stdio: 'inherit' });
  execSync('node tools/validar.mjs --resumen', { stdio: 'inherit' });
} catch {
  console.error('\nEl validador ha fallado: revisa los errores de arriba.');
  process.exit(1);
}
