/* Linuxverse home walkthrough: 1) learn the theory, 2) see it in an example folder, 3) use it on that folder */
(function () {
  'use strict';
  var esc = LV.esc, ic = LV.icon;
  var ROOT = '/home/ssk/website';

  /* Theory concepts, each tied to items in the example folder */
  var CONCEPTS = [
    { id: 'files', g: 'Basics', t: 'Everything is a file',
      theory: ['Linux treats almost everything as a file: documents, programs, folders, even disks (<code>/dev/sda</code>) and the live system information in <code>/proc</code>. A folder (directory) is just a special file that holds a list of names.',
        'Because of this, the same small set of tools (ls, cat, cp, mv, rm) works on nearly everything, and programs can read a device or a setting the same way they read a document.'],
      keys: ['File types in <code>ls -l</code>: <code>-</code> regular file, <code>d</code> directory, <code>l</code> symbolic link, <code>c</code>/<code>b</code> devices.', 'File names are case-sensitive: <code>Notes.txt</code> and <code>notes.txt</code> are two different files.', 'Extensions like .txt are only a naming habit; Linux looks at the content and permissions, not the name.'],
      mistake: 'Expecting a file extension to make something runnable. A script runs because of its x permission, not because it ends in .sh.',
      folder: 'The example folder <b>website</b> is a directory. Inside are regular files (index.html, notes.txt), more directories (css, scripts, logs) and a link (latest.log).',
      hi: ['', 'index.html', 'notes.txt', 'css', 'scripts', 'logs', 'latest.log'], sel: '', tryCmd: 'ls -l ~/website' },
    { id: 'paths', g: 'Basics', t: 'One tree and paths',
      theory: ['All files hang from one tree that starts at <code>/</code> (root). Extra disks are attached (mounted) inside this tree, so there are no drive letters like C: or D:.',
        'A <b>path</b> is the route to a file. An <b>absolute path</b> starts at / and works from anywhere. A <b>relative path</b> starts from your current folder.'],
      keys: ['<code>~</code> is your home folder, here <code>/home/ssk</code>.', '<code>.</code> is the current folder, <code>..</code> is the parent folder.', '<code>pwd</code> prints where you are; <code>cd</code> moves you; <code>cd -</code> goes back.'],
      mistake: 'Forgetting where you are. A relative path like <code>css/style.css</code> only works from inside website. Run <code>pwd</code> when unsure.',
      folder: 'style.css lives at <code>/home/ssk/website/css/style.css</code> (absolute). From inside website, the same file is just <code>css/style.css</code> (relative), and from inside css it is <code>./style.css</code>.',
      hi: ['css', 'css/style.css'], sel: 'css/style.css', tryCmd: 'cd ~/website/css && pwd' },
    { id: 'hidden', g: 'Basics', t: 'Hidden files',
      theory: ['A file whose name starts with a dot is <b>hidden</b>. It is not secret or protected; plain <code>ls</code> simply skips it to keep listings tidy.',
        'Settings are usually stored this way: <code>~/.bashrc</code> for your shell, <code>~/.ssh</code> for keys, <code>.env</code> or <code>.git</code> inside projects.'],
      keys: ['<code>ls -a</code> shows hidden files, including <code>.</code> and <code>..</code>.', '<code>ls -A</code> shows hidden files but leaves out . and ..', 'To protect a file, change its permissions. Hiding it protects nothing.'],
      mistake: 'Thinking a dot-file is safe. Anyone allowed to read the folder can still list and open it with ls -a.',
      folder: '<b>.env</b> holds the site settings. <code>ls ~/website</code> does not list it; <code>ls -a ~/website</code> does.',
      hi: ['.env'], sel: '.env', tryCmd: 'ls -a ~/website' },
    { id: 'help', g: 'Basics', t: 'Getting help',
      theory: ['You never have to memorise every option. Almost every command explains itself: <code>man name</code> opens its full manual, and <code>name --help</code> prints a short summary.',
        'Inside a manual page, <b>space</b> pages down, <b>/word</b> searches, <b>n</b> jumps to the next match and <b>q</b> quits. <code>man -k word</code> (or <code>apropos word</code>) finds commands by topic.'],
      keys: ['<code>man ls</code> is the full manual; <code>ls --help</code> is the quick version.', 'Shell builtins such as cd have no man page: use <code>help cd</code>.', 'The first lines of a man page, SYNOPSIS, show the exact shape of the command.'],
      mistake: 'Pasting a command from a web page without understanding it. Look up each part with man first, especially anything starting with sudo or rm.',
      folder: 'Not sure what the columns of <code>ls -l ~/website</code> mean? <code>man ls</code> explains every one of them, including the permission string.',
      hi: [''], sel: '', tryCmd: 'man ls' },
    { id: 'speed', g: 'Basics', t: 'Work faster: Tab and history',
      theory: ['The shell does a lot of typing for you. Press <b>Tab</b> to complete a command or file name. If several names fit, press Tab twice to see them all.',
        'Press <b>↑</b> to bring back earlier commands, <code>Ctrl+R</code> to search them, and use <code>history</code> to list them. <code>!!</code> repeats the last command, which is handy as <code>sudo !!</code>.'],
      keys: ['Tab completes only what exists, so a failed completion often means a typo.', '<code>Ctrl+C</code> cancels the current line or command; <code>Ctrl+L</code> clears the screen.', '<code>Ctrl+A</code> and <code>Ctrl+E</code> jump to the start and end of the line.'],
      mistake: 'Typing long paths by hand. One wrong letter gives "No such file or directory". Let Tab build the path for you.',
      folder: 'Type <code>cd ~/web</code> and press Tab: it completes to <code>website/</code>. Type <code>s</code> and Tab again to reach <code>scripts/</code>.',
      hi: ['', 'scripts'], sel: 'scripts', tryCmd: 'cd ~/website && ls' },
    { id: 'users', g: 'Security', t: 'Users, groups and root',
      theory: ['Linux is multi-user. Every person and every service runs as a <b>user</b> with a number (UID). Users belong to <b>groups</b>, which let several users share access.',
        '<b>root</b> (UID 0) is the administrator and can do anything. Normal users borrow root power for one command at a time with <code>sudo</code>.'],
      keys: ['Every file has exactly one owner user and one owner group.', '<code>id</code> shows your user, your main group and every group you are in.', 'Services run as their own users (for example www-data for a web server) so a bug in one cannot touch everything.'],
      mistake: 'Running everything with sudo. Files you create as root become owned by root, and you then cannot edit them as yourself.',
      folder: 'Every item in website is owned by user <b>ssk</b> and group <b>ssk</b>. That is the second and third column of <code>ls -l</code>.',
      hi: ['', 'index.html', 'notes.txt', '.env'], sel: 'index.html', tryCmd: 'id' },
    { id: 'owner', g: 'Security', t: 'Ownership: chown and groups',
      theory: ['Permissions are checked against two names stored on every file: its <b>owner</b> and its <b>group</b>. If you are the owner, the owner permissions apply; else if you are in the group, the group permissions apply; otherwise the "others" permissions do.',
        '<code>chown user:group file</code> changes both names and needs root. Services like a web server run as their own user (for example <code>www-data</code>), so files must be readable by that user or its group.'],
      keys: ['<code>stat file</code> shows owner, group, mode, size and times in one place.', '<code>chown -R user:group folder</code> changes everything inside as well.', '<code>chgrp group file</code> changes only the group; <code>groups</code> lists yours.'],
      mistake: 'Running <code>sudo chown -R</code> on the wrong path, such as / or ~. It can break the whole system. Check the path with ls first.',
      folder: 'Everything in website belongs to <b>ssk</b>. A web server running as www-data counts as "others": it can read index.html (644) but not <b>.env</b> (600), which is exactly what you want.',
      hi: ['index.html', '.env'], sel: '.env', tryCmd: 'stat ~/website/index.html' },
    { id: 'perms', g: 'Security', t: 'Permissions',
      theory: ['Every file has three sets of rights: for the <b>owner</b>, the <b>group</b> and <b>others</b> (everyone else). Each set is <b>r</b> read, <b>w</b> write, <b>x</b> execute.',
        'You see them as a string like <code>-rw-r--r--</code>, or as numbers: r=4, w=2, x=1, added per set. So rw- is 6, r-- is 4, and the whole string is <b>644</b>.'],
      keys: ['Common modes: 644 normal files, 755 programs and folders, 600 private files, 700 private folders.', 'Only one set applies to you: owner first, else group, else others.', '<code>chmod</code> changes permissions; <code>chown</code> changes the owner (needs sudo).'],
      mistake: 'Using <code>chmod 777</code> to "fix" a problem. It lets every user change or replace the file.',
      folder: '<b>.env</b> is <code>rw-------</code> (600): only ssk can read it. <b>index.html</b> is <code>rw-r--r--</code> (644): everyone can read, only ssk can change it.',
      hi: ['.env', 'index.html'], sel: '.env', tryCmd: 'ls -la ~/website' },
    { id: 'chmodsym', g: 'Security', t: 'Changing permissions: letters and numbers',
      theory: ['<code>chmod</code> has two ways to say the same thing. <b>Numbers</b> set every permission at once (<code>chmod 755 file</code>). <b>Letters</b> change only part of them (<code>chmod u+x file</code>).',
        'In letter form you pick who (<b>u</b> owner, <b>g</b> group, <b>o</b> others, <b>a</b> all), an action (<b>+</b> add, <b>-</b> remove, <b>=</b> set exactly) and what (<b>r</b>, <b>w</b>, <b>x</b>).'],
      keys: ['<code>chmod u+x file</code> adds execute for the owner only; <code>chmod +x file</code> adds it for everyone.', '<code>chmod go-rwx file</code> removes all access for group and others.', '<code>chmod -R</code> applies to a whole folder tree. Use it with care.'],
      mistake: 'Using <code>chmod -R 644</code> on a folder. Folders need x, so you lose access to everything inside. Use letters or <code>find</code> to treat files and folders differently.',
      folder: '<b>backup.sh</b> is <code>rw-r--r--</code>. <code>chmod u+x</code> turns it into <code>rwxr--r--</code>: only ssk can run it, and nobody else gains anything.',
      hi: ['scripts/backup.sh'], sel: 'scripts/backup.sh', tryCmd: 'chmod u+x ~/website/scripts/backup.sh && ls -l ~/website/scripts' },
    { id: 'dirperm', g: 'Security', t: 'Folder permissions',
      theory: ['On a folder the same three letters mean something different. <b>r</b> lets you list the names inside, <b>w</b> lets you create, rename or delete entries, and <b>x</b> lets you enter the folder and reach files in it.',
        'You need x on every folder along a path to reach a file. That is why folders are usually 755 rather than 644.'],
      keys: ['Deleting a file needs w on the <i>folder</i>, not on the file itself.', 'A folder with r but no x lets you see names but not open anything.', '<code>ls -ld folder</code> shows the folder\'s own permissions instead of its contents.'],
      mistake: 'Giving a folder 644. Without x, nobody (not even with r) can cd into it or open the files inside.',
      folder: '<b>logs</b> is <code>rwxr-x---</code> (750): the owner has full access, the group can look and enter, and other users cannot even list it.',
      hi: ['logs', 'logs/access.log'], sel: 'logs', tryCmd: 'ls -ld ~/website/logs' },
    { id: 'umask', g: 'Security', t: 'Default permissions (umask)',
      theory: ['When you create something, Linux starts from 666 for files and 777 for folders, then removes the bits in your <b>umask</b>.',
        'The usual umask is <code>022</code>, which removes write for group and others. New files become 644 and new folders 755.'],
      keys: ['New files are never executable by default; scripts need chmod +x.', '<code>umask</code> shows the current mask; <code>umask 077</code> makes new files private for this session.', 'Put a umask line in <code>~/.bashrc</code> to make it permanent.'],
      mistake: 'Wondering why a new script will not run. It was created as 644; add x yourself.',
      folder: 'Create a new page in website and check its permissions: it arrives as <code>-rw-r--r--</code>, decided by the umask.',
      hi: ['', 'index.html'], sel: '', tryCmd: 'touch ~/website/about.html && ls -l ~/website/about.html' },
    { id: 'exec', g: 'Programs', t: 'Running programs',
      theory: ['A script or program only runs when it has the <b>x</b> (execute) permission. Without it, Linux refuses with "Permission denied", even for its owner.',
        'The first line of a script, the <b>shebang</b> (<code>#!/usr/bin/env bash</code>), tells Linux which interpreter should run it.'],
      keys: ['<code>chmod +x file</code> adds execute for everyone; <code>chmod u+x</code> for the owner only.', '<code>bash file.sh</code> runs a script without needing x, because bash itself is the program.', 'Run a program by its path: <code>./deploy.sh</code> or <code>~/website/scripts/deploy.sh</code>.'],
      mistake: 'Typing just <code>deploy.sh</code>. The shell only searches the folders in $PATH, so it answers "command not found".',
      folder: '<b>deploy.sh</b> is executable (<code>rwxr-xr-x</code>). <b>backup.sh</b> is not (<code>rw-r--r--</code>). Run it, fix it with chmod, and run it again.',
      hi: ['scripts/deploy.sh', 'scripts/backup.sh'], sel: 'scripts/backup.sh', tryCmd: '~/website/scripts/backup.sh' },
    { id: 'path', g: 'Programs', t: 'The shell, commands and $PATH',
      theory: ['The <b>shell</b> (usually bash) reads what you type, splits it into a command, options and arguments, finds the program and starts it.',
        'It looks for programs in each folder listed in the <b>$PATH</b> variable, in order. <code>ls</code> works anywhere because <code>/usr/bin</code> is in $PATH; your own scripts folder is not.'],
      keys: ['Shape of a command: <code>command -options arguments</code>, for example <code>ls -l ~/website</code>.', '<code>which ls</code> shows which file runs; <code>type cd</code> shows that cd is built into the shell.', 'Variables: <code>$HOME</code>, <code>$USER</code>, <code>$PATH</code>. Read one with <code>echo $NAME</code>.'],
      mistake: 'Adding <code>.</code> to $PATH to avoid typing ./ . It lets a planted file with a common name run by accident.',
      folder: 'The scripts folder is not in $PATH, so its scripts need a path in front: <code>~/website/scripts/deploy.sh</code>.',
      hi: ['scripts', 'scripts/deploy.sh'], sel: 'scripts/deploy.sh', tryCmd: 'echo $PATH' },
    { id: 'vars', g: 'Programs', t: 'Variables and quoting',
      theory: ['A <b>variable</b> stores text: <code>site=website</code> (no spaces around the =). Use it with a dollar sign: <code>echo $site</code>. <code>$(command)</code> inserts a command\'s output.',
        '<b>Quotes</b> decide what the shell may change. Inside double quotes, variables still expand: <code>"Folder: $site"</code>. Inside single quotes nothing does: <code>\'$site\'</code> stays literal.'],
      keys: ['Always quote variables that may contain spaces: <code>"$file"</code>.', '<code>export NAME=value</code> also passes the variable to programs you start.', '<code>today=$(date +%F)</code> stores the output of a command.'],
      mistake: 'Writing <code>site = website</code> with spaces. The shell then tries to run a command called site. There must be no spaces around =.',
      folder: 'Store the folder name once, then reuse it: <code>site=website</code>, and <code>ls ~/$site</code> lists the example folder.',
      hi: [''], sel: '', tryCmd: 'site=website; echo "Folder: $site"; ls ~/$site' },
    { id: 'jobs', g: 'Programs', t: 'Foreground, background and jobs',
      theory: ['A normal command keeps your terminal busy until it ends. Add <code>&amp;</code> to run it in the <b>background</b> and get the prompt back at once. <code>Ctrl+Z</code> pauses a running command.',
        '<code>jobs</code> lists your background jobs, <code>fg</code> brings one to the front and <code>bg</code> lets a paused one continue in the background. <code>nohup</code> or tmux keeps work running after you log out.'],
      keys: ['<code>command &amp;</code> starts in the background and prints a job number like [1].', '<code>kill %1</code> stops job 1; <code>kill PID</code> stops by process ID.', 'A closed terminal normally ends its background jobs; <code>nohup command &amp;</code> survives.'],
      mistake: 'Starting a long task in a plain SSH session and then closing it. The task dies with the session. Use tmux or nohup.',
      folder: 'A slow job such as <b>backup.sh</b> or a site build can run in the background while you keep working in the same folder. Try it starts a harmless <code>sleep 60</code> in the background; then type <code>jobs</code> in the terminal to see it.',
      hi: ['scripts/backup.sh'], sel: 'scripts/backup.sh', tryCmd: 'sleep 60 &' },
    { id: 'process', g: 'Programs', t: 'Processes and exit codes',
      theory: ['Each running program is a <b>process</b> with its own ID (PID), owner and memory. When a command finishes, it returns an <b>exit code</b>.',
        'Exit code <b>0</b> means success; anything else means failure. <code>$?</code> holds the last one, and <code>&amp;&amp;</code> / <code>||</code> decide what runs next based on it.'],
      keys: ['<code>a &amp;&amp; b</code> runs b only if a succeeded; <code>a || b</code> only if a failed.', '<code>ps aux</code> lists processes; <code>kill PID</code> asks one to stop.', 'A process runs with the permissions of the user who started it.'],
      mistake: 'Chaining with <code>;</code> when a step must succeed first. <code>cd folder; rm *</code> deletes in the wrong place if cd failed; use &amp;&amp;.',
      folder: 'Running <b>deploy.sh</b> starts a process. When it ends, its exit code tells you whether the deploy worked.',
      hi: ['scripts/deploy.sh'], sel: 'scripts/deploy.sh', tryCmd: '~/website/scripts/deploy.sh && echo "exit code: $?"' },
    { id: 'links', g: 'Files', t: 'Links',
      theory: ['A file\'s data lives in an <b>inode</b>; a name is just an entry pointing at it. A <b>hard link</b> is a second name for the same inode.',
        'A <b>symbolic link</b> is a small file that stores a path, like a shortcut. Opening the link opens its target. If the target moves or is deleted, the link breaks.'],
      keys: ['<code>ln -s target linkname</code> makes a symlink; <code>ln target name</code> makes a hard link.', '<code>ls -l</code> shows a symlink as <code>l</code> with an arrow to its target.', 'Symlinks can point to folders and across disks; hard links cannot.'],
      mistake: 'Deleting the target and keeping the link. The link stays but leads nowhere ("No such file or directory").',
      folder: '<b>latest.log</b> points to <code>logs/access.log</code>. Reading latest.log shows the access log.',
      hi: ['latest.log', 'logs/access.log'], sel: 'latest.log', tryCmd: 'ls -l ~/website/latest.log' },
    { id: 'manage', g: 'Files', t: 'Copy, move and delete',
      theory: ['<code>cp</code> copies, <code>mv</code> moves or renames (renaming is just moving to a new name), and <code>rm</code> deletes. Folders need <code>-r</code> to copy or delete recursively.',
        'There is <b>no recycle bin</b> in the terminal. <code>rm</code> removes the name at once.'],
      keys: ['Make a backup copy before editing: <code>cp file file.bak</code>.', '<code>-i</code> asks before overwriting or deleting; <code>-n</code> never overwrites.', '<code>mkdir -p a/b/c</code> creates a whole chain of folders.'],
      mistake: 'Running <code>rm -r</code> with a typo in the path. Read it twice; there is no undo.',
      folder: 'Back up the home page before you change it. The copy appears in the folder next to the original.',
      hi: ['index.html'], sel: 'index.html', tryCmd: 'cp ~/website/index.html ~/website/index.bak && ls ~/website' },
    { id: 'glob', g: 'Files', t: 'Wildcards',
      theory: ['The shell expands <b>wildcards</b> into matching file names before the command runs. <code>*</code> matches any text, <code>?</code> one character, <code>[abc]</code> one of a set.',
        'So <code>ls *.sh</code> is really <code>ls backup.sh deploy.sh</code>: ls never sees the star.'],
      keys: ['<code>*.log</code> every name ending in .log; <code>report-??.txt</code> exactly two characters.', 'Wildcards skip hidden files unless the pattern starts with a dot.', '<code>{1..5}</code> (brace expansion) generates a list even when no files exist.'],
      mistake: 'Running <code>rm *</code> in the wrong folder. Check with <code>ls *</code> first to see what the star expands to.',
      folder: 'Inside <b>scripts</b>, <code>*.sh</code> matches both deploy.sh and backup.sh.',
      hi: ['scripts/deploy.sh', 'scripts/backup.sh'], sel: 'scripts', tryCmd: 'cd ~/website/scripts && ls *.sh' },
    { id: 'find', g: 'Files', t: 'Finding files with find',
      theory: ['<code>find where -tests -action</code> walks a folder tree and prints every item that passes your tests. Without tests it lists everything.',
        'Tests include <code>-name</code> (file name pattern), <code>-type f|d</code> (file or directory), <code>-mtime -7</code> (changed in the last week) and <code>-size +1M</code>. <code>-exec</code> runs a command on each result.'],
      keys: ['Quote the pattern: <code>-name "*.sh"</code>. The quotes stop the shell expanding it first.', '<code>-type d</code> finds only folders, <code>-type f</code> only files.', '<code>-iname</code> ignores upper and lower case.'],
      mistake: 'Leaving the pattern unquoted. If a match exists in the current folder, the shell replaces the star with it and find searches for the wrong thing.',
      folder: '<code>find ~/website -name "*.sh"</code> lists <b>deploy.sh</b> and <b>backup.sh</b> wherever they sit below website.',
      hi: ['scripts/deploy.sh', 'scripts/backup.sh'], sel: 'scripts', tryCmd: 'find ~/website -name "*.sh"' },
    { id: 'redirect', g: 'Text', t: 'Redirection',
      theory: ['Every command has three streams: <b>stdin</b> (input), <b>stdout</b> (normal output) and <b>stderr</b> (errors). Normally all three are your terminal.',
        'Redirection sends them elsewhere: <code>&gt;</code> writes output to a file (replacing it), <code>&gt;&gt;</code> adds to the end, <code>2&gt;</code> sends errors, <code>&lt;</code> reads input from a file.'],
      keys: ['<code>&gt;</code> empties the file first. Use <code>&gt;&gt;</code> to keep what is there.', '<code>2&gt;/dev/null</code> throws error messages away.', '<code>command &gt; out.txt 2&gt;&amp;1</code> saves output and errors together.'],
      mistake: 'Typing <code>&gt;</code> when you meant <code>&gt;&gt;</code>. The file\'s old contents are gone instantly.',
      folder: 'Add a task to <b>notes.txt</b> with &gt;&gt; and the existing to-dos stay.',
      hi: ['notes.txt'], sel: 'notes.txt', tryCmd: 'echo "TODO: add contact page" >> ~/website/notes.txt && cat ~/website/notes.txt' },
    { id: 'text', g: 'Text', t: 'Text tools and pipes',
      theory: ['Configuration and logs are plain text, so small tools can answer questions about them: <code>grep</code> finds lines, <code>wc</code> counts, <code>sort</code> orders, <code>uniq</code> removes repeats.',
        'A pipe <code>|</code> sends one tool\'s output straight into the next. Chaining small tools is the core Linux habit.'],
      keys: ['<code>grep word file</code> prints matching lines; <code>-c</code> counts them, <code>-i</code> ignores case.', 'Config files often use <code>KEY=value</code> lines that grep can find instantly.', 'Read pipelines left to right: each step changes the data a little.'],
      mistake: 'Running <code>uniq</code> without <code>sort</code> first. uniq only merges repeats that sit next to each other.',
      folder: '<b>logs/access.log</b> records every visit. One pipeline counts how many visits ended in a 404 error.',
      hi: ['logs/access.log', '.env', 'notes.txt'], sel: 'logs/access.log', tryCmd: 'grep 404 ~/website/logs/access.log | wc -l' },
    { id: 'regex', g: 'Text', t: 'Search patterns (regular expressions)',
      theory: ['A <b>regular expression</b> describes a shape of text rather than exact text. <code>grep -E</code> understands them: <code>.</code> is any character, <code>*</code> repeats, <code>[0-9]</code> is a digit, <code>|</code> means "or", <code>^</code> and <code>$</code> mark the start and end of a line.',
        'Always put the pattern in quotes so the shell leaves the special characters alone.'],
      keys: ['<code>grep -E "404|500" file</code> finds lines with either code.', '<code>grep -E "^192" file</code> finds lines that start with 192.', '<code>grep -v word file</code> shows lines that do <i>not</i> match.'],
      mistake: 'Forgetting that <code>.</code> matches any character. To find a real dot, escape it: <code>192\\.0</code>.',
      folder: 'Each line of <b>access.log</b> ends with a status code. <code>grep -E "(404|500)$"</code> picks out every failed request.',
      hi: ['logs/access.log'], sel: 'logs/access.log', tryCmd: 'grep -E "(404|500)$" ~/website/logs/access.log' },
    { id: 'rank', g: 'Text', t: 'Counting and ranking',
      theory: ['The classic Linux recipe for "who or what is most common?" is a pipeline: pick one column, sort it, count repeats with <code>uniq -c</code>, then sort the counts from high to low.',
        'Each tool does one tiny job and the pipe joins them. The same four steps answer questions about log files, user lists, error messages and more.'],
      keys: ['<code>awk \'{print $1}\'</code> keeps the first column (here the visitor address).', '<code>sort | uniq -c</code> counts repeats; the sort is needed because uniq only merges neighbours.', '<code>sort -rn</code> sorts numbers from high to low; add <code>| head -n 3</code> for a top three.'],
      mistake: 'Using <code>sort</code> without <code>-n</code> on counts. Text order puts 10 before 9.',
      folder: 'In <b>access.log</b> the first column is the visitor. One pipeline ranks the visitors by number of requests.',
      hi: ['logs/access.log'], sel: 'logs/access.log', tryCmd: "awk '{print $1}' ~/website/logs/access.log | sort | uniq -c | sort -rn" },
    { id: 'services', g: 'System', t: 'Services and systemctl',
      theory: ['A <b>service</b> (daemon) is a program that runs in the background without a terminal: a web server, SSH, a database. On most distributions <b>systemd</b> starts and watches them, and <code>systemctl</code> is how you control it.',
        '<b>start</b> and <b>stop</b> act now; <b>enable</b> and <b>disable</b> decide what happens at boot; <b>status</b> shows whether it runs, and <code>journalctl -u name</code> shows its logs.'],
      keys: ['<code>sudo systemctl restart name</code> stops and starts; <code>reload</code> re-reads the config without dropping users.', '<code>systemctl enable --now name</code> starts it now and at every boot.', '<code>systemctl --failed</code> lists services that crashed.'],
      mistake: 'Editing a service\'s config and restarting without testing. A typo can leave the site down. Test first (for nginx: <code>sudo nginx -t</code>) and prefer reload.',
      folder: 'The files in <b>website</b> are what a web server such as nginx hands to visitors. nginx itself is a service, and systemctl is how you check it is running.',
      hi: ['', 'index.html'], sel: '', tryCmd: 'systemctl status nginx' },
    { id: 'web', g: 'System', t: 'The web: ports and HTTP',
      theory: ['Web browsers talk to servers with <b>HTTP</b>. The server listens on a <b>port</b>: 80 for HTTP and 443 for HTTPS. The browser sends a request such as <code>GET /about</code> and the server answers with a <b>status code</b> and the page.',
        'Codes starting with 2 mean success (200 OK), 3 redirects (301, 302), 4 a problem with the request (404 Not Found) and 5 a problem on the server (500). Every request is written to a log.'],
      keys: ['<code>curl -I http://localhost</code> shows only the response headers, including the status.', '<code>ss -tulpn</code> lists which program listens on which port.', '404 means the visitor asked for something missing; 500 means the server itself failed.'],
      mistake: 'Treating every error the same. Many 404s are normal (old links, bots). A rise in 500s means your site or server is broken.',
      folder: 'Visitors get <b>index.html</b> when they open the site. Every request, with its status code, is recorded in <b>logs/access.log</b>.',
      hi: ['index.html', 'logs/access.log'], sel: 'logs/access.log', tryCmd: 'grep -c 200 ~/website/logs/access.log' }
  ];

  /* What each item in the example folder is for, and how you use it */
  var NOTES = {
    '': { what: 'The project folder. A directory holding the whole website.', cmds: ['ls -l ~/website', 'ls -la ~/website', 'tree ~/website', 'cd ~/website && pwd'] },
    'index.html': { what: 'A regular text file: the site\'s home page.', cmds: ['cat ~/website/index.html', 'ls -l ~/website/index.html', 'wc -l ~/website/index.html'] },
    'notes.txt': { what: 'A plain text to-do list.', cmds: ['cat ~/website/notes.txt', 'grep TODO ~/website/notes.txt', 'echo "TODO: add contact page" >> ~/website/notes.txt'] },
    '.env': { what: 'Hidden settings file. Private: only the owner may read or write it.', cmds: ['ls -a ~/website', 'ls -l ~/website/.env', 'cat ~/website/.env', 'chmod 600 ~/website/.env'] },
    'css': { what: 'A directory for stylesheets.', cmds: ['ls -l ~/website/css', 'cd ~/website/css && pwd'] },
    'css/style.css': { what: 'A stylesheet, also plain text.', cmds: ['cat ~/website/css/style.css', 'grep color ~/website/css/style.css'] },
    'scripts': { what: 'A directory of shell scripts.', cmds: ['ls -l ~/website/scripts'] },
    'scripts/deploy.sh': { what: 'An executable script. The x bits let you run it.', cmds: ['ls -l ~/website/scripts/deploy.sh', 'cat ~/website/scripts/deploy.sh', '~/website/scripts/deploy.sh'] },
    'scripts/backup.sh': { what: 'A script without the x bit, so it cannot run yet.', cmds: ['~/website/scripts/backup.sh', 'chmod +x ~/website/scripts/backup.sh', '~/website/scripts/backup.sh', 'ls -l ~/website/scripts'] },
    'logs': { what: 'A directory for logs. Mode 750 keeps other users out.', cmds: ['ls -ld ~/website/logs', 'ls -l ~/website/logs'] },
    'logs/access.log': { what: 'A text log with one line per visit.', cmds: ['cat ~/website/logs/access.log', 'grep 404 ~/website/logs/access.log', 'grep 404 ~/website/logs/access.log | wc -l', "awk '{print $1}' ~/website/logs/access.log | sort | uniq -c | sort -rn"] },
    'latest.log': { what: 'A symbolic link that points to logs/access.log.', cmds: ['ls -l ~/website/latest.log', 'readlink -f ~/website/latest.log', 'tail -n 2 ~/website/latest.log'] }
  };

  var sh = null, ci = 0, sel = '', term = null, host = null;

  /* Guided challenges: each one checks the live shell state or the command history */
  function nodeP(sh2, rel, nf) { return sh2.node(ROOT + '/' + rel, nf); }
  function ran(re) { return sh.hist.some(function (h) { return re.test(h); }); }
  var BASE_NOTES = null;
  function baseNotes() { if (BASE_NOTES === null) BASE_NOTES = (new LV.Shell().node(ROOT + '/notes.txt') || {}).d || ''; return BASE_NOTES; }
  var CHALLENGES = [
    { id: 'exec', t: 'Make backup.sh executable', goal: 'The script scripts/backup.sh cannot run because it has no x permission. Add it.', hint: 'chmod +x adds execute. The file is ~/website/scripts/backup.sh', sol: 'chmod +x ~/website/scripts/backup.sh',
      ok: function () { var n = nodeP(sh, 'scripts/backup.sh'); return !!n && /[1357]/.test(n.m[0]); } },
    { id: 'hidden', t: 'Show the hidden files', goal: 'List the website folder including hidden files such as .env.', hint: 'ls has a flag for "all". It starts with a dash and the letter a.', sol: 'ls -a ~/website',
      ok: function () { return ran(/^ls\s+(?:-\w+\s+)*-\w*[aA]\w*(?:\s|$)/); } },
    { id: 'touch', t: 'Create about.html', goal: 'Create a new empty file called about.html inside the website folder.', hint: 'touch creates an empty file if it does not exist.', sol: 'touch ~/website/about.html',
      ok: function () { var n = nodeP(sh, 'about.html'); return !!n && n.t === 'f'; } },
    { id: 'mkdir', t: 'Create an images folder', goal: 'Make a new folder called images inside the website folder.', hint: 'mkdir makes directories.', sol: 'mkdir ~/website/images',
      ok: function () { var n = nodeP(sh, 'images'); return !!n && n.t === 'd'; } },
    { id: 'private', t: 'Make notes.txt private', goal: 'Only you should be able to read and write notes.txt. Nobody else gets any access.', hint: 'Owner rw- is 6, group and others are 0. So the mode is 600.', sol: 'chmod 600 ~/website/notes.txt',
      ok: function () { var n = nodeP(sh, 'notes.txt'); return !!n && n.m === '600'; } },
    { id: 'backup', t: 'Back up index.html', goal: 'Copy index.html to a new file named index.bak in the same folder.', hint: 'cp source destination', sol: 'cp ~/website/index.html ~/website/index.bak',
      ok: function () { var a = nodeP(sh, 'index.html'), b = nodeP(sh, 'index.bak'); return !!a && !!b && b.t === 'f' && a.d === b.d; } },
    { id: 'append', t: 'Add a line to notes.txt', goal: 'Add a new line to the end of notes.txt and keep the lines that are already there.', hint: 'One > would erase the file. You need the append arrow.', sol: 'echo "TODO: add contact page" >> ~/website/notes.txt',
      ok: function () { var n = nodeP(sh, 'notes.txt'), b = baseNotes(); return !!n && n.d.length > b.length && n.d.indexOf(b) === 0; } },
    { id: 'count', t: 'Count the 404 errors', goal: 'Use a pipe to count how many lines of logs/access.log contain 404.', hint: 'grep finds the lines, wc -l counts them. Join them with |', sol: 'grep 404 ~/website/logs/access.log | wc -l',
      ok: function () { return ran(/grep\s.*404.*\|\s*wc/) || ran(/grep\s+-\w*c\w*\s+404/); } },
    { id: 'link', t: 'Make a shortcut', goal: 'Create a symbolic link named site.css in the website folder that points to css/style.css.', hint: 'ln -s target linkname. Read it as "link to this, called that".', sol: 'ln -s css/style.css ~/website/site.css',
      ok: function () { var n = nodeP(sh, 'site.css', true); return !!n && n.t === 'l'; } },
    { id: 'open', t: 'Let others into logs', goal: 'The logs folder is 750. Change it to 755 so other users can list and enter it.', hint: 'Mode 755 is rwxr-xr-x.', sol: 'chmod 755 ~/website/logs',
      ok: function () { var n = nodeP(sh, 'logs'); return !!n && n.m === '755'; } },
    { id: 'move', t: 'Move notes into docs', goal: 'Create a folder called docs and move notes.txt into it.', hint: 'mkdir first, then mv file folder/', sol: 'mkdir ~/website/docs && mv ~/website/notes.txt ~/website/docs/',
      ok: function () { var n = nodeP(sh, 'docs/notes.txt'); return !!n && !nodeP(sh, 'notes.txt'); } },
    { id: 'exit', t: 'Run deploy and show the exit code', goal: 'Run deploy.sh and then print its exit code on the same line.', hint: 'Run the script, then ; echo $?', sol: '~/website/scripts/deploy.sh; echo "exit code: $?"',
      ok: function () { return ran(/deploy\.sh\s*(?:&&|;)\s*echo.*\$\?/); } }
  ];
  var cx = 0, shown = 0;
  function chalFirst() { for (var i = 0; i < CHALLENGES.length; i++) if (!LV.learn.isDone('x:' + CHALLENGES[i].id)) return i; return 0; }
  function chal() {
    var c = CHALLENGES[cx], d = LV.learn.isDone('x:' + c.id), n = LV.learn.count('x:');
    return '<div class="ex-prog"><span class="mono">Challenge ' + (cx + 1) + ' of ' + CHALLENGES.length + '</span><span class="badge ' + (n === CHALLENGES.length ? 'b-live' : '') + '">' + n + ' done</span><span class="ex-bar"><i style="width:' + (n / CHALLENGES.length * 100) + '%"></i></span></div>' +
      '<h4 class="ex-h4">' + (d ? ic('check') + ' ' : '') + esc(c.t) + '</h4><p>' + esc(c.goal) + '</p>' +
      (d ? '<p class="good"><b>Complete.</b> The folder above shows the change.</p>' : '') +
      '<div class="chal-hint" id="chal-hint" hidden><p class="muted sm">' + esc(c.hint) + '</p><div class="ex-try"><code class="mono">' + esc(c.sol) + '</code><button class="btn sm ex-run" data-c="' + esc(c.sol) + '">' + ic('run') + ' Run</button></div></div>' +
      '<div class="ex-nav"><button class="btn ghost sm" data-chal="prev">' + ic('back') + ' Previous</button>' + (d ? '' : '<button class="btn ghost sm" data-chal="hint">Hint</button>') + '<button class="btn sm" data-chal="next">' + (d ? 'Next challenge' : 'Skip') + ' ' + ic('chev') + '</button></div>';
  }
  function paintChal() { var el = host && LV.$('#ex-chal', host); if (el) el.innerHTML = chal(); }
  function checkChal() {
    var c = CHALLENGES[cx];
    if (LV.learn.isDone('x:' + c.id)) return;
    var pass = false; try { pass = c.ok(); } catch (e) {}
    if (pass) { LV.learn.setDone('x:' + c.id, true); LV.toast('Challenge complete: ' + c.t); paintChal(); }
  }

  function perm(n) { return sh.perm(n); }
  function octal(n) { return n.m; }
  function who(n) {
    if (n.t === 'l') return '<p class="muted sm ex-note">Links always show rwxrwxrwx. What counts are the permissions of the target, logs/access.log.</p>';
    var lab = ['Owner (' + n.o + ')', 'Group (' + n.g + ')', 'Others'], out = [];
    n.m.split('').forEach(function (d, i) {
      d = +d; var c = [];
      if (n.t === 'd') { if (d & 4) c.push('list'); if (d & 2) c.push('add/delete'); if (d & 1) c.push('enter'); }
      else { if (d & 4) c.push('read'); if (d & 2) c.push('write'); if (d & 1) c.push('run'); }
      out.push('<li><b>' + lab[i] + '</b> ' + (c.length ? c.join(', ') : 'no access') + '</li>');
    });
    return '<ul class="ex-who">' + out.join('') + '</ul>';
  }
  function kind(n, name) {
    if (n.t === 'd') return 'Directory';
    if (n.t === 'l') return 'Symbolic link → ' + n.to;
    if (/[1357]/.test(n.m[0])) return 'Executable file';
    return name[0] === '.' ? 'Hidden regular file' : 'Regular file';
  }
  function iconFor(n) { return n.t === 'd' ? 'folder' : n.t === 'l' ? 'chev' : /[1357]/.test(n.m[0]) ? 'run' : 'file'; }
  function nodeAt(rel) { return rel ? sh.node(ROOT + '/' + rel, true) : sh.node(ROOT); }

  /* ---------- Folder tree (always read from the live shell, so commands change it) ---------- */
  function tree() {
    var c = CONCEPTS[ci], hi = {};
    c.hi.forEach(function (h) { hi[h] = 1; });
    var root = sh.node(ROOT), rows = [];
    if (!root) return '<p class="muted sm">The example folder was deleted in the terminal. Press Reset to bring it back.</p>';
    rows.push(row('', 'website', root, 0, hi));
    (function walk(n, base, depth) {
      var names = Object.keys(n.c).sort(function (a, b) {
        var da = n.c[a].t === 'd', db = n.c[b].t === 'd';
        return da !== db ? (da ? -1 : 1) : a.replace(/^\./, '').localeCompare(b.replace(/^\./, ''));
      });
      names.forEach(function (name) {
        var c2 = n.c[name], rel = base ? base + '/' + name : name;
        rows.push(row(rel, name, c2, depth, hi));
        if (c2.t === 'd') walk(c2, rel, depth + 1);
      });
    })(root, '', 1);
    return rows.join('');
  }
  function row(rel, name, n, depth, hi) {
    return '<button class="ex-row' + (rel === sel ? ' on' : '') + (hi[rel] ? ' hi' : '') + (name[0] === '.' ? ' hid' : '') + (n.t === 'd' ? ' dir' : '') + '" data-rel="' + esc(rel) + '" style="--d:' + depth + '">' +
      '<span class="ex-ic">' + ic(iconFor(n)) + '</span><span class="ex-name mono">' + esc(name) + (n.t === 'd' ? '/' : '') + (n.t === 'l' ? ' <small>→ ' + esc(n.to) + '</small>' : '') + '</span>' +
      (name[0] === '.' ? '<span class="ex-tag">hidden</span>' : '') +
      '<span class="ex-perm mono">' + perm(n) + '</span></button>';
  }

  /* ---------- Detail for the selected item ---------- */
  function detail() {
    var n = nodeAt(sel);
    if (!n) { sel = ''; n = nodeAt(''); if (!n) return ''; }
    var name = sel ? sel.split('/').pop() : 'website', note = NOTES[sel] || { what: n.t === 'd' ? 'A directory you created in the terminal.' : 'A file you created in the terminal.', cmds: ['ls -l ~/website/' + sel, n.t === 'd' ? 'ls ~/website/' + sel : 'cat ~/website/' + sel] };
    var abs = ROOT + (sel ? '/' + sel : ''), size = n.t === 'd' ? 4096 : n.t === 'l' ? n.to.length : (n.d || '').length;
    var lsl = perm(n) + ' 1 ' + n.o + ' ' + n.g + ' ' + size + ' ' + n.mt + ' ' + name + (n.t === 'l' ? ' -> ' + n.to : '');
    return '<div class="ex-dh"><span class="ex-ic big">' + ic(iconFor(n)) + '</span><div><b class="mono">' + esc(name) + '</b><small>' + esc(kind(n, name)) + '</small></div></div>' +
      '<p class="ex-what">' + esc(note.what) + '</p>' +
      '<dl class="ex-kv">' +
      '<div><dt>Absolute path</dt><dd class="mono">' + esc(abs) + '</dd></div>' +
      '<div><dt>From ~ (home)</dt><dd class="mono">~/website' + (sel ? '/' + esc(sel) : '') + '</dd></div>' +
      '<div><dt>Relative, inside website</dt><dd class="mono">' + (sel ? esc(sel) : '.') + '</dd></div>' +
      '<div><dt>Permissions</dt><dd><span class="mono">' + perm(n) + '</span> = <b class="mono">' + octal(n) + '</b>' + who(n) + '</dd></div>' +
      '</dl>' +
      '<div class="term-line mono ex-ls">$ ls -l' + (n.t === 'd' ? 'd' : '') + '\n' + esc(lsl) + '</div>' +
      '<h4 class="ex-h4">Use it</h4><div class="ex-cmds">' + note.cmds.map(function (c) {
        return '<div class="ex-cmd"><code class="mono">' + esc(c) + '</code><button class="btn sm ex-run" data-c="' + esc(c) + '">' + ic('run') + ' Run</button><button class="ibtn sm copy-cmd" data-cmd="' + esc(c) + '" aria-label="Copy command">' + ic('copy') + '</button></div>';
      }).join('') + '</div>';
  }

  function concept() {
    var c = CONCEPTS[ci];
    return '<div class="ex-prog"><span class="mono">Idea ' + (ci + 1) + ' of ' + CONCEPTS.length + '</span><span class="badge">' + esc(c.g) + '</span><span class="ex-bar"><i style="width:' + ((ci + 1) / CONCEPTS.length * 100) + '%"></i></span></div>' +
      '<h3 class="ex-ct">' + esc(c.t) + '</h3>' + c.theory.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
      '<div class="ex-keys"><b>Key points</b><ul>' + c.keys.map(function (k) { return '<li>' + k + '</li>'; }).join('') + '</ul></div>' +
      '<div class="ex-mistake"><b>Common mistake</b><p>' + c.mistake + '</p></div>' +
      '<div class="ex-infolder"><b>' + ic('folder') + ' In the example folder</b><p>' + c.folder + '</p></div>' +
      '<div class="ex-try"><code class="mono">' + esc(c.tryCmd) + '</code><button class="btn sm ex-run" data-c="' + esc(c.tryCmd) + '">' + ic('run') + ' Try it</button><button class="ibtn sm copy-cmd" data-cmd="' + esc(c.tryCmd) + '" aria-label="Copy command">' + ic('copy') + '</button></div>' +
      '<div class="ex-nav">' + (ci > 0 ? '<button class="btn ghost sm" data-ci="' + (ci - 1) + '">' + ic('back') + ' Previous idea</button>' : '<span></span>') +
      (ci < CONCEPTS.length - 1 ? '<button class="btn sm" data-ci="' + (ci + 1) + '">Next idea ' + ic('chev') + '</button>' : '<button class="btn sm" data-go="t-what-is-linux">Start the full course ' + ic('chev') + '</button>') + '</div>';
  }

  function selectHtml() {
    var out = '', g = null;
    CONCEPTS.forEach(function (c, i) {
      if (c.g !== g) { if (g !== null) out += '</optgroup>'; out += '<optgroup label="' + esc(c.g) + '">'; g = c.g; }
      out += '<option value="' + i + '">' + (i + 1) + '. ' + esc(c.t) + '</option>';
    });
    return out + '</optgroup>';
  }
  function syncSelect() {
    var sl = host && LV.$('#ex-sel', host); if (!sl) return;
    var n = 0;
    LV.$$('option', sl).forEach(function (o, i) {
      var d = LV.learn.isDone('c:' + CONCEPTS[i].id); if (d) n++;
      o.textContent = (d ? '\u2713 ' : '') + (i + 1) + '. ' + CONCEPTS[i].t;
    });
    sl.value = String(ci);
    var dn = LV.$('#ex-done', host); if (dn) dn.textContent = n + ' of ' + CONCEPTS.length + ' done';
  }
  function paint(part) {
    if (!host || !host.isConnected) return;
    if (!part || part === 'concept') {
      LV.$('#ex-concept', host).innerHTML = concept();
      syncSelect();
    }
    LV.$('#ex-tree', host).innerHTML = tree();
    LV.$('#ex-detail', host).innerHTML = detail();
    if (!part) { cx = chalFirst(); paintChal(); }
  }
  function mountTerm() {
    term = LV.TermUI(LV.$('#ex-term', host), { shell: sh, inId: 'ex-in', welcome: 'Practice on the example folder. Try: ls -l ~/website   (Run buttons above type commands here)' });
  }
  /* any command run in this terminal (typed or from a button) refreshes the folder view */
  window.addEventListener('lv:run', function (e) { if (e.detail && e.detail.shell === sh) setTimeout(function () { paint('folder'); checkChal(); }, 30); });
  function runCmd(c) {
    if (!term) return;
    term.run(c, true);
    var t = LV.$('#ex-term', host);
    var r = t.getBoundingClientRect();
    if (r.top > window.innerHeight - 120 || r.bottom < 0) t.scrollIntoView({ block: 'center', behavior: LV.reduced() ? 'auto' : 'smooth' });
  }

  LV.explore = {
    concepts: CONCEPTS,
    challenges: CHALLENGES,
    ctx: { node: nodeP, ran: ran, shell: function () { return sh; }, use: function (x) { sh = x; }, baseNotes: baseNotes },
    open: function (id) {
      var i = CONCEPTS.map(function (c) { return c.id; }).indexOf(id);
      if (i < 0 || !host || !host.isConnected) return;
      ci = i; sel = CONCEPTS[i].sel; paint();
      host.scrollIntoView({ block: 'start', behavior: LV.reduced() ? 'auto' : 'smooth' });
    },
    html: function () {
      return '<section class="block ex" id="explore">' +
        '<div class="block-h"><h2>Theory first</h2></div>' +
        '<p class="muted ex-intro">' + CONCEPTS.length + ' core ideas in ' + new Set(CONCEPTS.map(function (c) { return c.g; })).size + ' groups. Learn each idea, see it in a real example folder, then use it with commands. The folder updates as you run them.</p>' +
        '<div class="ex-step"><span class="ex-sn mono">1</span><h3>Learn the idea</h3></div>' +
        '<div class="ex-chips" id="ex-chips"><label class="ex-pick"><span class="sr-only">Choose an idea</span><select id="ex-sel" class="ex-select" aria-label="Choose an idea">' + selectHtml() + '</select></label><span class="muted sm mono" id="ex-done"></span></div>' +
        '<div class="ex-card ex-concept" id="ex-concept"></div>' +
        '<div class="ex-step"><span class="ex-sn mono">2</span><h3>See it in the example folder</h3><span class="muted sm ex-hint">~/website · tap any item</span></div>' +
        '<div class="ex-grid"><div class="ex-card ex-tree" id="ex-tree"></div><div class="ex-card ex-detail" id="ex-detail"></div></div>' +
        '<div class="ex-step"><span class="ex-sn mono">3</span><h3>Use it</h3><button class="btn ghost sm ex-reset" id="ex-reset">' + ic('restart') + ' Reset folder</button></div>' +
        '<div id="ex-term"></div>' +
        '<div class="ex-step"><span class="ex-sn mono">4</span><h3>Challenge yourself</h3></div>' +
        '<div class="ex-card ex-chal" id="ex-chal"></div>' +
        '</section>';
    },
    mount: function (el) {
      host = el;
      if (!sh) sh = new LV.Shell();
      mountTerm();
      paint();
      host.addEventListener('change', function (e) {
        if (e.target.id !== 'ex-sel') return;
        ci = +e.target.value; sel = CONCEPTS[ci].sel; paint();
      });
      host.addEventListener('click', function (e) {
        var b = e.target.closest('[data-ci]');
        if (b) {
          if (b.closest('.ex-nav') && ci < CONCEPTS.length - 1 && +b.dataset.ci > ci) LV.learn.setDone('c:' + CONCEPTS[ci].id, true);
          ci = +b.dataset.ci; sel = CONCEPTS[ci].sel; paint();
          if (b.closest('.ex-nav')) LV.$('#ex-chips', host).scrollIntoView({ block: 'center', behavior: LV.reduced() ? 'auto' : 'smooth' });
          return;
        }
        var r = e.target.closest('.ex-row');
        if (r) { sel = r.dataset.rel; paint('folder'); if (window.innerWidth < 720) LV.$('#ex-detail', host).scrollIntoView({ block: 'nearest', behavior: LV.reduced() ? 'auto' : 'smooth' }); return; }
        var ch = e.target.closest('[data-chal]');
        if (ch) {
          var a = ch.dataset.chal;
          if (a === 'hint') { var hb = LV.$('#chal-hint', host); hb.hidden = !hb.hidden; ch.textContent = hb.hidden ? 'Hint' : 'Hide hint'; return; }
          cx = (cx + (a === 'next' ? 1 : -1) + CHALLENGES.length) % CHALLENGES.length; paintChal(); return;
        }
        var x = e.target.closest('.ex-run');
        if (x) {
          if (x.closest('.ex-concept') && x.dataset.c === CONCEPTS[ci].tryCmd) { LV.learn.setDone('c:' + CONCEPTS[ci].id, true); syncSelect(); }
          runCmd(x.dataset.c); return;
        }
        if (e.target.closest('#ex-reset')) { sh = new LV.Shell(); sel = CONCEPTS[ci].sel; mountTerm(); paint(); LV.toast('Example folder reset'); }
      });
    }
  };
})();
