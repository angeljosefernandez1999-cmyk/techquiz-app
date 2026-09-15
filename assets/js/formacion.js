/* ==========================================================================
   TecnoSoluciones — Portada del área de Formación
   Las cifras y las áreas se leen del propio banco de preguntas, de modo que
   la portada nunca se queda desfasada respecto al temario.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.TQData;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pintar() {
    var cursos = D.cursos();
    var total = D.totalPreguntas();
    var categorias = D.categorias(null);

    document.getElementById('nPreguntas').textContent = total;
    document.getElementById('nAreas').textContent = cursos.length;
    document.getElementById('nCategorias').textContent = categorias.length;

    var grid = document.getElementById('areasGrid');
    grid.innerHTML = '';

    cursos.forEach(function (c) {
      var temas = {}, niveles = {};
      c.preguntas.forEach(function (p) { temas[p.categoria] = 1; niveles[p.dificultad] = 1; });

      var a = document.createElement('a');
      a.className = 'course-card';
      a.href = 'quiz.html?curso=' + encodeURIComponent(c.id);
      a.innerHTML =
        '<span class="course-emoji">' + esc(c.emoji) + '</span>' +
        '<h3>' + esc(c.nombre) + '</h3>' +
        '<p>' + esc(c.descripcion || '') + '</p>' +
        '<div class="course-meta">' +
          '<span class="chip">' + c.preguntas.length + ' preguntas</span>' +
          '<span class="chip">' + Object.keys(temas).length + ' temas</span>' +
          '<span class="chip">' + Object.keys(niveles).length + ' niveles</span>' +
        '</div>' +
        '<span class="fx-entrar">Entrenar esta área →</span>';
      grid.appendChild(a);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pintar);
  else pintar();
})();
