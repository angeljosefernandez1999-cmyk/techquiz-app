---
name: cursos
description: Crear cursos y escribir o revisar preguntas del banco de TechQuiz (data/cursos/*.js). Úsalo cuando se pida añadir un curso, añadir/ampliar/corregir preguntas de un tema, importar un temario en JSON, o cuando haya que redactar enunciados, opciones y explicaciones. Cubre el formato compacto { q, o, r, d, c, e }, el registro en index.html y la validación.
---

# Cursos y preguntas de TechQuiz

## 1. Antes de escribir

Ejecuta `node tools/validar.mjs` y quédate con el inventario que imprime: cursos, número de
preguntas, categorías y reparto por dificultad. **Es más barato que leer los ficheros** y te dice
qué categorías existen ya (reutilízalas; no crees «Redes básicas» si ya hay «Redes»).

Para ver el estilo de redacción sin cargar 18 KB, mira 3-4 ejemplos:

```bash
grep -n "q: '" data/cursos/02-redes.js | sed -n '1,4p'
```

## 2. Formato

Una pregunta = **una línea**, forma corta, comillas simples:

```js
{ q: '¿Qué protocolo asigna IP automáticamente?', o: ['DNS', 'DHCP', 'HTTP', 'FTP'], r: 1, d: 'basico', c: 'Redes', e: 'DHCP entrega IP, máscara, puerta de enlace y DNS mediante el proceso DORA.' },
```

- `r` es el **índice** de la correcta empezando en 0. Recuenta antes de escribirlo: es el error
  más frecuente y el más difícil de detectar a ojo.
- `d`: exactamente `basico`, `medio` o `avanzado` (sin tildes).
- `c`: categoría existente del curso siempre que encaje.
- `e`: obligatoria. Explica **por qué** es correcta, aporta el dato que se quiere memorizar
  (siglas desarrolladas, número de puerto, orden de pasos). No repitas literalmente la opción
  ni escribas «La respuesta correcta es B».
- Comillas: usa `\'` si el texto lleva apóstrofo, o redacta para evitarlo.
- Agrupa las preguntas bajo los comentarios de categoría ya presentes en el fichero:
  `/* ------------------------------ Redes -------------------------------- */`.

## 3. Calidad de los distractores

- Las opciones incorrectas deben ser **plausibles y del mismo tipo** que la correcta (si la
  correcta es un puerto, las otras son puertos; si es un protocolo, protocolos).
- Longitud parecida entre opciones: la más larga no puede ser siempre la correcta.
- Nada de `Todas las anteriores`, `Ninguna de las anteriores` ni negaciones dobles.
- Reparte la posición de la correcta: no dejes casi todas en el mismo índice.
- Un solo concepto por pregunta y enunciado autocontenido (nada de «según lo anterior»).
- Reparto orientativo por curso: ~40 % `basico`, ~40 % `medio`, ~20 % `avanzado`.

## 4. No escribas el fichero a mano

Prepara las preguntas en un JSON (en el directorio temporal, no en el repo) y deja que la
herramienta genere el fichero con el formato canónico:

```json
{
  "nombre": "Bases de Datos",
  "emoji": "🗄️",
  "desc": "Modelo relacional, SQL y normalización.",
  "preguntas": [
    { "q": "…", "o": ["A", "B", "C", "D"], "r": 0, "d": "basico", "c": "SQL", "e": "…" }
  ]
}
```

```bash
node tools/curso.mjs /tmp/…/curso.json            # crea el curso
node tools/curso.mjs --en <id> /tmp/…/pregs.json  # amplía uno existente
node tools/curso.mjs … --dry                      # enseña qué haría
```

La herramienta se encarga de:

- numerar el fichero (`06-…`), escribir la cabecera y agrupar por categoría con sus separadores;
- escapar las comillas y dejar una pregunta por línea sin coma final de más;
- **registrar el `<script>` en `index.html`** justo antes de `app.js`;
- refrescar la tabla de cursos y los conteos del `README.md`;
- descartar los enunciados que ya existan en ese curso;
- regenerar el mapa y pasar el validador al terminar.

Para ampliar, el JSON puede ser el array de preguntas suelto. Las categorías nuevas crean su
separador al final; las existentes reciben las preguntas en su bloque.

Edita un `data/cursos/*.js` a mano solo para retocar una pregunta concreta (localízala con
`grep -n`). Para añadir, usa la herramienta.

## 5. Cerrar siempre con

```bash
node tools/validar.mjs
node tools/bitacora.mjs "Añade curso de X con N preguntas" "categorías cubiertas: …"
```

Si el validador falla, corrige lo que señale (`r` fuera de rango, enunciado duplicado, dificultad
inválida, script no registrado) y repite hasta `✓ Banco de preguntas válido`. Informa del nuevo
total de preguntas al terminar.
