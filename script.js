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

  function releaseAuto(){
    [AgentMap.dirR, AgentMap.dirL, AgentMap.run]
      .concat(AgentMap.actions, AgentMap.shoulders, [4, 5])
      .forEach(function(i){
        for(var pl = 0; pl <= 3; pl++) driveIndex(i, false, 'sys', pl);
      });
  }

  /* ---------- screen-reactive autopilot (AI Lab): cloned copilots ----------
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
    players: [0, 1], hud: false, autoTune: true, profile: 'generic'
  };
  var AgentOpts = {};
  try{
    var rawOwn = {};
    try{ rawOwn = JSON.parse(localStorage.getItem('snesboy-agent') || '{}'); }catch(e){}
    AgentOpts = Object.assign({}, AgentDefaults, rawOwn);
    /* players defaulted to P1-only before Both existed — migrate old saves */
    if(!rawOwn || !('players' in rawOwn)) AgentOpts.players = [0, 1];
    if(!rawOwn || !('autoTune' in rawOwn)) AgentOpts.autoTune = true;
    if(!rawOwn || !('profile' in rawOwn) || (rawOwn.profile !== 'umk3' && rawOwn.profile !== 'generic')) AgentOpts.profile = 'generic';
  }catch(e){ AgentOpts = Object.assign({}, AgentDefaults, { players: [0, 1], autoTune: true, profile: 'generic' }); }
  function saveAgentOpts(){
    try{ localStorage.setItem('snesboy-agent', JSON.stringify(AgentOpts)); }catch(e){}
  }
  /* Emulator button indices the brain uses (RetroArch SNES numbering).
     Human pads keep using PADINDEX; only the agent reads this. */
  var AgentMap = { dirR: 7, dirL: 6, run: 1, actions: [8, 0], shoulders: [10, 11], select: 2, start: 3 };
  /* SEEK tap rotation, parsed from AgentOpts.seekCycle ('2,2,3,8,5,4' =
     SELECT, SELECT, START, A, DOWN, UP). Confirms plus dpad taps: many
     menus need a cursor move before the confirm. Taps only, never holds. */
  var autoCycle = [2, 2, 3, 8];
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
  /* One cloned copilot per driven player — same screen, own brain. The
     first enabled player works the menus; every pilot senses, modes and
     plays for itself with its own rhythm (phase-offset hops, own button
     order), so P2 never just parrots P1. */
  var autoMenuTimer = null, autoSenseTimer = null;
  var autoPilots = [];
  function makePilot(player, idx, menus){
    return { pl: player, menus: menus, mode: 'seek', prev: null, hi: 0, lo: 0,
      menuN: 0, hopN: idx * 2, tick: 0, shN: 0, fphase: -1,
      order: (idx % 2 === 0) ? AgentMap.actions.slice() : AgentMap.actions.slice().reverse() };
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
    setTimeout(function(){ if(autoOn) driveIndex(btn, false, 'auto', pl); }, ms || 140);
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
        if(!autoOn) return;
        fightPulse(UMK3_STRIKES[(pt.tick + idx) % UMK3_STRIKES.length], pt.pl, 140);
        setTimeout(function(){ if(autoOn){ driveIndex(4, false, 'auto', pt.pl); } }, 200);
      }, 300);
    }else{
      var mv = UMK3_MOVEBOOK[(pt.tick + idx) % UMK3_MOVEBOOK.length];
      fightTapSeq(resolveMove(mv.seq, fwd, back), pt.pl); /* real manual strings, e.g. spear/freeze */
    }
  }
  var autoDiff = 0;
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
  function autoTap(idx, pl){
    driveIndex(idx, true, 'auto', pl);
    setTimeout(function(){ driveIndex(idx, false, 'auto', pl); }, AgentOpts.tapPulseMs);
  }
  function updateAgentHud(){
    var txt = (autoOn ? pilotModes() : 'OFF') + ' · d=' + autoDiff.toFixed(1) +
      (autoOn && /play/.test(pilotModes()) ? (autoDir === AgentMap.dirL ? ' ◀' : ' ▶') + (autoDirY === 4 ? '▲' : (autoDirY === 5 ? '▼' : '')) : '') +
      (autoOn ? ' · ' + autoPlayers().map(function(p){ return 'P' + (p + 1); }).join('+') : '') +
      (autoOn && AgentOpts.autoTune ? ' · AT' : '') +
      (autoOn && AgentOpts.profile === 'umk3' ? ' · UMK3' : '');
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
    if(d > AgentOpts.hiThresh){
      pt.hi++; pt.lo = 0;
      if(pt.hi >= AgentOpts.hiStreak && pt.mode !== 'play'){ pt.mode = 'play'; updateAutoBtn(); }
    }else if(d < AgentOpts.loThresh){
      pt.lo++; pt.hi = 0;
      if(pt.lo >= AgentOpts.loStreak && pt.mode !== 'seek'){ pt.mode = 'seek'; releaseAuto(); updateAutoBtn(); }
    }else{ pt.hi = 0; pt.lo = 0; }
    return d;
  }
  function startAgentEngine(){
    parseSeekCycle();
    if(autoMenuTimer) clearInterval(autoMenuTimer);
    if(autoSenseTimer) clearInterval(autoSenseTimer);
    if(autoTimer) clearInterval(autoTimer);
    autoPilots = autoPlayers().map(function(pl, i){ return makePilot(pl, i, i === 0); });
    autoMenuTimer = setInterval(function(){
      if(!autoOn || !playing) return;
      autoPilots.forEach(function(pt){
        if(pt.mode !== 'seek' || !pt.menus) return;
        pt.menuN++;
        autoTap(autoCycle[pt.menuN % autoCycle.length], pt.pl);
      });
    }, AgentOpts.tapMs);
    autoSenseTimer = setInterval(function(){
      if(!autoOn || !playing){ autoPilots.forEach(function(pt){ pt.prev = null; }); return; }
      var g = frameGray();
      if(!g) return;
      if(grayMean(g) < AgentOpts.blackMean){
        /* black transition / fade-out: quiet — heal every pilot to SEEK */
        autoDiff = 0;
        autoPilots.forEach(function(pt){
          pt.prev = g; pt.hi = 0; pt.lo = 0;
          if(pt.mode !== 'seek') pt.mode = 'seek';
        });
        releaseAuto(); updateAutoBtn(); updateAgentHud();
        return;
      }
      var sh = null, shy = null, dMax = 0;
      autoPilots.forEach(function(pt){
        if(!pt.prev){ pt.prev = g; return; }
        if(sh === null){
          sh = colShift(pt.prev, g); /* one shared world, one steering vote per axis */
          shy = rowShift(pt.prev, g);
        }
        dMax = Math.max(dMax, sensePilot(pt, g));
      });
      if(sh !== null){
        if(sh >= 2) autoDir = AgentMap.dirR; else if(sh <= -2) autoDir = AgentMap.dirL;
        if(shy >= 2) autoDirY = 5; else if(shy <= -2) autoDirY = 4;
      }
      autoDiff = dMax;
      antonGovern(dMax);
      updateAgentHud();
    }, AgentOpts.senseMs);
    autoTimer = setInterval(function(){
      if(!autoOn) return;
      if(!playing) return;
      autoPilots.forEach(function(pt, idx){
        if(pt.mode !== 'play') return; /* menus get taps only — held buttons would fight navigation */
        if(AgentOpts.profile === 'umk3'){ fightTick(pt, idx); return; }
        pt.tick++;
        /* release the opposite direction first: if the scroll vote flipped,
           the old hold would otherwise stay latched (L+R stuck) */
        driveIndex(autoDir === AgentMap.dirL ? AgentMap.dirR : AgentMap.dirL, false, 'auto', pt.pl);
        driveIndex(autoDir, true, 'auto', pt.pl);
        driveIndex(AgentMap.run, true, 'auto', pt.pl); /* follow the scroll + run/dash */
        if(autoDirY !== null){
          /* vertical scroll voted: hold the voted direction (Up/Down),
             releasing the opposite first — same anti-stuck rule as horizontal */
          driveIndex(autoDirY === 4 ? 5 : 4, false, 'auto', pt.pl);
          driveIndex(autoDirY, true, 'auto', pt.pl);
        }else{
          driveIndex(4, false, 'auto', pt.pl);
          driveIndex(5, false, 'auto', pt.pl);
          if(pt.tick % 8 === 7){
            /* no vertical scroll: exploratory nudge, alternating DOWN/UP
               (ladders, doors, ducking, swimming) */
            var vn = ((pt.tick >> 3) % 2 === 0) ? 5 : 4;
            driveIndex(vn, true, 'auto', pt.pl);
            (function(v, pl){
              setTimeout(function(){ if(autoOn) driveIndex(v, false, 'auto', pl); }, AgentOpts.hopPulseMs);
            })(vn, pt.pl);
          }
        }
        if((pt.tick + idx) % AgentOpts.hopEvery === 0){
          /* own rhythm per pilot: phase-offset hops, own button order */
          pt.hopN++;
          var btn = pt.order[pt.hopN % pt.order.length]; /* jump in one game is attack in another */
          driveIndex(btn, true, 'auto', pt.pl);
          (function(b, pl){
            setTimeout(function(){ if(autoOn) driveIndex(b, false, 'auto', pl); }, AgentOpts.hopPulseMs);
          })(btn, pt.pl);
          if(pt.hopN % 4 === 3){
            /* every 4th beat works a shoulder too — dash/strafe/special, per game */
            pt.shN++;
            var sh = AgentMap.shoulders[pt.shN % AgentMap.shoulders.length];
            driveIndex(sh, true, 'auto', pt.pl);
            (function(s, pl){
              setTimeout(function(){ if(autoOn) driveIndex(s, false, 'auto', pl); }, AgentOpts.hopPulseMs);
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
  var antonHist = [], antonLastModes = '', antonCool = 0;
  var antonSeekStuck = 0, antonPlayStall = 0;
  function antonSay(msg){
    var e = document.getElementById('anton-live');
    if(e) e.textContent = 'SON OF ANTON · ' + msg;
  }
  function antonGovern(dMax){
    if(!AgentOpts.autoTune || !autoOn || !playing) return;
    var modes = pilotModes();
    if(modes !== antonLastModes){ antonHist.push(1); antonLastModes = modes; }
    else antonHist.push(0);
    if(antonHist.length > 8) antonHist.shift();
    if(antonCool > 0){ antonCool--; return; }
    var flips = 0, i;
    for(i = 0; i < antonHist.length; i++) flips += antonHist[i];
    if(flips >= 3 && antonHist.length >= 6){
      AgentOpts.hiThresh = Math.min(40, Math.round((AgentOpts.hiThresh + 1) * 2) / 2);
      AgentOpts.loThresh = Math.max(0.5, Math.round((AgentOpts.loThresh - 0.5) * 2) / 2);
      antonHist = []; antonCool = 4;
      saveAgentOpts(); renderTuneInputs();
      antonSay('flapping — widened deadband (motion>' + AgentOpts.hiThresh + ' still<' + AgentOpts.loThresh + ')');
      return;
    }
    if(!/play/i.test(modes)){
      antonSeekStuck++; antonPlayStall = 0;
      if(antonSeekStuck >= 12){
        AgentOpts.hiThresh = Math.max(3, Math.round((AgentOpts.hiThresh - 1) * 2) / 2);
        antonSeekStuck = 0; antonCool = 4;
        saveAgentOpts(); renderTuneInputs();
        antonSay('stuck in menus — lowered motion bar to ' + AgentOpts.hiThresh);
      }
      return;
    }
    antonSeekStuck = 0;
    if(dMax < AgentOpts.hiThresh){
      antonPlayStall++;
      if(antonPlayStall >= 8){
        AgentOpts.hopEvery = Math.max(1, AgentOpts.hopEvery - 1);
        antonPlayStall = 0; antonCool = 4;
        saveAgentOpts(); renderTuneInputs();
        antonSay('pushing, no progress — hopping every ' + AgentOpts.hopEvery + ' beats');
      }
    }else antonPlayStall = 0;
  }
  function toggleAutotune(){
    AgentOpts.autoTune = !AgentOpts.autoTune;
    saveAgentOpts(); renderTuneInputs();
    antonSay(AgentOpts.autoTune ? 'watching the copilot…' : 'off — manual tuning only');
  }
  function startAutopilot(){
    if(autoTimer || autoMenuTimer || autoSenseTimer) return;
    autoOn = true;
    autoDiff = 0;
    antonHist = []; antonLastModes = ''; antonCool = 0;
    antonSeekStuck = 0; antonPlayStall = 0;
    if(AgentOpts.autoTune) antonSay('watching the copilot…');
    if(!playing) powerOn();
    startAgentEngine();
    updateAutoBtn(); updateAgentHud();
  }
  function stopAutopilot(){
    autoOn = false;
    if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
    if(autoMenuTimer){ clearInterval(autoMenuTimer); autoMenuTimer = null; }
    if(autoSenseTimer){ clearInterval(autoSenseTimer); autoSenseTimer = null; }
    autoPilots = [];
    releaseAuto();
    updateAutoBtn(); updateAgentHud();
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
    if(pf) pf.value = (AgentOpts.profile === 'umk3') ? 'umk3' : 'generic';
    var map = document.getElementById('agent-map-readout');
    if(map) map.textContent = 'map: dirR=' + AgentMap.dirR + ' dirL=' + AgentMap.dirL +
      ' run=' + AgentMap.run + ' actions=[' + AgentMap.actions.join(',') +
      '] shoulders=[' + AgentMap.shoulders.join(',') +
      '] select=' + AgentMap.select + ' start=' + AgentMap.start;
  }
  function resetAgentOpts(){
    AgentOpts = Object.assign({}, AgentDefaults);
    saveAgentOpts(); renderTuneInputs();
    if(autoOn){ startAgentEngine(); }
    updateAgentHud();
  }

  /* ---------- Son of Anton: report-only code health (never modifies files) ---------- */
  var ANTON_SOURCES = ['index.html', 'style.css', 'script.js', 'ai/son-of-anton.js'];
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
      rows.forEach(function(r){
        var item = document.createElement('div'); item.className = 'rom-list-item';
        var nm = document.createElement('div'); nm.className = 'rom-name';
        nm.textContent = r.name + ' — ' + r.score.toFixed(2) + ' ' + r.verdict +
          ' (' + r.lines + ' lines, ' + r.commentLines + ' comments, ' + r.logStatements + ' logs)';
        item.appendChild(nm); box.appendChild(item);
      });
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
  var autoDir = 7;
  var autoDirY = null; /* vertical scroll vote: 4=Up, 5=Down, null=no vertical hold */
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
          driveIndex(ev.b, ev.d === 1, 'replay');
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
  on('btn-ai', function(){ renderEpisodes(); renderTuneInputs(); updateAgentHud(); openModal('ai-modal'); });
  on('dt-btn-ai', function(){ renderEpisodes(); renderTuneInputs(); updateAgentHud(); openModal('ai-modal'); });
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
    if(key === 'seekCycle'){
      AgentOpts.seekCycle = String(t.value || AgentDefaults.seekCycle).slice(0, 31);
      saveAgentOpts(); renderTuneInputs();
      if(autoOn) startAgentEngine();
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
      AgentOpts.profile = (t.value === 'umk3') ? 'umk3' : 'generic';
      saveAgentOpts(); renderTuneInputs(); updateAgentHud();
      return; /* drive loop reads the profile every tick — no restart needed */
    }
    var spec = null;
    TuneFields.forEach(function(f){ if(f[0] === key) spec = f; });
    if(!spec) return;
    var v = parseFloat(t.value);
    if(isNaN(v)) v = AgentDefaults[key];
    AgentOpts[key] = Math.min(spec[2], Math.max(spec[1], v));
    saveAgentOpts(); renderTuneInputs();
    if(autoOn) startAgentEngine(); /* intervals restart with new timing; game untouched */
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
