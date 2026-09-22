---
description: Crea un curso nuevo con su banco de preguntas
argument-hint: <tema> [nº de preguntas]
---

Crea un curso nuevo de TechQuiz sobre: **$ARGUMENTS**

Sigue la skill `cursos` de este repo. Camino corto:

1. `node tools/mapa.mjs --resumen` y `.claude/MAPA.md` para ver la numeración y las categorías ya existentes.
2. Escribe las preguntas en un JSON en el directorio temporal (no en el repo).
3. `node tools/curso.mjs <ese json>` — genera el fichero, lo registra en `index.html`, refresca el
   README, regenera el mapa y valida. **No escribas el fichero del curso a mano.**
4. `node tools/bitacora.mjs "Añade curso de …" "…"`.

Si no se indica número de preguntas, haz 30 repartidas en 4-6 categorías
(~40 % básico, ~40 % medio, ~20 % avanzado). No hagas preguntas, empieza.
