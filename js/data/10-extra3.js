/* More topics: unit files, sysctl, swap, TLS certificates, here-docs, arrays, git branches, git undo. */

LV.add('systemd', [
  {
    id: 'unitfiles', title: 'Writing a systemd service', sum: 'Turn your own program into a service that starts at boot.',
    explain: [
      'A <b>unit file</b> tells systemd how to run a program. Put your own in <code>/etc/systemd/system/name.service</code>. It has three parts: <code>[Unit]</code> (description and ordering), <code>[Service]</code> (what to run) and <code>[Install]</code> (when to start it).',
      'Key settings: <code>ExecStart</code> is the command (use a full path), <code>User</code> is who runs it, <code>Restart=on-failure</code> restarts it after a crash, and <code>Environment=</code> or <code>EnvironmentFile=</code> pass settings.',
      'After creating or editing a unit, run <code>sudo systemctl daemon-reload</code>, then <code>enable --now</code> to start it now and at every boot.'
    ],
    code: '# /etc/systemd/system/mysite.service\n[Unit]\nDescription=My website\nAfter=network.target\n\n[Service]\nUser=ssk\nWorkingDirectory=/home/ssk/website\nExecStart=/usr/bin/python3 -m http.server 8500\nRestart=on-failure\n\n[Install]\nWantedBy=multi-user.target',
    terms: [['ExecStart', 'The command to run (full path)'], ['Restart=', 'When systemd restarts it: no, on-failure, always'], ['WantedBy=', 'Which target starts it at boot'], ['daemon-reload', 'Make systemd re-read unit files'], ['systemd-analyze verify', 'Check a unit file for mistakes']],
    cmds: [
      ['sudo nano /etc/systemd/system/mysite.service', 'Create the unit file'],
      ['systemd-analyze verify /etc/systemd/system/mysite.service', 'Check the file for errors'],
      ['sudo systemctl daemon-reload', 'Tell systemd about the new file'],
      ['sudo systemctl enable --now mysite', 'Start now and at boot'],
      ['systemctl status mysite', 'Is it running?'],
      ['journalctl -u mysite -f', 'Follow its logs live'],
      ['sudo systemctl edit mysite', 'Add overrides without touching the original file'],
      ['systemd-analyze blame | head -n 5', 'Which services slow the boot']
    ],
    flags: [['enable --now', 'Enable at boot and start immediately', 'systemctl'], ['-u name', 'Logs for one unit', 'journalctl'], ['-f', 'Follow new lines', 'journalctl'], ['verify', 'Lint a unit file', 'systemd-analyze']],
    tips: ['Use full paths in <code>ExecStart</code>. systemd does not use your shell\'s PATH or aliases.'],
    warn: ['Forgetting <code>daemon-reload</code> after an edit means systemd keeps running the old definition.']
  },
  {
    id: 'sysctl', title: 'Kernel tuning: sysctl', sum: 'Read and change kernel settings at runtime.',
    explain: [
      'The kernel exposes hundreds of settings under <code>/proc/sys</code>. <code>sysctl</code> reads and writes them using dotted names, e.g. <code>net.ipv4.ip_forward</code> is the file <code>/proc/sys/net/ipv4/ip_forward</code>.',
      'A change made with <code>sysctl -w</code> is lost at reboot. To keep it, put the line in a file under <code>/etc/sysctl.d/</code> and apply with <code>sysctl --system</code>.',
      'Common settings: <code>vm.swappiness</code> (how eagerly to use swap), <code>net.ipv4.ip_forward</code> (act as a router), <code>fs.inotify.max_user_watches</code> (file watchers for editors).'
    ],
    code: '# /etc/sysctl.d/99-custom.conf\nvm.swappiness = 10\nnet.ipv4.ip_forward = 1\nfs.inotify.max_user_watches = 524288',
    terms: [['/proc/sys', 'Virtual files that mirror kernel settings'], ['sysctl -w', 'Set a value until reboot'], ['/etc/sysctl.d/', 'Place for permanent settings'], ['swappiness', '0-100: how readily the kernel swaps']],
    cmds: [
      ['sysctl vm.swappiness', 'Read one value', 'vm.swappiness = 60'],
      ['cat /proc/sys/vm/swappiness', 'The same value as a file', '60'],
      ['sysctl -a | grep ip_forward', 'Search all settings'],
      ['sudo sysctl -w vm.swappiness=10', 'Change until reboot'],
      ['echo "vm.swappiness = 10" | sudo tee /etc/sysctl.d/99-swap.conf', 'Make it permanent'],
      ['sudo sysctl --system', 'Apply every config file now']
    ],
    flags: [['-w', 'Write a value', 'sysctl'], ['-a', 'Show all values', 'sysctl'], ['--system', 'Load all config files', 'sysctl'], ['-p file', 'Load one file', 'sysctl']],
    tips: ['Change one setting at a time and measure, so you know what helped.'],
    warn: ['Copying tuning lists from the internet can hurt performance or security. Understand each setting before you apply it.']
  }
]);

LV.add('disks', [
  {
    id: 'swap', title: 'Swap & memory pressure', sum: 'What swap does, how to add it and what the OOM killer is.',
    explain: [
      '<b>Swap</b> is disk space the kernel uses when RAM is full. It is much slower than RAM, but it prevents sudden crashes and lets idle memory be pushed out. Check it with <code>free -h</code> or <code>swapon --show</code>.',
      'If memory runs out completely, the kernel\'s <b>OOM killer</b> picks a process and ends it. You will see it in <code>dmesg</code> or the journal as "Out of memory: Killed process".',
      'To add swap quickly, create a file, set it to private (600), format it with <code>mkswap</code>, enable it with <code>swapon</code> and add a line to <code>/etc/fstab</code> to keep it after reboot.'
    ],
    terms: [['swap', 'Disk space used as overflow memory'], ['mkswap / swapon', 'Format / enable swap'], ['OOM killer', 'Kernel ends a process when memory is exhausted'], ['swappiness', 'How eagerly the kernel uses swap'], ['zram', 'Compressed swap in RAM, common on desktops']],
    cmds: [
      ['free -h', 'RAM and swap at a glance', '              total        used        free      shared  buff/cache   available\nMem:           15Gi       4.1Gi       7.9Gi       312Mi       3.4Gi        11Gi\nSwap:         4.0Gi          0B       4.0Gi'],
      ['swapon --show', 'Active swap areas'],
      ['sudo fallocate -l 2G /swapfile', 'Create a 2 GB file'],
      ['sudo chmod 600 /swapfile', 'Only root may read it'],
      ['sudo mkswap /swapfile', 'Format it as swap'],
      ['sudo swapon /swapfile', 'Turn it on'],
      ['echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab', 'Keep it after reboot'],
      ['journalctl -k | grep -i "out of memory"', 'Did the OOM killer run?'],
      ['ps aux --sort=-%mem | head -n 5', 'Top memory users']
    ],
    flags: [['--show', 'List swap areas', 'swapon'], ['-a', 'Enable all in fstab', 'swapon'], ['-l size', 'File size', 'fallocate'], ['--sort=-%mem', 'Order by memory use', 'ps']],
    tips: ['A busy system that constantly uses swap is too small for its job. More RAM or fewer programs fixes it; more swap only delays it.'],
    warn: ['Do not forget <code>chmod 600</code>. A world-readable swap file can leak passwords from memory.']
  }
]);

LV.add('sec', [
  {
    id: 'tls', title: 'TLS certificates & HTTPS', sum: 'openssl, Let\'s Encrypt and checking a certificate.',
    explain: [
      'HTTPS wraps HTTP in <b>TLS</b>. The server proves who it is with a <b>certificate</b> signed by a trusted authority (CA). Browsers check the name, the dates and the signing chain.',
      '<b>Let\'s Encrypt</b> issues free certificates. <code>certbot</code> proves you control the domain, fetches the certificate, edits nginx or Apache for you and renews automatically before the 90 days end.',
      '<code>openssl</code> is the toolbox: look inside a certificate, test a live server with <code>s_client</code>, or create a private key and a self-signed certificate for local testing.'
    ],
    terms: [['certificate', 'Public file that binds a name to a key'], ['private key', 'Secret that must never leave the server'], ['CA', 'Certificate authority that signs certificates'], ['self-signed', 'Signed by yourself; browsers warn about it'], ['SAN', 'Subject Alternative Names: the domains it covers']],
    cmds: [
      ['sudo certbot --nginx -d example.com -d www.example.com', 'Get a certificate and configure nginx'],
      ['sudo certbot renew --dry-run', 'Test automatic renewal'],
      ['openssl s_client -connect example.com:443 -servername example.com < /dev/null | openssl x509 -noout -dates', 'Check a live server\'s dates', 'notBefore=Oct  1 00:00:00 2026 GMT\nnotAfter=Dec 30 23:59:59 2026 GMT'],
      ['openssl x509 -in cert.pem -noout -subject -issuer -dates', 'Read a certificate file'],
      ['openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"', 'Make a self-signed certificate for testing'],
      ['curl -vI https://example.com 2>&1 | grep -i "expire"', 'Quick expiry check with curl'],
      ['chmod 600 key.pem', 'Protect the private key']
    ],
    flags: [['-noout', 'Do not print the encoded certificate', 'openssl x509'], ['-dates', 'Show validity period', 'openssl x509'], ['-servername', 'Send the host name (SNI)', 'openssl s_client'], ['--dry-run', 'Test without issuing', 'certbot']],
    tips: ['Set a reminder or monitor to alert when a certificate has under 14 days left, even with auto-renew.'],
    warn: ['Never share or commit <code>key.pem</code>. Anyone with the private key can impersonate your site.']
  }
]);

LV.add('script', [
  {
    id: 'heredoc', title: 'Here-documents & substitution', sum: 'Feed multi-line text to commands and treat output as a file.',
    explain: [
      'A <b>here-document</b> passes several lines to a command without a temporary file: <code>cat &lt;&lt;EOF ... EOF</code>. Quote the marker (<code>&lt;&lt;\'EOF\'</code>) to stop variables from being expanded inside. A <b>here-string</b> <code>&lt;&lt;&lt; "text"</code> feeds one string.',
      '<b>Command substitution</b> <code>$(cmd)</code> puts a command\'s output into another command. <b>Process substitution</b> <code>&lt;(cmd)</code> makes the output look like a file, so you can <code>diff &lt;(sort a) &lt;(sort b)</code> without temporary files.',
      'Together they let scripts create config files, send mail bodies and compare outputs cleanly.'
    ],
    code: '#!/usr/bin/env bash\nname="Linux"\ncat > hello.txt <<EOF\nHello, $name\nToday is $(date +%F)\nEOF\n\ndiff <(sort a.txt) <(sort b.txt)',
    terms: [['<<EOF', 'Here-document: read lines until EOF'], ['<<\'EOF\'', 'Same, without expanding variables'], ['<<<', 'Here-string: a single string as input'], ['$(cmd)', 'Insert command output'], ['<(cmd)', 'Treat command output as a file']],
    cmds: [
      ['cat <<EOF\nHello $USER\nEOF', 'Print lines with variables expanded'],
      ['cat <<\'EOF\' > note.txt\nCost: $5\nEOF', 'Write text where $ stays literal'],
      ['wc -w <<< "one two three"', 'Count words of a string', '3'],
      ['today=$(date +%F); echo "Report $today"', 'Use command output in a string'],
      ['diff <(ls dir1) <(ls dir2)', 'Compare two listings without temp files'],
      ['sudo tee /etc/motd <<EOF\nWelcome\nEOF', 'Write a root-owned file from a script'],
      ['while read -r line; do echo "> $line"; done < notes.txt', 'Read a file line by line']
    ],
    flags: [['<<-', 'Here-doc that ignores leading tabs', 'bash'], ['read -r', 'Read a line without mangling backslashes', 'bash']],
    tips: ['Use <code>&lt;&lt;\'EOF\'</code> when the text contains $ or backticks you want kept as they are.'],
    warn: ['With an unquoted marker, any <code>$</code> or backtick in the text runs or expands. Quote the marker when pasting code.']
  },
  {
    id: 'arrays', title: 'Arrays & loops over data', sum: 'Lists, associative arrays and safe iteration in bash.',
    explain: [
      'A bash <b>array</b> holds many values: <code>files=(a.txt "b c.txt" d.txt)</code>. Always expand it with quotes and <code>@</code>: <code>"${files[@]}"</code> keeps each element, including those with spaces, as one word.',
      '<code>${#files[@]}</code> is the count, <code>${files[0]}</code> the first item and <code>files+=(new)</code> appends. An <b>associative array</b> (<code>declare -A</code>) maps keys to values, like a small dictionary.',
      'To loop over command output safely, use <code>mapfile -t lines &lt; &lt;(cmd)</code> or <code>while read -r</code>, never <code>for x in $(ls)</code>, which splits on spaces.'
    ],
    code: '#!/usr/bin/env bash\nfiles=(index.html "my notes.txt" style.css)\nfor f in "${files[@]}"; do\n  echo "file: $f"\ndone\necho "count: ${#files[@]}"\n\ndeclare -A port=([http]=80 [https]=443)\nfor k in "${!port[@]}"; do echo "$k -> ${port[$k]}"; done',
    terms: [['"${a[@]}"', 'All elements, each kept whole'], ['${#a[@]}', 'Number of elements'], ['a+=(x)', 'Append an element'], ['declare -A', 'Associative array (key to value)'], ['mapfile -t', 'Read lines into an array']],
    cmds: [
      ['files=(a.txt "b c.txt"); echo "${#files[@]}"', 'Make an array and count it', '2'],
      ['files+=(d.txt); echo "${files[@]}"', 'Append and print all'],
      ['for f in "${files[@]}"; do echo "[$f]"; done', 'Loop keeping names with spaces intact'],
      ['mapfile -t lines < <(ls ~/website); echo "${lines[0]}"', 'Load command output into an array'],
      ['declare -A color=([sky]=blue [leaf]=green); echo "${color[sky]}"', 'Look up by key', 'blue'],
      ['echo "${!color[@]}"', 'List the keys']
    ],
    flags: [['-A', 'Associative array', 'declare'], ['-a', 'Indexed array', 'declare'], ['-t', 'Strip the newline from each line', 'mapfile']],
    tips: ['If it contains a list, quote it as <code>"${array[@]}"</code>. Unquoted, spaces split names apart.'],
    warn: ['<code>for f in $(ls)</code> breaks on file names with spaces. Use a glob (<code>for f in *</code>) or an array.']
  }
]);

LV.add('dev', [
  {
    id: 'gitbranch', title: 'Git branches & merging', sum: 'Work on features in parallel and bring them together.',
    explain: [
      'A <b>branch</b> is a movable label on a line of commits. Branches are cheap: create one for each feature or fix, work without disturbing <code>main</code>, then <b>merge</b> it back.',
      '<code>git switch -c feature</code> creates and enters a branch. <code>git merge feature</code> (run from main) brings its commits in. If both sides changed the same lines you get a <b>conflict</b>: edit the file, remove the <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> markers, then <code>git add</code> and <code>git commit</code>.',
      'Share a branch with <code>git push -u origin feature</code>, then open a pull request on your hosting site.'
    ],
    terms: [['branch', 'A named line of development'], ['HEAD', 'The commit you are on now'], ['merge', 'Combine another branch into this one'], ['conflict', 'Both branches changed the same lines'], ['fast-forward', 'A merge that just moves the label']],
    cmds: [
      ['git branch', 'List branches; * marks the current one', '  feature\n* main'],
      ['git switch -c feature/contact', 'Create and move to a new branch'],
      ['git add . && git commit -m "Add contact page"', 'Save work on the branch'],
      ['git switch main', 'Go back to main'],
      ['git merge feature/contact', 'Bring the feature in'],
      ['git branch -d feature/contact', 'Delete a merged branch'],
      ['git log --oneline --graph --all | head -n 8', 'Draw the branch history'],
      ['git push -u origin feature/contact', 'Publish the branch'],
      ['git status', 'During a conflict: shows the files to fix']
    ],
    flags: [['-c name', 'Create a branch while switching', 'git switch'], ['-d / -D', 'Delete (safe) / force delete', 'git branch'], ['--graph', 'Draw the history', 'git log'], ['-u', 'Remember the upstream branch', 'git push']],
    tips: ['Pull the latest main into your branch often (<code>git merge main</code> or <code>git rebase main</code>) so conflicts stay small.'],
    warn: ['Do not rebase or force-push branches other people use; it rewrites history they already have.']
  },
  {
    id: 'gitundo', title: 'Git: undoing mistakes', sum: 'restore, reset, revert, stash and the reflog safety net.',
    explain: [
      'Git rarely loses committed work, so most mistakes can be undone. Choose the tool by what you want to undo: a file edit, a staged change, or a commit.',
      '<code>git restore file</code> discards edits in the working folder; <code>git restore --staged file</code> unstages. <code>git commit --amend</code> fixes the last commit. <code>git revert hash</code> makes a <i>new</i> commit that cancels an old one, which is safe on shared branches. <code>git reset</code> moves the branch back and rewrites history, so use it only on local work.',
      '<code>git stash</code> shelves unfinished changes so you can switch branches. And if you think something is gone, <code>git reflog</code> lists where HEAD has been, so you can return.'
    ],
    terms: [['restore', 'Discard working changes or unstage'], ['revert', 'New commit that undoes an older one'], ['reset', 'Move the branch pointer (rewrites history)'], ['stash', 'Shelve uncommitted changes'], ['reflog', 'Log of where HEAD has been']],
    table: { head: ['I want to…', 'Command'], rows: [['Discard edits to a file', 'git restore file'], ['Unstage a file', 'git restore --staged file'], ['Fix the last commit message', 'git commit --amend'], ['Undo a pushed commit safely', 'git revert <hash>'], ['Drop local commits', 'git reset --hard <hash>'], ['Recover "lost" commits', 'git reflog']] },
    cmds: [
      ['git restore notes.txt', 'Throw away uncommitted edits to a file'],
      ['git restore --staged notes.txt', 'Unstage without losing edits'],
      ['git commit --amend -m "Better message"', 'Rewrite the last commit message'],
      ['git revert HEAD', 'Cancel the last commit with a new commit'],
      ['git reset --soft HEAD~1', 'Undo the last commit, keep the changes staged'],
      ['git stash push -m "wip"', 'Shelve current changes'],
      ['git stash list', 'See shelved changes'],
      ['git stash pop', 'Bring them back'],
      ['git reflog | head -n 5', 'Find a commit you thought you lost']
    ],
    flags: [['--soft', 'Keep changes staged', 'git reset'], ['--mixed', 'Keep changes, unstaged (default)', 'git reset'], ['--hard', 'Discard changes too (dangerous)', 'git reset'], ['--staged', 'Act on the index', 'git restore']],
    tips: ['Before any risky command, make a safety branch: <code>git branch backup</code>.'],
    warn: ['<code>git reset --hard</code> and <code>git restore</code> discard uncommitted work for good. There is no undo for changes never committed.']
  }
]);

LV.tool({
  sysctl: { syntax: 'sysctl [options] [variable[=value]]', desc: 'Read or set kernel parameters at runtime.' },
  swapon: { syntax: 'swapon [options] [device]', desc: 'Enable devices and files for swapping.' },
  mkswap: { syntax: 'mkswap [options] device', desc: 'Set up a Linux swap area.' },
  fallocate: { syntax: 'fallocate -l size file', desc: 'Preallocate space for a file.' },
  openssl: { syntax: 'openssl command [options]', desc: 'Toolkit for TLS, certificates and cryptography.' },
  certbot: { syntax: 'certbot [command] [options]', desc: 'Get and renew Let\'s Encrypt certificates.' },
  mapfile: { syntax: 'mapfile [-t] array', desc: 'Read lines from input into an array.' },
  'systemd-analyze': { syntax: 'systemd-analyze [command]', desc: 'Analyse boot time and verify unit files.' }
});
