/* Linuxverse app: router, views, search, theme, commands */
(function () {
  'use strict';
  var $ = LV.$, $$ = LV.$$, esc = LV.esc, ic = LV.icon;
  var view, route = null, mainTerm = null, cleanup = [];
  var TABS = [['explain', 'Explain'], ['visual', 'Visual'], ['commands', 'Commands'], ['live', 'Live']];

  /* ---------- Theme ---------- */
  function effTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    try { return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; } catch (e) { return 'dark'; }
  }
  var PALETTES = [
    { id: 'amber', n: 'Amber', d: ['#ffb347', '#45d3c0'], l: ['#b75e00', '#0b8a7a'] },
    { id: 'ocean', n: 'Ocean', d: ['#5cc8ff', '#7ee0c3'], l: ['#0a69a8', '#0b7d6a'] },
    { id: 'violet', n: 'Violet', d: ['#b79bff', '#ff9ad5'], l: ['#6a45d6', '#b0286f'] },
    { id: 'rose', n: 'Rose', d: ['#ff7a9c', '#ffc46b'], l: ['#c2285a', '#8a5a00'] },
    { id: 'forest', n: 'Forest', d: ['#6fe3a1', '#d6e85a'], l: ['#1c7a45', '#6b7a00'] },
    { id: 'slate', n: 'Slate', d: ['#cfd6e6', '#8fa3c8'], l: ['#2c3a55', '#4a5f8a'] }
  ];
  function curPalette() { var p = LV.store.get('palette', 'amber'); return PALETTES.some(function (x) { return x.id === p; }) ? p : 'amber'; }
  function applyPalette(id) {
    if (id === 'amber') document.documentElement.removeAttribute('data-palette'); else document.documentElement.setAttribute('data-palette', id);
    var b = $('#btn-palette'); if (b) { b.innerHTML = ic('palette'); b.setAttribute('aria-label', 'Colour palette: ' + id); }
  }
  function closePal() { var p = $('#pal'); if (p) p.remove(); var b = $('#btn-palette'); if (b) b.setAttribute('aria-expanded', 'false'); }
  function openPal() {
    closePal();
    var b = $('#btn-palette'), cur = curPalette(), dark = effTheme() === 'dark', r = b.getBoundingClientRect(), el = document.createElement('div');
    el.id = 'pal'; el.setAttribute('role', 'radiogroup'); el.setAttribute('aria-label', 'Colour palette');
    el.innerHTML = '<h3>Colour palette</h3><div class="pal-grid">' + PALETTES.map(function (p) {
      var c = dark ? p.d : p.l;
      return '<button class="pal-opt" role="radio" aria-checked="' + (p.id === cur) + '" data-p="' + p.id + '"><span class="pal-dot" style="background:linear-gradient(135deg,' + c[0] + ' 50%,' + c[1] + ' 50%)"></span>' + p.n + '</button>';
    }).join('') + '</div><p class="muted sm">Works in both dark and light mode. Saved on this device.</p>';
    document.body.appendChild(el);
    el.style.top = (r.bottom + 8) + 'px';
    el.style.left = Math.max(12, Math.min(window.innerWidth - el.offsetWidth - 12, r.right - el.offsetWidth)) + 'px';
    b.setAttribute('aria-expanded', 'true');
    var f = $('.pal-opt[aria-checked="true"]', el); if (f) f.focus({ preventScroll: true });
  }
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
    var e = effTheme(), b = $('#btn-theme');
    b.innerHTML = ic(e === 'dark' ? 'sun' : 'moon');
    b.setAttribute('aria-label', e === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if ($('#pal')) openPal();
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', e === 'dark' ? '#0c1018' : '#eef1f6');
  }

  /* ---------- Display mode: auto | mobile | tab | web ---------- */
  var MODES = ['auto', 'mobile', 'tab', 'web'], MODE_NAME = { auto: 'Auto', mobile: 'Mobile', tab: 'Tablet', web: 'Web' };
  function detectMode() {
    var w = window.innerWidth, touch = false;
    try { touch = matchMedia('(pointer: coarse)').matches; } catch (e) {}
    if (w < 720) return 'mobile';
    if (w < 1100 || (touch && w < 1400)) return 'tab';
    return 'web';
  }
  function applyMode() {
    var pref = LV.store.get('mode', 'auto'); if (MODES.indexOf(pref) < 0) pref = 'auto';
    var eff = pref === 'auto' ? detectMode() : pref, b = $('#btn-mode');
    document.documentElement.setAttribute('data-mode', eff);
    b.innerHTML = ic(eff === 'tab' ? 'tablet' : eff) + '<small' + (pref === 'auto' ? ' class="auto"' : '') + '>' + (pref === 'auto' ? 'Auto' : MODE_NAME[pref]) + '</small>';
    b.setAttribute('aria-label', 'Display mode: ' + MODE_NAME[pref] + (pref === 'auto' ? ' (detected ' + MODE_NAME[eff] + ')' : '') + '. Tap to change.');
    measure();
  }

  /* ---------- Layout: fixed header + bottom nav, measured ---------- */
  function measure() {
    var h = $('#hdr').offsetHeight, b = $('#bnav').offsetHeight, p = $('#player');
    document.documentElement.style.setProperty('--hdr-h', h + 'px');
    document.documentElement.style.setProperty('--bnav-h', b + 'px');
    document.documentElement.style.setProperty('--pl-h', (!p.hidden && !p.classList.contains('mini') ? p.offsetHeight + 8 : 0) + 'px');
  }


  /* ---------- Quick jump: animated buttons under the search bar that scroll to a section of the current page ---------- */
  var jumpEls = [], jumpBtns = [], spyRaf = 0;
  var HOME_JUMPS = [
    ['Top', 'home', '.hero'], ['Start here', 'list', '#path'], ['Ideas', 'book', '#explore'], ['Folder', 'folder', '#ex-tree'], ['Terminal', 'term', '#ex-term'],
    ['Challenges', 'flask', '#ex-chal'], ['A-Z', 'search', '.az-card'], ['Learning path', 'grid', '#sec-grid'], ['Games & labs', 'play', '.lab-strip']
  ];
  function jumpTargets(r) {
    var out = [];
    if (r.v === 'home') {
      HOME_JUMPS.forEach(function (j) { var el = $(j[2], view); if (el) out.push({ t: j[0], i: j[1], el: el }); });
    } else if (r.v !== 'term') {
      var first = view.firstElementChild;
      if (first) out.push({ t: 'Top', i: 'home', el: first });
      var seen = {};
      $$('h2, .quiz, #lab-host, .learn-sec, .topic-list, .tryit, h3', view).forEach(function (el) {
        if (el.matches('.topic-list') && r.v !== 'section') return;
        if (el.matches('h3') && (r.v !== 'topic' || el.closest('.quiz'))) return;
        var b = el.matches('.learn-sec') ? $('b', el) : null;
        var label = el.matches('.quiz') ? 'Quiz' : el.matches('.topic-list') ? 'Topics' : el.matches('#lab-host') ? 'Try it' : el.matches('.demo-box') ? 'Replay' : ((b || el).textContent || '').replace(/\s+/g, ' ').trim();
        if (!label || label.length > 24 || seen[label] || out.length > 16) return; seen[label] = 1;
        out.push({ t: label, i: el.matches('.quiz') ? 'flask' : el.matches('#lab-host') ? 'play' : el.matches('.learn-sec') ? 'book' : 'list', el: el });
      });
    }
    out.sort(function (a, b) { return a.el === b.el ? 0 : (a.el.compareDocumentPosition(b.el) & 4) ? -1 : 1; });
    return out;
  }
  function buildJump(r) {
    var nav = $('#qj'); if (!nav) return;
    var ts = jumpTargets(r);
    jumpEls = ts.map(function (x) { return x.el; });
    if (ts.length < 3) { nav.hidden = true; nav.innerHTML = ''; jumpBtns = []; return; }
    nav.hidden = false;
    nav.innerHTML = ts.map(function (x, k) { return '<button class="qj-b" style="--i:' + k + '" data-j="' + k + '" type="button">' + ic(x.i) + '<span>' + esc(x.t) + '</span></button>'; }).join('');
    jumpBtns = $$('.qj-b', nav);
    nav.scrollLeft = 0;
    spy();
  }
  /* Eased scroll that re-measures its target every frame, so late layout shifts cannot make it land in the wrong place.
     Whichever of requestAnimationFrame or a short timer fires first runs the next step. */
  var scrollTok = 0;
  function nextFrame(fn, tok) {
    var done = false;
    function run() { if (done || tok !== scrollTok) return; done = true; fn(); }
    requestAnimationFrame(run); setTimeout(run, 40);
  }
  function stopScroll() { scrollTok++; }
  function targetY(el) { return Math.max(0, Math.round(el.getBoundingClientRect().top + window.pageYOffset - $('#hdr').offsetHeight - 10)); }
  function animateTo(el, done) {
    var tok = ++scrollTok, from = window.pageYOffset, t0 = performance.now(), dist = Math.abs(targetY(el) - from);
    if (LV.reduced() || dist < 2) { window.scrollTo(0, targetY(el)); if (done) done(); return; }
    var dur = Math.min(1100, 420 + dist / 5);
    function step() {
      var p = Math.min(1, (performance.now() - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2, to = targetY(el);
      window.scrollTo(0, from + (to - from) * e);
      if (p < 1) nextFrame(step, tok); else { window.scrollTo(0, targetY(el)); if (done) done(); }
    }
    nextFrame(step, tok);
  }
  LV.jumpTargets = function () { return jumpEls.slice(); };
  function jumpTo(k) {
    var el = jumpEls[k]; if (!el || !el.isConnected) return;
    var b = jumpBtns[k];
    if (b) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    jumpBtns.forEach(function (x, xi) { x.classList.toggle('going', xi === k); });
    animateTo(el, function () {
      jumpBtns.forEach(function (x) { x.classList.remove('going'); });
      el.classList.remove('qj-flash'); void el.offsetWidth; el.classList.add('qj-flash');
      setTimeout(function () { el.classList.remove('qj-flash'); }, 1400);
      spy();
    });
  }
  function spy() {
    spyRaf = 0;
    var pg = $('#qj-prog'), max = document.documentElement.scrollHeight - window.innerHeight;
    if (pg) pg.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.pageYOffset / max) : 0) + ')';
    if (!jumpBtns.length) return;
    var line = $('#hdr').offsetHeight + 24, cur = 0;
    var bestTop = -1e9;
    jumpEls.forEach(function (el, k) { if (!el.isConnected) return; var tp = el.getBoundingClientRect().top; if (tp <= line && tp > bestTop) { bestTop = tp; cur = k; } });
    if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4) cur = jumpEls.length - 1;
    jumpBtns.forEach(function (b, k) { var on = k === cur; if (b.classList.contains('on') !== on) { b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); } });
    var onb = jumpBtns[cur], nav = $('#qj');
    if (onb && nav && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: onb.offsetLeft - nav.clientWidth / 2 + onb.offsetWidth / 2, behavior: LV.reduced() ? 'auto' : 'smooth' });
  }

  /* ---------- Stats ---------- */
  function stats() {
    var topics = 0, cmds = 0, anims = 0;
    LV.sections.forEach(function (s) { s.topics.forEach(function (t) { topics++; cmds += (t.cmds || []).length; if (t.anim) anims++; }); });
    return { sections: LV.sections.length, topics: topics, commands: cmds, labs: Object.keys(LV.labs).filter(function (k) { return !LV.labs[k].game; }).length, anims: anims };
  }
  function flatTopics() { var a = []; LV.sections.forEach(function (s) { s.topics.forEach(function (t) { a.push(t); }); }); return a; }

  /* ---------- Router ---------- */
  function parse(h) {
    h = (h || '').replace(/^#/, '');
    if (!h || h === 'home') return { v: 'home' };
    if (h === 'learn' || h === 'term' || h === 'labs' || h === 'az') return { v: h };
    var m;
    if ((m = h.match(/^s-(.+)$/)) && LV.byId[m[1]]) return { v: 'section', id: m[1] };
    if ((m = h.match(/^t-(.+?)(?:--(explain|visual|commands|live))?$/)) && LV.topics[m[1]]) return { v: 'topic', id: m[1], tab: m[2] };
    if ((m = h.match(/^lab-(.+)$/)) && LV.labs[m[1]]) return { v: 'lab', id: m[1] };
    return { v: 'home' };
  }
  function key(r) { return r.v === 'home' ? 'home' : r.v === 'section' ? 's-' + r.id : r.v === 'topic' ? 't-' + r.id + (r.tab ? '--' + r.tab : '') : r.v === 'lab' ? 'lab-' + r.id : r.v; }
  function go(target, opts) {
    opts = opts || {};
    var r = typeof target === 'string' ? parse(target) : target, k = key(r);
    var same = route && key(route) === k;
    route = r;
    if (!opts.fromHash) {
      try {
        if (('#' + k) !== location.hash) {
          if (opts.replace && history.replaceState) history.replaceState(null, '', '#' + k);
          else location.hash = k;
        }
      } catch (e) {}
    }
    render(opts);
    if (!same && !opts.keepScroll) window.scrollTo(0, 0);
    closeResults();
  }
  function onHash() { var r = parse(location.hash); if (route && key(r) === key(route)) return; go(r, { fromHash: true }); }

  /* ---------- Render ---------- */
  function render(opts) {
    cleanup.forEach(function (f) { try { f(); } catch (e) {} }); cleanup = [];
    var r = route;
    $$('#bnav button').forEach(function (b) {
      var on = b.dataset.go === (r.v === 'section' || r.v === 'topic' || r.v === 'az' ? 'learn' : r.v === 'lab' ? 'labs' : r.v);
      b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    var html = r.v === 'home' ? vHome() : r.v === 'learn' ? vLearn() : r.v === 'section' ? vSection(r.id) : r.v === 'topic' ? vTopic(r.id, r.tab) : r.v === 'term' ? vTerm() : r.v === 'az' ? LV.az.html() : r.v === 'labs' ? vLabs() : r.v === 'lab' ? vLab(r.id) : vHome();
    view.innerHTML = html + footer();
    view.dataset.v = r.v; LV.logoMotion();
    after(r, opts);
    buildJump(r);
    measure();
  }

  function footer() {
    return '<footer id="footer" class="foot"><div class="foot-brand">' + mark(22) + '<b>Linuxverse</b> <span class="muted">v' + LV.VERSION + '</span></div>' +
      '<p>Created by SSK-BLUM · Works offline once installed.</p>' +
      '<p class="foot-links"><a class="report" href="mailto:soorajsknairqa@gmail.com?subject=' + encodeURIComponent('Linuxverse v' + LV.VERSION + ' feedback') + '">' + ic('flag') + ' Report a mistake</a><button class="link sm" id="btn-reset-progress">Reset my progress</button></p>' +
      '<p class="muted sm">Simulated output: nothing runs on your device. Linux® is the registered trademark of Linus Torvalds. Ubuntu, Debian, Fedora, Red Hat, Arch Linux and openSUSE are trademarks of their respective owners. This is an unofficial learning reference.</p>' +
      '<button class="btn ghost sm" id="btn-install" hidden>' + ic('download') + ' Install app</button></footer>';
  }
  function mark(s) { return LV.logoSvg(s); }


  function vHome() {
    var s = stats();
    return '<section class="hero">' +
      '<canvas id="hero-bg" aria-hidden="true"></canvas>' +
      '<div class="hero-in"><p class="eyebrow">An interactive Linux course</p>' +
      '<h1 class="hero-t">Linux<span>verse</span></h1>' +
      '<p class="hero-s">Everything about Linux, explained with animated diagrams, live labs and a terminal you can break safely.</p>' +
      '<div class="hero-term" id="hero-term"></div>' +
      '<div class="cta"><button class="btn" id="cta-theory">' + ic('book') + ' Start with theory</button><button class="btn ghost" data-go="term">' + ic('term') + ' Open terminal</button></div>' +
      '<dl class="stats">' + [['topics', 'Topics'], ['commands', 'Commands'], ['anims', 'Animations'], ['labs', 'Live labs']].map(function (k) { return '<div><dt>' + k[1] + '</dt><dd class="mono" data-count="' + s[k[0]] + '">' + s[k[0]] + '</dd></div>'; }).join('') + '</dl></div></section>' +
      LV.learn.contHtml() +
      LV.explore.html() +
      LV.learn.pathHtml() +
      LV.az.card() +
      '<section class="block"><div class="block-h"><h2>Learning path</h2><button class="link" data-go="learn">All topics ' + ic('chev') + '</button></div>' +
      '<div class="sec-grid" id="sec-grid">' + LV.sections.map(function (sec, i) {
        return '<button class="sec-card" style="--h:' + sec.hue + '" data-go="s-' + sec.id + '"><span class="sec-n mono">' + ('0' + (i + 1)).slice(-2) + '</span><span class="sec-ic">' + ic(sec.icon) + '</span><b>' + esc(sec.title) + '</b><small>' + esc(sec.desc) + '</small><span class="sec-c">' + sec.topics.length + ' topics' + (LV.learn.secDone(sec) ? ' · ' + LV.learn.secDone(sec) + ' done' : '') + '</span></button>';
      }).join('') + '</div></section>' +
      '<section class="block"><div class="block-h"><h2>Games and live labs</h2><button class="link" data-go="labs">All ' + ic('chev') + '</button></div><div class="lab-strip">' +
      Object.keys(LV.labs).map(function (k) { var l = LV.labs[k]; return '<button class="lab-chip" data-go="lab-' + k + '">' + ic(l.game ? 'play' : 'flask') + '<b>' + esc(l.title) + '</b><small>' + esc(l.desc) + '</small></button>'; }).join('') + '</div></section>';
  }

  function topicBadges(t) {
    return (t.anim ? '<span class="badge b-vis">Visual</span>' : '') + (t.live ? '<span class="badge b-live">Live</span>' : '');
  }
  function topicRow(t, i) {
    var d = LV.learn.isDone('t:' + t.id);
    return '<button class="topic-row' + (d ? ' done' : '') + '" data-go="t-' + t.id + '"><span class="tr-n mono">' + (d ? ic('check') : i + 1) + '</span><span class="tr-b"><b>' + esc(t.title) + '</b><small>' + esc(t.sum) + '</small><span class="tr-badges">' + topicBadges(t) + '<span class="badge">' + (t.cmds || []).length + ' cmds</span></span></span>' + ic('chev') + '</button>';
  }
  function vLearn() {
    return '<div class="page"><h1 class="pg-t">Learn</h1><p class="muted">' + LV.sections.length + ' sections, in the order we recommend. Tap a topic to open it.</p>' + LV.az.card() +
      (LV.learn.bms().length ? '<section class="learn-sec" id="saved"><div class="ls-h static"><span class="sec-n mono">' + ic('starf') + '</span><span><b>Saved</b><small>Topics you starred</small></span></div><div class="topic-list">' + LV.learn.bms().map(function (id, i) { return topicRow(LV.topics[id], i); }).join('') + '</div></section>' : '') +
      LV.sections.map(function (s, i) {
        return '<section class="learn-sec" style="--h:' + s.hue + '"><button class="ls-h" data-go="s-' + s.id + '"><span class="sec-n mono">' + ('0' + (i + 1)).slice(-2) + '</span><span><b>' + esc(s.title) + '</b><small>' + esc(s.desc) + '</small></span></button><div class="topic-list">' + s.topics.map(topicRow).join('') + '</div></section>';
      }).join('') + '</div>';
  }
  function vSection(id) {
    var s = LV.byId[id], i = LV.sections.indexOf(s);
    return '<div class="page" style="--h:' + s.hue + '"><button class="back" data-go="learn">' + ic('back') + ' Learn</button>' +
      '<p class="eyebrow">Section ' + (i + 1) + ' of ' + LV.sections.length + '</p><h1 class="pg-t">' + esc(s.title) + '</h1><p class="lead">' + esc(s.desc) + '</p>' +
      '<div class="ex-prog sec-prog"><span class="mono">' + LV.learn.secDone(s) + ' of ' + s.topics.length + ' topics done</span><span class="ex-bar"><i style="width:' + (LV.learn.secDone(s) / s.topics.length * 100) + '%"></i></span></div>' +
      '<div class="topic-list">' + s.topics.map(topicRow).join('') + '</div>' + LV.learn.quizHtml(id) + '</div>';
  }

  function vTopic(id, tab) {
    var t = LV.topics[id], s = LV.byId[t.sec];
    var tabs = TABS.filter(function (x) { return x[0] !== 'visual' || t.anim; });
    tab = tab && tabs.some(function (x) { return x[0] === tab; }) ? tab : 'explain';
    route._tab = tab;
    LV.learn.last(id);
    var all = flatTopics(), i = all.indexOf(t), prev = all[i - 1], next = all[i + 1];
    var body = '';
    if (tab === 'explain') {
      body = '<div class="explain prose">' + t.explain.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>' +
        (t.terms ? '<h3 class="sub">Key terms</h3><dl class="terms">' + t.terms.map(function (x) { return '<div><dt class="mono">' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
        tryIt(t) +
        (t.table ? table(t.table) : '') +
        (t.code ? '<h3 class="sub">Example</h3><div class="codebox"><button class="ibtn sm copy-cmd" data-cmd="' + esc(t.code) + '" aria-label="Copy code">' + ic('copy') + '</button><pre class="mono">' + esc(t.code) + '</pre></div>' : '') +
        notes(t) +
        '<div class="next-tabs">' + tabs.filter(function (x) { return x[0] !== 'explain'; }).map(function (x) { return '<button class="btn ghost sm" data-go="t-' + id + '--' + x[0] + '">' + x[1] + ' ' + ic('chev') + '</button>'; }).join('') + '</div>';
    } else if (tab === 'visual') {
      body = '<div class="anim" id="anim-host"></div><p class="muted sm">Tap a dot to jump to a step. The diagram loops while playing.</p>';
    } else if (tab === 'commands') {
      body = '<div class="cmd-list">' + t.cmds.map(cmdRow).join('') + '</div>' +
        (t.flags ? '<h3 class="sub">Useful flags</h3><div class="tbl-wrap flags"><table><thead><tr><th>Flag</th><th>Meaning</th><th>Tool</th></tr></thead><tbody>' + t.flags.map(function (f) { return '<tr><td class="mono">' + esc(f[0]) + '</td><td>' + esc(f[1]) + '</td><td class="mono muted">' + esc(f[2] || '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '');
    } else {
      var lab = t.live && LV.labs[t.live];
      var demo = t.demo || t.cmds.filter(function (c) { return c[2]; }).slice(0, 2).map(function (c) { return c[0]; });
      body = (lab ? '<div class="lab"><div class="lab-top"><h3>' + ic('flask') + esc(lab.title) + '</h3><p class="muted sm">' + esc(lab.desc) + '</p></div><div class="lab-body" id="lab-host"></div></div>' : '') +
        '<div class="demo-box"><div class="demo-h"><h3>' + ic('term') + 'Terminal replay</h3><button class="btn sm" id="demo-play">' + ic('play') + ' Replay</button></div><div id="demo-term"></div>' +
        '<p class="muted sm">Replays: <span class="mono">' + demo.map(esc).join(' → ') + '</span></p></div>';
      route._demo = demo;
    }
    return '<div class="page topic" style="--h:' + s.hue + '">' +
      '<button class="back" data-go="s-' + s.id + '">' + ic('back') + ' ' + esc(s.title) + '</button>' +
      '<div class="pg-row"><h1 class="pg-t">' + esc(t.title) + '</h1><button class="ibtn bm' + (LV.learn.isBm(id) ? ' on' : '') + '" id="bm-btn" aria-pressed="' + LV.learn.isBm(id) + '" aria-label="Save this topic">' + ic(LV.learn.isBm(id) ? 'starf' : 'star') + '</button></div><p class="lead">' + esc(t.sum) + '</p>' +
      '<div class="tabs" role="tablist">' + tabs.map(function (x) { return '<button role="tab" class="tab' + (x[0] === tab ? ' on' : '') + '" aria-selected="' + (x[0] === tab) + '" data-go="t-' + id + '--' + x[0] + '" data-keep="1">' + x[1] + '</button>'; }).join('') + '</div>' +
      '<div class="tab-body" role="tabpanel">' + body + '</div>' +
      '<div class="topic-end"><button class="btn' + (LV.learn.isDone('t:' + id) ? ' on' : '') + '" id="done-btn" aria-pressed="' + LV.learn.isDone('t:' + id) + '">' + doneLabel(LV.learn.isDone('t:' + id)) + '</button>' +
      '<a class="report" href="mailto:soorajsknairqa@gmail.com?subject=' + encodeURIComponent('Linuxverse mistake in: ' + t.title) + '">' + ic('flag') + ' Report a mistake</a></div>' +
      '<nav class="pn-nav">' + (prev ? '<button class="pn" data-go="t-' + prev.id + '"><small>Previous</small><b>' + esc(prev.title) + '</b></button>' : '<span></span>') +
      (next ? '<button class="pn nx" data-go="t-' + next.id + '"><small>Next</small><b>' + esc(next.title) + '</b></button>' : '') + '</nav></div>';
  }
  function doneLabel(d) { return d ? ic('check') + ' Done. Tap to undo' : ic('check') + ' Mark as done'; }
  /* "Try it": theory first, then use it. Three commands run in a safe shell that already has ~/website */
  function tryIt(t) {
    var seen = {}, list = (t.demo || []).concat((t.cmds || []).filter(function (c) { return c[2]; }).map(function (c) { return c[0]; })).concat((t.cmds || []).map(function (c) { return c[0]; }))
      .filter(function (c) { if (seen[c] || /^sudo\s+(rm|reboot|shutdown)|\brm\s+-rf|\bmkfs|\bdd\s/.test(c)) return false; seen[c] = 1; return true; }).slice(0, 3);
    if (!list.length) return '';
    return '<div class="tryit" id="tryit"><h3 class="sub">Try it now</h3><p class="muted sm">Tap Run to use what you just read. This is a safe practice shell that already contains the example folder <span class="mono">~/website</span>.</p>' +
      '<div class="ex-cmds">' + list.map(function (c) { return '<div class="ex-cmd"><code class="mono">' + esc(c) + '</code><button class="btn sm ti-run" data-c="' + esc(c) + '">' + ic('run') + ' Run</button><button class="ibtn sm copy-cmd" data-cmd="' + esc(c) + '" aria-label="Copy command">' + ic('copy') + '</button></div>'; }).join('') + '</div>' +
      '<div id="tryit-term"></div></div>';
  }
  function notes(t) {
    return (t.tips || []).map(function (x) { return '<div class="callout tip"><b>Tip</b><p>' + x + '</p></div>'; }).join('') +
      (t.warn || []).map(function (x) { return '<div class="callout warn"><b>Careful</b><p>' + x + '</p></div>'; }).join('') +
      (t.note ? '<div class="callout note"><b>Distro differences</b><p>' + t.note + '</p></div>' : '');
  }
  function table(tb) {
    return '<div class="tbl-wrap"><table><thead><tr>' + tb.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      tb.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i === 0 ? ' class="mono"' : '') + '>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function cmdRow(c) {
    return '<div class="cmd-row" data-cmd="' + esc(c[0]) + '"><div class="cmd-top"><code class="mono">' + highlight(c[0]) + '</code>' + (c[3] ? '<span class="badge distro">' + esc(c[3]) + '</span>' : '') + '</div>' +
      '<p class="cmd-desc">' + esc(c[1]) + '</p>' +
      '<div class="cmd-acts"><button class="btn sm run" data-cmd="' + esc(c[0]) + '">' + ic('run') + ' Run</button>' +
      '<button class="ibtn sm copy-cmd" data-cmd="' + esc(c[0]) + '" aria-label="Copy command">' + ic('copy') + '</button>' +
      '<button class="ibtn sm to-term" data-cmd="' + esc(c[0]) + '" aria-label="Open in terminal">' + ic('term') + '</button></div><div class="cmd-res" hidden></div></div>';
  }
  /* Colour the parts of a command: tool, flags, strings, operators */
  function highlight(cmd) {
    var first = true;
    return cmd.split(/(\s+|\|\||&&|[|;]|"[^"]*"|'[^']*')/).map(function (p) {
      if (!p) return '';
      if (/^\s+$/.test(p)) return p;
      if (/^(\||\|\||&&|;)$/.test(p)) { first = true; return '<span class="h-op">' + esc(p) + '</span>'; }
      if (/^["']/.test(p)) return '<span class="h-str">' + esc(p) + '</span>';
      if (first) { first = p === 'sudo'; return '<span class="h-cmd">' + esc(p) + '</span>'; }
      if (/^-/.test(p)) return '<span class="h-flag">' + esc(p) + '</span>';
      if (/^[>]{1,2}$|^2>/.test(p)) return '<span class="h-op">' + esc(p) + '</span>';
      return esc(p);
    }).join('');
  }

  function vTerm() {
    var quick = ['help', 'ls -la', 'cat notes.txt', 'cat access.log | grep 404 | wc -l', './deploy.sh', 'chmod +x deploy.sh', 'bash scripts/hello.sh ssk', 'sudo -i', 'tree -L 1 /var', 'history'];
    return '<div class="page term-page"><h1 class="pg-t">Terminal</h1><p class="muted sm">A safe simulated Ubuntu shell. Try anything; reload the page to start fresh.</p>' +
      '<div id="term-main"></div>' +
      '<div class="quick" id="quick">' + quick.map(function (q) { return '<button class="chip mono" data-run="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' +
      '<details class="tb" id="tb-wrap" open><summary>' + ic('list') + ' Command browser <span class="muted" id="tb-count"></span></summary>' +
      '<div class="tb-chips" id="tb-chips"><button class="chip on" data-sec="">All</button>' + LV.sections.map(function (s) { return '<button class="chip" data-sec="' + s.id + '">' + esc(s.title) + '</button>'; }).join('') + '</div>' +
      '<div class="tb-filter"><label class="search">' + ic('search') + '<input id="tb-q" placeholder="Filter commands, Enter runs the first" autocomplete="off" spellcheck="false" aria-label="Filter commands"></label><button class="btn sm" id="tb-run">' + ic('run') + ' Run</button></div>' +
      '<ul class="tb-list" id="tb-list"></ul></details></div>';
  }
  function vLabs() {
    function cards(isGame) {
      return Object.keys(LV.labs).filter(function (k) { return !!LV.labs[k].game === isGame; }).map(function (k) {
        var l = LV.labs[k], done = LV.learn.isDone('l:' + k), bs = isGame ? (LV.store.get('games', {}) || {})[k] : null;
        return '<button class="lab-card' + (isGame ? ' game' : '') + '" data-go="lab-' + k + '">' + ic(isGame ? 'play' : 'flask') + '<b>' + esc(l.title.replace(/^Game:\s*/, '')) + '</b><small>' + esc(l.desc) + '</small>' + (done ? '<span class="badge">played</span>' : '') + '</button>';
      }).join('');
    }
    return '<div class="page"><h1 class="pg-t">Games</h1><p class="muted">Short study games. Each one practises a skill and keeps your best score on this device.</p><div class="lab-index" id="games-index">' + cards(true) + '</div>' +
      '<h2 class="pg-t" style="margin-top:28px">Live labs</h2><p class="muted">Interactive tools that compute real answers. Each one links to the topic it belongs to.</p><div class="lab-index">' + cards(false) + '</div></div>';
  }
  function vLab(id) {
    var l = LV.labs[id], t = LV.topics[l.topic];
    LV.learn.setDone('l:' + id, true);
    return '<div class="page"><button class="back" data-go="labs">' + ic('back') + ' Labs</button><h1 class="pg-t">' + esc(l.title) + '</h1><p class="lead">' + esc(l.desc) + '</p>' +
      '<div class="lab"><div class="lab-body" id="lab-host"></div></div>' +
      (t ? '<button class="btn ghost" data-go="t-' + t.id + '">' + ic('book') + ' Learn the topic: ' + esc(t.title) + '</button>' : '') + '</div>';
  }

  /* ---------- After render: mount interactive parts ---------- */
  function after(r) {
    if (r.v === 'home') { heroFx(); LV.explore.mount($('#explore')); }
    if (r.v === 'section') LV.learn.quizMount($('#quiz'), r.id);
    if (r.v === 'topic' && r._tab === 'explain' && $('#tryit-term')) tryTerm = LV.TermUI($('#tryit-term'), { shell: shellFor(r.id), mini: true });
    if (r.v === 'topic') {
      var t = LV.topics[r.id];
      if (r._tab === 'visual' && t.anim) { var a = LV.anim($('#anim-host'), t.anim); cleanup.push(a.stop); }
      if (r._tab === 'live') {
        if (t.live && LV.labs[t.live]) LV.labs[t.live].render($('#lab-host'));
        var dt = LV.TermUI($('#demo-term'), { readonly: true, mini: true });
        $('#demo-play').onclick = function () { var nt = LV.TermUI($('#demo-term'), { readonly: true, mini: true }); dt = nt; route._demo.reduce(function (p, c) { return p.then(function () { return nt.run(c, true); }); }, Promise.resolve()); };
        route._demo.reduce(function (p, c) { return p.then(function () { return dt.run(c, true); }); }, Promise.resolve());
      }
      if (r._tab === 'commands' && r.focus) {
        var row = $$('.cmd-row').filter(function (x) { return x.dataset.cmd === r.focus; })[0];
        if (row) { setTimeout(function () { row.scrollIntoView({ block: 'center' }); row.classList.add('flash'); }, 60); }
        r.focus = null;
      }
    }
    if (r.v === 'lab') LV.labs[r.id].render($('#lab-host'));
    if (r.v === 'term') mountTerm();
    if (r.v === 'az') LV.az.mount();
    var ib = $('#btn-install'); if (ib && deferredInstall) { ib.hidden = false; ib.onclick = doInstall; }
  }

  var topicShells = {}, tryTerm = null;
  function shellFor(id) { return topicShells[id] || (topicShells[id] = new LV.Shell()); }

  function mountTerm() {
    var host = $('#term-main');
    var shell = mainTerm ? mainTerm.shell : new LV.Shell();
    var hadHistory = !!mainTerm;
    mainTerm = LV.TermUI(host, { shell: shell, inId: 'term-in', outId: 'term-out', welcome: hadHistory ? null : 'Welcome to the Linuxverse shell. Type help to begin. Tab completes, ↑/↓ recall history.' });
    // command browser
    var sec = '', list = $('#tb-list'), q = $('#tb-q');
    function items() {
      var f = q.value.toLowerCase();
      return LV.docIndex().list.filter(function (c) { return (!sec || c.sec === sec) && (!f || (c.cmd + ' ' + c.desc).toLowerCase().indexOf(f) >= 0); });
    }
    function paint() {
      var it = items();
      $('#tb-count').textContent = '(' + it.length + ')';
      list.innerHTML = it.slice(0, 80).map(function (c) { return '<li><button data-run="' + esc(c.cmd) + '"><code class="mono">' + highlight(c.cmd) + '</code><small>' + esc(c.desc) + '</small></button></li>'; }).join('') + (it.length > 80 ? '<li class="muted sm">Showing 80 of ' + it.length + '. Filter to narrow down.</li>' : '') || '<li class="muted sm">No commands match. Press Run to try it anyway.</li>';
    }
    function runFilter() {
      var it = items(), v = q.value.trim();
      var cmd = it.length && v && it[0].cmd.toLowerCase().indexOf(v.toLowerCase()) === 0 ? it[0].cmd : v || (it[0] && it[0].cmd);
      if (cmd) { mainTerm.run(cmd, true); host.scrollIntoView({ block: 'start', behavior: LV.reduced() ? 'auto' : 'smooth' }); }
    }
    $('#tb-chips').onclick = function (e) { var b = e.target.closest('[data-sec]'); if (!b) return; sec = b.dataset.sec; $$('#tb-chips .chip').forEach(function (x) { x.classList.toggle('on', x === b); }); paint(); };
    q.addEventListener('input', paint);
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); runFilter(); } });
    $('#tb-run').addEventListener('click', runFilter);
    paint();
    if (pendingTerm) { var c = pendingTerm; pendingTerm = null; setTimeout(function () { mainTerm.run(c, true); }, 150); }
  }
  var pendingTerm = null;
  function toTerm(cmd) { pendingTerm = cmd; go('term'); }

  /* ---------- Hero: animated background + typing terminal ---------- */
  function heroFx() {
    var cv = $('#hero-bg'), ctx2 = cv.getContext('2d'), raf, t0 = performance.now();
    var words = ['ls -la', 'grep', 'chmod 755', 'systemctl', 'awk', 'ssh', 'ip a', 'tar -czf', 'sudo', 'journalctl', 'ps aux', 'kill -9', 'df -h', 'find /', 'sed', 'curl', 'mount', 'cron', '| sort', 'uniq -c'];
    var cols = [];
    function size() { cv.width = cv.clientWidth * devicePixelRatio; cv.height = cv.clientHeight * devicePixelRatio; }
    size();
    for (var i = 0; i < 14; i++) cols.push({ x: Math.random(), y: Math.random(), s: 0.15 + Math.random() * 0.35, w: words[i % words.length] });
    function frame(now) {
      var w = cv.width, h = cv.height, st = getComputedStyle(document.documentElement), dt = (now - t0) / 1000;
      ctx2.clearRect(0, 0, w, h);
      var acc = st.getPropertyValue('--accent').trim(), acc2 = st.getPropertyValue('--accent2').trim(), grid = st.getPropertyValue('--line').trim();
      // drifting perspective grid
      ctx2.strokeStyle = grid; ctx2.lineWidth = 1 * devicePixelRatio; ctx2.globalAlpha = 0.55;
      var gs = 34 * devicePixelRatio, off = (dt * 12 * devicePixelRatio) % gs;
      for (var gx = -gs + off; gx < w; gx += gs) { ctx2.beginPath(); ctx2.moveTo(gx, 0); ctx2.lineTo(gx, h); ctx2.stroke(); }
      for (var gy = -gs + off; gy < h; gy += gs) { ctx2.beginPath(); ctx2.moveTo(0, gy); ctx2.lineTo(w, gy); ctx2.stroke(); }
      // orbs
      [[0.82, 0.18, acc, 0.9], [0.12, 0.75, acc2, 1.3]].forEach(function (o, i) {
        var x = (o[0] + Math.sin(dt * 0.2 * o[3] + i) * 0.06) * w, y = (o[1] + Math.cos(dt * 0.17 * o[3]) * 0.07) * h, r = Math.min(w, h) * 0.45;
        var g = ctx2.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, o[2]); g.addColorStop(1, 'transparent');
        ctx2.globalAlpha = 0.16; ctx2.fillStyle = g; ctx2.fillRect(0, 0, w, h);
      });
      // command stream
      ctx2.font = (11 * devicePixelRatio) + 'px "IBM Plex Mono", ui-monospace, monospace';
      cols.forEach(function (c) {
        c.y += c.s * 0.0009; if (c.y > 1.05) { c.y = -0.05; c.x = Math.random(); }
        ctx2.globalAlpha = 0.22; ctx2.fillStyle = acc2; ctx2.fillText(c.w, c.x * w, c.y * h);
      });
      ctx2.globalAlpha = 1;
      if (cv.isConnected && !LV.reduced()) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', size);
    cleanup.push(function () { cancelAnimationFrame(raf); window.removeEventListener('resize', size); });
    // typing demo
    var ht = LV.TermUI($('#hero-term'), { readonly: true, mini: true }), alive = true;
    var script = ['whoami', 'uname -r', 'cat access.log | grep 404 | wc -l', 'ls -l deploy.sh', 'chmod 750 deploy.sh', 'ls -l deploy.sh', 'free -h'];
    var out = $('#hero-term .term-out');
    function loop(i) {
      if (!alive || !out.isConnected) return;
      if (i % script.length === 0) { ht.clear(); ht.shell = new LV.Shell(); }
      ht.run(script[i % script.length], true).then(function () { setTimeout(function () { loop(i + 1); }, 1200); });
    }
    loop(0);
    cleanup.push(function () { alive = false; });
    // count-up stats
    if (!LV.reduced()) $$('[data-count]').forEach(function (d) {
      var n = +d.dataset.count, s = performance.now();
      (function step(now) { var p = Math.min(1, (now - s) / 1100); d.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1 && d.isConnected) requestAnimationFrame(step); })(s);
    });
  }

  /* ---------- Search ---------- */
  function searchIndex(q) {
    q = q.toLowerCase().trim();
    if (!q) return null;
    var words = q.split(/\s+/);
    function match(s) { s = s.toLowerCase(); return words.every(function (w) { return s.indexOf(w) >= 0; }); }
    var topics = flatTopics().filter(function (t) { return match(t.title + ' ' + t.sum + ' ' + t.explain.join(' ').replace(/<[^>]+>/g, '')); }).slice(0, 6);
    var cmds = LV.docIndex().list.filter(function (c) { return match(c.cmd + ' ' + c.desc); }).slice(0, 10);
    var labs = Object.keys(LV.labs).map(function (k) { return LV.labs[k]; }).filter(function (l) { return match(l.title + ' ' + l.desc); }).slice(0, 3);
    return { topics: topics, cmds: cmds, labs: labs, az: LV.az.find(q).slice(0, 4) };
  }
  function showResults() {
    var q = $('#q').value, r = searchIndex(q), box = $('#results');
    if (!r) { closeResults(); return; }
    var n = r.topics.length + r.cmds.length + r.labs.length + r.az.length;
    box.innerHTML = !n ? '<p class="muted sm r-empty">No results for “' + esc(q) + '”. Try a command name like grep or a word like permissions.</p>' :
      (r.topics.length ? '<h4>Topics</h4>' + r.topics.map(function (t) { return '<button class="r-item" data-go="t-' + t.id + '"><b>' + esc(t.title) + '</b><small>' + esc(LV.byId[t.sec].title) + ' · ' + esc(t.sum) + '</small></button>'; }).join('') : '') +
      (r.cmds.length ? '<h4>Commands</h4>' + r.cmds.map(function (c) { return '<button class="r-item" data-cmdgo="' + esc(c.topic) + '" data-cmd="' + esc(c.cmd) + '"><code class="mono">' + highlight(c.cmd) + '</code><small>' + esc(c.desc) + '</small></button>'; }).join('') : '') +
      (r.az.length ? '<h4>A–Z</h4>' + r.az.map(function (a) { return '<button class="r-item" data-go="az" data-azq="' + esc(a.t) + '"><b class="mono">' + esc(a.t) + '</b><small>' + esc(a.d) + '</small></button>'; }).join('') : '') +
      (r.labs.length ? '<h4>Labs</h4>' + r.labs.map(function (l) { return '<button class="r-item" data-go="lab-' + l.id + '"><b>' + esc(l.title) + '</b><small>' + esc(l.desc) + '</small></button>'; }).join('') : '');
    box.hidden = false;
    $('#q').setAttribute('aria-expanded', 'true');
  }
  function closeResults() { var b = $('#results'); if (b) b.hidden = true; var q = $('#q'); if (q) q.setAttribute('aria-expanded', 'false'); }

  /* ---------- Install (PWA) ---------- */
  var deferredInstall = null;
  function doInstall() { if (!deferredInstall) return; deferredInstall.prompt(); deferredInstall.userChoice.then(function () { deferredInstall = null; var b = $('#btn-install'); if (b) b.hidden = true; }); }

  /* ---------- Boot ---------- */
  function boot() {
    view = $('#view');
    $('#logo').insertAdjacentHTML('afterbegin', LV.logoSvg(30));
    LV.docIndex();
    applyTheme(LV.store.get('theme', null));
    try { matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () { applyTheme(LV.store.get('theme', null)); }); } catch (e) {}
    $('#btn-theme').onclick = function () { var t = effTheme() === 'dark' ? 'light' : 'dark'; LV.store.set('theme', t); applyTheme(t); };
    applyPalette(curPalette());
    applyMode();
    $('#btn-mode').onclick = function () {
      var cur = LV.store.get('mode', 'auto'), nx = MODES[(MODES.indexOf(cur) + 1) % MODES.length];
      LV.store.set('mode', nx); applyMode();
      LV.toast('Mode: ' + MODE_NAME[nx] + (nx === 'auto' ? ' (' + MODE_NAME[detectMode()] + ')' : ''));
    };
    window.addEventListener('resize', applyMode); window.addEventListener('orientationchange', applyMode);
    $('#btn-palette').onclick = function (e) { e.stopPropagation(); $('#pal') ? closePal() : openPal(); };
    document.addEventListener('click', function (e) {
      var o = e.target.closest('.pal-opt');
      if (o) { LV.store.set('palette', o.dataset.p); applyPalette(o.dataset.p); closePal(); LV.toast('Palette: ' + o.textContent.trim()); return; }
      if ($('#pal') && !e.target.closest('#pal') && !e.target.closest('#btn-palette')) closePal();
    });
    $('#qj').addEventListener('click', function (e) { var b = e.target.closest('.qj-b'); if (b) jumpTo(+b.dataset.j); });
    window.addEventListener('scroll', function () { if (!spyRaf) { spyRaf = 1; requestAnimationFrame(spy); setTimeout(function () { if (spyRaf) spy(); }, 80); } }, { passive: true });
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, stopScroll, { passive: true }); });
    $('#btn-help').onclick = function () { LV.help.isOpen() ? LV.help.close() : LV.help.open(); };
    $('#btn-music').onclick = function () { LV.amb.toggle(); };
    LV.amb.init(); LV.help.init();

    // global delegated clicks (in-app router: never rely on raw # links)
    document.addEventListener('change', function (e) {
      if (!e.target || e.target.id !== 'path-sel' || e.target.value === '') return;
      var st = LV.learn.path[+e.target.value]; e.target.value = '';
      if (!st) return;
      if (st.concept) { if (route.v === 'home') LV.explore.open(st.concept); else { go('home'); setTimeout(function () { LV.explore.open(st.concept); }, 120); } }
      else go(st.go);
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a) { e.preventDefault(); go(a.getAttribute('href')); return; }
      var g = e.target.closest('[data-go]');
      if (g) { e.preventDefault(); if (g.dataset.azq) { LV.az.pre = g.dataset.azq; $('#q').value = ''; } go(g.dataset.go, { keepScroll: !!g.dataset.keep }); return; }
      var cg = e.target.closest('[data-cmdgo]');
      if (cg) { var r = parse('t-' + cg.dataset.cmdgo + '--commands'); r.focus = cg.dataset.cmd; go(r); $('#q').value = ''; return; }
      var cp = e.target.closest('.copy-cmd');
      if (cp) { LV.copy(cp.dataset.cmd, cp); return; }
      if (e.target.closest('#cta-theory')) { $('#explore').scrollIntoView({ block: 'start', behavior: LV.reduced() ? 'auto' : 'smooth' }); return; }
      var cn = e.target.closest('[data-concept]');
      if (cn) {
        var cid = cn.dataset.concept;
        if (route.v === 'home') LV.explore.open(cid);
        else { go('home'); setTimeout(function () { LV.explore.open(cid); }, 120); }
        return;
      }
      var tr = e.target.closest('.ti-run');
      if (tr && tryTerm) { tryTerm.run(tr.dataset.c, true); var tb = $('#tryit-term'); if (tb && tb.getBoundingClientRect().bottom > innerHeight) tb.scrollIntoView({ block: 'center', behavior: LV.reduced() ? 'auto' : 'smooth' }); return; }
      var bm = e.target.closest('#bm-btn');
      if (bm && route.v === 'topic') { var on = LV.learn.toggleBm(route.id); bm.classList.toggle('on', on); bm.setAttribute('aria-pressed', String(on)); bm.innerHTML = ic(on ? 'starf' : 'star'); LV.toast(on ? 'Saved. Find it on Home and Learn.' : 'Removed from saved'); return; }
      var db = e.target.closest('#done-btn');
      if (db && route.v === 'topic') { var dn = LV.learn.toggle('t:' + route.id); db.classList.toggle('on', dn); db.setAttribute('aria-pressed', String(dn)); db.innerHTML = doneLabel(dn); if (dn) LV.toast('Topic marked as done'); return; }
      var rp = e.target.closest('#btn-reset-progress');
      if (rp) { if (rp.dataset.sure) { LV.learn.reset(); rp.dataset.sure = ''; rp.textContent = 'Progress cleared'; LV.toast('Progress cleared'); setTimeout(function () { render(); }, 400); } else { rp.dataset.sure = '1'; rp.textContent = 'Tap again to confirm'; setTimeout(function () { if (rp.isConnected) { rp.dataset.sure = ''; rp.textContent = 'Reset my progress'; } }, 3500); } return; }
      var tt = e.target.closest('.to-term');
      if (tt) { toTerm(tt.dataset.cmd); return; }
      var rn = e.target.closest('.cmd-row .run');
      if (rn) {
        var row = rn.closest('.cmd-row'), res = row.querySelector('.cmd-res');
        res.hidden = false;
        if (!res.firstChild) res._t = LV.TermUI(res, { readonly: true, mini: true, shell: shellFor(route.id) });
        res._t.run(rn.dataset.cmd, true);
        return;
      }
      var dr = e.target.closest('[data-run]');
      if (dr && mainTerm) { mainTerm.run(dr.dataset.run, true); $('#term-main').scrollIntoView({ block: 'start', behavior: LV.reduced() ? 'auto' : 'smooth' }); return; }
      if (!e.target.closest('#q-wrap')) closeResults();
    });

    var q = $('#q');
    q.addEventListener('input', showResults);
    q.addEventListener('focus', function () { if (q.value) showResults(); });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var f = $('#results .r-item'); if (f) { e.preventDefault(); f.click(); q.blur(); } }
      if (e.key === 'Escape') { q.value = ''; closeResults(); q.blur(); }
    });

    document.addEventListener('keydown', function (e) {
      var typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '');
      if (e.key === 'Escape' && $('#pal')) { closePal(); $('#btn-palette').focus(); return; }
      if (e.key === 'Escape') { if (LV.help.spotOpen()) LV.help.closeSpot(); else if (LV.help.isOpen()) LV.help.close(); else closeResults(); }
      if (typing) return;
      if (e.key === '/') { e.preventDefault(); q.focus(); }
      if (e.key === '?') { e.preventDefault(); LV.help.open(); }
    });

    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    window.addEventListener('resize', measure);
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; var b = $('#btn-install'); if (b) { b.hidden = false; b.onclick = doInstall; } });
    try { new ResizeObserver(measure).observe($('#hdr')); new ResizeObserver(measure).observe($('#player')); } catch (e) {}

    LV.app = { go: go, measure: measure, toTerm: toTerm, stats: stats, route: function () { return route; } };
    var start = parse(location.hash);
    go(start, { fromHash: true });

    // service worker only when served normally (skipped for the inlined single-file build)
    if (!window.LV_INLINE && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
