/* Linuxverse animation engine: step-by-step SVG diagrams with flowing packets */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var CW = 6.3, NH = 28, W = 360;

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function boxW(label) { return Math.min(W - 8, Math.max(64, label.length * CW + 22)); }

  /* Clip a centre-to-centre line to the edge of a node box */
  function edgePoint(n, tx, ty) {
    var dx = tx - n.x, dy = ty - n.y;
    if (!dx && !dy) return { x: n.x, y: n.y };
    var hw = n.w / 2 + 3, hh = NH / 2 + 3;
    var s = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
    return { x: n.x + dx * s, y: n.y + dy * s };
  }

  LV.anim = function (host, spec) {
    var nodes = {}, edges = {}, maxY = 0;
    spec.nodes.forEach(function (n) {
      var w = boxW(n[3]);
      var x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, n[1]));
      nodes[n[0]] = { id: n[0], x: x, y: n[2], label: n[3], kind: n[4] || 'file', w: w };
      maxY = Math.max(maxY, n[2]);
    });
    var H = maxY + NH / 2 + 16;

    host.innerHTML =
      '<div class="anim-stage"><svg class="anim-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Animated diagram"></svg></div>' +
      '<p class="anim-cap" aria-live="polite"></p>' +
      '<div class="anim-ctrl">' +
      '<button class="ibtn a-prev" aria-label="Previous step">' + LV.icon('prev') + '</button>' +
      '<button class="ibtn a-play primary" aria-label="Play or pause">' + LV.icon('pause') + '</button>' +
      '<button class="ibtn a-next" aria-label="Next step">' + LV.icon('next') + '</button>' +
      '<div class="a-dots"></div>' +
      '<button class="ibtn a-restart" aria-label="Restart">' + LV.icon('restart') + '</button>' +
      '</div>';

    var svg = host.querySelector('svg');
    var defs = el('defs', {}, svg);
    var mk = el('marker', { id: 'arw-' + (LV._aid = (LV._aid || 0) + 1), viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0L10 5L0 10z', class: 'arw' }, mk);
    var mid = 'url(#arw-' + LV._aid + ')';

    var gE = el('g', { class: 'g-edges' }, svg);
    var gF = el('g', { class: 'g-flow' }, svg);
    var gN = el('g', { class: 'g-nodes' }, svg);

    (spec.edges || []).forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      if (!a || !b) return;
      var p1 = edgePoint(a, b.x, b.y), p2 = edgePoint(b, a.x, a.y);
      var key = e[0] + '>' + e[1];
      edges[key] = { a: e[0], b: e[1], p1: p1, p2: p2, el: el('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: 'edge', 'marker-end': mid }, gE) };
    });
    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      var g = el('g', { class: 'node k-' + n.kind, transform: 'translate(' + n.x + ',' + n.y + ')' }, gN);
      el('rect', { x: -n.w / 2, y: -NH / 2, width: n.w, height: NH, rx: 7 }, g);
      var t = el('text', { x: 0, y: 4, 'text-anchor': 'middle' }, g);
      t.textContent = n.label;
      n.g = g;
    });

    var steps = spec.steps || [];
    var cap = host.querySelector('.anim-cap');
    var dots = host.querySelector('.a-dots');
    dots.innerHTML = steps.map(function (s, i) { return '<button class="dot" aria-label="Step ' + (i + 1) + '" data-i="' + i + '"></button>'; }).join('');
    var idx = 0, playing = !LV.reduced(), timer = null, raf = null, packets = [];

    function flowPath(a, b) {
      var e = edges[a + '>' + b];
      if (e) return { p1: e.p1, p2: e.p2 };
      e = edges[b + '>' + a];
      if (e) return { p1: e.p2, p2: e.p1 };
      var na = nodes[a], nb = nodes[b];
      if (!na || !nb) return null;
      return { p1: edgePoint(na, nb.x, nb.y), p2: edgePoint(nb, na.x, na.y) };
    }

    function animatePackets() {
      cancelAnimationFrame(raf);
      if (!packets.length) return;
      var start = performance.now();
      function frame(now) {
        var t = ((now - start) % 1400) / 1400;
        packets.forEach(function (p, i) {
          var u = (t + i * 0.12) % 1;
          p.c.setAttribute('cx', p.p1.x + (p.p2.x - p.p1.x) * u);
          p.c.setAttribute('cy', p.p1.y + (p.p2.y - p.p1.y) * u);
          p.c.setAttribute('opacity', u < 0.08 ? u / 0.08 : u > 0.9 ? (1 - u) / 0.1 : 1);
        });
        if (host.isConnected) raf = requestAnimationFrame(frame);
      }
      if (LV.reduced()) { packets.forEach(function (p) { p.c.setAttribute('cx', (p.p1.x + p.p2.x) / 2); p.c.setAttribute('cy', (p.p1.y + p.p2.y) / 2); }); return; }
      raf = requestAnimationFrame(frame);
    }

    function render() {
      var s = steps[idx] || {};
      var hidden = {};
      (spec.hide || []).forEach(function (h) { hidden[h] = true; });
      (s.show || []).forEach(function (h) { delete hidden[h]; });
      // a highlighted node is always shown
      (s.hi || []).forEach(function (h) { delete hidden[h]; });
      var hi = {}; (s.hi || []).forEach(function (h) { hi[h] = 1; });
      var dim = {}; (s.dim || []).forEach(function (h) { dim[h] = 1; });
      Object.keys(nodes).forEach(function (id) {
        var g = nodes[id].g;
        g.classList.toggle('hidden', !!hidden[id]);
        g.classList.toggle('hi', !!hi[id]);
        g.classList.toggle('dim', !!dim[id] || (!hi[id] && (s.hi || []).length > 0 && !LV._noDim));
      });
      var active = {};
      (s.flow || []).forEach(function (f) { active[f[0] + '>' + f[1]] = 1; active[f[1] + '>' + f[0]] = 1; });
      Object.keys(edges).forEach(function (k) {
        var e = edges[k];
        e.el.classList.toggle('hidden', !!hidden[e.a] || !!hidden[e.b]);
        e.el.classList.toggle('on', !!active[k]);
      });
      gF.innerHTML = '';
      packets = [];
      (s.flow || []).forEach(function (f) {
        var p = flowPath(f[0], f[1]);
        if (!p) return;
        for (var i = 0; i < 2; i++) packets.push({ p1: p.p1, p2: p.p2, c: el('circle', { r: 4.2, class: 'pkt', cx: p.p1.x, cy: p.p1.y }, gF) });
      });
      animatePackets();
      cap.innerHTML = '<span class="cap-n">' + (idx + 1) + '/' + steps.length + '</span> ' + LV.esc(s.t || '');
      LV.$$('.dot', dots).forEach(function (d, i) { d.classList.toggle('on', i === idx); d.classList.toggle('done', i < idx); });
    }

    function schedule() {
      clearTimeout(timer);
      if (!playing) return;
      timer = setTimeout(function () {
        if (!host.isConnected) return;
        if (idx < steps.length - 1) { idx++; render(); schedule(); }
        else { timer = setTimeout(function () { if (!host.isConnected || !playing) return; idx = 0; render(); schedule(); }, 2600); }
      }, 3000);
    }
    function setPlay(p) {
      playing = p;
      host.querySelector('.a-play').innerHTML = LV.icon(p ? 'pause' : 'play');
      schedule();
    }

    host.querySelector('.a-play').onclick = function () { setPlay(!playing); };
    host.querySelector('.a-next').onclick = function () { idx = Math.min(steps.length - 1, idx + 1); render(); setPlay(false); };
    host.querySelector('.a-prev').onclick = function () { idx = Math.max(0, idx - 1); render(); setPlay(false); };
    host.querySelector('.a-restart').onclick = function () { idx = 0; render(); setPlay(true); };
    dots.onclick = function (e) { var b = e.target.closest('.dot'); if (!b) return; idx = +b.dataset.i; render(); setPlay(false); };

    render();
    setPlay(playing);
    return { stop: function () { clearTimeout(timer); cancelAnimationFrame(raf); } };
  };
})();
