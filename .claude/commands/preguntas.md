---
description: Añade preguntas a un curso existente
argument-hint: <curso> <nº> [categoría o subtema]
---

Añade preguntas al curso indicado: **$ARGUMENTS**

Sigue la skill `cursos`. Restricciones:

- Localiza el fichero con `ls data/cursos/` y mira el estilo con
  `grep -n "q: '" <fichero> | sed -n '1,4p'`. **No leas el fichero entero.**
- Reutiliza las categorías (`c`) que ya tenga el curso salvo que se pida una nueva.
- Inserta cada pregunta bajo el comentario de su categoría; si es una categoría nueva, crea el
  comentario separador al final del array.
- Nada de repetir enunciados ya existentes: el validador los detecta y falla.
- Termina con `node tools/validar.mjs` e indica el total de preguntas del curso antes y después.
