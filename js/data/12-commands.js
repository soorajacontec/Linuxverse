/* 40 more documented commands. Each is added to the Commands tab of the topic it belongs to (command, what it does, sample output,
   optional distro badge), so it also appears in search, the A-Z examples and as a runnable command in the practice terminal. */
(function () {
  'use strict';
  var DEB = 'Debian/Ubuntu', RPM = 'Fedora/RHEL';
  function add(topic, rows) {
    var t = LV.topics[topic];
    if (!t) return;
    t.cmds = t.cmds || [];
    rows.forEach(function (r) { t.cmds.push(r); });
  }

  /* ---- Text and data ---- */
  add('sortuniq', [
    ['tac notes.txt', 'Print a file with the last line first (cat backwards)', 'Done: set up nginx\nTODO: compress images\nTODO: add an about page'],
    ['comm -12 <(sort a.txt) <(sort b.txt)', 'Show only the lines two sorted files have in common', 'anil\nbob'],
    ['join -t, users.csv orders.csv', 'Join two files on their first field, like a database join', '1,ssk,laptop\n2,anil,phone'],
    ['shuf -n 3 names.txt', 'Pick 3 random lines from a file', 'meera\nanil\nzara'],
    ['fold -w 40 -s long.txt', 'Wrap long lines at 40 characters, breaking at spaces']
  ]);
  add('pipes', [
    ['od -c hello.txt', 'Dump a file as characters and escape codes (shows hidden newlines)', '0000000   H   e   l   l   o  \\n\n0000006'],
    ['strings /bin/ls | head -n 3', 'Print readable text found inside a binary file', '/lib64/ld-linux-x86-64.so.2\nlibselinux.so.1\nGLIBC_2.2.5']
  ]);

  /* ---- Files ---- */
  add('fileops', [
    ['split -l 1000 big.log part_', 'Cut a file into 1000-line pieces named part_aa, part_ab, ...'],
    ['realpath ~/website/latest.log', 'Print the absolute path with every link resolved', '/home/ssk/website/logs/access.log'],
    ['mktemp -d', 'Create a private, unique temporary directory', '/tmp/tmp.k3J9dQ1xTz'],
    ['shred -u -n 3 secret.txt', 'Overwrite a file three times, then delete it (best on plain disks, not SSDs)'],
    ['truncate -s 0 app.log', 'Empty a file without deleting it, so programs keep their open handle'],
    ['dd if=/dev/zero of=test.img bs=1M count=10', 'Copy raw data block by block; here it makes a 10 MB file of zeros', '10+0 records in\n10+0 records out\n10485760 bytes (10 MB, 10 MiB) copied, 0.0102 s, 1.0 GB/s']
  ]);
  add('checksums', [
    ['echo -n "hello" | base64', 'Encode text as Base64 (an encoding, not encryption)', 'aGVsbG8='],
    ['sha1sum hello.txt', 'Print the SHA-1 checksum of a file (older; prefer sha256sum for security)', 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d  hello.txt']
  ]);
  add('archives', [
    ['xz -k big.log', 'Compress with xz and keep the original; creates big.log.xz (smaller, slower than gzip)'],
    ['bzip2 -k notes.txt', 'Compress with bzip2 and keep the original; creates notes.txt.bz2'],
    ['zstd -19 backup.tar', 'Compress with Zstandard at a high level (fast to unpack)', 'backup.tar            : 21.43%   (10485760 => 2246810 bytes, backup.tar.zst)']
  ]);

  /* ---- System ---- */
  add('shell', [
    ['cal', 'Show a calendar of the current month', '   November 2026\nSu Mo Tu We Th Fr Sa\n 1  2  3  4  5  6  7\n 8  9 10 11 12 13 14\n15 16 17 18 19 20 21\n22 23 24 25 26 27 28\n29 30']
  ]);
  add('sysinfo', [
    ['sudo lshw -short', 'Summarise the hardware: CPU, memory, disks and network cards', 'H/W path      Device     Class      Description\n=========================================================\n/0/0                     memory     8GiB System memory\n/0/1                     processor  Virtual CPU @ 2.40GHz\n/0/100/1f.2   /dev/sda   disk       100GB Virtual disk']
  ]);
  add('boot', [
    ['sudo shutdown -h +10 "Maintenance"', 'Power off in 10 minutes and warn logged-in users (shutdown -c cancels)', 'Shutdown scheduled for Sun 2026-11-08 20:50:00 IST, use \'shutdown -c\' to cancel.']
  ]);

  /* ---- Network ---- */
  add('ip', [
    ['ifconfig', 'Older tool to show interfaces and addresses (ip addr replaces it)', 'enp1s0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.0.2.25  netmask 255.255.255.0  broadcast 192.0.2.255\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0', RPM],
    ['route -n', 'Show the kernel routing table with numeric addresses', 'Kernel IP routing table\nDestination     Gateway         Genmask         Flags Metric Ref    Use Iface\n0.0.0.0         192.0.2.1       0.0.0.0         UG    100    0        0 enp1s0\n192.0.2.0       0.0.0.0         255.255.255.0   U     100    0        0 enp1s0'],
    ['arp -n', 'Show the neighbour table that maps IP addresses to MAC addresses', 'Address                  HWtype  HWaddress           Flags Mask            Iface\n192.0.2.1                ether   52:54:00:12:35:02   C                     enp1s0']
  ]);
  add('dns', [
    ['nslookup example.com', 'Ask the DNS server for the address of a name', 'Server:\t\t127.0.0.53\nAddress:\t127.0.0.53#53\n\nNon-authoritative answer:\nName:\texample.com\nAddress: 203.0.113.10'],
    ['whois example.com', 'Show who registered a domain and when it expires', 'Domain Name: EXAMPLE.COM\nRegistrar: Example Registrar, Inc.\nCreation Date: 1995-08-14T04:00:00Z\nRegistry Expiry Date: 2027-08-13T04:00:00Z']
  ]);
  add('conn', [
    ['netstat -tulpn', 'Older tool to list listening ports and their programs (ss replaces it)', 'Proto Recv-Q Send-Q Local Address   Foreign Address State   PID/Program name\ntcp        0      0 0.0.0.0:22      0.0.0.0:*       LISTEN  812/sshd\ntcp        0      0 0.0.0.0:80      0.0.0.0:*       LISTEN  1203/nginx'],
    ['telnet example.com 80', 'Open a raw TCP connection to a port; type GET / HTTP/1.0 and press Enter twice', 'Trying 203.0.113.10...\nConnected to example.com.\nEscape character is \'^]\'.'],
    ['socat TCP-LISTEN:8080,fork TCP:localhost:3000', 'Forward port 8080 to port 3000, a flexible relay between any two endpoints'],
    ['sudo tcpdump -i any -c 3 port 80', 'Capture 3 packets on port 80 and print them', 'listening on any, link-type LINUX_SLL2, snapshot length 262144 bytes\n14:02:11.120 IP 192.0.2.25.51514 > 203.0.113.10.80: Flags [S], seq 1, win 64240, length 0\n14:02:11.140 IP 203.0.113.10.80 > 192.0.2.25.51514: Flags [S.], seq 1, ack 2, win 65160, length 0\n14:02:11.140 IP 192.0.2.25.51514 > 203.0.113.10.80: Flags [.], ack 1, win 502, length 0\n3 packets captured']
  ]);
  add('ports', [
    ['nmap -p 22,80,443 localhost', 'Scan chosen ports, only on machines you own or may test', 'Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for localhost (127.0.0.1)\nPORT    STATE  SERVICE\n22/tcp  open   ssh\n80/tcp  open   http\n443/tcp closed https']
  ]);

  /* ---- Security ---- */
  add('firewall', [
    ['sudo iptables -L -n', 'List the classic firewall rules without name lookups', 'Chain INPUT (policy ACCEPT)\ntarget     prot opt source               destination\nACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:22\nACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80']
  ]);
  add('mac', [
    ['sestatus', 'Show whether SELinux is enabled and enforcing', 'SELinux status:                 enabled\nSELinuxfs mount:                /sys/fs/selinux\nCurrent mode:                   enforcing\nMode from config file:          enforcing\nPolicy MLS status:              enabled', RPM]
  ]);
  add('ssh', [
    ['ssh-add ~/.ssh/id_ed25519', 'Give the running ssh-agent your private key so you type the passphrase once', 'Enter passphrase for /home/ssk/.ssh/id_ed25519:\nIdentity added: /home/ssk/.ssh/id_ed25519 (you@example.com)']
  ]);

  /* ---- Developer tools ---- */
  add('buildsrc', [
    ['gcc -Wall -o hello hello.c', 'Compile a C program to the executable hello, with common warnings on']
  ]);
  add('debugprocs', [
    ['gdb ./hello', 'Debug a program: use break, run, next, step and print inside', 'GNU gdb (Ubuntu 15.0) 15.0\nReading symbols from ./hello...\n(gdb)']
  ]);

  /* ---- Packages and disks ---- */
  add('pkgmgr', [
    ['sudo apt-get install -y nginx', 'Install a package without prompts, the form used in scripts', 'Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  nginx\nSetting up nginx (1.24.0-2ubuntu7) ...', DEB],
    ['dpkg-query -W nginx', 'Show the installed version of a package', 'nginx\t1.24.0-2ubuntu7', DEB],
    ['rpm -qa | head -n 3', 'List installed packages on RPM based systems', 'bash-5.2.26-3.fc40.x86_64\ncoreutils-9.4-6.fc40.x86_64\nsystemd-255.10-1.fc40.x86_64', RPM]
  ]);
  add('fstypes', [
    ['sudo e2fsck -f /dev/sdb1', 'Force a check of an unmounted ext4 filesystem', 'Pass 1: Checking inodes, blocks, and sizes\nPass 2: Checking directory structure\nPass 3: Checking directory connectivity\nPass 4: Checking reference counts\nPass 5: Checking group summary information\n/dev/sdb1: 11/655360 files (0.0% non-contiguous), 66753/2621440 blocks']
  ]);

  /* ---- Manual-page entries for man and the command pop-up ---- */
  LV.tool({
    tac: { syntax: 'tac [OPTION]... [FILE]...', desc: 'Print files with the last line first.' },
    comm: { syntax: 'comm [OPTION]... FILE1 FILE2', desc: 'Compare two sorted files line by line.' },
    join: { syntax: 'join [OPTION]... FILE1 FILE2', desc: 'Join lines of two files on a common field.' },
    split: { syntax: 'split [OPTION]... [FILE [PREFIX]]', desc: 'Split a file into pieces.' },
    fold: { syntax: 'fold [OPTION]... [FILE]...', desc: 'Wrap each input line to fit a given width.' },
    shuf: { syntax: 'shuf [OPTION]... [FILE]', desc: 'Generate random permutations of lines.' },
    od: { syntax: 'od [OPTION]... [FILE]...', desc: 'Dump files in octal and other formats.' },
    strings: { syntax: 'strings [option(s)] file...', desc: 'Print the printable character sequences in files.' },
    realpath: { syntax: 'realpath [OPTION]... FILE...', desc: 'Print the resolved absolute path.' },
    mktemp: { syntax: 'mktemp [OPTION]... [TEMPLATE]', desc: 'Create a temporary file or directory safely.' },
    shred: { syntax: 'shred [OPTION]... FILE...', desc: 'Overwrite a file to hide its contents, and optionally delete it.' },
    truncate: { syntax: 'truncate OPTION... FILE...', desc: 'Shrink or extend the size of a file.' },
    dd: { syntax: 'dd [OPERAND]...', desc: 'Convert and copy a file, block by block.' },
    base64: { syntax: 'base64 [OPTION]... [FILE]', desc: 'Base64 encode or decode data.' },
    sha1sum: { syntax: 'sha1sum [OPTION]... [FILE]...', desc: 'Compute and check SHA1 message digests.' },
    cal: { syntax: 'cal [options] [[[day] month] year]', desc: 'Display a calendar.' },
    xz: { syntax: 'xz [OPTION]... [FILE]...', desc: 'Compress or decompress .xz files.' },
    bzip2: { syntax: 'bzip2 [OPTION]... [FILE]...', desc: 'Block-sorting file compressor.' },
    zstd: { syntax: 'zstd [OPTION]... [FILE]...', desc: 'Fast compression with the Zstandard algorithm.' },
    netstat: { syntax: 'netstat [OPTION]...', desc: 'Show network connections, routing tables and interface statistics.' },
    ifconfig: { syntax: 'ifconfig [interface]', desc: 'Configure or display network interfaces (legacy).' },
    route: { syntax: 'route [OPTION]...', desc: 'Show or change the IP routing table (legacy).' },
    arp: { syntax: 'arp [OPTION]...', desc: 'Manipulate the system ARP cache.' },
    nslookup: { syntax: 'nslookup [option] [name] [server]', desc: 'Query Internet name servers interactively or once.' },
    whois: { syntax: 'whois [OPTION]... OBJECT...', desc: 'Client for the whois directory service.' },
    telnet: { syntax: 'telnet [options] host [port]', desc: 'Connect to a remote host over TCP; handy to test a port.' },
    socat: { syntax: 'socat [options] <address> <address>', desc: 'Multipurpose relay between two data channels.' },
    tcpdump: { syntax: 'tcpdump [options] [expression]', desc: 'Dump traffic on a network.' },
    nmap: { syntax: 'nmap [Scan Type...] [Options] {target}', desc: 'Network exploration tool and port scanner.' },
    iptables: { syntax: 'iptables [-t table] command [match] [target]', desc: 'Administration tool for IPv4 packet filtering and NAT.' },
    sestatus: { syntax: 'sestatus [-v] [-b]', desc: 'Get the status of SELinux.' },
    'ssh-add': { syntax: 'ssh-add [options] [file ...]', desc: 'Add private key identities to the authentication agent.' },
    gcc: { syntax: 'gcc [options] file...', desc: 'GNU project C and C++ compiler.' },
    gdb: { syntax: 'gdb [options] [program [core|pid]]', desc: 'The GNU debugger.' },
    shutdown: { syntax: 'shutdown [OPTIONS...] [TIME] [WALL...]', desc: 'Halt, power off or reboot the machine.' },
    'apt-get': { syntax: 'apt-get [options] command', desc: 'APT package handling utility (command line, script friendly).' },
    'dpkg-query': { syntax: 'dpkg-query [option...] command', desc: 'Query the dpkg package database.' },
    rpm: { syntax: 'rpm [options] [package]', desc: 'RPM package manager.' },
    e2fsck: { syntax: 'e2fsck [options] device', desc: 'Check a Linux ext2/ext3/ext4 filesystem.' },
    lshw: { syntax: 'lshw [options]', desc: 'List hardware.' }
  });
})();
