/* Sections: Text & pipes, Processes, Packages */
LV.sec({
  id: 'text', title: 'Text & pipes', icon: 'file', hue: 160,
  desc: 'Redirection, pipelines, grep, sed, awk and friends.',
  topics: [
    {
      id: 'pipes', title: 'Pipes & redirection', sum: 'stdin, stdout, stderr, |, > and >>.',
      explain: [
        'Every process starts with three open streams: <b>stdin</b> (0), <b>stdout</b> (1) and <b>stderr</b> (2). By default all three are connected to your terminal.',
        '<code>&gt;</code> sends stdout to a file (overwriting), <code>&gt;&gt;</code> appends, <code>&lt;</code> reads stdin from a file and <code>2&gt;</code> redirects errors.',
        'A <b>pipe</b> <code>|</code> connects the stdout of one command to the stdin of the next. Small tools chained together become a powerful program. Build one in the Live tab.'
      ],
      anim: {
        nodes: [['cat', 50, 60, 'cat access.log', 'proc'], ['grep', 180, 60, 'grep 404', 'proc'], ['wc', 310, 60, 'wc -l', 'proc'], ['term', 310, 160, 'terminal: 3', 'user'], ['err', 180, 160, 'stderr → terminal', 'hw'], ['file', 50, 160, 'access.log', 'file']],
        edges: [['file', 'cat'], ['cat', 'grep'], ['grep', 'wc'], ['wc', 'term'], ['grep', 'err']],
        steps: [
          { t: 'cat reads the file and writes every line to its stdout.', hi: ['file', 'cat'], flow: [['file', 'cat']] },
          { t: 'The pipe feeds those lines into grep\'s stdin. grep keeps only lines containing 404.', hi: ['grep'], flow: [['cat', 'grep']] },
          { t: 'The matching lines flow into wc -l, which counts them.', hi: ['wc'], flow: [['grep', 'wc']] },
          { t: 'Only the final stdout reaches the terminal: 3.', hi: ['term'], flow: [['wc', 'term']] },
          { t: 'Errors use stderr, which bypasses the pipe and still shows on screen unless you redirect 2>.', hi: ['err'], flow: [['grep', 'err']] }
        ]
      },
      cmds: [
        ['echo "hello" > greet.txt', 'Write stdout to a file (overwrite)'],
        ['echo "again" >> greet.txt', 'Append to a file'],
        ['cat access.log | grep 404 | wc -l', 'Count lines containing 404', '3'],
        ['ls /nope 2> errors.txt', 'Send error messages to a file'],
        ['command > out.txt 2>&1', 'Send stdout and stderr to the same file'],
        ['ls /etc | tee listing.txt | head -3', 'Save output and keep piping (tee)'],
        ['sort < names.txt', 'Read stdin from a file']
      ],
      flags: [['>', 'stdout to file, overwrite', 'shell'], ['>>', 'stdout to file, append', 'shell'], ['2>', 'stderr to file', 'shell'], ['2>&1', 'stderr to wherever stdout goes', 'shell'], ['|', 'Pipe stdout into next stdin', 'shell'], ['/dev/null', 'Discard output', 'shell']],
      live: 'pipe',
      demo: ['cat access.log | grep 404', 'cat access.log | grep 404 | wc -l'],
      warn: ['<code>&gt;</code> truncates the file first, so <code>sort file &gt; file</code> leaves you with an empty file.']
    },
    {
      id: 'grep', title: 'grep & regular expressions', sum: 'Find lines that match a pattern.',
      explain: [
        '<code>grep PATTERN FILE</code> prints every line containing the pattern. Patterns are <b>regular expressions</b>: <code>^</code> start of line, <code>$</code> end, <code>.</code> any character, <code>*</code> zero or more, <code>[0-9]</code> a set.',
        'Use <code>-E</code> for extended regex (<code>+</code>, <code>?</code>, <code>|</code>, <code>()</code> without backslashes). Quote patterns so the shell does not expand them.',
        'Type a pattern in the Live tab and watch matches highlight as you type.'
      ],
      cmds: [
        ['grep error /var/log/syslog', 'Lines containing "error"'],
        ['grep -i error app.log', 'Case-insensitive'],
        ['grep -n 404 access.log', 'Show line numbers', '2:203.0.113.9 - - "GET /old" 404\n4:198.51.100.7 - - "GET /x" 404\n6:192.0.2.44 - - "GET /missing" 404'],
        ['grep -v "^#" /etc/ssh/sshd_config', 'Hide comment lines'],
        ['grep -c 404 access.log', 'Count matching lines', '3'],
        ['grep -rn "TODO" ~/projects', 'Search a directory tree recursively'],
        ['grep -E "^(GET|POST)" requests.txt', 'Extended regex alternation'],
        ['grep -o "[0-9]\\{1,3\\}\\(\\.[0-9]\\{1,3\\}\\)\\{3\\}" access.log', 'Print only IP-like matches']
      ],
      flags: [['-i', 'Ignore case', 'grep'], ['-v', 'Invert: lines that do NOT match', 'grep'], ['-n', 'Line numbers', 'grep'], ['-c', 'Count matches', 'grep'], ['-r', 'Recursive', 'grep'], ['-l', 'Only file names', 'grep'], ['-E', 'Extended regex', 'grep'], ['-o', 'Only the matching part', 'grep'], ['-w', 'Whole words only', 'grep']],
      live: 'grep',
      demo: ['grep -n 404 access.log', 'grep -c 404 access.log']
    },
    {
      id: 'sedawk', title: 'sed, awk and cut', sum: 'Edit streams and pull out columns.',
      explain: [
        '<code>sed</code> is a stream editor. Its most used command is substitution: <code>s/old/new/g</code>. Add <code>-i</code> to edit a file in place.',
        '<code>awk</code> splits each line into fields <code>$1</code>, <code>$2</code>… and runs a small program on them. Ideal for columns of logs or command output.',
        '<code>cut</code> is the simple option: <code>-d</code> sets the delimiter and <code>-f</code> picks fields.'
      ],
      cmds: [
        ['sed "s/http/https/g" links.txt', 'Replace every http with https (prints result)'],
        ['sed -i.bak "s/8080/9090/" app.conf', 'Edit in place, keeping app.conf.bak'],
        ['sed -n "5,10p" big.log', 'Print only lines 5 to 10'],
        ['awk \'{print $1}\' access.log', 'First column (IP addresses)', '192.0.2.10\n203.0.113.9\n192.0.2.10\n198.51.100.7\n192.0.2.10\n192.0.2.44'],
        ['awk -F: \'$3 >= 1000 {print $1}\' /etc/passwd', 'Users with UID 1000 or above', 'ssk'],
        ['cut -d: -f1,7 /etc/passwd', 'User name and shell', 'root:/bin/bash\ndaemon:/usr/sbin/nologin\nwww-data:/usr/sbin/nologin\nssk:/bin/bash']
      ],
      flags: [['-i', 'Edit file in place (optional backup suffix)', 'sed'], ['-n', 'Print only what p asks for', 'sed'], ['-F', 'Field separator', 'awk'], ['-d', 'Delimiter', 'cut'], ['-f', 'Fields to keep', 'cut']],
      demo: ['awk \'{print $1}\' access.log', 'cut -d: -f1,7 /etc/passwd'],
      warn: ['On macOS/BSD sed, <code>-i</code> needs an argument. These examples use GNU sed, the default on Linux.']
    },
    {
      id: 'sortuniq', title: 'sort, uniq, wc, head, tail', sum: 'Counting and ranking data.',
      explain: [
        '<code>sort</code> orders lines; <code>-n</code> sorts numerically, <code>-r</code> reverses. <code>uniq</code> collapses <i>adjacent</i> duplicates, so always sort first. <code>uniq -c</code> counts them.',
        'The classic "top N" pipeline: extract a field, sort, uniq -c, sort -rn, head.',
        '<code>head</code> and <code>tail</code> show the first or last lines. <code>tail -f</code> follows a growing log live.'
      ],
      anim: {
        nodes: [['a', 50, 50, 'awk $1', 'proc'], ['s', 140, 50, 'sort', 'proc'], ['u', 230, 50, 'uniq -c', 'proc'], ['r', 320, 50, 'sort -rn', 'proc'], ['o', 185, 160, '3 192.0.2.10 · 1 203.0.113.9 …', 'user']],
        edges: [['a', 's'], ['s', 'u'], ['u', 'r'], ['r', 'o']],
        steps: [
          { t: 'awk pulls the IP column from every log line.', hi: ['a'] },
          { t: 'sort groups identical IPs next to each other.', hi: ['s'], flow: [['a', 's']] },
          { t: 'uniq -c collapses each group into "count IP".', hi: ['u'], flow: [['s', 'u']] },
          { t: 'sort -rn ranks by that count, highest first.', hi: ['r'], flow: [['u', 'r']] },
          { t: 'The top visitor appears first.', hi: ['o'], flow: [['r', 'o']] }
        ]
      },
      cmds: [
        ['awk \'{print $1}\' access.log | sort | uniq -c | sort -rn', 'Top IP addresses by request count', '      3 192.0.2.10\n      1 203.0.113.9\n      1 198.51.100.7\n      1 192.0.2.44'],
        ['wc -l access.log', 'Count lines', '6 access.log'],
        ['head -n 3 access.log', 'First 3 lines'],
        ['tail -n 2 access.log', 'Last 2 lines'],
        ['tail -f /var/log/syslog', 'Follow a log as it grows (Ctrl+C to stop)'],
        ['sort -t, -k2 -n scores.csv', 'Sort a CSV numerically by column 2']
      ],
      flags: [['-n', 'Numeric sort', 'sort'], ['-r', 'Reverse', 'sort'], ['-k', 'Sort key (column)', 'sort'], ['-u', 'Unique lines only', 'sort'], ['-c', 'Prefix counts', 'uniq'], ['-l / -w', 'Lines / words', 'wc'], ['-f', 'Follow appended data', 'tail']],
      demo: ['wc -l access.log', 'awk \'{print $1}\' access.log | sort | uniq -c | sort -rn']
    },
    {
      id: 'find', title: 'find & xargs', sum: 'Locate files by name, size, age, and act on them.',
      explain: [
        '<code>find PATH TESTS ACTIONS</code> walks a directory tree. Tests include <code>-name</code>, <code>-type</code>, <code>-size</code> and <code>-mtime</code>.',
        '<code>-exec cmd {} \\;</code> runs a command per file; <code>{} +</code> batches many files into one run. <code>xargs</code> turns stdin lines into arguments.'
      ],
      cmds: [
        ['find ~ -name "*.log"', 'Files ending in .log under home'],
        ['find /var/log -type f -size +10M', 'Files larger than 10 MB'],
        ['find /tmp -type f -mtime +7 -delete', 'Delete files older than 7 days'],
        ['find . -type f -name "*.sh" -exec chmod +x {} +', 'Make every .sh executable'],
        ['find . -name "*.txt" -print0 | xargs -0 wc -l', 'Count lines in every .txt safely'],
        ['locate sshd_config', 'Fast name search from a prebuilt index (plocate/mlocate)']
      ],
      flags: [['-name / -iname', 'Match name (case-insensitive with i)', 'find'], ['-type f|d|l', 'File, directory, symlink', 'find'], ['-size +N', 'Larger than N (k, M, G)', 'find'], ['-mtime +N', 'Modified more than N days ago', 'find'], ['-exec', 'Run a command on each match', 'find'], ['-print0 / -0', 'Null-separated, safe with spaces', 'find / xargs']],
      warn: ['Run a find without <code>-delete</code> first and read the list before deleting.']
    }
  ]
});

LV.sec({
  id: 'proc', title: 'Processes', icon: 'run', hue: 270,
  desc: 'What is running, signals, jobs and resource usage.',
  topics: [
    {
      id: 'ps', title: 'Processes, ps and top', sum: 'PIDs, parents, states and live views.',
      explain: [
        'Every running program is a <b>process</b> with a <b>PID</b>. Each one (except PID 1) has a parent: the process that started it. On systemd distros PID 1 is <code>systemd</code>.',
        'States you will see: <b>R</b> running, <b>S</b> sleeping, <b>D</b> uninterruptible I/O wait, <b>T</b> stopped, <b>Z</b> zombie (finished, waiting for its parent to collect it).',
        '<code>ps aux</code> takes a snapshot. <code>top</code> and the friendlier <code>htop</code> refresh continuously.'
      ],
      anim: {
        nodes: [['s', 180, 30, 'PID 1 systemd', 'kernel'], ['sshd', 80, 110, 'sshd', 'proc'], ['nginx', 280, 110, 'nginx master', 'proc'], ['bash', 80, 190, 'bash (ssk)', 'user'], ['w1', 240, 190, 'worker', 'proc'], ['w2', 320, 190, 'worker', 'proc'], ['top', 80, 250, 'top', 'user']],
        edges: [['s', 'sshd'], ['s', 'nginx'], ['sshd', 'bash'], ['nginx', 'w1'], ['nginx', 'w2'], ['bash', 'top']],
        hide: ['top'],
        steps: [
          { t: 'The kernel starts PID 1, systemd. Everything descends from it.', hi: ['s'] },
          { t: 'systemd starts services like sshd and nginx.', hi: ['sshd', 'nginx'], flow: [['s', 'sshd'], ['s', 'nginx']] },
          { t: 'nginx forks worker processes to handle requests.', hi: ['w1', 'w2'], flow: [['nginx', 'w1'], ['nginx', 'w2']] },
          { t: 'When you log in over SSH, sshd spawns your bash shell.', hi: ['bash'], flow: [['sshd', 'bash']] },
          { t: 'Each command you run becomes a child of bash. pstree draws exactly this.', show: ['top'], hi: ['top'], flow: [['bash', 'top']] }
        ]
      },
      cmds: [
        ['ps aux', 'Every process with user, CPU, memory', 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.3 167744 12880 ?        Ss   09:00   0:02 /sbin/init\nroot       812  0.0  0.2  15432  8920 ?        Ss   09:00   0:00 sshd: /usr/sbin/sshd -D\nwww-data  1024  0.1  0.4  55280 16540 ?        S    09:01   0:03 nginx: worker process\nssk       2210  0.0  0.1  10032  5320 pts/0    Ss   10:12   0:00 -bash\nssk       2388  0.0  0.0  11212  3480 pts/0    R+   10:20   0:00 ps aux'],
        ['ps -ef --forest', 'Full list showing parent/child tree'],
        ['pstree -p', 'Process tree with PIDs', 'systemd(1)─┬─nginx(1020)─┬─nginx(1024)\n           │             └─nginx(1025)\n           ├─sshd(812)───sshd(2205)───bash(2210)───pstree(2390)\n           └─systemd-journal(301)'],
        ['pgrep -a nginx', 'Find PIDs by name', '1020 nginx: master process /usr/sbin/nginx\n1024 nginx: worker process\n1025 nginx: worker process'],
        ['top', 'Live view; press q to quit, M to sort by memory, P by CPU'],
        ['htop', 'Friendlier live view (install the htop package)']
      ],
      flags: [['aux', 'All users, user-oriented format, include no-TTY', 'ps'], ['-ef', 'Every process, full format', 'ps'], ['--forest', 'ASCII process tree', 'ps'], ['-a', 'Show full command line', 'pgrep'], ['-u user', 'Only that user\'s processes', 'ps, pgrep, top']],
      demo: ['ps aux', 'pstree -p']
    },
    {
      id: 'signals', title: 'Signals & kill', sum: 'TERM, KILL, HUP, STOP and CONT.',
      explain: [
        'A <b>signal</b> is a small notification sent to a process. <code>kill</code> sends one; despite the name, the default is the polite <b>SIGTERM</b> (15).',
        'SIGTERM lets a program clean up and exit. <b>SIGKILL</b> (9) is handled by the kernel and cannot be caught, so data may be lost. Try TERM first, KILL only if it is stuck.',
        'Ctrl+C sends SIGINT (2), Ctrl+Z sends SIGTSTP (20). <b>SIGHUP</b> (1) traditionally asks a daemon to reload its config.'
      ],
      table: { head: ['Signal', 'No.', 'Default effect', 'Catchable'], rows: [['SIGHUP', '1', 'Terminate / reload by convention', 'Yes'], ['SIGINT', '2', 'Interrupt (Ctrl+C)', 'Yes'], ['SIGKILL', '9', 'Kill immediately', 'No'], ['SIGTERM', '15', 'Terminate politely', 'Yes'], ['SIGSTOP', '19', 'Pause', 'No'], ['SIGCONT', '18', 'Resume', 'Yes']] },
      cmds: [
        ['kill 2388', 'Send SIGTERM to PID 2388'],
        ['kill -9 2388', 'Force-kill PID 2388 (SIGKILL)'],
        ['kill -HUP 1020', 'Ask nginx master to reload config'],
        ['pkill -f "python3 server.py"', 'Signal by matching the full command line'],
        ['killall firefox', 'Signal every process named firefox'],
        ['kill -l', 'List signal names', ' 1) SIGHUP\t 2) SIGINT\t 3) SIGQUIT\t 4) SIGILL\t 5) SIGTRAP\n 6) SIGABRT\t 7) SIGBUS\t 8) SIGFPE\t 9) SIGKILL\t10) SIGUSR1\n11) SIGSEGV\t12) SIGUSR2\t13) SIGPIPE\t14) SIGALRM\t15) SIGTERM']
      ],
      flags: [['-9 / -KILL', 'Uncatchable kill', 'kill'], ['-15 / -TERM', 'Polite terminate (default)', 'kill'], ['-STOP / -CONT', 'Pause / resume', 'kill'], ['-f', 'Match full command line', 'pkill, pgrep'], ['-l', 'List signals', 'kill']],
      live: 'signals',
      demo: ['kill -l']
    },
    {
      id: 'jobs', title: 'Jobs: bg, fg, nohup', sum: 'Run things in the background.',
      explain: [
        'Add <code>&amp;</code> to start a command in the background. <code>jobs</code> lists them, <code>fg %1</code> brings job 1 back, and Ctrl+Z then <code>bg</code> moves a running job to the background.',
        'Background jobs die when you close the terminal. <code>nohup cmd &amp;</code> survives logout, and terminal multiplexers like <b>tmux</b> keep whole sessions alive.'
      ],
      cmds: [
        ['sleep 300 &', 'Start a job in the background', '[1] 2412'],
        ['jobs', 'List background jobs', '[1]+  Running                 sleep 300 &'],
        ['fg %1', 'Bring job 1 to the foreground'],
        ['bg %1', 'Resume a stopped job in the background'],
        ['nohup ./backup.sh > backup.log 2>&1 &', 'Keep running after logout'],
        ['tmux new -s work', 'Start a named tmux session (detach with Ctrl+B then D)'],
        ['tmux attach -t work', 'Reattach to the session']
      ]
    },
    {
      id: 'resources', title: 'Memory, CPU & disk usage', sum: 'free, uptime, df, du, vmstat.',
      explain: [
        '<code>free -h</code> shows memory. Do not panic at low "free": Linux uses spare RAM as disk cache. Watch the <b>available</b> column instead.',
        '<b>Load average</b> in <code>uptime</code> is the average number of runnable processes over 1, 5 and 15 minutes. Compare it with your CPU count from <code>nproc</code>.',
        '<code>df -h</code> shows free space per filesystem; <code>du -sh</code> shows how much a directory uses.'
      ],
      cmds: [
        ['free -h', 'Memory and swap in human units', '               total        used        free      shared  buff/cache   available\nMem:           7.7Gi       2.1Gi       1.2Gi       180Mi       4.4Gi       5.3Gi\nSwap:          2.0Gi          0B       2.0Gi'],
        ['uptime', 'Uptime and load average', ' 10:21:07 up  1:21,  1 user,  load average: 0.32, 0.41, 0.38'],
        ['nproc', 'Number of CPU threads', '4'],
        ['df -h', 'Disk free per filesystem', 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda2        59G   21G   35G  38% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm\n/dev/sda1       1.1G  6.2M  1.1G   1% /boot/efi'],
        ['du -sh /var/log', 'Total size of a directory', '412M\t/var/log'],
        ['du -h --max-depth=1 ~ | sort -h', 'Biggest folders in home'],
        ['vmstat 1 3', 'CPU, memory and I/O every second, 3 times']
      ],
      flags: [['-h', 'Human-readable units', 'free, df, du'], ['-s', 'Summary total only', 'du'], ['--max-depth=N', 'Limit recursion depth', 'du'], ['-T', 'Show filesystem type', 'df']],
      live: 'load',
      demo: ['free -h', 'uptime', 'df -h']
    }
  ]
});

LV.sec({
  id: 'pkg', title: 'Packages & software', icon: 'download', hue: 25,
  desc: 'apt, dnf, pacman, zypper, plus Snap, Flatpak and AppImage.',
  topics: [
    {
      id: 'pkgmgr', title: 'Package managers', sum: 'Same jobs, four tools — translated side by side.',
      explain: [
        'A <b>package manager</b> installs software from trusted <b>repositories</b>, resolves <b>dependencies</b>, verifies signatures and handles updates.',
        'Each family has a high-level tool (apt, dnf, pacman, zypper) on top of a low-level one (dpkg, rpm). Use the high-level tool day to day.',
        'Pick a task in the Live tab to see the exact command for every distro.'
      ],
      anim: {
        nodes: [['you', 50, 40, 'sudo apt install nginx', 'user'], ['meta', 180, 40, 'Read repo metadata', 'file'], ['dep', 310, 40, 'Resolve dependencies', 'proc'], ['dl', 310, 140, 'Download .deb files', 'hw'], ['sig', 180, 140, 'Verify signatures', 'kernel'], ['inst', 50, 140, 'dpkg unpacks + configures', 'proc'], ['done', 50, 230, 'nginx installed', 'user']],
        edges: [['you', 'meta'], ['meta', 'dep'], ['dep', 'dl'], ['dl', 'sig'], ['sig', 'inst'], ['inst', 'done']],
        steps: [
          { t: 'You ask apt to install nginx.', hi: ['you'] },
          { t: 'apt reads the package lists fetched by apt update.', hi: ['meta'], flow: [['you', 'meta']] },
          { t: 'It works out every library nginx needs that is not installed yet.', hi: ['dep'], flow: [['meta', 'dep']] },
          { t: 'All required packages are downloaded from the mirror.', hi: ['dl'], flow: [['dep', 'dl']] },
          { t: 'Repository signatures are verified so tampered packages are rejected.', hi: ['sig'], flow: [['dl', 'sig']] },
          { t: 'dpkg unpacks files and runs setup scripts; systemd may start the service.', hi: ['inst', 'done'], flow: [['sig', 'inst'], ['inst', 'done']] }
        ]
      },
      table: { head: ['Task', 'apt', 'dnf', 'pacman', 'zypper'], rows: [
        ['Refresh lists', 'apt update', 'dnf makecache', 'pacman -Sy', 'zypper refresh'],
        ['Install', 'apt install x', 'dnf install x', 'pacman -S x', 'zypper install x'],
        ['Remove', 'apt remove x', 'dnf remove x', 'pacman -R x', 'zypper remove x'],
        ['Upgrade all', 'apt upgrade', 'dnf upgrade', 'pacman -Syu', 'zypper update'],
        ['Search', 'apt search x', 'dnf search x', 'pacman -Ss x', 'zypper search x'],
        ['Info', 'apt show x', 'dnf info x', 'pacman -Si x', 'zypper info x'],
        ['Owner of file', 'dpkg -S /path', 'rpm -qf /path', 'pacman -Qo /path', 'rpm -qf /path']
      ] },
      cmds: [
        ['sudo apt update', 'Refresh package lists (Debian/Ubuntu/Mint)', 'Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease\nGet:2 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]\nFetched 126 kB in 1s (98.2 kB/s)\nReading package lists... Done\nBuilding dependency tree... Done\n4 packages can be upgraded. Run \'apt list --upgradable\' to see them.', 'Debian/Ubuntu'],
        ['sudo apt install nginx', 'Install a package', 'Reading package lists... Done\nThe following NEW packages will be installed:\n  nginx nginx-common\n0 upgraded, 2 newly installed, 0 to remove and 4 not upgraded.\nSetting up nginx (1.24.0-2ubuntu7) ...', 'Debian/Ubuntu'],
        ['sudo apt full-upgrade', 'Upgrade all, allowing package removals when needed', null, 'Debian/Ubuntu'],
        ['sudo apt autoremove', 'Remove dependencies nothing needs any more', null, 'Debian/Ubuntu'],
        ['sudo dnf install nginx', 'Install on Fedora/RHEL', null, 'Fedora/RHEL'],
        ['sudo dnf upgrade --refresh', 'Refresh metadata and upgrade everything', null, 'Fedora/RHEL'],
        ['dnf history', 'List past transactions (undo with dnf history undo N)', null, 'Fedora/RHEL'],
        ['sudo pacman -Syu', 'Full system upgrade on Arch (never partial)', null, 'Arch'],
        ['sudo pacman -S nginx', 'Install on Arch', null, 'Arch'],
        ['sudo zypper install nginx', 'Install on openSUSE', null, 'openSUSE'],
        ['sudo zypper dup', 'Distribution upgrade (Tumbleweed updates this way)', null, 'openSUSE'],
        ['apt list --installed | wc -l', 'Count installed packages', '1734', 'Debian/Ubuntu']
      ],
      live: 'pkg',
      demo: ['sudo apt update', 'sudo apt install nginx'],
      warn: ['On Arch, never run <code>pacman -Sy x</code> on its own. Installing after a refresh without upgrading creates a partial upgrade that can break libraries. Use <code>pacman -Syu x</code>.'],
      tips: ['AUR helpers such as yay are third-party tools, not part of Arch. Read the PKGBUILD before installing from the AUR.']
    },
    {
      id: 'universal', title: 'Snap, Flatpak & AppImage', sum: 'Distro-independent app formats.',
      explain: [
        '<b>Flatpak</b> runs desktop apps in a sandbox with shared runtimes. Flathub is the main repository and works on almost every distro.',
        '<b>Snap</b> is Canonical\'s format, preinstalled on Ubuntu. Snaps update automatically in the background and can package servers as well as desktop apps.',
        '<b>AppImage</b> is a single file: mark it executable and run it. Nothing is installed, and there is no automatic update unless the app provides one.'
      ],
      table: { head: ['', 'Flatpak', 'Snap', 'AppImage'], rows: [['Sandbox', 'Yes (portals)', 'Yes (confinement)', 'No by default'], ['Auto-update', 'Via flatpak update', 'Automatic', 'App-specific'], ['Main store', 'Flathub', 'Snap Store', 'None (download)'], ['Default on', 'Fedora, Mint', 'Ubuntu', '—']] },
      cmds: [
        ['flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo', 'Add the Flathub repository'],
        ['flatpak install flathub org.gimp.GIMP', 'Install an app from Flathub'],
        ['flatpak update', 'Update all Flatpaks'],
        ['flatpak list', 'List installed Flatpaks'],
        ['snap find vlc', 'Search the Snap Store'],
        ['sudo snap install vlc', 'Install a snap'],
        ['snap list', 'List installed snaps'],
        ['chmod +x MyApp.AppImage', 'Make an AppImage executable'],
        ['./MyApp.AppImage', 'Run it']
      ]
    }
  ]
});

LV.tool({
  grep: { syntax: 'grep [OPTION]... PATTERNS [FILE]...', desc: 'Print lines that match patterns.' },
  sed: { syntax: 'sed [OPTION]... SCRIPT [FILE]...', desc: 'Stream editor for filtering and transforming text.' },
  awk: { syntax: "awk [-F sep] 'program' [FILE]...", desc: 'Pattern scanning and text processing language.' },
  cut: { syntax: 'cut OPTION... [FILE]...', desc: 'Remove sections from each line of files.' },
  sort: { syntax: 'sort [OPTION]... [FILE]...', desc: 'Sort lines of text files.' },
  uniq: { syntax: 'uniq [OPTION]... [INPUT [OUTPUT]]', desc: 'Report or omit repeated adjacent lines.' },
  wc: { syntax: 'wc [OPTION]... [FILE]...', desc: 'Print newline, word and byte counts.' },
  head: { syntax: 'head [OPTION]... [FILE]...', desc: 'Output the first part of files.' },
  tail: { syntax: 'tail [OPTION]... [FILE]...', desc: 'Output the last part of files.' },
  find: { syntax: 'find [PATH...] [EXPRESSION]', desc: 'Search for files in a directory hierarchy.' },
  xargs: { syntax: 'xargs [OPTION]... COMMAND', desc: 'Build and execute command lines from standard input.' },
  tee: { syntax: 'tee [OPTION]... [FILE]...', desc: 'Read stdin and write to stdout and files.' },
  ps: { syntax: 'ps [OPTIONS]', desc: 'Report a snapshot of the current processes.' },
  kill: { syntax: 'kill [-SIGNAL] PID...', desc: 'Send a signal to a process.' },
  pkill: { syntax: 'pkill [OPTIONS] PATTERN', desc: 'Signal processes by name or attributes.' },
  top: { syntax: 'top', desc: 'Display Linux processes, live.' },
  free: { syntax: 'free [OPTIONS]', desc: 'Display amount of free and used memory.' },
  df: { syntax: 'df [OPTION]... [FILE]...', desc: 'Report filesystem disk space usage.' },
  du: { syntax: 'du [OPTION]... [FILE]...', desc: 'Estimate file space usage.' },
  apt: { syntax: 'apt [options] command', desc: 'High-level package manager for Debian, Ubuntu and Mint.' },
  dnf: { syntax: 'dnf [options] command', desc: 'Package manager for Fedora and the RHEL family.' },
  pacman: { syntax: 'pacman <operation> [options] [targets]', desc: 'Package manager for Arch Linux.' },
  zypper: { syntax: 'zypper [options] command', desc: 'Package manager for openSUSE.' },
  flatpak: { syntax: 'flatpak [OPTION...] COMMAND', desc: 'Build, install and run sandboxed desktop apps.' },
  snap: { syntax: 'snap <command> [options]', desc: 'Install and manage snap packages.' }
});
