# TechQuiz — guía para Claude

Quiz técnico (hardware, redes, sistemas, ciberseguridad) **100 % estático**: HTML + CSS + JS
a pelo. Sin build, sin npm, sin dependencias, sin backend. `index.html` debe seguir
funcionando con doble clic (`file://`).

## Reglas duras (no romper nunca)

1. **La velocidad no puntúa.** Acierto = 1 punto, fallo = 0, tiempo agotado = 0. El
   temporizador solo evita que se busquen las respuestas. Nunca introduzcas bonus por
   rapidez ni puntuación decimal.
2. **Cero dependencias y cero compilación.** No añadas `package.json`, bundlers, React,
   TypeScript, `import`/`export`, ni CDNs de librerías. Si algo parece necesitar una
   librería, se escribe a mano o no se hace.
3. **Estilo del código existente:** IIFE por fichero (`(function (global) { 'use strict'; … })`),
   `var`, `function` clásicas, sin arrow functions ni `let`/`const` ni template literals en
   `assets/js/**`. Es deliberado (compatibilidad y legibilidad), no lo "modernices".
   *Excepción:* `tools/*.mjs` sí es Node moderno.
4. **Todo el texto visible y los comentarios, en español.** Con tildes.
5. **Colores solo con variables CSS** de `:root` (`--violet`, `--cyan`, `--green`, `--red`,
   `--amber`, `--muted`, `--card`, `--border`, `--radius`…). Nada de hex suelto.
6. **Nada de audio en ficheros.** La música y los efectos se sintetizan con Web Audio API en
   `audio.js`. No descargues ni añadas mp3/wav.
7. **`localStorage` solo a través de `TQData`** (claves `tq.cursos.v1`, `tq.historial.v1`,
   `tq.perfil.v1`). Si cambias el formato guardado, sube la versión de la clave.

## Mapa del repo

```
index.html                 6 pantallas: #scr-home #scr-setup #scr-play #scr-result
                           #scr-editor #scr-historial  ·  <script> al final, ORDEN IMPORTANTE
assets/css/style.css       :root con variables + secciones marcadas /* ---------- X ---------- */
assets/js/audio.js         window.TQAudio — motor de música/efectos (temas: menu, game, exam)
assets/js/data.js          window.TQData + window.TQ — cursos, selección, localStorage, historial
assets/js/app.js           lógica de UI: pantallas, motor de partida, resultados, editor, historial
data/cursos/NN-*.js        banco de preguntas, un fichero por curso (llaman a TQ.curso({...}))
tools/validar.mjs          validador del banco (ver abajo)
```

Orden de carga obligatorio en `index.html`: `audio.js` → `data.js` → `data/cursos/*.js` → `app.js`.
**Un curso nuevo no existe hasta que se añade su `<script>`** (el validador lo comprueba).

### Dónde está cada cosa en `app.js`

Localiza siempre con `grep -n 'function nombre' assets/js/app.js` (no supongas líneas):

| Zona | Funciones |
|---|---|
| Utilidades UI | `esc` `toast` `confetti` `ir` (cambia de pantalla) `musica` |
| Audio UI | `initAudioUI` `despertarAudio` |
| Home / Setup | `renderHome` `abrirSetup` `renderSetup` `actualizarResumen` `initSetupUI` |
| Partida | `empezarPartida` `pintarPregunta` `iniciarTemporizador` `pintarTemporizador` `responder` `siguiente` `pararPartida` `terminarPartida` |
| Resultados | `agruparPorCategoria` `renderResultados` `pintarRepaso` |
| Editor | `cursoEditable` `renderEditor` `cargarPregunta` `limpiarFormulario` `pintarOpciones` `guardarPregunta` `initEditorUI` |
| Historial | `renderHistorial` |
| Arranque | `init` (y los atajos de teclado `1`-`4` / `Enter`) |

Estado global de `app.js`: `game` (partida en curso, `null` fuera de partida), `setup`
(filtros elegidos), `D` = `TQData`, `A` = `TQAudio`, `$`/`$$` = querySelector(All).

### API de `TQData` (usar esto, no tocar `localStorage` a mano)

`cursos()` `curso_(id)` `propios()` `guardarCurso` `borrarCurso` `duplicarCurso`
`exportarCurso` `importar(texto)` `categorias(cursoIds)` `contarPorDificultad`
`preguntasDe(cursoIds, cats, difs)` `seleccionar(cursoIds, cats, difs, n)` `totalPreguntas()`
`historial()` `guardarResultado` `borrarHistorial` `resumenHistorial()` `perfil(nombre)`
`shuffle` `slug` `uid` `DIFS` `DIF_LABEL`.

## Contrato de una pregunta

En los ficheros de curso se escribe **compacto, una pregunta por línea**:

```js
{ q: '¿Enunciado?', o: ['A', 'B', 'C', 'D'], r: 1, d: 'medio', c: 'Redes', e: 'Explicación didáctica.' }
```

`q` enunciado · `o` 2-6 opciones · `r` índice correcto **empezando en 0** · `d`
`basico|medio|avanzado` · `c` categoría (agrupa resultados y recomendaciones) · `e` explicación
(obligatoria, ≥ 15 caracteres, explica *por qué*, no repitas la opción).
`data.js` normaliza y acepta alias largos (`pregunta`, `opciones`, `correcta`…), pero en el
repo **usa siempre la forma corta**. Enunciados y opciones no se repiten (el validador falla).

## Comandos

```bash
node tools/validar.mjs            # valida todo el banco: r fuera de rango, duplicados,
                                  # dificultades inválidas, scripts sin registrar en index.html
node tools/validar.mjs --resumen  # solo conteos
npx http-server -p 8080           # servidor local (o python3 -m http.server 8080)
```

**Tras cualquier cambio en `data/cursos/**` o en `index.html`, ejecuta el validador.** Es la
única comprobación del proyecto: no hay tests ni linter.

## Protocolo de trabajo eficiente (ahorra contexto)

- **No leas ficheros enteros.** `app.js` (38 KB), `style.css` (23 KB) y cada curso (12-18 KB)
  son caros. Usa `grep -n` para localizar y `sed -n 'A,Bp'` para leer solo el bloque.
- **Nunca leas un `data/cursos/*.js` completo** para añadir preguntas: son ~50-80 líneas de
  texto denso. Añade al final del array o justo tras el comentario
  `/* ----- Categoría ----- */` correspondiente, y comprueba con el validador.
- **Para contar o inventariar** (preguntas por curso, categorías, dificultades) usa
  `node tools/validar.mjs`, no leas los ficheros.
- Antes de editar CSS, busca la sección: `grep -n '^/\*' assets/css/style.css`.
- No repitas exploración ya hecha en la conversación y no expliques el plan antes de cada
  edición pequeña: edita y resume al final.

## Git

- Rama de trabajo indicada en cada sesión; nunca empujes a `main` directamente.
- Mensajes de commit **en español, en imperativo**, una línea de asunto concisa
  (ej. `Añade curso de bases de datos con 30 preguntas`).
- No abras pull request salvo petición explícita.
