/* Linuxverse live labs, part 5: 24 calculators and converters, and 10 simulators. Everything is computed live in the browser. */
(function () {
  'use strict';
  var esc = LV.esc, $ = LV.$, $$ = LV.$$, K = LV.labKit, cmdLine = K.cmdLine, sq = K.sq;
  function register(cat, id, title, desc, topic, render) { LV.labs[id] = { id: id, title: title, desc: desc, topic: topic, render: render, cat: cat }; }
  var CALC = 'Calculators & converters', SIM = 'Simulators';
  function pad(n, w) { n = String(n); while (n.length < (w || 2)) n = '0' + n; return n; }
  function dur(sec) {
    if (!isFinite(sec)) return 'practically forever';
    if (sec < 1) return 'less than a second';
    var u = [['year', 31557600], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]], out = [], i, n;
    if (sec > 31557600 * 1e9) return 'longer than the age of the universe';
    for (i = 0; i < u.length && out.length < 2; i++) { n = Math.floor(sec / u[i][1]); if (n > 0) { out.push(n.toLocaleString('en-US') + ' ' + u[i][0] + (n === 1 ? '' : 's')); sec -= n * u[i][1]; } }
    return out.join(' ');
  }

  /* ---------- calculator engine ----------
     inputs: { k, label, def, t:'text'|'sel'|'area', opts:[[value,label]], rows, ph }; compute(v) -> { rows:[[label,value]], cmds:[...], note, err, html } */
  function calc(o) {
    register(CALC, o.id, o.title, o.desc, o.topic, function (box) {
      var v = {};
      o.inputs.forEach(function (f) { v[f.k] = f.def; });
      box.innerHTML = '<div class="lab-grid">' + o.inputs.map(function (f) {
        if (f.t === 'sel') return '<label class="field"><span>' + esc(f.label) + '</span><select data-k="' + f.k + '">' + f.opts.map(function (x) { return '<option value="' + esc(x[0]) + '"' + (String(x[0]) === String(f.def) ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join('') + '</select></label>';
        if (f.t === 'area') return '<label class="field wide"><span>' + esc(f.label) + '</span><textarea data-k="' + f.k + '" rows="' + (f.rows || 5) + '" class="mono" style="height:auto;padding:10px" spellcheck="false">' + esc(f.def) + '</textarea></label>';
        return '<label class="field"><span>' + esc(f.label) + '</span><input data-k="' + f.k + '" class="mono" value="' + esc(f.def) + '" spellcheck="false" autocomplete="off"' + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + '></label>';
      }).join('') + '</div><div id="k-out"></div><div id="k-cmds"></div><p id="k-note" class="muted sm"></p>';
      function run() {
        var r;
        try { r = o.compute(v) || {}; } catch (e) { r = { err: 'Could not compute: ' + e.message }; }
        var out = '';
        if (r.err) out += '<p class="bad">' + esc(r.err) + '</p>';
        if (r.rows && r.rows.length) out += '<div class="kv">' + r.rows.map(function (x) { return '<div><dt>' + esc(x[0]) + '</dt><dd class="mono">' + esc(x[1]) + '</dd></div>'; }).join('') + '</div>';
        if (r.html) out += r.html;
        $('#k-out', box).innerHTML = out;
        $('#k-cmds', box).innerHTML = (r.cmds || []).map(cmdLine).join('');
        $('#k-note', box).textContent = r.note || o.note || '';
      }
      box.addEventListener('input', function (e) { var k = e.target.dataset.k; if (k) { v[k] = e.target.value; run(); } });
      box.addEventListener('change', function (e) { var k = e.target.dataset.k; if (k) { v[k] = e.target.value; run(); } });
      run();
    });
  }
  function I(k, label, def, extra) { var f = { k: k, label: label, def: def, t: 'text' }; for (var x in extra) f[x] = extra[x]; return f; }
  function S(k, label, def, opts) { return { k: k, label: label, def: def, t: 'sel', opts: opts }; }
  function A(k, label, def, rows) { return { k: k, label: label, def: def, t: 'area', rows: rows }; }
  function lines(t) { var a = String(t).split('\n'); if (a.length && a[a.length - 1] === '') a.pop(); return a; }

  /* ---- numbers and sizes ---- */
  calc({ id: 'c-base', title: 'Number base converter', desc: 'Convert between decimal, hex, binary and octal, and see the ASCII character.', topic: 'chmod', inputs: [I('n', 'Number', '255'), S('b', 'Is written in', '10', [['10', 'decimal'], ['16', 'hexadecimal'], ['2', 'binary'], ['8', 'octal']])],
    compute: function (v) {
      var s = v.n.trim().toLowerCase().replace(/^0x/, ''), b = +v.b;
      var ok = { 10: /^-?\d+$/, 16: /^[0-9a-f]+$/, 2: /^[01]+$/, 8: /^[0-7]+$/ }[b];
      if (!ok.test(s)) return { err: 'Not a valid base-' + b + ' number.' };
      var n = parseInt(s, b); if (n > Number.MAX_SAFE_INTEGER) return { err: 'Too large for this tool.' };
      var ch = n >= 32 && n <= 126 ? '"' + String.fromCharCode(n) + '"' : (n < 32 ? 'control character ^' + String.fromCharCode(n + 64) : '(not printable ASCII)');
      return { rows: [['Decimal', n], ['Hexadecimal', '0x' + n.toString(16)], ['Binary', n.toString(2)], ['Octal', '0' + n.toString(8)], ['ASCII', ch]], cmds: ['printf "%d %x %o\\n" ' + n + ' ' + n + ' ' + n, 'echo "obase=2; ' + n + '" | bc'], note: 'chmod modes are octal: 755 = 111 101 101 in binary.' };
    } });
  var UNITS = [['B', 1], ['KB', 1e3], ['KiB', 1024], ['MB', 1e6], ['MiB', 1048576], ['GB', 1e9], ['GiB', 1073741824], ['TB', 1e12], ['TiB', 1099511627776]];
  calc({ id: 'c-size', title: 'Storage size converter', desc: 'KB versus KiB, MB versus MiB: why a 500 GB disk shows 465 GiB.', topic: 'diskusage', inputs: [I('x', 'Value', '500'), S('u', 'Unit', 'GB', UNITS.map(function (u) { return [u[0], u[0]]; }))],
    compute: function (v) {
      var n = parseFloat(v.x); if (!isFinite(n) || n < 0) return { err: 'Enter a positive number.' };
      var bytes = n * UNITS.filter(function (u) { return u[0] === v.u; })[0][1];
      return { rows: UNITS.map(function (u) { var q = bytes / u[1]; return [u[0], q >= 1e6 || (q < 0.001 && q > 0) ? q.toExponential(3) : +q.toFixed(4)]; }), note: 'Disk makers use powers of 1000 (GB). Linux tools such as df -h use powers of 1024 (GiB). df -H and ls -l --si use 1000.', cmds: ['numfmt --to=iec ' + Math.round(bytes), 'numfmt --to=si ' + Math.round(bytes)] };
    } });
  calc({ id: 'c-transfer', title: 'Transfer time estimator', desc: 'How long will a download, backup or copy take over a given link?', topic: 'transfer', inputs: [I('x', 'Size', '50'), S('u', 'Unit', 'GB', [['MB', 'MB'], ['GB', 'GB'], ['TB', 'TB']]), I('bw', 'Speed (Mbit/s)', '100'), I('eff', 'Efficiency (%)', '85')],
    compute: function (v) {
      var size = parseFloat(v.x), bw = parseFloat(v.bw), eff = parseFloat(v.eff);
      if (!(size > 0 && bw > 0 && eff > 0 && eff <= 100)) return { err: 'Enter positive numbers (efficiency 1 to 100).' };
      var bytes = size * { MB: 1e6, GB: 1e9, TB: 1e12 }[v.u], bps = bw * 1e6 / 8 * eff / 100, sec = bytes / bps;
      return { rows: [['Real speed', (bps / 1e6).toFixed(2) + ' MB/s'], ['Time', dur(sec)], ['Seconds', Math.round(sec).toLocaleString('en-US')]], note: 'Link speeds are in bits (Mbit/s); file sizes in bytes. Divide by 8. Protocol overhead and disks usually leave 80 to 90 percent.', cmds: ['rsync -avh --progress --bwlimit=' + Math.round(bps / 1000) + ' big.iso server:/data/'] };
    } });
  calc({ id: 'c-raid', title: 'RAID capacity calculator', desc: 'Usable space and fault tolerance for RAID 0, 1, 5, 6 and 10.', topic: 'lvm', inputs: [S('lv', 'RAID level', '5', [['0', 'RAID 0 (stripe)'], ['1', 'RAID 1 (mirror)'], ['5', 'RAID 5'], ['6', 'RAID 6'], ['10', 'RAID 10']]), I('n', 'Number of disks', '4'), I('sz', 'Size of each disk (TB)', '4')],
    compute: function (v) {
      var n = parseInt(v.n, 10), sz = parseFloat(v.sz), lv = v.lv, min = { 0: 2, 1: 2, 5: 3, 6: 4, 10: 4 }[lv];
      if (!(n >= 1 && sz > 0)) return { err: 'Enter the disk count and size.' };
      if (n < min) return { err: 'RAID ' + lv + ' needs at least ' + min + ' disks.' };
      if (lv === '10' && n % 2) return { err: 'RAID 10 needs an even number of disks.' };
      var use = { 0: n * sz, 1: sz, 5: (n - 1) * sz, 6: (n - 2) * sz, 10: n / 2 * sz }[lv], tol = { 0: '0 (any failure loses everything)', 1: n - 1 + ' disks', 5: '1 disk', 6: '2 disks', 10: '1 per mirror pair (at least 1)' }[lv];
      return { rows: [['Raw space', (n * sz).toFixed(1) + ' TB'], ['Usable space', use.toFixed(1) + ' TB'], ['Efficiency', Math.round(use / (n * sz) * 100) + '%'], ['Survives failure of', tol]], note: 'RAID is not a backup: it keeps the system running when a disk dies, but deleted files and ransomware are mirrored too.', cmds: ['sudo mdadm --create /dev/md0 --level=' + lv + ' --raid-devices=' + n + ' /dev/sd[b-' + String.fromCharCode(97 + n) + ']', 'cat /proc/mdstat'] };
    } });
  calc({ id: 'c-sla', title: 'Uptime and the nines', desc: 'How much downtime does 99.9 percent really allow?', topic: 'journal', inputs: [I('a', 'Availability (%)', '99.9')],
    compute: function (v) {
      var a = parseFloat(v.a); if (!(a > 0 && a < 100)) return { err: 'Enter a value between 0 and 100 (for example 99.95).' };
      var down = (100 - a) / 100;
      return { rows: [['Per day', dur(down * 86400)], ['Per week', dur(down * 604800)], ['Per month (30 d)', dur(down * 2592000)], ['Per year', dur(down * 31536000)]], note: 'Three nines (99.9) is about 8.8 hours a year; four nines (99.99) about 53 minutes; five nines (99.999) about 5 minutes.', cmds: ['uptime -p'] };
    } });
  calc({ id: 'c-pass', title: 'Password strength', desc: 'Estimate entropy and guessing time. Your text never leaves this page.', topic: 'hardening', inputs: [I('pw', 'Password to test', 'correct horse battery staple'), S('g', 'Attacker speed', '1e10', [['1e3', '1,000 guesses/s (online)'], ['1e10', '10 billion/s (one GPU)'], ['1e12', '1 trillion/s (many GPUs)']])],
    compute: function (v) {
      var pw = v.pw; if (!pw) return { err: 'Type a password to test.' };
      var pool = 0; if (/[a-z]/.test(pw)) pool += 26; if (/[A-Z]/.test(pw)) pool += 26; if (/[0-9]/.test(pw)) pool += 10; if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
      var bits = pw.length * Math.log2(pool), uniq = new Set(pw.split('')).size;
      if (uniq < pw.length / 2) bits *= .6;
      var secs = Math.pow(2, bits - 1) / parseFloat(v.g), verdict = bits < 40 ? 'Weak' : bits < 60 ? 'Fair' : bits < 80 ? 'Good' : 'Strong';
      return { rows: [['Length', pw.length], ['Character pool', pool], ['Entropy', bits.toFixed(1) + ' bits'], ['Average time to crack', dur(secs)], ['Verdict', verdict]], note: 'A long passphrase of unrelated words beats a short complicated one. Use a password manager and never reuse passwords. This is an estimate for random choices; common words and patterns are cracked faster.', cmds: ['openssl rand -base64 18', 'head -c 24 /dev/urandom | base64'] };
    } });

  /* ---- permissions, text and encodings ---- */
  calc({ id: 'c-perm', title: 'Who can access this file?', desc: 'Give a file mode, owner and group, and a user: see which rule applies and what they can do.', topic: 'chmod', inputs: [I('mode', 'File mode (octal)', '640'), I('fo', 'File owner', 'ssk'), I('fg', 'File group', 'www-data'), I('u', 'User', 'alex'), I('ug', 'User\'s groups (comma)', 'alex,www-data'), S('kind', 'Item is a', 'f', [['f', 'file'], ['d', 'directory']])],
    compute: function (v) {
      var m = v.mode.trim(); if (!/^[0-7]{3}$/.test(m)) return { err: 'Mode must be three octal digits, for example 640.' };
      var cls, d; if (v.u === v.fo) { cls = 'owner'; d = +m[0]; } else if (v.ug.split(',').map(function (x) { return x.trim(); }).indexOf(v.fg) >= 0) { cls = 'group'; d = +m[1]; } else { cls = 'others'; d = +m[2]; }
      var r = !!(d & 4), w = !!(d & 2), x = !!(d & 1), dir = v.kind === 'd';
      var sym = function (n) { return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-'); };
      return { rows: [['Mode', (dir ? 'd' : '-') + sym(+m[0]) + sym(+m[1]) + sym(+m[2])], ['Rule that applies', cls + ' (' + sym(d) + ')'], [dir ? 'List the contents' : 'Read', r ? 'yes' : 'no'], [dir ? 'Create / delete inside' : 'Write', dir ? (w && x ? 'yes' : 'no (needs w and x)') : (w ? 'yes' : 'no')], [dir ? 'Enter (cd)' : 'Run as a program', x ? 'yes' : 'no']], note: 'Linux uses only the FIRST matching class: owner, then group, then others. An owner with 0 bits is denied even if the group could read.', cmds: ['ls -l file', 'namei -l /path/to/file', 'sudo -u ' + v.u + ' test -r file && echo readable'] };
    } });
  calc({ id: 'c-utf8', title: 'Unicode and UTF-8 bytes', desc: 'See the code point and the exact bytes of any character.', topic: 'fhs', inputs: [I('t', 'Characters', 'Aé€😀')],
    compute: function (v) {
      var chars = Array.from(v.t); if (!chars.length) return { err: 'Type a character.' };
      var enc = new TextEncoder();
      return { rows: chars.slice(0, 12).map(function (c) { var cp = c.codePointAt(0), b = Array.from(enc.encode(c)); return [c + '  U+' + cp.toString(16).toUpperCase().padStart(4, '0'), b.length + ' byte' + (b.length > 1 ? 's' : '') + ': ' + b.map(function (x) { return pad(x.toString(16), 2); }).join(' ')]; }), note: 'ASCII characters take 1 byte; accents 2; most symbols 3; emoji 4. That is why wc -c (bytes) and wc -m (characters) differ.', cmds: ['printf "%s" ' + sq(v.t) + ' | xxd', 'printf "%s" ' + sq(v.t) + ' | wc -m -c'] };
    } });
  function b64enc(s) { var b = new TextEncoder().encode(s), bin = ''; b.forEach(function (x) { bin += String.fromCharCode(x); }); return btoa(bin); }
  function b64dec(s) { var bin = atob(s.replace(/\s+/g, '')), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new TextDecoder('utf-8', { fatal: true }).decode(a); }
  calc({ id: 'c-b64url', title: 'Base64 and URL encoding', desc: 'Encode and decode text in Base64 and percent-encoding.', topic: 'checksums', inputs: [I('t', 'Text', 'hello linux & friends?')],
    compute: function (v) {
      var rows = [['Base64 encoded', b64enc(v.t)]], dec; try { dec = b64dec(v.t); rows.push(['Base64 decoded (if input is Base64)', dec]); } catch (e) { rows.push(['Base64 decoded (if input is Base64)', '(not valid Base64)']); }
      rows.push(['URL encoded', encodeURIComponent(v.t)]); var ud; try { ud = decodeURIComponent(v.t); } catch (e) { ud = '(not valid percent-encoding)'; } rows.push(['URL decoded', ud]);
      return { rows: rows, note: 'Base64 is an encoding, not encryption: anyone can decode it.', cmds: ['echo -n ' + sq(v.t) + ' | base64', 'echo ' + sq(b64enc(v.t)) + ' | base64 -d'] };
    } });
  calc({ id: 'c-json', title: 'JSON validator and formatter', desc: 'Paste JSON to validate, pretty-print or minify it.', topic: 'jq', inputs: [A('j', 'JSON', '{"site":"linuxverse","pages":[{"name":"home","hits":120},{"name":"labs","hits":45}]}', 6)],
    compute: function (v) {
      var o; try { o = JSON.parse(v.j); } catch (e) { return { err: 'Invalid JSON: ' + e.message }; }
      var keys = 0, walk = function (x) { if (x && typeof x === 'object') Object.keys(x).forEach(function (k) { keys++; walk(x[k]); }); }; walk(o);
      return { rows: [['Valid', 'yes'], ['Type', Array.isArray(o) ? 'array (' + o.length + ' items)' : typeof o], ['Keys and items', keys], ['Minified', JSON.stringify(o)]], html: '<pre class="code" style="white-space:pre-wrap">' + esc(JSON.stringify(o, null, 2)) + '</pre>', cmds: ['jq . data.json', 'jq -c . data.json', 'jq empty data.json && echo valid'] };
    } });
  calc({ id: 'c-wc', title: 'wc: count text', desc: 'Lines, words, characters and bytes, like wc.', topic: 'pipes', inputs: [A('t', 'Text', 'one two three\nfour five\n\nsix', 6)],
    compute: function (v) {
      var t = v.t, l = lines(t), words = (t.match(/\S+/g) || []).length, bytes = new TextEncoder().encode(t).length, nl = (t.match(/\n/g) || []).length;
      return { rows: [['Lines (wc -l counts newlines)', nl], ['Lines of text', l.length], ['Words (wc -w)', words], ['Characters (wc -m)', Array.from(t).length], ['Bytes (wc -c)', bytes], ['Longest line (wc -L)', l.reduce(function (m, x) { return Math.max(m, x.length); }, 0)], ['Blank lines', l.filter(function (x) { return !x.trim(); }).length], ['Unique lines', new Set(l).size]], cmds: ['wc file.txt', 'wc -l -w -m -c file.txt'], note: 'wc -l counts newline characters, so a last line without a newline is not counted.' };
    } });
  calc({ id: 'c-sortuniq', title: 'sort and uniq playground', desc: 'Apply sort and uniq options to your own lines and see the result.', topic: 'sortuniq', inputs: [A('t', 'Lines', 'pear\napple\nbanana\napple\ncherry\nbanana\napple', 7), S('o', 'Order', 'a', [['a', 'alphabetical'], ['r', 'reverse alphabetical'], ['n', 'numeric (-n)'], ['none', 'keep original order']]), S('u', 'Repeats', 'none', [['none', 'keep all'], ['u', 'drop duplicates (sort -u)'], ['c', 'count (uniq -c)'], ['d', 'only duplicated (uniq -d)'], ['rank', 'rank by count (uniq -c | sort -rn)']])],
    compute: function (v) {
      var l = lines(v.t), out = l.slice(), cmd = [];
      if (v.o === 'a') { out.sort(); cmd.push('sort'); } else if (v.o === 'r') { out.sort().reverse(); cmd.push('sort -r'); } else if (v.o === 'n') { out.sort(function (a, b) { return parseFloat(a) - parseFloat(b); }); cmd.push('sort -n'); }
      if (v.u === 'u') { out = out.filter(function (x, i) { return out.indexOf(x) === i; }); cmd.push('uniq'); }
      else if (v.u !== 'none') { var m = {}, order = []; out.forEach(function (x) { if (!(x in m)) { m[x] = 0; order.push(x); } m[x]++; }); if (v.u === 'd') { out = order.filter(function (x) { return m[x] > 1; }); cmd.push('uniq -d'); } else { out = order.map(function (x) { return [m[x], x]; }); if (v.u === 'rank') out.sort(function (a, b) { return b[0] - a[0]; }); out = out.map(function (p) { return ('      ' + p[0]).slice(-6) + ' ' + p[1]; }); cmd.push('uniq -c' + (v.u === 'rank' ? ' | sort -rn' : '')); } }
      if (v.u !== 'none' && v.o === 'none') return { err: 'uniq only merges neighbouring lines, so sort first. This simulation groups them anyway.', html: '<pre class="code">' + esc(out.join('\n')) + '</pre>', cmds: [cmd.length ? 'sort file.txt | ' + cmd.join(' | ') : 'cat file.txt'] };
      return { html: '<pre class="code">' + esc(out.join('\n')) + '</pre>', cmds: ['cat file.txt' + (cmd.length ? ' | ' + cmd.join(' | ') : '')] };
    } });
  calc({ id: 'c-cutawk', title: 'cut and awk columns', desc: 'Extract fields from delimited text with cut, and see the awk version.', topic: 'sedawk', inputs: [A('t', 'Text', 'root:x:0:0:root:/root:/bin/bash\nssk:x:1000:1000:Ssk:/home/ssk:/bin/bash\nwww-data:x:33:33:www:/var/www:/usr/sbin/nologin', 5), I('d', 'Delimiter', ':'), I('f', 'Fields', '1,6')],
    compute: function (v) {
      var d = v.d || '\t', want = []; v.f.split(',').forEach(function (p) { var m = p.trim().match(/^(\d+)(?:-(\d*))?$/); if (!m) return; var a = +m[1], b = m[2] === undefined ? a : (m[2] === '' ? 99 : +m[2]); for (var i = a; i <= b; i++) want.push(i); });
      if (!want.length) return { err: 'Fields look like 1,3 or 2-4 or 3-.' };
      var out = lines(v.t).map(function (ln) { var parts = ln.split(d); if (parts.length === 1 && ln.indexOf(d) < 0) return ln; return want.filter(function (i) { return i <= parts.length; }).map(function (i) { return parts[i - 1]; }).join(d); });
      return { html: '<pre class="code">' + esc(out.join('\n')) + '</pre>', cmds: ['cut -d' + sq(d) + ' -f' + v.f + ' file', "awk -F" + sq(d) + " '{print " + want.slice(0, 5).map(function (i) { return '$' + i; }).join(', ') + "}' file"], note: 'cut treats every delimiter as a separator; for aligned columns with several spaces use awk.' };
    } });
  function expandSet(s) { var o = '', i; for (i = 0; i < s.length; i++) { if (s[i + 1] === '-' && i + 2 < s.length) { for (var c = s.charCodeAt(i); c <= s.charCodeAt(i + 2); c++) o += String.fromCharCode(c); i += 2; } else o += s[i]; } return o; }
  calc({ id: 'c-tr', title: 'tr translator', desc: 'Translate, delete or squeeze characters, like tr.', topic: 'pipes', inputs: [A('t', 'Input', 'Hello   Linux World', 3), I('a', 'SET1', 'a-z'), I('b', 'SET2', 'A-Z'), S('m', 'Mode', 't', [['t', 'translate SET1 to SET2'], ['d', 'delete SET1 (-d)'], ['s', 'squeeze repeats of SET1 (-s)'], ['c', 'translate everything NOT in SET1 (-c)']])],
    compute: function (v) {
      var s1 = expandSet(v.a), s2 = expandSet(v.b), t = v.t, out = '', i, c;
      if (!s1) return { err: 'SET1 is empty.' };
      if (v.m === 'd') out = t.split('').filter(function (x) { return s1.indexOf(x) < 0; }).join('');
      else if (v.m === 's') { for (i = 0; i < t.length; i++) { c = t[i]; if (s1.indexOf(c) >= 0 && out[out.length - 1] === c) continue; out += c; } }
      else if (v.m === 'c') { if (!s2) return { err: 'SET2 needs a character for -c.' }; out = t.split('').map(function (x) { return x === '\n' || s1.indexOf(x) >= 0 ? x : s2[s2.length - 1]; }).join(''); }
      else { if (!s2) return { err: 'SET2 is empty.' }; out = t.split('').map(function (x) { var k = s1.indexOf(x); return k < 0 ? x : s2[Math.min(k, s2.length - 1)]; }).join(''); }
      var fl = { t: '', d: ' -d', s: ' -s', c: ' -c' }[v.m];
      return { html: '<pre class="code">' + esc(out) + '</pre>', cmds: ['tr' + fl + ' ' + sq(v.a) + (v.m === 'd' || v.m === 's' && !v.b ? '' : ' ' + sq(v.b)) + ' < input.txt'], note: 'tr works on single characters, never whole words. Ranges like a-z are allowed.' };
    } });
  calc({ id: 'c-diff', title: 'Line diff (diff -u)', desc: 'Compare two texts and see added and removed lines.', topic: 'diffpatch', inputs: [A('a', 'Old text', 'server {\n  listen 80;\n  root /var/www;\n}', 5), A('b', 'New text', 'server {\n  listen 443 ssl;\n  root /var/www;\n  index index.html;\n}', 5)],
    compute: function (v) {
      var a = lines(v.a), b = lines(v.b), n = a.length, m = b.length, L = [], i, j;
      for (i = 0; i <= n; i++) { L[i] = []; for (j = 0; j <= m; j++) L[i][j] = 0; }
      for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      var out = [], add = 0, del = 0; i = 0; j = 0;
      while (i < n && j < m) { if (a[i] === b[j]) { out.push('  ' + a[i]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) { out.push('- ' + a[i]); del++; i++; } else { out.push('+ ' + b[j]); add++; j++; } }
      while (i < n) { out.push('- ' + a[i++]); del++; } while (j < m) { out.push('+ ' + b[j++]); add++; }
      var html = '<pre class="code diff">' + out.map(function (x) { return '<span class="' + (x[0] === '+' ? 'df-add' : x[0] === '-' ? 'df-del' : '') + '">' + esc(x) + '</span>'; }).join('\n') + '</pre>';
      return { rows: [['Lines added', add], ['Lines removed', del], ['Unchanged', out.length - add - del]], html: html, cmds: ['diff -u old.conf new.conf', 'diff -u old.conf new.conf > change.patch && patch < change.patch'] };
    } });

  /* ---- networking and reference tables ---- */
  function ip2n(s) { var p = s.trim().split('.'); if (p.length !== 4) return NaN; var n = 0; for (var i = 0; i < 4; i++) { if (!/^\d+$/.test(p[i]) || +p[i] > 255) return NaN; n = n * 256 + +p[i]; } return n; }
  function n2ip(n) { return [Math.floor(n / 16777216) % 256, Math.floor(n / 65536) % 256, Math.floor(n / 256) % 256, n % 256].join('.'); }
  calc({ id: 'c-vlsm', title: 'Subnet splitter', desc: 'Split a network into equal subnets and list each range.', topic: 'ip', inputs: [I('net', 'Network (CIDR)', '192.168.10.0/24'), I('n', 'Number of subnets (power of 2)', '4')],
    compute: function (v) {
      var m = v.net.trim().match(/^([\d.]+)\/(\d{1,2})$/); if (!m || isNaN(ip2n(m[1]))) return { err: 'Use CIDR form like 192.168.10.0/24.' };
      var p = +m[2], n = parseInt(v.n, 10); if (p > 30 || p < 0) return { err: 'Prefix must be 0 to 30.' };
      if (!(n >= 1) || (n & (n - 1))) return { err: 'The number of subnets must be a power of 2 (2, 4, 8, 16 ...).' };
      var bits = Math.log2(n), np = p + bits; if (np > 30) return { err: 'Too many subnets for this network.' };
      var size = Math.pow(2, 32 - np), base = Math.floor(ip2n(m[1]) / Math.pow(2, 32 - p)) * Math.pow(2, 32 - p), rows = [];
      for (var i = 0; i < Math.min(n, 64); i++) { var s = base + i * size; rows.push(['#' + (i + 1) + '  ' + n2ip(s) + '/' + np, 'hosts ' + n2ip(s + 1) + ' to ' + n2ip(s + size - 2) + '   broadcast ' + n2ip(s + size - 1)]); }
      return { rows: [['Each subnet', '/' + np + ' with ' + (size - 2) + ' usable hosts']].concat(rows), cmds: ['ipcalc ' + m[1] + '/' + p + ' /' + np, 'python3 -c "import ipaddress;print(list(ipaddress.ip_network(\'' + m[1] + '/' + p + '\').subnets(prefixlen_diff=' + bits + ')))"'] };
    } });
  calc({ id: 'c-netmask', title: 'Netmask and range checker', desc: 'Convert a prefix to a mask and check whether an address is inside a network.', topic: 'ip', inputs: [I('mask', 'Prefix or mask', '/22'), I('ip', 'Address to test', '10.4.3.200'), I('net', 'Network address', '10.4.0.0')],
    compute: function (v) {
      var s = v.mask.trim().replace('/', ''), p;
      if (/^\d{1,2}$/.test(s)) p = +s; else { var mn = ip2n(s); if (isNaN(mn)) return { err: 'Enter /22 or a mask like 255.255.252.0.' }; var bin = (mn >>> 0).toString(2).padStart(32, '0'); if (!/^1*0*$/.test(bin)) return { err: 'That is not a valid contiguous mask.' }; p = bin.indexOf('0') < 0 ? 32 : bin.indexOf('0'); }
      if (p < 0 || p > 32) return { err: 'Prefix must be 0 to 32.' };
      var mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0, rows = [['Prefix', '/' + p], ['Netmask', n2ip(mask)], ['Wildcard', n2ip((~mask) >>> 0)], ['Addresses', Math.pow(2, 32 - p).toLocaleString('en-US')], ['Usable hosts', p >= 31 ? Math.pow(2, 32 - p) : Math.pow(2, 32 - p) - 2]];
      var a = ip2n(v.ip), nt = ip2n(v.net);
      if (!isNaN(a) && !isNaN(nt)) { var inside = ((a & mask) >>> 0) === ((nt & mask) >>> 0); rows.push([v.ip + ' in ' + v.net + '/' + p, inside ? 'yes, inside' : 'no, outside']); }
      return { rows: rows, cmds: ['ipcalc ' + v.net + '/' + p] };
    } });
  function v6expand(s) {
    s = s.trim().toLowerCase(); if (!/^[0-9a-f:]+$/.test(s) || (s.match(/::/g) || []).length > 1) return null;
    var parts = s.split('::'), head = parts[0] ? parts[0].split(':') : [], tail = parts.length > 1 && parts[1] ? parts[1].split(':') : [];
    if (parts.length === 1 && head.length !== 8) return null; var fill = 8 - head.length - tail.length; if (fill < 0 || (parts.length > 1 && fill < 1)) return null;
    var all = head.concat(new Array(parts.length > 1 ? fill : 0).fill('0'), tail); if (all.length !== 8 || all.some(function (x) { return !/^[0-9a-f]{1,4}$/.test(x); })) return null;
    return all.map(function (x) { return x.padStart(4, '0'); });
  }
  calc({ id: 'c-ipv6', title: 'IPv6 expand and compress', desc: 'Write an IPv6 address in full or in its shortest form.', topic: 'ip', inputs: [I('a', 'IPv6 address', '2001:db8::ff00:42:8329')],
    compute: function (v) {
      var g = v6expand(v.a); if (!g) return { err: 'Not a valid IPv6 address.' };
      var sh = g.map(function (x) { return x.replace(/^0+(?=.)/, ''); }), best = -1, bl = 0, i = 0;
      while (i < 8) { if (sh[i] === '0') { var j = i; while (j < 8 && sh[j] === '0') j++; if (j - i > bl && j - i > 1) { best = i; bl = j - i; } i = j; } else i++; }
      var comp = best < 0 ? sh.join(':') : sh.slice(0, best).join(':') + '::' + sh.slice(best + bl).join(':');
      var type = g[0] === 'fe80' ? 'link-local' : g.join('') === '0'.repeat(31) + '1' ? 'loopback (::1)' : /^f[cd]/.test(g[0]) ? 'unique local (private)' : /^2001?|^2[0-3]/.test(g[0]) ? 'global unicast' : g[0].slice(0, 2) === 'ff' ? 'multicast' : 'other';
      return { rows: [['Full', g.join(':')], ['Shortest', comp], ['Type', type]], cmds: ['ip -6 addr', 'ping -6 ' + comp] };
    } });
  var HTTP = [[100, 'Continue'], [101, 'Switching Protocols'], [200, 'OK'], [201, 'Created'], [202, 'Accepted'], [204, 'No Content'], [206, 'Partial Content'], [301, 'Moved Permanently'], [302, 'Found (temporary redirect)'], [304, 'Not Modified'], [307, 'Temporary Redirect'], [308, 'Permanent Redirect'], [400, 'Bad Request'], [401, 'Unauthorized (log in needed)'], [403, 'Forbidden (logged in but not allowed)'], [404, 'Not Found'], [405, 'Method Not Allowed'], [408, 'Request Timeout'], [409, 'Conflict'], [410, 'Gone'], [413, 'Payload Too Large'], [414, 'URI Too Long'], [418, "I'm a teapot"], [422, 'Unprocessable Content'], [429, 'Too Many Requests'], [500, 'Internal Server Error'], [501, 'Not Implemented'], [502, 'Bad Gateway (upstream unreachable)'], [503, 'Service Unavailable'], [504, 'Gateway Timeout']];
  function table(rows, q, cols, mk) { var s = q.trim().toLowerCase(); var hit = rows.filter(function (r) { return !s || r.join(' ').toLowerCase().indexOf(s) >= 0; }); return hit.length ? '<div class="tbl-wrap"><table><thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + hit.map(mk).join('') + '</tbody></table></div>' : '<p class="muted">Nothing found.</p>'; }
  calc({ id: 'c-http', title: 'HTTP status codes', desc: 'Search status codes by number or meaning.', topic: 'curlwget', inputs: [I('q', 'Search (200, redirect, gateway...)', '50')],
    compute: function (v) { return { html: table(HTTP, v.q, ['Code', 'Meaning', 'Class'], function (r) { return '<tr><td class="mono">' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + ['', 'info', 'success', 'redirect', 'client error', 'server error'][Math.floor(r[0] / 100)] + '</td></tr>'; }), cmds: ['curl -s -o /dev/null -w "%{http_code}\\n" https://example.com'] }; } });
  var PORTS = [[20, 'FTP data', 'tcp'], [21, 'FTP', 'tcp'], [22, 'SSH', 'tcp'], [23, 'Telnet (insecure)', 'tcp'], [25, 'SMTP mail', 'tcp'], [53, 'DNS', 'tcp/udp'], [67, 'DHCP server', 'udp'], [68, 'DHCP client', 'udp'], [80, 'HTTP', 'tcp'], [110, 'POP3', 'tcp'], [123, 'NTP time', 'udp'], [143, 'IMAP', 'tcp'], [161, 'SNMP', 'udp'], [389, 'LDAP', 'tcp'], [443, 'HTTPS', 'tcp'], [445, 'SMB file sharing', 'tcp'], [465, 'SMTPS', 'tcp'], [514, 'syslog', 'udp'], [587, 'mail submission', 'tcp'], [631, 'CUPS printing', 'tcp'], [636, 'LDAPS', 'tcp'], [873, 'rsync', 'tcp'], [993, 'IMAPS', 'tcp'], [995, 'POP3S', 'tcp'], [1194, 'OpenVPN', 'udp'], [2049, 'NFS', 'tcp'], [2375, 'Docker (unencrypted!)', 'tcp'], [3000, 'dev servers (Node, Grafana)', 'tcp'], [3306, 'MySQL / MariaDB', 'tcp'], [3389, 'RDP', 'tcp'], [5432, 'PostgreSQL', 'tcp'], [5900, 'VNC', 'tcp'], [6379, 'Redis', 'tcp'], [8080, 'HTTP alternate', 'tcp'], [8443, 'HTTPS alternate', 'tcp'], [9090, 'Prometheus', 'tcp'], [27017, 'MongoDB', 'tcp'], [51820, 'WireGuard', 'udp']];
  calc({ id: 'c-ports', title: 'Well-known ports', desc: 'Look up which service uses a port, or which port a service uses.', topic: 'ports', inputs: [I('q', 'Search (22, ssh, database...)', 'ssh')],
    compute: function (v) { return { html: table(PORTS, v.q, ['Port', 'Service', 'Protocol'], function (r) { return '<tr><td class="mono">' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + r[2] + '</td></tr>'; }), cmds: ['ss -tulpn | grep :' + (/^\d+$/.test(v.q.trim()) ? v.q.trim() : '22'), 'getent services ' + (/^\d+$/.test(v.q.trim()) ? v.q.trim() : 'ssh')], note: 'Ports below 1024 are privileged: only root can listen on them.' }; } });
  var SIGS = [[1, 'SIGHUP', 'terminate', 'yes', 'Terminal closed; daemons often reload config'], [2, 'SIGINT', 'terminate', 'yes', 'Ctrl+C'], [3, 'SIGQUIT', 'core dump', 'yes', 'Ctrl+\\'], [6, 'SIGABRT', 'core dump', 'yes', 'abort() called'], [9, 'SIGKILL', 'terminate', 'NO', 'Cannot be caught or ignored'], [10, 'SIGUSR1', 'terminate', 'yes', 'User defined'], [11, 'SIGSEGV', 'core dump', 'yes', 'Invalid memory access'], [12, 'SIGUSR2', 'terminate', 'yes', 'User defined'], [13, 'SIGPIPE', 'terminate', 'yes', 'Write to a closed pipe'], [14, 'SIGALRM', 'terminate', 'yes', 'Timer expired'], [15, 'SIGTERM', 'terminate', 'yes', 'Polite stop request (default for kill)'], [17, 'SIGCHLD', 'ignore', 'yes', 'A child process ended'], [18, 'SIGCONT', 'continue', 'yes', 'Resume a stopped process'], [19, 'SIGSTOP', 'stop', 'NO', 'Cannot be caught; pauses the process'], [20, 'SIGTSTP', 'stop', 'yes', 'Ctrl+Z']];
  calc({ id: 'c-signals', title: 'Signal reference', desc: 'Search signals by name or number, with default action and whether a program can catch them.', topic: 'signals', inputs: [I('q', 'Search (9, term, stop...)', 'term')],
    compute: function (v) { return { html: table(SIGS, v.q, ['No.', 'Name', 'Default action', 'Catchable', 'Meaning'], function (r) { return '<tr><td class="mono">' + r[0] + '</td><td class="mono">' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td>' + esc(r[4]) + '</td></tr>'; }), cmds: ['kill -l', 'kill -TERM 2450'] }; } });
  var SIGN = { 1: 'SIGHUP', 2: 'SIGINT', 3: 'SIGQUIT', 6: 'SIGABRT', 9: 'SIGKILL', 11: 'SIGSEGV', 13: 'SIGPIPE', 14: 'SIGALRM', 15: 'SIGTERM' };
  calc({ id: 'c-exit', title: 'Exit code decoder', desc: 'Type the number you got in $? and see what it means.', topic: 'exitcodes', inputs: [I('c', 'Exit code', '137')],
    compute: function (v) {
      var n = parseInt(v.c, 10); if (!(n >= 0 && n <= 255)) return { err: 'Exit codes are 0 to 255.' };
      var base = { 0: 'Success', 1: 'General error (the command failed)', 2: 'Misuse of a shell built-in or wrong arguments', 126: 'Found but not executable (permission or not a program)', 127: 'Command not found', 255: 'Exit status out of range, or SSH connection error' }[n], extra = [];
      if (n > 128 && n < 160) { var s = n - 128; base = base || 'Killed by signal ' + s + (SIGN[s] ? ' (' + SIGN[s] + ')' : ''); if (s === 9) extra.push(['Likely cause', 'kill -9, or the out-of-memory killer']); if (s === 11) extra.push(['Likely cause', 'Segmentation fault: a bug in the program']); if (s === 15) extra.push(['Likely cause', 'Stopped politely with kill or systemctl stop']); if (s === 2) extra.push(['Likely cause', 'You pressed Ctrl+C']); }
      return { rows: [['Code', n], ['Meaning', base || 'Program-specific error (read its manual)']].concat(extra), cmds: ['false; echo $?', 'ls /nope; echo $?', 'man ' + (n === 0 ? 'bash' : 'bash') + ' | less +/EXIT\\ STATUS'], note: 'A script usually exits with 0 for success and 1 to 125 for its own errors.' };
    } });
  calc({ id: 'c-load', title: 'Load average reader', desc: 'Is a load of 6.2 on 4 cores a problem? Enter the three numbers from uptime.', topic: 'monitor', inputs: [I('c', 'CPU cores', '4'), I('l1', 'Load 1 min', '6.2'), I('l5', 'Load 5 min', '4.8'), I('l15', 'Load 15 min', '2.1')],
    compute: function (v) {
      var c = parseFloat(v.c), a = [v.l1, v.l5, v.l15].map(parseFloat); if (!(c > 0) || a.some(isNaN)) return { err: 'Enter the cores and three load numbers.' };
      var per = a.map(function (x) { return x / c; }), verdict = per[0] < .7 ? 'Healthy: plenty of headroom.' : per[0] < 1 ? 'Busy but coping.' : per[0] < 2 ? 'Overloaded: processes are queueing for a CPU.' : 'Heavily overloaded: expect slowness.';
      var trend = a[0] > a[2] * 1.3 ? 'rising (recent spike)' : a[0] < a[2] * .7 ? 'falling (recovering)' : 'steady';
      return { rows: [['Load per core (1/5/15 min)', per.map(function (x) { return x.toFixed(2); }).join(' / ')], ['Verdict', verdict], ['Trend', trend]], cmds: ['uptime', 'nproc', 'top -b -n 1 | head -n 15', 'ps aux --sort=-%cpu | head -n 5'], note: 'Linux load also counts processes waiting for disk, so high load with an idle CPU often means slow storage.' };
    } });

  calc({ id: 'c-free', title: 'free -m reader', desc: 'Enter the numbers from free -m and learn whether memory is really a problem.', topic: 'resources', inputs: [I('t', 'total', '8000'), I('u', 'used', '3100'), I('f', 'free', '400'), I('c', 'buff/cache', '4500'), I('a', 'available', '4600'), I('st', 'swap used (optional)', '0')],
    compute: function (v) {
      var t = +v.t, u = +v.u, f = +v.f, c = +v.c, a = +v.a, sw = +v.st || 0;
      if (!(t > 0) || [u, f, c, a].some(function (x) { return !(x >= 0); })) return { err: 'Enter numbers in MiB from the free -m line.' };
      var pa = a / t * 100, verdict = pa > 25 ? 'Healthy: lots of memory can be reclaimed.' : pa > 10 ? 'Getting tight: watch for swapping.' : 'Low: the system will swap or the OOM killer may run.';
      return { rows: [['Truly used by programs', (u / t * 100).toFixed(1) + '% of RAM'], ['File cache (reclaimable)', (c / t * 100).toFixed(1) + '%'], ['Free (unused)', (f / t * 100).toFixed(1) + '%  (low free is normal)'], ['Available for programs', pa.toFixed(1) + '%'], ['Swap in use', sw ? sw + ' MiB' + (sw > t * .2 ? ' (a lot: check for pressure)' : '') : 'none'], ['Verdict', verdict]], cmds: ['free -m', 'ps aux --sort=-%mem | head -n 5', 'vmstat 1 5'], note: 'Read "available", not "free": Linux uses spare RAM as file cache and hands it back when programs need it.' };
    } });

  /* ---------- simulators ---------- */
  function sim(id, title, desc, topic, render) { register(SIM, id, title, desc, topic, render); }
  function simUI(box, inputs, html) {
    box.innerHTML = '<div class="lab-grid">' + inputs.map(function (f) {
      if (f.t === 'sel') return '<label class="field"><span>' + esc(f.label) + '</span><select data-k="' + f.k + '">' + f.opts.map(function (x) { return '<option value="' + esc(x[0]) + '"' + (String(x[0]) === String(f.def) ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join('') + '</select></label>';
      if (f.t === 'area') return '<label class="field wide"><span>' + esc(f.label) + '</span><textarea data-k="' + f.k + '" rows="' + (f.rows || 4) + '" class="mono" style="height:auto;padding:10px" spellcheck="false">' + esc(f.def) + '</textarea></label>';
      return '<label class="field"><span>' + esc(f.label) + '</span><input data-k="' + f.k + '" class="mono" value="' + esc(f.def) + '" spellcheck="false" autocomplete="off"></label>';
    }).join('') + '</div>' + (html || '') + '<div id="s-out"></div><div id="s-cmds"></div><p id="s-note" class="muted sm"></p>';
  }
  function simRun(box, inputs, compute) {
    var v = {}; inputs.forEach(function (f) { v[f.k] = f.def; });
    function run() {
      var r; try { r = compute(v) || {}; } catch (e) { r = { err: 'Could not simulate: ' + e.message }; }
      var h = ''; if (r.err) h += '<p class="bad">' + esc(r.err) + '</p>';
      if (r.rows) h += '<div class="kv">' + r.rows.map(function (x) { return '<div><dt>' + esc(x[0]) + '</dt><dd class="mono">' + esc(x[1]) + '</dd></div>'; }).join('') + '</div>';
      if (r.html) h += r.html;
      $('#s-out', box).innerHTML = h; $('#s-cmds', box).innerHTML = (r.cmds || []).map(cmdLine).join(''); $('#s-note', box).textContent = r.note || '';
    }
    box.addEventListener('input', function (e) { var k = e.target.dataset.k; if (k) { v[k] = e.target.value; run(); } });
    box.addEventListener('change', function (e) { var k = e.target.dataset.k; if (k) { v[k] = e.target.value; run(); } });
    run(); return run;
  }
  function gantt(segs) { return '<div class="gantt">' + segs.map(function (s) { return '<span class="gt" style="flex:' + s[1] + '" title="' + esc(s[0]) + ' ' + s[1] + '">' + esc(s[0]) + '</span>'; }).join('') + '</div>'; }

  sim('s-rr', 'CPU scheduler: round robin', 'Give each process a time slice and watch waiting and turnaround times.', 'nice', function (box) {
    var inp = [I('p', 'Processes (name:burst, ...)', 'A:5, B:3, C:8, D:2'), I('q', 'Time slice (quantum)', '2'), S('alg', 'Algorithm', 'rr', [['rr', 'Round robin'], ['fcfs', 'First come, first served'], ['sjf', 'Shortest job first']])];
    simUI(box, inp);
    simRun(box, inp, function (v) {
      var ps = v.p.split(',').map(function (x) { var m = x.trim().match(/^(\w+)\s*:\s*(\d+)$/); return m ? { n: m[1], b: +m[2], r: +m[2], w: 0, t: 0 } : null; });
      if (ps.some(function (x) { return !x || !x.b; }) || !ps.length) return { err: 'Write processes like A:5, B:3 (name:burst time).' };
      var q = parseInt(v.q, 10), time = 0, segs = [], queue = ps.slice();
      if (v.alg === 'sjf') queue.sort(function (a, b) { return a.b - b.b; });
      if (v.alg === 'rr' && !(q > 0)) return { err: 'The quantum must be at least 1.' };
      if (v.alg === 'rr') { while (queue.length) { var p = queue.shift(), run = Math.min(q, p.r); segs.push([p.n, run]); time += run; p.r -= run; if (p.r > 0) queue.push(p); else p.t = time; } }
      else queue.forEach(function (p) { segs.push([p.n, p.b]); time += p.b; p.t = time; });
      ps.forEach(function (p) { p.w = p.t - p.b; });
      var aw = ps.reduce(function (s, p) { return s + p.w; }, 0) / ps.length, at = ps.reduce(function (s, p) { return s + p.t; }, 0) / ps.length;
      return { html: gantt(segs), rows: ps.map(function (p) { return [p.n, 'burst ' + p.b + ', finished at ' + p.t + ', waited ' + p.w]; }).concat([['Average waiting', aw.toFixed(2)], ['Average turnaround', at.toFixed(2)]]), note: 'All processes arrive at time 0. Round robin is fair to everyone; shortest-job-first gives the lowest average wait but can starve long jobs. Linux uses CFS, which shares time by weight (see the nice lab).' };
    });
  });
  sim('s-page', 'Page replacement', 'Count page faults for FIFO, LRU and the optimal algorithm.', 'swap', function (box) {
    var inp = [I('ref', 'Page references', '7 0 1 2 0 3 0 4 2 3 0 3 2'), I('fr', 'Frames in RAM', '3')];
    simUI(box, inp);
    simRun(box, inp, function (v) {
      var ref = v.ref.trim().split(/[\s,]+/), f = parseInt(v.fr, 10); if (!(f >= 1 && f <= 8) || !ref.length || ref[0] === '') return { err: 'Enter references and 1 to 8 frames.' };
      function simulate(kind) {
        var mem = [], faults = 0, hist = [], ord = [];
        ref.forEach(function (p, i) {
          var hit = mem.indexOf(p) >= 0;
          if (hit) { if (kind === 'lru') { ord.splice(ord.indexOf(p), 1); ord.push(p); } }
          else {
            faults++;
            if (mem.length < f) { mem.push(p); ord.push(p); }
            else {
              var victim;
              if (kind === 'fifo' || kind === 'lru') victim = ord.shift();
              else { var far = -1; mem.forEach(function (m) { var nx = ref.indexOf(m, i + 1); if (nx < 0) nx = 1e9; if (nx > far) { far = nx; victim = m; } }); }
              mem[mem.indexOf(victim)] = p; if (kind === 'opt') { ord = mem.slice(); } else ord.push(p);
            }
          }
          hist.push((hit ? '  ' : '* ') + p + ' [' + mem.join(' ') + ']');
        });
        return { faults: faults, hist: hist };
      }
      var r = { fifo: simulate('fifo'), lru: simulate('lru'), opt: simulate('opt') };
      return { rows: [['FIFO faults', r.fifo.faults + ' of ' + ref.length], ['LRU faults', r.lru.faults + ' of ' + ref.length], ['Optimal faults', r.opt.faults + ' of ' + ref.length]], html: '<details class="mini-d"><summary>LRU step by step (* = page fault)</summary><pre class="code">' + esc(r.lru.hist.join('\n')) + '</pre></details>', note: 'A page fault means the page had to be loaded from disk. The optimal algorithm needs to know the future, so it is only a yardstick. Linux approximates LRU. Try 4 frames with FIFO to see Belady\'s anomaly.', cmds: ['vmstat 1 5', 'sar -B 1 5'] };
    });
  });
  sim('s-disk', 'Disk head scheduling', 'Compare how far the disk head moves for FCFS, SSTF, SCAN and C-SCAN.', 'lsblk', function (box) {
    var inp = [I('rq', 'Track requests', '98 183 37 122 14 124 65 67'), I('hd', 'Head starts at', '53'), I('max', 'Highest track', '199')];
    simUI(box, inp);
    simRun(box, inp, function (v) {
      var rq = v.rq.trim().split(/[\s,]+/).map(Number), hd = parseInt(v.hd, 10), max = parseInt(v.max, 10);
      if (!rq.length || rq.some(isNaN) || isNaN(hd) || !(max > 0) || rq.some(function (x) { return x < 0 || x > max; })) return { err: 'Enter tracks between 0 and the highest track.' };
      function total(path) { var t = 0, c = hd; path.forEach(function (p) { t += Math.abs(p - c); c = p; }); return t; }
      var fcfs = rq.slice(), left = rq.slice(), sstf = [], cur = hd;
      while (left.length) { var best = 0; left.forEach(function (x, i) { if (Math.abs(x - cur) < Math.abs(left[best] - cur)) best = i; }); cur = left.splice(best, 1)[0]; sstf.push(cur); }
      var up = rq.filter(function (x) { return x >= hd; }).sort(function (a, b) { return a - b; }), down = rq.filter(function (x) { return x < hd; }).sort(function (a, b) { return b - a; });
      var scan = up.concat(max > (up[up.length - 1] || 0) ? [max] : [], down), cscan = up.concat(max > (up[up.length - 1] || 0) ? [max] : [], [0], down.slice().reverse());
      return { rows: [['FCFS (in order)', total(fcfs) + ' tracks: ' + [hd].concat(fcfs).join(' > ')], ['SSTF (nearest first)', total(sstf) + ' tracks: ' + [hd].concat(sstf).join(' > ')], ['SCAN (elevator)', total(scan) + ' tracks: ' + [hd].concat(scan).join(' > ')], ['C-SCAN (one direction)', total(cscan) + ' tracks: ' + [hd].concat(cscan).join(' > ')]], note: 'Spinning disks benefit from ordering requests; SSDs do not have a moving head. Linux I/O schedulers (mq-deadline, bfq, none) apply these ideas.', cmds: ['cat /sys/block/sda/queue/scheduler', 'iostat -x 1 3'] };
    });
  });
  sim('s-path', 'PATH search simulator', 'See which program runs when several folders contain the same name.', 'shell', function (box) {
    var inp = [I('path', 'PATH', '/home/ssk/bin:/usr/local/bin:/usr/bin:/bin'), I('cmd', 'Command typed', 'python3'), A('fs', 'Files in each folder (folder: names)', '/home/ssk/bin: python3 deploy\n/usr/local/bin: python3 node\n/usr/bin: python3 ls grep\n/bin: sh', 5)];
    simUI(box, inp);
    simRun(box, inp, function (v) {
      var fs = {}; lines(v.fs).forEach(function (l) { var i = l.indexOf(':'); if (i > 0) fs[l.slice(0, i).trim()] = l.slice(i + 1).trim().split(/\s+/); });
      var dirs = v.path.split(':').filter(Boolean), c = v.cmd.trim(); if (!c) return { err: 'Type a command name.' };
      if (c.indexOf('/') >= 0) return { rows: [['Result', 'A name with a slash skips PATH and runs ' + c + ' directly.']] };
      var steps = [], hit = [];
      dirs.forEach(function (d) { var has = (fs[d] || []).indexOf(c) >= 0; steps.push([d, has ? 'found ' + c : 'not here']); if (has) hit.push(d + '/' + c); });
      return { rows: steps.concat([['type -a ' + c, hit.length ? hit.join('   ') : 'command not found'], ['Runs', hit.length ? hit[0] + (hit.length > 1 ? '   (shadows ' + (hit.length - 1) + ' other)' : '') : 'bash: ' + c + ': command not found']]), note: 'The shell tries the folders left to right and stops at the first match. Put your own folder first to override a system program, last to be safe.', cmds: ['echo $PATH | tr : "\\n"', 'type -a ' + c, 'hash -r'] };
    });
  });
  sim('s-history', 'History expansion', 'Try !!, !$, !n, !string and ^old^new against a sample history.', 'shell', function (box) {
    var inp = [A('h', 'History (one command per line)', 'ls /etc/ssh\ncat /etc/ssh/sshd_config\ngrep Port /etc/ssh/sshd_config\nsudo systemctl restart ssh\ncd ~/website', 5), I('x', 'Type an expansion', 'sudo !!')];
    simUI(box, inp, '<div class="presets">' + ['!!', 'sudo !!', '!$', '!^', '!grep', '!2', '!-2', '^Port^Listen', 'ls !$', '!*'].map(function (p) { return '<button class="chip" data-p="' + esc(p) + '">' + esc(p) + '</button>'; }).join('') + '</div>');
    var run = simRun(box, inp, function (v) {
      var h = lines(v.h).filter(function (x) { return x.trim(); }), last = h[h.length - 1] || '';
      if (!h.length) return { err: 'Add some history lines.' };
      var argsOf = function (c) { return c.trim().split(/\s+/).slice(1); }, x = v.x, why = [];
      var out = x.replace(/\^([^^]+)\^([^^]*)\^?/, function (m, a, b) { why.push('^' + a + '^' + b + ' replaces the first ' + a + ' in the previous command'); return last.replace(a, b); });
      if (out === x) out = x.replace(/!(!|\$|\^|\*|-?\d+|[A-Za-z][^\s]*)/g, function (m, t) {
        if (t === '!') { why.push('!! is the previous command'); return last; }
        if (t === '$') { why.push('!$ is the last argument of the previous command'); var a = argsOf(last); return a.length ? a[a.length - 1] : ''; }
        if (t === '^') { why.push('!^ is the first argument of the previous command'); return argsOf(last)[0] || ''; }
        if (t === '*') { why.push('!* is all arguments of the previous command'); return argsOf(last).join(' '); }
        if (/^-?\d+$/.test(t)) { var n = +t; why.push('!' + t + ' is history entry ' + (n < 0 ? 'minus ' + (-n) : 'number ' + n)); return n < 0 ? h[h.length + n] || '' : h[n - 1] || ''; }
        why.push('!' + t + ' is the most recent command starting with "' + t + '"'); for (var i = h.length - 1; i >= 0; i--) if (h[i].indexOf(t) === 0) return h[i]; return m;
      });
      return { rows: [['You type', x], ['Bash runs', out]].concat(why.map(function (w, i) { return ['Why' + (why.length > 1 ? ' ' + (i + 1) : ''), w]; })), note: 'Bash shows the expanded line before running it when you press Enter after pressing ESC then Ctrl+E, or use  set +H to turn history expansion off in scripts.', cmds: ['history | tail -n 5', 'sudo !!'] };
    });
    box.addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (!b) return; var inp2 = $('input[data-k="x"]', box); inp2.value = b.dataset.p; inp2.dispatchEvent(new Event('input', { bubbles: true })); });
  });
  sim('s-deps', 'systemd start order', 'Write units with After= and Requires= and see the boot order, in parallel groups.', 'boot', function (box) {
    var inp = [A('u', 'Units (name: After=a,b)', 'network.target:\nnetwork-online.target: After=network.target\nnginx.service: After=network-online.target Requires=network-online.target\npostgresql.service: After=network.target\napp.service: After=nginx.service,postgresql.service\nbackup.timer: After=app.service', 7)];
    simUI(box, inp);
    simRun(box, inp, function (v) {
      var deps = {}, all = {};
      lines(v.u).forEach(function (l) { var i = l.indexOf(':'); if (i < 1) return; var n = l.slice(0, i).trim(); all[n] = 1; deps[n] = deps[n] || []; (l.slice(i + 1).match(/(?:After|Requires|Wants|BindsTo)=([^\s]+(?:\s*,\s*[^\s]+)*)/g) || []).forEach(function (m) { m.split('=')[1].split(',').forEach(function (d) { d = d.trim(); if (d) { deps[n].push(d); all[d] = 1; } }); }); });
      Object.keys(all).forEach(function (n) { deps[n] = deps[n] || []; });
      var done = {}, groups = [], left = Object.keys(all);
      while (left.length) { var ready = left.filter(function (n) { return deps[n].every(function (d) { return done[d]; }); }); if (!ready.length) return { err: 'Dependency cycle among: ' + left.join(', ') + '. systemd breaks such cycles and logs a warning.' }; ready.sort(); groups.push(ready); ready.forEach(function (n) { done[n] = 1; }); left = left.filter(function (n) { return !done[n]; }); }
      return { rows: groups.map(function (g, i) { return ['Step ' + (i + 1) + ' (start together)', g.join(', ')]; }), note: 'After= only orders units; Requires= also pulls the other unit in and fails together. Units in the same step can start in parallel, which is why systemd boots fast.', cmds: ['systemctl list-dependencies nginx.service', 'systemd-analyze critical-chain', 'systemd-analyze plot > boot.svg'] };
    });
  });
  sim('s-symlink', 'Symlink resolver', 'Follow symbolic links step by step, like readlink -f, and detect loops.', 'links', function (box) {
    var inp = [A('t', 'Links (path -> target)', '/home/ssk/latest.log -> logs/access.log\n/home/ssk/logs -> /var/log/site\n/var/log/site/access.log -> access.log.1\n/home/ssk/a -> b\n/home/ssk/b -> a', 6), I('p', 'Resolve', '/home/ssk/latest.log')];
    simUI(box, inp);
    simRun(box, inp, function (v) {
      var L = {}; lines(v.t).forEach(function (l) { var m = l.match(/^(\S+)\s*->\s*(\S+)$/); if (m) L[m[1]] = m[2]; });
      function norm(parts) { var o = []; parts.forEach(function (x) { if (!x || x === '.') return; if (x === '..') o.pop(); else o.push(x); }); return '/' + o.join('/'); }
      var steps = [], cur = v.p.trim(), n = 0;
      if (cur[0] !== '/') return { err: 'Use an absolute path.' };
      var done = false;
      while (!done && n++ < 20) {
        var parts = cur.split('/').filter(Boolean), pre = '', changed = false;
        for (var i = 0; i < parts.length; i++) {
          var here = pre + '/' + parts[i];
          if (L[here] !== undefined) { var tg = L[here], rest = parts.slice(i + 1).join('/'), base = tg[0] === '/' ? tg : norm((pre + '/' + tg).split('/')); cur = norm((base + (rest ? '/' + rest : '')).split('/')); steps.push([here + ' is a link', 'points to ' + tg + ', so the path becomes ' + cur]); changed = true; break; }
          pre = here;
        }
        if (!changed) done = true;
      }
      if (!done) return { rows: steps, err: 'Too many levels of symbolic links: this is a loop (ELOOP).' };
      return { rows: steps.concat([['Final real path', cur]]), note: 'readlink -f resolves every link in the path, not only the last name. ls -l shows only the first hop.', cmds: ['readlink -f ' + v.p, 'namei -l ' + v.p, 'ls -l ' + v.p] };
    });
  });
  sim('s-inode', 'Inodes and hard links', 'Add and remove names and watch the link count. The data is freed when the last name goes.', 'links', function (box) {
    var names = ['notes.txt'], dataGone = false;
    box.innerHTML = '<div class="presets"><button class="btn sm" id="in-add">ln notes.txt copy.txt</button><button class="btn sm ghost" id="in-sym">ln -s notes.txt shortcut</button><button class="btn sm ghost" id="in-rm">rm first name</button><button class="btn sm ghost" id="in-rs">reset</button></div><div id="in-view"></div><p class="muted sm">A file is an inode (data and metadata). A name is just a directory entry pointing at it. <code>ls -li</code> shows inode numbers and link counts.</p>';
    var syms = 0, cnt = 0;
    function paint() {
      var links = names.length, h = '<div class="inode-box' + (links ? '' : ' gone') + '"><b class="mono">inode 262155</b><span>link count <b>' + links + '</b></span><span>' + (links ? 'data: "Learn Linux one command at a time."' : 'data freed: no names point here any more') + '</span></div>';
      h += '<div class="inode-names">' + names.map(function (n) { return '<span class="ex-w mono">' + esc(n) + ' &rarr; inode 262155</span>'; }).join('') + Array.apply(null, Array(syms)).map(function (_, i) { return '<span class="ex-w mono sl">shortcut' + (i ? i : '') + ' &rarr; ' + (names.length ? esc(names[0]) : 'BROKEN (target gone)') + '</span>'; }).join('') + '</div>';
      $('#in-view', box).innerHTML = h;
    }
    box.addEventListener('click', function (e) {
      if (e.target.closest('#in-add')) { cnt++; names.push('copy' + (cnt > 1 ? cnt : '') + '.txt'); }
      else if (e.target.closest('#in-sym')) syms++;
      else if (e.target.closest('#in-rm')) names.shift();
      else if (e.target.closest('#in-rs')) { names = ['notes.txt']; syms = 0; cnt = 0; }
      paint();
    });
    paint();
  });
  sim('s-env', 'Variables: export and subshells', 'Run a few lines and see which variables a child shell can see.', 'envvars', function (box) {
    var inp = [A('s', 'Commands (one per line)', 'name=ssk\nexport city=Kochi\nbash\necho "name=$name city=$city"\nexit\necho "name=$name city=$city"', 8)];
    simUI(box, inp);
    simRun(box, inp, function (v) {
      var stack = [{ vars: {}, exp: {} }], out = [], errs = '';
      lines(v.s).forEach(function (ln) {
        var l = ln.trim(), cur = stack[stack.length - 1], m;
        if (!l) return;
        if ((m = l.match(/^export\s+(\w+)(?:=(.*))?$/))) { if (m[2] !== undefined) cur.vars[m[1]] = m[2].replace(/^["']|["']$/g, ''); cur.exp[m[1]] = 1; out.push([ln, '(' + m[1] + ' is exported)']); }
        else if ((m = l.match(/^(\w+)=(.*)$/))) { cur.vars[m[1]] = m[2].replace(/^["']|["']$/g, ''); out.push([ln, 'set in this shell only']); }
        else if ((m = l.match(/^unset\s+(\w+)$/))) { delete cur.vars[m[1]]; delete cur.exp[m[1]]; out.push([ln, '']); }
        else if (/^(bash|sh)$/.test(l)) { var child = { vars: {}, exp: {} }; Object.keys(cur.exp).forEach(function (k) { child.vars[k] = cur.vars[k]; child.exp[k] = 1; }); stack.push(child); out.push([ln, 'new subshell level ' + stack.length + ' (inherits only exported variables)']); }
        else if (l === 'exit') { if (stack.length > 1) { stack.pop(); out.push([ln, 'back to level ' + stack.length]); } else out.push([ln, 'would close the terminal']); }
        else if ((m = l.match(/^echo\s+(.*)$/))) { out.push([ln, m[1].replace(/^["']|["']$/g, '').replace(/\$\{?(\w+)\}?/g, function (x, n) { return cur.vars[n] !== undefined ? cur.vars[n] : ''; })]); }
        else out.push([ln, '(not simulated: only assignment, export, unset, bash, exit and echo)']);
      });
      return { rows: out.map(function (o, i) { return [o[0], o[1]]; }), note: 'A plain assignment is private to the shell. export marks it for every program the shell starts. A child can never change its parent\'s variables.', cmds: ['export | grep city', 'env | grep city', 'set | grep city'] };
    });
  });
  sim('s-pipefail', 'Pipeline exit status', 'Choose which stage of a pipeline fails and see $?, PIPESTATUS and the effect of pipefail.', 'exitcodes', function (box) {
    var st = [true, false, true], pf = false;
    box.innerHTML = '<div class="chain-row">' + ['grep error app.log', 'sort', 'head -n 3'].map(function (c, i) { return (i ? '<span class="mono">|</span>' : '') + '<div class="chain-cmd"><b class="mono">' + esc(c) + '</b><label class="chip ck"><input type="checkbox" class="pf-ok" data-i="' + i + '"' + (st[i] ? ' checked' : '') + '> succeeds</label></div>'; }).join('') + '</div><div class="presets"><label class="chip ck"><input type="checkbox" id="pf-on"> set -o pipefail</label></div><div id="pf-out"></div><div id="pf-cmd"></div>';
    function run() {
      var ps = st.map(function (x) { return x ? 0 : 1; }), last = ps[2], first = ps.slice().reverse().filter(function (x) { return x !== 0; })[0] || 0, res = pf ? first : last;
      $('#pf-out', box).innerHTML = '<div class="kv"><div><dt>PIPESTATUS</dt><dd class="mono">(' + ps.join(' ') + ')</dd></div><div><dt>$? without pipefail</dt><dd class="mono">' + last + ' (only the last stage counts)</dd></div><div><dt>$? with pipefail</dt><dd class="mono">' + first + ' (the last non-zero stage)</dd></div><div><dt>What you get now</dt><dd class="mono"><b>' + res + '</b>' + (res === 0 && ps.indexOf(1) >= 0 ? '  (a failure was hidden!)' : '') + '</dd></div></div>';
      $('#pf-cmd', box).innerHTML = cmdLine('set -euo pipefail') + cmdLine('grep error app.log | sort | head -n 3; echo "${PIPESTATUS[@]}"');
    }
    box.addEventListener('change', function (e) { if (e.target.classList.contains('pf-ok')) st[+e.target.dataset.i] = e.target.checked; if (e.target.id === 'pf-on') pf = e.target.checked; run(); });
    run();
  });
})();
