/* Linuxverse "?" guide: every feature, with a jump that takes you to it and spotlights it */
(function () {
  'use strict';
  function A() { return LV.app; }
  var GROUPS = [
    { name: 'Top bar', items: [
      { t: 'Logo · go Home', d: 'Tap the Linuxverse logo from anywhere to return to the home screen.', sel: '#logo' },
      { t: 'Search', d: 'Search topics, commands and labs as you type. Tap a result to jump straight to it. Shortcut: press / on a keyboard.', sel: '#q-wrap' },
      { t: 'Display mode', d: 'Cycles Auto, Mobile, Tablet and Web. Auto detects your screen size and touch input and keeps adjusting if you resize or rotate. The other three force that layout: sizes, spacing, touch targets and column widths are tuned for each. Remembered on this device.', sel: '#btn-mode' },
      { t: 'Quick jump buttons', d: 'The animated pills under the search bar jump straight to a part of the page: on Home that is Start here, Ideas, Folder, Terminal, Challenges, the learning path and Games & labs. On other pages they list that page\'s sections. The highlighted pill follows where you are scrolling.', sel: '#qj' },
      { t: '? How to use', d: 'Opens this guide. Every entry has Show me, which takes you to that feature and highlights it. The orange Quick view button at the top walks through all entries one by one (Next, Prev, Stop, or the arrow keys). Shortcut: press ?.', sel: '#btn-help' },
      { t: 'Ambience music', d: 'Starts the background music and opens the mini player. Tap again to hide the player; the music keeps playing.', sel: '#btn-music' },
      { t: 'Dark / light theme', d: 'Switches between dark and light. Your choice is remembered on this device. Until you choose, the app follows your system setting.', sel: '#btn-theme' },
      { t: 'Colour palette', d: 'Opens six colour palettes (Amber, Ocean, Violet, Rose, Forest, Slate). The choice changes the accent colours everywhere and works in both dark and light mode. It is remembered on this device.', sel: '#btn-palette' }
    ] },
    { name: 'Home: theory first', items: [
      { t: 'Start with theory', d: 'The first button on Home jumps to the theory walkthrough: learn an idea, see it in an example folder, then use it.', go: 'home', sel: '#cta-theory' },
      { t: '1 · Learn the idea', d: 'One hundred core ideas in nine groups (Basics, Security, Programs, Files, Text, System, Network, Scripting, Tools). Pick any idea from the drop-down menu, grouped by topic. Each has the theory, key points, a common mistake, where it shows up in the example folder, and a Try it command (with a copy button). Finished ideas get a tick.', go: 'home', sel: '#ex-chips' },
      { t: '2 · Example folder', d: 'A real folder, ~/website. Items that belong to the current idea glow. Tap any file or folder to inspect it.', go: 'home', sel: '#ex-tree' },
      { t: 'Item details', d: 'Shows the absolute and relative path, type, permissions in words, the ls -l line and commands to use on that item.', go: 'home', sel: '#ex-detail' },
      { t: '3 · Use it', d: 'A practice terminal working on the same folder. Run buttons type commands here; you can type your own. Changes (chmod, touch, rm) show up in the folder at once.', go: 'home', sel: '#ex-term' },
      { t: 'Reset folder', d: 'Restores the example folder to how it started.', go: 'home', sel: '#ex-reset' }
    ] },
    { name: 'Progress & practice', items: [
      { t: 'Your progress card', d: 'Shows how far you are, what you have finished, and a Continue button that returns you to the last topic you opened. Starred topics appear here too.', go: 'home', sel: '#cont' },
      { t: 'Start here (25 steps)', d: 'A beginner route that mixes ideas, topics and labs in a sensible order. Steps tick off as you finish them, and the next one is outlined.', go: 'home', sel: '#path' },
      { t: 'Try it now (every topic)', d: 'Under the key terms of each topic, three commands you can run straight away in a safe shell that contains the example folder.', go: 't-chmod--explain', sel: '#tryit' },
      { t: 'Mark as done', d: 'At the bottom of a topic. Finished topics show a green tick in the lists and count towards your progress. Tap again to undo.', go: 't-chmod--explain', sel: '#done-btn' },
      { t: 'Star a topic', d: 'The star beside a topic title saves it. Saved topics are listed on Home and at the top of Learn.', go: 't-chmod--explain', sel: '#bm-btn' },
      { t: 'Section quiz', d: 'Open any section and scroll to the end. Four short questions with an explanation after each answer. Three right passes the quiz and your best score is kept.', go: 's-perms', sel: '#quiz' },
      { t: 'Challenges', d: 'On Home, step 4 gives you a goal to reach in the practice terminal, for example making a script executable. It checks your work automatically and has a hint and the answer if you are stuck.', go: 'home', sel: '#ex-chal' },
      { t: 'Report a mistake', d: 'Opens an email to the author with the topic name filled in, so a wrong or unclear line can be fixed.', go: 't-chmod--explain', sel: '.topic-end .report' }
    ] },
    { name: 'Getting around', items: [
      { t: 'Bottom navigation', d: 'Four places: Home, Learn (every section and topic), Terminal and Labs.', sel: '#bnav' },
      { t: 'Learning path', d: 'Sections on the Home screen, in recommended order. Each card shows how many topics it has.', go: 'home', sel: '#sec-grid' },
      { t: 'Topic list', d: 'Learn lists every section with its topics. Badges show which topics have an animation (Visual) or an interactive lab (Live).', go: 'learn', sel: '.learn-sec' },
      { t: 'A–Z of Linux', d: 'A searchable dictionary of 900+ Linux words and commands, A to Z. Jump by letter, filter, try the examples and open the related topic.', go: 'az', sel: '#az-bar' },
      { t: 'Back and forward', d: 'Your browser or phone Back button walks back through the screens you visited.', go: 'learn', sel: '#bnav' }
    ] },
    { name: 'Inside a topic', items: [
      { t: 'Topic tabs', d: 'Each topic has up to four tabs: Explain, Visual, Commands and Live.', go: 't-chmod', sel: '.tabs' },
      { t: 'Explain tab', d: 'Plain-language explanation, key terms and comparison tables.', go: 't-chmod--explain', sel: '.explain' },
      { t: 'Visual tab (animation)', d: 'A step-by-step animated diagram. Glowing dots show data moving between parts.', go: 't-chmod--visual', sel: '.anim-stage' },
      { t: 'Animation controls', d: 'Play/pause, previous and next step, restart, or tap a dot to jump to a step.', go: 't-chmod--visual', sel: '.anim-ctrl' },
      { t: 'Commands tab', d: 'Every command with what it does and a badge when it applies to one distro family only.', go: 't-chmod--commands', sel: '.cmd-row' },
      { t: 'Run (animated result)', d: 'Runs the command in a safe simulated shell and types out the result right under it.', go: 't-chmod--commands', sel: '.cmd-row .run' },
      { t: 'Copy a command', d: 'Copies the command so you can paste it into a real terminal.', go: 't-chmod--commands', sel: '.cmd-row .copy-cmd' },
      { t: 'Open in terminal', d: 'Sends the command to the full Terminal and runs it there, where you can keep experimenting.', go: 't-chmod--commands', sel: '.cmd-row .to-term' },
      { t: 'Flags table', d: 'The most useful options for the commands in this topic.', go: 't-chmod--commands', sel: '.flags' },
      { t: 'Live tab (lab)', d: 'An interactive tool that really computes: change inputs and the result updates instantly.', go: 't-chmod--live', sel: '.lab' },
      { t: 'Demo replay', d: 'Replays a short terminal session for the topic, typed out step by step.', go: 't-chmod--live', sel: '.demo-box' },
      { t: 'Previous / next topic', d: 'Move through the course in order at the bottom of each topic.', go: 't-chmod--explain', sel: '.pn-nav' }
    ] },
    { name: 'Terminal', items: [
      { t: 'Simulated terminal', d: 'A safe practice shell with a virtual filesystem. Nothing runs on your device.', go: 'term', sel: '#term-main' },
      { t: 'Type and run', d: 'Type a command, then press Enter or the ▶ button. Pipes (|), &&, ||, ; and > redirection all work.', go: 'term', sel: '#term-in' },
      { t: 'Tab completion & history', d: 'Tab completes commands and file names. Arrow up/down recalls earlier commands. Type history to list them.', go: 'term', sel: '#term-in' },
      { t: 'Quick commands', d: 'Tap a chip to type and run a starter command.', go: 'term', sel: '#quick' },
      { t: 'Command browser', d: 'Every documented command, filterable by section. Tap one to run it, or type in the filter and press Enter.', go: 'term', sel: '#tb-wrap' },
      { t: 'Clear the screen', d: 'The circular arrow clears output. You can also type clear or press Ctrl+L.', go: 'term', sel: '.t-clear' }
    ] },
    { name: 'Labs', items: [
      { t: 'All labs', d: 'Six study games (command match, permission puzzle, typing race, pipeline puzzle, command doctor, where am I) and eighteen interactive tools: chmod, umask, directory tree, pipelines, grep, signals, memory and load, cron, subnets, package commands, sed, find, tar, date formats, SSH tunnels, systemd units, an ls -l decoder and rsync.', go: 'labs', sel: '.lab-index' },
      { t: 'Lab command line', d: 'Each lab shows the matching real command, with copy and open-in-terminal buttons.', go: 'lab-chmod', sel: '.lab-cmd' }
    ] },
    { name: 'Music player', items: [
      { t: 'Mini player', d: 'Ten generated soundscapes: Kernel Hum, Midnight Rain, Deep Focus, Night Compile, Orbit Drift, Ocean Tide, Forest Night, Lo-fi Terminal, Coffee Shop and Aurora Pads. No downloads, works offline.', player: true, sel: '#player .pl-body' },
      { t: 'Play, previous, next', d: 'Tracks crossfade smoothly when you switch.', player: true, sel: '#pl-ctrls' },
      { t: 'Volume', d: 'Drag to set the volume. It is remembered next time.', player: true, sel: '#pl-vol' },
      { t: 'Track list', d: 'Pick any of the ten tracks directly (the list scrolls).', player: 'list', sel: '#pl-list' },
      { t: 'Minimise or close', d: 'Minimise turns the player into a small bubble (tap it to expand). Close stops the music.', player: true, sel: '#pl-min' }
    ] },
    { name: 'App', items: [
      { t: 'Install & offline', d: 'Linuxverse is a Progressive Web App. In a browser, use Install (or Add to Home Screen) and it works fully offline afterwards.', go: 'home', sel: '#footer' },
      { t: 'Keyboard shortcuts', d: '/ focuses search, ? opens this guide, Esc closes panels and the spotlight.', sel: '#btn-help' }
    ] }
  ];
  LV.helpGroups = GROUPS;

  var sheet, tour = -1, flat = [];
  GROUPS.forEach(function (g) { g.items.forEach(function (it) { flat.push({ it: it, g: g.name }); }); });
  function render(filter) {
    var q = (filter || '').toLowerCase(), n = 0;
    LV.$('#help-list').innerHTML = GROUPS.map(function (g, gi) {
      var items = g.items.map(function (it, ii) {
        if (q && (it.t + ' ' + it.d).toLowerCase().indexOf(q) < 0) return '';
        n++;
        return '<li><button class="help-item" data-g="' + gi + '" data-i="' + ii + '"><span class="hi-t">' + LV.esc(it.t) + '</span><span class="hi-d">' + LV.esc(it.d) + '</span><span class="hi-go">Show me ' + LV.icon('chev') + '</span></button></li>';
      }).join('');
      return items ? '<h3 class="help-g">' + g.name + '</h3><ul>' + items + '</ul>' : '';
    }).join('') || '<p class="muted">Nothing matches “' + LV.esc(filter) + '”.</p>';
    return n;
  }

  function spotlight(sel, it) {
    var el = LV.$$(sel).filter(function (x) { return x.offsetParent !== null || getComputedStyle(x).position === 'fixed'; })[0];
    if (!el && tour < 0) { LV.toast('That item is not on screen right now.'); return; }
    var fixed = !el || !!el.closest('#hdr, #bnav, #player');
    var tall = !fixed && el.offsetHeight > window.innerHeight * 0.45;
    if (!fixed) { if (tall) el.style.scrollMarginTop = '150px'; el.scrollIntoView({ block: tall ? 'start' : 'center', behavior: LV.reduced() || tour >= 0 ? 'auto' : 'smooth' }); }
    setTimeout(function () {
      var r = el ? el.getBoundingClientRect() : { top: window.innerHeight / 3, left: 0, width: 0, height: 0 }, sp = LV.$('#spot'), ring = LV.$('#spot-ring'), tip = LV.$('#spot-tip');
      var pad = 6, vw = window.innerWidth, vh = window.innerHeight;
      var top = Math.max(4, r.top - pad), left = Math.max(4, r.left - pad), w = Math.min(vw - 8, r.width + pad * 2), h = Math.min(tall ? Math.round(vh * 0.4) : vh - 8, r.height + pad * 2);
      ring.style.cssText = 'top:' + top + 'px;left:' + left + 'px;width:' + Math.max(0, Math.min(w, vw - left - 4)) + 'px;height:' + h + 'px';
      if (tour >= 0) {
        tip.innerHTML = '<span class="tip-n mono">' + (tour + 1) + ' of ' + flat.length + ' · ' + LV.esc(flat[tour].g) + '</span><b>' + LV.esc(it.t) + '</b><p>' + LV.esc(it.d) + (el ? '' : ' (Not visible on this screen.)') + '</p>' +
          '<div class="tip-acts"><button class="btn ghost sm" id="spot-stop">Stop</button><button class="btn ghost sm" id="spot-prev"' + (tour === 0 ? ' disabled' : '') + '>' + LV.icon('back') + ' Prev</button><button class="btn sm" id="spot-next">' + (tour === flat.length - 1 ? 'Finish' : 'Next ' + LV.icon('chev')) + '</button></div>';
      } else {
        tip.innerHTML = '<b>' + LV.esc(it.t) + '</b><p>' + LV.esc(it.d) + '</p><div class="tip-acts"><button class="btn ghost sm" id="spot-back">Back to guide</button><button class="btn sm" id="spot-ok">Got it</button></div>';
      }
      sp.hidden = false;
      var th = tip.offsetHeight, below = top + h + 10;
      tip.style.top = (below + th < vh - 8 ? below : Math.max(8, top - th - 10)) + 'px';
      sp.classList.add('show');
      var fb = LV.$('#spot-ok') || LV.$('#spot-next'); if (fb) fb.focus({ preventScroll: true });
    }, fixed ? 30 : tour >= 0 ? 90 : 420);
  }
  function hideSpot() { var sp = LV.$('#spot'); sp.classList.remove('show'); sp.hidden = true; }
  function closeSpot() { tour = -1; hideSpot(); }
  function showTour(i) {
    if (i < 0 || i >= flat.length) { closeSpot(); return; }
    tour = i; hideSpot();
    var it = flat[i].it;
    if (it.player) { LV.amb.show(false); if (it.player === 'list') LV.amb.openList(); }
    if (it.go) A().go(it.go);
    setTimeout(function () { if (tour === i) spotlight(it.sel, it); }, it.go ? 280 : 80);
  }

  LV.help = {
    init: function () {
      sheet = LV.$('#help');
      sheet.innerHTML =
        '<div class="sheet-card" role="dialog" aria-modal="true" aria-labelledby="help-title">' +
        '<div class="sheet-h"><div><h2 id="help-title">How to use Linuxverse</h2><p class="muted sm">Tap any entry and the app takes you there.</p></div><button class="ibtn" id="help-close" aria-label="Close guide">' + LV.icon('close') + '</button></div>' +
        '<button class="btn tour-btn" id="help-tour">' + LV.icon('play') + ' Quick view: all ' + flat.length + ' one by one</button>' +
        '<label class="search mini-s">' + LV.icon('search') + '<input id="help-q" placeholder="Filter the guide" aria-label="Filter the guide" autocomplete="off"></label>' +
        '<div class="help-scroll" id="help-list"></div></div>';
      render('');
      LV.$('#help-q').addEventListener('input', function (e) { render(e.target.value); });
      LV.$('#help-close').onclick = LV.help.close;
      LV.$('#help-tour').onclick = function () { LV.help.close(); showTour(0); };
      document.addEventListener('keydown', function (e) {
        if (tour < 0) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); showTour(tour + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); showTour(tour - 1); }
      });
      sheet.addEventListener('click', function (e) {
        if (e.target === sheet) { LV.help.close(); return; }
        var b = e.target.closest('.help-item'); if (!b) return;
        var it = GROUPS[+b.dataset.g].items[+b.dataset.i];
        LV.help.close();
        if (it.player) { LV.amb.show(false); if (it.player === 'list') LV.amb.openList(); }
        if (it.go) A().go(it.go);
        setTimeout(function () { spotlight(it.sel, it); }, it.go ? 260 : 60);
      });
      LV.$('#spot').addEventListener('click', function (e) {
        var id = e.target.closest('button') ? e.target.closest('button').id : '';
        if (id === 'spot-next') { showTour(tour + 1); return; }
        if (id === 'spot-prev') { showTour(tour - 1); return; }
        if (id === 'spot-stop') { closeSpot(); return; }
        if (e.target.id === 'spot-back') { closeSpot(); LV.help.open(); return; }
        closeSpot();
      });
    },
    open: function () { sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('show'); }); LV.$('#btn-help').setAttribute('aria-expanded', 'true'); setTimeout(function () { var q = LV.$('#help-q'); if (q && window.innerWidth > 700) q.focus(); }, 50); },
    close: function () { sheet.classList.remove('show'); sheet.hidden = true; LV.$('#btn-help').setAttribute('aria-expanded', 'false'); },
    isOpen: function () { return !sheet.hidden; },
    closeSpot: closeSpot,
    spotOpen: function () { return !LV.$('#spot').hidden; },
    tour: showTour,
    touring: function () { return tour >= 0; },
    count: function () { return GROUPS.reduce(function (n, g) { return n + g.items.length; }, 0); }
  };
})();
