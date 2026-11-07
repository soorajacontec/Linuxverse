/* Linuxverse Home step 4: 20 more challenges. Each one checks the live state of the practice shell or its command history. */
(function () {
  'use strict';
  if (!LV.explore || !LV.explore.ctx) return;
  var X = LV.explore.ctx, C = LV.explore.challenges;
  function sh() { return X.shell(); }
  function node(rel, nf) { return X.node(sh(), rel, nf); }
  function ran(re) { return X.ran(re); }
  function lines(s) { return (s || '').split('\n').filter(Boolean); }
  function add(c) { C.push(c); }

  add({ id: 'nested', t: 'Build a nested folder', goal: 'Create the chain assets/img/icons inside the website folder with one command.', hint: 'mkdir has an option that creates missing parent folders: -p.', sol: 'mkdir -p ~/website/assets/img/icons',
    ok: function () { var n = node('assets/img/icons'); return !!n && n.t === 'd'; } });
  add({ id: 'copydir', t: 'Back up the css folder', goal: 'Copy the whole css folder to a new folder called css-backup in the website folder.', hint: 'Copying a folder needs the recursive option, -r.', sol: 'cp -r ~/website/css ~/website/css-backup',
    ok: function () { var a = node('css/style.css'), b = node('css-backup/style.css'); return !!a && !!b && a.d === b.d; } });
  add({ id: 'rename', t: 'Rename notes.txt', goal: 'Rename notes.txt to todo.txt. The content must stay the same.', hint: 'mv with a new name in the same folder renames.', sol: 'mv ~/website/notes.txt ~/website/todo.txt',
    ok: function () { var n = node('todo.txt'); return !!n && !node('notes.txt') && n.d === X.baseNotes(); } });
  add({ id: 'junk', t: 'Create and delete a file', goal: 'Create a file called junk.txt in the website folder, then delete it again.', hint: 'touch creates, rm deletes. Both steps must appear in your history.', sol: 'touch ~/website/junk.txt && rm ~/website/junk.txt',
    ok: function () { return ran(/touch\s.*junk\.txt/) && ran(/rm\s.*junk\.txt/) && !node('junk.txt'); } });
  add({ id: 'gitignore', t: 'Ignore the secrets file', goal: 'Create a hidden file .gitignore in the website folder that contains the line .env', hint: 'Use echo with > to write the line into a new file whose name starts with a dot.', sol: 'echo ".env" > ~/website/.gitignore',
    ok: function () { var n = node('.gitignore'); return !!n && lines(n.d).indexOf('.env') >= 0; } });
  add({ id: 'group', t: 'Let the group read index.html', goal: 'Set index.html to owner read and write, group read only, others nothing.', hint: 'rw- is 6, r-- is 4, --- is 0. So the number is 640.', sol: 'chmod 640 ~/website/index.html',
    ok: function () { var n = node('index.html'); return !!n && n.m === '640'; } });
  add({ id: 'ownerx', t: 'Owner-only script', goal: 'Make deploy.sh readable, writable and executable by you only. Nobody else gets any access.', hint: 'rwx is 7 for you, 0 for group and others.', sol: 'chmod 700 ~/website/scripts/deploy.sh',
    ok: function () { var n = node('scripts/deploy.sh'); return !!n && n.m === '700'; } });
  add({ id: 'umask', t: 'Private by default', goal: 'Change your umask so new files are private, then create secret.txt in the website folder. It must end up with mode 600.', hint: 'umask 077 removes all access for group and others from new files.', sol: 'umask 077 && touch ~/website/secret.txt',
    ok: function () { var n = node('secret.txt'); return !!n && n.m === '600'; } });
  add({ id: 'dirlink', t: 'Link to a folder', goal: 'Create a symbolic link named public in the website folder that points to the css folder.', hint: 'ln -s target linkname works for folders too.', sol: 'ln -s css ~/website/public',
    ok: function () { var n = node('public', true); return !!n && n.t === 'l' && /css/.test(n.to); } });
  add({ id: 'todocount', t: 'Count the to-dos', goal: 'Count how many lines of notes.txt contain the word TODO. Show the number.', hint: 'grep -c counts matching lines.', sol: 'grep -c TODO ~/website/notes.txt',
    ok: function () { return ran(/grep\s+(?:-\w*c\w*\s+)\S*\s*TODO|grep\s+TODO.*\|\s*wc\s+-l|grep\s+(?:-\w*c\w*\s+)TODO/) || ran(/grep\s.*TODO.*-c/); } });
  add({ id: 'sortsave', t: 'Save a sorted list', goal: 'Write the lines of notes.txt in alphabetical order into a new file sorted.txt.', hint: 'sort prints sorted lines; > saves them.', sol: 'sort ~/website/notes.txt > ~/website/sorted.txt',
    ok: function () { var n = node('sorted.txt'), b = X.baseNotes(); if (!n || !b) return false; var want = lines(b).sort().join('\n'); return lines(n.d).join('\n') === want; } });
  add({ id: 'ranking', t: 'Rank the visitors', goal: 'Show how many requests each visitor address made, using awk, sort and uniq -c together.', hint: 'awk picks column 1, sort groups equal lines, uniq -c counts them.', sol: "awk '{print $1}' ~/website/logs/access.log | sort | uniq -c",
    ok: function () { return ran(/awk\s.*\$1.*\|\s*sort\s*\|\s*uniq\s+-c/); } });
  add({ id: 'errors', t: 'Collect the failed requests', goal: 'Save every 404 line of access.log into a new file errors.log in the website folder.', hint: 'grep finds the lines and > saves them.', sol: 'grep 404 ~/website/logs/access.log > ~/website/errors.log',
    ok: function () { var n = node('errors.log'); if (!n) return false; var l = lines(n.d); return l.length > 0 && l.every(function (x) { return /404/.test(x); }); } });
  add({ id: 'readme', t: 'Write a README', goal: 'Create README.md in the website folder with a short one-line description of the project.', hint: 'echo "text" > file writes one line into a new file.', sol: 'echo "My first Linux website" > ~/website/README.md',
    ok: function () { var n = node('README.md'); return !!n && n.d.trim().length > 3; } });
  add({ id: 'varcount', t: 'Store a count in a variable', goal: 'Save the number of lines in access.log into a variable called n, then print it.', hint: 'n=$(wc -l < file) stores the output of a command.', sol: 'n=$(wc -l < ~/website/logs/access.log); echo "$n"',
    ok: function () { var v = sh().vars.n; return /^\s*\d+\s*$/.test(v || '') && ran(/echo\s.*\$\{?n\}?/); } });
  add({ id: 'loopfiles', t: 'Create three files in a loop', goal: 'Use a loop to create part1.txt, part2.txt and part3.txt in the website folder.', hint: 'for i in 1 2 3; do touch ~/website/part$i.txt; done', sol: 'for i in 1 2 3; do touch ~/website/part$i.txt; done',
    ok: function () { return [1, 2, 3].every(function (i) { return !!node('part' + i + '.txt'); }); } });
  add({ id: 'braces', t: 'Three folders at once', goal: 'Create the folders src, tests and build inside the website folder with a single mkdir command.', hint: 'Brace expansion: mkdir ~/website/{src,tests,build}', sol: 'mkdir ~/website/{src,tests,build}',
    ok: function () { return ['src', 'tests', 'build'].every(function (d) { var n = node(d); return !!n && n.t === 'd'; }); } });
  add({ id: 'exportvar', t: 'Export a variable', goal: 'Set an environment variable SITE to the value linuxverse so that programs you start can see it.', hint: 'export NAME=value', sol: 'export SITE=linuxverse',
    ok: function () { return sh().env.SITE === 'linuxverse'; } });
  add({ id: 'findsh', t: 'List the scripts', goal: 'Use find to write the paths of all .sh files in the website folder into scripts.txt.', hint: 'find folder -name "*.sh" > file', sol: 'find ~/website -name "*.sh" > ~/website/scripts.txt',
    ok: function () { var n = node('scripts.txt'); return !!n && /deploy\.sh/.test(n.d) && /backup\.sh/.test(n.d); } });
  add({ id: 'cleartree', t: 'Create and remove a tree', goal: 'Create the folder trash/a/b in the website folder, then remove the whole trash folder in one command.', hint: 'mkdir -p builds the chain; rm -r removes a folder and its contents.', sol: 'mkdir -p ~/website/trash/a/b && rm -r ~/website/trash',
    ok: function () { return ran(/mkdir\s.*trash/) && ran(/rm\s+-\w*r\w*\s.*trash/) && !node('trash'); } });
  add({ id: 'whoami', t: 'Write your user name to a file', goal: 'Save the output of whoami into a file me.txt in the website folder.', hint: 'whoami > file', sol: 'whoami > ~/website/me.txt',
    ok: function () { var n = node('me.txt'); return !!n && n.d.trim() === sh().user; } });
  add({ id: 'addtwo', t: 'Add two more to-dos', goal: 'Add at least two new lines to notes.txt without removing the existing ones.', hint: 'Use >> twice, or echo with a newline.', sol: 'echo "TODO: write tests" >> ~/website/notes.txt && echo "TODO: add footer" >> ~/website/notes.txt',
    ok: function () { var n = node('notes.txt'), b = X.baseNotes(); return !!n && n.d.indexOf(b) === 0 && lines(n.d).length >= lines(b).length + 2; } });
  add({ id: 'chainls', t: 'Move in and look in one line', goal: 'In a single command line, go into the logs folder and then list its contents, only listing if the move worked.', hint: 'Use && between cd and ls.', sol: 'cd ~/website/logs && ls',
    ok: function () { return ran(/cd\s+\S*logs\/?\s*&&\s*ls/); } });
  /* ---- 15 more ---- */
  function logLines() { return lines((new LV.Shell().node('/home/ssk/website/logs/access.log') || {}).d); }
  function baseSh() { return new LV.Shell(); }
  add({ id: 'toplines', t: 'Keep the first two visits', goal: 'Save only the first two lines of access.log into a new file top.log in the website folder.', hint: 'head -n 2 prints the first two lines; > saves them.', sol: 'head -n 2 ~/website/logs/access.log > ~/website/top.log',
    ok: function () { var n = node('top.log'), l = logLines(); return !!n && lines(n.d).join('\n') === l.slice(0, 2).join('\n'); } });
  add({ id: 'upper', t: 'Shout the to-do list', goal: 'Write the contents of notes.txt in capital letters into a new file loud.txt.', hint: "tr 'a-z' 'A-Z' turns lower case into upper case.", sol: "tr 'a-z' 'A-Z' < ~/website/notes.txt > ~/website/loud.txt",
    ok: function () { var n = node('loud.txt'), b = X.baseNotes(); return !!n && !!b && n.d.trim() === b.toUpperCase().trim(); } });
  add({ id: 'visitcount', t: 'Save the visit count', goal: 'Write just the number of lines of access.log into a file count.txt in the website folder.', hint: 'wc -l < file prints only the number.', sol: 'wc -l < ~/website/logs/access.log > ~/website/count.txt',
    ok: function () { var n = node('count.txt'); return !!n && n.d.trim() === String(logLines().length); } });
  add({ id: 'chmodr', t: 'Lock down a whole folder', goal: 'Remove all group and other permissions from the css folder and everything inside it.', hint: 'chmod -R go-rwx folder works recursively on both.', sol: 'chmod -R go-rwx ~/website/css',
    ok: function () { var a = node('css'), b = node('css/style.css'); return !!a && !!b && /^.00$/.test(a.m) && /^.00$/.test(b.m); } });
  add({ id: 'uniqnames', t: 'Unique names, sorted', goal: 'Take the names in your home folder file names.txt, remove duplicates, sort them and save the result as names-unique.txt in the website folder.', hint: 'sort -u does both in one step. Or sort then uniq.', sol: 'sort -u ~/names.txt > ~/website/names-unique.txt',
    ok: function () { var n = node('names-unique.txt'); return !!n && lines(n.d).join(',') === 'anil,bob,meera,zara'; } });
  add({ id: 'grepv', t: 'Only the open to-dos', goal: 'Save the lines of notes.txt that do NOT contain the word Done into open.txt in the website folder.', hint: 'grep -v inverts the match.', sol: 'grep -v Done ~/website/notes.txt > ~/website/open.txt',
    ok: function () { var n = node('open.txt'), b = X.baseNotes(); if (!n || !b) return false; var want = lines(b).filter(function (l) { return !/Done/.test(l); }); return want.length > 0 && lines(n.d).join('\n') === want.join('\n'); } });
  add({ id: 'deepcd', t: 'Create a path and stand in it', goal: 'Create the folder work/deep inside the website folder and finish with your terminal inside it.', hint: 'mkdir -p, then cd, joined with &&.', sol: 'mkdir -p ~/website/work/deep && cd ~/website/work/deep',
    ok: function () { return sh().cwd === '/home/ssk/website/work/deep'; } });
  add({ id: 'printflist', t: 'Write three lines with printf', goal: 'Create list.txt in the website folder containing exactly three lines: one, two and three.', hint: 'printf "one\\ntwo\\nthree\\n" > file', sol: 'printf "one\\ntwo\\nthree\\n" > ~/website/list.txt',
    ok: function () { var n = node('list.txt'); return !!n && lines(n.d).join(',') === 'one,two,three'; } });
  add({ id: 'findcss', t: 'List the stylesheets', goal: 'Use find to save the paths of all .css files below the website folder into css-list.txt.', hint: 'find folder -name "*.css" > file', sol: 'find ~/website -name "*.css" > ~/website/css-list.txt',
    ok: function () { var n = node('css-list.txt'); return !!n && /style\.css/.test(n.d); } });
  add({ id: 'teecopy', t: 'Show and save in one go', goal: 'Run grep 404 on access.log and use tee so the lines are both shown and saved to found.txt in the website folder.', hint: 'grep 404 file | tee found.txt', sol: 'grep 404 ~/website/logs/access.log | tee ~/website/found.txt',
    ok: function () { var n = node('found.txt'); return !!n && lines(n.d).length > 0 && ran(/\|\s*tee\s/); } });
  add({ id: 'failcode', t: 'Read a failing exit code', goal: 'Run ls on a folder that does not exist (call it nothing) and print the exit code on the same line.', hint: 'ls ~/website/nothing; echo "code: $?"', sol: 'ls ~/website/nothing; echo "code: $?"',
    ok: function () { return ran(/(?:ls|cat)\s+\S*(?:nothing|missing|nofile)\S*\s*;\s*echo[^;]*\$\?/); } });
  add({ id: 'copyglob', t: 'Copy all scripts at once', goal: 'Create a folder bin in the website folder and copy every .sh file from scripts into it with one cp command.', hint: 'cp ~/website/scripts/*.sh ~/website/bin/', sol: 'mkdir ~/website/bin && cp ~/website/scripts/*.sh ~/website/bin/',
    ok: function () { return !!node('bin/deploy.sh') && !!node('bin/backup.sh'); } });
  add({ id: 'rmglob', t: 'Clean up with a wildcard', goal: 'Create a.tmp, b.tmp and c.tmp in the website folder, then delete all of them with a single rm using a wildcard.', hint: 'touch a.tmp b.tmp c.tmp, then rm with *.tmp', sol: 'cd ~/website && touch a.tmp b.tmp c.tmp && rm *.tmp',
    ok: function () { return ran(/touch\s.*a\.tmp/) && ran(/rm\s+.*\*\.tmp/) && !node('a.tmp') && !node('b.tmp') && !node('c.tmp'); } });
  add({ id: 'stderr', t: 'Catch an error message', goal: 'Run ls on a missing folder and send only the error message into err.txt in the website folder.', hint: '2> redirects the error stream.', sol: 'ls ~/website/missing 2> ~/website/err.txt',
    ok: function () { var n = node('err.txt'); return !!n && /No such file/i.test(n.d); } });
  add({ id: 'datefile', t: 'Name a file after today', goal: 'Create an empty file in the website folder named log- followed by today\'s date as year-month-day, ending in .txt.', hint: 'touch ~/website/log-$(date +%F).txt', sol: 'touch ~/website/log-$(date +%F).txt',
    ok: function () { var d = node(''); return !!d && Object.keys(d.c).some(function (k) { return /^log-\d{4}-\d{2}-\d{2}\.txt$/.test(k); }); } });
})();
