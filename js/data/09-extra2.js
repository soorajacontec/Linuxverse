/* More topics: jq, account files, time & NTP, NetworkManager, Python venv, backups, SSH tunnels, lsof & strace. */

LV.add('text', [
  {
    id: 'jq', title: 'JSON on the command line: jq', sum: 'Read, filter and reshape JSON from APIs and config files.',
    explain: [
      'JSON is the format of most web APIs and many config files. It is hard to read when printed on one line. <code>jq</code> pretty-prints it and lets you pick out exactly the parts you need.',
      'A jq filter starts with <code>.</code> (the whole input). <code>.name</code> takes a field, <code>.items[0]</code> the first array element, <code>.items[]</code> every element, and <code>|</code> chains steps just like the shell.',
      'Use <code>-r</code> for raw text without quotes, which is what you want when the result goes into a shell variable.'
    ],
    code: '{ "site": "linuxverse", "pages": [ { "name": "home", "hits": 120 }, { "name": "labs", "hits": 45 } ] }',
    terms: [['.field', 'Pick one key from an object'], ['.[]', 'Every element of an array'], ['-r', 'Raw output: strings without quotes'], ['select()', 'Keep only items that match a test'], ['map()', 'Transform every item of an array']],
    cmds: [
      ['cat data.json | jq .', 'Pretty-print JSON with colours'],
      ['jq ".site" data.json', 'Take one field', '"linuxverse"'],
      ['jq -r ".site" data.json', 'Same, without quotes', 'linuxverse'],
      ['jq ".pages[].name" data.json', 'Every page name', '"home"\n"labs"'],
      ['jq ".pages[] | select(.hits > 100)" data.json', 'Only pages with more than 100 hits'],
      ['jq "[.pages[].hits] | add" data.json', 'Add up the hits', '165'],
      ['jq -r ".pages[] | [.name, .hits] | @tsv" data.json', 'Output as tab-separated columns'],
      ['curl -s https://api.example.com/items | jq length', 'Count items from an API']
    ],
    flags: [['-r', 'Raw strings', 'jq'], ['-c', 'Compact one-line output', 'jq'], ['-e', 'Exit code 1 if the result is false or null', 'jq'], ['--arg n v', 'Pass a shell value into the filter', 'jq']],
    tips: ['Build a filter step by step: start with <code>jq .</code>, then add one <code>.field</code> at a time.'],
    warn: ['Do not build JSON by pasting shell variables into a string. Use <code>jq -n --arg name "$x" \'{name: $name}\'</code> so quotes are escaped correctly.']
  }
]);

LV.add('perms', [
  {
    id: 'accountfiles', title: 'Account files: passwd, shadow & group', sum: 'Where users, passwords and groups are stored.',
    explain: [
      '<code>/etc/passwd</code> has one line per account with seven colon-separated fields: name, a placeholder x, UID, GID, comment, home folder and login shell. Anyone can read it.',
      'Password hashes are in <code>/etc/shadow</code>, readable only by root, together with ageing rules. <code>/etc/group</code> lists groups and their members. Never edit these by hand; use <code>useradd</code>, <code>usermod</code>, <code>passwd</code> and <code>chage</code> so the files stay consistent.',
      'A login shell of <code>/usr/sbin/nologin</code> marks a service account that cannot log in interactively. UIDs below 1000 are normally system accounts.'
    ],
    terms: [['UID / GID', 'Numeric user and group ID'], ['/etc/shadow', 'Password hashes, root-only'], ['nologin', 'Shell that refuses logins'], ['getent', 'Query users and groups from any source (files, LDAP)'], ['chage', 'Password ageing and expiry']],
    table: { head: ['Field', 'Example', 'Meaning'], rows: [['1', 'ssk', 'Login name'], ['3', '1000', 'User ID'], ['4', '1000', 'Primary group ID'], ['6', '/home/ssk', 'Home folder'], ['7', '/bin/bash', 'Login shell']] },
    cmds: [
      ['grep ssk /etc/passwd', 'Your account line', 'ssk:x:1000:1000:ssk:/home/ssk:/bin/bash'],
      ['cut -d: -f1,3 /etc/passwd | head -n 3', 'Names and UIDs', 'root:0\nbin:1\ndaemon:2'],
      ['getent passwd ssk', 'Look up an account the portable way'],
      ['getent group sudo', 'Who is in the sudo group'],
      ['ls -l /etc/shadow', 'Note: not readable by normal users', '-rw-r----- 1 root shadow 1187 Nov  5 12:00 /etc/shadow'],
      ['sudo chage -l ssk', 'Show password ageing for a user'],
      ['awk -F: \'$3 >= 1000 {print $1}\' /etc/passwd', 'List normal (human) accounts'],
      ['sudo usermod -aG docker ssk', 'Add a user to a group']
    ],
    flags: [['-aG', 'Append to supplementary groups (without -a you replace them!)', 'usermod'], ['-l', 'List ageing info', 'chage'], ['-s shell', 'Change login shell', 'usermod'], ['-L / -U', 'Lock / unlock an account', 'usermod']],
    tips: ['Use <code>getent</code> instead of grepping /etc/passwd; it also works on machines that use central logins.'],
    warn: ['<code>usermod -G group user</code> without <code>-a</code> removes the user from all other groups, including sudo.']
  }
]);

LV.add('systemd', [
  {
    id: 'timesync', title: 'Time, zones & NTP', sum: 'timedatectl, time zones and keeping the clock correct.',
    explain: [
      'Wrong time breaks logs, certificates, Kerberos and cron jobs. Linux keeps the hardware clock in UTC and converts to your <b>time zone</b> for display.',
      '<code>timedatectl</code> shows and changes the zone and turns on <b>NTP</b>, which syncs the clock with internet time servers. The sync is done by <code>systemd-timesyncd</code> or <code>chrony</code>.',
      'For scripts, prefer UTC and ISO dates: <code>date -u +%FT%TZ</code> gives 2026-11-08T14:30:00Z and sorts correctly.'
    ],
    terms: [['UTC', 'The universal base time, no daylight saving'], ['NTP', 'Network Time Protocol: syncs clocks over the network'], ['timedatectl', 'systemd tool for date, time and zone'], ['chrony', 'An NTP client/server, common on servers'], ['RTC', 'Real-time (hardware) clock']],
    cmds: [
      ['timedatectl', 'Current time, zone and sync state', '               Local time: Sun 2026-11-08 20:41:03 IST\n           Universal time: Sun 2026-11-08 15:11:03 UTC\n                Time zone: Asia/Kolkata (IST, +0530)\nSystem clock synchronized: yes\n              NTP service: active'],
      ['timedatectl list-timezones | grep Asia | head -n 3', 'Find a zone name'],
      ['sudo timedatectl set-timezone Europe/London', 'Change the time zone'],
      ['sudo timedatectl set-ntp true', 'Turn automatic time sync on'],
      ['date -u +%FT%TZ', 'Current UTC time in ISO format'],
      ['TZ=America/New_York date', 'Show the time in another zone for one command'],
      ['chronyc tracking', 'How far off the clock is (chrony)']
    ],
    flags: [['set-timezone', 'Choose the zone', 'timedatectl'], ['set-ntp', 'Enable/disable network sync', 'timedatectl'], ['-u', 'Use UTC', 'date'], ['+FORMAT', 'Custom output format', 'date']],
    tips: ['Servers are easiest to run when set to UTC. Convert for display only.'],
    warn: ['Setting the clock by hand while NTP is on is overwritten at the next sync. Disable NTP first if you really need a manual time.']
  }
]);

LV.add('net', [
  {
    id: 'nmcli', title: 'Network settings: NetworkManager', sum: 'Wi-Fi, connections and DNS with nmcli.',
    explain: [
      'Most desktops and many servers use <b>NetworkManager</b>. You control it with <code>nmcli</code> (command line) or <code>nmtui</code> (a simple menu). A <b>device</b> is the hardware (wlan0, eth0); a <b>connection</b> is a saved set of settings for it.',
      'Changes made with <code>nmcli connection modify</code> are saved but only apply after you bring the connection down and up again.',
      'To test connectivity step by step: link up (<code>ip link</code>), address (<code>ip addr</code>), gateway (<code>ping</code> the router), DNS (<code>resolvectl query</code>), then the internet.'
    ],
    terms: [['device', 'A network interface such as wlan0'], ['connection', 'A saved profile of settings'], ['nmcli', 'NetworkManager command-line client'], ['nmtui', 'Text menu for the same job'], ['SSID', 'The name of a Wi-Fi network']],
    cmds: [
      ['nmcli device status', 'All interfaces and their state', 'DEVICE  TYPE      STATE      CONNECTION\nwlan0   wifi      connected  HomeWiFi\neth0    ethernet  unavailable  --\nlo      loopback  unmanaged  --'],
      ['nmcli connection show', 'Saved connection profiles'],
      ['nmcli device wifi list', 'Wi-Fi networks in range'],
      ['nmcli device wifi connect "HomeWiFi" password "secret"', 'Join a Wi-Fi network'],
      ['nmcli connection modify HomeWiFi ipv4.dns "1.1.1.1 9.9.9.9"', 'Set custom DNS servers'],
      ['nmcli connection up HomeWiFi', 'Apply the changes'],
      ['nmcli -p device show wlan0', 'Detailed info for one device'],
      ['nmtui', 'Menu-driven editor']
    ],
    flags: [['-p', 'Pretty output', 'nmcli'], ['-t', 'Terse output for scripts', 'nmcli'], ['-f fields', 'Choose which columns to print', 'nmcli']],
    tips: ['On a headless server with SSH, change network settings with care: a wrong IP cuts your own connection. Test on a console first.'],
    warn: ['Putting the Wi-Fi password in the command line saves it in your shell history. Use <code>--ask</code> to be prompted.']
  },
  {
    id: 'tunnels', title: 'SSH tunnels & port forwarding', sum: 'Reach private services safely through an SSH connection.',
    explain: [
      'An <b>SSH tunnel</b> carries other traffic inside an encrypted SSH connection. <b>Local forwarding</b> (<code>-L</code>) makes a remote service available on your own machine: <code>ssh -L 8080:localhost:80 user@server</code> lets you open http://localhost:8080 and reach the server\'s port 80.',
      '<b>Remote forwarding</b> (<code>-R</code>) does the opposite: it exposes a port from your machine on the server. <b>Dynamic forwarding</b> (<code>-D</code>) turns SSH into a SOCKS proxy for your browser.',
      'A <b>jump host</b> (<code>-J</code>) lets you reach a machine behind another: <code>ssh -J bastion user@internal</code>. Put the settings in <code>~/.ssh/config</code> so you do not retype them.'
    ],
    code: '# ~/.ssh/config\nHost internal\n    HostName 10.0.0.12\n    User ssk\n    ProxyJump bastion\n    LocalForward 5432 localhost:5432',
    terms: [['-L', 'Local forward: remote service on a local port'], ['-R', 'Remote forward: your service on the server'], ['-D', 'Dynamic: SOCKS proxy'], ['-J / ProxyJump', 'Go through a jump host'], ['-N', 'Do not run a command, just forward']],
    cmds: [
      ['ssh -L 8080:localhost:80 user@server', 'Open server port 80 at localhost:8080'],
      ['ssh -N -L 5432:db.internal:5432 user@bastion', 'Reach a private database through a bastion host'],
      ['ssh -R 9000:localhost:3000 user@server', 'Share your local port 3000 on the server'],
      ['ssh -D 1080 -N user@server', 'SOCKS proxy on localhost:1080'],
      ['ssh -J bastion user@internal', 'Connect through a jump host'],
      ['ssh -f -N -L 8080:localhost:80 user@server', 'Run the tunnel in the background'],
      ['ss -tlnp | grep 8080', 'Confirm the local port is listening']
    ],
    flags: [['-N', 'No remote command', 'ssh'], ['-f', 'Go to background', 'ssh'], ['-L l:h:p', 'Local forward', 'ssh'], ['-R r:h:p', 'Remote forward', 'ssh'], ['-D port', 'SOCKS proxy', 'ssh']],
    tips: ['Bind tunnels to localhost only (the default) so other machines cannot use them.'],
    warn: ['Remote forwards can expose a service on the server\'s network. Only use them for services you intend to share.']
  }
]);

LV.add('dev', [
  {
    id: 'venv', title: 'Python virtual environments', sum: 'Keep each project\'s packages separate with venv and pip.',
    explain: [
      'Python projects need different package versions. A <b>virtual environment</b> is a private folder of packages for one project, so installs never collide or touch the system Python.',
      'Create it with <code>python3 -m venv .venv</code>, <b>activate</b> it with <code>source .venv/bin/activate</code> (the prompt shows <code>(.venv)</code>), then <code>pip install</code> as usual. <code>deactivate</code> leaves it.',
      'Record your packages with <code>pip freeze &gt; requirements.txt</code> so someone else can recreate them with <code>pip install -r requirements.txt</code>. Do not commit the <code>.venv</code> folder itself.'
    ],
    terms: [['venv', 'Built-in module that creates an environment'], ['activate', 'Put the environment first in PATH'], ['pip', 'Python package installer'], ['requirements.txt', 'List of packages and versions'], ['pipx', 'Install Python command-line tools in their own environments']],
    cmds: [
      ['python3 --version', 'Check Python is installed', 'Python 3.13.0'],
      ['python3 -m venv .venv', 'Create an environment in .venv'],
      ['source .venv/bin/activate', 'Switch it on for this terminal'],
      ['which python', 'Now points inside .venv', '/home/ssk/project/.venv/bin/python'],
      ['pip install requests', 'Install a package into the environment'],
      ['pip list', 'Packages installed here'],
      ['pip freeze > requirements.txt', 'Save exact versions'],
      ['pip install -r requirements.txt', 'Recreate the environment elsewhere'],
      ['deactivate', 'Leave the environment'],
      ['pipx install httpie', 'Install a command-line app on its own']
    ],
    flags: [['-m venv dir', 'Create environment in dir', 'python3'], ['-r file', 'Install from a requirements file', 'pip'], ['--upgrade', 'Upgrade a package', 'pip']],
    tips: ['Add <code>.venv/</code> to <code>.gitignore</code>.', 'Debian and Fedora block <code>pip install</code> outside an environment on purpose ("externally managed"). Use a venv or pipx.'],
    warn: ['Never run <code>sudo pip install</code>. It can break system tools that depend on the system\'s Python packages.']
  }
]);

LV.add('files', [
  {
    id: 'backups', title: 'Backups that work', sum: 'The 3-2-1 rule, rsync snapshots and testing restores.',
    explain: [
      'A backup you have never restored is only a hope. Follow the <b>3-2-1 rule</b>: 3 copies of your data, on 2 different kinds of storage, with 1 copy off-site.',
      '<code>rsync -a</code> copies only what changed and keeps permissions and times. With <code>--link-dest</code> it makes daily <b>snapshots</b> where unchanged files are hard links, so each snapshot looks complete but costs little space. Tools such as <code>restic</code> and <code>borg</code> add encryption and de-duplication.',
      'Automate it with cron or a systemd timer, log the result, and every so often restore a file to prove it works.'
    ],
    code: '#!/usr/bin/env bash\nset -euo pipefail\nsrc="$HOME/website/"\ndest="/mnt/backup/website"\ntoday="$(date +%F)"\n\nrsync -a --delete --link-dest="$dest/latest" "$src" "$dest/$today/"\nln -sfn "$dest/$today" "$dest/latest"',
    terms: [['3-2-1', '3 copies, 2 media, 1 off-site'], ['snapshot', 'A point-in-time copy'], ['--link-dest', 'Hard-link unchanged files to the previous backup'], ['restic / borg', 'Encrypted, de-duplicating backup tools'], ['restore test', 'Proof that the backup is usable']],
    cmds: [
      ['rsync -a --dry-run ~/website/ /mnt/backup/website/', 'Show what would be copied, change nothing'],
      ['rsync -a --delete ~/website/ /mnt/backup/website/', 'Mirror; delete files that no longer exist in the source'],
      ['rsync -a -e ssh ~/website/ user@server:/backups/website/', 'Back up to another machine'],
      ['tar -czf ~/site-$(date +%F).tar.gz ~/website', 'A simple dated archive'],
      ['restic init --repo /mnt/backup/restic', 'Create an encrypted repository'],
      ['restic -r /mnt/backup/restic backup ~/website', 'Take a snapshot'],
      ['restic -r /mnt/backup/restic snapshots', 'List snapshots'],
      ['restic -r /mnt/backup/restic restore latest --target /tmp/restore', 'Restore into a test folder']
    ],
    flags: [['-a', 'Archive: keep permissions, times, links', 'rsync'], ['--delete', 'Remove files missing from the source', 'rsync'], ['-n / --dry-run', 'Rehearse only', 'rsync'], ['--exclude PAT', 'Skip matching files', 'rsync']],
    tips: ['The trailing slash matters in rsync: <code>src/</code> copies the contents, <code>src</code> copies the folder itself.'],
    warn: ['<code>--delete</code> with the source and destination swapped erases your data. Always do a <code>--dry-run</code> first.']
  }
]);

LV.add('proc', [
  {
    id: 'debugprocs', title: 'Debugging with lsof & strace', sum: 'See which files and ports a program has open and what it asks the kernel.',
    explain: [
      '<code>lsof</code> ("list open files") shows every file, socket and port a process has open. Because everything is a file on Linux, it answers "who is using this port?", "why can\'t I unmount this disk?" and "which process holds this deleted file?".',
      '<code>strace</code> prints each <b>system call</b> a program makes: opening files, reading, connecting. When a program fails with no useful message, strace often shows the missing file or denied permission just before it exits.',
      'Both are read-only observers, but need root to look at other users\' processes.'
    ],
    terms: [['lsof', 'List open files, sockets and ports'], ['strace', 'Trace system calls'], ['system call', 'A request from a program to the kernel'], ['-p PID', 'Attach to a running process'], ['ENOENT', 'Error "No such file or directory" seen in strace']],
    cmds: [
      ['sudo lsof -i :80', 'Who is using port 80?', 'COMMAND  PID  USER  FD  TYPE  NODE NAME\nnginx    812  root  6u  IPv4  TCP *:http (LISTEN)'],
      ['lsof -u ssk | head -n 5', 'Files opened by one user'],
      ['lsof +D ~/website', 'Processes using files in a folder (why a disk will not unmount)'],
      ['sudo lsof -p 812', 'Everything process 812 has open'],
      ['sudo lsof +L1', 'Deleted files that are still held open (a hidden cause of full disks)'],
      ['strace -e trace=openat cat missing.txt', 'Watch which files cat tries to open'],
      ['strace -f -o trace.txt ./deploy.sh', 'Trace a script and its child processes into a file'],
      ['sudo strace -p 812 -c', 'Summary of calls from a running process (Ctrl+C to stop)']
    ],
    flags: [['-i :PORT', 'Network connections on a port', 'lsof'], ['-p PID', 'One process', 'lsof strace'], ['-e trace=openat', 'Only file-open calls', 'strace'], ['-f', 'Follow child processes', 'strace'], ['-o file', 'Write to a file', 'strace']],
    tips: ['In strace output look for lines ending in <code>= -1 ENOENT</code> (missing file) or <code>EACCES</code> (permission denied).'],
    warn: ['strace slows the program a lot. Do not leave it attached to a busy production process.']
  }
]);

LV.tool({
  jq: { syntax: 'jq [options] filter [file...]', desc: 'Command-line JSON processor.' },
  timedatectl: { syntax: 'timedatectl [command]', desc: 'Query and change the system clock and time zone.' },
  chronyc: { syntax: 'chronyc [command]', desc: 'Control and query the chrony time daemon.' },
  python3: { syntax: 'python3 [option] [-m module | file] [args]', desc: 'The Python interpreter.' },
  pip: { syntax: 'pip <command> [options]', desc: 'Install and manage Python packages.' },
  strace: { syntax: 'strace [options] command | -p PID', desc: 'Trace system calls and signals.' },
  lsof: { syntax: 'lsof [options] [names]', desc: 'List open files and the processes using them.' },
  restic: { syntax: 'restic [command] [flags]', desc: 'Fast, encrypted, de-duplicating backups.' },
  getent: { syntax: 'getent database [key...]', desc: 'Get entries from administrative databases (passwd, group, hosts).' },
  chage: { syntax: 'chage [options] LOGIN', desc: 'Change or show user password expiry information.' }
});
