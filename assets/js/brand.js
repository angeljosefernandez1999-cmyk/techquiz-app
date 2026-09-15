/* ==========================================================================
   TechQuiz — Sistema de marca
   Toda la identidad visual (nombre, logotipo, paleta y textos) vive aquí.
   El banco de preguntas y la lógica del juego son comunes a todas las marcas.

   Para elegir marca:
     · por defecto  → la constante MARCA_PREDETERMINADA
     · por URL      → index.html?marca=techquiz
     · recordada    → la última elegida por URL queda guardada en el navegador
   ========================================================================== */
(function (global) {
  'use strict';

  var MARCA_PREDETERMINADA = 'tecnosoluciones';

  /* Logotipo de Tecnosoluciones: un chip, por el oficio que enseña. */
  var LOGO_CHIP =
    '<svg viewBox="0 0 32 32" width="21" height="21" fill="none" aria-hidden="true">' +
      '<rect x="9.5" y="9.5" width="13" height="13" rx="3" stroke="#fff" stroke-width="2"/>' +
      '<rect x="14" y="14" width="4" height="4" rx="1" fill="#fff"/>' +
      '<g stroke="#fff" stroke-width="2" stroke-linecap="round">' +
        '<path d="M13 9.5V6M19 9.5V6M13 26v-3.5M19 26v-3.5"/>' +
        '<path d="M9.5 13H6M9.5 19H6M26 13h-3.5M26 19h-3.5"/>' +
      '</g>' +
    '</svg>';

  var MARCAS = {

    /* ------------------------------------------------- Tecnosoluciones */
    tecnosoluciones: {
      titulo: 'Tecnosoluciones Formación',
      descripcion: 'Formación y evaluación técnica en informática, hardware, redes y ciberseguridad.',
      nombre: 'Tecnosoluciones',
      sub: 'Formación Técnica',
      logo: LOGO_CHIP,
      favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
               '<rect width="32" height="32" rx="7" fill="#0a2540"/>' +
               '<rect x="9.5" y="9.5" width="13" height="13" rx="3" stroke="#00a8e8" stroke-width="2" fill="none"/>' +
               '<rect x="14" y="14" width="4" height="4" rx="1" fill="#00a8e8"/>' +
               '<g stroke="#00a8e8" stroke-width="2" stroke-linecap="round">' +
               '<path d="M13 9.5V6M19 9.5V6M13 26v-3.5M19 26v-3.5M9.5 13H6M9.5 19H6M26 13h-3.5M26 19h-3.5"/></g></svg>',
      heroTitulo: 'Forma técnicos que <span class="grad">dominan el oficio</span>',
      ctaJugar: '▶ Empezar evaluación',
      ctaCurso: '✍️ Crear un curso',
      heroTexto: 'Evaluación real de hardware, redes, sistemas y ciberseguridad. Cada acierto suma <b>1 punto</b>: responder rápido no da ventaja, solo saber.',
      pie: 'Tecnosoluciones · Formación técnica · 1 acierto = 1 punto',
      themeColor: '#071a2f',
      colores: {
        '--bg': '#071a2f',
        '--bg-2': '#0a2540',
        '--text': '#e9f3fc',
        '--muted': '#8ba7c4',
        '--brand': '#00a8e8',
        '--brand-2': '#38bdf8',
        '--brand-3': '#0077c2',
        '--brand-hi': '#22bcf7',
        '--brand-hi-2': '#0d8ed8',
        '--brand-soft': '#7dd3fc',
        '--glow': '0,168,232',
        '--glow-2': '56,189,248',
        '--glow-soft': '125,211,252',
        '--grad-title': 'linear-gradient(110deg,#9fe4ff 0%,#00a8e8 50%,#4f9dff 100%)',
        '--aurora-1': '#0b3a63',
        '--aurora-2': '#07365c',
        '--aurora-3': '#052f4d',
        '--blob-1': '#0077b6',
        '--blob-2': '#00a8e8',
        '--blob-3': '#2dd4bf'
      },
      anillo: ['#00a8e8', '#7dd3fc']
    },

    /* --------------------------------------------------------- TechQuiz */
    techquiz: {
      titulo: 'TechQuiz — Fundamentos de Informática y Redes',
      descripcion: 'Quiz técnico de informática, hardware, redes y ciberseguridad. Practica, examínate y crea tus propios cursos.',
      nombre: 'TechQuiz',
      sub: 'Informática y Redes',
      logo: '🧠',
      favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
               '<text y=".9em" font-size="90">🧠</text></svg>',
      heroTitulo: 'Domina la <span class="grad">informática</span><br>pregunta a pregunta',
      ctaJugar: '🎮 Empezar a jugar',
      ctaCurso: '✍️ Crear mi curso',
      heroTexto: 'Quiz técnico de hardware, redes, sistemas y ciberseguridad. Cada acierto suma <b>1 punto</b>: responder rápido no da ventaja, solo saber.',
      pie: 'TechQuiz · 1 acierto = 1 punto · la velocidad no puntúa',
      themeColor: '#070b18',
      colores: {
        '--bg': '#070b18',
        '--bg-2': '#0d1430',
        '--text': '#eef1ff',
        '--muted': '#9aa6cc',
        '--brand': '#7c5cff',
        '--brand-2': '#22d3ee',
        '--brand-3': '#5b8cff',
        '--brand-hi': '#8b6dff',
        '--brand-hi-2': '#6f9bff',
        '--brand-soft': '#a78bfa',
        '--glow': '124,92,255',
        '--glow-2': '34,211,238',
        '--glow-soft': '167,139,250',
        '--grad-title': 'linear-gradient(110deg,#a78bfa 0%,#22d3ee 48%,#f472b6 100%)',
        '--aurora-1': '#1b2a6b',
        '--aurora-2': '#3b1d6e',
        '--aurora-3': '#08304d',
        '--blob-1': '#6d4bff',
        '--blob-2': '#12b8d8',
        '--blob-3': '#f0369b'
      },
      anillo: ['#7c5cff', '#22d3ee']
    }
  };

  /* --------------------------------------------------------- selección */
  function elegir() {
    var pedida = null;
    try {
      pedida = new URLSearchParams(location.search).get('marca');
      if (pedida && MARCAS[pedida]) localStorage.setItem('tq.marca', pedida);
      else if (!pedida) pedida = localStorage.getItem('tq.marca');
    } catch (e) { /* sin acceso a URL o almacenamiento */ }
    return MARCAS[pedida] ? pedida : MARCA_PREDETERMINADA;
  }

  var id = elegir();
  var marca = MARCAS[id];

  /* Los colores se aplican de inmediato, antes del primer pintado. */
  var raiz = document.documentElement;
  for (var k in marca.colores) raiz.style.setProperty(k, marca.colores[k]);

  /* Los textos, cuando el DOM esté disponible. */
  function aplicarTextos() {
    var $ = function (s) { return document.querySelector(s); };
    var poner = function (sel, html) { var e = $(sel); if (e) e.innerHTML = html; };

    document.title = marca.titulo;
    var meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', marca.descripcion);
    var tc = $('meta[name="theme-color"]');
    if (tc) tc.setAttribute('content', marca.themeColor);
    var icono = $('link[rel="icon"]');
    if (icono) icono.setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(marca.favicon));

    poner('.brand-logo', marca.logo);
    poner('.brand-name', marca.nombre);
    poner('.brand-sub', marca.sub);
    poner('#heroTitulo', marca.heroTitulo);
    poner('#heroTexto', marca.heroTexto);
    poner('#pieMarca', marca.pie);
    poner('#btnJugar', marca.ctaJugar);
    poner('#btnCrearCurso', marca.ctaCurso);

    // El degradado del anillo de resultados vive en el SVG, no en el CSS
    var stops = document.querySelectorAll('#gradring stop');
    if (stops.length === 2) {
      stops[0].setAttribute('stop-color', marca.anillo[0]);
      stops[1].setAttribute('stop-color', marca.anillo[1]);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicarTextos);
  else aplicarTextos();

  global.TQMarca = { id: id, actual: marca, disponibles: Object.keys(MARCAS) };
})(window);
