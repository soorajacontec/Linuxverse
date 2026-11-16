/* 20 more topics: filesystems, attributes, sed/awk, columns, pagers, monitoring, ulimit, nginx proxy, network diagnosis,
   netcat, fail2ban, sudoers, auth logs, flatpak, getopts, safe scripts, compose, git remotes, systemd timers. */

LV.add('files', [
  {
    id: 'fstypes', title: 'Filesystem types: ext4, xfs, btrfs', sum: 'What a filesystem is and how to choose one.',
    explain: [
      'A <b>filesystem</b> is the structure written on a disk that records file names, sizes, owners and where the data lives. Before a partition can be used it must be formatted with one (<code>mkfs</code>).',
      '<b>ext4</b> is the safe default on most distributions. <b>xfs</b> is excellent for large files and servers (and cannot shrink). <b>btrfs</b> adds snapshots, checksums and built-in compression. <b>FAT32/exFAT</b> are for USB sticks shared with Windows and macOS; <b>NTFS</b> is read and written with the ntfs-3g driver.',
      '<code>lsblk -f</code> and <code>findmnt</code> show what each device is formatted with and where it is mounted. <code>fsck</code> repairs an unmounted filesystem.'
    ],
    terms: [['ext4', 'Reliable general-purpose default'], ['xfs', 'Fast with huge files, cannot be shrunk'], ['btrfs', 'Snapshots, checksums, compression'], ['mkfs', 'Format a partition with a filesystem'], ['fsck', 'Check and repair a filesystem']],
    table: { head: ['Type', 'Best for', 'Notes'], rows: [['ext4', 'Desktops, general servers', 'Mature, simple'], ['xfs', 'Large files, databases', 'Grow only'], ['btrfs', 'Snapshots, backups', 'Built-in checksums'], ['exFAT', 'USB drives', 'Works on all systems'], ['tmpfs', 'Fast temporary files', 'Lives in RAM']] },
    cmds: [
      ['lsblk -f', 'Devices, filesystem types and labels'],
      ['findmnt /', 'What the root filesystem is and its options', 'TARGET SOURCE    FSTYPE OPTIONS\n/      /dev/sda2 ext4   rw,relatime'],
      ['df -T', 'Free space plus the type of each filesystem'],
      ['sudo mkfs.ext4 -L data /dev/sdb1', 'Format a partition as ext4 (erases it!)'],
      ['sudo fsck -n /dev/sdb1', 'Check without changing anything (unmounted)'],
      ['sudo blkid /dev/sdb1', 'UUID and type, used in /etc/fstab'],
      ['mount | grep tmpfs | head -n 3', 'RAM-backed filesystems']
    ],
    flags: [['-f', 'Show filesystem info', 'lsblk'], ['-T', 'Show type', 'df'], ['-L name', 'Set a label', 'mkfs.ext4'], ['-n', 'Read-only check', 'fsck']],
    tips: ['Mount by <code>UUID</code> in /etc/fstab. Device names such as /dev/sdb can change between boots.'],
    warn: ['<code>mkfs</code> destroys everything on the partition. Double-check the device name with <code>lsblk</code> first.']
  },
  {
    id: 'fileattr', title: 'File attributes: chattr & lsattr', sum: 'Make a file immutable or append-only, even for root.',
    explain: [
      'Below permissions, ext4 and some other filesystems support <b>attributes</b>. <code>lsattr</code> shows them and <code>chattr</code> changes them. Two matter most: <code>i</code> (immutable) means the file cannot be changed, renamed or deleted by anyone, even root, until the flag is removed; <code>a</code> (append-only) allows adding to the end but not rewriting.',
      'They protect important config files and logs from accidents and from many kinds of malware. Setting or clearing them needs root.',
      'If a file refuses to be deleted even with sudo, check <code>lsattr</code>.'
    ],
    terms: [['i', 'Immutable: no change, rename or delete'], ['a', 'Append-only: add lines, never rewrite'], ['lsattr', 'List attributes'], ['chattr +i / -i', 'Set / clear the immutable flag']],
    cmds: [
      ['lsattr ~/website/notes.txt', 'Show the attributes', '--------------e------- /home/ssk/website/notes.txt'],
      ['sudo chattr +i ~/website/.env', 'Make the file immutable'],
      ['rm ~/website/.env', 'Fails: Operation not permitted', 'rm: cannot remove \'/home/ssk/website/.env\': Operation not permitted'],
      ['sudo chattr -i ~/website/.env', 'Allow changes again'],
      ['sudo chattr +a /var/log/audit.log', 'Make a log append-only'],
      ['lsattr -d ~/website', 'Attributes of the folder itself']
    ],
    flags: [['+i / -i', 'Set / clear immutable', 'chattr'], ['+a / -a', 'Set / clear append-only', 'chattr'], ['-R', 'Recurse into folders', 'chattr lsattr'], ['-d', 'Show the folder, not its contents', 'lsattr']],
    tips: ['Mark /etc/resolv.conf or a key file immutable if another service keeps overwriting it.'],
    warn: ['An immutable file also blocks legitimate updates (package upgrades). Remember to clear the flag before maintenance.']
  }
]);

LV.add('text', [
  {
    id: 'sedinplace', title: 'sed in practice: edit files', sum: 'Replace text, delete lines and edit files in place.',
    explain: [
      '<code>sed</code> edits a stream line by line. The most used command is substitute: <code>s/old/new/</code> replaces the first match on each line; add <code>g</code> for every match. Any character can be the separator, which helps with paths: <code>s|/var|/srv|g</code>.',
      'Add an address before the command to limit it: <code>3d</code> deletes line 3, <code>2,5p</code> prints lines 2 to 5, <code>/error/d</code> deletes lines containing "error".',
      '<code>sed -i</code> edits the file itself. Write <code>-i.bak</code> to keep a backup copy first. Use <code>-n</code> with <code>p</code> to print only what you select.'
    ],
    terms: [['s/a/b/g', 'Substitute a with b, everywhere on the line'], ['-i', 'Edit the file in place'], ['-n + p', 'Print only selected lines'], ['d', 'Delete the line'], ['-E', 'Use extended regular expressions']],
    cmds: [
      ['echo "hello world" | sed \'s/world/Linux/\'', 'Replace a word', 'hello Linux'],
      ['sed \'s/404/NOT FOUND/g\' ~/website/logs/access.log | head -n 3', 'Replace everywhere on each line'],
      ['sed -n \'2,4p\' ~/website/notes.txt', 'Print lines 2 to 4 only'],
      ['sed \'/TODO/d\' ~/website/notes.txt', 'Delete lines containing TODO'],
      ['sed -i.bak \'s/localhost/example.com/\' ~/website/.env', 'Edit in place, keep a .bak backup'],
      ['sed -E \'s/([0-9]+)\\.([0-9]+)/\\2.\\1/\' <<< "10.5"', 'Use capture groups (swap two numbers)', '5.10'],
      ['sed \'1i # header\' ~/website/notes.txt', 'Insert a line before line 1'],
      ['sed -n \'$=\' ~/website/notes.txt', 'Count lines (print the last line number)']
    ],
    flags: [['-i[SUFFIX]', 'Edit in place, optional backup', 'sed'], ['-n', 'Quiet: print only with p', 'sed'], ['-E', 'Extended regex', 'sed'], ['-e', 'Add multiple commands', 'sed']],
    tips: ['Run without <code>-i</code> first to preview the change on screen.'],
    warn: ['<code>sed -i</code> overwrites the file at once. Use <code>-i.bak</code> until you are sure.']
  },
  {
    id: 'awkprog', title: 'awk: columns, sums and reports', sum: 'Small programs that read fields and compute.',
    explain: [
      '<code>awk</code> reads a line, splits it into fields (<code>$1</code>, <code>$2</code>, … and <code>$NF</code> for the last) and runs your code. A program is <code>pattern { action }</code>: the action runs for lines the pattern matches.',
      '<code>BEGIN { }</code> runs once before any input and <code>END { }</code> once after the last line, which is where you print totals. Variables need no declaration, and arrays are built in, so awk can sum, count and group.',
      'Change the separator with <code>-F</code>, e.g. <code>-F:</code> for /etc/passwd or <code>-F,</code> for CSV.'
    ],
    terms: [['$1 … $NF', 'Fields; NF is the number of fields'], ['NR', 'Current line number'], ['BEGIN / END', 'Run before / after all input'], ['-F:', 'Field separator'], ['a[k]++', 'Count per key with an array']],
    cmds: [
      ['awk \'{print $1}\' ~/website/logs/access.log | head -n 3', 'First column of every line'],
      ['awk -F: \'{print $1, $6}\' /etc/passwd | head -n 3', 'Name and home from passwd'],
      ['awk \'$NF == 404\' ~/website/logs/access.log', 'Lines whose last field is 404'],
      ['awk \'{n[$1]++} END {for (ip in n) print n[ip], ip}\' ~/website/logs/access.log', 'Count requests per address'],
      ['seq 1 5 | awk \'{s += $1} END {print s}\'', 'Add numbers', '15'],
      ['awk \'NR > 1 {print NR": "$0}\' ~/website/notes.txt', 'Skip the header line and number the rest'],
      ['ls -l | awk \'{s += $5} END {print s " bytes"}\'', 'Total size from a listing']
    ],
    flags: [['-F sep', 'Field separator', 'awk'], ['-v var=val', 'Pass a shell value in', 'awk'], ['-f file', 'Read the program from a file', 'awk']],
    tips: ['Put the awk program in single quotes so the shell does not touch <code>$1</code>.'],
    warn: ['awk numbers are floating point and fields are text until used. For very precise money maths, use another tool.']
  },
  {
    id: 'columns', title: 'Columns & tables: cut, paste, column, join', sum: 'Slice, align and combine tabular text.',
    explain: [
      '<code>cut</code> takes fields (<code>-f</code>) split by a delimiter (<code>-d</code>) or characters (<code>-c</code>). <code>paste</code> glues files side by side. <code>column -t</code> aligns messy output into a neat table. <code>join</code> merges two sorted files on a shared field, like a small database join.',
      'These are most useful in pipelines: pick the column you need with cut or awk, sort it, and align it with column for reading.',
      'For CSV with quoted commas, cut is too simple; use a CSV-aware tool such as <code>csvkit</code> or <code>awk</code> with care.'
    ],
    terms: [['cut -d, -f2', 'Take field 2 of comma-separated text'], ['paste', 'Merge lines of files side by side'], ['column -t', 'Align into columns'], ['join', 'Merge two files on a common field'], ['tr', 'Translate or delete characters']],
    cmds: [
      ['cut -d: -f1,7 /etc/passwd | head -n 3', 'Name and shell'],
      ['echo "a,b,c" | cut -d, -f2', 'Second field', 'b'],
      ['paste <(seq 1 3) <(seq 4 6)', 'Combine two lists side by side', '1\t4\n2\t5\n3\t6'],
      ['mount | column -t | head -n 3', 'Align mount output'],
      ['echo "a b c" | tr " " "\\n"', 'Turn spaces into new lines', 'a\nb\nc'],
      ['printf "id name\\n1 ssk\\n" | column -t', 'Pretty table'],
      ['sort -k2 -n data.txt | head -n 5', 'Sort by the second column as numbers']
    ],
    flags: [['-d', 'Delimiter', 'cut'], ['-f', 'Fields to keep', 'cut'], ['-t', 'Make a table', 'column'], ['-s sep', 'Input separator', 'column']],
    tips: ['Convert runs of spaces to a single separator with <code>tr -s " "</code> before using <code>cut</code>.'],
    warn: ['<code>cut</code> treats each delimiter as one separator, so aligned output with several spaces gives empty fields. Use awk for that.']
  },
  {
    id: 'viewing', title: 'Viewing files: less, tail -f & watch', sum: 'Page through text, follow logs and repeat commands.',
    explain: [
      '<code>less</code> lets you scroll a long file without opening an editor. Keys: Space (next page), b (back), <code>/word</code> search, n next match, g/G start/end, q quit. <code>head</code> and <code>tail</code> show the beginning and the end.',
      '<code>tail -f</code> follows a file and prints new lines as they are written, which is how you watch a log live. <code>tail -F</code> keeps following even if the file is rotated. <code>less +F</code> does the same but lets you press Ctrl+C to scroll back.',
      '<code>watch -n 2 command</code> re-runs a command every 2 seconds and shows the output in place.'
    ],
    terms: [['less', 'Scrollable file viewer'], ['tail -f', 'Follow new lines as they appear'], ['tail -F', 'Follow by name, survives log rotation'], ['watch', 'Repeat a command and refresh the screen'], ['/pattern', 'Search inside less']],
    cmds: [
      ['less ~/website/logs/access.log', 'Open in a pager'],
      ['less +F ~/website/logs/access.log', 'Follow mode; Ctrl+C to scroll, F to follow again'],
      ['tail -n 20 ~/website/logs/access.log', 'Last 20 lines'],
      ['tail -f /var/log/syslog', 'Watch a log live'],
      ['tail -F ~/website/logs/access.log | grep --line-buffered 404', 'Live filter for errors'],
      ['watch -n 2 df -h', 'Refresh disk usage every 2 seconds'],
      ['watch -d "ls -l ~/website"', 'Highlight what changed between runs']
    ],
    flags: [['-n N', 'Number of lines', 'head tail'], ['-f / -F', 'Follow', 'tail'], ['-S', 'Do not wrap long lines', 'less'], ['-n SEC', 'Interval', 'watch'], ['-d', 'Highlight differences', 'watch']],
    tips: ['In less, press <code>&</code> then a word to show only matching lines.'],
    warn: ['Do not open huge files in a normal editor; less loads only the part you view.']
  }
]);

LV.add('proc', [
  {
    id: 'monitor', title: 'Monitoring: top, vmstat & iostat', sum: 'Find what is using CPU, memory and disk right now.',
    explain: [
      '<code>top</code> (or the friendlier <code>htop</code>) shows live processes. Read the header first: <b>load average</b>, CPU split (us user, sy system, wa waiting on disk) and memory. Press <code>P</code> to sort by CPU, <code>M</code> by memory, <code>k</code> to kill, <code>q</code> to quit.',
      '<code>vmstat 2</code> prints a line every 2 seconds with memory, swap, disk and CPU activity. <code>iostat -x 2</code> shows per-disk busy time. A high <code>wa</code> means programs wait for the disk; swap activity (<code>si</code>/<code>so</code>) means memory shortage.',
      'Rule of thumb: first decide whether the bottleneck is CPU, memory or disk, then find the process responsible.'
    ],
    terms: [['load average', 'Average runnable programs over 1, 5, 15 min'], ['us / sy / wa', 'CPU in user / kernel / waiting on I/O'], ['si / so', 'Swap in / out'], ['%util', 'How busy a disk is (iostat)'], ['htop', 'Colour, interactive top']],
    cmds: [
      ['top -b -n 1 | head -n 12', 'One snapshot of top (batch mode)'],
      ['htop', 'Interactive viewer (F6 sort, F9 kill)'],
      ['vmstat 2 5', 'Five samples, two seconds apart'],
      ['iostat -x 2 3', 'Disk busy time and wait'],
      ['ps aux --sort=-%cpu | head -n 5', 'Top CPU users'],
      ['uptime', 'Load average right now'],
      ['sar -u 1 3', 'CPU history style report (sysstat)'],
      ['ss -s', 'Socket summary']
    ],
    flags: [['-b', 'Batch mode for scripts', 'top'], ['-n N', 'Number of iterations', 'top'], ['-x', 'Extended disk stats', 'iostat'], ['--sort=-%mem', 'Sort descending by memory', 'ps']],
    tips: ['Load higher than the number of CPU cores (<code>nproc</code>) means programs are queueing for a CPU.'],
    warn: ['A single high number is not a diagnosis. Watch for a minute and compare with a normal day.']
  },
  {
    id: 'ulimit', title: 'Limits: ulimit & resource control', sum: 'Cap files, processes and memory per user or service.',
    explain: [
      'Linux limits what one process or user can consume. <code>ulimit -a</code> shows the limits of your shell. The most common error is "Too many open files", fixed by raising <code>ulimit -n</code> (open files).',
      'Permanent per-user limits go in <code>/etc/security/limits.conf</code> or <code>/etc/security/limits.d/</code>. For a systemd service, set <code>LimitNOFILE=</code> in its unit instead.',
      'For stronger control (CPU share, memory cap) systemd uses <b>cgroups</b>: <code>MemoryMax=500M</code> or <code>CPUQuota=50%</code> in a unit, or temporarily with <code>systemd-run</code>.'
    ],
    terms: [['ulimit -n', 'Max open files'], ['ulimit -u', 'Max processes'], ['soft / hard', 'Soft is the active limit, hard the ceiling'], ['cgroup', 'Kernel group with resource limits'], ['MemoryMax=', 'systemd memory cap']],
    cmds: [
      ['ulimit -a', 'All limits of this shell'],
      ['ulimit -n', 'Open-file limit', '1024'],
      ['ulimit -n 4096', 'Raise it for this shell and its children'],
      ['cat /proc/$$/limits', 'Limits of the current process'],
      ['systemd-run --user --scope -p MemoryMax=200M bash', 'Start a shell limited to 200 MB'],
      ['systemctl show nginx -p LimitNOFILE', 'A service\'s open-file limit'],
      ['prlimit --pid 812 --nofile', 'Limits of a running process']
    ],
    flags: [['-n', 'Open files', 'ulimit'], ['-u', 'User processes', 'ulimit'], ['-H / -S', 'Hard / soft limit', 'ulimit'], ['-p', 'Set a unit property', 'systemd-run']],
    tips: ['For a daemon, change the limit in its unit file. limits.conf applies to login sessions, not to services.'],
    warn: ['Setting limits too low can crash software; too high or unlimited lets one bug use the entire machine.']
  }
]);

LV.add('net', [
  {
    id: 'nginxproxy', title: 'Reverse proxy with nginx', sum: 'Put nginx in front of an app and add HTTPS.',
    explain: [
      'A <b>reverse proxy</b> receives requests from the internet and passes them to an app running on a private port. Benefits: one public port for many apps, HTTPS handled in one place, caching, compression and protection of the app.',
      'In nginx a <code>server</code> block matches a domain and a <code>location</code> block forwards with <code>proxy_pass</code>. Forward the real client address with <code>proxy_set_header</code> lines.',
      'Always run <code>sudo nginx -t</code> to test the config before <code>systemctl reload nginx</code>.'
    ],
    code: '# /etc/nginx/conf.d/app.conf\nserver {\n    listen 80;\n    server_name example.com;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n}',
    terms: [['proxy_pass', 'Where to forward requests'], ['server_name', 'Domain this block answers for'], ['upstream', 'Named group of backend servers'], ['502 Bad Gateway', 'nginx could not reach the app'], ['nginx -t', 'Test the configuration']],
    cmds: [
      ['sudo nginx -t', 'Check the config syntax', 'nginx: configuration file /etc/nginx/nginx.conf test is successful'],
      ['sudo systemctl reload nginx', 'Apply changes without dropping connections'],
      ['curl -I http://localhost:3000', 'Is the app itself up?'],
      ['curl -I -H "Host: example.com" http://localhost', 'Test the proxy with a host name'],
      ['sudo tail -f /var/log/nginx/error.log', 'Watch errors live'],
      ['ss -tlnp | grep -E ":80|:3000"', 'What listens where'],
      ['sudo certbot --nginx -d example.com', 'Add HTTPS']
    ],
    flags: [['-t', 'Test config', 'nginx'], ['-s reload', 'Signal a reload', 'nginx'], ['-T', 'Test and print the whole config', 'nginx']],
    tips: ['A 502 usually means the app is down or on a different port. Test the app directly with curl first.'],
    warn: ['Bind the app to <code>127.0.0.1</code> only, or it stays reachable around the proxy on its own port.']
  },
  {
    id: 'netdiag', title: 'Network troubleshooting: ping, traceroute, mtr', sum: 'Find out where a connection breaks.',
    explain: [
      'Test from near to far. <code>ping 127.0.0.1</code> checks your own stack, ping the <b>gateway</b> (<code>ip route</code>) checks your local network, ping <code>1.1.1.1</code> checks the internet, and ping a <b>name</b> checks DNS. The first step that fails shows where the problem is.',
      '<code>traceroute</code> and <code>mtr</code> list every router on the way and the delay at each hop. A loss that starts at one hop and continues to the end is real; loss only at one middle hop is often just that router ignoring ping.',
      '<code>ip route get 8.8.8.8</code> shows which interface and gateway Linux will use.'
    ],
    terms: [['ICMP', 'The protocol ping uses'], ['gateway', 'The router that leads out of your network'], ['hop', 'One router on the path'], ['latency', 'Round-trip delay in ms'], ['packet loss', 'Percent of lost packets']],
    cmds: [
      ['ping -c 4 1.1.1.1', 'Is the internet reachable?', '4 packets transmitted, 4 received, 0% packet loss\nrtt min/avg/max = 11.2/12.0/13.1 ms'],
      ['ping -c 2 example.com', 'Does DNS work?'],
      ['ip route | head -n 3', 'Find the default gateway'],
      ['ip route get 8.8.8.8', 'Which route will be used'],
      ['traceroute example.com', 'Path to a host'],
      ['mtr -rwc 10 example.com', 'Report: 10 probes, per-hop loss and latency'],
      ['resolvectl query example.com', 'DNS lookup through the system resolver'],
      ['curl -sS -o /dev/null -w "%{time_total}s\\n" https://example.com', 'Time a full HTTPS request']
    ],
    flags: [['-c N', 'Send N packets', 'ping'], ['-r', 'Report mode', 'mtr'], ['-w', 'Wide host names', 'mtr'], ['-n', 'Skip name lookups (faster)', 'traceroute']],
    tips: ['Ping by IP and by name. If the IP works and the name does not, the problem is DNS.'],
    warn: ['Some firewalls block ping on purpose. No reply does not always mean the host is down; try the real port with curl or nc.']
  },
  {
    id: 'netcat', title: 'Testing ports with nc', sum: 'Check a port, send text, move a file.',
    explain: [
      '<code>nc</code> (netcat) opens a raw TCP or UDP connection. It is the quick answer to "is this port reachable?": <code>nc -zv host 22</code> tries to connect and reports success or failure without sending data.',
      'It can also act as a tiny server: <code>nc -l 9000</code> waits for a connection and prints what arrives, which is handy to test firewalls and tunnels. Combined with redirection it can copy a file between machines.',
      'If nc is missing, bash can test a port too: <code>timeout 3 bash -c \'&lt;/dev/tcp/host/22\' &amp;&amp; echo open</code>.'
    ],
    terms: [['-z', 'Scan only: connect and close'], ['-v', 'Verbose result'], ['-l', 'Listen for a connection'], ['-u', 'Use UDP'], ['/dev/tcp', 'Bash built-in way to open a connection']],
    cmds: [
      ['nc -zv example.com 443', 'Is HTTPS reachable?', 'Connection to example.com 443 port [tcp/https] succeeded!'],
      ['nc -zv 192.168.1.1 20-25', 'Test a range of ports'],
      ['nc -l 9000', 'Wait for a connection on port 9000'],
      ['echo "hello" | nc localhost 9000', 'Send text to it'],
      ['nc -l 9000 > received.txt', 'Receive a file on one machine'],
      ['nc host 9000 < file.txt', 'Send the file from another'],
      ['timeout 3 bash -c \'</dev/tcp/example.com/443\' && echo open', 'Port check without nc', 'open']
    ],
    flags: [['-z', 'Zero-I/O scan mode', 'nc'], ['-v', 'Verbose', 'nc'], ['-l', 'Listen', 'nc'], ['-u', 'UDP', 'nc'], ['-w SEC', 'Timeout', 'nc']],
    tips: ['Open a test listener on the server, then connect from your laptop. It proves whether the firewall or the app is the problem.'],
    warn: ['Netcat sends data in plain text. Do not use it for passwords or sensitive files across untrusted networks.']
  }
]);

LV.add('sec', [
  {
    id: 'fail2ban', title: 'Blocking brute force: fail2ban', sum: 'Ban addresses that keep failing to log in.',
    explain: [
      'Any server with SSH open is probed constantly. <b>fail2ban</b> reads logs, spots repeated failed logins and adds a firewall rule that blocks the address for a while.',
      'It works in <b>jails</b>, one per service. Copy the defaults to <code>/etc/fail2ban/jail.local</code> and change only what you need: <code>maxretry</code> (failures allowed), <code>findtime</code> (window) and <code>bantime</code> (how long).',
      'Fail2ban complements, not replaces, strong settings: key-only SSH login and no root login.'
    ],
    code: '# /etc/fail2ban/jail.local\n[DEFAULT]\nbantime  = 1h\nfindtime = 10m\nmaxretry = 5\n\n[sshd]\nenabled = true',
    terms: [['jail', 'A rule set for one service'], ['bantime', 'How long an address is blocked'], ['maxretry', 'Failures before a ban'], ['fail2ban-client', 'Control and query tool'], ['ignoreip', 'Addresses never banned']],
    cmds: [
      ['sudo apt install fail2ban', 'Install (Debian/Ubuntu)'],
      ['sudo systemctl enable --now fail2ban', 'Start it now and at boot'],
      ['sudo fail2ban-client status', 'Active jails', 'Status\n|- Number of jail:\t1\n`- Jail list:\tsshd'],
      ['sudo fail2ban-client status sshd', 'Failures and banned addresses for ssh'],
      ['sudo fail2ban-client set sshd unbanip 203.0.113.9', 'Unblock an address'],
      ['sudo journalctl -u fail2ban | tail -n 5', 'Recent bans'],
      ['sudo nft list ruleset | grep -i fail2ban', 'The firewall rules it created']
    ],
    flags: [['status [jail]', 'Show state', 'fail2ban-client'], ['set JAIL banip IP', 'Ban manually', 'fail2ban-client'], ['set JAIL unbanip IP', 'Unban', 'fail2ban-client']],
    tips: ['Add your own IP to <code>ignoreip</code> so a typo does not lock you out.'],
    warn: ['Do not edit <code>jail.conf</code> directly; package updates overwrite it. Use <code>jail.local</code>.']
  },
  {
    id: 'sudoers', title: 'Controlling sudo: sudoers', sum: 'Decide who may run which commands as root.',
    explain: [
      'The file <code>/etc/sudoers</code> and the folder <code>/etc/sudoers.d/</code> say who may use sudo and for what. Always edit them with <code>sudo visudo</code> (or <code>visudo -f file</code>), which checks the syntax before saving. A broken sudoers can lock you out.',
      'A rule reads: <code>who where = (as_whom) what</code>, e.g. <code>alex ALL=(ALL) /usr/bin/systemctl restart nginx</code> lets alex restart only nginx. <code>%wheel</code> or <code>%sudo</code> refers to a group. <code>NOPASSWD:</code> skips the password prompt.',
      'Prefer small files in <code>/etc/sudoers.d/</code> (one per purpose, mode 0440) to editing the main file.'
    ],
    code: '# /etc/sudoers.d/webadmin\n%webadmin ALL=(root) /usr/bin/systemctl restart nginx, /usr/bin/systemctl reload nginx\nalex ALL=(ALL) NOPASSWD: /usr/bin/journalctl',
    terms: [['visudo', 'Safe editor that validates syntax'], ['%group', 'A group in a rule'], ['NOPASSWD:', 'No password needed'], ['/etc/sudoers.d/', 'Drop-in rule files'], ['sudo -l', 'List what you may run']],
    cmds: [
      ['sudo -l', 'What may I run with sudo?'],
      ['sudo visudo', 'Edit the main file safely'],
      ['sudo visudo -f /etc/sudoers.d/webadmin', 'Create a drop-in rule'],
      ['sudo visudo -c', 'Check all files for errors', '/etc/sudoers: parsed OK'],
      ['ls -l /etc/sudoers.d/', 'Files should be mode 0440'],
      ['sudo -u alex whoami', 'Run a command as another user', 'alex'],
      ['sudo -k', 'Forget the cached password now']
    ],
    flags: [['-l', 'List allowed commands', 'sudo'], ['-u user', 'Run as another user', 'sudo'], ['-c', 'Check syntax', 'visudo'], ['-f file', 'Edit a specific file', 'visudo']],
    tips: ['Allow exact commands with full paths rather than ALL. Broad rules (like allowing vim or less) can be used to get a root shell.'],
    warn: ['Never edit /etc/sudoers with a normal editor. One typo can remove sudo for everyone.']
  },
  {
    id: 'authlogs', title: 'Who logged in? last, lastb & auth logs', sum: 'Read login history and spot suspicious access.',
    explain: [
      '<code>who</code> and <code>w</code> show who is logged in now and what they are doing. <code>last</code> lists past logins and reboots from <code>/var/log/wtmp</code>, and <code>lastb</code> lists failed attempts (root only). <code>lastlog</code> shows each account\'s most recent login.',
      'Detailed records are in the authentication log: <code>/var/log/auth.log</code> on Debian/Ubuntu, <code>/var/log/secure</code> on Fedora/RHEL, or <code>journalctl -u sshd</code>. Look for "Failed password", "Accepted publickey" and "sudo:" lines.',
      'A quick check for brute force: count failed attempts per address and look for any login at an odd time or from an unknown address.'
    ],
    terms: [['wtmp', 'Binary record of logins (read with last)'], ['btmp', 'Failed logins (read with lastb)'], ['auth.log / secure', 'Text authentication log'], ['Accepted publickey', 'Successful key login'], ['Failed password', 'Wrong password attempt']],
    cmds: [
      ['who', 'Who is logged in now'],
      ['w', 'Logged-in users and their commands'],
      ['last -n 5', 'Last five logins', 'ssk   pts/0  192.168.1.20  Sun Nov  8 20:10   still logged in\nreboot system boot  7.2.11  Sat Nov  7 18:02   still running'],
      ['sudo lastb | head -n 5', 'Recent failed logins'],
      ['lastlog | head -n 5', 'Last login per account'],
      ['sudo grep "Failed password" /var/log/auth.log | tail -n 5', 'Recent failed ssh passwords'],
      ['sudo grep "Failed password" /var/log/auth.log | awk \'{print $(NF-3)}\' | sort | uniq -c | sort -rn | head', 'Which addresses fail most'],
      ['sudo journalctl -u sshd --since today', 'Today\'s ssh events']
    ],
    flags: [['-n N', 'Show N entries', 'last'], ['-a', 'Show host last', 'last'], ['--since', 'Start time', 'journalctl'], ['-u unit', 'One service', 'journalctl']],
    tips: ['Compare <code>last</code> output with what you remember. An unknown address or time is worth a closer look.'],
    warn: ['Attackers with root can edit logs. Send logs to another machine if they matter for security.']
  }
]);

LV.add('pkg', [
  {
    id: 'flatpak', title: 'Flatpak & Snap: sandboxed apps', sum: 'Install desktop software that works on any distribution.',
    explain: [
      '<b>Flatpak</b> and <b>Snap</b> package an app together with its libraries and run it in a sandbox, so the same app works on many distributions and updates independently of the system. Flatpak apps come from <b>Flathub</b>; Snaps from the Snap Store (default on Ubuntu).',
      'The trade-off: bigger downloads and a little more disk use. Sandboxed apps see only what you allow; manage file and device access with <code>flatpak override</code> or a tool such as Flatseal.',
      'Updates: <code>flatpak update</code> and <code>sudo snap refresh</code>. For command-line tools and servers, the distribution\'s own packages are normally better.'
    ],
    terms: [['Flatpak', 'Sandboxed apps, Flathub repository'], ['Snap', 'Canonical\'s sandboxed packages'], ['remote', 'Flatpak\'s name for a repository'], ['runtime', 'Shared libraries an app uses'], ['sandbox', 'Limited access to your files and devices']],
    cmds: [
      ['flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo', 'Add the Flathub repository'],
      ['flatpak search vlc', 'Find an app'],
      ['flatpak install flathub org.videolan.VLC', 'Install it'],
      ['flatpak run org.videolan.VLC', 'Start it'],
      ['flatpak list', 'Installed apps'],
      ['flatpak update', 'Update apps and runtimes'],
      ['snap find vlc', 'Search the Snap Store'],
      ['sudo snap install vlc', 'Install a snap'],
      ['snap list', 'Installed snaps']
    ],
    flags: [['--user', 'Install for your user only', 'flatpak'], ['-y', 'Answer yes', 'flatpak'], ['--classic', 'Snap with full access (some dev tools)', 'snap']],
    tips: ['Use <code>flatpak uninstall --unused</code> now and then to remove runtimes nothing needs.'],
    warn: ['Sandbox permissions are broad on some apps (full home access). Check what an app asks for.']
  }
]);

LV.add('script', [
  {
    id: 'getopts', title: 'Script options with getopts', sum: 'Accept -v, -o file and friends like real tools.',
    explain: [
      'Instead of guessing the order of <code>$1 $2</code>, let users pass <b>options</b>. The bash built-in <code>getopts</code> parses them in a loop. The string <code>"vo:"</code> means: <code>-v</code> is a flag, <code>-o</code> takes a value (the colon).',
      'Inside the loop the current option is in your variable and its value in <code>$OPTARG</code>. After the loop, <code>shift $((OPTIND-1))</code> removes the options so <code>$1</code> is the first real argument.',
      'Add a <code>usage()</code> function and exit with status 2 on bad input, as standard tools do.'
    ],
    code: '#!/usr/bin/env bash\nusage() { echo "usage: $0 [-v] [-o file] name..." >&2; exit 2; }\nverbose=0; out=/dev/stdout\nwhile getopts "vo:h" opt; do\n  case "$opt" in\n    v) verbose=1 ;;\n    o) out="$OPTARG" ;;\n    h|*) usage ;;\n  esac\ndone\nshift $((OPTIND-1))\n[[ $# -ge 1 ]] || usage\nfor n in "$@"; do echo "hello $n" >> "$out"; done',
    terms: [['getopts "vo:"', 'Declare options; colon means it takes a value'], ['$OPTARG', 'The value of the current option'], ['$OPTIND', 'Index of the next argument'], ['shift', 'Drop processed arguments'], ['usage()', 'Help message function']],
    cmds: [
      ['bash scripts/tool.sh -v -o out.txt alice bob', 'Run with options and arguments'],
      ['bash scripts/tool.sh -h', 'Show the usage message', 'usage: scripts/tool.sh [-v] [-o file] name...'],
      ['bash scripts/tool.sh', 'Missing arguments: usage and exit code 2'],
      ['echo $?', 'Check the exit status', '2'],
      ['help getopts', 'Built-in reference']
    ],
    flags: [['optstring', 'Letters of valid options', 'getopts'], ['leading :', 'Silent error mode', 'getopts']],
    tips: ['getopts handles short options only. For long ones (<code>--verbose</code>) use a <code>case</code> loop on <code>$1</code>.'],
    warn: ['Always quote <code>"$OPTARG"</code>; values can contain spaces.']
  },
  {
    id: 'safescripts', title: 'Writing safe scripts', sum: 'Strict mode, temp files, traps and lock files.',
    explain: [
      'Start scripts with <code>set -euo pipefail</code>: stop on errors (<code>-e</code>), treat unset variables as errors (<code>-u</code>) and fail when any step of a pipe fails (<code>pipefail</code>).',
      'Make temporary files with <code>mktemp</code> (unique and private) and delete them with <code>trap ... EXIT</code>, which runs on normal exit, errors and Ctrl+C. Never use a fixed name like /tmp/out.',
      'To stop two copies running at once, use <code>flock</code> on a lock file. Quote every variable and check destructive commands with a dry run first. Run <code>shellcheck</code> before you ship.'
    ],
    code: '#!/usr/bin/env bash\nset -euo pipefail\n\ntmp="$(mktemp -d)"\ntrap \'rm -rf "$tmp"\' EXIT\n\nexec 9>/tmp/mysite.lock\nflock -n 9 || { echo "already running" >&2; exit 1; }\n\ncp -r "$HOME/website" "$tmp/"\necho "working in $tmp"',
    terms: [['set -e', 'Exit on the first failing command'], ['set -u', 'Error on unset variables'], ['pipefail', 'Pipeline fails if any part fails'], ['mktemp', 'Create a unique temp file or folder'], ['flock', 'Lock so only one copy runs']],
    cmds: [
      ['tmp=$(mktemp -d); echo "$tmp"', 'Private temp folder', '/tmp/tmp.k3J9dQ1xTz'],
      ['trap \'echo cleaning\' EXIT; echo working', 'Run something when the shell ends'],
      ['flock -n /tmp/job.lock sleep 5', 'Run only if no other copy holds the lock'],
      ['shellcheck scripts/deploy.sh', 'Find common bugs before running'],
      ['bash -n scripts/deploy.sh', 'Syntax check without running'],
      ['bash -x scripts/deploy.sh', 'Trace every command as it runs'],
      ['rm -rf "${dir:?}/"', 'Abort if dir is empty, so you never run rm -rf /']
    ],
    flags: [['-n', 'Parse only (syntax check)', 'bash'], ['-x', 'Trace commands', 'bash'], ['-d', 'Make a directory', 'mktemp'], ['-n', 'Fail instead of waiting', 'flock']],
    tips: ['Use <code>"${var:?message}"</code> before destructive commands: an empty variable stops the script.'],
    warn: ['<code>set -e</code> does not catch every failure (for example inside conditions). It is a safety net, not a replacement for checks.']
  }
]);

LV.add('dev', [
  {
    id: 'compose', title: 'Docker Compose: many containers, one file', sum: 'Describe a whole app (web, database) in docker-compose.yml.',
    explain: [
      'Real apps need several containers: a web app, a database, a cache. <b>Compose</b> describes them all in one YAML file and starts everything with one command.',
      'Each entry under <code>services</code> has an <code>image</code> (or a <code>build</code> folder), <code>ports</code>, <code>environment</code>, <code>volumes</code> for data that must survive, and <code>depends_on</code> for start order. Services reach each other by service name on a private network.',
      'Use <code>docker compose up -d</code> to start in the background, <code>logs -f</code> to watch and <code>down</code> to stop and remove. Add <code>-v</code> to <code>down</code> only if you also want the volumes (data) deleted.'
    ],
    code: '# docker-compose.yml\nservices:\n  web:\n    image: nginx:alpine\n    ports: ["8080:80"]\n    volumes: ["./site:/usr/share/nginx/html:ro"]\n    depends_on: [db]\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: example\n    volumes: ["dbdata:/var/lib/postgresql/data"]\nvolumes:\n  dbdata:',
    terms: [['service', 'One container definition'], ['volume', 'Storage that outlives the container'], ['ports "8080:80"', 'Host port : container port'], ['depends_on', 'Start order'], ['.env', 'File with variables for compose']],
    cmds: [
      ['docker compose config', 'Validate and print the final config'],
      ['docker compose up -d', 'Start everything in the background'],
      ['docker compose ps', 'State of each service'],
      ['docker compose logs -f web', 'Follow one service\'s logs'],
      ['docker compose exec db psql -U postgres', 'Open a shell command in a running container'],
      ['docker compose pull && docker compose up -d', 'Update images'],
      ['docker compose down', 'Stop and remove containers (keeps volumes)'],
      ['docker compose down -v', 'Also delete volumes (data!)']
    ],
    flags: [['-d', 'Detached (background)', 'up'], ['-f file', 'Use another compose file', 'docker compose'], ['--build', 'Rebuild images before start', 'up'], ['-v', 'Remove volumes too', 'down']],
    tips: ['Keep secrets in a <code>.env</code> file that is in <code>.gitignore</code>, not inside the YAML.'],
    warn: ['<code>docker compose down -v</code> deletes database data. Back up first.']
  },
  {
    id: 'gitremote', title: 'Git remotes & SSH keys', sum: 'Clone, push and pull safely with GitHub or GitLab.',
    explain: [
      'A <b>remote</b> is another copy of the repository, usually on GitHub or GitLab. The default is called <code>origin</code>. <code>git clone</code> copies it, <code>git pull</code> fetches and merges new commits, and <code>git push</code> sends yours.',
      'Use an <b>SSH key</b> instead of a password: <code>ssh-keygen -t ed25519</code>, add the public key (<code>~/.ssh/id_ed25519.pub</code>) in your account settings and test with <code>ssh -T git@github.com</code>.',
      '<code>git fetch</code> downloads without changing your files, so you can look first with <code>git log origin/main..</code> or <code>git diff origin/main</code>. Never force-push to a shared branch.'
    ],
    terms: [['origin', 'Default name of the main remote'], ['clone', 'Copy a remote repo'], ['fetch', 'Download changes, do not apply'], ['pull', 'Fetch and merge'], ['upstream', 'The remote branch yours tracks']],
    cmds: [
      ['ssh-keygen -t ed25519 -C "you@example.com"', 'Create a key pair'],
      ['cat ~/.ssh/id_ed25519.pub', 'The public key to paste into GitHub'],
      ['ssh -T git@github.com', 'Test the key', 'Hi ssk! You\'ve successfully authenticated.'],
      ['git clone git@github.com:user/repo.git', 'Copy a repository'],
      ['git remote -v', 'Show remotes and their URLs'],
      ['git fetch origin', 'Download new commits only'],
      ['git log --oneline HEAD..origin/main', 'What would a pull bring?'],
      ['git pull --ff-only', 'Update; refuse if it would need a merge'],
      ['git push -u origin main', 'Send commits and set upstream']
    ],
    flags: [['-v', 'Show URLs', 'git remote'], ['--ff-only', 'Only fast-forward', 'git pull'], ['-u', 'Set the upstream branch', 'git push'], ['--force-with-lease', 'Safer force push', 'git push']],
    tips: ['If you must force-push your own branch, use <code>--force-with-lease</code>; it refuses when someone else pushed meanwhile.'],
    warn: ['Never commit private keys, tokens or <code>.env</code> files. Once pushed, treat them as leaked and replace them.']
  }
]);

LV.add('systemd', [
  {
    id: 'timers', title: 'systemd timers', sum: 'Scheduled jobs with logging, an alternative to cron.',
    explain: [
      'A <b>timer</b> unit starts a matching <b>service</b> unit on a schedule. Compared with cron you get logs in the journal, dependencies, resource limits and <code>Persistent=true</code>, which runs a missed job after the machine was off.',
      'You write two files: <code>backup.service</code> (what to run, <code>Type=oneshot</code>) and <code>backup.timer</code> (when: <code>OnCalendar=daily</code> or <code>OnCalendar=*-*-* 02:30:00</code>, or <code>OnBootSec=10min</code>).',
      'Enable the <b>timer</b>, not the service: <code>sudo systemctl enable --now backup.timer</code>. List all with <code>systemctl list-timers</code>.'
    ],
    code: '# backup.service\n[Service]\nType=oneshot\nExecStart=/home/ssk/bin/backup.sh\n\n# backup.timer\n[Unit]\nDescription=Nightly backup\n[Timer]\nOnCalendar=*-*-* 02:30:00\nPersistent=true\n[Install]\nWantedBy=timers.target',
    terms: [['OnCalendar=', 'Calendar schedule'], ['OnBootSec=', 'Delay after boot'], ['Persistent=true', 'Run missed jobs after downtime'], ['Type=oneshot', 'Runs once and exits'], ['list-timers', 'Show all timers and next run']],
    cmds: [
      ['systemctl list-timers', 'All timers, last and next run'],
      ['systemd-analyze calendar "Mon *-*-* 02:30"', 'Check when a schedule will fire next'],
      ['sudo systemctl daemon-reload', 'After creating the files'],
      ['sudo systemctl enable --now backup.timer', 'Activate the timer'],
      ['sudo systemctl start backup.service', 'Run the job once, right now'],
      ['journalctl -u backup.service -n 20', 'Output of recent runs'],
      ['systemctl status backup.timer', 'Is it active, when is the next run?']
    ],
    flags: [['calendar', 'Test an OnCalendar value', 'systemd-analyze'], ['--all', 'Include inactive timers', 'list-timers'], ['-n N', 'Last N log lines', 'journalctl']],
    tips: ['Test the job with <code>systemctl start name.service</code> before trusting the schedule.'],
    warn: ['Enabling the .service instead of the .timer means the job runs at boot and never on schedule.']
  }
]);

LV.tool({
  chattr: { syntax: 'chattr [-RVf] [+-=aAcCdDeijsStTu] files', desc: 'Change file attributes on a Linux filesystem.' },
  lsattr: { syntax: 'lsattr [-RVadlpv] [files]', desc: 'List file attributes on a Linux filesystem.' },
  nc: { syntax: 'nc [options] host port', desc: 'Read and write network connections (netcat).' },
  mtr: { syntax: 'mtr [options] host', desc: 'Combined ping and traceroute.' },
  traceroute: { syntax: 'traceroute [options] host', desc: 'Print the route packets take to a host.' },
  vmstat: { syntax: 'vmstat [options] [delay [count]]', desc: 'Report virtual memory, CPU and I/O statistics.' },
  iostat: { syntax: 'iostat [options] [interval [count]]', desc: 'Report CPU and disk I/O statistics.' },
  htop: { syntax: 'htop [options]', desc: 'Interactive process viewer.' },
  'fail2ban-client': { syntax: 'fail2ban-client [options] <command>', desc: 'Control and query the fail2ban server.' },
  visudo: { syntax: 'visudo [-c] [-f sudoers]', desc: 'Safely edit the sudoers file.' },
  last: { syntax: 'last [options] [username]', desc: 'Show a listing of last logged-in users.' },
  lastb: { syntax: 'lastb [options]', desc: 'Show a listing of failed login attempts.' },
  flatpak: { syntax: 'flatpak [options] command', desc: 'Install and run sandboxed applications.' },
  getopts: { syntax: 'getopts optstring name [arg]', desc: 'Bash built-in for parsing script options.' },
  mktemp: { syntax: 'mktemp [-d] [template]', desc: 'Create a unique temporary file or directory.' },
  flock: { syntax: 'flock [options] file command', desc: 'Manage locks from shell scripts.' },
  shellcheck: { syntax: 'shellcheck [options] file...', desc: 'Static analysis for shell scripts.' },
  column: { syntax: 'column [options] [file]', desc: 'Format input into columns.' },
  paste: { syntax: 'paste [OPTION]... [FILE]...', desc: 'Merge lines of files side by side.' },
  less: { syntax: 'less [options] file', desc: 'View a file one screen at a time.' },
  watch: { syntax: 'watch [options] command', desc: 'Run a command repeatedly and show its output.' },
  ulimit: { syntax: 'ulimit [-SHa] [-n N]', desc: 'Show or set shell resource limits.' }
});
