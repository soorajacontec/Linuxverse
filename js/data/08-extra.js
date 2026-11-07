/* Extra topics: conditionals, curl & wget, special permissions, disk usage, xargs, system info, logrotate, building from source. */

LV.add('script', [
  {
    id: 'conditionals', title: 'Conditionals: if, test & case', sum: 'Make a script choose what to do.',
    explain: [
      'An <code>if</code> runs a command and looks at its <b>exit code</b>: 0 means true, anything else means false. The most common command to put there is <code>[[ ... ]]</code> (or the older <code>test</code> / <code>[ ... ]</code>), which compares values and checks files.',
      'Useful checks: <code>-f file</code> (is a regular file), <code>-d dir</code> (is a folder), <code>-e path</code> (exists), <code>-z "$x"</code> (empty text), <code>"$a" = "$b"</code> (same text) and <code>$n -gt 5</code> (number greater than 5).',
      'When one value can match many patterns, <code>case</code> is tidier than a long chain of <code>elif</code>.'
    ],
    code: '#!/usr/bin/env bash\nfile="${1:-notes.txt}"\n\nif [[ -f "$file" ]]; then\n  echo "$file has $(wc -l < "$file") lines"\nelif [[ -d "$file" ]]; then\n  echo "$file is a folder"\nelse\n  echo "$file not found" >&2\n  exit 1\nfi\n\ncase "$2" in\n  start) echo "starting" ;;\n  stop|quit) echo "stopping" ;;\n  *) echo "usage: $0 file start|stop" ;;\nesac',
    terms: [['[[ ]]', 'Bash test: compares text and numbers, checks files'], ['-f / -d / -e', 'Is a file / is a folder / exists'], ['-eq -ne -gt -lt', 'Number comparisons (equal, not equal, greater, less)'], ['&& and ||', 'Run the next command only on success / only on failure'], ['case', 'Pick a branch by matching a value against patterns']],
    table: { head: ['Test', 'True when', 'Example'], rows: [['-f f', 'f is a regular file', '[[ -f notes.txt ]]'], ['-d d', 'd is a directory', '[[ -d logs ]]'], ['-z s', 's is empty', '[[ -z "$name" ]]'], ['a = b', 'text is equal', '[[ "$USER" = root ]]'], ['n -gt m', 'number n is greater than m', '[[ $count -gt 3 ]]']] },
    cmds: [
      ['[[ -f ~/website/index.html ]] && echo yes', 'One-line check: run echo only if the file exists', 'yes'],
      ['[[ -d ~/website/logs ]] && echo "has logs"', 'Is it a folder?', 'has logs'],
      ['test -z "$EMPTY" && echo "empty"', 'test is the same as [ ]', 'empty'],
      ['[[ 5 -gt 3 ]]; echo $?', 'Show the exit code of a comparison (0 = true)', '0'],
      ['[[ -f nope.txt ]] || echo "missing"', 'Run only when the check fails', 'missing'],
      ['help test', 'Built-in help listing every test']
    ],
    flags: [['-f', 'Regular file exists', '[[ ]]'], ['-d', 'Directory exists', '[[ ]]'], ['-r -w -x', 'Readable / writable / executable by you', '[[ ]]'], ['-n / -z', 'Text is not empty / is empty', '[[ ]]']],
    tips: ['Always quote variables inside tests: <code>[[ -f "$file" ]]</code>. Without quotes a name with spaces breaks the check in the older <code>[ ]</code> form.', 'Put the pattern <code>*)</code> last in a case so unexpected input is handled.'],
    warn: ['Spaces matter: <code>[[ -f $f ]]</code> works, <code>[[-f $f]]</code> does not. There must be a space after <code>[[</code> and before <code>]]</code>.'],
    demo: ['[[ -f ~/website/index.html ]] && echo yes', '[[ 5 -gt 3 ]]; echo $?']
  }
]);

LV.add('net', [
  {
    id: 'curlwget', title: 'Downloads & APIs: curl and wget', sum: 'Fetch pages and files, call web APIs.',
    explain: [
      '<code>curl</code> sends a request and prints the answer, which makes it the tool for testing websites and APIs. <code>wget</code> is built for downloading files and can resume or copy a whole site.',
      'With curl you choose the method and the data: <code>-X POST -d "key=value"</code> sends a form, <code>-H "Header: value"</code> adds a header, and <code>-I</code> asks for headers only. Add <code>-L</code> to follow redirects and <code>-o file</code> to save to a file.',
      'Most APIs answer in JSON. Pipe the result to <code>jq</code> to read it comfortably.'
    ],
    terms: [['curl', 'Transfers data to or from a URL; great for APIs'], ['wget', 'Downloads files; can resume and mirror'], ['-L', 'Follow redirects (301, 302)'], ['-o / -O', 'Save under your own name / the remote name'], ['JSON', 'Text format most web APIs use; read it with jq']],
    cmds: [
      ['curl -I https://example.com', 'Show only the response headers', 'HTTP/2 200\ncontent-type: text/html\ncontent-length: 1256'],
      ['curl -s https://example.com | head -n 3', 'Quiet mode (-s) so only the page is printed'],
      ['curl -L -o page.html https://example.com', 'Follow redirects and save to a file'],
      ['curl -X POST -d "name=ssk" https://httpbin.org/post', 'Send form data with POST'],
      ['curl -H "Authorization: Bearer $TOKEN" https://api.example.com/me', 'Call an API with a token header'],
      ['curl -s https://api.example.com/items | jq ".[0]"', 'Fetch JSON and pick the first item'],
      ['curl -w "%{http_code}\\n" -o /dev/null -s https://example.com', 'Print only the status code', '200'],
      ['wget https://example.com/file.zip', 'Download a file'],
      ['wget -c https://example.com/big.iso', 'Resume an interrupted download']
    ],
    flags: [['-s', 'Silent: hide the progress meter', 'curl'], ['-L', 'Follow redirects', 'curl'], ['-I', 'Headers only (HEAD request)', 'curl'], ['-o file', 'Write output to file', 'curl'], ['-d data', 'Send data (makes it a POST)', 'curl'], ['-c', 'Continue a partial download', 'wget']],
    tips: ['Use <code>curl -fsSL url</code> in scripts: fail on HTTP errors, stay quiet, but still show errors and follow redirects.', 'Check the status code first (<code>curl -I</code>) before you debug the page content.'],
    warn: ['Never run <code>curl url | sudo bash</code> unless you trust the source completely. Download the script, read it, then run it.', 'Tokens in the command line end up in your shell history. Use an environment variable.']
  }
]);

LV.add('perms', [
  {
    id: 'specialperms', title: 'Special permissions & ACLs', sum: 'setuid, setgid, sticky bit and per-user access lists.',
    explain: [
      'Besides rwx there are three special bits. <b>setuid</b> on a program makes it run as the file\'s owner (that is how <code>passwd</code> can edit protected files). <b>setgid</b> on a folder makes new files inherit the folder\'s group. The <b>sticky bit</b> on a folder lets people delete only their own files (that is <code>/tmp</code>).',
      'In <code>ls -l</code> they replace an x: <code>s</code> for setuid/setgid and <code>t</code> for sticky. As numbers they are a fourth leading digit: 4 setuid, 2 setgid, 1 sticky, so <code>chmod 2775 shared</code> sets setgid.',
      'When owner, group and others are not enough, <b>ACLs</b> give extra users or groups their own access: <code>setfacl -m u:alex:rw file</code>.'
    ],
    terms: [['setuid (4)', 'Run an executable as its owner'], ['setgid (2)', 'Run as group / new files inherit folder group'], ['sticky (1)', 'Only the owner may delete files in the folder'], ['ACL', 'Access control list: extra per-user permissions'], ['getfacl / setfacl', 'Show / change ACLs']],
    table: { head: ['Bit', 'Number', 'Shown as', 'Typical use'], rows: [['setuid', '4000', 'rws', '/usr/bin/passwd'], ['setgid', '2000', 'rws on group / s on folder', 'Shared team folders'], ['sticky', '1000', 't at the end', '/tmp'], ['ACL', '-', '+ after the mode', 'Extra user access']] },
    cmds: [
      ['ls -l /usr/bin/passwd', 'The s means setuid', '-rwsr-xr-x 1 root root 59976 Nov  5 12:00 /usr/bin/passwd'],
      ['ls -ld /tmp', 'The t means sticky', 'drwxrwxrwt 14 root root 4096 Nov  7 20:30 /tmp'],
      ['chmod 2775 shared', 'Set group inheritance on a shared folder'],
      ['chmod +t shared', 'Turn on the sticky bit'],
      ['find / -perm -4000 -type f 2>/dev/null', 'List setuid programs (a common security audit)'],
      ['setfacl -m u:alex:rw notes.txt', 'Give user alex read and write access'],
      ['getfacl notes.txt', 'Show the access list', '# file: notes.txt\n# owner: ssk\nuser::rw-\nuser:alex:rw-\ngroup::r--\nother::---']
    ],
    flags: [['-m', 'Modify an ACL entry', 'setfacl'], ['-x', 'Remove an ACL entry', 'setfacl'], ['-b', 'Remove all ACL entries', 'setfacl'], ['-perm -4000', 'Match files with setuid set', 'find']],
    tips: ['Use setgid on shared team folders so everyone\'s files end up in the team group automatically.'],
    warn: ['A setuid root program with a bug can give an attacker root. Do not set setuid on scripts or on programs you did not audit.']
  }
]);

LV.add('disks', [
  {
    id: 'diskusage', title: 'Disk usage: df, du & ncdu', sum: 'Find out what is filling the disk.',
    explain: [
      '<code>df</code> answers "how full is each disk?" and <code>du</code> answers "how big is this folder?". Add <code>-h</code> to both for human sizes (K, M, G).',
      'To hunt a full disk, start at the top and go down: run <code>du -h --max-depth=1 /var | sort -h</code>, find the biggest folder, then repeat inside it. <code>ncdu</code> does the same interactively.',
      'If <code>df</code> says full but <code>df -i</code> shows free space, you may have run out of <b>inodes</b> (millions of tiny files) instead of bytes.'
    ],
    terms: [['df', 'Disk free: space per mounted filesystem'], ['du', 'Disk usage: space used by files and folders'], ['inode', 'A file record; running out stops new files even with free space'], ['ncdu', 'Interactive disk usage browser']],
    cmds: [
      ['df -h', 'Free space on every mounted disk', 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda2        98G   41G   53G  44% /\n/dev/sda1       511M  6.1M  505M   2% /boot/efi'],
      ['df -i /', 'Inode usage instead of bytes'],
      ['du -sh ~/website', 'Total size of one folder', '24K\t/home/ssk/website'],
      ['du -h --max-depth=1 /var | sort -h', 'Biggest subfolders last'],
      ['du -ah ~ | sort -rh | head -n 10', 'Ten largest files and folders in your home'],
      ['ncdu /var', 'Browse sizes interactively'],
      ['find / -xdev -type f -size +500M 2>/dev/null', 'Find files bigger than 500 MB']
    ],
    flags: [['-h', 'Human readable sizes', 'df du'], ['-s', 'Summary: one total only', 'du'], ['--max-depth=N', 'Only go N levels deep', 'du'], ['-i', 'Show inodes', 'df'], ['-x / --one-file-system', 'Stay on one disk', 'du']],
    tips: ['Common space eaters: <code>/var/log</code>, package caches (<code>/var/cache</code>), old Docker images and the trash.'],
    warn: ['Deleting a big file that a program still has open will not free space until the program exits or restarts.']
  }
]);

LV.add('text', [
  {
    id: 'xargs', title: 'Build commands with xargs', sum: 'Turn a list into arguments for another command.',
    explain: [
      'Some commands read files, not pipes. <code>xargs</code> bridges that gap: it reads lines from its input and runs a command with them as arguments, e.g. <code>find -name "*.log" | xargs rm</code>.',
      'Names with spaces break plain xargs. Pair <code>find -print0</code> with <code>xargs -0</code>, which separates items with a null character instead. <code>-n 1</code> runs the command once per item and <code>-P 4</code> runs four at a time.',
      'For simple cases <code>find ... -exec cmd {} +</code> does the same without a pipe.'
    ],
    terms: [['xargs', 'Build and run commands from standard input'], ['-0', 'Input is separated by null characters'], ['-n N', 'Use at most N arguments per run'], ['-P N', 'Run N commands in parallel'], ['-I {}', 'Place each item where {} appears']],
    cmds: [
      ['echo "a b c" | xargs -n 1', 'One item per run', 'a\nb\nc'],
      ['find ~/website -name "*.sh" | xargs ls -l', 'List details of every script found'],
      ['find . -name "*.tmp" -print0 | xargs -0 rm', 'Safe for names with spaces'],
      ['ls *.html | xargs -I {} cp {} {}.bak', 'Copy each file to a .bak name'],
      ['seq 1 6 | xargs -n 3', 'Group items three per line', '1 2 3\n4 5 6'],
      ['cat urls.txt | xargs -P 4 -n 1 curl -sO', 'Download four files at a time'],
      ['grep -rl TODO ~/website | xargs wc -l', 'Count lines in every file that mentions TODO']
    ],
    flags: [['-0', 'Null-separated input', 'xargs'], ['-n N', 'Arguments per command', 'xargs'], ['-I {}', 'Replace {} with each item', 'xargs'], ['-P N', 'Parallel jobs', 'xargs'], ['-t', 'Print each command before running', 'xargs']],
    tips: ['Test first with <code>xargs echo</code> or <code>-t</code> to see what would run.'],
    warn: ['<code>xargs rm</code> on unchecked input deletes whatever the previous command listed. Run the list alone first.']
  }
]);

LV.add('proc', [
  {
    id: 'sysinfo', title: 'System information', sum: 'Kernel, CPU, memory, uptime and hardware at a glance.',
    explain: [
      'When you land on an unknown machine, a few commands tell you what it is. <code>uname -a</code> shows the kernel, <code>cat /etc/os-release</code> the distribution, <code>uptime</code> the load, <code>free -h</code> memory and <code>lscpu</code> the processor.',
      'Hardware: <code>lsblk</code> disks, <code>lspci</code> cards, <code>lsusb</code> USB devices. Kernel messages from boot and drivers are in <code>dmesg</code>.',
      '<b>Load average</b> in <code>uptime</code> is the average number of programs wanting CPU over 1, 5 and 15 minutes. Compare it with your CPU count: load 4 on a 4-core machine is fully busy.'
    ],
    terms: [['uname', 'Kernel name, version and architecture'], ['os-release', 'File that identifies the distribution'], ['load average', 'Programs running or waiting, over 1/5/15 minutes'], ['lscpu', 'CPU model, cores and speed'], ['dmesg', 'Kernel ring buffer: boot and driver messages']],
    cmds: [
      ['uname -a', 'Kernel and machine summary', 'Linux linuxverse 7.2.11-200.fc44.x86_64 #1 SMP x86_64 GNU/Linux'],
      ['cat /etc/os-release', 'Which distribution and version', 'NAME="Fedora Linux"\nVERSION_ID=44'],
      ['uptime', 'How long up and the load', ' 20:41:03 up 3 days,  2:14,  1 user,  load average: 0.21, 0.30, 0.28'],
      ['free -h', 'Memory and swap in human sizes'],
      ['lscpu | head -n 8', 'Processor details'],
      ['nproc', 'Number of CPU cores', '8'],
      ['lsblk', 'Block devices (disks and partitions)'],
      ['dmesg | tail -n 5', 'Latest kernel messages'],
      ['hostnamectl', 'Hostname, OS and kernel in one view']
    ],
    flags: [['-a', 'Print everything', 'uname'], ['-r', 'Kernel release only', 'uname'], ['-h', 'Human readable', 'free'], ['-p', 'Pretty: uptime in words', 'uptime']],
    tips: ['Paste <code>uname -a</code> and <code>cat /etc/os-release</code> into bug reports; people will ask for them first.']
  }
]);

LV.add('systemd', [
  {
    id: 'logrotate', title: 'Log rotation: logrotate', sum: 'Keep log files from filling the disk.',
    explain: [
      'Logs grow forever unless something trims them. <b>logrotate</b> runs daily (from a systemd timer or cron) and, for each log, renames the old file, starts a fresh one, compresses old copies and deletes the oldest.',
      'Rules live in <code>/etc/logrotate.conf</code> and in small files under <code>/etc/logrotate.d/</code>, one per application. A rule names the log and says how often to rotate and how many copies to keep.',
      'The systemd journal handles its own size; set a limit in <code>/etc/systemd/journald.conf</code> or run <code>journalctl --vacuum-size=200M</code>.'
    ],
    code: '# /etc/logrotate.d/mysite\n/home/ssk/website/logs/*.log {\n    weekly\n    rotate 4\n    compress\n    missingok\n    notifempty\n    create 0640 ssk ssk\n}',
    terms: [['rotate N', 'Keep N old copies'], ['compress', 'gzip rotated logs'], ['missingok', 'No error if the log does not exist'], ['notifempty', 'Skip rotation when the log is empty'], ['create', 'Make a new log with this mode and owner']],
    cmds: [
      ['cat /etc/logrotate.d/nginx', 'See how an installed app is configured'],
      ['sudo logrotate -d /etc/logrotate.conf', 'Dry run: show what would happen'],
      ['sudo logrotate -f /etc/logrotate.d/mysite', 'Force a rotation now'],
      ['ls -l ~/website/logs', 'Rotated logs end in .1, .2.gz and so on'],
      ['journalctl --disk-usage', 'How much space the journal uses'],
      ['sudo journalctl --vacuum-size=200M', 'Shrink the journal to 200 MB']
    ],
    flags: [['-d', 'Debug: show actions, change nothing', 'logrotate'], ['-f', 'Force rotation even if not due', 'logrotate'], ['-v', 'Verbose output', 'logrotate']],
    tips: ['Always test a new rule with <code>logrotate -d</code> before you rely on it.'],
    warn: ['If a program keeps the old log file open, it keeps writing to the renamed file. Use <code>copytruncate</code> or a <code>postrotate</code> reload command.']
  }
]);

LV.add('dev', [
  {
    id: 'buildsrc', title: 'Building from source: make', sum: 'configure, make and install, and what each step does.',
    explain: [
      'When software is not in your package manager, you may download its <b>source code</b> and build it. Most projects follow a pattern: <code>./configure</code> checks your system, <code>make</code> compiles, and <code>sudo make install</code> copies the result into place.',
      '<code>make</code> reads a <code>Makefile</code>, a list of <b>targets</b> with the commands to build them. It only rebuilds what changed. Many projects also use it as a task runner: <code>make test</code>, <code>make clean</code>.',
      'You need a compiler and build tools first (<code>build-essential</code> on Debian/Ubuntu, <code>@development-tools</code> on Fedora). Install into <code>/usr/local</code> or your home so the package manager\'s files stay untouched.'
    ],
    code: '# Makefile\nCC = gcc\n\nhello: hello.c\n\t$(CC) -o hello hello.c\n\nclean:\n\trm -f hello',
    terms: [['./configure', 'Script that checks dependencies and prepares the build'], ['make', 'Runs the Makefile rules'], ['make install', 'Copies built files into the system'], ['--prefix', 'Where to install, e.g. $HOME/.local'], ['Makefile', 'Rules: target, dependencies, commands (tab-indented)']],
    cmds: [
      ['sudo apt install build-essential', 'Debian/Ubuntu: compiler and make'],
      ['sudo dnf install @development-tools', 'Fedora: the same'],
      ['tar -xzf tool-1.0.tar.gz && cd tool-1.0', 'Unpack the source and enter it'],
      ['./configure --prefix=$HOME/.local', 'Prepare, installing under your home'],
      ['make -j"$(nproc)"', 'Compile using all CPU cores'],
      ['make test', 'Run the project\'s tests'],
      ['make install', 'Install (no sudo needed under your home)'],
      ['make clean', 'Remove built files']
    ],
    flags: [['-j N', 'Run N jobs in parallel', 'make'], ['-n', 'Dry run: print commands only', 'make'], ['-C dir', 'Run in another folder', 'make'], ['--prefix=DIR', 'Install location', 'configure']],
    tips: ['Read <code>README</code> and <code>INSTALL</code> first; they list the required libraries.', 'If you must install system-wide, prefer <code>/usr/local</code> over mixing files into <code>/usr</code>.'],
    warn: ['Makefile commands must start with a <b>tab</b>, not spaces, or make fails with "missing separator".', '<code>sudo make install</code> can overwrite packaged files and the package manager cannot remove them later. A prefix in your home avoids this.']
  }
]);

LV.tool({
  wget: { syntax: 'wget [OPTION]... [URL]...', desc: 'Download files from the web; can resume and mirror.' },
  setfacl: { syntax: 'setfacl [-bkRd] [-m|-x acl_spec] file ...', desc: 'Set file access control lists.' },
  getfacl: { syntax: 'getfacl [-dRLP] file ...', desc: 'Show file access control lists.' },
  ncdu: { syntax: 'ncdu [options] [directory]', desc: 'Interactive disk usage analyser.' },
  lscpu: { syntax: 'lscpu [options]', desc: 'Show CPU architecture, model and core count.' },
  uptime: { syntax: 'uptime [options]', desc: 'Show how long the system has been running and the load average.' },
  logrotate: { syntax: 'logrotate [options] config_file', desc: 'Rotate, compress and remove old log files.' },
  make: { syntax: 'make [OPTION]... [TARGET]...', desc: 'Build programs from a Makefile.' },
  gcc: { syntax: 'gcc [options] file...', desc: 'The GNU C compiler.' }
});
