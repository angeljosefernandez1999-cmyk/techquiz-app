---
description: Crea un curso nuevo con su banco de preguntas
argument-hint: <tema> [nº de preguntas]
---

Crea un curso nuevo de TechQuiz sobre: **$ARGUMENTS**

Sigue la skill `cursos` de este repo. Resumen del camino:

1. `node tools/validar.mjs` para ver la numeración y las categorías ya existentes.
2. Crea `data/cursos/NN-slug.js` con `TQ.curso({...})` y las preguntas en formato compacto de
   una línea, agrupadas por comentarios de categoría.
3. Registra el `<script>` en `index.html` antes de `app.js`.
4. Actualiza la tabla de cursos del `README.md`.
5. Valida y no termines hasta que salga `✓`.

Si no se indica número de preguntas, haz 30 repartidas en 4-6 categorías
(~40 % básico, ~40 % medio, ~20 % avanzado). No hagas preguntas, empieza.
