/* Linuxverse A-Z: searchable glossary with letter index, example commands and links to topics */
(function () {
  'use strict';
  var esc = LV.esc, ic = LV.icon, $ = LV.$;
  function letter(t) { var m = t.match(/[a-z]/i); return m ? m[0].toUpperCase() : '#'; }
  function sorted() {
    return LV.AZ.map(function (x) { return { t: x[0], d: x[1], c: x[2], k: x[3], l: letter(x[0]) }; })
      .sort(function (a, b) { return a.l === b.l ? a.t.replace(/^\W+/, '').toLowerCase().localeCompare(b.t.replace(/^\W+/, '').toLowerCase()) : a.l < b.l ? -1 : 1; });
  }
  function card(e) {
    var tp = e.k && LV.topics[e.k];
    return '<article class="az-card"><h3 class="mono">' + esc(e.t) + '</h3><p>' + esc(e.d) + '</p>' +
      (e.c ? '<div class="az-cmd"><code class="mono">' + esc(e.c) + '</code><button class="btn sm ghost to-term" data-cmd="' + esc(e.c) + '" aria-label="Try ' + esc(e.c) + ' in the terminal">' + ic('run') + ' Try</button><button class="btn sm ghost copy-cmd" data-cmd="' + esc(e.c) + '" aria-label="Copy command">' + ic('copy') + '</button></div>' : '') +
      (tp ? '<button class="link sm az-topic" data-go="t-' + tp.id + '">Learn more: ' + esc(tp.title) + ' ' + ic('chev') + '</button>' : '') + '</article>';
  }
  var A = LV.az = {
    count: function () { return LV.AZ.length; },
    find: function (q) {
      q = q.toLowerCase().trim(); if (!q) return [];
      var w = q.split(/\s+/);
      return sorted().filter(function (e) { var s = (e.t + ' ' + e.d).toLowerCase(); return w.every(function (x) { return s.indexOf(x) >= 0; }); });
    },
    html: function () {
      var all = sorted(), has = {};
      all.forEach(function (e) { has[e.l] = (has[e.l] || 0) + 1; });
      var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      return '<div class="page"><button class="back" data-go="learn">' + ic('back') + ' Learn</button>' +
        '<p class="eyebrow">Linux dictionary</p><h1 class="pg-t">A–Z of Linux</h1>' +
        '<p class="lead">' + all.length + ' words and commands every Linux student meets, from absolute path to zsh. Search, jump by letter, and try the examples.</p>' +
        '<div class="az-tools"><label class="search">' + ic('search') + '<input id="az-q" type="search" placeholder="Filter the A–Z list" autocomplete="off" spellcheck="false" aria-label="Filter the A to Z list"></label></div>' +
        '<nav class="az-bar" id="az-bar" aria-label="Jump to letter">' + letters.map(function (l) { return '<button data-az="' + l + '"' + (has[l] ? '' : ' disabled') + '>' + l + '</button>'; }).join('') + '</nav>' +
        '<div id="az-list">' + letters.filter(function (l) { return has[l]; }).map(function (l) {
          return '<section class="az-sec" id="az-' + l + '"><h2 class="az-l">' + l + '<small class="mono">' + has[l] + '</small></h2>' + all.filter(function (e) { return e.l === l; }).map(card).join('') + '</section>';
        }).join('') + '</div><p class="muted az-empty" id="az-empty" hidden>No match. Try a shorter word.</p></div>';
    },
    mount: function () {
      var q = $('#az-q'), secs = LV.$$('.az-sec'), emp = $('#az-empty');
      q.addEventListener('input', function () {
        var w = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean), shown = 0;
        secs.forEach(function (s) {
          var n = 0;
          LV.$$('.az-card', s).forEach(function (c) { var ok = !w.length || w.every(function (x) { return c.textContent.toLowerCase().indexOf(x) >= 0; }); c.hidden = !ok; if (ok) n++; });
          s.hidden = !n; shown += n;
        });
        LV.$$('#az-bar button').forEach(function (b) { var s = $('#az-' + b.dataset.az); b.disabled = !s || s.hidden; });
        emp.hidden = shown > 0;
      });
      if (A.pre) { q.value = A.pre; A.pre = ''; q.dispatchEvent(new Event('input')); }
      $('#az-bar').addEventListener('click', function (e) {
        var b = e.target.closest('[data-az]'); if (!b || b.disabled) return;
        var s = $('#az-' + b.dataset.az); if (s) { s.style.scrollMarginTop = (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hdr-h')) + 48) + 'px'; s.scrollIntoView({ block: 'start' }); }
      });
    },
    card: function () {
      return '<section class="block"><button class="az-promo" data-go="az"><span class="az-big mono">A–Z</span><span><b>A–Z of Linux</b><small>' + LV.AZ.length + ' words and commands, one for nearly every letter. Search and try them.</small></span>' + ic('chev') + '</button></section>';
    }
  };
})();
