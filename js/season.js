/* Linuxverse seasons: a header button (ice crystal) opens a menu of seasonal themes.
   Each season recolours the app softly, lays a gentle falling-particle overlay on top (snow crystals, petals, leaves, rain ...)
   and plays quiet background music made live with the Web Audio API (no audio files), layered over whatever else is playing. */
(function () {
  'use strict';
  var $ = LV.$, esc = LV.esc;

  /* ---------- Season catalogue ---------- */
  // d / l = [accent, accent2, accent-ink] for dark and light mode. bg = soft page glow. fx = particle type. music = track id.
  var SEASONS = [
    { id: 'xmas', n: 'Christmas', e: '🎄', fx: 'crystal', music: 'jingle', d: ['#ff6b6b', '#7fe0b0', '#2a0707'], l: ['#c0262d', '#1c7a45', '#ffffff'], bg: 'radial-gradient(900px 500px at 15% -5%, rgba(255,90,90,.13), transparent 60%), radial-gradient(800px 500px at 100% 0%, rgba(90,200,150,.12), transparent 60%)' },
    { id: 'newyear', n: 'New Year', e: '\uD83E\uDD42', fx: 'confetti', music: 'auld', d: ['#ffd166', '#c792ff', '#2a1d00'], l: ['#9a6a00', '#7a3fd0', '#ffffff'], bg: 'radial-gradient(900px 500px at 80% -5%, rgba(255,210,100,.14), transparent 60%), radial-gradient(700px 500px at 0% 10%, rgba(180,130,255,.12), transparent 60%)' },
    { id: 'winter', n: 'Winter', e: '❄️', fx: 'crystal', music: 'winter', d: ['#8fd3ff', '#cfe9ff', '#04131c'], l: ['#1d6fa8', '#4a6f99', '#ffffff'], bg: 'radial-gradient(900px 600px at 50% -10%, rgba(150,210,255,.16), transparent 62%)' },
    { id: 'spring', n: 'Spring', e: '\uD83C\uDF37', fx: 'petal', music: 'spring', d: ['#ff9ec7', '#9be28a', '#2a0a18'], l: ['#c2336f', '#2f8a3a', '#ffffff'], bg: 'radial-gradient(900px 500px at 10% -5%, rgba(255,170,205,.14), transparent 60%), radial-gradient(800px 500px at 100% 10%, rgba(150,230,140,.10), transparent 60%)' },
    { id: 'summer', n: 'Summer', e: '☀️', fx: 'firefly', music: 'summer', d: ['#ffcf4d', '#4fd6e0', '#2a2000'], l: ['#b87400', '#0b8a99', '#ffffff'], bg: 'radial-gradient(900px 500px at 90% -10%, rgba(255,210,80,.15), transparent 60%), radial-gradient(800px 500px at 0% 0%, rgba(80,220,230,.10), transparent 60%)' },
    { id: 'monsoon', n: 'Monsoon', e: '🌧️', fx: 'rain', music: 'monsoon', d: ['#6fb7ff', '#86e3c8', '#04131c'], l: ['#1a5fa0', '#0b7d6a', '#ffffff'], bg: 'linear-gradient(180deg, rgba(90,130,180,.14), transparent 55%)' },
    { id: 'autumn', n: 'Autumn', e: '🍂', fx: 'leaf', music: 'autumn', d: ['#ff9a4d', '#e6c35c', '#2a1100'], l: ['#b04a00', '#8a6a00', '#ffffff'], bg: 'radial-gradient(900px 500px at 15% -5%, rgba(255,150,70,.14), transparent 60%), radial-gradient(800px 500px at 100% 5%, rgba(230,190,80,.11), transparent 60%)' },
    { id: 'halloween', n: 'Halloween', e: '🎃', fx: 'ember', music: 'spooky', d: ['#ff8c1a', '#b57bff', '#1f0d00'], l: ['#b85a00', '#6a3fb0', '#ffffff'], bg: 'radial-gradient(900px 500px at 50% -10%, rgba(255,130,30,.14), transparent 62%), radial-gradient(700px 400px at 0% 100%, rgba(150,90,230,.10), transparent 60%)' },
    { id: 'diwali', n: 'Diwali', e: '🪔', fx: 'spark', music: 'diwali', d: ['#ffb62e', '#ff6fa8', '#2a1700'], l: ['#b36b00', '#c2285a', '#ffffff'], bg: 'radial-gradient(900px 500px at 50% -10%, rgba(255,180,50,.16), transparent 62%), radial-gradient(700px 400px at 100% 90%, rgba(255,110,170,.10), transparent 60%)' },
    { id: 'valentine', n: 'Valentine', e: '\uD83D\uDC96', fx: 'heart', music: 'valentine', d: ['#ff6b8f', '#ffb3c8', '#2a0714'], l: ['#c2185b', '#8e2a6a', '#ffffff'], bg: 'radial-gradient(900px 500px at 20% -5%, rgba(255,110,150,.16), transparent 60%), radial-gradient(700px 400px at 100% 10%, rgba(255,180,200,.10), transparent 60%)' },
    { id: 'holi', n: 'Holi', e: '\uD83C\uDFA8', fx: 'powder', music: 'holi', d: ['#ff4fa3', '#4fd2ff', '#2a0716'], l: ['#c2185b', '#0b7da8', '#ffffff'], bg: 'radial-gradient(700px 400px at 10% 0%, rgba(255,80,160,.14), transparent 60%), radial-gradient(700px 400px at 90% 5%, rgba(80,210,255,.13), transparent 60%), radial-gradient(600px 400px at 50% 100%, rgba(255,210,60,.10), transparent 60%)' },
    { id: 'eid', n: 'Eid', e: '\uD83C\uDF19', fx: 'star', moon: true, music: 'eid', d: ['#5de0b0', '#ffd36b', '#04201a'], l: ['#0b7a5a', '#9a6a00', '#ffffff'], bg: 'radial-gradient(900px 600px at 80% -10%, rgba(255,215,110,.12), transparent 60%), radial-gradient(900px 500px at 0% 0%, rgba(80,225,175,.12), transparent 60%)' },
    { id: 'lunar', n: 'Lunar New Year', e: '\uD83C\uDFEE', fx: 'lantern', music: 'lunar', d: ['#ff5a4f', '#ffd04d', '#2a0707'], l: ['#c0261f', '#9a6a00', '#ffffff'], bg: 'radial-gradient(900px 500px at 50% -10%, rgba(255,90,80,.15), transparent 62%), radial-gradient(700px 400px at 100% 100%, rgba(255,205,80,.10), transparent 60%)' },
    { id: 'aurora', n: 'Aurora', e: '\uD83C\uDF0C', fx: 'aurora', music: 'aurora', d: ['#5cf2c1', '#8f7bff', '#03201a'], l: ['#0b8a68', '#5a3fd0', '#ffffff'], bg: 'linear-gradient(180deg, rgba(60,230,170,.10), transparent 40%), radial-gradient(800px 500px at 90% 0%, rgba(140,120,255,.12), transparent 60%)' },
    { id: 'sakura', n: 'Sakura', e: '\uD83C\uDF38', fx: 'sakura', music: 'sakura', d: ['#ffa6c9', '#c8e6a0', '#2a0a18'], l: ['#c2336f', '#4a7a2a', '#ffffff'], bg: 'radial-gradient(900px 500px at 50% -10%, rgba(255,170,205,.15), transparent 62%)' },
    { id: 'starry', n: 'Starry Night', e: '\u2B50', fx: 'star', music: 'starry', d: ['#9fb4ff', '#ffe08a', '#0a1030'], l: ['#3a4fb8', '#9a6a00', '#ffffff'], bg: 'linear-gradient(180deg, rgba(60,80,190,.16), transparent 55%)' },
    { id: 'fireworks', n: 'Fireworks', e: '\uD83C\uDF87', fx: 'fireworks', music: 'celebrate', d: ['#ff7a45', '#5cc8ff', '#2a1000'], l: ['#c2410c', '#0a69a8', '#ffffff'], bg: 'radial-gradient(800px 500px at 20% 0%, rgba(255,120,60,.13), transparent 60%), radial-gradient(800px 500px at 85% 0%, rgba(80,200,255,.12), transparent 60%)' }
  ];
  var BY = {}; SEASONS.forEach(function (s) { BY[s.id] = s; });

  /* Today's season for the Auto option */
  function autoId(dt) {
    dt = dt || new Date(); var m = dt.getMonth() + 1, d = dt.getDate();
    if (m === 12 && d <= 26) return 'xmas';
    if ((m === 12 && d >= 27) || (m === 1 && d <= 5)) return 'newyear';
    if (m === 2 && d >= 10 && d <= 14) return 'valentine';
    if (m === 1 || m === 2) return 'winter';
    if (m === 3 || m === 4) return 'spring';
    if (m === 5 || m === 6) return 'summer';
    if (m === 7 || m === 8) return 'monsoon';
    if (m === 10 && d >= 20) return 'halloween';
    return 'autumn';
  }

  /* ---------- Saved state ---------- */
  var state = (function () {
    var s = LV.store.get('season', null);
    if (!s || typeof s !== 'object') s = {};
    return { id: s.id && (s.id === 'auto' || BY[s.id]) ? s.id : 'off', fx: s.fx !== false, music: s.music !== false, vol: typeof s.vol === 'number' ? Math.max(0, Math.min(1, s.vol)) : 0.35 };
  })();
  function save() { LV.store.set('season', state); }
  function eff() { return state.id === 'off' ? null : state.id === 'auto' ? autoId() : state.id; }
  function reducedMotion() { try { return LV.reduced(); } catch (e) { return false; } }
  function isLight() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'light';
    try { return matchMedia('(prefers-color-scheme: light)').matches; } catch (e) { return false; }
  }

  /* ---------- Colours: generated CSS so every season works in dark and light ---------- */
  function injectCss() {
    var st = document.createElement('style'); st.id = 'season-css';
    st.textContent = SEASONS.map(function (s) {
      var dk = ':root[data-season="' + s.id + '"]{--accent:' + s.d[0] + ';--accent2:' + s.d[1] + ';--accent-ink:' + s.d[2] + '}',
        lt = '--accent:' + s.l[0] + ';--accent2:' + s.l[1] + ';--accent-ink:' + s.l[2];
      return dk + '@media (prefers-color-scheme: light){:root:not([data-theme="dark"])[data-season="' + s.id + '"]{' + lt + '}}:root[data-theme="light"][data-season="' + s.id + '"]{' + lt + '}' +
        ':root[data-season="' + s.id + '"] body{background-image:' + s.bg + ';background-attachment:fixed}';
    }).join('');
    document.head.appendChild(st);
  }

  /* ---------- Falling-particle overlay ---------- */
  var cv = null, g = null, W = 0, H = 0, dpr = 1, parts = [], rafOn = false, lastT = 0, fxType = null, burstT = 0, shoot = null, shootT = 0, clock = 0;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function size() {
    if (!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function fall(p, init, o) { p.s = rnd(o.s[0], o.s[1]); p.vy = rnd(o.vy[0], o.vy[1]); p.vx = rnd(o.vx[0], o.vx[1]); p.sw = rnd(o.sw[0], o.sw[1]); p.a = rnd(o.a[0], o.a[1]); p.rot = rnd(0, 6.28); p.vr = rnd(o.vr[0], o.vr[1]); p.ph = rnd(0, 6.28); if (o.c) p.c = o.c[Math.floor(rnd(0, o.c.length))]; p.y = init ? rnd(0, H) : -20; }
  function rise(p, init, o) { fall(p, init, o); p.y = init ? rnd(0, H) : H + 30; }
  var TYPES = {
    crystal: { n: 46, make: function (p, init) { p.s = rnd(5, 14); p.vy = rnd(16, 40); p.vx = rnd(-5, 5); p.sw = rnd(8, 22); p.a = rnd(.35, .8); p.rot = rnd(0, 6.28); p.vr = rnd(-.6, .6); p.dot = Math.random() < .28; if (p.dot) { p.s = rnd(1.2, 3); p.vy = rnd(22, 55); } p.y = init ? rnd(0, H) : -20; } },
    confetti: { n: 40, make: function (p, init) { fall(p, init, { s: [5, 9], vy: [28, 70], vx: [-10, 10], sw: [10, 30], a: [.45, .85], vr: [-3, 3], c: ['#ffd166', '#ff6b9a', '#6fd0ff', '#b48cff', '#7fe0b0'] }); } },
    petal: { n: 30, make: function (p, init) { fall(p, init, { s: [5, 10], vy: [18, 38], vx: [4, 18], sw: [14, 34], a: [.4, .8], vr: [-1.2, 1.2], c: ['#ffb3d1', '#ffb3d1', '#ffffff'] }); } },
    sakura: { n: 38, make: function (p, init) { fall(p, init, { s: [5, 9], vy: [12, 30], vx: [6, 18], sw: [18, 40], a: [.5, .9], vr: [-1.5, 1.5], c: ['#ffc2d9', '#ffd9e6', '#ffffff', '#ffb0cf'] }); } },
    leaf: { n: 26, make: function (p, init) { fall(p, init, { s: [7, 13], vy: [20, 46], vx: [-8, 14], sw: [16, 40], a: [.5, .85], vr: [-1.6, 1.6], c: ['#e8742a', '#d4472a', '#e8b02a', '#b5651d'] }); } },
    rain: { n: 70, make: function (p, init) { p.s = rnd(10, 22); p.vy = rnd(520, 820); p.vx = -90; p.sw = 0; p.a = rnd(.15, .4); p.y = init ? rnd(0, H) : -30; } },
    firefly: { n: 26, make: function (p, init) { rise(p, init, { s: [1.5, 3.4], vy: [-9, -2], vx: [-6, 6], sw: [10, 26], a: [.4, .9], vr: [0, 0] }); } },
    ember: { n: 30, make: function (p, init) { rise(p, init, { s: [1.4, 3.4], vy: [-34, -12], vx: [-8, 8], sw: [8, 22], a: [.4, .9], vr: [0, 0] }); } },
    spark: { n: 36, make: function (p, init) { rise(p, init, { s: [1.4, 3.6], vy: [-40, -14], vx: [-10, 10], sw: [6, 18], a: [.5, 1], vr: [0, 0], c: ['#ffc94d', '#ffc94d', '#ffc94d', '#ff7ab0'] }); } },
    heart: { n: 26, make: function (p, init) { rise(p, init, { s: [7, 15], vy: [-34, -14], vx: [-6, 6], sw: [12, 28], a: [.4, .85], vr: [0, 0], c: ['#ff6b8f', '#ff9eb5', '#ff4d79', '#ffc2d1'] }); p.rot = 0; } },
    lantern: { n: 12, make: function (p, init) { rise(p, init, { s: [11, 21], vy: [-30, -13], vx: [-4, 4], sw: [10, 20], a: [.6, .95], vr: [0, 0] }); p.y = init ? rnd(0, H) : H + 50; } },
    star: { n: 44, make: function (p, init) { p.s = rnd(.6, 1.9); p.vy = 0; p.vx = rnd(-1.5, 1.5); p.sw = 0; p.a = rnd(.4, 1); p.ph = rnd(0, 6.28); p.x = rnd(0, W); p.y = rnd(0, H * .75); } },
    aurora: { n: 26, aurora: true, make: function (p, init) { p.s = rnd(.6, 1.6); p.vy = 0; p.vx = rnd(-1, 1); p.sw = 0; p.a = rnd(.4, 1); p.ph = rnd(0, 6.28); p.x = rnd(0, W); p.y = rnd(0, H * .7); } },
    fireworks: { burst: true, gap: [.7, 1.6] },
    powder: { burst: true, gap: [.9, 1.8] }
  };
  function spawn(init) { var p = { x: rnd(0, W), t: rnd(0, 20) }; TYPES[fxType].make(p, init); return p; }
  function count(type) { var n = TYPES[type].n || 0; return Math.round(n * (W < 600 ? .55 : 1)); }
  function spawnBurst() {
    var cx = rnd(W * .15, W * .85), cy = rnd(H * .12, H * .55), n, i;
    if (fxType === 'fireworks') {
      var hue = Math.floor(rnd(0, 360)); n = W < 600 ? 26 : 38;
      for (i = 0; i < n; i++) { var a = i / n * 6.283 + rnd(-.08, .08), sp = rnd(70, 150); parts.push({ b: 1, x: cx, y: cy, px: cx, py: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 70, drag: .985, life: 0, ttl: rnd(1.1, 1.9), s: rnd(1.4, 2.4), c: 'hsl(' + (hue + rnd(-18, 18)) + ',100%,' + (isLight() ? 48 : 68) + '%)' }); }
    } else {
      var cols = ['#ff3d8f', '#ffd23f', '#3ddcff', '#7bff5e', '#b45cff', '#ff7a2f']; n = W < 600 ? 10 : 16;
      for (i = 0; i < n; i++) { var b = rnd(0, 6.283), sp2 = rnd(40, 120); parts.push({ b: 2, x: cx, y: cy, vx: Math.cos(b) * sp2, vy: Math.sin(b) * sp2, g: 6, drag: .97, life: 0, ttl: rnd(1.6, 2.6), s: rnd(22, 40), c: cols[Math.floor(rnd(0, 6))] }); }
    }
    if (parts.length > 500) parts.splice(0, parts.length - 500);
  }
  function stepBurst(p, dt) {
    p.life += dt; p.px = p.x; p.py = p.y; p.vx *= Math.pow(p.drag, dt * 60); p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
  }
  function drawBurst(p) {
    var k = 1 - p.life / p.ttl; if (k <= 0) return;
    g.save();
    if (p.b === 1) { g.globalAlpha = Math.max(0, k) * .95; g.strokeStyle = p.c; g.lineWidth = p.s; g.lineCap = 'round'; g.beginPath(); g.moveTo(p.x - p.vx * .06, p.y - p.vy * .06); g.lineTo(p.x, p.y); g.stroke(); g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.s * .7, 0, 6.283); g.fill(); }
    else { var r = p.s * (1 + (1 - k) * .9); g.globalAlpha = Math.min(1, k * .75); var hx = parseInt(p.c.slice(1), 16), rgb = (hx >> 16) + ',' + ((hx >> 8) & 255) + ',' + (hx & 255), gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); gr.addColorStop(0, 'rgba(' + rgb + ',1)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, 6.283); g.fill(); }
    g.restore();
  }
  function drawCrystal(p, light) {
    var s = p.s, a = p.a, col = light ? 'rgba(90,150,205,' : 'rgba(222,240,255,';
    g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
    if (p.dot) { g.fillStyle = col + a + ')'; g.beginPath(); g.arc(0, 0, s, 0, 6.283); g.fill(); g.restore(); return; }
    g.strokeStyle = col + a + ')'; g.lineWidth = s > 9 ? 1.3 : 1; g.lineCap = 'round';
    if (!light) { g.shadowColor = 'rgba(150,210,255,.9)'; g.shadowBlur = s > 9 ? 7 : 4; }
    for (var i = 0; i < 6; i++) {
      g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, s);
      g.moveTo(0, s * .55); g.lineTo(s * .26, s * .82); g.moveTo(0, s * .55); g.lineTo(-s * .26, s * .82); g.stroke();
    }
    g.restore();
  }
  function drawStar(p, light) {
    var tw = .5 + .5 * Math.sin(p.t * 1.6 + p.ph), a = p.a * (.3 + .7 * tw), s = p.s * (.8 + tw * .5);
    g.save(); g.globalAlpha = a; g.fillStyle = light ? '#4a5fd0' : '#fff6d8'; g.beginPath(); g.arc(p.x, p.y, s, 0, 6.283); g.fill();
    if (s > 1.2) { g.strokeStyle = g.fillStyle; g.lineWidth = .7; g.beginPath(); g.moveTo(p.x - s * 3, p.y); g.lineTo(p.x + s * 3, p.y); g.moveTo(p.x, p.y - s * 3); g.lineTo(p.x, p.y + s * 3); g.stroke(); }
    g.restore();
  }
  function drawMoon(light) {
    var x = W - 62, y = 112, r = 22; g.save();
    var gl = g.createRadialGradient(x, y, r * .6, x, y, r * 3); gl.addColorStop(0, light ? 'rgba(210,160,0,.28)' : 'rgba(255,225,140,.30)'); gl.addColorStop(1, 'rgba(255,225,140,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 3, 0, 6.283); g.fill();
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.clip();
    g.fillStyle = light ? '#d9a400' : '#ffe08a'; g.beginPath(); g.rect(x - r - 2, y - r - 2, r * 2 + 4, r * 2 + 4); g.arc(x + 9, y - 5, r * .88, 0, 6.283); g.fill('evenodd');
    g.restore();
  }
  function drawAurora(t, light) {
    var bands = [['rgba(60,240,170,', 0], ['rgba(120,130,255,', 1], ['rgba(70,220,230,', 2]], x, k;
    g.save(); if (!light) g.globalCompositeOperation = 'lighter';
    bands.forEach(function (bd) {
      k = bd[1]; var base = H * (.16 + k * .07), amp = 34 + k * 10, top = [], step = Math.max(14, W / 40);
      for (x = 0; x <= W + step; x += step) top.push([x, base + Math.sin(x * .004 + t * (.18 + k * .05) + k * 2) * amp + Math.sin(x * .011 - t * .22 + k) * 14]);
      var gr = g.createLinearGradient(0, base - amp, 0, base + 190); gr.addColorStop(0, bd[0] + (light ? '.16)' : '.20)')); gr.addColorStop(.5, bd[0] + (light ? '.07)' : '.09)')); gr.addColorStop(1, bd[0] + '0)');
      g.fillStyle = gr; g.beginPath(); top.forEach(function (q, i) { if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); });
      for (var i = top.length - 1; i >= 0; i--) g.lineTo(top[i][0], top[i][1] + 190 + Math.sin(top[i][0] * .01 + t * .3) * 30);
      g.closePath(); g.fill();
    });
    g.restore();
  }
  function drawHeart(p) {
    var r = p.s * .5; g.translate(p.x, p.y); g.fillStyle = p.c; g.beginPath(); g.moveTo(0, r * 1.6); g.bezierCurveTo(-r * 2.2, r * .2, -r * 1.2, -r * 1.6, 0, -r * .5); g.bezierCurveTo(r * 1.2, -r * 1.6, r * 2.2, r * .2, 0, r * 1.6); g.fill();
  }
  function drawLantern(p) {
    var s = p.s, tw = .85 + .15 * Math.sin(p.t * 2.4 + p.ph);
    var gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 2.6); gr.addColorStop(0, 'rgba(255,170,60,' + (.5 * tw) + ')'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, s * 2.6, 0, 6.283); g.fill();
    g.fillStyle = '#e0372b'; g.beginPath(); g.ellipse(p.x, p.y, s * .72, s * .9, 0, 0, 6.283); g.fill();
    g.fillStyle = '#f6c244'; g.fillRect(p.x - s * .32, p.y - s * 1.0, s * .64, s * .16); g.fillRect(p.x - s * .32, p.y + s * .86, s * .64, s * .16);
    g.strokeStyle = '#f6c244'; g.lineWidth = 1; g.beginPath(); g.moveTo(p.x, p.y + s * 1.02); g.lineTo(p.x, p.y + s * 1.5); g.stroke();
  }
  function drawPart(p, light) {
    var ty = fxType;
    if (p.b) { drawBurst(p); return; }
    if (ty === 'crystal') { drawCrystal(p, light); return; }
    if (ty === 'star' || ty === 'aurora') { drawStar(p, light); return; }
    g.save(); g.globalAlpha = p.a;
    if (ty === 'confetti') { g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, Math.abs(Math.sin(p.rot * 1.7)) * .8 + .2); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
    else if (ty === 'petal' || ty === 'sakura') { g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.c; g.beginPath(); g.ellipse(0, 0, p.s * .55, p.s, 0, 0, 6.283); g.fill(); }
    else if (ty === 'leaf') { g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.c; g.beginPath(); g.moveTo(0, -p.s); g.quadraticCurveTo(p.s * .9, -p.s * .2, 0, p.s); g.quadraticCurveTo(-p.s * .9, -p.s * .2, 0, -p.s); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .8; g.beginPath(); g.moveTo(0, -p.s); g.lineTo(0, p.s); g.stroke(); }
    else if (ty === 'rain') { g.strokeStyle = light ? 'rgba(60,110,170,.7)' : 'rgba(170,205,255,.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + 3, p.y - p.s); g.stroke(); }
    else if (ty === 'heart') drawHeart(p);
    else if (ty === 'lantern') drawLantern(p);
    else {
      var tw = .5 + .5 * Math.sin(p.t * 2.2 + p.ph), col = ty === 'firefly' ? '255,224,110' : ty === 'ember' ? '255,140,40' : null, r = p.s * (1 + tw * .7);
      g.globalAlpha = p.a * (.35 + .65 * tw);
      var grad = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
      if (col) { grad.addColorStop(0, 'rgba(' + col + ',1)'); grad.addColorStop(1, 'rgba(' + col + ',0)'); }
      else { var hx = p.c === '#ffc94d' ? '255,201,77' : '255,122,176'; grad.addColorStop(0, 'rgba(' + hx + ',1)'); grad.addColorStop(1, 'rgba(' + hx + ',0)'); }
      g.fillStyle = grad; g.beginPath(); g.arc(p.x, p.y, r * 4, 0, 6.283); g.fill();
    }
    g.restore();
  }
  function drawShooting(dt, light) {
    shootT -= dt;
    if (!shoot && shootT <= 0) { shoot = { x: rnd(W * .3, W), y: rnd(0, H * .3), vx: -rnd(380, 560), vy: rnd(160, 260), life: 0 }; shootT = rnd(5, 11); }
    if (!shoot) return;
    shoot.life += dt; shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
    var k = 1 - shoot.life / .9; if (k <= 0) { shoot = null; return; }
    var len = 90, ang = Math.atan2(shoot.vy, shoot.vx), tx = shoot.x - Math.cos(ang) * len, ty2 = shoot.y - Math.sin(ang) * len;
    var gr = g.createLinearGradient(shoot.x, shoot.y, tx, ty2); var c = light ? '70,95,208' : '255,246,216'; gr.addColorStop(0, 'rgba(' + c + ',' + k + ')'); gr.addColorStop(1, 'rgba(' + c + ',0)');
    g.save(); g.strokeStyle = gr; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(shoot.x, shoot.y); g.lineTo(tx, ty2); g.stroke(); g.restore();
  }
  function frame(now) {
    if (!rafOn) return;
    var dt = Math.min(.06, (now - lastT) / 1000 || .016); lastT = now; clock += dt;
    g.clearRect(0, 0, W, H); var light = isLight(), T = TYPES[fxType], sway = fxType !== 'rain';
    if (T.aurora) drawAurora(clock, light);
    if (BY[eff()] && BY[eff()].moon) drawMoon(light);
    if (T.burst) {
      burstT -= dt; if (burstT <= 0) { spawnBurst(); burstT = rnd(T.gap[0], T.gap[1]); }
      for (var j = parts.length - 1; j >= 0; j--) { var b = parts[j]; stepBurst(b, dt); if (b.life >= b.ttl) { parts.splice(j, 1); continue; } drawBurst(b); }
    } else {
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; p.t += dt;
        p.y += p.vy * dt; p.x += (p.vx + (sway ? Math.sin(p.t * .9 + (p.ph || 0)) * p.sw * .35 : 0)) * dt;
        if (p.rot !== undefined) p.rot += (p.vr || 0) * dt;
        var out = p.vy > 0 ? (p.y > H + 30 || p.x > W + 40 || p.x < -40) : p.vy < 0 ? (p.y < -50) : (p.x > W + 20 || p.x < -20);
        if (out) { T.make(p, false); if (p.vy === 0) { p.x = rnd(0, W); p.y = rnd(0, H * .75); } else { p.x = rnd(0, W); if (fxType === 'rain') p.y = -20; } }
        drawPart(p, light);
      }
    }
    if (fxType === 'star' || fxType === 'aurora') drawShooting(dt, light);
    requestAnimationFrame(frame);
  }
  function stopFx() { rafOn = false; if (cv) { g.clearRect(0, 0, W, H); cv.style.opacity = '0'; } parts = []; fxType = null; shoot = null; }
  function startFx(type) {
    if (!state.fx || !type) { stopFx(); return; }
    if (!cv) { cv = document.createElement('canvas'); cv.id = 'season-fx'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv); g = cv.getContext('2d'); }
    size(); fxType = type; parts = []; shoot = null; shootT = rnd(2, 5); burstT = .3; var T = TYPES[type];
    if (!T.burst) { var n = count(type); for (var i = 0; i < n; i++) parts.push(spawn(true)); }
    cv.style.opacity = '1';
    if (reducedMotion()) {
      rafOn = false; g.clearRect(0, 0, W, H); var light = isLight();
      if (T.aurora) drawAurora(1, light);
      if (BY[eff()] && BY[eff()].moon) drawMoon(light);
      if (T.burst) { for (var k = 0; k < 3; k++) spawnBurst(); parts.forEach(function (p) { for (var s2 = 0; s2 < 20; s2++) stepBurst(p, .02); }); }
      parts.forEach(function (p) { drawPart(p, light); });
      return;
    }
    if (!rafOn) { rafOn = true; lastT = performance.now(); requestAnimationFrame(frame); }
  }

  /* ---------- Soft music (Web Audio, layered over the ambience player) ---------- */
  var ac = null, master = null, dry = null, revIn = null, noiseBuf = null, seqTimer = 0, sustained = [], musicOn = false, pendingGesture = false;
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function audio() {
    if (ac) return ac;
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    ac = new C(); master = ac.createGain(); master.gain.value = 0;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600; master.connect(lp); lp.connect(ac.destination);
    var conv = ac.createConvolver(), len = Math.floor(ac.sampleRate * 2.6), ir = ac.createBuffer(2, len, ac.sampleRate);
    for (var c = 0; c < 2; c++) { var d = ir.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4); }
    conv.buffer = ir; var wet = ac.createGain(); wet.gain.value = .6; conv.connect(wet); wet.connect(master);
    dry = ac.createGain(); dry.gain.value = .8; dry.connect(master); revIn = conv;
    var nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), nd = nb.getChannelData(0); for (var j = 0; j < nd.length; j++) nd[j] = Math.random() * 2 - 1; noiseBuf = nb;
    return ac;
  }
  function route(node, send) { node.connect(dry); if (send) { var s = ac.createGain(); s.gain.value = send; node.connect(s); s.connect(revIn); } }
  function boxNote(t, m, dur, v) {
    var f = mtof(m), gn = ac.createGain(), life = Math.max(.7, dur * 1.7);
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(v, t + .006); gn.gain.exponentialRampToValueAtTime(.0001, t + life);
    [[1, 1], [2, .26], [3, .1], [5.4, .045]].forEach(function (p) { var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f * p[0]; var og = ac.createGain(); og.gain.value = p[1]; o.connect(og); og.connect(gn); o.start(t); o.stop(t + life + .1); });
    route(gn, .55);
  }
  function pluckNote(t, m, dur, v) {
    var o = ac.createOscillator(), gn = ac.createGain(), f = ac.createBiquadFilter(), life = Math.max(.6, dur * 1.3);
    o.type = 'triangle'; o.frequency.value = mtof(m); f.type = 'lowpass'; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(500, t + life);
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(v, t + .012); gn.gain.exponentialRampToValueAtTime(.0001, t + life);
    o.connect(f); f.connect(gn); o.start(t); o.stop(t + life + .1); route(gn, .45);
  }
  function padNote(t, m, dur, v) {
    var gn = ac.createGain(), a = Math.min(1.2, dur * .35);
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(v, t + a); gn.gain.setValueAtTime(v, t + Math.max(a, dur - 1)); gn.gain.linearRampToValueAtTime(0, t + dur + 1);
    [-4, 4].forEach(function (c) { var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(m); o.detune.value = c; o.connect(gn); o.start(t); o.stop(t + dur + 1.2); });
    route(gn, .7);
  }
  function bellHit(t, v) {
    var s = ac.createBufferSource(); s.buffer = noiseBuf; var f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 6800; f.Q.value = 7; var gn = ac.createGain();
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(v, t + .004); gn.gain.exponentialRampToValueAtTime(.0001, t + .22);
    s.connect(f); f.connect(gn); s.start(t, rnd(0, 1)); s.stop(t + .3); route(gn, .35);
  }
  var INST = { box: boxNote, pluck: pluckNote, pad: padNote, bell: function (t, m, d, v) { bellHit(t, v); } };

  /* tracks: each returns { beats, list: [[beat, midi, durBeats, inst, velocity], ...] } sorted by beat */
  function seqTrack(notes, bars, inst, extras) {
    var list = [], b = 0;
    notes.forEach(function (n) { if (n[0] !== null) list.push([b, n[0], n[1], inst, .5]); b += n[1]; });
    (extras || []).forEach(function (e) { list.push(e); });
    list.sort(function (x, y) { return x[0] - y[0]; });
    return { beats: bars * 4, list: list };
  }
  var JINGLE = [[64, 1], [64, 1], [64, 2], [64, 1], [64, 1], [64, 2], [64, 1], [67, 1], [60, 1.5], [62, .5], [64, 4], [65, 1], [65, 1], [65, 1.5], [65, .5], [65, 1], [64, 1], [64, 1], [64, .5], [64, .5], [64, 1], [62, 1], [62, 1], [64, 1], [62, 2], [67, 2],
    [64, 1], [64, 1], [64, 2], [64, 1], [64, 1], [64, 2], [64, 1], [67, 1], [60, 1.5], [62, .5], [64, 4], [65, 1], [65, 1], [65, 1.5], [65, .5], [65, 1], [64, 1], [64, 1], [64, .5], [64, .5], [67, 1], [67, 1], [65, 1], [62, 1], [60, 4]];
  var JB_BASS = [48, 48, 48, 48, 53, 48, 48, 55, 48, 48, 48, 48, 53, 48, 55, 48];
  function jingleTrack() {
    var ex = []; JB_BASS.forEach(function (m, i) { ex.push([i * 4, m, 4, 'pad', .1]); });
    for (var b = 0; b < 64; b += 1) ex.push([b + .5, 0, .2, 'bell', .035]);
    return seqTrack(JINGLE, 16, 'box', ex);
  }
  var AULD = [[62, 1], [67, 1.5], [67, .5], [67, 1], [71, 1], [69, 1.5], [67, .5], [69, 1], [71, 1], [67, 1.5], [67, .5], [71, 1], [74, 1], [76, 3], [null, 1],
    [76, 1.5], [74, .5], [71, 1], [71, 1], [74, 1.5], [71, .5], [67, 1], [67, 1], [69, 1.5], [67, .5], [69, 1], [71, 1], [67, 4]];
  function auldTrack() {
    var ex = [[0, 43, 8, 'pad', .1], [8, 50, 8, 'pad', .09], [16, 48, 8, 'pad', .09], [24, 43, 8, 'pad', .1]];
    return seqTrack(AULD, 8, 'box', ex);
  }
  var TWINKLE = [[60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
    [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2], [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
    [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2]];
  function twinkleTrack() {
    var roots = [48, 48, 55, 55, 48, 48], ex = []; roots.forEach(function (m, i) { ex.push([i * 8, m, 8, 'pad', .09]); ex.push([i * 8, m + 7, 8, 'pad', .06]); });
    return seqTrack(TWINKLE, 12, 'box', ex);
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function genTrack(o) {
    var list = [], b = 0, last = Math.floor(o.scale.length / 2);
    while (b < o.bars * 4) {
      if (Math.random() < o.rest) { b += pick(o.durs); continue; }
      last = Math.max(0, Math.min(o.scale.length - 1, last + pick([-2, -1, -1, 0, 1, 1, 2]))); var d = pick(o.durs);
      list.push([b, o.scale[last], d, o.inst, o.vel * rnd(.7, 1)]); b += d;
    }
    if (o.bells) for (var bb = 0; bb < o.bars * 4; bb += o.bells) list.push([bb + .5, 0, .2, 'bell', .03]);
    (o.chords || []).forEach(function (c, i) { c.forEach(function (m) { list.push([i * o.chordBeats, m, o.chordBeats, 'pad', o.padVel]); }); });
    list.sort(function (x, y) { return x[0] - y[0]; });
    return { beats: o.bars * 4, list: list };
  }
  var TRACKS = {
    valentine: { bpm: 72, make: function () { return genTrack({ bars: 8, scale: [65, 67, 69, 72, 74, 77, 79], durs: [1, 1.5, 2, 2], rest: .22, inst: 'box', vel: .4, chords: [[41, 48, 57], [45, 52, 60], [46, 53, 62], [41, 48, 57]], chordBeats: 8, padVel: .08 }); } },
    holi: { bpm: 112, make: function () { return genTrack({ bars: 8, scale: [62, 64, 66, 69, 71, 74, 76, 78], durs: [.5, .5, 1, 1, 1.5], rest: .15, inst: 'pluck', vel: .34, bells: 1, chords: [[38, 45, 54], [43, 50, 59]], chordBeats: 16, padVel: .06 }); } },
    eid: { bpm: 74, drone: true, make: function () { return genTrack({ bars: 8, scale: [62, 63, 66, 67, 69, 70, 72, 74], durs: [1, 1, 2, 2, 3], rest: .2, inst: 'pluck', vel: .36, chords: [[38, 45]], chordBeats: 32, padVel: .07 }); } },
    lunar: { bpm: 90, make: function () { return genTrack({ bars: 8, scale: [60, 62, 64, 67, 69, 72, 74, 76], durs: [.5, 1, 1, 1.5], rest: .2, inst: 'pluck', vel: .36, bells: 2, chords: [[48, 55, 64]], chordBeats: 32, padVel: .06 }); } },
    aurora: { bpm: 46, make: function () { return genTrack({ bars: 8, scale: [69, 72, 74, 76, 79, 81], durs: [3, 4, 4, 6], rest: .5, inst: 'box', vel: .3, chords: [[45, 52, 57, 60], [41, 48, 55, 60], [43, 50, 55, 62], [40, 47, 52, 59]], chordBeats: 8, padVel: .09 }); } },
    sakura: { bpm: 62, make: function () { return genTrack({ bars: 8, scale: [62, 64, 65, 69, 70, 74, 76, 77], durs: [1, 2, 2, 3], rest: .35, inst: 'pluck', vel: .36, chords: [[38, 45]], chordBeats: 32, padVel: .06 }); } },
    starry: { bpm: 60, make: twinkleTrack },
    celebrate: { bpm: 100, make: function () { return genTrack({ bars: 8, scale: [67, 69, 71, 74, 76, 79], durs: [.5, 1, 1, 2], rest: .15, inst: 'box', vel: .36, bells: 1, chords: [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]], chordBeats: 8, padVel: .07 }); } },
    jingle: { bpm: 108, make: jingleTrack },
    auld: { bpm: 76, make: auldTrack },
    winter: { bpm: 66, make: function () { return genTrack({ bars: 8, scale: [57, 60, 62, 64, 67, 69, 72, 74, 76], durs: [1, 1, 2, 2, 3], rest: .22, inst: 'box', vel: .42, chords: [[45, 52, 57], [41, 48, 53], [48, 55, 60], [43, 50, 55]], chordBeats: 8, padVel: .07 }); } },
    spring: { bpm: 92, make: function () { return genTrack({ bars: 8, scale: [67, 69, 72, 74, 76, 79, 81, 84], durs: [.5, 1, 1, 1.5, 2], rest: .2, inst: 'pluck', vel: .34, chords: [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]], chordBeats: 8, padVel: .06 }); } },
    summer: { bpm: 56, make: function () { return genTrack({ bars: 8, scale: [64, 67, 69, 71, 74, 76], durs: [2, 2, 3, 4], rest: .35, inst: 'box', vel: .3, chords: [[48, 55, 59, 64], [45, 52, 57, 64], [41, 48, 57, 64], [43, 50, 59, 65]], chordBeats: 8, padVel: .08 }); } },
    monsoon: { bpm: 54, rain: true, make: function () { return genTrack({ bars: 8, scale: [50, 53, 55, 57, 60, 62, 65], durs: [2, 3, 4], rest: .45, inst: 'box', vel: .36, chords: [[38, 45, 50], [34, 41, 46]], chordBeats: 16, padVel: .07 }); } },
    autumn: { bpm: 62, make: function () { return genTrack({ bars: 8, scale: [50, 53, 55, 57, 60, 62, 65, 67], durs: [1, 2, 2, 3], rest: .25, inst: 'pluck', vel: .34, chords: [[38, 45, 53], [43, 50, 58], [41, 48, 57], [45, 52, 60]], chordBeats: 8, padVel: .07 }); } },
    spooky: { bpm: 60, make: function () { return genTrack({ bars: 8, scale: [57, 60, 63, 64, 69, 72, 75, 76], durs: [1, 2, 2, 3], rest: .3, inst: 'box', vel: .34, chords: [[33, 40, 45], [33, 39, 45]], chordBeats: 16, padVel: .09 }); } },
    diwali: { bpm: 82, drone: true, make: function () { return genTrack({ bars: 8, scale: [60, 62, 64, 67, 69, 72, 74, 76, 79], durs: [.5, 1, 1, 1.5, 2], rest: .22, inst: 'pluck', vel: .38, chords: [[48, 55]], chordBeats: 32, padVel: .08 }); } }
  };
  function startRain() {
    var s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; var f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1500; var h = ac.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = 400; var gn = ac.createGain(); gn.gain.value = .22;
    s.connect(f); f.connect(h); h.connect(gn); gn.connect(master); s.start(); sustained.push(s);
  }
  function startMusic(season) {
    var tr = TRACKS[BY[season].music]; if (!tr) return;
    stopMusicNow(true); if (!audio()) return;
    musicOn = true;
    master.gain.cancelScheduledValues(ac.currentTime); master.gain.setValueAtTime(master.gain.value, ac.currentTime); master.gain.linearRampToValueAtTime(state.vol * .55, ac.currentTime + 2.2);
    if (tr.rain) startRain();
    var spb = 60 / tr.bpm, loopStart = ac.currentTime + .4, ev = tr.make(), i = 0;
    function place(e, t) { var f = INST[e[3]]; if (f) f(t, e[1], e[2] * spb, e[4]); }
    if (tr.drone) { [48, 55].forEach(function (m) { padNote(ac.currentTime + .2, m, 600, .05); }); }
    seqTimer = setInterval(function () {
      if (!ac || ac.state === 'closed') return;
      var horizon = ac.currentTime + 1.4;
      for (var guard = 0; guard < 200; guard++) {
        if (i >= ev.list.length) { loopStart += ev.beats * spb; ev = tr.make(); i = 0; }
        var e = ev.list[i], t = loopStart + e[0] * spb;
        if (t > horizon) break;
        if (t >= ac.currentTime - .05) place(e, t);
        i++;
      }
    }, 250);
  }
  function stopMusicNow(immediate) {
    clearInterval(seqTimer); seqTimer = 0; musicOn = false;
    sustained.forEach(function (s) { try { s.stop(); } catch (e) {} }); sustained = [];
    if (!ac) return;
    var old = ac, om = master;
    if (immediate) { try { old.close(); } catch (e) {} }
    else {
      try { om.gain.cancelScheduledValues(old.currentTime); om.gain.setValueAtTime(om.gain.value, old.currentTime); om.gain.linearRampToValueAtTime(0, old.currentTime + .6); } catch (e) {}
      setTimeout(function () { try { old.close(); } catch (e) {} }, 800);
    }
    ac = null; master = null; dry = null; revIn = null;
  }
  function setVolume() { if (ac && master) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(state.vol * .55, ac.currentTime, .15); } }
  function wantGesture() {
    if (pendingGesture) return; pendingGesture = true;
    function go() { pendingGesture = false; ['pointerdown', 'keydown'].forEach(function (ev) { window.removeEventListener(ev, go, true); }); var s = eff(); if (s && state.music) startMusic(s); }
    ['pointerdown', 'keydown'].forEach(function (ev) { window.addEventListener(ev, go, true); });
  }
  document.addEventListener('visibilitychange', function () {
    if (!ac) return;
    try { if (document.hidden) ac.suspend(); else ac.resume(); } catch (e) {}
  });

  /* ---------- Apply everything ---------- */
  function crystalSvg() {
    function rot(x, y, a) { var c = Math.cos(a), s = Math.sin(a), dx = x - 12, dy = y - 12; return [(12 + dx * c - dy * s).toFixed(2), (12 + dx * s + dy * c).toFixed(2)]; }
    var p = '';
    [0, Math.PI / 3, 2 * Math.PI / 3].forEach(function (a) {
      var pts = [[12, 2.5], [12, 21.5], [9.4, 5.2], [12, 7.6], [14.6, 5.2], [9.4, 18.8], [12, 16.4], [14.6, 18.8]].map(function (q) { return rot(q[0], q[1], a); });
      p += 'M' + pts[0].join(' ') + 'L' + pts[1].join(' ') + 'M' + pts[2].join(' ') + 'L' + pts[3].join(' ') + 'L' + pts[4].join(' ') + 'M' + pts[5].join(' ') + 'L' + pts[6].join(' ') + 'L' + pts[7].join(' ');
    });
    return '<svg class="ic season-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + p + '"/></svg>';
  }
  function paintBtn() {
    var b = $('#btn-season'); if (!b) return;
    var s = eff(); b.classList.toggle('on', !!s);
    b.setAttribute('aria-pressed', s ? 'true' : 'false');
    b.setAttribute('aria-label', 'Theme: ' + (state.id === 'off' ? 'palette ' + (LV.palette ? LV.palette.current() : '') : state.id === 'auto' ? 'season auto (' + BY[s].n + ')' : 'season ' + BY[s].n) + '. Tap to change.');
    if (!b.firstChild) b.innerHTML = crystalSvg();
  }
  function apply(userGesture) {
    var s = eff(), root = document.documentElement;
    if (s) root.setAttribute('data-season', s); else root.removeAttribute('data-season');
    startFx(s ? BY[s].fx : null);
    var tc = $('meta[name="theme-color"]'); if (tc && s) { /* keep the base bar colour; the accent change is enough */ }
    if (s && state.music) { if (userGesture) startMusic(s); else wantGesture(); } else stopMusicNow(false);
    paintBtn();
  }

  /* ---------- Menu ---------- */
  function closeMenu() { var m = $('#sea'); if (m) m.remove(); var b = $('#btn-season'); if (b) b.setAttribute('aria-expanded', 'false'); }
  function paletteDot(p) { var c = isLight() ? p.l : p.d; return '<span class="sea-e pal-dot" style="background:linear-gradient(135deg,' + c[0] + ' 50%,' + c[1] + ' 50%)" aria-hidden="true"></span>'; }
  function openMenu() {
    var keepTop = null; var old = $('#sea'); if (old) old.remove();
    var b = $('#btn-season'), r = b.getBoundingClientRect(), el = document.createElement('div'), cur = state.id, auto = autoId(), pal = LV.palette ? LV.palette.current() : 'amber';
    el.id = 'sea'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Themes');
    function sopt(id, label, ico, sub) { var on = cur === id; return '<button class="sea-opt' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-s="' + id + '"><span class="sea-e" aria-hidden="true">' + ico + '</span><span><b>' + esc(label) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span></button>'; }
    var pals = LV.palette ? LV.palette.list.map(function (p) { var on = cur === 'off' && p.id === pal; return '<button class="sea-opt' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-p="' + p.id + '">' + paletteDot(p) + '<span><b>' + esc(p.n) + '</b></span></button>'; }).join('') : '';
    el.innerHTML = '<h3>Theme</h3>' +
      '<div><h4>Colour palette</h4><div class="sea-grid" role="radiogroup" aria-label="Colour palette">' + pals + '</div></div>' +
      '<div><h4>Season theme</h4><p class="muted sm">Soft colours, gentle falling effects and quiet music on top of everything else. Picking a palette turns the season off.</p>' +
      '<div class="sea-grid" role="radiogroup" aria-label="Season theme">' + sopt('auto', 'Auto', '✨', 'Today: ' + BY[auto].n) + SEASONS.map(function (s) { return sopt(s.id, s.n, s.e, ''); }).join('') + '</div></div>' +
      '<div class="sea-set"><label class="sea-sw"><input type="checkbox" id="sea-fx"' + (state.fx ? ' checked' : '') + '> Falling effects</label>' +
      '<label class="sea-sw"><input type="checkbox" id="sea-mu"' + (state.music ? ' checked' : '') + '> Soft music</label>' +
      '<label class="sea-vol"><span>Music volume</span><input type="range" id="sea-vol" min="0" max="100" value="' + Math.round(state.vol * 100) + '" aria-label="Season music volume"></label></div>';
    document.body.appendChild(el);
    el.style.top = (r.bottom + 8) + 'px';
    el.style.left = Math.max(12, Math.min(window.innerWidth - el.offsetWidth - 12, r.right - el.offsetWidth)) + 'px';
    b.setAttribute('aria-expanded', 'true');
    if (old) el.scrollTop = old._st || 0;
    var f = $('.sea-opt.on', el) || $('.sea-opt', el); if (f && !old) f.focus({ preventScroll: true });
  }
  function onClick(e) {
    var m = $('#sea');
    if (m && !e.target.closest('#sea') && !e.target.closest('#btn-season')) { closeMenu(); return; }
    var po = e.target.closest('.sea-opt[data-p]');
    if (po && LV.palette) {
      var pid = po.dataset.p; state.id = 'off'; save(); LV.store.set('palette', pid); LV.palette.apply(pid); apply(true);
      LV.toast('Palette: ' + po.textContent.trim()); keepMenu(); return;
    }
    var o = e.target.closest('.sea-opt[data-s]');
    if (o) {
      state.id = o.dataset.s; save(); apply(true);
      LV.toast(BY[eff()].n + (state.id === 'auto' ? ' (auto)' : '') + ' season on'); keepMenu();
    }
  }
  function keepMenu() { var m = $('#sea'); if (!m) return; var st = m.scrollTop; m._st = st; openMenu(); var n = $('#sea'); if (n) n.scrollTop = st; }
  function $$(s, r) { return LV.$$(s, r); }
  function onChange(e) {
    if (e.target.id === 'sea-fx') { state.fx = e.target.checked; save(); startFx(eff() ? BY[eff()].fx : null); }
    else if (e.target.id === 'sea-mu') { state.music = e.target.checked; save(); var s = eff(); if (s && state.music) startMusic(s); else stopMusicNow(false); }
  }
  function onInput(e) { if (e.target.id === 'sea-vol') { state.vol = (+e.target.value) / 100; save(); setVolume(); } }

  LV.season = {
    list: SEASONS, current: eff,
    init: function () {
      injectCss();
      var b = $('#btn-season'); if (!b) return;
      b.innerHTML = crystalSvg();
      b.onclick = function (e) { e.stopPropagation(); if ($('#sea')) closeMenu(); else openMenu(); };
      document.addEventListener('click', onClick);
      document.addEventListener('change', onChange);
      document.addEventListener('input', onInput);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#sea')) { closeMenu(); b.focus(); } });
      window.addEventListener('resize', function () { if (cv && fxType) { size(); } });
      apply(false);
    },
    apply: apply, autoId: autoId,
    refresh: function () { if ($('#sea')) keepMenu(); paintBtn(); }
  };
})();
