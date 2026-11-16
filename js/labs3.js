/* Linuxverse live labs, part 3: regex tester, command chaining, redirection explorer, nice and CPU share, epoch converter,
   hash and avalanche, and shell expansion. Everything computes for real in the browser. */
(function () {
  'use strict';
  var esc = LV.esc, $ = LV.$, $$ = LV.$$;
  function lab(id, title, desc, topic, render) { LV.labs[id] = { id: id, title: title, desc: desc, topic: topic, render: render }; }
  function cmdLine(text) {
    return '<div class="lab-cmd"><code>' + esc(text) + '</code><button class="ibtn sm copy-cmd" data-cmd="' + esc(text) + '" aria-label="Copy command">' + LV.icon('copy') + '</button><button class="ibtn sm to-term" data-cmd="' + esc(text) + '" aria-label="Try in terminal">' + LV.icon('term') + '</button></div>';
  }
  function field(id, label, val, extra) { return '<label class="field"><span>' + label + '</span><input id="' + id + '" class="mono" value="' + esc(val) + '" spellcheck="false" autocomplete="off" ' + (extra || '') + '></label>'; }
  function sq(s) { return /^[A-Za-z0-9_@%+=:,.\/~-]+$/.test(s) ? s : "'" + String(s).replace(/'/g, "'\\''") + "'"; }
  function ck(id, label, on) { return '<label class="chip ck"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '> ' + label + '</label>'; }
  function pad(n, w) { n = String(n); while (n.length < (w || 2)) n = '0' + n; return n; }

  /* ---------- 1. Regex tester ---------- */
  var RX_TEXT = '192.0.2.10 - - "GET /" 200\n203.0.113.9 - - "GET /old" 404\n192.0.2.10 - - "POST /login" 302\n198.51.100.7 - - "GET /missing" 404\n192.0.2.44 - - "GET /api" 500\nerror: disk almost full\nWarning: Backup finished';
  lab('regex', 'Regex tester', 'Type a pattern and see which lines match, what each group captured and the grep command to use.', 'grep', function (box) {
    box.innerHTML =
      field('rx-p', 'Pattern (extended regex, like grep -E)', '^([0-9.]+) .*" (404|500)$') +
      '<div class="presets">' + ck('rx-i', '-i ignore case', false) + ck('rx-v', '-v invert', false) + ck('rx-o', 'show only matching lines', false) + '</div>' +
      '<div class="presets">' + [['^([0-9.]+) .*" (404|500)$', 'failed requests'], ['[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+', 'IP address'], ['(error|warning)', 'error or warning'], ['^[A-Z]', 'starts with capital'], ['"(GET|POST) (/[a-z]*)"', 'method and path']].map(function (p) { return '<button class="chip" data-p="' + esc(p[0]) + '">' + esc(p[1]) + '</button>'; }).join('') + '</div>' +
      '<details class="mini-d" open><summary>Sample text (edit it)</summary><textarea id="rx-t" rows="7" class="mono" style="height:auto;padding:10px" spellcheck="false">' + esc(RX_TEXT) + '</textarea></details>' +
      '<div id="rx-sum" class="muted sm"></div><div class="term-line mono" id="rx-out" style="white-space:pre-wrap"></div><div id="rx-grp"></div><div id="rx-cmd"></div>';
    function run() {
      var pat = $('#rx-p', box).value, ci = $('#rx-i', box).checked, inv = $('#rx-v', box).checked, only = $('#rx-o', box).checked, lines = $('#rx-t', box).value.split('\n'), re, sum = $('#rx-sum', box), out = $('#rx-out', box);
      try { re = new RegExp(pat, ci ? 'i' : ''); } catch (e) { sum.innerHTML = '<span class="bad">Invalid pattern: ' + esc(e.message) + '</span>'; out.innerHTML = ''; $('#rx-grp', box).innerHTML = ''; return; }
      if (!pat) { sum.textContent = 'Type a pattern above.'; out.innerHTML = esc(lines.join('\n')); $('#rx-grp', box).innerHTML = ''; $('#rx-cmd', box).innerHTML = ''; return; }
      var gre = new RegExp(pat, ci ? 'gi' : 'g'), n = 0, html = [], first = null;
      lines.forEach(function (ln) {
        var hit = re.test(ln), show = inv ? !hit : hit;
        if (hit) n++;
        if (hit && !first) first = ln.match(re);
        if (only && !show) return;
        var h;
        if (hit && !inv) { h = ''; var last = 0, m; gre.lastIndex = 0; while ((m = gre.exec(ln)) !== null) { h += esc(ln.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>'; last = m.index + m[0].length; if (m[0] === '') gre.lastIndex++; } h += esc(ln.slice(last)); }
        else h = esc(ln);
        html.push('<span class="' + (show ? '' : 'rx-dim') + '">' + (h || '&nbsp;') + '</span>');
      });
      sum.textContent = n + ' of ' + lines.length + ' lines match' + (inv ? ' (inverted: showing the others)' : '') + '.';
      out.innerHTML = html.join('\n');
      var g = $('#rx-grp', box);
      if (first && first.length > 1) g.innerHTML = '<div class="kv">' + first.slice(1).map(function (x, i) { return '<div><dt>Group ' + (i + 1) + '</dt><dd class="mono">' + (x === undefined ? '(did not take part)' : esc(x)) + '</dd></div>'; }).join('') + '</div>'; else g.innerHTML = '';
      $('#rx-cmd', box).innerHTML = cmdLine('grep -E' + (ci ? 'i' : '') + (inv ? 'v' : '') + ' ' + sq(pat) + ' file.txt');
    }
    box.addEventListener('input', run); box.addEventListener('change', run);
    box.addEventListener('click', function (e) { var p = e.target.closest('[data-p]'); if (p) { $('#rx-p', box).value = p.dataset.p; run(); } });
    run();
  });

  /* ---------- 2. Chaining: ; && || ---------- */
  lab('chain', 'Command chaining', 'Choose whether each command succeeds or fails and see which parts of A && B || C really run.', 'exitcodes', function (box) {
    var cmds = [{ n: 'mkdir build', ok: true }, { n: 'cd build', ok: true }, { n: 'echo "failed"', ok: true }], ops = ['&&', '||'];
    function ui() {
      box.innerHTML =
        '<div class="chain-row">' + [0, 1, 2].map(function (i) {
          return (i ? '<select class="chain-op" data-o="' + (i - 1) + '" aria-label="Operator ' + i + '">' + [';', '&&', '||'].map(function (o) { return '<option' + (ops[i - 1] === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>' : '') +
            '<div class="chain-cmd"><input class="mono chain-n" data-c="' + i + '" value="' + esc(cmds[i].n) + '" aria-label="Command ' + (i + 1) + '" spellcheck="false"><label class="chip ck"><input type="checkbox" class="chain-ok" data-c="' + i + '"' + (cmds[i].ok ? ' checked' : '') + '> succeeds</label></div>';
        }).join('') + '</div>' +
        '<div class="presets">' + [['mkdir build && cd build', ['&&', ';']], ['A && B || C', ['&&', '||']], ['A ; B ; C', [';', ';']], ['A || B || C', ['||', '||']]].map(function (p, i) { return '<button class="chip" data-pre="' + i + '">' + esc(p[0]) + '</button>'; }).join('') + '</div>' +
        '<div id="ch-trace" class="chain-trace"></div><div id="ch-cmd"></div>';
      run();
    }
    function run() {
      var status = cmds[0].ok ? 0 : 1, trace = [{ i: 0, ran: true, st: status }];
      for (var i = 1; i < 3; i++) {
        var op = ops[i - 1], go = op === ';' ? true : op === '&&' ? status === 0 : status !== 0;
        if (go) { status = cmds[i].ok ? 0 : 1; trace.push({ i: i, ran: true, st: status, op: op }); } else trace.push({ i: i, ran: false, op: op, st: status });
      }
      $('#ch-trace', box).innerHTML = trace.map(function (t) {
        return '<div class="chain-step ' + (t.ran ? (t.st === 0 ? 'ok' : 'bad') : 'skip') + '"><b class="mono">' + esc(cmds[t.i].n) + '</b><small>' + (t.ran ? 'ran, exit code ' + t.st : 'skipped: ' + (t.op === '&&' ? 'the previous step failed, && needs success' : 'the previous step succeeded, || needs a failure')) + '</small></div>';
      }).join('') + '<p class="sm">Final exit code ($?): <b class="mono">' + status + '</b></p>';
      $('#ch-cmd', box).innerHTML = cmdLine(cmds[0].n + ' ' + ops[0] + ' ' + cmds[1].n + ' ' + ops[1] + ' ' + cmds[2].n);
    }
    box.addEventListener('change', function (e) {
      if (e.target.classList.contains('chain-op')) { ops[+e.target.dataset.o] = e.target.value; run(); }
      if (e.target.classList.contains('chain-ok')) { cmds[+e.target.dataset.c].ok = e.target.checked; run(); }
    });
    box.addEventListener('input', function (e) { if (e.target.classList.contains('chain-n')) { cmds[+e.target.dataset.c].n = e.target.value; run(); } });
    box.addEventListener('click', function (e) {
      var p = e.target.closest('[data-pre]'); if (!p) return;
      var i = +p.dataset.pre; ops = [['&&', ';'], ['&&', '||'], [';', ';'], ['||', '||']][i];
      if (i === 0) { cmds[0].n = 'mkdir build'; cmds[1].n = 'cd build'; cmds[2].n = 'echo "ready"'; } else { cmds[0].n = 'A'; cmds[1].n = 'B'; cmds[2].n = 'C'; }
      ui();
    });
    ui();
  });

  /* ---------- 3. Redirection explorer ---------- */
  var RD = [
    { op: '', t: 'nothing', out: 'terminal', err: 'terminal', note: 'Both streams go to the screen.' },
    { op: '> out.txt', t: '> out.txt', out: 'file out.txt (replaced)', err: 'terminal', note: 'Only normal output is saved. Errors still show. The file is emptied first.' },
    { op: '>> out.txt', t: '>> out.txt', out: 'file out.txt (appended)', err: 'terminal', note: 'Adds to the end of the file instead of replacing it.' },
    { op: '2> err.txt', t: '2> err.txt', out: 'terminal', err: 'file err.txt', note: 'Only errors are saved. Number 2 is the stderr stream.' },
    { op: '> all.txt 2>&1', t: '> all.txt 2>&1', out: 'file all.txt', err: 'file all.txt', note: 'Order matters: first send stdout to the file, then point stderr at the same place.' },
    { op: '&> all.txt', t: '&> all.txt', out: 'file all.txt', err: 'file all.txt', note: 'Bash shortcut for both streams into one file.' },
    { op: '2> /dev/null', t: '2> /dev/null', out: 'terminal', err: 'discarded (/dev/null)', note: 'Hide error messages, for example from find.' },
    { op: '> /dev/null', t: '> /dev/null', out: 'discarded (/dev/null)', err: 'terminal', note: 'Hide normal output and see only problems.' },
    { op: '| wc -l', t: '| wc -l', out: 'pipe into wc -l', err: 'terminal', note: 'A pipe passes only stdout. Errors are not counted.' },
    { op: '2>&1 | wc -l', t: '2>&1 | wc -l', out: 'pipe into wc -l', err: 'pipe into wc -l', note: 'Merge errors into stdout first, then both go through the pipe.' }
  ];
  var RD_OUT = '/etc/hosts', RD_ERR = "ls: cannot access '/nope': No such file or directory";
  lab('redirect', 'Redirection explorer', 'See where stdout and stderr end up for each redirection operator.', 'pipes', function (box) {
    var cur = 0;
    box.innerHTML = '<div class="presets" id="rd-ops">' + RD.map(function (r, i) { return '<button class="chip' + (i === 0 ? ' on' : '') + '" data-i="' + i + '">' + esc(r.t) + '</button>'; }).join('') + '</div>' +
      '<div id="rd-cmd"></div><div class="rd-flow" id="rd-flow"></div><div id="rd-res" class="term-line mono" style="white-space:pre-wrap"></div><p class="muted sm" id="rd-note"></p>';
    function dest(d, label, text) {
      var cls = /terminal/.test(d) ? 'term' : /discarded/.test(d) ? 'null' : /pipe/.test(d) ? 'pipe' : 'file';
      return '<div class="rd-row"><span class="rd-src mono">' + label + '</span><span class="rd-arrow">&rarr;</span><span class="rd-dst ' + cls + '">' + esc(d) + '</span></div>';
    }
    function run() {
      var r = RD[cur], full = 'ls /etc/hosts /nope' + (r.op ? ' ' + r.op : '');
      $$('#rd-ops .chip', box).forEach(function (b, i) { b.classList.toggle('on', i === cur); });
      $('#rd-cmd', box).innerHTML = cmdLine(full);
      $('#rd-flow', box).innerHTML = dest(r.out, 'stdout (1)') + dest(r.err, 'stderr (2)');
      var lines = [];
      if (/pipe/.test(r.out)) {
        if (/terminal/.test(r.err)) lines.push(RD_ERR);
        lines.push('wc -l prints: ' + (/pipe/.test(r.err) ? '2' : '1') + '   (it counts the lines it receives)');
      } else {
        if (/terminal/.test(r.out)) lines.push(RD_OUT);
        if (/terminal/.test(r.err)) lines.push(RD_ERR);
        if (/file/.test(r.out)) lines.push('[' + r.out.replace(/^file /, '') + '] <- ' + RD_OUT);
        if (/file/.test(r.err)) lines.push('[' + r.err.replace(/^file /, '') + '] <- ' + RD_ERR);
        if (/discarded/.test(r.out) && /discarded/.test(r.err)) lines.push('(nothing shown)');
      }
      $('#rd-res', box).textContent = lines.join('\n');
      $('#rd-note', box).textContent = r.note;
    }
    box.addEventListener('click', function (e) { var b = e.target.closest('#rd-ops [data-i]'); if (b) { cur = +b.dataset.i; run(); } });
    run();
  });

  /* ---------- 4. nice and CPU share ---------- */
  function weight(nice) { return 1024 / Math.pow(1.25, nice); }
  lab('nice', 'nice and CPU share', 'Set the nice value of four busy programs and see how one CPU is shared between them.', 'nice', function (box) {
    var P = [{ n: 'backup.sh', v: 10 }, { n: 'compile', v: 0 }, { n: 'nginx', v: -5 }, { n: 'editor', v: 0 }];
    box.innerHTML = '<p class="muted sm">All four want the CPU at once. A lower nice number means a higher priority. Each step of 1 changes the share by about 25 percent.</p>' +
      P.map(function (p, i) {
        return '<div class="ni-row"><div class="ni-h"><b class="mono">' + esc(p.n) + '</b><span class="mono ni-v"></span><b class="ni-pct mono"></b></div>' +
          '<input type="range" min="-20" max="19" value="' + p.v + '" data-i="' + i + '" aria-label="Nice value of ' + esc(p.n) + '"><div class="ni-bar"><i></i></div></div>';
      }).join('') + '<div id="ni-cmd"></div>';
    function update() {
      var tot = P.reduce(function (s, p) { return s + weight(p.v); }, 0), rows = $$('.ni-row', box);
      P.forEach(function (p, i) {
        var sh = weight(p.v) / tot * 100;
        $('.ni-v', rows[i]).textContent = 'nice ' + (p.v > 0 ? '+' : '') + p.v; $('.ni-pct', rows[i]).textContent = sh.toFixed(1) + '%'; $('.ni-bar i', rows[i]).style.width = sh.toFixed(1) + '%';
      });
      var hi = P.slice().sort(function (a, b) { return a.v - b.v; })[0], lo = P.slice().sort(function (a, b) { return b.v - a.v; })[0];
      $('#ni-cmd', box).innerHTML = cmdLine('nice -n ' + lo.v + ' ./' + lo.n) + cmdLine('sudo renice -n ' + hi.v + ' -p $(pgrep ' + hi.n + ')');
    }
    box.addEventListener('input', function (e) { var r = e.target.closest('input[type=range]'); if (!r) return; P[+r.dataset.i].v = +r.value; update(); });
    update();
  });

  /* ---------- 5. Epoch and time zones ---------- */
  var ZONES = ['UTC', 'Asia/Kolkata', 'Europe/London', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney'];
  function fmtZone(d, tz) {
    try { return new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'short' }).format(d); } catch (e) { return 'unknown zone'; }
  }
  function rel(ms) {
    var s = Math.round(ms / 1000), a = Math.abs(s), u = a < 60 ? [a, 'second'] : a < 3600 ? [Math.round(a / 60), 'minute'] : a < 86400 ? [Math.round(a / 3600), 'hour'] : a < 31536000 ? [Math.round(a / 86400), 'day'] : [(a / 31536000).toFixed(1), 'year'];
    return u[0] + ' ' + u[1] + (u[0] == 1 ? '' : 's') + (s < 0 ? ' from now' : ' ago');
  }
  lab('epoch', 'Epoch and time zones', 'Convert a Unix timestamp to a readable date in any zone, or a date back to seconds.', 'timesync', function (box) {
    var now = Math.floor(Date.now() / 1000);
    box.innerHTML = field('ep-s', 'Unix seconds (or milliseconds)', String(now), 'inputmode="numeric"') + '<div class="presets"><button class="chip" id="ep-now">Now</button><button class="chip" data-v="0">1970 (0)</button><button class="chip" data-v="1000000000">1 000 000 000</button><button class="chip" data-v="2147483647">2038 (2 147 483 647)</button></div>' +
      '<label class="field"><span>Or pick a date and time (your local time)</span><input type="datetime-local" id="ep-d" aria-label="Date and time"></label>' +
      '<div class="kv" id="ep-kv"></div><div id="ep-cmd"></div>';
    function show(sec) {
      var d = new Date(sec * 1000);
      if (isNaN(d)) { $('#ep-kv', box).innerHTML = '<p class="bad">Not a valid number.</p>'; return; }
      var rows = [['ISO 8601 (UTC)', d.toISOString().replace('.000Z', 'Z')], ['Relative', rel(Date.now() - d)]].concat(ZONES.map(function (z) { return [z, fmtZone(d, z)]; }));
      $('#ep-kv', box).innerHTML = rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd class="mono">' + esc(r[1]) + '</dd></div>'; }).join('');
      $('#ep-cmd', box).innerHTML = cmdLine('date -d @' + sec) + cmdLine('date -u -d @' + sec + ' +%FT%TZ') + cmdLine('TZ=Asia/Kolkata date -d @' + sec);
      var loc = new Date(sec * 1000 - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); try { $('#ep-d', box).value = loc; } catch (e) {}
    }
    function fromInput() { var v = $('#ep-s', box).value.trim(); if (!/^-?\d+$/.test(v)) { $('#ep-kv', box).innerHTML = '<p class="muted">Type whole seconds, for example ' + now + '.</p>'; return; } var n = +v; if (Math.abs(n) > 1e11) n = Math.floor(n / 1000); show(n); }
    box.addEventListener('input', function (e) {
      if (e.target.id === 'ep-s') fromInput();
      if (e.target.id === 'ep-d' && e.target.value) { var t = Math.floor(new Date(e.target.value).getTime() / 1000); if (!isNaN(t)) { $('#ep-s', box).value = t; show(t); } }
    });
    box.addEventListener('click', function (e) {
      if (e.target.closest('#ep-now')) { var n = Math.floor(Date.now() / 1000); $('#ep-s', box).value = n; show(n); return; }
      var p = e.target.closest('[data-v]'); if (p) { $('#ep-s', box).value = p.dataset.v; fromInput(); }
    });
    show(now);
  });

  /* ---------- 6. Hash and avalanche ---------- */
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return pad(b.toString(16), 2); }).join(''); }
  function bitDiff(a, b) { var n = 0, i, x; for (i = 0; i < Math.min(a.length, b.length); i++) { x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { n += x & 1; x >>= 1; } } return n; }
  lab('hash', 'Hash and avalanche', 'Type any text and see its SHA checksum. Change one character and watch the whole hash change.', 'checksums', function (box) {
    box.innerHTML = field('hs-t', 'Text', 'hello linux') +
      '<div class="presets"><span class="muted sm">Algorithm</span>' + ['SHA-256', 'SHA-1', 'SHA-512'].map(function (a, i) { return '<button class="chip' + (i === 0 ? ' on' : '') + '" data-a="' + a + '">' + a + '</button>'; }).join('') + '</div>' +
      '<div class="hash-box"><small>Hash of your text</small><code class="mono" id="hs-a"></code></div><div class="hash-box"><small>Hash with the last character changed (<span id="hs-c" class="mono"></span>)</small><code class="mono" id="hs-b"></code></div>' +
      '<p id="hs-d" class="sm"></p><div id="hs-cmd"></div>';
    var alg = 'SHA-256', seq = 0;
    function run() {
      var txt = $('#hs-t', box).value, ok = window.crypto && crypto.subtle;
      if (!ok) { $('#hs-d', box).innerHTML = '<span class="bad">Hashing needs a secure page (https or localhost).</span>'; return; }
      var alt = txt.length ? txt.slice(0, -1) + String.fromCharCode(txt.charCodeAt(txt.length - 1) ^ 1) : '\u0001', my = ++seq, enc = new TextEncoder();
      $('#hs-c', box).textContent = txt.length ? txt.slice(-1) + ' → ' + alt.slice(-1) : '(empty)';
      Promise.all([crypto.subtle.digest(alg, enc.encode(txt)), crypto.subtle.digest(alg, enc.encode(alt))]).then(function (r) {
        if (my !== seq) return;
        var a = hex(r[0]), b = hex(r[1]), bits = a.length * 4, d = bitDiff(a, b);
        $('#hs-a', box).textContent = a;
        var out = ''; for (var i = 0; i < b.length; i++) out += a[i] === b[i] ? esc(b[i]) : '<mark>' + esc(b[i]) + '</mark>';
        $('#hs-b', box).innerHTML = out;
        $('#hs-d', box).textContent = d + ' of ' + bits + ' bits differ (' + Math.round(d / bits * 100) + '%). Changing one character changes about half of all bits: this is the avalanche effect.';
        var cmd = { 'SHA-256': 'sha256sum', 'SHA-1': 'sha1sum', 'SHA-512': 'sha512sum' }[alg];
        $('#hs-cmd', box).innerHTML = cmdLine('echo -n ' + sq(txt) + ' | ' + cmd);
      });
    }
    box.addEventListener('input', function (e) { if (e.target.id === 'hs-t') run(); });
    box.addEventListener('click', function (e) { var b = e.target.closest('[data-a]'); if (!b) return; alg = b.dataset.a; $$('[data-a]', box).forEach(function (x) { x.classList.toggle('on', x === b); }); run(); });
    run();
  });

  /* ---------- 7. Shell expansion ---------- */
  var FILES = ['a.txt', 'b.txt', 'notes.log', 'access.log', 'error.log', 'README.md', '.hidden'];
  function tokenize(line) {
    var toks = [], cur = [], seg = '', q = 'n', i, c;
    function pushSeg() { if (seg !== '' || (cur.length === 0 && q !== 'n')) cur.push({ t: seg, q: q }); seg = ''; }
    for (i = 0; i < line.length; i++) {
      c = line[i];
      if (q === 'n') {
        if (c === "'") { pushSeg(); q = 's'; } else if (c === '"') { pushSeg(); q = 'd'; }
        else if (/\s/.test(c)) { pushSeg(); if (cur.length) toks.push(cur); cur = []; }
        else seg += c;
      } else if (q === 's') { if (c === "'") { cur.push({ t: seg, q: 's' }); seg = ''; q = 'n'; } else seg += c; }
      else { if (c === '"') { cur.push({ t: seg, q: 'd' }); seg = ''; q = 'n'; } else seg += c; }
    }
    if (q === 'n') pushSeg(); else cur.push({ t: seg, q: q });
    if (cur.length) toks.push(cur);
    return toks;
  }
  function braces(w) {
    var m = w.match(/^(.*?)\{(-?\d+)\.\.(-?\d+)\}(.*)$/);
    if (m) { var x = +m[2], y = +m[3], st = x <= y ? 1 : -1, o = []; for (var i = x; st > 0 ? i <= y : i >= y; i += st) o = o.concat(braces(m[1] + i + m[4])); return o; }
    m = w.match(/^(.*?)\{([^{}]*,[^{}]*)\}(.*)$/);
    if (m) { var r = []; m[2].split(',').forEach(function (it) { braces(m[1] + it + m[3]).forEach(function (z) { r.push(z); }); }); return r; }
    return [w];
  }
  function globRe(p) { return new RegExp('^' + p.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$'); }
  lab('expand', 'Shell expansion', 'See the steps the shell takes before a command runs: braces, ~, variables, wildcards and quotes.', 'bash-basics', function (box) {
    var VARS = { HOME: '/home/ssk', USER: 'ssk', file: 'my notes.txt', n: '3' };
    box.innerHTML = field('ex-l', 'Command line', 'echo file{1..3}.txt ~/docs $USER "$USER" \'$USER\' *.log $file "$file"') +
      '<div class="presets">' + [['echo file{1..3}.txt', 'braces'], ['echo ~ $HOME', 'home'], ['echo *.txt .*', 'wildcards'], ['echo $file "$file"', 'the spaces trap'], ['echo \'$USER\' "$USER"', 'quotes']].map(function (p) { return '<button class="chip" data-l="' + esc(p[0]) + '">' + esc(p[1]) + '</button>'; }).join('') + '</div>' +
      '<p class="muted sm">Variables: ' + Object.keys(VARS).map(function (k) { return '<code>' + k + '=' + esc(VARS[k]) + '</code>'; }).join(' ') + '. Files in the folder: <code>' + FILES.join(' ') + '</code></p>' +
      '<div id="ex-st"></div><div id="ex-fin" class="term-line mono" style="white-space:pre-wrap"></div>';
    function words(ws) { return '<div class="ex-words">' + ws.map(function (w) { return '<span class="ex-w mono">' + (esc(w.t === undefined ? w : w.t) || '&nbsp;') + '</span>'; }).join('') + '</div>'; }
    function run() {
      var line = $('#ex-l', box).value, toks = tokenize(line);
      if (!toks.length) { $('#ex-st', box).innerHTML = ''; $('#ex-fin', box).textContent = ''; return; }
      var s1 = [], s2 = [], s3 = [], s4 = [];
      toks.forEach(function (segs) {
        var plain = segs.every(function (s) { return s.q === 'n'; }), joined = segs.map(function (s) { return s.t; }).join('');
        var exp = plain ? braces(joined) : [null];
        exp.forEach(function (w) {
          var segs2 = w === null ? segs : [{ t: w, q: 'n' }];
          s1.push(segs2);
        });
      });
      // tilde
      s1.forEach(function (segs) { var a = segs.slice(); if (a[0] && a[0].q === 'n' && /^~(\/|$)/.test(a[0].t)) a[0] = { t: VARS.HOME + a[0].t.slice(1), q: 'n' }; s2.push(a); });
      // variables, then word splitting of unquoted results
      s2.forEach(function (segs) {
        var parts = [[]], split = false;
        segs.forEach(function (s) {
          if (s.q === 's') { parts[parts.length - 1].push(s); return; }
          var txt = s.t.replace(/\$\{(\w+)\}|\$(\w+)/g, function (m, a, b) { return VARS[a || b] !== undefined ? VARS[a || b] : ''; });
          if (s.q === 'n' && txt !== s.t && /\s/.test(txt)) { split = true; var ps = txt.split(/\s+/); ps.forEach(function (p, i) { if (i) parts.push([]); if (p) parts[parts.length - 1].push({ t: p, q: 'n' }); }); }
          else parts[parts.length - 1].push({ t: txt, q: s.q });
        });
        parts.forEach(function (p) { s3.push(p); });
      });
      // globs
      s3.forEach(function (segs) {
        var plain = segs.every(function (s) { return s.q === 'n'; }), w = segs.map(function (s) { return s.t; }).join('');
        if (plain && /[*?]/.test(w)) {
          var re = globRe(w), hits = FILES.filter(function (f) { return (f[0] !== '.' || w[0] === '.') && re.test(f); }).sort();
          if (hits.length) { hits.forEach(function (h) { s4.push(h); }); return; }
        }
        s4.push(w);
      });
      var flat = function (arr) { return arr.map(function (segs) { return { t: segs.map(function (s) { return s.t; }).join('') }; }); };
      $('#ex-st', box).innerHTML =
        '<div class="ex-step-l"><b>1 Brace expansion</b><small>{a,b} and {1..3} make new words</small>' + words(flat(s1)) + '</div>' +
        '<div class="ex-step-l"><b>2 Tilde</b><small>~ becomes your home folder</small>' + words(flat(s2)) + '</div>' +
        '<div class="ex-step-l"><b>3 Variables and word splitting</b><small>$name is replaced. Unquoted values split at spaces; quoted ones stay whole; single quotes change nothing</small>' + words(flat(s3)) + '</div>' +
        '<div class="ex-step-l"><b>4 Wildcards</b><small>* ? match file names. Hidden files need a leading dot. Quoted patterns are not expanded</small>' + words(s4) + '</div>';
      $('#ex-fin', box).textContent = s4.length + ' argument' + (s4.length === 1 ? '' : 's') + ' reach the command:\n' + s4.map(function (w, i) { return (i + 1) + ': [' + w + ']'; }).join('\n');
    }
    box.addEventListener('input', function (e) { if (e.target.id === 'ex-l') run(); });
    box.addEventListener('click', function (e) { var p = e.target.closest('[data-l]'); if (p) { $('#ex-l', box).value = p.dataset.l; run(); } });
    run();
  });

  /* Link topics that had no lab to their new one */
  [['exitcodes', 'chain'], ['nice', 'nice'], ['checksums', 'hash'], ['bash-basics', 'expand']].forEach(function (p) { var t = LV.topics[p[0]]; if (t && !t.live) t.live = p[1]; });
})();
