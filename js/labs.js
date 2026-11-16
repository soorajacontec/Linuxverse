/* Linuxverse live labs: interactive tools that really compute */
(function () {
  'use strict';
  var esc = LV.esc;
  function lab(id, title, desc, topic, render) { LV.labs[id] = { id: id, title: title, desc: desc, topic: topic, render: render }; }
  function cmdLine(text) {
    return '<div class="lab-cmd"><code>' + esc(text) + '</code><button class="ibtn sm copy-cmd" data-cmd="' + esc(text) + '" aria-label="Copy command">' + LV.icon('copy') + '</button><button class="ibtn sm to-term" data-cmd="' + esc(text) + '" aria-label="Try in terminal">' + LV.icon('term') + '</button></div>';
  }

  /* ---------- chmod ---------- */
  lab('chmod', 'chmod calculator', 'Flip permission bits and see octal, symbolic and ls -l update live.', 'chmod', function (box) {
    var bits = [1, 1, 1, 1, 0, 1, 0, 0, 0]; // 750
    var isDir = false;
    box.innerHTML =
      '<div class="seg" role="group" aria-label="Target type"><button class="segb on" data-t="f">File</button><button class="segb" data-t="d">Directory</button></div>' +
      '<div class="perm-grid">' +
      '<div></div><div class="ph">read 4</div><div class="ph">write 2</div><div class="ph">exec 1</div>' +
      ['user', 'group', 'others'].map(function (w, r) {
        return '<div class="pw">' + w + '</div>' + [0, 1, 2].map(function (c) {
          var i = r * 3 + c;
          return '<button class="pbit" data-i="' + i + '" aria-pressed="false">' + 'rwx'[c] + '</button>';
        }).join('');
      }).join('') + '</div>' +
      '<div class="perm-out"><div class="big-oct" id="ch-oct">750</div><div><div class="mono" id="ch-sym"></div><div class="muted sm" id="ch-meaning"></div></div></div>' +
      '<label class="field"><span>Or type octal</span><input id="ch-in" inputmode="numeric" maxlength="3" value="750" aria-label="Octal mode"></label>' +
      '<div class="term-line mono" id="ch-ls"></div><div id="ch-cmd"></div>' +
      '<div class="presets">' + ['644', '755', '600', '700', '640', '775'].map(function (p) { return '<button class="chip" data-p="' + p + '">' + p + '</button>'; }).join('') + '</div>';
    function oct() { var s = ''; for (var r = 0; r < 3; r++) s += bits[r * 3] * 4 + bits[r * 3 + 1] * 2 + bits[r * 3 + 2]; return s; }
    function sym() { return bits.map(function (b, i) { return b ? 'rwx'[i % 3] : '-'; }).join(''); }
    function meaning() {
      var who = ['Owner', 'Group', 'Others'], out = [];
      for (var r = 0; r < 3; r++) {
        var c = [];
        if (isDir) { if (bits[r * 3]) c.push('list'); if (bits[r * 3 + 1]) c.push('create/delete'); if (bits[r * 3 + 2]) c.push('enter'); }
        else { if (bits[r * 3]) c.push('read'); if (bits[r * 3 + 1]) c.push('write'); if (bits[r * 3 + 2]) c.push('run'); }
        out.push(who[r] + ': ' + (c.length ? c.join(', ') : 'no access'));
      }
      return out.join(' · ');
    }
    function paint(fromInput) {
      LV.$$('.pbit', box).forEach(function (b, i) { b.classList.toggle('on', !!bits[i]); b.setAttribute('aria-pressed', bits[i] ? 'true' : 'false'); });
      var o = oct();
      LV.$('#ch-oct', box).textContent = o;
      LV.$('#ch-sym', box).textContent = (isDir ? 'd' : '-') + sym();
      LV.$('#ch-meaning', box).textContent = meaning();
      if (!fromInput) LV.$('#ch-in', box).value = o;
      var name = isDir ? 'shared' : 'deploy.sh';
      LV.$('#ch-ls', box).textContent = (isDir ? 'd' : '-') + sym() + ' ' + (isDir ? 2 : 1) + ' ssk ssk ' + (isDir ? 4096 : 214) + ' Nov  5 09:41 ' + name;
      LV.$('#ch-cmd', box).innerHTML = cmdLine('chmod ' + o + ' ' + name);
      if (o === '777' || o === '666') LV.$('#ch-meaning', box).innerHTML += ' <b class="bad">· Everyone can modify this.</b>';
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.pbit');
      if (b) { var i = +b.dataset.i; bits[i] = bits[i] ? 0 : 1; paint(); return; }
      var p = e.target.closest('[data-p]');
      if (p) { setOct(p.dataset.p); paint(); return; }
      var t = e.target.closest('.segb');
      if (t) { isDir = t.dataset.t === 'd'; LV.$$('.segb', box).forEach(function (x) { x.classList.toggle('on', x === t); }); paint(); }
    });
    function setOct(v) { for (var r = 0; r < 3; r++) { var d = +v[r] || 0; bits[r * 3] = d & 4 ? 1 : 0; bits[r * 3 + 1] = d & 2 ? 1 : 0; bits[r * 3 + 2] = d & 1 ? 1 : 0; } }
    LV.$('#ch-in', box).addEventListener('input', function (e) {
      var v = e.target.value.replace(/[^0-7]/g, '').slice(0, 3);
      e.target.value = v;
      if (v.length === 3) { setOct(v); paint(true); }
    });
    paint();
  });

  /* ---------- umask ---------- */
  lab('umask', 'umask explorer', 'See which permissions new files and directories get.', 'umask', function (box) {
    box.innerHTML =
      '<div class="presets">' + ['022', '002', '027', '077'].map(function (p) { return '<button class="chip" data-u="' + p + '">' + p + '</button>'; }).join('') + '</div>' +
      '<label class="field"><span>umask</span><input id="um-in" inputmode="numeric" maxlength="3" value="022" aria-label="umask value"></label>' +
      '<div class="um-rows" id="um-rows"></div><div id="um-cmd"></div>';
    function symOf(n) { return [n >> 6 & 7, n >> 3 & 7, n & 7].map(function (d) { return (d & 4 ? 'r' : '-') + (d & 2 ? 'w' : '-') + (d & 1 ? 'x' : '-'); }).join(''); }
    function row(label, base, mask) {
      var res = base & ~mask;
      return '<div class="um-row"><div class="um-l">' + label + '</div><div class="um-calc mono"><span>' + base.toString(8) + '</span><span class="muted">−mask</span><span class="hl">' + ('00' + res.toString(8)).slice(-3) + '</span></div><div class="mono um-s">' + symOf(res) + '</div></div>';
    }
    function paint() {
      var v = LV.$('#um-in', box).value;
      if (!/^[0-7]{3}$/.test(v)) return;
      var m = parseInt(v, 8);
      LV.$('#um-rows', box).innerHTML = row('New file', 438, m) + row('New directory', 511, m);
      LV.$('#um-cmd', box).innerHTML = cmdLine('umask ' + v);
    }
    box.addEventListener('click', function (e) { var b = e.target.closest('[data-u]'); if (b) { LV.$('#um-in', box).value = b.dataset.u; paint(); } });
    LV.$('#um-in', box).addEventListener('input', function (e) { e.target.value = e.target.value.replace(/[^0-7]/g, '').slice(0, 3); paint(); });
    paint();
  });

  /* ---------- FHS explorer ---------- */
  var FHS = [
    ['/', 'The root of the single directory tree. Every path starts here.', 'bin boot dev etc home …'],
    ['/bin', 'Essential user programs. A symlink to /usr/bin on merged-/usr distros.', 'ls cp bash'],
    ['/boot', 'Kernel images, initramfs and bootloader files.', 'vmlinuz-6.8.0 initrd.img grub/'],
    ['/dev', 'Device files created by the kernel and udev.', 'sda nvme0n1 null tty random'],
    ['/etc', 'System-wide configuration as plain text.', 'fstab hosts passwd ssh/'],
    ['/home', 'Personal directories for regular users.', 'ssk/'],
    ['/root', 'Home directory of the root user.', '.bashrc'],
    ['/lib', 'Shared libraries and kernel modules (lib → usr/lib on merged systems).', 'modules/ libc.so.6'],
    ['/media', 'Automatic mount points for removable media.', 'ssk/USB-DRIVE'],
    ['/mnt', 'Temporary manual mount points.', 'data/'],
    ['/opt', 'Self-contained third-party software.', 'google/ vendor-app/'],
    ['/proc', 'Virtual: live kernel and process information.', 'cpuinfo meminfo 1/'],
    ['/run', 'Runtime data since boot, kept in RAM (PID files, sockets).', 'systemd/ user/1000/'],
    ['/srv', 'Data served by this system (web, FTP).', 'www/'],
    ['/sys', 'Virtual: devices, drivers and kernel settings (sysfs).', 'class/ block/ firmware/'],
    ['/tmp', 'Temporary files, often cleared at boot.', 'tmp.Xa12/'],
    ['/usr', 'Installed software and read-only data.', 'bin/ lib/ share/ local/'],
    ['/var', 'Variable data: logs, caches, databases, mail.', 'log/ cache/ lib/ spool/']
  ];
  lab('fhs', 'Directory tree explorer', 'Tap a directory to learn what lives there.', 'fhs', function (box) {
    box.innerHTML = '<div class="fhs-list">' + FHS.map(function (d, i) { return '<button class="fhs-item' + (i ? '' : ' on') + '" data-i="' + i + '">' + LV.icon('folder') + '<span>' + d[0] + '</span></button>'; }).join('') + '</div><div class="fhs-info" id="fhs-info"></div>';
    function show(i) {
      var d = FHS[i];
      LV.$('#fhs-info', box).innerHTML = '<h4 class="mono">' + d[0] + '</h4><p>' + esc(d[1]) + '</p><div class="term-line mono">$ ls ' + d[0] + '<br>' + esc(d[2]) + '</div>' + cmdLine('ls ' + d[0]);
      LV.$$('.fhs-item', box).forEach(function (b, j) { b.classList.toggle('on', j === i); });
    }
    box.addEventListener('click', function (e) { var b = e.target.closest('.fhs-item'); if (b) show(+b.dataset.i); });
    show(0);
  });

  /* ---------- Pipeline builder ---------- */
  var LOG = ['192.0.2.10 - - "GET /" 200', '203.0.113.9 - - "GET /old" 404', '192.0.2.10 - - "GET /about" 200', '198.51.100.7 - - "GET /x" 404', '192.0.2.10 - - "POST /login" 302', '192.0.2.44 - - "GET /missing" 404'];
  lab('pipe', 'Pipeline builder', 'Switch stages on and off and watch data flow through the pipe.', 'pipes', function (box) {
    var st = { grep: '404', grepOn: false, awk: true, sort: true, uniq: true, rank: true, head: false };
    box.innerHTML =
      '<p class="muted sm">Input: access.log (6 lines)</p>' +
      '<div class="pipe-stages">' +
      '<label class="pst"><input type="checkbox" id="p-grep"> <span>grep</span><input id="p-grepv" value="404" aria-label="grep pattern" class="mini"></label>' +
      '<label class="pst"><input type="checkbox" id="p-awk" checked> <span>awk \'{print $1}\'</span></label>' +
      '<label class="pst"><input type="checkbox" id="p-sort" checked> <span>sort</span></label>' +
      '<label class="pst"><input type="checkbox" id="p-uniq" checked> <span>uniq -c</span></label>' +
      '<label class="pst"><input type="checkbox" id="p-rank" checked> <span>sort -rn</span></label>' +
      '<label class="pst"><input type="checkbox" id="p-head"> <span>head -n 2</span></label>' +
      '</div><div id="p-cmd"></div><div class="pipe-flow" id="p-flow"></div>';
    function run() {
      st.grepOn = LV.$('#p-grep', box).checked; st.grep = LV.$('#p-grepv', box).value;
      ['awk', 'sort', 'uniq', 'rank', 'head'].forEach(function (k) { st[k] = LV.$('#p-' + k, box).checked; });
      var data = LOG.slice(), stages = [['cat access.log', data.slice()]];
      if (st.grepOn) { data = data.filter(function (l) { return l.indexOf(st.grep) >= 0; }); stages.push(['grep ' + (st.grep || '""'), data.slice()]); }
      if (st.awk) { data = data.map(function (l) { return l.split(/\s+/)[0]; }); stages.push(["awk '{print $1}'", data.slice()]); }
      if (st.sort) { data = data.slice().sort(); stages.push(['sort', data.slice()]); }
      if (st.uniq) {
        var out = [], prev = null, n = 0;
        data.forEach(function (l) { if (l === prev) n++; else { if (prev !== null) out.push([n, prev]); prev = l; n = 1; } });
        if (prev !== null) out.push([n, prev]);
        data = out.map(function (p) { return ('      ' + p[0]).slice(-7) + ' ' + p[1]; });
        stages.push(['uniq -c', data.slice()]);
      }
      if (st.rank) {
        data = data.slice().sort(function (a, b) { var d = parseFloat(b) - parseFloat(a); return d || (a < b ? 1 : a > b ? -1 : 0); });
        stages.push(['sort -rn', data.slice()]);
      }
      if (st.head) { data = data.slice(0, 2); stages.push(['head -n 2', data.slice()]); }
      LV.$('#p-cmd', box).innerHTML = cmdLine(stages.map(function (s) { return s[0]; }).join(' | '));
      LV.$('#p-flow', box).innerHTML = stages.map(function (s, i) {
        return (i ? '<div class="pipe-arrow" aria-hidden="true">│ stdout → stdin</div>' : '') +
          '<div class="pipe-box" style="animation-delay:' + (i * 90) + 'ms"><div class="pipe-h mono">' + esc(s[0]) + ' <span class="muted">(' + s[1].length + ' lines)</span></div><pre class="mono">' + esc(s[1].join('\n') || '(empty)') + '</pre></div>';
      }).join('');
    }
    box.addEventListener('change', run);
    LV.$('#p-grepv', box).addEventListener('input', function () { LV.$('#p-grep', box).checked = true; run(); });
    run();
  });

  /* ---------- grep playground ---------- */
  lab('grep', 'grep playground', 'Type a pattern and see matching lines light up.', 'grep', function (box) {
    var sample = 'Nov 05 09:01:12 ubuntu sshd[812]: Server listening on 0.0.0.0 port 22.\nNov 05 09:14:03 ubuntu sshd[2205]: Accepted publickey for ssk from 192.0.2.77\nNov 05 09:20:44 ubuntu sshd[2301]: Failed password for root from 203.0.113.50\nNov 05 09:20:47 ubuntu sshd[2301]: Failed password for root from 203.0.113.50\nNov 05 09:31:10 ubuntu kernel: EXT4-fs (sda2): mounted filesystem\nNov 05 09:45:02 ubuntu CRON[2400]: (ssk) CMD (backup.sh)\nNov 05 10:02:19 ubuntu nginx[1020]: ERROR upstream timed out';
    box.innerHTML =
      '<label class="field"><span>Pattern</span><input id="g-pat" value="Failed|ERROR" autocomplete="off" spellcheck="false" aria-label="Pattern"></label>' +
      '<div class="presets">' + [['-i', 'i'], ['-v', 'v'], ['-w', 'w'], ['-E', 'E'], ['-n', 'n'], ['-c', 'c']].map(function (f) { return '<label class="chip ck"><input type="checkbox" data-f="' + f[1] + '"' + (f[1] === 'E' || f[1] === 'n' ? ' checked' : '') + '> ' + f[0] + '</label>'; }).join('') + '</div>' +
      '<div class="presets ex">' + [['Failed|ERROR', 'Problems'], ['^Nov 05 09:2', 'Time window'], ['[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+', 'IP addresses'], ['sshd\\[[0-9]+\\]', 'sshd with PID'], ['root$', 'Ends with root']].map(function (p) { return '<button class="chip" data-pat="' + esc(p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div>' +
      '<div id="g-cmd"></div><div class="grep-out mono" id="g-out"></div>' +
      '<details class="mini-d"><summary>Edit sample text</summary><textarea id="g-txt" rows="7" spellcheck="false" aria-label="Sample text">' + esc(sample) + '</textarea></details>';
    function flags() { var f = {}; LV.$$('[data-f]', box).forEach(function (c) { f[c.dataset.f] = c.checked; }); return f; }
    function run() {
      var pat = LV.$('#g-pat', box).value, f = flags(), out = LV.$('#g-out', box);
      var fl = Object.keys(f).filter(function (k) { return f[k]; }).map(function (k) { return '-' + k; }).join(' ');
      LV.$('#g-cmd', box).innerHTML = cmdLine('grep ' + (fl ? fl + ' ' : '') + '"' + pat + '" /var/log/auth.log');
      var src = pat;
      if (!f.E) src = src.replace(/\\\|/g, '\u0001').replace(/([+?|(){}])/g, '\\$1').replace(/\u0001/g, '|');
      if (f.w) src = '\\b(?:' + src + ')\\b';
      var re;
      try { re = new RegExp(src || '(?:)', 'g' + (f.i ? 'i' : '')); } catch (e) { out.innerHTML = '<span class="bad">grep: invalid regular expression</span>'; return; }
      var lines = LV.$('#g-txt', box).value.split('\n'), shown = [], count = 0;
      lines.forEach(function (l, i) {
        re.lastIndex = 0;
        var m = pat ? re.test(l) : true;
        if (m !== !!f.v) {
          count++;
          var html = esc(l);
          if (!f.v && pat) { re.lastIndex = 0; html = l.replace(re, function (x) { return '\u0002' + x + '\u0003'; }); html = esc(html).replace(/\u0002/g, '<mark>').replace(/\u0003/g, '</mark>'); }
          shown.push('<div class="gl">' + (f.n ? '<span class="ln">' + (i + 1) + ':</span>' : '') + html + '</div>');
        }
      });
      out.innerHTML = f.c ? '<div class="gl">' + count + '</div>' : (shown.join('') || '<span class="muted">(no lines match — exit status 1)</span>');
      out.insertAdjacentHTML('beforeend', '<div class="g-sum">' + count + ' of ' + lines.length + ' lines ' + (f.v ? 'do not match' : 'match') + '</div>');
    }
    box.addEventListener('input', run);
    box.addEventListener('change', run);
    box.addEventListener('click', function (e) { var b = e.target.closest('[data-pat]'); if (b) { LV.$('#g-pat', box).value = b.dataset.pat; LV.$('[data-f="E"]', box).checked = true; run(); } });
    run();
  });

  /* ---------- Signals ---------- */
  lab('signals', 'Signal simulator', 'Send signals to processes and watch how each one reacts.', 'signals', function (box) {
    var procs;
    function reset() {
      procs = [
        { pid: 1020, name: 'nginx (master)', st: 'S', note: 'Reloads config on HUP' },
        { pid: 2388, name: 'python3 server.py', st: 'S', note: 'Saves data on TERM' },
        { pid: 2412, name: 'sleep 300', st: 'S', note: 'Default handlers' },
        { pid: 2450, name: 'stubborn.sh', st: 'S', note: 'Traps (ignores) TERM' }
      ];
    }
    reset();
    var sel = 1;
    box.innerHTML = '<div class="proc-list" id="sg-list"></div><div class="presets" id="sg-btns">' +
      [['TERM', '15'], ['KILL', '9'], ['HUP', '1'], ['INT', '2'], ['STOP', '19'], ['CONT', '18']].map(function (s) { return '<button class="chip sig" data-s="' + s[0] + '">SIG' + s[0] + ' <span class="muted">' + s[1] + '</span></button>'; }).join('') +
      '<button class="chip" id="sg-reset">Reset</button></div><div id="sg-cmd"></div><div class="sg-log mono" id="sg-log" aria-live="polite"></div>';
    function paint() {
      LV.$('#sg-list', box).innerHTML = procs.map(function (p, i) {
        return '<button class="proc' + (i === sel ? ' on' : '') + (p.st === 'X' ? ' dead' : '') + '" data-i="' + i + '"><span class="pid mono">' + p.pid + '</span><span class="pname">' + esc(p.name) + '<small>' + esc(p.note) + '</small></span><span class="pst-b st-' + p.st + '">' + ({ S: 'sleeping', R: 'running', T: 'stopped', X: 'exited' })[p.st] + '</span></button>';
      }).join('');
    }
    function log(h) { var l = LV.$('#sg-log', box); l.insertAdjacentHTML('afterbegin', '<div class="sg-e">' + h + '</div>'); }
    function send(sig) {
      var p = procs[sel];
      LV.$('#sg-cmd', box).innerHTML = cmdLine('kill -' + sig + ' ' + p.pid);
      if (p.st === 'X') { log('<span class="bad">bash: kill: (' + p.pid + ') - No such process</span>'); return; }
      var row = LV.$$('.proc', box)[sel]; if (row) { row.classList.remove('zap'); void row.offsetWidth; row.classList.add('zap'); }
      if (sig === 'KILL') { p.st = 'X'; log('SIGKILL → ' + p.pid + ': kernel removes it instantly. No cleanup ran.'); }
      else if (sig === 'STOP') { p.st = 'T'; log('SIGSTOP → ' + p.pid + ' paused (state T). It cannot ignore this.'); }
      else if (sig === 'CONT') { if (p.st === 'T') { p.st = 'S'; log('SIGCONT → ' + p.pid + ' resumes.'); } else log('SIGCONT → ' + p.pid + ' was not stopped; nothing changes.'); }
      else if (p.st === 'T' && sig !== 'KILL') { log('SIG' + sig + ' → ' + p.pid + ' is stopped; the signal stays pending until SIGCONT.'); }
      else if (sig === 'HUP' && p.pid === 1020) { log('SIGHUP → nginx re-reads its config and starts fresh workers. Still running.'); }
      else if (sig === 'TERM' && p.pid === 2450) { log('SIGTERM → stubborn.sh trapped it and keeps running. Next step: SIGKILL.'); }
      else if (sig === 'TERM' && p.pid === 2388) { p.st = 'X'; log('SIGTERM → server.py flushes data, closes sockets, exits 0. Clean.'); }
      else { p.st = 'X'; log('SIG' + sig + ' → ' + p.pid + ' default action: terminate.'); }
      setTimeout(paint, 260);
    }
    box.addEventListener('click', function (e) {
      var pr = e.target.closest('.proc'); if (pr) { sel = +pr.dataset.i; paint(); return; }
      var s = e.target.closest('.sig'); if (s) { send(s.dataset.s); return; }
      if (e.target.closest('#sg-reset')) { reset(); LV.$('#sg-log', box).innerHTML = ''; paint(); }
    });
    paint();
    log('Select a process, then send a signal.');
  });

  /* ---------- Memory & load ---------- */
  lab('load', 'Memory & load visualiser', 'See why "free" memory is low and what load average means.', 'resources', function (box) {
    box.innerHTML =
      '<h4 class="lab-h">Memory (7.7 GiB)</h4>' +
      '<label class="field"><span>Apps using RAM <b id="m-v">2.1</b> GiB</span><input type="range" id="m-apps" min="0.5" max="7.4" step="0.1" value="2.1"></label>' +
      '<div class="membar" id="m-bar"></div><div class="mem-leg"><span><i class="lg used"></i>used</span><span><i class="lg cache"></i>buff/cache</span><span><i class="lg free"></i>free</span></div>' +
      '<pre class="mono term-line" id="m-free"></pre>' +
      '<h4 class="lab-h">Load average</h4>' +
      '<div class="two"><label class="field"><span>CPU threads (nproc)</span><input type="range" id="l-cpu" min="1" max="16" value="4"></label><label class="field"><span>Load</span><input type="range" id="l-load" min="0" max="24" step="0.1" value="2.6"></label></div>' +
      '<div class="cores" id="l-cores"></div><p class="sm" id="l-msg"></p>';
    function f1(x) { return x.toFixed(1) + 'Gi'; }
    function paint() {
      var tot = 7.7, apps = +LV.$('#m-apps', box).value, cache = Math.max(0.2, Math.min(4.4, tot - apps - 0.3)), free = Math.max(0.05, tot - apps - cache);
      var avail = Math.max(0, tot - apps - 0.2);
      LV.$('#m-v', box).textContent = apps.toFixed(1);
      LV.$('#m-bar', box).innerHTML = '<i class="used" style="width:' + (apps / tot * 100) + '%"></i><i class="cache" style="width:' + (cache / tot * 100) + '%"></i><i class="free" style="width:' + (free / tot * 100) + '%"></i>';
      LV.$('#m-free', box).textContent = '               total   used   free  buff/cache  available\nMem:           7.7Gi  ' + f1(apps) + '  ' + f1(free) + '      ' + f1(cache) + '      ' + f1(avail) + (apps > 6.8 ? '\n\n→ available is low: the kernel may start swapping or the OOM killer may act.' : '\n\n→ buff/cache gives memory back as apps need it. Watch "available".');
      var cpu = +LV.$('#l-cpu', box).value, ld = +LV.$('#l-load', box).value;
      var cells = '';
      var slots = Math.max(cpu, Math.ceil(ld));
      for (var i = 0; i < slots; i++) {
        var fill = Math.max(0, Math.min(1, ld - i));
        cells += '<div class="core' + (i >= cpu ? ' queue' : '') + '"><i style="height:' + (fill * 100) + '%"></i><span>' + (i < cpu ? 'cpu' + i : 'wait') + '</span></div>';
      }
      LV.$('#l-cores', box).innerHTML = cells;
      var ratio = ld / cpu;
      LV.$('#l-msg', box).innerHTML = 'Load ' + ld.toFixed(1) + ' on ' + cpu + ' threads = <b>' + Math.round(ratio * 100) + '%</b>. ' + (ratio < 0.7 ? 'Plenty of headroom.' : ratio <= 1 ? 'Busy but keeping up.' : '<b class="bad">Overloaded: ' + (ld - cpu).toFixed(1) + ' processes waiting on average.</b>');
    }
    box.addEventListener('input', paint);
    paint();
  });

  /* ---------- cron ---------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function parseField(f, min, max, names) {
    if (names) names.forEach(function (n, i) { f = f.replace(new RegExp(n, 'ig'), String(i + min)); });
    var set = {}, any = f === '*';
    f.split(',').forEach(function (part) {
      var m = part.match(/^(\*|\d+)(?:-(\d+))?(?:\/(\d+))?$/);
      if (!m) throw new Error('bad field: ' + part);
      var a = m[1] === '*' ? min : +m[1], b = m[2] !== undefined ? +m[2] : (m[1] === '*' || m[3] ? max : a), s = m[3] ? +m[3] : 1;
      if (a < min || b > max || a > b || s < 1) throw new Error('out of range: ' + part);
      for (var i = a; i <= b; i += s) set[i] = 1;
    });
    return { any: any, set: set, src: f };
  }
  function describeField(f, unit, names, base) {
    if (f.src === '*') return null;
    var m;
    if ((m = f.src.match(/^\*\/(\d+)$/))) return 'every ' + m[1] + ' ' + unit + 's';
    var keys = Object.keys(f.set).map(Number);
    return unit + ' ' + keys.map(function (k) { return names ? names[k - base] : k; }).join(', ');
  }
  LV.cron = function (expr) {
    var macros = { '@hourly': '0 * * * *', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@weekly': '0 0 * * 0', '@monthly': '0 0 1 * *', '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *' };
    expr = expr.trim();
    if (expr === '@reboot') return { text: 'Once, every time the system boots.', next: [] };
    if (macros[expr]) expr = macros[expr];
    var p = expr.split(/\s+/);
    if (p.length !== 5) throw new Error('A cron schedule needs 5 fields: minute hour day-of-month month day-of-week');
    var mi = parseField(p[0], 0, 59), hr = parseField(p[1], 0, 23), dom = parseField(p[2], 1, 31), mon = parseField(p[3], 1, 12, MON), dow = parseField(p[4].replace(/7/g, '0'), 0, 6, DOW);
    var parts = [];
    var mins = Object.keys(mi.set), hrs = Object.keys(hr.set);
    if (mins.length === 1 && hrs.length === 1 && !hr.any) parts.push('At ' + ('0' + hrs[0]).slice(-2) + ':' + ('0' + mins[0]).slice(-2));
    else {
      parts.push(mi.any ? 'Every minute' : (describeField(mi, 'minute') + '').replace(/^minute /, 'At minute '));
      if (!hr.any) parts.push(describeField(hr, 'hour').replace(/^hour /, 'past hour '));
    }
    if (!dom.any) parts.push('on ' + describeField(dom, 'day-of-month'));
    if (!mon.any) parts.push('in ' + describeField(mon, 'month', MON, 1).replace(/^month /, ''));
    if (!dow.any) parts.push((dom.any ? 'on ' : 'or on ') + describeField(dow, 'weekday', DOW, 0).replace(/^weekday /, ''));
    var next = [], d = new Date(); d.setSeconds(0, 0); d.setMinutes(d.getMinutes() + 1);
    var guard = 0;
    while (next.length < 5 && guard++ < 600000) {
      var dm = dom.set[d.getDate()], dw = dow.set[d.getDay()];
      var dayOk = dom.any && dow.any ? true : dom.any ? dw : dow.any ? dm : (dm || dw);
      if (!mon.set[d.getMonth() + 1] || !dayOk) { d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); continue; }
      if (!hr.set[d.getHours()]) { d.setHours(d.getHours() + 1, 0, 0, 0); continue; }
      if (mi.set[d.getMinutes()]) next.push(new Date(d));
      d.setMinutes(d.getMinutes() + 1);
    }
    return { text: parts.join(', ') + '.', next: next };
  };
  lab('cron', 'Cron decoder', 'Write a schedule and read it in plain English, with the next five run times.', 'cron', function (box) {
    var pre = [['*/5 * * * *', 'Every 5 min'], ['0 2 * * *', 'Daily 02:00'], ['30 8 * * 1-5', 'Weekdays'], ['0 0 1 * *', 'Monthly'], ['15 */6 * * *', 'Every 6 h'], ['@weekly', '@weekly']];
    box.innerHTML =
      '<div class="cron-fields mono"><span>min</span><span>hour</span><span>dom</span><span>mon</span><span>dow</span></div>' +
      '<label class="field"><span class="sr">Cron expression</span><input id="cr-in" class="mono" value="30 8 * * 1-5" spellcheck="false" autocomplete="off" aria-label="Cron expression"></label>' +
      '<div class="presets">' + pre.map(function (p) { return '<button class="chip" data-c="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div>' +
      '<div class="cron-out" id="cr-out"></div>';
    function run() {
      var v = LV.$('#cr-in', box).value, o = LV.$('#cr-out', box);
      try {
        var r = LV.cron(v);
        o.innerHTML = '<p class="cron-en">' + esc(r.text) + '</p>' + (r.next.length ? '<div class="muted sm">Next runs (your time zone)</div><ol class="cron-next mono">' + r.next.map(function (d) { return '<li>' + d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + '</li>'; }).join('') + '</ol>' : '') +
          cmdLine('(crontab -l; echo "' + v + ' /home/ssk/scripts/backup.sh") | crontab -');
      } catch (e) { o.innerHTML = '<p class="bad">' + esc(e.message) + '</p>'; }
    }
    LV.$('#cr-in', box).addEventListener('input', run);
    box.addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (b) { LV.$('#cr-in', box).value = b.dataset.c; run(); } });
    run();
  });

  /* ---------- CIDR ---------- */
  lab('cidr', 'Subnet calculator', 'Enter an address with a prefix to see the network split into bits.', 'ip', function (box) {
    box.innerHTML =
      '<label class="field"><span>Address / prefix</span><input id="ci-in" class="mono" value="192.0.2.25/24" spellcheck="false" autocomplete="off" aria-label="CIDR"></label>' +
      '<label class="field"><span>Prefix length <b id="ci-pv">24</b></span><input type="range" id="ci-p" min="8" max="32" value="24"></label>' +
      '<div class="bits mono" id="ci-bits"></div><div class="kv" id="ci-kv"></div>';
    function toIp(n) { return [n >>> 24, n >>> 16 & 255, n >>> 8 & 255, n & 255].join('.'); }
    function run(fromSlider) {
      var inp = LV.$('#ci-in', box);
      if (fromSlider) inp.value = inp.value.split('/')[0] + '/' + LV.$('#ci-p', box).value;
      var m = inp.value.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
      if (!m || +m[5] > 32 || [1, 2, 3, 4].some(function (i) { return +m[i] > 255; })) { LV.$('#ci-kv', box).innerHTML = '<p class="bad">Use the form 192.0.2.25/24</p>'; return; }
      var ip = ((+m[1] << 24) >>> 0) + (+m[2] << 16) + (+m[3] << 8) + +m[4], p = +m[5];
      LV.$('#ci-p', box).value = p; LV.$('#ci-pv', box).textContent = p;
      var mask = p ? (0xFFFFFFFF << (32 - p)) >>> 0 : 0, net = (ip & mask) >>> 0, bc = (net | ~mask) >>> 0;
      var hosts = p >= 31 ? (p === 32 ? 1 : 2) : Math.pow(2, 32 - p) - 2;
      var bin = ('00000000000000000000000000000000' + ip.toString(2)).slice(-32), html = '';
      for (var i = 0; i < 32; i++) { html += '<i class="' + (i < p ? 'n' : 'h') + '">' + bin[i] + '</i>'; if (i % 8 === 7 && i < 31) html += '<b>.</b>'; }
      LV.$('#ci-bits', box).innerHTML = html + '<div class="bits-leg"><span class="n">network bits</span> <span class="h">host bits</span></div>';
      var rows = [['Network', toIp(net) + '/' + p], ['Netmask', toIp(mask)], ['Broadcast', p < 31 ? toIp(bc) : '—'], ['First host', p < 31 ? toIp(net + 1) : toIp(net)], ['Last host', p < 31 ? toIp(bc - 1) : toIp(bc)], ['Usable hosts', hosts.toLocaleString()]];
      LV.$('#ci-kv', box).innerHTML = rows.map(function (r) { return '<div><span>' + r[0] + '</span><b class="mono">' + r[1] + '</b></div>'; }).join('') + cmdLine('sudo ip addr add ' + inp.value.trim() + ' dev enp1s0');
    }
    LV.$('#ci-in', box).addEventListener('input', function () { run(false); });
    LV.$('#ci-p', box).addEventListener('input', function () { run(true); });
    run(false);
  });

  /* ---------- Package translator ---------- */
  var PK = {
    'Refresh lists': ['sudo apt update', 'sudo dnf makecache', 'sudo pacman -Sy', 'sudo zypper refresh'],
    'Install': ['sudo apt install htop', 'sudo dnf install htop', 'sudo pacman -S htop', 'sudo zypper install htop'],
    'Remove': ['sudo apt remove htop', 'sudo dnf remove htop', 'sudo pacman -R htop', 'sudo zypper remove htop'],
    'Upgrade all': ['sudo apt update && sudo apt upgrade', 'sudo dnf upgrade --refresh', 'sudo pacman -Syu', 'sudo zypper update'],
    'Search': ['apt search htop', 'dnf search htop', 'pacman -Ss htop', 'zypper search htop'],
    'Show info': ['apt show htop', 'dnf info htop', 'pacman -Si htop', 'zypper info htop'],
    'List installed': ['apt list --installed', 'dnf list --installed', 'pacman -Q', 'zypper search --installed-only'],
    'Which package owns a file': ['dpkg -S /usr/bin/htop', 'rpm -qf /usr/bin/htop', 'pacman -Qo /usr/bin/htop', 'rpm -qf /usr/bin/htop'],
    'Clean cache': ['sudo apt clean', 'sudo dnf clean all', 'sudo pacman -Sc', 'sudo zypper clean'],
    'Remove unused deps': ['sudo apt autoremove', 'sudo dnf autoremove', 'sudo pacman -Rns $(pacman -Qdtq)', 'sudo zypper rm -u htop']
  };
  var FAM = [['apt', 'Debian · Ubuntu · Mint'], ['dnf', 'Fedora · RHEL · Rocky · Alma'], ['pacman', 'Arch'], ['zypper', 'openSUSE']];
  lab('pkg', 'Package translator', 'Pick a task and get the command for every distro family.', 'pkgmgr', function (box) {
    var keys = Object.keys(PK), cur = 'Install';
    box.innerHTML = '<div class="presets" id="pk-tasks">' + keys.map(function (k) { return '<button class="chip' + (k === cur ? ' on' : '') + '" data-k="' + esc(k) + '">' + esc(k) + '</button>'; }).join('') + '</div><div class="pk-rows" id="pk-rows"></div>';
    function paint() {
      LV.$('#pk-rows', box).innerHTML = PK[cur].map(function (c, i) {
        return '<div class="pk-row" style="animation-delay:' + i * 70 + 'ms"><div class="pk-fam"><b class="mono">' + FAM[i][0] + '</b><small>' + FAM[i][1] + '</small></div>' + cmdLine(c) + '</div>';
      }).join('');
      LV.$$('#pk-tasks .chip', box).forEach(function (b) { b.classList.toggle('on', b.dataset.k === cur); });
    }
    box.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) { cur = b.dataset.k; paint(); } });
    paint();
  });
})();
