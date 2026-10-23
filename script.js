/* ==========================================================================
   SNESBOY standalone frontend logic (`script.js`)
   Drives an EmulatorJS SNES core underneath the SNESBOY CSS-art shell.
   NOTE: the template 8-bit-only core script tag is intentionally NOT used:
   that core cannot run SNES ROMs.
   ========================================================================== */
(function(){
  'use strict';

  /* Games shipped with the playground. They are seeded into the browser
     library on first load, so MY GAMES shows the whole set immediately. */
  var BUILTIN_ROMS = [
    { name: 'Donkey Kong Country (USA) (Rev 2).sfc', label: 'Donkey Kong Country (Rev 2)' },
    { name: 'Doom (USA).sfc', label: 'Doom' },
    { name: 'Killer Instinct (USA) (Rev 1).sfc', label: 'Killer Instinct (Rev 1)' },
    { name: 'Legend of Zelda, The - A Link to the Past (USA).sfc', label: 'Zelda: A Link to the Past' },
    { name: 'Street Fighter II Turbo (USA).sfc', label: 'Street Fighter II Turbo' },
    { name: 'Super Mario World (USA).sfc', label: 'Super Mario World' },
    { name: 'Super Punch-Out!! (USA).sfc', label: 'Super Punch-Out!!' },
    { name: 'Ultimate Mortal Kombat 3 (USA).sfc', label: 'Ultimate Mortal Kombat 3' },
    { name: 'WWF Raw (USA).sfc', label: 'WWF Raw' },
    { name: 'WWF Royal Rumble (USA).sfc', label: 'WWF Royal Rumble' },
    { name: 'WWF WrestleMania - The Arcade Game (USA).sfc', label: 'WWF WrestleMania: The Arcade Game' },
    { name: 'Super Mario All-Stars (USA).sfc', label: 'Super Mario All-Stars', file: 'super-mario-all-stars-usa.sfc' }
  ].map(function(r){
    return { name: r.name, label: r.label, url: encodeURI(r.file || r.name), builtin: true };
  });
  var BUILTIN_BY_NAME = {};
  BUILTIN_ROMS.forEach(function(r){ BUILTIN_BY_NAME[r.name] = r; });
  function romLabel(entry){
    if(!entry) return '';
    if(entry.label) return entry.label;
    var b = BUILTIN_BY_NAME[entry.name];
    if(b && b.label) return b.label;
    return String(entry.name || '').replace(/\.[^.]+$/, '');
  }
  function sortLibrary(entries){
    var order = {};
    BUILTIN_ROMS.forEach(function(r, i){ order[r.name] = i; });
    return entries.slice().sort(function(a, b){
      var ai = order[a.name], bi = order[b.name];
      var ab = ai == null ? 9999 : ai, bb = bi == null ? 9999 : bi;
      if(ab !== bb) return ab - bb;
      return String(romLabel(a)).localeCompare(String(romLabel(b)));
    });
  }
  var BUNDLED = BUILTIN_ROMS[BUILTIN_ROMS.length - 1];

  /* data-button (template scheme) -> emulator keyboard key.
     Matches EJS_defaultControls below and the on-page key charts. */
  var KEYMAP = {
    '0': 'a', '1': 'b', '2': 'v', '3': 'Enter',
    '4': 'ArrowUp', '5': 'ArrowDown', '6': 'ArrowLeft', '7': 'ArrowRight',
    '8': 'y', '9': 'x'
  };

  var booted = false;
  var playing = false;
  var powering = false;
  var powerTimer = null;
  var powerNeedsReboot = false;
  var currentUrl = BUNDLED.url;
  var currentName = BUNDLED.name;
  var muted = false;
  var crtOn = false;
  var autoOn = false;

  function $(s, r){ return (r || document).querySelector(s); }
  function $all(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- status text + LEDs ---------- */
  function setStatus(main, sub){
    [['handheld-status-text', main], ['desktop-status-text', main]].forEach(function(p){
      var e = document.getElementById(p[0]); if(e) e.textContent = p[1];
    });
    [['handheld-sub-text', sub], ['desktop-sub-text', sub]].forEach(function(p){
      var e = document.getElementById(p[0]); if(e) e.textContent = p[1];
    });
  }
  function showStandby(on){
    [['handheld-off-message', on], ['desktop-off-message', on]].forEach(function(p){
      var e = document.getElementById(p[0]); if(e) e.classList.toggle('hidden', !on);
    });
  }
  function setLeds(on){
    var tv = document.getElementById('tv-led'); if(tv) tv.classList.toggle('active', on);
    var cl = document.getElementById('snes-console-led'); if(cl) cl.classList.toggle('active', on);
    var pb = document.getElementById('btn-power'); if(pb) pb.classList.toggle('power-on', on);
    var cb = document.getElementById('power-checkbox'); if(cb) cb.checked = on;
  }

  /* ---------- emulator stage (single instance, moves with layout) ---------- */
  var stage = document.createElement('div');
  stage.id = 'ejs-stage';
  var crt = document.createElement('div');
  crt.className = 'crt-overlay';
  crt.style.display = 'none';

  var mq = window.matchMedia('(min-width: 1024px)');
  function placeStage(){
    var host = mq.matches
      ? document.querySelector('#desktop-view .tv-screen-bezel')
      : document.querySelector('#handheld-view .screen-bezel');
    if(host){
      if(stage.parentNode !== host) host.insertBefore(stage, host.firstChild);
      if(crt.parentNode !== host) host.appendChild(crt);
    }
    window.dispatchEvent(new Event('resize'));
  }
  if(mq.addEventListener) mq.addEventListener('change', placeStage);
  else if(mq.addListener) mq.addListener(placeStage);

  function ejsButton(pred){
    var btns = $all('#ejs-stage button');
    for(var i = 0; i < btns.length; i++){
      var t = ((btns[i].textContent || '') + ' ' + (btns[i].title || '')).toLowerCase();
      if(pred(t.trim(), btns[i])) return btns[i];
    }
    return null;
  }

  /* ---------- boot / power / reset / eject ---------- */
  /* One instance only: shut down any running emulator before (re)booting,
     so audio/video can never double up. */
  function stopExisting(){
    powering = false;
    if(powerTimer){ clearInterval(powerTimer); powerTimer = null; }
    replayTimers.forEach(clearTimeout);
    replayTimers = []; replayingId = null;
    releaseReplayHeld();
    releaseAuto();
    try{
      if(window.EJS_emulator && typeof window.EJS_emulator.callEvent === 'function'){
        window.EJS_emulator.callEvent('exit');
      }
    }catch(e){}
    playing = false;
  }

  /* The core ignores keyboard until its input gate is opened. The
     'keyboardInput' default option SHOULD do this, but the direct call is
     deterministic, so do both. Called on ready/start (gameManager only
     exists once the emulator instance is up). */
  function enableKeyboard(){
    var tries = 0;
    var iv = setInterval(function(){
      tries++;
      try{
        var gm = window.EJS_emulator && window.EJS_emulator.gameManager;
        if(gm && typeof gm.setKeyboardEnabled === 'function'){
          gm.setKeyboardEnabled(true);
          clearInterval(iv); return;
        }
      }catch(e){}
      if(tries > 40) clearInterval(iv);
    }, 250);
  }

  function boot(url, name){
    stopExisting();
    powerNeedsReboot = false;
    currentUrl = url; currentName = name || currentName;
    loadManualForGame(currentName);
    window.EJS_player = '#ejs-stage';
    window.EJS_gameName = currentName;
    window.EJS_core = 'snes';
    window.EJS_color = '#7e22ce';
    window.EJS_backgroundColor = '#000';
    window.EJS_alignStartButton = 'center';
    window.EJS_startOnLoaded = true; /* user POWER press = the gesture that unfreezes boot */
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_gameUrl = url;
    window.EJS_gameID = 9587;
    window.EJS_disableAutoLang = true;
    window.EJS_language = 'en-US';
    window.EJS_askBeforeExit = false;
    window.EJS_Buttons = { screenRecord: false, cheat: false, cacheManager: false, gamepad: false };
    /* Without this, the core ignores ALL keyboard input (real or synthetic). */
    window.EJS_defaultOptions = { keyboardInput: 'enabled' };
    /* Stock key bindings are kept: pads and the physical keyboard drive
       the core directly (driveIndex), so EJS key mapping is irrelevant. */
    window.EJS_ready = function(){
      enableKeyboard();
      assignUsbPad();
      setStatus(currentName.toUpperCase().slice(0, 32), playing ? 'NOW PLAYING' : 'PRESS POWER');
    };
    window.EJS_onGameStart = function(){
      playing = true; showStandby(false); setLeds(true);
      enableKeyboard();
      setStatus(currentName.toUpperCase().slice(0, 32), 'NOW PLAYING');
    };
    window.EJS_onExit = function(){
      playing = false; showStandby(true); setLeds(false);
      setStatus('POWER IS OFF', 'PRESS POWER TO START');
    };
    var old = document.getElementById('ejs-loader'); if(old) old.remove();
    stage.innerHTML = '';
    var s = document.createElement('script');
    s.id = 'ejs-loader'; s.src = 'https://cdn.emulatorjs.org/stable/data/loader.js'; s.async = true;
    document.body.appendChild(s);
    booted = true;
  }

  function powerOn(){
    if(powering) return; /* single flight: rapid POWER mashes, one attempt */
    showStandby(false);
    /* EJS exit leaves a stopped core with no Start button: reload it so
       POWER actually resumes the game (and the AI loops) after a shutdown. */
    if(powerNeedsReboot){
      powerNeedsReboot = false;
      boot(currentUrl, currentName);
      return;
    }
    powering = true;
    var tries = 0;
    powerTimer = setInterval(function(){
      tries++;
      var b = stage.querySelector('.ejs_start_button') ||
        ejsButton(function(t){ return /^start game/.test(t); });
      if(b){ try{ b.click(); }catch(e){} clearInterval(powerTimer); powerTimer = null; powering = false; }
      else if(playing || tries > 40){
        clearInterval(powerTimer); powerTimer = null; powering = false;
        if(!playing) showStandby(true);
      }
    }, 250);
  }
  function powerOff(){
    powering = false;
    if(powerTimer){ clearInterval(powerTimer); powerTimer = null; }
    releaseAuto(); /* drop holds; the autopilot itself stays on and resumes on power-up */
    var done = false;
    try{
      if(window.EJS_emulator && typeof window.EJS_emulator.callEvent === 'function'){
        window.EJS_emulator.callEvent('exit'); done = true;
      }
    }catch(e){}
    if(!done){
      var b = ejsButton(function(t){ return t.indexOf('exit emulation') !== -1 || t === 'exit'; });
      if(b){ try{ b.click(); done = true; }catch(e){} }
    }
    if(!done) boot(currentUrl, currentName);
    powerNeedsReboot = done;
    playing = false; showStandby(true); setLeds(false);
    setStatus('POWER IS OFF', 'PRESS POWER TO START');
  }
  function togglePower(){ if(!booted) boot(currentUrl, currentName); if(playing) powerOff(); else powerOn(); }
  function resetGame(){
    var b = ejsButton(function(t){ return t.indexOf('restart') !== -1; });
    if(b && playing){ try{ b.click(); return; }catch(e){} }
    var wasOff = !playing;
    boot(currentUrl, currentName);
    if(wasOff) powerOn(); else showStandby(false);
  }

  /* ---------- synthetic input from the CSS-art pads ---------- */
  /* EJS button indices (RetroArch numbering, as used by
     gameManager.simulateInput). Template data-button -> EJS index. */
  var PADINDEX = { '0': 8, '1': 0, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 1, '9': 9 };
  /* Physical-keyboard -> EJS index (mirrors the on-page charts). */
  var PHYSINDEX = {
    a: 8, b: 0, x: 9, y: 1, v: 2, Shift: 2, Enter: 3,
    ArrowUp: 4, ArrowDown: 5, ArrowLeft: 6, ArrowRight: 7, q: 10, e: 11
  };
  /* Primary input path: drive the core directly. This is what makes the
     CSS-art pads REAL controllers. Synthetic keyboard events are still
     sent as a secondary path (see sendKey). Both set the same button
     state, so double delivery is harmless. */
  function driveIndex(idx, down, src, pl){
    try{
      var gm = window.EJS_emulator && window.EJS_emulator.gameManager;
      if(gm && typeof gm.simulateInput === 'function'){
        gm.simulateInput(pl || 0, idx, down ? 1 : 0);
      }
    }catch(e){}
    if(recOn) recInputs.push({ t: Date.now() - recT0, b: idx, d: down ? 1 : 0, s: src || '?', p: pl || 0 });
  }
  /* Which players the autopilot drives (human pads/keys stay P1). */
  function autoPlayers(){
    var out = [];
    (AgentOpts.players || [0]).forEach(function(p){
      if(p >= 0 && p <= 3 && out.indexOf(p) === -1 && out.length < 4) out.push(p);
    });
    return out.length ? out : [0];
  }
  var KEYCODES = {
    a: 65, b: 66, x: 88, y: 89, v: 86, Enter: 13,
    ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39
  };
  var KEYLOCODES = {
    a: 'KeyA', b: 'KeyB', x: 'KeyX', y: 'KeyY', v: 'KeyV', Enter: 'Enter',
    ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight'
  };
  function sendKey(key, type){
    var ev;
    try{
      ev = new KeyboardEvent(type, {
        key: key, code: KEYLOCODES[key] || '',
        bubbles: true, cancelable: true
      });
    }catch(e){
      ev = document.createEvent('Event'); ev.initEvent(type, true, true); ev.key = key;
    }
    try{
      Object.defineProperty(ev, 'keyCode', { value: KEYCODES[key] || 0 });
      Object.defineProperty(ev, 'which', { value: KEYCODES[key] || 0 });
    }catch(e2){}
    /* Dispatch on the emulator canvas itself so the event bubbles through
       every ancestor (player div ... document ... window): wherever the
       core attached its keyboard listener, it receives the press. */
    var target = stage.querySelector('canvas') || stage;
    target.dispatchEvent(ev);
  }
  $all('[data-button]').forEach(function(el){
    var db = el.getAttribute('data-button');
    var key = KEYMAP[db];
    if(key === undefined && PADINDEX[db] === undefined) return;
    var down = function(e){
      e.preventDefault(); el.classList.add('pressed');
      if(PADINDEX[db] !== undefined) driveIndex(PADINDEX[db], true, 'pad');
      if(key !== undefined) sendKey(key, 'keydown');
    };
    var up = function(e){
      if(e) e.preventDefault();
      el.classList.remove('pressed');
      try{ if(document.activeElement === el) el.blur(); }catch(e2){}
      if(PADINDEX[db] !== undefined) driveIndex(PADINDEX[db], false, 'pad');
      if(key !== undefined) sendKey(key, 'keyup');
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', function(){ if(el.classList.contains('pressed')) up(); });
    el.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  });

  /* Physical keyboard drives the core directly (same path as the pads),
     so the on-page key charts hold true even where EJS keyboard routing
     does not. Arrows/space must not scroll the page. */
  function physIndex(e){
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    return PHYSINDEX[k];
  }
  document.addEventListener('keydown', function(e){
    if(e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    var modalOpen = !document.getElementById('library-modal').classList.contains('hidden') ||
                    !document.getElementById('info-modal').classList.contains('hidden') ||
                    !document.getElementById('ai-modal').classList.contains('hidden');
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) !== -1 && !modalOpen){
      e.preventDefault();
    }
    if(modalOpen || e.repeat) return;
    var idx = physIndex(e);
    if(idx !== undefined){
      e.preventDefault();
      driveIndex(idx, true, 'key');
    }
  });
  document.addEventListener('keyup', function(e){
    var idx = physIndex(e);
    if(idx !== undefined) driveIndex(idx, false, 'key');
  });

  function releasePilot(pl){
    /* release only one pilot's buttons: P1 seeking must not drop P2's hold */
    for(var i = 0; i <= 11; i++) driveIndex(i, false, 'sys', pl);
  }
  function releaseAuto(){
    /* panic release: every button on every player, used on stop/rebuild */
    for(var pl = 0; pl <= 3; pl++) releasePilot(pl);
  }

  /* ---------- screen-reactive autopilot (AI Lab): independent copilots ---
     One engine per driven player — same screen, own timers, motion history,
     steering vote, menu guard and release path. Every pilot works the menus,
     senses, modes and plays for itself (phase-offset beats, own button
     order), so P2 never parrots P1 and one pilot's transition never drops
     the other's holds.
     SEEK (still frames — any menu, pause, title, black transition screen):
       character-select grids are walked with short dpad steps before the
       confirm, then START on every driven player; never holds directions so
       it can't fight cursors on any system.
     PLAY (the picture moves — scrolling, pans, action): holds the forward
       button hard, holds run/dash only while the pixels demand it, and each
       pilot works the action buttons + shoulders on its own beat.
     Silence heals: freeze, game-over, quiet black screen → every pilot back
     to SEEK, taps its own way out of whatever menu maze comes next. */
  /* ---------- agent options + button map (persisted, tunable in AI Lab) --- */
  var AgentDefaults = {
    senseMs: 2000, tapMs: 4000, seekCycle: '2,2,3,8,5,4',
    driveMs: 300, hopEvery: 3, hopPulseMs: 260,
    hiThresh: 8, hiStreak: 3, loThresh: 4, loStreak: 3, blackMean: 10,
    players: [0, 1], hud: false, autoTune: true, profile: 'generic', world: true
  };
  var AgentOpts = {};
  try{
    var rawOwn = {};
    try{ rawOwn = JSON.parse(localStorage.getItem('snesboy-agent') || '{}'); }catch(e){}
    AgentOpts = Object.assign({}, AgentDefaults, rawOwn);
    /* players defaulted to P1-only before Both existed — migrate old saves */
    if(!rawOwn || !('players' in rawOwn)) AgentOpts.players = [0, 1];
    if(!rawOwn || !('autoTune' in rawOwn)) AgentOpts.autoTune = true;
    if(!rawOwn || !('world' in rawOwn)) AgentOpts.world = true;
    if(!rawOwn || !('profile' in rawOwn) || ['generic', 'umk3', 'mix'].indexOf(rawOwn.profile) === -1) AgentOpts.profile = 'generic';
  }catch(e){ AgentOpts = Object.assign({}, AgentDefaults, { players: [0, 1], autoTune: true, profile: 'generic' }); }
  function saveAgentOpts(){
    try{ localStorage.setItem('snesboy-agent', JSON.stringify(AgentOpts)); }catch(e){}
  }
  /* Emulator button indices the brain uses (RetroArch SNES numbering).
     Human pads keep using PADINDEX; only the agent reads this. */
  var AgentMap = { dirR: 7, dirL: 6, run: 1, actions: [8, 0, 9], shoulders: [10, 11], select: 2, start: 3 };
  var MENU_CONFIRM_OVERRIDE = { 'super-mario-all-stars-2': 3 };
  /* SEEK confirm fallback, parsed from AgentOpts.seekCycle ('2,2,3,8,5,4' =
     SELECT, SELECT, START, A, DOWN, UP). The grid walker presses A and
     START every cycle; this adds one extra menu button when it is neither,
     so odd menus still get their key. Taps only, never holds. */
  var autoCycle = [2, 2, 3, 8];
  /* Character-select grids are not single-button menus: the cursor starts
     top-left, so confirm-only taps always take the first cell. Walk the
     cursor with 1-3 dpad taps first (snake-like patterns), then confirm,
     then START. Both driven pilots run this, so P2 actually joins/start. */
  var MENU_GRID_MOVES = [
    [7], [7, 7], [5], [5, 5], [7, 5], [5, 7],
    [7, 7, 5], [5, 5, 7], [6], [4], [7, 5, 5], [5, 7, 7]
  ];
  function parseSeekCycle(){
    try{
      var parts = String(AgentOpts.seekCycle).split(',');
      var out = [];
      parts.forEach(function(p){
        var v = parseInt(p.trim(), 10);
        if(!isNaN(v) && v >= 0 && v <= 11 && out.length < 8) out.push(v);
      });
      if(out.length) autoCycle = out;
    }catch(e){}
  }
  /* ---------- manual association + manual-guided learning ----------------
     The local manual corpus is matched to the ROM name, parsed for control
     semantics, and used as a shared prior by both copilots. Each pilot still
     learns from its own screen response, so the manual teaches what a button
     means while P1/P2 learn when it works. */
  var MANUAL_STATE = { index: null, indexJob: null, current: null, sig: '', gen: 0, loading: false, error: '' };
  var MANUAL_TEXT = {};
  var MANUAL_BTN = { a: 8, b: 0, x: 9, y: 1, l: 10, r: 11, start: 3, select: 2 };
  function manualNorm(s){
    s = String(s || '').toLowerCase().replace(/\.[a-z0-9]+$/, '');
    s = s.replace(/\([^)]*\)|\[[^\]]*\]/g, ' ');
    s = s.replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
    return s.replace(/\s+/g, ' ');
  }
  /* Filename form keeps region/rev/color tokens so duplicate manuals for the
     same game can be told apart. */
  function manualFileNorm(s){
    return String(s || '').toLowerCase().replace(/\.[a-z0-9]+$/, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function manualButtons(line){
    var text = String(line || '').replace(/[¥]/g, 'Y');
    var out = [], seen = {};
    var add = function(b){ if(!seen[b]){ seen[b] = 1; out.push(b); } };
    var re = /\b([abxy])\s*(?:button|btn)\b/ig, m;
    while((m = re.exec(text))) add(MANUAL_BTN[m[1].toLowerCase()]);
    re = /\b([lr])\s*(?:button|btn)\b/ig;
    while((m = re.exec(text))) add(MANUAL_BTN[m[1].toLowerCase()]);
    if(!out.length && /\b(press|hold|push|tap)\b/i.test(text)){
      /* Bare letters are buttons only when the manual prints them as such
         ("Press A"). Case-insensitive matching turns prose "push a block"
         into a phantom A press. */
      re = /\b([ABXY])\b/g;
      while((m = re.exec(text))) add(MANUAL_BTN[m[1].toLowerCase()]);
      re = /\b([LR])\b/g;
      while((m = re.exec(text))) add(MANUAL_BTN[m[1].toLowerCase()]);
    }
    return out.filter(function(b){ return b !== MANUAL_BTN.start && b !== MANUAL_BTN.select; });
  }
  function manualBest(lines, terms, prefs){
    var votes = {}, bestLine = '';
    for(var i = 0; i < lines.length; i++){
      var raw = lines[i], low = raw.toLowerCase(), hit = 0;
      terms.forEach(function(t){
        if(new RegExp('\\b' + t + '\\b', 'i').test(low)) hit += 2;
      });
      if(!hit) continue;
      /* Keep the button on the same line as the action word. Falling back
         to the next line turns prose like "these blocks rise" into a false
         BLOCK binding; allow it only for short control-table labels. */
      var sameBtns = manualButtons(raw);
      var btns = sameBtns.length ? sameBtns :
        (raw.trim().length <= 28 ? manualButtons(lines[i + 1] || '') : []);
      if(!btns.length) continue;
      var same = sameBtns.length ? 3 : 1;
      btns.forEach(function(b){ votes[b] = (votes[b] || 0) + hit + same; });
      if(!bestLine) bestLine = raw.trim();
    }
    var best = null, bestScore = -1;
    prefs = prefs || [];
    Object.keys(votes).forEach(function(k){
      var b = parseInt(k, 10), pi = prefs.indexOf(b);
      var score = votes[k] + (pi >= 0 ? (prefs.length - pi) * 3 : 0);
      if(score > bestScore){ bestScore = score; best = b; }
    });
    return best == null ? null : { buttons: [best], line: bestLine };
  }
  function manualAttackButtons(lines){
    var out = [], seen = {};
    for(var i = 0; i < lines.length && out.length < 6; i++){
      var low = lines[i].toLowerCase();
      if(!/\b(attack|punch|kick|shoot|fire|sword|strike|special)\b/.test(low)) continue;
      if(!/\b(press|hold|push|tap|button|btn)\b/.test(low)) continue;
      manualButtons(lines[i] + ' ' + (lines[i + 1] || '')).forEach(function(b){
        if(out.length < 6 && !seen[b]){ seen[b] = 1; out.push(b); }
      });
    }
    return out;
  }
  var MOVE_BTN = { LP: 0, HP: 1, LK: 9, HK: 8, RN: 11, RUN: 11, BLOCK: 10, BL: 10 };
  var MOVE_PUNCH = [1, 9, 10], MOVE_KICK = [0, 8, 11];
  function moveStrike(attack, text, fallback){
    var low = String(text || '').toLowerCase();
    var pool = /kick/.test(low) ? MOVE_KICK : (/punch/.test(low) ? MOVE_PUNCH : null);
    if(pool){
      for(var i = 0; i < pool.length; i++){
        if(attack.indexOf(pool[i]) !== -1) return pool[i];
      }
      return pool[0];
    }
    var bs = manualButtons(text);
    if(bs.length) return bs[0];
    return attack.length ? attack[0] : fallback;
  }
  function moveSeqNotation(rhs, attack){
    var text = String(rhs || '').toUpperCase()
      .replace(/\bHOLD\b/g, ' ')
      .replace(/\bIN\s+AIR\b/g, ' ')
      .replace(/\bAIR\b/g, ' ')
      /* OCR often prints E for BACK after a separator, and a stray E before
         other tokens. */
      .replace(/(^|[,\s])E(?=(?:LP|HP|LK|HK|RUN|RN|BLOCK|BL))/g, '$1B,')
      .replace(/E(?=(?:LP|HP|LK|HK|RUN|RN|BLOCK|BL|[FBUD]\b))/g, '')
      .replace(/\+/g, ' ')
      .replace(/[.;]/g, ' ');
    var chunks = text.split(/[,\s]+/).filter(Boolean);
    if(chunks.length < 2) return [];
    var seq = [];
    var combined = /^(?:(?:LP|HP|LK|HK|RUN|RN|BLOCK|BL|[FBUD]))+$/;
    var tokenRe = /(LP|HP|LK|HK|RUN|RN|BLOCK|BL|[FBUD])/g;
    for(var i = 0; i < chunks.length; i++){
      var c = chunks[i];
      if(c === 'E') continue;
      if(MOVE_BTN[c] != null){ seq.push(MOVE_BTN[c]); continue; }
      if(/^[FBUD]+$/.test(c)){
        for(var k = 0; k < c.length; k++) seq.push(c.charAt(k));
        continue;
      }
      if(combined.test(c)){
        var m;
        tokenRe.lastIndex = 0;
        while((m = tokenRe.exec(c))) seq.push(MOVE_BTN[m[1]] != null ? MOVE_BTN[m[1]] : m[1]);
        continue;
      }
      return []; /* prose leaked into a move table */
    }
    if(seq.length < 2 || !seq.some(function(x){ return typeof x === 'number'; })) return [];
    return seq;
  }
  function moveSeqWords(rhs, attack){
    var seq = [];
    var re = /\b(low punch|high punch|low kick|high kick|punch|kick|block|away|back(?:ward)?|towards?|forward|down(?:ward)?|crouch(?:ing)?|up(?:ward)?)\b/gi, m;
    while((m = re.exec(String(rhs || '')))){
      var t = m[1].toLowerCase();
      if(t === 'low punch') seq.push(MOVE_BTN.LP);
      else if(t === 'high punch') seq.push(MOVE_BTN.HP);
      else if(t === 'low kick') seq.push(MOVE_BTN.LK);
      else if(t === 'high kick') seq.push(MOVE_BTN.HK);
      else if(/punch|kick/.test(t)) seq.push(moveStrike(attack, t, null));
      else if(/block/.test(t)) seq.push(MOVE_BTN.BLOCK);
      else if(/away|back/.test(t)) seq.push('B');
      else if(/toward|forward/.test(t)) seq.push('F');
      else if(/down|crouch/.test(t)) seq.push('D');
      else if(/up/.test(t)) seq.push('U');
    }
    if(seq.length < 2 || !seq.some(function(x){ return typeof x === 'number'; })) return [];
    return seq;
  }
  function moveCompress(seq){
    var out = [];
    seq.forEach(function(x){ if(out[out.length - 1] !== x) out.push(x); });
    return out;
  }
  function moveSeqProse(ctx, attack){
    var low = ctx.toLowerCase(), seq = [];
    var dre = /\b(defensive crouch|offensive crouch|crouch(?:ing)?|down(?:ward)?|back(?:ward)?|away|left|forward|toward|right|up(?:ward)?)\b/g, m;
    while((m = dre.exec(low))){
      var t = m[1];
      seq.push(/down|crouch/.test(t) ? 'D' : (/back|away|left/.test(t) ? 'B' :
        (/forward|toward|right/.test(t) ? 'F' : 'U')));
    }
    /* Common OCR arrow glyphs. Only runs of two or more are trusted, so
       prose numbers ("2 seconds") do not become DOWN presses. */
    var runRe = /[«»<>¥4v_+=1]{2,}/g, run;
    while((run = runRe.exec(ctx))){
      for(var i = 0; i < run[0].length; i++){
        var c = run[0].charAt(i);
        if(c === '«' || c === '<' || c === '=') seq.push('B');
        else if(c === '»' || c === '>') seq.push('F');
        else if(c === '¥' || c === '4' || c === '1' || c === 'v') seq.push('D');
      }
    }
    if(/\bhold\b/i.test(low)){
      if(/\b(back|away|left)\b|«|=/.test(low)) seq.unshift('B');
      if(/\b(forward|toward|right)\b|»/.test(low)) seq.push('F');
    }
    seq = moveCompress(seq);
    var b = moveStrike(attack, ctx, null);
    if(b != null) seq.push(b);
    return moveCompress(seq);
  }
  function moveNameOk(name){
    name = String(name || '').trim();
    if(name.length < 3 || name.length > 40) return false;
    if(/[.:;]$/.test(name)) return false;
    if(/^(special|basic|controls?|using|press|note|the|this|charge|tap|hold|moves?)\b/i.test(name)) return false;
    if(/\b(moves?|controls?|warriors|fighters|special|likes?|dislikes?|height|weight|age|limited|warranty|rights|reserved|period|warning|liability|page|note|read|event|described|button|entertainment|software|acclaim|ltd|inc|corp|corporation|studios?|games?|interactive|licensed|trademark)\b/i.test(name)) return false;
    if(/^(punch|kick|block|run|jump|left|right|up|down|forward|back|backward|away|toward|move|punt|pass|shoot|tackle|slide)$/i.test(name)) return false;
    if(/\b(and|or|the|of|to|in|from|with|for)$/i.test(name)) return false;
    if(/^[A-Z]{11,}$/.test(name)) return false;
    if(/^[A-Z]{1,4}$/.test(name)) return false;
    var words = name.split(/\s+/);
    if(words.length > 4) return false;
    var titleWords = 0;
    for(var i = 0; i < words.length; i++){
      var w = words[i];
      if(w === '&' || /^(of|the|and|in|from|a|to|de|la|vs)$/i.test(w)) continue;
      if(/^[A-Z][a-z0-9'!.]*$/.test(w) || /^[A-Z]{2,}$/.test(w)){ titleWords++; continue; }
      return false;
    }
    return titleWords > 0;
  }
  function moveNameBefore(lines, i){
    for(var j = i - 1; j >= 0 && j >= i - 12; j--){
      var raw = String(lines[j] || '').trim().replace(/^[‘’'“”"\-–—\s]+/, '');
      if(!raw) continue;
      var m = raw.match(/^([A-Za-z0-9'&.! ]{2,40}?)\s*[~—–-]\s+[A-Z]/);
      if(m && moveNameOk(m[1].trim())) return m[1].trim();
      m = raw.match(/^([A-Z][A-Za-z0-9'&!-]{1,24}?)\s+(?:By|Using|Similar|This)\b/);
      if(m && moveNameOk(m[1].trim())) return m[1].trim();
      if(moveNameOk(raw.replace(/[.:]+$/, ''))) return raw.replace(/[.:]+$/, '');
    }
    return '';
  }
  function parseManualMoves(lines, attack){
    var moves = [], byName = {}, byKey = {};
    function add(name, seq, source){
      name = String(name || '').replace(/\s+/g, ' ').trim().replace(/[.:,;]+$/, '');
      if(source === 'prose' && name.length > 4 && /^[A-Z0-9 '&.-]+$/.test(name)) return;
      if(name.length > 6) name = name.replace(/([a-z])\1{2,}$/i, '$1$1');
      seq = (seq || []).slice(0, 7);
      if(!moveNameOk(name) || seq.length < 2) return;
      if(!seq.some(function(x){ return typeof x === 'number'; })) return;
      var key = manualNorm(name) + '|' + seq.join('');
      if(byKey[key] || byName[manualNorm(name)]) return;
      byKey[key] = byName[manualNorm(name)] = 1;
      moves.push({ name: name, seq: seq, source: source || 'manual' });
    }
    lines.forEach(function(raw, i){
      var line = String(raw || '').trim();
      if(!line) return;
      /* Explicit move tables, e.g. "Spear - B,B,LP" or "Fireball - F,F,HP". */
      var m = line.match(/^([A-Za-z0-9'&.! ]{2,40}?)\s*[-–—:]\s*(.{2,90})$/);
      if(m){
        var name = m[1].trim(), rhs = m[2].trim();
        if(!/^(LP|HP|LK|HK|RN|BL|IP)\b/i.test(name) &&
           !/\b(limited|warranty|period|rights|reserved|liability|warning|page|note|default|button|control)\b/i.test(name) &&
           !/\b(limited|warranty|rights|reserved|liability|www|http)\b/i.test(rhs)){
          var seq = moveSeqNotation(rhs, attack);
          if(!seq.length && String(rhs || '').length <= 55) seq = moveSeqWords(rhs, attack);
          add(name, seq, seq.length ? 'notation' : 'words');
        }
      }
      /* Prose move instructions: "Using the control pad, press ... and press
         any punch button", plus charge/tap phrasings used by KI. */
      if(/\b(using the control pad|in one continuous motion|then simultaneously|charge\b.*\bthen|tap\b.*\bthen)\b/i.test(line) &&
         /\b(punch|kick|button|attack|motion|charge|tap|hold)\b/i.test(line)){
        var nm = moveNameBefore(lines, i);
        if(nm){
          var ctx = line + ' ' + (lines[i + 1] || '') + ' ' + (lines[i + 2] || '');
          add(nm, moveSeqProse(ctx, attack), 'prose');
        }
      }
    });
    return moves.slice(0, 48);
  }
  /* Coarse, title-driven style prior. This is deliberately not a
     per-game script: it chooses one of a handful of input policies. */
  function manualStyle(title, kind){
    var t = String(title || '');
    if(/\b(soccer|football|basketball|baseball|hockey|golf|tennis|volleyball|rugby|cricket|bowling|olympic|world cup|fifa|madden|nba|nhl|ncaa|kick off|sports)\b/i.test(t)) return 'sports';
    if(/\b(race|racing|kart|grand prix|f-zero|fzero|top gear|rock n roll racing|super off road|micro machines|street racer)\b/i.test(t)) return 'racing';
    if(/\b(tetris|puzzle|columns|puyo|dr mario|lemmings|bust a move|bust-a-move|kirby avalanche|wario's woods|wordtris|zoop|pac-attack|magical drop)\b/i.test(t)) return 'puzzle';
    if(/\b(doom|wolfenstein|shooter|contra|gradius|r-type|turrican|axelay|star fox|starfox|after burner|lethal enforcers|phalanx|sonic blastman|super scope|bazooka|blazing skies|earth defense|firepower|operation logic bomb|zombies ate)\b/i.test(t)) return 'shooter';
    if(/\b(tournament fighters|fighting edition)\b/i.test(t)) return 'fighter';
    if(/\b(final fight|brawl brothers|beat.?em|ninja warriors|tmnt|turtles|power rangers|spawn|cliffhanger|batman|maximum carnage|separation anxiety|king of dragons|knights of the round|aliens vs predator|double dragon)\b/i.test(t)) return 'beat-em-up';
    if(kind === 'fighter' || /\b(fighter|fighting|mortal kombat|street fighter|killer instinct|fatal fury|samurai shodown|art of fighting|world heroes|clay fighter|shaq fu|power instinct|tuff e nuff|ultimate fighter|pit fighter|ballz|doomsday warrior|fighter's history|brutal|boxing|punch-out|wwf|wrestl)\b/i.test(t)) return 'fighter';
    if(/\b(final fantasy|chrono|secret of mana|breath of fire|lufia|dragon quest|earthbound|illusion of gaia|soul blazer|terranigma|rpg|zelda|adventure)\b/i.test(t)) return 'adventure';
    return 'platformer';
  }
  function parseManual(meta, text){
    var lines = String(text || '').split(/\r?\n/);
    var run = manualBest(lines, ['run', 'dash', 'sprint'], [1, 11, 0, 8]);
    var jump = manualBest(lines, ['jump', 'leap'], [0, 8, 9, 1]);
    var block = manualBest(lines, ['block', 'guard', 'defend'], [10, 11, 1]);
    var attack = manualAttackButtons(lines);
    var moves = parseManualMoves(lines, attack);
    var actions = [];
    var add = function(b){ if(b != null && actions.indexOf(b) === -1) actions.push(b); };
    if(jump) jump.buttons.forEach(add);
    if(attack.length) attack.forEach(add);
    if(run) add(run.buttons[0]);
    if(block) add(block.buttons[0]);
    [8, 0, 9, 1].forEach(function(b){ if(actions.length < 4) add(b); });
    if(!actions.length) actions = [8, 0, 9];
    /* Generic genre read: strong title words or a manual that repeatedly
       talks about punches, kicks, rounds, combos and opponents. */
    var fightTitle = /\b(street fighter|mortal kombat|killer instinct|fatal fury|art of fighting|samurai shodown|wwf|wrestl|boxing|punch-out|fighter|fighting)\b/i.test(meta.title);
    var fightHits = (String(text).match(/\b(punch(?:es|ed|ing)?|kick(?:s|ed|ing)?|combo|opponent|knockout|versus|round)\b/gi) || []).length;
    var kind = (fightTitle || (attack.length >= 3 && (block || fightHits >= 12))) ? 'fighter' : 'platformer';
    var style = manualStyle(meta.title, kind);
    if(kind === 'platformer'){
      attack = [];
      block = null;
      if(!jump) jump = { buttons: [0] };
      if(!run) run = { buttons: [1] };
    }
    /* Menu START plan: the opening pages of a booklet spell out how many
       START presses separate title, select and file screens. Capture that
       as a plan instead of letting the pixel loop mistake an animated title
       or scrolling select screen for gameplay. */
    var menuPlan = [];
    lines.slice(0, 60).forEach(function(line){
      var low = line.toLowerCase();
      if(/\bstart\b/.test(low) && /button/.test(low)) menuPlan.push(MANUAL_BTN.start);
    });
    menuPlan = menuPlan.slice(0, 3);
    var hints = [];
    lines.forEach(function(line){
      if(hints.length < 4 && line.trim().length > 18 &&
         /\b(button|control|press|hold|run|jump|block|punch|kick|attack)\b/i.test(line)){
        hints.push(line.trim().replace(/\s+/g, ' ').slice(0, 180));
      }
    });
    var weights = {};
    if(jump) jump.buttons.forEach(function(b){ weights[b] = (weights[b] || 0) + 0.35; });
    attack.forEach(function(b){ weights[b] = (weights[b] || 0) + 0.45; });
    if(run) weights[run.buttons[0]] = (weights[run.buttons[0]] || 0) + 0.15;
    if(block) weights[block.buttons[0]] = (weights[block.buttons[0]] || 0) + 0.05;
    return {
      id: meta.id, title: meta.title, pages: meta.pages, region: meta.region,
      method: meta.method, chars: meta.chars, kind: kind, style: style, actions: actions,
      run: run ? run.buttons[0] : null, jump: jump ? jump.buttons[0] : null,
      block: block ? block.buttons[0] : null, strikes: attack, weights: weights,
      moves: moves, shoulders: [10, 11], hints: hints, menuPlan: menuPlan,
      source: 'ai/manuals/' + meta.text
    };
  }
  function ensureManualIndex(){
    if(MANUAL_STATE.index) return Promise.resolve(MANUAL_STATE.index);
    if(MANUAL_STATE.indexJob) return MANUAL_STATE.indexJob;
    MANUAL_STATE.indexJob = fetch('ai/manuals/index.json').then(function(r){
      if(!r.ok) throw new Error('manual index HTTP ' + r.status);
      return r.json();
    }).then(function(j){
      MANUAL_STATE.index = j;
      return j;
    }).catch(function(e){
      MANUAL_STATE.error = String(e && e.message || e);
      MANUAL_STATE.indexJob = null;
      throw e;
    });
    return MANUAL_STATE.indexJob;
  }
  function matchManual(name){
    if(!MANUAL_STATE.index) return null;
    var n = manualNorm(name), nt = n.split(' ').filter(Boolean);
    if(!n) return null;
    var best = null, bestScore = 0;
    var nf = manualFileNorm(name);
    MANUAL_STATE.index.manuals.forEach(function(m){
      var mt = manualNorm(m.title), score = 0;
      if(mt === n) score = 100;
      else if(n.indexOf(mt) === 0 || mt.indexOf(n) === 0) score = 60;
      else{
        var a = mt.split(' ').filter(Boolean), hit = 0;
        a.forEach(function(t){ if(nt.indexOf(t) !== -1) hit++; });
        score = 25 * hit / Math.max(1, Math.max(a.length, nt.length));
      }
      var mf = manualFileNorm(m.file);
      if(mf && mf === nf) score += 45;
      else if(mf && (mf.indexOf(nf) === 0 || nf.indexOf(mf) === 0)) score += 15;
      var reg = String(m.region || '').toLowerCase();
      if(/\busa\b/.test(n) && /usa/.test(reg)) score += 12;
      if(/\bpal\b/.test(reg) && !/\bpal\b/.test(n)) score -= 8;
      if(/\bjapan\b/.test(n) && /japan/.test(reg)) score += 8;
      if(score >= 20 && score > bestScore){ bestScore = score; best = m; }
    });
    return best;
  }
  function loadManualForGame(name){
    /* Keep region/rev tokens in the cache key. Two regional manuals for the
       same title must not reuse each other's parsed controls. */
    var sig = manualFileNorm(name);
    if(MANUAL_STATE.sig === sig && MANUAL_STATE.current) return Promise.resolve(MANUAL_STATE.current);
    if(MANUAL_STATE.sig === sig && MANUAL_STATE.loading) return MANUAL_STATE.loading;
    MANUAL_STATE.sig = sig;
    MANUAL_STATE.current = null;
    MANUAL_STATE.error = '';
    MANUAL_STATE.loading = true;
    var gen = ++MANUAL_STATE.gen;
    updateManualHud();
    var job = ensureManualIndex().then(function(){
      if(gen !== MANUAL_STATE.gen) return null;
      var meta = matchManual(name);
      if(!meta) throw new Error('no manual match');
      if(MANUAL_TEXT[meta.id]) return parseManual(meta, MANUAL_TEXT[meta.id]);
      return fetch('ai/manuals/' + meta.text).then(function(r){
        if(!r.ok) throw new Error('manual HTTP ' + r.status);
        return r.text();
      }).then(function(t){
        MANUAL_TEXT[meta.id] = t;
        return parseManual(meta, t);
      });
    }).then(function(profile){
      if(gen !== MANUAL_STATE.gen || !profile) return null;
      MANUAL_STATE.current = profile;
      MANUAL_STATE.loading = false;
      applyManualToPilots();
      updateManualHud();
      updateAgentHud();
      updateAiStatus();
      return profile;
    }).catch(function(e){
      if(gen !== MANUAL_STATE.gen) return null;
      MANUAL_STATE.loading = false;
      MANUAL_STATE.error = String(e && e.message || e);
      updateManualHud();
      updateAiStatus();
      return null;
    });
    MANUAL_STATE.loading = job;
    return job;
  }
  function applyManualToPilot(pt){
    var m = MANUAL_STATE.current;
    pt.manual = m || null;
    /* Identical controller layout on both ports: the manual order is the
       same for P1 and P2. The brains are independent; the button map is not. */
    pt.order = (m && m.actions && m.actions.length) ? m.actions.slice() : AgentMap.actions.slice();
    pt.runBtn = (m && m.run != null) ? m.run : AgentMap.run;
    pt.blockBtn = (m && m.block != null) ? m.block : 10;
    pt.jumpBtn = (m && m.jump != null) ? m.jump : pt.order[0];
    pt.kind = (m && m.kind) ? m.kind : 'platformer';
    pt.style = (m && m.style) ? m.style : (pt.kind === 'fighter' ? 'fighter' : 'platformer');
    pt.movebook = (m && m.moves && m.moves.length) ? m.moves.slice() : [];
    pt.strikes = (m && m.strikes && m.strikes.length) ? m.strikes.slice() : [1, 0, 8, 9];
    [1, 0, 8, 9].forEach(function(b){ if(pt.strikes.indexOf(b) === -1) pt.strikes.push(b); });
    pt.shoulders = (m && m.shoulders) ? m.shoulders.slice() : AgentMap.shoulders.slice();
    if(!pt.learn) pt.learn = { score: {}, tries: {}, total: 0, pending: null, sig: '' };
    if(m && pt.learn.sig !== m.id){
      pt.learn.sig = m.id;
      pt.learn.score = {};
      pt.learn.tries = {};
      pt.learn.total = 0;
      pt.learn.pending = null;
      if(pt.agent) pt.agent.clearReplay();
      pt.bootPlan = (m.menuPlan && m.menuPlan.length) ? m.menuPlan.slice(0, 4) : [AgentMap.start];
      pt.bootStep = 0; pt.bootNext = 0; pt.bootDone = false;
      m.actions.forEach(function(b, i){
        /* RUN is held by the drive loop, not chosen as a hop action; seeding
           it here would make the policy report walking as its best move. */
        if(b === pt.runBtn) return;
        pt.learn.score[b] = (m.weights[b] || 0.15) + (i === 0 && b !== pt.jumpBtn ? 0.2 : 0);
      });
    }
  }
  function applyManualToPilots(){
    if(autoOn) releaseAuto(); /* don't carry a throttle/run hold into a new style */
    autoPilots.forEach(applyManualToPilot);
  }
  function pickPlayAction(pt){
    var pool = ((pt.order && pt.order.length) ? pt.order : AgentMap.actions).filter(function(b){
      /* The run/dash button is already held by the drive loop; pressing it
         again as a "hop action" teaches the policy that walking is a jump. */
      return b !== pt.runBtn;
    });
    if(!pool.length) pool = [pt.jumpBtn != null ? pt.jumpBtn : AgentMap.actions[0]];
    if(pt.agent){
      return pt.agent.pick(pool, { explore: pt.brain.explore, hopN: pt.hopN,
        prefer: pt.jumpBtn, avoid: pt.blockBtn });
    }
    var l = pt.learn || { score: {}, tries: {}, total: 0 };
    var n = l.total || 0, best = pool[0], bestScore = -1e9;
    for(var i = 0; i < pool.length; i++){
      var b = pool[i], tries = l.tries[b] || 0;
      var avg = (l.score[b] || 0) / (tries + 1);
      var prior = 0.15 + (pool.length - i) * 0.04;
      var explore = (pt.brain.explore || 1.15) * Math.sqrt(Math.log(n + 2) / (tries + 1));
      var s = avg + prior + explore + ((pt.hopN + i * 5) % 7) * 0.001;
      if(s > bestScore){ bestScore = s; best = b; }
    }
    l.pending = { btn: best, t: Date.now() };
    return best;
  }
  function rewardPlayAction(pt, d, sh, shy, explored){
    if(pt.agent){
      /* A hop/action button must not take credit for walking. Horizontal
         scrolling is produced by the held direction, so the action loop is
         judged on vertical response, new frontier cells, and manual
         compliance — the three signals it can actually influence. */
      var pending = pt.learn && pt.learn.pending;
      var manualAction = !!(pending && pt.jumpBtn != null && pending.btn === pt.jumpBtn);
      pt.agent.reward({ motion: 0, scroll: 0, scrollY: shy,
        loThresh: pt.brain.loThresh, explored: explored, manual: manualAction });
      return;
    }
    var l = pt.learn, p = l && l.pending;
    if(!p) return;
    var moved = d >= Math.max(1, pt.brain.loThresh) ||
      Math.abs(sh || 0) >= 2 || Math.abs(shy || 0) >= 2;
    l.tries[p.btn] = (l.tries[p.btn] || 0) + 1;
    /* Frontier cells count as progress: the map gives the same button
       credit the DQN-style pixel reward already gives for moving right. */
    l.score[p.btn] = (l.score[p.btn] || 0) + (moved ? 1 : -0.25) + (explored ? 0.3 : 0);
    l.total = (l.total || 0) + 1;
    l.pending = null;
  }
  function updateManualLearn(){
    var e = document.getElementById('manual-learn');
    if(!e) return;
    if(!MANUAL_STATE.current){ e.textContent = ''; return; }
    var parts = autoPilots.map(function(pt){
      var l = pt.learn || {}, arr = Object.keys(l.score || {});
      arr.sort(function(a, b){
        return ((l.score[b] || 0) / ((l.tries[b] || 0) + 1)) -
               ((l.score[a] || 0) / ((l.tries[a] || 0) + 1));
      });
      var top = arr.slice(0, 3).map(function(b){
        return (BTN_NAMES[b] || b) + ' ' + (l.score[b] || 0).toFixed(1);
      }).join(' ');
      return 'P' + (pt.pl + 1) + ' ' + (top || 'learning…');
    });
    e.textContent = 'MANUAL LEARN · ' + parts.join(' · ');
  }
  function updateManualHud(){
    updateManualLearn();
    var e = document.getElementById('manual-bind');
    if(!e) return;
    if(MANUAL_STATE.loading){
      e.textContent = 'MANUAL · matching ' + currentName + '…';
      return;
    }
    if(MANUAL_STATE.current){
      var m = MANUAL_STATE.current;
      var names = function(arr){ return arr.map(function(b){ return BTN_NAMES[b] || b; }).join('/'); };
      var actLabel = (m.kind === 'fighter') ? 'attack' : 'actions';
      var actList = (m.kind === 'fighter') ? m.strikes : m.actions;
      e.textContent = 'MANUAL · ' + m.title + ' · ' + m.pages + 'p · ' +
        m.style + ' · jump ' + (m.jump != null ? (BTN_NAMES[m.jump] || m.jump) : '?') +
        ' · run ' + (m.run != null ? (BTN_NAMES[m.run] || m.run) : '?') +
        ' · ' + actLabel + ' ' + (actList.length ? names(actList) : '?') +
        ' · P1+P2 learn';
      return;
    }
    e.textContent = 'MANUAL · no match for ' + currentName +
      (MANUAL_STATE.error ? ' (' + MANUAL_STATE.error + ')' : '') + ' · generic priors';
  }
  window.SNESBoyManual = {
    current: function(){ return MANUAL_STATE.current; },
    match: function(name){ return matchManual(name); },
    reload: function(name){ return loadManualForGame(name || currentName); },
    index: function(){ return MANUAL_STATE.index; },
    pilots: function(){
      return autoPilots.map(function(pt){
        return { player: pt.pl + 1, mode: pt.mode, role: pt.menuRole,
          manual: pt.manual ? pt.manual.id : null, kind: pt.kind, style: pt.style,
          order: pt.order, run: pt.runBtn, block: pt.blockBtn, strikes: pt.strikes,
          learn: { tries: pt.learn.tries, score: pt.learn.score, total: pt.learn.total } };
      });
    }
  };
  /* One independent copilot per driven player — same screen, own brain.
     Every pilot senses and plays with its own rhythm, so P2 never just
     parrots P1. P1 leads the menus; P2 joins with one START. */
  var autoPilots = [];
  /* Every pilot owns its timers, motion history, steering vote and menu
     guard. There is no shared autoDir / autoDiff / screenWatch any more:
     P1 can seek, release and tap its menus while P2 keeps playing. */
  function makeWatch(){
    return {
      motionEma: 0, motionPeak: 0, lastMotionAt: Date.now(), stillMs: 0,
      lastSh: 0, lastShy: 0, progressEma: 0, haveData: false,
      lastTap: null, tapScore: {}, lastTapInfo: '', runWanted: true
    };
  }
  function watchReset(){
    autoPilots.forEach(function(pt){
      pt.watch = makeWatch();
      pt.watch.lastMotionAt = Date.now();
    });
    updateScreenWatch();
  }
  function scrollLabel(sh, shy){
    var out = '';
    if(sh >= 2) out += 'R' + Math.abs(sh);
    else if(sh <= -2) out += 'L' + Math.abs(sh);
    if(shy >= 2) out += (out ? ' ' : '') + 'D' + Math.abs(shy);
    else if(shy <= -2) out += (out ? ' ' : '') + 'U' + Math.abs(shy);
    return out || 'still';
  }
  function updateScreenWatch(){
    updateManualLearn();
    var e = document.getElementById('anton-watch');
    if(!e) return;
    if(!AgentOpts.autoTune){ e.textContent = 'UNIFIED · screen watch off — manual tuning only'; return; }
    if(!autoOn){ e.textContent = 'UNIFIED · screen watch idle — autopilot off'; return; }
    var parts = autoPilots.map(function(pt){
      var w = pt.watch;
      return 'P' + (pt.pl + 1) + ' ' + pt.mode.toUpperCase() +
        ' m' + w.motionEma.toFixed(1) +
        ' still ' + (w.stillMs / 1000).toFixed(1) + 's ' +
        scrollLabel(w.lastSh, w.lastShy) +
        (w.lastTapInfo ? ' ' + w.lastTapInfo : '');
    });
    parts.push('hop ' + autoPilots.map(function(pt){
      return 'P' + (pt.pl + 1) + ':' + pt.brain.hopEvery;
    }).join(' '));
    parts.push('run ' + autoPilots.map(function(pt){
      return 'P' + (pt.pl + 1) + (pt.watch.runWanted ? ':on' : ':off');
    }).join(' '));
    if(AgentOpts.world !== false){
      parts.push('map ' + autoPilots.map(function(pt){
        var st = pt.world ? pt.world.stats() : null;
        return 'P' + (pt.pl + 1) + ':' + (st ? st.cells + 'c/' + st.landmarks + 'L' : 'off') +
          (st && st.exploring ? ' EXP' : '');
      }).join(' '));
    }
    e.textContent = 'UNIFIED · watching: ' + parts.join(' · ');
  }
  /* ---------- poke.AI-style world map panel ----------
     Draws each pilot's independently learned map on one canvas: visited
     cells, camera trail, stable landmarks, the 32x32 viewport and the
     frontier heading. Read-only; the panel never drives the game. */
  var WORLD_KIND_COLORS = {
    center: '#f87171', mart: '#60a5fa', gym: '#4ade80',
    gate: '#fbbf24', npc: '#e879f9', house: '#a78bfa'
  };
  var WORLD_PILOT_COLORS = ['#4ade80', '#22d3ee', '#f472b6', '#facc15'];
  var ANTON_SCAN = null;
  function worldStatsText(){
    return autoPilots.map(function(pt, i){
      var st = pt.world ? pt.world.stats() : null;
      if(!st) return 'P' + (i + 1) + ' off';
      return 'P' + (i + 1) + ' ' + st.cells + ' cells · ' + st.landmarks + ' marks · ' +
        st.closures + ' loop' + (st.closures === 1 ? '' : 's') +
        (st.exploring ? ' · explore ' + (st.forcedDir > 0 ? '>' : '<') : '');
    }).join('   ');
  }
  function updateWorldPanel(){
    updateUnifiedPanel();
    var cv = document.getElementById('world-map');
    if(!cv) return;
    var status = document.getElementById('world-status');
    if(!autoOn || !autoPilots.length){
      if(status) status.textContent = 'WORLD MEMORY · idle — engage autopilot to map';
      if(cv.offsetParent){
        var c0 = cv.getContext('2d');
        if(c0){ c0.fillStyle = '#0b0614'; c0.fillRect(0, 0, cv.width, cv.height); }
      }
      return;
    }
    if(AgentOpts.world === false){
      if(status) status.textContent = 'WORLD MEMORY · off — reactive copilot only';
      if(cv.offsetParent){
        var c1 = cv.getContext('2d');
        if(c1){ c1.fillStyle = '#0b0614'; c1.fillRect(0, 0, cv.width, cv.height); }
      }
      return;
    }
    if(status) status.textContent = 'WORLD MEMORY · ' + worldStatsText();
    if(!cv.offsetParent) return;
    var ctx = cv.getContext('2d');
    if(!ctx) return;

    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, any = false;
    autoPilots.forEach(function(pt){
      if(!pt.world) return;
      Object.keys(pt.world.cells).forEach(function(k){
        var c = pt.world.cells[k];
        any = true;
        if(c.x < minX) minX = c.x; if(c.x > maxX) maxX = c.x;
        if(c.y < minY) minY = c.y; if(c.y > maxY) maxY = c.y;
      });
      var px = pt.world.pos.x / pt.world.cell, py = pt.world.pos.y / pt.world.cell;
      any = true;
      if(px < minX) minX = px; if(px > maxX) maxX = px;
      if(py < minY) minY = py; if(py > maxY) maxY = py;
    });
    if(!any){ minX = -10; maxX = 10; minY = -6; maxY = 6; }
    var spanX = Math.max(20, maxX - minX + 6), spanY = Math.max(12, maxY - minY + 6);
    var midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
    minX = midX - spanX / 2; minY = midY - spanY / 2;

    var pad = 8, scale = Math.min((cv.width - pad * 2) / spanX, (cv.height - pad * 2) / spanY);
    var ox = pad + ((cv.width - pad * 2) - spanX * scale) / 2;
    var oy = pad + ((cv.height - pad * 2) - spanY * scale) / 2;
    function X(cx){ return ox + (cx - minX) * scale; }
    function Y(cy){ return oy + (cy - minY) * scale; }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0b0614'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = 'rgba(124,58,237,.18)'; ctx.lineWidth = 1;
    var gx = Math.ceil(minX / 4) * 4, gy = Math.ceil(minY / 4) * 4;
    for(var x = gx; x < minX + spanX; x += 4){
      ctx.beginPath(); ctx.moveTo(X(x), 0); ctx.lineTo(X(x), cv.height); ctx.stroke();
    }
    for(var y = gy; y < minY + spanY; y += 4){
      ctx.beginPath(); ctx.moveTo(0, Y(y)); ctx.lineTo(cv.width, Y(y)); ctx.stroke();
    }

    autoPilots.forEach(function(pt, i){
      if(!pt.world) return;
      var col = WORLD_PILOT_COLORS[i % WORLD_PILOT_COLORS.length];
      var w = pt.world, size = Math.max(1, scale * 0.92);
      Object.keys(w.cells).forEach(function(k){
        var c = w.cells[k];
        ctx.globalAlpha = c.last === w.tick ? 0.5 : 0.2;
        ctx.fillStyle = col;
        ctx.fillRect(X(c.x) - size / 2, Y(c.y) - size / 2, size, size);
      });
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath();
      w.trail.forEach(function(p, j){
        var tx = X(p.x / w.cell), ty = Y(p.y / w.cell);
        if(j === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;

      w.stableLandmarks().forEach(function(lm){
        var lx = X(lm.x / w.cell), ly = Y(lm.y / w.cell);
        var r = Math.max(2, Math.min(5, scale * (lm.seen >= 4 ? 0.34 : 0.26)));
        ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.fillStyle = WORLD_KIND_COLORS[lm.kind] || '#a78bfa';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 1; ctx.stroke();
      });

      var px = X(w.pos.x / w.cell), py = Y(w.pos.y / w.cell);
      ctx.strokeStyle = 'rgba(255,255,255,.32)';
      ctx.setLineDash([3, 3]);
      var half = 16 / w.cell;
      ctx.strokeRect(X(w.pos.x / w.cell - half), Y(w.pos.y / w.cell - half),
        half * 2 * scale, half * 2 * scale);
      ctx.setLineDash([]);

      var d = w.lastDir || 1;
      ctx.beginPath();
      ctx.moveTo(px + d * 7, py);
      ctx.lineTo(px - d * 4, py - 5);
      ctx.lineTo(px - d * 4, py + 5);
      ctx.closePath();
      ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.stroke();
    });
  }
  window.SNESBoyWorld = {
    enabled: function(){ return AgentOpts.world !== false; },
    stats: function(){
      return autoPilots.map(function(pt){
        return { player: pt.pl + 1, world: pt.world ? pt.world.stats() : null };
      });
    },
    snapshot: function(){
      return autoPilots.map(function(pt){
        return { player: pt.pl + 1, map: pt.world ? pt.world.export() : null };
      });
    },
    reset: function(){
      autoPilots.forEach(function(pt){ if(pt.world) pt.world.reset(); });
      updateWorldPanel();
    }
  };
  /* One status surface for the unified loop: SEE/REMEMBER (world),
     ACT/JUDGE (policy + replay), HEAL (governor). */
  function topActionLabel(policy){
    if(!policy || !policy.top || !policy.top.length) return 'learning';
    var t = policy.top[0];
    return (BTN_NAMES[t.btn] || t.btn) + ' ' + (t.avg || 0).toFixed(2);
  }
  function updateUnifiedPanel(){
    var st = document.getElementById('unified-status');
    var wl = document.getElementById('lane-world');
    var pl = document.getElementById('lane-policy');
    var hl = document.getElementById('lane-health');
    if(!st && !wl && !pl && !hl) return;
    if(!autoOn || !autoPilots.length){
      if(st) st.textContent = 'UNIFIED AGENT · idle — engage autopilot to run the loop';
      if(wl) wl.textContent = 'P1 off · P2 off';
      if(pl) pl.textContent = 'P1 off · P2 off';
      if(hl) hl.textContent = 'P1 idle · P2 idle';
      return;
    }
    var modes = autoPilots.map(function(pt){
      return 'P' + (pt.pl + 1) + ':' + pt.mode.toUpperCase();
    }).join(' ');
    if(st){
      st.textContent = 'UNIFIED AGENT · ON · ' + modes + ' · ' +
        (AgentOpts.autoTune ? 'self-tuning' : 'manual tune') +
        (AgentOpts.world !== false ? ' · mapping' : ' · map off') +
        (ANTON_SCAN ? ' · self-audit ' + ANTON_SCAN.avg + ' ' + ANTON_SCAN.verdict : '');
    }
    var ws = [], ps = [], hs = [];
    autoPilots.forEach(function(pt){
      var n = 'P' + (pt.pl + 1);
      var s = pt.agent ? pt.agent.status() : null;
      if(!s){
        ws.push(n + ' off'); ps.push(n + ' off'); hs.push(n + ' off');
        return;
      }
      var w = s.world;
      ws.push(w ? n + ' ' + w.cells + 'c/' + w.landmarks + 'L/' + w.closures + '↺' +
        (w.exploring ? ' explore' : '') : n + ' off');
      ps.push(n + ' ' + topActionLabel(s.policy) + ' · ' + s.policy.total +
        ' updates · replay ' + s.policy.replay);
      var adj = s.health.lastAdjust;
      if(adj && adj.length > 64) adj = adj.slice(0, 61) + '…';
      hs.push(n + ' ' + s.health.verdict + ' · ' + s.health.adjustments + ' adj' +
        (adj ? ' · ' + adj : ''));
    });
    if(wl) wl.textContent = ws.join('  ·  ');
    if(pl) pl.textContent = ps.join('  ·  ');
    if(hl) hl.textContent = hs.join('  ·  ');
  }
  window.SNESBoyAgent = {
    status: function(){
      return autoPilots.map(function(pt){
        return { player: pt.pl + 1, mode: pt.mode,
          evidence: !!pt.playEvidence, startUsed: !!pt.startUsed,
          menuN: pt.menuN, startReadyAt: pt.startReadyAt,
          lastStart: pt.lastStart, lastConfirmAt: pt.lastConfirmAt,
          role: pt.menuRole, scrollRun: pt.scrollRun || 0, quietTicks: pt.quietTicks || 0,
          agent: pt.agent ? pt.agent.status() : null };
      });
    },
    snapshot: function(options){
      options = options || {};
      return autoPilots.map(function(pt){
        return { player: pt.pl + 1, mode: pt.mode,
          agent: pt.agent ? pt.agent.snapshot(options.maxReplay) : null };
      });
    },
    reset: function(){
      autoPilots.forEach(function(pt){ if(pt.agent) pt.agent.reset(); });
      updateWorldPanel(); updateUnifiedPanel();
    }
  };
  function watchMetrics(pt, dMax, sh, shy){
    var now = Date.now();
    var w = pt.watch;
    var motion = dMax || 0;
    w.haveData = true;
    w.motionEma = w.motionEma ? w.motionEma * 0.65 + motion * 0.35 : motion;
    if(motion > w.motionPeak) w.motionPeak = motion;
    if(motion >= pt.brain.hiThresh) w.lastMotionAt = now;
    w.stillMs = now - w.lastMotionAt;
    w.lastSh = sh || 0;
    w.lastShy = shy || 0;
    var prog = Math.max(Math.abs(sh || 0), Math.abs(shy || 0));
    w.progressEma = w.progressEma ? w.progressEma * 0.7 + prog * 0.3 : prog;
    /* credit or blame this pilot's last seek tap only */
    if(w.lastTap && now - w.lastTap.t >= pt.brain.senseMs){
      var tap = w.lastTap;
      var changed = w.motionPeak >= Math.max(pt.brain.loThresh, 1.5);
      var score = w.tapScore[tap.btn] || 0;
      w.tapScore[tap.btn] = Math.max(-5, Math.min(10, score + (changed ? 1.5 : -1)));
      w.lastTapInfo = 'tap ' + (BTN_NAMES[tap.btn] || tap.btn) + (changed ? ' ✓' : ' ✗');
      w.lastTap = null;
    }
  }
  function noteWatchTap(pt, btn){
    pt.watch.lastTap = { btn: btn, t: Date.now() };
    pt.watch.motionPeak = 0;
    pt.watch.lastTapInfo = 'tap ' + (BTN_NAMES[btn] || btn) + '…';
  }
  function pickSeekTap(pt){
    var cycle = (pt.cycle && pt.cycle.length) ? pt.cycle : autoCycle;
    var idx = pt.menuN % cycle.length;
    var def = cycle[idx];
    var w = pt.watch;
    if(!AgentOpts.autoTune || w.stillMs < Math.max(3000, pt.brain.tapMs)) return def;
    var best = def, bestScore = -Infinity;
    for(var i = 0; i < cycle.length; i++){
      var cand = cycle[i];
      var score = (w.tapScore[cand] || 0) - (i === idx ? 0.01 : 0);
      if(score > bestScore){ bestScore = score; best = cand; }
    }
    /* everything failed so far: break the loop by advancing the rotation */
    return bestScore < 0 ? cycle[(idx + 1) % cycle.length] : best;
  }
  function makePilot(player, idx){
    /* One agent per pilot: AntonCore owns the world map (poke.AI), the
       action score + replay memory (mario-ai) and the live governor
       (Son of Anton). The aliases below keep the existing drive policies
       reading the same objects, so there is still only one brain. */
    var core = (typeof window.AntonCore === 'function') ? new window.AntonCore({}) : null;
    var pt = { pl: player, active: true, menus: true, mode: 'seek', prev: null, hi: 0, lo: 0,
      menuN: 0, hopN: idx * 2, tick: 0, shN: 0, fphase: -1, mixFight: false,
      slot: idx, startUsed: false, startReadyAt: idx > 0 ? 1 : 2, lastStart: 0, lastConfirmAt: 0,
      everPlayed: false, menuGen: 0,
      bootDone: false, bootStep: 0, bootNext: 0, bootPlan: [AgentMap.start],
      dir: AgentMap.dirR, dirY: null, dirYMiss: 0, diff: 0,
      watch: makeWatch(), menuGuardFrame: null,
      menuRole: idx === 0 ? 'lead' : 'join', joinConfirm: false,
      /* Per-port brain settings. Both controllers use the same layout;
         these values are copied once and then tuned by this pilot alone. */
      brain: {
        hiThresh: AgentOpts.hiThresh, loThresh: AgentOpts.loThresh,
        hiStreak: AgentOpts.hiStreak, loStreak: AgentOpts.loStreak,
        blackMean: AgentOpts.blackMean, hopEvery: AgentOpts.hopEvery,
        hopPulseMs: AgentOpts.hopPulseMs, senseMs: AgentOpts.senseMs,
        tapMs: AgentOpts.tapMs, explore: 1.15
      },
      anton: core ? core.health : { hist: [], lastModes: '', cool: 0, seekStuck: 0, playStall: 0 },
      cycle: autoCycle.slice(),
      /* Unified agent: world map + policy/replay + governor in one object.
         Each pilot still owns one core, so P1 and P2 remain independent. */
      agent: core,
      world: core ? core.world :
        ((typeof window.WorldMemory === 'function') ? new window.WorldMemory({}) : null),
      mapDir: 0,
      timers: { menu: null, sense: null, drive: null },
      order: AgentMap.actions.slice(),
      learn: core ? core.policy : { score: {}, tries: {}, total: 0, pending: null, sig: '' } };
    applyManualToPilot(pt);
    return pt;
  }
  /* Re-arm exactly one START for a fresh menu screen/episode. P2 may start
     immediately (join); P1 waits one grid pass so it never starts on the
     default top-left cell. */
  function armStart(pt){
    /* START is a pause toggle in live gameplay. The guard is real camera
       movement (playEvidence), not the first false-positive "play" guess:
       otherwise the second menu screen (Select Game -> File Select) never
       gets its START and the pilot cycles the menu forever. */
    if(pt.playEvidence) return;
    pt.startUsed = false;
    pt.joinConfirm = false;
    pt.startReadyAt = pt.menuN + (pt.slot > 0 ? 1 : 2);
  }
  /* UMK3 fighter profile (built from the manual): RUN=R(11)+direction to
     close, BLOCK=L(10), crouch kick=DOWN+X/A, uppercut=DOWN+Y, spin moves=
     AWAY+kick, jump-ins=UP(+toward)+punch, specials are F,F / B,B / D,F /
     D,B + button strings. Per-pilot phase machine, phase-offset so P1/P2
     desync; facing is unknown so approach sides alternate. */
  var UMK3_STRIKES = [1, 0, 8, 9];
  /* Real special-move strings from the manual (pp.19-27). Button map is a
     documented approximation from pp.14-16: uppercut is DOWN+Y so HP=Y(1),
     crouch kicks are X/A so HK=A(8), LK=X(9), leaving LP=B(0); RN=11, BL=10.
     F/B are facing-relative and resolved to fwd/back at play time. */
  var UMK3_MOVEBOOK = [
    { name: 'Kano knife', seq: ['D','B',1] },
    { name: 'Reptile acid', seq: ['F','F',1] },
    { name: 'Cyrax net', seq: ['B','B',9] },
    { name: 'Liu Kang fireball', seq: ['F','F',1] },
    { name: 'Jax gotcha', seq: ['F','F',0] },
    { name: 'Kabal spin', seq: ['B','F',9] },
    { name: 'Shang skull', seq: ['B','B',1] },
    { name: 'Sektor missile', seq: ['F','F',0] },
    { name: 'Nightwolf arrow', seq: ['D','B',0] },
    { name: 'Kung Lao hat', seq: ['B','F',0] },
    { name: 'Kitana fan', seq: ['F','F',1] },
    { name: 'Scorpion spear', seq: ['B','B',0] },
    { name: 'Sonya ring', seq: ['D','F',0] },
    { name: 'Sub-Zero freeze', seq: ['D','F',0] },
    { name: 'Jade rang', seq: ['B','F',0] }
  ];
  function resolveMove(seq, fwd, back){
    return seq.map(function(t){
      if(t === 'F') return fwd;
      if(t === 'B') return back;
      if(t === 'D') return 5;
      if(t === 'U') return 4;
      return t;
    });
  }
  function fightRelease(pl){
    [4, 5, 6, 7, 10, 11].forEach(function(i){ driveIndex(i, false, 'auto', pl); });
  }
  function fightPulse(btn, pl, ms){
    driveIndex(btn, true, 'auto', pl);
    /* always release, even if the pilot was stopped mid-pulse: a skipped
       release would leave strike buttons (Y/X) stuck down */
    setTimeout(function(){ driveIndex(btn, false, 'auto', pl); }, ms || 140);
  }
  function fightTapSeq(steps, pl){
    var t = 0;
    steps.forEach(function(btn){
      setTimeout(function(){ if(autoOn) fightPulse(btn, pl, 120); }, t);
      t += 150;
    });
  }
  function fightTick(pt, idx){
    pt.tick++;
    var phase = Math.floor(pt.tick / 4 + idx * 3) % 6;
    var fwd = (Math.floor(pt.tick / 12 + idx) % 2 === 0) ? AgentMap.dirR : AgentMap.dirL;
    var back = (fwd === AgentMap.dirR) ? AgentMap.dirL : AgentMap.dirR;
    if(phase !== pt.fphase){
      fightRelease(pt.pl); /* never carry a hold across phases */
      pt.fphase = phase;
    }
    if(phase === 0){
      driveIndex(fwd, true, 'auto', pt.pl);
      driveIndex(pt.runBtn, true, 'auto', pt.pl); /* RUN + toward closes distance */
    }else if(phase === 1){
      var s = pt.strikes[(pt.tick + idx) % pt.strikes.length];
      fightPulse(s, pt.pl, 140);
      if(pt.tick % 2 === 0) fightPulse(pt.strikes[(pt.tick + idx + 1) % pt.strikes.length], pt.pl, 140);
    }else if(phase === 2){
      driveIndex(pt.blockBtn, true, 'auto', pt.pl); /* BLOCK, feet planted */
    }else if(phase === 3){
      driveIndex(5, true, 'auto', pt.pl); /* crouch game */
      fightPulse((pt.tick % 2 === 0) ? 1 : 9, pt.pl, 150); /* uppercut / low kick */
    }else if(phase === 4){
      driveIndex(4, true, 'auto', pt.pl);
      driveIndex(fwd, true, 'auto', pt.pl);
      setTimeout(function(){
        if(!autoOn) return;
        fightPulse(pt.strikes[(pt.tick + idx) % pt.strikes.length], pt.pl, 140);
        setTimeout(function(){ if(autoOn){ driveIndex(4, false, 'auto', pt.pl); } }, 200);
      }, 300);
    }else{
      /* Use parsed manual moves when available; otherwise keep striking. */
      var book = (pt.movebook && pt.movebook.length) ? pt.movebook :
        ((AgentOpts.profile === 'umk3' || AgentOpts.profile === 'mix') ? UMK3_MOVEBOOK : []);
      if(book.length){
        var mv = book[(pt.tick + idx) % book.length];
        fightTapSeq(resolveMove(mv.seq, fwd, back), pt.pl);
      }else{
        fightPulse(pt.strikes[(pt.tick + idx) % pt.strikes.length], pt.pl, 140);
      }
    }
  }
  function pilotModes(){
    return autoPilots.map(function(pt){ return 'P' + (pt.pl + 1) + ':' + pt.mode.toUpperCase(); }).join(' ');
  }
  function updateAutoBtn(){
    var b = document.getElementById('btn-autopilot');
    if(b){
      b.textContent = autoOn ? ('⏸ AUTOPILOT: ON (' + pilotModes() + ')') : '▶ AUTOPILOT: OFF';
      b.classList.toggle('autopilot-on', autoOn);
    }
  }
  /* Short, spaced menu pulse: long enough for the menu to see it, short
     enough that consecutive dpad taps stay single steps (no diagonals). */
  function menuTap(pt, btn, delay, base, force){
    var gen = pt.menuGen;
    setTimeout(function(){
      if(!autoOn || !playing || !pt.active || pt.mode !== 'seek' || gen !== pt.menuGen) return;
      /* START is the pause key. After this pilot has seen gameplay, never
         send START again from an ambient menu-looking frame. */
      if(pt.playEvidence && btn === AgentMap.start) return;
      /* If the screen has started scrolling since this burst began, the
         menu is gone — drop the rest of the burst instead of firing A/START
         into live gameplay (START would pause it). */
      if(!force && base){
        var cur = frameGray();
        /* Only drop the burst when the whole picture changed (menu left for
           gameplay). Animated title logos and sprites must not cancel the
           START/A tap, or the pilot sits on a title screen forever. */
        if(cur && grayDiff(base, cur) > 18) return;
      }
      noteWatchTap(pt, btn);
      driveIndex(btn, true, 'auto', pt.pl);
      setTimeout(function(){ driveIndex(btn, false, 'auto', pt.pl); }, 140);
    }, delay || 0);
  }
  function gridMenuStep(pt, idx){
    var base = frameGray(); /* burst baseline: abort when the world moves */
    var now = Date.now();
    /* Two roles, not two copies of the same navigator. The lead pilot walks
       grids and confirms; the join pilot only presses START once to enter.
       Otherwise both controllers would fight over the same cursor and the
       same menu. */
    if(pt.menuRole === 'join'){
      var canJoin = !pt.everPlayed && !pt.startUsed && pt.menuN >= pt.startReadyAt;
      if(canJoin){
        pt.startUsed = true;
        pt.lastStart = now;
        menuTap(pt, AgentMap.start, idx * 20, base, true);
        pt.lastConfirmAt = now;
        return;
      }
      return;
    }
    /* START is the pause button in live gameplay, so the lead pilot gets
       ONE START per menu screen, after its first grid/A pass. A new screen
       re-arms it; nothing here ever repeats START every tick. */
    /* In two-player mode P2 is the joiner and owns START. P1 must not
       also press it: the second START lands after the game begins and
       toggles pause. Solo P1 keeps its one START. */
    /* Before the first real scroll, P1 must be allowed to press START even
       in two-player mode: many titles only listen to controller 1 on the
       title/select/file screens. Once playEvidence is true this lockout
       prevents START from pausing a live game. */
    var canStart = !pt.playEvidence && !pt.startUsed && pt.menuN >= pt.startReadyAt;
    if(canStart){
      pt.startUsed = true;
      pt.lastStart = now;
      menuTap(pt, AgentMap.start, idx * 20, base, true);
      pt.lastConfirmAt = now;
      return;
    }
    var pattern = MENU_GRID_MOVES[(pt.menuN + idx * 5) % MENU_GRID_MOVES.length];
    var delay = 0;
    pattern.forEach(function(btn){
      menuTap(pt, btn, delay, base);
      delay += 220;
    });
    /* Confirm with the game's menu button, not its primary gameplay
       action. SMAS SELECT GAME uses B; Super Mario World and most other
       games use A. The tunable seek tap is only a fallback when it is
       neither the menu confirm nor START. */
    var confirmBtn = AgentMap.actions[0];
    if(pt.manual && MENU_CONFIRM_OVERRIDE[pt.manual.id] != null){
      confirmBtn = MENU_CONFIRM_OVERRIDE[pt.manual.id];
    }
    var extra = pickSeekTap(pt);
    /* When the manual says START is the confirm (SMAS), do not inject an
       unrelated A/B tap first: on File Select that can erase a save. */
    if(confirmBtn !== AgentMap.start && extra !== confirmBtn && extra !== AgentMap.start){
      menuTap(pt, extra, delay, base);
      delay += 220;
    }
    menuTap(pt, confirmBtn, delay, base, true);
    pt.lastConfirmAt = now;
  }
  function styleStatusText(){
    var m = MANUAL_STATE.current;
    var style = autoPilots.length ? (autoPilots[0].style || 'platformer') :
      ((m && m.style) || 'platformer');
    var title = m ? m.title : (currentName || 'no ROM');
    var moves = (m && m.moves) ? m.moves.length : 0;
    return { style: style, title: title, moves: moves };
  }
  function updateAgentHud(){
    var maxD = 0, dirs = '';
    autoPilots.forEach(function(pt){
      if(pt.diff > maxD) maxD = pt.diff;
      if(autoOn && pt.mode === 'play'){
        dirs += ' P' + (pt.pl + 1) + (pt.dir === AgentMap.dirL ? '◀' : '▶') +
          (pt.dirY === 4 ? '▲' : (pt.dirY === 5 ? '▼' : ''));
      }
    });
    var mapInfo = '';
    if(autoOn && AgentOpts.world !== false && autoPilots.length && autoPilots[0].world){
      var ws = autoPilots[0].world.stats();
      mapInfo = ' · map ' + ws.cells + 'c/' + ws.landmarks + 'L' + (ws.exploring ? ' EXP' : '');
    }
    var txt = (autoOn ? pilotModes() : 'OFF') + ' · d=' + maxD.toFixed(1) + dirs +
      (autoOn ? ' · ' + autoPilots.map(function(pt){ return 'P' + (pt.pl + 1); }).join('+') : '') +
      (autoOn && AgentOpts.autoTune ? ' · AT' : '') +
      (autoOn && MANUAL_STATE.current ? ' · MANUAL' : '') +
      (autoOn && AgentOpts.profile === 'umk3' ? ' · UMK3' : '') +
      (autoOn && AgentOpts.profile === 'mix' ? ' · MIX' : '') +
      (autoOn && autoPilots.some(function(pt){ return pt.agent; }) ? ' · UNIFIED' : '') + mapInfo;
    $all('.agent-hud').forEach(function(e){
      e.textContent = txt;
      e.classList.toggle('hidden', !AgentOpts.hud);
    });
    var st = styleStatusText();
    var showStyle = autoOn || playing;
    $all('.auto-style').forEach(function(e){
      e.textContent = (autoOn ? 'AI · ' : 'AI OFF · ') + st.style.toUpperCase() + ' · ' + st.title +
        (st.moves ? ' · ' + st.moves + ' moves' : ' · strikes');
      e.classList.toggle('hidden', !showStyle);
    });
    var ss = document.getElementById('ai-style-summary');
    if(ss) ss.textContent = (autoOn ? 'AUTOPILOT ON' : 'AUTOPILOT OFF') + ' · ' +
      st.style.toUpperCase() + ' · ' + st.title + ' · ' +
      (st.moves ? st.moves + ' parsed moves' : 'no parsed moves') +
      (autoOn ? ' · ' + pilotModes() : '');
    var hb = document.getElementById('btn-hud');
    if(hb) hb.textContent = AgentOpts.hud ? 'HUD: ON' : 'HUD: OFF';
  }
  function enterPlay(pt){
    if(pt.mode === 'play') return;
    /* A platformer is not "playing" until the manual's menu plan has been
       executed. This is what stops an animated title logo from parking the
       brain in ACT while the game is still at START. */
    if(pt.style === 'platformer' && !pt.bootDone) return;
    pt.mode = 'play';
    pt.everPlayed = true;
    autoPilots.forEach(function(o){ o.menuGen++; }); /* cancel queued menu bursts */
    updateAutoBtn();
  }
  function sensePilot(pt, g){
    if(!g || !pt.prev){ pt.prev = g; return 0; }
    var d = grayDiff(g, pt.prev);
    pt.prev = g;
    pt.lastD = d;
    if(d > pt.brain.hiThresh){
      pt.hi++; pt.lo = 0;
      if(pt.hi >= pt.brain.hiStreak) enterPlay(pt);
    }else if(d < pt.brain.loThresh){
      pt.lo++; pt.hi = 0;
      if(pt.lo >= pt.brain.loStreak && pt.mode !== 'seek'){
        /* Static gameplay is normal (standing Mario, text box); only fall
           back to SEEK while still navigating pre-game menus. Once a pilot
           has played, START stays locked out anyway. */
        if(!pt.playEvidence){
          pt.mode = 'seek';
          armStart(pt); /* new episode: allow one START again */
          releasePilot(pt.pl); updateAutoBtn();
        }
      }else if(pt.mode === 'seek' && pt.lastConfirmAt &&
               Date.now() - pt.lastConfirmAt >= Math.max(1800, pt.brain.senseMs) &&
               grayMean(g) >= pt.brain.blackMean){
        /* A confirm was sent a while ago and the screen has settled. Static
           gameplay (a standing Mario, a text box) never scrolls, so pixel
           motion alone would leave the pilot in SEEK forever. */
        enterPlay(pt);
      }
    }else{ pt.hi = 0; pt.lo = 0; }
    return d;
  }
  function agentMenuTick(pt){
    if(!autoOn || !playing || !pt.active) return;
    var nowFrame = frameGray();
    var newScreen = false;
    if(pt.menuGuardFrame && nowFrame){
      /* Between this pilot's menu ticks the world started scrolling →
         gameplay is already running. Do not fire another A/START burst
         into it. The other pilot has its own guard and keeps its rhythm. */
      if(Math.abs(colShift(pt.menuGuardFrame, nowFrame)) >= 2 ||
         Math.abs(rowShift(pt.menuGuardFrame, nowFrame)) >= 2){
        pt.menuGuardFrame = nowFrame;
        return;
      }
      /* A large whole-picture change means this is a different menu
         screen, so re-arm exactly one START for this pilot. Animated title
         logos/sprites are small local changes and must not keep re-arming
         START forever (that leaves the pilot stuck on the title). */
      newScreen = grayDiff(pt.menuGuardFrame, nowFrame) > 18;
    }
    pt.menuGuardFrame = nowFrame;
    /* Before gameplay, a genuinely new menu screen may need its own START
       (title -> select -> 2P join). Once everPlayed is true, armStart is a
       no-op, so this cannot toggle pause in a live game. */
    if(newScreen) armStart(pt);
    /* Manual boot plan beats pixel guessing before the first level. */
    if(pt.style === 'platformer' && !pt.bootDone){
      var bn = Date.now();
      if(!pt.bootStartAt) pt.bootStartAt = bn;
      /* Let the boot/title animation finish before the first START. The
         silhouette-to-logo fade looks like movement to a pixel diff, so a
         fixed delay either fires into the fade (ignored) or waits too
         long. Screen stability is the honest signal. */
      var bf = frameGray();
      if(bf && pt.bootFrame){
        if(grayDiff(pt.bootFrame, bf) < 10) pt.bootStable = (pt.bootStable || 0) + 1;
        else pt.bootStable = 0;
      }
      pt.bootFrame = bf;
      if(!pt.bootNext && (pt.bootStable || 0) >= 2 && bn - pt.bootStartAt >= 3000){
        pt.bootNext = bn;
      }
      if(pt.bootNext && bn >= pt.bootNext){
        var step = Math.min(pt.bootStep, pt.bootPlan.length - 1);
        pt.bootStep++;
        pt.lastStart = bn;
        pt.lastConfirmAt = bn;
        pt.startUsed = true;
        /* force: the screen is deliberately changing between menus */
        menuTap(pt, pt.bootPlan[step], 0, null, true);
        if(pt.bootStep >= pt.bootPlan.length){
          pt.bootDone = true;
          pt.bootNext = 0;
          pt.bootEnterAt = bn + 2000;
        }else{
          pt.bootNext = bn + 2600;
        }
      }
      if(pt.bootDone && pt.bootEnterAt && Date.now() >= pt.bootEnterAt){
        pt.bootEnterAt = 0;
        enterPlay(pt);
      }
      return;
    }
    if(pt.mode !== 'seek' || !pt.menus) return;
    pt.menuN++;
    gridMenuStep(pt, pt.slot);
  }
  function agentSenseTick(pt){
    if(!autoOn || !playing || !pt.active){ pt.prev = null; return; }
    /* One RGB+gray tap feeds both the reactive copilot and the world
       model; no second canvas readback for poke.AI-style mapping. */
    var vf = captureVision();
    var g = vf && vf.gray;
    if(!g) return;
    if(grayMean(g) < pt.brain.blackMean){
      /* black transition / fade-out: only this pilot heals and releases */
      pt.prev = g; pt.hi = 0; pt.lo = 0; pt.diff = 0;
      if(pt.mode !== 'seek'){ pt.mode = 'seek'; armStart(pt); }
      releasePilot(pt.pl);
      updateAutoBtn(); updateAgentHud(); updateScreenWatch();
      return;
    }
    if(!pt.prev){ pt.prev = g; return; }
    var sh = colShift(pt.prev, g);
    var shy = rowShift(pt.prev, g);
    var d = sensePilot(pt, g);
    /* Real play evidence is sustained camera movement, not a diff spike:
       animated title logos can fool a single-frame pixel test. Until this
       fires, a platformer may still be sitting on a title/menu screen even
       though SEEK has already handed over to ACT. */
    if(Math.abs(sh) >= 2 || Math.abs(shy) >= 2){
      pt.scrollRun = (pt.scrollRun || 0) + 1;
    }else{
      pt.scrollRun = 0;
    }
    if(pt.scrollRun >= 2) pt.playEvidence = true;
    if(sh >= 2) pt.dir = AgentMap.dirR;
    else if(sh <= -2) pt.dir = AgentMap.dirL;
    if(shy >= 2){ pt.dirY = 5; pt.dirYMiss = 0; }
    else if(shy <= -2){ pt.dirY = 4; pt.dirYMiss = 0; }
    else if(pt.dirY !== null && ++pt.dirYMiss >= 2){ pt.dirY = null; pt.dirYMiss = 0; }
    pt.diff = d;
    /* World memory: integrate scroll as odometry, match salient blobs to
       the pilot's landmark list, and ask the frontier planner for a
       direction when the current screen is already mapped. */
    var explored = 0;
    if(pt.agent) pt.agent.noteLoop(pt.mode);
    if(AgentOpts.world !== false && pt.agent){
      /* The unified core owns the world layer, so its world tick and the
         agent's loop phase advance together. */
      var wr = pt.agent.perceive({ sh: sh, shy: shy, rgb: vf.rgb, mode: pt.mode });
      explored = wr.newCells;
      pt.mapDir = wr.suggested;
    }else if(AgentOpts.world !== false && pt.world){
      var wr2 = pt.world.observe({ sh: sh, shy: shy, rgb: vf.rgb, mode: pt.mode });
      explored = wr2.newCells;
      pt.mapDir = wr2.suggested;
    }else{
      pt.mapDir = 0;
    }
    /* Menu watchdog: platformers scroll once a level is live. If the
       unified brain thinks it is playing but nothing has ever scrolled,
       it is almost certainly parked on a title/select/file screen. Go
       back to SEEK so the manual's START/confirm knowledge is used again.
       This can never fire after the first real scroll, so it cannot pause
       a running game. */
    if(!pt.playEvidence && pt.style === 'platformer' && pt.mode === 'play'){
      pt.quietTicks = (Math.abs(sh) < 2 && Math.abs(shy) < 2) ? (pt.quietTicks || 0) + 1 : 0;
      if(pt.quietTicks >= 2){
        pt.mode = 'seek';
        pt.quietTicks = 0;
        pt.everPlayed = false;
        pt.startUsed = false;
        armStart(pt);
        releasePilot(pt.pl);
      }
    }else{
      pt.quietTicks = 0;
    }
    rewardPlayAction(pt, d, sh, shy, explored);
    watchMetrics(pt, d, sh, shy);
    /* each pilot runs its own tuner against its own brain copy; no
       thresholds, hop cadence or seek cycle are shared */
    antonGovern(pt, d);
    updateAgentHud();
    updateScreenWatch();
    updateWorldPanel();
  }
  /* Frontier override: only when the world is not already scrolling. A
     mapped screen plus a stalled camera means the reactive vote has run
     out of new ground, so the map picks the side with unvisited cells. */
  function frontierDir(pt){
    if(AgentOpts.world === false || !pt.world || !pt.mapDir) return 0;
    if(Math.abs(pt.watch.lastSh) >= 2 || pt.watch.progressEma >= 3) return 0;
    return pt.mapDir;
  }
  function platformerTick(pt, idx){
    pt.tick++;
    var fd = frontierDir(pt);
    if(fd) pt.dir = fd > 0 ? AgentMap.dirR : AgentMap.dirL;
    /* release the opposite direction first: if the scroll vote flipped,
       the old hold would otherwise stay latched (L+R stuck) */
    driveIndex(pt.dir === AgentMap.dirL ? AgentMap.dirR : AgentMap.dirL, false, 'auto', pt.pl);
    driveIndex(pt.dir, true, 'auto', pt.pl);
    /* run/dash only while this pilot's pixels actually demand it */
    var wantsRun = !pt.watch.haveData || pt.diff > pt.brain.loThresh ||
      Math.abs(pt.watch.lastSh) >= 2 || Math.abs(pt.watch.lastShy) >= 2;
    pt.watch.runWanted = wantsRun;
    driveIndex(pt.runBtn, wantsRun, 'auto', pt.pl);
    if(pt.dirY !== null){
      /* vertical scroll voted: hold the voted direction (Up/Down),
         releasing the opposite first — same anti-stuck rule as horizontal */
      driveIndex(pt.dirY === 4 ? 5 : 4, false, 'auto', pt.pl);
      driveIndex(pt.dirY, true, 'auto', pt.pl);
    }else{
      driveIndex(4, false, 'auto', pt.pl);
      driveIndex(5, false, 'auto', pt.pl);
      if(pt.tick % 8 === 7){
        /* no vertical scroll: exploratory nudge, alternating DOWN/UP
           (ladders, doors, ducking, swimming) */
        var vn = ((pt.tick >> 3) % 2 === 0) ? 5 : 4;
        driveIndex(vn, true, 'auto', pt.pl);
        (function(v, pl){
          setTimeout(function(){ if(autoOn) driveIndex(v, false, 'auto', pl); }, pt.brain.hopPulseMs);
        })(vn, pt.pl);
      }
    }
    var hopEvery = Math.max(1, pt.brain.hopEvery);
    if((pt.tick + idx) % hopEvery === 0){
      /* own rhythm per pilot: phase-offset hops, own button order */
      pt.hopN++;
      var btn = pickPlayAction(pt); /* manual prior + this pilot's own reward history */
      driveIndex(btn, true, 'auto', pt.pl);
      (function(b, pl){
        setTimeout(function(){ if(autoOn) driveIndex(b, false, 'auto', pl); }, pt.brain.hopPulseMs);
      })(btn, pt.pl);
      if(pt.hopN % 2 === 0){
        /* every other beat works a shoulder too — dash/strafe/special, per
           game. X is already in the action rotation, Y is the run hold. */
        pt.shN++;
        var sh = pt.shoulders[pt.shN % pt.shoulders.length];
        driveIndex(sh, true, 'auto', pt.pl);
        (function(s2, pl){
          setTimeout(function(){ if(autoOn) driveIndex(s2, false, 'auto', pl); }, pt.brain.hopPulseMs);
        })(sh, pt.pl);
      }
    }
  }
  function styleRelease(pt, keep){
    [4, 5, 6, 7].forEach(function(i){
      if(i !== keep) driveIndex(i, false, 'auto', pt.pl);
    });
  }
  function styleTap(pt, btn, ms){
    if(btn != null) fightPulse(btn, pt.pl, ms || 130);
  }
  /* Shooter: strafe, fire continuously, dodge vertically, use a bomb. */
  function shooterTick(pt, idx){
    pt.tick++;
    var dir = ((Math.floor(pt.tick / 7) + idx) % 2 === 0) ? AgentMap.dirR : AgentMap.dirL;
    styleRelease(pt, dir);
    driveIndex(dir, true, 'auto', pt.pl);
    if(pt.tick % 2 === 0) styleTap(pt, pt.strikes[(pt.tick + idx) % pt.strikes.length], 120);
    if(pt.tick % 5 === 0){
      var vy = ((pt.tick >> 3) % 2 === 0) ? 5 : 4;
      styleTap(pt, vy, pt.brain.hopPulseMs);
    }
    if(pt.tick % 9 === 0) styleTap(pt, pt.shoulders[(pt.tick + idx) % pt.shoulders.length], 150);
  }
  /* Sports: chase the play direction, sprint, pass/shoot on a beat. */
  function sportsTick(pt, idx){
    pt.tick++;
    var sh = pt.watch.lastSh || 0;
    var dir = sh > 1 ? AgentMap.dirR : (sh < -1 ? AgentMap.dirL :
      (((Math.floor(pt.tick / 8) + idx) % 2 === 0) ? AgentMap.dirR : AgentMap.dirL));
    styleRelease(pt, dir);
    driveIndex(dir, true, 'auto', pt.pl);
    driveIndex(pt.runBtn, true, 'auto', pt.pl);
    if(pt.tick % 2 === 0) styleTap(pt, pt.strikes[(pt.tick + idx) % pt.strikes.length], 140);
    if(pt.tick % 7 === 0) styleTap(pt, pt.shoulders[(pt.tick + idx) % pt.shoulders.length], 150);
    if(pt.tick % 23 === 0) styleTap(pt, 5, 180);
  }
  /* Racing: hold throttle, steer from the road's horizontal motion, drift. */
  function racingTick(pt, idx){
    pt.tick++;
    var sh = pt.watch.lastSh || 0;
    var dir = sh > 1 ? AgentMap.dirR : (sh < -1 ? AgentMap.dirL :
      (((Math.floor(pt.tick / 11) + idx) % 2 === 0) ? AgentMap.dirR : AgentMap.dirL));
    styleRelease(pt, dir);
    driveIndex(dir, true, 'auto', pt.pl);
    driveIndex(pt.order[0], true, 'auto', pt.pl); /* throttle */
    if(pt.tick % 9 === 0) styleTap(pt, pt.shoulders[(pt.tick + idx) % pt.shoulders.length], 160);
    if(pt.tick % 17 === 0) styleTap(pt, 5, 220); /* brake / reverse */
  }
  /* Puzzle: slow cursor movement and rotate/confirm taps, no run holds. */
  function puzzleTick(pt, idx){
    pt.tick++;
    styleRelease(pt, null);
    var dirs = [AgentMap.dirL, AgentMap.dirR, 4, 5];
    if(pt.tick % 4 === 0) styleTap(pt, dirs[(Math.floor(pt.tick / 4) + idx) % dirs.length], 150);
    if(pt.tick % 3 === 0) styleTap(pt, pt.strikes[(pt.tick + idx) % pt.strikes.length], 120);
    if(pt.tick % 13 === 0) styleTap(pt, 4, 180); /* hard drop / rotate */
  }
  /* Beat-’em-up: close distance, punch/kick, jump in, occasional guard. */
  function beatEmUpTick(pt, idx){
    pt.tick++;
    var sh = pt.watch.lastSh || 0;
    var dir = sh > 1 ? AgentMap.dirR : (sh < -1 ? AgentMap.dirL :
      (((Math.floor(pt.tick / 6) + idx) % 2 === 0) ? AgentMap.dirR : AgentMap.dirL));
    styleRelease(pt, dir);
    driveIndex(dir, true, 'auto', pt.pl);
    driveIndex(pt.runBtn, pt.tick % 3 !== 0, 'auto', pt.pl);
    styleTap(pt, pt.strikes[(pt.tick + idx) % pt.strikes.length], 140);
    if(pt.tick % 8 === 0) styleTap(pt, 4, 180);
    if(pt.tick % 11 === 0) styleTap(pt, pt.blockBtn, 260);
    if(pt.tick % 13 === 0) styleTap(pt, pt.shoulders[(pt.tick + idx) % pt.shoulders.length], 160);
  }
  /* Adventure: explore like a platformer, but work the sword/action and
     shield more deliberately than the generic hop bot. */
  function adventureTick(pt, idx){
    pt.tick++;
    var sh = pt.watch.lastSh || 0;
    var dir = sh > 1 ? AgentMap.dirR : (sh < -1 ? AgentMap.dirL :
      (((Math.floor(pt.tick / 9) + idx) % 2 === 0) ? AgentMap.dirR : AgentMap.dirL));
    var fd = frontierDir(pt);
    if(fd) dir = fd > 0 ? AgentMap.dirR : AgentMap.dirL;
    styleRelease(pt, dir);
    driveIndex(dir, true, 'auto', pt.pl);
    driveIndex(pt.runBtn, pt.watch.haveData && pt.diff > pt.brain.loThresh, 'auto', pt.pl);
    if(pt.tick % 4 === 0) styleTap(pt, pt.strikes[(pt.tick + idx) % pt.strikes.length], 150);
    if(pt.tick % 11 === 0) styleTap(pt, 4, pt.brain.hopPulseMs);
    if(pt.tick % 13 === 0) styleTap(pt, pt.blockBtn, 220);
    if(pt.tick % 17 === 0) styleTap(pt, 5, 180);
    if(pt.tick % 19 === 0) styleTap(pt, pt.shoulders[(pt.tick + idx) % pt.shoulders.length], 150);
  }
  /* Mix: alternate ~2.4s platformer blocks with ~2.4s UMK3 fighter blocks.
     Each boundary releases the other profile's holds so run/dash, directions,
     block and strike timers never stay latched across modes. Pilots are
     phase-offset, so P2 is not always in the same block as P1. */
  function mixTick(pt, idx){
    var wantFight = Math.floor((pt.tick + idx * 3) / 8) % 2 === 1;
    if(wantFight !== pt.mixFight){
      if(wantFight){
        driveIndex(AgentMap.run, false, 'auto', pt.pl);
        [4, 5, 6, 7].forEach(function(i){ driveIndex(i, false, 'auto', pt.pl); });
      }else{
        fightRelease(pt.pl);
        driveIndex(AgentMap.run, false, 'auto', pt.pl);
      }
      pt.mixFight = wantFight;
    }
    if(wantFight) fightTick(pt, idx);
    else platformerTick(pt, idx);
  }
  function agentDriveTick(pt){
    if(!autoOn || !playing || !pt.active) return;
    if(pt.mode !== 'play') return; /* menus get taps only — held buttons would fight navigation */
    if(AgentOpts.profile === 'umk3'){ fightTick(pt, pt.slot); return; }
    if(AgentOpts.profile === 'mix'){ mixTick(pt, pt.slot); return; }
    /* The manual's style selects one of several input policies. */
    var style = pt.style || (pt.kind === 'fighter' ? 'fighter' : 'platformer');
    if(style === 'fighter') fightTick(pt, pt.slot);
    else if(style === 'shooter') shooterTick(pt, pt.slot);
    else if(style === 'sports') sportsTick(pt, pt.slot);
    else if(style === 'racing') racingTick(pt, pt.slot);
    else if(style === 'puzzle') puzzleTick(pt, pt.slot);
    else if(style === 'beat-em-up') beatEmUpTick(pt, pt.slot);
    else if(style === 'adventure') adventureTick(pt, pt.slot);
    else platformerTick(pt, pt.slot);
  }
  /* Each pilot gets its own three intervals. Stopping or retiming one has no
     effect on the other; callbacks only ever drive pt.pl. */
  function clearPilotTimer(pt, kind){
    var id = pt.timers[kind];
    if(id){ clearTimeout(id); clearInterval(id); pt.timers[kind] = null; }
  }
  function stopPilotTimers(pt, dead){
    ['menu', 'sense', 'drive'].forEach(function(k){ clearPilotTimer(pt, k); });
    if(dead) pt.active = false;
  }
  function armPilotTimer(pt, kind, ms, delay){
    clearPilotTimer(pt, kind);
    var fn = function(){
      if(!pt.active || !autoOn) return;
      if(kind === 'menu') agentMenuTick(pt);
      else if(kind === 'sense') agentSenseTick(pt);
      else agentDriveTick(pt);
    };
    pt.timers[kind] = setTimeout(function(){
      pt.timers[kind] = null;
      if(!pt.active || !autoOn) return;
      fn();
      if(pt.active && autoOn) pt.timers[kind] = setInterval(fn, ms);
    }, delay || 0);
  }
  function pilotPhase(pt, kind){
    /* stagger the pilots so their sense/menu/drive beats are not the same
       event-loop turn. P1 and P2 then cross SEEK/PLAY and menus on their
       own clocks instead of moving as one. */
    var off = pt.slot * 240;
    if(kind === 'sense') off += 90;
    else if(kind === 'drive') off += 160;
    return off;
  }
  function startPilotTimers(pt){
    armPilotTimer(pt, 'menu', AgentOpts.tapMs, pilotPhase(pt, 'menu'));
    armPilotTimer(pt, 'sense', AgentOpts.senseMs, pilotPhase(pt, 'sense'));
    armPilotTimer(pt, 'drive', AgentOpts.driveMs, pilotPhase(pt, 'drive'));
  }
  function anyAgentTimer(kind){
    for(var i = 0; i < autoPilots.length; i++){
      if(autoPilots[i].timers && autoPilots[i].timers[kind]) return true;
    }
    return false;
  }
  function stopAgentTimers(){
    autoPilots.forEach(function(pt){ stopPilotTimers(pt, true); });
  }
  function startAgentTimers(){
    autoPilots.forEach(startPilotTimers);
  }
  /* Retime exactly one running loop on every pilot; no release, no pilot
     reset, no pause. The next tick simply uses the new interval. */
  function retimeAgentLoop(which){
    if(!autoOn) return;
    autoPilots.forEach(function(pt){
      if(which === 'menu') armPilotTimer(pt, 'menu', AgentOpts.tapMs, pilotPhase(pt, 'menu'));
      else if(which === 'sense') armPilotTimer(pt, 'sense', AgentOpts.senseMs, pilotPhase(pt, 'sense'));
      else if(which === 'drive') armPilotTimer(pt, 'drive', AgentOpts.driveMs, pilotPhase(pt, 'drive'));
    });
    updateAiStatus();
  }
  function startAgentEngine(){
    parseSeekCycle();
    stopAgentTimers();
    releaseAuto(); /* old roster's holds must not survive a rebuild */
    autoPilots = autoPlayers().map(function(pl, i){ return makePilot(pl, i); });
    startAgentTimers();
    /* rebuilds happen from roster changes too: keep the button/HUD in sync
       with the new pilot roster immediately, not on the next sense tick */
    updateAutoBtn();
    updateAgentHud();
    updateScreenWatch();
    updateWorldPanel();
  }
  /* Son of Anton screen watcher + live governor.
     Every sense tick we measure what the picture is doing — motion, how
     long it has been still, which way it scrolls, and whether the last
     seek tap actually changed it — then adjust the controls that are
     already running: steering, RUN, hop cadence, seek tap choice, and the
     SEEK/PLAY thresholds. All changes stay inside the tune-grid clamps and
     are reported in #anton-live / #anton-watch. */
  function antonSay(txt){
    var el = document.getElementById('anton-live');
    if(el) el.textContent = 'UNIFIED · ' + txt;
  }
  function antonGovern(pt, dMax){
    if(!AgentOpts.autoTune || !autoOn || !playing || !pt.active) return;
    if(!pt.agent) return;
    /* Son of Anton is no longer a parallel monitor: the governor lives in
       the same AntonCore as the world map and policy, and mutates this
       pilot's brain/cycle directly. */
    var msg = pt.agent.govern({
      label: 'P' + (pt.pl + 1), mode: pt.mode, diff: dMax,
      stillMs: pt.watch.stillMs, progressEma: pt.watch.progressEma,
      lastSh: pt.watch.lastSh, lastShy: pt.watch.lastShy,
      brain: pt.brain, cycle: pt.cycle
    });
    if(msg) antonSay('P' + (pt.pl + 1) + ' ' + msg);
  }
  function toggleAutotune(){
    AgentOpts.autoTune = !AgentOpts.autoTune;
    saveAgentOpts(); renderTuneInputs();
    antonSay(AgentOpts.autoTune ? 'watching the copilot…' : 'off — manual tuning only');
    updateScreenWatch();
    updateWorldPanel();
  }
  function startAutopilot(){
    if(autoOn) return;
    autoOn = true;
    if(AgentOpts.autoTune) antonSay('watching the copilot…');
    if(!playing) powerOn();
    startAgentEngine();
    updateAutoBtn(); updateAgentHud();
  }
  function stopAutopilot(){
    autoOn = false;
    stopAgentTimers();
    autoPilots = [];
    releaseAuto();
    updateAutoBtn(); updateAgentHud(); updateScreenWatch(); updateWorldPanel();
  }
  function toggleAutopilot(){ if(autoOn) stopAutopilot(); else startAutopilot(); }
  function toggleHud(){ AgentOpts.hud = !AgentOpts.hud; saveAgentOpts(); updateAgentHud(); }

  /* ---------- tune the brain (AI Lab inputs) ---------- */
  var TuneFields = [
    ['senseMs', 500, 5000], ['tapMs', 2000, 10000], ['hiThresh', 1, 40],
    ['loThresh', 0.5, 20], ['hopEvery', 1, 10]
  ];
  function renderTuneInputs(){
    TuneFields.forEach(function(f){
      var el = document.getElementById('opt-' + f[0]);
      if(el) el.value = AgentOpts[f[0]];
    });
    var cy = document.getElementById('opt-seekCycle');
    if(cy) cy.value = AgentOpts.seekCycle;
    var ps = document.getElementById('opt-players');
    if(ps) ps.value = (AgentOpts.players || [0]).join(',');
    var at = document.getElementById('btn-autotune');
    if(at) at.textContent = 'AUTO-TUNE: ' + (AgentOpts.autoTune ? 'ON' : 'OFF');
    var pf = document.getElementById('opt-profile');
    if(pf) pf.value = (AgentOpts.profile === 'umk3') ? 'umk3' : (AgentOpts.profile === 'mix' ? 'mix' : 'generic');
    var wl = document.getElementById('opt-world');
    if(wl) wl.checked = AgentOpts.world !== false;
    var map = document.getElementById('agent-map-readout');
    if(map) map.textContent = 'map: dirR=' + AgentMap.dirR + ' dirL=' + AgentMap.dirL +
      ' run=' + AgentMap.run + ' actions=[' + AgentMap.actions.join(',') +
      '] shoulders=[' + AgentMap.shoulders.join(',') +
      '] select=' + AgentMap.select + ' start=' + AgentMap.start;
  }
  function resetAgentOpts(){
    var oldPlayers = (AgentOpts.players || []).join(',');
    AgentOpts = Object.assign({}, AgentDefaults);
    saveAgentOpts(); renderTuneInputs();
    watchReset();
    if(autoOn){
      /* only the roster needs a pilot rebuild; everything else is live */
      if((AgentOpts.players || []).join(',') !== oldPlayers) startAgentEngine();
      else { parseSeekCycle(); retimeAgentLoop('menu'); retimeAgentLoop('sense'); }
    }
    updateAgentHud();
    updateWorldPanel();
  }

  /* ---------- Son of Anton: report-only code health (never modifies files) ---------- */
  var ANTON_SOURCES = ['index.html', 'style.css', 'script.js', 'ai/son-of-anton.js', 'ai/world-memory.js', 'ai/anton-core.js'];
  function runAntonScan(){
    var box = document.getElementById('anton-results');
    if(box) box.innerHTML = '<p class="modal-desc">Scanning…</p>';
    if(typeof window.SonOfAnton === 'undefined'){
      if(box) box.innerHTML = '<p class="modal-desc">Analyzer failed to load.</p>';
      return;
    }
    var anton = new window.SonOfAnton();
    var jobs = ANTON_SOURCES.map(function(name){
      return fetch(name).then(function(r){
        if(!r.ok) throw new Error(name + ' HTTP ' + r.status);
        return r.text().then(function(text){ return { name: name, content: text }; });
      }).catch(function(){ return { name: name, content: '', error: true }; });
    });
    Promise.all(jobs).then(function(sources){
      var rows = anton.analyzeAll(sources.filter(function(s){ return !s.error; }));
      if(!box) return;
      box.innerHTML = '';
      if(!rows.length){ box.innerHTML = '<p class="modal-desc">No sources readable.</p>'; return; }
      var sum = 0, worst = rows[0];
      rows.forEach(function(r){
        sum += r.score;
        if(r.score > worst.score) worst = r;
        var item = document.createElement('div'); item.className = 'rom-list-item';
        var nm = document.createElement('div'); nm.className = 'rom-name';
        nm.textContent = r.name + ' — ' + r.score.toFixed(2) + ' ' + r.verdict +
          ' (' + r.lines + ' lines, ' + r.commentLines + ' comments, ' + r.logStatements + ' logs)';
        item.appendChild(nm); box.appendChild(item);
      });
      /* The analyzer feeds the same unified status line as the live
         governor, so Son of Anton is one layer of the agent, not a
         detached report. */
      ANTON_SCAN = { at: Date.now(), avg: Math.round(sum / rows.length * 100) / 100,
        verdict: worst.verdict, worst: worst.name };
      updateUnifiedPanel();
    });
  }

  /* Readable WebGL: the emulator's canvas is created WITHOUT
     preserveDrawingBuffer, so 2D readback returns pure black and all
     vision (sense loop + recorder) goes blind (d=0.0 forever). Force the
     flag on every WebGL context at creation — before the loader runs. */
  (function patchGL(){
    try{
      var proto = window.HTMLCanvasElement && HTMLCanvasElement.prototype;
      if(!proto || !proto.getContext) return;
      var og = proto.getContext;
      proto.getContext = function(type, attrs){
        if(type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl'){
          try{ attrs = Object.assign({}, attrs, { preserveDrawingBuffer: true }); }
          catch(e){ attrs = { preserveDrawingBuffer: true }; }
        }
        return og.call(this, type, attrs);
      };
    }catch(e){}
  })();
  /* Passive audio tap: learn the emulator's AudioContext the first time
     it creates a node, then attach ONE extra analyser as an additional
     destination. The existing graph is untouched (extra connect() calls
     never alter the original path), so sound keeps working while we
     sample RMS/peak energy alongside frames and inputs. */
  var audioTap = { ctx: null, analyser: null, buf: null, busy: false };
  (function patchAudio(){
    try{
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!AC || !AC.prototype || !window.AudioNode) return;
      var methods = ['createScriptProcessor', 'createGain', 'createAnalyser',
        'createBufferSource', 'createOscillator', 'createBiquadFilter'];
      methods.forEach(function(m){
        if(typeof AC.prototype[m] !== 'function') return;
        var f = AC.prototype[m];
        AC.prototype[m] = function(){ audioTap.ctx = audioTap.ctx || this; return f.apply(this, arguments); };
      });
      var oc = window.AudioNode.prototype.connect;
      window.AudioNode.prototype.connect = function(){
        try{
          if(!audioTap.busy && audioTap.ctx && !audioTap.analyser &&
             this.context === audioTap.ctx){
            audioTap.busy = true;
            try{
              audioTap.analyser = audioTap.ctx.createAnalyser();
              audioTap.analyser.fftSize = 2048;
              audioTap.buf = new Float32Array(2048);
              oc.call(this, audioTap.analyser);
            }catch(e2){}
            audioTap.busy = false;
          }
        }catch(e){}
        return oc.apply(this, arguments);
      };
    }catch(e){}
  })();
  function sampleAudio(t){
    if(!audioTap.analyser || !audioTap.buf) return null;
    try{
      audioTap.analyser.getFloatTimeDomainData(audioTap.buf);
      var sum = 0, peak = 0;
      for(var i = 0; i < audioTap.buf.length; i++){
        var v = audioTap.buf[i];
        sum += v * v;
        var a = v < 0 ? -v : v;
        if(a > peak) peak = a;
      }
      return { t: t, rms: Math.round(Math.sqrt(sum / audioTap.buf.length) * 1000) / 1000,
               peak: Math.round(peak * 1000) / 1000 };
    }catch(e){ return null; }
  }

  /* ---------- learning recorder: screen + inputs + sound ----------
     Samples the emulator canvas at 5fps downscaled to 32x32 grayscale
     (the same shape the DQN paper feeds its network), logs every input
     with its source (pad / key / auto / replay), and samples audio
     energy from the passive tap — all timestamped into one episode. */
  var recOn = false, recT0 = 0, recTimer = null;
  var recFrames = [], recInputs = [], recAudio = [];
  var recCanvas = null, recCtx = null;
  var REC_MAX_MS = 180000;
  var BTN_NAMES = { 0: 'B', 1: 'Y', 2: 'Select', 3: 'Start', 4: 'Up', 5: 'Down', 6: 'Left', 7: 'Right', 8: 'A', 9: 'X', 10: 'L', 11: 'R' };
  /* ---------- emulator canvas source ----------
     Read the real canvas object the player is drawing into, exactly like a
     website would. No emulator clone, no iframe walking, no second player. */
  function gameCanvas(){
    try{
      var e = window.EJS_emulator;
      if(e && e.canvas && e.canvas.width) return e.canvas;
    }catch(err){}
    try{
      var c = stage.querySelector('canvas');
      if(c && c.width && c.height) return c;
    }catch(err2){}
    return null;
  }
  function visionSource(){
    var c = gameCanvas();
    if(!c) return 'none';
    return (c === (window.EJS_emulator && window.EJS_emulator.canvas)) ? 'ejs canvas' : 'stage canvas';
  }
  function bytesB64(a){
    if(!a) return null;
    var s = '';
    for(var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
    return btoa(s);
  }
  function grayB64(g){ return bytesB64(g); }
  function rgbB64(rgb){ return bytesB64(rgb); }
  function captureVision(){
    try{
      var src = gameCanvas();
      if(!src || !src.width) return null;
      if(!recCanvas){
        recCanvas = document.createElement('canvas');
        recCanvas.width = 32; recCanvas.height = 32;
        recCtx = recCanvas.getContext('2d', { willReadFrequently: true });
      }
      recCtx.drawImage(src, 0, 0, 32, 32);
      var d = recCtx.getImageData(0, 0, 32, 32).data;
      var g = new Uint8Array(1024);
      var rgb = new Uint8Array(3072);
      for(var i = 0, j = 0; i < d.length; i += 4, j++){
        g[j] = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000 | 0;
        var o = j * 3;
        rgb[o] = d[i]; rgb[o + 1] = d[i + 1]; rgb[o + 2] = d[i + 2];
      }
      return { gray: g, rgb: rgb };
    }catch(e){ return null; }
  }
  function frameGray(){
    var f = captureVision();
    return f ? f.gray : null;
  }
  function frameRgb(){
    var f = captureVision();
    return f ? f.rgb : null;
  }
  function frameB64(){
    return grayB64(frameGray());
  }
  /* ---------- live color vision loop ------------
     Samples the real emulator canvas. The tap is idle by default, previews
     at 10Hz when the AI Lab is open, and only reads at 60Hz when an
     external agent asks for the field stream. Packets carry rgb24 for color
     plus gray8 for fast motion maths. Any frame can ask for one with
     {type:'snesboy:vision/request'}. */
  var VISION_FRAME = 'snesboy:vision/frame';
  var VISION_REQUEST = 'snesboy:vision/request';
  /* The live field tap is deliberately idle-rate by default. The local
     copilots sample on their own sense clock; the 60Hz stream is only for
     an external agent that explicitly asks for it (or an embedded host). */
  var VISION_IDLE_HZ = 10;
  var VISION_LIVE_HZ = 60;
  var visionHz = VISION_IDLE_HZ;
  var visionFieldMs = 1000 / visionHz;
  var visionDemandUntil = 0;
  var visionTimer = null, visionImg = null;
  var visionFrames = 0, visionFpsAt = 0, visionFps = 0, visionSeen = false;
  var visionField = 0, visionParity = 0, visionClock = 0, visionRaf = 0, visionStatusAt = 0;
  function visionPacket(g, rgb){
    if(!g || !rgb){
      var f = captureVision();
      if(!f) return null;
      g = f.gray; rgb = f.rgb;
    }
    var data = grayB64(g), color = rgbB64(rgb);
    if(!data || !color) return null;
    return { type: VISION_FRAME, version: 2, t: Date.now(),
      width: 32, height: 32, format: 'gray8+rgb24/base64',
      data: data, rgb: color, source: visionSource(),
      field: visionField, parity: visionParity & 1,
      frame: Math.ceil(visionField / 2), fieldsPerFrame: 2,
      lines: 262, fieldHz: visionHz, halfResolution: true };
  }
  function postVision(target, g, rgb){
    var p = visionPacket(g, rgb);
    if(!p || !target) return false;
    try{ target.postMessage(p, '*'); return true; }catch(e){ return false; }
  }
  function drawVisionPreview(g, rgb){
    var cv = document.getElementById('vision-preview');
    if(!cv || !g || !cv.offsetParent) return;
    try{
      var ctx = cv.getContext('2d');
      if(!visionImg) visionImg = ctx.createImageData(32, 32);
      var d = visionImg.data;
      for(var i = 0; i < g.length; i++){
        var o = i * 4, c = i * 3;
        if(rgb){
          d[o] = rgb[c]; d[o + 1] = rgb[c + 1]; d[o + 2] = rgb[c + 2];
        }else{
          d[o] = d[o + 1] = d[o + 2] = g[i];
        }
        d[o + 3] = 255;
      }
      ctx.putImageData(visionImg, 0, 0);
    }catch(e){}
  }
  function updateVisionStatus(ok, src){
    var s = document.getElementById('vision-status');
    if(s){
      s.textContent = ok ? ('VISION LIVE · ' + visionFps + ' Hz field · 262 lines · 32×32 color')
                         : 'NO SIGNAL — power on a game';
      s.classList.toggle('vision-ok', !!ok);
    }
    var m = document.getElementById('vision-source');
    if(m) m.textContent = 'source: ' + (src || 'none') + ' · loop: ' + (ok ? 'running' : 'waiting') +
      ' · field ' + visionField + ' ' + (visionParity & 1 ? 'odd' : 'even') + ' · 2 fields = 1×30fps frame';
  }
  var aiLoopText = '';
  function updateAiStatus(){
    var e = document.getElementById('ai-loop-status');
    if(!e) return;
    var parts = ['vision ' + (visionTimer ? (visionNeeded() ? '✓' : 'idle') : '—')];
    if(autoOn){
      parts.push('sense ' + (anyAgentTimer('sense') ? '✓' : '—'));
      parts.push('drive ' + (anyAgentTimer('drive') ? '✓' : '—'));
      parts.push('menus ' + (anyAgentTimer('menu') ? '✓' : '—'));
      parts.push('auto-tune ' + (AgentOpts.autoTune ? '✓' : 'off'));
      parts.push('manual ' + (MANUAL_STATE.current ? '✓' : (MANUAL_STATE.loading ? '…' : '—')));
      parts.push('world ' + (AgentOpts.world !== false && autoPilots.some(function(pt){ return pt.world; }) ? '✓' : 'off'));
      parts.push('record ' + (recOn ? '●' : 'off'));
    }else{
      parts.push('autopilot idle');
    }
    var txt = 'loops: ' + parts.join(' · ');
    if(txt !== aiLoopText){ aiLoopText = txt; e.textContent = txt; }
  }
  function visionTick(){
    var now = Date.now();
    var f = captureVision();
    updateAiStatus();
    if(!f){ updateVisionStatus(false, 'none'); return; }
    visionField++;
    visionParity = visionField & 1;
    if(!visionSeen){ visionSeen = true; visionFpsAt = now; visionFrames = 0; }
    visionFrames++;
    if(now - visionFpsAt >= 1000){
      visionFps = Math.round(visionFrames * 1000 / (now - visionFpsAt));
      visionFrames = 0; visionFpsAt = now;
    }
    drawVisionPreview(f.gray, f.rgb);
    if(window.parent && window.parent !== window) postVision(window.parent, f.gray, f.rgb);
    if(now - visionStatusAt >= 250){
      visionStatusAt = now;
      updateVisionStatus(true, visionSource());
    }
  }
  /* Frequency is demand-driven: idle preview stays cheap; an external
     consumer asks for the full 60Hz field stream. */
  function visionSetHz(hz){
    hz = Math.max(1, Math.min(VISION_LIVE_HZ, +hz || VISION_IDLE_HZ));
    if(hz === visionHz) return;
    visionHz = hz;
    visionFieldMs = 1000 / hz;
    visionClock = 0;
  }
  function visionRefreshHz(){
    if(visionHz !== VISION_IDLE_HZ && Date.now() >= visionDemandUntil){
      visionSetHz(VISION_IDLE_HZ);
    }
  }
  function visionRequest(ms){
    visionDemandUntil = Math.max(visionDemandUntil, Date.now() + (ms || 5000));
    visionSetHz(VISION_LIVE_HZ);
  }
  /* Only tap pixels when something is actually looking: the AI Lab preview
     is open, a host frame is embedded, or an agent requested a burst. The
     copilots grab their own frames on the sense beat, so a hidden preview
     must not cost the emulator 60 canvas readbacks per second. */
  function visionNeeded(){
    if(Date.now() < visionDemandUntil) return true;
    var cv = document.getElementById('vision-preview');
    if(cv && cv.offsetParent) return true;
    try{ if(window.parent && window.parent !== window) return true; }catch(e){}
    return false;
  }
  function updateVisionIdle(){
    var src = visionSource();
    var s = document.getElementById('vision-status');
    if(s){
      s.textContent = src === 'none' ? 'VISION STANDBY — power on a game'
                                     : 'VISION READY — open AI Lab or request 60Hz';
      s.classList.toggle('vision-ok', src !== 'none');
    }
    var m = document.getElementById('vision-source');
    if(m) m.textContent = 'source: ' + (src || 'none') + ' · loop: standby · preview closed';
  }
  function visionLoop(ts){
    if(!visionTimer) return;
    visionRefreshHz();
    if(!visionNeeded()){
      visionClock = ts;
      if(Date.now() - visionStatusAt >= 1000){ visionStatusAt = Date.now(); updateVisionIdle(); }
      visionRaf = requestAnimationFrame(visionLoop);
      return;
    }
    if(!visionClock) visionClock = ts;
    /* Fixed field clock, not the browser's paint rate. If rAF is late
       (busy game frame) emit the due fields now so the stream stays locked
       to cadence instead of drifting to the display fps. */
    var due = Math.floor((ts - visionClock) / visionFieldMs);
    if(due > 0){
      visionClock += due * visionFieldMs;
      if(due > 4){ visionClock = ts; due = 1; } /* long stall: resync */
      for(var i = 0; i < due; i++) visionTick();
    }
    visionRaf = requestAnimationFrame(visionLoop);
  }
  function startVisionLoop(){
    if(visionTimer) return;
    visionTimer = 1;
    visionClock = 0;
    visionSetHz(VISION_IDLE_HZ);
    visionRaf = requestAnimationFrame(visionLoop);
    visionTick();
  }
  window.addEventListener('message', function(e){
    var d = e.data;
    if(!d || d.type !== VISION_REQUEST) return;
    visionRequest(d.ttl || 5000);
    postVision(e.source);
  });
  /* Same-document consumers (AI Lab / an agent embedded alongside). */
  window.SNESBoyVision = {
    frame: frameGray,
    color: frameRgb,
    packet: visionPacket,
    request: visionRequest,
    hz: function(){ return visionHz; },
    snapshot: function(){
      var src = gameCanvas();
      if(!src) return null;
      try{
        var c = document.createElement('canvas');
        c.width = 256; c.height = 240;
        c.getContext('2d').drawImage(src, 0, 0, 256, 240);
        return c.toDataURL('image/png');
      }catch(e){ return null; }
    },
    source: visionSource
  };
  function grayDiff(a, b){
    var s = 0, n = 0;
    for(var i = 0; i < a.length; i += 4){
      var d = a[i] - b[i];
      s += d < 0 ? -d : d; n++;
    }
    return s / n;
  }
  function grayMean(g){
    var s = 0;
    for(var i = 0; i < g.length; i += 4) s += g[i];
    return s / Math.ceil(g.length / 4);
  }
  /* Which way is the world scrolling? Column-profile SAD between two
     frames over shifts of -8..+8px. Positive shift = pixels moved left =
     camera pushing right, so keep holding Right (and mirrored). Lets the
     agent follow side-scrollers in either direction instead of assuming. */
  function colShift(a, b){
    var pa = [], pb = [], x, y;
    for(x = 0; x < 32; x++){ pa.push(0); pb.push(0); }
    for(y = 0; y < 32; y++) for(x = 0; x < 32; x++){ pa[x] += a[y * 32 + x]; pb[x] += b[y * 32 + x]; }
    var best = 0, bestS = Infinity, s, t, q, d;
    for(s = -8; s <= 8; s++){
      t = 0;
      for(x = 0; x < 32; x++){ q = x + s; if(q < 0 || q > 31) continue; d = pa[q] - pb[x]; t += d < 0 ? -d : d; }
      if(t < bestS){ bestS = t; best = s; }
    }
    return best;
  }
  /* Vertical twin of colShift: row-profile SAD over shifts of -8..+8px.
     Positive shift = pixels moved up on screen = camera pushing down, so
     hold Down (and mirrored). Lets the agent climb/follow vertical scrollers
     instead of only ever pushing left/right. */
  function rowShift(a, b){
    var pa = [], pb = [], x, y;
    for(y = 0; y < 32; y++){ pa.push(0); pb.push(0); }
    for(y = 0; y < 32; y++) for(x = 0; x < 32; x++){ pa[y] += a[y * 32 + x]; pb[y] += b[y * 32 + x]; }
    var best = 0, bestS = Infinity, s, t, q, d;
    for(s = -8; s <= 8; s++){
      t = 0;
      for(y = 0; y < 32; y++){ q = y + s; if(q < 0 || q > 31) continue; d = pa[q] - pb[y]; t += d < 0 ? -d : d; }
      if(t < bestS){ bestS = t; best = s; }
    }
    return best;
  }
  function learnStatus(msg){ var e = document.getElementById('learn-status'); if(e) e.textContent = msg; }
  function updateRecBtn(){
    var b = document.getElementById('btn-record');
    if(b){
      b.textContent = recOn ? '⏹ RECORDING — TAP TO STOP' : '● RECORD SESSION';
      b.classList.toggle('rec-on', recOn);
    }
  }
  function startRecording(){
    if(recOn) return;
    recOn = true; recT0 = Date.now();
    recFrames = []; recInputs = []; recAudio = [];
    updateRecBtn();
    learnStatus('Recording… play! Frames + inputs + sound are being captured.');
    recTimer = setInterval(function(){
      if(!recOn) return;
      if(Date.now() - recT0 > REC_MAX_MS){ stopRecording(); learnStatus('Stopped: 3-minute episode cap reached.'); return; }
      if(!playing) return;
      var t = Date.now() - recT0;
      var px = frameB64();
      if(px) recFrames.push({ t: t, px: px });
      var a = sampleAudio(t);
      if(a) recAudio.push(a);
    }, 200);
  }
  function stopRecording(){
    if(!recOn) return;
    recOn = false;
    if(recTimer){ clearInterval(recTimer); recTimer = null; }
    updateRecBtn();
    var dur = Date.now() - recT0;
    if(!recFrames.length && !recInputs.length){
      learnStatus('Nothing captured (game was not running).');
      return;
    }
    var counts = {};
    recInputs.forEach(function(ev){
      if(ev.d === 1) counts[ev.b] = (counts[ev.b] || 0) + 1;
    });
    var m = MANUAL_STATE.current;
    var policy = autoPilots.map(function(pt){
      return { player: pt.pl + 1, role: pt.menuRole, manual: pt.manual ? pt.manual.id : null,
        tries: pt.learn.tries, score: pt.learn.score, total: pt.learn.total };
    });
    var ep = { game: currentName, date: new Date().toISOString(),
      manual: m ? { id: m.id, title: m.title, kind: m.kind, style: m.style, jump: m.jump, run: m.run,
        block: m.block, strikes: m.strikes, actions: m.actions } : null,
      policy: policy,
      world: (AgentOpts.world !== false) ? autoPilots.map(function(pt){
        return pt.world ? { player: pt.pl + 1, map: pt.world.export({ maxCells: 1500 }) } : null;
      }).filter(Boolean) : [],
      agents: autoPilots.map(function(pt){
        return pt.agent ? { player: pt.pl + 1, snapshot: pt.agent.snapshot(48) } : null;
      }).filter(Boolean),
      ms: dur, frames: recFrames, inputs: recInputs, audio: recAudio, counts: counts };
    epPut(ep).then(function(){
      learnStatus('Saved ' + recFrames.length + ' frames, ' + recInputs.length +
        ' input events, ' + recAudio.length + ' audio samples (' +
        Math.round(dur / 1000) + 's).');
      renderEpisodes();
    }, function(){
      learnStatus('Storage full or unavailable — episode kept for this session only.');
    });
  }
  function toggleRecording(){ if(recOn) stopRecording(); else startRecording(); }

  /* ---------- episode store / replay / export ---------- */
  var replayingId = null, replayTimers = [];
  function epStore(mode){
    return DB.transaction('episodes', mode).objectStore('episodes');
  }
  function epPut(ep){
    return new Promise(function(res, rej){
      try{
        var q = epStore('readwrite').add(ep);
        q.onsuccess = function(){ res(q.result); };
        q.onerror = function(){ rej(q.error); };
      }catch(e){ rej(e); }
    });
  }
  function epAll(){
    return new Promise(function(res){
      try{
        var q = epStore('readonly').getAll();
        q.onsuccess = function(){ res(q.result || []); };
        q.onerror = function(){ res([]); };
      }catch(e){ res([]); }
    });
  }
  function epDel(id){
    return new Promise(function(res){
      try{
        var tx = DB.transaction('episodes', 'readwrite');
        tx.objectStore('episodes').delete(id);
        tx.oncomplete = function(){ res(); };
        tx.onerror = function(){ res(); };
      }catch(e){ res(); }
    });
  }
  var replayHeld = {};
  function releaseReplayHeld(){
    if(!replayHeld) return;
    Object.keys(replayHeld).forEach(function(k){
      var parts = k.split(':');
      driveIndex(parseInt(parts[1], 10), false, 'replay', parseInt(parts[0], 10));
    });
    replayHeld = {};
  }
  function stopReplay(msg){
    replayTimers.forEach(clearTimeout);
    replayTimers = [];
    releaseReplayHeld();
    if(replayingId !== null){
      replayingId = null; renderEpisodes();
      if(msg) learnStatus(msg);
    }
  }
  function replayEpisode(id){
    if(replayingId === id){ stopReplay('Replay stopped — buttons released.'); return; }
    stopReplay();
    epAll().then(function(eps){
      var ep = null;
      eps.forEach(function(e){ if(e.id === id) ep = e; });
      if(!ep || !ep.inputs.length){ learnStatus('Episode has no inputs to replay.'); return; }
      if(!playing){ learnStatus('Boot the game first (POWER), then replay.'); return; }
      replayingId = id;
      renderEpisodes();
      learnStatus('Replaying ' + ep.inputs.length + ' inputs… tap REPLAY again to stop.');
      var t0 = Date.now();
      ep.inputs.forEach(function(ev){
        replayTimers.push(setTimeout(function(){
          var pl = ev.p || 0;
          var key = pl + ':' + ev.b;
          if(ev.d === 1) replayHeld[key] = true; else delete replayHeld[key];
          driveIndex(ev.b, ev.d === 1, 'replay', pl);
        }, Math.max(0, ev.t - (Date.now() - t0))));
      });
      var last = ep.inputs[ep.inputs.length - 1].t;
      replayTimers.push(setTimeout(function(){ stopReplay('Replay finished.'); }, last + 800));
    });
  }
  function exportEpisode(id){
    epAll().then(function(eps){
      var ep = null;
      eps.forEach(function(e){ if(e.id === id) ep = e; });
      if(!ep) return;
      var blob = new Blob([JSON.stringify({ app: 'snesboy-ai', v: 1, episode: ep })], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'snesboy-episode-' + id + '.json';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });
  }
  function renderEpisodes(){
    var list = document.getElementById('episode-list');
    var sum = document.getElementById('dataset-summary');
    if(!list) return;
    list.innerHTML = '';
    if(!DB){ if(sum) sum.textContent = 'Library unavailable (no IndexedDB).'; return; }
    epAll().then(function(eps){
      var tf = 0, ti = 0, ta = 0, tms = 0, agg = {};
      eps.slice().reverse().forEach(function(ep){
        tf += (ep.frames || []).length; ti += (ep.inputs || []).length;
        ta += (ep.audio || []).length; tms += ep.ms || 0;
        Object.keys(ep.counts || {}).forEach(function(k){ agg[k] = (agg[k] || 0) + ep.counts[k]; });
        var item = document.createElement('div'); item.className = 'rom-list-item';
        var nm = document.createElement('div'); nm.className = 'rom-name';
        nm.textContent = (ep.frames || []).length + 'f/' + (ep.inputs || []).length + 'i/' +
          (ep.audio || []).length + 'a ' + Math.round((ep.ms || 0) / 1000) + 's ' +
          (ep.date || '').slice(5, 16).replace('T', ' ');
        var act = document.createElement('div'); act.className = 'rom-actions';
        var rep = document.createElement('button');
        rep.className = 'rom-btn-play';
        rep.textContent = (replayingId === ep.id) ? 'STOP' : 'REPLAY';
        rep.addEventListener('click', function(){ replayEpisode(ep.id); });
        var exp = document.createElement('button');
        exp.className = 'rom-btn-export'; exp.textContent = 'JSON';
        exp.addEventListener('click', function(){ exportEpisode(ep.id); });
        var del = document.createElement('button');
        del.className = 'rom-btn-del'; del.textContent = 'DEL';
        del.addEventListener('click', function(){
          if(replayingId === ep.id) stopReplay();
          epDel(ep.id).then(renderEpisodes);
        });
        act.appendChild(rep); act.appendChild(exp); act.appendChild(del);
        item.appendChild(nm); item.appendChild(act); list.appendChild(item);
      });
      if(sum){
        if(!eps.length){ sum.textContent = 'No episodes yet — record a session and the AI dataset starts here.'; return; }
        var top = Object.keys(agg).sort(function(a, b){ return agg[b] - agg[a]; }).slice(0, 3)
          .map(function(k){ return (BTN_NAMES[k] || k) + '×' + agg[k]; }).join(' ');
        sum.textContent = eps.length + ' episodes • ' + tf + ' frames • ' + ti +
          ' inputs • ' + ta + ' audio samples • ' + Math.round(tms / 1000) +
          's played' + (top ? ' • top buttons: ' + top : '');
      }
    });
  }

  /* ---------- IndexedDB: ROM library + learning episodes ---------- */
  var DB = null;
  var MEM = BUILTIN_ROMS.map(function(r){ return { name: r.name, label: r.label, url: r.url, builtin: true }; });
  function openDB(){
    return new Promise(function(res, rej){
      try{
        var r = indexedDB.open('snesboy-roms', 2);
        r.onupgradeneeded = function(){
          var db = r.result;
          if(!db.objectStoreNames.contains('roms')) db.createObjectStore('roms', { keyPath: 'name' });
          if(!db.objectStoreNames.contains('episodes')) db.createObjectStore('episodes', { keyPath: 'id', autoIncrement: true });
        };
        r.onsuccess = function(){ res(r.result); };
        r.onerror = function(){ rej(r.error); };
      }catch(e){ rej(e); }
    });
  }
  function idbAll(){
    return new Promise(function(res, rej){
      try{
        var tx = DB.transaction('roms', 'readonly');
        var q = tx.objectStore('roms').getAll();
        q.onsuccess = function(){ res(q.result || []); };
        q.onerror = function(){ rej(q.error); };
      }catch(e){ rej(e); }
    });
  }
  function idbPut(entry){
    return new Promise(function(res, rej){
      try{
        var tx = DB.transaction('roms', 'readwrite');
        tx.objectStore('roms').put(entry);
        tx.oncomplete = function(){ res(); };
        tx.onerror = function(){ rej(tx.error); };
      }catch(e){ rej(e); }
    });
  }
  function idbDel(name){
    return new Promise(function(res, rej){
      try{
        var tx = DB.transaction('roms', 'readwrite');
        tx.objectStore('roms').delete(name);
        tx.oncomplete = function(){ res(); };
        tx.onerror = function(){ rej(tx.error); };
      }catch(e){ rej(e); }
    });
  }
  function entryUrl(entry){
    if(entry.blob) return URL.createObjectURL(entry.blob);
    return entry.url;
  }
  function currentEntries(){
    if(DB) return idbAll();
    return Promise.resolve(MEM.slice());
  }
  function renderLibrary(){
    var list = document.getElementById('library-rom-list');
    list.innerHTML = '';
    currentEntries().then(function(entries){
      entries = sortLibrary(entries);
      if(!entries.length){
        var p = document.createElement('p');
        p.className = 'modal-desc'; p.textContent = 'No ROMs yet — add one below.';
        list.appendChild(p); return;
      }
      entries.forEach(function(en){
        var item = document.createElement('div'); item.className = 'rom-list-item';
        var nm = document.createElement('div'); nm.className = 'rom-name';
        nm.textContent = (en.name === currentName ? '▶ ' : '') + romLabel(en);
        var act = document.createElement('div'); act.className = 'rom-actions';
        var play = document.createElement('button'); play.className = 'rom-btn-play'; play.textContent = 'PLAY';
        play.addEventListener('click', function(){
          closeModals();
          playing = false; showStandby(true); setLeds(false);
          setStatus('LOADING…', romLabel(en).toUpperCase().slice(0, 40));
          boot(entryUrl(en), en.name); powerOn();
        });
        act.appendChild(play);
        if(!en.builtin){
          var del = document.createElement('button'); del.className = 'rom-btn-del'; del.textContent = 'DEL';
          del.addEventListener('click', function(){
            var done = function(){ renderLibrary(); };
            if(DB) idbDel(en.name).then(done, done);
            else{ MEM = MEM.filter(function(m){ return m.name !== en.name; }); done(); }
          });
          act.appendChild(del);
        }
        item.appendChild(nm); item.appendChild(act); list.appendChild(item);
      });
    });
  }
  function addFiles(files){
    var jobs = [];
    Array.prototype.forEach.call(files, function(f){
      var entry = { name: f.name, blob: f, builtin: false };
      if(DB) jobs.push(idbPut(entry));
      else MEM.push(entry);
    });
    Promise.all(jobs).then(renderLibrary, renderLibrary);
    renderLibrary();
    openModal('library-modal');
  }
  ['rom-file-input', 'desktop-rom-file-input', 'modal-rom-file-input'].forEach(function(id){
    var inp = document.getElementById(id);
    if(inp) inp.addEventListener('change', function(){ addFiles(inp.files); inp.value = ''; });
  });

  /* ---------- modals ---------- */
  function openModal(id){ document.getElementById(id).classList.remove('hidden'); }
  function closeModals(){ $all('.modal-overlay').forEach(function(m){ m.classList.add('hidden'); }); }
  $all('.modal-overlay').forEach(function(m){
    m.addEventListener('click', function(e){ if(e.target === m) closeModals(); });
  });
  document.addEventListener('click', function(e){
    var c = e.target.closest ? e.target.closest('[data-close]') : null;
    if(c){ document.getElementById(c.getAttribute('data-close')).classList.add('hidden'); }
  });

  /* ---------- theme / sound / crt ---------- */
  function toggleTheme(){
    var b = document.body;
    var fam = b.classList.toggle('theme-famicom');
    b.classList.toggle('theme-snes', !fam);
    try{ localStorage.setItem('snesboy-theme', fam ? 'famicom' : 'snes'); }catch(e){}
  }
  try{
    if(localStorage.getItem('snesboy-theme') === 'famicom'){
      document.body.classList.add('theme-famicom');
      document.body.classList.remove('theme-snes');
    }
  }catch(e){}
  function updateSoundIcons(){
    var ic = muted ? '🔇' : '🔊';
    ['btn-sound', 'dt-btn-sound'].forEach(function(id){
      var e = document.getElementById(id); if(e) e.textContent = ic;
    });
  }
  function toggleSound(){
    var b = ejsButton(function(t){ return t === 'mute' || t === 'unmute' || t.indexOf('mute') !== -1; });
    if(b && playing){
      try{ b.click(); muted = !muted; }catch(e){}
      setTimeout(function(){
        try{
          if(window.EJS_emulator && typeof window.EJS_emulator.muted === 'boolean'){
            muted = window.EJS_emulator.muted;
          }
        }catch(e2){}
        updateSoundIcons();
      }, 300);
    }
    updateSoundIcons();
  }
  function toggleCrt(){
    crtOn = !crtOn;
    crt.style.display = crtOn ? 'block' : 'none';
  }

  /* Losing the tab releases human-held buttons (never stuck), but the
     autopilot stays exactly as it was — only its own toggle stops it. */
  window.addEventListener('blur', function(){
    for(var pl = 0; pl <= 3; pl++)
      for(var i = 0; i <= 11; i++) driveIndex(i, false, 'sys', pl);
    $all('.pressed').forEach(function(el){ el.classList.remove('pressed'); });
  });

  /* ---------- USB gamepads ----------
     The emulator only listens to a pad assigned to a player slot
     (gamepadSelection). Browsers forget assignments, pads reconnect
     under new ids, stale slots block auto-assign — so take charge:
     any connected pad is (re)assigned to P1 automatically, with a
     status line + manual button in the info modal. */
  function assignUsbPad(){
    try{
      if(!window.EJS_emulator || !navigator.getGamepads) return 'no-emu';
      var pads = Array.prototype.slice.call(navigator.getGamepads());
      var pad = null;
      for(var i = 0; i < pads.length; i++){
        if(pads[i] && pads[i].connected){ pad = pads[i]; break; }
      }
      if(!pad) return 'none';
      window.EJS_emulator.gamepadSelection[0] = pad.id + '_' + pad.index;
      return pad.id;
    }catch(e){ return 'err'; }
  }
  function updatePadStatus(){
    var e = document.getElementById('gamepad-status');
    if(!e) return;
    var names = [];
    try{
      Array.prototype.forEach.call(navigator.getGamepads() || [], function(g){
        if(g && g.connected) names.push(g.id);
      });
    }catch(x){}
    var sel = '';
    try{ sel = (window.EJS_emulator && window.EJS_emulator.gamepadSelection[0]) || ''; }catch(x){}
    if(!names.length){
      e.textContent = 'USB pad: none detected — connect one, then press any button on it.';
    }else if(sel){
      e.textContent = 'USB pad: ' + names[0].slice(0, 44) + ' → player 1 ✓ (if it still ignores you, press REASSIGN)';
    }else{
      e.textContent = 'USB pad: ' + names[0].slice(0, 44) + ' detected but unassigned — press REASSIGN.';
    }
  }
  window.addEventListener('gamepadconnected', function(){ assignUsbPad(); updatePadStatus(); });
  window.addEventListener('gamepaddisconnected', function(){ updatePadStatus(); });

  /* ---------- wire all buttons ---------- */
  function on(id, fn){ var e = document.getElementById(id); if(e) e.addEventListener('click', fn); }
  on('btn-power', togglePower);
  on('desktop-power-btn', togglePower);
  on('desktop-reset-btn', resetGame);
  on('btn-reset', resetGame);
  on('btn-eject', function(){ if(playing) powerOff(); });
  on('dt-btn-eject', function(){ if(playing) powerOff(); });
  on('btn-theme', toggleTheme);
  on('dt-btn-theme', toggleTheme);
  on('btn-library', function(){ renderLibrary(); openModal('library-modal'); });
  on('dt-btn-library', function(){ renderLibrary(); openModal('library-modal'); });
  on('btn-info', function(){ updatePadStatus(); openModal('info-modal'); });
  on('dt-btn-info', function(){ updatePadStatus(); openModal('info-modal'); });
  on('btn-pad', function(){ assignUsbPad(); updatePadStatus(); });
  on('btn-ai', function(){ renderEpisodes(); renderTuneInputs(); updateAgentHud(); openModal('ai-modal'); updateWorldPanel(); });
  on('dt-btn-ai', function(){ renderEpisodes(); renderTuneInputs(); updateAgentHud(); openModal('ai-modal'); updateWorldPanel(); });
  on('btn-autopilot', toggleAutopilot);
  on('btn-autotune', toggleAutotune);
  on('btn-hud', toggleHud);
  on('btn-tune-reset', resetAgentOpts);
  on('btn-anton-analyze', runAntonScan);
  on('btn-record', toggleRecording);
  document.addEventListener('change', function(e){
    var t = e.target;
    if(!t || !t.id || t.id.indexOf('opt-') !== 0) return;
    var key = t.id.slice(4);
    if(key === 'world'){
      AgentOpts.world = !!t.checked;
      saveAgentOpts(); renderTuneInputs();
      updateAgentHud(); updateWorldPanel();
      if(autoOn) antonSay(AgentOpts.world ? 'world memory on — mapping + frontier exploration live' : 'world memory off — reactive copilot only');
      return;
    }
    if(key === 'seekCycle'){
      AgentOpts.seekCycle = String(t.value || AgentDefaults.seekCycle).slice(0, 31);
      saveAgentOpts(); renderTuneInputs();
      parseSeekCycle(); /* next menu tick uses the new order — no restart */
      if(autoOn) antonSay('seek taps ' + AgentOpts.seekCycle + ' — live');
      return;
    }
    if(key === 'players'){
      var vals = String(t.value || '0').split(',');
      var out = [];
      vals.forEach(function(v){
        var n = parseInt(v, 10);
        if(!isNaN(n) && n >= 0 && n <= 3 && out.indexOf(n) === -1) out.push(n);
      });
      AgentOpts.players = out.length ? out : [0];
      saveAgentOpts(); renderTuneInputs();
      if(autoOn) startAgentEngine(); /* rebuild pilots for the new roster */
      return;
    }
    if(key === 'profile'){
      AgentOpts.profile = (t.value === 'umk3') ? 'umk3' : (t.value === 'mix' ? 'mix' : 'generic');
      saveAgentOpts(); renderTuneInputs(); updateAgentHud();
      if(autoOn){
        /* release the old profile's holds before the next tick uses the new
           one — no stuck L/R block or run from a mode switch */
        autoPilots.forEach(function(pt){
          fightRelease(pt.pl);
          driveIndex(AgentMap.run, false, 'auto', pt.pl);
        });
        antonSay(AgentOpts.profile === 'mix' ? 'mix mode — platformer + UMK3 beats, live' : 'profile ' + AgentOpts.profile + ' — live');
      }
      return; /* drive loop reads the profile every tick — no restart needed */
    }
    var spec = null;
    TuneFields.forEach(function(f){ if(f[0] === key) spec = f; });
    if(!spec) return;
    var v = parseFloat(t.value);
    if(isNaN(v)) v = AgentDefaults[key];
    AgentOpts[key] = Math.min(spec[2], Math.max(spec[1], v));
    saveAgentOpts(); renderTuneInputs();
    /* thresholds/hopEvery are read every tick. Only the two period values
       need their timer retimed — and retiming keeps every hold and pilot
       alive, so the game and the AI never pause. */
    if(autoOn){
      if(key === 'senseMs') retimeAgentLoop('sense');
      else if(key === 'tapMs') retimeAgentLoop('menu');
      antonSay('live tune — ' + key + ' ' + AgentOpts[key] + ' (no restart)');
    }
  });
  on('btn-sound', toggleSound);
  on('dt-btn-sound', toggleSound);
  on('btn-crt', toggleCrt);
  on('dt-btn-crt', toggleCrt);

  /* ---------- go ---------- */
  placeStage();
  startVisionLoop();
  updateAgentHud();
  openDB().then(function(db){
    DB = db;
    return idbAll();
  }).then(function(entries){
    if(!DB) return entries;
    var have = {};
    entries.forEach(function(en){ have[en.name] = true; });
    var jobs = BUILTIN_ROMS.filter(function(r){ return !have[r.name]; }).map(function(r){
      return fetch(r.url).then(function(res){
        if(!res.ok) throw new Error('rom fetch failed: ' + r.name);
        return res.blob();
      }).then(function(blob){
        return idbPut({ name: r.name, label: r.label, blob: blob, builtin: true });
      }).catch(function(e){
        console.warn('Could not seed ROM', r.name, e);
      });
    });
    return Promise.all(jobs).then(function(){ return idbAll(); });
  }).catch(function(){
    DB = null; /* IndexedDB unavailable: memory-only library */
  }).then(function(){
    renderLibrary();
    boot(BUNDLED.url, BUNDLED.name);
    fetch(BUNDLED.url, { headers: { Range: 'bytes=0-0' } }).then(function(r){
      if(!(r.ok || r.status === 206)) setStatus('ROM NOT FOUND', 'ADD A FILE VIA MY GAMES');
    }).catch(function(){ setStatus('ROM NOT FOUND', 'ADD A FILE VIA MY GAMES'); });
  });
})();
