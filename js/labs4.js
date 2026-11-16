/* Linuxverse live labs, part 4: 40 command builders.
   A builder turns options you tick into the exact command, explains every part and warns about risky combinations.
   Three small engines (builder, chooser, shared helpers) drive all of them, so each lab is a short description of its fields. */
(function () {
  'use strict';
  var esc = LV.esc, $ = LV.$, $$ = LV.$$;
  var CAT = 'Command builders';
  function register(id, title, desc, topic, render) { LV.labs[id] = { id: id, title: title, desc: desc, topic: topic, render: render, cat: CAT }; }
  function cmdLine(text) {
    return '<div class="lab-cmd"><code>' + esc(text) + '</code><button class="ibtn sm copy-cmd" data-cmd="' + esc(text) + '" aria-label="Copy command">' + LV.icon('copy') + '</button><button class="ibtn sm to-term" data-cmd="' + esc(text) + '" aria-label="Try in terminal">' + LV.icon('term') + '</button></div>';
  }
  function sq(s) { s = String(s); return /^[A-Za-z0-9_@%+=:,.\/~^*-]+$/.test(s) ? s : "'" + s.replace(/'/g, "'\\''") + "'"; }
  LV.labKit = { cmdLine: cmdLine, sq: sq, CAT: CAT };

  /* ---------- Builder engine ----------
     field types:
       flag  { k, t:'flag', flag:'-l', help }              a checkbox; single letters are merged into one cluster (-lah)
       sel   { k, t:'sel', label, opt:'-p ', sub:true, options:[[value, label, help]] }   a drop-down; sub:true puts it right after the command
       text  { k, t:'text', label, opt:'-n ', pos:true, raw:true, def, help, pipe:fn }    free text; pos puts it at the end as an argument
     o.cmd is the program (may include sudo); o.tpl(v, auto) can replace the whole assembly; o.warn(v) returns warning strings. */
  function assemble(o, v) {
    var cluster = '', others = [], subs = [], pos = [], pipes = '';
    o.fields.forEach(function (f) {
      var val = v[f.k];
      if (f.t === 'flag') {
        if (!val) return;
        if (/^-[A-Za-z0-9]$/.test(f.flag)) cluster += f.flag[1]; else others.push(f.flag);
      } else if (f.t === 'sel') {
        if (val === '' || val === undefined) return;
        if (f.sub) subs.push(val); else others.push((f.opt || '') + val);
      } else {
        if (val === '' || val === undefined) return;
        if (f.pipe) { pipes += f.pipe(val); return; }
        var s = f.raw ? val : sq(val);
        if (f.pos) pos.push(s); else others.push((f.opt || '') + s);
      }
    });
    return [o.cmd].concat(subs, cluster ? ['-' + cluster] : [], others, pos).join(' ') + pipes;
  }
  function explain(o, v) {
    var rows = [];
    o.fields.forEach(function (f) {
      var val = v[f.k];
      if (f.t === 'flag' && val && f.help) rows.push([f.flag, f.help]);
      else if (f.t === 'sel' && val !== '' && val !== undefined) { var op = (f.options || []).filter(function (x) { return x[0] === val; })[0]; if (op && op[2]) rows.push([((f.opt || '') + val).trim() || val, op[2]]); }
      else if (f.t === 'text' && val && f.help) rows.push([f.opt ? f.opt.trim() : f.label, f.help]);
    });
    return rows;
  }
  function builder(o) {
    register(o.id, o.title, o.desc, o.topic, function (box) {
      var v = {};
      o.fields.forEach(function (f) { v[f.k] = f.def !== undefined ? f.def : (f.t === 'flag' ? false : f.t === 'sel' ? f.options[0][0] : ''); });
      var flags = o.fields.filter(function (f) { return f.t === 'flag'; });
      var html = '';
      if (flags.length) html += '<div class="lab-sub muted sm">Options</div><div class="presets">' + flags.map(function (f) { return '<label class="chip ck" title="' + esc(f.help || '') + '"><input type="checkbox" data-k="' + f.k + '"' + (v[f.k] ? ' checked' : '') + '> <span class="mono">' + esc(f.flag) + '</span> ' + esc(f.label || '') + '</label>'; }).join('') + '</div>';
      var inputs = o.fields.filter(function (f) { return f.t !== 'flag'; });
      if (inputs.length) html += '<div class="lab-grid">' + inputs.map(function (f) {
        if (f.t === 'sel') return '<label class="field"><span>' + esc(f.label) + '</span><select data-k="' + f.k + '">' + f.options.map(function (op) { return '<option value="' + esc(op[0]) + '"' + (op[0] === v[f.k] ? ' selected' : '') + '>' + esc(op[1]) + '</option>'; }).join('') + '</select></label>';
        return '<label class="field"><span>' + esc(f.label) + '</span><input data-k="' + f.k + '" class="mono" value="' + esc(v[f.k]) + '" spellcheck="false" autocomplete="off"' + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + '></label>';
      }).join('') + '</div>';
      box.innerHTML = html + '<div id="b-cmd"></div><div class="kv" id="b-ex"></div><div id="b-warn"></div>' + (o.note ? '<p class="muted sm">' + o.note + '</p>' : '');
      function run() {
        var auto = assemble(o, v), cmd = o.tpl ? o.tpl(v, auto) : auto;
        $('#b-cmd', box).innerHTML = cmdLine(cmd);
        var rows = explain(o, v);
        $('#b-ex', box).innerHTML = rows.map(function (r) { return '<div><dt class="mono">' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
        $('#b-ex', box).style.display = rows.length ? '' : 'none';
        var w = o.warn ? o.warn(v, cmd) : [];
        $('#b-warn', box).innerHTML = (w || []).map(function (x) { return '<p class="bad"><b>Careful:</b> ' + esc(x) + '</p>'; }).join('');
      }
      box.addEventListener('input', function (e) { var k = e.target.dataset.k; if (!k) return; v[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; run(); });
      box.addEventListener('change', function (e) { var k = e.target.dataset.k; if (!k) return; v[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; run(); });
      run();
    });
  }
  /* chooser: pick a task, fill {placeholders}, get the command and what it does */
  function chooser(o) {
    register(o.id, o.title, o.desc, o.topic, function (box) {
      var v = {}, task = 0;
      o.vars.forEach(function (x) { v[x.k] = x.def; });
      box.innerHTML = '<label class="field"><span>' + esc(o.label || 'What do you want to do?') + '</span><select id="ch-task">' + o.tasks.map(function (t, i) { return '<option value="' + i + '">' + esc(t[0]) + '</option>'; }).join('') + '</select></label>' +
        '<div class="lab-grid">' + o.vars.map(function (x) { return '<label class="field"><span>' + esc(x.label) + '</span><input data-k="' + x.k + '" class="mono" value="' + esc(x.def) + '" spellcheck="false" autocomplete="off"></label>'; }).join('') + '</div>' +
        '<div id="ch-cmd"></div><p id="ch-help" class="sm"></p><div id="ch-warn"></div>';
      function fill(s) { return s.replace(/\{(\w+)\}/g, function (m, k) { return v[k] !== undefined && v[k] !== '' ? v[k] : m; }); }
      function run() {
        var t = o.tasks[task];
        $('#ch-cmd', box).innerHTML = cmdLine(fill(t[1]));
        $('#ch-help', box).textContent = t[2] || '';
        $('#ch-warn', box).innerHTML = t[3] ? '<p class="bad"><b>Careful:</b> ' + esc(t[3]) + '</p>' : '';
      }
      box.addEventListener('change', function (e) { if (e.target.id === 'ch-task') { task = +e.target.value; run(); } });
      box.addEventListener('input', function (e) { var k = e.target.dataset.k; if (k) { v[k] = e.target.value; run(); } });
      run();
    });
  }
  function F(k, flag, label, help) { return { k: k, t: 'flag', flag: flag, label: label || '', help: help || label || '' }; }
  function S(k, label, options, extra) { var f = { k: k, t: 'sel', label: label, options: options }; for (var x in extra) f[x] = extra[x]; return f; }
  function X(k, label, def, extra) { var f = { k: k, t: 'text', label: label, def: def }; for (var x in extra) f[x] = extra[x]; return f; }
  var NONE = ['', '(default)'];

  /* ---- files and folders ---- */
  builder({ id: 'b-ls', title: 'ls builder', desc: 'Tick options and see the exact ls command and what each one adds.', topic: 'fileops', cmd: 'ls', fields: [
    F('l', '-l', 'long', 'Long listing: permissions, owner, size and date'), F('a', '-a', 'all', 'Include hidden names that start with a dot'), F('h', '-h', 'human', 'Readable sizes such as 4.0K (use with -l)'), F('t', '-t', 'newest first', 'Sort by modified time, newest first'),
    F('r', '-r', 'reverse', 'Reverse the sort order'), F('S', '-S', 'biggest first', 'Sort by size, largest first'), F('R', '-R', 'recursive', 'Also list every sub-folder'), F('o1', '-1', 'one per line', 'One name per line'), F('d', '-d', 'folder itself', 'List the folder, not what is inside'), F('i', '-i', 'inodes', 'Show each file\'s inode number'),
    X('p', 'Folder or file', '~/website', { pos: true })], warn: function (v) { return v.h && !v.l && !v.S ? [] : []; } });
  builder({ id: 'b-cp', title: 'cp builder', desc: 'Build a safe copy command for files and folders.', topic: 'fileops', cmd: 'cp', fields: [
    F('r', '-r', 'folders', 'Copy folders and everything in them'), F('a', '-a', 'archive', 'Keep permissions, owner, times and links; implies -r'), F('i', '-i', 'ask first', 'Ask before overwriting'), F('n', '-n', 'never overwrite', 'Never replace an existing file'),
    F('u', '-u', 'only newer', 'Copy only when the source is newer'), F('v', '-v', 'verbose', 'Print each file as it is copied'), F('p', '-p', 'keep attributes', 'Keep mode, owner and timestamps'),
    X('src', 'Source', 'website/', { pos: true }), X('dst', 'Destination', 'backup/', { pos: true })], warn: function (v) { var w = []; if (v.i && v.n) w.push('-n wins over -i: nothing is ever overwritten, so you will not be asked.'); if (v.a && v.r) w.push('-a already includes -r.'); return w; } });
  builder({ id: 'b-mv', title: 'mv builder', desc: 'Move or rename without overwriting by accident.', topic: 'fileops', cmd: 'mv', fields: [
    F('i', '-i', 'ask first', 'Ask before overwriting'), F('n', '-n', 'never overwrite', 'Do not overwrite an existing file'), F('v', '-v', 'verbose', 'Show what is moved'), F('u', '-u', 'only newer', 'Move only if the source is newer'), F('b', '-b', 'backup', 'Keep a backup copy of anything that would be overwritten'),
    X('src', 'Source', 'draft.txt', { pos: true }), X('dst', 'New name or folder', 'final.txt', { pos: true })], warn: function (v) { return !v.i && !v.n && !v.b ? ['Without -i, -n or -b, mv silently overwrites an existing destination.'] : []; } });
  builder({ id: 'b-rm', title: 'rm builder', desc: 'Delete files with the right safety net, and see the warnings.', topic: 'fileops', cmd: 'rm', fields: [
    F('r', '-r', 'recursive', 'Delete a folder and everything inside'), F('f', '-f', 'force', 'Never ask and ignore missing files'), F('i', '-i', 'ask each', 'Ask before every removal'), F('I', '-I', 'ask once', 'Ask once before removing many files'), F('v', '-v', 'verbose', 'List each file removed'), F('d', '-d', 'empty folders', 'Remove empty folders'),
    X('t', 'What to delete', 'old.log', { pos: true })], warn: function (v) { var w = []; if (v.r && v.f) w.push('rm -rf never asks and has no undo.'); if (/^(\/|~|\*|\.|\.\.|\/\*|~\/\*)$/.test(v.t.trim())) w.push('That target is far too broad. Stop and check the path.'); if (/\s/.test(v.t.trim()) && !/^['"]/.test(v.t.trim())) w.push('A space splits the target into two paths.'); return w; } });
  builder({ id: 'b-mkdir', title: 'mkdir builder', desc: 'Create folders, whole chains and with a chosen mode.', topic: 'fileops', cmd: 'mkdir', fields: [
    F('p', '-p', 'parents', 'Create missing parent folders and ignore existing ones'), F('v', '-v', 'verbose', 'Print each folder created'),
    S('m', 'Mode', [['', '(default, from umask)'], ['755', '755 everyone can enter, only you write', 'Set the mode of the new folder'], ['700', '700 private to you', 'Set the mode of the new folder'], ['750', '750 you and your group', 'Set the mode of the new folder'], ['775', '775 group can write too', 'Set the mode of the new folder']], { opt: '-m ' }),
    X('t', 'Folder', 'projects/site/css', { pos: true })] });
  builder({ id: 'b-ln', title: 'ln builder', desc: 'Create hard links and symbolic links correctly.', topic: 'links', cmd: 'ln', fields: [
    F('s', '-s', 'symbolic', 'Make a symbolic link (a shortcut by path) instead of a hard link'), F('f', '-f', 'force', 'Replace an existing link or file'), F('r', '-r', 'relative', 'Store the target as a relative path (use with -s)'), F('n', '-n', 'no dereference', 'Treat an existing link to a folder as a file'), F('v', '-v', 'verbose', 'Print each link made'),
    X('target', 'Target (what it points to)', 'logs/access.log', { pos: true }), X('name', 'Link name', 'latest.log', { pos: true })], warn: function (v) { return v.r && !v.s ? ['-r only makes sense with -s.'] : []; } });
  builder({ id: 'b-du', title: 'du builder', desc: 'Find what fills the disk, with sorting and depth.', topic: 'diskusage', cmd: 'du', fields: [
    F('h', '-h', 'human', 'Readable sizes'), F('s', '-s', 'summary', 'Only the total for each argument'), F('a', '-a', 'files too', 'Show files, not just folders'), F('c', '-c', 'grand total', 'Add a total line'), F('x', '-x', 'one disk', 'Stay on one filesystem'),
    S('d', 'Depth', [['', '(unlimited)'], ['--max-depth=1', '1 level', 'Only go one folder level deep'], ['--max-depth=2', '2 levels', 'Only go two levels deep'], ['--max-depth=3', '3 levels', 'Only go three levels deep']], {}),
    F('top', '| sort -rh | head', 'biggest 10 only', 'Pipe through sort (largest first) and keep the top ten'), X('p', 'Folder', '/var', { pos: true })],
    tpl: function (v, auto) { return auto.replace(' | sort -rh | head', '') + (v.top ? ' | sort -rh | head -n 10' : ''); } });
  builder({ id: 'b-df', title: 'df builder', desc: 'Check free space and inodes.', topic: 'diskusage', cmd: 'df', fields: [
    F('h', '-h', 'human', 'Readable sizes'), F('T', '-T', 'type', 'Show the filesystem type'), F('i', '-i', 'inodes', 'Show inodes instead of blocks'), F('l', '-l', 'local only', 'Skip network filesystems'), F('P', '-P', 'POSIX format', 'One line per filesystem, good for scripts'),
    S('x', 'Hide a type', [['', '(none)'], ['-x tmpfs', 'hide tmpfs', 'Exclude RAM-backed filesystems'], ['-x squashfs', 'hide squashfs', 'Exclude snap images']], {}), X('p', 'Path (optional)', '/', { pos: true })] });

  /* ---- processes and users ---- */
  builder({ id: 'b-ps', title: 'ps builder', desc: 'List processes the way you need: sorted, filtered, in your own columns.', topic: 'ps', cmd: 'ps', fields: [
    S('fmt', 'Format', [['aux', 'aux: every process, user-oriented', 'All users, with CPU and memory'], ['-ef', '-ef: every process, full format', 'Standard full listing with parent PID'], ['-eo pid,ppid,%cpu,%mem,etime,cmd', 'custom columns', 'Choose exactly the columns you want']], { sub: true }),
    S('sort', 'Sort', [['', '(none)'], ['--sort=-%cpu', 'by CPU, highest first', 'Highest CPU first'], ['--sort=-%mem', 'by memory, highest first', 'Highest memory first'], ['--sort=start_time', 'oldest first', 'Oldest process first']], {}),
    X('u', 'Only user', '', { opt: '-u ', help: 'Only processes of this user' }), X('g', 'Filter with grep', 'nginx', { pipe: function (x) { return ' | grep ' + sq(x); } }), F('forest', '--forest', 'tree', 'Draw the parent and child tree'), X('hd', 'Keep first lines', '', { pipe: function (x) { return ' | head -n ' + sq(x); } })],
    warn: function (v) { return v.g ? ['grep also matches itself. Use pgrep -a ' + v.g + ' or grep "[' + v.g.charAt(0) + ']' + v.g.slice(1) + '".'] : []; } });
  builder({ id: 'b-kill', title: 'kill builder', desc: 'Pick the signal and target, and see the safe order to try them.', topic: 'signals', cmd: 'kill', fields: [
    S('tool', 'Tool', [['kill', 'kill: by PID', 'Signal one process by its ID'], ['pkill', 'pkill: by name pattern', 'Signal every process whose name matches'], ['killall', 'killall: by exact name', 'Signal every process with exactly this name']], { sub: true }),
    S('sig', 'Signal', [['-15', 'SIGTERM (15): ask nicely', 'Polite request to stop; the program can clean up'], ['-2', 'SIGINT (2): like Ctrl+C', 'Interrupt'], ['-1', 'SIGHUP (1): reload / hang up', 'Many daemons reload their config on this'], ['-19', 'SIGSTOP (19): pause', 'Pause; cannot be caught'], ['-18', 'SIGCONT (18): continue', 'Resume a paused process'], ['-9', 'SIGKILL (9): force', 'Ends the process at once, with no cleanup']], {}),
    X('t', 'PID or name', '2450', { pos: true })], tpl: function (v) { return v.tool + ' ' + v.sig + ' ' + sq(v.t); }, warn: function (v) { var w = []; if (v.sig === '-9') w.push('SIGKILL skips cleanup: locks and temp files stay behind. Try -15 first and wait.'); if (v.tool !== 'kill' && v.t.length < 3) w.push('A short pattern may match more processes than you expect. Check with pgrep -a first.'); return w; } });
  builder({ id: 'b-chown', title: 'chown builder', desc: 'Change owner and group, one folder or a whole tree.', topic: 'owner', cmd: 'sudo chown', fields: [
    F('R', '-R', 'recursive', 'Apply to everything inside the folder'), F('v', '-v', 'verbose', 'Say what changed'), F('c', '-c', 'only changes', 'Report only when something changed'), F('h', '-h', 'links themselves', 'Change a symlink, not what it points to'),
    X('o', 'Owner:group', 'www-data:www-data', { pos: true }), X('t', 'Path', '/var/www/site', { pos: true })], warn: function (v) { return v.R && /^\/?$|^\/(etc|usr|var|bin|home)?\/?$/.test(v.t.trim()) ? ['Recursive chown on a system folder can break the machine.'] : []; } });
  builder({ id: 'b-useradd', title: 'useradd builder', desc: 'Create a user with home folder, shell and groups.', topic: 'users', cmd: 'sudo useradd', fields: [
    F('m', '-m', 'create home', 'Create the home folder'), F('M', '-M', 'no home', 'Do not create a home folder'), F('r', '-r', 'system user', 'A system account for a service, with no login by default'),
    S('s', 'Shell', [['', '(default)'], ['/bin/bash', '/bin/bash', 'Login shell'], ['/usr/sbin/nologin', '/usr/sbin/nologin: no login', 'Cannot log in interactively'], ['/bin/zsh', '/bin/zsh', 'Login shell']], { opt: '-s ' }),
    X('G', 'Extra groups', 'sudo,docker', { opt: '-G ', help: 'Add to these extra groups (comma separated)' }), X('c', 'Comment (full name)', 'Alex Kumar', { opt: '-c ', help: 'Free-text description' }), X('d', 'Home folder', '', { opt: '-d ', help: 'Use this home folder' }), X('e', 'Expire date', '', { opt: '-e ', help: 'Account expires on this date (YYYY-MM-DD)' }),
    X('u', 'Username', 'alex', { pos: true })], note: 'Then set a password with <code>sudo passwd alex</code>.', warn: function (v) { return v.m && v.M ? ['-m and -M contradict each other.'] : []; } });
  chooser({ id: 'b-usermod', title: 'usermod chooser', desc: 'Pick what to change about an account and get the safe command.', topic: 'users', label: 'Change', tasks: [
    ['Add to a group (keep the others)', 'sudo usermod -aG {group} {user}', 'The -a (append) is essential. The user must log in again for it to apply.', 'Without -a, -G replaces ALL supplementary groups and can remove sudo.'],
    ['Change login shell', 'sudo usermod -s {shell} {user}', 'Sets the login shell. It must be listed in /etc/shells.'],
    ['Lock the account', 'sudo usermod -L {user}', 'Puts ! in front of the password hash so password login fails. Keys still work.'],
    ['Unlock the account', 'sudo usermod -U {user}', 'Removes the lock.'],
    ['Rename the user', 'sudo usermod -l {newname} {user}', 'Renames the login. The home folder keeps its old name unless you also use -d and -m.'],
    ['Move the home folder', 'sudo usermod -d /home/{newname} -m {user}', 'Changes the home path and moves the files.'],
    ['Set an expiry date', 'sudo usermod -e 2027-01-01 {user}', 'The account stops working on that date.'],
    ['Delete the user and home folder', 'sudo userdel -r {user}', 'Removes the account and its home folder.', 'This deletes the home folder for good.']],
    vars: [{ k: 'user', label: 'User', def: 'alex' }, { k: 'group', label: 'Group', def: 'docker' }, { k: 'shell', label: 'Shell', def: '/bin/zsh' }, { k: 'newname', label: 'New name', def: 'alexk' }] });
  builder({ id: 'b-journalctl', title: 'journalctl builder', desc: 'Find the log lines you need without reading the whole journal.', topic: 'journal', cmd: 'journalctl', fields: [
    F('f', '-f', 'follow', 'Keep printing new lines as they arrive'), F('r', '-r', 'newest first', 'Reverse: newest lines first'), F('b', '-b', 'this boot', 'Only the current boot'), F('k', '-k', 'kernel', 'Kernel messages (like dmesg)'), F('np', '--no-pager', 'no pager', 'Print straight to the terminal'),
    X('u', 'Unit', 'nginx', { opt: '-u ', help: 'Only this service' }), X('n', 'Last N lines', '50', { opt: '-n ', help: 'Show only the last N lines' }), X('since', 'Since', '1 hour ago', { opt: '--since=', help: 'Start of the time range' }),
    S('p', 'Priority', [['', '(all)'], ['err', 'errors and worse', 'Only priority err and above'], ['warning', 'warnings and worse', 'Priority warning and above'], ['info', 'info and above', 'Priority info and above']], { opt: '-p ' }),
    S('o', 'Output', [['', '(default)'], ['json-pretty', 'JSON', 'Structured output'], ['short-iso', 'ISO timestamps', 'Sortable timestamps'], ['cat', 'message only', 'Only the message text']], { opt: '-o ' })],
    note: 'With <code>-f</code> press Ctrl+C to stop following.' });
  builder({ id: 'b-systemctl', title: 'systemctl builder', desc: 'Control services with the right verb.', topic: 'systemctl', cmd: 'systemctl', fields: [
    S('a', 'Action', [['status', 'status', 'Is it running? Last log lines'], ['start', 'start', 'Start now'], ['stop', 'stop', 'Stop now'], ['restart', 'restart', 'Stop then start (drops connections)'], ['reload', 'reload', 'Re-read config without dropping users'], ['enable', 'enable', 'Start at every boot'], ['enable --now', 'enable --now', 'Enable and start immediately'], ['disable', 'disable', 'Do not start at boot'], ['is-active', 'is-active', 'Prints active or inactive'], ['is-enabled', 'is-enabled', 'Is it set to start at boot'], ['mask', 'mask', 'Make it impossible to start'], ['daemon-reload', 'daemon-reload', 'Re-read unit files after editing']], { sub: true }),
    X('unit', 'Service', 'nginx', { pos: true }), F('user', '--user', 'user service', 'Manage your own user services (no sudo)'), F('np', '--no-pager', 'no pager', 'Print straight to the terminal'), F('l', '-l', 'full lines', 'Do not shorten long log lines')],
    tpl: function (v, auto) { var mut = !/^(status|is-active|is-enabled)$/.test(v.a) && !v.user; var x = auto; if (v.a === 'daemon-reload') x = x.replace(' ' + sq(v.unit), ''); return (mut ? 'sudo ' : '') + x; },
    warn: function (v) { return v.a === 'mask' ? ['A masked service cannot be started even by hand. Undo with unmask.'] : v.a === 'restart' ? ['restart drops active connections. Prefer reload when the service supports it.'] : []; } });

  /* ---- network ---- */
  builder({ id: 'b-ssh', title: 'ssh builder', desc: 'Compose a login with ports, keys, jump hosts and tunnels.', topic: 'ssh', cmd: 'ssh', fields: [
    F('v', '-v', 'verbose', 'Show why a login fails (repeat -vv for more)'), F('X', '-X', 'X11', 'Forward graphical windows'), F('A', '-A', 'agent', 'Forward your key agent (only to hosts you trust)'), F('C', '-C', 'compress', 'Compress traffic'), F('N', '-N', 'no shell', 'Do not run a command (tunnels only)'), F('f', '-f', 'background', 'Go to the background after login'),
    X('p', 'Port', '', { opt: '-p ', help: 'Connect to this port' }), X('i', 'Key file', '~/.ssh/id_ed25519', { opt: '-i ', help: 'Use this private key' }), X('L', 'Local forward', '', { opt: '-L ', help: 'Forward a local port to a remote destination, e.g. 8080:localhost:80' }), X('D', 'SOCKS proxy port', '', { opt: '-D ', help: 'Dynamic forward: a SOCKS proxy on this local port' }), X('J', 'Jump host', '', { opt: '-J ', help: 'Connect through this host first' }),
    X('host', 'user@host', 'ssk@server.example.com', { pos: true }), X('rc', 'Remote command', '', { pos: true })], warn: function (v) { return v.N && !(v.L || v.D) ? ['-N is for tunnels; add -L or -D, or you only get a silent connection.'] : v.A ? ['Agent forwarding lets the remote host use your keys while you are connected. Only use it on hosts you trust.'] : []; } });
  builder({ id: 'b-scp', title: 'scp builder', desc: 'Copy files to or from another machine.', topic: 'transfer', cmd: 'scp', fields: [
    F('r', '-r', 'folders', 'Copy folders recursively'), F('C', '-C', 'compress', 'Compress during transfer'), F('p', '-p', 'keep times', 'Keep modification times and modes'), F('q', '-q', 'quiet', 'No progress meter'), F('v', '-v', 'verbose', 'Debug output'),
    X('P', 'Port', '', { opt: '-P ', help: 'Remote SSH port (capital P)' }), X('i', 'Key file', '', { opt: '-i ', help: 'Private key to use' }),
    X('src', 'From', 'report.pdf', { pos: true }), X('dst', 'To', 'ssk@server:/home/ssk/', { pos: true })], note: 'Remote paths look like <code>user@host:/path</code>. For big or repeated copies, rsync is better.' });
  builder({ id: 'b-curl', title: 'curl builder', desc: 'Make web and API requests with headers, data and safe defaults.', topic: 'curlwget', cmd: 'curl', fields: [
    F('L', '-L', 'follow redirects', 'Follow 301 and 302 redirects'), F('s', '-s', 'silent', 'Hide the progress meter'), F('S', '-S', 'show errors', 'With -s, still show errors'), F('I', '-I', 'headers only', 'Send a HEAD request and show the headers'), F('f', '-f', 'fail on HTTP errors', 'Return an error code on 4xx and 5xx'), F('i', '-i', 'include headers', 'Print headers before the body'), F('v', '-v', 'verbose', 'Show the whole conversation'), F('k', '-k', 'insecure', 'Skip certificate checks'),
    S('X', 'Method', [['', '(default GET)'], ['GET', 'GET', 'Read'], ['POST', 'POST', 'Send data to create'], ['PUT', 'PUT', 'Replace'], ['PATCH', 'PATCH', 'Change part'], ['DELETE', 'DELETE', 'Remove']], { opt: '-X ' }),
    X('H', 'Header', 'Accept: application/json', { opt: '-H ', help: 'Add a request header' }), X('d', 'Data', '', { opt: '-d ', help: 'Send this body (makes it a POST by default)' }), X('u', 'user:password', '', { opt: '-u ', help: 'Basic authentication' }), X('o', 'Save to file', '', { opt: '-o ', help: 'Write the output to this file' }),
    X('url', 'URL', 'https://example.com/api/items', { pos: true })], warn: function (v) { var w = []; if (v.k) w.push('-k disables certificate checks. Anyone on the path can impersonate the server.'); if (v.u) w.push('A password on the command line is stored in your shell history. Use --netrc or an environment variable.'); return w; } });
  builder({ id: 'b-wget', title: 'wget builder', desc: 'Download files, resume them and mirror pages.', topic: 'curlwget', cmd: 'wget', fields: [
    F('c', '-c', 'resume', 'Continue a partial download'), F('q', '-q', 'quiet', 'No output'), F('r', '-r', 'recursive', 'Follow links to download a site'), F('np', '-np', 'no parent', 'Never go up to the parent folder'), F('N', '-N', 'only newer', 'Download only if the remote file is newer'), F('nc', '-nc', 'no clobber', 'Skip files that already exist'), F('b', '-b', 'background', 'Run in the background'),
    X('O', 'Save as', '', { opt: '-O ', help: 'Write to this file name' }), X('P', 'Into folder', '', { opt: '-P ', help: 'Save into this folder' }), X('lr', 'Rate limit', '', { opt: '--limit-rate=', raw: true, help: 'Cap the speed, e.g. 500k' }), X('t', 'Retries', '', { opt: '-t ', help: 'Number of retries' }),
    X('url', 'URL', 'https://example.com/file.iso', { pos: true })], warn: function (v) { return v.r && !v.np ? ['-r without -np can climb up and download far more than you intended.'] : []; } });
  chooser({ id: 'b-ip', title: 'ip command chooser', desc: 'Pick a network task and get the modern ip command.', topic: 'ip', tasks: [
    ['Show addresses (short)', 'ip -br addr', 'Brief one-line-per-interface view of addresses.'], ['Show addresses (full)', 'ip addr show {dev}', 'All details for one interface.'], ['Show the routing table', 'ip route', 'Including the default gateway.'], ['Which route is used for an address', 'ip route get {dest}', 'Shows the interface and gateway chosen.'],
    ['Bring a link up', 'sudo ip link set {dev} up', 'Enable the interface.'], ['Bring a link down', 'sudo ip link set {dev} down', 'Disable the interface.', 'On a remote machine this can cut your own connection.'], ['Add an address', 'sudo ip addr add {addr} dev {dev}', 'Temporary: lost at reboot unless saved in your network config.'],
    ['Remove an address', 'sudo ip addr del {addr} dev {dev}', 'Removes that address from the interface.'], ['Add a default route', 'sudo ip route add default via {gw}', 'Temporary until reboot.'], ['Show neighbours (ARP)', 'ip neigh', 'IP to MAC address table.'], ['Show link statistics', 'ip -s link show {dev}', 'Packets, bytes and errors.']],
    vars: [{ k: 'dev', label: 'Interface', def: 'enp1s0' }, { k: 'addr', label: 'Address/prefix', def: '192.168.1.50/24' }, { k: 'gw', label: 'Gateway', def: '192.168.1.1' }, { k: 'dest', label: 'Destination', def: '8.8.8.8' }] });
  builder({ id: 'b-ss', title: 'ss builder', desc: 'List sockets and listening ports the modern way.', topic: 'ports', cmd: 'ss', fields: [
    F('t', '-t', 'TCP', 'TCP sockets'), F('u', '-u', 'UDP', 'UDP sockets'), F('l', '-l', 'listening', 'Only listening sockets'), F('a', '-a', 'all', 'Listening and connected'), F('n', '-n', 'numeric', 'Do not resolve names'), F('p', '-p', 'process', 'Show the owning process (needs sudo for others)'), F('s', '-s', 'summary', 'Only totals'), F('o', '-o', 'timers', 'Show timer information'), F('4', '-4', 'IPv4 only', 'IPv4 only'),
    S('st', 'State', [['', '(any)'], ['state established', 'established', 'Open connections'], ['state time-wait', 'time-wait', 'Recently closed connections'], ['state listening', 'listening', 'Waiting for connections']], {}),
    X('f', 'Filter', 'sport = :80', { raw: true, help: 'A filter expression, e.g. sport = :80 or dst 10.0.0.1' })],
    tpl: function (v, auto) { return (v.p ? 'sudo ' : '') + auto; } });
  builder({ id: 'b-ping', title: 'ping builder', desc: 'Test reachability with a count, interval and packet size.', topic: 'netdiag', cmd: 'ping', fields: [
    F('4', '-4', 'IPv4', 'Force IPv4'), F('6', '-6', 'IPv6', 'Force IPv6'), F('D', '-D', 'timestamps', 'Print the time before each line'), F('q', '-q', 'quiet', 'Only the summary'), F('n', '-n', 'numeric', 'Do not look up names'),
    X('c', 'Count', '4', { opt: '-c ', help: 'Send this many packets and stop' }), X('i', 'Interval (s)', '', { opt: '-i ', help: 'Seconds between packets' }), X('s', 'Packet size', '', { opt: '-s ', help: 'Bytes of data (default 56)' }), X('W', 'Timeout (s)', '2', { opt: '-W ', help: 'Wait this long for each reply' }),
    X('h', 'Host', 'example.com', { pos: true })], warn: function (v) { return v.i && +v.i < 0.2 ? ['Very short intervals need root and can flood the network.'] : []; } });
  builder({ id: 'b-dig', title: 'dig builder', desc: 'Ask DNS exactly what you want to know.', topic: 'dns', cmd: 'dig', fields: [
    F('short', '+short', 'short', 'Print only the answer'), F('trace', '+trace', 'trace', 'Follow the delegation from the root servers'), F('noall', '+noall +answer', 'answer only', 'Show only the answer section'), F('x', '-x', 'reverse', 'Reverse lookup of an IP address'), F('4', '-4', 'IPv4', 'Use IPv4 transport'),
    X('srv', 'Ask server', '1.1.1.1', { raw: false, help: 'Query this DNS server instead of the default' }),
    S('type', 'Record type', [['', 'A (default)'], ['AAAA', 'AAAA', 'IPv6 address'], ['MX', 'MX', 'Mail servers'], ['TXT', 'TXT', 'Text records, e.g. SPF'], ['NS', 'NS', 'Name servers'], ['CNAME', 'CNAME', 'Alias'], ['SOA', 'SOA', 'Zone start of authority'], ['ANY', 'ANY', 'All (often refused)']], { pos: true }),
    X('n', 'Name', 'example.com', { pos: true })],
    tpl: function (v) { var a = ['dig']; if (v.srv) a.push('@' + v.srv); a.push(v.n || 'example.com'); if (v.type) a.push(v.type); if (v.x) a = ['dig', '-x', v.n]; ['short', 'trace', 'noall'].forEach(function (k) { if (v[k]) a.push(k === 'noall' ? '+noall +answer' : '+' + k); }); if (v['4']) a.push('-4'); return a.join(' '); } });
  builder({ id: 'b-ufw', title: 'ufw rule builder', desc: 'Compose a firewall rule and see what it allows.', topic: 'firewall', cmd: 'sudo ufw', fields: [
    S('act', 'Action', [['allow', 'allow', 'Let matching traffic in'], ['deny', 'deny', 'Silently drop it'], ['reject', 'reject', 'Refuse it and tell the sender'], ['limit', 'limit', 'Allow, but rate-limit repeated connections (good for SSH)']], { sub: true }),
    S('dir', 'Direction', [['', '(incoming)'], ['out', 'out', 'Outgoing traffic'], ['in', 'in', 'Incoming traffic']], { sub: true }), X('from', 'From address', '', { raw: false, help: 'Only from this address or network' }), X('port', 'Port', '22', {}),
    S('proto', 'Protocol', [['', '(tcp and udp)'], ['tcp', 'tcp', 'TCP only'], ['udp', 'udp', 'UDP only']], {})],
    tpl: function (v) { var a = ['sudo ufw', v.act]; if (v.dir) a.push(v.dir); if (v.from) a.push('from', v.from, 'to any'); a.push('port ' + (v.port || '22')); if (v.proto) a.push('proto', v.proto); if (!v.from) a = ['sudo ufw', v.act].concat(v.dir ? [v.dir] : [], [(v.port || '22') + (v.proto ? '/' + v.proto : '')]); return a.join(' '); },
    warn: function (v) { return v.act === 'deny' && String(v.port) === '22' ? ['Denying port 22 before you allow another way in can lock you out of a remote machine.'] : []; } });
  builder({ id: 'b-iptables', title: 'iptables rule builder', desc: 'Compose an iptables rule: chain, protocol, port, source and target.', topic: 'firewall', cmd: 'sudo iptables', fields: [
    S('op', 'Operation', [['-A', 'append (-A)', 'Add to the end of the chain'], ['-I', 'insert at top (-I)', 'Add as the first rule'], ['-D', 'delete (-D)', 'Delete a matching rule']], {}), S('chain', 'Chain', [['INPUT', 'INPUT', 'Traffic to this machine'], ['OUTPUT', 'OUTPUT', 'Traffic from this machine'], ['FORWARD', 'FORWARD', 'Traffic passing through']], {}),
    S('proto', 'Protocol', [['tcp', 'tcp'], ['udp', 'udp'], ['icmp', 'icmp']], {}), X('port', 'Destination port', '22', {}), X('src', 'Source address', '', {}), S('tgt', 'Target', [['ACCEPT', 'ACCEPT', 'Allow'], ['DROP', 'DROP', 'Silently discard'], ['REJECT', 'REJECT', 'Refuse with an error']], {}), F('st', '-m conntrack', 'established only', 'Match only packets of established connections')],
    tpl: function (v) { var a = ['sudo iptables', v.op, v.chain, '-p', v.proto]; if (v.src) a.push('-s', v.src); if (v.port && v.proto !== 'icmp') a.push('--dport', v.port); if (v.st) a.push('-m conntrack --ctstate ESTABLISHED,RELATED'); a.push('-j', v.tgt); return a.join(' '); },
    warn: function (v) { var w = ['Rules added this way are lost at reboot unless saved (iptables-save, or a persistence package).']; if (v.tgt !== 'ACCEPT' && v.chain === 'INPUT' && String(v.port) === '22') w.push('Blocking port 22 can lock you out of a remote machine.'); return w; } });

  /* ---- security and system ---- */
  builder({ id: 'b-sshkeygen', title: 'ssh-keygen builder', desc: 'Generate a key pair with a modern algorithm.', topic: 'ssh', cmd: 'ssh-keygen', fields: [
    S('t', 'Type', [['ed25519', 'ed25519 (recommended)', 'Modern, short, fast keys'], ['rsa', 'rsa', 'Widely supported; use at least 3072 bits'], ['ecdsa', 'ecdsa', 'Elliptic curve']], { opt: '-t ' }), X('b', 'Bits (rsa)', '', { opt: '-b ', help: 'Key size in bits, for RSA (use 3072 or 4096)' }), X('C', 'Comment', 'you@example.com', { opt: '-C ', help: 'A label stored in the public key' }), X('f', 'File', '~/.ssh/id_ed25519', { opt: '-f ', help: 'Where to write the private key' }), F('a', '-a 100', 'more KDF rounds', 'Slow down passphrase guessing')],
    note: 'Then copy the public key with <code>ssh-copy-id user@host</code> and keep the private key (mode 600) private. Use a passphrase.', warn: function (v) { return v.t === 'rsa' && v.b && +v.b < 3072 ? ['RSA keys under 3072 bits are weak.'] : []; } });
  builder({ id: 'b-openssl', title: 'openssl builder', desc: 'Compose common certificate and connection checks.', topic: 'tls', cmd: 'openssl', fields: [
    S('task', 'Task', [['s_client', 'check a server (s_client)', 'Connect and print the certificate chain'], ['x509', 'read a certificate (x509)', 'Print subject, issuer and dates'], ['req', 'self-signed certificate (req)', 'Create a key and certificate for testing'], ['genrsa', 'RSA private key (genrsa)', 'Generate an RSA key'], ['dgst', 'file hash (dgst)', 'Compute a digest']], {}), X('h', 'Host:port', 'example.com:443', {}), X('f', 'File', 'cert.pem', {}), X('cn', 'Common name', 'localhost', {})],
    tpl: function (v) { return { s_client: 'openssl s_client -connect ' + v.h + ' -servername ' + v.h.split(':')[0] + ' </dev/null | openssl x509 -noout -subject -issuer -dates', x509: 'openssl x509 -in ' + sq(v.f) + ' -noout -subject -issuer -dates', req: 'openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=' + v.cn + '"', genrsa: 'openssl genrsa -out key.pem 3072', dgst: 'openssl dgst -sha256 ' + sq(v.f) }[v.task]; },
    warn: function (v) { return v.task === 'req' || v.task === 'genrsa' ? ['key.pem is a private key: chmod 600 it and never share or commit it.'] : []; } });
  builder({ id: 'b-gpg', title: 'gpg builder', desc: 'Encrypt, sign and verify files.', topic: 'checksums', cmd: 'gpg', fields: [
    S('task', 'Task', [['--symmetric --cipher-algo AES256', 'encrypt with a passphrase', 'Symmetric encryption'], ['--encrypt --recipient', 'encrypt for a person', 'Encrypt to someone\'s public key'], ['--decrypt', 'decrypt', 'Decrypt a .gpg file'], ['--detach-sign --armor', 'sign (detached .asc)', 'Create a signature file'], ['--verify', 'verify a signature', 'Check a signature against its file']], { sub: true }), X('r', 'Recipient', 'alex@example.com', {}), X('f', 'File', 'report.pdf', { pos: true })],
    tpl: function (v) { var t = v.task; if (t === '--encrypt --recipient') return 'gpg --encrypt --recipient ' + sq(v.r) + ' ' + sq(v.f); if (t === '--verify') return 'gpg --verify ' + sq(v.f) + '.asc ' + sq(v.f); return 'gpg ' + t + ' ' + sq(v.f); }, note: 'A signature proves who made a file; a checksum only proves it is unchanged.' });
  builder({ id: 'b-dd', title: 'dd builder', desc: 'Copy blocks safely, with the warnings dd deserves.', topic: 'fileops', cmd: 'sudo dd', fields: [
    X('if', 'Input (if=)', 'ubuntu.iso', {}), X('of', 'Output (of=)', '/dev/sdX', {}), S('bs', 'Block size', [['4M', '4M (good for disks)'], ['1M', '1M'], ['64K', '64K'], ['512', '512']], {}), X('count', 'Block count (optional)', '', {}),
    F('prog', 'status=progress', 'progress', 'Show progress'), F('sync', 'conv=fsync', 'sync at end', 'Flush data before finishing')],
    tpl: function (v) { var a = ['sudo dd', 'if=' + v.if, 'of=' + v.of, 'bs=' + v.bs]; if (v.count) a.push('count=' + v.count); if (v.prog) a.push('status=progress'); if (v.sync) a.push('conv=fsync'); return a.join(' '); },
    warn: function (v) { var w = []; if (/^\/dev\//.test(v.of)) w.push('Writing to ' + v.of + ' destroys everything on that device. Check the name with lsblk first.'); if (/\/dev\/sd[a-z]?$/.test(v.of) && v.of === '/dev/sda') w.push('/dev/sda is usually your system disk.'); return w; } });
  builder({ id: 'b-gcc', title: 'gcc builder', desc: 'Compile C with warnings, optimisation and debug symbols.', topic: 'buildsrc', cmd: 'gcc', fields: [
    F('W', '-Wall', 'warnings', 'Common warnings'), F('E', '-Wextra', 'more warnings', 'Extra warnings'), F('g', '-g', 'debug symbols', 'Include debugging information for gdb'), F('c', '-c', 'compile only', 'Produce an object file without linking'), F('S', '-shared', 'shared lib', 'Build a shared library'), F('fPIC', '-fPIC', 'PIC', 'Position independent code, for shared libraries'),
    S('O', 'Optimise', [['', '(none)'], ['-O0', '-O0 none', 'No optimisation: best for debugging'], ['-O2', '-O2 normal', 'Good default'], ['-O3', '-O3 aggressive', 'More aggressive']], {}), S('std', 'Standard', [['', '(default)'], ['-std=c11', 'C11', 'ISO C11'], ['-std=c17', 'C17', 'ISO C17'], ['-std=gnu99', 'GNU99', 'GNU C99']], {}),
    X('o', 'Output', 'hello', { opt: '-o ' }), X('l', 'Libraries', 'm', { opt: '-l', raw: true, help: 'Link this library (here: libm)' }), X('src', 'Source files', 'hello.c', { pos: true, raw: true })] });
  builder({ id: 'b-grep', title: 'grep builder', desc: 'Pick grep options and get the command, with notes on what each one changes.', topic: 'grep', cmd: 'grep', fields: [
    F('i', '-i', 'ignore case', 'Match upper and lower case alike'), F('v', '-v', 'invert', 'Show lines that do NOT match'), F('n', '-n', 'line numbers', 'Print the line number'), F('c', '-c', 'count', 'Only print how many lines match'), F('r', '-r', 'recursive', 'Search folders'), F('l', '-l', 'file names', 'Only list the files that contain a match'), F('w', '-w', 'whole word', 'Match whole words only'), F('E', '-E', 'extended regex', 'Use | + ? ( ) in the pattern'), F('o', '-o', 'only match', 'Print just the matching part'), F('h', '-h', 'no file names', 'Hide file names in multi-file output'),
    X('A', 'Lines after', '', { opt: '-A ', help: 'Also show N lines after each match' }), X('B', 'Lines before', '', { opt: '-B ', help: 'Also show N lines before each match' }), X('pat', 'Pattern', 'error', { pos: true }), X('f', 'File or folder', 'logs/', { pos: true })], warn: function (v) { return v.l && v.c ? ['-l and -c together: -l wins and -c is ignored on most systems.'] : []; } });
  builder({ id: 'b-crontab', title: 'cron schedule builder', desc: 'Pick minute, hour and day fields and get a valid crontab line.', topic: 'cron', cmd: 'cron', fields: [
    S('min', 'Minute', [['0', '0'], ['15', '15'], ['30', '30'], ['*/5', 'every 5'], ['*/15', 'every 15'], ['*', 'every minute']], {}), S('hr', 'Hour', [['2', '2 am'], ['0', 'midnight'], ['6', '6 am'], ['12', 'noon'], ['18', '6 pm'], ['*/2', 'every 2 hours'], ['*', 'every hour']], {}), S('dom', 'Day of month', [['*', 'every day'], ['1', 'the 1st'], ['15', 'the 15th']], {}), S('mon', 'Month', [['*', 'every month'], ['1', 'January'], ['6', 'June'], ['12', 'December']], {}),
    S('dow', 'Weekday', [['*', 'every day'], ['1-5', 'Mon to Fri'], ['0', 'Sunday'], ['6', 'Saturday'], ['1', 'Monday']], {}), X('job', 'Command (full paths!)', '/home/ssk/bin/backup.sh', {}), F('log', '>> ~/cron.log 2>&1', 'log output', 'Append output and errors to a log file')],
    tpl: function (v) { return [v.min, v.hr, v.dom, v.mon, v.dow, v.job + (v.log ? ' >> ~/cron.log 2>&1' : '')].join(' '); }, note: 'Add it with <code>crontab -e</code>. Cron has a minimal PATH and no terminal, so use full paths.',
    warn: function (v) { return v.min === '*' && v.hr === '*' ? ['This runs every minute. Make sure that is what you want.'] : /%/.test(v.job) ? ['A % in a crontab line must be escaped as \\%.'] : []; } });

  /* ---- text and pipes ---- */
  builder({ id: 'b-headtail', title: 'head and tail builder', desc: 'See the start or end of a file, or follow a log.', topic: 'pipes', cmd: 'head', fields: [
    S('tool', 'Tool', [['head', 'head: the beginning', 'First lines'], ['tail', 'tail: the end', 'Last lines']], { sub: true }), X('n', 'Lines', '10', { opt: '-n ', help: 'How many lines (tail: use +N to start at line N)' }), X('c', 'Bytes', '', { opt: '-c ', help: 'Count bytes instead of lines' }), F('f', '-f', 'follow (tail)', 'Keep printing new lines as the file grows'), F('F', '-F', 'follow by name', 'Like -f but survives log rotation'), F('q', '-q', 'no headers', 'Do not print file name headers'),
    X('file', 'File', 'logs/access.log', { pos: true })], cmd: 'tool',
    tpl: function (v, auto) { return auto.replace(/^tool /, ''); },
    warn: function (v) { return v.tool === 'head' && (v.f || v.F) ? ['-f and -F are tail options; head does not follow files.'] : []; } });
  builder({ id: 'b-sort', title: 'sort builder', desc: 'Sort by number, column, size or version.', topic: 'sortuniq', cmd: 'sort', fields: [
    F('n', '-n', 'numeric', 'Compare as numbers (otherwise 10 sorts before 9)'), F('r', '-r', 'reverse', 'Largest or last first'), F('u', '-u', 'unique', 'Drop duplicate lines'), F('f', '-f', 'ignore case', 'Fold upper into lower case'), F('h', '-h', 'human sizes', 'Understand 2K, 1M, 3G'), F('V', '-V', 'version', 'Natural version order (1.9 before 1.10)'), F('b', '-b', 'ignore blanks', 'Ignore leading blanks'), F('s', '-s', 'stable', 'Keep the original order of equal lines'), F('R', '-R', 'random', 'Shuffle'),
    X('k', 'Key (column)', '', { opt: '-k ', help: 'Sort by this field, e.g. 2 or 2,2n' }), X('t', 'Separator', '', { opt: '-t ', help: 'Field separator, e.g. : or ,' }), X('file', 'File', 'data.txt', { pos: true })], warn: function (v) { return v.k && !v.t ? [] : []; } });
  builder({ id: 'b-uniq', title: 'uniq builder', desc: 'Count, find and drop repeated lines (and remember to sort first).', topic: 'sortuniq', cmd: 'uniq', fields: [
    F('c', '-c', 'count', 'Prefix each line with how many times it repeats'), F('d', '-d', 'only duplicated', 'Show only lines that repeat'), F('u', '-u', 'only unique', 'Show only lines that appear once'), F('i', '-i', 'ignore case', 'Compare ignoring case'), F('sr', 'sort first', 'sort first', 'uniq only merges neighbours, so sort the input'), F('rank', '| sort -rn', 'rank by count', 'Order by count, highest first'),
    X('f', 'Skip fields', '', { opt: '-f ', help: 'Ignore the first N fields when comparing' }), X('file', 'File', 'names.txt', { pos: true })],
    tpl: function (v) { var fl = (v.c ? 'c' : '') + (v.d ? 'd' : '') + (v.u ? 'u' : '') + (v.i ? 'i' : ''), u = 'uniq' + (fl ? ' -' + fl : '') + (v.f ? ' -f ' + v.f : ''), c = v.sr ? 'sort ' + sq(v.file) + ' | ' + u : u + ' ' + sq(v.file); return c + (v.rank ? ' | sort -rn' : ''); } });
  builder({ id: 'b-cut', title: 'cut builder', desc: 'Pull columns out of delimited text.', topic: 'sortuniq', cmd: 'cut', fields: [
    X('d', 'Delimiter', ':', { opt: '-d ', help: 'Split each line at this character' }), X('f', 'Fields', '1,6', { opt: '-f ', help: 'Keep these fields (1,3 or 2-4 or 3-)' }), X('c', 'Characters', '', { opt: '-c ', help: 'Keep these character positions instead' }), F('s', '-s', 'skip no-delimiter lines', 'Drop lines without the delimiter'), F('cm', '--complement', 'invert', 'Keep everything except the chosen fields'),
    X('file', 'File', '/etc/passwd', { pos: true })], warn: function (v) { return v.f && v.c ? ['Use either -f or -c, not both.'] : []; } });
  builder({ id: 'b-awk', title: 'awk builder', desc: 'Write a one-line awk program: separator, condition and what to print.', topic: 'sedawk', cmd: 'awk', fields: [
    X('F', 'Field separator', ':', {}), X('cond', 'Condition (optional)', '$3 >= 1000', {}), X('pr', 'Print', '$1, $6', {}), X('end', 'END action (optional)', '', {}), X('file', 'File', '/etc/passwd', { pos: true })],
    tpl: function (v) { var prog = (v.cond ? v.cond + ' ' : '') + '{print ' + (v.pr || '$0') + '}' + (v.end ? ' END {' + v.end + '}' : ''); return 'awk ' + (v.F ? '-F' + sq(v.F) + ' ' : '') + "'" + prog.replace(/'/g, "'\\''") + "' " + sq(v.file); },
    note: 'Examples: condition <code>NR &gt; 1</code>, print <code>$1, $NF</code>, END <code>print NR</code>.' });
  builder({ id: 'b-xargs', title: 'xargs builder', desc: 'Turn a list into arguments for another command, safely.', topic: 'xargs', cmd: 'xargs', fields: [
    X('prod', 'Producer (makes the list)', 'find . -name "*.tmp"', { raw: true }), X('cmd', 'Command to run', 'rm', { raw: true }), F('z', '-0', 'null separated', 'Read names separated by NUL (pair with find -print0)'), F('t', '-t', 'print commands', 'Show each command before running it'), F('r', '-r', 'skip if empty', 'Do not run when the list is empty'), F('p', '-p', 'ask each', 'Ask before each run'),
    X('n', 'Args per run', '', { opt: '-n ', help: 'Pass at most N arguments to each command' }), X('P', 'Parallel jobs', '', { opt: '-P ', help: 'Run N commands at the same time' }), X('I', 'Placeholder', '', { opt: '-I ', raw: true, help: 'Replace this token with each item' })],
    tpl: function (v) { var prod = v.prod; if (v.z && !/-print0/.test(prod) && /^find /.test(prod)) prod += ' -print0'; var fl = (v.z ? ' -0' : '') + (v.t ? ' -t' : '') + (v.r ? ' -r' : '') + (v.p ? ' -p' : '') + (v.n ? ' -n ' + v.n : '') + (v.P ? ' -P ' + v.P : '') + (v.I ? ' -I ' + v.I : ''); return prod + ' | xargs' + fl + ' ' + v.cmd; },
    warn: function (v) { var w = []; if (/^rm\b/.test(v.cmd) && !v.t) w.push('Run with -t or replace rm by echo first to see what would be deleted.'); if (!v.z && /find /.test(v.prod)) w.push('File names with spaces break plain xargs. Use find -print0 with xargs -0.'); return w; } });

  /* ---- developer tools ---- */
  builder({ id: 'b-docker', title: 'docker run builder', desc: 'Compose a docker run command with ports, volumes and a name.', topic: 'docker', cmd: 'docker run', fields: [
    F('d', '-d', 'detached', 'Run in the background'), F('it', '-it', 'interactive tty', 'Interactive terminal'), F('rm', '--rm', 'remove when done', 'Delete the container on exit'),
    X('name', 'Name', 'web', { opt: '--name ', help: 'Give the container a name' }), X('p', 'Publish port', '8080:80', { opt: '-p ', help: 'host:container port mapping' }), X('v', 'Volume', '$PWD/site:/usr/share/nginx/html:ro', { opt: '-v ', raw: true, help: 'Mount a host folder (here read-only)' }), X('e', 'Environment', '', { opt: '-e ', help: 'Set an environment variable KEY=value' }),
    S('rs', 'Restart policy', [['', '(none)'], ['unless-stopped', 'unless-stopped', 'Restart after crashes and reboots'], ['always', 'always', 'Always restart'], ['on-failure', 'on-failure', 'Only after a failure']], { opt: '--restart ' }),
    X('img', 'Image', 'nginx:alpine', { pos: true }), X('c', 'Command', '', { pos: true, raw: true })], warn: function (v) { var w = []; if (v.d && v.it) w.push('-d and -it together are usually not needed.'); if (/^latest$|^[^:]+$/.test(v.img) && v.img.indexOf(':') < 0) w.push('Pin a version tag (image:1.2) instead of the moving latest.'); return w; } });
  builder({ id: 'b-gitlog', title: 'git log builder', desc: 'Make git history readable: graphs, one-liners, authors and dates.', topic: 'git', cmd: 'git log', fields: [
    F('one', '--oneline', 'one line', 'One line per commit'), F('graph', '--graph', 'graph', 'Draw the branch graph'), F('all', '--all', 'all branches', 'Include every branch'), F('dec', '--decorate', 'decorate', 'Show branch and tag names'), F('p', '-p', 'patch', 'Show the changes'), F('stat', '--stat', 'stat', 'Show changed files and line counts'), F('nm', '--name-only', 'names', 'Only the names of changed files'),
    X('n', 'Last N', '10', { opt: '-n ', help: 'Limit the number of commits' }), X('au', 'Author', '', { opt: '--author=', help: 'Only this author' }), X('since', 'Since', '', { opt: '--since=', raw: false, help: 'Only newer than, e.g. 2 weeks ago' }), X('grep', 'Message contains', '', { opt: '--grep=', help: 'Only commits whose message matches' }), X('path', 'Path', '', { pos: true })],
    tpl: function (v, auto) { return auto.replace(/(--author=|--since=|--grep=)'([^']*)'/g, '$1"$2"'); } });
  chooser({ id: 'b-gitundo', title: 'git undo chooser', desc: 'Say what went wrong and get the safest git command to fix it.', topic: 'gitundo', label: 'What went wrong?', tasks: [
    ['I edited a file and want the old version back', 'git restore {file}', 'Discards uncommitted changes to that file.', 'Uncommitted changes cannot be recovered afterwards.'], ['I staged a file by mistake', 'git restore --staged {file}', 'Unstages it but keeps your edits.'], ['My last commit message is wrong', 'git commit --amend -m "{msg}"', 'Rewrites the last commit. Do not do this after pushing.'],
    ['I forgot a file in the last commit', 'git add {file} && git commit --amend --no-edit', 'Adds the file to the last commit.'], ['Undo the last commit but keep the changes', 'git reset --soft HEAD~1', 'Moves the branch back; your changes stay staged.'], ['Undo the last commit and throw the changes away', 'git reset --hard HEAD~1', 'Moves the branch back and discards the changes.', 'Uncommitted and discarded work is gone.'],
    ['Cancel a commit that was already pushed', 'git revert {hash}', 'Creates a new commit that cancels an old one: safe on shared branches.'], ['I need to switch branches but have unfinished work', 'git stash push -m "wip" && git switch {branch}', 'Shelves your changes. Bring them back with git stash pop.'], ['I think I lost a commit', 'git reflog', 'Lists where HEAD has been so you can return with git switch -c rescue <hash>.'],
    ['I committed to the wrong branch', 'git branch {branch} && git reset --hard HEAD~1 && git switch {branch}', 'Moves the commit to a new branch and removes it here.', 'Check git log first; reset --hard discards uncommitted work.'], ['Delete a local branch', 'git branch -d {branch}', 'Safe delete: refuses if the branch is not merged. Use -D to force.']],
    vars: [{ k: 'file', label: 'File', def: 'index.html' }, { k: 'msg', label: 'Message', def: 'Fix typo' }, { k: 'hash', label: 'Commit', def: 'a1b2c3d' }, { k: 'branch', label: 'Branch', def: 'feature' }] });
})();
