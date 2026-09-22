# 🧠 TechQuiz — Fundamentos de Informática y Redes

Quiz técnico de hardware, redes, sistemas y ciberseguridad, pensado para **estudiar y evaluar**,
no para premiar la rapidez.

> **Puntuación:** acierto = **1 punto** · fallo = 0 · tiempo agotado = 0.
> La velocidad **nunca** modifica la puntuación: dos personas con 8 de 10 empatan siempre a 8 puntos.
> El temporizador solo existe para evitar que se busquen las respuestas.

Aplicación **100% estática**: HTML, CSS y JavaScript sin dependencias, sin compilación y sin
servidor. Se abre con doble clic o se publica en cualquier hosting.

---

## ✨ Qué incluye

| | |
|---|---|
| 🎮 **Tres modos** | **Práctica** (corrección y explicación al instante), **Juego** (ritmo rápido, racha y música) y **Examen** (sin correcciones hasta el final, con nota mínima configurable) |
| 🎵 **Música y efectos** | Música de menú, de juego y de examen **sintetizada en tiempo real** con la Web Audio API. No se descarga ningún archivo de audio ni hay problemas de licencias. Volumen independiente para música y efectos |
| 📚 **194 preguntas** | 5 cursos incorporados y 25 categorías, todas con explicación didáctica |
| ✍️ **Cursos ilimitados** | Crea cursos enteros desde la propia web, impórtalos/expórtalos en JSON o añádelos como fichero al proyecto |
| 📊 **Resultados útiles** | Porcentaje global, desglose por categoría, recomendaciones de repaso y repaso de preguntas falladas con su explicación |
| 🎯 **Repasar solo fallos** | Genera una nueva ronda únicamente con lo que has fallado |
| 📈 **Progreso** | Historial de partidas y dominio acumulado por categoría (guardado en el navegador) |
| ⌨️ **Atajos** | Teclas `1`–`4` para responder y `Enter` para continuar |
| 📱 **Responsive** | Funciona en móvil, tablet y escritorio |

### Cursos incorporados

| Curso | Preguntas | Temas |
|---|---|---|
| 🖥️ Fundamentos y Hardware | 43 | Fundamentos, CPU/RAM/GPU, Almacenamiento, Placa base y PSU, Puertos y conectores |
| 🌐 Redes y Cisco | 57 | Redes, Direccionamiento IP, Subnetting, Protocolos y puertos, Cableado, Cisco, Wi-Fi |
| 💻 Sistemas Operativos | 37 | Windows, Linux, BIOS/UEFI |
| 🔐 Ciberseguridad | 30 | Malware, Ingeniería social, Contraseñas y acceso, Red y cifrado, Copias y buenas prácticas |
| 🛠️ Reparación y Mantenimiento | 27 | Diagnóstico, Montaje, Portátiles y móviles, Impresoras y periféricos, Soporte al usuario |

---

## 🚀 Cómo ejecutarla

**Opción 1 — doble clic:** abre `index.html` en el navegador. Funciona tal cual.

**Opción 2 — servidor local** (recomendado, evita restricciones del navegador):

```bash
npx http-server -p 8080
# o
python3 -m http.server 8080
```

Después abre <http://localhost:8080>.

> 🔈 **Sobre el audio:** los navegadores no permiten reproducir sonido hasta que el usuario
> interactúa con la página. La música arranca sola con el primer clic o pulsación de tecla.
> Puedes ajustarla o silenciarla en el botón 🔊 de la barra superior.

---

## ➕ Cómo añadir cursos enteros

Hay tres formas, de la más rápida a la más permanente.

### 1. Desde la web (sin tocar código)

`Mis cursos` → `➕ Nuevo curso` → añade preguntas con el formulario.
Puedes marcar la respuesta correcta, elegir categoría y dificultad, y escribir la explicación.
Los cursos propios se guardan en el navegador (`localStorage`); usa **Exportar** para conservarlos.

También puedes pulsar **Duplicar curso** sobre un curso incorporado para obtener una copia editable.

### 2. Importando un JSON

`Mis cursos` → `📥 Importar JSON` → pega el contenido o selecciona un archivo `.json`.
Acepta un curso suelto o un array de cursos. Pulsa **Ver plantilla de ejemplo** para partir de una base.

```json
{
  "nombre": "Redes Avanzadas",
  "emoji": "🛰️",
  "desc": "Enrutamiento dinámico y VLAN",
  "preguntas": [
    {
      "q": "¿Qué protocolo evita bucles en una red conmutada?",
      "o": ["STP", "OSPF", "VTP", "HSRP"],
      "r": 0,
      "d": "avanzado",
      "c": "Cisco",
      "e": "Spanning Tree Protocol bloquea lógicamente los enlaces redundantes."
    }
  ]
}
```

| Campo | Significado |
|---|---|
| `q` | Enunciado de la pregunta |
| `o` | Array de respuestas (de 2 a 6) |
| `r` | Índice de la respuesta correcta, **empezando en 0** |
| `d` | Dificultad: `basico`, `medio` o `avanzado` |
| `c` | Categoría (agrupa los resultados y las recomendaciones) |
| `e` | Explicación que se muestra tras responder |

### 3. Como fichero del proyecto (permanente y versionable)

Es la mejor opción para cursos que quieras mantener en el repositorio.

1. Crea `data/cursos/06-mi-curso.js`:

```js
TQ.curso({
  id: 'mi-curso',
  nombre: 'Mi curso',
  emoji: '📘',
  desc: 'Descripción breve',
  preguntas: [
    { q: '¿Pregunta?', o: ['A', 'B', 'C', 'D'], r: 1, d: 'basico', c: 'Tema', e: 'Explicación.' }
  ]
});
```

2. Añade la línea correspondiente en `index.html`, junto a los demás cursos:

```html
<script src="data/cursos/06-mi-curso.js"></script>
```

3. Comprueba que todo está bien:

```bash
node tools/validar.mjs
```

Imprime un inventario (cursos, preguntas, categorías, reparto por dificultad) y falla si
encuentra algún problema.

No hay límite de preguntas ni de cursos: puedes cargar bancos de miles de preguntas.

---

## 🌍 Publicar la web

**Vercel**

```bash
npx vercel --prod
```

**GitHub Pages:** en `Settings → Pages`, selecciona la rama y la carpeta raíz (`/`).

**Netlify:** arrastra la carpeta del proyecto a la interfaz de despliegue.

Al ser estática no necesita configuración, variables de entorno ni base de datos.

---

## 📁 Estructura

```
techquiz-app/
├── index.html                 Pantallas de la aplicación
├── assets/
│   ├── css/style.css          Estilos, animaciones y diseño responsive
│   └── js/
│       ├── audio.js           Motor de música y efectos (Web Audio API)
│       ├── data.js            Cursos, almacenamiento, import/export e historial
│       └── app.js             Pantallas, motor de juego, resultados y editor
└── data/cursos/               Banco de preguntas (un fichero por curso)
    ├── 01-fundamentos-hardware.js
    ├── 02-redes.js
    ├── 03-sistemas.js
    ├── 04-ciberseguridad.js
    └── 05-reparacion.js
```

Además, `tools/validar.mjs` revisa todo el banco de preguntas (índice de respuesta
correcta fuera de rango, enunciados duplicados, dificultades inválidas, cursos sin
registrar en `index.html`) y `.claude/` contiene la configuración y los atajos para
trabajar el proyecto con Claude Code.

---

## 🗺️ Siguientes pasos

Lo que ya funciona cubre el MVP completo en modo local. Para el **modo clase tipo Kahoot con PIN**
hace falta un backend, porque varios dispositivos deben compartir estado en tiempo real:

- **Partidas con PIN y sala de espera** → Next.js + Supabase (tablas `partidas`, `jugadores`, `respuestas`)
- **Ranking en directo** → Supabase Realtime, para que al cambiar de pregunta se actualicen todos los móviles
- **Panel del profesor** → estadísticas por pregunta (% de acierto y reparto de respuestas por opción)
- **Cuentas de alumnos y clases** → autenticación de Supabase
- **Generación de preguntas con IA** a partir de temario

La capa de datos actual (`data.js`) está aislada a propósito: sustituir `localStorage` por Supabase
no obliga a tocar la interfaz.
