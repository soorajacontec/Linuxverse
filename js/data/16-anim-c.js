/* 25 extra diagrams for topics that already have one: a second way to look at the same subject (see 14-anim-a.js for the helper). */
(function () {
  'use strict';
  var A = window.A;

  A('what-is-linux', 'The layers of a Linux system', ['us|you and your apps|u|0|2', 'sh|shell and core tools|p|1|2', 'lb|libraries (glibc)|p|2|2', 'kr|Linux kernel|k|3|2'],
    'us>sh sh>lb lb>kr', 'sh lb kr', [
      ['At the top are you and your programs: a browser, an editor, a terminal.', 'us'],
      ['The shell and tools such as ls and grep, mostly from GNU, let you drive the system.', '', 'us>sh'],
      ['Programs call shared libraries, the biggest being the C library glibc.', '', 'sh>lb'],
      ['Libraries make system calls to the kernel, which manages memory, processes, files and devices.', '', 'lb>kr'],
      ['Strictly speaking, Linux is only the kernel. A distribution bundles it with all the rest.', 'kr']]);

  A('distros', 'Distribution families', ['de|Debian|f|0|2', 'ub|Ubuntu|f|1|0', 'mi|Linux Mint|f|2|0', 'rh|Red Hat Enterprise|f|1|1', 'fe|Fedora|f|2|1', 'ro|Rocky / Alma|f|3|1'],
    'de>ub ub>mi fe>rh rh>ro', 'ub mi rh fe ro', [
      ['Distributions come in families. Debian is one of the oldest, built from .deb packages and apt.', 'de'],
      ['Ubuntu is based on Debian, and Linux Mint on Ubuntu. They share packages and commands.', '', 'de>ub ub>mi'],
      ['Red Hat is another family, built from .rpm packages and dnf.', 'rh'],
      ['Fedora tests new features first; Rocky and Alma rebuild the Red Hat enterprise releases.', '', 'fe>rh rh>ro'],
      ['Commands like ls and grep are the same everywhere. The package manager and some paths differ.', 'ub rh']]);

  A('shell', 'Life of one command', ['ty|you type ls -l|u|0|2', 'pa|shell splits the line|p|1|0', 'ex|expands $VARS and *.txt|p|1|1', 'pt|finds ls in $PATH|k|2|0', 'fk|fork + exec|k|2|1', 'ou|output, then exit code|f|3|2'],
    'ty>pa pa>ex ex>pt pt>fk fk>ou', 'pa ex pt fk ou', [
      ['You type a line and press Enter.', 'ty'],
      ['The shell splits it into words: the command and its arguments.', '', 'ty>pa'],
      ['It expands variables, wildcards, braces and quotes before anything runs.', '', 'pa>ex'],
      ['It looks for the command: aliases, built-ins, then each folder of $PATH.', '', 'ex>pt'],
      ['It forks a child process and runs the program in it, then waits.', '', 'pt>fk'],
      ['Output appears and the exit code is stored in $?.', '', 'fk>ou']]);

  A('fhs', 'Where an installed program puts things', ['pk|apt install nginx|u|0|2', 'bn|/usr/sbin/nginx (program)|f|1|0', 'cf|/etc/nginx (config)|f|1|1', 'lg|/var/log/nginx (logs)|f|2|0', 'wb|/var/www (site data)|f|2|1', 'hm|/home/ssk (your files)|f|3|2'],
    'pk>bn pk>cf pk>lg pk>wb', 'bn cf lg wb hm', [
      ['A package spreads its files over the standard directory tree, each folder with a job.', 'pk'],
      ['/usr holds programs and libraries. They are read-only in normal use.', '', 'pk>bn'],
      ['/etc holds the configuration as plain text.', '', 'pk>cf'],
      ['/var holds data that changes: logs, caches and spools.', '', 'pk>lg'],
      ['Site content goes to /var/www or /srv.', '', 'pk>wb'],
      ['Your own files stay in /home, so system upgrades never touch them.', 'hm']]);

  A('navigate', 'Resolving a relative path', ['cw|you are in /home/ssk/site/css|u|0|2', 'cm|cd ../logs|p|1|2', 'up|parent /home/ssk/site|k|2|0', 'dn|then logs inside it|k|2|1', 'nw|new directory|f|3|2'],
    'cw>cm cm>up up>dn dn>nw', 'up dn nw', [
      ['Relative paths start from where you are, the current directory.', 'cw'],
      ['You type cd ../logs.', '', 'cw>cm'],
      ['.. means the parent, so we step up from css to /home/ssk/site.', '', 'cm>up'],
      ['Then logs means a folder named logs inside it.', '', 'up>dn'],
      ['pwd prints /home/ssk/site/logs. An absolute path would start with / and work from anywhere.', '', 'dn>nw']]);

  A('fileops', 'mv across two disks', ['s|/home/ssk/big.iso|f|0|0', 'sm|mv big.iso /mnt/usb/|p|0|1', 'cp|copy all data|k|1|2', 'dl|then delete the original|k|2|2', 'd|/mnt/usb/big.iso|f|3|2'],
    's>sm sm>cp cp>d d>dl dl>s', 'cp dl d', [
      ['On the same filesystem, mv only changes a directory entry. It is instant.', 's'],
      ['Between two disks the data really has to move, so mv behaves like a copy.', '', 's>sm sm>cp'],
      ['All the data is copied to the new disk.', '', 'cp>d'],
      ['Only after that succeeds is the original removed.', '', 'd>dl dl>s'],
      ['A big move can take a while, and an interrupted one can leave a partial copy. Compare with cmp or rsync first.', 'd']]);

  A('links', 'What happens when the target is deleted', ['fl|report.txt (the data)|f|0|2', 'hl|hard link copy.txt|f|1|0', 'sl|symlink short.txt|f|1|1', 'rm|rm report.txt|p|2|2', 'ok|copy.txt still works|f|3|0', 'br|short.txt is broken|h|3|1'],
    'hl>fl sl>fl rm>fl fl>ok fl>br', 'rm ok br', [
      ['A hard link is a second name for the same data. A symlink is a small file that stores a path.', 'hl sl'],
      ['Both open report.txt right now.', '', 'hl>fl sl>fl'],
      ['Now delete the original name: rm report.txt.', '', 'rm>fl'],
      ['The hard link keeps the data alive. The data is freed only when the last name is gone.', '', 'fl>ok'],
      ['The symlink still stores the path, but nothing is there any more: No such file or directory.', '', 'fl>br']]);

  A('archives', 'Unpacking a .tar.gz', ['ar|site.tar.gz|f|0|2', 'gz|gzip -dc (decompress)|p|1|0', 'tr|tar x (unbundle)|p|1|1', 'fl|files and folders|f|2|2', 'wr|check with tar -tzf first|u|3|2'],
    'ar>gz gz>tr tr>fl wr>ar', 'gz tr fl wr', [
      ['A .tar.gz is two steps in one: files bundled by tar, then compressed by gzip.', 'ar'],
      ['tar -xzf first undoes the compression with gzip.', '', 'ar>gz'],
      ['Then tar takes the single stream apart into the original files and folders.', '', 'gz>tr'],
      ['They appear in the current folder, or in the one you name with -C.', '', 'tr>fl'],
      ['Look before you unpack: tar -tzf lists the contents, so nothing surprises you.', '', 'wr>ar']]);

  A('backups', 'How rsync sends only changes', ['sr|source folder|f|0|0', 'ds|destination copy|f|0|1', 'cm|compare size and time|p|1|2', 'ch|only changed files|k|2|2', 'up|destination up to date|f|3|2'],
    'sr>cm ds>cm cm>ch ch>up', 'cm ch up', [
      ['The first run copies everything to the destination.', 'sr ds'],
      ['Later runs compare the source and the destination, by size and modification time.', '', 'sr>cm ds>cm'],
      ['Files that are identical are skipped. Only new or changed files are picked.', '', 'cm>ch'],
      ['Only those travel, and large files can be sent as differences.', '', 'ch>up'],
      ['The destination matches the source. --delete also removes files that no longer exist, so try --dry-run first.', 'up']]);

  A('chmod', 'chmod 754, bit by bit', ['ow|owner 7 = rwx|k|0|0', 'gr|group 5 = r-x|k|0|1', 'ot|others 4 = r--|k|1|2', 'bi|r=4 w=2 x=1|f|2|2', 'ls|-rwxr-xr--|f|3|2'],
    'ow>bi gr>bi ot>bi bi>ls', 'bi ls', [
      ['A mode is three numbers, one for owner, group and others.', 'ow gr ot'],
      ['Each permission has a value: read is 4, write is 2, execute is 1.', 'bi'],
      ['Owner 7 = 4+2+1, so rwx: full access.', '', 'ow>bi'],
      ['Group 5 = 4+1, so r-x: read and run, but not write.', '', 'gr>bi'],
      ['Others 4 means read only. The listing shows -rwxr-xr--.', '', 'ot>bi bi>ls']]);

  A('owner', 'A shared team folder', ['mk|mkdir shared|p|0|2', 'gp|chgrp dev shared|p|1|0', 'md|chmod 2775 shared|p|1|1', 'a|alex creates a.txt|u|2|0', 'b|bea creates b.txt|u|2|1', 'rs|both files get group dev|f|3|2'],
    'mk>gp mk>md gp>a md>a gp>b md>b a>rs b>rs', 'a b rs', [
      ['A team needs a folder everyone can write to. Start with mkdir shared.', 'mk'],
      ['chgrp dev gives the folder to the group dev.', '', 'mk>gp'],
      ['chmod 2775: the 2 is the setgid bit, so new files inherit the folder\'s group; 775 lets the group write.', '', 'mk>md'],
      ['alex and bea each create a file in it.', '', 'gp>a md>a gp>b md>b'],
      ['Both files belong to group dev automatically, so the whole team can edit them.', '', 'a>rs b>rs']]);

  A('umask', 'umask 077: private by default', ['pr|program asks 666 for a file|u|0|2', 'um|umask 077 removes group + others|k|1|2', 'fl|new file gets 600|f|2|0', 'dr|new folder gets 700|f|2|1', 'ls|ls -l: -rw-------|u|3|2'],
    'pr>um um>fl um>dr fl>ls dr>ls', 'um fl dr ls', [
      ['Programs create files with the most generous mode: 666 for files, 777 for folders.', 'pr'],
      ['umask 077 subtracts every permission from group and others.', '', 'pr>um'],
      ['A new file ends up 600: only you can read and write it.', '', 'um>fl'],
      ['A new folder ends up 700: only you can enter it.', '', 'um>dr'],
      ['ls -l shows it. Put umask 077 in ~/.bashrc to make it permanent for you.', '', 'fl>ls dr>ls']]);

  A('sudo', 'su, sudo and sudo -i', ['u|ssk|u|0|2', 'su|su: root password|p|1|0', 'sd|sudo: one command|p|1|1', 'si|sudo -i: root shell|p|2|0', 'lg|every sudo is logged|f|2|1', 'rt|root powers|k|3|2'],
    'u>su u>sd u>si su>rt sd>rt si>rt sd>lg', 'su sd si lg rt', [
      ['Three ways to get root powers from a normal account.', 'u'],
      ['su asks for the root password and gives you a root shell. Everyone must share that password.', '', 'u>su su>rt'],
      ['sudo command asks for your own password and runs a single command as root.', '', 'u>sd sd>rt'],
      ['sudo -i opens a root login shell, still checked through sudo rules.', '', 'u>si si>rt'],
      ['sudo writes a log line for each use, so you can see who did what.', '', 'sd>lg']]);

  A('pipes', 'The three streams', ['in|stdin (0) keyboard or file|f|0|0', 'pr|the program|p|1|2', 'ou|stdout (1): screen|f|2|0', 'er|stderr (2): screen|f|2|1', 'fl|> out.txt  2> err.txt|f|3|2'],
    'in>pr pr>ou pr>er ou>fl er>fl', 'ou er fl', [
      ['Every program has three channels: input, normal output and error output.', 'in pr'],
      ['stdin, number 0, normally comes from the keyboard. A pipe or < can feed it.', '', 'in>pr'],
      ['stdout, number 1, carries the results to the screen.', '', 'pr>ou'],
      ['stderr, number 2, carries error messages, also to the screen by default.', '', 'pr>er'],
      ['Redirect them separately: > sends stdout to a file, 2> sends stderr. A pipe | passes only stdout.', '', 'ou>fl er>fl']]);

  A('grep', 'grep -r through a folder tree', ['st|grep -rn TODO src/|u|0|2', 'wk|walk every file|p|1|0', 'ln|test each line|k|1|1', 'mt|file:line:match|f|2|2', 'hl|--color highlights it|u|3|2'],
    'st>wk wk>ln ln>mt mt>hl', 'wk ln mt hl', [
      ['-r tells grep to search folders, not just one file.', 'st'],
      ['It visits every file under src/.', '', 'st>wk'],
      ['In each file it tests every line against the pattern.', '', 'wk>ln'],
      ['Matches print as file:line:text because of -n and the multi-file search.', '', 'ln>mt'],
      ['Add -i to ignore case, -l to list only file names, and --include "*.py" to limit file types.', '', 'mt>hl']]);

  A('sortuniq', 'Ranking pipeline', ['f|access.log|f|0|0', 'aw|awk print $1|p|0|1', 'so|sort|p|1|0', 'un|uniq -c|p|1|1', 'rk|sort -rn | head -3|p|2|2', 'to|top 3 visitors|f|3|2'],
    'f>aw aw>so so>un un>rk rk>to', 'aw so un rk to', [
      ['Question: who visits most? The first column of each line is the visitor.', 'f'],
      ['awk keeps just that column.', '', 'f>aw'],
      ['sort puts equal addresses next to each other. uniq only merges neighbours, so this step is essential.', '', 'aw>so'],
      ['uniq -c collapses repeats and prefixes the count.', '', 'so>un'],
      ['sort -rn orders by count, highest first, and head keeps three.', '', 'un>rk'],
      ['The same recipe ranks users, errors or any repeated text.', '', 'rk>to']]);

  A('editors', 'vim modes', ['nm|Normal mode|k|0|2', 'im|Insert mode (press i)|p|1|0', 'cm|Command line (press :)|p|1|1', 'sv|:wq saves and quits|f|2|2', 'qu|:q! quits without saving|f|3|2'],
    'nm>im im>nm nm>cm cm>sv cm>qu', 'im cm sv qu', [
      ['vim starts in Normal mode: keys are commands, not text. This is why typing seems to do odd things.', 'nm'],
      ['Press i to enter Insert mode and type text as usual.', '', 'nm>im'],
      ['Press Esc to return to Normal mode.', '', 'im>nm'],
      ['Press : to type a command at the bottom.', '', 'nm>cm'],
      [':wq writes the file and quits. :q! quits and throws away changes. Stuck? Esc, then :q!', '', 'cm>sv cm>qu']]);

  A('ps', 'fork and exec', ['bs|bash (PID 2210)|p|0|2', 'fk|fork: a copy of bash|k|1|0', 'ex|exec: becomes ls|k|1|1', 'ls|ls (PID 2390)|p|2|2', 'wt|bash waits, then prompts|u|3|2'],
    'bs>fk fk>ex ex>ls ls>wt bs>wt', 'fk ex ls wt', [
      ['bash wants to run ls. It cannot just become ls: it must stay alive.', 'bs'],
      ['So it forks: the kernel makes a copy of the process.', '', 'bs>fk'],
      ['In the copy, exec replaces the program with ls. The PID stays the same.', '', 'fk>ex'],
      ['ls runs as a child process with its own PID. ps and pstree show the parent and child.', '', 'ex>ls'],
      ['When it ends, bash collects the exit code and shows the prompt again.', '', 'ls>wt']]);

  A('signals', 'Ctrl+C, Ctrl+Z and kill', ['kb|keyboard|u|0|0', 'tt|terminal|k|0|1', 'pr|running program|p|1|2', 'tm|Ctrl+C: SIGINT, ends|f|2|0', 'sp|Ctrl+Z: SIGTSTP, paused|f|2|1', 'kl|kill -9: SIGKILL, forced|f|3|2'],
    'kb>tt tt>pr pr>tm pr>sp kl>pr', 'tm sp kl', [
      ['Your keystrokes go to the terminal, which turns some of them into signals.', '', 'kb>tt'],
      ['The terminal sends the signal to the foreground program.', '', 'tt>pr'],
      ['Ctrl+C sends SIGINT: stop what you are doing. Most programs exit.', '', 'pr>tm'],
      ['Ctrl+Z sends SIGTSTP: pause. The job is stopped, not ended; bg or fg resumes it.', '', 'pr>sp'],
      ['kill -9 sends SIGKILL, which cannot be caught. Use it only when polite signals fail.', '', 'kl>pr']]);

  A('jobs', 'Keeping a job alive after logout', ['ss|ssh session|u|0|2', 'jb|long job|p|1|0', 'nh|nohup or tmux|p|1|1', 'lo|you log out|h|2|2', 'dd|plain job: SIGHUP, dies|f|3|0', 'al|protected job runs on|f|3|1'],
    'ss>jb ss>nh ss>lo lo>dd lo>al jb>dd nh>al', 'lo dd al', [
      ['You start a long job over SSH.', '', 'ss>jb'],
      ['If you start it normally it belongs to your session. With nohup, or inside tmux, it is protected.', '', 'ss>nh'],
      ['You log out or the connection drops. The session ends.', '', 'ss>lo'],
      ['A plain job receives SIGHUP and dies, often halfway.', '', 'lo>dd jb>dd'],
      ['A nohup or tmux job ignores it and carries on. Reattach later with tmux attach.', '', 'lo>al nh>al']]);

  A('nice', 'Sharing the CPU by weight', ['cp|one CPU core|h|0|2', 'a|compile (nice 0)|p|1|0', 'b|backup (nice 10)|p|1|1', 'sh|scheduler weights 1024 : 110|k|2|2', 'rs|about 90 percent vs 10 percent|f|3|2'],
    'a>cp b>cp cp>sh sh>rs', 'sh rs', [
      ['Two CPU-hungry programs compete for one core.', 'cp a b'],
      ['Linux does not run one first. It slices time between them.', '', 'a>cp b>cp'],
      ['Each process has a weight from its nice value: nice 0 is 1024, nice 10 only about 110.', '', 'cp>sh'],
      ['The compile gets roughly 90 percent of the CPU, the backup about 10 percent.', '', 'sh>rs'],
      ['nice makes a job polite and keeps the machine responsive. Only root can use negative values.', 'b']]);

  A('pkgmgr', 'Installing with dependencies', ['cmd|apt install nginx|u|0|2', 'db|read package lists|k|1|0', 'dp|work out dependencies|k|1|1', 'dl|download + verify signatures|p|2|2', 'in|unpack + run setup scripts|p|3|0', 'ok|nginx installed|f|3|1'],
    'cmd>db db>dp dp>dl dl>in in>ok', 'db dp dl in ok', [
      ['You ask for one package by name.', 'cmd'],
      ['The package manager looks it up in its lists, which apt update refreshed.', '', 'cmd>db'],
      ['It works out everything nginx needs and the exact versions.', '', 'db>dp'],
      ['It downloads the packages and checks their cryptographic signatures.', '', 'dp>dl'],
      ['It unpacks them and runs the configuration scripts.', '', 'dl>in'],
      ['The package manager remembers what is installed, so removal and upgrades are clean.', '', 'in>ok']]);

  A('boot', 'systemd targets', ['sy|sysinit.target|k|0|2', 'ba|basic.target|k|1|2', 'ne|network.target|p|2|0', 'mu|multi-user.target|k|2|1', 'gr|graphical.target|p|3|2'],
    'sy>ba ba>ne ba>mu ne>mu mu>gr', 'ba ne mu gr', [
      ['systemd does not run steps in a fixed script. It reaches goals called targets.', 'sy'],
      ['sysinit prepares devices and mounts filesystems, then basic.target sets up sockets and timers.', '', 'sy>ba'],
      ['network.target is reached once the network is configured.', '', 'ba>ne'],
      ['multi-user.target is a full text-mode system with all services.', '', 'ba>mu ne>mu'],
      ['graphical.target adds the desktop. systemctl get-default shows which one boots.', '', 'mu>gr']]);

  A('systemctl', 'enable versus start', ['en|systemctl enable nginx|p|0|0', 'st|systemctl start nginx|p|0|1', 'ln|symlink in multi-user.target.wants|f|1|2', 'bt|at next boot|h|2|0', 'nw|runs right now|f|2|1', 'bo|both: enable --now|u|3|2'],
    'en>ln st>nw ln>bt bo>en bo>st', 'ln bt nw bo', [
      ['Two separate questions: should it run at boot, and should it run now?', 'en st'],
      ['enable creates a symlink so systemd starts the service whenever the machine boots. It does not start it now.', '', 'en>ln'],
      ['At the next boot the service starts by itself.', '', 'ln>bt'],
      ['start runs it immediately, but only until the next reboot.', '', 'st>nw'],
      ['enable --now does both in one command.', '', 'bo>en bo>st']]);

  A('journal', 'Narrowing down the logs', ['al|every message since boot|f|0|2', 'un|-u nginx|p|1|0', 'sn|--since "1 hour ago"|p|1|1', 'pr|-p err|p|2|2', 'rs|the few lines that matter|f|3|2'],
    'al>un un>sn sn>pr pr>rs', 'un sn pr rs', [
      ['The journal holds everything: kernel, services and logins. Never read it all.', 'al'],
      ['-u nginx keeps only messages from that service.', '', 'al>un'],
      ['--since limits the time range.', '', 'un>sn'],
      ['-p err keeps only errors and worse.', '', 'sn>pr'],
      ['A handful of lines remain. Add -f to follow new lines live, -b for this boot only.', '', 'pr>rs']]);
})();
