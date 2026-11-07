/* Sections: Start here, Filesystem, Permissions */
LV.sec({
  id: 'start', title: 'Start here', icon: 'book', hue: 38,
  desc: 'What Linux is, how distributions differ, and how to talk to the shell.',
  topics: [
    {
      id: 'what-is-linux', title: 'What is Linux?', sum: 'Kernel, userland and distributions in one picture.',
      explain: [
        '<b>Linux</b> is strictly the <b>kernel</b>: the program that owns the CPU, memory, disks and devices, and hands them out to running programs. Linus Torvalds released the first version in 1991 and it is still developed in the open.',
        'On its own a kernel does nothing you can see. A usable system adds <b>userland</b>: the GNU core utilities (<code>ls</code>, <code>cp</code>, <code>grep</code>), a shell such as <b>bash</b>, an init system (usually <b>systemd</b>), libraries like glibc, and optionally a desktop.',
        'A <b>distribution</b> (distro) packages the kernel, userland, a package manager and default settings into something you can install. Ubuntu, Debian, Fedora, RHEL, Arch and openSUSE all run the same kind of kernel; they differ in packaging, release rhythm and defaults.',
        'Programs never touch hardware directly. They ask the kernel through <b>system calls</b> such as <code>open()</code>, <code>read()</code> and <code>write()</code>. Watch the Visual tab to see one request travel down the stack and back.'
      ],
      terms: [['Kernel', 'Core program managing CPU, memory, devices and processes'], ['Userland', 'Everything outside the kernel: shell, tools, libraries, apps'], ['System call', 'The doorway a program uses to ask the kernel for a service'], ['Distro', 'A packaged, installable Linux operating system']],
      anim: {
        nodes: [['app', 180, 30, 'Application (ls)', 'proc'], ['lib', 180, 82, 'glibc library', 'file'], ['sys', 180, 134, 'System call: getdents', 'kernel'], ['krn', 180, 186, 'Kernel: VFS → ext4 driver', 'kernel'], ['hw', 180, 236, 'Disk hardware', 'hw']],
        edges: [['app', 'lib'], ['lib', 'sys'], ['sys', 'krn'], ['krn', 'hw']],
        steps: [
          { t: 'You type ls. The ls program starts in user space.', hi: ['app'] },
          { t: 'ls calls a C library function to read the directory.', hi: ['lib'], flow: [['app', 'lib']] },
          { t: 'The library issues a system call, crossing into kernel space.', hi: ['sys'], flow: [['lib', 'sys']] },
          { t: 'The kernel routes the request through the virtual filesystem to the ext4 driver.', hi: ['krn'], flow: [['sys', 'krn']] },
          { t: 'The driver reads blocks from the disk.', hi: ['hw'], flow: [['krn', 'hw']] },
          { t: 'Data climbs back up the same path and ls prints the file names.', hi: ['app', 'hw'], flow: [['hw', 'krn'], ['krn', 'sys'], ['sys', 'lib'], ['lib', 'app']] }
        ]
      },
      cmds: [
        ['uname -r', 'Print the running kernel release', '6.8.0-45-generic'],
        ['uname -a', 'Print all kernel and machine info', 'Linux ubuntu 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux'],
        ['cat /etc/os-release', 'Show which distribution and version this is', 'PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\nVERSION="24.04.1 LTS (Noble Numbat)"\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/"'],
        ['hostnamectl', 'Hostname, OS, kernel and hardware summary (systemd)', ' Static hostname: ubuntu\n       Icon name: computer-vm\n         Chassis: vm\nOperating System: Ubuntu 24.04.1 LTS\n          Kernel: Linux 6.8.0-45-generic\n    Architecture: x86-64'],
        ['lsb_release -a', 'Distribution info on systems that ship lsb_release', 'Distributor ID:\tUbuntu\nDescription:\tUbuntu 24.04.1 LTS\nRelease:\t24.04\nCodename:\tnoble']
      ],
      flags: [['-r', 'Kernel release', 'uname'], ['-a', 'All information', 'uname'], ['-m', 'Machine hardware name (x86_64, aarch64)', 'uname']],
      demo: ['uname -r', 'cat /etc/os-release'],
      tips: ['<code>/etc/os-release</code> exists on every modern distro, so it is the most reliable way to check which one you are on.'],
      note: 'Kernel version strings differ by distro: Ubuntu adds -generic, Fedora adds .fc and the release number, Arch adds -arch.'
    },
    {
      id: 'distros', title: 'Distro families', sum: 'Package managers, release models and who each distro suits.',
      explain: [
        'Most distros belong to a <b>family</b> that shares a package format. Learn one member of a family and the rest feel familiar.',
        'Distros also differ in <b>release model</b>. <b>LTS / point releases</b> (Ubuntu LTS, Debian, RHEL) freeze versions for stability. <b>Rolling releases</b> (Arch, openSUSE Tumbleweed) update continuously so you always have the newest software.'
      ],
      table: { head: ['Family', 'Package tools', 'Examples', 'Release model'], rows: [
        ['Debian', 'apt, dpkg (.deb)', 'Debian, Ubuntu, Linux Mint', 'Point / LTS'],
        ['Red Hat', 'dnf, rpm (.rpm)', 'Fedora, RHEL, Rocky, AlmaLinux', 'Fedora ~6 months; RHEL long-term'],
        ['Arch', 'pacman (.pkg.tar.zst)', 'Arch Linux, EndeavourOS', 'Rolling'],
        ['SUSE', 'zypper, rpm', 'openSUSE Leap, Tumbleweed', 'Leap point; Tumbleweed rolling']
      ] },
      anim: {
        nodes: [['k', 180, 30, 'Linux kernel', 'kernel'], ['deb', 50, 110, 'Debian', 'file'], ['rh', 140, 110, 'Fedora', 'file'], ['arch', 225, 110, 'Arch', 'file'], ['suse', 310, 110, 'openSUSE', 'file'], ['ub', 50, 190, 'Ubuntu', 'proc'], ['rhel', 140, 190, 'RHEL', 'proc'], ['mint', 50, 240, 'Mint', 'proc'], ['rocky', 140, 240, 'Rocky/Alma', 'proc']],
        edges: [['k', 'deb'], ['k', 'rh'], ['k', 'arch'], ['k', 'suse'], ['deb', 'ub'], ['ub', 'mint'], ['rh', 'rhel'], ['rhel', 'rocky']],
        hide: ['ub', 'rhel', 'mint', 'rocky'],
        steps: [
          { t: 'Every distro runs a Linux kernel.', hi: ['k'] },
          { t: 'Four big independent families build their own packaging on top.', hi: ['deb', 'rh', 'arch', 'suse'], flow: [['k', 'deb'], ['k', 'rh'], ['k', 'arch'], ['k', 'suse']] },
          { t: 'Ubuntu is built from Debian; Linux Mint is built from Ubuntu. All use apt.', show: ['ub', 'mint'], hi: ['ub', 'mint'], flow: [['deb', 'ub'], ['ub', 'mint']] },
          { t: 'RHEL is built from Fedora/CentOS Stream; Rocky and AlmaLinux rebuild RHEL. All use dnf.', show: ['ub', 'mint', 'rhel', 'rocky'], hi: ['rhel', 'rocky'], flow: [['rh', 'rhel'], ['rhel', 'rocky']] }
        ]
      },
      cmds: [
        ['grep ^ID /etc/os-release', 'Show the distro ID and the family it is like', 'ID=ubuntu\nID_LIKE=debian'],
        ['apt --version', 'Check for apt (Debian family)', 'apt 2.7.14 (amd64)'],
        ['dnf --version', 'Check for dnf (Fedora/RHEL family)'],
        ['pacman --version', 'Check for pacman (Arch)']
      ],
      live: 'pkg',
      tips: ['<code>ID_LIKE</code> in /etc/os-release tells scripts which family a distro belongs to.']
    },
    {
      id: 'shell', title: 'The shell & terminal', sum: 'Prompt anatomy, command syntax and history.',
      explain: [
        'The <b>terminal</b> is the window; the <b>shell</b> is the program inside it that reads your commands. Most distros default to <b>bash</b>; zsh and fish are popular alternatives.',
        'The prompt <code>ssk@ubuntu:~$</code> reads as <i>user</i>@<i>host</i>:<i>current directory</i>. <code>$</code> means a normal user, <code>#</code> means root.',
        'A command has three parts: the <b>command</b>, <b>options</b> (flags starting with - or --) and <b>arguments</b> (what to act on). In <code>ls -l /etc</code>, <code>ls</code> is the command, <code>-l</code> an option and <code>/etc</code> the argument.'
      ],
      terms: [['~', 'Your home directory, e.g. /home/ssk'], ['Tab', 'Completes command and file names'], ['↑ / ↓', 'Walk through command history'], ['Ctrl+C', 'Interrupt the running command'], ['Ctrl+L', 'Clear the screen'], ['Ctrl+R', 'Search your history']],
      anim: {
        nodes: [['you', 50, 40, 'You type', 'user'], ['sh', 180, 40, 'bash parses', 'proc'], ['path', 310, 40, 'Search $PATH', 'file'], ['fork', 180, 130, 'fork + exec', 'kernel'], ['out', 180, 220, 'Output to terminal', 'user']],
        edges: [['you', 'sh'], ['sh', 'path'], ['path', 'fork'], ['fork', 'out']],
        steps: [
          { t: 'You type ls -l /etc and press Enter.', hi: ['you'] },
          { t: 'bash splits the line into words: ls, -l, /etc.', hi: ['sh'], flow: [['you', 'sh']] },
          { t: 'It looks for an executable called ls in each $PATH directory and finds /usr/bin/ls.', hi: ['path'], flow: [['sh', 'path']] },
          { t: 'bash forks a child process and execs /usr/bin/ls in it.', hi: ['fork'], flow: [['path', 'fork']] },
          { t: 'The output prints, the child exits, and the prompt returns.', hi: ['out'], flow: [['fork', 'out']] }
        ]
      },
      cmds: [
        ['echo $SHELL', 'Show your login shell', '/bin/bash'],
        ['echo $PATH', 'Directories searched for commands', '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'],
        ['which ls', 'Show which file runs for a command', '/usr/bin/ls'],
        ['type cd', 'Tell builtins from programs', 'cd is a shell builtin'],
        ['history', 'List previous commands'],
        ['whoami', 'Print your user name', 'ssk']
      ],
      demo: ['whoami', 'echo $SHELL', 'which ls'],
      tips: ['Press Tab twice to list every possible completion.', 'Start a command with a space to keep it out of history (when HISTCONTROL includes ignorespace).']
    },
    {
      id: 'help', title: 'Getting help', sum: 'man, --help, info and tldr.',
      explain: [
        'Every serious command ships documentation. <code>man ls</code> opens the manual page; press <b>/</b> to search inside it, <b>n</b> for the next match and <b>q</b> to quit.',
        'Manual pages are grouped into numbered sections: 1 user commands, 5 file formats, 8 admin commands. <code>man 5 passwd</code> shows the file format, while <code>man passwd</code> shows the command.',
        '<code>command --help</code> prints a short summary straight to the terminal. <code>tldr</code> (installable) shows community-written practical examples.'
      ],
      table: { head: ['Section', 'Contains'], rows: [['1', 'User commands'], ['5', 'File formats and config files'], ['7', 'Overviews and conventions'], ['8', 'System administration commands']] },
      cmds: [
        ['man ls', 'Open the manual for ls'],
        ['ls --help', 'Short usage summary', 'Usage: ls [OPTION]... [FILE]...\nList information about the FILEs (the current directory by default).\n  -a, --all                  do not ignore entries starting with .\n  -l                         use a long listing format\n  -h, --human-readable       with -l, print sizes like 1K 234M 2G'],
        ['man -k password', 'Search manual page names and descriptions', 'chpasswd (8)         - update passwords in batch mode\npasswd (1)           - change user password\npasswd (5)           - the password file'],
        ['whatis grep', 'One-line description of a command', 'grep (1)             - print lines that match patterns'],
        ['tldr tar', 'Practical examples (needs the tldr package)']
      ],
      flags: [['-k', 'Search descriptions (same as apropos)', 'man'], ['-f', 'One-line description (same as whatis)', 'man']],
      demo: ['whatis grep', 'man -k password']
    }
  ]
});

LV.sec({
  id: 'files', title: 'Files & filesystem', icon: 'folder', hue: 190,
  desc: 'The directory tree, moving around, copying, and how links really work.',
  topics: [
    {
      id: 'fhs', title: 'The directory tree', sum: 'Everything starts at / — what lives where.',
      explain: [
        'Linux has one tree rooted at <code>/</code>. There are no drive letters: extra disks are <b>mounted</b> into folders inside the tree.',
        'The layout follows the <b>Filesystem Hierarchy Standard</b>. Knowing it means you can find config, logs and programs on any distro.',
        'Many modern distros have merged <code>/bin</code> into <code>/usr/bin</code> and <code>/sbin</code> into <code>/usr/sbin</code>; the old paths remain as symlinks.'
      ],
      anim: {
        nodes: [['root', 180, 26, '/', 'kernel'], ['etc', 40, 100, '/etc', 'file'], ['home', 112, 100, '/home', 'user'], ['var', 184, 100, '/var', 'file'], ['usr', 256, 100, '/usr', 'file'], ['dev', 326, 100, '/dev', 'hw'], ['ssk', 112, 180, '/home/ssk', 'user'], ['log', 184, 180, '/var/log', 'file'], ['bin', 256, 180, '/usr/bin', 'proc']],
        edges: [['root', 'etc'], ['root', 'home'], ['root', 'var'], ['root', 'usr'], ['root', 'dev'], ['home', 'ssk'], ['var', 'log'], ['usr', 'bin']],
        steps: [
          { t: 'The single root directory /.', hi: ['root'] },
          { t: '/etc holds system-wide configuration text files.', hi: ['etc'], flow: [['root', 'etc']] },
          { t: '/home holds one folder per user; yours is /home/ssk (~).', hi: ['home', 'ssk'], flow: [['root', 'home'], ['home', 'ssk']] },
          { t: '/var holds data that changes: logs, caches, spools.', hi: ['var', 'log'], flow: [['root', 'var'], ['var', 'log']] },
          { t: '/usr/bin holds most installed programs.', hi: ['usr', 'bin'], flow: [['root', 'usr'], ['usr', 'bin']] },
          { t: '/dev exposes devices as files, like /dev/sda for a disk.', hi: ['dev'], flow: [['root', 'dev']] }
        ]
      },
      cmds: [
        ['ls /', 'List the top of the tree', 'bin   dev  home  lib64  mnt  proc  run   srv  tmp  var\nboot  etc  lib   media  opt  root  sbin  sys  usr'],
        ['tree -L 1 /var', 'Show one level of /var as a tree', '/var\n├── cache\n├── lib\n├── log\n├── spool\n└── tmp\n\n5 directories, 0 files'],
        ['ls -l /bin', 'See that /bin is a symlink on merged-/usr systems', 'lrwxrwxrwx 1 root root 7 Apr 22 2024 /bin -> usr/bin']
      ],
      live: 'fhs',
      tips: ['<code>/proc</code> and <code>/sys</code> are virtual: the kernel generates their contents on demand. Try <code>cat /proc/cpuinfo</code>.'],
      warn: ['<code>/tmp</code> is often cleared at reboot. Never keep anything important there.']
    },
    {
      id: 'navigate', title: 'Moving around', sum: 'pwd, cd, ls and paths.',
      explain: [
        '<code>pwd</code> prints where you are. <code>cd</code> moves you. <code>ls</code> lists what is here.',
        'An <b>absolute path</b> starts with <code>/</code> and works from anywhere (<code>/var/log</code>). A <b>relative path</b> starts from the current directory (<code>log</code>, <code>../etc</code>).',
        'Shortcuts: <code>.</code> is here, <code>..</code> is the parent, <code>~</code> is home, and <code>cd -</code> jumps back to the previous directory.'
      ],
      cmds: [
        ['pwd', 'Print the working directory', '/home/ssk'],
        ['cd /var/log', 'Go to an absolute path'],
        ['cd ..', 'Go up one level'],
        ['cd ~', 'Go home'],
        ['cd -', 'Go back to the previous directory'],
        ['ls -la', 'Long list including hidden dot-files'],
        ['ls -lh', 'Long list with human-readable sizes'],
        ['ls -lt', 'Long list sorted by modification time, newest first']
      ],
      flags: [['-l', 'Long format: permissions, owner, size, date', 'ls'], ['-a', 'Include hidden files (names starting with .)', 'ls'], ['-h', 'Human-readable sizes (K, M, G)', 'ls'], ['-t', 'Sort by time', 'ls'], ['-R', 'Recurse into subdirectories', 'ls']],
      anim: {
        nodes: [['r', 180, 26, '/', 'kernel'], ['h', 100, 100, 'home', 'file'], ['v', 260, 100, 'var', 'file'], ['s', 100, 180, 'ssk  (~)', 'user'], ['l', 260, 180, 'log', 'file']],
        edges: [['r', 'h'], ['r', 'v'], ['h', 's'], ['v', 'l']],
        steps: [
          { t: 'You start at ~ (/home/ssk). pwd prints /home/ssk.', hi: ['s'] },
          { t: 'cd .. goes up to /home.', hi: ['h'], flow: [['s', 'h']] },
          { t: 'cd /var/log is absolute: up to / then down into var/log.', hi: ['l'], flow: [['h', 'r'], ['r', 'v'], ['v', 'l']] },
          { t: 'cd - jumps straight back to the previous directory, /home.', hi: ['h'] },
          { t: 'cd with no argument (or cd ~) always takes you home.', hi: ['s'], flow: [['h', 's']] }
        ]
      },
      demo: ['pwd', 'ls -la', 'cd /var/log', 'pwd'],
      tips: ['Hidden files are simply names that start with a dot, like <code>.bashrc</code>.']
    },
    {
      id: 'fileops', title: 'Create, copy, move, delete', sum: 'touch, mkdir, cp, mv, rm with safety habits.',
      explain: [
        '<code>touch</code> creates an empty file (or updates its time). <code>mkdir -p</code> creates a directory and any missing parents.',
        '<code>cp</code> copies, <code>mv</code> moves or renames, <code>rm</code> deletes. Directories need <code>-r</code> (recursive) for cp and rm.',
        'There is no recycle bin in the shell. <code>rm</code> is immediate. Use <code>-i</code> to be asked before each deletion while you learn.'
      ],
      cmds: [
        ['touch notes.txt', 'Create an empty file'],
        ['mkdir -p projects/web/css', 'Create nested directories in one go'],
        ['cp notes.txt notes.bak', 'Copy a file'],
        ['cp -r projects backup', 'Copy a directory recursively'],
        ['mv notes.bak old-notes.txt', 'Rename a file'],
        ['mv old-notes.txt /tmp/', 'Move a file into another directory'],
        ['rm -i old-notes.txt', 'Delete with confirmation'],
        ['rm -r backup', 'Delete a directory and its contents'],
        ['rmdir emptydir', 'Delete an empty directory only']
      ],
      flags: [['-r', 'Recursive (directories)', 'cp, rm'], ['-i', 'Ask before overwriting or deleting', 'cp, mv, rm'], ['-v', 'Show each action', 'cp, mv, rm'], ['-p', 'Create parents / preserve attributes', 'mkdir / cp'], ['-n', 'Never overwrite an existing file', 'cp, mv'], ['-a', 'Archive: recursive and preserve everything', 'cp']],
      demo: ['mkdir -p lab/demo', 'touch lab/demo/a.txt', 'cp lab/demo/a.txt lab/b.txt', 'ls -R lab'],
      warn: ['<code>rm -rf /</code> or a mistyped path with <code>-rf</code> can wipe a system. Read every rm -r command twice before pressing Enter.']
    },
    {
      id: 'links', title: 'Hard links vs symlinks', sum: 'Inodes, names and pointers.',
      explain: [
        'A file\'s data and metadata live in an <b>inode</b>. A file name is just a directory entry that points at an inode.',
        'A <b>hard link</b> is a second name for the same inode. Delete one name and the data survives through the other. Hard links cannot cross filesystems or point at directories.',
        'A <b>symbolic link</b> (symlink) is a tiny file containing a path. It can point anywhere, including directories, but breaks if the target moves.'
      ],
      anim: {
        nodes: [['a', 60, 50, 'report.txt', 'file'], ['b', 60, 130, 'hard.txt', 'file'], ['s', 60, 210, 'soft.txt →', 'user'], ['i', 270, 90, 'inode 4012 (data)', 'kernel']],
        edges: [['a', 'i'], ['b', 'i'], ['s', 'a']],
        hide: ['b', 's'],
        steps: [
          { t: 'report.txt is a name pointing to inode 4012.', hi: ['a', 'i'], flow: [['a', 'i']] },
          { t: 'ln report.txt hard.txt adds a second name for the same inode. Link count becomes 2.', show: ['b'], hi: ['b', 'i'], flow: [['b', 'i']] },
          { t: 'ln -s report.txt soft.txt makes a symlink: it stores the path "report.txt", not the inode.', show: ['b', 's'], hi: ['s'], flow: [['s', 'a']] },
          { t: 'rm report.txt: the hard link still reaches the data, but the symlink now dangles.', show: ['b', 's'], hi: ['b', 'i'], dim: ['a'], flow: [['b', 'i']] }
        ]
      },
      cmds: [
        ['ln report.txt hard.txt', 'Create a hard link'],
        ['ln -s report.txt soft.txt', 'Create a symbolic link'],
        ['ls -li', 'Show inode numbers and link counts', '4012 -rw-r--r-- 2 ssk ssk 120 Nov  5 10:02 hard.txt\n4012 -rw-r--r-- 2 ssk ssk 120 Nov  5 10:02 report.txt\n4019 lrwxrwxrwx 1 ssk ssk  10 Nov  5 10:03 soft.txt -> report.txt'],
        ['readlink -f soft.txt', 'Resolve a symlink to its full target path', '/home/ssk/report.txt']
      ],
      flags: [['-s', 'Symbolic instead of hard link', 'ln'], ['-f', 'Replace an existing destination', 'ln'], ['-i', 'Show inode numbers', 'ls']],
      tips: ['In <code>ls -l</code>, the number after the permissions is the hard link count.']
    }
  ]
});

LV.sec({
  id: 'perms', title: 'Permissions & users', icon: 'eye', hue: 350,
  desc: 'rwx bits, chmod, ownership, umask, sudo and user accounts.',
  topics: [
    {
      id: 'chmod', title: 'rwx and chmod', sum: 'Read the permission string and change it.',
      explain: [
        '<code>ls -l</code> shows a 10-character string such as <code>-rwxr-x---</code>. The first character is the type (<code>-</code> file, <code>d</code> directory, <code>l</code> link). Then three triplets: <b>user</b> (owner), <b>group</b>, <b>others</b>.',
        'Each triplet is <b>r</b> read (4), <b>w</b> write (2), <b>x</b> execute (1). Add them for octal: rwx = 7, r-x = 5, r-- = 4. So <code>rwxr-x---</code> is <b>750</b>.',
        'On a directory, <b>r</b> lists names, <b>w</b> creates or deletes entries, and <b>x</b> lets you enter it with cd.',
        '<code>chmod</code> takes octal (<code>chmod 640 file</code>) or symbolic changes (<code>chmod u+x,g-w file</code>). Try every combination in the Live tab.'
      ],
      anim: {
        nodes: [['t', 30, 60, '-', 'file'], ['u', 110, 60, 'rwx', 'user'], ['g', 200, 60, 'r-x', 'proc'], ['o', 290, 60, '---', 'hw'], ['u7', 110, 160, '4+2+1 = 7', 'user'], ['g5', 200, 160, '4+0+1 = 5', 'proc'], ['o0', 290, 160, '0 = 0', 'hw'], ['res', 200, 236, 'chmod 750', 'kernel']],
        edges: [['u', 'u7'], ['g', 'g5'], ['o', 'o0'], ['g5', 'res']],
        hide: ['u7', 'g5', 'o0', 'res'],
        steps: [
          { t: 'The first character is the file type: - is a regular file.', hi: ['t'] },
          { t: 'Owner triplet rwx: read 4 + write 2 + execute 1 = 7.', show: ['u7'], hi: ['u', 'u7'], flow: [['u', 'u7']] },
          { t: 'Group triplet r-x: 4 + 0 + 1 = 5.', show: ['u7', 'g5'], hi: ['g', 'g5'], flow: [['g', 'g5']] },
          { t: 'Others triplet ---: 0.', show: ['u7', 'g5', 'o0'], hi: ['o', 'o0'], flow: [['o', 'o0']] },
          { t: 'Together: chmod 750 sets -rwxr-x---.', show: ['u7', 'g5', 'o0', 'res'], hi: ['res'] }
        ]
      },
      cmds: [
        ['ls -l deploy.sh', 'See current permissions', '-rw-r--r-- 1 ssk ssk 214 Nov  5 09:41 deploy.sh'],
        ['chmod +x deploy.sh', 'Make a script executable for everyone'],
        ['chmod u+x deploy.sh', 'Make it executable for the owner only'],
        ['chmod 750 deploy.sh', 'Owner rwx, group r-x, others nothing'],
        ['chmod 600 ~/.ssh/id_ed25519', 'Private key readable by owner only'],
        ['chmod -R g+w shared/', 'Add group write recursively'],
        ['stat -c "%A %a %n" deploy.sh', 'Show symbolic and octal permissions', '-rwxr-x--- 750 deploy.sh']
      ],
      flags: [['u g o a', 'Who: user, group, others, all', 'chmod'], ['+ - =', 'Add, remove, set exactly', 'chmod'], ['-R', 'Recursive', 'chmod'], ['-c', 'Report only changes', 'chmod']],
      live: 'chmod',
      demo: ['ls -l', 'chmod 750 scripts/hello.sh', 'ls -l scripts'],
      table: { head: ['Octal', 'Meaning', 'Typical use'], rows: [['644', 'rw-r--r--', 'Normal files'], ['755', 'rwxr-xr-x', 'Programs, directories'], ['600', 'rw-------', 'Private keys, secrets'], ['700', 'rwx------', 'Private directories']] },
      warn: ['Avoid <code>chmod 777</code>. It lets every user on the system change or replace the file.']
    },
    {
      id: 'owner', title: 'Ownership', sum: 'chown, chgrp and groups.',
      explain: [
        'Every file has an <b>owner</b> and a <b>group</b>. Permissions are checked in order: if you are the owner, the user triplet applies; else if you are in the group, the group triplet; else others.',
        '<code>chown user:group file</code> changes both. Only root can give a file away, so it usually runs with sudo.'
      ],
      cmds: [
        ['sudo chown ssk:www-data site/', 'Change owner and group'],
        ['sudo chown -R ssk site/', 'Change owner recursively'],
        ['sudo chgrp developers app.conf', 'Change group only'],
        ['id', 'Your UID, GID and groups', 'uid=1000(ssk) gid=1000(ssk) groups=1000(ssk),4(adm),27(sudo),100(users)'],
        ['groups', 'Groups you belong to', 'ssk adm sudo users']
      ],
      flags: [['-R', 'Recursive', 'chown'], ['user:group', 'Set both at once; :group alone sets the group', 'chown']],
      anim: {
        nodes: [['p', 60, 40, 'Process (uid ssk)', 'proc'], ['q1', 180, 110, 'Owner = ssk?', 'kernel'], ['q2', 180, 180, 'In file group?', 'kernel'], ['u', 320, 110, 'use user bits', 'user'], ['g', 320, 180, 'use group bits', 'user'], ['o', 180, 246, 'use other bits', 'user']],
        edges: [['p', 'q1'], ['q1', 'u'], ['q1', 'q2'], ['q2', 'g'], ['q2', 'o']],
        steps: [
          { t: 'A process running as ssk tries to open a file.', hi: ['p'] },
          { t: 'The kernel first asks: does ssk own the file?', hi: ['q1'], flow: [['p', 'q1']] },
          { t: 'If yes, only the user triplet is checked, even if group bits are more generous.', hi: ['u'], flow: [['q1', 'u']] },
          { t: 'If not, is ssk a member of the file\'s group? Then the group triplet decides.', hi: ['q2', 'g'], flow: [['q1', 'q2'], ['q2', 'g']] },
          { t: 'Otherwise the others triplet decides.', hi: ['o'], flow: [['q2', 'o']] }
        ]
      },
      demo: ['id', 'groups'],
      note: 'The admin group is <code>sudo</code> on Debian/Ubuntu and <code>wheel</code> on Fedora, RHEL, Arch and openSUSE.'
    },
    {
      id: 'umask', title: 'umask: default permissions', sum: 'Why new files are 644 and new directories 755.',
      explain: [
        'New files start from a base of <b>666</b> and new directories from <b>777</b>. The <b>umask</b> removes bits from that base.',
        'With the common umask <code>022</code>, files become 644 and directories 755. A stricter <code>077</code> gives 600 and 700.',
        'Set it per session with <code>umask 027</code>, or permanently in <code>~/.bashrc</code>.'
      ],
      cmds: [
        ['umask', 'Show the current mask (octal)', '0022'],
        ['umask -S', 'Show what the mask allows, symbolically', 'u=rwx,g=rx,o=rx'],
        ['umask 077', 'Make new files private for this shell']
      ],
      live: 'umask',
      demo: ['umask', 'umask -S']
    },
    {
      id: 'sudo', title: 'root, sudo and su', sum: 'Running commands as administrator safely.',
      explain: [
        '<b>root</b> (UID 0) can do anything. Working as root all the time makes every typo dangerous.',
        '<code>sudo command</code> runs one command as root after asking for <i>your</i> password, and logs it. Who may use sudo is set in <code>/etc/sudoers</code>; edit it only with <code>visudo</code>.',
        '<code>su -</code> switches to another user (root by default) and needs <i>that user\'s</i> password. <code>sudo -i</code> opens a root login shell using your own password.'
      ],
      cmds: [
        ['sudo apt update', 'Run one command as root (Debian/Ubuntu)'],
        ['sudo -l', 'List what you are allowed to run with sudo', 'User ssk may run the following commands on ubuntu:\n    (ALL : ALL) ALL'],
        ['sudo -i', 'Open a root login shell'],
        ['su - ssk', 'Switch to user ssk with a login environment'],
        ['sudo visudo', 'Safely edit sudoers with syntax checking'],
        ['sudo usermod -aG sudo ssk', 'Grant sudo on Debian/Ubuntu (group sudo)'],
        ['sudo usermod -aG wheel ssk', 'Grant sudo on Fedora/RHEL/Arch (group wheel)']
      ],
      flags: [['-i', 'Login shell as target user', 'sudo'], ['-u user', 'Run as a user other than root', 'sudo'], ['-l', 'List your privileges', 'sudo'], ['-', 'Full login environment', 'su']],
      demo: ['whoami', 'sudo whoami'],
      warn: ['A syntax error in /etc/sudoers can lock everyone out of sudo. Always use visudo.']
    },
    {
      id: 'users', title: 'Users & groups', sum: 'useradd, passwd, /etc/passwd and /etc/shadow.',
      explain: [
        'Accounts are listed in <code>/etc/passwd</code> (readable by all) with password hashes kept separately in <code>/etc/shadow</code> (root only). Groups live in <code>/etc/group</code>.',
        'Each passwd line has seven fields separated by colons: name, x, UID, GID, comment, home, shell.',
        '<code>useradd -m</code> creates a user with a home directory. On Debian/Ubuntu the friendlier <code>adduser</code> asks questions interactively.'
      ],
      table: { head: ['Field', 'Example'], rows: [['name', 'ssk'], ['password', 'x (stored in /etc/shadow)'], ['UID', '1000'], ['GID', '1000'], ['comment', 'SSK'], ['home', '/home/ssk'], ['shell', '/bin/bash']] },
      cmds: [
        ['sudo useradd -m -s /bin/bash dev1', 'Create user dev1 with home and bash'],
        ['sudo passwd dev1', 'Set or change a user password'],
        ['sudo usermod -aG docker dev1', 'Append dev1 to the docker group'],
        ['sudo userdel -r dev1', 'Delete the user and their home'],
        ['grep ssk /etc/passwd', 'Show your account line', 'ssk:x:1000:1000:SSK:/home/ssk:/bin/bash'],
        ['getent group sudo', 'Show members of a group', 'sudo:x:27:ssk'],
        ['sudo groupadd developers', 'Create a group']
      ],
      flags: [['-m', 'Create home directory', 'useradd'], ['-s', 'Login shell', 'useradd'], ['-aG', 'Append to supplementary groups', 'usermod'], ['-r', 'Remove home directory', 'userdel'], ['-L / -U', 'Lock / unlock an account', 'usermod']],
      demo: ['grep ssk /etc/passwd', 'id'],
      warn: ['<code>usermod -G</code> without <code>-a</code> replaces all supplementary groups and can remove you from sudo.'],
      tips: ['Group changes take effect at your next login. Run <code>newgrp docker</code> to use one immediately.']
    }
  ]
});

LV.tool({
  uname: { syntax: 'uname [OPTION]...', desc: 'Print kernel and system information.' },
  ls: { syntax: 'ls [OPTION]... [FILE]...', desc: 'List directory contents.' },
  cd: { syntax: 'cd [DIR]', desc: 'Change the shell working directory (shell builtin).' },
  pwd: { syntax: 'pwd', desc: 'Print the name of the current working directory.' },
  cp: { syntax: 'cp [OPTION]... SOURCE... DEST', desc: 'Copy files and directories.' },
  mv: { syntax: 'mv [OPTION]... SOURCE... DEST', desc: 'Move or rename files.' },
  rm: { syntax: 'rm [OPTION]... FILE...', desc: 'Remove files or directories.' },
  mkdir: { syntax: 'mkdir [OPTION]... DIRECTORY...', desc: 'Make directories.' },
  touch: { syntax: 'touch [OPTION]... FILE...', desc: 'Create empty files or update timestamps.' },
  ln: { syntax: 'ln [OPTION]... TARGET LINK_NAME', desc: 'Make hard or symbolic links between files.' },
  chmod: { syntax: 'chmod [OPTION]... MODE FILE...', desc: 'Change file mode (permission) bits.' },
  chown: { syntax: 'chown [OPTION]... [OWNER][:[GROUP]] FILE...', desc: 'Change file owner and group.' },
  umask: { syntax: 'umask [-S] [MODE]', desc: 'Show or set the file creation mask (shell builtin).' },
  sudo: { syntax: 'sudo [OPTION]... COMMAND', desc: 'Execute a command as another user, root by default.' },
  su: { syntax: 'su [OPTION] [-] [USER]', desc: 'Switch user.' },
  useradd: { syntax: 'useradd [OPTIONS] LOGIN', desc: 'Create a new user.' },
  usermod: { syntax: 'usermod [OPTIONS] LOGIN', desc: 'Modify a user account.' },
  man: { syntax: 'man [SECTION] PAGE', desc: 'Open the reference manual.' },
  whoami: { syntax: 'whoami', desc: 'Print the effective user name.' },
  id: { syntax: 'id [USER]', desc: 'Print user and group IDs.' },
  which: { syntax: 'which COMMAND...', desc: 'Locate the program file for a command.' },
  tree: { syntax: 'tree [-L level] [DIR]', desc: 'List contents of directories in a tree format.' },
  stat: { syntax: 'stat [OPTION]... FILE...', desc: 'Display file or filesystem status.' }
});
