#!/bin/bash
# ============================================================================
#  TechQuiz — hook de arranque de sesión
#  Este proyecto no tiene dependencias que instalar: lo que hace falta al
#  empezar es CONTEXTO. Regenera el mapa del código, comprueba el banco de
#  preguntas y deja un parte de entrada de 5 líneas para no tener que
#  explorar el repositorio desde cero.
# ============================================================================
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
command -v node >/dev/null 2>&1 || { echo "TechQuiz: node no disponible; sin mapa ni validación."; exit 0; }

MAPA=$(node tools/mapa.mjs 2>&1 | head -1)
RESUMEN=$(node tools/mapa.mjs --resumen 2>/dev/null)

if node tools/validar.mjs --resumen >/dev/null 2>&1; then
  ESTADO="banco ✓"
else
  ESTADO="banco ✗ — ejecuta 'node tools/validar.mjs' y corrige antes de seguir"
fi

RAMA=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')

echo "TechQuiz · rama ${RAMA} · ${RESUMEN} · ${ESTADO}"
echo "Mapa recién generado en .claude/MAPA.md: funciones con su línea, secciones del CSS, ids por pantalla e inventario de cursos. Léelo ANTES de hacer grep o abrir ficheros."
echo "Historia de decisiones en .claude/BITACORA.md — lee las últimas entradas con: node tools/bitacora.mjs --ultimas 3"

ULTIMA=$(grep -m1 '^## ' .claude/BITACORA.md 2>/dev/null | sed 's/^## //')
[ -n "$ULTIMA" ] && echo "Último cambio registrado: ${ULTIMA}"

echo "Al cerrar una tarea: node tools/bitacora.mjs \"Título\" \"qué cambió y por qué\"  ·  cursos: node tools/curso.mjs <json>"

RESP=$(node tools/respaldo.mjs --donde 2>/dev/null | grep -c "estado:   accesible")
[ "${RESP:-0}" = "1" ] && echo "Respaldo automático al disco activo (node tools/respaldo.mjs --donde para ver dónde)."
