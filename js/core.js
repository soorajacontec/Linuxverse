/* Linuxverse core: version, content registry, storage, helpers */
(function () {
  'use strict';
  var VERSION = '1.16.4';

  var LV = window.LV = {
    VERSION: VERSION,
    sections: [],
    byId: {},
    topics: {},
    tools: {},
    labs: {},
    anims: {}
  };

  /* Register a section: {id,title,icon,hue,desc,topics:[...]} */
  LV.sec = function (s) {
    s.topics = s.topics || [];
    LV.sections.push(s);
    LV.byId[s.id] = s;
    s.topics.forEach(function (t) { t.sec = s.id; LV.topics[t.id] = t; });
  };
  LV.add = function (secId, topics) {
    var s = LV.byId[secId];
    if (!s) return;
    topics.forEach(function (t) { t.sec = secId; s.topics.push(t); LV.topics[t.id] = t; });
  };
  /* Per-tool knowledge used by `man` and the command pop-up */
  LV.tool = function (map) { for (var k in map) LV.tools[k] = map[k]; };

  /* Storage: localStorage wrapped in try/catch with in-memory fallback */
  var mem = {};
  LV.store = {
    get: function (k, d) {
      try { var v = localStorage.getItem('lv-' + k); if (v !== null) return JSON.parse(v); } catch (e) {}
      return (('lv-' + k) in mem) ? mem['lv-' + k] : d;
    },
    set: function (k, v) {
      mem['lv-' + k] = v;
      try { localStorage.setItem('lv-' + k, JSON.stringify(v)); } catch (e) {}
    }
  };

  LV.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  LV.$ = function (sel, root) { return (root || document).querySelector(sel); };
  LV.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  LV.reduced = function () {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  };
  LV.copy = function (text, btn) {
    function done(ok) {
      if (!btn) return;
      var old = btn.getAttribute('data-label') || btn.innerHTML;
      btn.setAttribute('data-label', old);
      btn.classList.add('ok');
      btn.innerHTML = ok ? LV.icon('check') : 'Select';
      setTimeout(function () { btn.innerHTML = old; btn.classList.remove('ok'); }, 1200);
    }
    try {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } catch (e) { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); done(ok);
      if (!ok) LV.toast('Copy blocked here. Long-press the command to select it.');
    }
  };
  LV.toast = function (msg) {
    var t = LV.$('#toast');
    if (!t) return;
    t.textContent = msg; t.hidden = false; t.classList.add('show');
    clearTimeout(LV._tt);
    LV._tt = setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.hidden = true; }, 250); }, 2200);
  };
  LV.emit = function (name, detail) {
    try { window.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) {}
  };

  /* Inline icon set (stroke icons, 24px grid) */
  var P = {
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 3.9"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    mobile: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
    tablet: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M11 18h2"/>',
    web: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    term: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M6.5 9l3 3-3 3M12 15h5"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
    play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
    pause: '<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>',
    next: '<path d="M5 5v14l10-7z" fill="currentColor"/><path d="M18 5v14"/>',
    prev: '<path d="M19 5v14L9 12z" fill="currentColor"/><path d="M6 5v14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    vol: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>',
    min: '<path d="M6 12h12"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    run: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    restart: '<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 20h16"/>',
    folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    file: '<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    starf: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.6-2.1-.4-1 .3-2.2 1.6-2.2H17a4 4 0 0 0 4-4C21 6.9 17 3 12 3z"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/><circle cx="10.5" cy="7.5" r="1" fill="currentColor"/><circle cx="15" cy="8" r="1" fill="currentColor"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
  };
  /* Animated logo (Orbit prompt): ring, a satellite on a slowly turning orbit, a prompt with a blinking cursor */
  LV.logoSvg = function (size, cls) {
    return '<svg class="mark ' + (cls || '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 64 64" aria-hidden="true">' +
      '<circle cx="32" cy="32" r="26" fill="none" stroke="var(--accent)" stroke-width="3.8"/>' +
      '<g class="lg-spin"><g transform="rotate(-24 32 32)"><ellipse cx="32" cy="32" rx="30" ry="10" fill="none" stroke="var(--accent2)" stroke-width="2.2" opacity=".6"/>' +
      '<circle r="3.8" fill="var(--accent2)"><animateMotion dur="4s" repeatCount="indefinite" path="M2 32 a30 10 0 1 0 60 0 a30 10 0 1 0 -60 0"/></circle></g></g>' +
      '<path d="M22 24l9 8-9 8" fill="none" stroke="var(--fg)" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path class="lg-blink" d="M35 41h10" stroke="var(--accent)" stroke-width="4.6" stroke-linecap="round"/></svg>';
  };
  LV.logoMotion = function () {
    var off = LV.reduced();
    LV.$$('svg.mark').forEach(function (s) { try { off ? s.pauseAnimations() : s.unpauseAnimations(); } catch (e) {} });
  };
  LV.icon = function (name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  };
})();
