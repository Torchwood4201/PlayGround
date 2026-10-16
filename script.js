/* ==========================================================================
   SNESBOY standalone frontend logic (`script.js`)
   Drives an EmulatorJS SNES core underneath the SNESBOY CSS-art shell.
   NOTE: the template 8-bit-only core script tag is intentionally NOT used:
   that core cannot run SNES ROMs.
   ========================================================================== */
(function(){
  'use strict';

  var BUNDLED = { name: 'Super Mario All-Stars (USA).sfc', url: 'super-mario-all-stars-usa.sfc', builtin: true };

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
  var currentUrl = BUNDLED.url;
  var currentName = BUNDLED.name;
  var muted = false;
  var crtOn = false;
  var autoOn = false;
  var autoTimer = null;

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
    releaseAll();
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
    currentUrl = url; currentName = name || currentName;
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
    powering = true;
    showStandby(false);
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
    releaseAll(); /* drop all holds; the autopilot itself stays on and resumes on power-up */
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
     state, so double delivery is harmless.
     Human + AI share this path, so holds are multiplexed: human-held
     ('pad'/'key') and AI-held ('auto'/'replay') states are tracked
     separately per player+button and OR'd into the core. Either side
     pressing counts, and one side releasing never erases the other's
     still-held button — so the human keeps control while the AI plays. */
  var heldHuman = {}, heldAuto = {};
  function applyCombined(pl, idx){
    var v = (heldHuman[pl + ':' + idx] || heldAuto[pl + ':' + idx]) ? 1 : 0;
    try{
      var gm = window.EJS_emulator && window.EJS_emulator.gameManager;
      if(gm && typeof gm.simulateInput === 'function'){
        gm.simulateInput(pl, idx, v);
      }
    }catch(e){}
  }
  function driveIndex(idx, down, src, pl){
    pl = (pl === undefined || pl === null) ? 0 : pl;
    var key = pl + ':' + idx;
    if(src === 'sys'){
      delete heldHuman[key]; delete heldAuto[key];
      applyCombined(pl, idx);
    }else if(src === 'pad' || src === 'key'){
      if(down) heldHuman[key] = true; else delete heldHuman[key];
      applyCombined(pl, idx);
    }else{ /* 'auto', 'replay', or anything else: AI side */
      if(down) heldAuto[key] = true; else delete heldAuto[key];
      /* politeness: never overwrite a button the human is holding right now */
      if(!heldHuman[key]) applyCombined(pl, idx);
    }
    if(recOn) recInputs.push({ t: Date.now() - recT0, b: idx, d: down ? 1 : 0, s: src || '?', p: pl });
  }
  /* Which players the autopilot drives: each system's own on/off switch.
     Human pads/keys always stay P1. No shared roster. */
  /* Roster = whichever systems are switched on right now. The two P1/P2
     buttons are the only on/off — no shared roster setting. */
  function autoPlayers(){
    var out = [];
    for(var i = 0; i < autoPilots.length; i++){
      if(autoPilots[i].on) out.push(autoPilots[i].pl);
    }
    out.sort();
    return out;
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

  /* Drop only AI-held buttons (mode switches, autopilot stop): human holds
     survive, so the human never has to re-press after the AI lets go. */
  /* Scoped release: only the given player's AI holds are dropped, human
     holds survive, and the other system's holds are untouched. */
  function releaseAuto(pl){
    var prefix = (pl === undefined || pl === null) ? null : (pl + ':');
    var keys = Object.keys(heldAuto).filter(function(k){
      return prefix === null || k.indexOf(prefix) === 0;
    });
    if(!keys.length) return;
    keys.forEach(function(k){ delete heldAuto[k]; });
    /* re-apply every touched button: human-held stays pressed, rest release */
    keys.forEach(function(k){
      var parts = k.split(':');
      applyCombined(+parts[0], +parts[1]);
    });
  }
  /* Full reset: clear BOTH sides (boot, power-off, tab blur). */
  function releaseAll(){
    heldHuman = {}; heldAuto = {};
    try{
      var gm = window.EJS_emulator && window.EJS_emulator.gameManager;
      if(gm && typeof gm.simulateInput === 'function'){
        for(var pl = 0; pl <= 3; pl++)
          for(var i = 0; i <= 11; i++) gm.simulateInput(pl, i, 0);
      }
    }catch(e){}
  }

  /* ---------- screen-reactive autopilot (AI Lab): two separated systems ----------
     One cloned brain per driven player — same screen, own rhythm. The first
     enabled player works the menus; every pilot senses, modes and plays for
     itself (phase-offset hops, own button order), so P2 never just parrots
     P1's exact presses.
     SEEK (still frames — any menu, pause, title, black transition screen):
       tap rotation from settings, never holds directions so it can't fight
       cursors on any system.
     PLAY (the picture moves — scrolling, pans, action): holds the forward
       button hard, holds run/dash only while the pixels demand it, and each
       pilot works the action buttons + shoulders on its own beat.
     Silence heals: freeze, game-over, quiet black screen → every pilot back
     to SEEK, taps its own way out of whatever menu maze comes next. */
  /* ---------- agent options + button map (persisted, tunable in AI Lab) --- */
  var AgentDefaults = {
    senseMs: 2000, tapMs: 4000, tapPulseMs: 600, seekCycle: '2,2,3,8,5,4',
    driveMs: 300, hopEvery: 3, hopPulseMs: 260,
    hiThresh: 8, hiStreak: 3, loThresh: 4, loStreak: 3, blackMean: 10,
    players: [1], hud: false, autoTune: true, profile: 'generic', ocr: false,
    startGapMs: 90000
  };
  var AgentOpts = {};
  try{
    var rawOwn = {};
    try{ rawOwn = JSON.parse(localStorage.getItem('snesboy-agent') || '{}'); }catch(e){}
    AgentOpts = Object.assign({}, AgentDefaults, rawOwn);
    /* human owns P1: fresh installs get AI on P2. Stored [0,1] from the old
       Both default migrates to P2 unless explicitly chosen (playersSet). */
    if(!rawOwn || !('players' in rawOwn)) AgentOpts.players = [1];
    else if(!rawOwn.playersSet && String((rawOwn.players || []).join(',')) === '0,1') AgentOpts.players = [1];
    if(!rawOwn || !('autoTune' in rawOwn)) AgentOpts.autoTune = true;
    if(!rawOwn || !('profile' in rawOwn) || ['generic', 'umk3', 'racer', 'shooter', 'rpg'].indexOf(rawOwn.profile) === -1) AgentOpts.profile = 'generic';
    if(!rawOwn || !('ocr' in rawOwn)) AgentOpts.ocr = false;
    if(!rawOwn || !('startGapMs' in rawOwn)) AgentOpts.startGapMs = 90000;
  }catch(e){ AgentOpts = Object.assign({}, AgentDefaults, { players: [1], autoTune: true, profile: 'generic', ocr: false }); }
  function saveAgentOpts(){
    try{ localStorage.setItem('snesboy-agent', JSON.stringify(AgentOpts)); }catch(e){}
  }
  /* SYSTEM 1 / SYSTEM 2 SEPARATED SETTINGS: each AI system owns its own
     thresholds, tempo, seek cycle and profile. Shared globals stay shared
     on purpose: players roster, HUD visibility, OCR, START gap (one game,
     one pause button) and the button map. Everything that steers gameplay
     lives per-system below. */
  /* NO SETTING SHARING: System 1 and System 2 each own every tuning value
     that steers gameplay — thresholds, tempo, taps, profile, auto-tune,
     START gap and their own on/off switch. Shared globals left: screen,
     emulator core, DOM, button-index constants, HUD/OCR display toggles. */
  var SysDefaults = {
    senseMs: 2000, tapMs: 4000, hiThresh: 8, loThresh: 4, hopEvery: 3,
    seekCycle: '2,2,3,8,5,4', profile: 'generic', autoTune: true,
    startGapMs: 90000
  };
  var SysOpts = { sys1: Object.assign({}, SysDefaults), sys2: Object.assign({}, SysDefaults) };
  try{
    var rawSys = {};
    try{ rawSys = JSON.parse(localStorage.getItem('snesboy-agent-sys') || '{}'); }catch(e){}
    if(rawSys.sys1) SysOpts.sys1 = Object.assign({}, SysDefaults, rawSys.sys1);
    if(rawSys.sys2) SysOpts.sys2 = Object.assign({}, SysDefaults, rawSys.sys2);
    /* migrate single-panel saves: old global tuning seeds both systems once */
    if(!rawSys.sys1 && !rawSys.sys2){
      try{
        var old = JSON.parse(localStorage.getItem('snesboy-agent') || '{}');
        ['senseMs','tapMs','hiThresh','loThresh','hopEvery','seekCycle','profile','autoTune','startGapMs'].forEach(function(k){
          if(old && old[k] !== undefined){ SysOpts.sys1[k] = old[k]; SysOpts.sys2[k] = old[k]; }
        });
      }catch(e2){}
    }
    delete SysOpts.sys1.enabled; delete SysOpts.sys2.enabled;
  }catch(e){}
  function saveSysOpts(){
    try{ localStorage.setItem('snesboy-agent-sys', JSON.stringify(SysOpts)); }catch(e){}
  }
  function sysFor(pl){ return (pl === 0) ? SysOpts.sys1 : SysOpts.sys2; }
  /* Emulator button indices the brain uses (RetroArch SNES numbering).
     Human pads keep using PADINDEX; only the agent reads this. */
  var AgentMap = { dirR: 7, dirL: 6, run: 1, actions: [8, 0], shoulders: [10, 11], select: 2, start: 3 };
  /* Genre presets distilled from the manual archive (ai/manual-knowledge.js).
     Only the UMK3 fighter entry changes the driver; the rest tune the
     platformer driver (menu cycle, action tempo, tap pacing). */
  var BUILTIN_PROFILES = {
    generic: { seekCycle: '2,2,3,8,5,4', hopEvery: 3, tapMs: 4000 },
    umk3: { seekCycle: '2,2,3,8,5,4', hopEvery: 3, tapMs: 4000 },
    racer: { seekCycle: '3,8,8,2,5,4', hopEvery: 5, tapMs: 4000 },
    shooter: { seekCycle: '2,2,3,8,5,4', hopEvery: 2, tapMs: 4000 },
    rpg: { seekCycle: '8,8,3,2,5,4', hopEvery: 4, tapMs: 6000 }
  };
  var PROFILE_IDS = ['generic', 'umk3', 'racer', 'shooter', 'rpg'];
  function profileTable(){
    try{
      var ext = window.MANUAL_KNOWLEDGE && window.MANUAL_KNOWLEDGE.PROFILES;
      if(!ext) return BUILTIN_PROFILES;
      var merged = {};
      PROFILE_IDS.forEach(function(id){
        merged[id] = {
          seekCycle: (ext[id] && ext[id].seekCycle) || BUILTIN_PROFILES[id].seekCycle,
          hopEvery: (ext[id] && ext[id].hopEvery) || BUILTIN_PROFILES[id].hopEvery,
          tapMs: (ext[id] && ext[id].tapMs) || BUILTIN_PROFILES[id].tapMs
        };
      });
      return merged;
    }catch(e){ return BUILTIN_PROFILES; }
  }
  /* SEEK tap rotation, parsed per system ('2,2,3,8,5,4' =
     SELECT, SELECT, START, A, DOWN, UP). Confirms plus dpad taps: many
     menus need a cursor move before the confirm. Taps only, never holds. */
  /* Two separated AI systems: one independent pilot object per driven
     player. Each system owns its steering vote, mode streaks, governor
     memory, stuck counters and activity — the first enabled player works
     the menus; both sense, mode and play for themselves with their own
     rhythm (phase-offset hops, own button order), so P2 never just
     parrots P1 and one system's thrash never retunes the other. */
  var autoMenuTimer = null, autoSenseTimer = null;
  var autoPilots = [];
  /* Once gameplay has been seen, START taps are throttled: on virtually
     every SNES title START pauses a running game, so a SEEK dip mid-game
     (standing still, quiet screen) fires it far less often — 1 in 8
     landings instead of every landing. Menus keep working via
     SELECT/A/dpad taps. Reset on every engine start. */
  var autoHasPlayed = false;
  var autoStartN = 0;
  /* Recency window: a single animated-title blip must not throttle menus
     forever. START is throttled only while gameplay was seen recently. */
  var lastPlaySeen = 0;
  var START_QUIET_MS = 60000;
  /* Shared START gate: every AI START tap (menu cycle or OCR unpause) goes
     through here. Minimum gap between STARTs, plus a pause-guard window
     after each one where only SELECT/dpad may fire — never A or START —
     so the bot can't walk a pause menu into Quit/Title. */
  var lastStartTap = 0;
  var pauseGuardUntil = 0;
  var PAUSE_GUARD_MS = 20000;
  function startAllowed(pt){
    var gap = (pt && pt.sys && pt.sys.startGapMs) || 90000;
    var last = pt ? pt.lastStartTap : lastStartTap;
    return (Date.now() - last) >= gap;
  }
  function noteStartTap(pt, pauseRisky){
    /* per-system START gate: each system's taps gate only itself */
    if(pt){
      pt.lastStartTap = Date.now();
      /* A-suppression only when the START may have paused a running game.
         Title-screen STARTs leave A confirms flowing so menus keep advancing. */
      if(pauseRisky) pt.pauseGuardUntil = Date.now() + PAUSE_GUARD_MS;
      return;
    }
    lastStartTap = Date.now();
    if(pauseRisky) pauseGuardUntil = Date.now() + PAUSE_GUARD_MS;
  }
  /* Two separated AI systems: each pilot owns its steering vote, mode
     streaks, governor memory, stuck counters and activity. No shared
     autoDir/diff — P1 and P2 sense and act independently off the same
     screen. */
  /* Exactly one pilot works the menus: P1's when present (menus listen to
     player 1 on virtually every SNES title), otherwise the sole pilot taps
     P1's pad — so a lone P2 system can still get past title screens. */
  function assignMenus(){
    var hasP1 = autoPilots.some(function(q){ return q.pl === 0; });
    autoPilots.forEach(function(q){
      q.menus = hasP1 ? (q.pl === 0) : (q === autoPilots.slice().sort(function(a, b){ return a.pl - b.pl; })[0]);
    });
  }
  function makePilot(player, idx, menus){
    return { pl: player, menus: menus, on: true, mode: 'seek', prev: null, hi: 0, lo: 0,
      menuN: 0, hopN: idx * 2, tick: 0, shN: 0, fphase: -1,
      dir: 7, dirY: null, diff: 0, activity: 0, lastD: 0,
      lastMenu: 0, lastSense: 0,
      hasPlayed: false, startN: 0, lastPlaySeen: 0,
      lastStartTap: 0, pauseGuardUntil: 0,
      antonHist: [], antonLastModes: '', antonCool: 0,
      antonSeekStuck: 0, antonPlayStall: 0,
      stuckTicks: 0, stuckLevel: 0,
      sys: sysFor(player),
      cycle: parseSeekCycleTo(sysFor(player).seekCycle),
      order: (idx % 2 === 0) ? AgentMap.actions.slice() : AgentMap.actions.slice().reverse() };
  }
  function parseSeekCycleTo(str){
    try{
      var out = [];
      String(str).split(',').forEach(function(p){
        var v = parseInt(p.trim(), 10);
        if(!isNaN(v) && v >= 0 && v <= 11 && out.length < 8) out.push(v);
      });
      if(out.length) return out;
    }catch(e){}
    return [2, 2, 3, 8];
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
  /* Full combat move list lives in ai/umk3-moves.js (85 entries, 25
     fighters, transcribed from the complete move list). Fallback keeps the
     original 15 manual strings if that file ever fails to load. */
  var UMK3_MOVEBOOK = (window.UMK3_MOVES && window.UMK3_MOVES.length) ? window.UMK3_MOVES : [
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
    function one(t){
      if(t === 'F') return fwd;
      if(t === 'B') return back;
      if(t === 'D') return 5;
      if(t === 'U') return 4;
      return t;
    }
    return seq.map(function(t){ return Array.isArray(t) ? t.map(one) : one(t); });
  }
  function fightRelease(pl){
    [4, 5, 6, 7, 10, 11].forEach(function(i){ driveIndex(i, false, 'auto', pl); });
  }
  function fightPulse(btn, pl, ms){
    driveIndex(btn, true, 'auto', pl);
    setTimeout(function(){ if(pilotStillOn(pl)) driveIndex(btn, false, 'auto', pl); }, ms || 140);
  }
  function fightChord(btns, pl){
    btns.forEach(function(b){ driveIndex(b, true, 'auto', pl); });
    setTimeout(function(){
      if(!pilotStillOn(pl)) return;
      btns.forEach(function(b){ driveIndex(b, false, 'auto', pl); });
    }, 120);
  }
  function fightTapSeq(steps, pl){
    var t = 0;
    steps.forEach(function(btn){
      /* nested arrays are simultaneous chords (e.g. slide 3+5+7+9) */
      setTimeout(function(){
        if(!pilotStillOn(pl)) return;
        if(Array.isArray(btn)) fightChord(btn, pl);
        else fightPulse(btn, pl, 120);
      }, t);
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
      driveIndex(11, true, 'auto', pt.pl); /* RUN + toward closes distance */
    }else if(phase === 1){
      var s = UMK3_STRIKES[(pt.tick + idx) % UMK3_STRIKES.length];
      fightPulse(s, pt.pl, 140);
      if(pt.tick % 2 === 0) fightPulse(UMK3_STRIKES[(pt.tick + idx + 1) % UMK3_STRIKES.length], pt.pl, 140);
    }else if(phase === 2){
      driveIndex(10, true, 'auto', pt.pl); /* BLOCK, feet planted */
    }else if(phase === 3){
      driveIndex(5, true, 'auto', pt.pl); /* crouch game */
      fightPulse((pt.tick % 2 === 0) ? 1 : 9, pt.pl, 150); /* uppercut / low kick */
    }else if(phase === 4){
      driveIndex(4, true, 'auto', pt.pl);
      driveIndex(fwd, true, 'auto', pt.pl);
      setTimeout(function(){
        if(!pilotStillOn(pt.pl)) return;
        fightPulse(UMK3_STRIKES[(pt.tick + idx) % UMK3_STRIKES.length], pt.pl, 140);
        setTimeout(function(){ if(pilotStillOn(pt.pl)){ driveIndex(4, false, 'auto', pt.pl); } }, 200);
      }, 300);
    }else{
      var mv = UMK3_MOVEBOOK[(pt.tick + idx) % UMK3_MOVEBOOK.length];
      pt.lastMove = mv.fighter ? (mv.fighter + ' ' + mv.name) : mv.name;
      fightTapSeq(resolveMove(mv.seq, fwd, back), pt.pl); /* real manual strings, e.g. spear/freeze */
    }
  }
  var autoDiff = 0;
  function pilotArrow(pt){
    if(pt.mode !== 'play') return '';
    return (pt.dir === AgentMap.dirL ? '◀' : '▶') + (pt.dirY === 4 ? '▲' : (pt.dirY === 5 ? '▼' : ''));
  }
  /* Two separate AI switches: System 1 drives P1, System 2 drives P2.
     Each button toggles only its own system; neither touches the other. */
  function pilotByPl(pl){
    for(var i = 0; i < autoPilots.length; i++){
      if(autoPilots[i].pl === pl) return autoPilots[i];
    }
    return null;
  }
  function pilotStillOn(pl){
    var pt = pilotByPl(pl);
    return !!(pt && pt.on);
  }
  function anyPilotOn(){
    for(var i = 0; i < autoPilots.length; i++){
      if(autoPilots[i].on) return true;
    }
    return false;
  }
  function pilotModes(){
    return autoPilots.map(function(pt){
      var tag = 'P' + (pt.pl + 1) + ':' + (pt.on ? pt.mode.toUpperCase() : 'OFF') + pilotArrow(pt);
      return tag;
    }).join(' ');
  }
  function paintAiSwitch(el, pl){
    if(!el) return;
    var pt = pilotByPl(pl), on = !!(pt && pt.on);
    var label = (pl === 0) ? 'P1' : 'P2';
    if(el.classList.contains('modal-action-btn')){
      el.textContent = on ? ('⏸ ' + label + ' AI: ON (' + pt.mode.toUpperCase() + pilotArrow(pt) + ')') : ('▶ ' + label + ' AI: OFF');
      el.classList.toggle('autopilot-on', on);
    }else{
      /* main-page round buttons stay compact: lit = on */
      el.classList.toggle('on', on);
      el.setAttribute('title', label + ' AI ' + (on ? ('ON (' + pt.mode.toUpperCase() + pilotArrow(pt) + ') — tap to stop') : 'OFF — tap to start'));
    }
  }
  function updateAutoBtn(){
    paintAiSwitch(document.getElementById('btn-autopilot-p1'), 0);
    paintAiSwitch(document.getElementById('btn-autopilot-p2'), 1);
    paintAiSwitch(document.getElementById('btn-ai-p1'), 0);
    paintAiSwitch(document.getElementById('btn-ai-p2'), 1);
    paintAiSwitch(document.getElementById('dt-ai-p1'), 0);
    paintAiSwitch(document.getElementById('dt-ai-p2'), 1);
    var b = document.getElementById('btn-autopilot');
    if(b){
      b.textContent = anyPilotOn() ? ('⏸ AUTOPILOT: ON (' + pilotModes() + ')') : '▶ AUTOPILOT: OFF';
      b.classList.toggle('autopilot-on', anyPilotOn());
    }
  }
  function autoTap(idx, pl){
    driveIndex(idx, true, 'auto', pl);
    setTimeout(function(){ driveIndex(idx, false, 'auto', pl); }, AgentOpts.tapPulseMs);
  }
  function updateAgentHud(){
    var profs = autoPilots.map(function(pt){
      return 'P' + (pt.pl + 1) + ':' + ((pt.sys && pt.sys.profile) || 'generic').toUpperCase();
    }).join(' ');
    var atAny = autoPilots.some(function(pt){ return pt.sys && pt.sys.autoTune; });
    var txt = (anyPilotOn() ? pilotModes() : 'OFF') + ' · d=' + autoDiff.toFixed(1) +
      (anyPilotOn() ? ' · ' + autoPilots.filter(function(pt){ return pt.on; }).map(function(p){ return 'P' + (p.pl + 1); }).join('+') : '') +
      (anyPilotOn() && atAny ? ' · AT' : '') +
      (anyPilotOn() ? ' · ' + profs : '');
    $all('.agent-hud').forEach(function(e){
      e.textContent = txt;
      e.classList.toggle('hidden', !AgentOpts.hud);
    });
    var hb = document.getElementById('btn-hud');
    if(hb) hb.textContent = AgentOpts.hud ? 'HUD: ON' : 'HUD: OFF';
  }
  function sensePilot(pt, g){
    if(!g || !pt.prev){ pt.prev = g; return 0; }
    var d = grayDiff(g, pt.prev);
    pt.prev = g;
    pt.lastD = d;
    var sys = pt.sys || AgentOpts;
    if(d > sys.hiThresh){
      pt.hi++; pt.lo = 0;
      if(pt.hi >= AgentOpts.hiStreak && pt.mode !== 'play'){
        pt.mode = 'play'; autoHasPlayed = true;
        antonLog('P' + (pt.pl + 1) + ': SEEK→PLAY (d=' + d.toFixed(1) + ')');
        if(!aiCheckpointSaved && Date.now() - aiEngineStart > 5000 && aiCheckpoint()){
          antonLog('checkpoint slot ' + aiCheckpointSlot);
        }
        updateAutoBtn();
      }
    }else if(d < (pt.sys || AgentOpts).loThresh){
      pt.lo++; pt.hi = 0;
      if(pt.lo >= AgentOpts.loStreak && pt.mode !== 'seek'){ pt.mode = 'seek'; antonLog('P' + (pt.pl + 1) + ': PLAY→SEEK (d=' + d.toFixed(1) + ')'); releaseAuto(pt.pl); updateAutoBtn(); }
    }else{ pt.hi = 0; pt.lo = 0; }
    if(pt.mode === 'play') lastPlaySeen = Date.now();
    return d;
  }
  function syncAutoOn(){ autoOn = anyPilotOn(); }
  function startAgentEngine(){
    /* pilots carry their own parsed cycle (pt.cycle); nothing global to parse */
    /* timers run once and stay up while any system is on; pilots are
       added/removed individually so toggling P1 never resets P2. */
    if(autoMenuTimer) clearInterval(autoMenuTimer);
    if(autoSenseTimer) clearInterval(autoSenseTimer);
    if(autoTimer) clearInterval(autoTimer);
    /* pilots are owned by their own P1/P2 switches — never rebuilt here,
       so retuning or toggling one system never resets the other */
    autoPilots.sort(function(a, b){ return a.pl - b.pl; });
    syncAutoOn();
    autoHasPlayed = false; autoStartN = 0; lastPlaySeen = 0;
    lastStartTap = 0; pauseGuardUntil = 0;
    autoMenuTimer = setInterval(function(){
      if(!anyPilotOn() || !playing) return;
      var now = Date.now();
      autoPilots.forEach(function(pt){
        if(!pt.on || pt.mode !== 'seek' || !pt.menus) return;
        if(pt.lastMenu && (now - pt.lastMenu) < (pt.sys.tapMs || 4000)) return;
        pt.lastMenu = now;
        pt.menuN++;
        var tap = pt.cycle[pt.menuN % pt.cycle.length];
        /* post-gameplay START throttle: tapping START mid-game pauses it,
           so within a minute of gameplay allow only 1 in 8 START landings.
           Older than that, menus get the full rate (a lone animated-title
           blip must not stall menu advance forever). */
        if(tap === 3 && autoHasPlayed && (Date.now() - lastPlaySeen < START_QUIET_MS)){
          autoStartN++; if(autoStartN % 8 !== 0) tap = 2;
        }
        /* shared START gap + pause guard: at most one START per gap, and
           for 20s after any risky START only SELECT may fire — no A, no
           dpad, no START — so a pause menu can neither be navigated nor
           confirmed into Quit/Title. */
        if(tap === 3){
          if(!startAllowed()) tap = 2;
          else noteStartTap(autoHasPlayed && (Date.now() - lastPlaySeen < START_QUIET_MS));
        }else if(Date.now() < pauseGuardUntil && tap !== 2){
          tap = 2; /* guard window: SELECT-only, pause menu can't be navigated or confirmed */
        }
        /* menus listen to player 1 on virtually every SNES title */
        autoTap(tap, 0);
      });
    }, 500);
    autoSenseTimer = setInterval(function(){
      if(!anyPilotOn() || !playing){ autoPilots.forEach(function(pt){ pt.prev = null; }); return; }
      var nowS = Date.now();
      var g = frameGray();
      if(!g) return;
      if(grayMean(g) < AgentOpts.blackMean){
        /* black transition / fade-out: quiet — heal every pilot to SEEK */
        autoDiff = 0;
        var healed = false;
        autoPilots.forEach(function(pt){
          pt.prev = g; pt.hi = 0; pt.lo = 0;
          if(pt.mode !== 'seek'){ pt.mode = 'seek'; healed = true; }
        });
        if(healed) antonLog('quiet screen — all pilots to SEEK');
        releaseAuto(); updateAutoBtn(); updateAgentHud(); updateTelemetry();
        return; /* black-screen heal keeps full release: no game input is valid on black */
      }
      var dMax = 0, actSum = 0;
      autoPilots.forEach(function(pt){
        if(!pt.on) return;
        if(!pt.prev){ pt.prev = g; pt.lastSense = Date.now(); return; }
        if(pt.lastSense && (Date.now() - pt.lastSense) < (pt.sys.senseMs || 2000)) return;
        pt.lastSense = Date.now();
        /* SYSTEM 1 / SYSTEM 2 SEPARATED: each pilot votes its own steering
           from its own previous frame — no shared world vote. */
        var sh = colShift(pt.prev, g);
        var shy = rowShift(pt.prev, g);
        if(sh >= 2) pt.dir = AgentMap.dirR; else if(sh <= -2) pt.dir = AgentMap.dirL;
        if(shy >= 2) pt.dirY = 5; else if(shy <= -2) pt.dirY = 4;
        else if(shy === 0) pt.dirY = null;
        var d = sensePilot(pt, g);
        pt.diff = d;
        pt.activity = (pt.activity || 0) + d;
        dMax = Math.max(dMax, d);
        actSum += d;
        governPilot(pt, d);
        stuckWatchPilot(pt, d);
      });
      autoDiff = dMax;
      teleActivity += actSum;
      ocrSample();
      try{ lastScene = buildScene(dMax); }catch(e){}
      updateAgentHud();
      drawTeleVision();
      updateTelemetry();
    }, 500);
    autoTimer = setInterval(function(){
      if(!anyPilotOn()) return;
      if(!playing) return;
      autoPilots.forEach(function(pt, idx){
        if(!pt.on || pt.mode !== 'play') return; /* menus get taps only — held buttons would fight navigation */
        if((pt.sys.profile || 'generic') === 'umk3'){ fightTick(pt, idx); return; }
        pt.tick++;
        /* per-system drive: this pilot follows ONLY its own steering vote.
           Release opposite first so a flipped vote can't latch L+R stuck. */
        driveIndex(pt.dir === AgentMap.dirL ? AgentMap.dirR : AgentMap.dirL, false, 'auto', pt.pl);
        driveIndex(pt.dir, true, 'auto', pt.pl);
        driveIndex(AgentMap.run, true, 'auto', pt.pl); /* follow the scroll + run/dash */
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
              setTimeout(function(){ if(pilotStillOn(pl)) driveIndex(v, false, 'auto', pl); }, AgentOpts.hopPulseMs);
            })(vn, pt.pl);
          }
        }
        if((pt.tick + idx) % (pt.sys.hopEvery || 3) === 0){
          /* own rhythm per pilot: phase-offset hops, own button order */
          pt.hopN++;
          var btn = pt.order[pt.hopN % pt.order.length]; /* jump in one game is attack in another */
          try{ pt.lastMove = 'strike ' + BTN_NAMES[btn]; }catch(e){ pt.lastMove = 'strike ' + btn; }
          driveIndex(btn, true, 'auto', pt.pl);
          (function(b, pl){
            setTimeout(function(){ if(pilotStillOn(pl)) driveIndex(b, false, 'auto', pl); }, AgentOpts.hopPulseMs);
          })(btn, pt.pl);
          if(pt.hopN % 4 === 3){
            /* every 4th beat works a shoulder too — dash/strafe/special, per game */
            pt.shN++;
            var sh = AgentMap.shoulders[pt.shN % AgentMap.shoulders.length];
            driveIndex(sh, true, 'auto', pt.pl);
            (function(s, pl){
              setTimeout(function(){ if(pilotStillOn(pl)) driveIndex(s, false, 'auto', pl); }, AgentOpts.hopPulseMs);
            })(sh, pt.pl);
          }
        }
      });
    }, AgentOpts.driveMs);
  }
  /* Son of Anton live governor: adjusts the copilot on the fly, one small
     step at a time, always inside the tune-grid clamps. Three rules:
     flapping SEEK<->PLAY widens the deadband; menus-forever lowers the
     motion bar; pushing-with-no-progress hops more often. Every adjustment
     is announced in #anton-live and the tune inputs update live. Report
     only — never touches files, never leaves safe ranges. */
  /* NOTE: governor memory is per-pilot (pt.antonHist etc). No shared
     antonHist — System 1 thrashing never retunes System 2's game. */
  function antonSay(msg){
    var e = document.getElementById('anton-live');
    if(e) e.textContent = 'SON OF ANTON · ' + msg;
    antonLog(msg);
  }
  /* Agent telemetry: scrolling decision console (capped) + live rows.
     Written by mode changes, heals, adjustments and moves — read by the
     AI Lab dashboard. Pure display, never touches gameplay. */
  var antonLogBuf = [], teleActivity = 0;
  function antonLog(msg){
    try{
      var t = new Date().toISOString().split('T')[1].slice(0, 8);
      antonLogBuf.push('[' + t + '] ' + msg);
      if(antonLogBuf.length > 30) antonLogBuf.splice(0, antonLogBuf.length - 30);
      var box = document.getElementById('anton-console');
      if(!box) return;
      box.innerHTML = '';
      antonLogBuf.slice(-8).forEach(function(line){
        var d = document.createElement('div');
        d.textContent = line;
        box.appendChild(d);
      });
      box.scrollTop = box.scrollHeight;
    }catch(e){}
  }
  function drawTeleVision(){
    try{
      var cv = document.getElementById('telemetry-vision');
      if(!cv) return;
      var src = stage.querySelector('canvas');
      if(!src || !src.width) return;
      cv.getContext('2d').drawImage(src, 0, 0, 64, 64);
    }catch(e){}
  }
  function updateTelemetry(){
    try{
      var m = document.getElementById('tele-mode');
      if(m) m.textContent = anyPilotOn() ? pilotModes() : 'OFF';
      var mv = document.getElementById('tele-move');
      if(mv) mv.textContent = (anyPilotOn() && autoPilots.length)
        ? autoPilots.map(function(pt){ return 'P' + (pt.pl + 1) + ':' + (pt.lastMove || '—'); }).join(' | ')
        : '—';
      var ac = document.getElementById('tele-activity');
      if(ac) ac.textContent = teleActivity.toFixed(1);
      var df = document.getElementById('tele-diff');
      if(df) df.textContent = autoDiff.toFixed(1);
      var wd = document.getElementById('tele-words');
      if(wd) wd.textContent = AgentOpts.ocr ? (ocrWords || 'listening…') : 'off';
      try{
        if(anyPilotOn() && autoPilots.length){
          lastPlan = autoPilots.map(function(pt){
            var tag = 'P' + (pt.pl + 1) + ':';
            if(pt.mode !== 'play') return tag + 'menu';
            var prof = (pt.sys && pt.sys.profile) || 'generic';
            if(prof === 'umk3')
              return tag + 'fight ' + (['approach+RUN', 'strike flurry', 'BLOCK', 'crouch/uppercut', 'jump-in', 'special string'][((pt.fphase % 6) + 6) % 6]);
            return tag + 'scroll+run/' + (pt.sys.hopEvery || 3);
          }).join(' | ');
          lastManual = (lastScene && lastScene.manual && lastScene.manual.matched)
            ? (lastScene.manual.game + ' ✓') : 'no match';
        }else{ lastPlan = '—'; lastManual = '—'; }
      }catch(e){ lastPlan = '—'; lastManual = '—'; }
      var pl = document.getElementById('tele-plan');
      if(pl) pl.textContent = lastPlan;
      var mn = document.getElementById('tele-manual');
      if(mn) mn.textContent = lastManual;
      var mm = document.getElementById('tele-memory');
      if(mm) mm.textContent = 'deaths ' + agentMemory.deaths + ' · stucks ' + agentMemory.stucks +
        ' · saves ' + agentMemory.recoveries + (aiCheckpointSaved ? ' · ckpt✓' : '');
    }catch(e){}
  }
  /* ---------- word reader (screen OCR) ----------
     Lazy-loads Tesseract.js only when enabled, samples the emulator canvas
     every ~3rd sense tick, and matches menu keywords: GAME OVER and PAUSE
     earn one START tap each (10s cooldown); everything else is display-only
     in telemetry. Any load/recognition failure degrades silently to off. */
  var ocrBusy = false, ocrWords = '', ocrTick = 0, ocrReady = null;
  function ocrKeywords(text){
    var t = String(text || '').toUpperCase();
    var hits = [];
    if(/GAME\s*OVER/.test(t)) hits.push('GAME OVER');
    if(/\bPAUS/.test(t)) hits.push('PAUSE');
    if(/PRESS.*START|START.*GAME/.test(t)) hits.push('PRESS START');
    if(/\bSELECT\b/.test(t)) hits.push('SELECT');
    if(/CONTINUE/.test(t)) hits.push('CONTINUE');
    if(/1\s*PLAYER|2\s*PLAYER/.test(t)) hits.push('1P/2P MENU');
    if(/\bWIN\b|\bFINISH\b|TIME\s*UP|\bKO\b/.test(t)) hits.push('ROUND END');
    return hits;
  }
  function ensureTesseract(){
    if(ocrReady) return ocrReady;
    ocrReady = new Promise(function(res){
      try{
        if(window.Tesseract && window.Tesseract.recognize){ res(true); return; }
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.async = true;
        s.onload = function(){ res(true); };
        s.onerror = function(){ res(false); };
        document.head.appendChild(s);
      }catch(e){ res(false); }
    });
    return ocrReady;
  }
  function ocrSample(){
    if(!AgentOpts.ocr || !anyPilotOn() || !playing || ocrBusy) return;
    ocrTick++;
    if(ocrTick % 3 !== 0) return;
    var src = stage.querySelector('canvas');
    if(!src || !src.width) return;
    ocrBusy = true;
    ensureTesseract().then(function(ok){
      if(!ok || !window.Tesseract || !window.Tesseract.recognize) return null;
      var c = document.createElement('canvas');
      var W = 480, H = Math.max(1, Math.round(480 * src.height / src.width));
      c.width = W; c.height = H;
      c.getContext('2d').drawImage(src, 0, 0, W, H);
      return window.Tesseract.recognize(c, 'eng', { logger: function(){} });
    }).then(function(r){
      ocrBusy = false;
      if(!r || !r.data || !r.data.text) return;
      var words = r.data.text.replace(/\s+/g, ' ').trim().slice(0, 120);
      var hits = ocrKeywords(words);
      ocrWords = (hits.length ? hits.join(' · ') + ' — ' : '') + (words.slice(0, 60) || '(no text)');
      if(hits.length && (hits.indexOf('GAME OVER') !== -1 || hits.indexOf('PAUSE') !== -1)){
        /* same shared START gate as menu taps: unpause retries obey the gap
           so OCR can neither pause-spam nor walk a pause menu into Quit */
        if(startAllowed()){
          /* GAME OVER means title-flow ahead (A/dpad needed to re-enter),
             so no guard; PAUSE-only means a live pause menu — guard it. */
          noteStartTap(hits.indexOf('GAME OVER') === -1);
          autoTap(3, 0);
          antonLog('words [' + hits.join(', ') + '] → START');
        }else{
          antonLog('words [' + hits.join(', ') + '] — START held (gap)');
        }
        if(hits.indexOf('GAME OVER') !== -1) agentOnDeath(hits);
      }
      updateTelemetry();
    }).catch(function(){ ocrBusy = false; });
  }
  function toggleOcr(){
    AgentOpts.ocr = !AgentOpts.ocr;
    saveAgentOpts(); renderTuneInputs();
    if(AgentOpts.ocr){ ensureTesseract(); antonLog('word reader on — sampling screen text'); }
    else ocrWords = '';
    updateTelemetry();
  }
  /* SYSTEM-SEPARATED governor: each pilot tunes its OWN system's thresholds
     from its own flapping/stuck pattern — P1 thrashing never retunes P2's
     game and vice versa. */
  function governPilot(pt, d){
    var sys = pt.sys || AgentOpts;
    if(!sys.autoTune || !pt.on || !playing) return;
    var tag = 'P' + (pt.pl + 1) + ':' + pt.mode;
    if(tag !== pt.antonLastModes){ pt.antonHist.push(1); pt.antonLastModes = tag; }
    else pt.antonHist.push(0);
    if(pt.antonHist.length > 8) pt.antonHist.shift();
    if(pt.antonCool > 0){ pt.antonCool--; return; }
    var flips = 0, i;
    for(i = 0; i < pt.antonHist.length; i++) flips += pt.antonHist[i];
    if(flips >= 3 && pt.antonHist.length >= 6){
      sys.hiThresh = Math.min(40, Math.round((sys.hiThresh + 1) * 2) / 2);
      sys.loThresh = Math.max(0.5, Math.round((sys.loThresh - 0.5) * 2) / 2);
      pt.antonHist = []; pt.antonCool = 4;
      saveSysOpts(); renderTuneInputs();
      antonSay('P' + (pt.pl + 1) + ' flapping — widened deadband (motion>' + sys.hiThresh + ' still<' + sys.loThresh + ')');
      return;
    }
    if(pt.mode !== 'play'){
      pt.antonSeekStuck++; pt.antonPlayStall = 0;
      if(pt.antonSeekStuck >= 12){
        sys.hiThresh = Math.max(3, Math.round((sys.hiThresh - 1) * 2) / 2);
        pt.antonSeekStuck = 0; pt.antonCool = 4;
        saveSysOpts(); renderTuneInputs();
        antonSay('P' + (pt.pl + 1) + ' stuck in menus — lowered motion bar to ' + sys.hiThresh);
      }
      return;
    }
    pt.antonSeekStuck = 0;
    if(d < sys.hiThresh){
      pt.antonPlayStall++;
      if(pt.antonPlayStall >= 8){
        sys.hopEvery = Math.max(1, sys.hopEvery - 1);
        pt.antonPlayStall = 0; pt.antonCool = 4;
        saveSysOpts(); renderTuneInputs();
        antonSay('P' + (pt.pl + 1) + ' pushing, no progress — hopping every ' + sys.hopEvery + ' beats');
      }
    }else pt.antonPlayStall = 0;
  }
  function antonGovern(dMax){
    /* legacy entry point kept harmless: per-pilot loop already governed. */
    return;
  }
  function toggleAutotune(){
    /* legacy global toggle kept harmless: per-system selects below are the
       real path — this flips both systems together. */
    var on = !(SysOpts.sys1.autoTune && SysOpts.sys2.autoTune);
    SysOpts.sys1.autoTune = on; SysOpts.sys2.autoTune = on;
    saveSysOpts(); renderTuneInputs();
    antonSay(on ? 'watching both systems…' : 'off — manual tuning only');
  }
  /* One switch per system. Starting P1 never touches P2's pilot object,
     timers, or button holds — and vice versa. */
  function startAutopilot(pl){
    if(pl === undefined || pl === null){
      /* legacy no-arg call: start both systems */
      startAutopilot(0); startAutopilot(1);
      return;
    }
    var existing = pilotByPl(pl);
    if(existing && existing.on) return;
    var idx = (pl === 0) ? 0 : 1;
    var pt = makePilot(pl, idx, pl === 0);
    pt.on = true;
    autoPilots = autoPilots.filter(function(q){ return q.pl !== pl; });
    autoPilots.push(pt);
    autoPilots.sort(function(a, b){ return a.pl - b.pl; });
    assignMenus();
    aiEngineStart = Date.now();
    antonLog('P' + (pl + 1) + ' system started');
    if(!playing) powerOn();
    startAgentEngine();
    updateAutoBtn(); updateAgentHud();
  }
  function releasePilot(pl){
    [6, 7, 4, 5, 8, 0, 1, 9, 10, 11, 2, 3].forEach(function(i){
      driveIndex(i, false, 'sys', pl);
    });
  }
  function stopAutopilot(pl){
    if(pl === undefined || pl === null){
      /* legacy no-arg call: stop both systems */
      stopAutopilot(0); stopAutopilot(1);
      return;
    }
    autoPilots = autoPilots.filter(function(q){ return q.pl !== pl; });
    releasePilot(pl);
    assignMenus();
    if(!anyPilotOn()){
      if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
      if(autoMenuTimer){ clearInterval(autoMenuTimer); autoMenuTimer = null; }
      if(autoSenseTimer){ clearInterval(autoSenseTimer); autoSenseTimer = null; }
    }
    updateAutoBtn(); updateAgentHud();
  }
  function toggleAutopilot(pl){
    if(pl === undefined || pl === null){
      if(anyPilotOn()){ stopAutopilot(0); stopAutopilot(1); }
      else { startAutopilot(0); startAutopilot(1); }
      return;
    }
    if(pilotStillOn(pl)) stopAutopilot(pl); else startAutopilot(pl);
  }
  function toggleHud(){ AgentOpts.hud = !AgentOpts.hud; saveAgentOpts(); updateAgentHud(); }

  /* ---------- autonomous player loop: bridge, perception, memory, recovery --
     Subsystems wired to real capabilities only (all calls feature-detected):
     1. bridge — live canvas frame, analyser audio window, simulateInput
        injection, quickSave/quickLoad + getState/loadState checkpoints
     2. perception — OCR words (above), motion-blob movers labeled UNKNOWN
        (never misclassified), audio tags, menu/gameplay/over/paused states
     3. manual brain — ai/manual-index.json + manual-knowledge.js, matched
        to the loaded ROM, heuristic entries always labeled as such
     4. loop — observe, plan short sequences, verify the result, recover on
        death/stuck, P1+P2 tracked separately, human takeover anytime */
  var SNESBridge = {
    getFrame: function(){ try{ return stage.querySelector('canvas'); }catch(e){ return null; } },
    getAudioWindow: function(){
      try{
        if(!audioTap.analyser || !audioTap.buf) return null;
        audioTap.analyser.getFloatTimeDomainData(audioTap.buf);
        return Array.prototype.slice.call(audioTap.buf);
      }catch(e){ return null; }
    },
    press: function(pl, btn, ms){
      driveIndex(btn, true, 'auto', pl);
      setTimeout(function(){ if(pilotStillOn(pl)) driveIndex(btn, false, 'auto', pl); }, ms || 120);
    },
    pressSequence: function(pl, steps){
      var chain = Promise.resolve();
      (steps || []).forEach(function(st){
        chain = chain.then(function(){
          return new Promise(function(res){
            SNESBridge.press(pl, st.button, st.holdMs || 100);
            setTimeout(res, (st.holdMs || 100) + (st.gapMs || 60));
          });
        });
      });
      return chain;
    },
    saveCheckpoint: function(slot){ return aiCheckpoint(slot); },
    loadCheckpoint: function(slot){ return aiRecoverCheckpoint(slot); },
    getRawState: function(){
      try{
        var gm = window.EJS_emulator && window.EJS_emulator.gameManager;
        if(gm && typeof gm.getState === 'function') return gm.getState();
      }catch(e){}
      return null;
    },
    loadRawState: function(state){
      try{
        var gm = window.EJS_emulator && window.EJS_emulator.gameManager;
        if(gm && typeof gm.loadState === 'function' && state){ gm.loadState(state); return true; }
      }catch(e){}
      return false;
    }
  };
  /* Motion blobs on the 32x32 sample: connected active cells become movers.
     Type is always 'unknown' with a fixed low confidence — the loop tracks
     and avoids them, it never pretends to know what they are. */
  var lastBlobs = [];
  function detectBlobs(prev, curr){
    if(!prev || !curr) return [];
    var W = 32, active = [], i;
    for(i = 0; i < 1024; i++){
      var d = curr[i] - prev[i];
      if((d < 0 ? -d : d) > 25) active.push(i);
    }
    var seen = {}, boxes = [];
    active.forEach(function(cell){
      if(seen[cell]) return;
      var stack = [cell], xs = [], ys = [];
      seen[cell] = true;
      while(stack.length){
        var c = stack.pop();
        var x = c % W, y = (c / W) | 0;
        xs.push(x); ys.push(y);
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(o){
          var nx = x + o[0], ny = y + o[1];
          if(nx < 0 || ny < 0 || nx >= W || ny >= W) return;
          var nc = ny * W + nx;
          if(!seen[nc] && active.indexOf(nc) !== -1){ seen[nc] = true; stack.push(nc); }
        });
      }
      if(xs.length >= 8){
        boxes.push({ x: Math.min.apply(null, xs), y: Math.min.apply(null, ys),
          w: Math.max.apply(null, xs) - Math.min.apply(null, xs) + 1,
          h: Math.max.apply(null, ys) - Math.min.apply(null, ys) + 1, n: xs.length });
      }
    });
    boxes.sort(function(a, b){ return b.n - a.n; });
    var out = boxes.slice(0, 4).map(function(b, k){
      var cx = b.x + b.w / 2, cy = b.y + b.h / 2, motion = 'appeared';
      for(var j = 0; j < lastBlobs.length; j++){
        var p = lastBlobs[j];
        var dx = cx - (p.bbox[0] + p.bbox[2] / 2), dy = cy - (p.bbox[1] + p.bbox[3] / 2);
        if(dx * dx + dy * dy < 36){ motion = (Math.abs(dx) + Math.abs(dy) >= 2) ? 'moving' : 'static'; break; }
      }
      return { id: 'mover_' + (k + 1), type: 'unknown', bbox: [b.x, b.y, b.w, b.h], motion: motion, confidence: 0.4 };
    });
    lastBlobs = out;
    return out;
  }
  function audioTags(){
    try{
      var w = SNESBridge.getAudioWindow();
      if(!w) return [];
      var sum = 0, peak = 0, i, v;
      for(i = 0; i < w.length; i++){ v = w[i]; sum += v * v; v = v < 0 ? -v : v; if(v > peak) peak = v; }
      var rms = Math.sqrt(sum / w.length);
      if(rms < 0.005) return ['silence'];
      if(peak > 0.4) return ['loud-spike'];
      return ['sound'];
    }catch(e){ return []; }
  }
  function retrieveForScene(opts){
    try{
      if(window.MANUAL_KNOWLEDGE && window.MANUAL_KNOWLEDGE.retrieve){
        var out = window.MANUAL_KNOWLEDGE.retrieve(opts);
        /* AI learning: fold the cached manual control lines for this ROM
           into the scene so the drivers (not just the dashboard) see them. */
        try{
          var entry = window.MANUAL_KNOWLEDGE.matchGame((opts && opts.gameTitle) || currentName);
          if(entry){
            var raw = localStorage.getItem(manualCacheKey(entry.file));
            var controls = raw ? (JSON.parse(raw).controls || []) : [];
            if(controls.length){
              out.game = out.game || entry.title;
              out.matched = true;
              out.learnedControls = controls;
              out.excerpts.push({ game: entry.title, page: null,
                section: 'learned controls (' + controls.length + ' lines)',
                text: controls.slice(0, 6).join(' / ') });
            }
          }
        }catch(e2){}
        return out;
      }
    }catch(e){}
    return { game: null, matched: false, excerpts: [] };
  }
  /* Learned-manual steering: RUN/BLOCK/menu verbs from the manual bias the
     generic platformer driver. Fighter profile keeps its own phase machine
     (manual strings already encoded there); this only tunes holds + menus. */
  function applyManualToDriver(controls){
    var anyUmk3 = (SysOpts.sys1.profile === 'umk3') || (SysOpts.sys2.profile === 'umk3');
    if(anyUmk3) return;
    var text = ' ' + (controls || []).join(' ').toUpperCase() + ' ';
    var hasRun = text.indexOf('RUN') !== -1;
    var hasBlock = text.indexOf('BLOCK') !== -1;
    if(!hasRun){
      /* manual never mentions running: drop the run hold so the pilot
         stops wasting a shoulder the game doesn't use */
      try{
        var i = AgentMap.shoulders.indexOf(AgentMap.run);
        if(i !== -1){ AgentMap._savedRun = AgentMap.run; AgentMap.run = null; }
      }catch(e){}
    }else if(AgentMap.run === null && AgentMap._savedRun !== undefined){
      AgentMap.run = AgentMap._savedRun;
    }
    if(hasBlock && AgentMap.shoulders.indexOf(10) === -1) AgentMap.shoulders.push(10);
  }
  var lastScene = null, lastPlan = '—', lastManual = '—';
  function pilotPlanText(pt){
    if(!pt || pt.mode !== 'play') return 'menu taps';
    var prof = (pt.sys && pt.sys.profile) || 'generic';
    if(prof === 'umk3'){
      var phases = ['approach+RUN', 'strike flurry', 'BLOCK', 'crouch/uppercut', 'jump-in', 'special string'];
      return 'fight: ' + (phases[((pt.fphase % 6) + 6) % 6] || 'fight');
    }
    return 'hold scroll+run, hop every ' + ((pt.sys && pt.sys.hopEvery) || 3);
  }
  function buildScene(dMax){
    var modes = '', play = false;
    try{ modes = pilotModes(); play = /play/i.test(modes); }catch(e){}
    var hits = ocrKeywords(ocrWords);
    var screenType = !playing ? 'off' : 'menu';
    if(playing && play) screenType = 'gameplay';
    if(hits.indexOf('GAME OVER') !== -1) screenType = 'game-over';
    else if(hits.indexOf('PAUSE') !== -1) screenType = 'paused';
    var manual = retrieveForScene({ gameTitle: currentName,
      profile: (autoPilots.length && autoPilots[0].sys && autoPilots[0].sys.profile) || AgentOpts.profile,
      query: (ocrWords || '') + ' ' + screenType });
    var players = [];
    try{
      players = autoPilots.map(function(pt){
        return { id: 'P' + (pt.pl + 1), mode: pt.mode,
          owner: pt.pl === 0 ? 'shared(human+ai)' : 'ai', status: 'active' };
      });
    }catch(e){}
    var anyUmk3 = autoPilots.some(function(pt){ return pt.sys && pt.sys.profile === 'umk3'; });
    var objective = !playing ? 'boot the game' :
      (screenType === 'gameplay'
        ? (anyUmk3 ? 'reduce opponent health, preserve own' : 'follow scroll, avoid hazards, keep moving')
        : 'advance menus to gameplay');
    return { timestamp: Date.now(), screen_type: screenType,
      game_title: currentName, manual: manual, players: players,
      enemies: lastBlobs, hazards: [], items: [], ui: null,
      ocr_text: ocrWords || '', audio_events: audioTags(),
      objective_guess: objective };
  }
  /* Persistent session memory: deaths, stalls, recoveries, help requests. */
  var agentMemory = { deaths: 0, stucks: 0, recoveries: 0, helps: 0 };
  try{ Object.assign(agentMemory, JSON.parse(localStorage.getItem('snesboy-agent-memory') || '{}')); }catch(e){}
  function saveMemory(){ try{ localStorage.setItem('snesboy-agent-memory', JSON.stringify(agentMemory)); }catch(e){} }
  var aiCheckpointSlot = '9', aiCheckpointSaved = false, aiEngineStart = 0;
  function aiCheckpoint(slot){
    try{
      var gm = window.EJS_emulator && window.EJS_emulator.gameManager;
      if(gm && typeof gm.quickSave === 'function'){
        gm.quickSave(slot || aiCheckpointSlot);
        aiCheckpointSaved = true;
        return true;
      }
    }catch(e){}
    return false;
  }
  function aiRecoverCheckpoint(slot){
    try{
      var gm = window.EJS_emulator && window.EJS_emulator.gameManager;
      if(gm && typeof gm.quickLoad === 'function' && aiCheckpointSaved){
        gm.quickLoad(slot || aiCheckpointSlot);
        return true;
      }
    }catch(e){}
    return false;
  }
  function agentOnDeath(hits){
    agentMemory.deaths++; saveMemory();
    antonLog('down — likely cause: ' + (hits.join(', ') || 'unknown') + ' (death #' + agentMemory.deaths + ')');
    if(agentMemory.deaths >= 2 && aiCheckpointSaved){
      if(aiRecoverCheckpoint()){
        agentMemory.recoveries++; agentMemory.deaths = 0; saveMemory();
        antonLog('recovery: checkpoint slot ' + aiCheckpointSlot);
      }
    }
    updateTelemetry();
  }
  /* Stuck escalation: still-in-play too long → reverse burst → checkpoint
     reload → ask the human (throttled). Never stops permanently. */
  var stuckHelpAt = 0;
  /* SYSTEM-SEPARATED stuck escalation: each pilot tracks its own stillness
     and reverses ONLY its own direction. Checkpoint/help stay shared
     resources (one slot, one human), but the trigger is per-system. */
  function stuckWatchPilot(pt, d){
    if(!pt.on || !playing || pt.mode !== 'play'){ pt.stuckTicks = 0; pt.stuckLevel = 0; return; }
    if(d >= (pt.sys.hiThresh || 8)){ pt.stuckTicks = 0; pt.stuckLevel = 0; return; }
    pt.stuckTicks++;
    if(pt.stuckTicks === 10){
      pt.stuckLevel = 1; agentMemory.stucks++; saveMemory();
      pt.dir = (pt.dir === AgentMap.dirR) ? AgentMap.dirL : AgentMap.dirR;
      antonLog('P' + (pt.pl + 1) + ' stuck ~20s — trying reversed direction');
    }else if(pt.stuckTicks === 15){
      pt.stuckLevel = 2;
      if(aiRecoverCheckpoint()){
        agentMemory.recoveries++; saveMemory();
        antonLog('P' + (pt.pl + 1) + ' still stuck — checkpoint slot ' + aiCheckpointSlot);
        pt.stuckTicks = 0; pt.stuckLevel = 0;
      }
    }else if(pt.stuckTicks >= 20){
      pt.stuckLevel = 3;
      if(Date.now() - stuckHelpAt > 60000){
        stuckHelpAt = Date.now(); agentMemory.helps++; saveMemory();
        antonLog('P' + (pt.pl + 1) + ' stuck — requesting human help (take P1, or press SAVE CHECKPOINT)');
      }
      pt.stuckTicks = 10; /* loop L1/L2 again, never give up */
    }
  }
  function stuckWatch(dMax){
    /* legacy entry point kept harmless: per-pilot loop already escalates. */
    return;
  }

  /* ---------- tune the brains: SYSTEM 1 + SYSTEM 2 panels ---------- */
  var TuneFields = [
    ['senseMs', 500, 5000], ['tapMs', 2000, 10000], ['hiThresh', 1, 40],
    ['loThresh', 0.5, 20], ['hopEvery', 1, 10], ['startGapMs', 15000, 300000]
  ];
  var SharedFields = [];
  function renderSysPanel(prefix, sys){
    TuneFields.forEach(function(f){
      var el = document.getElementById(prefix + '-' + f[0]);
      if(el) el.value = sys[f[0]];
    });
    var cy = document.getElementById(prefix + '-seekCycle');
    if(cy) cy.value = sys.seekCycle;
    var pf = document.getElementById(prefix + '-profile');
    if(pf) pf.value = sys.profile || 'generic';
    var at = document.getElementById(prefix + '-autoTune');
    if(at) at.value = sys.autoTune ? 'on' : 'off';
  }
  function renderTuneInputs(){
    renderSysPanel('opt1', SysOpts.sys1);
    renderSysPanel('opt2', SysOpts.sys2);
    SharedFields.forEach(function(f){
      var el = document.getElementById('opt-' + f[0]);
      if(el) el.value = AgentOpts[f[0]];
    });
    var oc = document.getElementById('btn-ocr');
    if(oc) oc.textContent = 'READ WORDS: ' + (AgentOpts.ocr ? 'ON' : 'OFF');
    var map = document.getElementById('agent-map-readout');
    if(map) map.textContent = 'map: dirR=' + AgentMap.dirR + ' dirL=' + AgentMap.dirL +
      ' run=' + AgentMap.run + ' actions=[' + AgentMap.actions.join(',') +
      '] shoulders=[' + AgentMap.shoulders.join(',') +
      '] select=' + AgentMap.select + ' start=' + AgentMap.start;
  }
  function resetAgentOpts(){
    AgentOpts = Object.assign({}, AgentDefaults);
    SysOpts.sys1 = Object.assign({}, SysDefaults);
    SysOpts.sys2 = Object.assign({}, SysDefaults);
    saveAgentOpts(); saveSysOpts(); renderTuneInputs();
    if(anyPilotOn()){ startAgentEngine(); }
    updateAgentHud();
  }

  /* ---------- Son of Anton: general-purpose planner, code-health capability --
     The scan below plans coverage of the report run, then scores each file
     with the report-only scorer. Nothing is modified, ever. */
  var ANTON_SOURCES = ['index.html', 'style.css', 'script.js', 'ai/son-of-anton.js', 'ai/umk3-moves.js'];
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
      var good = sources.filter(function(s){ return !s.error; });
      var names = good.map(function(s){ return s.name; });
      anton.register('code-health', window.SonOfAnton.codeHealth(names));
      var plan = anton.plan({ domain: 'code-health',
        state: { files: names, reported: [] }, goal: { reported: names } });
      return anton.execute({ plan: plan,
        state: { files: names, reported: [] } }).then(function(){
        if(!box) return;
        box.innerHTML = '';
        if(!plan.steps.length){ box.innerHTML = '<p class="modal-desc">No sources readable.</p>'; return; }
        plan.steps.forEach(function(step){
          var src = null;
          for(var i = 0; i < good.length; i++){
            if(good[i].name === step.params.name) src = good[i];
          }
          var r = window.SonOfAnton.scoreContent(src ? src.content : '');
          var item = document.createElement('div'); item.className = 'rom-list-item';
          var nm = document.createElement('div'); nm.className = 'rom-name';
          nm.textContent = step.params.name + ' — ' + r.score.toFixed(2) + ' ' + r.verdict +
            ' (' + r.lines + ' lines, ' + r.commentLines + ' comments, ' + r.logStatements + ' logs)';
          item.appendChild(nm); box.appendChild(item);
        });
      });
    }).catch(function(){
      if(box) box.innerHTML = '<p class="modal-desc">Scan failed.</p>';
    });
  }

  /* ---------- Manual archive as a Son of Anton capability ----------
     Loads the matched game's PDF from archive.org (user click = approval),
     extracts text with pdf.js, caches it, and surfaces control lines.
     Both libraries lazy-load; every failure degrades to a status line. */
  var pdfjsReady = null;
  function ensurePdfjs(){
    if(pdfjsReady) return pdfjsReady;
    pdfjsReady = new Promise(function(res){
      try{
        if(window.pdfjsLib && window.pdfjsLib.getDocument){ res(true); return; }
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        s.async = true;
        s.onload = function(){ res(true); };
        s.onerror = function(){ res(false); };
        document.head.appendChild(s);
      }catch(e){ res(false); }
    });
    return pdfjsReady;
  }
  function manualCacheKey(file){
    return 'snesboy-manual-' + String(file || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  function loadManualForCurrentGame(){
    var status = document.getElementById('manual-status');
    var box = document.getElementById('manual-extract');
    function say(msg){ if(status) status.textContent = msg; }
    if(typeof window.SonOfAnton === 'undefined' ||
       !window.MANUAL_KNOWLEDGE || !window.MANUAL_KNOWLEDGE.manualsCapability){
      say('Manual brain failed to load.');
      return;
    }
    var entry = window.MANUAL_KNOWLEDGE.matchGame(currentName);
    if(!entry){ say('No confident manual match for this ROM — pick its PDF from the list above.'); return; }
    var file = entry.file;
    try{
      var cached = localStorage.getItem(manualCacheKey(file));
      if(cached){
        renderManualExtract(file, JSON.parse(cached).controls || []);
        say('Served from cache (' + file + ').');
        return;
      }
    }catch(e){}
    say('Planning: search → fetch → extract…');
    var anton = new window.SonOfAnton();
    var host = {
      _bufs: {}, _texts: {},
      index: function(){ return [{ title: entry.title, file: entry.file }]; },
      fetchFile: function(f){
        var self = this;
        return fetch(window.MANUAL_KNOWLEDGE.archiveFileUrl(f)).then(function(r){
          if(!r.ok) throw new Error('HTTP ' + r.status);
          return r.arrayBuffer();
        }).then(function(buf){ self._bufs[f] = buf; return buf; });
      },
      extractText: function(f){
        var self = this;
        if(self._texts[f]) return Promise.resolve(self._texts[f]);
        function parse(buf){
          return window.pdfjsLib.getDocument({ data: buf }).promise.then(function(pdf){
            var pages = [];
            for(var p = 1; p <= pdf.numPages; p++){
              pages.push(pdf.getPage(p).then(function(page){
                return page.getTextContent().then(function(tc){
                  return tc.items.map(function(it){ return it.str; }).join('\n');
                });
              }));
            }
            return Promise.all(pages);
          }).then(function(texts){
            var text = texts.join('\n');
            self._texts[f] = text;
            return text;
          });
        }
        return ensurePdfjs().then(function(ok){
          if(!ok || !window.pdfjsLib) throw new Error('pdf.js unavailable');
          if(self._bufs[f]) return parse(self._bufs[f]);
          return self.fetchFile(f).then(parse);
        });
      }
    };
    var goal = { query: entry.title, file: file, wantText: true };
    anton.register('manuals', window.MANUAL_KNOWLEDGE.manualsCapability(host));
    var plan;
    try{
      plan = anton.plan({ domain: 'manuals',
        state: { query: '', candidates: [], file: null, fetched: false, textChars: 0, reported: [] }, goal: goal });
    }catch(err){ say('Planner error: ' + err.message); return; }
    if(!plan.predictedSuccess){ say('Planner found no route to ' + file + '.'); return; }
    say('Plan: ' + plan.steps.map(function(s){ return s.action; }).join(' → ') + ' — fetching…');
    anton.execute({ plan: plan,
      state: { query: '', candidates: [], file: null, fetched: false, textChars: 0, reported: [] },
      approve: function(){ return Promise.resolve(true); } /* the button click above is the approval */
    }).then(function(res){
      return host.extractText(file).then(function(text){
        var controls = window.MANUAL_KNOWLEDGE.extractControls(text, 25);
        try{ localStorage.setItem(manualCacheKey(file), JSON.stringify({ controls: controls })); }catch(e){}
        renderManualExtract(file, controls);
        say('Extracted ' + controls.length + ' control lines from ' + file +
          ' (' + res.completed.length + ' planned steps, ~' + Math.round(text.length / 1024) + ' KB read).');
      });
    }).catch(function(err){
      say('Manual load failed: ' + (err && err.message ? err.message : err));
    });
    function renderManualExtract(f, controls){
      if(!box) return;
      box.innerHTML = '';
      if(!controls.length){
        box.innerHTML = '<p class="modal-desc">No control lines found in ' + f + '.</p>';
        return;
      }
      controls.forEach(function(line){
        var item = document.createElement('div'); item.className = 'rom-list-item';
        var nm = document.createElement('div'); nm.className = 'rom-name';
        nm.textContent = line;
        item.appendChild(nm); box.appendChild(item);
      });
    }
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
  function frameGray(){
    try{
      var src = stage.querySelector('canvas');
      if(!src || !src.width) return null;
      if(!recCanvas){
        recCanvas = document.createElement('canvas');
        recCanvas.width = 32; recCanvas.height = 32;
        recCtx = recCanvas.getContext('2d', { willReadFrequently: true });
      }
      recCtx.drawImage(src, 0, 0, 32, 32);
      var d = recCtx.getImageData(0, 0, 32, 32).data;
      var g = new Uint8Array(1024);
      for(var i = 0, j = 0; i < d.length; i += 4, j++){
        g[j] = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000 | 0;
      }
      return g;
    }catch(e){ return null; }
  }
  function frameB64(){
    var g = frameGray();
    if(!g) return null;
    var s = '';
    for(var i = 0; i < g.length; i++) s += String.fromCharCode(g[i]);
    return btoa(s);
  }
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
  /* NOTE: steering is per-pilot (pt.dir / pt.dirY). No shared autoDir —
     System 1 and System 2 vote and hold independently. */
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
    var ep = { game: currentName, date: new Date().toISOString(),
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
  function stopReplay(){
    replayTimers.forEach(clearTimeout);
    replayTimers = [];
    if(replayingId !== null){ replayingId = null; renderEpisodes(); }
  }
  function replayEpisode(id){
    if(replayingId === id){ stopReplay(); return; }
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
          driveIndex(ev.b, ev.d === 1, 'replay', ev.p || 0);
        }, Math.max(0, ev.t - (Date.now() - t0))));
      });
      var last = ep.inputs[ep.inputs.length - 1].t;
      replayTimers.push(setTimeout(stopReplay, last + 800));
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
  var MEM = [{ name: BUNDLED.name, url: BUNDLED.url, builtin: true }];
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
      if(!entries.length){
        var p = document.createElement('p');
        p.className = 'modal-desc'; p.textContent = 'No ROMs yet — add one below.';
        list.appendChild(p); return;
      }
      entries.forEach(function(en){
        var item = document.createElement('div'); item.className = 'rom-list-item';
        var nm = document.createElement('div'); nm.className = 'rom-name';
        nm.textContent = (en.name === currentName ? '▶ ' : '') + en.name;
        var act = document.createElement('div'); act.className = 'rom-actions';
        var play = document.createElement('button'); play.className = 'rom-btn-play'; play.textContent = 'PLAY';
        play.addEventListener('click', function(){
          closeModals();
          playing = false; showStandby(true); setLeds(false);
          setStatus('LOADING…', en.name.toUpperCase().slice(0, 40));
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
    releaseAll();
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
  on('btn-ai', function(){ renderEpisodes(); renderTuneInputs(); updateAgentHud(); openModal('ai-modal'); });
  on('dt-btn-ai', function(){ renderEpisodes(); renderTuneInputs(); updateAgentHud(); openModal('ai-modal'); });
  on('btn-autopilot-p1', function(){ toggleAutopilot(0); });
  on('btn-autopilot-p2', function(){ toggleAutopilot(1); });
  on('btn-ai-p1', function(){ toggleAutopilot(0); });
  on('btn-ai-p2', function(){ toggleAutopilot(1); });
  on('dt-ai-p1', function(){ toggleAutopilot(0); });
  on('dt-ai-p2', function(){ toggleAutopilot(1); });
  on('btn-checkpoint', function(){
    if(aiCheckpoint()){ antonLog('checkpoint saved (slot ' + aiCheckpointSlot + ')'); }
    else antonLog('checkpoint unavailable');
    updateTelemetry();
  });
  on('btn-autotune', toggleAutotune);
  on('btn-ocr', toggleOcr);
  on('btn-hud', toggleHud);
  on('btn-tune-reset', resetAgentOpts);
  on('btn-anton-analyze', runAntonScan);
  on('btn-manual-load', loadManualForCurrentGame);
  on('btn-record', toggleRecording);
  function sysFromPrefix(prefix){
    if(prefix === 'opt1') return SysOpts.sys1;
    if(prefix === 'opt2') return SysOpts.sys2;
    return null;
  }
  function applyProfileToSys(sys, name){
    var valid = ['generic', 'umk3', 'racer', 'shooter', 'rpg'];
    sys.profile = (valid.indexOf(name) !== -1) ? name : 'generic';
    var table = profileTable();
    var p = table[sys.profile] || table.generic;
    sys.seekCycle = p.seekCycle;
    sys.hopEvery = p.hopEvery;
    sys.tapMs = p.tapMs;
  }
  document.addEventListener('change', function(e){
    var t = e.target;
    if(!t || !t.id || t.id.indexOf('opt') !== 0) return;
    /* per-system inputs: opt1-* (System 1) and opt2-* (System 2) */
    var m = t.id.match(/^(opt1|opt2)-(.+)$/);
    if(m){
      var sys = sysFromPrefix(m[1]), key = m[2];
      if(!sys) return;
      if(key === 'seekCycle'){
        sys.seekCycle = String(t.value || SysDefaults.seekCycle).slice(0, 31);
        saveSysOpts(); renderTuneInputs();
        return; /* pilots re-parse the cycle live; no restart needed */
      }
      if(key === 'profile'){
        applyProfileToSys(sys, t.value);
        saveSysOpts(); renderTuneInputs(); updateAgentHud();
        return; /* drive loop reads pt.sys.profile every tick */
      }
      if(key === 'autoTune'){
        sys.autoTune = (t.value === 'on');
        saveSysOpts(); renderTuneInputs();
        return;
      }
      var spec = null;
      TuneFields.forEach(function(f){ if(f[0] === key) spec = f; });
      if(!spec) return;
      var v = parseFloat(t.value);
      if(isNaN(v)) v = SysDefaults[key];
      sys[key] = Math.min(spec[2], Math.max(spec[1], v));
      saveSysOpts(); renderTuneInputs();
      return; /* per-pilot gating picks up new tempo live */
    }
    if(t.id.indexOf('opt-') !== 0) return;
    var skey = t.id.slice(4);
    var sspec = null;
    SharedFields.forEach(function(f){ if(f[0] === skey) sspec = f; });
    if(!sspec) return;
    var sv = parseFloat(t.value);
    if(isNaN(sv)) sv = AgentDefaults[skey];
    AgentOpts[skey] = Math.min(sspec[2], Math.max(sspec[1], sv));
    saveAgentOpts(); renderTuneInputs();
  });
  on('btn-sound', toggleSound);
  on('dt-btn-sound', toggleSound);
  on('btn-crt', toggleCrt);
  on('dt-btn-crt', toggleCrt);

  /* ---------- go ---------- */
  placeStage();
  updateAgentHud();
  openDB().then(function(db){
    DB = db;
    return idbAll();
  }).then(function(entries){
    if(DB && !entries.length){
      return fetch(BUNDLED.url).then(function(r){
        if(!r.ok) throw new Error('rom fetch failed');
        return r.blob();
      }).then(function(blob){
        return idbPut({ name: BUNDLED.name, blob: blob, builtin: true });
      });
    }
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
