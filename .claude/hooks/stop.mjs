#!/usr/bin/env node
/* ==========================================================================
   TechQuiz — respaldo automático al cerrar un turno
   El evento Stop se dispara en CADA turno, no solo al final de la sesión, así
   que este hook se frena solo: no hace nada si el último commit no ha cambiado
   y han pasado menos de 15 minutos desde el respaldo anterior.
   En sesiones remotas (sin disco accesible) no hace nada y no dice nada.
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

process.on('uncaughtException', () => process.exit(0));

const MINUTOS = 15;
const sh = (c) => { try { return execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };

const raiz = sh('git rev-parse --show-toplevel') || process.cwd();
const dir = join(tmpdir(), 'claude-sesiones');
mkdirSync(dir, { recursive: true });
const estado = join(dir, createHash('sha1').update(raiz).digest('hex').slice(0, 12) + '-stop.json');

const head = sh('git rev-parse HEAD');
let previo = { head: '', ts: 0 };
if (existsSync(estado)) { try { previo = JSON.parse(readFileSync(estado, 'utf8')); } catch { /* ignorar */ } }
if (previo.head === head && (Date.now() - (previo.ts || 0)) / 60000 < MINUTOS) process.exit(0);

const salida = sh(`node "${join(raiz, 'tools', 'respaldo.mjs')}" --silencioso`);
writeFileSync(estado, JSON.stringify({ head, ts: Date.now() }));
if (salida.startsWith('respaldo:')) console.log(salida);
