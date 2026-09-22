# Bitácora de TechQuiz

Registro de cambios, decisiones y sitios tocados. Lo más reciente, arriba.
Se escribe con `node tools/bitacora.mjs "Título" "detalle" …` al terminar cada tarea.
Léela antes de explorar el repositorio: suele contestar el «por qué» que el código no cuenta.

---



## 2026-09-22 · Saca las herramientas genéricas del proyecto

**Rama** `claude/inspiring-feynman-q95uzb` · **commit** `ad865d6`

- El respaldo al disco y su hook no son de TechQuiz: valen para cualquier repositorio y no deben vivir aquí.
- Se revierte 8ef3a39. Ahora viven en Protective, que se instala una vez por ordenador y funciona en todos los proyectos.
- En este repositorio se queda solo lo que es de TechQuiz: validador, mapa, bitácora, generador de cursos, comandos y skill.

**Ficheros** (commit ad865d6): `.claude/commands/registro.md` `.claude/hooks/session-start.sh` `.claude/hooks/stop.mjs` `.claude/settings.json` `CLAUDE.md` `tools/respaldo.mjs`
## 2026-09-22 · Añade instrucciones para el Proyecto de claude.ai

**Rama** `claude/inspiring-feynman-q95uzb` · **commit** `503fb2b`

- El registro del repo solo llega a Claude Code; chat y Cowork no tienen sistema de ficheros.
- .claude/PROYECTO-CHAT.md es el texto para pegar en las instrucciones del proyecto de claude.ai: hace que el chat devuelva JSON que tools/curso.mjs aplica en un comando.
- Reparto: redactar preguntas en el chat (barato), escribir ficheros y validar en Code.

**Ficheros** (sin commitear): `.claude/PROYECTO-CHAT.md`
## 2026-09-22 · Añade registro del proyecto: mapa autogenerado, bitácora y generador de cursos

**Rama** `claude/inspiring-feynman-q95uzb` · **commit** `fe0625b`

- Problema: cada sesión reexploraba el repo (leer app.js son ~10k tokens) y reescribía la plantilla de curso desde cero.
- tools/mapa.mjs genera .claude/MAPA.md: funciones con su línea, secciones del CSS, ids por pantalla e inventario de cursos. ~90 líneas que sustituyen a leer 115 KB.
- tools/bitacora.mjs registra el por qué de cada tarea; detecta rama, commit y ficheros solo.
- tools/curso.mjs genera el fichero del curso desde JSON, registra el <script> en index.html, refresca el README, descarta enunciados repetidos y valida.
- Hook SessionStart: regenera el mapa, valida el banco y deja un parte de 5 líneas al abrir sesión. Síncrono, sin dependencias que instalar.
- Descartado: meter el mapa dentro de CLAUDE.md (se paga en cada sesión aunque no se use) y usar modo async en el hook (innecesario, tarda milisegundos).
- Decisión: MAPA.md y BITACORA.md se commitean, para que estén disponibles aunque el hook no haya corrido todavía.

**Ficheros** (sin commitear): `.claude/MAPA.md` `.claude/PROMPTS.md` `.claude/commands/contexto.md` `.claude/commands/curso.md` `.claude/commands/preguntas.md` `.claude/commands/registro.md` `.claude/hooks/session-start.sh` `.claude/settings.json` `.claude/skills/cursos/SKILL.md` `CLAUDE.md` `README.md` `tools/bitacora.mjs` `tools/curso.mjs` `tools/mapa.mjs`

## 2026-09-22 · Prepara el repositorio para trabajar con Claude Code

**Rama** `claude/inspiring-feynman-q95uzb` · **commit** `fe0625b`

- Problema: no había reglas escritas, así que cada sesión podía «modernizar» el código (añadir
  npm, arrow functions, React) o romper la regla de puntuación sin saberlo.
- `CLAUDE.md` fija las reglas duras: la velocidad no puntúa, cero dependencias, estilo IIFE con
  `var`, textos en español, colores solo con variables de `:root`, audio sintetizado.
- `tools/validar.mjs` es la única comprobación del proyecto (no hay tests ni linter): `r` fuera de
  rango, enunciados y opciones duplicados, dificultades inválidas, cursos sin `<script>`.
- Skill `cursos` con los criterios de calidad de los distractores; comandos `/validar`, `/curso`
  y `/preguntas`; `settings.json` con permisos preaprobados.

**Ficheros** (commit `fe0625b`): `.claude/PROMPTS.md` `.claude/commands/` `.claude/settings.json` `.claude/skills/cursos/SKILL.md` `CLAUDE.md` `README.md` `tools/validar.mjs`

## 2026-09-22 · Crea TechQuiz (contexto de origen)

**Rama** `main` · **commit** `f50ce9a`

- Quiz técnico 100 % estático: HTML + CSS + JS sin dependencias, abrible con doble clic.
- Decisión de producto clave: **la velocidad no modifica la puntuación**. El temporizador solo
  evita que se busquen las respuestas. Dos personas con 8 de 10 empatan siempre.
- El audio se sintetiza con la Web Audio API en vez de incluir ficheros: cero problemas de
  licencias y cero descargas.
- `data.js` se aisló a propósito de la interfaz para poder sustituir `localStorage` por Supabase
  (modo clase con PIN) sin tocar las pantallas. Sigue pendiente.
- 5 cursos y 194 preguntas iniciales, un fichero por curso en `data/cursos/`.
