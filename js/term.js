/* Linuxverse simulated terminal: virtual filesystem, pipes, chaining, documented outputs */
(function () {
  'use strict';
  var esc = LV.esc;
  var HOST = 'ubuntu';

  /* ---------- Virtual filesystem ---------- */
  function F(d, m, o) { return { t: 'f', d: d, m: m || '644', o: o || 'ssk', g: o || 'ssk', mt: 'Nov  5 09:41' }; }
  function D(c, m, o) { return { t: 'd', c: c || {}, m: m || '755', o: o || 'ssk', g: o || 'ssk', mt: 'Nov  5 09:00' }; }
  function L(to) { return { t: 'l', to: to, m: '777', o: 'root', g: 'root', mt: 'Apr 22  2024' }; }
  var ACCESS = '192.0.2.10 - - "GET /" 200\n203.0.113.9 - - "GET /old" 404\n192.0.2.10 - - "GET /about" 200\n198.51.100.7 - - "GET /x" 404\n192.0.2.10 - - "POST /login" 302\n192.0.2.44 - - "GET /missing" 404\n';
  var OSREL = 'PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\nVERSION="24.04.1 LTS (Noble Numbat)"\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/"\n';
  function seedFs() {
    function R(d) { var x = F(d, '644', 'root'); return x; }
    return D({
      bin: L('usr/bin'), sbin: L('usr/sbin'), lib: L('usr/lib'),
      boot: D({ 'vmlinuz-6.8.0-45-generic': F('', '600', 'root'), grub: D({}, '755', 'root') }, '755', 'root'),
      dev: D({ null: F('', '666', 'root'), sda: F('', '660', 'root'), tty: F('', '666', 'root') }, '755', 'root'),
      etc: D({
        hostname: R(HOST + '\n'), 'os-release': R(OSREL),
        passwd: R('root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nssk:x:1000:1000:SSK:/home/ssk:/bin/bash\n'),
        group: R('root:x:0:\nadm:x:4:ssk\nsudo:x:27:ssk\nusers:x:100:ssk\nssk:x:1000:\n'),
        shadow: F('root:*:19800:0:99999:7:::\nssk:$y$j9T$…:19800:0:99999:7:::\n', '640', 'root'),
        hosts: R('127.0.0.1\tlocalhost\n127.0.1.1\t' + HOST + '\n192.0.2.80\tintranet.example.com\n'),
        fstab: R('UUID=9b2f0c1e-4f6a-4c55-9a1d-2e7b5f0d8c11 /          ext4 errors=remount-ro 0 1\nUUID=3A1F-9C2E                            /boot/efi  vfat umask=0077        0 1\n'),
        services: R('ssh\t\t22/tcp\nhttp\t\t80/tcp\nhttps\t\t443/tcp\nhttps\t\t443/udp\n'),
        ssh: D({ sshd_config: R('# OpenSSH server configuration\nInclude /etc/ssh/sshd_config.d/*.conf\n#Port 22\nPermitRootLogin prohibit-password\n#PasswordAuthentication yes\nKbdInteractiveAuthentication no\nUsePAM yes\nX11Forwarding yes\n') }, '755', 'root')
      }, '755', 'root'),
      home: D({
        ssk: D({
          '.bashrc': F('# ~/.bashrc\nalias ll=\'ls -alF\'\nexport EDITOR=nano\n'),
          'notes.txt': F('Learn Linux one command at a time.\nPermissions: r=4 w=2 x=1\nPipes connect stdout to stdin.\n'),
          'access.log': F(ACCESS),
          'names.txt': F('zara\nanil\nmeera\nanil\nbob\n'),
          'report.txt': F('Q3 server report: all services healthy.\n'),
          'deploy.sh': F('#!/usr/bin/env bash\necho "Deploying site..."\necho "Done."\n'),
          scripts: D({ 'hello.sh': F('#!/usr/bin/env bash\nset -euo pipefail\n\nname="${1:-world}"\ntoday=$(date +%F)\n\necho "Hello, $name! Today is $today."\necho "You passed $# argument(s)."\n', '755') }),
          projects: D({ web: D({ 'index.html': F('<h1>Hello from Linuxverse</h1>\n') }) }),
          website: D({
            'index.html': F('<!doctype html>\n<title>My site</title>\n<h1>Hello from Linux</h1>\n'),
            'notes.txt': F('TODO: add an about page\nTODO: compress images\nDone: set up nginx\n'),
            '.env': F('DB_USER=ssk\nDB_PASS=example-only\n', '600'),
            css: D({ 'style.css': F('body { font-family: sans-serif; }\nh1 { color: teal; }\n') }),
            scripts: D({ 'deploy.sh': F('#!/usr/bin/env bash\necho "Copying site to /var/www..."\necho "Deployed."\n', '755'), 'backup.sh': F('#!/usr/bin/env bash\necho "Backing up ~/website..."\necho "Saved website-backup.tar.gz"\n') }),
            logs: D({ 'access.log': F(ACCESS, '640') }, '750'),
            'latest.log': (function () { var x = L('logs/access.log'); x.o = x.g = 'ssk'; x.mt = 'Nov  5 09:50'; return x; })()
          })
        }, '750')
      }, '755', 'root'),
      mnt: D({ data: D({}, '755', 'root') }, '755', 'root'),
      opt: D({}, '755', 'root'),
      proc: D({ cpuinfo: R('processor\t: 0\nmodel name\t: Virtual CPU @ 2.40GHz\ncpu cores\t: 4\n'), meminfo: R('MemTotal:        8072284 kB\nMemAvailable:    5560112 kB\n'), version: R('Linux version 6.8.0-45-generic (buildd@lcy02) gcc 13.2.0\n') }, '555', 'root'),
      root: D({ '.bashrc': F('# root bashrc\n', '644', 'root') }, '700', 'root'),
      srv: D({}, '755', 'root'), sys: D({}, '555', 'root'),
      tmp: D({}, '777', 'root'),
      usr: D({ bin: D({ ls: F('', '755', 'root'), bash: F('', '755', 'root'), grep: F('', '755', 'root') }, '755', 'root'), sbin: D({}, '755', 'root'), lib: D({}, '755', 'root'), share: D({}, '755', 'root'), local: D({}, '755', 'root') }, '755', 'root'),
      var: D({ cache: D({}, '755', 'root'), lib: D({}, '755', 'root'), spool: D({}, '755', 'root'), tmp: D({}, '777', 'root'), log: D({ syslog: F('Nov  5 09:01:12 ' + HOST + ' systemd[1]: Started nginx.service.\nNov  5 09:31:10 ' + HOST + ' kernel: EXT4-fs (sda2): mounted filesystem\nNov  5 10:02:19 ' + HOST + ' nginx[1020]: error: upstream timed out\n', '640', 'root'), 'auth.log': F('Nov  5 09:20:44 ' + HOST + ' sshd[2301]: Failed password for root from 203.0.113.50\n', '640', 'root') }, '755', 'root') }, '755', 'root')
    }, '755', 'root');
  }

  /* ---------- Documented command index ---------- */
  var DOC = null;
  function norm(c) { return c.trim().replace(/\s+/g, ' '); }
  function buildDoc() {
    DOC = { exact: {}, list: [] };
    Object.keys(LV.topics).forEach(function (tid) {
      var t = LV.topics[tid];
      (t.cmds || []).forEach(function (c) {
        var k = norm(c[0]);
        if (!(k in DOC.exact) || (c[2] && DOC.exact[k].out == null)) DOC.exact[k] = { out: c[2] == null ? null : c[2], desc: c[1], topic: tid };
        DOC.list.push({ cmd: c[0], desc: c[1], out: c[2], topic: tid, sec: t.sec });
      });
    });
    LV.allCmds = DOC.list;
  }
  LV.docIndex = function () { if (!DOC) buildDoc(); return DOC; };

  var STATEFUL = ' cd pwd ls cat echo printf mkdir rmdir touch rm cp mv chmod chown grep wc head tail sort uniq cut awk tr nl rev tee tree umask history clear export env set unset true false whoami id hostname date help man sections search examples exit sudo su test [ [[ bash sh source . ln stat basename dirname seq type which sleep jobs readlink ';

  /* ---------- Shell ---------- */
  function Shell() {
    this.fs = seedFs();
    this.user = 'ssk';
    this.home = '/home/ssk';
    this.cwd = '/home/ssk';
    this.old = '/home/ssk';
    this.env = { HOME: '/home/ssk', USER: 'ssk', SHELL: '/bin/bash', PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', LANG: 'en_US.UTF-8', TERM: 'xterm-256color' };
    this.vars = {};
    this.hist = [];
    this.status = 0;
    this.umask = 18; // 022
    this.stack = [];
    this.jobs = [];
    this.args = [];
  }
  var S = Shell.prototype;

  S.prompt = function () {
    var p = this.cwd === this.home ? '~' : this.cwd.indexOf(this.home + '/') === 0 ? '~' + this.cwd.slice(this.home.length) : this.cwd;
    return { user: this.user, host: HOST, path: p, sym: this.user === 'root' ? '#' : '$' };
  };

  S.abs = function (p) {
    if (!p) return this.cwd;
    if (p === '~' || p.indexOf('~/') === 0) p = this.home + p.slice(1);
    var parts = (p[0] === '/' ? p : this.cwd + '/' + p).split('/'), out = [];
    parts.forEach(function (x) { if (!x || x === '.') return; if (x === '..') out.pop(); else out.push(x); });
    return '/' + out.join('/');
  };
  S.node = function (path, noFollow) {
    var parts = path.split('/').filter(Boolean), n = this.fs, cur = '';
    for (var i = 0; i < parts.length; i++) {
      if (n.t === 'l') n = this.node(this.abs2(cur, n.to));
      if (!n || n.t !== 'd') return null;
      n = n.c[parts[i]];
      cur += '/' + parts[i];
      if (!n) return null;
    }
    if (n && n.t === 'l' && !noFollow) return this.node(this.abs2(cur.replace(/\/[^/]*$/, '') || '/', n.to));
    return n;
  };
  S.abs2 = function (base, to) { return to[0] === '/' ? to : (base.replace(/\/$/, '') + '/' + to); };
  S.parent = function (path) {
    var i = path.lastIndexOf('/');
    return { dir: this.node(path.slice(0, i) || '/'), name: path.slice(i + 1) };
  };
  S.can = function (n, bit) {
    if (this.user === 'root') return true;
    var m = n.m, d = n.o === this.user ? +m[0] : (n.g === 'ssk' && this.user === 'ssk') ? +m[1] : +m[2];
    return !!(d & bit);
  };
  S.perm = function (n) {
    var t = n.t === 'd' ? 'd' : n.t === 'l' ? 'l' : '-';
    return t + n.m.split('').map(function (d) { d = +d; return (d & 4 ? 'r' : '-') + (d & 2 ? 'w' : '-') + (d & 1 ? 'x' : '-'); }).join('');
  };
  S.size = function (n) { return n.t === 'd' ? 4096 : n.t === 'l' ? n.to.length : (n.d || '').length; };

  /* ---------- Tokenizer ---------- */
  function tokenize(s) {
    var out = [], cur = '', q = null, had = false;
    out.quoted = [];
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (q) { if (c === q) { q = null; } else if (c === '\\' && q === '"' && i + 1 < s.length && /["\\$`]/.test(s[i + 1])) { cur += s[++i]; } else cur += c; continue; }
      if (c === '"' || c === "'") { q = c; had = true; continue; }
      if (c === '\\' && i + 1 < s.length) { cur += s[++i]; had = true; continue; }
      if (/\s/.test(c)) { if (cur || had) { out.push(cur); out.quoted.push(had); } cur = ''; had = false; continue; }
      cur += c;
    }
    if (cur || had) { out.push(cur); out.quoted.push(had); }
    return out;
  }
  /* split on an operator outside quotes; ops: ['&&','||',';'] or ['|'] */
  function splitTop(s, ops) {
    var parts = [], cur = '', q = null, depth = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (q) { cur += c; if (c === q) q = null; else if (c === '\\' && q === '"') cur += s[++i] || ''; continue; }
      if (c === '"' || c === "'") { q = c; cur += c; continue; }
      if (c === '\\') { cur += c + (s[++i] || ''); continue; }
      if (c === '$' && s[i + 1] === '(') { depth++; cur += c; continue; }
      if (c === ')' && depth) { depth--; cur += c; continue; }
      if (depth) { cur += c; continue; }
      var hit = null;
      for (var k = 0; k < ops.length; k++) { if (s.substr(i, ops[k].length) === ops[k]) { hit = ops[k]; break; } }
      if (hit === '|' && (s[i + 1] === '|' || s[i - 1] === '|')) hit = null;
      if (hit === '&' && (s[i + 1] === '&' || s[i - 1] === '&' || s[i - 1] === '>')) hit = null;
      if (hit) { parts.push({ text: cur, op: hit }); cur = ''; i += hit.length - 1; continue; }
      cur += c;
    }
    parts.push({ text: cur, op: null });
    return parts;
  }

  /* ---------- Expansion ---------- */
  S.expandChunk = function (s) {
    var self = this;
    s = s.replace(/\$\(([^()]*)\)/g, function (m, inner) { return self.run(inner, { capture: true }).out.replace(/\u0001[EF]/g, '').replace(/\n+$/, ''); });
    return s.replace(/\$\{(\w+|[0-9#@])(?::-([^}]*))?\}|\$(\w+|[0-9?#@$])/g, function (m, a, def, b) {
      var k = a || b, v;
      if (k === '?') v = String(self.status);
      else if (k === '$') v = '2210';
      else if (k === '#') v = String(self.args.length);
      else if (k === '@') v = self.args.join(' ');
      else if (/^\d$/.test(k)) v = k === '0' ? 'bash' : self.args[+k - 1];
      else if (k === 'PWD') v = self.cwd;
      else if (k === 'USER') v = self.user;
      else if (k === 'HOME') v = self.home;
      else v = k in self.vars ? self.vars[k] : self.env[k];
      if ((v === undefined || v === '') && def !== undefined) v = def;
      return v === undefined ? '' : v;
    });
  };
  /* Expand $VAR and $(cmd) everywhere except inside single quotes */
  S.expand = function (s) {
    var out = '', chunk = '', dq = false;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === '"') dq = !dq;
      if (c === "'" && !dq) {
        var j = s.indexOf("'", i + 1); if (j < 0) j = s.length - 1;
        out += this.expandChunk(chunk) + s.slice(i, j + 1); chunk = ''; i = j; continue;
      }
      chunk += c;
    }
    return out + this.expandChunk(chunk);
  };
  S.glob = function (args, quoted) {
    var self = this, out = [];
    function braces(w) {
      var b = w.match(/^(.*?)\{([^{}]*,[^{}]*)\}(.*)$/);
      if (!b) return [w];
      var res = [];
      b[2].split(',').forEach(function (it) { braces(b[1] + it + b[3]).forEach(function (x) { res.push(x); }); });
      return res;
    }
    var flat = [], fq = quoted ? [] : null;
    args.forEach(function (a, ix) {
      if (quoted && quoted[ix]) { flat.push(a); fq.push(true); return; }
      braces(a).forEach(function (x) { flat.push(x); if (fq) fq.push(false); });
    });
    args = flat; quoted = fq;
    args.forEach(function (a, ix) {
      if (quoted && quoted[ix]) { out.push(a); return; }
      var m = a.match(/^(.*?)\{(-?\d+)\.\.(-?\d+)\}(.*)$/);
      if (m) { var x = +m[2], y = +m[3], st = x <= y ? 1 : -1; for (var i = x; st > 0 ? i <= y : i >= y; i += st) out.push(m[1] + i + m[4]); return; }
      if (/[*?]/.test(a)) {
        var sl = a.lastIndexOf('/'), dirPart = sl >= 0 ? a.slice(0, sl + 1) : '', pat = a.slice(sl + 1);
        if (!/[*?]/.test(dirPart) && /[*?]/.test(pat)) {
          var re = new RegExp('^' + pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
          var d = self.node(self.abs(dirPart || '.')), hits = d && d.c ? Object.keys(d.c).filter(function (n) { return (n[0] !== '.' || pat[0] === '.') && re.test(n); }).sort() : [];
          if (hits.length) { out.push.apply(out, hits.map(function (h) { return dirPart + h; })); return; }
        }
      }
      out.push(a);
    });
    return out;
  };

  /* ---------- Run a full line ---------- */
  S.run = function (line, opt) {
    opt = opt || {};
    line = line.replace(/^\s+|\s+$/g, '');
    var res = { out: '', html: '' };
    if (!line || line[0] === '#') return res;
    // for loop
    var fm = line.match(/^for\s+(\w+)\s+in\s+(.+?);\s*do\s+(.+?);?\s*done$/);
    if (fm) {
      var items = this.glob(tokenize(this.expand(fm[2])));
      var acc = '';
      for (var i = 0; i < items.length && i < 200; i++) { this.vars[fm[1]] = items[i]; acc += this.run(fm[3], { capture: true }).out; }
      res.out = acc; return res;
    }
    var wm = line.match(/^while\s+read\s+(?:-r\s+)?(\w+);\s*do\s+(.+?);?\s*done\s*<\s*(\S+)$/);
    if (wm) {
      var wn = this.node(this.abs(wm[3]));
      if (!wn || wn.t !== 'f') { this.status = 1; res.out = 'bash: ' + wm[3] + ': No such file or directory\n'; return res; }
      var wacc = '';
      lines(wn.d).forEach(function (l) { this.vars[wm[1]] = l; wacc += this.run(wm[2], { capture: true }).out; }, this);
      res.out = wacc; return res;
    }
    var cm = line.match(/^case\s+(.+?)\s+in\s+(.+?)\s*esac$/);
    if (cm) {
      var word = tokenize(this.expand(cm[1])).join(' '), arms = cm[2].split(';;');
      for (var ai = 0; ai < arms.length; ai++) {
        var am = arms[ai].trim().match(/^\(?([^)]+)\)\s*(.*)$/);
        if (!am) continue;
        var hit = am[1].split('|').some(function (pt) { pt = pt.trim(); return new RegExp('^' + pt.replace(/[.+^${}()[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$').test(word); });
        if (hit) { res.out = am[2] ? this.run(am[2], { capture: true }).out : ''; return res; }
      }
      return res;
    }
    var full = norm(line);
    var d = LV.docIndex().exact[full];
    var fw = full.split(' '), head = fw[0] === 'sudo' ? fw[1] : fw[0];
    if (d && d.out != null && STATEFUL.indexOf(' ' + head + ' ') === -1) {
      this.status = 0; res.out = d.out + '\n'; return res;
    }
    var chain = splitTop(line, ['&&', '||', ';']), skip = false, out = '';
    for (var c = 0; c < chain.length; c++) {
      var part = chain[c];
      if (!skip && part.text.trim()) out += this.pipeline(part.text.trim());
      if (part.op === '&&') skip = this.status !== 0;
      else if (part.op === '||') skip = this.status === 0;
      else skip = false;
      if (this.clearReq) break;
    }
    res.out = out;
    return res;
  };

  S.pipeline = function (text) {
    var stages = splitTop(text, ['|']), input = null, out = '';
    for (var i = 0; i < stages.length; i++) {
      var r = this.simple(stages[i].text.trim(), input);
      if (i < stages.length - 1) { out += r.err; input = r.out; } else out += r.err + r.out;
    }
    return out;
  };

  /* One simple command with redirections */
  S.simple = function (text, stdin) {
    var self = this;
    if (/^\w+=/.test(text) && !/\s/.test(text.replace(/"[^"]*"|'[^']*'|\$\([^)]*\)/g, ''))) {
      var eq = text.indexOf('=');
      this.vars[text.slice(0, eq)] = tokenize(this.expand(text.slice(eq + 1))).join(' ');
      this.status = 0; return { out: '', err: '' };
    }
    var toks = tokenize(this.expand(text)), redir = null, errRedir = null, both = false, inFile = null, bg = false;
    var args = [], argQ = [];
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (toks.quoted[i]) { args.push(t); argQ.push(true); continue; }
      if (t === '>' || t === '>>') { redir = { f: toks[++i], app: t === '>>' }; continue; }
      if (/^>>?\S+/.test(t) && t !== '>&') { redir = { f: t.replace(/^>>?/, ''), app: t.indexOf('>>') === 0 }; continue; }
      if (t === '2>' || t === '2>>') { errRedir = toks[++i]; continue; }
      if (/^2>[^&]/.test(t)) { errRedir = t.slice(2); continue; }
      if (t === '2>&1') { both = true; continue; }
      if (t === '<') { inFile = toks[++i]; continue; }
      if (t === '&' && i === toks.length - 1) { bg = true; continue; }
      args.push(t); argQ.push(false);
    }
    if (bg) { var jn = this.jobs.length + 1, pid = 2410 + jn * 2; this.jobs.push({ n: jn, cmd: args.join(' '), pid: pid }); this.status = 0; return { out: '[' + jn + '] ' + pid + '\n', err: '' }; }
    args = this.glob(args, argQ);
    if (inFile) { var inN = this.node(this.abs(inFile)); if (!inN || inN.t !== 'f') { this.status = 1; return { out: '', err: 'bash: ' + inFile + ': No such file or directory\n' }; } stdin = inN.d; }
    var r = this.exec(args, stdin, text);
    r.out = r.out || ''; r.err = r.err || '';
    if (both) { r.out = r.err + r.out; r.err = ''; }
    if (errRedir) { if (errRedir !== '/dev/null') this.write(errRedir, r.err, false); r.err = ''; }
    if (redir) {
      if (redir.f !== '/dev/null') { var w = this.write(redir.f, r.out, redir.app); if (w) return { out: '', err: w }; }
      r.out = '';
    }
    return r;
  };

  S.write = function (path, data, append) {
    var p = this.abs(path), n = this.node(p);
    if (n && n.t === 'd') return 'bash: ' + path + ': Is a directory\n';
    if (n) { if (!this.can(n, 2)) return 'bash: ' + path + ': Permission denied\n'; n.d = append ? n.d + data : data; n.mt = stamp(); return null; }
    var par = this.parent(p);
    if (!par.dir || par.dir.t !== 'd') return 'bash: ' + path + ': No such file or directory\n';
    if (!this.can(par.dir, 2)) return 'bash: ' + path + ': Permission denied\n';
    par.dir.c[par.name] = this.newFile(data);
    return null;
  };
  S.newFile = function (d) { var f = F(d, (438 & ~this.umask).toString(8), this.user); f.mt = stamp(); return f; };
  S.newDir = function () { var x = D({}, (511 & ~this.umask).toString(8), this.user); x.mt = stamp(); return x; };
  function stamp() { var d = new Date(); return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + ('  ' + d.getDate()).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }

  function flagsOf(args) {
    var f = {}, rest = [];
    args.forEach(function (a) {
      if (/^--/.test(a)) f[a.slice(2)] = true;
      else if (/^-[A-Za-z]+$/.test(a)) a.slice(1).split('').forEach(function (c) { f[c] = true; });
      else rest.push(a);
    });
    return { f: f, rest: rest };
  }
  function readInputs(sh, files, stdin, name) {
    if (!files.length) return { text: stdin == null ? '' : stdin };
    var text = '', err = '';
    files.forEach(function (fl) {
      if (fl === '-') { text += stdin || ''; return; }
      var n = sh.node(sh.abs(fl));
      if (!n) err += name + ': ' + fl + ': No such file or directory\n';
      else if (n.t === 'd') err += name + ': ' + fl + ': Is a directory\n';
      else if (!sh.can(n, 4)) err += name + ': ' + fl + ': Permission denied\n';
      else text += n.d;
    });
    return { text: text, err: err };
  }
  function lines(t) { if (!t) return []; var l = t.split('\n'); if (l[l.length - 1] === '') l.pop(); return l; }
  function J(l) { return l.length ? l.join('\n') + '\n' : ''; }

  /* ---------- Commands ---------- */
  S.exec = function (args, stdin, raw) {
    if (!args.length) return { out: '' };
    var cmd = args[0], a = args.slice(1), self = this;
    var fn = CMDS[cmd];
    var fullN = norm(args.join(' '));
    var doc = LV.docIndex().exact[fullN];
    if (fn) {
      var r = fn.call(this, a, stdin, raw);
      if (r !== undefined && r !== null) { if (r.status === undefined) r.status = r.err ? 1 : 0; this.status = r.status; return r; }
    }
    if (doc) {
      this.status = 0;
      if (doc.out != null) return { out: doc.out + '\n' };
      if (/^(sudo )?(top|htop|crontab -e|tmux|ssh |nano|vim|less|man|sudo visudo|visudo|systemctl edit|tail -f|journalctl -f)/.test(fullN)) return { out: '', note: '(interactive program: on a real system it takes over the terminal until you quit)' };
      return { out: '', note: '(no output, which on Linux means it succeeded)' };
    }
    if (cmd === 'sudo') return CMDS.sudo.call(this, a, stdin, raw);
    // regex patterns
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = fullN.match(PATTERNS[i][0]);
      if (m) { this.status = 0; return { out: PATTERNS[i][1].call(this, m) }; }
    }
    // closest documented command of the same tool
    var known = LV.docIndex().list.filter(function (c) { return c.cmd.split(' ')[0] === cmd || (c.cmd.split(' ')[0] === 'sudo' && c.cmd.split(' ')[1] === cmd); });
    if (known.length || LV.tools[cmd]) {
      var sub = args[1] || '';
      var best = known.filter(function (c) { return c.out && c.cmd.replace(/^sudo /, '').split(' ')[1] === sub; })[0];
      this.status = 0;
      if (best) return { out: best.out + '\n', note: 'Closest documented example: ' + best.cmd };
      return { out: '', note: '(simulated) ' + cmd + ' ran with no output. Documented examples: ' + (known.slice(0, 3).map(function (c) { return c.cmd; }).join(' · ') || 'man ' + cmd) };
    }
    this.status = 127;
    var suggest = { htop: 'htop', tldr: 'tldr', tree: 'tree', dig: 'bind9-dnsutils', traceroute: 'inetutils-traceroute', shellcheck: 'shellcheck', neofetch: 'neofetch', fastfetch: 'fastfetch', vim: 'vim', nmap: 'nmap' }[cmd];
    if (suggest) return { err: "Command '" + cmd + "' not found, but can be installed with:\nsudo apt install " + suggest + '\n', status: 127 };
    return { err: cmd + ': command not found\n', status: 127 };
  };

  var PATTERNS = [
    [/^ping (?:-c ?(\d+) )?(\S+)$/, function (m) {
      var n = +(m[1] || 4), host = m[2], ip = /^\d/.test(host) ? host : '93.184.215.14', o = 'PING ' + host + ' (' + ip + ') 56(84) bytes of data.\n';
      for (var i = 1; i <= Math.min(n, 6); i++) o += '64 bytes from ' + ip + ': icmp_seq=' + i + ' ttl=56 time=' + (11 + Math.random() * 3).toFixed(1) + ' ms\n';
      return o + '\n--- ' + host + ' ping statistics ---\n' + n + ' packets transmitted, ' + n + ' received, 0% packet loss\n';
    }],
    [/^(?:sudo )?systemctl (start|stop|restart|reload|enable|disable|daemon-reload)(?: --now)? ?([\w@.-]*)/, function (m) { var u = (m[2] || 'service').replace(/(\.service)?$/, '.service'); return m[1] === 'enable' ? 'Created symlink /etc/systemd/system/multi-user.target.wants/' + u + ' → /usr/lib/systemd/system/' + u + '.\n' : ''; }],
    [/^(?:sudo )?systemctl is-active (\S+)$/, function () { return 'active\n'; }],
    [/^(?:sudo )?systemctl status (\S+)$/, function (m) { return '● ' + m[1] + '.service\n     Loaded: loaded (/usr/lib/systemd/system/' + m[1] + '.service; enabled)\n     Active: active (running) since ' + new Date().toDateString() + '\n'; }],
    [/^(?:sudo )?apt (?:install|remove|purge) (?:-y )?(\S+)/, function (m) { return 'Reading package lists... Done\nBuilding dependency tree... Done\n(simulated) ' + m[1] + ' processed.\n'; }],
    [/^(?:sudo )?(dnf|zypper|pacman)\b/, function (m) { return '(simulated) ' + m[1] + ' runs on its own distro family. This sandbox is Ubuntu, which uses apt.\n'; }],
    [/^(?:sudo )?kill (?:-\S+ )?\d+$/, function () { return ''; }],
    [/^(?:sudo )?(?:useradd|usermod|userdel|groupadd|passwd|chgrp|ufw allow|ufw deny)\b/, function () { return ''; }]
  ];

  function lsLine(sh, name, n) {
    return sh.perm(n) + ' ' + (n.t === 'd' ? 2 : 1) + ' ' + n.o + ' ' + n.g + ' ' + ('     ' + sh.size(n)).slice(-5) + ' ' + n.mt + ' ' + name + (n.t === 'l' ? ' -> ' + n.to : '');
  }
  function color(n, name) {
    if (n.t === 'd') return '\u0001d' + name + '\u0001e';
    if (n.t === 'l') return '\u0001l' + name + '\u0001e';
    if (n.t === 'f' && /[1357]/.test(n.m[0])) return '\u0001x' + name + '\u0001e';
    return name;
  }

  var CMDS = {
    help: function () {
      return { out: 'Linuxverse simulated shell. Try:\n  ls -la · cd /etc · cat notes.txt · grep 404 access.log\n  cat access.log | grep 404 | wc -l · chmod 750 deploy.sh\n  echo hi > f.txt · mkdir -p a/b · ./scripts/hello.sh you\n  sudo -i · exit · history · man <cmd> · search <word>\nBuilt-ins: help, sections, commands, search, man, examples, history, clear\nEvery command documented in the app answers here. Tab completes; ↑/↓ walk history.\n' };
    },
    sections: function () { return { out: LV.sections.map(function (s) { return s.id + '\t' + s.title + ' (' + s.topics.length + ' topics)'; }).join('\n') + '\n' }; },
    commands: function () { return { out: J(Object.keys(CMDS).sort()) + '\n+ ' + LV.docIndex().list.length + ' documented commands. Use: search <word>\n' }; },
    search: function (a) {
      var q = a.join(' ').toLowerCase();
      if (!q) return { err: 'usage: search <word>\n' };
      var hits = LV.docIndex().list.filter(function (c) { return (c.cmd + ' ' + c.desc).toLowerCase().indexOf(q) >= 0; }).slice(0, 12);
      return { out: hits.length ? J(hits.map(function (c) { return c.cmd + '\n    ' + c.desc; })) : 'No commands match "' + q + '".\n' };
    },
    examples: function (a) {
      var t = a[0] && (LV.topics[a[0]] || null);
      var list = t ? t.cmds : LV.docIndex().list.slice(0).sort(function () { return Math.random() - 0.5; }).slice(0, 6).map(function (c) { return [c.cmd, c.desc]; });
      return { out: J(list.map(function (c) { return c[0] + '   # ' + c[1]; })) };
    },
    man: function (a) {
      if (!a.length) return { err: 'What manual page do you want?\nFor example, try \'man man\'.\n' };
      var name = a[a.length - 1], tool = LV.tools[name];
      var ex = LV.docIndex().list.filter(function (c) { return c.cmd.replace(/^sudo /, '').split(' ')[0] === name; }).slice(0, 5);
      if (!tool && !ex.length) return { err: 'No manual entry for ' + name + '\n', status: 16 };
      return { out: name.toUpperCase() + '(1)\n\nNAME\n       ' + name + ' - ' + (tool ? tool.desc : 'see examples') + '\n\nSYNOPSIS\n       ' + (tool ? tool.syntax : name + ' ...') + '\n\nEXAMPLES\n' + ex.map(function (c) { return '       ' + c.cmd + '\n           ' + c.desc; }).join('\n') + '\n' };
    },
    clear: function () { this.clearReq = true; return { out: '' }; },
    history: function () { return { out: this.hist.map(function (h, i) { return ('    ' + (i + 1)).slice(-5) + '  ' + h; }).join('\n') + '\n' }; },
    pwd: function () { return { out: this.cwd + '\n' }; },
    find: function (a) {
      var paths = [], name = null, ci = false, type = null, i = 0, self = this, out = [], err = '';
      for (; i < a.length && a[i][0] !== '-'; i++) paths.push(a[i]);
      for (; i < a.length; i++) {
        if (a[i] === '-name' || a[i] === '-iname') { ci = a[i] === '-iname'; name = a[++i]; }
        else if (a[i] === '-type') type = a[++i];
      }
      if (!paths.length) paths = ['.'];
      var re = name ? new RegExp('^' + name.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', ci ? 'i' : '') : null;
      paths.forEach(function (p) {
        var n = self.node(self.abs(p));
        if (!n) { err += "find: '" + p + "': No such file or directory\n"; return; }
        (function walk(node, disp) {
          var base = disp.split('/').pop() || disp;
          if ((!re || re.test(base)) && (!type || node.t === type)) out.push(disp);
          if (node.t === 'd') Object.keys(node.c).sort().forEach(function (k) { walk(node.c[k], disp.replace(/\/$/, '') + '/' + k); });
        })(n, p === '~' || p.indexOf('~/') === 0 ? self.home + p.slice(1) : p);
      });
      return { out: out.length ? out.join('\n') + '\n' : '', err: err, status: err ? 1 : 0 };
    },
    whoami: function () { return { out: this.user + '\n' }; },
    hostname: function () { return { out: HOST + '\n' }; },
    id: function () { return { out: this.user === 'root' ? 'uid=0(root) gid=0(root) groups=0(root)\n' : 'uid=1000(ssk) gid=1000(ssk) groups=1000(ssk),4(adm),27(sudo),100(users)\n' }; },
    groups: function () { return { out: this.user === 'root' ? 'root\n' : 'ssk adm sudo users\n' }; },
    true: function () { return { out: '', status: 0 }; },
    false: function () { return { out: '', status: 1 }; },
    sleep: function () { return { out: '' }; },
    jobs: function () { return { out: J(this.jobs.map(function (j, i, arr) { return '[' + j.n + ']' + (i === arr.length - 1 ? '+' : '-') + '  Running                 ' + j.cmd + ' &'; })) }; },
    date: function (a) {
      var d = new Date(), f = a[0] && a[0][0] === '+' ? a[0].slice(1) : null;
      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], p = function (x) { return ('0' + x).slice(-2); };
      if (!f) return { out: d.toString().replace(/ GMT.*/, '') + '\n' };
      return { out: f.replace(/%([FAaHMSYmdTs])/g, function (m, c) {
        return ({ F: d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()), A: days[d.getDay()], a: days[d.getDay()].slice(0, 3), H: p(d.getHours()), M: p(d.getMinutes()), S: p(d.getSeconds()), Y: d.getFullYear(), m: p(d.getMonth() + 1), d: p(d.getDate()), T: p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()), s: Math.floor(d / 1000) })[c];
      }) + '\n' };
    },
    echo: function (a) {
      var n = false, e = false;
      while (a[0] === '-n' || a[0] === '-e') { if (a[0] === '-n') n = true; else e = true; a = a.slice(1); }
      var s = a.join(' ');
      if (e) s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      return { out: s + (n ? '' : '\n') };
    },
    printf: function (a) { var s = (a[0] || '').replace(/\\n/g, '\n').replace(/\\t/g, '\t'), i = 1; return { out: s.replace(/%[sd]/g, function () { return a[i++] || ''; }) }; },
    export: function (a) { var self = this; a.forEach(function (x) { var i = x.indexOf('='); if (i > 0) self.env[x.slice(0, i)] = x.slice(i + 1); else if (x in self.vars) self.env[x] = self.vars[x]; }); return { out: a.length ? '' : Object.keys(this.env).map(function (k) { return 'declare -x ' + k + '="' + self.env[k] + '"'; }).join('\n') + '\n' }; },
    env: function () { var e = this.env; return { out: Object.keys(e).map(function (k) { return k + '=' + e[k]; }).join('\n') + '\nPWD=' + this.cwd + '\n' }; },
    unset: function (a) { var self = this; a.forEach(function (k) { delete self.vars[k]; delete self.env[k]; }); return { out: '' }; },
    type: function (a) { var self = this; return { out: J(a.map(function (c) { return CMDS[c] && /^(cd|echo|export|pwd|type|history|umask|true|false|jobs|test|source|alias|exit)$/.test(c) ? c + ' is a shell builtin' : CMDS[c] || LV.tools[c] ? c + ' is /usr/bin/' + c : 'bash: type: ' + c + ': not found'; })) }; },
    which: function (a) { return { out: J(a.filter(function (c) { return CMDS[c] || LV.tools[c]; }).map(function (c) { return '/usr/bin/' + c; })), status: a.every(function (c) { return CMDS[c] || LV.tools[c]; }) ? 0 : 1 }; },
    umask: function (a) {
      if (a[0] === '-S') { var al = (~this.umask) & 511, s = function (d) { return (d & 4 ? 'r' : '') + (d & 2 ? 'w' : '') + (d & 1 ? 'x' : ''); }; return { out: 'u=' + s(al >> 6 & 7) + ',g=' + s(al >> 3 & 7) + ',o=' + s(al & 7) + '\n' }; }
      if (a[0] && /^[0-7]{3,4}$/.test(a[0])) { this.umask = parseInt(a[0], 8); return { out: '' }; }
      return { out: ('0000' + this.umask.toString(8)).slice(-4) + '\n' };
    },
    cd: function (a) {
      var t = a[0];
      if (!t || t === '~') t = this.home;
      if (t === '-') { t = this.old; }
      var p = this.abs(t), n = this.node(p);
      if (!n) return { err: 'bash: cd: ' + a[0] + ': No such file or directory\n' };
      if (n.t !== 'd') return { err: 'bash: cd: ' + a[0] + ': Not a directory\n' };
      if (!this.can(n, 1)) return { err: 'bash: cd: ' + a[0] + ': Permission denied\n' };
      this.old = this.cwd; this.cwd = p;
      return { out: a[0] === '-' ? p + '\n' : '' };
    },
    ls: function (args) {
      var o = flagsOf(args), f = o.f, self = this, out = [], err = '';
      if (f.i || f.Z) return null;
      var targets = o.rest.length ? o.rest : ['.'];
      function listDir(path, label, n) {
        if (!self.can(n, 4)) { err += "ls: cannot open directory '" + label + "': Permission denied\n"; return; }
        var names = Object.keys(n.c).filter(function (x) { return f.a || f.A || x[0] !== '.'; }).sort();
        if (f.t) names.sort(function (x, y) { return (n.c[y].mt > n.c[x].mt) ? 1 : -1; });
        if (f.r) names.reverse();
        if (f.a) names = ['.', '..'].concat(names);
        if (targets.length > 1 || f.R) out.push(label + ':');
        if (f.l) {
          out.push('total ' + names.length * 4);
          names.forEach(function (x) { var c = x === '.' || x === '..' ? n : n.c[x]; var line = lsLine(self, x, c); out.push(line.slice(0, line.length - x.length - (c.t === 'l' ? c.to.length + 4 : 0)) + color(c, x) + (c.t === 'l' ? ' -> ' + c.to : '')); });
        } else out.push(names.map(function (x) { return color(x === '.' || x === '..' ? n : n.c[x], x); }).join('  '));
        if (f.R) names.forEach(function (x) { if (x !== '.' && x !== '..' && n.c[x].t === 'd') { out.push(''); listDir(path + '/' + x, (label === '.' ? '.' : label) + '/' + x, n.c[x]); } });
      }
      if (!f.l && !f.d && targets.length > 1) {
        var plain = targets.filter(function (t) { var n = self.node(self.abs(t)); return n && n.t !== 'd'; });
        if (plain.length) { out.push(plain.map(function (t) { return color(self.node(self.abs(t)), t); }).join('  ')); targets = targets.filter(function (t) { return plain.indexOf(t) < 0; }); }
      }
      targets.forEach(function (t, i) {
        var p = self.abs(t), raw = self.node(p, true), n = self.node(p);
        if (!n) { err += "ls: cannot access '" + t + "': No such file or directory\n"; return; }
        if (i && out.length) out.push('');
        if (raw && raw.t === 'l' && (f.l || f.d)) { out.push(lsLine(self, t, raw)); return; }
        if (n.t === 'd' && !f.d) listDir(p, t, n);
        else out.push(f.l ? lsLine(self, t, n) : t);
      });
      return { out: out.length ? out.join('\n') + '\n' : '', err: err, status: err ? 2 : 0 };
    },
    tree: function (args) {
      var o = flagsOf(args.filter(function (x, i) { return !(args[i - 1] === '-L'); }));
      var li = args.indexOf('-L'), max = li >= 0 ? +args[li + 1] : 9;
      var root = o.rest[0] || '.', self = this, n = this.node(this.abs(root)), dirs = 0, files = 0, out = [root];
      if (!n || n.t !== 'd') return { err: root + ' [error opening dir]\n' };
      (function walk(nd, pre, depth) {
        if (depth > max) return;
        var names = Object.keys(nd.c).filter(function (x) { return x[0] !== '.'; }).sort();
        names.forEach(function (x, i) {
          var last = i === names.length - 1, c = nd.c[x];
          out.push(pre + (last ? '└── ' : '├── ') + color(c, x));
          if (c.t === 'd') { dirs++; walk(c, pre + (last ? '    ' : '│   '), depth + 1); } else files++;
        });
      })(n, '', 1);
      return { out: out.join('\n') + '\n\n' + dirs + ' directories, ' + files + ' files\n' };
    },
    cat: function (a, stdin) {
      var o = flagsOf(a), r = readInputs(this, o.rest, stdin, 'cat');
      var t = r.text;
      if (o.f.n) t = J(lines(t).map(function (l, i) { return ('     ' + (i + 1)).slice(-6) + '\t' + l; }));
      return { out: t, err: r.err };
    },
    head: function (a, stdin) { return headTail.call(this, a, stdin, true); },
    tail: function (a, stdin) { return headTail.call(this, a, stdin, false); },
    wc: function (a, stdin) {
      var o = flagsOf(a), r = readInputs(this, o.rest, stdin, 'wc'), t = r.text;
      var L = lines(t).length, W = (t.match(/\S+/g) || []).length, C = t.length, name = o.rest.length ? ' ' + o.rest.join(' ') : '';
      var parts = [];
      if (o.f.l) parts.push(L); if (o.f.w) parts.push(W); if (o.f.c || o.f.m) parts.push(C);
      if (!parts.length) parts = [L, W, C];
      return { out: (parts.length === 1 && !name ? parts[0] : parts.map(function (x) { return (parts.length > 1 ? ('      ' + x).slice(-7) : x); }).join(' ')) + name + '\n', err: r.err };
    },
    sort: function (a, stdin) {
      var o = flagsOf(a.filter(function (x, i) { return !/^-[tk]$/.test(a[i - 1] || ''); })), f = o.f;
      var t = (a.indexOf('-t') >= 0 ? a[a.indexOf('-t') + 1] : (a.join(' ').match(/-t(\S)/) || [])[1]);
      var k = (a.indexOf('-k') >= 0 ? a[a.indexOf('-k') + 1] : (a.join(' ').match(/-k(\d+)/) || [])[1]);
      var files = o.rest.filter(function (x) { return x !== t && x !== k; });
      var r = readInputs(this, files, stdin, 'sort'), L = lines(r.text);
      function key(l) { if (!k) return l; var parts = t ? l.split(t) : l.trim().split(/\s+/); return parts.slice(parseInt(k, 10) - 1).join(t || ' '); }
      function hnum(s) { var m = String(s).trim().match(/^([\d.]+)([KMGT]?)/i); if (!m) return 0; return parseFloat(m[1]) * Math.pow(1024, ' KMGT'.indexOf((m[2] || ' ').toUpperCase())); }
      L.sort(function (x, y) {
        var a1 = key(x), b1 = key(y), d;
        if (f.n || f.h) { d = (f.h ? hnum(a1) - hnum(b1) : (parseFloat(a1) || 0) - (parseFloat(b1) || 0)); if (d) return d; }
        return x < y ? -1 : x > y ? 1 : 0;
      });
      if (f.r) L.reverse();
      if (f.u) L = L.filter(function (x, i) { return i === 0 || x !== L[i - 1]; });
      return { out: J(L), err: r.err };
    },
    uniq: function (a, stdin) {
      var o = flagsOf(a), r = readInputs(this, o.rest, stdin, 'uniq'), out = [], prev = null, n = 0;
      lines(r.text).forEach(function (l) { if (l === prev) n++; else { if (prev !== null) out.push([n, prev]); prev = l; n = 1; } });
      if (prev !== null) out.push([n, prev]);
      if (o.f.d) out = out.filter(function (p) { return p[0] > 1; });
      return { out: J(out.map(function (p) { return o.f.c ? ('      ' + p[0]).slice(-7) + ' ' + p[1] : p[1]; })) };
    },
    grep: function (args, stdin) {
      var f = {}, rest = [];
      args.forEach(function (x) { if (/^-[a-zA-Z]+$/.test(x)) x.slice(1).split('').forEach(function (c) { f[c] = true; }); else if (x === '--color=auto') {} else rest.push(x); });
      if (!rest.length) return { err: 'Usage: grep [OPTION]... PATTERNS [FILE]...\n', status: 2 };
      var pat = rest[0], files = rest.slice(1), self = this, src = pat;
      if (!f.E) src = src.replace(/\\\|/g, '\u0001').replace(/\\([(){}+?])/g, '\u0002$1').replace(/([+?|(){}])/g, '\\$1').replace(/\u0002\\?([(){}+?])/g, '$1').replace(/\u0001/g, '|');
      if (f.w) src = '\\b(?:' + src + ')\\b';
      var re; try { re = new RegExp(src, f.i ? 'i' : ''); } catch (e) { return { err: 'grep: Invalid regular expression\n', status: 2 }; }
      var out = [], err = '', count = 0, multi = files.length > 1 || f.r;
      function scan(text, name) {
        var c = 0;
        lines(text).forEach(function (l, i) {
          var m = re.test(l);
          if (m === !!f.v) return;
          c++;
          if (f.c || f.l) return;
          if (f.o && !f.v) { var g = new RegExp(re.source, 'g' + (f.i ? 'i' : '')), mm; while ((mm = g.exec(l))) { out.push((multi ? name + ':' : '') + mm[0]); if (!mm[0]) g.lastIndex++; } return; }
          var shown = f.v ? l : l.replace(new RegExp(re.source, 'g' + (f.i ? 'i' : '')), function (x) { return '\u0001m' + x + '\u0001e'; });
          out.push((multi ? '\u0001p' + name + '\u0001e:' : '') + (f.n ? '\u0001n' + (i + 1) + '\u0001e:' : '') + shown);
        });
        count += c;
        if (f.c) out.push((multi ? name + ':' : '') + c);
        if (f.l && c) out.push(name);
      }
      if (!files.length) { if (f.r) files = ['.']; else scan(stdin || '', '(standard input)'); }
      files.forEach(function (fl) {
        var p = self.abs(fl), n = self.node(p);
        if (!n) { err += 'grep: ' + fl + ': No such file or directory\n'; return; }
        if (n.t === 'd') {
          if (!f.r) { err += 'grep: ' + fl + ': Is a directory\n'; return; }
          (function walk(nd, base) { Object.keys(nd.c).sort().forEach(function (x) { var c = nd.c[x]; if (c.t === 'd') walk(c, base + '/' + x); else if (c.t === 'f' && self.can(c, 4)) scan(c.d, (base === '.' ? '' : base + '/') .replace(/^\.\//, '') + x); }); })(n, fl === '.' ? '.' : fl);
          return;
        }
        if (!self.can(n, 4)) { err += 'grep: ' + fl + ': Permission denied\n'; return; }
        scan(n.d, fl);
      });
      return { out: J(out), err: err, status: err ? 2 : count ? 0 : 1 };
    },
    cut: function (a, stdin) {
      var d = '\t', fl = null, files = [];
      for (var i = 0; i < a.length; i++) {
        if (a[i] === '-d') d = a[++i]; else if (/^-d./.test(a[i])) d = a[i].slice(2);
        else if (a[i] === '-f') fl = a[++i]; else if (/^-f./.test(a[i])) fl = a[i].slice(2);
        else files.push(a[i]);
      }
      if (!fl) return { err: 'cut: you must specify a list of bytes, characters, or fields\n' };
      var want = {}; fl.split(',').forEach(function (p) { var m = p.split('-'); var x = +m[0] || 1, y = m.length > 1 ? (+m[1] || 99) : x; for (var k = x; k <= y; k++) want[k] = 1; });
      var r = readInputs(this, files, stdin, 'cut');
      return { out: J(lines(r.text).map(function (l) { if (l.indexOf(d) < 0) return l; return l.split(d).filter(function (x, i) { return want[i + 1]; }).join(d); })), err: r.err };
    },
    awk: function (a, stdin) {
      var sep = null, i = 0;
      if (a[0] === '-F') { sep = a[1]; i = 2; } else if (a[0] && /^-F./.test(a[0])) { sep = a[0].slice(2); i = 1; }
      var prog = a[i] || '', files = a.slice(i + 1);
      var m = prog.match(/^\s*(?:(\$\d+|NR|NF)\s*(==|!=|>=|<=|>|<|~)\s*("?[^{"]*"?|\/[^/]*\/)\s*)?\{\s*print\s*([^}]*)\}\s*$/);
      if (!m) return null;
      var r = readInputs(this, files, stdin, 'awk');
      var out = [];
      lines(r.text).forEach(function (l, n) {
        var fs = sep ? l.split(sep) : l.trim().split(/\s+/);
        function val(tok) { tok = tok.trim(); if (tok === '$0') return l; if (tok === 'NR') return n + 1; if (tok === 'NF') return fs.length; var mm = tok.match(/^\$(\d+)$/); if (mm) return fs[+mm[1] - 1] || ''; return tok.replace(/^"|"$/g, ''); }
        if (m[1]) {
          var lv = val(m[1]), rv = m[3].replace(/^"|"$/g, ''), ok;
          var ln = parseFloat(lv), rn = parseFloat(rv), num = !isNaN(ln) && !isNaN(rn) && m[2] !== '~';
          switch (m[2]) {
            case '==': ok = num ? ln === rn : lv == rv; break; case '!=': ok = num ? ln !== rn : lv != rv; break;
            case '>=': ok = ln >= rn; break; case '<=': ok = ln <= rn; break; case '>': ok = ln > rn; break; case '<': ok = ln < rn; break;
            case '~': ok = new RegExp(rv.replace(/^\/|\/$/g, '')).test(lv); break;
          }
          if (!ok) return;
        }
        var expr = m[4].trim() || '$0';
        out.push(expr.split(/\s*,\s*/).map(val).join(' '));
      });
      return { out: J(out), err: r.err };
    },
    tr: function (a, stdin) {
      var set = function (s) { return s.replace(/(\w)-(\w)/g, function (m, x, y) { var o = ''; for (var c = x.charCodeAt(0); c <= y.charCodeAt(0); c++) o += String.fromCharCode(c); return o; }); };
      if (a[0] === '-d') { var del = set(a[1] || ''); return { out: (stdin || '').split('').filter(function (c) { return del.indexOf(c) < 0; }).join('') }; }
      var x = set(a[0] || ''), y = set(a[1] || '');
      return { out: (stdin || '').split('').map(function (c) { var i = x.indexOf(c); return i < 0 ? c : (y[i] || y[y.length - 1] || ''); }).join('') };
    },
    nl: function (a, stdin) { var r = readInputs(this, a, stdin, 'nl'); return { out: J(lines(r.text).map(function (l, i) { return ('     ' + (i + 1)).slice(-6) + '\t' + l; })), err: r.err }; },
    rev: function (a, stdin) { var r = readInputs(this, a, stdin, 'rev'); return { out: J(lines(r.text).map(function (l) { return l.split('').reverse().join(''); })) }; },
    tee: function (a, stdin) { var self = this, app = a[0] === '-a'; a.filter(function (x) { return x !== '-a'; }).forEach(function (f) { self.write(f, stdin || '', app); }); return { out: stdin || '' }; },
    seq: function (a) { var x = a.length > 1 ? +a[0] : 1, y = +a[a.length - 1], o = []; for (var i = x; i <= y && o.length < 500; i++) o.push(i); return { out: J(o) }; },
    basename: function (a) { return { out: (a[0] || '').replace(/\/$/, '').split('/').pop() + '\n' }; },
    dirname: function (a) { var p = (a[0] || '').replace(/\/$/, ''); var i = p.lastIndexOf('/'); return { out: (i > 0 ? p.slice(0, i) : i === 0 ? '/' : '.') + '\n' }; },
    mkdir: function (a) {
      var o = flagsOf(a), self = this, err = '';
      o.rest.forEach(function (d) {
        var p = self.abs(d);
        if (o.f.p) {
          var cur = '';
          p.split('/').filter(Boolean).forEach(function (part) {
            var par = self.node(cur || '/'); cur += '/' + part;
            if (!par.c[part]) { if (!self.can(par, 2)) { err = "mkdir: cannot create directory '" + d + "': Permission denied\n"; return; } par.c[part] = self.newDir(); }
          });
          return;
        }
        var pr = self.parent(p);
        if (self.node(p)) err += "mkdir: cannot create directory '" + d + "': File exists\n";
        else if (!pr.dir) err += "mkdir: cannot create directory '" + d + "': No such file or directory\n";
        else if (!self.can(pr.dir, 2)) err += "mkdir: cannot create directory '" + d + "': Permission denied\n";
        else { pr.dir.c[pr.name] = self.newDir(); if (o.f.v) err += ''; }
      });
      return { out: '', err: err };
    },
    rmdir: function (a) {
      var self = this, err = '';
      a.forEach(function (d) { var p = self.abs(d), n = self.node(p), pr = self.parent(p); if (!n) err += "rmdir: failed to remove '" + d + "': No such file or directory\n"; else if (Object.keys(n.c || {}).length) err += "rmdir: failed to remove '" + d + "': Directory not empty\n"; else delete pr.dir.c[pr.name]; });
      return { out: '', err: err };
    },
    touch: function (a) {
      var self = this, err = '';
      flagsOf(a).rest.forEach(function (f) { var p = self.abs(f), n = self.node(p); if (n) { n.mt = stamp(); return; } var w = self.write(f, '', false); if (w) err += w.replace('bash:', 'touch: cannot touch'); });
      return { out: '', err: err };
    },
    rm: function (a) {
      var o = flagsOf(a), self = this, err = '', out = '';
      o.rest.forEach(function (f) {
        var p = self.abs(f), n = self.node(p, true), pr = self.parent(p);
        if (p === '/' ) { err += "rm: it is dangerous to operate recursively on '/'\nrm: use --no-preserve-root to override this failsafe\n"; return; }
        if (!n) { if (!o.f.f) err += "rm: cannot remove '" + f + "': No such file or directory\n"; return; }
        if (n.t === 'd' && !o.f.r && !o.f.R) { err += "rm: cannot remove '" + f + "': Is a directory\n"; return; }
        if (!self.can(pr.dir, 2)) { err += "rm: cannot remove '" + f + "': Permission denied\n"; return; }
        delete pr.dir.c[pr.name];
        if (o.f.v || o.f.i) out += "removed '" + f + "'\n";
      });
      return { out: out, err: err };
    },
    cp: function (a) {
      var o = flagsOf(a), self = this, err = '';
      if (o.rest.length < 2) return { err: 'cp: missing destination file operand\n' };
      var dest = o.rest.pop(), dp = self.abs(dest), dn = self.node(dp);
      o.rest.forEach(function (s) {
        var sn = self.node(self.abs(s));
        if (!sn) { err += "cp: cannot stat '" + s + "': No such file or directory\n"; return; }
        if (sn.t === 'd' && !o.f.r && !o.f.R && !o.f.a) { err += "cp: -r not specified; omitting directory '" + s + "'\n"; return; }
        var target = dn && dn.t === 'd' ? dp + '/' + s.split('/').pop() : dp, tp = self.parent(target);
        if (!tp.dir) { err += "cp: cannot create '" + dest + "': No such file or directory\n"; return; }
        if (o.f.n && tp.dir.c[tp.name]) return;
        tp.dir.c[tp.name] = clone(sn, self.user);
      });
      return { out: '', err: err };
    },
    mv: function (a) {
      var o = flagsOf(a), self = this, err = '';
      if (o.rest.length < 2) return { err: 'mv: missing destination file operand\n' };
      var dest = o.rest.pop(), dp = self.abs(dest), dn = self.node(dp);
      o.rest.forEach(function (s) {
        var sp = self.abs(s), sn = self.node(sp, true), spr = self.parent(sp);
        if (!sn) { err += "mv: cannot stat '" + s + "': No such file or directory\n"; return; }
        var target = dn && dn.t === 'd' ? dp + '/' + s.split('/').pop() : dp, tp = self.parent(target);
        if (!tp.dir) { err += "mv: cannot move '" + s + "' to '" + dest + "': No such file or directory\n"; return; }
        if (!self.can(spr.dir, 2) || !self.can(tp.dir, 2)) { err += "mv: cannot move '" + s + "': Permission denied\n"; return; }
        delete spr.dir.c[spr.name]; tp.dir.c[tp.name] = sn;
      });
      return { out: '', err: err };
    },
    ln: function (a) {
      var o = flagsOf(a), self = this;
      if (o.rest.length < 2) return { err: 'ln: missing destination file operand\n' };
      var t = o.rest[0], l = self.abs(o.rest[1]), pr = self.parent(l);
      if (pr.dir.c[pr.name] && !o.f.f) return { err: "ln: failed to create link '" + o.rest[1] + "': File exists\n" };
      if (o.f.s) { var x = L(t); x.o = x.g = self.user; x.mt = stamp(); pr.dir.c[pr.name] = x; }
      else { var n = self.node(self.abs(t)); if (!n) return { err: "ln: failed to access '" + t + "': No such file or directory\n" }; if (n.t === 'd') return { err: "ln: " + t + ": hard link not allowed for directory\n" }; pr.dir.c[pr.name] = n; }
      return { out: '' };
    },
    readlink: function (a) { var o = flagsOf(a), p = this.abs(o.rest[0] || ''), n = this.node(p, true); if (!n) return { out: '', status: 1 }; if (o.f.f) return { out: (n.t === 'l' ? this.abs2(p.replace(/\/[^/]*$/, ''), n.to) : p) + '\n' }; return n.t === 'l' ? { out: n.to + '\n' } : { out: '', status: 1 }; },
    stat: function (a) {
      var self = this, fmt = null, files = [];
      for (var i = 0; i < a.length; i++) { if (a[i] === '-c') fmt = a[++i]; else files.push(a[i]); }
      var out = '', err = '';
      files.forEach(function (f) {
        var n = self.node(self.abs(f));
        if (!n) { err += "stat: cannot statx '" + f + "': No such file or directory\n"; return; }
        if (fmt) out += fmt.replace(/%([Aanus])/g, function (m, c) { return ({ A: self.perm(n), a: parseInt(n.m, 8).toString(8), n: f, u: n.o, s: self.size(n) })[c]; }) + '\n';
        else out += '  File: ' + f + '\n  Size: ' + self.size(n) + '\t\t' + (n.t === 'd' ? 'directory' : 'regular file') + '\nAccess: (0' + n.m + '/' + self.perm(n) + ')  Uid: ( ' + (n.o === 'root' ? 0 : 1000) + '/ ' + n.o + ')\n';
      });
      return { out: out, err: err };
    },
    chmod: function (a) {
      var o = [], rec = false; a.forEach(function (x) { if (x === '-R' || x === '-r' || x === '--recursive') rec = true; else if (x !== '-v' && x !== '-c') o.push(x); });
      var mode = o[0], self = this, err = '';
      if (!mode || o.length < 2) return { err: 'chmod: missing operand\n' };
      var targets = [];
      function collect(nd, label) { targets.push([nd, label]); if (rec && nd.t === 'd' && nd.c) Object.keys(nd.c).forEach(function (k) { collect(nd.c[k], label + '/' + k); }); }
      o.slice(1).forEach(function (f) {
        var n0 = self.node(self.abs(f));
        if (!n0) { err += "chmod: cannot access '" + f + "': No such file or directory\n"; return; }
        collect(n0, f);
      });
      targets.forEach(function (tg) {
        var n = tg[0], f = tg[1];
        if (n.o !== self.user && self.user !== 'root') { err += "chmod: changing permissions of '" + f + "': Operation not permitted\n"; return; }
        if (/^[0-7]{3,4}$/.test(mode)) { n.m = mode.slice(-3); return; }
        var cur = n.m.split('').map(Number);
        mode.split(',').forEach(function (cl) {
          var m = cl.match(/^([ugoa]*)([+\-=])([rwx]*)$/);
          if (!m) { err = "chmod: invalid mode: '" + mode + "'\n"; return; }
          var who = m[1] || 'a', bits = (m[3].indexOf('r') >= 0 ? 4 : 0) | (m[3].indexOf('w') >= 0 ? 2 : 0) | (m[3].indexOf('x') >= 0 ? 1 : 0);
          [0, 1, 2].forEach(function (i) {
            if (who.indexOf('a') < 0 && who.indexOf('ugo'[i]) < 0) return;
            if (m[2] === '+') cur[i] |= bits; else if (m[2] === '-') cur[i] &= ~bits; else cur[i] = bits;
          });
        });
        n.m = cur.join('');
      });
      return { out: '', err: err };
    },
    chown: function (a) {
      if (this.user !== 'root') return { err: "chown: changing ownership of '" + (a[a.length - 1] || '') + "': Operation not permitted\n" };
      var o = a.filter(function (x) { return x[0] !== '-'; }), self = this, spec = o[0].split(':');
      o.slice(1).forEach(function (f) { var n = self.node(self.abs(f)); if (n) { if (spec[0]) n.o = spec[0]; if (spec[1]) n.g = spec[1]; } });
      return { out: '' };
    },
    test: function (a) { return testExpr.call(this, a); },
    '[': function (a) { return testExpr.call(this, a.slice(0, -1)); },
    '[[': function (a) { return testExpr.call(this, a.slice(0, -1)); },
    sudo: function (a, stdin, raw) {
      if (!a.length) return { err: 'usage: sudo -h | -K | -k | -V\n' };
      if (a[0] === '-i' || (a[0] === 'su' && (a[1] === '-' || !a[1]))) { this.stack.push({ user: this.user, cwd: this.cwd, home: this.home }); this.user = 'root'; this.home = '/root'; this.old = this.cwd; this.cwd = '/root'; return { out: '' }; }
      if (a[0] === '-l') return null;
      var prev = this.user; this.user = 'root';
      var r;
      try { r = this.exec(a, stdin, raw); } finally { this.user = prev; }
      return r;
    },
    su: function (a) {
      var target = a.filter(function (x) { return x !== '-' && x !== '-l'; })[0] || 'root';
      if (target === this.user) return { out: '' };
      if (target === 'root' && this.user !== 'root') return { err: 'Password: \nsu: Authentication failure\n(Ubuntu locks the root password. Use sudo -i instead.)\n' };
      this.stack.push({ user: this.user, cwd: this.cwd, home: this.home });
      this.user = target; this.home = target === 'root' ? '/root' : '/home/' + target; this.cwd = this.home;
      return { out: '' };
    },
    exit: function () {
      var s = this.stack.pop();
      if (!s) return { out: 'logout\n(This is the top-level shell. The session stays open.)\n' };
      this.user = s.user; this.cwd = s.cwd; this.home = s.home;
      return { out: 'logout\n' };
    },
    bash: function (a) { return runScript.call(this, a); },
    sh: function (a) { return runScript.call(this, a); },
    source: function (a) { return runScript.call(this, a); },
    '.': function (a) { return runScript.call(this, a); }
  };

  function clone(n, owner) {
    if (n.t === 'd') { var c = {}; for (var k in n.c) c[k] = clone(n.c[k], owner); return { t: 'd', c: c, m: n.m, o: owner, g: owner, mt: stamp() }; }
    var x = {}; for (var j in n) x[j] = n[j]; x.o = x.g = owner; x.mt = stamp(); return x;
  }
  function headTail(a, stdin, head) {
    var n = 10, files = [];
    for (var i = 0; i < a.length; i++) {
      if (a[i] === '-n') n = parseInt(a[++i], 10);
      else if (/^-n\d+$/.test(a[i])) n = +a[i].slice(2);
      else if (/^-\d+$/.test(a[i])) n = +a[i].slice(1);
      else if (a[i] === '-f') return { out: '', note: '(follow mode is not simulated; real tail -f waits for new lines until Ctrl+C)' };
      else files.push(a[i]);
    }
    var r = readInputs(this, files, stdin, head ? 'head' : 'tail'), L = lines(r.text);
    return { out: J(head ? L.slice(0, n) : L.slice(Math.max(0, L.length - n))), err: r.err };
  }
  function testExpr(a) {
    var self = this, ok = false;
    if (a.length === 2) {
      var n = self.node(self.abs(a[1]));
      ok = { '-f': n && n.t === 'f', '-d': n && n.t === 'd', '-e': !!n, '-x': n && self.can(n, 1), '-r': n && self.can(n, 4), '-w': n && self.can(n, 2), '-z': a[1] === '', '-n': a[1] !== '', '-s': n && self.size(n) > 0 }[a[0]];
    } else if (a.length === 1) ok = a[0] !== '';
    else if (a.length === 3) {
      var x = a[0], op = a[1], y = a[2], nx = +x, ny = +y;
      ok = { '=': x === y, '==': x === y, '!=': x !== y, '-eq': nx === ny, '-ne': nx !== ny, '-lt': nx < ny, '-le': nx <= ny, '-gt': nx > ny, '-ge': nx >= ny }[op];
    }
    return { out: '', status: ok ? 0 : 1 };
  }
  function runScript(a) {
    if (!a.length) return { out: '', note: '(an interactive sub-shell is not simulated; pass a script file)' };
    var flags = a[0] === '-n' ? a.shift() : null;
    var p = this.abs(a[0]), n = this.node(p);
    if (!n) return { err: 'bash: ' + a[0] + ': No such file or directory\n', status: 127 };
    if (!this.can(n, 4)) return { err: 'bash: ' + a[0] + ': Permission denied\n', status: 126 };
    if (flags) return { out: '' };
    var saved = this.args, out = '', err = '';
    this.args = a.slice(1);
    var ls = lines(n.d);
    for (var i = 0; i < ls.length; i++) {
      var l = ls[i].trim();
      if (!l || l[0] === '#' || /^set\s/.test(l)) continue;
      var r = this.run(l, { capture: true });
      out += r.out;
      if (this.status !== 0 && /set -e/.test(n.d)) break;
    }
    this.args = saved;
    return { out: out, err: err, status: this.status };
  }
  /* ./script execution */
  var origExec = S.exec;
  S.exec = function (args, stdin, raw) {
    if (args.length && /^(\.\/|\/|~\/)/.test(args[0]) && !/^\/(usr\/)?s?bin\//.test(args[0])) {
      var p = this.abs(args[0]), n = this.node(p);
      if (!n) return { err: 'bash: ' + args[0] + ': No such file or directory\n', status: 127 };
      if (n.t === 'd') return { err: 'bash: ' + args[0] + ': Is a directory\n', status: 126 };
      if (!this.can(n, 1)) { this.status = 126; return { err: 'bash: ' + args[0] + ': Permission denied\n(Hint: chmod +x ' + args[0].replace(/^\.\//, '') + ')\n', status: 126 }; }
      if (/\.AppImage$/.test(p)) return { out: '(simulated) the AppImage starts.\n' };
      var r = runScript.call(this, [args[0]].concat(args.slice(1)));
      this.status = r.status || 0; return r;
    }
    return origExec.call(this, args, stdin, raw);
  };

  /* Tab completion */
  S.complete = function (line) {
    var m = line.match(/(\S*)$/), word = m[1], before = line.slice(0, line.length - word.length);
    var cands = [];
    if (!before.trim() || /[|;&]\s*$/.test(before)) {
      var names = Object.keys(CMDS).concat(Object.keys(LV.tools));
      LV.docIndex().list.forEach(function (c) { names.push(c.cmd.split(' ')[0]); });
      cands = names.filter(function (n, i) { return n.indexOf(word) === 0 && names.indexOf(n) === i; }).sort();
    } else {
      var slash = word.lastIndexOf('/'), dir = slash >= 0 ? word.slice(0, slash + 1) : '', base = word.slice(slash + 1);
      var n = this.node(this.abs(dir || '.'));
      if (n && n.t === 'd') cands = Object.keys(n.c).filter(function (x) { return x.indexOf(base) === 0 && (base[0] === '.' || x[0] !== '.'); }).sort().map(function (x) { return dir + x + (n.c[x].t === 'd' ? '/' : ''); });
    }
    if (!cands.length) return { line: line, list: [] };
    if (cands.length === 1) return { line: before + cands[0] + (/\/$/.test(cands[0]) ? '' : ' '), list: [] };
    var pre = cands[0];
    cands.forEach(function (c) { while (c.indexOf(pre) !== 0) pre = pre.slice(0, -1); });
    return { line: before + pre, list: cands };
  };

  LV.Shell = Shell;

  /* ---------- Terminal UI ---------- */
  function fmt(text) {
    return esc(text).replace(/\u0001([dlxmnp])([\s\S]*?)\u0001e/g, function (m, k, s) { return '<span class="c-' + k + '">' + s + '</span>'; });
  }
  LV.TermUI = function (host, opts) {
    opts = opts || {};
    var sh = opts.shell || new Shell();
    var hi = -1, queue = Promise.resolve();
    host.classList.add('term');
    host.innerHTML = '<div class="term-bar"><span class="tdot"></span><span class="tdot"></span><span class="tdot"></span><span class="term-title mono"></span>' + (opts.mini ? '' : '<button class="ibtn sm t-clear" aria-label="Clear terminal">' + LV.icon('restart') + '</button>') + '</div>' +
      '<div class="term-out mono" ' + (opts.outId ? 'id="' + opts.outId + '"' : '') + ' aria-live="polite"></div>' +
      (opts.readonly ? '' : '<div class="term-in"><label class="tp mono" for="' + (opts.inId || 'ti-' + Math.random().toString(36).slice(2, 7)) + '"></label><input class="mono" ' + 'id="' + (opts.inId || 'ti-' + Math.random().toString(36).slice(2, 7)) + '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="Command input"><button class="ibtn primary t-run" aria-label="Run command">' + LV.icon('run') + '</button></div>');
    var out = host.querySelector('.term-out'), inp = host.querySelector('.term-in input'), title = host.querySelector('.term-title');
    if (inp) host.querySelector('.tp').setAttribute('for', inp.id);
    function promptHtml() { var p = sh.prompt(); return '<span class="p-u">' + p.user + '@' + p.host + '</span>:<span class="p-p">' + esc(p.path) + '</span>' + p.sym; }
    function paintPrompt() { if (inp) host.querySelector('.tp').innerHTML = promptHtml(); title.textContent = sh.user + '@' + HOST + ': ' + sh.prompt().path; }
    function add(html, cls) { var d = document.createElement('div'); d.className = 'tl ' + (cls || ''); d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; return d; }
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function typeCmd(cmd, speed) {
      var line = add(promptHtml() + ' <span class="t-cmd"></span><span class="caret"></span>');
      var span = line.querySelector('.t-cmd');
      if (LV.reduced() || !speed) { span.textContent = cmd; line.querySelector('.caret').remove(); return Promise.resolve(); }
      var i = 0;
      return new Promise(function (res) {
        (function step() { span.textContent = cmd.slice(0, ++i); out.scrollTop = out.scrollHeight; if (i < cmd.length) setTimeout(step, speed + Math.random() * speed); else { line.querySelector('.caret').remove(); res(); } })();
      });
    }
    function printOut(text, cls) {
      if (!text) return Promise.resolve();
      var ls = text.replace(/\n$/, '').split('\n');
      if (LV.reduced() || ls.length > 60) { add(ls.map(fmt).join('\n'), cls); return Promise.resolve(); }
      var box = add('', cls + ' reveal'), i = 0;
      return new Promise(function (res) {
        (function step() {
          var chunk = Math.max(1, Math.ceil(ls.length / 14));
          box.innerHTML += (i ? '\n' : '') + ls.slice(i, i + chunk).map(fmt).join('\n');
          i += chunk; out.scrollTop = out.scrollHeight;
          if (i < ls.length) setTimeout(step, 28); else res();
        })();
      });
    }
    function exec(cmd, typed) {
      queue = queue.then(function () {
        return (typed ? typeCmd(cmd, 22) : typeCmd(cmd, 0)).then(function () {
          if (cmd.trim()) { sh.hist.push(cmd); hi = -1; }
          var errBuf = '', r;
          try {
            var lastStatus = 0, collected = '';
            // capture note/err from top-level
            r = sh.run(cmd);
          } catch (e) { r = { out: '', err: 'bash: ' + e.message + '\n' }; }
          if (sh.clearReq) { sh.clearReq = false; out.innerHTML = ''; paintPrompt(); return; }
          var text = r.out || '';
          paintPrompt();
          LV.emit('lv:run', { cmd: cmd, shell: sh });
          return printOut(text, '').then(function () { if (sh._note) { add(esc(sh._note), 'note'); sh._note = null; } });
        });
      });
      return queue;
    }
    // capture notes and errors via exec wrapper on this shell instance
    var baseSimple = sh.simple;
    sh.simple = function (text, stdin) {
      var r = baseSimple.call(this, text, stdin);
      return r;
    };
    var baseExec = sh._uiWrapped ? null : sh.exec;
    if (baseExec) sh._uiWrapped = true;
    if (baseExec) sh.exec = function (args, stdin, raw) {
      var r = baseExec.call(this, args, stdin, raw);
      if (r && r.note) this._note = r.note;
      if (r && r.err) r.err = '\u0001E' + r.err.replace(/\n$/, '') + '\u0001F\n';
      return r;
    };
    function fmtErr(s) { return s; }
    var _fmt = fmt;
    fmt = function (t) { return _fmt(t).replace(/\u0001E/g, '<span class="c-err">').replace(/\u0001F/g, '</span>'); };

    function submit() {
      var v = inp.value; inp.value = '';
      exec(v, false);
    }
    if (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (!sh.hist.length) return; hi = hi < 0 ? sh.hist.length - 1 : Math.max(0, hi - 1); inp.value = sh.hist[hi]; }
        else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi < 0) return; hi++; if (hi >= sh.hist.length) { hi = -1; inp.value = ''; } else inp.value = sh.hist[hi]; }
        else if (e.key === 'Tab') {
          e.preventDefault();
          var c = sh.complete(inp.value);
          inp.value = c.line;
          if (c.list.length) add(c.list.join('   '), 'dim');
        } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
        else if (e.key === 'c' && e.ctrlKey && !window.getSelection().toString()) { e.preventDefault(); add(promptHtml() + ' ' + esc(inp.value) + '^C'); inp.value = ''; }
      });
      host.querySelector('.t-run').addEventListener('click', function () { submit(); inp.focus(); });
      out.addEventListener('click', function () { if (!window.getSelection().toString()) inp.focus({ preventScroll: true }); });
    }
    var clr = host.querySelector('.t-clear'); if (clr) clr.onclick = function () { out.innerHTML = ''; };
    paintPrompt();
    if (opts.welcome) add(opts.welcome, 'dim');
    return {
      shell: sh,
      run: function (cmd, typed) { return exec(cmd, typed !== false); },
      clear: function () { out.innerHTML = ''; },
      focus: function () { if (inp) inp.focus(); },
      input: inp
    };
  };
})();
