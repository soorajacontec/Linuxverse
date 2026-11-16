/* 23 more new diagrams for topics that had no Visual tab yet (see 14-anim-a.js for the helper). */
(function () {
  'use strict';
  var A = window.A;

  A('lsblk', 'The storage tree', ['disk|sda (100 GB disk)|h|0|2', 'p1|sda1 /boot/efi|f|1|0', 'p2|sda2 /|f|1|1', 'lv|sdb (data disk)|h|2|0', 'p3|sdb1 /data|f|2|1', 'cmd|lsblk -f shows all|u|3|2'],
    'disk>p1 disk>p2 lv>p3 p1>cmd p2>cmd p3>cmd', 'cmd', [
      ['lsblk draws every block device as a tree. A disk is the top of each branch.', 'disk lv'],
      ['A disk is split into partitions: sda1 holds the boot files, sda2 the system.', '', 'disk>p1 disk>p2'],
      ['Another disk, sdb, holds one partition mounted at /data.', '', 'lv>p3'],
      ['Each partition has a filesystem and may be mounted on a folder. Unmounted ones show no mount point.', 'p1 p2 p3'],
      ['lsblk -f adds the filesystem type, label and UUID. Use the UUID in /etc/fstab.', '', 'p1>cmd p2>cmd p3>cmd']]);

  A('diskusage', 'Hunting a full disk', ['df|df -h: which disk is full?|p|0|2', 'fs|/var is at 98 percent|f|1|2', 'du|du -h --max-depth=1 /var|p|2|0', 'big|/var/log is 40 GB|f|2|1', 'fix|rotate or delete logs|u|3|2'],
    'df>fs fs>du du>big big>fix', 'fs du big fix', [
      ['Start wide: df -h shows how full each mounted disk is.', 'df'],
      ['One filesystem, /var, is almost full.', '', 'df>fs'],
      ['Go narrower: du with a depth limit sizes each sub-folder of /var.', '', 'fs>du'],
      ['The largest one is /var/log. Repeat inside it until you find the file.', '', 'du>big'],
      ['Fix it: rotate or compress logs. A deleted file that a program holds open frees no space until it restarts.', '', 'big>fix']]);

  A('ports', 'What a port really is', ['ng|nginx process|p|0|0', 'sk|socket bound to :80|k|0|1', 'cl|browser connects|u|1|2', 'ss|ss -tulpn|p|2|0', 'fw|firewall allows 80|k|2|1', 'ok|page is served|f|3|2'],
    'ng>sk cl>fw fw>sk sk>ng ss>sk sk>ok', 'sk cl ss fw ok', [
      ['A program that wants to receive connections asks the kernel to bind a socket to a port, here 80.', '', 'ng>sk'],
      ['Only one program may listen on a given port and address at a time.', 'sk'],
      ['ss -tulpn lists every listening socket and which program owns it.', '', 'ss>sk'],
      ['A client connects to the address and port. The firewall has to allow it first.', '', 'cl>fw fw>sk'],
      ['The kernel hands the connection to nginx, which answers.', '', 'sk>ng sk>ok']]);

  A('curlwget', 'One curl request', ['cu|curl -L -I example.com|u|0|2', 'rq|GET / HTTP/1.1|p|1|0', 'sv|web server|h|1|1', 'rd|301 redirect to https|f|2|0', 'fin|200 OK + page|f|2|1', 'out|saved or printed|u|3|2'],
    'cu>rq rq>sv sv>rd rd>fin fin>out', 'rq sv rd fin out', [
      ['curl builds an HTTP request: a method, a path and some headers.', 'cu'],
      ['It sends the request to the server.', '', 'cu>rq rq>sv'],
      ['The server may answer with a redirect, for example 301 to the https address.', '', 'sv>rd'],
      ['With -L curl follows the redirect and asks again at the new address.', '', 'rd>fin'],
      ['It prints the answer or saves it with -o. wget does the same job but is built for downloading files.', '', 'fin>out']]);

  A('nmcli', 'How a network connection comes up', ['nm|NetworkManager|p|0|2', 'dv|device wlan0|h|1|0', 'pf|connection profile|f|1|1', 'dh|DHCP request|p|2|0', 'ip|address + DNS + gateway|f|2|1', 'on|online|u|3|2'],
    'nm>dv nm>pf dv>dh pf>dh dh>ip ip>on', 'dv pf dh ip on', [
      ['NetworkManager watches the network hardware and the saved settings.', 'nm'],
      ['A device is the hardware, such as wlan0. A connection profile holds the settings for a network.', '', 'nm>dv nm>pf'],
      ['When a profile matches, it asks the network for an address with DHCP.', '', 'dv>dh pf>dh'],
      ['The router answers with an address, DNS servers and a gateway.', '', 'dh>ip'],
      ['The link is up. nmcli device status shows it; nmcli connection modify changes a profile.', '', 'ip>on']]);

  A('netdiag', 'Troubleshoot from near to far', ['p1|ping 127.0.0.1|p|0|0', 'p2|ping the gateway|p|0|1', 'p3|ping 1.1.1.1|p|1|0', 'p4|ping example.com|p|1|1', 'rs|first failing step = the problem|f|2|2'],
    'p1>p2 p2>p3 p3>p4 p4>rs', 'p2 p3 p4 rs', [
      ['Test in order from your own machine outwards. ping 127.0.0.1 checks your network stack.', 'p1'],
      ['ping the gateway (ip route shows it): is the local network working?', '', 'p1>p2'],
      ['ping a public address such as 1.1.1.1: does the internet answer?', '', 'p2>p3'],
      ['ping a name: if the address works but the name fails, the problem is DNS.', '', 'p3>p4'],
      ['The first step that fails points to the faulty layer. mtr shows where along the path.', '', 'p4>rs']]);

  A('netcat', 'Testing a port with nc', ['sv|nc -l 9000 (server)|p|0|0', 'cl|nc host 9000 (client)|p|0|1', 'fw|firewall in between|k|1|2', 'msg|hello|f|2|0', 'rs|received on server|f|2|1'],
    'cl>fw fw>sv msg>cl sv>rs', 'fw msg rs', [
      ['On the machine you want to test, nc -l 9000 waits for a connection on port 9000.', 'sv'],
      ['From another machine, nc host 9000 tries to connect.', 'cl', 'cl>fw'],
      ['If a firewall blocks the port, the connection hangs or is refused. That already tells you something.', 'fw'],
      ['If it works, anything you type is sent across.', '', 'msg>cl fw>sv'],
      ['It appears on the server. nc -zv host port checks a port without sending anything.', '', 'sv>rs']]);

  A('mac', 'SELinux says no', ['pr|nginx (httpd_t)|p|0|0', 'fl|/home/ssk/site (user_home_t)|f|0|1', 'pol|SELinux policy|k|1|2', 'dn|access denied|h|2|0', 'al|audit.log entry|f|2|1', 'fx|restorecon / semanage|u|3|2'],
    'pr>pol pol>fl pol>dn dn>al al>fx fx>fl', 'dn al fx', [
      ['Normal permissions are not the whole story. SELinux gives every process and file a security label.', 'pr fl'],
      ['nginx runs as httpd_t. It asks to read a file labelled user_home_t.', '', 'pr>pol pol>fl'],
      ['The policy has no rule allowing httpd_t to read user_home_t, so the access is denied even though the file mode allows it.', '', 'pol>dn'],
      ['The denial is written to the audit log. ausearch -m avc shows it.', '', 'dn>al'],
      ['Fix the label (restorecon, or chcon -t httpd_sys_content_t), not the policy. Do not just turn SELinux off.', '', 'al>fx fx>fl']]);

  A('fail2ban', 'Banning a brute-force attacker', ['at|attacker guessing passwords|u|0|2', 'ssh|sshd|p|1|0', 'lg|auth log: Failed password|f|1|1', 'fb|fail2ban|p|2|2', 'fw|firewall rule: drop IP|k|3|0', 'ub|unban after 1 hour|h|3|1'],
    'at>ssh ssh>lg lg>fb fb>fw fw>at fw>ub', 'lg fb fw ub', [
      ['An attacker tries many passwords against SSH.', '', 'at>ssh'],
      ['Each failure is written to the authentication log.', '', 'ssh>lg'],
      ['fail2ban watches the log. After maxretry failures within findtime it acts.', '', 'lg>fb'],
      ['It adds a firewall rule that drops all packets from that address.', '', 'fb>fw'],
      ['The attacker is blocked. After bantime the rule is removed again.', '', 'fw>at fw>ub']]);

  A('sudoers', 'Which rule matches?', ['u|alex runs systemctl restart nginx|u|0|2', 'sd|sudo|p|1|2', 'r1|%admin ALL=(ALL) ALL|f|2|0', 'r2|alex ALL=(root) systemctl|f|2|1', 'ok|allowed, password asked|k|3|0', 'no|alex is not in sudoers|h|3|1'],
    'u>sd sd>r1 sd>r2 r2>ok r1>no', 'r1 r2 ok no', [
      ['alex types sudo with a command. sudo now has to decide whether to allow it.', '', 'u>sd'],
      ['It reads /etc/sudoers and /etc/sudoers.d/*, always edited with visudo so mistakes are caught.', 'sd'],
      ['A rule for the group admin does not apply: alex is not in it.', '', 'sd>r1'],
      ['A rule just for alex allows exactly one command as root.', '', 'sd>r2'],
      ['The command is allowed, after alex enters his own password. Without a matching rule: "alex is not in the sudoers file".', '', 'r2>ok r1>no']]);

  A('authlogs', 'Following a login attempt', ['at|login from 203.0.113.9|u|0|2', 'sd|sshd|p|1|2', 'al|/var/log/auth.log|f|2|0', 'jn|journalctl -u sshd|f|2|1', 'wt|last, lastb, who|p|3|2'],
    'at>sd sd>al sd>jn al>wt jn>wt', 'al jn wt', [
      ['Someone connects to SSH and tries to log in.', '', 'at>sd'],
      ['sshd records each attempt: Accepted publickey, or Failed password.', 'sd'],
      ['On Debian and Ubuntu it lands in /var/log/auth.log; on Fedora in /var/log/secure.', '', 'sd>al'],
      ['The journal has it too: journalctl -u sshd.', '', 'sd>jn'],
      ['last lists past logins, lastb failed ones, who the current ones. Look for unknown addresses and odd hours.', '', 'al>wt jn>wt']]);

  A('bash-basics', 'How bash runs a script', ['sh|#!/bin/bash first line|f|0|2', 'bash|bash reads it|p|1|2', 'vr|name=ssk|p|2|0', 'cmd|echo "Hi $name"|p|2|1', 'ex|exit code 0|k|3|2'],
    'sh>bash bash>vr bash>cmd vr>cmd cmd>ex', 'vr cmd ex', [
      ['The first line, the shebang, tells the system which program should run the file.', 'sh'],
      ['bash reads the script one line at a time, top to bottom.', '', 'sh>bash'],
      ['name=ssk stores a value in a variable. No spaces around the equals sign.', '', 'bash>vr'],
      ['echo "Hi $name" expands the variable inside double quotes and prints the line.', '', 'vr>cmd bash>cmd'],
      ['When the last line finishes, the script ends with the exit code of the last command: 0 means success.', '', 'cmd>ex']]);

  A('functions', 'Calling a function', ['cl|greet "Ada"|p|0|2', 'fn|greet() { ... }|p|1|2', 'ar|$1 = Ada, $# = 1|f|2|0', 'lc|local msg|k|2|1', 'rt|return 0|f|3|2'],
    'cl>fn fn>ar fn>lc ar>rt lc>rt rt>cl', 'ar lc rt', [
      ['A function is a named block of commands. You call it like any command, with arguments.', '', 'cl>fn'],
      ['Inside the function, $1 is the first argument, $2 the second and $# counts them.', '', 'fn>ar'],
      ['local keeps a variable private to the function so it cannot clash with the rest of the script.', '', 'fn>lc'],
      ['return sets the function\'s exit code. To pass text back, echo it and capture with $(...).', '', 'ar>rt lc>rt'],
      ['Control goes back to the line after the call.', '', 'rt>cl']]);

  A('conditionals', 'Choosing a branch', ['t|[[ -f notes.txt ]]|p|0|2', 'ex|exit code 0 or not|k|1|2', 'th|then: file exists|f|2|0', 'el|else: not found|f|2|1', 'nx|script goes on|p|3|2'],
    't>ex ex>th ex>el th>nx el>nx', 'th el nx', [
      ['An if runs a command, usually a test such as [[ -f notes.txt ]], and looks at its exit code.', 't'],
      ['Exit code 0 means true. Anything else means false.', '', 't>ex'],
      ['If true, the then branch runs.', '', 'ex>th'],
      ['If false, control jumps to elif or else. case does the same with a list of patterns.', '', 'ex>el'],
      ['Afterwards the script continues after fi.', '', 'th>nx el>nx']]);

  A('heredoc', 'A here-document', ['sc|script line: cat <<EOF|p|0|2', 'tx|text up to EOF|f|1|2', 'ex|$var, $(cmd) expand|k|2|0', 'qt|<<\'EOF\' = literal|k|2|1', 'ou|goes to the command|f|3|2'],
    'sc>tx tx>ex tx>qt ex>ou qt>ou', 'ex qt ou', [
      ['A here-document feeds several lines to a command without a temporary file.', 'sc'],
      ['Everything between the first line and the closing marker EOF is the input.', '', 'sc>tx'],
      ['With a plain marker, variables and $(commands) inside are expanded first.', '', 'tx>ex'],
      ['Quote the marker, <<\'EOF\', to keep the text exactly as written.', '', 'tx>qt'],
      ['The final text is sent to the command, for example cat > file.', '', 'ex>ou qt>ou']]);

  A('arrays', 'Looping over an array', ['ar|files=(a.txt "b c.txt")|f|0|2', 'lp|for f in "${files[@]}"|p|1|2', 'i1|f = a.txt|f|2|0', 'i2|f = b c.txt (kept whole)|f|2|1', 'dn|loop ends|k|3|2'],
    'ar>lp lp>i1 lp>i2 i1>dn i2>dn', 'i1 i2 dn', [
      ['A bash array holds several values, even ones that contain spaces.', 'ar'],
      ['"${files[@]}" expands to every element, each kept as a single word.', '', 'ar>lp'],
      ['First time round, f is a.txt.', '', 'lp>i1'],
      ['Second time, f is "b c.txt", with its space intact. Without the quotes it would split in two.', '', 'lp>i2'],
      ['After the last element the loop ends. ${#files[@]} gives the count.', '', 'i1>dn i2>dn']]);

  A('getopts', 'Parsing options in a script', ['cm|./tool -v -o out.txt name|u|0|2', 'gl|while getopts "vo:"|p|1|2', 'ov|-v sets verbose=1|f|2|0', 'oo|-o: OPTARG = out.txt|f|2|1', 'sh|shift $((OPTIND-1))|k|3|0', 'ar|$1 = name|f|3|1'],
    'cm>gl gl>ov gl>oo ov>sh oo>sh sh>ar', 'ov oo sh ar', [
      ['A command line mixes options and arguments: -v, -o out.txt and name.', 'cm'],
      ['getopts reads the options one at a time inside a while loop.', '', 'cm>gl'],
      ['A flag like -v just sets a variable.', '', 'gl>ov'],
      ['An option with a value, -o, puts the value in $OPTARG (the colon in "vo:").', '', 'gl>oo'],
      ['shift removes the options that were handled, so $1 is the first real argument.', '', 'ov>sh oo>sh'],
      ['The rest of the script sees just name.', '', 'sh>ar']]);

  A('safescripts', 'What set -euo pipefail does', ['cm|cp file /backup/|p|0|2', 'er|command fails|h|1|2', 'se|set -e stops the script|k|2|0', 'tr|trap EXIT runs cleanup|p|2|1', 'ex|clean exit with error code|f|3|2'],
    'cm>er er>se se>tr tr>ex', 'er se tr ex', [
      ['A script runs a series of commands. Normally it carries on even after a step fails.', 'cm'],
      ['Suppose a copy fails because the disk is full.', '', 'cm>er'],
      ['With set -e the script stops right there instead of carrying on with bad data. -u catches unset variables, pipefail catches failures inside pipes.', '', 'er>se'],
      ['A trap on EXIT still runs, so temporary files are removed.', '', 'se>tr'],
      ['The script ends with a non-zero code, so callers know it failed.', '', 'tr>ex']]);

  A('buildsrc', 'configure, make, install', ['src|tool-1.0.tar.gz source|f|0|2', 'cf|./configure --prefix|p|1|0', 'mk|make -j8|p|1|1', 'bin|compiled program|f|2|2', 'in|make install|p|3|0', 'run|tool is on your PATH|u|3|1'],
    'src>cf cf>mk mk>bin bin>in in>run', 'cf mk bin in run', [
      ['Unpack the source code and read its README for the needed libraries.', 'src'],
      ['./configure checks your system for compilers and libraries and writes a Makefile.', '', 'src>cf'],
      ['make reads the Makefile and compiles only what changed. -j uses all CPU cores.', '', 'cf>mk'],
      ['The result is the compiled program.', '', 'mk>bin'],
      ['make install copies it into the prefix. Use your home folder to avoid needing root and to keep the package manager clean.', '', 'bin>in'],
      ['Add the prefix\'s bin folder to PATH and run it.', '', 'in>run']]);

  A('venv', 'What activate changes', ['sys|system python3|f|0|0', 'mk|python3 -m venv .venv|p|0|1', 'vv|.venv with its own site-packages|f|1|2', 'ac|source .venv/bin/activate|p|2|0', 'pa|PATH: .venv/bin first|k|2|1', 'pi|pip install stays inside|f|3|2'],
    'mk>vv ac>pa pa>vv vv>pi', 'vv ac pa pi', [
      ['The system Python has its own packages. Installing projects into it makes them clash.', 'sys'],
      ['python3 -m venv .venv creates a private folder with its own interpreter link and package folder.', '', 'mk>vv'],
      ['activate puts .venv/bin first in your PATH for this terminal.', '', 'ac>pa'],
      ['Now python and pip are the ones from .venv.', '', 'pa>vv'],
      ['pip install adds packages only there. Save them with pip freeze > requirements.txt. deactivate leaves.', '', 'vv>pi']]);

  A('gitundo', 'Where each undo command acts', ['wd|working folder|f|0|0', 'ix|staging area|f|0|1', 'cm|last commit|f|1|2', 'rs|git restore|p|2|0', 'rt|git reset|p|2|1', 'rv|git revert|p|3|2'],
    'wd>ix ix>cm rs>wd rt>ix rt>cm rv>cm', 'rs rt rv', [
      ['Git keeps three places: your working files, the staging area and the commits.', 'wd ix cm'],
      ['git add moves changes from the working folder to the staging area.', '', 'wd>ix'],
      ['git commit records the staged changes as a commit.', '', 'ix>cm'],
      ['git restore file throws away working changes, or with --staged unstages.', '', 'rs>wd'],
      ['git reset moves the branch back, optionally changing the staging area and files too. It rewrites history.', '', 'rt>ix rt>cm'],
      ['git revert adds a new commit that cancels an old one, so it is safe on shared branches.', '', 'rv>cm']]);

  A('compose', 'A compose file comes alive', ['yml|docker-compose.yml|f|0|2', 'up|docker compose up -d|p|1|2', 'web|service web (nginx)|p|2|0', 'db|service db (postgres)|p|2|1', 'net|private network|k|3|0', 'vol|volume dbdata|f|3|1'],
    'yml>up up>web up>db web>net db>net db>vol', 'web db net vol', [
      ['One YAML file describes the whole app: its services, ports, environment and volumes.', 'yml'],
      ['docker compose up -d reads it and creates everything in the background.', '', 'yml>up'],
      ['Each service becomes a container: the web server and the database.', '', 'up>web up>db'],
      ['Compose puts them on a private network where they reach each other by service name.', '', 'web>net db>net'],
      ['A named volume keeps the database files. docker compose down removes containers but keeps volumes unless you add -v.', '', 'db>vol']]);

  A('gitremote', 'Clone, commit, push, pull', ['rm|origin (GitHub)|h|0|2', 'cl|git clone|p|1|0', 'lc|your local repository|f|1|1', 'ps|git push|p|2|0', 'pl|git pull --ff-only|p|2|1', 'tm|teammate commits|u|3|2'],
    'rm>cl cl>lc lc>ps ps>rm tm>rm rm>pl pl>lc', 'cl lc ps pl tm', [
      ['The remote, usually called origin, is a shared copy of the repository.', 'rm'],
      ['git clone copies it to your machine, history and all.', '', 'rm>cl cl>lc'],
      ['You commit locally as often as you like. Nothing is shared yet.', 'lc'],
      ['git push sends your new commits to origin.', '', 'lc>ps ps>rm'],
      ['A teammate pushes too. git fetch downloads without changing your files, git pull --ff-only brings the changes in.', '', 'tm>rm rm>pl pl>lc']]);
})();
