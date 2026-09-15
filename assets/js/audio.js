/* ==========================================================================
   TechQuiz — Motor de audio
   Música y efectos sintetizados en tiempo real con la Web Audio API.
   No se descarga ningún fichero: todo se genera en el navegador.
   ========================================================================== */
(function (global) {
  'use strict';

  var NOTE = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };

  // --- Progresiones (grados MIDI de la fundamental) y escalas por tema ------
  // La menor natural: A C D E F G
  var SCALE_MIN = [0, 2, 3, 5, 7, 8, 10];

  var THEMES = {
    menu: {
      bpm: 86,
      chords: [45, 41, 48, 40],            // Am  F  C  G(bajo)
      pad: true, padGain: 0.16,
      arp: [0, 4, 7, 11, 7, 4],            // acorde extendido, suave
      arpEvery: 4, arpGain: 0.075, arpWave: 'triangle',
      bassEvery: 8, bassGain: 0.13,
      kick: [], snare: [], hat: [],
      lead: null
    },
    game: {
      bpm: 126,
      chords: [45, 41, 48, 43],
      pad: true, padGain: 0.085,
      arp: [0, 7, 12, 7, 15, 12, 19, 12],
      arpEvery: 2, arpGain: 0.06, arpWave: 'square',
      bassEvery: 2, bassGain: 0.17,
      kick: [0, 4, 8, 12],
      snare: [4, 12],
      hat: [2, 6, 10, 14],
      lead: [0, 3, 7, 10]
    },
    exam: {
      bpm: 68,
      chords: [45, 45, 43, 43],
      pad: true, padGain: 0.13,
      arp: [0, 7],
      arpEvery: 8, arpGain: 0.04, arpWave: 'sine',
      bassEvery: 16, bassGain: 0.1,
      kick: [], snare: [], hat: [],
      lead: null
    },
    results: {
      bpm: 100,
      chords: [48, 45, 41, 43],
      pad: true, padGain: 0.14,
      arp: [0, 4, 7, 12, 7, 4],
      arpEvery: 4, arpGain: 0.07, arpWave: 'triangle',
      bassEvery: 8, bassGain: 0.12,
      kick: [0, 8], snare: [], hat: [4, 12],
      lead: null
    }
  };

  var Audio = {
    ctx: null,
    master: null, musicBus: null, sfxBus: null,
    noiseBuf: null,
    theme: null, themeName: null,
    step: 0, nextTime: 0, timer: null,
    started: false,
    prefs: { music: true, sfx: true, musicVol: 0.55, sfxVol: 0.7 },

    /* ----------------------------------------------------------- arranque */
    load: function () {
      try {
        var raw = localStorage.getItem('tq.audio');
        if (raw) { var p = JSON.parse(raw); for (var k in p) if (k in this.prefs) this.prefs[k] = p[k]; }
      } catch (e) { /* almacenamiento no disponible */ }
      return this.prefs;
    },
    save: function () {
      try { localStorage.setItem('tq.audio', JSON.stringify(this.prefs)); } catch (e) {}
    },

    init: function () {
      if (this.ctx) return true;
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();

      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);

      // Compresor suave para que nada sature
      var comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 24; comp.ratio.value = 3;
      comp.attack.value = 0.004; comp.release.value = 0.25;
      comp.connect(this.master);

      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.prefs.music ? this.prefs.musicVol : 0;
      this.musicBus.connect(comp);

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = this.prefs.sfx ? this.prefs.sfxVol : 0;
      this.sfxBus.connect(comp);

      // Buffer de ruido reutilizable (percusión)
      var len = this.ctx.sampleRate * 1.2;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      var d = this.noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return true;
    },

    /** Debe llamarse dentro de un gesto del usuario (política de autoplay). */
    unlock: function () {
      if (!this.init()) return false;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.started = true;
      return true;
    },

    /* --------------------------------------------------------- volúmenes */
    setMusicVol: function (v) {
      this.prefs.musicVol = v; this.save();
      if (this.musicBus) this.ramp(this.musicBus.gain, this.prefs.music ? v : 0, 0.12);
    },
    setSfxVol: function (v) {
      this.prefs.sfxVol = v; this.save();
      if (this.sfxBus) this.ramp(this.sfxBus.gain, this.prefs.sfx ? v : 0, 0.12);
    },
    toggleMusic: function (on) {
      this.prefs.music = (on === undefined) ? !this.prefs.music : !!on; this.save();
      if (this.musicBus) this.ramp(this.musicBus.gain, this.prefs.music ? this.prefs.musicVol : 0, 0.3);
      return this.prefs.music;
    },
    toggleSfx: function (on) {
      this.prefs.sfx = (on === undefined) ? !this.prefs.sfx : !!on; this.save();
      if (this.sfxBus) this.ramp(this.sfxBus.gain, this.prefs.sfx ? this.prefs.sfxVol : 0, 0.15);
      return this.prefs.sfx;
    },
    ramp: function (param, to, t) {
      var now = this.ctx.currentTime;
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.linearRampToValueAtTime(to, now + (t || 0.1));
    },

    /* ------------------------------------------------------------ voces */
    pluck: function (freq, t, dur, gain, wave, bus) {
      var c = this.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = wave || 'triangle'; o.frequency.value = freq;
      f.type = 'lowpass'; f.frequency.setValueAtTime(Math.min(freq * 7, 9000), t);
      f.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.6, 220), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(bus || this.musicBus);
      o.start(t); o.stop(t + dur + 0.05);
    },

    bassNote: function (freq, t, dur, gain) {
      var c = this.ctx, o = c.createOscillator(), o2 = c.createOscillator(),
          g = c.createGain(), f = c.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = freq;
      o2.type = 'sine'; o2.frequency.value = freq / 2;
      f.type = 'lowpass'; f.frequency.setValueAtTime(freq * 4.5, t);
      f.frequency.exponentialRampToValueAtTime(freq * 1.8, t + dur);
      f.Q.value = 6;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); o2.connect(f); f.connect(g); g.connect(this.musicBus);
      o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    },

    padChord: function (root, t, dur, gain) {
      var notes = [root + 12, root + 12 + 3, root + 12 + 7, root + 24 + 3];
      var c = this.ctx, f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'lowpass'; f.frequency.value = 1700; f.Q.value = 0.8;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(gain, t + dur * 0.35);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      f.connect(g); g.connect(this.musicBus);
      for (var i = 0; i < notes.length; i++) {
        var o = c.createOscillator();
        o.type = i % 2 ? 'sawtooth' : 'triangle';
        o.frequency.value = NOTE(notes[i]);
        o.detune.value = (i - 1.5) * 7;
        o.connect(f); o.start(t); o.stop(t + dur + 0.1);
      }
    },

    noiseHit: function (t, dur, gain, type, freq, bus) {
      var c = this.ctx, s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
      s.buffer = this.noiseBuf;
      f.type = type || 'highpass'; f.frequency.value = freq || 7000;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(bus || this.musicBus);
      s.start(t); s.stop(t + dur + 0.02);
    },

    kickHit: function (t, gain) {
      var c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(44, t + 0.12);
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      o.connect(g); g.connect(this.musicBus);
      o.start(t); o.stop(t + 0.3);
    },

    /* -------------------------------------------------------- secuenciador */
    playMusic: function (name) {
      if (!this.ctx) { if (!this.init()) return; }
      if (this.themeName === name && this.timer) return;
      this.stopMusic();
      this.theme = THEMES[name] || THEMES.menu;
      this.themeName = name;
      this.step = 0;
      this.nextTime = this.ctx.currentTime + 0.08;
      var self = this;
      this.timer = setInterval(function () { self.schedule(); }, 25);
    },

    stopMusic: function () {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
      this.themeName = null;
    },

    schedule: function () {
      if (!this.ctx || this.ctx.state !== 'running') return;
      var th = this.theme, spb = 60 / th.bpm, s16 = spb / 4;
      while (this.nextTime < this.ctx.currentTime + 0.12) {
        this.tick(this.step, this.nextTime, th, s16);
        this.step = (this.step + 1) % 64;          // 4 compases de 16 semicorcheas
        this.nextTime += s16;
      }
    },

    tick: function (step, t, th, s16) {
      var bar = Math.floor(step / 16), inBar = step % 16;
      var root = th.chords[bar % th.chords.length];

      if (inBar === 0 && th.pad) this.padChord(root, t, s16 * 16 * 0.98, th.padGain);

      if (th.bassEvery && step % th.bassEvery === 0) {
        var bn = (inBar === 0 || inBar === 8) ? root : root + (inBar % 3 === 0 ? 7 : 0);
        this.bassNote(NOTE(bn - 12), t, s16 * th.bassEvery * 0.9, th.bassGain);
      }

      if (th.arp && th.arpEvery && step % th.arpEvery === 0) {
        var idx = Math.floor(step / th.arpEvery) % th.arp.length;
        this.pluck(NOTE(root + 12 + th.arp[idx]), t, s16 * th.arpEvery * 1.6, th.arpGain, th.arpWave);
      }

      if (th.kick && th.kick.indexOf(inBar) > -1) this.kickHit(t, 0.32);
      if (th.snare && th.snare.indexOf(inBar) > -1) this.noiseHit(t, 0.14, 0.13, 'bandpass', 1900);
      if (th.hat && th.hat.indexOf(inBar) > -1) this.noiseHit(t, 0.045, 0.055, 'highpass', 8200);

      // Adorno melódico ocasional en el tema de juego
      if (th.lead && inBar === 14 && bar % 2 === 1) {
        var ln = root + 24 + th.lead[Math.floor(Math.random() * th.lead.length)];
        this.pluck(NOTE(ln), t, s16 * 3, 0.05, 'triangle');
      }
    },

    /* ---------------------------------------------------------- efectos */
    sfx: function (name) {
      if (!this.ctx || !this.prefs.sfx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      var t = this.ctx.currentTime, b = this.sfxBus, self = this;
      var seq = function (notes, dur, gap, gain, wave) {
        notes.forEach(function (n, i) {
          self.pluck(NOTE(n), t + i * gap, dur, gain, wave || 'triangle', b);
        });
      };

      switch (name) {
        case 'correct':  seq([72, 76, 79, 84], 0.26, 0.065, 0.24); break;
        case 'wrong':    seq([60, 57, 52], 0.3, 0.1, 0.2, 'sawtooth'); break;
        case 'click':    this.pluck(NOTE(84), t, 0.07, 0.1, 'triangle', b); break;
        case 'hover':    this.pluck(NOTE(79), t, 0.05, 0.05, 'sine', b); break;
        case 'select':   seq([67, 74], 0.14, 0.05, 0.14); break;
        case 'start':    seq([60, 64, 67, 72, 76], 0.3, 0.09, 0.2); break;
        case 'tick':     this.pluck(NOTE(88), t, 0.05, 0.12, 'square', b); break;
        case 'tickLast': this.pluck(NOTE(93), t, 0.07, 0.17, 'square', b); break;
        case 'timeout':  seq([64, 60, 55, 48], 0.36, 0.11, 0.2, 'sawtooth'); break;
        case 'win':      seq([72, 76, 79, 84, 88, 91], 0.4, 0.1, 0.22); break;
        case 'lose':     seq([65, 62, 58, 53], 0.45, 0.16, 0.19, 'sawtooth'); break;
        case 'streak':   seq([79, 83, 86, 91], 0.2, 0.05, 0.16, 'square'); break;
        case 'whoosh':   this.noiseHit(t, 0.32, 0.1, 'bandpass', 1100, b); break;
      }
    },

    /** Silencia/reanuda la música cuando la pestaña pierde el foco. */
    bindVisibility: function () {
      var self = this;
      document.addEventListener('visibilitychange', function () {
        if (!self.ctx) return;
        if (document.hidden) { if (self.ctx.state === 'running') self.ctx.suspend(); }
        else if (self.started && self.ctx.state === 'suspended') { self.ctx.resume(); }
      });
    }
  };

  Audio.load();
  global.TQAudio = Audio;
})(window);
