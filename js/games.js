/* Linuxverse study games: six short games that practise commands, permissions, pipes, paths, typing and spotting mistakes.
   They register as labs with game:true, so they share routing, progress ticks and search. Best scores are kept on this device. */
(function () {
  'use strict';
  var esc = LV.esc, $ = LV.$, $$ = LV.$$;

  function game(id, title, desc, topic, render) {
    LV.labs[id] = { id: id, title: title, desc: desc, topic: topic, render: render, game: true };
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pickN(a, n) { return shuffle(a).slice(0, n); }
  function best(id, key, val, lowerBetter) {
    var all = LV.store.get('games', {}); if (!all || typeof all !== 'object') all = {};
    var cur = all[id] || {}, old = cur[key], isBest = old === undefined || (lowerBetter ? val < old : val > old);
    if (isBest) { cur[key] = val; all[id] = cur; LV.store.set('games', all); }
    return { best: isBest ? val : old, isBest: isBest, first: old === undefined };
  }
  function getBest(id, key) { var all = LV.store.get('games', {}); return all && all[id] ? all[id][key] : undefined; }
  function bar(items) { return '<div class="gm-bar">' + items.map(function (i) { return '<span class="gm-stat"><small>' + i[0] + '</small><b id="' + i[1] + '">' + i[2] + '</b></span>'; }).join('') + '</div>'; }
  function endCard(title, lines, again) {
    return '<div class="gm-end"><h3>' + title + '</h3>' + lines.map(function (l) { return '<p>' + l + '</p>'; }).join('') + '<button class="btn" data-again="1">' + LV.icon('restart') + ' ' + (again || 'Play again') + '</button></div>';
  }

  /* ================= 1. Command match ================= */
  var PAIRS = [
    ['ls', 'List files in a folder'], ['cd', 'Change the current folder'], ['pwd', 'Print the folder you are in'], ['cp', 'Copy files'], ['mv', 'Move or rename'], ['rm', 'Delete files'],
    ['mkdir', 'Make a new folder'], ['touch', 'Create an empty file'], ['cat', 'Show a whole file'], ['grep', 'Search for text in files'], ['chmod', 'Change permissions'], ['chown', 'Change the owner'],
    ['sudo', 'Run one command as administrator'], ['ps', 'List running processes'], ['kill', 'Send a signal to a process'], ['df', 'Show free disk space'], ['du', 'Show how big a folder is'],
    ['tar', 'Bundle files into an archive'], ['ssh', 'Log in to another machine securely'], ['curl', 'Fetch a web address'], ['head', 'Show the first lines'], ['tail', 'Show the last lines'],
    ['wc', 'Count lines, words and bytes'], ['sort', 'Put lines in order'], ['find', 'Search for files by name or age'], ['man', 'Open the manual page'], ['echo', 'Print text'],
    ['history', 'List the commands you typed before'], ['ln -s', 'Make a shortcut (symbolic link)'], ['systemctl', 'Start, stop and check services'], ['journalctl', 'Read system logs'], ['ping', 'Test if a host answers'],
    ['ip addr', 'Show network addresses'], ['apt install', 'Install software on Debian or Ubuntu']
  ];
  game('g-match', 'Game: Command match', 'Match each command with what it does. Fewer mistakes and a faster time mean a better score.', 'shell', function (box) {
    var set, left, right, selL, selR, mistakes, t0, timer, matched;
    function start() {
      set = pickN(PAIRS, 6); left = shuffle(set); right = shuffle(set); selL = selR = null; mistakes = 0; matched = 0; t0 = Date.now();
      box.innerHTML = bar([['Time', 'gm-t', '0s'], ['Mistakes', 'gm-m', '0'], ['Best', 'gm-b', getBest('g-match', 'time') ? getBest('g-match', 'time') + 's' : '-']]) +
        '<div class="gm-pairs"><div class="gm-col">' + left.map(function (p) { return '<button class="gm-card mono" data-s="L" data-k="' + esc(p[0]) + '">' + esc(p[0]) + '</button>'; }).join('') + '</div>' +
        '<div class="gm-col">' + right.map(function (p) { return '<button class="gm-card" data-s="R" data-k="' + esc(p[0]) + '">' + esc(p[1]) + '</button>'; }).join('') + '</div></div><p class="muted sm">Tap a command, then tap its meaning.</p><div id="gm-end"></div>';
      clearInterval(timer); timer = setInterval(function () { var e = $('#gm-t', box); if (!e || !box.isConnected) { clearInterval(timer); return; } e.textContent = Math.floor((Date.now() - t0) / 1000) + 's'; }, 500);
    }
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-again]')) { start(); return; }
      var c = e.target.closest('.gm-card'); if (!c || c.classList.contains('ok')) return;
      var side = c.dataset.s;
      $$('.gm-card[data-s="' + side + '"]', box).forEach(function (x) { x.classList.remove('sel'); });
      c.classList.add('sel'); if (side === 'L') selL = c; else selR = c;
      if (selL && selR) {
        if (selL.dataset.k === selR.dataset.k) {
          [selL, selR].forEach(function (x) { x.classList.remove('sel'); x.classList.add('ok'); x.disabled = true; }); matched++;
          if (matched === set.length) {
            clearInterval(timer); var secs = Math.round((Date.now() - t0) / 1000), score = secs + mistakes * 5, r = best('g-match', 'time', score, true);
            $('#gm-t', box).textContent = secs + 's';
            $('#gm-end', box).innerHTML = endCard(mistakes === 0 ? 'Perfect match' : 'All matched', ['Time ' + secs + 's, ' + mistakes + ' mistake' + (mistakes === 1 ? '' : 's') + ' (each adds 5s). Score: <b>' + score + '</b>.', r.isBest ? 'New best score.' : 'Best score: ' + r.best + '.']);
            $('#gm-b', box).textContent = r.best + 's';
          }
        } else {
          mistakes++; $('#gm-m', box).textContent = mistakes;
          var a = selL, b = selR; a.classList.add('bad'); b.classList.add('bad');
          setTimeout(function () { a.classList.remove('bad', 'sel'); b.classList.remove('bad', 'sel'); }, 450);
        }
        selL = selR = null;
      }
    });
    start();
  });

  /* ================= 2. Permission puzzle ================= */
  var MODES = ['644', '755', '600', '700', '640', '750', '664', '775', '444', '400', '660', '711'];
  function sym(m) { return m.split('').map(function (d) { d = +d; return (d & 4 ? 'r' : '-') + (d & 2 ? 'w' : '-') + (d & 1 ? 'x' : '-'); }).join(''); }
  function words(m) {
    var who = ['owner', 'group', 'others'], out = [];
    m.split('').forEach(function (d, i) { d = +d; var a = []; if (d & 4) a.push('read'); if (d & 2) a.push('write'); if (d & 1) a.push('run'); out.push(who[i] + (a.length ? ' can ' + a.join(' and ') : ' have no access')); });
    return out.join(', ');
  }
  function permQuestion() {
    var m = MODES[Math.floor(Math.random() * MODES.length)], kind = Math.floor(Math.random() * 3), q, ans, pool;
    if (kind === 0) { q = 'What octal mode is <b class="mono">' + sym(m) + '</b>?'; ans = m; pool = MODES; }
    else if (kind === 1) { q = 'Which letters does <b class="mono">chmod ' + m + '</b> give?'; ans = sym(m); pool = MODES.map(sym); }
    else { q = 'Which mode means: ' + esc(words(m)) + '?'; ans = m; pool = MODES; }
    var opts = shuffle([ans].concat(pickN(pool.filter(function (x) { return x !== ans; }), 3)));
    var why = '<span class="mono">' + m + '</span> = <span class="mono">' + sym(m) + '</span>: ' + words(m) + '.';
    return { q: q, opts: opts, ans: ans, why: why };
  }
  game('g-perm', 'Game: Permission puzzle', 'Ten quick questions on octal modes and rwx letters. Build a streak.', 'chmod', function (box) {
    var n, score, streak, bestStreak, cur, locked;
    function ask() {
      if (n === 10) { var r = best('g-perm', 'score', score, false); box.innerHTML = bar([['Score', 'x', score + '/10'], ['Best streak', 'y', bestStreak], ['Best score', 'z', r.best + '/10']]) + endCard(score >= 9 ? 'Permission master' : score >= 6 ? 'Good work' : 'Keep practising', ['You scored <b>' + score + ' of 10</b>.', r.isBest ? 'New best score.' : 'Best: ' + r.best + '/10.', 'Tip: r=4, w=2, x=1. Add them for each of owner, group, others.']); return; }
      cur = permQuestion(); locked = false;
      box.innerHTML = bar([['Question', 'x', (n + 1) + '/10'], ['Score', 'y', score], ['Streak', 'z', streak]]) +
        '<p class="gm-q">' + cur.q + '</p><div class="gm-opts">' + cur.opts.map(function (o) { return '<button class="btn ghost gm-opt mono" data-o="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div><div id="gm-fb" class="gm-fb"></div>';
    }
    function reset() { n = 0; score = 0; streak = 0; bestStreak = 0; ask(); }
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-again]')) { reset(); return; }
      if (e.target.closest('[data-next]')) { n++; ask(); return; }
      var b = e.target.closest('.gm-opt'); if (!b || locked) return; locked = true;
      var ok = b.dataset.o === cur.ans;
      if (ok) { score++; streak++; bestStreak = Math.max(bestStreak, streak); } else streak = 0;
      $$('.gm-opt', box).forEach(function (x) { if (x.dataset.o === cur.ans) x.classList.add('ok'); else if (x === b) x.classList.add('bad'); x.disabled = true; });
      $('#gm-fb', box).innerHTML = '<p class="' + (ok ? 'good' : 'bad') + '"><b>' + (ok ? 'Correct.' : 'Not quite.') + '</b> ' + cur.why + '</p><button class="btn sm" data-next="1">' + (n === 9 ? 'See result' : 'Next') + ' ' + LV.icon('chev') + '</button>';
      var nb = $('[data-next]', box); if (nb) nb.focus({ preventScroll: true });
    });
    reset();
  });

  /* ================= 3. Typing race ================= */
  var TYPE = ['ls -la ~/website', 'cd .. && pwd', 'grep -i error app.log', 'chmod 644 index.html', 'mkdir -p src/docs', 'cp -r css css-backup', 'tail -n 20 access.log', 'sort names.txt | uniq -c',
    'find . -name "*.sh"', 'tar -czf site.tar.gz website', 'sudo systemctl status nginx', 'ssh user@server', 'echo "Hello Linux" > hello.txt', 'ps aux | grep nginx', 'df -h', 'chmod +x deploy.sh',
    'wc -l notes.txt', 'ln -s target link', 'curl -I http://localhost', 'history | tail -n 5'];
  game('g-type', 'Game: Typing race', 'Type five real commands exactly. Your speed and accuracy are measured, and you learn the syntax by heart.', 'shell', function (box) {
    var items, i, t0, errs, chars;
    function show() {
      var target = items[i];
      box.innerHTML = bar([['Command', 'x', (i + 1) + '/5'], ['Mistakes', 'y', errs], ['Best WPM', 'z', getBest('g-type', 'wpm') || '-']]) +
        '<div class="gm-type mono" id="gm-target"></div><input id="gm-in" class="gm-input mono" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type the command"><p class="muted sm">Press Enter to submit each command. A red letter marks a mistake.</p>';
      paint('');
      var inp = $('#gm-in', box); inp.focus({ preventScroll: true });
    }
    function paint(val) {
      var target = items[i], h = '';
      for (var k = 0; k < target.length; k++) { var cls = k < val.length ? (val[k] === target[k] ? 'ok' : 'bad') : (k === val.length ? 'cur' : ''); h += '<span class="' + cls + '">' + esc(target[k] === ' ' ? ' ' : target[k]) + '</span>'; }
      $('#gm-target', box).innerHTML = h;
    }
    function finish() {
      var mins = (Date.now() - t0) / 60000, wpm = Math.round((chars / 5) / mins), acc = Math.max(0, Math.round(100 * (chars - errs) / chars)), r = best('g-type', 'wpm', wpm, false);
      box.innerHTML = endCard(acc >= 97 ? 'Clean run' : 'Done', ['Speed: <b>' + wpm + ' WPM</b>, accuracy <b>' + acc + '%</b> (' + errs + ' mistyped character' + (errs === 1 ? '' : 's') + ').', r.isBest ? 'New best speed.' : 'Best: ' + r.best + ' WPM.']);
    }
    function reset() { items = pickN(TYPE, 5); i = 0; errs = 0; chars = 0; t0 = 0; show(); }
    box.addEventListener('input', function (e) {
      if (e.target.id !== 'gm-in') return;
      if (!t0) t0 = Date.now();
      paint(e.target.value);
    });
    box.addEventListener('keydown', function (e) {
      if (e.target.id !== 'gm-in' || e.key !== 'Enter') return;
      e.preventDefault();
      var v = e.target.value, target = items[i], bad = 0;
      for (var k = 0; k < Math.max(v.length, target.length); k++) if (v[k] !== target[k]) bad++;
      if (bad) { errs += bad; $('#gm-in', box).classList.add('shake'); setTimeout(function () { var x = $('#gm-in', box); if (x) x.classList.remove('shake'); }, 400); var y = $$('.gm-bar b', box)[1]; if (y) y.textContent = errs; return; }
      chars += target.length; i++;
      if (i === items.length) finish(); else show();
    });
    box.addEventListener('click', function (e) { if (e.target.closest('[data-again]')) reset(); });
    reset();
  });

  /* ================= 4. Pipeline puzzle ================= */
  var PUZ = [
    { goal: 'Count how many lines of access.log contain 404.', parts: ['grep 404 access.log', '|', 'wc -l'], decoy: ['sort'] },
    { goal: 'Show the three visitors with the most requests (address is column 1).', parts: ["awk '{print $1}' access.log", '|', 'sort', '|', 'uniq -c', '|', 'sort -rn', '|', 'head -n 3'], decoy: ['wc -l'] },
    { goal: 'List the unique names in names.txt in order.', parts: ['sort names.txt', '|', 'uniq'], decoy: ['wc -l'] },
    { goal: 'Save every line with ERROR from app.log into errors.txt.', parts: ['grep ERROR app.log', '>', 'errors.txt'], decoy: ['>>'] },
    { goal: 'Add today\'s date to the end of log.txt without erasing it.', parts: ['date', '>>', 'log.txt'], decoy: ['>'] },
    { goal: 'Make deploy.sh executable and run it only if that worked.', parts: ['chmod +x deploy.sh', '&&', './deploy.sh'], decoy: [';'] },
    { goal: 'Count the .sh files below the current folder.', parts: ['find . -name "*.sh"', '|', 'wc -l'], decoy: ['sort'] },
    { goal: 'Show the last 5 lines of the sorted list names.txt.', parts: ['sort names.txt', '|', 'tail -n 5'], decoy: ['head -n 5'] },
    { goal: 'Show only the listing lines of the home folder that mention "notes".', parts: ['ls -l ~', '|', 'grep notes'], decoy: ['wc -l'] },
    { goal: 'Pack the folder website into site.tar.gz, then list what is inside.', parts: ['tar -czf site.tar.gz website', '&&', 'tar -tzf site.tar.gz'], decoy: ['|'] }
  ];
  game('g-pipe', 'Game: Pipeline puzzle', 'Put the pieces in the right order to build the command that solves the goal.', 'pipes', function (box) {
    var order, idx, built, solved, tries;
    function render() {
      var p = order[idx];
      box.innerHTML = bar([['Puzzle', 'x', (idx + 1) + '/' + order.length], ['Solved', 'y', solved], ['Best', 'z', (getBest('g-pipe', 'solved') || 0) + '/' + order.length]]) +
        '<p class="gm-q">' + esc(p.goal) + '</p><div class="gm-built mono" id="gm-built">' + (built.length ? built.map(function (b, i) { return '<button class="gm-piece used" data-r="' + i + '">' + esc(b) + '</button>'; }).join('') : '<span class="muted">Tap pieces below to build the command</span>') + '</div>' +
        '<div class="gm-pieces mono">' + p.pool.map(function (x, i) { var used = built.some(function (b, bi) { return p.poolIdx[bi] === i; }); return '<button class="gm-piece" data-p="' + i + '"' + (used ? ' disabled' : '') + '>' + esc(x) + '</button>'; }).join('') + '</div>' +
        '<div class="presets"><button class="btn" data-check="1">Check</button><button class="btn ghost" data-clear="1">Clear</button><button class="btn ghost" data-skip="1">Skip</button></div><div id="gm-fb" class="gm-fb"></div>';
    }
    function load() { var p = order[idx]; p.pool = shuffle(p.parts.concat(p.decoy)); p.poolIdx = []; built = []; tries = 0; render(); }
    function reset() { order = pickN(PUZ, 6).map(function (x) { return { goal: x.goal, parts: x.parts, decoy: x.decoy }; }); idx = 0; solved = 0; load(); }
    function next() {
      idx++;
      if (idx >= order.length) { var r = best('g-pipe', 'solved', solved, false); box.innerHTML = endCard(solved === order.length ? 'All solved' : 'Finished', ['You solved <b>' + solved + ' of ' + order.length + '</b>.', r.isBest ? 'New best.' : 'Best: ' + r.best + '/' + order.length + '.', 'Remember: | passes output on, > replaces a file, >> appends, && runs the next only on success.']); return; }
      load();
    }
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-again]')) { reset(); return; }
      var p = order[idx];
      var pc = e.target.closest('[data-p]');
      if (pc && !pc.disabled) { built.push(p.pool[+pc.dataset.p]); p.poolIdx.push(+pc.dataset.p); render(); return; }
      var rm = e.target.closest('[data-r]');
      if (rm) { var k = +rm.dataset.r; built.splice(k, 1); p.poolIdx.splice(k, 1); render(); return; }
      if (e.target.closest('[data-clear]')) { built = []; p.poolIdx = []; render(); return; }
      if (e.target.closest('[data-skip]')) { next(); return; }
      if (e.target.closest('[data-check]')) {
        var ok = built.join(' ') === p.parts.join(' '), fb = $('#gm-fb', box);
        if (ok) { solved++; fb.innerHTML = '<p class="good"><b>Correct.</b> <span class="mono">' + esc(p.parts.join(' ')) + '</span></p><button class="btn sm" data-nx="1">Next ' + LV.icon('chev') + '</button>'; $$('.gm-piece,[data-check],[data-clear],[data-skip]', box).forEach(function (x) { x.disabled = true; }); }
        else { tries++; fb.innerHTML = '<p class="bad"><b>Not yet.</b> ' + (tries >= 2 ? 'Hint: it starts with <span class="mono">' + esc(p.parts[0]) + '</span>.' : 'Check the order and which symbol joins the parts.') + '</p>'; }
        return;
      }
      if (e.target.closest('[data-nx]')) next();
    });
    reset();
  });

  /* ================= 5. Command doctor ================= */
  var BUGS = [
    { c: 'ls-l', o: ['There is no space between ls and -l', 'ls does not have an -l option', 'It needs sudo', 'The dash must be a double dash'], a: 0, e: 'The shell reads <code>ls-l</code> as one unknown word. Write <code>ls -l</code>.' },
    { c: 'cp -r css', o: ['The destination is missing', '-r is not allowed with cp', 'css must be quoted', 'cp cannot copy folders'], a: 0, e: 'cp needs a source and a destination: <code>cp -r css css-backup</code>.' },
    { c: 'chmod 888 index.html', o: ['Each octal digit must be 0 to 7', 'chmod needs sudo', 'The file name must come first', 'Three digits are not allowed'], a: 0, e: 'Permission digits add r=4, w=2, x=1, so the largest is 7.' },
    { c: 'mkdir a/b/c   (a does not exist)', o: ['Missing -p to create parent folders', 'Folders cannot be nested', 'mkdir needs an absolute path', 'You must use touch first'], a: 0, e: '<code>mkdir -p a/b/c</code> creates the whole chain.' },
    { c: 'site = website', o: ['Spaces around = are not allowed', 'Variables need $ when set', 'Names must be upper case', 'Quotes are required'], a: 0, e: 'Write <code>site=website</code>. With spaces the shell runs a command called site.' },
    { c: 'sudo cd /root', o: ['cd is a shell built-in, so sudo cannot run it', 'The /root folder does not exist', 'sudo needs -i', 'cd cannot take absolute paths'], a: 0, e: 'cd changes your own shell. Use <code>sudo -i</code> to open a root shell.' },
    { c: 'cat notes.txt > notes.txt', o: ['The > empties the file before cat reads it', 'cat cannot write files', 'notes.txt must be quoted', 'It needs >> instead and works fine'], a: 0, e: 'The shell truncates the target first, so cat reads an empty file. Use a temporary file.' },
    { c: 'sort names.txt | uniq -c  (to find duplicates)', o: ['Nothing is wrong: sort first makes uniq work', 'uniq must come before sort', 'uniq -c is not valid', 'sort cannot read files'], a: 0, e: 'This one is correct. uniq only merges neighbouring lines, so sorting first is the right order.' },
    { c: 'if [$x=1]; then echo yes; fi', o: ['Spaces are required inside [ ] and around =', 'if needs curly braces', 'echo cannot be used in if', 'x must be quoted twice'], a: 0, e: 'Write <code>if [ "$x" = 1 ]; then ...</code>. [ is a command, so it needs spaces.' },
    { c: 'rm -rf / tmp/*', o: ['A stray space makes it delete / (everything)', 'rm -rf is not valid', 'tmp/* must be quoted', 'It needs sudo'], a: 0, e: 'The space makes / and tmp/* two arguments. Always check paths before rm -rf.' },
    { c: 'grep error *.log  (finds nothing, but errors exist in logs/app.log)', o: ['grep does not search sub-folders without -r', 'error must be in capitals', '*.log is invalid', 'grep needs sudo'], a: 0, e: 'Use <code>grep -r error logs/</code> to search folders recursively.' },
    { c: 'tar -xzf', o: ['The archive file name is missing', 'x and z cannot be combined', 'tar needs sudo', 'f must come first'], a: 0, e: 'The f option takes the next word as the archive: <code>tar -xzf site.tar.gz</code>.' },
    { c: './deploy.sh  → Permission denied', o: ['The file has no execute permission', 'The file does not exist', 'It must be run with bash only', 'The folder is hidden'], a: 0, e: 'Run <code>chmod +x deploy.sh</code> or start it with <code>bash deploy.sh</code>.' },
    { c: 'echo $HOME/my files/notes.txt', o: ['The space splits the path into two arguments (needs quotes)', '$HOME is not defined in echo', 'Slashes are not allowed', 'echo cannot print paths'], a: 0, e: 'Quote it: <code>echo "$HOME/my files/notes.txt"</code>.' },
    { c: 'find . -name *.sh', o: ['The pattern should be quoted so find, not the shell, expands it', '-name needs an upper case N', 'find cannot search the current folder', 'The dot must be a slash'], a: 0, e: 'Use <code>find . -name "*.sh"</code>.' }
  ];
  game('g-bug', 'Game: Command doctor', 'Each command has a flaw, or is secretly fine. Pick the diagnosis and learn the rule behind it.', 'bash-basics', function (box) {
    var q, i, score, cur, locked;
    function ask() {
      if (i === q.length) { var r = best('g-bug', 'score', score, false); box.innerHTML = endCard(score === q.length ? 'Clean bill of health' : 'Diagnosis complete', ['You found <b>' + score + ' of ' + q.length + '</b> correctly.', r.isBest ? 'New best.' : 'Best: ' + r.best + '/' + q.length + '.']); return; }
      cur = q[i]; locked = false;
      var order = shuffle([0, 1, 2, 3]);
      cur.view = order.map(function (k) { return { t: cur.o[k], right: k === cur.a }; });
      box.innerHTML = bar([['Case', 'x', (i + 1) + '/' + q.length], ['Correct', 'y', score], ['Best', 'z', (getBest('g-bug', 'score') || 0) + '/' + q.length]]) +
        '<p class="gm-q">What is wrong here?</p><pre class="code gm-cmd">' + esc(cur.c) + '</pre><div class="gm-opts">' + cur.view.map(function (o, k) { return '<button class="btn ghost gm-opt" data-k="' + k + '">' + esc(o.t) + '</button>'; }).join('') + '</div><div id="gm-fb" class="gm-fb"></div>';
    }
    function reset() { q = pickN(BUGS, 8); i = 0; score = 0; ask(); }
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-again]')) { reset(); return; }
      if (e.target.closest('[data-next]')) { i++; ask(); return; }
      var b = e.target.closest('.gm-opt'); if (!b || locked) return; locked = true;
      var k = +b.dataset.k, ok = cur.view[k].right; if (ok) score++;
      $$('.gm-opt', box).forEach(function (x, xi) { if (cur.view[xi].right) x.classList.add('ok'); else if (x === b) x.classList.add('bad'); x.disabled = true; });
      $('#gm-fb', box).innerHTML = '<p class="' + (ok ? 'good' : 'bad') + '"><b>' + (ok ? 'Correct.' : 'Not quite.') + '</b> ' + cur.e + '</p><button class="btn sm" data-next="1">' + (i === q.length - 1 ? 'See result' : 'Next') + ' ' + LV.icon('chev') + '</button>';
      var nb = $('[data-next]', box); if (nb) nb.focus({ preventScroll: true });
    });
    reset();
  });

  /* ================= 6. Path navigator ================= */
  function resolve(cwd, step) {
    var arg = step.replace(/^cd\s*/, '') || '~', parts, out;
    if (arg === '~') return '/home/ssk';
    if (arg === '-') return cwd;
    if (arg.indexOf('~/') === 0) arg = '/home/ssk/' + arg.slice(2);
    parts = (arg[0] === '/' ? arg : cwd + '/' + arg).split('/'); out = [];
    parts.forEach(function (p) { if (!p || p === '.') return; if (p === '..') out.pop(); else out.push(p); });
    return '/' + out.join('/');
  }
  var STARTS = ['/home/ssk/website/css', '/home/ssk/website', '/var/log/nginx', '/etc/ssh', '/usr/local/bin', '/home/ssk/projects/app/src'];
  var MOVES = ['cd ..', 'cd ../..', 'cd ..', 'cd ~', 'cd /tmp', 'cd /var/log', 'cd ./logs', 'cd logs', 'cd ../scripts', 'cd ~/website', 'cd .', 'cd /etc'];
  game('g-path', 'Game: Where am I?', 'Follow the cd commands and work out where you end up. Trains absolute and relative paths.', 'navigate', function (box) {
    var n, score, cur, locked;
    function make() {
      var start = STARTS[Math.floor(Math.random() * STARTS.length)], steps = pickN(MOVES.filter(function (m) { return m !== 'cd .'; }), 2 + Math.floor(Math.random() * 2)), p = start, trail = [];
      steps.forEach(function (s) { p = resolve(p, s); trail.push(p); });
      var opts = [p];
      var alt = [trail[trail.length - 2] || start, resolve(trail[trail.length - 2] || start, 'cd ..'), start, resolve(p, 'cd ..'), resolve(p, 'cd logs'), '/home/ssk', '/'];
      shuffle(alt).forEach(function (a) { if (opts.indexOf(a) < 0 && opts.length < 4) opts.push(a); });
      return { start: start, steps: steps, ans: p, opts: shuffle(opts), trail: trail };
    }
    function ask() {
      if (n === 8) { var r = best('g-path', 'score', score, false); box.innerHTML = endCard(score >= 7 ? 'Navigator' : 'Keep exploring', ['You got <b>' + score + ' of 8</b>.', r.isBest ? 'New best.' : 'Best: ' + r.best + '/8.', 'Remember: <code>..</code> is the parent, <code>~</code> is home, a leading <code>/</code> starts at the root.']); return; }
      cur = make(); locked = false;
      box.innerHTML = bar([['Question', 'x', (n + 1) + '/8'], ['Score', 'y', score], ['Best', 'z', (getBest('g-path', 'score') || 0) + '/8']]) +
        '<p class="gm-q">You are in <b class="mono">' + esc(cur.start) + '</b>. You run:</p><pre class="code gm-cmd">' + esc(cur.steps.join('\n')) + '</pre><p class="gm-q">What does <code>pwd</code> print?</p>' +
        '<div class="gm-opts">' + cur.opts.map(function (o) { return '<button class="btn ghost gm-opt mono" data-o="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div><div id="gm-fb" class="gm-fb"></div>';
    }
    function reset() { n = 0; score = 0; ask(); }
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-again]')) { reset(); return; }
      if (e.target.closest('[data-next]')) { n++; ask(); return; }
      var b = e.target.closest('.gm-opt'); if (!b || locked) return; locked = true;
      var ok = b.dataset.o === cur.ans; if (ok) score++;
      $$('.gm-opt', box).forEach(function (x) { if (x.dataset.o === cur.ans) x.classList.add('ok'); else if (x === b) x.classList.add('bad'); x.disabled = true; });
      var walk = cur.steps.map(function (s, k) { return '<span class="mono">' + esc(s) + '</span> → <span class="mono">' + esc(cur.trail[k]) + '</span>'; }).join('<br>');
      $('#gm-fb', box).innerHTML = '<p class="' + (ok ? 'good' : 'bad') + '"><b>' + (ok ? 'Correct.' : 'Not quite.') + '</b></p><p class="sm">' + walk + '</p><button class="btn sm" data-next="1">' + (n === 7 ? 'See result' : 'Next') + ' ' + LV.icon('chev') + '</button>';
      var nb = $('[data-next]', box); if (nb) nb.focus({ preventScroll: true });
    });
    reset();
  });
  LV.gamesData = { PUZ: PUZ, BUGS: BUGS, PAIRS: PAIRS, TYPE: TYPE };
})();
