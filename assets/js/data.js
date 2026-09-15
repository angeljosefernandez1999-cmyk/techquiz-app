/* ==========================================================================
   TechQuiz — Capa de datos
   Registro de cursos, banco de preguntas, almacenamiento local e historial.
   ========================================================================== */
(function (global) {
  'use strict';

  var DIFS = ['basico', 'medio', 'avanzado'];
  var DIF_LABEL = { basico: 'Básico', medio: 'Medio', avanzado: 'Avanzado' };

  var KEY_CURSOS = 'tq.cursos.v1';
  var KEY_HIST   = 'tq.historial.v1';
  var KEY_PERFIL = 'tq.perfil.v1';

  var builtin = [];   // cursos que vienen con la aplicación

  function slug(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'curso';
  }
  function uid(p) { return (p || 'q') + '-' + Math.random().toString(36).slice(2, 9); }

  function normDif(d) {
    d = String(d || 'basico').toLowerCase();
    if (d.indexOf('bas') === 0 || d === '1') return 'basico';
    if (d.indexOf('med') === 0 || d === '2') return 'medio';
    if (d.indexOf('ava') === 0 || d.indexOf('adv') === 0 || d === '3') return 'avanzado';
    return 'basico';
  }

  /** Acepta el formato compacto de los ficheros de datos y el formato extenso. */
  function normQuestion(raw, i) {
    var opciones = raw.o || raw.opciones || raw.respuestas || [];
    var correcta = raw.r !== undefined ? raw.r : (raw.correcta !== undefined ? raw.correcta : 0);
    return {
      id: raw.id || uid(),
      q: raw.q || raw.pregunta || '',
      opciones: opciones.slice(0, 6).map(function (o) { return String(o); }),
      correcta: Math.max(0, Math.min(opciones.length - 1, parseInt(correcta, 10) || 0)),
      dificultad: normDif(raw.d || raw.dificultad),
      categoria: raw.c || raw.categoria || 'General',
      explicacion: raw.e || raw.explicacion || '',
      _i: i
    };
  }

  function normCourse(raw, esPropio) {
    var preguntas = (raw.preguntas || raw.questions || []).map(normQuestion)
      .filter(function (p) { return p.q && p.opciones.length >= 2; });
    return {
      id: raw.id || slug(raw.nombre || raw.name),
      nombre: raw.nombre || raw.name || 'Curso sin nombre',
      emoji: raw.emoji || '📘',
      descripcion: raw.desc || raw.descripcion || '',
      autor: raw.autor || '',
      propio: !!esPropio,
      preguntas: preguntas
    };
  }

  var Data = {
    DIFS: DIFS,
    DIF_LABEL: DIF_LABEL,
    slug: slug,
    uid: uid,
    normCourse: normCourse,

    /** Usado por los ficheros de data/cursos/*.js */
    curso: function (def) { builtin.push(normCourse(def, false)); },

    /* ------------------------------------------------------- persistencia */
    _read: function (key, fallback) {
      try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
      catch (e) { return fallback; }
    },
    _write: function (key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); return true; }
      catch (e) { return false; }
    },

    propios: function () {
      return this._read(KEY_CURSOS, []).map(function (c) { return normCourse(c, true); });
    },

    cursos: function () {
      return builtin.concat(this.propios());
    },

    curso_: function (id) {
      var all = this.cursos();
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return null;
    },

    guardarCurso: function (curso) {
      var lista = this._read(KEY_CURSOS, []);
      var c = normCourse(curso, true);
      if (!c.id) c.id = slug(c.nombre);
      // Evita colisión con un curso incorporado
      var choque = builtin.some(function (b) { return b.id === c.id; });
      if (choque) c.id = c.id + '-' + Math.random().toString(36).slice(2, 5);
      var idx = -1;
      for (var i = 0; i < lista.length; i++) if (lista[i].id === c.id) idx = i;
      if (idx >= 0) lista[idx] = c; else lista.push(c);
      return this._write(KEY_CURSOS, lista) ? c : null;
    },

    borrarCurso: function (id) {
      var lista = this._read(KEY_CURSOS, []).filter(function (c) { return c.id !== id; });
      return this._write(KEY_CURSOS, lista);
    },

    /** Copia un curso incorporado a "mis cursos" para poder editarlo. */
    duplicarCurso: function (id) {
      var c = this.curso_(id);
      if (!c) return null;
      var copia = JSON.parse(JSON.stringify(c));
      copia.id = slug(c.nombre + '-copia');
      copia.nombre = c.nombre + ' (copia)';
      copia.preguntas.forEach(function (p) { p.id = uid(); });
      return this.guardarCurso(copia);
    },

    /* ------------------------------------------ importación / exportación */
    exportarCurso: function (id) {
      var c = this.curso_(id);
      if (!c) return null;
      return JSON.stringify({
        id: c.id, nombre: c.nombre, emoji: c.emoji, desc: c.descripcion, autor: c.autor,
        preguntas: c.preguntas.map(function (p) {
          return { q: p.q, o: p.opciones, r: p.correcta, d: p.dificultad, c: p.categoria, e: p.explicacion };
        })
      }, null, 2);
    },

    /** Importa un curso (objeto o array de cursos) desde texto JSON. */
    importar: function (texto) {
      var datos = JSON.parse(texto);
      var lista = Array.isArray(datos) ? datos : [datos];
      var creados = [];
      for (var i = 0; i < lista.length; i++) {
        var c = normCourse(lista[i], true);
        if (!c.preguntas.length) throw new Error('El curso "' + c.nombre + '" no contiene preguntas válidas.');
        var g = this.guardarCurso(c);
        if (g) creados.push(g);
      }
      return creados;
    },

    /* -------------------------------------------------------- consultas */
    categorias: function (cursoIds) {
      var mapa = {};
      this.cursos().forEach(function (c) {
        if (cursoIds && cursoIds.indexOf(c.id) < 0) return;
        c.preguntas.forEach(function (p) { mapa[p.categoria] = (mapa[p.categoria] || 0) + 1; });
      });
      return Object.keys(mapa).sort().map(function (k) { return { nombre: k, total: mapa[k] }; });
    },

    contarPorDificultad: function (cursoIds, cats) {
      var out = { basico: 0, medio: 0, avanzado: 0 };
      this.preguntasDe(cursoIds, cats, DIFS).forEach(function (p) { out[p.dificultad]++; });
      return out;
    },

    preguntasDe: function (cursoIds, cats, difs) {
      var res = [];
      this.cursos().forEach(function (c) {
        if (cursoIds && cursoIds.length && cursoIds.indexOf(c.id) < 0) return;
        c.preguntas.forEach(function (p) {
          if (cats && cats.length && cats.indexOf(p.categoria) < 0) return;
          if (difs && difs.length && difs.indexOf(p.dificultad) < 0) return;
          var copia = Object.assign({}, p);
          copia.curso = c.nombre; copia.cursoId = c.id;
          res.push(copia);
        });
      });
      return res;
    },

    /** Selección aleatoria equilibrada entre categorías. */
    seleccionar: function (cursoIds, cats, difs, n) {
      var pool = this.preguntasDe(cursoIds, cats, difs);
      shuffle(pool);
      if (!n || n >= pool.length) return pool;

      // Reparto round-robin por categoría para que no salga todo del mismo tema
      var porCat = {};
      pool.forEach(function (p) { (porCat[p.categoria] = porCat[p.categoria] || []).push(p); });
      var claves = Object.keys(porCat); shuffle(claves);
      var out = [], vueltas = 0;
      while (out.length < n && vueltas < 400) {
        var quedan = false;
        for (var i = 0; i < claves.length && out.length < n; i++) {
          var arr = porCat[claves[i]];
          if (arr.length) { out.push(arr.shift()); quedan = true; }
        }
        if (!quedan) break;
        vueltas++;
      }
      shuffle(out);
      return out;
    },

    totalPreguntas: function () {
      return this.cursos().reduce(function (a, c) { return a + c.preguntas.length; }, 0);
    },

    /* -------------------------------------------------------- historial */
    historial: function () { return this._read(KEY_HIST, []); },

    guardarResultado: function (r) {
      var h = this._read(KEY_HIST, []);
      h.unshift(r);
      if (h.length > 100) h = h.slice(0, 100);
      this._write(KEY_HIST, h);
      return h;
    },

    borrarHistorial: function () { return this._write(KEY_HIST, []); },

    resumenHistorial: function () {
      var h = this.historial();
      if (!h.length) return { partidas: 0, aciertos: 0, total: 0, media: 0, mejor: 0 };
      var aciertos = 0, total = 0, mejor = 0;
      h.forEach(function (r) {
        aciertos += r.aciertos; total += r.total;
        var pct = r.total ? Math.round(r.aciertos / r.total * 100) : 0;
        if (pct > mejor) mejor = pct;
      });
      return {
        partidas: h.length, aciertos: aciertos, total: total,
        media: total ? Math.round(aciertos / total * 100) : 0, mejor: mejor
      };
    },

    perfil: function (nombre) {
      if (nombre === undefined) return this._read(KEY_PERFIL, { nombre: 'Invitado' });
      var p = { nombre: nombre || 'Invitado' };
      this._write(KEY_PERFIL, p);
      return p;
    }
  };

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  Data.shuffle = shuffle;

  global.TQData = Data;
  // Alias corto que usan los ficheros de data/cursos/*.js
  global.TQ = { curso: function (d) { Data.curso(d); } };
})(window);
