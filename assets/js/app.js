/* ==========================================================================
   TechQuiz — Lógica de la aplicación
   Pantallas, motor de juego, resultados, editor de cursos e historial.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.TQData, A = window.TQAudio;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var SHAPES = ['▲', '◆', '●', '■'];
  var CIRC_TIMER = 2 * Math.PI * 52;
  var CIRC_RES = 2 * Math.PI * 86;

  /* ====================================================== utilidades UI */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(msg, tipo) {
    var t = document.createElement('div');
    t.className = 'toast ' + (tipo || '');
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s'; t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 320);
    }, 2600);
  }

  function confetti(n) {
    var cont = $('#confetti');
    var colores = ['#7c5cff', '#22d3ee', '#22c55e', '#f59e0b', '#f43f5e', '#a78bfa'];
    for (var i = 0; i < (n || 60); i++) {
      var p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.top = '-20px';
      p.style.background = colores[i % colores.length];
      p.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      cont.appendChild(p);
      (function (el) { setTimeout(function () { el.remove(); }, 4200); })(p);
    }
  }

  var pantallaActual = 'home';
  function ir(nombre) {
    if (nombre !== 'play') pararPartida(false);
    $$('.screen').forEach(function (s) { s.classList.remove('active'); });
    var el = $('#scr-' + nombre);
    if (el) el.classList.add('active');
    pantallaActual = nombre;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (nombre === 'home') { renderHome(); musica('menu'); }
    if (nombre === 'setup') { renderSetup(); musica('menu'); }
    if (nombre === 'editor') { renderEditor(); musica('menu'); }
    if (nombre === 'historial') { renderHistorial(); musica('menu'); }
  }

  function musica(tema) {
    if (!A.started) return;              // aún no hubo gesto del usuario
    if (!A.prefs.music) { A.playMusic(tema); return; }
    A.playMusic(tema);
  }

  /* ====================================================== panel de audio */
  function initAudioUI() {
    var p = A.prefs;
    $('#swMusic').classList.toggle('on', p.music);
    $('#swSfx').classList.toggle('on', p.sfx);
    $('#volMusic').value = Math.round(p.musicVol * 100);
    $('#volSfx').value = Math.round(p.sfxVol * 100);
    $('#lblMusic').textContent = Math.round(p.musicVol * 100) + '%';
    $('#lblSfx').textContent = Math.round(p.sfxVol * 100) + '%';
    $('#eq').classList.toggle('off', !p.music);
    $('#eqIcon').textContent = p.music ? '🔊' : '🔇';

    $('#btnAudio').addEventListener('click', function (e) {
      e.stopPropagation();
      $('#audioPanel').classList.toggle('show');
      despertarAudio();
    });
    document.addEventListener('click', function (e) {
      var panel = $('#audioPanel');
      if (panel.classList.contains('show') && !panel.contains(e.target)) panel.classList.remove('show');
    });

    $('#swMusic').addEventListener('click', function () {
      despertarAudio();
      var on = A.toggleMusic();
      this.classList.toggle('on', on);
      $('#eq').classList.toggle('off', !on);
      $('#eqIcon').textContent = on ? '🔊' : '🔇';
      if (on && !A.themeName) musica(pantallaActual === 'play' ? temaDePartida() : 'menu');
    });
    $('#swSfx').addEventListener('click', function () {
      despertarAudio();
      this.classList.toggle('on', A.toggleSfx());
      A.sfx('click');
    });
    $('#volMusic').addEventListener('input', function () {
      A.setMusicVol(this.value / 100);
      $('#lblMusic').textContent = this.value + '%';
    });
    $('#volSfx').addEventListener('input', function () {
      A.setSfxVol(this.value / 100);
      $('#lblSfx').textContent = this.value + '%';
    });
    A.bindVisibility();
  }

  var audioDespierto = false;
  function despertarAudio() {
    if (audioDespierto) return;
    if (A.unlock()) {
      audioDespierto = true;
      if (A.prefs.music) musica(pantallaActual === 'play' ? temaDePartida() : 'menu');
    }
  }
  // Cualquier interacción sirve como gesto para desbloquear el audio
  ['pointerdown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, despertarAudio, { once: false });
  });

  /* ============================================================== INICIO */
  function renderHome() {
    var cursos = D.cursos();
    var total = D.totalPreguntas();
    var cats = D.categorias(null);
    $('#stCursos').textContent = cursos.length;
    $('#stPreguntas').textContent = total;
    $('#stCategorias').textContent = cats.length;

    var res = D.resumenHistorial();
    $('#stMedia').textContent = res.partidas ? res.media + '%' : '—';
    $('#badgeStats').textContent = total + ' preguntas · ' + cats.length + ' categorías · ' + cursos.length + ' cursos';

    var grid = $('#courseGrid');
    grid.innerHTML = '';
    cursos.forEach(function (c) {
      var catsCurso = {};
      c.preguntas.forEach(function (p) { catsCurso[p.categoria] = 1; });
      var b = document.createElement('button');
      b.className = 'course-card';
      b.innerHTML =
        '<span class="course-emoji">' + esc(c.emoji) + '</span>' +
        '<h3>' + esc(c.nombre) + '</h3>' +
        '<p>' + esc(c.descripcion || 'Sin descripción') + '</p>' +
        '<div class="course-meta">' +
          '<span class="chip">' + c.preguntas.length + ' preguntas</span>' +
          '<span class="chip">' + Object.keys(catsCurso).length + ' temas</span>' +
          (c.propio ? '<span class="chip chip-own">Mi curso</span>' : '') +
        '</div>';
      b.addEventListener('click', function () {
        A.sfx('select');
        abrirSetup([c.id]);
      });
      grid.appendChild(b);
    });

    if (!cursos.length) {
      grid.innerHTML = '<div class="empty"><div class="big">📭</div>No hay cursos todavía. Crea el primero desde <b>Mis cursos</b>.</div>';
    }
  }

  /* ========================================================= CONFIGURAR */
  var setup = { cursos: [], cats: [], difs: [], num: 20, tiempo: 20, modo: 'practica', pass: 70 };

  function abrirSetup(cursoIds) {
    setup.cursos = cursoIds && cursoIds.length ? cursoIds.slice() : D.cursos().map(function (c) { return c.id; });
    setup.cats = [];
    ir('setup');
  }

  function renderSetup() {
    var cursos = D.cursos();
    if (!setup.cursos.length) setup.cursos = cursos.map(function (c) { return c.id; });

    // Cursos
    var pc = $('#pillCursos'); pc.innerHTML = '';
    cursos.forEach(function (c) {
      var on = setup.cursos.indexOf(c.id) >= 0;
      var l = document.createElement('label');
      l.className = 'pill' + (on ? ' on' : '');
      l.innerHTML = esc(c.emoji) + ' ' + esc(c.nombre) + ' <span class="cnt">' + c.preguntas.length + '</span>';
      l.addEventListener('click', function () {
        var i = setup.cursos.indexOf(c.id);
        if (i >= 0) { if (setup.cursos.length > 1) setup.cursos.splice(i, 1); }
        else setup.cursos.push(c.id);
        setup.cats = setup.cats.filter(function (cat) {
          return D.categorias(setup.cursos).some(function (x) { return x.nombre === cat; });
        });
        A.sfx('click');
        renderSetup();
      });
      pc.appendChild(l);
    });

    // Categorías
    var cats = D.categorias(setup.cursos);
    var pcat = $('#pillCats'); pcat.innerHTML = '';
    cats.forEach(function (cat) {
      var on = setup.cats.indexOf(cat.nombre) >= 0;
      var l = document.createElement('label');
      l.className = 'pill' + (on ? ' on' : '');
      l.innerHTML = esc(cat.nombre) + ' <span class="cnt">' + cat.total + '</span>';
      l.addEventListener('click', function () {
        var i = setup.cats.indexOf(cat.nombre);
        if (i >= 0) setup.cats.splice(i, 1); else setup.cats.push(cat.nombre);
        A.sfx('click');
        renderSetup();
      });
      pcat.appendChild(l);
    });

    // Dificultad
    var pd = $('#pillDifs'); pd.innerHTML = '';
    var conteo = D.contarPorDificultad(setup.cursos, setup.cats);
    D.DIFS.forEach(function (dif) {
      var on = setup.difs.indexOf(dif) >= 0;
      var l = document.createElement('label');
      l.className = 'pill' + (on ? ' on' : '');
      l.innerHTML = D.DIF_LABEL[dif] + ' <span class="cnt">' + conteo[dif] + '</span>';
      l.addEventListener('click', function () {
        var i = setup.difs.indexOf(dif);
        if (i >= 0) setup.difs.splice(i, 1); else setup.difs.push(dif);
        A.sfx('click');
        renderSetup();
      });
      pd.appendChild(l);
    });

    actualizarResumen();
  }

  function actualizarResumen() {
    var pool = D.preguntasDe(setup.cursos, setup.cats, setup.difs).length;
    var n = Math.min(setup.num, pool);
    var segs = setup.tiempo || 25;
    var mins = Math.max(1, Math.round(n * (segs + 6) / 60));

    $('#sumPool').textContent = pool;
    $('#sumNum').textContent = n;
    $('#sumMax').textContent = n + ' pts';
    $('#sumDur').textContent = '~' + mins + ' min';
    $('#lblNum').textContent = setup.num;
    $('#lblTime').textContent = setup.tiempo ? setup.tiempo + ' s' : 'Sin límite';
    $('#lblPass').textContent = setup.pass + '%';
    $('#fieldAprobado').classList.toggle('hidden', setup.modo !== 'examen');
    $('#btnStart').disabled = pool === 0;
    if (!pool) $('#sumPool').textContent = '0 — amplía la selección';
  }

  function initSetupUI() {
    $('#rngNum').addEventListener('input', function () { setup.num = +this.value; actualizarResumen(); });
    $('#rngTime').addEventListener('input', function () { setup.tiempo = +this.value; actualizarResumen(); });
    $('#rngPass').addEventListener('input', function () { setup.pass = +this.value; actualizarResumen(); });
    $$('#modeList input').forEach(function (r) {
      r.addEventListener('change', function () {
        setup.modo = this.value;
        $$('.mode').forEach(function (m) { m.classList.remove('on'); });
        this.closest('.mode').classList.add('on');
        A.sfx('select');
        actualizarResumen();
      });
    });
    $('#btnStart').addEventListener('click', function () { empezarPartida(); });
  }

  /* ============================================================ PARTIDA */
  var game = null;

  function temaDePartida() {
    if (!game) return 'menu';
    return game.modo === 'examen' ? 'exam' : (game.modo === 'juego' ? 'game' : 'menu');
  }

  function empezarPartida(preguntasFijas) {
    var preguntas = preguntasFijas ||
      D.seleccionar(setup.cursos, setup.cats, setup.difs, setup.num);

    if (!preguntas.length) { toast('No hay preguntas con esos filtros', 'ko'); return; }

    game = {
      preguntas: preguntas.map(function (p) {
        // Baraja las opciones manteniendo la referencia a la correcta
        var pares = p.opciones.map(function (o, i) { return { t: o, ok: i === p.correcta }; });
        D.shuffle(pares);
        var okIdx = 0;
        pares.forEach(function (x, i) { if (x.ok) okIdx = i; });
        return {
          ref: p,
          texto: p.q,
          opciones: pares.map(function (x) { return x.t; }),
          correcta: okIdx,
          categoria: p.categoria,
          dificultad: p.dificultad,
          curso: p.curso,
          explicacion: p.explicacion
        };
      }),
      i: 0, aciertos: 0, racha: 0, mejorRacha: 0,
      respuestas: [], modo: setup.modo, tiempo: setup.tiempo,
      pass: setup.pass, inicio: Date.now(), bloqueado: false, tRestante: 0, tId: null
    };

    $('#qTotal').textContent = game.preguntas.length;
    $('#pillStreak').classList.toggle('hidden', game.modo !== 'juego');
    ir('play');
    despertarAudio();
    musica(temaDePartida());
    A.sfx('start');
    pintarPregunta();
  }

  function pintarPregunta() {
    var q = game.preguntas[game.i];
    game.bloqueado = false;

    $('#qNow').textContent = game.i + 1;
    $('#scoreN').textContent = game.aciertos;
    $('#streakN').textContent = game.racha;
    $('#progBar').style.width = (game.i / game.preguntas.length * 100) + '%';
    $('#qText').textContent = q.texto;
    $('#qCat').textContent = q.categoria;
    $('#qDif').textContent = D.DIF_LABEL[q.dificultad];
    $('#qCurso').textContent = q.curso || '';
    $('#feedback').className = 'feedback';

    var cont = $('#answers'); cont.innerHTML = '';
    q.opciones.forEach(function (op, idx) {
      var b = document.createElement('button');
      b.className = 'ans a' + (idx % 4);
      b.setAttribute('data-shape', SHAPES[idx % 4]);
      b.textContent = op;
      b.addEventListener('click', function () { responder(idx); });
      cont.appendChild(b);
    });

    if (game.tiempo > 0) {
      $('#timer').classList.remove('hidden', 'warn', 'danger');
      $('#qArea').classList.remove('no-timer');
      iniciarTemporizador();
    } else {
      $('#timer').classList.add('hidden');
      $('#qArea').classList.add('no-timer');
    }
  }

  function iniciarTemporizador() {
    clearInterval(game.tId);
    game.tRestante = game.tiempo;
    pintarTemporizador();
    game.tId = setInterval(function () {
      game.tRestante--;
      pintarTemporizador();
      if (game.tRestante <= 5 && game.tRestante > 0) A.sfx(game.tRestante <= 3 ? 'tickLast' : 'tick');
      if (game.tRestante <= 0) { clearInterval(game.tId); responder(-1); }
    }, 1000);
  }

  function pintarTemporizador() {
    var t = Math.max(0, game.tRestante);
    $('#timerNum').textContent = t;
    var frac = game.tiempo ? t / game.tiempo : 0;
    $('#timerArc').style.strokeDashoffset = CIRC_TIMER * (1 - frac);
    var el = $('#timer');
    el.classList.toggle('warn', frac <= 0.5 && frac > 0.25);
    el.classList.toggle('danger', frac <= 0.25);
  }

  function responder(idx) {
    if (game.bloqueado) return;
    game.bloqueado = true;
    clearInterval(game.tId);

    var q = game.preguntas[game.i];
    var acierto = idx === q.correcta;
    var agotado = idx === -1;

    if (acierto) {
      game.aciertos++;
      game.racha++;
      if (game.racha > game.mejorRacha) game.mejorRacha = game.racha;
    } else {
      game.racha = 0;
    }

    game.respuestas.push({
      pregunta: q.texto, categoria: q.categoria, dificultad: q.dificultad,
      elegida: agotado ? null : q.opciones[idx],
      correcta: q.opciones[q.correcta], acierto: acierto, agotado: agotado,
      explicacion: q.explicacion, ref: q.ref
    });

    // Marcado visual
    $$('.ans').forEach(function (b, i) {
      b.classList.add('locked');
      if (game.modo === 'examen') { if (i === idx) b.classList.add('chosen'); return; }
      if (i === q.correcta) b.classList.add('right');
      else if (i === idx) b.classList.add('wrong');
      else b.classList.add('dim');
    });

    $('#scoreN').textContent = game.aciertos;
    $('#streakN').textContent = game.racha;

    if (game.modo !== 'examen') {
      A.sfx(agotado ? 'timeout' : (acierto ? 'correct' : 'wrong'));
      if (acierto && game.racha > 0 && game.racha % 5 === 0) { A.sfx('streak'); confetti(26); }

      var fb = $('#feedback');
      fb.className = 'feedback show ' + (acierto ? 'ok' : 'ko');
      $('#fbTitle').textContent = agotado ? '⏱️ Tiempo agotado'
        : (acierto ? '✅ Correcto' : '❌ Incorrecto');
      var txt = '';
      if (!acierto) txt += 'Respuesta correcta: ' + q.opciones[q.correcta] + '. ';
      txt += q.explicacion || '';
      $('#fbText').textContent = txt.trim() || 'Puntuación: ' + game.aciertos + ' / ' + (game.i + 1);
      $('#btnNext').textContent = (game.i + 1 >= game.preguntas.length) ? 'Ver resultado →' : 'Siguiente →';
      $('#btnNext').focus();
    } else {
      A.sfx(agotado ? 'timeout' : 'click');
      setTimeout(siguiente, 420);
    }
  }

  function siguiente() {
    game.i++;
    if (game.i >= game.preguntas.length) { terminarPartida(); return; }
    pintarPregunta();
  }

  function pararPartida(silencio) {
    if (game && game.tId) clearInterval(game.tId);
    if (!silencio) { /* nada más que limpiar */ }
  }

  function terminarPartida() {
    clearInterval(game.tId);
    $('#progBar').style.width = '100%';

    var total = game.preguntas.length;
    var pct = Math.round(game.aciertos / total * 100);
    var aprobado = pct >= game.pass;

    D.guardarResultado({
      fecha: Date.now(),
      cursos: setup.cursos.slice(),
      nombreCursos: setup.cursos.map(function (id) {
        var c = D.curso_(id); return c ? c.nombre : id;
      }),
      modo: game.modo, total: total, aciertos: game.aciertos, pct: pct,
      mejorRacha: game.mejorRacha,
      segundos: Math.round((Date.now() - game.inicio) / 1000),
      porCategoria: agruparPorCategoria(game.respuestas)
    });

    renderResultados(pct, aprobado);
    ir('result');
    musica('results');

    if (game.modo === 'examen') { A.sfx(aprobado ? 'win' : 'lose'); if (aprobado) confetti(90); }
    else { A.sfx(pct >= 60 ? 'win' : 'lose'); if (pct >= 60) confetti(pct >= 90 ? 130 : 70); }
  }

  function agruparPorCategoria(respuestas) {
    var mapa = {};
    respuestas.forEach(function (r) {
      if (!mapa[r.categoria]) mapa[r.categoria] = { ok: 0, total: 0 };
      mapa[r.categoria].total++;
      if (r.acierto) mapa[r.categoria].ok++;
    });
    return mapa;
  }

  /* ========================================================= RESULTADOS */
  var mostrandoSoloFallos = false;

  function renderResultados(pct, aprobado) {
    var total = game.preguntas.length;
    var nombres = setup.cursos.map(function (id) {
      var c = D.curso_(id); return c ? c.nombre : id;
    });
    $('#resTitle').textContent = nombres.length > 2 ? 'Prueba combinada (' + nombres.length + ' cursos)' : nombres.join(' + ');
    $('#resPct').textContent = pct + '%';
    $('#resFrac').textContent = game.aciertos + ' / ' + total + ' correctas';

    var arc = $('#resArc');
    arc.style.strokeDashoffset = CIRC_RES;
    setTimeout(function () { arc.style.strokeDashoffset = CIRC_RES * (1 - pct / 100); }, 90);

    var v = $('#resVerdict');
    if (game.modo === 'examen') {
      v.innerHTML = '<span class="verdict ' + (aprobado ? 'pass' : 'fail') + '">' +
        (aprobado ? '🏆 APROBADO' : '📉 NO SUPERADO') + ' · mínimo ' + game.pass + '%</span>';
    } else {
      var msg = pct >= 90 ? '🌟 Excelente' : pct >= 70 ? '👏 Buen nivel'
        : pct >= 50 ? '📈 Vas por buen camino' : '💪 Toca repasar';
      var extra = game.mejorRacha >= 3 ? ' · racha máxima 🔥 ' + game.mejorRacha : '';
      v.innerHTML = '<span class="verdict">' + msg + extra + '</span>';
    }

    // Barras por categoría
    var cats = agruparPorCategoria(game.respuestas);
    var bars = $('#resBars'); bars.innerHTML = '';
    Object.keys(cats).sort().forEach(function (k) {
      var c = cats[k], p = Math.round(c.ok / c.total * 100);
      var row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = '<div class="bl"><span>' + esc(k) + '</span><b>' + c.ok + '/' + c.total + ' · ' + p + '%</b></div>' +
        '<div class="bar-track"><i class="' + (p < 50 ? 'low' : p < 75 ? 'mid' : '') + '" style="width:0%"></i></div>';
      bars.appendChild(row);
      (function (el, p) { setTimeout(function () { el.style.width = p + '%'; }, 140); })($('i', row), p);
    });

    // Recomendaciones
    var flojas = Object.keys(cats).filter(function (k) {
      return (cats[k].ok / cats[k].total) < 0.6;
    }).sort(function (a, b) { return (cats[a].ok / cats[a].total) - (cats[b].ok / cats[b].total); });

    var adv = $('#resAdvice');
    if (flojas.length) {
      adv.innerHTML = '<div class="advice"><h4>⚠️ Te recomendamos repasar</h4><ul>' +
        flojas.map(function (k) {
          return '<li><b>' + esc(k) + '</b> — ' + cats[k].ok + ' de ' + cats[k].total + ' correctas</li>';
        }).join('') + '</ul></div>';
    } else {
      adv.innerHTML = '<div class="advice" style="border-left-color:var(--green);background:rgba(34,197,94,.1)">' +
        '<h4 style="color:#93f5b9">✅ Sin puntos débiles</h4>' +
        '<ul><li>Superas el 60% en todas las categorías. Prueba a subir la dificultad o el número de preguntas.</li></ul></div>';
    }

    mostrandoSoloFallos = false;
    pintarRepaso();

    var fallos = game.respuestas.filter(function (r) { return !r.acierto; });
    $('#btnFallos').classList.toggle('hidden', fallos.length === 0);
  }

  function pintarRepaso() {
    var lista = game.respuestas.filter(function (r) { return mostrandoSoloFallos ? !r.acierto : true; });
    var cont = $('#resReview'); cont.innerHTML = '';
    $('#btnToggleRev').textContent = mostrandoSoloFallos ? 'Ver todas' : 'Ver falladas';

    if (!lista.length) {
      cont.innerHTML = '<div class="empty"><div class="big">🎉</div>No has fallado ninguna pregunta.</div>';
      return;
    }

    lista.forEach(function (r, n) {
      var div = document.createElement('div');
      div.className = 'rev-item';
      var tuya = r.agotado ? '<span class="rev-ko">⏱️ Sin responder</span>'
        : '<span class="' + (r.acierto ? 'rev-ok' : 'rev-ko') + '">' + esc(r.elegida) + '</span>';
      div.innerHTML =
        '<p class="rq">' + (r.acierto ? '✅' : '❌') + ' ' + esc(r.pregunta) + '</p>' +
        '<div class="rev-line"><span class="tag">Tu resp.</span><span>' + tuya + '</span></div>' +
        (r.acierto ? '' : '<div class="rev-line"><span class="tag">Correcta</span><span class="rev-ok">' + esc(r.correcta) + '</span></div>') +
        '<div class="rev-line"><span class="tag">Tema</span><span class="muted">' + esc(r.categoria) + ' · ' + D.DIF_LABEL[r.dificultad] + '</span></div>' +
        (r.explicacion ? '<div class="rev-exp">💡 ' + esc(r.explicacion) + '</div>' : '');
      cont.appendChild(div);
    });
  }

  /* ============================================================= EDITOR */
  var ed = { cursoId: null, preguntaId: null, opciones: ['', '', '', ''], correcta: 0, filtro: '' };

  function cursoEditable() {
    var c = D.curso_(ed.cursoId);
    return c && c.propio ? c : null;
  }

  function renderEditor() {
    var cursos = D.cursos();
    var sel = $('#edCursoSel');
    if (!ed.cursoId || !D.curso_(ed.cursoId)) {
      var propio = cursos.filter(function (c) { return c.propio; })[0];
      ed.cursoId = propio ? propio.id : (cursos[0] ? cursos[0].id : null);
    }
    sel.innerHTML = cursos.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === ed.cursoId ? ' selected' : '') + '>' +
        esc(c.emoji + ' ' + c.nombre) + (c.propio ? ' — mi curso' : ' — incorporado') + '</option>';
    }).join('');

    var curso = D.curso_(ed.cursoId);
    var editable = !!(curso && curso.propio);

    $('#edNombre').value = curso ? curso.nombre : '';
    $('#edEmoji').value = curso ? curso.emoji : '';
    $('#edDesc').value = curso ? curso.descripcion : '';
    ['edNombre', 'edEmoji', 'edDesc'].forEach(function (id) { $('#' + id).disabled = !editable; });
    $('#edGuardarCurso').disabled = !editable;
    $('#edBorrarCurso').disabled = !editable;
    $('#edNuevaPregunta').disabled = !editable;

    $('#edAviso').innerHTML = editable
      ? '💾 Los cursos propios se guardan en este navegador. Usa <b>Exportar</b> para conservarlos o compartirlos.'
      : '🔒 Este curso viene incluido en la aplicación. Pulsa <b>Duplicar curso</b> para crear una copia editable.';

    // Lista de preguntas
    var lista = $('#edList'); lista.innerHTML = '';
    var preguntas = curso ? curso.preguntas : [];
    var filtro = ed.filtro.toLowerCase();
    var vistas = preguntas.filter(function (p) {
      return !filtro || p.q.toLowerCase().indexOf(filtro) >= 0 || p.categoria.toLowerCase().indexOf(filtro) >= 0;
    });
    $('#edCount').textContent = preguntas.length;

    if (!vistas.length) {
      lista.innerHTML = '<div class="empty" style="padding:24px 8px">Sin preguntas' + (filtro ? ' que coincidan' : '') + '.</div>';
    }
    vistas.forEach(function (p) {
      var b = document.createElement('button');
      b.className = 'ed-item' + (p.id === ed.preguntaId ? ' on' : '');
      b.innerHTML = esc(p.q.slice(0, 82) + (p.q.length > 82 ? '…' : '')) +
        '<small>' + esc(p.categoria) + ' · ' + D.DIF_LABEL[p.dificultad] + '</small>';
      b.addEventListener('click', function () { cargarPregunta(p); });
      lista.appendChild(b);
    });

    // Datalist de categorías
    $('#catList').innerHTML = D.categorias(null).map(function (c) {
      return '<option value="' + esc(c.nombre) + '">';
    }).join('');

    $$('#edForm input, #edForm textarea, #edForm select, #edForm button').forEach(function (e) {
      e.disabled = !editable;
    });

    pintarOpciones();
  }

  function cargarPregunta(p) {
    ed.preguntaId = p.id;
    ed.opciones = p.opciones.slice();
    ed.correcta = p.correcta;
    $('#fqTexto').value = p.q;
    $('#fqCat').value = p.categoria;
    $('#fqDif').value = p.dificultad;
    $('#fqExp').value = p.explicacion;
    pintarOpciones();
    $$('.ed-item').forEach(function (e) { e.classList.remove('on'); });
    renderEditor();
  }

  function limpiarFormulario() {
    ed.preguntaId = null;
    ed.opciones = ['', '', '', ''];
    ed.correcta = 0;
    $('#fqTexto').value = '';
    $('#fqExp').value = '';
    pintarOpciones();
    renderEditor();
    $('#fqTexto').focus();
  }

  function pintarOpciones() {
    var cont = $('#fqOpciones'); cont.innerHTML = '';
    ed.opciones.forEach(function (op, i) {
      var row = document.createElement('div');
      row.className = 'opt-row';
      var mark = document.createElement('button');
      mark.className = 'mark' + (i === ed.correcta ? ' on' : '');
      mark.type = 'button';
      mark.textContent = i === ed.correcta ? '✓' : SHAPES[i % 4];
      mark.title = 'Marcar como respuesta correcta';
      mark.addEventListener('click', function () { ed.correcta = i; pintarOpciones(); A.sfx('click'); });
      var input = document.createElement('input');
      input.type = 'text';
      input.value = op;
      input.placeholder = 'Opción ' + (i + 1);
      input.addEventListener('input', function () { ed.opciones[i] = this.value; });
      row.appendChild(mark); row.appendChild(input);
      cont.appendChild(row);
    });
  }

  function guardarPregunta() {
    var curso = cursoEditable();
    if (!curso) { toast('Duplica el curso para poder editarlo', 'ko'); return; }

    var texto = $('#fqTexto').value.trim();
    var ops = ed.opciones.map(function (o) { return o.trim(); }).filter(function (o) { return o; });
    if (!texto) { toast('Falta el enunciado', 'ko'); return; }
    if (ops.length < 2) { toast('Necesitas al menos 2 opciones', 'ko'); return; }
    if (ed.correcta >= ops.length) { toast('Marca cuál es la respuesta correcta', 'ko'); return; }

    var nueva = {
      id: ed.preguntaId || D.uid(),
      q: texto,
      opciones: ops,
      correcta: ed.correcta,
      categoria: $('#fqCat').value.trim() || 'General',
      dificultad: $('#fqDif').value,
      explicacion: $('#fqExp').value.trim()
    };

    var idx = -1;
    curso.preguntas.forEach(function (p, i) { if (p.id === nueva.id) idx = i; });
    if (idx >= 0) curso.preguntas[idx] = nueva; else curso.preguntas.push(nueva);

    D.guardarCurso(curso);
    ed.preguntaId = nueva.id;
    A.sfx('correct');
    toast(idx >= 0 ? 'Pregunta actualizada' : 'Pregunta añadida ✅', 'ok');
    renderEditor();
  }

  function initEditorUI() {
    $('#edCursoSel').addEventListener('change', function () {
      ed.cursoId = this.value; ed.preguntaId = null; limpiarFormulario();
    });
    $('#edBuscar').addEventListener('input', function () { ed.filtro = this.value; renderEditor(); });

    $('#edNuevoCurso').addEventListener('click', function () {
      var nombre = prompt('Nombre del nuevo curso:', 'Mi curso de redes');
      if (!nombre) return;
      var c = D.guardarCurso({ nombre: nombre, emoji: '📘', desc: '', preguntas: [] });
      if (!c) { toast('No se pudo guardar', 'ko'); return; }
      ed.cursoId = c.id; ed.preguntaId = null;
      A.sfx('select');
      toast('Curso creado: ' + c.nombre, 'ok');
      renderEditor(); limpiarFormulario();
    });

    $('#edGuardarCurso').addEventListener('click', function () {
      var curso = cursoEditable();
      if (!curso) return;
      curso.nombre = $('#edNombre').value.trim() || curso.nombre;
      curso.emoji = $('#edEmoji').value.trim() || '📘';
      curso.descripcion = $('#edDesc').value.trim();
      D.guardarCurso(curso);
      toast('Curso guardado ✅', 'ok');
      A.sfx('correct');
      renderEditor();
    });

    $('#edBorrarCurso').addEventListener('click', function () {
      var curso = cursoEditable();
      if (!curso) return;
      if (!confirm('¿Borrar el curso "' + curso.nombre + '" y todas sus preguntas?\nEsta acción no se puede deshacer.')) return;
      D.borrarCurso(curso.id);
      ed.cursoId = null; ed.preguntaId = null;
      toast('Curso borrado');
      renderEditor(); limpiarFormulario();
    });

    $('#edDuplicar').addEventListener('click', function () {
      var c = D.duplicarCurso(ed.cursoId);
      if (!c) { toast('No se pudo duplicar', 'ko'); return; }
      ed.cursoId = c.id;
      toast('Copia editable creada ✅', 'ok');
      A.sfx('select');
      renderEditor();
    });

    $('#edJugarCurso').addEventListener('click', function () {
      if (!ed.cursoId) return;
      abrirSetup([ed.cursoId]);
    });

    $('#edExportar').addEventListener('click', function () {
      var json = D.exportarCurso(ed.cursoId);
      if (!json) return;
      var curso = D.curso_(ed.cursoId);
      var blob = new Blob([json], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'techquiz-' + curso.id + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      toast('Curso exportado 📤', 'ok');
    });

    $('#edImportar').addEventListener('click', function () {
      $('#edImportBox').classList.remove('hidden');
      $('#edImportBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    $('#edImportCerrar').addEventListener('click', function () { $('#edImportBox').classList.add('hidden'); });

    $('#edFile').addEventListener('change', function () {
      var f = this.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () { $('#edJson').value = fr.result; };
      fr.readAsText(f);
    });

    $('#edImportOk').addEventListener('click', function () {
      var txt = $('#edJson').value.trim();
      if (!txt) { toast('Pega el JSON del curso', 'ko'); return; }
      try {
        var creados = D.importar(txt);
        ed.cursoId = creados[0].id;
        $('#edJson').value = '';
        $('#edImportBox').classList.add('hidden');
        A.sfx('win');
        toast('Importado: ' + creados.map(function (c) { return c.nombre; }).join(', '), 'ok');
        renderEditor();
      } catch (e) {
        toast('JSON no válido: ' + e.message, 'ko');
      }
    });

    $('#edPlantilla').addEventListener('click', function () {
      $('#edJson').value = JSON.stringify({
        nombre: 'Curso de ejemplo',
        emoji: '🧪',
        desc: 'Plantilla para crear tus propios cursos',
        preguntas: [{
          q: '¿Qué protocolo asigna direcciones IP automáticamente?',
          o: ['DNS', 'DHCP', 'HTTP', 'FTP'],
          r: 1,
          d: 'basico',
          c: 'Redes',
          e: 'DHCP entrega IP, máscara, puerta de enlace y DNS de forma automática.'
        }]
      }, null, 2);
    });

    $('#edNuevaPregunta').addEventListener('click', limpiarFormulario);
    $('#fqNueva').addEventListener('click', limpiarFormulario);
    $('#fqGuardar').addEventListener('click', guardarPregunta);

    $('#fqBorrar').addEventListener('click', function () {
      var curso = cursoEditable();
      if (!curso || !ed.preguntaId) { toast('Selecciona una pregunta', 'ko'); return; }
      if (!confirm('¿Borrar esta pregunta?')) return;
      curso.preguntas = curso.preguntas.filter(function (p) { return p.id !== ed.preguntaId; });
      D.guardarCurso(curso);
      toast('Pregunta borrada');
      limpiarFormulario();
    });

    $('#fqAddOpt').addEventListener('click', function () {
      if (ed.opciones.length >= 6) { toast('Máximo 6 opciones', 'ko'); return; }
      ed.opciones.push(''); pintarOpciones();
    });
    $('#fqDelOpt').addEventListener('click', function () {
      if (ed.opciones.length <= 2) { toast('Mínimo 2 opciones', 'ko'); return; }
      ed.opciones.pop();
      if (ed.correcta >= ed.opciones.length) ed.correcta = 0;
      pintarOpciones();
    });
  }

  /* ========================================================== HISTORIAL */
  function renderHistorial() {
    var h = D.historial();
    var res = D.resumenHistorial();
    $('#hPartidas').textContent = res.partidas;
    $('#hMedia').textContent = res.media + '%';
    $('#hMejor').textContent = res.mejor + '%';
    $('#hTotal').textContent = res.total;

    var cont = $('#hTabla');
    if (!h.length) {
      cont.innerHTML = '<div class="empty"><div class="big">📉</div>Todavía no has jugado ninguna partida.</div>';
      $('#hBars').innerHTML = '';
      return;
    }

    var filas = h.slice(0, 25).map(function (r) {
      var f = new Date(r.fecha);
      var fecha = f.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' ' +
                  f.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      var modo = { practica: '📖 Práctica', juego: '🎮 Juego', examen: '📝 Examen' }[r.modo] || r.modo;
      var nombre = (r.nombreCursos || []).join(', ') || '—';
      if (nombre.length > 46) nombre = nombre.slice(0, 44) + '…';
      return '<tr><td class="muted">' + fecha + '</td><td>' + esc(nombre) + '</td><td>' + modo + '</td>' +
        '<td><b>' + r.aciertos + '/' + r.total + '</b></td>' +
        '<td><span class="badge ' + (r.pct >= 60 ? 'ok' : 'ko') + '">' + r.pct + '%</span></td></tr>';
    }).join('');

    cont.innerHTML = '<div style="overflow-x:auto"><table class="table"><thead><tr>' +
      '<th>Fecha</th><th>Curso</th><th>Modo</th><th>Aciertos</th><th>%</th>' +
      '</tr></thead><tbody>' + filas + '</tbody></table></div>';

    // Dominio acumulado por categoría
    var acc = {};
    h.forEach(function (r) {
      var pc = r.porCategoria || {};
      Object.keys(pc).forEach(function (k) {
        if (!acc[k]) acc[k] = { ok: 0, total: 0 };
        acc[k].ok += pc[k].ok; acc[k].total += pc[k].total;
      });
    });

    var bars = $('#hBars'); bars.innerHTML = '';
    var claves = Object.keys(acc).sort(function (a, b) {
      return (acc[a].ok / acc[a].total) - (acc[b].ok / acc[b].total);
    });
    if (!claves.length) { bars.innerHTML = '<p class="muted mb-0">Sin datos por categoría todavía.</p>'; return; }
    claves.forEach(function (k) {
      var c = acc[k], p = Math.round(c.ok / c.total * 100);
      var row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = '<div class="bl"><span>' + esc(k) + '</span><b>' + c.ok + '/' + c.total + ' · ' + p + '%</b></div>' +
        '<div class="bar-track"><i class="' + (p < 50 ? 'low' : p < 75 ? 'mid' : '') + '" style="width:' + p + '%"></i></div>';
      bars.appendChild(row);
    });
  }

  /* =============================================================== INIT */
  function init() {
    initAudioUI();
    initSetupUI();
    initEditorUI();

    $$('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () { A.sfx('click'); ir(this.getAttribute('data-go')); });
    });

    $('#btnJugar').addEventListener('click', function () { A.sfx('select'); abrirSetup(null); });
    $('#btnTodos').addEventListener('click', function () { A.sfx('select'); abrirSetup(null); });

    $('#btnNext').addEventListener('click', function () { A.sfx('click'); siguiente(); });
    $('#btnAbandonar').addEventListener('click', function () {
      if (game && game.i < game.preguntas.length - 1 && !confirm('¿Salir de la partida? Se perderá el progreso.')) return;
      ir('home');
    });

    $('#btnRepetir').addEventListener('click', function () { A.sfx('select'); empezarPartida(); });
    $('#btnFallos').addEventListener('click', function () {
      var fallos = game.respuestas.filter(function (r) { return !r.acierto; }).map(function (r) { return r.ref; });
      if (!fallos.length) { toast('No has fallado ninguna 🎉', 'ok'); return; }
      A.sfx('select');
      empezarPartida(D.shuffle(fallos.slice()));
    });
    $('#btnToggleRev').addEventListener('click', function () {
      mostrandoSoloFallos = !mostrandoSoloFallos; pintarRepaso();
    });

    $('#hBorrar').addEventListener('click', function () {
      if (!confirm('¿Borrar todo el historial de partidas?')) return;
      D.borrarHistorial(); renderHistorial(); toast('Historial borrado');
    });

    // Atajos de teclado
    document.addEventListener('keydown', function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
      if (pantallaActual !== 'play') return;
      if (e.key >= '1' && e.key <= '6') {
        var i = +e.key - 1;
        var botones = $$('.ans');
        if (botones[i] && !game.bloqueado) botones[i].click();
      }
      if ((e.key === 'Enter' || e.key === ' ') && game && game.bloqueado && game.modo !== 'examen') {
        e.preventDefault(); siguiente();
      }
    });

    renderHome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
