---
description: Valida el banco de preguntas y corrige lo que falle
allowed-tools: Bash(node tools/validar.mjs), Bash(node tools/validar.mjs --resumen), Bash(grep:*), Bash(sed:*), Edit
---

Ejecuta `node tools/validar.mjs`.

- Si sale `✓`, responde solo con el resumen de una línea (cursos, preguntas, categorías).
- Si hay errores, corrígelos uno a uno usando `grep -n` para localizar la línea exacta (no leas
  los ficheros completos) y vuelve a ejecutar el validador hasta que quede limpio. Explica al
  final qué cambiaste, en una lista breve.
- Los avisos (⚠) no bloquean: menciónalos, arréglalos solo si te lo piden.
