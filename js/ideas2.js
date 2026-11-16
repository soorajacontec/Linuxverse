/* Linuxverse Home walkthrough: 74 more ideas. Each one: theory, key points, a common mistake, where it shows in the example folder,
   and a command to try. Inserted at the end of their group (new groups are appended). */
(function () {
  'use strict';
  if (!LV.explore || !LV.explore.concepts) return;
  var C = LV.explore.concepts;

  function add(g, id, t, theory, keys, mistake, folder, hi, sel, cmd) {
    var c = { id: id, g: g, t: t, theory: theory, keys: keys, mistake: mistake, folder: folder, hi: hi, sel: sel, tryCmd: cmd };
    var last = -1;
    for (var i = 0; i < C.length; i++) if (C[i].g === g) last = i;
    if (last < 0) C.push(c); else C.splice(last + 1, 0, c);
  }

  /* ================= Basics ================= */
  add('Basics', 'cdpwd', 'Moving around: cd, pwd and shortcuts',
    ['You are always <b>in</b> one folder, the <b>current working directory</b>. <code>pwd</code> prints where you are and <code>cd folder</code> moves you. Relative paths start from here, so moving changes what short names mean.',
      'Shortcuts save typing: <code>cd</code> alone goes home, <code>cd ~</code> too, <code>cd ..</code> goes up one level and <code>cd -</code> jumps back to where you were.'],
    ['<code>~</code> is your home folder, <code>.</code> is here and <code>..</code> is the parent.', '<code>cd -</code> swaps between your last two folders.', 'Quote or escape folder names that contain spaces.'],
    'Typing commands while in the wrong folder. Run <code>pwd</code> before <code>rm</code> or <code>mv</code>.',
    'Move into <b>css</b>, then back up: the same name, <code>style.css</code>, is reached by different paths depending on where you stand.',
    ['css', 'css/style.css'], 'css', 'cd ~/website/css && pwd && cd .. && pwd');

  add('Basics', 'anatomy', 'Anatomy of a command',
    ['Every command line has the same shape: <b>command</b>, then <b>options</b> (also called flags) that change how it behaves, then <b>arguments</b> that say what to act on. In <code>ls -l ~/website</code>, ls is the command, -l the option and ~/website the argument.',
      'Short options use one dash and can be combined: <code>-l -a -h</code> is the same as <code>-lah</code>. Long options use two dashes: <code>--all</code>. Order of options rarely matters; arguments usually come last.'],
    ['Options start with <code>-</code> (short) or <code>--</code> (long).', 'Spaces separate the parts, so a name with spaces needs quotes.', '<code>command --help</code> lists the options of almost every tool.'],
    'Forgetting a space: <code>ls-l</code> is one unknown word, not ls with -l.',
    'In <code>ls -lh ~/website</code> the option <b>-h</b> turns file sizes like 5200 into 5.1K, easier to read.',
    ['', 'logs/access.log'], 'logs/access.log', 'ls -lh ~/website/logs');

  add('Basics', 'echoprint', 'Printing text: echo and printf',
    ['<code>echo</code> prints its arguments followed by a new line. It is how you show a message, check a variable or write a line into a file with redirection. <code>printf</code> gives you exact control: <code>%s</code> is text, <code>%d</code> a number and <code>\\n</code> a new line.',
      'Quotes matter. In double quotes variables still expand: <code>echo "Hi $USER"</code>. In single quotes everything is literal.'],
    ['<code>echo -n</code> skips the final new line.', 'Use <code>printf</code> when you need formatting, tabs or exact output.', '<code>echo $?</code> prints the exit code of the last command.'],
    'Using <code>echo</code> for text with backslashes. Different shells treat them differently; use printf.',
    'Print the project name beside the number of files: you can mix text with command output.',
    [''], '', 'echo "User $(whoami) has $(ls ~/website | wc -l) items in website"');

  add('Basics', 'readfiles', 'Reading files: cat, head and tail',
    ['<code>cat file</code> prints a whole file. For long files you rarely want all of it: <code>head</code> shows the first lines and <code>tail</code> the last. <code>-n 5</code> chooses how many.',
      '<code>tail -f</code> keeps the file open and prints new lines as they are written, the standard way to watch a log. <code>less</code> lets you scroll a big file page by page.'],
    ['<code>head -n 3 file</code> first three lines; <code>tail -n 3 file</code> last three.', '<code>cat -n</code> numbers the lines.', 'cat can join files: <code>cat a b</code> prints a then b.'],
    'Running <code>cat</code> on a huge or binary file and flooding the terminal. Use head or less first.',
    'The most recent visits are at the bottom of <b>access.log</b>, so <code>tail</code> shows what just happened.',
    ['logs/access.log'], 'logs/access.log', 'tail -n 3 ~/website/logs/access.log');

  add('Basics', 'lsl', 'Reading a long listing (ls -l)',
    ['<code>ls -l</code> prints one line per item: <b>type and permissions</b>, link count, owner, group, size in bytes, modified time and name. The first character is the type: <code>-</code> file, <code>d</code> directory, <code>l</code> link.',
      'The nine letters after it are three triplets for owner, group and others. Add <code>-h</code> for readable sizes and <code>-a</code> to include hidden names.'],
    ['<code>-rwxr-x---</code> means owner rwx, group r-x, others nothing.', '<code>ls -lt</code> sorts newest first; <code>ls -lS</code> biggest first.', '<code>ls -ld folder</code> shows the folder itself, not its contents.'],
    'Reading the size column as kilobytes. It is bytes unless you add <code>-h</code>.',
    'Every row in the folder tree matches a line from <code>ls -l</code>. Select a file and compare the letters with its permissions.',
    ['', 'scripts/deploy.sh', 'scripts/backup.sh'], 'scripts/deploy.sh', 'ls -l ~/website/scripts');

  add('Basics', 'makethings', 'Making files and folders: touch and mkdir',
    ['<code>mkdir name</code> creates a folder and <code>touch name</code> creates an empty file (or just updates its modified time if it exists). <code>mkdir -p a/b/c</code> builds the whole chain in one go.',
      'Creating things is cheap and safe; deleting is not. Organise early: one folder per project keeps paths short and predictable.'],
    ['<code>mkdir -p</code> makes missing parents and does not complain if the folder exists.', 'You can create several at once: <code>touch a.txt b.txt</code>.', 'New items get permissions from your umask.'],
    'Using <code>mkdir a/b/c</code> without <code>-p</code> when <code>a/b</code> does not exist yet. It fails.',
    'Create a nested folder for drafts and see it appear in the tree.',
    [''], '', 'mkdir -p ~/website/drafts/2026 && touch ~/website/drafts/2026/post1.txt && tree ~/website/drafts');

  add('Basics', 'typewhich', 'Which program runs? type and which',
    ['When you type <code>ls</code>, the shell must decide what that word means. It could be an <b>alias</b>, a shell <b>built-in</b> like <code>cd</code> or a <b>program file</b> found in the folders of <code>$PATH</code>. <code>type name</code> tells you which.',
      '<code>which name</code> prints the path of the program file. This solves the common puzzle "I installed it but the wrong version runs".'],
    ['<code>type -a name</code> lists every match in order.', 'Built-ins like <code>cd</code> have no file, which is why <code>which cd</code> may print nothing.', 'Run a program by path (<code>./script.sh</code>) to skip the search.'],
    'Assuming a command is missing when it is installed but not in your PATH.',
    'The scripts in <b>scripts</b> are not on your PATH, which is why you must give their path to run them.',
    ['scripts', 'scripts/deploy.sh'], 'scripts', 'type ls cd echo');

  add('Basics', 'dates', 'Date, time and stamps',
    ['<code>date</code> prints the current date and time. A format after a plus sign shapes it: <code>date +%F</code> gives 2026-11-08 and <code>date +%H:%M</code> gives 14:30. Common codes: <code>%Y</code> year, <code>%m</code> month, <code>%d</code> day, <code>%H %M %S</code> time.',
      'Dates in file names make backups easy to sort: <code>backup-$(date +%F).tar.gz</code>. Servers usually keep time in UTC to avoid confusion across zones.'],
    ['<code>date +%s</code> prints seconds since 1970, handy for maths.', 'ISO order (year-month-day) sorts correctly as plain text.', '<code>timedatectl</code> shows the zone and whether the clock is synchronised.'],
    'Using local dates in logs of servers in different countries. Prefer UTC.',
    'Log lines and file times in the folder use the same clock: <code>ls -l</code> shows the modified time of each item.',
    ['logs/access.log'], 'logs/access.log', 'echo "Backup name: site-$(date +%F).tar.gz"');

  /* ================= Security ================= */
  add('Security', 'sudosafe', 'sudo: borrowing root safely',
    ['<code>sudo command</code> runs one command with administrator rights after checking your password. Everything else you do stays as a normal user, which limits the damage of a mistake. This is better than staying logged in as root.',
      'Who may use sudo is decided by the <code>sudo</code> or <code>wheel</code> group and the sudoers rules. Each use is logged, so there is a record of who did what.'],
    ['Use sudo only for the single command that needs it.', '<code>sudo -l</code> lists what you may run.', 'Never run <code>sudo</code> on a command you do not understand.'],
    'Prefixing sudo to everything after a permission error. Often the real fix is correct ownership, not more power.',
    'Files in <b>website</b> belong to you, so you rarely need sudo for them. System folders like /etc do need it.',
    ['', '.env'], '', 'sudo whoami');

  add('Security', 'leastpriv', 'Least privilege',
    ['<b>Least privilege</b> means giving every user and program only the access needed for the job, nothing more. A web server only needs to read the site, not write to it or read your private files.',
      'In practice: use groups for shared access, keep secrets mode 600, make scripts executable only when they must run, and run services as their own limited user.'],
    ['Start with no access, then add what is needed.', 'Check results with <code>ls -l</code> after every <code>chmod</code>.', 'Separate users for separate jobs limit the damage of a break-in.'],
    'Using <code>chmod 777</code> to make an error disappear. It removes all protection.',
    '<b>.env</b> holds settings and secrets, so only the owner should read it. <b>index.html</b> is meant to be public.',
    ['.env', 'index.html'], '.env', 'ls -l ~/website/.env ~/website/index.html');

  add('Security', 'secrets', 'Keeping secrets safe',
    ['Passwords, API keys and tokens belong in files with tight permissions (600) and outside the folders you publish or commit. A common pattern is a hidden <code>.env</code> file read by the app and listed in <code>.gitignore</code>.',
      'Never put secrets in command lines (they show in history and in <code>ps</code>) or in scripts you share. If a secret leaks, replacing it is the only real fix.'],
    ['Check <code>ls -l .env</code> shows <code>-rw-------</code>.', 'Use environment variables or secret files instead of hard-coded text.', 'Rotate a key at once if it was ever pushed or pasted publicly.'],
    'Committing a <code>.env</code> file to a repository. Deleting it later does not remove it from history.',
    'The hidden <b>.env</b> file is the secret store of this site. Its mode is already private.',
    ['.env'], '.env', 'stat ~/website/.env');

  add('Security', 'specialbits', 'Special permission bits',
    ['Beyond rwx there are three special bits. <b>setuid</b> runs a program as its owner (how <code>passwd</code> can edit protected files). <b>setgid</b> on a folder makes new files inherit its group. The <b>sticky bit</b> on a shared folder lets users delete only their own files.',
      'They show as <code>s</code> or <code>t</code> in the listing. <code>/tmp</code> is the classic sticky folder: everyone can write, nobody can delete another person\'s files.'],
    ['<code>drwxrwxrwt</code> ends in t: sticky.', 'setuid programs are a favourite target; keep few of them.', '<code>chmod +t folder</code> sets sticky, <code>chmod g+s folder</code> sets setgid.'],
    'Setting setuid on scripts or unknown programs. It can give attackers root.',
    'Compare your private folder with the shared <b>/tmp</b>: the end of the permission string differs.',
    [''], '', 'ls -ld /tmp ~/website');

  add('Security', 'integrity', 'Checksums: proving a file is unchanged',
    ['A <b>checksum</b> is a short fingerprint calculated from a file\'s contents. Change one byte and the fingerprint changes completely. <code>sha256sum file</code> prints it. Publishers list checksums so you can check your download is complete and untampered.',
      'Compare with <code>sha256sum -c file.sha256</code>. A match proves integrity; to prove who made the file you also need a signature (GPG).'],
    ['Prefer sha256 over md5 for security checks.', 'Check downloads before installing them.', 'A checksum on the same page as the file only guards against corruption, not against a hacked site.'],
    'Trusting a download because it "looks fine". A single flipped byte can break an install or hide malware.',
    'Fingerprint <b>index.html</b> before you edit it; after an edit the fingerprint is different.',
    ['index.html'], 'index.html', 'man sha256sum');

  add('Security', 'passwords', 'Passwords and account safety',
    ['A strong password is long, unique and random: a passphrase of four or more unrelated words beats a short complicated one. Use a password manager so every account has its own. <code>passwd</code> changes your password; the system stores only a salted hash, never the password itself.',
      'Better still, log in to servers with SSH keys and turn off password logins. Add two-factor authentication where offered, lock unused accounts (<code>sudo passwd -l user</code>) and remove people who leave.'],
    ['Length beats complexity.', 'Never reuse a password between systems.', 'Disable password SSH logins once keys work.'],
    'Sharing one account between several people. You lose the record of who did what.',
    'The private <b>.env</b> file is where an app keeps its own credentials, not your login password.',
    ['.env'], '.env', 'man passwd');

  add('Security', 'whoison', 'Who is on the machine?',
    ['On a shared server you can ask who you are (<code>whoami</code>, <code>id</code>), who else is logged in (<code>who</code>, <code>w</code>) and who logged in before (<code>last</code>). These are the first checks when something looks wrong.',
      'Login records live in system files. Unknown users, unknown addresses or logins at odd hours deserve a closer look.'],
    ['<code>groups</code> shows the groups you belong to.', '<code>last</code> lists past logins; <code>lastb</code> failed ones (root).', '<code>w</code> also shows what each user is running.'],
    'Never checking. Many break-ins run for weeks because nobody looked at login history.',
    'Every file in the folder has an owner; compare it with the account <code>whoami</code> reports.',
    ['', '.env'], '.env', 'whoami && groups');

  /* ================= Programs ================= */
  add('Programs', 'builtin', 'Built-ins versus programs',
    ['Some commands are not files at all. <b>Built-ins</b> such as <code>cd</code>, <code>echo</code>, <code>export</code> and <code>history</code> live inside the shell itself. <b>External programs</b> like <code>ls</code> and <code>grep</code> are separate files that the shell starts.',
      'This is why <code>cd</code> must be built in: a separate program could only change its own folder, not yours.'],
    ['<code>type name</code> tells you which kind it is.', '<code>help cd</code> documents built-ins; <code>man ls</code> documents programs.', 'Built-ins are faster because nothing is started.'],
    'Looking for a man page of a built-in. Use <code>help name</code> in bash.',
    'Scripts in the folder are external programs; running them starts a new process.',
    ['scripts/deploy.sh'], 'scripts/deploy.sh', 'type cd ls echo');

  add('Programs', 'envvars', 'Environment variables',
    ['The <b>environment</b> is a set of named values every program inherits: <code>HOME</code> (your home folder), <code>USER</code>, <code>PATH</code>, <code>EDITOR</code> and more. <code>env</code> lists them and <code>echo $HOME</code> reads one.',
      '<code>export NAME=value</code> makes a variable available to the programs you start. Settings for an app are often passed this way, which is why the website keeps them in a <code>.env</code> file.'],
    ['<code>env | grep HOME</code> finds a variable.', 'Variables set without export stay inside the shell.', 'Changes last until you close the terminal unless saved in ~/.bashrc.'],
    'Setting a variable in one terminal and expecting it in another. Each shell has its own copy.',
    'The hidden <b>.env</b> file holds KEY=value lines in the same style the environment uses.',
    ['.env'], '.env', 'env | grep -E "HOME|USER"');

  add('Programs', 'stdinput', 'Standard input',
    ['Many commands read from <b>standard input</b> when you give no file name. That is what lets pipes work: the previous command\'s output becomes the next one\'s input. You can also feed a file in with <code>&lt;</code>.',
      'So <code>wc -l &lt; notes.txt</code> and <code>cat notes.txt | wc -l</code> give the same count, the first without starting an extra process.'],
    ['<code>&lt;</code> reads a file as input.', 'Most filters (grep, sort, wc) accept both a file name and piped input.', '<code>Ctrl+D</code> ends typed input.'],
    'Running a filter with no input on purpose and wondering why it waits. Press Ctrl+C to leave.',
    '<b>notes.txt</b> can be fed to a command either by name or through standard input.',
    ['notes.txt'], 'notes.txt', 'wc -l < ~/website/notes.txt');

  add('Programs', 'chaining', 'Chaining commands: ; && ||',
    ['You can put several commands on one line. <code>a ; b</code> runs both no matter what. <code>a &amp;&amp; b</code> runs b only if a succeeded. <code>a || b</code> runs b only if a failed.',
      'Together they make small decisions without a script: <code>test -f file &amp;&amp; echo found || echo missing</code>. Use <code>&amp;&amp;</code> whenever a later step depends on an earlier one.'],
    ['Success means exit code 0.', 'Chain safe steps: <code>cd dir &amp;&amp; rm *</code> never runs rm if cd fails.', 'Avoid <code>a &amp;&amp; b || c</code> when b can fail: c would run too.'],
    'Using ; between dependent steps. The second runs even when the first failed.',
    'Check whether a file exists before reading it, so the line works in any folder.',
    ['index.html'], 'index.html', 'test -f ~/website/index.html && echo "found" || echo "missing"');

  add('Programs', 'shebang', 'Scripts and the shebang line',
    ['A <b>script</b> is a text file of commands. Its first line, the <b>shebang</b>, names the program that should run it: <code>#!/bin/bash</code> or the portable <code>#!/usr/bin/env bash</code>. With the x permission you can then run it directly.',
      'Without a shebang the system guesses, which can give surprises. Keep scripts small, quote variables and test with a dry run first.'],
    ['<code>chmod +x script.sh</code> then <code>./script.sh</code>.', '<code>bash script.sh</code> works even without the x bit.', 'The line starts with #! and no space before the program in most cases.'],
    'Saving a script with Windows line endings. The shebang then points to a program with a hidden carriage return.',
    'Open <b>deploy.sh</b>: its first line is the shebang that tells Linux how to run it.',
    ['scripts/deploy.sh'], 'scripts/deploy.sh', 'head -n 1 ~/website/scripts/deploy.sh');

  add('Programs', 'basename', 'Splitting a path',
    ['A full path combines a folder and a file name. <code>dirname</code> returns the folder part and <code>basename</code> the file name. These are text operations: the file need not exist.',
      'Scripts use them to build new names: take the base name, change the ending and write it elsewhere.'],
    ['<code>basename file.txt .txt</code> also removes the ending.', '<code>dirname /a/b/c.txt</code> gives /a/b.', 'Combine with <code>$(...)</code> to use the result inside another command.'],
    'Cutting paths with ad-hoc text tricks. basename and dirname handle odd cases correctly.',
    'Take the style sheet\'s path apart into its folder and its name.',
    ['css/style.css'], 'css/style.css', 'dirname ~/website/css/style.css; basename ~/website/css/style.css');

  add('Programs', 'sleepwait', 'Waiting and timing',
    ['<code>sleep 5</code> pauses for five seconds. It is used in scripts to wait for a service to start or to space out requests. <code>time command</code> measures how long a command takes.',
      'Combined with <code>&amp;&amp;</code> you can delay an action: <code>sleep 60 &amp;&amp; echo ready</code>. Add <code>&amp;</code> at the end to wait in the background.'],
    ['<code>sleep 0.5</code> accepts fractions on most systems.', '<code>watch -n 2 cmd</code> repeats a command every 2 seconds.', '<code>timeout 10 cmd</code> stops a command that runs too long.'],
    'Using a fixed sleep to wait for something. Check for the condition (file exists, port open) in a loop instead.',
    'Pause between two actions on the example folder.',
    [''], '', 'sleep 1 && echo "done waiting"');

  add('Programs', 'killproc', 'Stopping a program: kill and signals',
    ['<code>kill PID</code> does not kill by force: it sends a <b>signal</b>. The default, SIGTERM (15), asks the program to finish cleanly. <code>kill -9 PID</code> (SIGKILL) ends it at once and cannot be caught, so the program cannot save anything.',
      '<code>Ctrl+C</code> sends SIGINT to the running command. <code>pkill name</code> signals by name and <code>killall</code> by exact name. Try the polite signal first.'],
    ['Find the PID with <code>ps aux | grep name</code> or <code>pgrep name</code>.', 'Only the owner (or root) can signal a process.', '<code>kill -l</code> lists all signals.'],
    'Using <code>kill -9</code> first. Locks and temp files are left behind.',
    'A script that runs a long time in the folder can be stopped from another terminal with its PID.',
    ['scripts/deploy.sh'], 'scripts/deploy.sh', 'man kill');

  /* ================= Files ================= */
  add('Files', 'treeview', 'Seeing the whole structure with tree',
    ['<code>tree</code> draws a folder and everything under it as an indented picture. It is the fastest way to understand an unfamiliar project. <code>-L 2</code> limits the depth and <code>-a</code> includes hidden items.',
      'When tree is not installed, <code>find . -type d</code> lists folders and <code>ls -R</code> lists recursively.'],
    ['<code>tree -d</code> shows folders only.', '<code>tree -L 1</code> is a one-level overview.', 'Hidden items need <code>-a</code>.'],
    'Running tree in a huge folder such as / without a depth limit. It prints for a very long time.',
    'The example panel on this page is a tree view of the same folder.',
    ['', 'css', 'scripts', 'logs'], '', 'tree -L 2 ~/website');

  add('Files', 'statfile', 'File details with stat',
    ['<code>stat file</code> shows everything the filesystem knows about it: size, permissions in letters and numbers, owner, group, inode and three timestamps: access, modify and change.',
      '<b>Modify</b> means the contents changed, <b>change</b> means the metadata (permissions, owner) changed. This helps when you ask "when did this file last change, and who owns it?".'],
    ['<code>stat -c %a file</code> prints just the octal mode.', 'Link count tells how many names point to the inode.', 'Times are stored per file, not per folder.'],
    'Using the access time as proof a file was read. Many systems update it lazily.',
    'Inspect the log: its size and times show how active the site is.',
    ['logs/access.log'], 'logs/access.log', 'stat ~/website/logs/access.log');

  add('Files', 'sizes', 'File sizes and counts',
    ['Use <code>ls -lh</code> for human-readable sizes, <code>wc -c file</code> for exact bytes and <code>du -sh folder</code> for the total size of a folder. <code>df -h</code> shows free space on the disk.',
      'Check sizes before copying or sending files, and look at the biggest items when a disk fills: <code>du -ah . | sort -rh | head</code>.'],
    ['<code>-h</code> makes sizes readable (K, M, G).', 'A folder\'s own size in ls is just its entry, not its contents; use du.', '<code>ls -lS</code> sorts by size.'],
    'Reading the size of a folder in ls -l as its total. Use du instead.',
    'The log is the largest file in the folder. Compare the sizes of all items.',
    ['logs/access.log', 'index.html'], 'logs/access.log', 'ls -lhS ~/website/logs');

  add('Files', 'wccount', 'Counting lines, words and bytes',
    ['<code>wc file</code> prints three numbers: lines, words and bytes. <code>wc -l</code> counts only lines, which makes it the standard way to count results: the number of matches, files, users or visitors.',
      'Because it reads standard input too, you can count anything a pipe produces: <code>ls | wc -l</code> is the number of items.'],
    ['<code>-l</code> lines, <code>-w</code> words, <code>-c</code> bytes, <code>-m</code> characters.', 'A file without a final new line counts one line fewer.', 'Pipe into wc -l to turn any list into a number.'],
    'Counting lines with <code>grep -c</code> and wc together and getting different numbers. grep -c counts matching lines only.',
    'The number of visits is simply the number of lines in access.log.',
    ['logs/access.log', 'notes.txt'], 'logs/access.log', 'wc ~/website/logs/access.log ~/website/notes.txt');

  add('Files', 'rename', 'Renaming and moving',
    ['In Linux, renaming is moving: <code>mv old new</code>. If the target is an existing folder, the item moves into it; if it is a name, the item is renamed. Moving within the same disk is instant.',
      'Use <code>mv -i</code> to be asked before overwriting and <code>mv -n</code> to never overwrite. For many files at once, use a loop or the <code>rename</code> tool.'],
    ['<code>mv a b</code> overwrites b silently if it is a file.', 'Moving across disks copies, then deletes.', 'Wildcards work: <code>mv *.txt docs/</code>.'],
    'Moving a file onto an existing name and losing the old one.',
    'Make a draft, rename it, and see only the new name remains.',
    ['notes.txt'], 'notes.txt', 'touch ~/website/draft.txt && mv ~/website/draft.txt ~/website/final.txt && ls ~/website');

  add('Files', 'timestamps', 'Timestamps',
    ['Each file stores when it was last modified. <code>touch file</code> sets it to now (and creates the file if missing), <code>touch -d "2026-01-01" file</code> sets a chosen date. Many tools use timestamps to decide what changed: make, rsync, backups.',
      '<code>ls -lt</code> sorts newest first and <code>find -mtime -1</code> finds files changed in the last day.'],
    ['<code>ls -lt | head</code> shows what changed most recently.', 'Copying with <code>cp -p</code> keeps times.', 'Timestamps can be faked; do not rely on them as proof.'],
    'Editing a file and forgetting it changes the time, which can trigger rebuilds or backup runs.',
    'Touch the notes and watch its modified time jump to now.',
    ['notes.txt'], 'notes.txt', 'touch ~/website/notes.txt && ls -l ~/website/notes.txt');

  add('Files', 'rmdirempty', 'Removing folders',
    ['<code>rmdir folder</code> deletes only <b>empty</b> folders, which makes it safe. <code>rm -r folder</code> deletes a folder and everything inside, with no recycle bin.',
      'Before a recursive delete, list what will go: <code>ls -R folder</code> or <code>find folder | head</code>. Prefer <code>rm -ri</code> for a prompt, and never run it with an unchecked variable.'],
    ['rmdir refuses non-empty folders, that is its safety.', 'Use <code>rm -r</code> only after checking the path twice.', 'Quote paths with spaces.'],
    'Typing <code>rm -rf /*</code> or <code>rm -rf $DIR/*</code> with an empty variable. Check the variable first.',
    'Create an empty folder and remove it with the safe command.',
    [''], '', 'mkdir ~/website/scratch && rmdir ~/website/scratch && ls ~/website');

  add('Files', 'copydir', 'Copying folders',
    ['<code>cp file dest</code> copies a file; for folders add <code>-r</code> (recursive). <code>-a</code> is the archive mode: it also keeps permissions, owners, times and links, which is what you want for backups.',
      'A trailing slash can change the result with some tools such as rsync, but <code>cp -r src dest</code> copies the folder into dest if dest exists.'],
    ['<code>cp -a</code> preserves attributes.', '<code>cp -i</code> asks before overwriting.', 'Always check the result with <code>ls</code> or <code>tree</code>.'],
    'Copying a folder without <code>-r</code>. cp says it is omitting the directory.',
    'Make a backup copy of the whole <b>css</b> folder beside the original.',
    ['css'], 'css', 'cp -a ~/website/css ~/website/css-copy && ls ~/website');

  add('Files', 'hardlink', 'Hard links and inodes',
    ['A file\'s data lives in an <b>inode</b>; a name is a pointer to it. <code>ln file newname</code> adds a second name (a <b>hard link</b>) to the same inode. Both names are equal; the data disappears only when the last name is removed.',
      'Hard links work only on the same filesystem and not for folders. The number after the permissions in <code>ls -l</code> is the link count.'],
    ['<code>ls -i</code> shows inode numbers.', 'Editing through one name changes the data seen by the other.', 'Use <code>ln -s</code> for links across disks or to folders.'],
    'Expecting a hard link to be an independent copy. Changes show in both.',
    'Make a second name for the notes and compare their link counts.',
    ['notes.txt'], 'notes.txt', 'ln ~/website/notes.txt ~/website/notes-link.txt && ls -li ~/website');

  add('Files', 'tmpdir', 'Temporary files: /tmp',
    ['<code>/tmp</code> is a shared scratch area anyone may write to. Files there are cleared at reboot or after a few days. It is the right place for throw-away work, such as unpacking an archive to look at it.',
      'Because it is shared and sticky, create unique names (<code>mktemp</code>) and do not store anything you need to keep or that is secret.'],
    ['<code>mktemp -d</code> makes a private unique folder.', 'Files in /tmp survive only until cleanup or reboot.', 'Other users can see your file names there.'],
    'Keeping real work in /tmp and losing it after a reboot.',
    'Experiment outside the project so the example folder stays clean.',
    [''], '', 'echo "scratch" > /tmp/scratch.txt && ls -l /tmp/scratch.txt');

  /* ================= Text ================= */
  add('Text', 'sorting', 'Sorting lines',
    ['<code>sort</code> orders lines alphabetically. Options change the rule: <code>-n</code> numbers, <code>-r</code> reverse, <code>-u</code> remove duplicates, <code>-k2</code> sort by the second column, <code>-t,</code> choose a separator.',
      'Sorted data is the basis for many tricks: <code>uniq</code> needs it, and <code>comm</code> and <code>join</code> too. The locale decides how capitals and accents sort.'],
    ['<code>sort -n</code> for numbers, otherwise 10 comes before 9.', '<code>sort -h</code> understands sizes like 2K and 1G.', '<code>sort file | uniq</code> removes repeated lines.'],
    'Sorting numbers as text. Add <code>-n</code>.',
    'The to-do list in <b>notes.txt</b> can be put in alphabetical order without changing the file.',
    ['notes.txt'], 'notes.txt', 'sort ~/website/notes.txt');

  add('Text', 'uniqcount', 'Finding repeats with uniq',
    ['<code>uniq</code> collapses <b>neighbouring</b> duplicate lines; <code>uniq -c</code> adds a count in front, <code>-d</code> shows only duplicated lines and <code>-u</code> only unique ones.',
      'Because only neighbours are compared, sort first: <code>sort | uniq -c</code> is the classic counting pipeline.'],
    ['Always <code>sort</code> before <code>uniq</code>.', '<code>sort | uniq -c | sort -rn</code> ranks by frequency.', '<code>sort -u</code> is a shortcut when you do not need counts.'],
    'Using uniq on unsorted data and thinking nothing repeats.',
    'Count how often each status code (the last field) appears in the access log.',
    ['logs/access.log'], 'logs/access.log', "awk '{print $6}' ~/website/logs/access.log | sort | uniq -c");

  add('Text', 'cutfields', 'Cutting out columns',
    ['<code>cut</code> extracts parts of each line. <code>-d</code> sets the delimiter and <code>-f</code> picks fields: <code>cut -d: -f1 /etc/passwd</code> prints user names. <code>-c1-10</code> takes characters 1 to 10.',
      'It splits on one exact separator, so for text aligned with several spaces use <code>awk</code> instead.'],
    ['Fields are counted from 1.', '<code>-f1,3</code> picks two fields; <code>-f2-</code> from 2 to the end.', 'Use <code>tr -s " "</code> to squeeze repeated spaces first.'],
    'Using cut on output with variable spacing. Empty fields appear.',
    'Each access-log line starts with the visitor address; cut can pull just that column.',
    ['logs/access.log'], 'logs/access.log', "cut -d' ' -f1 ~/website/logs/access.log");

  add('Text', 'trchars', 'Translating characters with tr',
    ['<code>tr</code> replaces or deletes single characters read from standard input: <code>tr a-z A-Z</code> makes upper case, <code>tr -d</code> deletes characters, <code>tr -s</code> squeezes repeats into one.',
      'It never takes file names, so feed it with a pipe or <code>&lt;</code>. For whole words use sed.'],
    ['<code>tr " " "\\n"</code> puts each word on its own line.', '<code>tr -d "\\r"</code> removes Windows line endings.', 'Character classes like <code>[:upper:]</code> are available.'],
    'Trying to replace a word with tr. It works character by character.',
    'Turn the to-do list into capitals, just for display.',
    ['notes.txt'], 'notes.txt', "cat ~/website/notes.txt | tr 'a-z' 'A-Z'");

  add('Text', 'teeout', 'Save and see: tee',
    ['<code>tee</code> copies standard input to the screen <b>and</b> to a file. It sits in the middle of a pipeline so you can keep the result while the data keeps flowing: <code>cmd | tee out.txt | wc -l</code>.',
      '<code>tee -a</code> appends. With sudo it solves a classic problem: <code>echo text | sudo tee /etc/file</code> writes to a protected file, which <code>sudo echo text &gt; file</code> cannot.'],
    ['Think of a T-shaped pipe.', '<code>-a</code> appends instead of overwriting.', 'Combine with sudo to write system files from a pipeline.'],
    'Using <code>sudo cmd &gt; /etc/file</code>. The redirect runs as you, not as root, and fails.',
    'Save all failed requests to a file while also counting them.',
    ['logs/access.log'], 'logs/access.log', 'grep 404 ~/website/logs/access.log | tee /tmp/errors.txt | wc -l');

  add('Text', 'grepflags', 'grep options that matter',
    ['A few grep options cover most needs: <code>-n</code> shows line numbers, <code>-i</code> ignores case, <code>-v</code> inverts (lines that do <i>not</i> match), <code>-c</code> counts, <code>-r</code> searches folders and <code>-l</code> lists only file names.',
      'Add <code>-w</code> to match whole words and <code>-E</code> for patterns with | and +. Context options <code>-A 2 -B 2</code> show lines around a match.'],
    ['<code>grep -rn word .</code> finds a word in a whole project.', '<code>grep -v "^#" file</code> hides comment lines.', 'Quote patterns.'],
    'Forgetting <code>-r</code> and wondering why grep says it is a directory.',
    'Find every TODO and where it sits in the notes.',
    ['notes.txt'], 'notes.txt', 'grep -n TODO ~/website/notes.txt');

  add('Text', 'numberlines', 'Numbering and reversing lines',
    ['<code>nl file</code> prints a file with line numbers; <code>cat -n</code> does the same. Numbers help when you discuss a file, report an error line or use <code>sed -n 5p</code> to fetch one line.',
      '<code>rev</code> reverses each line and <code>tac</code> prints lines from last to first, handy to read newest log lines first.'],
    ['<code>nl -ba</code> numbers blank lines too.', '<code>tac log | head</code> shows the latest entries.', 'Line numbers are not stored in the file.'],
    'Mistaking nl\'s numbers for part of the file.',
    'Number the lines of the to-do list.',
    ['notes.txt'], 'notes.txt', 'nl ~/website/notes.txt');

  add('Text', 'awkfields', 'awk: fields at your fingertips',
    ['<code>awk</code> splits every line into fields <code>$1 $2 …</code> (and <code>$NF</code> for the last), so you can print, test or add them up: <code>awk \'{print $1}\'</code>. A condition before the braces selects lines: <code>awk \'$6 == 404 {print $1}\'</code>.',
      '<code>END{}</code> runs after the last line, where you print totals. Variables and arrays need no setup.'],
    ['<code>-F:</code> changes the field separator.', '<code>NR</code> is the line number and <code>NF</code> the field count.', 'Use single quotes around the program.'],
    'Using double quotes around the awk program. The shell replaces $1 before awk runs.',
    'Print the address of every visitor whose request ended in a 404.',
    ['logs/access.log'], 'logs/access.log', "awk '$6 == 404 {print $1}' ~/website/logs/access.log");

  add('Text', 'wordsplit', 'One item per line',
    ['A lot of Linux text work becomes simple when each item is on its own line. <code>tr " " "\\n"</code> splits words, <code>ls -1</code> lists one name per line and <code>xargs -n1</code> does the reverse of joining.',
      'Once items are one per line you can <code>sort</code>, <code>uniq</code>, <code>head</code> and <code>wc -l</code> them with the same tools you already know.'],
    ['<code>ls -1</code> (digit one) gives one name per line.', '<code>sort -u</code> after splitting removes duplicates.', 'Pipes turn many tools into one workflow.'],
    'Processing long lines with tools built for lines. Split first.',
    'Turn the words in the first line of notes into a column.',
    ['notes.txt'], 'notes.txt', "head -n 1 ~/website/notes.txt | tr ' ' '\\n'");

  add('Text', 'seqgen', 'Generating text: seq and brace expansion',
    ['<code>seq 1 5</code> prints numbers 1 to 5, one per line. The shell can do similar with <b>brace expansion</b>: <code>echo file{1..3}.txt</code> becomes file1.txt file2.txt file3.txt before the command runs.',
      'They create test data, names and loops without typing each one: <code>mkdir project/{src,docs,tests}</code> builds three folders at once.'],
    ['<code>seq 0 5 20</code> counts by fives.', 'Braces are expanded by the shell, so they work with any command.', 'No spaces inside the braces.'],
    'Putting spaces inside braces. <code>{1, 2}</code> is not expanded.',
    'Create several empty files in one step.',
    [''], '', 'touch ~/website/page{1..3}.txt && ls ~/website');

  /* ================= System ================= */
  add('System', 'osinfo', 'Which system is this?',
    ['<code>uname -a</code> shows the kernel name, version and architecture; <code>cat /etc/os-release</code> names the distribution. <code>hostname</code> shows the machine\'s name. These are the first things to report in a bug or help request.',
      'Knowing the distribution tells you which package manager and paths to expect.'],
    ['<code>uname -r</code> is the kernel release only.', '<code>lsb_release -a</code> works on many systems.', 'The hostname identifies the machine on a network.'],
    'Following a tutorial for the wrong distribution. Commands differ between apt, dnf and pacman.',
    'The example folder lives on one specific machine; these commands tell you which.',
    [''], '', 'uname -a');

  add('System', 'diskfree', 'Disk space: df and du',
    ['<code>df -h</code> shows how full each mounted disk is. <code>du -sh folder</code> shows how big a folder is. Use df to find the disk, then du to find what fills it.',
      'A disk at 100 percent breaks logging, databases and updates, so check regularly. Logs and caches are the usual culprits.'],
    ['<code>df -h /</code> checks the root disk.', '<code>du -sh *</code> sizes everything in the current folder.', 'An empty-looking disk can be out of inodes: <code>df -i</code>.'],
    'Deleting a log that a program still has open. Space is not freed until the program restarts.',
    'The log is the biggest item here; it is what grows over time.',
    ['logs/access.log'], 'logs/access.log', 'df -h');

  add('System', 'memory', 'Memory: free',
    ['<code>free -h</code> shows memory and swap. The important column is <b>available</b>, not free: Linux uses spare RAM for caching files, which is good and is given back when programs need it.',
      'Real trouble signs are low available memory together with heavy swap use. Then find the top memory users with <code>ps aux --sort=-%mem | head</code>.'],
    ['Read "available", not "free".', 'Swap use alone is not a problem; constant swapping is.', '<code>top</code> and <code>htop</code> show live usage.'],
    'Panicking at "low free memory". It is usually just file cache.',
    'Each running script or server from the folder uses memory while it runs.',
    [''], '', 'free -h');

  add('System', 'listprocs', 'Listing processes: ps',
    ['<code>ps aux</code> lists every process with its owner, CPU and memory share and command. It is a snapshot; <code>top</code> is the live version. Filter with grep: <code>ps aux | grep nginx</code>.',
      'Each process has a PID. You need it to inspect (<code>ls /proc/PID</code>), signal (<code>kill</code>) or trace a program.'],
    ['<code>ps -ef</code> is an alternative layout.', '<code>pgrep name</code> prints only PIDs.', '<code>ps aux --sort=-%cpu | head</code> shows top CPU users.'],
    'Matching the grep process itself. Use <code>pgrep</code> or <code>grep [n]ginx</code>.',
    'When deploy.sh runs, it appears here as a process with its own PID.',
    ['scripts/deploy.sh'], 'scripts/deploy.sh', 'ps aux | head -n 5');

  add('System', 'uptimeload', 'Uptime and load',
    ['<code>uptime</code> shows how long the machine has run and the <b>load average</b> for the last 1, 5 and 15 minutes. Load is the average number of programs running or waiting for a CPU.',
      'Compare it with the number of cores (<code>nproc</code>): load 4 on a 4-core machine is full; load 20 is overloaded. A rising 1-minute value with a lower 15-minute one means a recent spike.'],
    ['Load below the core count is healthy.', 'High load with idle CPU often means programs wait for disk.', 'Long uptime is not always good: kernel updates need reboots.'],
    'Reading load as a percent. It is a count of waiting tasks.',
    'A heavy deploy or backup script shows up as a short rise in load.',
    ['scripts/backup.sh'], 'scripts/backup.sh', 'uptime');

  add('System', 'readjournal', 'Reading system logs: journalctl',
    ['On systems with systemd, <code>journalctl</code> reads the central journal. Useful filters: <code>-u nginx</code> (one service), <code>-n 50</code> (last lines), <code>-f</code> (follow), <code>--since "1 hour ago"</code> and <code>-p err</code> (errors only).',
      'On older setups the same information is in text files under <code>/var/log</code>. Always start with the service that misbehaves.'],
    ['<code>journalctl -b</code> shows the current boot.', '<code>journalctl -xe</code> jumps to the end with explanations.', 'Logs need sudo or group membership to read.'],
    'Reading the whole journal. Always filter by unit or time.',
    'The website\'s own log is <b>access.log</b>; the system keeps similar logs for services.',
    ['logs/access.log'], 'logs/access.log', 'journalctl -u nginx');

  add('System', 'schedule', 'Scheduled jobs: cron',
    ['<b>cron</b> runs commands on a schedule. <code>crontab -e</code> edits your jobs and <code>crontab -l</code> lists them. A line has five time fields (minute, hour, day of month, month, weekday) and then the command.',
      '<code>30 2 * * *</code> means every day at 02:30. Cron has a minimal PATH and no terminal, so use full paths and send output to a log.'],
    ['<code>*/5 * * * *</code> is every five minutes.', 'Redirect output: <code>&gt;&gt; ~/cron.log 2&gt;&amp;1</code>.', 'Test the command by hand first.'],
    'Writing a cron job that works in your terminal but not in cron because of PATH.',
    'A nightly job could run <b>backup.sh</b> and add a line to a log.',
    ['scripts/backup.sh'], 'scripts/backup.sh', 'crontab -l');

  add('System', 'blockdevs', 'Disks and partitions: lsblk',
    ['<code>lsblk</code> draws the storage devices as a tree: disks, their partitions and where each is mounted. <code>lsblk -f</code> adds the filesystem type and label.',
      'A device is only usable after it is <b>mounted</b> on a folder. Everything under that folder then lives on that device.'],
    ['sda, sdb, nvme0n1 are disks; sda1 a partition.', '<code>mount</code> and <code>findmnt</code> show active mounts.', 'Mount by UUID in /etc/fstab.'],
    'Writing to a mount point when the disk is not mounted. The data lands on the root disk.',
    'Your website folder is a part of the filesystem on one of these devices.',
    [''], '', 'lsblk');

  add('System', 'kernelmods', 'The kernel and its modules',
    ['The <b>kernel</b> is the core of Linux: it manages memory, processes, devices and files. Drivers can be built in or loaded as <b>modules</b> while running. <code>lsmod</code> lists them, <code>modprobe name</code> loads one, <code>modinfo name</code> describes it.',
      '<code>dmesg</code> shows kernel messages about hardware and drivers, the first stop for a device that misbehaves.'],
    ['<code>uname -r</code> shows the running kernel.', '<code>dmesg | tail</code> shows recent messages.', 'Updating the kernel needs a reboot to take effect.'],
    'Removing a module that something is using. The system can freeze.',
    'Every file operation you run on the folder goes through the kernel.',
    [''], '', 'man lsmod');

  add('System', 'netnames', 'Host names and /etc/hosts',
    ['Names are turned into addresses by DNS, but first the system checks the local file <code>/etc/hosts</code>. A line like <code>127.0.0.1 localhost</code> maps a name to an address with no network lookup.',
      'You can add your own names for testing, e.g. point a domain to a test server. Remove them afterwards, or you will wonder why the real site does not load.'],
    ['<code>hostname</code> prints this machine\'s name.', '<code>getent hosts name</code> uses the same lookup as programs.', 'Edits to /etc/hosts apply at once.'],
    'Forgetting an old entry in /etc/hosts that overrides DNS.',
    'The site served from this folder is reached locally as localhost.',
    [''], '', 'cat /etc/hosts');

  /* ================= Network ================= */
  add('Network', 'ipaddr', 'IP addresses and interfaces',
    ['Every network interface has an address. <code>ip addr</code> lists them: <code>lo</code> is the loopback (127.0.0.1, this machine), <code>eth0</code> or <code>wlan0</code> are real connections. Addresses look like 192.168.1.20 (IPv4) or fe80::1 (IPv6).',
      'Private ranges (10.x, 172.16-31.x, 192.168.x) are used inside homes and offices. <code>ip route</code> shows the default gateway, the way out to the internet.'],
    ['<code>ip -br addr</code> gives a short table.', '127.0.0.1 always means "this machine".', 'The gateway is the router.'],
    'Using ifconfig on a modern system. It may be missing; use <code>ip</code>.',
    'A server serving the folder listens on one of these addresses.',
    [''], '', 'ip -br addr');

  add('Network', 'pingtest', 'Is it reachable? ping',
    ['<code>ping host</code> sends small test packets and times the replies. It answers three questions: can I reach it, how long does it take and is anything lost?',
      'Test step by step: your own machine (127.0.0.1), the router, then a public address (1.1.1.1), then a name (example.com). The first failing step shows where the problem is.'],
    ['<code>-c 4</code> sends four packets and stops.', 'Replies in about 10 to 50 ms are typical.', 'Some hosts block ping on purpose.'],
    'Concluding a host is down because it does not answer ping.',
    'Check the machine can talk to itself before blaming the network.',
    [''], '', 'ping -c 2 localhost');

  add('Network', 'dnslookup', 'DNS: names to addresses',
    ['DNS is the phone book of the internet. A lookup turns <code>example.com</code> into an address. <code>dig example.com</code> or <code>nslookup example.com</code> shows the answer and which server gave it.',
      'Record types: <b>A</b> (IPv4), <b>AAAA</b> (IPv6), <b>CNAME</b> (alias), <b>MX</b> (mail) and <b>TXT</b> (notes). Changes take time to spread because answers are cached for a TTL.'],
    ['<code>dig +short example.com</code> prints just the address.', 'If ping by IP works but by name fails, it is DNS.', 'Check <code>/etc/resolv.conf</code> or <code>resolvectl status</code>.'],
    'Changing DNS and expecting it everywhere at once. Caches hold the old value until the TTL ends.',
    'A visitor first needs DNS to find the server that holds <b>index.html</b>.',
    ['index.html'], 'index.html', 'man dig');

  add('Network', 'listenports', 'What listens where: ss',
    ['<code>ss -tulpn</code> lists programs that listen for connections: <b>t</b>cp, <b>u</b>dp, <b>l</b>istening, <b>p</b>rocess name, <b>n</b>umeric ports. Port 80 is HTTP, 443 HTTPS, 22 SSH.',
      'A service bound to <code>127.0.0.1</code> accepts only local connections; <code>0.0.0.0</code> accepts all. Close ports you do not use.'],
    ['Needs sudo to show process names of others.', '<code>ss -s</code> gives a summary.', '<code>lsof -i :80</code> shows who uses a port.'],
    'Binding a private service to 0.0.0.0 and exposing it by accident.',
    'A web server for this folder would show up as listening on port 80 or 8080.',
    [''], '', 'ss -tulpn');

  add('Network', 'curlreq', 'Making web requests: curl',
    ['<code>curl url</code> fetches a page and prints it. <code>curl -I url</code> shows only the headers, including the status code. <code>-L</code> follows redirects, <code>-o file</code> saves the result and <code>-s</code> hides the progress meter.',
      'It is the first tool to test a website or API from the command line because it shows exactly what a server answers, without a browser.'],
    ['<code>curl -s -o /dev/null -w "%{http_code}" url</code> prints only the status.', '<code>-X POST -d data</code> sends data.', '<code>-H</code> adds a header.'],
    'Piping curl output to a shell without reading it first.',
    'The log records each request curl would make, with its status code.',
    ['logs/access.log'], 'logs/access.log', 'curl -I http://localhost');

  add('Network', 'sshlogin', 'Remote login with SSH',
    ['<code>ssh user@host</code> opens a shell on another machine through an encrypted connection. It replaced telnet and is how most servers are managed. The first connection asks you to confirm the host\'s fingerprint.',
      'Keys are better than passwords: create a pair with <code>ssh-keygen</code>, copy the public part with <code>ssh-copy-id</code> and keep the private key private. <code>scp</code> and <code>rsync</code> copy files over the same channel.'],
    ['<code>~/.ssh/config</code> stores short names for hosts.', 'Private key mode must be 600.', '<code>ssh -v</code> shows why a login fails.'],
    'Giving the private key (id_ed25519) to anyone. Share only the .pub file.',
    'Your deploy script could copy the folder to a server with scp or rsync.',
    ['scripts/deploy.sh'], 'scripts/deploy.sh', 'man ssh');

  add('Network', 'firewallbasics', 'Firewall basics',
    ['A <b>firewall</b> decides which network connections may reach the machine. On Ubuntu <code>ufw</code> is the friendly front end: <code>sudo ufw allow 22</code>, <code>sudo ufw enable</code>, <code>sudo ufw status</code>. Fedora uses <code>firewalld</code>.',
      'A good rule set denies incoming traffic by default and allows only what you serve: SSH, and web ports if you host a site. Allow SSH <i>before</i> you enable the firewall on a remote machine.'],
    ['Default deny incoming, allow outgoing.', '<code>ufw status numbered</code> lets you delete rules by number.', 'Rules are checked in order.'],
    'Enabling a firewall over SSH without allowing SSH. You lock yourself out.',
    'To let visitors reach the site in this folder, ports 80 and 443 must be allowed.',
    [''], '', 'man ufw');

  /* ================= Scripting ================= */
  add('Scripting', 'forloop', 'Loops: for',
    ['A <code>for</code> loop repeats commands for each item in a list: <code>for f in *.txt; do echo $f; done</code>. The list can be a wildcard, a sequence like <code>{1..5}</code> or the words you type.',
      'Loops turn a one-file command into a many-file command: rename, convert, check or back up everything that matches.'],
    ['Quote variables inside: <code>"$f"</code>.', 'Use a glob (<code>*.txt</code>) rather than parsing <code>ls</code>.', '<code>break</code> leaves the loop, <code>continue</code> skips an item.'],
    'Looping over <code>$(ls)</code>. Names with spaces split apart.',
    'Do something with every script in the folder.',
    ['scripts'], 'scripts', 'for f in ~/website/scripts/*.sh; do echo "script: $f"; done');

  add('Scripting', 'testcond', 'Testing conditions',
    ['<code>test</code> (or <code>[ ... ]</code>) checks a condition and sets the exit code: 0 for true. File tests: <code>-f</code> file, <code>-d</code> directory, <code>-e</code> exists, <code>-x</code> executable. Text and numbers: <code>=</code>, <code>-eq</code>, <code>-gt</code>.',
      'Use it in <code>if</code> statements or with <code>&amp;&amp;</code> and <code>||</code> on one line. Always check before you act: does the file exist, is the folder writable, is the variable set?'],
    ['<code>[[ ]]</code> in bash is safer than <code>[ ]</code>.', '<code>-z "$x"</code> is true if x is empty.', 'Spaces around brackets are required.'],
    'Writing <code>[$x=1]</code> without spaces. It is parsed as one word.',
    'The backup script has no x bit: test it before running.',
    ['scripts/backup.sh'], 'scripts/backup.sh', 'test -x ~/website/scripts/backup.sh && echo "can run" || echo "not executable"');

  add('Scripting', 'arith', 'Arithmetic in the shell',
    ['The shell does whole-number maths with <code>$((expression))</code>: <code>echo $((6 * 7))</code> prints 42. Operators: + - * / % (remainder) and ** (power). Variables work inside without a dollar: <code>$((n + 1))</code>.',
      'For decimals use <code>awk</code> or <code>bc</code>. Counters in loops are the common use: <code>count=$((count + 1))</code>.'],
    ['Division discards decimals: 7/2 is 3.', '<code>let</code> and <code>((...))</code> are alternatives.', 'Use awk for floating point.'],
    'Expecting 7/2 to give 3.5. Integer maths only.',
    'Work out the total of two values, for example sizes you read from the folder.',
    [''], '', 'echo $((6 * 7)) $((17 % 5))');

  add('Scripting', 'cmdsub', 'Command substitution',
    ['<code>$(command)</code> is replaced by the command\'s output, so one command can feed another: <code>echo "Today is $(date +%F)"</code>, <code>cd $(dirname file)</code>. The old form with backticks works but does not nest well.',
      'Capture into a variable to reuse it: <code>count=$(wc -l &lt; file)</code>. Always put the result in quotes when it might contain spaces.'],
    ['Trailing new lines are removed.', 'Nesting works: <code>$(basename $(pwd))</code>.', 'The exit code is that of the inner command.'],
    'Forgetting the quotes: <code>cd $(...)</code> breaks on folders with spaces.',
    'Store the number of lines of the log in a variable and print it.',
    ['logs/access.log'], 'logs/access.log', 'n=$(wc -l < ~/website/logs/access.log); echo "$n visits logged"');

  add('Scripting', 'quoting', 'Quoting rules',
    ['Quotes protect text from the shell. <b>Double quotes</b> keep spaces together but still expand variables and <code>$(...)</code>. <b>Single quotes</b> keep everything literal. A backslash protects one character.',
      'Quoting decides whether <code>*</code> expands, whether a name with a space is one argument or two and whether <code>$HOME</code> is replaced.'],
    ['Quote variables: <code>"$file"</code>.', 'Use single quotes for patterns, like awk and grep programs.', 'Nest by alternating the quote types.'],
    'Leaving variables unquoted. A file called <code>my notes.txt</code> becomes two arguments.',
    'Compare how the same text prints with single and double quotes.',
    [''], '', "echo 'literal $HOME' \"expanded $HOME\"");

  add('Scripting', 'braces', 'Brace expansion and wildcards together',
    ['Braces make lists before the command runs: <code>{a,b,c}</code> gives three words, <code>{1..3}</code> a range. Combined with text: <code>report-{jan,feb}.txt</code> gives two names. Different from wildcards, braces generate names even if the files do not exist.',
      'They are ideal for creating folder structures and for backing up one file: <code>cp file{,.bak}</code> expands to <code>cp file file.bak</code>.'],
    ['Braces expand first, wildcards after.', '<code>cp file{,.bak}</code> is a handy backup trick.', 'No spaces inside braces.'],
    'Confusing braces with wildcards. Braces do not look at existing files.',
    'Create a backup of the notes with a one-word trick.',
    ['notes.txt'], 'notes.txt', 'cp ~/website/notes.txt{,.bak} && ls ~/website');

  add('Scripting', 'printfmt', 'Formatted output with printf',
    ['<code>printf FORMAT args</code> prints exactly what you ask: <code>%s</code> text, <code>%d</code> whole number, <code>%5.2f</code> a decimal, <code>\\n</code> a new line, <code>\\t</code> a tab. The format is reused for every argument.',
      'It makes reports and tables line up: <code>printf "%-10s %5d\\n" name 42</code> pads the name to 10 characters and the number to 5.'],
    ['Always add <code>\\n</code>: printf does not.', '<code>%-10s</code> left-aligns in 10 columns.', 'The format repeats for extra arguments.'],
    'Passing user text as the format. A % in it can break the output; use <code>printf "%s\\n" "$text"</code>.',
    'Print a small table of the folder items.',
    [''], '', 'printf "%-12s %s\\n" index.html page notes.txt todo .env secret');

  add('Scripting', 'sourcing', 'Running a script versus sourcing it',
    ['Running <code>./script.sh</code> starts a <b>new process</b>; its variables and <code>cd</code> vanish when it ends. <code>source script.sh</code> (or <code>. script.sh</code>) runs the lines <b>in your current shell</b>, so variables, functions and folder changes stay.',
      'That is why settings files such as <code>~/.bashrc</code> and <code>.env</code> are sourced, not executed.'],
    ['Use source for configuration; run for tasks.', '<code>set -a; source .env; set +a</code> exports all variables from .env.', 'A sourced script needs no x bit.'],
    'Expecting a script that calls <code>cd</code> to move your terminal. Only sourcing does that.',
    'The hidden <b>.env</b> is meant to be sourced to load its settings into a shell.',
    ['.env'], '.env', 'echo "x=1" > /tmp/vars.sh && source /tmp/vars.sh && echo "x is $x"');

  /* ================= Tools ================= */
  add('Tools', 'searchman', 'Finding the right command',
    ['If you know what you want but not the command, search the manuals by keyword: <code>apropos word</code> or <code>man -k word</code>. This simulator has a similar <code>search word</code> command across its documented commands.',
      'Then read the page: <code>man name</code> for details, <code>name --help</code> for a short list, <code>tldr name</code> for friendly examples.'],
    ['Search for the task in plain words: permissions, archive, copy.', 'Press <code>/</code> inside man to search, <code>q</code> to quit.', 'Section numbers: 1 commands, 5 files, 8 admin.'],
    'Searching the web first for every question. The answer is usually on your machine.',
    'Find commands that deal with permissions.',
    [''], '', 'search permissions');

  add('Tools', 'editors', 'Editing text: nano and vim',
    ['<code>nano file</code> is the easy editor: it shows its shortcuts at the bottom (<code>^O</code> save, <code>^X</code> exit). <code>vim</code> is powerful and modal: press <code>i</code> to type, <code>Esc</code> to leave insert mode, <code>:wq</code> to save and quit, <code>:q!</code> to quit without saving.',
      'You will need one of them on every server. Pick nano to start; learn the vim basics so you can leave it when you land in it.'],
    ['nano: Ctrl+O saves, Ctrl+X exits.', 'vim: <code>:wq</code> save and quit; <code>:q!</code> quit without saving.', 'Set <code>EDITOR=nano</code> for tools that open an editor.'],
    'Being stuck in vim. Press Esc, then type <code>:q!</code> and Enter.',
    'Edit <b>notes.txt</b> to tick off items.',
    ['notes.txt'], 'notes.txt', 'man nano');

  add('Tools', 'archivetools', 'Archives: tar and zip',
    ['<code>tar</code> bundles many files into one. <code>tar -czf out.tar.gz folder</code> creates a gzip-compressed archive, <code>tar -tzf out.tar.gz</code> lists it and <code>tar -xzf out.tar.gz</code> extracts. Letters: c create, x extract, t list, z gzip, f file name.',
      '<code>zip -r out.zip folder</code> and <code>unzip</code> are better for sharing with Windows users.'],
    ['Always list (<code>-t</code>) an unknown archive before extracting.', 'Use <code>-C dir</code> to extract elsewhere.', 'The f option takes the next word as the file name.'],
    'Extracting into a crowded folder. Files with the same name are overwritten.',
    'Pack the whole site into one file for a backup or download.',
    [''], '', 'man tar');

  add('Tools', 'gittrack', 'Tracking changes with git',
    ['<b>git</b> records the history of a project. <code>git init</code> starts one, <code>git add</code> stages changes, <code>git commit -m "message"</code> saves a snapshot, <code>git log</code> shows history and <code>git diff</code> shows what changed.',
      'You can undo mistakes, compare versions and work on branches. Add a <code>.gitignore</code> so secrets such as .env and generated files are never recorded.'],
    ['Commit small and often with clear messages.', '<code>git status</code> is the command you will use most.', 'Never commit passwords or keys.'],
    'Committing the .env file. Even deleted later, it stays in history.',
    'This whole folder could be a git repository, with .env ignored.',
    ['.env', 'index.html'], 'index.html', 'man git');

  add('Tools', 'containers', 'Containers in one idea',
    ['A <b>container</b> runs a program with its own files, libraries and network view, sharing the host\'s kernel. It starts in seconds and behaves the same everywhere. <code>docker run</code> starts one from an <b>image</b> (a packaged template).',
      'Typical uses: run a web server or database without installing it, test software in a clean environment, and ship an app with everything it needs.'],
    ['<code>docker ps</code> lists running containers.', 'Mount your folder with <code>-v</code> to serve files from it.', 'Data inside a container is lost unless stored in a volume.'],
    'Keeping important data inside a container. Deleting the container deletes the data.',
    'A container could serve this folder: mount it, publish a port and open it in a browser.',
    ['', 'index.html'], '', 'man docker');

  add('Tools', 'multiplex', 'Sessions that survive: tmux',
    ['<b>tmux</b> keeps your terminal sessions running on the server even if your connection drops. <code>tmux new -s work</code> starts one, <code>Ctrl+B then D</code> detaches and <code>tmux attach -t work</code> returns to it.',
      'Panes and windows let you watch logs, edit and run commands side by side in one connection. It is essential for long jobs over SSH.'],
    ['Prefix key is Ctrl+B.', '<code>tmux ls</code> lists sessions.', 'Splits: <code>Ctrl+B %</code> vertical, <code>Ctrl+B "</code> horizontal.'],
    'Running a long job in a plain SSH window. If the connection drops, the job stops.',
    'Run the deploy script and follow its log at the same time, each in its own pane.',
    ['logs/access.log', 'scripts/deploy.sh'], 'logs/access.log', 'man tmux');
})();
