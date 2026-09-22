---
description: Ponte al día del proyecto sin leer código
allowed-tools: Bash(node tools/mapa.mjs), Bash(node tools/mapa.mjs --resumen), Bash(node tools/bitacora.mjs --ultimas:*), Bash(git log:*), Bash(git status:*), Read
---

Ponte al día sin abrir los ficheros de código:

1. `node tools/mapa.mjs` y lee `.claude/MAPA.md`.
2. `node tools/bitacora.mjs --ultimas 5`.
3. `git log --oneline -5` y `git status --short`.

Después resume en **8 líneas como máximo**: estado del banco de preguntas, en qué se trabajó
por última vez, qué quedó pendiente según la bitácora y si hay cambios sin commitear.
No leas `app.js`, `style.css` ni los ficheros de cursos para esto.
