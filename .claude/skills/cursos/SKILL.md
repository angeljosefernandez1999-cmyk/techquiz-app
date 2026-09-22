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

## 4. Curso nuevo

1. Crea `data/cursos/NN-slug.js` siguiendo la numeración existente:

```js
/* Curso: Nombre del curso — banco de preguntas de TechQuiz */
TQ.curso({
  id: 'slug-del-curso',
  nombre: 'Nombre del curso',
  emoji: '📘',
  desc: 'Una línea con los temas que cubre.',
  autor: 'TechQuiz',
  preguntas: [
    /* ------------------------------ Categoría ---------------------------- */
    { q: '…', o: ['…', '…', '…', '…'], r: 0, d: 'basico', c: 'Categoría', e: '…' }
  ]
});
```

2. **Registra el script en `index.html`**, después de los otros cursos y antes de `app.js`:

```html
<script src="data/cursos/NN-slug.js"></script>
```

3. Si el curso pasa a ser relevante en la portada, actualiza la tabla de cursos del `README.md`
   (nombre, nº de preguntas, temas).

## 5. Cerrar siempre con

```bash
node tools/validar.mjs
```

Si falla, corrige lo que señale (`r` fuera de rango, enunciado duplicado, dificultad inválida,
script no registrado) y vuelve a ejecutarlo hasta que salga `✓ Banco de preguntas válido`.
Informa del nuevo total de preguntas al terminar.
