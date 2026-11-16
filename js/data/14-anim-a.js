/* Animation helper and the first 25 new diagrams.
   A(topic, title, nodes, edges, hide, steps) expands a compact description into the engine's spec:
     nodes  'id|Label|kind|row|col'   kind u user, p process, k kernel, f file, h hardware; row 0-3; col 0 left, 1 right, 2 centre
     edges  'a>b b>c'                 steps  [caption, 'hi ids', 'a>b b>c' flow]  (hi defaults to the flow end points)
     hide   'ids' shown automatically the first time a step uses them.
   Topics without a diagram get this one as their Visual tab; topics that have one get it as an extra diagram. */
(function () {
  'use strict';
  var KIND = { u: 'user', p: 'proc', k: 'kernel', f: 'file', h: 'hw' }, XS = [90, 270, 180];
  function words(s) { return String(s || '').split(' ').filter(Boolean); }
  LV.addAnim = function (topic, spec) {
    var t = LV.topics[topic];
    if (!t) return;
    if (!t.anim) t.anim = spec; else (t.anims = t.anims || []).push(spec);
  };
  window.A = function (topic, title, nodes, edges, hide, steps) {
    var spec = { title: title, nodes: [], edges: words(edges).map(function (e) { return e.split('>'); }), hide: words(hide), steps: [] };
    nodes.forEach(function (n) { var p = n.split('|'); spec.nodes.push([p[0], XS[+p[4]], 40 + (+p[3]) * 80, p[1], KIND[p[2]]]); });
    var hidden = {}, seen = {};
    spec.hide.forEach(function (h) { hidden[h] = 1; });
    steps.forEach(function (s) {
      var flow = words(s[2]).map(function (f) { return f.split('>'); }), hi = words(s[1]);
      if (!hi.length) flow.forEach(function (f) { f.forEach(function (x) { if (hi.indexOf(x) < 0) hi.push(x); }); });
      hi.forEach(function (x) { seen[x] = 1; });
      flow.forEach(function (f) { f.forEach(function (x) { seen[x] = 1; }); });
      spec.steps.push({ t: s[0], hi: hi, show: Object.keys(hidden).filter(function (x) { return seen[x]; }), flow: flow });
    });
    LV.addAnim(topic, spec);
  };
  var A = window.A;

  A('help', 'Finding the right command', ['you|You need to copy files|u|0|2', 'ap|apropos copy|p|1|0', 'man|man cp|p|1|1', 'hp|cp --help|p|2|0', 'tl|tldr cp|p|2|1', 'ok|Now you know|f|3|2'],
    'you>ap you>man you>hp you>tl ap>man man>ok hp>ok tl>ok', 'ap man hp tl ok', [
      ['You know what you want, copying files, but not the command name.', 'you'],
      ['apropos copy searches the title and description of every manual page.', '', 'you>ap'],
      ['The results name cp. man cp opens the full manual: / searches, n jumps to the next match, q quits.', '', 'ap>man'],
      ['cp --help prints a short summary right in the terminal, handy as a quick reminder.', '', 'you>hp'],
      ['tldr cp shows a few practical examples if the tldr package is installed.', '', 'you>tl'],
      ['Now you know the command and its options. Type it and try it.', '', 'man>ok hp>ok tl>ok']]);

  A('locating', 'Four ways to find things', ['q|Where is nginx?|u|0|2', 'w|which / type|p|1|0', 'wh|whereis|p|1|1', 'lo|locate (database)|p|2|0', 'fi|find (live scan)|p|2|1', 'res|the path|f|3|2'],
    'q>w q>wh q>lo q>fi w>res wh>res lo>res fi>res', 'w wh lo fi res', [
      ['You want to know where a program or a file lives.', 'q'],
      ['which and type search the folders in $PATH and answer instantly. type also knows aliases and built-ins.', '', 'q>w w>res'],
      ['whereis finds the program, its source and its manual page in standard places.', '', 'q>wh wh>res'],
      ['locate searches a prebuilt database. It is very fast, but stale until updatedb runs.', '', 'q>lo lo>res'],
      ['find walks the real disk, so it is always current but slower. Pick the lightest tool that works.', '', 'q>fi fi>res']]);

  A('fstypes', 'From raw disk to files', ['disk|Disk /dev/sdb|h|0|2', 'part|partition sdb1|f|1|2', 'mk|mkfs.ext4|p|2|0', 'fs|ext4 filesystem|f|2|1', 'mnt|mount /data|p|3|0', 'use|files to use|u|3|1'],
    'disk>part part>mk mk>fs fs>mnt mnt>use', 'part mk fs mnt use', [
      ['A new disk is just raw blocks. Nothing can store files on it yet.', 'disk'],
      ['Partition it with fdisk or parted: sdb1 marks off an area of the disk.', '', 'disk>part'],
      ['mkfs.ext4 writes the filesystem structures: inode tables, a journal and the root folder. This erases the partition.', '', 'part>mk mk>fs'],
      ['mount attaches the filesystem to a folder such as /data.', '', 'fs>mnt'],
      ['Programs now see ordinary files under /data. df -T shows the filesystem type.', '', 'mnt>use']]);

  A('fileattr', 'The immutable flag', ['root|root: rm file|u|0|0', 'ker|kernel checks|k|0|1', 'fl|file with +i|f|1|2', 'den|Operation not permitted|h|2|0', 'fix|chattr -i file|p|2|1', 'gone|file deleted|f|3|2'],
    'root>ker ker>fl ker>den fix>fl fl>gone', 'den fix gone', [
      ['Root tries to delete a file. Ordinary permissions would allow it.', 'root ker', 'root>ker'],
      ['Before acting, the kernel also checks the file attributes (lsattr shows them).', '', 'ker>fl'],
      ['The immutable flag +i is set: nobody can change, rename or delete the file, not even root.', 'fl ker', 'ker>den'],
      ['To change the file, clear the flag first with sudo chattr -i file.', '', 'fix>fl'],
      ['Now the same delete succeeds. Use +i for files that must never change.', '', 'root>ker fl>gone']]);

  A('users', 'Who may open the file?', ['alex|alex (uid 1001)|u|0|0', 'bob|bob (in group dev)|u|0|1', 'fl|notes.txt alex:dev 664|f|1|2', 'own|owner bits rw-|k|2|0', 'grp|group bits rw-|k|2|1', 'oth|others bits r--|k|3|2'],
    'alex>fl bob>fl fl>own fl>grp fl>oth', 'own grp oth', [
      ['Every user has a user ID and belongs to one or more groups. id alex shows them.', 'alex bob'],
      ['A file has one owner and one group. notes.txt belongs to alex and the group dev.', 'fl'],
      ['When alex opens it, the kernel sees he is the owner and applies the owner bits: read and write.', '', 'alex>fl fl>own'],
      ['bob is not the owner but is in group dev, so the group bits apply: read and write.', '', 'bob>fl fl>grp'],
      ['Anyone else falls to others: read only. Only the first matching class is used.', '', 'fl>oth']]);

  A('specialperms', 'How setuid lets passwd work', ['usr|ssk runs passwd|u|0|0', 'bin|/usr/bin/passwd|f|0|1', 'prc|process runs as root|p|1|2', 'sh|/etc/shadow|f|2|0', 'chg|password updated|f|2|1', 'dn|Permission denied|h|3|2'],
    'usr>bin bin>prc prc>sh sh>chg usr>dn', 'prc sh chg dn', [
      ['ssk runs passwd. The program file has the setuid bit, shown as s in rws.', '', 'usr>bin'],
      ['Because of setuid, the new process gets the rights of the file owner: root, not ssk.', '', 'bin>prc'],
      ['As root it may write /etc/shadow, which normal users cannot touch.', '', 'prc>sh'],
      ['It changes only ssk\'s own line and exits. The extra power lasts for this one program.', '', 'sh>chg'],
      ['If ssk edits /etc/shadow directly, it is refused. That is why setuid programs must be small and trusted.', '', 'usr>dn']]);

  A('accountfiles', 'What happens at login', ['login|login: alex|u|0|2', 'pw|/etc/passwd|f|1|0', 'sh|/etc/shadow|f|1|1', 'gr|/etc/group|f|2|0', 'ses|shell session|p|2|1', 'home|/home/alex|f|3|2'],
    'login>pw login>sh pw>gr pw>ses ses>home', 'pw sh gr ses home', [
      ['alex logs in. The system needs to learn who this is.', 'login'],
      ['/etc/passwd maps the name to a user ID, a home folder and a shell. Anyone may read it.', '', 'login>pw'],
      ['/etc/shadow holds the password hash, readable by root only. The typed password is hashed and compared.', '', 'login>sh'],
      ['/etc/group lists the groups alex belongs to.', '', 'pw>gr'],
      ['A shell starts as alex, in /home/alex, with those groups.', '', 'pw>ses ses>home']]);

  A('sedawk', 'A text-processing pipeline', ['in|access.log|f|0|0', 'sed|sed s/GET/get/|p|0|1', 'awk|awk print $1|p|1|0', 'srt|sort | uniq -c|p|1|1', 'out|ranked result|f|2|2'],
    'in>sed sed>awk awk>srt srt>out', 'sed awk srt out', [
      ['Text arrives as a stream of lines, one visit per line.', 'in'],
      ['sed edits each line as it passes, here rewriting text with s/old/new/.', '', 'in>sed'],
      ['awk splits each line into fields and prints just the one you want, $1 is the first column.', '', 'sed>awk'],
      ['sort and uniq -c group equal lines and count them.', '', 'awk>srt'],
      ['Each tool does one small job and the pipe joins them into a report.', '', 'srt>out']]);

  A('find', 'How find walks a tree', ['st|find ~/site -name *.log|u|0|2', 'walk|walk every folder|p|1|0', 'tst|test each item|k|1|1', 'hit|matching paths|f|2|0', 'act|-exec / xargs|p|2|1', 'dn|action per match|f|3|2'],
    'st>walk walk>tst tst>hit hit>act act>dn', 'walk tst hit act dn', [
      ['find starts at the folder you give it.', 'st'],
      ['It walks down through every sub-folder, one item at a time.', '', 'st>walk'],
      ['Each item is tested against your conditions: name, type, size, age.', '', 'walk>tst'],
      ['Items that pass all tests are printed or collected.', '', 'tst>hit'],
      ['An action such as -exec or a pipe to xargs runs on every match. Quote patterns like "*.log".', '', 'hit>act act>dn']]);

  A('diffpatch', 'Share a change with diff and patch', ['old|old.conf|f|0|0', 'new|new.conf|f|0|1', 'df|diff -u|p|1|2', 'pt|change.patch|f|2|2', 'ap|patch < change.patch|p|3|0', 'res|updated file|f|3|1'],
    'old>df new>df df>pt pt>ap ap>res', 'pt ap res', [
      ['You have an old version and a new version of a file.', 'old new'],
      ['diff -u compares them line by line and lists only what changed.', '', 'old>df new>df'],
      ['The result is a small patch file: lines marked - are removed, lines marked + are added.', '', 'df>pt'],
      ['Send the patch to someone who still has the old file. They run patch.', '', 'pt>ap'],
      ['patch applies the same edits, giving them the new version.', '', 'ap>res']]);

  A('xargs', 'xargs builds commands from a list', ['pr|find . -name *.tmp|p|0|2', 'ls|list of names|f|1|2', 'xa|xargs -n 2|p|2|2', 'b1|rm a.tmp b.tmp|p|3|0', 'b2|rm c.tmp d.tmp|p|3|1'],
    'pr>ls ls>xa xa>b1 xa>b2', 'b1 b2', [
      ['find prints a list of names, one per line.', 'pr ls', 'pr>ls'],
      ['A pipe hands that list to xargs on its standard input.', '', 'ls>xa'],
      ['xargs does not run one command per name. It builds argument lists: -n 2 means two names each.', 'xa'],
      ['First batch: rm a.tmp b.tmp.', '', 'xa>b1'],
      ['Second batch: rm c.tmp d.tmp. Use find -print0 with xargs -0 for names that contain spaces.', '', 'xa>b2']]);

  A('jq', 'Reading JSON with jq', ['in|JSON from an API|f|0|2', 'flt|jq filter|p|1|2', 'arr|.pages[]|p|2|0', 'fld|.name|p|2|1', 'out|"home" "labs"|f|3|2'],
    'in>flt flt>arr arr>fld fld>out', 'arr fld out', [
      ['An API returns JSON on one long line. It is hard to read.', 'in'],
      ['jq reads it and applies a filter written as a small path.', '', 'in>flt'],
      ['.pages[] steps into the array and produces each element in turn.', '', 'flt>arr'],
      ['.name picks one field from each element.', '', 'arr>fld'],
      ['The result is printed, pretty or raw (-r). Filters chain with | just like the shell.', '', 'fld>out']]);

  A('sedinplace', 'Editing a file in place', ['f|config.txt|f|0|0', 'cmd|sed -i.bak s/80/8080/|p|0|1', 'tmp|edited copy|f|1|2', 'bak|config.txt.bak|f|2|0', 'new|config.txt updated|f|2|1'],
    'f>cmd cmd>tmp cmd>bak tmp>new', 'tmp bak new', [
      ['You want to change a value in a file without opening an editor.', 'f'],
      ['sed -i.bak reads the file and applies the substitution to every line.', '', 'f>cmd'],
      ['With the .bak suffix it first saves the original as a backup.', '', 'cmd>bak'],
      ['The edited text is written out as a new copy.', '', 'cmd>tmp'],
      ['The copy replaces config.txt. Run without -i first to preview the change.', '', 'tmp>new']]);

  A('awkprog', 'The three parts of an awk program', ['beg|BEGIN: runs once|p|0|2', 'rd|read next line|k|1|0', 'act|pattern { action }|p|1|1', 'end|END: runs once|p|2|2', 'out|total printed|f|3|2'],
    'beg>rd rd>act act>rd act>end end>out', 'out', [
      ['BEGIN runs once, before any input. Good for headings or setting a separator.', 'beg'],
      ['awk reads a line and splits it into fields $1, $2, ... and $NF for the last.', '', 'beg>rd'],
      ['If the pattern matches, the action runs for that line, for example sum += $3.', '', 'rd>act'],
      ['Then it loops back and reads the next line until the file ends.', '', 'act>rd'],
      ['END runs once at the end: here you print the total.', '', 'act>end end>out']]);

  A('columns', 'Slicing and joining columns', ['f1|names.txt|f|0|0', 'f2|ages.txt|f|0|1', 'ps|paste|p|1|2', 'col|column -t|p|2|2', 'out|aligned table|f|3|2'],
    'f1>ps f2>ps ps>col col>out', 'col out', [
      ['Two files hold related columns of data.', 'f1 f2'],
      ['paste glues them side by side, line by line, with a tab between.', '', 'f1>ps f2>ps'],
      ['cut -f1 would pull a single column back out; join merges files on a shared key.', 'ps'],
      ['column -t aligns the messy output into tidy columns.', '', 'ps>col'],
      ['A readable table. Use awk when columns are separated by variable spaces.', '', 'col>out']]);

  A('viewing', 'Following a growing log', ['app|app writes a log line|p|0|2', 'log|app.log grows|f|1|2', 'tf|tail -f app.log|p|2|0', 'ls|less (scroll back)|p|2|1', 'you|you watch live|u|3|2'],
    'app>log log>tf log>ls tf>you ls>you', 'tf ls you', [
      ['A program keeps appending lines to its log file.', '', 'app>log'],
      ['tail -f opens the file and keeps it open, waiting for more.', '', 'log>tf'],
      ['Each new line appears on your screen the moment it is written.', '', 'tf>you'],
      ['less lets you scroll and search the same file; press F inside it to follow like tail.', '', 'log>ls ls>you'],
      ['Use tail -F to keep following even when the log is rotated.', 'tf']]);

  A('resources', 'Where does the slowdown come from?', ['app|slow machine|u|0|2', 'cpu|CPU: top, uptime|p|1|0', 'mem|memory: free -h|p|1|1', 'dsk|disk: df, iostat|p|2|0', 'net|network: ss, ping|p|2|1', 'fix|find the process|f|3|2'],
    'app>cpu app>mem app>dsk app>net cpu>fix mem>fix dsk>fix net>fix', 'cpu mem dsk net fix', [
      ['Something is slow. First decide which resource is the bottleneck.', 'app'],
      ['CPU: a high load average or one process at 100 percent in top.', '', 'app>cpu'],
      ['Memory: little available and heavy swap use in free -h.', '', 'app>mem'],
      ['Disk: a full filesystem in df, or programs waiting for I/O in iostat.', '', 'app>dsk'],
      ['Network: slow or lost packets in ping, many connections in ss.', '', 'app>net'],
      ['Once you know the resource, sort by it to find the process responsible.', '', 'cpu>fix mem>fix dsk>fix net>fix']]);

  A('sysinfo', 'Introduce an unknown machine', ['box|unknown server|u|0|2', 'un|uname -a: kernel|p|1|0', 'os|os-release: distro|p|1|1', 'cp|lscpu, nproc: CPU|p|2|0', 'mm|free -h: memory|p|2|1', 'rep|a bug report that helps|f|3|2'],
    'box>un box>os box>cp box>mm un>rep os>rep cp>rep mm>rep', 'un os cp mm rep', [
      ['You land on a machine you do not know. Four commands tell you what it is.', 'box'],
      ['uname -a shows the kernel version and architecture.', '', 'box>un'],
      ['cat /etc/os-release names the distribution and release.', '', 'box>os'],
      ['lscpu and nproc show the processor and core count.', '', 'box>cp'],
      ['free -h shows memory and swap.', '', 'box>mm'],
      ['Paste these into a bug report or help request and people can actually help you.', '', 'un>rep os>rep cp>rep mm>rep']]);

  A('debugprocs', 'Watching a program talk to the kernel', ['prg|program fails silently|p|0|2', 'st|strace -p PID|p|1|0', 'ker|kernel (system calls)|k|1|1', 'lf|lsof -p PID|p|2|0', 'clue|openat(...) = -1 ENOENT|f|3|2'],
    'prg>ker st>ker lf>ker ker>clue', 'st ker lf clue', [
      ['A program fails with no useful message. We need to see what it is trying to do.', 'prg'],
      ['Programs ask the kernel for everything through system calls: open, read, write, connect.', '', 'prg>ker'],
      ['strace listens in and prints every system call with its result.', '', 'st>ker'],
      ['lsof lists the files, sockets and ports the process has open right now.', '', 'lf>ker'],
      ['A line such as openat(...) = -1 ENOENT reveals the missing file. That is the bug.', '', 'ker>clue']]);

  A('monitor', 'Reading top', ['top|top header|u|0|2', 'ld|load average|p|1|0', 'cpu|CPU us / sy / wa|p|1|1', 'mm|memory and swap|p|2|0', 'pr|process list|p|2|1', 'ac|act: nice, kill, fix|f|3|2'],
    'top>ld top>cpu top>mm top>pr pr>ac', 'ld cpu mm pr ac', [
      ['top shows the state of the whole machine at the top, then the processes below.', 'top'],
      ['Load average: programs running or waiting, over 1, 5 and 15 minutes. Compare with the core count.', '', 'top>ld'],
      ['CPU line: us is your programs, sy the kernel, wa time waiting for the disk.', '', 'top>cpu'],
      ['Memory and swap: heavy swap use means memory is short.', '', 'top>mm'],
      ['The process list: press P to sort by CPU, M by memory.', '', 'top>pr'],
      ['Then act on the culprit: renice it, restart it or kill it.', '', 'pr>ac']]);

  A('ulimit', 'Hitting the open-files limit', ['app|server accepts clients|p|0|2', 'fd|each client = 1 file descriptor|f|1|2', 'lim|limit 1024 (ulimit -n)|k|2|0', 'err|Too many open files|h|2|1', 'fix|raise the limit|p|3|2'],
    'app>fd fd>lim lim>err err>fix', 'lim err fix', [
      ['A server accepts clients. Every connection and every open file uses one file descriptor.', '', 'app>fd'],
      ['The kernel limits how many one process may hold. ulimit -n shows it, often 1024.', '', 'fd>lim'],
      ['When the 1025th client connects, the call fails with EMFILE: Too many open files.', '', 'lim>err'],
      ['Raise the limit in limits.conf, or LimitNOFILE= in the service\'s unit file.', '', 'err>fix'],
      ['Restart the service. For daemons the unit file matters, not limits.conf.', 'fix']]);

  A('universal', 'Why sandboxed packages exist', ['dev|app developer|u|0|0', 'pkg|one package with libraries|f|0|1', 'sb|sandbox|k|1|2', 'ds1|Ubuntu|h|2|0', 'ds2|Fedora|h|2|1', 'usr|same app everywhere|u|3|2'],
    'dev>pkg pkg>sb sb>ds1 sb>ds2 ds1>usr ds2>usr', 'sb ds1 ds2 usr', [
      ['A developer builds an app once and bundles the libraries it needs.', '', 'dev>pkg'],
      ['The package runs inside a sandbox, isolated from the rest of the system.', '', 'pkg>sb'],
      ['It installs on Ubuntu the same way as on Fedora.', '', 'sb>ds1 sb>ds2'],
      ['The user gets the same version of the app on any distribution, updated independently.', '', 'ds1>usr ds2>usr'],
      ['The cost: bigger downloads and extra disk use. The sandbox limits what the app can see.', 'sb']]);

  A('flatpak', 'Installing a Flatpak app', ['hub|Flathub repository|h|0|0', 'inst|flatpak install|p|0|1', 'rt|shared runtime|f|1|0', 'app|the app|f|1|1', 'prt|portals: files, camera|k|2|2', 'run|flatpak run|u|3|2'],
    'hub>inst inst>rt inst>app app>prt prt>run', 'rt app prt run', [
      ['Flathub is the main store of Flatpak apps. Add it once as a remote.', 'hub'],
      ['flatpak install downloads the app from the remote.', '', 'hub>inst'],
      ['A runtime holds the shared libraries. Many apps reuse it, saving space.', '', 'inst>rt inst>app'],
      ['The app runs in a sandbox. It reaches your files or camera only through permission portals.', '', 'app>prt'],
      ['flatpak run starts it. flatpak update upgrades apps and runtimes.', '', 'prt>run']]);

  A('logrotate', 'A log\'s life with logrotate', ['lg|app.log grows|f|0|2', 'tm|daily timer|k|1|0', 'lr|logrotate|p|1|1', 'o1|app.log.1 (renamed)|f|2|0', 'o2|app.log.2.gz|f|2|1', 'dl|oldest deleted|h|3|2'],
    'lg>lr tm>lr lr>o1 o1>o2 o2>dl', 'o1 o2 dl', [
      ['A busy service keeps appending to its log, which would grow forever.', 'lg'],
      ['A daily timer starts logrotate, which reads the rules in /etc/logrotate.d.', '', 'tm>lr lg>lr'],
      ['It renames the current log to app.log.1 and starts a fresh app.log.', '', 'lr>o1'],
      ['Older copies are compressed: app.log.2.gz, app.log.3.gz.', '', 'o1>o2'],
      ['When more copies exist than the rule allows, the oldest is deleted. Test rules with logrotate -d.', '', 'o2>dl']]);

  A('timesync', 'How NTP corrects the clock', ['cl|your clock 2 s fast|h|0|0', 'ntp|time daemon|p|0|1', 'sv|NTP servers|h|1|2', 'of|offset measured|k|2|0', 'sl|clock slowed gently|p|2|1', 'rtc|saved to hardware clock|f|3|2'],
    'cl>ntp ntp>sv sv>of of>sl sl>rtc', 'sv of sl rtc', [
      ['Your computer clock slowly drifts. Wrong time breaks logs, certificates and cron jobs.', 'cl'],
      ['A time daemon (systemd-timesyncd or chrony) asks one or more NTP servers for the time.', '', 'cl>ntp ntp>sv'],
      ['From the round-trip it works out how far off your clock is: the offset.', '', 'sv>of'],
      ['Small errors are corrected by running the clock slightly slower or faster, never jumping.', '', 'of>sl'],
      ['The corrected time is saved to the hardware clock. timedatectl shows the sync state.', '', 'sl>rtc']]);

  A('unitfiles', 'From unit file to running service', ['uf|mysite.service file|f|0|2', 'dr|daemon-reload|p|1|0', 'en|enable|p|1|1', 'st|start|p|2|0', 'run|process runs as ssk|p|2|1', 'rs|Restart=on-failure|k|3|2'],
    'uf>dr dr>en en>st st>run run>rs rs>run', 'dr en st run rs', [
      ['You write a unit file in /etc/systemd/system: what to run, as whom, and when.', 'uf'],
      ['daemon-reload makes systemd read the new file. Forgetting this is a classic mistake.', '', 'uf>dr'],
      ['enable links it so the service starts at every boot.', '', 'dr>en'],
      ['start runs it right now. enable --now does both at once.', '', 'en>st'],
      ['systemd launches ExecStart as the User you set and tracks it.', '', 'st>run'],
      ['With Restart=on-failure, a crash makes systemd start it again.', '', 'run>rs rs>run']]);

  A('sysctl', 'Changing a kernel setting', ['you|sysctl -w vm.swappiness=10|u|0|2', 'prc|/proc/sys/vm/swappiness|f|1|2', 'ker|kernel behaves differently|k|2|0', 'rb|reboot|h|2|1', 'cf|/etc/sysctl.d/99.conf|f|3|2'],
    'you>prc prc>ker ker>rb rb>cf cf>ker', 'ker rb cf', [
      ['Kernel settings appear as files under /proc/sys. sysctl reads and writes them by dotted name.', 'prc'],
      ['sysctl -w writes a value straight into the running kernel.', '', 'you>prc'],
      ['The kernel changes its behaviour at once, for example how eagerly it swaps.', '', 'prc>ker'],
      ['But the value is lost at reboot.', '', 'ker>rb'],
      ['To keep it, put the line in /etc/sysctl.d/99-custom.conf and run sysctl --system.', '', 'rb>cf cf>ker']]);
})();
