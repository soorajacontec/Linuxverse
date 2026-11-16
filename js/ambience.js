/* Linuxverse ambience: ten generative soundscapes made live with the Web Audio API (no audio files) */
(function () {
  'use strict';
  var ctx = null, master = null, analyser = null, cur = null, idx = LV.store.get('track', 0), vol = LV.store.get('vol', 0.6), playing = false;

  function noiseBuffer(type) {
    var len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0), last = 0;
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else if (type === 'pink') {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      } else d[i] = w;
    }
    return buf;
  }
  var NB = {};
  function noise(type) { if (!NB[type]) NB[type] = noiseBuffer(type); var s = ctx.createBufferSource(); s.buffer = NB[type]; s.loop = true; return s; }
  function gain(v, to) { var g = ctx.createGain(); g.gain.value = v; if (to) g.connect(to); return g; }
  function filt(type, f, q, to) { var x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; if (q) x.Q.value = q; if (to) x.connect(to); return x; }
  function osc(type, f, to) { var o = ctx.createOscillator(); o.type = type; o.frequency.value = f; if (to) o.connect(to); return o; }
  function lfo(rate, depth, param) { var o = osc('sine', rate), g = gain(depth); o.connect(g); g.connect(param); o.start(); return o; }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function echo(to, time, fb, mix) {
    var inp = gain(1), dl = ctx.createDelay(2), f = gain(fb), w = gain(mix), lp = filt('lowpass', 3200);
    dl.delayTime.value = time; inp.connect(to); inp.connect(dl); dl.connect(lp); lp.connect(f); f.connect(dl); lp.connect(w); w.connect(to);
    return inp;
  }
  /* Run fn(time) on a beat grid with a lookahead scheduler */
  function sequencer(step, fn) {
    var next = ctx.currentTime + 0.1, n = 0;
    var id = setInterval(function () { while (next < ctx.currentTime + 0.35) { fn(next, n++); next += typeof step === 'function' ? step() : step; } }, 90);
    return function () { clearInterval(id); };
  }
  function ping(t, f, dur, peak, to, type) {
    var o = osc(type || 'sine', f), g = gain(0, to);
    o.connect(g);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  }

  var TRACKS = [
    { name: 'Kernel Hum', mood: 'Server room · steady and warm', hue: 32, build: function (out) {
      var stops = [], srcs = [];
      var b = noise('brown'), lp = filt('lowpass', 380, 0.7, gain(0.55, out)); b.connect(lp); b.start(); srcs.push(b);
      var fan = noise('pink'), bp = filt('bandpass', 950, 0.8), fg = gain(0.12, out); fan.connect(bp); bp.connect(fg); fan.start(); srcs.push(fan);
      srcs.push(lfo(0.07, 0.05, fg.gain));
      var hum = gain(0.035, out); [55, 110, 165].forEach(function (f, i) { var o = osc('sine', f + i * 0.13, hum); o.start(); srcs.push(o); });
      var tick = gain(0.25, out), hp = filt('highpass', 2500, 0, tick);
      stops.push(sequencer(function () { return 0.25 + Math.random() * 1.6; }, function (t) {
        var s = noise('white'), g = gain(0, hp); s.connect(g);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.2 * Math.random() + 0.05, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
        s.start(t, Math.random() * 3); s.stop(t + 0.05);
      }));
      return function () { stops.forEach(function (s) { s(); }); srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); };
    } },
    { name: 'Midnight Rain', mood: 'Rain on the window, far thunder', hue: 210, build: function (out) {
      var stops = [], srcs = [];
      var r = noise('pink'), hp = filt('highpass', 400), lp = filt('lowpass', 5200), rg = gain(0.5, out); r.connect(hp); hp.connect(lp); lp.connect(rg); r.start(); srcs.push(r);
      srcs.push(lfo(0.05, 0.12, rg.gain));
      var drops = echo(out, 0.21, 0.25, 0.25);
      stops.push(sequencer(function () { return 0.04 + Math.random() * 0.22; }, function (t) { ping(t, 1800 + Math.random() * 2600, 0.06 + Math.random() * 0.06, 0.03 + Math.random() * 0.04, drops); }));
      var thunder = gain(0, out), tl = filt('lowpass', 110, 0.5, thunder), tb = noise('brown'); tb.connect(tl); tb.start(); srcs.push(tb);
      stops.push(sequencer(function () { return 14 + Math.random() * 16; }, function (t, n) {
        if (!n) return;
        thunder.gain.cancelScheduledValues(t); thunder.gain.setValueAtTime(0, t); thunder.gain.linearRampToValueAtTime(0.9, t + 1.2); thunder.gain.exponentialRampToValueAtTime(0.001, t + 6);
      }));
      return function () { stops.forEach(function (s) { s(); }); srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); };
    } },
    { name: 'Deep Focus', mood: 'Slow evolving pads', hue: 265, build: function (out) {
      var srcs = [], lp = filt('lowpass', 900, 0.6), bus = gain(0.22); bus.connect(lp); lp.connect(echo(out, 0.6, 0.35, 0.3));
      srcs.push(lfo(0.04, 450, lp.frequency));
      var chords = [[57, 60, 64, 71], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 69]];
      var stop = sequencer(8, function (t, n) {
        var ch = chords[n % chords.length];
        ch.forEach(function (m, i) {
          [-6, 6].forEach(function (cents) {
            var o = osc(i === 0 ? 'triangle' : 'sawtooth', mtof(m - (i === 0 ? 12 : 0))); o.detune.value = cents;
            var g = gain(0, bus); o.connect(g);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 2.5); g.gain.setValueAtTime(0.09, t + 7); g.gain.linearRampToValueAtTime(0, t + 10.5);
            o.start(t); o.stop(t + 11);
          });
        });
      });
      return function () { stop(); srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); };
    } },
    { name: 'Night Compile', mood: 'Soft arpeggios, late-night coding', hue: 160, build: function (out) {
      var srcs = [], dl = echo(out, 0.375, 0.38, 0.35), arpBus = gain(0.5, dl), bass = gain(0.18, out);
      var scale = [57, 60, 62, 64, 67, 69, 72, 74, 76];
      var prog = [0, 0, 5, 3];
      var stop = sequencer(0.1875, function (t, n) {
        var bar = Math.floor(n / 16) % prog.length, root = prog[bar];
        var pat = [0, 2, 4, 6, 4, 2, 3, 5];
        var note = scale[(pat[n % 8] + root) % scale.length] + (n % 32 > 15 ? 12 : 0);
        ping(t, mtof(note), 0.35, n % 4 === 0 ? 0.11 : 0.07, arpBus, 'triangle');
        if (n % 16 === 0) { var o = osc('sine', mtof(scale[root % scale.length] - 24)), g = gain(0, bass); o.connect(g); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.08); g.gain.exponentialRampToValueAtTime(0.001, t + 2.9); o.start(t); o.stop(t + 3); }
      });
      var air = noise('pink'), af = filt('highpass', 6000), ag = gain(0.025, out); air.connect(af); af.connect(ag); air.start(); srcs.push(air);
      return function () { stop(); srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); };
    } },
    { name: 'Orbit Drift', mood: 'Deep space drones and bells', hue: 190, build: function (out) {
      var srcs = [], dr = gain(0.09, out), dlp = filt('lowpass', 600, 0.5, dr);
      [[55, 0], [55.4, 0], [82.4, 0], [110, 0.2], [164.8, 0.4]].forEach(function (p) { var o = osc('sine', p[0], dlp); o.start(); srcs.push(o); });
      srcs.push(lfo(0.03, 0.04, dr.gain));
      var bells = echo(out, 0.9, 0.5, 0.45);
      var notes = [69, 72, 76, 79, 81, 84, 88];
      var stop = sequencer(function () { return 2.5 + Math.random() * 4; }, function (t) {
        var f = mtof(notes[Math.floor(Math.random() * notes.length)]);
        [[1, 0.06, 4], [2.76, 0.02, 2.5], [5.4, 0.01, 1.4]].forEach(function (p) { ping(t, f * p[0], p[2], p[1], bells); });
      });
      return function () { stop(); srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); };
    } },
    { name: 'Ocean Tide', mood: 'Slow waves on a quiet shore', hue: 200, build: function (out) {
      var srcs = [], stops = [];
      var w = noise('pink'), lp = filt('lowpass', 900, 0.6), wg = gain(0.1, out); w.connect(lp); lp.connect(wg); w.start(); srcs.push(w);
      srcs.push(lfo(0.09, 0.09, wg.gain)); srcs.push(lfo(0.09, 500, lp.frequency));
      var w2 = noise('pink'), hp = filt('highpass', 1800), fg = gain(0.05, out); w2.connect(hp); hp.connect(fg); w2.start(); srcs.push(w2);
      srcs.push(lfo(0.09, 0.04, fg.gain));
      var sw = gain(0.05, out); [49, 73.4].forEach(function (f) { var o = osc('sine', f, sw); o.start(); srcs.push(o); });
      srcs.push(lfo(0.045, 0.03, sw.gain));
      return function () { stops.forEach(function (s) { s(); }); srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); };
    } },
    { name: 'Forest Night', mood: 'Crickets, breeze and a distant owl', hue: 130, build: function (out) {
      var srcs = [], stops = [];
      var wind = noise('pink'), bp = filt('bandpass', 420, 0.6), wg = gain(0.16, out); wind.connect(bp); bp.connect(wg); wind.start(); srcs.push(wind);
      srcs.push(lfo(0.06, 0.08, wg.gain)); srcs.push(lfo(0.05, 200, bp.frequency));
      var cr = gain(1, out);
      stops.push(sequencer(function () { return 1.2 + Math.random() * 2.5; }, function (t) {
        var f = 4200 + Math.random() * 600, k = 3 + Math.floor(Math.random() * 3);
        for (var i = 0; i < k; i++) ping(t + i * 0.09, f, 0.05, 0.012, cr);
      }));
      var owl = echo(out, 0.5, 0.35, 0.4);
      stops.push(sequencer(function () { return 12 + Math.random() * 14; }, function (t, n) {
        if (!n) return;
        [0, 0.6].forEach(function (d, i) { ping(t + d + i * 0.15, i ? 330 : 392, 0.5, 0.08, owl); });
      }));
      return function () { stops.forEach(function (s) { s(); }); srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); };
    } },
    { name: 'Lo-fi Terminal', mood: 'Dusty beat, mellow chords', hue: 20, build: function (out) {
      var srcs = [], bus = gain(0.8), lp = filt('lowpass', 1400, 0.5); bus.connect(lp); lp.connect(out);
      var chords = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 64]];
      var vin = noise('white'), vf = filt('highpass', 5000), vg = gain(0.012, out); vin.connect(vf); vf.connect(vg); vin.start(); srcs.push(vin);
      var stop = sequencer(0.3158, function (t, n) {
        var s = n % 32;
        if (s % 16 === 0) {
          chords[Math.floor(n / 16) % 4].forEach(function (m) { ping(t + Math.random() * 0.02, mtof(m), 1.8, 0.06, bus, 'triangle'); });
        }
        if (s % 8 === 0 || s % 8 === 5) { var k = osc('sine', 120), g = gain(0, lp); k.connect(g); k.frequency.setValueAtTime(120, t); k.frequency.exponentialRampToValueAtTime(42, t + 0.15); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25); k.start(t); k.stop(t + 0.3); }
        if (s % 4 === 2) { var h = noise('white'), hf = filt('highpass', 7000), hg = gain(0, out); h.connect(hf); hf.connect(hg); hg.gain.setValueAtTime(0.06, t); hg.gain.exponentialRampToValueAtTime(0.001, t + 0.05); h.start(t, Math.random() * 3); h.stop(t + 0.08); }
        if (s % 16 === 8) { var sn = noise('white'), sf = filt('bandpass', 1800, 0.8), sg = gain(0, lp); sn.connect(sf); sf.connect(sg); sg.gain.setValueAtTime(0.12, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 0.14); sn.start(t, Math.random() * 3); sn.stop(t + 0.2); }
        if (Math.random() < 0.3) ping(t, mtof(chords[Math.floor(n / 16) % 4][Math.floor(Math.random() * 4)] + 12), 0.5, 0.04, bus, 'sine');
      });
      return function () { stop(); srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); };
    } },
    { name: 'Coffee Shop', mood: 'Murmur, clinks and soft piano', hue: 38, build: function (out) {
      var srcs = [], stops = [];
      var m = noise('brown'), bp = filt('bandpass', 700, 0.5), mg = gain(0.3, out); m.connect(bp); bp.connect(mg); m.start(); srcs.push(m);
      srcs.push(lfo(0.13, 0.08, mg.gain));
      var cl = echo(out, 0.12, 0.2, 0.2);
      stops.push(sequencer(function () { return 2 + Math.random() * 5; }, function (t) {
        var f = 2400 + Math.random() * 1800; ping(t, f, 0.18, 0.03, cl); ping(t + 0.03, f * 1.5, 0.12, 0.02, cl);
      }));
      var pno = echo(out, 0.45, 0.3, 0.3), sc = [60, 62, 64, 67, 69, 72];
      stops.push(sequencer(function () { return 1.4 + Math.random() * 2.2; }, function (t) {
        var f = mtof(sc[Math.floor(Math.random() * sc.length)]);
        ping(t, f, 2.2, 0.07, pno, 'triangle'); ping(t, f * 2, 1.2, 0.015, pno);
      }));
      return function () { stops.forEach(function (s) { s(); }); srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); };
    } },
    { name: 'Aurora Pads', mood: 'Bright shimmering glow', hue: 300, build: function (out) {
      var srcs = [], bus = gain(0.2), lp = filt('lowpass', 2200, 0.5); bus.connect(lp); lp.connect(echo(out, 0.7, 0.4, 0.4));
      srcs.push(lfo(0.05, 900, lp.frequency));
      var chords = [[62, 66, 69, 73], [59, 62, 66, 71], [55, 59, 62, 69], [57, 61, 64, 69]];
      var sh = echo(out, 0.33, 0.45, 0.45), shb = gain(0.5, sh);
      var stop = sequencer(8, function (t, n) {
        var ch = chords[n % 4];
        ch.forEach(function (m) {
          [-8, 8].forEach(function (c) {
            var o = osc('sawtooth', mtof(m)); o.detune.value = c; var g = gain(0, bus); o.connect(g);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 3); g.gain.setValueAtTime(0.07, t + 6.5); g.gain.linearRampToValueAtTime(0, t + 10.5);
            o.start(t); o.stop(t + 11);
          });
        });
        for (var i = 0; i < 12; i++) ping(t + i * 0.66 + Math.random() * 0.1, mtof(ch[i % 4] + 24), 1.4, 0.035, shb);
      });
      return function () { stop(); srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); };
    } }
  ];

  function init() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { LV.toast('Audio is not supported in this browser.'); return false; }
    ctx = new AC();
    master = gain(vol); analyser = ctx.createAnalyser(); analyser.fftSize = 64;
    master.connect(analyser); analyser.connect(ctx.destination);
    return true;
  }
  function start(i) {
    if (!init()) return;
    if (ctx.state === 'suspended') ctx.resume();
    idx = (i + TRACKS.length) % TRACKS.length; LV.store.set('track', idx);
    var t = ctx.currentTime;
    if (cur) {
      var old = cur; old.g.gain.cancelScheduledValues(t); old.g.gain.setValueAtTime(old.g.gain.value, t); old.g.gain.linearRampToValueAtTime(0, t + 1.6);
      setTimeout(function () { old.stop(); try { old.g.disconnect(); } catch (e) {} }, 1800);
    }
    var g = gain(0, master); g.gain.linearRampToValueAtTime(1, t + 1.8);
    cur = { g: g, stop: TRACKS[idx].build(g) };
    playing = true; paint();
  }
  function pause() {
    if (!cur) return;
    var old = cur, t = ctx.currentTime; cur = null; playing = false;
    old.g.gain.cancelScheduledValues(t); old.g.gain.setValueAtTime(old.g.gain.value, t); old.g.gain.linearRampToValueAtTime(0, t + 0.6);
    setTimeout(function () { old.stop(); }, 700);
    paint();
  }

  /* ---------- Player UI ---------- */
  var P;
  function paint() {
    if (!P) return;
    var tr = TRACKS[idx];
    LV.$('#pl-name').textContent = tr.name;
    LV.$('#pl-mood').textContent = tr.mood;
    LV.$('#pl-play').innerHTML = LV.icon(playing ? 'pause' : 'play');
    LV.$('#pl-play').setAttribute('aria-label', playing ? 'Pause' : 'Play');
    LV.$('#pl-num').textContent = (idx + 1) + '/' + TRACKS.length;
    P.style.setProperty('--trk', tr.hue);
    P.classList.toggle('playing', playing);
    var btn = LV.$('#btn-music'); if (btn) { btn.classList.toggle('on', playing); btn.setAttribute('aria-pressed', playing ? 'true' : 'false'); }
    LV.$$('#pl-list li').forEach(function (li, i) { li.classList.toggle('on', i === idx); });
  }
  var raf;
  function viz() {
    cancelAnimationFrame(raf);
    var cv = LV.$('#pl-viz'); if (!cv) return;
    var c2 = cv.getContext('2d'), data = new Uint8Array(32);
    function frame() {
      var w = cv.width = cv.clientWidth * 2, h = cv.height = cv.clientHeight * 2;
      c2.clearRect(0, 0, w, h);
      var col = getComputedStyle(P).getPropertyValue('--viz').trim() || '#ffb347';
      if (analyser && playing) analyser.getByteFrequencyData(data); else for (var i = 0; i < 32; i++) data[i] = Math.max(0, data[i] - 6);
      var n = 24, bw = w / n;
      c2.fillStyle = col;
      for (var j = 0; j < n; j++) { var v = data[j + 1] / 255, bh = Math.max(2, v * h); c2.globalAlpha = 0.35 + v * 0.65; c2.fillRect(j * bw + 1, h - bh, bw - 3, bh); }
      if (!P.hidden && !P.classList.contains('mini')) raf = requestAnimationFrame(frame);
    }
    frame();
  }

  LV.amb = {
    tracks: TRACKS,
    init: function () {
      P = LV.$('#player');
      P.innerHTML =
        '<div class="pl-bubble" role="button" tabindex="0" aria-label="Expand music player"><span class="eq"><i></i><i></i><i></i></span></div>' +
        '<div class="pl-body">' +
        '<div class="pl-top"><canvas id="pl-viz" aria-hidden="true"></canvas><div class="pl-meta"><b id="pl-name"></b><small id="pl-mood"></small></div><span class="pl-num mono" id="pl-num"></span></div>' +
        '<div class="pl-ctrls" id="pl-ctrls">' +
        '<button class="ibtn" id="pl-prev" aria-label="Previous track">' + LV.icon('prev') + '</button>' +
        '<button class="ibtn primary" id="pl-play" aria-label="Play">' + LV.icon('play') + '</button>' +
        '<button class="ibtn" id="pl-next" aria-label="Next track">' + LV.icon('next') + '</button>' +
        '<label class="pl-vol" id="pl-vol">' + LV.icon('vol') + '<input type="range" id="pl-vol-in" min="0" max="1" step="0.01" aria-label="Volume"></label>' +
        '<button class="ibtn" id="pl-list-btn" aria-label="Track list" aria-expanded="false">' + LV.icon('list') + '</button>' +
        '<button class="ibtn" id="pl-min" aria-label="Minimise player">' + LV.icon('min') + '</button>' +
        '<button class="ibtn" id="pl-close" aria-label="Close player">' + LV.icon('close') + '</button>' +
        '</div>' +
        '<ol class="pl-list" id="pl-list" hidden>' + TRACKS.map(function (t, i) { return '<li><button data-t="' + i + '"><span class="mono">' + (i + 1) + '</span><b>' + t.name + '</b><small>' + t.mood + '</small></button></li>'; }).join('') + '</ol>' +
        '</div>';
      LV.$('#pl-vol-in').value = vol;
      LV.$('#pl-play').onclick = function () { playing ? pause() : start(idx); viz(); };
      LV.$('#pl-next').onclick = function () { start(idx + 1); viz(); };
      LV.$('#pl-prev').onclick = function () { start(idx - 1); viz(); };
      LV.$('#pl-vol-in').oninput = function (e) { vol = +e.target.value; LV.store.set('vol', vol); if (master) master.gain.setTargetAtTime(vol, ctx.currentTime, 0.05); };
      LV.$('#pl-list-btn').onclick = function () { var l = LV.$('#pl-list'); l.hidden = !l.hidden; this.setAttribute('aria-expanded', String(!l.hidden)); LV.app && LV.app.measure(); };
      LV.$('#pl-list').onclick = function (e) { var b = e.target.closest('[data-t]'); if (b) { start(+b.dataset.t); viz(); } };
      LV.$('#pl-min').onclick = function () { LV.amb.minimize(true); };
      LV.$('#pl-close').onclick = function () { pause(); LV.amb.hide(); };
      var bub = P.querySelector('.pl-bubble');
      bub.onclick = function () { LV.amb.minimize(false); };
      bub.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); LV.amb.minimize(false); } };
      paint();
    },
    show: function (autoplay) {
      P.hidden = false; P.classList.remove('mini');
      if (autoplay && !playing) start(idx);
      paint(); viz(); LV.app && LV.app.measure();
    },
    hide: function () { P.hidden = true; LV.$('#pl-list').hidden = true; LV.app && LV.app.measure(); },
    minimize: function (m) { P.classList.toggle('mini', m); if (!m) viz(); LV.app && LV.app.measure(); },
    toggle: function () { if (P.hidden) LV.amb.show(true); else if (P.classList.contains('mini')) LV.amb.minimize(false); else if (!playing) { start(idx); viz(); } else LV.amb.hide(); },
    isPlaying: function () { return playing; },
    openList: function () { LV.$('#pl-list').hidden = false; LV.$('#pl-list-btn').setAttribute('aria-expanded', 'true'); }
  };
})();
