/* 18 more step-by-step animated diagrams, attached to topics that had no Visual tab yet.
   Spec: nodes [id, x, y, label, kind], edges [from, to], hide [ids shown only when listed in a step's show/hi], steps [{ t, hi, show, flow }]. */
(function () {
  'use strict';
  function set(id, spec) { var t = LV.topics[id]; if (t) t.anim = spec; }

  set('fileops', {
    nodes: [['a', 90, 40, 'notes.txt', 'file'], ['b', 270, 40, 'notes.bak', 'file'], ['m', 90, 120, 'mv (rename)', 'proc'], ['c', 270, 120, 'docs/notes.txt', 'file'], ['r', 90, 200, 'rm', 'proc'], ['t', 270, 200, 'gone for good', 'hw']],
    edges: [['a', 'b'], ['a', 'm'], ['m', 'c'], ['c', 'r'], ['r', 't']],
    hide: ['b', 'm', 'c', 'r', 't'],
    steps: [
      { t: 'You start with one file, notes.txt.', hi: ['a'] },
      { t: 'cp makes a second, independent file. Both names now hold their own copy of the data.', show: ['a', 'b'], hi: ['a', 'b'], flow: [['a', 'b']] },
      { t: 'mv does not copy anything. It changes the name or the folder entry, so on the same disk it is instant.', show: ['a', 'b', 'm', 'c'], hi: ['m', 'c'], flow: [['a', 'm'], ['m', 'c']] },
      { t: 'rm removes the name. There is no recycle bin: once no name points at the data, it is gone.', show: ['c', 'r', 't'], hi: ['r', 't'], flow: [['c', 'r'], ['r', 't']] }
    ]
  });

  set('umask', {
    nodes: [['p', 180, 30, 'touch / mkdir', 'user'], ['b', 90, 110, 'base 666 / 777', 'file'], ['k', 270, 110, 'umask 022', 'kernel'], ['r', 180, 190, 'result 644 / 755', 'file'], ['l', 180, 250, 'ls -l', 'user']],
    edges: [['p', 'b'], ['p', 'k'], ['b', 'r'], ['k', 'r'], ['r', 'l']],
    hide: ['r', 'l'],
    steps: [
      { t: 'A program creates a new file or folder. It asks for the most generous mode: 666 for files, 777 for folders.', hi: ['p', 'b'], flow: [['p', 'b']] },
      { t: 'The umask lists the permission bits to take away. 022 removes write for group and others.', show: ['k'], hi: ['k'], flow: [['p', 'k']] },
      { t: 'Result = base minus umask: files get 666-022 = 644, folders get 777-022 = 755.', show: ['r'], hi: ['b', 'k', 'r'], flow: [['b', 'r'], ['k', 'r']] },
      { t: 'ls -l shows the outcome. umask 077 makes everything you create private.', show: ['r', 'l'], hi: ['r', 'l'], flow: [['r', 'l']] }
    ]
  });

  set('sudo', {
    nodes: [['u', 90, 40, 'ssk (normal user)', 'user'], ['s', 270, 40, 'sudo', 'proc'], ['f', 270, 120, '/etc/sudoers', 'file'], ['p', 90, 120, 'your password', 'hw'], ['c', 90, 200, 'command as root', 'kernel'], ['j', 270, 200, 'journal log', 'file']],
    edges: [['u', 's'], ['s', 'f'], ['s', 'p'], ['s', 'c'], ['c', 'j']],
    hide: ['f', 'p', 'c', 'j'],
    steps: [
      { t: 'You are a normal user and type: sudo systemctl restart nginx.', hi: ['u', 's'], flow: [['u', 's']] },
      { t: 'sudo reads the rules in /etc/sudoers and checks you are allowed to run this command.', show: ['u', 's', 'f'], hi: ['s', 'f'], flow: [['s', 'f']] },
      { t: 'It asks for your own password (not root\'s) and remembers it for a few minutes.', show: ['u', 's', 'f', 'p'], hi: ['s', 'p'], flow: [['s', 'p']] },
      { t: 'Only this one command runs as root. Your shell stays an ordinary user.', show: ['u', 's', 'f', 'p', 'c'], hi: ['c'], flow: [['s', 'c']] },
      { t: 'The use is written to the log, so there is a record of who did what.', show: ['u', 's', 'f', 'p', 'c', 'j'], hi: ['c', 'j'], flow: [['c', 'j']] }
    ]
  });

  set('grep', {
    nodes: [['f', 90, 40, 'access.log', 'file'], ['g', 270, 40, 'grep 404', 'proc'], ['m', 270, 120, 'matching lines', 'file'], ['w', 270, 200, 'wc -l', 'proc'], ['o', 90, 200, '3', 'user']],
    edges: [['f', 'g'], ['g', 'm'], ['m', 'w'], ['w', 'o']],
    hide: ['m', 'w', 'o'],
    steps: [
      { t: 'The log has one line per visit. We want to know how many failed with 404.', hi: ['f'] },
      { t: 'grep reads the file line by line and tests each line against the pattern 404.', hi: ['f', 'g'], flow: [['f', 'g']] },
      { t: 'Only lines that match are printed. Everything else is dropped.', show: ['m'], hi: ['g', 'm'], flow: [['g', 'm']] },
      { t: 'The pipe | hands those lines to wc -l, which counts them.', show: ['m', 'w'], hi: ['m', 'w'], flow: [['m', 'w']] },
      { t: 'The answer is printed: 3 lines contained 404.', show: ['m', 'w', 'o'], hi: ['w', 'o'], flow: [['w', 'o']] }
    ]
  });

  set('signals', {
    nodes: [['u', 90, 40, 'you: kill 2450', 'user'], ['k', 270, 40, 'kernel', 'kernel'], ['p', 180, 120, 'process 2450', 'proc'], ['h', 90, 200, 'handler: save + cleanup', 'file'], ['x', 270, 200, 'process exits', 'hw']],
    edges: [['u', 'k'], ['k', 'p'], ['p', 'h'], ['h', 'x'], ['k', 'x']],
    hide: ['h', 'x'],
    steps: [
      { t: 'kill sends a signal. By default it is SIGTERM, a polite request to stop.', hi: ['u', 'k'], flow: [['u', 'k']] },
      { t: 'The kernel delivers the signal to process 2450.', hi: ['k', 'p'], flow: [['k', 'p']] },
      { t: 'The program catches SIGTERM, runs its handler, saves work and closes files.', show: ['h'], hi: ['p', 'h'], flow: [['p', 'h']] },
      { t: 'Then it exits on its own, cleanly.', show: ['h', 'x'], hi: ['h', 'x'], flow: [['h', 'x']] },
      { t: 'kill -9 sends SIGKILL, which cannot be caught. The kernel ends the process at once, with no cleanup.', show: ['x'], hi: ['k', 'x'], flow: [['k', 'x']] }
    ]
  });

  set('jobs', {
    nodes: [['s', 180, 30, 'bash', 'user'], ['f', 90, 110, 'foreground job', 'proc'], ['b', 270, 110, 'background job', 'proc'], ['z', 90, 190, 'stopped (Ctrl+Z)', 'file'], ['j', 270, 190, 'jobs / fg', 'user']],
    edges: [['s', 'f'], ['s', 'b'], ['f', 'z'], ['z', 'b'], ['b', 'j']],
    hide: ['b', 'z', 'j'],
    steps: [
      { t: 'A normal command runs in the foreground and keeps your terminal busy until it ends.', hi: ['s', 'f'], flow: [['s', 'f']] },
      { t: 'Ctrl+Z pauses it. The job is stopped, and you get your prompt back.', show: ['f', 'z'], hi: ['f', 'z'], flow: [['f', 'z']] },
      { t: 'bg lets the stopped job continue in the background.', show: ['f', 'z', 'b'], hi: ['z', 'b'], flow: [['z', 'b']] },
      { t: 'Adding & at the end starts a job in the background right away.', show: ['b'], hi: ['s', 'b'], flow: [['s', 'b']] },
      { t: 'jobs lists them, and fg brings one back to the front. nohup or tmux keeps jobs alive after logout.', show: ['b', 'j'], hi: ['b', 'j'], flow: [['b', 'j']] }
    ]
  });

  set('cron', {
    nodes: [['d', 180, 30, 'crond daemon', 'kernel'], ['t', 90, 110, 'crontab: 30 2 * * *', 'file'], ['c', 270, 110, 'clock 02:30', 'hw'], ['j', 90, 190, 'backup.sh', 'proc'], ['l', 270, 190, 'log or mail output', 'file']],
    edges: [['d', 't'], ['d', 'c'], ['t', 'j'], ['c', 'j'], ['j', 'l']],
    hide: ['j', 'l'],
    steps: [
      { t: 'crond wakes up every minute.', hi: ['d'] },
      { t: 'It reads every crontab. This one says: run backup.sh at 02:30 every day.', hi: ['d', 't'], flow: [['d', 't']] },
      { t: 'It compares each schedule with the clock.', hi: ['d', 'c'], flow: [['d', 'c']] },
      { t: 'At 02:30 the times match, so cron starts the job with a small, minimal environment.', show: ['j'], hi: ['t', 'c', 'j'], flow: [['t', 'j'], ['c', 'j']] },
      { t: 'Output goes to mail or a log file. Use full paths and redirect output so you can see failures.', show: ['j', 'l'], hi: ['j', 'l'], flow: [['j', 'l']] }
    ]
  });

  set('journal', {
    nodes: [['a', 90, 40, 'nginx, sshd, kernel', 'proc'], ['j', 270, 40, 'journald', 'kernel'], ['s', 270, 120, '/var/log/journal', 'file'], ['c', 90, 120, 'journalctl', 'user'], ['f', 180, 200, '-u nginx -n 50', 'proc']],
    edges: [['a', 'j'], ['j', 's'], ['c', 's'], ['c', 'f']],
    hide: ['c', 'f'],
    steps: [
      { t: 'Services and the kernel write messages as they run.', hi: ['a'] },
      { t: 'journald collects every message into one place, with time, unit and priority.', hi: ['a', 'j'], flow: [['a', 'j']] },
      { t: 'It stores them in a compact binary journal on disk.', hi: ['j', 's'], flow: [['j', 's']] },
      { t: 'journalctl reads the journal back.', show: ['c'], hi: ['c', 's'], flow: [['s', 'c']] },
      { t: 'Filters find what you need: one service (-u nginx), the last lines (-n 50), a time range (--since) or follow live (-f).', show: ['c', 'f'], hi: ['c', 'f'], flow: [['c', 'f']] }
    ]
  });

  set('ip', {
    nodes: [['l', 90, 40, 'laptop 192.0.2.25', 'hw'], ['r', 270, 40, 'router 192.0.2.1', 'hw'], ['d', 270, 120, 'DNS server', 'proc'], ['w', 270, 200, 'web 203.0.113.10', 'hw'], ['c', 90, 120, 'ip addr, ip route', 'user']],
    edges: [['l', 'r'], ['r', 'd'], ['r', 'w'], ['c', 'l']],
    hide: ['d', 'w', 'c'],
    steps: [
      { t: 'Your machine has an address on the local network. ip addr shows it.', show: ['c'], hi: ['l', 'c'], flow: [['c', 'l']] },
      { t: 'To reach anything outside, packets go to the default gateway: your router. ip route shows it.', hi: ['l', 'r'], flow: [['l', 'r']] },
      { t: 'To turn example.com into an address, a DNS query goes out through the router.', show: ['d'], hi: ['r', 'd'], flow: [['r', 'd']] },
      { t: 'DNS answers with 203.0.113.10. Now the real request can be sent.', show: ['d', 'w'], hi: ['d'], flow: [['d', 'r']] },
      { t: 'The router forwards your packets hop by hop to the web server and the replies come back the same way.', show: ['d', 'w'], hi: ['r', 'w'], flow: [['r', 'w']] }
    ]
  });

  set('conn', {
    nodes: [['c', 90, 40, 'Client', 'user'], ['s', 270, 40, 'Server :80', 'proc'], ['k', 180, 130, 'ESTABLISHED', 'kernel'], ['q', 180, 210, 'ss -tn', 'user']],
    edges: [['c', 's'], ['c', 'k'], ['s', 'k'], ['k', 'q']],
    hide: ['k', 'q'],
    steps: [
      { t: 'To open a TCP connection, the client sends SYN: "I would like to talk".', hi: ['c', 's'], flow: [['c', 's']] },
      { t: 'The server answers SYN-ACK: "Fine, I am ready".', hi: ['c', 's'], flow: [['s', 'c']] },
      { t: 'The client replies ACK. This is the three-way handshake.', hi: ['c', 's'], flow: [['c', 's']] },
      { t: 'Both kernels now mark the connection ESTABLISHED and data can flow, for example an HTTP request.', show: ['k'], hi: ['k'], flow: [['c', 'k'], ['s', 'k']] },
      { t: 'ss -tn lists these connections and their state. Closing uses FIN packets in both directions.', show: ['k', 'q'], hi: ['k', 'q'], flow: [['k', 'q']] }
    ]
  });

  set('loops', {
    nodes: [['l', 90, 40, 'a.txt b.txt c.txt', 'file'], ['f', 270, 40, 'for f in *.txt', 'proc'], ['b', 270, 120, 'echo "$f"', 'proc'], ['o', 90, 120, 'prints a.txt, b.txt...', 'user'], ['d', 180, 200, 'done', 'kernel']],
    edges: [['l', 'f'], ['f', 'b'], ['b', 'o'], ['b', 'd']],
    hide: ['b', 'o', 'd'],
    steps: [
      { t: 'The shell expands *.txt into a list of three names before the loop starts.', hi: ['l'] },
      { t: 'The loop takes the first item and stores it in the variable f.', hi: ['l', 'f'], flow: [['l', 'f']] },
      { t: 'It runs the body between do and done once for that item.', show: ['b'], hi: ['f', 'b'], flow: [['f', 'b']] },
      { t: 'Then it takes the next item and repeats, until the list is used up.', show: ['b', 'o'], hi: ['b', 'o'], flow: [['b', 'o'], ['f', 'b']] },
      { t: 'When no items are left, the loop ends and the script continues after done.', show: ['b', 'o', 'd'], hi: ['d'], flow: [['b', 'd']] }
    ]
  });

  set('gitbranch', {
    nodes: [['m', 90, 40, 'main: A - B', 'file'], ['f', 270, 120, 'feature: C - D', 'proc'], ['g', 90, 200, 'main: A - B - M', 'kernel'], ['o', 270, 200, 'origin (GitHub)', 'hw']],
    edges: [['m', 'f'], ['f', 'g'], ['m', 'g'], ['g', 'o']],
    hide: ['f', 'g', 'o'],
    steps: [
      { t: 'main has two commits, A and B. It is stable and shared.', hi: ['m'] },
      { t: 'git switch -c feature starts a new line of work from B. main is untouched.', show: ['m', 'f'], hi: ['m', 'f'], flow: [['m', 'f']] },
      { t: 'You commit C and D on the feature branch. Experiment freely.', show: ['m', 'f'], hi: ['f'] },
      { t: 'git merge feature, run from main, brings C and D in. If both sides changed the same lines you fix the conflict.', show: ['m', 'f', 'g'], hi: ['f', 'g'], flow: [['f', 'g']] },
      { t: 'git push sends the result to the shared repository.', show: ['f', 'g', 'o'], hi: ['g', 'o'], flow: [['g', 'o']] }
    ]
  });

  set('tls', {
    nodes: [['b', 90, 40, 'Browser', 'user'], ['s', 270, 40, 'Server', 'proc'], ['c', 270, 120, 'certificate', 'file'], ['a', 90, 120, 'trusted CAs', 'kernel'], ['k', 180, 200, 'shared session key', 'hw']],
    edges: [['b', 's'], ['s', 'c'], ['b', 'a'], ['b', 'k'], ['s', 'k']],
    hide: ['c', 'a', 'k'],
    steps: [
      { t: 'The browser says hello and lists the encryption it supports.', hi: ['b', 's'], flow: [['b', 's']] },
      { t: 'The server answers with its certificate: its name, its public key and a signature.', show: ['c'], hi: ['s', 'c'], flow: [['s', 'c'], ['s', 'b']] },
      { t: 'The browser checks the signature against its list of trusted CAs, plus the name and the dates.', show: ['c', 'a'], hi: ['b', 'a'], flow: [['b', 'a']] },
      { t: 'Both sides agree on a fresh session key that an eavesdropper cannot work out.', show: ['c', 'a', 'k'], hi: ['k'], flow: [['b', 'k'], ['s', 'k']] },
      { t: 'From now on everything is encrypted with that key. This is what the padlock means.', show: ['k'], hi: ['b', 's', 'k'], flow: [['b', 's']] }
    ]
  });

  set('tunnels', {
    nodes: [['b', 90, 40, 'browser', 'user'], ['l', 270, 40, 'localhost:8080', 'proc'], ['s', 270, 120, 'ssh server', 'hw'], ['v', 270, 200, 'service :80', 'proc'], ['t', 90, 120, 'ssh -L 8080:localhost:80', 'user']],
    edges: [['b', 'l'], ['l', 's'], ['s', 'v'], ['t', 'l']],
    hide: ['s', 'v', 't'],
    steps: [
      { t: 'ssh -L 8080:localhost:80 user@server opens port 8080 on your own machine.', show: ['l', 't'], hi: ['t', 'l'], flow: [['t', 'l']] },
      { t: 'Your browser connects to localhost:8080 as if the service were local.', show: ['l'], hi: ['b', 'l'], flow: [['b', 'l']] },
      { t: 'The traffic travels inside the encrypted SSH connection to the server.', show: ['l', 's'], hi: ['l', 's'], flow: [['l', 's']] },
      { t: 'The server forwards it to its own port 80, a service that is not open to the internet.', show: ['l', 's', 'v'], hi: ['s', 'v'], flow: [['s', 'v']] },
      { t: 'The reply returns the same way. Close the tunnel with Ctrl+C or by ending the ssh process.', show: ['l', 's', 'v'], hi: ['v', 's', 'l'], flow: [['v', 's'], ['s', 'l']] }
    ]
  });

  set('nginxproxy', {
    nodes: [['c', 90, 40, 'Browser', 'user'], ['n', 270, 40, 'nginx :443', 'proc'], ['t', 90, 120, 'TLS + gzip + logs', 'file'], ['a', 270, 120, 'app 127.0.0.1:3000', 'proc'], ['e', 180, 200, '502 Bad Gateway', 'hw']],
    edges: [['c', 'n'], ['n', 't'], ['n', 'a'], ['n', 'e']],
    hide: ['t', 'a', 'e'],
    steps: [
      { t: 'Visitors connect to nginx on the public ports 80 and 443. The app is hidden behind it.', hi: ['c', 'n'], flow: [['c', 'n']] },
      { t: 'nginx handles the HTTPS part: it decrypts the request, and later compresses and logs.', show: ['t'], hi: ['n', 't'], flow: [['n', 't']] },
      { t: 'proxy_pass forwards the request to the app on a private local port.', show: ['t', 'a'], hi: ['n', 'a'], flow: [['n', 'a']] },
      { t: 'The app answers nginx, and nginx returns the response to the browser.', show: ['t', 'a'], hi: ['a', 'n', 'c'], flow: [['a', 'n'], ['n', 'c']] },
      { t: 'If the app is down or on another port, nginx cannot reach it and shows 502 Bad Gateway. Test the app directly with curl.', show: ['t', 'a', 'e'], hi: ['n', 'e'], flow: [['n', 'e']] }
    ]
  });

  set('swap', {
    nodes: [['p', 270, 40, 'programs', 'proc'], ['r', 90, 40, 'RAM 8 GB', 'hw'], ['k', 180, 120, 'kernel', 'kernel'], ['s', 90, 200, 'swap 4 GB (disk)', 'file'], ['o', 270, 200, 'OOM killer', 'proc']],
    edges: [['p', 'r'], ['r', 'k'], ['k', 's'], ['k', 'o']],
    hide: ['s', 'o'],
    steps: [
      { t: 'Programs keep their data in RAM, which is fast.', hi: ['p', 'r'], flow: [['p', 'r']] },
      { t: 'When RAM fills up, the kernel looks for memory that has not been used for a while.', hi: ['r', 'k'], flow: [['r', 'k']] },
      { t: 'It moves those idle pages out to swap on disk and frees the RAM.', show: ['s'], hi: ['k', 's'], flow: [['k', 's']] },
      { t: 'If a program needs a swapped page, it is read back in. Disks are slow, so constant swapping makes the machine crawl.', show: ['s'], hi: ['s', 'r'], flow: [['s', 'k'], ['k', 'r']] },
      { t: 'If RAM and swap are both full, the OOM killer ends a process to save the system. Check dmesg afterwards.', show: ['s', 'o'], hi: ['k', 'o'], flow: [['k', 'o']] }
    ]
  });

  set('timers', {
    nodes: [['t', 90, 40, 'backup.timer', 'file'], ['d', 270, 40, 'systemd', 'kernel'], ['s', 270, 120, 'backup.service', 'proc'], ['j', 90, 200, 'journal (logs)', 'file'], ['p', 270, 200, 'Persistent=true', 'hw']],
    edges: [['t', 'd'], ['d', 's'], ['s', 'j'], ['t', 'p']],
    hide: ['s', 'j', 'p'],
    steps: [
      { t: 'A .timer unit holds the schedule, for example OnCalendar=*-*-* 02:30:00.', hi: ['t'] },
      { t: 'systemd watches the clock for every active timer.', hi: ['t', 'd'], flow: [['t', 'd']] },
      { t: 'When the time comes it starts the matching .service, the job itself.', show: ['s'], hi: ['d', 's'], flow: [['d', 's']] },
      { t: 'Output and the exit code land in the journal: journalctl -u backup.service.', show: ['s', 'j'], hi: ['s', 'j'], flow: [['s', 'j']] },
      { t: 'With Persistent=true a run that was missed while the machine was off happens at the next boot. Enable the timer, not the service.', show: ['s', 'j', 'p'], hi: ['t', 'p'], flow: [['t', 'p']] }
    ]
  });

  set('backups', {
    nodes: [['s', 90, 40, '~/website', 'file'], ['r', 270, 40, 'rsync -a', 'proc'], ['n', 270, 120, 'snapshot 2026-11-08', 'file'], ['o', 270, 200, 'off-site copy', 'hw'], ['t', 90, 200, 'test restore', 'user']],
    edges: [['s', 'r'], ['r', 'n'], ['n', 'o'], ['o', 't']],
    hide: ['n', 'o', 't'],
    steps: [
      { t: 'Your live data is copy number one of three.', hi: ['s'] },
      { t: 'rsync -a copies only what changed. With --link-dest, unchanged files are hard links, so each daily snapshot looks complete but costs little space.', show: ['n'], hi: ['s', 'r', 'n'], flow: [['s', 'r'], ['r', 'n']] },
      { t: 'Copy the snapshot to a second kind of storage and to a third place off-site (3-2-1: 3 copies, 2 media, 1 off-site).', show: ['n', 'o'], hi: ['n', 'o'], flow: [['n', 'o']] },
      { t: 'A backup you have never restored is only a hope. Restore a file now and then to prove it works.', show: ['n', 'o', 't'], hi: ['o', 't'], flow: [['o', 't']] }
    ]
  });
})();
