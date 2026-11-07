/* Sections: Boot & systemd, Disks, Networking, Security, Scripting */
LV.sec({
  id: 'systemd', title: 'Boot & systemd', icon: 'restart', hue: 210,
  desc: 'From power button to login, services, logs and timers.',
  topics: [
    {
      id: 'boot', title: 'The boot sequence', sum: 'Firmware → bootloader → kernel → systemd → login.',
      explain: [
        'Firmware (<b>UEFI</b> on modern machines) finds a bootloader on the EFI system partition. <b>GRUB</b> is the most common; systemd-boot is a simpler alternative.',
        'The bootloader loads the <b>kernel</b> and an <b>initramfs</b>: a small temporary root filesystem with the drivers needed to reach the real root disk (for example LVM, encryption, NVMe).',
        'The kernel mounts the real root and starts <b>systemd</b> as PID 1, which brings up services in parallel until it reaches the default <b>target</b> (graphical or multi-user).'
      ],
      anim: {
        nodes: [['fw', 180, 22, 'UEFI firmware', 'hw'], ['gr', 180, 70, 'GRUB bootloader', 'file'], ['k', 180, 118, 'Linux kernel', 'kernel'], ['ir', 180, 166, 'initramfs → mount root', 'file'], ['sd', 180, 214, 'systemd (PID 1)', 'proc'], ['tg', 180, 262, 'graphical.target → login', 'user']],
        edges: [['fw', 'gr'], ['gr', 'k'], ['k', 'ir'], ['ir', 'sd'], ['sd', 'tg']],
        steps: [
          { t: 'Power on. UEFI firmware initialises hardware and finds the EFI partition.', hi: ['fw'] },
          { t: 'GRUB shows the menu and loads the chosen kernel plus initramfs into memory.', hi: ['gr'], flow: [['fw', 'gr']] },
          { t: 'The kernel decompresses, detects CPUs and memory, and starts drivers.', hi: ['k'], flow: [['gr', 'k']] },
          { t: 'initramfs loads storage drivers, unlocks disks if needed, and switches to the real root.', hi: ['ir'], flow: [['k', 'ir']] },
          { t: 'systemd starts as PID 1 and launches units in parallel.', hi: ['sd'], flow: [['ir', 'sd']] },
          { t: 'The default target is reached and you get a login screen.', hi: ['tg'], flow: [['sd', 'tg']] }
        ]
      },
      cmds: [
        ['systemd-analyze', 'How long boot took', 'Startup finished in 3.1s (firmware) + 1.9s (loader) + 2.2s (kernel) + 6.4s (userspace) = 13.6s\ngraphical.target reached after 6.3s in userspace.'],
        ['systemd-analyze blame', 'Slowest units first', '3.204s NetworkManager-wait-online.service\n1.102s snapd.service\n  612ms systemd-journal-flush.service\n  401ms apparmor.service'],
        ['systemctl get-default', 'Default boot target', 'graphical.target'],
        ['sudo systemctl set-default multi-user.target', 'Boot to text mode by default'],
        ['sudo update-grub', 'Rebuild GRUB menu (Debian/Ubuntu)', null, 'Debian/Ubuntu'],
        ['sudo grub2-mkconfig -o /boot/grub2/grub.cfg', 'Rebuild GRUB menu (Fedora/RHEL, openSUSE)', null, 'Fedora/RHEL'],
        ['sudo update-initramfs -u', 'Rebuild initramfs (Debian/Ubuntu)', null, 'Debian/Ubuntu'],
        ['sudo dracut -f', 'Rebuild initramfs (Fedora/RHEL/openSUSE)', null, 'Fedora/RHEL'],
        ['sudo mkinitcpio -P', 'Rebuild initramfs for all presets (Arch)', null, 'Arch']
      ],
      demo: ['systemd-analyze', 'systemd-analyze blame'],
      note: 'On Arch, <code>grub-mkconfig -o /boot/grub/grub.cfg</code> regenerates the GRUB menu.'
    },
    {
      id: 'systemctl', title: 'Services with systemctl', sum: 'Start, stop, enable and inspect units.',
      explain: [
        'systemd manages <b>units</b>. A <code>.service</code> unit describes a program to run. Unit files live in <code>/usr/lib/systemd/system</code> (from packages) and <code>/etc/systemd/system</code> (your overrides, which win).',
        '<b>start/stop</b> act now. <b>enable/disable</b> decide whether it starts at boot. <code>enable --now</code> does both.',
        'After editing a unit file, run <code>systemctl daemon-reload</code> so systemd re-reads it.'
      ],
      anim: {
        nodes: [['in', 60, 40, 'inactive (dead)', 'hw'], ['ac', 300, 40, 'active (running)', 'user'], ['fa', 180, 140, 'failed', 'kernel'], ['en', 60, 230, 'enabled: starts at boot', 'file'], ['di', 300, 230, 'disabled', 'file']],
        edges: [['in', 'ac'], ['ac', 'in'], ['ac', 'fa'], ['fa', 'ac'], ['en', 'di']],
        steps: [
          { t: 'A stopped service is inactive (dead).', hi: ['in'] },
          { t: 'systemctl start moves it to active (running).', hi: ['ac'], flow: [['in', 'ac']] },
          { t: 'If the program crashes or exits with an error, the unit becomes failed.', hi: ['fa'], flow: [['ac', 'fa']] },
          { t: 'systemctl restart (or Restart=on-failure in the unit) brings it back.', hi: ['ac'], flow: [['fa', 'ac']] },
          { t: 'Enabled vs disabled is separate: it only controls starting at boot.', hi: ['en', 'di'], flow: [['en', 'di']] }
        ]
      },
      cmds: [
        ['systemctl status nginx', 'State, PID, memory and recent log lines', '● nginx.service - A high performance web server and a reverse proxy server\n     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)\n     Active: active (running) since Thu 2026-11-05 09:01:12 +03; 1h 19min ago\n   Main PID: 1020 (nginx)\n      Tasks: 3 (limit: 9387)\n     Memory: 6.1M\n     CGroup: /system.slice/nginx.service\n             ├─1020 "nginx: master process /usr/sbin/nginx"\n             ├─1024 "nginx: worker process"\n             └─1025 "nginx: worker process"'],
        ['sudo systemctl start nginx', 'Start now'],
        ['sudo systemctl stop nginx', 'Stop now'],
        ['sudo systemctl restart nginx', 'Stop and start'],
        ['sudo systemctl reload nginx', 'Reload config without dropping connections (if supported)'],
        ['sudo systemctl enable --now nginx', 'Start now and at every boot'],
        ['sudo systemctl disable nginx', 'Do not start at boot'],
        ['systemctl is-active nginx', 'One-word state for scripts', 'active'],
        ['systemctl --failed', 'List failed units', '  UNIT LOAD ACTIVE SUB DESCRIPTION\n0 loaded units listed.'],
        ['systemctl list-units --type=service --state=running', 'Running services'],
        ['sudo systemctl edit nginx', 'Create a drop-in override safely'],
        ['sudo systemctl daemon-reload', 'Re-read unit files after editing']
      ],
      flags: [['--now', 'With enable/disable: also start/stop', 'systemctl'], ['--type', 'Filter unit type', 'systemctl'], ['--state', 'Filter state', 'systemctl'], ['--user', 'Manage your own user units', 'systemctl']],
      demo: ['systemctl status nginx', 'systemctl is-active nginx'],
      tips: ['Package names for services differ: Apache is <code>apache2</code> on Debian/Ubuntu and <code>httpd</code> on Fedora/RHEL.']
    },
    {
      id: 'journal', title: 'Logs with journalctl', sum: 'Query the systemd journal.',
      explain: [
        'systemd-journald collects logs from the kernel, services and programs into one indexed <b>journal</b>. <code>journalctl</code> reads it.',
        'Filter by unit (<code>-u</code>), time (<code>--since</code>), boot (<code>-b</code>) and priority (<code>-p err</code>). Follow live with <code>-f</code>.',
        'Classic text logs in <code>/var/log</code> still exist on many distros (for example <code>/var/log/syslog</code> on Debian/Ubuntu with rsyslog).'
      ],
      cmds: [
        ['journalctl -u nginx --since today', 'Today\'s logs for one service', 'Nov 05 09:01:12 ubuntu systemd[1]: Starting nginx.service - A high performance web server...\nNov 05 09:01:12 ubuntu systemd[1]: Started nginx.service - A high performance web server.'],
        ['journalctl -b -p err', 'Errors since this boot'],
        ['journalctl -b -1', 'Logs from the previous boot (needs persistent journal)'],
        ['journalctl -f', 'Follow new entries live'],
        ['journalctl -k', 'Kernel messages (like dmesg)'],
        ['journalctl --disk-usage', 'Journal size on disk', 'Archived and active journals take up 184.0M in the file system.'],
        ['sudo journalctl --vacuum-time=2weeks', 'Delete journal entries older than 2 weeks'],
        ['sudo dmesg -T | tail', 'Recent kernel ring buffer messages with readable times']
      ],
      flags: [['-u', 'Unit', 'journalctl'], ['-b [N]', 'Boot (0 current, -1 previous)', 'journalctl'], ['-p', 'Priority: emerg…debug', 'journalctl'], ['-f', 'Follow', 'journalctl'], ['--since/--until', 'Time window', 'journalctl'], ['-n N', 'Last N lines', 'journalctl'], ['-o json', 'Output format', 'journalctl']],
      demo: ['journalctl -u nginx --since today', 'journalctl --disk-usage']
    },
    {
      id: 'cron', title: 'cron & systemd timers', sum: 'Run jobs on a schedule.',
      explain: [
        '<b>cron</b> runs commands on a schedule written as five fields: minute, hour, day of month, month, day of week. Edit yours with <code>crontab -e</code>.',
        '<b>systemd timers</b> pair a <code>.timer</code> with a <code>.service</code>. They log to the journal, can catch up missed runs (<code>Persistent=true</code>) and add random delays.',
        'Decode any cron expression in plain English in the Live tab.'
      ],
      table: { head: ['Expression', 'Meaning'], rows: [['*/5 * * * *', 'Every 5 minutes'], ['0 2 * * *', 'Every day at 02:00'], ['30 8 * * 1-5', '08:30 Monday to Friday'], ['0 0 1 * *', 'Midnight on the 1st of each month'], ['@reboot', 'Once at startup']] },
      cmds: [
        ['crontab -e', 'Edit your crontab'],
        ['crontab -l', 'List your cron jobs', '# m h  dom mon dow   command\n0 2 * * * /home/ssk/scripts/backup.sh >> /home/ssk/backup.log 2>&1'],
        ['systemctl list-timers', 'Upcoming systemd timers', 'NEXT                        LEFT     LAST                        PASSED  UNIT                 ACTIVATES\nFri 2026-11-06 00:00:00 +03 13h left Thu 2026-11-05 00:00:01 +03 10h ago logrotate.timer      logrotate.service\nFri 2026-11-06 06:12:44 +03 19h left Thu 2026-11-05 06:40:11 +03 3h ago  apt-daily-upgrade.timer apt-daily-upgrade.service'],
        ['systemd-run --on-calendar="*-*-* 02:00" /home/ssk/scripts/backup.sh', 'Create a transient timer without writing files']
      ],
      live: 'cron',
      demo: ['crontab -l', 'systemctl list-timers'],
      note: 'On Fedora and Arch the cron daemon is cronie; on Debian/Ubuntu it is cron. Some minimal installs ship only systemd timers.'
    }
  ]
});

LV.sec({
  id: 'disks', title: 'Disks & storage', icon: 'grid', hue: 120,
  desc: 'Block devices, partitions, mounting, LVM and filesystems.',
  topics: [
    {
      id: 'lsblk', title: 'Disks & partitions', sum: 'lsblk, blkid, fdisk and filesystems.',
      explain: [
        'Disks appear as files in <code>/dev</code>: <code>sda</code> for SATA/USB, <code>nvme0n1</code> for NVMe, <code>vda</code> for virtual disks. Partitions add a number: <code>sda1</code>, <code>nvme0n1p1</code>.',
        'A partition needs a <b>filesystem</b> before it can store files. Common choices: <b>ext4</b> (default on Debian/Ubuntu), <b>XFS</b> (RHEL default), <b>Btrfs</b> (Fedora Workstation and openSUSE default, with snapshots).'
      ],
      cmds: [
        ['lsblk', 'Tree of disks, partitions and mount points', 'NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS\nsda      8:0    0   60G  0 disk \n├─sda1   8:1    0  1.1G  0 part /boot/efi\n└─sda2   8:2    0 58.9G  0 part /\nsdb      8:16   0   20G  0 disk '],
        ['lsblk -f', 'Add filesystem type, label and UUID'],
        ['sudo blkid', 'UUIDs and types of every partition', '/dev/sda1: UUID="3A1F-9C2E" TYPE="vfat" PARTUUID="6c5e…"\n/dev/sda2: UUID="9b2f0c1e-4f6a-4c55-9a1d-2e7b5f0d8c11" TYPE="ext4" PARTUUID="d1a2…"'],
        ['sudo fdisk -l', 'Partition tables of all disks'],
        ['sudo parted /dev/sdb mklabel gpt', 'New GPT partition table on sdb (erases it)'],
        ['sudo mkfs.ext4 /dev/sdb1', 'Format a partition as ext4'],
        ['sudo mkfs.xfs /dev/sdb1', 'Format as XFS']
      ],
      warn: ['mkfs, fdisk and parted destroy data on the wrong device. Check <code>lsblk</code> twice and confirm the device name before running them.'],
      demo: ['lsblk', 'sudo blkid']
    },
    {
      id: 'mount', title: 'Mounting & /etc/fstab', sum: 'Attach filesystems to the tree, permanently.',
      explain: [
        '<code>mount /dev/sdb1 /mnt/data</code> attaches a filesystem to a directory (the <b>mount point</b>). <code>umount</code> detaches it.',
        'To mount at every boot, add a line to <code>/etc/fstab</code>. Use the <b>UUID</b>, not /dev/sdb1, because device names can change between boots.',
        'Fields: device, mount point, type, options, dump, fsck order.'
      ],
      anim: {
        nodes: [['root', 180, 30, '/', 'kernel'], ['mnt', 180, 110, '/mnt/data (empty dir)', 'file'], ['disk', 180, 220, '/dev/sdb1 ext4', 'hw']],
        edges: [['root', 'mnt'], ['disk', 'mnt']],
        steps: [
          { t: '/mnt/data is an ordinary empty directory in the tree.', hi: ['mnt'], flow: [['root', 'mnt']] },
          { t: 'sudo mount /dev/sdb1 /mnt/data attaches the disk there.', hi: ['disk', 'mnt'], flow: [['disk', 'mnt']] },
          { t: 'Now files on sdb1 appear under /mnt/data. Unmount and the directory is empty again.', hi: ['mnt'] }
        ]
      },
      cmds: [
        ['sudo mkdir -p /mnt/data', 'Create a mount point'],
        ['sudo mount /dev/sdb1 /mnt/data', 'Mount now'],
        ['findmnt /mnt/data', 'Show what is mounted there', 'TARGET    SOURCE    FSTYPE OPTIONS\n/mnt/data /dev/sdb1 ext4   rw,relatime'],
        ['sudo umount /mnt/data', 'Unmount'],
        ['cat /etc/fstab', 'Persistent mounts', 'UUID=9b2f0c1e-4f6a-4c55-9a1d-2e7b5f0d8c11 /          ext4 errors=remount-ro 0 1\nUUID=3A1F-9C2E                            /boot/efi  vfat umask=0077        0 1'],
        ['sudo mount -a', 'Mount everything in fstab (test your edits)'],
        ['sudo findmnt --verify', 'Check fstab for mistakes before rebooting']
      ],
      warn: ['A broken fstab line can drop the system into emergency mode at boot. Always test with <code>sudo mount -a</code> and <code>findmnt --verify</code>. Add <code>nofail</code> for removable disks.'],
      demo: ['findmnt /mnt/data', 'cat /etc/fstab']
    },
    {
      id: 'lvm', title: 'LVM: logical volumes', sum: 'Physical volumes → volume group → logical volumes.',
      explain: [
        '<b>LVM</b> adds a flexible layer between disks and filesystems. Disks become <b>physical volumes</b> (PV), pooled into a <b>volume group</b> (VG), which is carved into <b>logical volumes</b> (LV).',
        'You can grow an LV while it is mounted and add disks to the pool later. RHEL and Fedora Server install with LVM by default.'
      ],
      anim: {
        nodes: [['d1', 80, 30, '/dev/sdb (PV)', 'hw'], ['d2', 280, 30, '/dev/sdc (PV)', 'hw'], ['vg', 180, 120, 'VG: data (40G pool)', 'kernel'], ['lv1', 80, 210, 'LV: web 15G', 'file'], ['lv2', 280, 210, 'LV: db 20G', 'file']],
        edges: [['d1', 'vg'], ['d2', 'vg'], ['vg', 'lv1'], ['vg', 'lv2']],
        steps: [
          { t: 'pvcreate marks two disks as physical volumes.', hi: ['d1', 'd2'] },
          { t: 'vgcreate pools them into one volume group.', hi: ['vg'], flow: [['d1', 'vg'], ['d2', 'vg']] },
          { t: 'lvcreate carves logical volumes out of the pool. Format and mount them like partitions.', hi: ['lv1', 'lv2'], flow: [['vg', 'lv1'], ['vg', 'lv2']] },
          { t: 'Need more room? lvextend -r grows an LV and its filesystem online.', hi: ['lv2'] }
        ]
      },
      cmds: [
        ['sudo pvcreate /dev/sdb /dev/sdc', 'Initialise physical volumes'],
        ['sudo vgcreate data /dev/sdb /dev/sdc', 'Create volume group "data"'],
        ['sudo lvcreate -n web -L 15G data', 'Create a 15 GB logical volume'],
        ['sudo lvextend -r -L +5G /dev/data/web', 'Grow by 5 GB and resize the filesystem'],
        ['sudo pvs', 'Summary of PVs'],
        ['sudo vgs', 'Summary of VGs', '  VG   #PV #LV #SN Attr   VSize  VFree\n  data   2   2   0 wz--n- 39.99g 4.99g'],
        ['sudo lvs', 'Summary of LVs', '  LV   VG   Attr       LSize\n  db   data -wi-ao---- 20.00g\n  web  data -wi-ao---- 15.00g']
      ],
      demo: ['sudo vgs', 'sudo lvs']
    }
  ]
});

LV.sec({
  id: 'net', title: 'Networking', icon: 'grid', hue: 175,
  desc: 'Addresses, routes, DNS, ports and testing connectivity.',
  topics: [
    {
      id: 'ip', title: 'IP addresses & routes', sum: 'ip addr, ip route and subnet maths.',
      explain: [
        'The <code>ip</code> command (iproute2) replaces old ifconfig and route. <code>ip a</code> shows addresses, <code>ip r</code> shows the routing table.',
        'An address like <code>192.0.2.25/24</code> means the first 24 bits are the network. Everything in 192.0.2.0–192.0.2.255 is local; anything else goes to the <b>default gateway</b>.',
        'Use the Live tab to calculate network, broadcast and host range for any CIDR block.'
      ],
      cmds: [
        ['ip a', 'Interfaces and addresses', '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n2: enp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP\n    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff\n    inet 192.0.2.25/24 brd 192.0.2.255 scope global dynamic enp1s0'],
        ['ip -br a', 'Brief one-line-per-interface view', 'lo               UNKNOWN        127.0.0.1/8 ::1/128\nenp1s0           UP             192.0.2.25/24'],
        ['ip r', 'Routing table', 'default via 192.0.2.1 dev enp1s0 proto dhcp metric 100\n192.0.2.0/24 dev enp1s0 proto kernel scope link src 192.0.2.25 metric 100'],
        ['ip link set enp1s0 down', 'Bring an interface down (sudo)'],
        ['nmcli device status', 'NetworkManager view of devices', 'DEVICE  TYPE      STATE      CONNECTION\nenp1s0  ethernet  connected  Wired connection 1\nlo      loopback  unmanaged  --'],
        ['nmcli con mod "Wired connection 1" ipv4.addresses 192.0.2.50/24 ipv4.gateway 192.0.2.1 ipv4.method manual', 'Set a static IP with NetworkManager'],
        ['sudo netplan apply', 'Apply YAML network config (Ubuntu)', null, 'Debian/Ubuntu']
      ],
      flags: [['-br', 'Brief output', 'ip'], ['-4 / -6', 'IPv4 or IPv6 only', 'ip'], ['-c', 'Colour output', 'ip']],
      live: 'cidr',
      demo: ['ip -br a', 'ip r'],
      note: 'Ubuntu Server writes network config as netplan YAML in /etc/netplan; desktops and most other distros use NetworkManager directly.'
    },
    {
      id: 'dns', title: 'DNS resolution', sum: 'How a name becomes an address.',
      explain: [
        'When a program looks up <code>example.com</code>, glibc follows <code>/etc/nsswitch.conf</code>: first <code>/etc/hosts</code>, then DNS.',
        'On systemd distros, DNS usually goes to <b>systemd-resolved</b> on 127.0.0.53, which caches answers and forwards to your network\'s DNS servers.',
        'Watch the Visual tab for the full journey, including recursive resolvers and authoritative servers.'
      ],
      anim: {
        nodes: [['app', 50, 30, 'curl example.com', 'user'], ['hosts', 180, 30, '/etc/hosts', 'file'], ['res', 310, 30, 'systemd-resolved', 'proc'], ['rec', 310, 130, 'Recursive resolver', 'hw'], ['root', 180, 130, 'Root server (.)', 'kernel'], ['tld', 50, 130, '.com TLD server', 'kernel'], ['auth', 50, 230, 'example.com authoritative', 'kernel'], ['ans', 260, 230, '93.184.215.14 cached', 'user']],
        edges: [['app', 'hosts'], ['hosts', 'res'], ['res', 'rec'], ['rec', 'root'], ['root', 'tld'], ['tld', 'auth'], ['auth', 'ans']],
        steps: [
          { t: 'curl needs an IP for example.com.', hi: ['app'] },
          { t: '/etc/hosts is checked first. No entry here.', hi: ['hosts'], flow: [['app', 'hosts']] },
          { t: 'The query goes to the local stub resolver. Not cached yet.', hi: ['res'], flow: [['hosts', 'res']] },
          { t: 'It forwards to the network\'s recursive resolver.', hi: ['rec'], flow: [['res', 'rec']] },
          { t: 'The resolver asks a root server, which points to the .com servers…', hi: ['root', 'tld'], flow: [['rec', 'root'], ['root', 'tld']] },
          { t: '…which point to example.com\'s authoritative server, which answers.', hi: ['auth'], flow: [['tld', 'auth']] },
          { t: 'The answer returns and is cached for its TTL so the next lookup is instant.', hi: ['ans'], flow: [['auth', 'ans']] }
        ]
      },
      cmds: [
        ['resolvectl status', 'DNS servers per link (systemd-resolved)'],
        ['dig example.com +short', 'Query DNS (dnsutils / bind-utils package)'],
        ['dig example.com MX', 'Query a specific record type'],
        ['host example.com', 'Simple lookup'],
        ['getent hosts example.com', 'Resolve exactly as programs do (includes /etc/hosts)'],
        ['cat /etc/hosts', 'Static name table', '127.0.0.1\tlocalhost\n127.0.1.1\tubuntu\n192.0.2.80\tintranet.example.com'],
        ['resolvectl flush-caches', 'Clear the local DNS cache (sudo)']
      ],
      demo: ['cat /etc/hosts']
    },
    {
      id: 'ports', title: 'Ports & sockets', sum: 'ss shows who is listening and connected.',
      explain: [
        'A service listens on a <b>port</b>: SSH 22, HTTP 80, HTTPS 443. <code>ss</code> lists sockets and replaces the older netstat.',
        '<code>ss -tulpn</code> is the one to remember: TCP, UDP, listening, process, numeric.'
      ],
      cmds: [
        ['sudo ss -tulpn', 'Listening TCP/UDP ports with processes', 'Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process\nudp   UNCONN 0      0      127.0.0.53%lo:53      0.0.0.0:*     users:(("systemd-resolve",pid=520,fd=13))\ntcp   LISTEN 0      511          0.0.0.0:80       0.0.0.0:*     users:(("nginx",pid=1020,fd=6))\ntcp   LISTEN 0      128          0.0.0.0:22       0.0.0.0:*     users:(("sshd",pid=812,fd=3))'],
        ['ss -tn state established', 'Current TCP connections'],
        ['sudo lsof -i :80', 'Which process uses port 80'],
        ['cat /etc/services | grep -w 443', 'Name for a well-known port', 'https\t\t443/tcp\nhttps\t\t443/udp']
      ],
      flags: [['-t / -u', 'TCP / UDP', 'ss'], ['-l', 'Listening sockets only', 'ss'], ['-p', 'Show process', 'ss'], ['-n', 'Numeric, no name lookups', 'ss']],
      demo: ['sudo ss -tulpn']
    },
    {
      id: 'conn', title: 'Testing connectivity', sum: 'ping, traceroute, curl, wget.',
      explain: [
        'Troubleshoot bottom up: link (<code>ip a</code>), gateway (<code>ping</code> it), outside IP, then DNS name, then the application with <code>curl</code>.',
        'If <code>ping 192.0.2.1</code> works but <code>ping example.com</code> fails, the problem is DNS.'
      ],
      cmds: [
        ['ping -c 3 example.com', 'Three echo requests', 'PING example.com (93.184.215.14) 56(84) bytes of data.\n64 bytes from 93.184.215.14: icmp_seq=1 ttl=56 time=12.4 ms\n64 bytes from 93.184.215.14: icmp_seq=2 ttl=56 time=12.1 ms\n64 bytes from 93.184.215.14: icmp_seq=3 ttl=56 time=12.3 ms\n\n--- example.com ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2003ms'],
        ['traceroute example.com', 'Each hop on the path (tracepath works without installing)'],
        ['curl -I https://example.com', 'Fetch only the HTTP headers', 'HTTP/2 200\ncontent-type: text/html\ncontent-length: 1256'],
        ['curl -o page.html https://example.com', 'Save a page to a file'],
        ['wget https://example.com/file.tar.gz', 'Download a file']
      ],
      flags: [['-c N', 'Stop after N packets', 'ping'], ['-I', 'Headers only', 'curl'], ['-L', 'Follow redirects', 'curl'], ['-o file', 'Write output to file', 'curl']],
      demo: ['ping -c 3 example.com', 'curl -I https://example.com']
    }
  ]
});

LV.sec({
  id: 'sec', title: 'SSH & security', icon: 'eye', hue: 0,
  desc: 'Key-based SSH, firewalls and mandatory access control.',
  topics: [
    {
      id: 'ssh', title: 'SSH keys', sum: 'Log in without passwords, safely.',
      explain: [
        'SSH key pairs use public-key cryptography. The <b>private key</b> stays on your machine; the <b>public key</b> goes into <code>~/.ssh/authorized_keys</code> on the server.',
        'At login the server sends a challenge only the private key can sign. The private key never crosses the network.',
        'Prefer <b>ed25519</b> keys and protect them with a passphrase. <code>ssh-agent</code> remembers it for your session.'
      ],
      anim: {
        nodes: [['c', 60, 40, 'Your laptop: private key', 'user'], ['s', 300, 40, 'Server: authorized_keys', 'proc'], ['ch', 180, 130, 'Challenge', 'kernel'], ['sg', 60, 220, 'Signed with private key', 'user'], ['ok', 300, 220, 'Verified with public key ✓', 'proc']],
        edges: [['c', 's'], ['s', 'ch'], ['ch', 'sg'], ['sg', 'ok']],
        steps: [
          { t: 'You run ssh ssk@server. The client offers your public key.', hi: ['c'], flow: [['c', 's']] },
          { t: 'The server finds that key in authorized_keys and sends a random challenge.', hi: ['s', 'ch'], flow: [['s', 'ch']] },
          { t: 'Your client signs the challenge with the private key, locally.', hi: ['sg'], flow: [['ch', 'sg']] },
          { t: 'The server checks the signature with the public key. Match: you are in.', hi: ['ok'], flow: [['sg', 'ok']] }
        ]
      },
      cmds: [
        ['ssh-keygen -t ed25519 -C "ssk@laptop"', 'Generate a new key pair'],
        ['ssh-copy-id ssk@203.0.113.10', 'Install your public key on a server'],
        ['ssh ssk@203.0.113.10', 'Connect'],
        ['ssh -p 2222 ssk@203.0.113.10', 'Connect on a non-standard port'],
        ['scp report.pdf ssk@203.0.113.10:/tmp/', 'Copy a file to the server'],
        ['rsync -avz ./site/ ssk@203.0.113.10:/var/www/site/', 'Sync a folder efficiently'],
        ['ssh -L 8080:localhost:80 ssk@203.0.113.10', 'Forward local port 8080 to the server\'s port 80']
      ],
      table: { head: ['~/.ssh/config', 'Effect'], rows: [['Host web', 'Alias: ssh web'], ['  HostName 203.0.113.10', 'Real address'], ['  User ssk', 'Default user'], ['  IdentityFile ~/.ssh/id_ed25519', 'Which key']] },
      warn: ['Before setting <code>PasswordAuthentication no</code> in sshd_config, confirm key login works in a second session, or you can lock yourself out.']
    },
    {
      id: 'firewall', title: 'Firewalls', sum: 'ufw, firewalld and nftables.',
      explain: [
        'The kernel filters packets with <b>netfilter</b>; <b>nftables</b> is the modern rule language. Most people use a friendlier front-end.',
        '<b>ufw</b> is common on Ubuntu (inactive by default). <b>firewalld</b> is the default on Fedora, RHEL and openSUSE and groups rules into <b>zones</b>.'
      ],
      anim: {
        nodes: [['in', 40, 120, 'Packet in :22', 'hw'], ['r1', 160, 50, 'Rule: allow 22/tcp', 'proc'], ['r2', 160, 120, 'Rule: allow 80,443', 'proc'], ['pol', 160, 190, 'Default: deny incoming', 'kernel'], ['acc', 310, 50, 'ACCEPT → sshd', 'user'], ['drop', 310, 190, 'DROP', 'kernel']],
        edges: [['in', 'r1'], ['r1', 'acc'], ['in', 'pol'], ['pol', 'drop']],
        steps: [
          { t: 'A packet arrives for TCP port 22.', hi: ['in'] },
          { t: 'Rules are checked in order. The first rule matches port 22.', hi: ['r1'], flow: [['in', 'r1']] },
          { t: 'It is accepted and delivered to sshd.', hi: ['acc'], flow: [['r1', 'acc']] },
          { t: 'A packet for a port with no allow rule falls through to the default policy and is dropped.', hi: ['pol', 'drop'], flow: [['in', 'pol'], ['pol', 'drop']] }
        ]
      },
      cmds: [
        ['sudo ufw allow OpenSSH', 'Allow SSH before enabling (ufw)', null, 'Debian/Ubuntu'],
        ['sudo ufw enable', 'Turn ufw on', 'Firewall is active and enabled on system startup', 'Debian/Ubuntu'],
        ['sudo ufw status verbose', 'Show rules and defaults', 'Status: active\nDefault: deny (incoming), allow (outgoing), deny (routed)\n\nTo                         Action      From\n--                         ------      ----\n22/tcp (OpenSSH)           ALLOW IN    Anywhere', 'Debian/Ubuntu'],
        ['sudo ufw allow 443/tcp', 'Allow HTTPS', null, 'Debian/Ubuntu'],
        ['sudo firewall-cmd --list-all', 'Show the active zone (firewalld)', null, 'Fedora/RHEL'],
        ['sudo firewall-cmd --add-service=http --permanent', 'Allow HTTP permanently', null, 'Fedora/RHEL'],
        ['sudo firewall-cmd --reload', 'Apply permanent rules', null, 'Fedora/RHEL'],
        ['sudo nft list ruleset', 'Show the raw nftables rules']
      ],
      warn: ['On a remote server, allow SSH <i>before</i> enabling the firewall.']
    },
    {
      id: 'mac', title: 'SELinux & AppArmor', sum: 'Mandatory access control on top of permissions.',
      explain: [
        'Normal permissions let a file owner decide access. <b>Mandatory access control</b> adds system-wide policy: even a root-owned service is confined to what its policy allows.',
        '<b>SELinux</b> (Fedora, RHEL) labels every file and process with a context. <b>AppArmor</b> (Ubuntu, Debian, openSUSE) uses per-program profiles based on paths.',
        'When something works with SELinux permissive but fails in enforcing, fix the labels or booleans. Do not disable SELinux.'
      ],
      cmds: [
        ['getenforce', 'SELinux mode', 'Enforcing', 'Fedora/RHEL'],
        ['ls -Z /var/www/html', 'Show SELinux file contexts', 'unconfined_u:object_r:httpd_sys_content_t:s0 index.html', 'Fedora/RHEL'],
        ['sudo restorecon -Rv /var/www/html', 'Reset contexts to policy defaults', null, 'Fedora/RHEL'],
        ['sudo setsebool -P httpd_can_network_connect on', 'Let web servers make outbound connections', null, 'Fedora/RHEL'],
        ['sudo ausearch -m avc -ts recent', 'Recent SELinux denials', null, 'Fedora/RHEL'],
        ['sudo aa-status', 'AppArmor profiles and modes', null, 'Debian/Ubuntu'],
        ['sudo aa-complain /usr/sbin/nginx', 'Log instead of block for one program (apparmor-utils)', null, 'Debian/Ubuntu']
      ],
      warn: ['Setting SELinux to disabled and back requires a full relabel. Use permissive mode briefly for diagnosis instead.']
    }
  ]
});

LV.sec({
  id: 'script', title: 'Shell scripting', icon: 'term', hue: 55,
  desc: 'Variables, conditions, loops, exit codes and functions in bash.',
  topics: [
    {
      id: 'bash-basics', title: 'Scripts & variables', sum: 'Shebang, chmod +x, variables and quoting.',
      explain: [
        'A script is a text file of commands. The first line, the <b>shebang</b> <code>#!/usr/bin/env bash</code>, says which interpreter runs it. Make it executable with <code>chmod +x</code> and run it with <code>./script.sh</code>.',
        'Assign without spaces: <code>name="ssk"</code>. Read with <code>$name</code> or <code>${name}</code>. Always double-quote variables (<code>"$file"</code>) so names with spaces stay intact.',
        'Special variables: <code>$1 $2</code> arguments, <code>$#</code> count, <code>$@</code> all arguments, <code>$?</code> last exit code, <code>$$</code> this PID.'
      ],
      code: '#!/usr/bin/env bash\nset -euo pipefail\n\nname="${1:-world}"\ntoday=$(date +%F)\n\necho "Hello, $name! Today is $today."\necho "You passed $# argument(s)."',
      cmds: [
        ['cat scripts/hello.sh', 'Look at the example script'],
        ['bash scripts/hello.sh ssk', 'Run it with an argument', 'Hello, ssk! Today is 2026-11-05.\nYou passed 1 argument(s).'],
        ['name="Linuxverse"; echo "Hi $name"', 'Set and use a variable', 'Hi Linuxverse'],
        ['echo "Today: $(date +%A)"', 'Command substitution', 'Today: Thursday'],
        ['export EDITOR=nano', 'Make a variable visible to child processes'],
        ['bash -n scripts/hello.sh', 'Syntax check without running'],
        ['shellcheck scripts/hello.sh', 'Lint a script (shellcheck package)']
      ],
      demo: ['cat scripts/hello.sh', 'bash scripts/hello.sh ssk'],
      tips: ['<code>set -euo pipefail</code> makes scripts stop on errors, on unset variables and on failures inside pipelines.']
    },
    {
      id: 'exitcodes', title: 'Exit codes, && and ||', sum: 'Success is 0; chain commands on it.',
      explain: [
        'Every command returns an <b>exit status</b>: 0 means success, anything else is failure. <code>echo $?</code> shows the last one.',
        '<code>a &amp;&amp; b</code> runs b only if a succeeded. <code>a || b</code> runs b only if a failed. <code>a ; b</code> runs both regardless.'
      ],
      anim: {
        nodes: [['a', 60, 40, 'mkdir build', 'proc'], ['q', 180, 40, 'exit 0?', 'kernel'], ['b', 310, 40, '&& cd build', 'user'], ['c', 180, 150, '|| echo "failed"', 'hw']],
        edges: [['a', 'q'], ['q', 'b'], ['q', 'c']],
        steps: [
          { t: 'mkdir build runs and returns an exit status.', hi: ['a'], flow: [['a', 'q']] },
          { t: 'Status 0 (success): the && branch runs.', hi: ['b'], flow: [['q', 'b']] },
          { t: 'Non-zero (for example the folder already exists): the || branch runs instead.', hi: ['c'], flow: [['q', 'c']] }
        ]
      },
      cmds: [
        ['ls /etc > /dev/null; echo $?', 'Exit code of a successful command', '0'],
        ['ls /nope; echo $?', 'Exit code of a failure', 'ls: cannot access \'/nope\': No such file or directory\n2'],
        ['mkdir lab && cd lab', 'Second runs only on success'],
        ['ping -c1 192.0.2.1 > /dev/null || echo "gateway down"', 'Fallback on failure'],
        ['true && echo yes || echo no', 'Classic one-line if/else', 'yes'],
        ['false && echo yes || echo no', 'And the failing case', 'no']
      ],
      demo: ['true && echo yes || echo no', 'false && echo yes || echo no']
    },
    {
      id: 'loops', title: 'Conditions & loops', sum: 'if, test, for, while and functions.',
      explain: [
        '<code>[[ ... ]]</code> tests conditions: <code>-f file</code> exists as a file, <code>-d dir</code> directory, <code>-z "$s"</code> empty string, <code>$a -gt $b</code> numeric greater-than, <code>==</code> string equal.',
        '<code>for</code> loops over a list; <code>while</code> loops while a condition holds. Functions group commands and take arguments like scripts do.'
      ],
      code: '#!/usr/bin/env bash\nbackup() {\n  local src="$1"\n  if [[ -d "$src" ]]; then\n    tar -czf "${src%/}-$(date +%F).tar.gz" "$src"\n    echo "Backed up $src"\n  else\n    echo "Skip: $src is not a directory" >&2\n  fi\n}\n\nfor dir in projects scripts missing; do\n  backup "$dir"\ndone\n\ncount=3\nwhile (( count > 0 )); do\n  echo "T-minus $count"\n  (( count-- ))\ndone',
      cmds: [
        ['for f in *.txt; do echo "$f"; done', 'Loop over files'],
        ['for i in {1..5}; do echo "item $i"; done', 'Loop over a range'],
        ['[[ -f notes.txt ]] && echo exists', 'Test whether a file exists'],
        ['while read -r line; do echo ">> $line"; done < notes.txt', 'Read a file line by line'],
        ['case "$1" in start) echo go;; stop) echo halt;; *) echo "usage";; esac', 'Branch on a value']
      ],
      table: { head: ['Test', 'True when'], rows: [['-f path', 'Regular file exists'], ['-d path', 'Directory exists'], ['-x path', 'Executable'], ['-z "$s"', 'String is empty'], ['-n "$s"', 'String is not empty'], ['$a -eq $b', 'Numbers equal (also -ne -lt -le -gt -ge)']] }
    }
  ]
});

LV.tool({
  systemctl: { syntax: 'systemctl [OPTIONS] COMMAND [UNIT...]', desc: 'Control the systemd system and service manager.' },
  journalctl: { syntax: 'journalctl [OPTIONS] [MATCHES]', desc: 'Query the systemd journal.' },
  'systemd-analyze': { syntax: 'systemd-analyze [OPTIONS] [COMMAND]', desc: 'Analyse and debug the system manager.' },
  crontab: { syntax: 'crontab [-e | -l | -r]', desc: 'Maintain crontab files for individual users.' },
  lsblk: { syntax: 'lsblk [options] [device...]', desc: 'List block devices.' },
  mount: { syntax: 'mount [options] device dir', desc: 'Mount a filesystem.' },
  ip: { syntax: 'ip [OPTIONS] OBJECT COMMAND', desc: 'Show and manipulate routing, devices and addresses.' },
  ss: { syntax: 'ss [options] [FILTER]', desc: 'Investigate sockets.' },
  ping: { syntax: 'ping [options] destination', desc: 'Send ICMP echo requests to network hosts.' },
  curl: { syntax: 'curl [options] URL...', desc: 'Transfer data from or to a server.' },
  dig: { syntax: 'dig [@server] name [type]', desc: 'DNS lookup utility.' },
  nmcli: { syntax: 'nmcli [OPTIONS] OBJECT COMMAND', desc: 'Command-line tool for controlling NetworkManager.' },
  ssh: { syntax: 'ssh [options] [user@]host [command]', desc: 'OpenSSH remote login client.' },
  'ssh-keygen': { syntax: 'ssh-keygen [-t type] [-C comment]', desc: 'Generate and manage authentication keys.' },
  scp: { syntax: 'scp [options] source... target', desc: 'Secure copy over SSH.' },
  rsync: { syntax: 'rsync [OPTION...] SRC... DEST', desc: 'Fast, incremental file copying.' },
  ufw: { syntax: 'ufw [--dry-run] COMMAND', desc: 'Uncomplicated Firewall front-end.' },
  'firewall-cmd': { syntax: 'firewall-cmd [OPTIONS...]', desc: 'firewalld command-line client.' },
  bash: { syntax: 'bash [options] [file]', desc: 'GNU Bourne-Again SHell.' },
  echo: { syntax: 'echo [STRING]...', desc: 'Display a line of text.' },
  cat: { syntax: 'cat [FILE]...', desc: 'Concatenate files and print them.' }
});
