# Mapa del código (autogenerado)

> Generado por `node tools/mapa.mjs` el 2026-09-22. **No editar a mano.**
> Las líneas son orientativas: si no cuadran, regenera el mapa.

## assets/js/audio.js — 310 líneas, 20 funciones

_TechQuiz — Motor de audio · Música y efectos sintetizados en tiempo real con la Web Audio API. · No se descarga ningún fichero: todo se genera en el navegador._

```
load:70                   save:77                   init:81
unlock:114                setMusicVol:122           setSfxVol:126
toggleMusic:130           toggleSfx:135             ramp:140
pluck:148                 bassNote:160              padChord:175
noiseHit:192              kickHit:202               playMusic:214
stopMusic:226             schedule:231              tick:241
sfx:269                   bindVisibility:297
```

## assets/js/data.js — 258 líneas, 27 funciones

_TechQuiz — Capa de datos · Registro de cursos, banco de preguntas, almacenamiento local e historial._

```
slug:17                   uid:21                    normDif:23
normQuestion:32           normCourse:47             curso:69
_read:72                  _write:76                 propios:81
cursos:85                 curso_:89                 guardarCurso:95
borrarCurso:108           duplicarCurso:114         exportarCurso:125
importar:137              categorias:151            contarPorDificultad:160
preguntasDe:166           seleccionar:182           totalPreguntas:205
historial:210             guardarResultado:212      borrarHistorial:220
resumenHistorial:222      perfil:237                shuffle:245
```

## assets/js/app.js — 964 líneas, 33 funciones

_TechQuiz — Lógica de la aplicación · Pantallas, motor de juego, resultados, editor de cursos e historial._

```
esc:16                    toast:22                  confetti:33
ir:50                     musica:64                 initAudioUI:71
despertarAudio:117        renderHome:130            abrirSetup:173
renderSetup:179           actualizarResumen:240     initSetupUI:258
temaDePartida:277         empezarPartida:282        pintarPregunta:320
iniciarTemporizador:354   pintarTemporizador:366    responder:376
siguiente:432             pararPartida:438          terminarPartida:443
agruparPorCategoria:471   renderResultados:484      pintarRepaso:545
cursoEditable:573         renderEditor:578          cargarPregunta:638
limpiarFormulario:651     pintarOpciones:662        guardarPregunta:683
initEditorUI:714          renderHistorial:853       init:910
```

## assets/css/style.css — 383 líneas

```
Fondo animado (aurora):40 · Layout:62 · Topbar:70 · Botones:84 · Tarjetas:101 · Home / Hero:106 · Grid de cursos:127 · Setup:144 · Pantalla de juego:182 · Resultados:242 · Editor:280 · Historial:295 · Audio / control de sonido:305 · Toast:324 · Confeti:331 · Varios:336 · Responsive:356
```

Variables de `:root`: `--bg` `--bg-2` `--card` `--card-strong` `--border` `--border-soft` `--text` `--muted` `--violet` `--violet-2` `--cyan` `--green` `--red` `--amber` `--blue` `--radius` `--radius-sm` `--shadow` `--font` `--mono`

## index.html — 475 líneas

- **#scr-home** (línea 64) — 8 ids
  `badgeStats` `btnJugar` `stCursos` `stPreguntas` `stCategorias` `stMedia` `btnTodos` `courseGrid`
- **#scr-setup** (línea 112) — 18 ids
  `setupTitle` `setupSub` `pillCursos` `pillCats` `pillDifs` `rngNum` `lblNum` `rngTime` `lblTime` `modeList` `fieldAprobado` `rngPass` `lblPass` `sumPool` `sumNum` `sumMax` `sumDur` `btnStart`
- **#scr-play** (línea 204) — 20 ids
  `btnAbandonar` `qNow` `qTotal` `pillStreak` `streakN` `scoreN` `progBar` `qArea` `timer` `timerArc` `timerNum` `qCat` `qDif` `qCurso` `qText` `answers` `feedback` `fbTitle` `fbText` `btnNext`
- **#scr-result** (línea 249) — 12 ids
  `resTitle` `gradring` `resArc` `resPct` `resFrac` `resVerdict` `resBars` `resAdvice` `btnToggleRev` `resReview` `btnRepetir` `btnFallos`
- **#scr-editor** (línea 295) — 35 ids
  `edNuevoCurso` `edImportar` `edExportar` `edDuplicar` `edBorrarCurso` `edCursoSel` `edJugarCurso` `edGuardarCurso` `edMetaBox` `edNombre` `edEmoji` `edDesc` `edAviso` `edCount` `edNuevaPregunta` `edBuscar` `edList` `edForm` `fqTexto` `fqOpciones` `fqAddOpt` `fqDelOpt` `fqCat` `catList` `fqDif` `fqExp` `fqBorrar` `fqNueva` `fqGuardar` `edImportBox` `edImportCerrar` `edFile` `edJson` `edImportOk` `edPlantilla`
- **#scr-historial** (línea 420) — 7 ids
  `hPartidas` `hMedia` `hMejor` `hTotal` `hBorrar` `hTabla` `hBars`
- **fuera de pantallas** (topbar, overlays) — 12 ids
  `btnAudio` `eqIcon` `eq` `audioPanel` `swMusic` `lblMusic` `volMusic` `swSfx` `lblSfx` `volSfx` `toasts` `confetti`

Orden de `<script>`: `audio.js` → `data.js` → `01-fundamentos-hardware.js` → `02-redes.js` → `03-sistemas.js` → `04-ciberseguridad.js` → `05-reparacion.js` → `app.js`

## Banco de preguntas — 5 cursos, 194 preguntas, 25 categorías

| Fichero | id | Curso | Preguntas | Categorías |
|---|---|---|---|---|
| `01-fundamentos-hardware.js` | `fundamentos-hardware` | 🖥️ Fundamentos y Hardware | 43 | Fundamentos · CPU / RAM / GPU · Almacenamiento · Placa base y PSU · Puertos y conectores |
| `02-redes.js` | `redes-cisco` | 🌐 Redes y Cisco | 57 | Redes · Direccionamiento IP · Subnetting · Protocolos y puertos · Cableado · Cisco · Wi-Fi |
| `03-sistemas.js` | `sistemas-operativos` | 💻 Sistemas Operativos | 37 | Windows · Linux · BIOS / UEFI |
| `04-ciberseguridad.js` | `ciberseguridad` | 🔐 Ciberseguridad | 30 | Malware · Ingeniería social · Contraseñas y acceso · Red y cifrado · Copias y buenas prácticas |
| `05-reparacion.js` | `reparacion` | 🛠️ Reparación y Mantenimiento | 27 | Diagnóstico · Montaje · Portátiles y móviles · Impresoras y periféricos · Soporte al usuario |
