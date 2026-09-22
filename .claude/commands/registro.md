---
description: Pone al día el registro del proyecto (mapa + bitácora)
argument-hint: [título del cambio]
allowed-tools: Bash(node tools/mapa.mjs), Bash(node tools/validar.mjs), Bash(node tools/bitacora.mjs:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

Cierra la tarea actual dejando el registro al día:

1. `node tools/validar.mjs` — si falla, corrige antes de seguir.
2. `node tools/mapa.mjs` — regenera el índice del código.
3. Registra la entrada en la bitácora con `node tools/bitacora.mjs`, usando como título
   **$ARGUMENTS** (si está vacío, deduce el título de `git status` y `git diff --stat`).

En los detalles de la entrada escribe **el por qué y lo que se descartó**, no lo que ya se ve en
el diff: qué problema resolvía, qué alternativa se rechazó y qué queda pendiente. Dos o tres
líneas bastan. Los ficheros tocados y la rama los detecta la herramienta sola.

Termina diciendo en una línea qué has registrado.
