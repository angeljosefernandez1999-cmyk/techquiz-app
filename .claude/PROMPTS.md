# Cómo pedirme las cosas para gastar menos y acertar más

Este fichero **no se carga automáticamente** (no consume contexto). Es tu chuleta.
Lo que sí se carga en cada sesión es `CLAUDE.md`, y por eso está escrito corto.

---

## 1. Las tres reglas que más ahorran

| Regla | Por qué |
|---|---|
| **Di el fichero y la función** | «arregla el temporizador» me obliga a buscar por todo el repo. «en `app.js`, `pintarTemporizador`, el círculo salta al reiniciar» va directo. |
| **Una tarea por sesión** | El contexto se arrastra: si en la misma sesión pides curso nuevo + rediseño CSS + refactor, la segunda mitad se paga con la primera. Termina, `/clear`, siguiente. |
| **Di cuándo está terminado** | «hasta que `node tools/validar.mjs` salga en verde» o «30 preguntas, 5 categorías». Sin criterio de cierre exploro más de lo necesario por si acaso. |

## 2. Plantilla de petición

```
Objetivo: <qué quieres conseguir, una frase>
Dónde: <fichero(s) / función / pantalla>
Restricciones: <lo que no se puede tocar>
Hecho cuando: <comprobación concreta>
```

Ejemplo real:

```
Objetivo: que el modo examen permita repetir solo los fallos sin volver al menú.
Dónde: app.js (renderResultados, pintarRepaso) + botón nuevo en #scr-result.
Restricciones: sin librerías, la puntuación no cambia, estilos con variables de :root.
Hecho cuando: se ve el botón en resultados de examen y arranca una ronda con los fallos.
```

## 3. Frases que activan el modo barato

- **«sin leer ficheros enteros, usa grep y sed»** — refuerza lo que ya pone `CLAUDE.md`.
- **«haz el inventario con `node tools/validar.mjs`»** — en lugar de leer 90 KB de preguntas.
- **«edita directamente, resume al final»** — evita que narre cada paso.
- **«no toques el README ni el CSS»** — acota el radio de cambios.
- **«respuesta en 5 líneas»** — para preguntas, no para implementaciones.

Y al contrario, cuando **sí** quieras que me gaste el presupuesto:
**«piénsalo bien antes de tocar nada»** / **«explora primero, propón plan, espera a que lo apruebe»**.

## 4. Comandos y skill de este repo

| Atajo | Qué hace |
|---|---|
| `/validar` | Valida el banco de preguntas y corrige lo que falle. |
| `/curso <tema> [nº]` | Crea un curso completo: fichero, `<script>` en `index.html`, README y validación. |
| `/preguntas <curso> <nº> [subtema]` | Amplía un curso existente reutilizando sus categorías. |
| skill `cursos` | Se activa sola cuando hablas de preguntas/cursos: formato, calidad de distractores, checklist. |

Otros útiles de Claude Code: `/clear` (vaciar contexto entre tareas — el que más ahorra),
`/context` (ver en qué se está gastando), `/compact` (resumir cuando la sesión es larga),
`/init` (regenerar `CLAUDE.md` si el proyecto cambia mucho), `#` al inicio de un mensaje
(guarda esa nota en `CLAUDE.md` para siempre).

## 5. Trabajar desde GitHub (issues y PRs)

Cuando me lanzas desde un issue o un comentario `@claude`, **el issue es el prompt**: no puedo
preguntarte a mitad y no veo tu pantalla. Un issue bien escrito vale más que diez comentarios.

### Plantilla de issue para asignarme

```markdown
## Qué
Añadir un curso de Bases de Datos con 35 preguntas.

## Dónde
`data/cursos/06-bases-datos.js` (nuevo) + `<script>` en `index.html` + tabla del `README.md`.

## Categorías
Modelo relacional · SQL básico · Consultas · Normalización · Copias

## Restricciones
- Sin dependencias ni build (proyecto estático).
- Formato compacto `{ q, o, r, d, c, e }`, una pregunta por línea.
- Explicación obligatoria en todas.

## Hecho cuando
`node tools/validar.mjs` sale en verde y el curso aparece en la portada.
```

### Reglas prácticas

- **Un issue = un cambio.** Los issues con 5 peticiones salen mal en los 5 sitios.
- **Enlaza el fichero o la línea** (`assets/js/app.js#L376-L432`): es el mejor ahorro de tokens
  que existe, me lleva al sitio sin buscar.
- **Pega el error tal cual** (mensaje de consola, captura, pasos para reproducir). «no funciona»
  me obliga a adivinar.
- **Di si quieres PR o solo rama.** Por defecto no abro PR salvo que lo pidas.
- **En la revisión de un PR mío**, comenta línea a línea en lugar de escribir un comentario
  general: cada hilo es una instrucción concreta que puedo resolver y cerrar.
- Si un comentario tuyo cambia el objetivo, dilo explícito: «cambio de plan: …». Si no, asumo
  que se suma a lo anterior.
- Para vigilar CI de un PR: pídemelo una vez («vigila el PR y arregla lo que falle») en lugar de
  reabrir sesión en cada fallo.

## 6. Mantener esto al día

Si algo se repite (una convención que siempre te recuerdo, un comando nuevo), añádelo a
`CLAUDE.md` — pero **corto**: cada línea de ahí se paga en cada sesión. Lo largo va en este
fichero o en la skill `cursos`, que solo se cargan cuando hacen falta.
