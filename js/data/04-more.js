/* More content: archives, finding files, editors, diff, priority, kernel, transfer, web server, checksums,
   hardening, environment, functions, plus a new section for git, containers and tmux. */

LV.add('files', [
  {
    id: 'archives', title: 'Archives & compression', sum: 'tar bundles, gzip shrinks, zip does both.',
    explain: [
      'An <b>archive</b> packs many files and folders into one file. <b>Compression</b> makes that file smaller. On Linux these are two jobs: <code>tar</code> archives, <code>gzip</code> (or xz, bzip2, zstd) compresses, and <code>.tar.gz</code> simply means both were done.',
      'Remember the tar letters: <code>c</code> create, <code>x</code> extract, <code>t</code> list, <code>z</code> gzip, <code>v</code> show files, and <code>f</code> file name. The <code>f</code> goes last because the archive name comes straight after it.',
      '<code>zip</code> and <code>unzip</code> are handy when you share files with Windows or macOS users.'
    ],
    terms: [['tar', 'Tape ARchiver: bundles files and folders into one file'], ['.tar.gz / .tgz', 'A tar archive compressed with gzip'], ['xz', 'Slower but smaller compression, used for .tar.xz'], ['zip', 'Archive and compression in one format that works on every OS']],
    table: { head: ['Format', 'Create', 'Extract'], rows: [['.tar.gz', 'tar -czf out.tar.gz dir', 'tar -xzf out.tar.gz'], ['.tar.xz', 'tar -cJf out.tar.xz dir', 'tar -xJf out.tar.xz'], ['.zip', 'zip -r out.zip dir', 'unzip out.zip'], ['.gz (one file)', 'gzip file', 'gunzip file.gz']] },
    anim: {
      nodes: [['d', 90, 40, 'website/ folder', 'file'], ['t', 270, 40, 'tar: one bundle', 'proc'], ['g', 270, 120, 'gzip: smaller', 'kernel'], ['o', 90, 120, 'site.tar.gz', 'file'], ['x', 90, 200, 'tar -xzf: unpack', 'proc'], ['r', 270, 200, 'Files restored', 'file']],
      edges: [['d', 't'], ['t', 'g'], ['g', 'o'], ['o', 'x'], ['x', 'r']],
      steps: [
        { t: 'You have a folder with many files.', hi: ['d'] },
        { t: 'tar bundles them into a single stream. Nothing is smaller yet.', hi: ['d', 't'], flow: [['d', 't']] },
        { t: 'gzip compresses the bundle. The result is one small .tar.gz file.', hi: ['g', 'o'], flow: [['t', 'g'], ['g', 'o']] },
        { t: 'Later, tar -xzf reverses both steps and restores the files.', hi: ['x', 'r'], flow: [['o', 'x'], ['x', 'r']] }
      ]
    },
    cmds: [
      ['tar -czf site.tar.gz website', 'Create a gzip-compressed archive of a folder'],
      ['tar -tzf site.tar.gz', 'List what is inside without extracting', 'website/\nwebsite/index.html\nwebsite/notes.txt\nwebsite/css/\nwebsite/css/style.css'],
      ['tar -xzf site.tar.gz -C /tmp', 'Extract into /tmp instead of the current folder'],
      ['gzip notes.txt', 'Compress one file (it becomes notes.txt.gz)'],
      ['gunzip notes.txt.gz', 'Decompress it again'],
      ['zip -r site.zip website', 'Create a zip archive of a folder', '  adding: website/ (stored 0%)\n  adding: website/index.html (deflated 21%)\n  adding: website/notes.txt (deflated 18%)'],
      ['unzip site.zip -d out', 'Extract a zip archive into the folder out', 'Archive:  site.zip\n   creating: out/website/\n  inflating: out/website/index.html\n  inflating: out/website/notes.txt']
    ],
    flags: [['-c / -x / -t', 'Create / extract / list', 'tar'], ['-z', 'Use gzip', 'tar'], ['-f file', 'The archive file name (put it last)', 'tar'], ['-C dir', 'Change to dir first, so files extract there', 'tar'], ['-v', 'Show each file as it is processed', 'tar'], ['-r', 'Include folders and their contents', 'zip']],
    tips: ['Always list an unknown archive with <code>tar -tzf</code> first. It shows whether files will unpack into one folder or all over the current one.'],
    warn: ['Extracting overwrites files that already have the same name, and never undoes itself. Extract into an empty folder with -C when unsure.'],
    demo: ['tar -czf site.tar.gz website', 'tar -tzf site.tar.gz']
  },
  {
    id: 'locating', title: 'Finding commands & files', sum: 'which, type, whereis, locate and find.',
    explain: [
      '<code>which</code> prints the path of the program that will run when you type a name. <code>type</code> goes further: it tells you if the name is an alias, a shell builtin, a function or a file. <code>whereis</code> also lists the manual page and source.',
      '<code>locate</code> searches a pre-built database, so it answers instantly but can miss files created today (run <code>sudo updatedb</code> to refresh). <code>find</code> searches the real disk, which is slower but always up to date and can filter by size, age and owner.'
    ],
    table: { head: ['Tool', 'Searches', 'Speed'], rows: [['which / type', 'Programs in $PATH, aliases, builtins', 'Instant'], ['whereis', 'Binary, source and man page', 'Instant'], ['locate', 'Database of file names', 'Very fast, may be stale'], ['find', 'The live filesystem', 'Slower, always current']] },
    cmds: [
      ['which ls', 'Path of the program that runs', '/usr/bin/ls'],
      ['type cd', 'Is it a builtin, alias or file?', 'cd is a shell builtin'],
      ['whereis ls', 'Binary and manual page locations', 'ls: /usr/bin/ls /usr/share/man/man1/ls.1.gz'],
      ['locate nginx.conf', 'Fast file name search from the database', '/etc/nginx/nginx.conf'],
      ['sudo updatedb', 'Rebuild the locate database'],
      ['find ~ -name "*.log" -mtime -7', 'Log files changed in the last 7 days', '/home/ssk/website/logs/access.log'],
      ['command -v git', 'Portable test for whether a program exists', '/usr/bin/git']
    ],
    flags: [['-name pat', 'Match the file name (quote the pattern)', 'find'], ['-mtime -7', 'Modified in the last 7 days', 'find'], ['-i', 'Ignore case', 'locate'], ['-a', 'All matches (binary, source, man)', 'whereis']],
    tips: ['If a command works for root but not for you, run <code>which name</code> as both users. The two $PATH lists may differ.']
  }
]);

LV.add('text', [
  {
    id: 'editors', title: 'Editors: nano and vim', sum: 'Edit files inside the terminal.',
    explain: [
      '<b>nano</b> is the friendly one. The shortcuts are printed at the bottom of the screen, and <code>^</code> means Ctrl. Ctrl+O saves ("write out") and Ctrl+X exits.',
      '<b>vim</b> is on almost every server and is <i>modal</i>: the keys do different things depending on the mode. <b>Normal</b> mode moves and edits, <b>Insert</b> mode types text, <b>Command</b> mode (after <code>:</code>) saves and quits.',
      'Stuck in vim? Press <b>Esc</b>, then type <code>:q!</code> and Enter to leave without saving, or <code>:wq</code> to save and leave.'
    ],
    terms: [['Normal mode', 'The default in vim: keys are commands'], ['Insert mode', 'Typing inserts text; press Esc to leave'], ['Command mode', 'Starts with : and runs things like :w and :q'], ['EDITOR', 'Variable that tells programs which editor to open']],
    table: { head: ['Vim keys', 'What they do'], rows: [['i', 'Insert before the cursor'], ['Esc', 'Back to Normal mode'], [':w  :q  :wq', 'Save, quit, save and quit'], [':q!', 'Quit and throw away changes'], ['dd', 'Delete (cut) the line'], ['yy  p', 'Copy the line, paste it'], ['/word', 'Search; n finds the next match'], ['u', 'Undo']] },
    anim: {
      nodes: [['n', 180, 40, 'Normal mode', 'kernel'], ['i', 90, 130, 'Insert mode', 'user'], ['c', 270, 130, 'Command mode :', 'proc'], ['s', 180, 210, 'File saved', 'file']],
      edges: [['n', 'i'], ['i', 'n'], ['n', 'c'], ['c', 's']],
      steps: [
        { t: 'vim starts in Normal mode. Keys move the cursor and run commands. Typing letters does not insert them yet.', hi: ['n'] },
        { t: 'Press i to enter Insert mode. Now what you type goes into the file.', hi: ['i'], flow: [['n', 'i']] },
        { t: 'Press Esc to return to Normal mode.', hi: ['n'], flow: [['i', 'n']] },
        { t: 'Press : to open Command mode and type wq. Enter writes the file and quits.', hi: ['c', 's'], flow: [['n', 'c'], ['c', 's']] }
      ]
    },
    cmds: [
      ['nano notes.txt', 'Open in nano (Ctrl+O saves, Ctrl+X exits)'],
      ['vim notes.txt', 'Open in vim (i to type, Esc then :wq to save)'],
      ['vimtutor', 'A 30-minute interactive vim lesson'],
      ['sudoedit /etc/hosts', 'Edit a root-owned file safely as your own user'],
      ['export EDITOR=nano', 'Make nano the editor that other tools open'],
      ['less notes.txt', 'Just read: q quits, / searches, space pages down']
    ],
    tips: ['Not sure which to learn? Start with nano today. Learn the five vim keys in the table above so you can survive on any server.']
  },
  {
    id: 'diffpatch', title: 'Comparing files: diff & patch', sum: 'See exactly what changed, then apply it elsewhere.',
    explain: [
      '<code>diff</code> compares two files line by line. The unified format (<code>-u</code>) is the one humans and tools like git use: lines beginning with <code>-</code> were removed, lines with <code>+</code> were added, and the rest are context.',
      '<code>patch</code> reads a diff and applies it to files, so you can send someone only the changes. <code>-p1</code> strips the first folder from the paths in the patch.'
    ],
    code: '--- old.txt\n+++ new.txt\n@@ -1,3 +1,3 @@\n host=example.com\n-port=80\n+port=8080\n debug=false',
    cmds: [
      ['diff old.txt new.txt', 'Show the differences', '2c2\n< port=80\n---\n> port=8080'],
      ['diff -u old.txt new.txt', 'Unified format, used for patches', '--- old.txt\t2025-11-05 09:00:00.000000000 +0000\n+++ new.txt\t2025-11-05 09:05:00.000000000 +0000\n@@ -1,3 +1,3 @@\n host=example.com\n-port=80\n+port=8080\n debug=false'],
      ['diff -r site_old site_new', 'Compare two folders recursively', 'diff -r site_old/index.html site_new/index.html\n2c2\n< <h1>Hello</h1>\n---\n> <h1>Hello, world</h1>'],
      ['diff -q a.txt b.txt', 'Only say whether they differ', 'Files a.txt and b.txt differ'],
      ['diff -u old.txt new.txt > fix.patch', 'Save the changes as a patch file'],
      ['patch old.txt < fix.patch', 'Apply the patch to old.txt', 'patching file old.txt'],
      ['patch -p1 < fix.patch', 'Apply a patch made from a project root', 'patching file index.html'],
      ['cmp a.bin b.bin', 'First byte where two binary files differ', 'a.bin b.bin differ: byte 17, line 1']
    ],
    flags: [['-u', 'Unified output', 'diff'], ['-r', 'Recurse into folders', 'diff'], ['-q', 'Brief: only report if different', 'diff'], ['-p1', 'Strip one leading folder from patch paths', 'patch'], ['-R', 'Reverse a patch (undo it)', 'patch']],
    tips: ['Try the patch with <code>patch --dry-run -p1 &lt; fix.patch</code> first. It shows what would happen without touching a file.']
  }
]);

LV.add('proc', [
  {
    id: 'nice', title: 'Priority: nice & renice', sum: 'Decide who gets CPU time first.',
    explain: [
      'Every process has a <b>niceness</b> from -20 to 19. The lower the number, the higher the priority ("less nice"). The default is 0. A nicer process (higher number) politely lets others go first.',
      'Normal users can only make their own processes <i>nicer</i>. Only root can lower niceness. Use it for heavy background jobs such as backups and compiles so the machine stays responsive. <code>ionice</code> does the same for disk access.'
    ],
    terms: [['niceness (NI)', 'Priority hint from -20 (first) to 19 (last)'], ['scheduler', 'Kernel part that chooses which process runs next'], ['ionice', 'Sets priority for disk reads and writes']],
    anim: {
      nodes: [['a', 90, 40, 'Job A: nice 0', 'proc'], ['b', 270, 40, 'Job B: nice 15', 'proc'], ['s', 180, 125, 'Scheduler', 'kernel'], ['c', 180, 210, 'CPU time', 'hw']],
      edges: [['a', 's'], ['b', 's'], ['s', 'c']],
      steps: [
        { t: 'Two jobs both want the CPU. Job A has nice 0, job B has nice 15.', hi: ['a', 'b'] },
        { t: 'Both ask the scheduler for time.', hi: ['s'], flow: [['a', 's'], ['b', 's']] },
        { t: 'The scheduler gives job A a much larger share, because B is nicer.', hi: ['s', 'c'], flow: [['s', 'c']] },
        { t: 'You can change a running job with renice. B at a lower number would get more time.', hi: ['b'] }
      ]
    },
    cmds: [
      ['nice -n 10 ./backup.sh', 'Start a script with a lower priority', 'Backing up ~/website...\nSaved website-backup.tar.gz'],
      ['renice -n 5 -p 2410', 'Change a running process (use its PID)', '2410 (process ID) old priority 0, new priority 5'],
      ['ps -o pid,ni,comm -p 2410', 'Show the niceness of a process', '    PID  NI COMMAND\n   2410   5 backup.sh'],
      ['sudo renice -n -5 -p 2410', 'Raise priority (root only)', '2410 (process ID) old priority 5, new priority -5'],
      ['ionice -c3 -p 2410', 'Give its disk access idle priority'],
      ['top', 'The NI column shows each process niceness']
    ],
    flags: [['-n N', 'Niceness value to use', 'nice, renice'], ['-p PID', 'Which running process', 'renice, ionice'], ['-c3', 'Idle I/O class', 'ionice']],
    note: 'Niceness is a hint, not a guarantee. On a quiet machine every process gets all the CPU it needs.'
  }
]);

LV.add('systemd', [
  {
    id: 'kernel', title: 'Kernel & modules', sum: 'Drivers you can load and unload while running.',
    explain: [
      'The <b>kernel</b> talks to the hardware. Many drivers are <b>modules</b> (<code>.ko</code> files) that are loaded only when needed. <code>lsmod</code> lists the loaded ones; <code>modprobe</code> loads or removes one and takes care of its dependencies.',
      '<code>dmesg</code> prints the kernel\'s own messages: new hardware, disk errors, network links coming up. It is the first place to look when a device misbehaves. The boot parameters you started with are in <code>/proc/cmdline</code>.'
    ],
    terms: [['module', 'A driver or feature loaded into the running kernel'], ['dmesg', 'The kernel message buffer'], ['/proc, /sys', 'Virtual folders that expose kernel and hardware information'], ['/dev', 'Device files that programs use to talk to hardware']],
    anim: {
      nodes: [['hw', 90, 40, 'Hardware: network card', 'hw'], ['m', 270, 40, 'Module: e1000e', 'kernel'], ['k', 180, 125, 'Kernel core', 'kernel'], ['d', 90, 210, 'Interface eth0', 'file'], ['u', 270, 210, 'Your programs', 'user']],
      edges: [['hw', 'm'], ['m', 'k'], ['k', 'd'], ['d', 'u']],
      steps: [
        { t: 'The kernel detects a new network card on the PCI bus.', hi: ['hw'] },
        { t: 'It loads the matching driver module (modprobe does this automatically).', hi: ['m'], flow: [['hw', 'm']] },
        { t: 'The module registers itself with the kernel core.', hi: ['k'], flow: [['m', 'k']] },
        { t: 'A device (eth0) appears and programs can now use the network.', hi: ['d', 'u'], flow: [['k', 'd'], ['d', 'u']] }
      ]
    },
    cmds: [
      ['uname -r', 'Running kernel version', '6.8.0-45-generic'],
      ['lsmod | head -n 4', 'Loaded modules', 'Module                  Size  Used by\nnvme                   57344  3\nnvme_core             184320  4 nvme\next4                1036288  1'],
      ['modinfo ext4', 'Describe a module', 'filename:       /lib/modules/6.8.0-45-generic/kernel/fs/ext4/ext4.ko.zst\nsoftdep:        pre: crc32c\nlicense:        GPL\ndescription:    Fourth Extended Filesystem'],
      ['sudo modprobe loop', 'Load a module and its dependencies'],
      ['sudo modprobe -r loop', 'Unload a module'],
      ['dmesg | tail -n 3', 'Latest kernel messages', '[    3.412118] EXT4-fs (sda1): mounted filesystem with ordered data mode. Quota mode: none.\n[    6.021774] Adding 2097148k swap on /swapfile.  Priority:-2 extents:7 across:2097148k\n[   12.508311] IPv6: ADDRCONF(NETDEV_CHANGE): eth0: link becomes ready'],
      ['cat /proc/version', 'Kernel version and compiler', 'Linux version 6.8.0-45-generic (buildd@lcy02) gcc 13.2.0'],
      ['lspci | head -n 3', 'PCI devices', '00:00.0 Host bridge: Intel Corporation 440FX - 82441FX PMC [Natoma] (rev 02)\n00:01.0 ISA bridge: Intel Corporation 82371SB PIIX3 ISA [Natoma/Triton II]\n00:02.0 VGA compatible controller: Device 1234:1111 (rev 02)'],
      ['lsusb', 'USB devices', 'Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub']
    ],
    flags: [['-r', 'Remove (unload) a module', 'modprobe'], ['-T', 'Human-readable timestamps', 'dmesg'], ['-w', 'Follow new messages', 'dmesg']],
    warn: ['Unloading a module that is in use (for example your disk or network driver) can disconnect you. Check <code>lsmod</code> "Used by" first.']
  }
]);

LV.add('net', [
  {
    id: 'transfer', title: 'Copying files: scp & rsync', sum: 'Move files between machines over SSH.',
    explain: [
      '<code>scp</code> copies files over SSH with the same syntax as <code>cp</code>: <code>scp source user@host:destination</code>. Simple and fine for one-off copies.',
      '<code>rsync</code> is smarter. It compares both sides and only sends what changed, so repeat runs are fast and interrupted copies can resume. It is the standard tool for backups and mirrors.',
      'Mind the trailing slash: <code>rsync website/ dest/</code> copies the <i>contents</i> of website, while <code>rsync website dest/</code> creates <code>dest/website</code>.'
    ],
    terms: [['scp', 'Secure copy over SSH'], ['rsync', 'Copies only the differences between two folders'], ['sftp', 'An interactive file transfer session over SSH'], ['--delete', 'Also remove files at the destination that no longer exist at the source']],
    anim: {
      nodes: [['l', 90, 40, 'Local folder', 'file'], ['d', 270, 40, 'rsync: compare', 'proc'], ['s', 270, 125, 'SSH tunnel', 'kernel'], ['r', 270, 210, 'Remote folder', 'file']],
      edges: [['l', 'd'], ['d', 's'], ['s', 'r']],
      steps: [
        { t: 'rsync reads the local folder and the remote folder and compares them.', hi: ['l', 'd'], flow: [['l', 'd']] },
        { t: 'Only new or changed files (or changed parts of big files) are selected.', hi: ['d'] },
        { t: 'The changes travel through an encrypted SSH connection.', hi: ['s'], flow: [['d', 's']] },
        { t: 'The remote folder now matches. A second run would send almost nothing.', hi: ['r'], flow: [['s', 'r']] }
      ]
    },
    cmds: [
      ['scp report.txt ssk@203.0.113.10:/tmp/', 'Copy a file to a server', 'report.txt                                  100%   41     0.2KB/s   00:00'],
      ['scp ssk@203.0.113.10:/var/log/syslog .', 'Copy a file from a server to here', 'syslog                                       100%  412KB   3.1MB/s   00:00'],
      ['scp -r website ssk@203.0.113.10:~/', 'Copy a whole folder', 'index.html                                   100%   70     0.5KB/s   00:00\nnotes.txt                                    100%   67     0.4KB/s   00:00\nstyle.css                                    100%   54     0.3KB/s   00:00'],
      ['rsync -avh website/ backup/', 'Sync a folder locally', 'sending incremental file list\n./\nindex.html\nnotes.txt\ncss/\ncss/style.css\n\nsent 1.02K bytes  received 92 bytes  2.23K bytes/sec\ntotal size is 612  speedup is 0.55'],
      ['rsync -avzn website/ ssk@203.0.113.10:~/website/', 'Dry run (-n): show what would be sent', 'sending incremental file list\nindex.html\nnotes.txt\n\nsent 120 bytes  received 28 bytes  296.00 bytes/sec\ntotal size is 612  speedup is 4.14 (DRY RUN)'],
      ['rsync -avz --delete website/ ssk@203.0.113.10:~/website/', 'Mirror: also delete extra files at the destination', 'sending incremental file list\ndeleting old-page.html\nindex.html\n\nsent 310 bytes  received 54 bytes  728.00 bytes/sec\ntotal size is 612  speedup is 1.68'],
      ['rsync -avz -e "ssh -p 2222" website/ ssk@203.0.113.10:~/website/', 'Use a different SSH port'],
      ['sftp ssk@203.0.113.10', 'Interactive transfer session (get, put, ls, bye)']
    ],
    flags: [['-a', 'Archive: keep permissions, times, links, recurse', 'rsync'], ['-v / -h', 'Verbose / human-readable sizes', 'rsync'], ['-z', 'Compress during transfer', 'rsync'], ['-n', 'Dry run, change nothing', 'rsync'], ['-r', 'Copy folders', 'scp'], ['-P port', 'Use another SSH port', 'scp']],
    warn: ['<code>--delete</code> removes files at the destination. Always run the same command with <code>-n</code> first and read the list.']
  },
  {
    id: 'webserver', title: 'A web server: nginx', sum: 'Serve a site and check that it works.',
    explain: [
      'A web server listens on port 80 (HTTP) and 443 (HTTPS) and sends back files. <b>nginx</b> is one of the most used. Its main file is <code>/etc/nginx/nginx.conf</code>; on Debian and Ubuntu each site lives in <code>sites-available</code> and is switched on by a link in <code>sites-enabled</code>.',
      'Safe change routine: edit, run <code>sudo nginx -t</code> to test the syntax, then <code>sudo systemctl reload nginx</code>, which applies the change without dropping visitors. Logs are in <code>/var/log/nginx/</code>.'
    ],
    code: 'server {\n    listen 80;\n    server_name example.com;\n    root /var/www/html;\n    index index.html;\n\n    location / {\n        try_files $uri $uri/ =404;\n    }\n}',
    terms: [['document root', 'The folder the site is served from (often /var/www/html)'], ['server block', 'The config section for one site'], ['reload', 'Re-read the config without stopping the service'], ['access.log / error.log', 'Every request / every problem']],
    anim: {
      nodes: [['b', 90, 40, 'Browser', 'user'], ['p', 270, 40, 'Port 80 / 443', 'kernel'], ['n', 270, 125, 'nginx', 'proc'], ['f', 270, 210, '/var/www/html', 'file'], ['r', 90, 210, 'Page in browser', 'user']],
      edges: [['b', 'p'], ['p', 'n'], ['n', 'f'], ['f', 'r']],
      steps: [
        { t: 'A browser asks for http://example.com/.', hi: ['b'] },
        { t: 'The request arrives on port 80 and the kernel hands it to nginx.', hi: ['p', 'n'], flow: [['b', 'p'], ['p', 'n']] },
        { t: 'nginx maps the URL to a file under the document root.', hi: ['f'], flow: [['n', 'f']] },
        { t: 'The file is sent back and the browser shows the page.', hi: ['r'], flow: [['f', 'r']] }
      ]
    },
    cmds: [
      ['sudo apt install nginx', 'Install it (Debian and Ubuntu)'],
      ['systemctl status nginx', 'Is it running?', '● nginx.service - A high performance web server and a reverse proxy server\n     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; preset: enabled)\n     Active: active (running) since Thu 2025-11-05 09:00:03 UTC; 1h ago'],
      ['sudo nginx -t', 'Test the configuration', 'nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful'],
      ['sudo systemctl reload nginx', 'Apply config changes without downtime'],
      ['curl -I http://localhost', 'Check the response headers', 'HTTP/1.1 200 OK\nServer: nginx/1.24.0 (Ubuntu)\nContent-Type: text/html\nContent-Length: 615'],
      ['sudo journalctl -u nginx -n 2', 'Last two log lines from the service', 'Nov 05 09:00:03 ubuntu systemd[1]: Starting nginx.service - A high performance web server...\nNov 05 09:00:03 ubuntu systemd[1]: Started nginx.service - A high performance web server...']
    ],
    flags: [['-t', 'Test configuration and exit', 'nginx'], ['-T', 'Test and print the whole configuration', 'nginx'], ['-I', 'Headers only', 'curl']],
    note: 'On Fedora and RHEL the package is also called nginx (<code>sudo dnf install nginx</code>) and site files go in <code>/etc/nginx/conf.d/</code> instead of sites-enabled.'
  }
]);

LV.add('sec', [
  {
    id: 'checksums', title: 'Checksums & GPG', sum: 'Prove a file is intact and who made it.',
    explain: [
      'A <b>checksum</b> (hash) is a short fingerprint of a file. Change one byte and the fingerprint changes completely. Download sites publish them so you can check that your copy is not damaged or tampered with.',
      'Prefer <code>sha256sum</code>. <code>md5sum</code> still catches accidental corruption, but it is broken against attackers. A checksum only proves the file matches the published value; a <b>GPG signature</b> also proves <i>who</i> published it.'
    ],
    terms: [['hash', 'A fixed-length fingerprint calculated from file contents'], ['SHA-256', 'A strong, widely used hash (64 hex characters)'], ['GPG', 'Tool for signing, verifying and encrypting with key pairs'], ['signature', 'Proof, made with a private key, that a file came from its owner']],
    anim: {
      nodes: [['f', 90, 40, 'Downloaded file', 'file'], ['h', 270, 40, 'sha256sum', 'proc'], ['p', 270, 125, 'Published checksum', 'kernel'], ['c', 180, 210, 'Compare: match = OK', 'user']],
      edges: [['f', 'h'], ['h', 'c'], ['p', 'c']],
      steps: [
        { t: 'You download a file and a published checksum from the project site.', hi: ['f', 'p'] },
        { t: 'sha256sum calculates the fingerprint of your copy.', hi: ['h'], flow: [['f', 'h']] },
        { t: 'You compare it with the published value.', hi: ['c'], flow: [['h', 'c'], ['p', 'c']] },
        { t: 'If they match, the file is intact. If not, delete it and download again.', hi: ['c'] }
      ]
    },
    cmds: [
      ['sha256sum report.txt', 'Print a SHA-256 checksum', '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b  report.txt'],
      ['sha256sum -c SHA256SUMS', 'Verify every file listed in a checksum file', 'report.txt: OK'],
      ['md5sum report.txt', 'Older, weaker hash (accidental damage only)', '5eb63bbbe01eeed093cb22bb8f5acdc3  report.txt'],
      ['gpg --list-keys', 'Keys on your keyring', '/home/ssk/.gnupg/pubring.kbx\n---------------------------\npub   ed25519 2025-01-10 [SC]\n      9F8E7D6C5B4A39281716F5E4D3C2B1A099887766\nuid           [ultimate] SSK <ssk@example.com>\nsub   cv25519 2025-01-10 [E]'],
      ['gpg --verify file.tar.gz.sig file.tar.gz', 'Check a download signature', 'gpg: Signature made Wed 05 Nov 2025 09:00:00 AM UTC\ngpg:                using EDDSA key 9F8E7D6C5B4A39281716F5E4D3C2B1A099887766\ngpg: Good signature from "SSK <ssk@example.com>" [ultimate]'],
      ['gpg --gen-key', 'Create your own key pair (interactive)'],
      ['gpg -c secret.txt', 'Encrypt with a passphrase; creates secret.txt.gpg']
    ],
    flags: [['-c file', 'Check sums listed in file', 'sha256sum'], ['--verify', 'Check a signature', 'gpg'], ['--list-keys', 'Show public keys', 'gpg'], ['-c', 'Symmetric (passphrase) encryption', 'gpg']],
    warn: ['A checksum copied from the <i>same</i> page you downloaded from only detects damage. If an attacker replaced the file, they could replace the checksum too. Verify the signature when one is offered.']
  },
  {
    id: 'hardening', title: 'Hardening checklist', sum: 'Small steps that make a server much safer.',
    explain: [
      'Security comes in layers. No single step is enough, but together these remove most of the easy attacks. Work down the list on every new server.',
      'The two highest-value changes are <b>keeping packages updated</b> and <b>logging in with SSH keys only</b>. Bots try passwords on every public server within minutes.'
    ],
    table: { head: ['Layer', 'What to do'], rows: [['Updates', 'Install security updates regularly or automatically'], ['Firewall', 'Deny incoming by default, allow only needed ports'], ['SSH', 'Keys only: PasswordAuthentication no, PermitRootLogin no'], ['Services', 'Remove or stop anything you do not use (ss -tulpn)'], ['Accounts', 'Least privilege: sudo for admins, lock unused accounts'], ['Monitoring', 'Read auth logs, use fail2ban to ban repeated failures'], ['Backups', 'Keep copies elsewhere and test restoring them']] },
    anim: {
      nodes: [['i', 180, 30, 'Internet', 'hw'], ['f', 180, 90, 'Firewall: few ports', 'kernel'], ['s', 180, 150, 'SSH: keys only', 'proc'], ['u', 180, 210, 'Least privilege', 'user'], ['l', 180, 270, 'Logs and bans', 'file']],
      edges: [['i', 'f'], ['f', 's'], ['s', 'u'], ['u', 'l']],
      steps: [
        { t: 'Anything on the internet can reach your public address.', hi: ['i'] },
        { t: 'Layer 1: the firewall drops everything except the ports you allow.', hi: ['f'], flow: [['i', 'f']] },
        { t: 'Layer 2: SSH only accepts keys, so password guessing is useless.', hi: ['s'], flow: [['f', 's']] },
        { t: 'Layer 3: even a logged-in user has only the rights they need.', hi: ['u'], flow: [['s', 'u']] },
        { t: 'Layer 4: logs and fail2ban show and block repeated attacks.', hi: ['l'], flow: [['u', 'l']] }
      ]
    },
    cmds: [
      ['sudo apt update && sudo apt upgrade -y', 'Install pending updates (Debian and Ubuntu)'],
      ['sudo ufw status verbose', 'Show the firewall rules', 'Status: active\nLogging: on (low)\nDefault: deny (incoming), allow (outgoing), disabled (routed)\nNew profiles: skip\n\nTo                         Action      From\n--                         ------      ----\n22/tcp                     ALLOW IN    Anywhere'],
      ['last -n 5', 'Recent logins', 'ssk      pts/0        203.0.113.7      Wed Nov  5 09:12   still logged in\nssk      pts/0        203.0.113.7      Tue Nov  4 18:02 - 19:40  (01:38)\nreboot   system boot  6.8.0-45-generic Tue Nov  4 08:00   still running\n\nwtmp begins Mon Nov  3 08:00:01 2025'],
      ['sudo journalctl -u ssh --since today | grep Failed', 'Password-guessing attempts today', 'Nov 05 08:41:02 ubuntu sshd[2210]: Failed password for invalid user admin from 198.51.100.23 port 51822 ssh2\nNov 05 08:41:05 ubuntu sshd[2212]: Failed password for invalid user test from 198.51.100.23 port 51840 ssh2'],
      ['sudo fail2ban-client status sshd', 'Who is currently banned', 'Status for the jail: sshd\n|- Filter\n|  |- Currently failed:\t1\n|  |- Total failed:\t24\n|  `- File list:\t/var/log/auth.log\n`- Actions\n   |- Currently banned:\t2\n   |- Total banned:\t5\n   `- Banned IP list:\t198.51.100.23 198.51.100.45'],
      ['sudo passwd -l olduser', 'Lock an account that should not log in', 'passwd: password expiry information changed.'],
      ['sudo sshd -T | grep -E "permitrootlogin|passwordauthentication"', 'Show the effective SSH settings (after hardening)', 'permitrootlogin no\npasswordauthentication no']
    ],
    warn: ['Before turning off SSH password login, open a <i>second</i> session and confirm your key works. Otherwise you can lock yourself out.']
  }
]);

LV.add('script', [
  {
    id: 'envvars', title: 'Environment & shell setup', sum: 'Variables, PATH, aliases and ~/.bashrc.',
    explain: [
      'An <b>environment variable</b> is a named value that programs inherit from the shell: <code>HOME</code>, <code>USER</code>, <code>PATH</code>, <code>EDITOR</code>. A plain <code>NAME=value</code> exists only in your shell; <code>export NAME=value</code> also passes it to the programs you start.',
      'Changes last only for the current terminal. To keep them, put the lines in <code>~/.bashrc</code> (for each new terminal) and run <code>source ~/.bashrc</code> to apply them now. <b>Aliases</b> are short names for longer commands.'
    ],
    code: '# ~/.bashrc\nexport EDITOR=nano\nexport PATH="$HOME/bin:$PATH"\nalias ll=\'ls -alF\'\nalias gs=\'git status\'',
    terms: [['export', 'Make a variable visible to child programs'], ['~/.bashrc', 'Read by every new interactive bash shell'], ['~/.profile', 'Read once when you log in'], ['alias', 'A shortcut for a longer command']],
    anim: {
      nodes: [['l', 90, 40, 'You log in', 'user'], ['p', 270, 40, '/etc/profile', 'file'], ['h', 270, 120, '~/.profile', 'file'], ['b', 90, 200, '~/.bashrc', 'file'], ['r', 270, 200, 'Prompt: ready', 'proc']],
      edges: [['l', 'p'], ['p', 'h'], ['h', 'b'], ['b', 'r']],
      steps: [
        { t: 'You log in. A login shell starts.', hi: ['l'] },
        { t: 'It first reads the system-wide settings in /etc/profile.', hi: ['p'], flow: [['l', 'p']] },
        { t: 'Then your own ~/.profile, which normally loads ~/.bashrc.', hi: ['h', 'b'], flow: [['p', 'h'], ['h', 'b']] },
        { t: 'Your variables, PATH and aliases are set and the prompt appears.', hi: ['r'], flow: [['b', 'r']] }
      ]
    },
    cmds: [
      ['printenv HOME', 'Show one variable', '/home/ssk'],
      ['echo $PATH', 'Where the shell looks for programs'],
      ['export EDITOR=nano', 'Set a variable for this shell and its children'],
      ['export PATH="$HOME/bin:$PATH"', 'Add your own folder to the front of PATH'],
      ['alias ll="ls -alF"', 'Create a shortcut for this session'],
      ['source ~/.bashrc', 'Apply changes you made in .bashrc now'],
      ['env | sort | head -n 3', 'The environment, sorted'],
      ['unset EDITOR', 'Remove a variable']
    ],
    tips: ['If an edit to .bashrc seems to do nothing, you probably forgot <code>source ~/.bashrc</code> (or opening a new terminal).']
  },
  {
    id: 'functions', title: 'Functions & arguments', sum: 'Reusable blocks, $1 $@ $#, trap and set -x.',
    explain: [
      'A script receives its arguments as <code>$1</code>, <code>$2</code> and so on. <code>$#</code> is how many there are and <code>"$@"</code> expands to all of them, each kept as a separate word. Always quote it.',
      'A <b>function</b> groups steps under a name: <code>name() { ... }</code>. Inside, <code>local</code> keeps variables private and <code>return</code> sets an exit code. <code>trap</code> runs a command when the script ends or is interrupted, which is ideal for cleanup.',
      'To debug, run with <code>set -x</code> (or <code>bash -x script.sh</code>), which prints every command before it runs.'
    ],
    code: '#!/usr/bin/env bash\nset -euo pipefail\n\ngreet() {\n  local name="${1:-world}"\n  echo "Hello, $name!"\n}\n\ncleanup() { echo "bye"; }\ntrap cleanup EXIT\n\ngreet "$@"\necho "Arguments: $#"',
    terms: [['$1 $2 …', 'Positional arguments'], ['"$@"', 'All arguments, each as its own word'], ['local', 'A variable that exists only inside the function'], ['trap', 'Run a command on exit or when a signal arrives']],
    cmds: [
      ['bash scripts/hello.sh Linux', 'Run a script and pass it one argument'],
      ['shellcheck scripts/hello.sh', 'Static checker for common script bugs'],
      ['declare -f', 'Print the functions defined in this shell'],
      ['set -x', 'Trace mode: print each command before it runs'],
      ['set +x', 'Turn trace mode off again'],
      ['help trap', 'Built-in help for trap']
    ],
    tips: ['Start every script with <code>set -euo pipefail</code>. It stops at the first error, rejects unset variables and catches failures inside pipes.']
  }
]);

/* ---------- New section: developer tools and containers ---------- */
LV.sec({
  id: 'dev', title: 'Dev tools & containers', icon: 'grid', hue: 150,
  desc: 'Git, containers and terminal sessions that survive disconnects.',
  topics: [
    {
      id: 'git', title: 'Git basics', sum: 'Track changes and share them.',
      explain: [
        '<b>Git</b> records snapshots (commits) of your project so you can see what changed, go back, and work on branches without breaking the main line. A change moves through three places: the <b>working folder</b>, the <b>staging area</b> (what you picked for the next commit) and the <b>repository</b> (saved history).',
        '<code>git add</code> stages, <code>git commit</code> saves, <code>git push</code> sends your commits to a shared remote such as example.com. <code>git status</code> is the command to run whenever you are unsure what is going on.'
      ],
      terms: [['commit', 'A saved snapshot with a message'], ['branch', 'A separate line of work (switch with git switch)'], ['staging area', 'The set of changes chosen for the next commit'], ['remote', 'A copy of the repository on a server']],
      anim: {
        nodes: [['w', 90, 40, 'Working folder', 'file'], ['s', 270, 40, 'Staging area', 'kernel'], ['r', 270, 125, 'Local repository', 'proc'], ['o', 90, 125, 'Remote server', 'hw']],
        edges: [['w', 's'], ['s', 'r'], ['r', 'o']],
        steps: [
          { t: 'You edit files in the working folder. git status shows them as modified.', hi: ['w'] },
          { t: 'git add moves chosen changes into the staging area.', hi: ['s'], flow: [['w', 's']] },
          { t: 'git commit saves the staged changes as a snapshot in the local repository.', hi: ['r'], flow: [['s', 'r']] },
          { t: 'git push sends the new commits to the remote so others can get them.', hi: ['o'], flow: [['r', 'o']] }
        ]
      },
      cmds: [
        ['git config --global user.name "SSK"', 'Set the name stored in your commits'],
        ['git init', 'Start tracking the current folder', 'Initialized empty Git repository in /home/ssk/website/.git/'],
        ['git status', 'What changed?', 'On branch main\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tmodified:   index.html\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\tabout.html\n\nno changes added to commit (use "git add" and/or "git commit -a")'],
        ['git add index.html about.html', 'Stage two files for the next commit'],
        ['git commit -m "Add about page"', 'Save a snapshot', '[main 3f2a1bc] Add about page\n 2 files changed, 12 insertions(+), 1 deletion(-)\n create mode 100644 about.html'],
        ['git log --oneline', 'Short history', '3f2a1bc (HEAD -> main) Add about page\n9d84e10 Add homepage'],
        ['git diff', 'Unstaged changes line by line', 'diff --git a/index.html b/index.html\nindex 83db48f..bf2a7c1 100644\n--- a/index.html\n+++ b/index.html\n@@ -1,3 +1,3 @@\n <!doctype html>\n <title>My site</title>\n-<h1>Hello from Linux</h1>\n+<h1>Hello, world</h1>'],
        ['git switch -c feature', 'Create and switch to a new branch', "Switched to a new branch 'feature'"],
        ['git clone https://example.com/site.git', 'Copy a remote repository', "Cloning into 'site'...\nremote: Enumerating objects: 42, done.\nReceiving objects: 100% (42/42), 11.20 KiB | 5.60 MiB/s, done."],
        ['git push origin main', 'Send commits to the remote', 'To https://example.com/site.git\n   9d84e10..3f2a1bc  main -> main']
      ],
      tips: ['Commit small and often, and write messages that say <i>why</i>. Run <code>git status</code> before every commit.'],
      note: 'Install with <code>sudo apt install git</code>, <code>sudo dnf install git</code> or <code>sudo pacman -S git</code>.'
    },
    {
      id: 'docker', title: 'Containers with Docker', sum: 'Run apps in isolated, portable boxes.',
      explain: [
        'A <b>container</b> is a normal Linux process that is isolated from the rest of the system. It is not a virtual machine: it shares the host kernel, so it starts in a second and uses little memory.',
        'Isolation comes from the kernel: <b>namespaces</b> limit what the process can see (its own processes, network and files) and <b>cgroups</b> limit how much CPU and memory it may use. An <b>image</b> is the read-only template; a container is a running copy of it.'
      ],
      terms: [['image', 'Read-only template with the app and its files'], ['container', 'A running instance of an image'], ['namespace', 'Gives a process its own view of processes, network, mounts'], ['cgroup', 'Limits and measures a group of processes']],
      anim: {
        nodes: [['i', 90, 40, 'Image: nginx', 'file'], ['c', 270, 40, 'Container: web', 'proc'], ['k', 180, 125, 'Host kernel', 'kernel'], ['n', 90, 210, 'Namespaces: isolate', 'kernel'], ['g', 270, 210, 'cgroups: limits', 'kernel']],
        edges: [['i', 'c'], ['c', 'k'], ['k', 'n'], ['k', 'g']],
        steps: [
          { t: 'docker run takes the nginx image (a template) and starts a container from it.', hi: ['i', 'c'], flow: [['i', 'c']] },
          { t: 'The container is just a process running on the shared host kernel.', hi: ['c', 'k'], flow: [['c', 'k']] },
          { t: 'Namespaces give it its own view of processes, network and files.', hi: ['n'], flow: [['k', 'n']] },
          { t: 'cgroups cap how much CPU and memory it can use.', hi: ['g'], flow: [['k', 'g']] }
        ]
      },
      cmds: [
        ['docker run hello-world', 'Run a tiny test container', 'Hello from Docker!\nThis message shows that your installation appears to be working correctly.'],
        ['docker run -d --name web -p 8080:80 nginx', 'Run nginx in the background; host port 8080 to container port 80', '2f7c9a1d8b3e5c6f4a0b9d8e7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b'],
        ['docker ps', 'Running containers', 'CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS                  NAMES\n2f7c9a1d8b3e   nginx     "/docker-entrypoint.…"   10 seconds ago   Up 9 seconds    0.0.0.0:8080->80/tcp   web'],
        ['docker images', 'Images stored on this machine', 'REPOSITORY    TAG       IMAGE ID       CREATED         SIZE\nnginx         latest    a6bd71f48f68   3 weeks ago     192MB\nhello-world   latest    d2c94e258dcb   18 months ago   13.3kB'],
        ['docker logs web', 'Output of a container', '/docker-entrypoint.sh: Configuration complete; ready for start up\n172.17.0.1 - - [05/Nov/2025:09:41:12 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/8.5.0" "-"'],
        ['docker exec -it web bash', 'Open a shell inside a running container'],
        ['docker stop web', 'Stop a container', 'web'],
        ['docker rm web', 'Delete a stopped container', 'web'],
        ['docker compose up -d', 'Start all services defined in compose.yaml', ' ✔ Network site_default  Created\n ✔ Container site-web-1  Started']
      ],
      flags: [['-d', 'Detached: run in the background', 'docker run'], ['-p host:ctr', 'Publish a port', 'docker run'], ['--name', 'Give the container a name', 'docker run'], ['-it', 'Interactive with a terminal', 'docker exec / run'], ['--rm', 'Delete the container when it stops', 'docker run']],
      tips: ['Containers are disposable. Keep data you care about in a <b>volume</b> (<code>-v name:/path</code>) or a mounted folder, not inside the container.'],
      note: 'Docker is one container runtime. Podman is a compatible alternative that runs without a background daemon; most commands are the same with <code>podman</code> in place of <code>docker</code>.'
    },
    {
      id: 'tmux', title: 'tmux: sessions that survive', sum: 'Keep jobs running after you disconnect.',
      explain: [
        'When an SSH connection drops, programs started from it normally die. <b>tmux</b> runs your terminal in a session on the server, so you can detach, close your laptop and re-attach later with everything still running.',
        'tmux is controlled with a <b>prefix</b>: press <kbd>Ctrl+b</kbd>, release, then a key. It also splits one window into several panes and can hold many windows in one session. <code>screen</code> is an older tool for the same job.'
      ],
      table: { head: ['Keys (after Ctrl+b)', 'Action'], rows: [['d', 'Detach, leaving the session running'], ['c', 'New window'], ['n / p', 'Next / previous window'], ['%', 'Split into left and right panes'], ['"', 'Split into top and bottom panes'], ['arrow keys', 'Move between panes'], ['[', 'Scroll back (q leaves)'], ['x', 'Close the current pane']] },
      anim: {
        nodes: [['t', 90, 40, 'Your terminal', 'user'], ['x', 270, 40, 'tmux server', 'proc'], ['s', 270, 125, 'Session: work', 'kernel'], ['j', 270, 210, 'Long job running', 'proc'], ['b', 90, 210, 'Re-attach later', 'user']],
        edges: [['t', 'x'], ['x', 's'], ['s', 'j'], ['j', 'b']],
        steps: [
          { t: 'tmux new -s work starts a tmux server and a session named work.', hi: ['x', 's'], flow: [['t', 'x'], ['x', 's']] },
          { t: 'You start a long job inside the session.', hi: ['j'], flow: [['s', 'j']] },
          { t: 'Press Ctrl+b then d, or lose your connection. Your terminal goes away; the session does not.', hi: ['s', 'j'] },
          { t: 'Later, tmux attach -t work brings the session back with the job still running.', hi: ['b'], flow: [['j', 'b']] }
        ]
      },
      cmds: [
        ['tmux new -s work', 'Start a session called work'],
        ['tmux ls', 'List sessions', 'work: 1 windows (created Thu Nov  5 09:00:00 2025)'],
        ['tmux attach -t work', 'Re-attach to a session'],
        ['tmux kill-session -t work', 'End a session'],
        ['screen -S build', 'The older alternative: start a session called build'],
        ['screen -r build', 'Re-attach to it']
      ],
      tips: ['Run anything long (a big download, a database import) inside tmux when you are connected over SSH.']
    }
  ]
});

LV.tool({
  tar: { syntax: 'tar [OPTION...] [FILE]...', desc: 'Store and extract files from an archive.' },
  gzip: { syntax: 'gzip [OPTION]... [FILE]...', desc: 'Compress or expand files.' },
  zip: { syntax: 'zip [options] zipfile files...', desc: 'Package and compress files into a zip archive.' },
  unzip: { syntax: 'unzip [options] file.zip', desc: 'List, test and extract files from a zip archive.' },
  whereis: { syntax: 'whereis [options] name...', desc: 'Locate the binary, source and manual page of a command.' },
  locate: { syntax: 'locate [OPTION]... PATTERN...', desc: 'Find files by name using a database.' },
  nano: { syntax: 'nano [OPTIONS] [FILE]', desc: 'Small, friendly terminal text editor.' },
  vim: { syntax: 'vim [options] [file ...]', desc: 'Vi IMproved, a modal text editor.' },
  diff: { syntax: 'diff [OPTION]... FILES', desc: 'Compare files line by line.' },
  patch: { syntax: 'patch [options] [originalfile [patchfile]]', desc: 'Apply a diff file to an original.' },
  cmp: { syntax: 'cmp [OPTION]... FILE1 [FILE2]', desc: 'Compare two files byte by byte.' },
  nice: { syntax: 'nice [OPTION] [COMMAND [ARG]...]', desc: 'Run a program with modified scheduling priority.' },
  renice: { syntax: 'renice [-n] priority [-p] pid...', desc: 'Alter the priority of running processes.' },
  ionice: { syntax: 'ionice [options] -p PID | command', desc: 'Set or get I/O scheduling class and priority.' },
  modprobe: { syntax: 'modprobe [options] module', desc: 'Add or remove modules from the kernel.' },
  lsmod: { syntax: 'lsmod', desc: 'Show the status of loaded kernel modules.' },
  modinfo: { syntax: 'modinfo [options] module', desc: 'Show information about a kernel module.' },
  dmesg: { syntax: 'dmesg [options]', desc: 'Print or control the kernel ring buffer.' },
  lspci: { syntax: 'lspci [options]', desc: 'List all PCI devices.' },
  lsusb: { syntax: 'lsusb [options]', desc: 'List USB devices.' },
  scp: { syntax: 'scp [options] source ... target', desc: 'Secure copy (remote file copy over SSH).' },
  rsync: { syntax: 'rsync [OPTION]... SRC... [DEST]', desc: 'Fast, versatile file copying and synchronisation.' },
  sftp: { syntax: 'sftp [options] [user@]host', desc: 'Interactive secure file transfer.' },
  nginx: { syntax: 'nginx [-t] [-s signal]', desc: 'High performance web server and reverse proxy.' },
  sha256sum: { syntax: 'sha256sum [OPTION]... [FILE]...', desc: 'Compute and check SHA256 message digests.' },
  md5sum: { syntax: 'md5sum [OPTION]... [FILE]...', desc: 'Compute and check MD5 message digests.' },
  gpg: { syntax: 'gpg [options] [files]', desc: 'OpenPGP encryption and signing tool.' },
  last: { syntax: 'last [options] [username...]', desc: 'Show a listing of last logged in users.' },
  'fail2ban-client': { syntax: 'fail2ban-client [options] <command>', desc: 'Configure and control the fail2ban server.' },
  printenv: { syntax: 'printenv [OPTION]... [VARIABLE]...', desc: 'Print all or part of the environment.' },
  shellcheck: { syntax: 'shellcheck [OPTIONS...] FILES...', desc: 'Static analysis for shell scripts.' },
  git: { syntax: 'git [-C path] <command> [args]', desc: 'Distributed version control.' },
  docker: { syntax: 'docker [OPTIONS] COMMAND', desc: 'Build, run and manage containers.' },
  tmux: { syntax: 'tmux [command [flags]]', desc: 'Terminal multiplexer.' },
  screen: { syntax: 'screen [options] [cmd [args]]', desc: 'Screen manager with VT100 emulation.' }
});
