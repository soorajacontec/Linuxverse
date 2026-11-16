/* Linuxverse live labs, part 2: sed, find, tar, date, SSH tunnels, systemd units, ls -l decoder, rsync */
(function () {
  'use strict';
  var esc = LV.esc, $ = LV.$, $$ = LV.$$;
  function lab(id, title, desc, topic, render) { LV.labs[id] = { id: id, title: title, desc: desc, topic: topic, render: render }; }
  function cmdLine(text) {
    return '<div class="lab-cmd"><code>' + esc(text) + '</code><button class="ibtn sm copy-cmd" data-cmd="' + esc(text) + '" aria-label="Copy command">' + LV.icon('copy') + '</button><button class="ibtn sm to-term" data-cmd="' + esc(text) + '" aria-label="Try in terminal">' + LV.icon('term') + '</button></div>';
  }
  function field(id, label, val, extra) { return '<label class="field"><span>' + label + '</span><input id="' + id + '" class="mono" value="' + esc(val) + '" spellcheck="false" autocomplete="off" ' + (extra || '') + '></label>'; }
  function sq(s) { return /^[A-Za-z0-9_@%+=:,.\/~-]+$/.test(s) ? s : "'" + String(s).replace(/'/g, "'\\''") + "'"; }
  function chips(name, items, cur) { return '<div class="presets" data-grp="' + name + '">' + items.map(function (it) { return '<button class="chip' + (it[0] === cur ? ' on' : '') + '" data-grp="' + name + '" data-v="' + esc(it[0]) + '">' + esc(it[1]) + '</button>'; }).join('') + '</div>'; }
  function pick(box, name, cb) {
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-grp="' + name + '"]'); if (!b) return;
      $$('button[data-grp="' + name + '"]', box).forEach(function (x) { x.classList.toggle('on', x === b); }); cb(b.dataset.v);
    });
  }
  function ck(id, label, on) { return '<label class="chip ck"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '> ' + label + '</label>'; }

  /* ---------- sed playground ---------- */
  var SED_TEXT = 'GET /index.html 200\nGET /about.html 404\nPOST /login 302\nGET /missing 404\nGET /css/style.css 200\n# TODO: add contact page';
  lab('sed', 'sed playground', 'Type a sed command and see the result line by line.', 'sedawk', function (box) {
    box.innerHTML =
      '<label class="field"><span>Input text</span><textarea id="sd-txt" rows="6" class="mono" style="height:auto;padding:10px" spellcheck="false">' + esc(SED_TEXT) + '</textarea></label>' +
      field('sd-ex', 'sed expression', 's/404/NOT FOUND/') +
      '<div class="presets">' + ck('sd-n', '-n (quiet)', false) + ck('sd-e', '-E (extended regex)', true) + ['s/404/NOT FOUND/', 's/GET/FETCH/g', '/TODO/d', '2,4p', '3d', 's/^/> /', 's/\\.html//'].map(function (p) { return '<button class="chip" data-p="' + esc(p) + '">' + esc(p) + '</button>'; }).join('') + '</div>' +
      '<div class="term-line mono" id="sd-out" style="white-space:pre-wrap"></div><div id="sd-cmd"></div><p class="muted sm" id="sd-msg"></p>';
    function addr(a, n, line) {
      if (!a) return true;
      var m;
      if ((m = a.match(/^(\d+),(\d+)$/))) return n >= +m[1] && n <= +m[2];
      if (/^\d+$/.test(a)) return n === +a;
      if (a === '$') return n === 'last';
      if ((m = a.match(/^\/(.*)\/$/))) return new RegExp(m[1]).test(line);
      return true;
    }
    function run() {
      var ex = $('#sd-ex', box).value, quiet = $('#sd-n', box).checked, msg = $('#sd-msg', box), lines = $('#sd-txt', box).value.split('\n'), out = [];
      msg.textContent = '';
      var m = ex.match(/^((?:\d+(?:,\d+)?|\$|\/.*?\/))?([sdp])(.*)$/);
      if (!m) { msg.textContent = 'Supported: s/old/new/[g], d, p, with an optional line number, range (2,4) or /pattern/ address.'; $('#sd-out', box).textContent = ''; return; }
      var a = m[1], c = m[2], rest = m[3], re, rep, fl;
      try {
        if (c === 's') {
          var sep = rest[0], parts = rest.slice(1).split(sep);
          if (parts.length < 2) throw new Error('s needs the form s/old/new/');
          fl = parts[2] || ''; re = new RegExp(parts[0], fl.indexOf('g') >= 0 ? 'g' : '' ); rep = parts[1].replace(/&/g, '$$&');
        }
      } catch (err) { msg.textContent = 'Error: ' + err.message; return; }
      lines.forEach(function (ln, i) {
        var hit = addr(a, i === lines.length - 1 && a === '$' ? 'last' : i + 1, ln), keep = true, text = ln;
        if (hit) {
          if (c === 's') text = ln.replace(re, rep);
          if (c === 'd') keep = false;
          if (c === 'p') { if (quiet) { out.push(ln); keep = false; } else out.push(ln); }
        }
        if (keep && !quiet) out.push(text); else if (keep && quiet && c === 's' && fl.indexOf('p') >= 0 && hit) out.push(text);
      });
      $('#sd-out', box).textContent = out.join('\n') || '(no output)';
      $('#sd-cmd', box).innerHTML = cmdLine('sed ' + (quiet ? '-n ' : '') + ($('#sd-e', box).checked ? '-E ' : '') + "'" + ex + "' file.txt");
    }
    box.addEventListener('input', run);
    box.addEventListener('change', run);
    box.addEventListener('click', function (e) { var p = e.target.closest('[data-p]'); if (p) { $('#sd-ex', box).value = p.dataset.p; run(); } });
    run();
  });

  /* ---------- find builder ---------- */
  var TREE = [
    ['website', 'd', 4, 0], ['website/index.html', 'f', 12, 2], ['website/notes.txt', 'f', 1, 9], ['website/.env', 'f', 1, 30], ['website/css', 'd', 4, 3], ['website/css/style.css', 'f', 18, 3],
    ['website/js', 'd', 4, 5], ['website/js/app.js', 'f', 240, 1], ['website/js/vendor.min.js', 'f', 1800, 60], ['website/scripts', 'd', 4, 14], ['website/scripts/deploy.sh', 'f', 2, 14], ['website/scripts/backup.sh', 'f', 3, 40],
    ['website/logs', 'd', 4, 0], ['website/logs/access.log', 'f', 5200, 0], ['website/logs/error.log', 'f', 80, 1], ['website/logs/access.log.1.gz', 'f', 900, 8], ['website/images', 'd', 4, 20], ['website/images/logo.png', 'f', 64, 20], ['website/images/hero.jpg', 'f', 2400, 20]
  ];
  function globRe(g) { return new RegExp('^' + g.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i'); }
  lab('find', 'find command builder', 'Choose tests and see the command and the matching files from an example site.', 'find', function (box) {
    box.innerHTML =
      field('fd-name', 'Name pattern (-name, * and ? allowed)', '*.log') +
      '<div class="lab-row"><span class="muted sm">Type</span>' + chips('fd-type', [['', 'any'], ['f', 'files (f)'], ['d', 'folders (d)']], 'f') + '</div>' +
      '<div class="lab-row"><span class="muted sm">Size</span>' + chips('fd-size', [['', 'any'], ['+1M', 'bigger than 1 MB'], ['+100k', 'bigger than 100 KB'], ['-10k', 'smaller than 10 KB']], '') + '</div>' +
      '<div class="lab-row"><span class="muted sm">Changed</span>' + chips('fd-time', [['', 'any time'], ['-1', 'last day'], ['-7', 'last 7 days'], ['+30', 'older than 30 days']], '') + '</div>' +
      '<div class="presets">' + ck('fd-i', 'ignore case (-iname)', false) + ck('fd-d', 'only top level (-maxdepth 1)', false) + '</div>' +
      '<div id="fd-cmd"></div><div class="term-line mono" id="fd-out" style="white-space:pre-wrap"></div>';
    var st = { type: 'f', size: '', time: '' };
    function run() {
      var nm = $('#fd-name', box).value.trim(), ic = $('#fd-i', box).checked, d1 = $('#fd-d', box).checked, args = ['find ~/website'];
      if (d1) args.push('-maxdepth 1');
      if (st.type) args.push('-type ' + st.type);
      if (nm) args.push('-' + (ic ? 'iname' : 'name') + ' ' + sq(nm).replace(/^([^'])/, '"$1').replace(/([^'])$/, '$1"').replace(/^'(.*)'$/, '"$1"'));
      if (st.size) args.push('-size ' + st.size);
      if (st.time) args.push('-mtime ' + st.time);
      var re = nm ? globRe(nm) : null, res = TREE.filter(function (t) {
        var base = t[0].split('/').pop(), depth = t[0].split('/').length - 1;
        if (d1 && depth > 1) return false;
        if (st.type && t[1] !== st.type) return false;
        if (re && !(ic ? re.test(base) : new RegExp(re.source).test(base))) return false;
        if (st.size) { var m = st.size.match(/^([+-])(\d+)([kM])$/), lim = +m[2] * (m[3] === 'M' ? 1024 : 1); if (m[1] === '+' ? !(t[2] > lim) : !(t[2] < lim)) return false; }
        if (st.time) { var tm = st.time.match(/^([+-])(\d+)$/), dd = +tm[2]; if (tm[1] === '+' ? !(t[3] > dd) : !(t[3] < dd)) return false; }
        return true;
      });
      $('#fd-cmd', box).innerHTML = cmdLine(args.join(' '));
      $('#fd-out', box).textContent = res.length ? res.map(function (t) { return '/home/ssk/' + t[0]; }).join('\n') : '(nothing matches)';
    }
    pick(box, 'fd-type', function (v) { st.type = v; run(); }); pick(box, 'fd-size', function (v) { st.size = v; run(); }); pick(box, 'fd-time', function (v) { st.time = v; run(); });
    box.addEventListener('input', run); box.addEventListener('change', run); run();
  });

  /* ---------- tar builder ---------- */
  lab('tar', 'tar command builder', 'Pick create, list or extract and a compression, and get the exact tar command.', 'archives', function (box) {
    box.innerHTML =
      '<div class="lab-row"><span class="muted sm">Action</span>' + chips('tr-act', [['c', 'Create'], ['t', 'List'], ['x', 'Extract']], 'c') + '</div>' +
      '<div class="lab-row"><span class="muted sm">Compression</span>' + chips('tr-z', [['', 'none (.tar)'], ['z', 'gzip (.tar.gz)'], ['J', 'xz (.tar.xz)'], ['j', 'bzip2 (.tar.bz2)']], 'z') + '</div>' +
      field('tr-f', 'Archive name', 'site') + field('tr-src', 'Files or folder (create only)', 'website') + field('tr-dir', 'Extract into folder (-C, extract only)', '') +
      '<div class="presets">' + ck('tr-v', 'verbose (-v)', false) + '</div><div id="tr-cmd"></div><p class="muted sm" id="tr-note"></p>';
    var st = { act: 'c', z: 'z' };
    var EXT = { '': '.tar', z: '.tar.gz', J: '.tar.xz', j: '.tar.bz2' };
    function run() {
      var name = $('#tr-f', box).value.trim() || 'archive', file = /\.tar|\.tgz/.test(name) ? name : name + EXT[st.z];
      var flags = '-' + st.act + (st.z) + ($('#tr-v', box).checked ? 'v' : '') + 'f ' + sq(file), c = 'tar ' + flags;
      if (st.act === 'c') c += ' ' + sq($('#tr-src', box).value.trim() || '.');
      if (st.act === 'x' && $('#tr-dir', box).value.trim()) c += ' -C ' + sq($('#tr-dir', box).value.trim());
      $('#tr-cmd', box).innerHTML = cmdLine(c);
      $('#tr-note', box).textContent = { c: 'c = create, ' + (st.z ? EXT[st.z] + ' adds compression; ' : '') + 'f = file name (keep it last in the letters).', t: 'Lists the contents without unpacking. A good first look at unknown archives.', x: 'Extracts into the current folder, or into -C folder. Existing files with the same name are overwritten.' }[st.act];
    }
    pick(box, 'tr-act', function (v) { st.act = v; run(); }); pick(box, 'tr-z', function (v) { st.z = v; run(); });
    box.addEventListener('input', run); box.addEventListener('change', run); run();
  });

  /* ---------- date format ---------- */
  function pad(n, w) { n = String(n); while (n.length < (w || 2)) n = '0' + n; return n; }
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function strftime(f, d) {
    var doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    var map = { Y: d.getFullYear(), y: pad(d.getFullYear() % 100), m: pad(d.getMonth() + 1), d: pad(d.getDate()), e: String(d.getDate()).replace(/^(\d)$/, ' $1'), H: pad(d.getHours()), I: pad(d.getHours() % 12 || 12), M: pad(d.getMinutes()), S: pad(d.getSeconds()), p: d.getHours() < 12 ? 'AM' : 'PM', A: DAYS[d.getDay()], a: DAYS[d.getDay()].slice(0, 3), B: MONTHS[d.getMonth()], b: MONTHS[d.getMonth()].slice(0, 3), j: pad(doy, 3), u: d.getDay() || 7, s: Math.floor(d / 1000), Z: 'local', z: (function () { var o = -d.getTimezoneOffset(), s = o < 0 ? '-' : '+'; o = Math.abs(o); return s + pad(Math.floor(o / 60)) + pad(o % 60); })(), n: '\n', t: '\t', '%': '%' };
    map.F = map.Y + '-' + map.m + '-' + map.d; map.T = map.H + ':' + map.M + ':' + map.S; map.D = map.m + '/' + map.d + '/' + map.y; map.R = map.H + ':' + map.M;
    return f.replace(/%([a-zA-Z%])/g, function (all, k) { return map[k] !== undefined ? map[k] : all; });
  }
  lab('date', 'date format builder', 'Type a format string and see what date prints, with a cheat sheet of codes.', 'timesync', function (box) {
    box.innerHTML =
      field('dt-f', 'Format (after +)', '%F %T') +
      '<div class="presets">' + [['%F', 'ISO date'], ['%F %T', 'date and time'], ['%A, %d %B %Y', 'long date'], ['%Y%m%d-%H%M%S', 'file name stamp'], ['%s', 'Unix seconds'], ['%j', 'day of year'], ['%I:%M %p', '12-hour clock']].map(function (p) { return '<button class="chip" data-p="' + esc(p[0]) + '">' + esc(p[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="term-line mono" id="dt-out"></div><div id="dt-cmd"></div>' +
      '<div class="tbl-wrap"><table><tbody>' + [['%Y %y', 'year (2026 / 26)'], ['%m %d', 'month, day (01-12, 01-31)'], ['%H %M %S', 'hour (24h), minute, second'], ['%I %p', 'hour (12h), AM/PM'], ['%A %a', 'weekday (Monday / Mon)'], ['%B %b', 'month name (November / Nov)'], ['%F %T', '= %Y-%m-%d and = %H:%M:%S'], ['%s %z', 'Unix seconds, time zone offset']].map(function (r) { return '<tr><td class="mono">' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table></div>';
    function run() { var f = $('#dt-f', box).value; $('#dt-out', box).textContent = strftime(f, new Date()); $('#dt-cmd', box).innerHTML = cmdLine('date +' + sq(f)); }
    box.addEventListener('input', run); box.addEventListener('click', function (e) { var p = e.target.closest('[data-p]'); if (p) { $('#dt-f', box).value = p.dataset.p; run(); } }); run();
  });

  /* ---------- SSH tunnel builder ---------- */
  lab('tunnel', 'SSH tunnel builder', 'Describe the tunnel and get the ssh command with a plain-English explanation.', 'tunnels', function (box) {
    box.innerHTML =
      '<div class="lab-row"><span class="muted sm">Type</span>' + chips('tn-t', [['L', 'Local (-L): reach a remote service'], ['R', 'Remote (-R): share my service'], ['D', 'SOCKS proxy (-D)']], 'L') + '</div>' +
      field('tn-lp', 'Port on the listening side', '8080', 'inputmode="numeric"') + '<div id="tn-hp">' + field('tn-h', 'Target host (as seen from the other end)', 'localhost') + field('tn-p', 'Target port', '80', 'inputmode="numeric"') + '</div>' +
      field('tn-s', 'user@server', 'ssk@server.example.com') +
      '<div class="presets">' + ck('tn-N', '-N (no shell)', true) + ck('tn-f', '-f (background)', false) + ck('tn-J', 'via jump host (-J bastion)', false) + '</div>' +
      '<div id="tn-cmd"></div><p class="muted sm" id="tn-exp"></p>';
    var t = 'L';
    function run() {
      var lp = $('#tn-lp', box).value || '8080', h = $('#tn-h', box).value || 'localhost', p = $('#tn-p', box).value || '80', s = $('#tn-s', box).value || 'user@server', a = ['ssh'];
      if ($('#tn-N', box).checked) a.push('-N'); if ($('#tn-f', box).checked) a.push('-f');
      if ($('#tn-J', box).checked) a.push('-J bastion');
      var exp;
      if (t === 'L') { a.push('-L ' + lp + ':' + h + ':' + p); exp = 'Connections to port ' + lp + ' on THIS machine travel through ' + s + ' and come out at ' + h + ':' + p + '. Open http://localhost:' + lp + ' (or point a client at it).'; }
      if (t === 'R') { a.push('-R ' + lp + ':' + h + ':' + p); exp = 'Port ' + lp + ' on the SERVER forwards back to ' + h + ':' + p + ' as seen from this machine. Others on the server can then reach your service.'; }
      if (t === 'D') { a.push('-D ' + lp); exp = 'Starts a SOCKS5 proxy on localhost:' + lp + '. Set your browser to use it and traffic leaves from the server.'; }
      a.push(s);
      $('#tn-hp', box).style.display = t === 'D' ? 'none' : '';
      $('#tn-cmd', box).innerHTML = cmdLine(a.join(' ')); $('#tn-exp', box).textContent = exp;
    }
    pick(box, 'tn-t', function (v) { t = v; run(); }); box.addEventListener('input', run); box.addEventListener('change', run); run();
  });

  /* ---------- systemd unit generator ---------- */
  lab('unit', 'systemd unit generator', 'Fill in a few fields and get a complete service file plus the commands to enable it.', 'unitfiles', function (box) {
    box.innerHTML =
      field('un-n', 'Service name', 'mysite') + field('un-d', 'Description', 'My website') + field('un-e', 'Command (ExecStart, full path)', '/usr/bin/python3 -m http.server 8500') +
      field('un-u', 'Run as user', 'ssk') + field('un-w', 'Working directory', '/home/ssk/website') +
      '<div class="lab-row"><span class="muted sm">Restart</span>' + chips('un-r', [['no', 'never'], ['on-failure', 'on failure'], ['always', 'always']], 'on-failure') + '</div>' +
      '<div class="presets">' + ck('un-net', 'start after network is up', true) + '</div>' +
      '<pre class="code" id="un-out" style="white-space:pre-wrap"></pre><div id="un-cmds"></div>';
    var r = 'on-failure';
    function run() {
      var n = ($('#un-n', box).value.trim() || 'myapp').replace(/[^\w.@-]/g, '-'), lines = ['[Unit]', 'Description=' + $('#un-d', box).value];
      if ($('#un-net', box).checked) lines.push('After=network.target');
      lines.push('', '[Service]'); if ($('#un-u', box).value) lines.push('User=' + $('#un-u', box).value); if ($('#un-w', box).value) lines.push('WorkingDirectory=' + $('#un-w', box).value);
      lines.push('ExecStart=' + $('#un-e', box).value); if (r !== 'no') lines.push('Restart=' + r); lines.push('', '[Install]', 'WantedBy=multi-user.target');
      $('#un-out', box).textContent = '# /etc/systemd/system/' + n + '.service\n' + lines.join('\n');
      $('#un-cmds', box).innerHTML = ['sudo systemctl daemon-reload', 'sudo systemctl enable --now ' + n, 'systemctl status ' + n, 'journalctl -u ' + n + ' -f'].map(cmdLine).join('');
      if (!/^\//.test($('#un-e', box).value.trim())) $('#un-out', box).textContent += '\n\n# Warning: ExecStart should start with a full path (/usr/bin/...)';
    }
    pick(box, 'un-r', function (v) { r = v; run(); }); box.addEventListener('input', run); box.addEventListener('change', run); run();
  });

  /* ---------- ls -l decoder ---------- */
  var MONTH_RE = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/;
  lab('lsl', 'ls -l decoder', 'Paste a line from ls -l and read each field in plain words.', 'perms', function (box) {
    box.innerHTML = field('ls-in', 'A line from ls -l', '-rwxr-x--- 1 ssk www-data 2048 Nov  5 09:41 deploy.sh') +
      '<div class="presets">' + ['drwxr-xr-x 2 ssk ssk 4096 Nov 5 09:41 css', '-rw------- 1 ssk ssk 83 Nov 5 09:41 .env', 'lrwxrwxrwx 1 ssk ssk 15 Nov 5 09:41 latest.log -> logs/access.log', '-rwsr-xr-x 1 root root 59976 Nov 5 12:00 passwd', 'drwxrwxrwt 14 root root 4096 Nov 7 20:30 tmp'].map(function (p) { return '<button class="chip" data-p="' + esc(p) + '">' + esc(p.split(' ').pop()) + '</button>'; }).join('') + '</div>' +
      '<div class="kv" id="ls-kv"></div>';
    function who(s) { var o = [], n = ['read', 'write', 'run/enter']; for (var i = 0; i < 3; i++) if (s[i] !== '-') o.push(n[i]); return o.length ? o.join(', ') : 'nothing'; }
    function run() {
      var line = $('#ls-in', box).value.trim().replace(/\s+/g, ' '), p = line.split(' '), kv = $('#ls-kv', box);
      if (p.length < 8 || !/^[-dlcbps][-rwxsStT]{9}[.+]?$/.test(p[0])) { kv.innerHTML = '<p class="muted">Needs a full line like: -rw-r--r-- 1 ssk ssk 1200 Nov 5 09:41 index.html</p>'; return; }
      var m = p[0], t = { '-': 'regular file', d: 'directory', l: 'symbolic link', c: 'character device', b: 'block device', p: 'pipe', s: 'socket' }[m[0]], perm = m.slice(1, 10), num = '', sp = [];
      for (var i = 0; i < 3; i++) { var tr = perm.substr(i * 3, 3), v = (tr[0] !== '-' ? 4 : 0) + (tr[1] !== '-' ? 2 : 0) + (/[xst]/.test(tr[2]) ? 1 : 0); num += v; }
      var specials = (/[sS]/.test(perm[2]) ? 4 : 0) + (/[sS]/.test(perm[5]) ? 2 : 0) + (/[tT]/.test(perm[8]) ? 1 : 0);
      if (/[sS]/.test(perm[2])) sp.push('setuid: runs as the owner'); if (/[sS]/.test(perm[5])) sp.push('setgid'); if (/[tT]/.test(perm[8])) sp.push('sticky: only owners may delete inside');
      var mi = p.findIndex(function (x, i) { return i > 3 && MONTH_RE.test(x); }), name = p.slice(mi + 3).join(' ');
      var rows = [['Type', m[0] + ' = ' + t], ['Owner can', who(perm.slice(0, 3))], ['Group (' + p[3] + ') can', who(perm.slice(3, 6))], ['Others can', who(perm.slice(6, 9))], ['Octal', (specials ? specials : '') + num + '  →  chmod ' + (specials ? specials : '') + num + ' ' + name.split(' -> ')[0]], ['Special bits', sp.join('; ') || 'none'], ['Links', p[1] + (m[0] === 'd' ? ' (sub-folders + 2)' : ' (names for this file)')], ['Owner / group', p[2] + ' / ' + p[3]], ['Size', p[4] + ' bytes'], ['Modified', p.slice(mi, mi + 3).join(' ')], ['Name', name + (name.charAt(0) === '.' ? '  (hidden)' : '')]];
      if (m[0] === 'd') rows[1][1] += ' (list / create & delete / enter)';
      kv.innerHTML = rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
      if (num === '777' || num === '666') kv.innerHTML += '<p class="bad">Everyone can modify this. Rarely a good idea.</p>';
    }
    box.addEventListener('input', run); box.addEventListener('click', function (e) { var p = e.target.closest('[data-p]'); if (p) { $('#ls-in', box).value = p.dataset.p; run(); } }); run();
  });

  /* ---------- rsync builder ---------- */
  lab('rsync', 'rsync command builder', 'Tick options to build a safe copy or backup command, with a warning for risky ones.', 'backups', function (box) {
    box.innerHTML =
      field('rs-s', 'Source', '~/website/') + field('rs-d', 'Destination', '/mnt/backup/website/') +
      '<div class="presets">' + ck('rs-a', '-a archive', true) + ck('rs-v', '-v verbose', true) + ck('rs-z', '-z compress (for networks)', false) + ck('rs-n', '--dry-run (rehearse)', true) + ck('rs-del', '--delete', false) + ck('rs-p', '--progress', false) + ck('rs-x', '--exclude .git', false) + ck('rs-h', '-h human sizes', true) + '</div>' +
      '<div id="rs-cmd"></div><p class="muted sm" id="rs-note"></p>';
    function run() {
      var a = ['rsync'], c = function (id) { return $('#' + id, box).checked; }, flags = (c('rs-a') ? 'a' : '') + (c('rs-v') ? 'v' : '') + (c('rs-z') ? 'z' : '') + (c('rs-h') ? 'h' : '');
      if (flags) a.push('-' + flags); if (c('rs-n')) a.push('--dry-run'); if (c('rs-del')) a.push('--delete'); if (c('rs-p')) a.push('--progress'); if (c('rs-x')) a.push('--exclude=.git');
      var s = $('#rs-s', box).value.trim() || './', d = $('#rs-d', box).value.trim() || 'backup/';
      a.push(sq(s).replace(/^'~/, '~'), sq(d));
      $('#rs-cmd', box).innerHTML = cmdLine(a.join(' '));
      var n = [];
      if (c('rs-del') && !c('rs-n')) n.push('Warning: --delete will remove files in the destination that are not in the source. Run with --dry-run first.');
      if (c('rs-del') && c('rs-n')) n.push('Good: rehearsing --delete. Read the "deleting" lines before you remove --dry-run.');
      n.push(/\/$/.test(s) ? 'Trailing slash on the source: copies the CONTENTS of the folder into the destination.' : 'No trailing slash on the source: copies the folder itself into the destination.');
      if (/:/.test(s + d)) n.push('A host:path means the copy goes over SSH.');
      $('#rs-note', box).textContent = n.join(' ');
    }
    box.addEventListener('input', run); box.addEventListener('change', run); run();
  });

  /* Link topics that had no lab to their new one */
  [['sedawk', 'sed'], ['find', 'find'], ['archives', 'tar'], ['timesync', 'date'], ['tunnels', 'tunnel'], ['unitfiles', 'unit'], ['backups', 'rsync']].forEach(function (p) { var t = LV.topics[p[0]]; if (t && !t.live) t.live = p[1]; });
})();
