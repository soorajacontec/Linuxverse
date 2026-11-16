/* The last 25 extra diagrams, second views of topics that already have one (see 14-anim-a.js for the helper). */
(function () {
  'use strict';
  var A = window.A;

  A('cron', 'The five cron fields', ['ln|*/15 9-17 * * 1-5 job.sh|u|0|2', 'mi|minute: every 15|k|1|0', 'hr|hour: 9 to 17|k|1|1', 'dy|day, month: any|k|2|0', 'wd|weekday: Mon to Fri|k|2|1', 'rn|job runs when all match|f|3|2'],
    'ln>mi ln>hr ln>dy ln>wd mi>rn hr>rn dy>rn wd>rn', 'mi hr dy wd rn', [
      ['A crontab line has five time fields, then the command: minute, hour, day of month, month, weekday.', 'ln'],
      ['*/15 in the minute field means every 15 minutes.', '', 'ln>mi'],
      ['9-17 limits it to those hours of the day.', '', 'ln>hr'],
      ['Stars mean any day of the month and any month.', '', 'ln>dy'],
      ['1-5 means Monday to Friday.', '', 'ln>wd'],
      ['The job runs whenever all fields match: every 15 minutes during office hours on weekdays.', '', 'mi>rn hr>rn dy>rn wd>rn']]);

  A('kernel', 'modprobe loads dependencies too', ['cm|modprobe vboxdrv|u|0|2', 'dp|read modules.dep|k|1|2', 'd1|load dependency first|p|2|0', 'd2|then load vboxdrv|p|2|1', 'ls|lsmod lists it|f|3|2'],
    'cm>dp dp>d1 d1>d2 d2>ls', 'dp d1 d2 ls', [
      ['A driver is a kernel module. You ask for it by name with modprobe.', 'cm'],
      ['modprobe looks the module up in the dependency map built by depmod.', '', 'cm>dp'],
      ['It first loads any module this one needs.', '', 'dp>d1'],
      ['Then it loads the module itself into the running kernel. No reboot is needed.', '', 'd1>d2'],
      ['lsmod shows it loaded, modinfo describes it, modprobe -r removes it if nothing uses it.', '', 'd2>ls']]);

  A('timers', 'Ways to trigger a timer', ['tm|backup.timer|f|0|2', 'cl|OnCalendar=daily|k|1|0', 'bt|OnBootSec=10min|k|1|1', 'ac|OnUnitActiveSec=1h|k|2|0', 'pe|Persistent=true|k|2|1', 'sv|backup.service runs|p|3|2'],
    'tm>cl tm>bt tm>ac tm>pe cl>sv bt>sv ac>sv pe>sv', 'cl bt ac pe sv', [
      ['One timer unit can use different kinds of triggers.', 'tm'],
      ['OnCalendar fires at wall-clock times, like cron: daily, or a time such as 02:30.', '', 'tm>cl'],
      ['OnBootSec fires a set time after boot.', '', 'tm>bt'],
      ['OnUnitActiveSec repeats a set time after the service last ran.', '', 'tm>ac'],
      ['Persistent=true runs a missed calendar event when the machine is next on.', '', 'tm>pe'],
      ['Whichever triggers, systemd starts the matching service. systemctl list-timers shows the next run.', '', 'cl>sv bt>sv ac>sv pe>sv']]);

  A('mount', 'A mount hides what was underneath', ['fo|/data holds old.txt|f|0|0', 'dk|disk /dev/sdb1|h|0|1', 'mn|mount /dev/sdb1 /data|p|1|2', 'sh|/data now shows the disk|f|2|0', 'um|umount /data|p|2|1', 'bk|old.txt is back|f|3|2'],
    'dk>mn mn>fo mn>sh sh>um um>bk', 'mn sh um bk', [
      ['The folder /data already contains a file, old.txt, on the root disk.', 'fo dk'],
      ['mount attaches the other disk at that folder.', '', 'dk>mn mn>fo'],
      ['Now /data shows the files of the new disk. The old contents are hidden, not deleted.', '', 'mn>sh'],
      ['umount detaches the disk, if nothing is using it.', '', 'sh>um'],
      ['old.txt is visible again. Entries in /etc/fstab make the mount happen at boot.', '', 'um>bk']]);

  A('lvm', 'Growing a volume while it is mounted', ['pv|new disk sdc becomes a PV|h|0|2', 'vg|vgextend adds it to the VG|k|1|2', 'lv|lvextend -r +50G|p|2|0', 'fs|filesystem resized online|f|2|1', 'df|df -h shows more space|u|3|2'],
    'pv>vg vg>lv lv>fs fs>df', 'vg lv fs df', [
      ['The volume group is nearly full, and a new disk has been added.', 'pv'],
      ['pvcreate and vgextend add the disk to the volume group as extra free space.', '', 'pv>vg'],
      ['lvextend gives some of that space to the logical volume. -r also resizes the filesystem.', '', 'vg>lv'],
      ['ext4 and xfs can grow while mounted, so users notice nothing.', '', 'lv>fs'],
      ['df -h shows the larger size. Shrinking is much riskier: back up first.', '', 'fs>df']]);

  A('swap', 'Creating a swap file', ['fa|fallocate -l 2G /swapfile|p|0|2', 'ch|chmod 600 /swapfile|p|1|2', 'mk|mkswap /swapfile|p|2|0', 'on|swapon /swapfile|p|2|1', 'ft|line in /etc/fstab|f|3|2'],
    'fa>ch ch>mk mk>on on>ft', 'ch mk on ft', [
      ['Out of memory, and no free partition? A file can serve as swap. First reserve 2 GB.', 'fa'],
      ['Only root may read it, or memory contents could leak.', '', 'fa>ch'],
      ['mkswap writes the swap signature into the file.', '', 'ch>mk'],
      ['swapon turns it on at once. swapon --show lists it.', '', 'mk>on'],
      ['Add a line to /etc/fstab so it is used after every reboot.', '', 'on>ft']]);

  A('ip', 'Finding a MAC address with ARP', ['a|laptop 192.0.2.25|h|0|0', 'b|printer 192.0.2.40|h|0|1', 'ar|who has 192.0.2.40?|k|1|2', 'rp|I do: MAC 52:54:00:..|k|2|2', 'ch|ARP cache remembers|f|3|2'],
    'a>ar ar>b b>rp rp>a rp>ch', 'ar rp ch', [
      ['On a local network, frames are delivered by MAC address, not IP address.', 'a b'],
      ['The laptop wants to reach 192.0.2.40 and broadcasts an ARP question: who has this address?', '', 'a>ar'],
      ['The broadcast reaches every host on the LAN.', '', 'ar>b'],
      ['The printer answers with its MAC address.', '', 'b>rp rp>a'],
      ['The laptop stores the pair in its neighbour cache for a while. ip neigh shows it.', '', 'rp>ch']]);

  A('dns', 'The recursive lookup chain', ['cl|your resolver|u|0|2', 'rt|root: ask .com servers|h|1|0', 'tl|.com: ask example|h|1|1', 'au|example.com\'s own server|h|2|2', 'an|answer 203.0.113.10, cached|f|3|2'],
    'cl>rt rt>cl cl>tl tl>cl cl>au au>an', 'rt tl au an', [
      ['Your resolver is asked for example.com and does not know it yet.', 'cl'],
      ['It asks a root server, which does not know the address but points to the .com servers.', '', 'cl>rt rt>cl'],
      ['A .com server does not know either but points to the servers of example.com.', '', 'cl>tl tl>cl'],
      ['That authoritative server finally knows the answer.', '', 'cl>au'],
      ['The answer is returned and cached for its TTL, so the next lookup is instant.', '', 'au>an']]);

  A('conn', 'How traceroute works', ['me|your machine|u|0|2', 'r1|router 1|h|1|0', 'r2|router 2|h|1|1', 'r3|router 3|h|2|0', 'ds|destination|h|2|1', 'rs|list of hops|f|3|2'],
    'me>r1 r1>r2 r2>r3 r3>ds ds>rs', 'r1 r2 r3 ds rs', [
      ['Every packet has a TTL (time to live) that each router lowers by one. At zero the router drops it and reports back.', 'me'],
      ['traceroute sends a packet with TTL 1. Router 1 drops it and replies: time exceeded.', '', 'me>r1'],
      ['TTL 2 gets past router 1 and expires at router 2.', '', 'r1>r2'],
      ['TTL 3 reaches router 3, and so on.', '', 'r2>r3'],
      ['Finally a packet reaches the destination, which answers normally.', '', 'r3>ds'],
      ['Each reply reveals one hop and its delay. mtr repeats this continuously.', '', 'ds>rs']]);

  A('transfer', 'First copy versus repeat copy', ['sr|source folder|f|0|0', 'sc|scp: always everything|p|0|1', 'r1|rsync first run: everything|p|1|2', 'r2|rsync next run: changes only|p|2|2', 'ds|destination|f|3|2'],
    'sr>sc sr>r1 r1>r2 r2>ds sc>ds', 'sc r1 r2 ds', [
      ['You want a folder on another machine, kept in sync.', 'sr'],
      ['scp copies every file every time. Fine for one-off copies.', '', 'sr>sc'],
      ['rsync\'s first run also sends everything.', '', 'sr>r1'],
      ['Later runs send only new and changed files, so they are much faster.', '', 'r1>r2'],
      ['Both use SSH for security. Add -a to keep attributes, -z for slow links, and --dry-run to rehearse.', '', 'r2>ds sc>ds']]);

  A('webserver', 'Life of an HTTP request', ['br|browser|u|0|2', 'dn|DNS: name to address|p|1|0', 'tp|TCP + TLS connection|k|1|1', 'ng|nginx :443|p|2|0', 'fl|/var/www/index.html|f|2|1', 'lg|access.log line|f|3|2'],
    'br>dn dn>tp tp>ng ng>fl fl>br ng>lg', 'dn tp ng fl lg', [
      ['You type a web address. The browser needs the server\'s IP address.', 'br'],
      ['A DNS lookup turns the name into an address.', '', 'br>dn'],
      ['The browser opens a TCP connection and negotiates TLS for HTTPS.', '', 'dn>tp'],
      ['nginx receives the request GET /.', '', 'tp>ng'],
      ['It reads the file from the site folder and sends it back with status 200.', '', 'ng>fl fl>br'],
      ['Every request is written to the access log with its status code.', '', 'ng>lg']]);

  A('tunnels', 'A reverse tunnel with -R', ['lp|laptop :3000 (NAT)|h|0|0', 'ss|ssh -R 9000:localhost:3000|p|0|1', 'sv|public server :9000|h|1|2', 'ou|friend opens server:9000|u|2|2', 'rs|reaches your laptop service|f|3|2'],
    'lp>ss ss>sv ou>sv sv>lp lp>rs', 'ss sv ou rs', [
      ['Your laptop runs a service on port 3000, but it is behind a router that blocks incoming connections.', 'lp'],
      ['From the laptop, ssh -R opens an outbound connection to a public server and asks it to listen on port 9000.', '', 'lp>ss ss>sv'],
      ['A friend connects to the server on port 9000.', '', 'ou>sv'],
      ['The server forwards the traffic back through the SSH connection to your laptop.', '', 'sv>lp'],
      ['They reach your service. Only expose what you intend to share.', '', 'lp>rs']]);

  A('nginxproxy', 'Load balancing with upstream', ['cl|clients|u|0|2', 'ng|nginx upstream pool|p|1|2', 'a1|app server 1|p|2|0', 'a2|app server 2|p|2|1', 'dn|server 2 down: skipped|h|3|2'],
    'cl>ng ng>a1 ng>a2 a2>dn', 'a1 a2 dn', [
      ['Many clients send requests to one nginx address.', '', 'cl>ng'],
      ['An upstream block lists several app servers behind it.', 'ng'],
      ['By default requests are shared round robin: the first goes to server 1.', '', 'ng>a1'],
      ['The second goes to server 2, and so on in turn.', '', 'ng>a2'],
      ['If a server stops answering, nginx marks it failed and sends requests to the others. You can add servers without clients noticing.', '', 'a2>dn']]);

  A('ssh', 'Key authentication', ['cl|client: private key|u|0|0', 'sv|server: authorized_keys|h|0|1', 'ch|server sends a random challenge|k|1|2', 'sg|client signs it with the private key|p|2|2', 'ok|server verifies with public key: in|f|3|2'],
    'cl>sv sv>ch ch>cl cl>sg sg>sv sv>ok', 'ch sg ok', [
      ['You put your public key in ~/.ssh/authorized_keys on the server. The private key never leaves your machine.', 'cl sv'],
      ['You connect. The server picks a random challenge for this session.', '', 'cl>sv sv>ch'],
      ['The challenge is sent to the client.', '', 'ch>cl'],
      ['Your client signs it with the private key. No password crosses the network.', '', 'cl>sg'],
      ['The server checks the signature with your public key and lets you in.', '', 'sg>sv sv>ok']]);

  A('firewall', 'Rules are checked in order', ['pk|incoming packet|u|0|2', 'r1|rule 1: allow ssh|k|1|0', 'r2|rule 2: allow web|k|1|1', 'df|default: drop|k|2|2', 'ac|accepted|f|3|0', 'dr|dropped|h|3|1'],
    'pk>r1 r1>r2 r2>df r1>ac r2>ac df>dr', 'r1 r2 df ac dr', [
      ['A packet arrives. The firewall tests it against its rules from the top.', 'pk'],
      ['Rule 1 allows port 22. A packet to port 22 matches and is accepted at once.', '', 'pk>r1 r1>ac'],
      ['Otherwise it moves on to rule 2, which allows ports 80 and 443.', '', 'r1>r2 r2>ac'],
      ['A packet that matches nothing reaches the default policy.', '', 'r2>df'],
      ['A good default is drop. Order matters: the first matching rule wins.', '', 'df>dr']]);

  A('checksums', 'Verifying a download', ['dl|download tool.iso|f|0|0', 'sm|SHA256SUMS + signature|f|0|1', 'sc|sha256sum -c|p|1|2', 'gp|gpg --verify|p|2|2', 'ok|trusted file|f|3|2'],
    'dl>sc sm>sc sm>gp sc>ok gp>ok', 'sc gp ok', [
      ['Download the file and the publisher\'s checksum list.', 'dl sm'],
      ['sha256sum -c recalculates the checksum and compares it. A mismatch means a corrupt or altered file.', '', 'dl>sc sm>sc'],
      ['But a checksum on the same website only proves the download is intact, not who made it.', 'sm'],
      ['gpg --verify checks the signature on the list with the publisher\'s public key.', '', 'sm>gp'],
      ['Both checks pass: complete and genuine. Only then install it.', '', 'sc>ok gp>ok']]);

  A('hardening', 'Defence in depth', ['in|attacker|u|0|2', 'fw|firewall: only needed ports|k|1|2', 'ky|SSH keys only, no root login|k|2|2', 'up|auto security updates|k|3|0', 'lp|least privilege, logs|k|3|1'],
    'in>fw fw>ky ky>up ky>lp', 'fw ky up lp', [
      ['No single measure is enough. You stack several, so one failure does not mean a break-in.', 'in'],
      ['The firewall exposes only the ports you really serve.', '', 'in>fw'],
      ['SSH accepts keys only, and root cannot log in directly. fail2ban slows guessers.', '', 'fw>ky'],
      ['Security updates are applied automatically, closing known holes quickly.', '', 'ky>up'],
      ['Services run as limited users, and logs are watched, so a breach is small and noticed.', '', 'ky>lp']]);

  A('tls', 'The certificate chain', ['lf|server certificate: example.com|f|0|2', 'im|intermediate CA|f|1|2', 'rt|root CA in your trust store|k|2|2', 'br|browser checks signatures|u|3|2'],
    'lf>im im>rt br>lf br>rt', 'lf im rt br', [
      ['The server presents a certificate for its name. It is signed, not self-declared.', 'lf'],
      ['The certificate was signed by an intermediate CA, whose certificate the server also sends.', '', 'lf>im'],
      ['The intermediate was in turn signed by a root CA.', '', 'im>rt'],
      ['Your system already trusts a list of root CAs, shipped with the operating system or browser.', 'rt'],
      ['The browser follows the chain back to a trusted root and checks names and dates. Any broken link means a warning.', '', 'br>lf br>rt']]);

  A('exitcodes', 'Exit status of a pipeline', ['p1|grep error app.log (fails)|p|0|0', 'p2|sort|p|0|1', 'p3|head -n 3|p|1|2', 'rs|$? = status of the last|k|2|2', 'pf|set -o pipefail: the failure shows|f|3|2'],
    'p1>p2 p2>p3 p3>rs rs>pf', 'rs pf', [
      ['A pipeline joins several commands. Here the first one, grep, finds nothing and fails.', 'p1'],
      ['Its output still flows into sort.', '', 'p1>p2'],
      ['The output still flows on into head.', '', 'p2>p3'],
      ['By default $? is the exit code of the last command only: 0, success. The failure is hidden!', '', 'p3>rs'],
      ['set -o pipefail makes the pipeline fail if any stage fails. PIPESTATUS lists every stage\'s code.', '', 'rs>pf']]);

  A('loops', 'while read: processing a file line by line', ['fl|names.txt|f|0|2', 'wr|while read -r line|p|1|2', 'bd|do echo "Hi $line"|p|2|0', 'nx|next line|k|2|1', 'en|end of file: loop stops|f|3|2'],
    'fl>wr wr>bd bd>nx nx>wr nx>en', 'bd nx en', [
      ['You want to handle every line of a file.', 'fl'],
      ['while read -r line < names.txt reads one line into the variable.', '', 'fl>wr'],
      ['The body runs once for that line.', '', 'wr>bd'],
      ['Then read fetches the next line.', '', 'bd>nx nx>wr'],
      ['At end of file read fails, so the loop ends. -r keeps backslashes intact; this beats for x in $(cat file).', '', 'nx>en']]);

  A('envvars', 'Which startup file runs?', ['lg|login shell (ssh, console)|u|0|2', 'pf|/etc/profile|f|1|0', 'pp|~/.profile or ~/.bash_profile|f|1|1', 'rc|~/.bashrc|f|2|2', 'nl|new terminal window|u|3|2'],
    'lg>pf pf>pp pp>rc nl>rc', 'pf pp rc nl', [
      ['What a shell reads when it starts depends on how it was started.', 'lg'],
      ['A login shell first reads the system-wide /etc/profile.', '', 'lg>pf'],
      ['Then your own ~/.profile (or ~/.bash_profile).', '', 'pf>pp'],
      ['That file normally loads ~/.bashrc, where aliases and settings live.', '', 'pp>rc'],
      ['A new terminal window on a desktop is a non-login shell: it reads only ~/.bashrc.', '', 'nl>rc']]);

  A('git', 'The commit graph', ['a|A first commit|f|0|2', 'b|B second commit|f|1|2', 'c|C third commit, HEAD|f|2|2', 'br|branch main points to C|k|3|2'],
    'a>b b>c c>br', 'b c br', [
      ['A commit is a snapshot of the whole project plus a message and the author.', 'a'],
      ['Each commit remembers its parent, so history forms a chain.', '', 'a>b'],
      ['The next commit points back to B.', '', 'b>c'],
      ['A branch is just a movable label that points at a commit. HEAD says which branch you are on.', '', 'c>br'],
      ['Because commits are snapshots with parents, you can compare, branch from or return to any of them.', 'a b c']]);

  A('docker', 'Layers of an image', ['l1|base layer: alpine|f|0|2', 'l2|layer: nginx installed|f|1|2', 'l3|layer: your site files|f|2|2', 'ct|container: write layer|p|3|0', 'vo|volume: kept outside|f|3|1'],
    'l1>l2 l2>l3 l3>ct ct>vo', 'l2 l3 ct vo', [
      ['A Docker image is built from layers, each one a set of file changes.', 'l1'],
      ['Each Dockerfile instruction adds a layer on top. Unchanged layers are cached and shared.', '', 'l1>l2'],
      ['Your own files go on top.', '', 'l2>l3'],
      ['Running an image adds a thin writable layer for that one container. The image layers stay read-only.', '', 'l3>ct'],
      ['Delete the container and its writable layer is gone. Data that must survive belongs in a volume.', '', 'ct>vo']]);

  A('tmux', 'Detach and reattach', ['sv|tmux server keeps the session|k|0|2', 'cl|your terminal (client)|u|1|0', 'jb|long job inside|p|1|1', 'dr|connection drops|h|2|0', 'ra|tmux attach|p|2|1', 'bk|job still running|f|3|2'],
    'cl>sv sv>jb dr>cl ra>sv sv>bk', 'dr ra bk', [
      ['tmux runs as a server on the machine. Your terminal is only a client attached to a session.', 'sv'],
      ['A long job runs inside the session, not inside your terminal.', '', 'cl>sv sv>jb'],
      ['Your connection drops, or you press Ctrl+B then D to detach. Only the client goes away.', '', 'dr>cl'],
      ['Log in again and run tmux attach.', '', 'ra>sv'],
      ['Your windows and the job are exactly as you left them, still running.', '', 'sv>bk']]);

  A('gitbranch', 'merge versus rebase', ['mn|main: A - B - E|f|0|0', 'ft|feature: A - B - C - D|f|0|1', 'mg|merge: adds a merge commit|p|1|2', 'rb|rebase: replays C and D on E|p|2|0', 'ln|straight history|f|3|2'],
    'mn>mg ft>mg mn>rb ft>rb rb>ln', 'mg rb ln', [
      ['Main moved on while you worked on a feature branch. Now they have diverged.', 'mn ft'],
      ['merge combines the two lines with a new merge commit. History shows exactly what happened, branches and all.', '', 'mn>mg ft>mg'],
      ['rebase instead takes your commits and replays them on top of the latest main.', '', 'mn>rb ft>rb'],
      ['The result is a single straight line, easier to read.', '', 'rb>ln'],
      ['Rebase rewrites commits, so never rebase branches that other people have already pulled.', 'rb']]);
})();
