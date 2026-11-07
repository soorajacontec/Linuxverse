/* Linuxverse learning layer: progress, bookmarks, start-here path, section quizzes */
(function () {
  'use strict';
  var esc = LV.esc, ic = LV.icon, $ = LV.$;
  var L = LV.learn = {};

  /* ---------- Progress (keys: t:topic, c:idea, l:lab, q:section quiz passed, x:challenge) ---------- */
  function map(k) { var m = LV.store.get(k, {}); return m && typeof m === 'object' && !Array.isArray(m) ? m : {}; }
  L.isDone = function (k) { return !!map('done')[k]; };
  L.setDone = function (k, v) {
    var m = map('done');
    if (v === false) delete m[k]; else m[k] = 1;
    LV.store.set('done', m);
  };
  L.toggle = function (k) { var v = !L.isDone(k); L.setDone(k, v); return v; };
  L.count = function (prefix) { return Object.keys(map('done')).filter(function (k) { return k.indexOf(prefix) === 0; }).length; };
  L.secDone = function (sec) { return sec.topics.filter(function (t) { return L.isDone('t:' + t.id); }).length; };
  L.last = function (id) { if (id) LV.store.set('last', id); return LV.store.get('last', null); };
  L.reset = function () { LV.store.set('done', {}); LV.store.set('bm', []); LV.store.set('quiz', {}); LV.store.set('last', null); };

  /* ---------- Bookmarks ---------- */
  L.bms = function () { var b = LV.store.get('bm', []); return Array.isArray(b) ? b.filter(function (id) { return LV.topics[id]; }) : []; };
  L.isBm = function (id) { return L.bms().indexOf(id) >= 0; };
  L.toggleBm = function (id) {
    var b = L.bms(), i = b.indexOf(id);
    if (i >= 0) b.splice(i, 1); else b.push(id);
    LV.store.set('bm', b); return i < 0;
  };

  /* ---------- Start-here path ---------- */
  var PATH = [
    { k: 'c:files', kind: 'Idea', t: 'Everything is a file', concept: 'files' },
    { k: 't:what-is-linux', kind: 'Topic', t: 'What is Linux?', go: 't-what-is-linux' },
    { k: 't:shell', kind: 'Topic', t: 'The shell & terminal', go: 't-shell' },
    { k: 'c:cdpwd', kind: 'Idea', t: 'Moving around: cd, pwd and shortcuts', concept: 'cdpwd' },
    { k: 'c:paths', kind: 'Idea', t: 'One tree and paths', concept: 'paths' },
    { k: 'l:fhs', kind: 'Lab', t: 'Directory tree explorer', go: 'lab-fhs' },
    { k: 't:navigate', kind: 'Topic', t: 'Moving around', go: 't-navigate' },
    { k: 'c:hidden', kind: 'Idea', t: 'Hidden files', concept: 'hidden' },
    { k: 't:fileops', kind: 'Topic', t: 'Create, copy, move, delete', go: 't-fileops' },
    { k: 'c:perms', kind: 'Idea', t: 'Permissions', concept: 'perms' },
    { k: 'l:chmod', kind: 'Lab', t: 'chmod calculator', go: 'lab-chmod' },
    { k: 'c:umask', kind: 'Idea', t: 'Default permissions (umask)', concept: 'umask' },
    { k: 't:pipes', kind: 'Topic', t: 'Pipes & redirection', go: 't-pipes' },
    { k: 'c:text', kind: 'Idea', t: 'Text tools and pipes', concept: 'text' },
    { k: 't:grep', kind: 'Topic', t: 'grep & regular expressions', go: 't-grep' },
    { k: 'l:grep', kind: 'Lab', t: 'grep playground', go: 'lab-grep' },
    { k: 'c:redirect', kind: 'Idea', t: 'Redirection', concept: 'redirect' },
    { k: 'c:vars', kind: 'Idea', t: 'Variables and quoting', concept: 'vars' },
    { k: 't:bash-basics', kind: 'Topic', t: 'Scripts & variables', go: 't-bash-basics' },
    { k: 't:ps', kind: 'Topic', t: 'Processes, ps and top', go: 't-ps' },
    { k: 't:systemctl', kind: 'Topic', t: 'Services with systemctl', go: 't-systemctl' },
    { k: 't:cron', kind: 'Topic', t: 'cron & systemd timers', go: 't-cron' },
    { k: 't:archives', kind: 'Topic', t: 'Archives & compression', go: 't-archives' },
    { k: 't:ssh', kind: 'Topic', t: 'SSH keys', go: 't-ssh' },
    { k: 't:hardening', kind: 'Topic', t: 'Hardening checklist', go: 't-hardening' }
  ];
  L.path = PATH;
  L.pathHtml = function () {
    var n = PATH.filter(function (s) { return L.isDone(s.k); }).length, nextI = -1;
    PATH.some(function (s, i) { if (!L.isDone(s.k)) { nextI = i; return true; } });
    return '<section class="block" id="path"><div class="block-h"><h2>Start here</h2><span class="mono muted sm">' + n + ' / ' + PATH.length + '</span></div>' +
      '<p class="muted ex-intro">New to Linux? Follow these ' + PATH.length + ' steps in order. They mix ideas, topics and labs, and tick off as you go.</p>' +
      '<label class="path-pick"><span class="sr-only">Jump to a step</span><select id="path-sel" class="ex-select" aria-label="Jump to a step">' +
        '<option value="">Jump to a step (' + n + ' of ' + PATH.length + ' done)…</option>' + ['Idea', 'Topic', 'Lab'].map(function (kind) {
          return '<optgroup label="' + kind + 's">' + PATH.map(function (s, i) { return s.kind === kind ? '<option value="' + i + '">' + (L.isDone(s.k) ? '\u2713 ' : '') + (i + 1) + '. ' + esc(s.t) + '</option>' : ''; }).join('') + '</optgroup>';
        }).join('') + '</select></label>' +
      '<ol class="path">' + PATH.map(function (s, i) {
        var d = L.isDone(s.k);
        return '<li class="' + (d ? 'done ' : '') + (i === nextI ? 'next' : '') + '"><button ' + (s.concept ? 'data-concept="' + s.concept + '"' : 'data-go="' + s.go + '"') + '>' +
          '<span class="pa-n mono">' + (d ? ic('check') : i + 1) + '</span><span class="pa-b"><b>' + esc(s.t) + '</b><small>' + s.kind + '</small></span>' + ic('chev') + '</button></li>';
      }).join('') + '</ol></section>';
  };

  /* ---------- Home: progress and continue card ---------- */
  L.totals = function () {
    var tt = 0; LV.sections.forEach(function (s) { tt += s.topics.length; });
    return { t: L.count('t:'), tt: tt, c: L.count('c:'), ct: LV.explore ? LV.explore.concepts.length : 15, q: L.count('q:'), qt: Object.keys(QUIZ).length, x: L.count('x:'), xt: LV.explore && LV.explore.challenges ? LV.explore.challenges.length : 12 };
  };
  L.contHtml = function () {
    var T = L.totals(), pct = Math.round((T.t + T.c) / (T.tt + T.ct) * 100), last = L.last(), lt = last && LV.topics[last];
    var nextStep = null; PATH.some(function (s) { if (!L.isDone(s.k)) { nextStep = s; return true; } });
    var main = lt ? '<button class="btn" data-go="t-' + lt.id + '">' + ic('play') + ' Continue: ' + esc(lt.title) + '</button>'
      : nextStep ? '<button class="btn" ' + (nextStep.concept ? 'data-concept="' + nextStep.concept + '"' : 'data-go="' + nextStep.go + '"') + '>' + ic('play') + ' Begin: ' + esc(nextStep.t) + '</button>' : '';
    var bms = L.bms();
    return '<section class="block cont" id="cont"><div class="cont-top"><b>Your progress</b><span class="mono">' + pct + '%</span></div>' +
      '<div class="ex-bar"><i style="width:' + pct + '%"></i></div>' +
      '<p class="muted sm cont-n">' + T.t + ' of ' + T.tt + ' topics · ' + T.c + ' of ' + T.ct + ' ideas · ' + T.q + ' of ' + T.qt + ' quizzes passed · ' + T.x + ' of ' + T.xt + ' challenges</p>' +
      (main ? '<div class="cont-acts">' + main + '</div>' : '') +
      (bms.length ? '<div class="cont-bm"><span class="muted sm">' + ic('starf') + ' Saved</span>' + bms.map(function (id) { return '<button class="chip" data-go="t-' + id + '">' + esc(LV.topics[id].title) + '</button>'; }).join('') + '</div>' : '') +
      '</section>';
  };

  /* ---------- Quizzes: o[0] is always the correct answer; options are shuffled when shown ---------- */
  var QUIZ = {
    start: [
      { q: 'Strictly speaking, what is "Linux"?', o: ['The kernel at the core of the system', 'A desktop environment', 'A command shell', 'A package manager'], e: 'Linux is the kernel. A distribution bundles it with tools, a package manager and often a desktop.' },
      { q: 'Which two distributions are in the Debian family?', o: ['Ubuntu and Debian', 'Fedora and Debian', 'Arch and Ubuntu', 'openSUSE and Debian'], e: 'Ubuntu is built on Debian and uses the same .deb packages and apt tools.' },
      { q: 'Which command opens the manual page for ls?', o: ['man ls', 'manual --ls', 'readme ls', 'ls --manual'], e: 'man shows the manual page. Press q to leave it.' },
      { q: 'What does the shell do?', o: ['Reads your commands and runs programs for you', 'Draws the desktop', 'Manages the hard disk hardware', 'Compresses files'], e: 'The shell (usually bash) is the program that interprets what you type and starts other programs.' }
    ],
    files: [
      { q: 'Where do normal users keep their personal files?', o: ['/home', '/etc', '/var', '/usr/bin'], e: '/home holds one folder per user. /etc is for configuration and /var for changing data like logs.' },
      { q: 'Which command prints the folder you are in?', o: ['pwd', 'cwd', 'path', 'where'], e: 'pwd means "print working directory".' },
      { q: 'What happens to a symbolic link when its target is deleted?', o: ['It stays but is broken', 'It is deleted too', 'It becomes a full copy', 'It points to the root folder'], e: 'A symlink only stores a path. If the target is gone, the link points at nothing.' },
      { q: 'What does mkdir -p a/b/c do?', o: ['Creates the whole chain of folders', 'Creates a file called c', 'Prints the path a/b/c', 'Deletes folders a, b and c'], e: '-p creates missing parent folders and does not complain if they already exist.' }
    ],
    perms: [
      { q: 'Which permission string is mode 644?', o: ['rw-r--r--', 'rwxr-xr-x', 'rw-------', 'r--r--r--'], e: 'r=4, w=2, x=1. Owner 6 (rw-), group 4 (r--), others 4 (r--).' },
      { q: 'What does x mean on a directory?', o: ['You can enter it and reach what is inside', 'You can run it as a program', 'You can list its names', 'You can delete it'], e: 'On a folder, x lets you cd into it and open files in it. r lists the names.' },
      { q: 'With the usual umask 022, what mode does a new file get?', o: ['644', '666', '755', '600'], e: 'Files start at 666, and umask 022 removes write for group and others, leaving 644.' },
      { q: 'Which command gives you root rights for a single command?', o: ['sudo', 'chroot', 'chown', 'umask'], e: 'sudo runs one command as root (or another user) after checking you are allowed to.' }
    ],
    text: [
      { q: 'What does >> do?', o: ['Adds output to the end of a file', 'Replaces the file with the output', 'Reads input from a file', 'Sends output to the next command'], e: '> overwrites, >> appends, and | pipes into another command.' },
      { q: 'Why do we sort before uniq?', o: ['uniq only merges neighbouring duplicate lines', 'uniq is faster on sorted data only', 'uniq needs a file name', 'sort removes blank lines'], e: 'uniq compares each line with the one before it, so equal lines must sit next to each other.' },
      { q: 'What does grep -i do?', o: ['Ignores upper and lower case', 'Inverts the match', 'Counts matching lines', 'Searches folders recursively'], e: '-i ignores case, -v inverts, -c counts and -r searches recursively.' },
      { q: 'Which command counts the lines of its input?', o: ['wc -l', 'cut -l', 'sort -n', 'head -c'], e: 'wc -l counts lines, wc -w words and wc -c bytes.' }
    ],
    proc: [
      { q: 'Which command lists all running processes with details?', o: ['ps aux', 'lsproc', 'ls -p', 'psall'], e: 'ps aux shows every process with its user, CPU and memory use.' },
      { q: 'Which signal does kill PID send by default?', o: ['SIGTERM (15), a polite request to stop', 'SIGKILL (9), an immediate stop', 'SIGHUP (1)', 'SIGSTOP'], e: 'SIGTERM lets the program clean up. Use kill -9 only if it ignores that.' },
      { q: 'Which signal can a program never catch or ignore?', o: ['SIGKILL', 'SIGTERM', 'SIGINT', 'SIGHUP'], e: 'The kernel enforces SIGKILL (and SIGSTOP); the process gets no chance to react.' },
      { q: 'What does Ctrl+Z do to a foreground job?', o: ['Suspends it so you can use bg or fg', 'Kills it at once', 'Closes the terminal', 'Copies its output'], e: 'Ctrl+Z pauses the job. bg resumes it in the background, fg brings it back.' }
    ],
    pkg: [
      { q: 'Which tool installs packages on Debian and Ubuntu?', o: ['apt', 'dnf', 'pacman', 'zypper'], e: 'apt works with .deb packages. dnf is Fedora/RHEL, pacman is Arch, zypper is openSUSE.' },
      { q: 'How do you install a package on Arch Linux?', o: ['pacman -S name', 'apt install name', 'dnf install name', 'yum add name'], e: 'pacman -S installs; pacman -Syu also updates the system.' },
      { q: 'What does apt update do?', o: ['Refreshes the list of available packages', 'Installs all new versions', 'Removes old packages', 'Reboots the system'], e: 'apt update only refreshes the package lists. apt upgrade installs the new versions.' },
      { q: 'What do Snap, Flatpak and AppImage have in common?', o: ['They package apps to run on many distributions', 'They only work on Arch', 'They replace the kernel', 'They are boot loaders'], e: 'They bundle an app with its libraries so one package runs across distributions.' }
    ],
    systemd: [
      { q: 'What is process ID 1 on most modern distributions?', o: ['systemd', 'bash', 'sshd', 'cron'], e: 'The kernel starts the init system first. On most distributions that is systemd.' },
      { q: 'Which command starts a service now without changing what happens at boot?', o: ['systemctl start name', 'systemctl enable name', 'systemctl mask name', 'systemctl daemon-reload'], e: 'start runs it now; enable makes it start at boot; mask blocks it completely.' },
      { q: 'How do you read the logs of one service?', o: ['journalctl -u name', 'cat /boot/log name', 'logs --service name', 'dmesg -u name'], e: 'journalctl reads the systemd journal and -u filters by unit (service).' },
      { q: 'When does the cron expression 0 3 * * * run?', o: ['Every day at 03:00', 'Every 3 minutes', 'Every hour at minute 3', 'On the 3rd day of the month'], e: 'The fields are minute, hour, day of month, month, weekday: minute 0 of hour 3, every day.' }
    ],
    disks: [
      { q: 'What does lsblk show?', o: ['Block devices: disks and partitions', 'Running processes', 'Network interfaces', 'Open ports'], e: 'lsblk lists disks, partitions and where they are mounted.' },
      { q: 'What is /etc/fstab for?', o: ['Listing filesystems to mount at boot', 'Storing user passwords', 'Setting the hostname', 'Listing installed packages'], e: 'fstab tells the system which devices to mount where, and with which options.' },
      { q: 'What does df -h show?', o: ['Used and free space per filesystem', 'Size of each file in a folder', 'File contents', 'The disk temperature'], e: 'df reports filesystem space; du reports how much a folder uses.' },
      { q: 'What is the main benefit of LVM?', o: ['Resize and combine storage flexibly', 'Faster network speed', 'Replaces the bootloader', 'Encrypts passwords'], e: 'Logical volumes can grow, shrink and span several disks without repartitioning.' }
    ],
    net: [
      { q: 'Which command shows your IP addresses on modern Linux?', o: ['ip addr', 'ipconfig', 'showip', 'netcfg list'], e: 'ip addr (or ip a) replaced ifconfig. ipconfig is the Windows command.' },
      { q: 'Which port does HTTPS use by default?', o: ['443', '80', '22', '53'], e: '80 is HTTP, 22 is SSH and 53 is DNS.' },
      { q: 'What does DNS do?', o: ['Turns names into IP addresses', 'Encrypts traffic', 'Hands out IP addresses to devices', 'Blocks unwanted traffic'], e: 'DNS maps names like example.com to addresses. Handing out addresses is DHCP.' },
      { q: 'Which command tests if a host answers?', o: ['ping', 'ss', 'dig', 'chmod'], e: 'ping sends echo requests. dig asks DNS, ss lists sockets.' }
    ],
    sec: [
      { q: 'Which SSH key file must stay secret?', o: ['The private key (for example id_ed25519)', 'The public key (id_ed25519.pub)', 'known_hosts', 'ssh_config'], e: 'Share the .pub file freely; never share or copy around the private key.' },
      { q: 'What is the default SSH port?', o: ['22', '23', '443', '3389'], e: 'SSH uses port 22. 23 is telnet and 3389 is Windows remote desktop.' },
      { q: 'Which firewall policy is a sensible start?', o: ['Deny incoming by default, allow only needed ports', 'Allow everything', 'Switch the firewall off', 'Block all outgoing traffic'], e: 'Opening only what you need keeps the attack surface small.' },
      { q: 'What do SELinux and AppArmor do?', o: ['Confine programs beyond normal file permissions', 'Scan for viruses', 'Sign packages', 'Encrypt disks'], e: 'They are mandatory access control systems that limit what a program may touch, even as root.' }
    ],
    script: [
      { q: 'What is the first line #!/usr/bin/env bash called?', o: ['The shebang', 'The header', 'The pragma', 'The prologue'], e: 'The shebang tells the system which interpreter should run the script.' },
      { q: 'What does $? hold?', o: ['The exit code of the last command', 'The current process ID', 'The number of arguments', 'The current user'], e: '0 means success; any other value means failure.' },
      { q: 'When does "a && b" run b?', o: ['Only if a succeeded', 'Only if a failed', 'Always', 'In the background'], e: '&& continues on success; || continues on failure.' },
      { q: 'What does: for f in *.txt; do echo "$f"; done do?', o: ['Prints every .txt file name', 'Deletes the .txt files', 'Counts the lines', 'Copies the .txt files'], e: 'The loop runs once per matching file, with $f set to that name.' }
    ]
  };
  /* extra questions for the newer topics */
  var MORE = {
    files: [{ q: 'Which command lists the contents of site.tar.gz without extracting it?', o: ['tar -tzf site.tar.gz', 'tar -xzf site.tar.gz', 'gunzip -l site.tar', 'ls site.tar.gz -t'], e: 't means list. x extracts, c creates; z means gzip and f takes the file name.' }],
    text: [{ q: 'In a unified diff (diff -u), what does a line starting with + mean?', o: ['The line was added', 'The line was removed', 'The line is unchanged', 'The line is a comment'], e: 'Lines with - were removed, lines with + were added, and lines with a space are context.' }],
    proc: [{ q: 'Which process gets CPU time first?', o: ['The one with nice -5', 'The one with nice 0', 'The one with nice 10', 'The one with nice 19'], e: 'A lower niceness number means higher priority. Only root can set negative values.' }],
    systemd: [{ q: 'Which command loads a kernel module together with its dependencies?', o: ['modprobe', 'lsmod', 'dmesg', 'uname -r'], e: 'modprobe loads (or with -r removes) modules. lsmod only lists them and dmesg prints kernel messages.' }],
    net: [{ q: 'What is the difference between rsync website/ dest/ and rsync website dest/?', o: ['With the slash it copies the contents; without, it copies the folder itself', 'There is no difference', 'The slash makes it delete extra files', 'The slash turns on compression'], e: 'A trailing slash on the source means the folder\'s contents. Without it you get dest/website.' }],
    sec: [{ q: 'What does a matching sha256sum prove?', o: ['The file is the same as the one the checksum was made from', 'The file is virus free', 'The publisher is trustworthy', 'The file is encrypted'], e: 'It proves integrity only. A GPG signature is needed to show who published the file.' }],
    script: [{ q: 'What does "$@" expand to inside a script?', o: ['All arguments, each kept as a separate word', 'The number of arguments', 'The script name', 'The last exit code'], e: '$# is the count, $0 the script name and $? the exit code. Always quote "$@".' }],
    dev: [
      { q: 'Which command saves your staged changes as a snapshot?', o: ['git commit', 'git add', 'git push', 'git status'], e: 'add stages, commit saves locally, push sends commits to a remote.' },
      { q: 'How is a container different from a virtual machine?', o: ['It shares the host kernel', 'It has its own full kernel', 'It cannot be isolated', 'It needs a separate disk image per app only'], e: 'Containers are isolated processes on the host kernel, so they start fast and use little memory.' },
      { q: 'What do you press to detach from a tmux session and leave it running?', o: ['Ctrl+b then d', 'Ctrl+c', 'Ctrl+z', 'Ctrl+d'], e: 'Ctrl+b is the tmux prefix and d means detach. Re-attach with tmux attach -t name.' },
      { q: 'What does docker run -p 8080:80 do?', o: ['Maps host port 8080 to port 80 in the container', 'Maps container port 8080 to host port 80', 'Runs two containers', 'Limits memory to 8080 MB'], e: 'The format is host:container, so visiting the host on 8080 reaches the container on 80.' }
    ]
  };
  Object.keys(MORE).forEach(function (k) { QUIZ[k] = (QUIZ[k] || []).concat(MORE[k]); });
  L.quiz = QUIZ;

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function bestOf(id) { return (map('quiz'))[id]; }

  L.quizHtml = function (secId) {
    var Q = QUIZ[secId]; if (!Q) return '';
    var b = bestOf(secId);
    return '<section class="quiz" id="quiz" data-sec="' + secId + '"><div class="quiz-h"><h3>' + ic('flask') + 'Section quiz</h3>' +
      (b != null ? '<span class="badge ' + (b >= 3 ? 'b-live' : '') + '">Best ' + b + '/' + Q.length + '</span>' : '') + '</div><div class="quiz-body" id="quiz-body"></div></section>';
  };
  L.quizMount = function (host, secId) {
    var Q = QUIZ[secId], body = host && $('#quiz-body', host); if (!Q || !body) return;
    var st;
    function intro() {
      var b = bestOf(secId);
      body.innerHTML = '<p class="muted">' + Q.length + ' short questions on this section. ' + (b != null ? 'Your best score is ' + b + ' of ' + Q.length + '.' : 'Get 3 right to pass.') + '</p><button class="btn" data-qz="start">' + ic('play') + ' ' + (b != null ? 'Try again' : 'Start quiz') + '</button>';
    }
    function question() {
      var q = Q[st.i];
      st.opts = shuffle(q.o.map(function (t, k) { return { t: t, ok: k === 0 }; })); st.picked = -1;
      body.innerHTML = '<div class="ex-prog"><span class="mono">Question ' + (st.i + 1) + ' of ' + Q.length + '</span><span class="ex-bar"><i style="width:' + (st.i / Q.length * 100) + '%"></i></span></div>' +
        '<p class="qz-q">' + esc(q.q) + '</p><div class="qz-opts" role="group" aria-label="Answers">' + st.opts.map(function (o, k) { return '<button class="qz-opt" data-k="' + k + '">' + esc(o.t) + '</button>'; }).join('') + '</div><div class="qz-fb" id="qz-fb" aria-live="polite"></div>';
    }
    function finish() {
      var all = map('quiz'), prev = all[secId];
      if (prev == null || st.score > prev) { all[secId] = st.score; LV.store.set('quiz', all); }
      var pass = st.score >= 3;
      if (pass) L.setDone('q:' + secId, true);
      body.innerHTML = '<div class="qz-end ' + (pass ? 'pass' : '') + '"><div class="qz-score mono">' + st.score + '<small>/' + Q.length + '</small></div><p><b>' + (st.score === Q.length ? 'Perfect!' : pass ? 'Passed.' : 'Not yet.') + '</b> ' + (pass ? 'Nice work on this section.' : 'Read the topics again and have another go.') + '</p></div>' +
        '<button class="btn" data-qz="start">' + ic('restart') + ' Try again</button>';
      var badge = $('.quiz-h .badge', host), b = all[secId];
      if (!badge) { badge = document.createElement('span'); badge.className = 'badge'; $('.quiz-h', host).appendChild(badge); }
      badge.textContent = 'Best ' + b + '/' + Q.length; badge.classList.toggle('b-live', b >= 3);
    }
    host.addEventListener('click', function (e) {
      var s = e.target.closest('[data-qz="start"]');
      if (s) { st = { i: 0, score: 0 }; question(); return; }
      var nx = e.target.closest('[data-qz="next"]');
      if (nx) { st.i++; if (st.i >= Q.length) finish(); else question(); return; }
      var op = e.target.closest('.qz-opt');
      if (op && st && st.picked < 0) {
        var k = +op.dataset.k, o = st.opts[k], btns = $$('.qz-opt', body);
        st.picked = k; if (o.ok) st.score++;
        btns.forEach(function (b, j) { b.disabled = true; if (st.opts[j].ok) b.classList.add('ok'); else if (j === k) b.classList.add('bad'); });
        $('#qz-fb', body).innerHTML = '<p class="' + (o.ok ? 'good' : 'bad') + '"><b>' + (o.ok ? 'Correct.' : 'Not quite.') + '</b> ' + esc(Q[st.i].e) + '</p><button class="btn sm" data-qz="next">' + (st.i + 1 >= Q.length ? 'See score' : 'Next question') + ' ' + ic('chev') + '</button>';
        var nb = $('[data-qz="next"]', body); if (nb) nb.focus({ preventScroll: true });
      }
    });
    intro();
  };
  function $$(s, r) { return LV.$$(s, r); }
})();
