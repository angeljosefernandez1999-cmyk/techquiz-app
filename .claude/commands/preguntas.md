---
description: Añade preguntas a un curso existente
argument-hint: <curso> <nº> [categoría o subtema]
---

Añade preguntas al curso indicado: **$ARGUMENTS**

Sigue la skill `cursos`. Camino corto:

1. Mira `.claude/MAPA.md` para el `id` del curso y sus categorías actuales. **No leas el fichero del curso.**
2. Para el estilo de redacción, 3 ejemplos bastan: `grep -n "q: '" <fichero> | sed -n '1,3p'`.
3. Escribe las preguntas nuevas en un JSON temporal (array suelto de `{q,o,r,d,c,e}`).
4. `node tools/curso.mjs --en <id> <ese json>` — las inserta en el bloque de su categoría,
   descarta las repetidas, refresca README y mapa y valida.
5. `node tools/bitacora.mjs "Amplía <curso> con N preguntas" "…"`.

Reutiliza las categorías existentes salvo que se pida una nueva. Indica el total del curso antes
y después.
