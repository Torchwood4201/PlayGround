(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  const container = $('#virus-container');
  const trailLayer = $('#cursor-trail');

  const MAX_ELEMENTS = 900;
  const MULTIPLIER = 12;
  const MAX_WINDOWS = 42;

  const VIRUS_WORDS = [
    'ACCESS_DENIED_3.14x8',
    'SYSTEM_FAILURE',
    'MEMORY_CORRUPTED',
    'UPLOADING...',
    'NEXUS_ABYSS',
    'YOU_ARE_NOT_SAFE',
    'KERNEL_PANIC',
    '0x3.14x8',
    'FILES_LOCKED',
    'STACK_OVERFLOW',
    'SECURE_PORTAL_BREACH',
    '1000X_WORSE',
    'DELETE_EVERYTHING',
    '/dev/null',
    'TRUST_NO_ONE',
    'HELLO_WORLD',
    'SEGFAULT',
    'PANIC_MODE'
  ];

  const CMD_LINES = [
    'Injecting payload into {file}',
    'ERROR 0x3.14x8: ACCESS_DENIED',
    'Encrypting {file}... OK',
    'Connecting to NEXUS_ABYSS... {hex}',
    'WARNING: kernel integrity at 0.314%',
    'Deleting shadow copies... SUCCESS',
    'ERROR: cannot locate user soul',
    'Uploading {file} to /dev/null',
    'Pinging abyss.nexus ... reply from {hex}',
    'FAIL: containment breach imminent',
    'Unzipping this-is-not-safe.zip',
    'Running 1000x_worse.exe --force',
    'Recursive loop initiated: {hex}',
    'system32/drivers/abyss.sys loaded',
    'WARN: popup storm overflow',
    'ERROR: panic button is too far away',
    'Overwriting {file} with {file}',
    'NEXUS_ABYSS.exe has taken over the cursor'
  ];

  const DIALOG_MESSAGES = [
    'CRITICAL_PROCESS_DIED. Would you like to continue? This choice does nothing.',
    'NEXUS_ABYSS.exe is not responding. It never was.',
    'Your files are fine. Your dignity is not.',
    'Error 0x3.14x8: Too many popups. Not enough regret.',
    'The abyss looked back. It clicked Cancel.',
    'Security notice: you clicked the button.',
    'This dialog cannot be closed. Except with the OK button.',
    '1000x worse mode engaged. There is no undo.',
    'Your computer is 0.314% safe.',
    'Would you like to install more chaos? Yes / Yes.'
  ];

  const FAKE_FILES = [
    'document_final_final_v3.docx',
    'family_photo_2007.jpg',
    'definitely_not_passwords.txt',
    'taxes_FINAL_REAL.pdf',
    'homework_done.zip',
    'screenshot_2026-10-25.png',
    'My_Mixtape.mp3',
    'browser_history_backup.sqlite',
    'secret_sauce_recipe.txt',
    'resume_updated_again.pdf',
    'cat_videos/',
    'this-is-not-safe.zip',
    'important_stuff_backup.rar',
    'notes_for_the_abyss.md'
  ];

  const TOASTS = [
    'Integrity down to 0.314%.',
    'New popup blocked. Spawning three more.',
    'NEXUS_ABYSS.exe would like to access your soul.',
    'Your cursor is now evidence.',
    '1000x worse mode is running.',
    'Please do not turn off your computer. It will not help.',
    'Error log full. Deleting error log.',
    'One of these windows is real. It is not.',
    'Simulation timer exceeded expectations.',
    'The abyss has subscribed to your newsletter.'
  ];

  const app = {
    started: false,
    isActive: false,
    ended: false,
    startTime: 0,
    stage: 0,
    elements: [],
    windows: [],
    timers: new Set(),
    intervals: new Set(),
    counters: { spawns: 0, windows: 0, popups: 0, toasts: 0 },
    audio: null,
    muted: false,
    popup: null,
    virusRaf: 0,
    matrixRaf: 0,
    matrixStarted: false,
    chaosStarted: false,
    virusSpawnerStarted: false,
    virusSpawner: null,
    virusFrame: 0,
    lastTrail: 0,
    panicTimer: null,
    bannerTimer: null,
    spawnTimer: null,
    ransomTimer: null,
    bsodActive: false,
    mouseHandler: null,
    resizeHandler: null
  };

  function later(fn, ms) {
    const id = setTimeout(() => {
      app.timers.delete(id);
      fn();
    }, ms);
    app.timers.add(id);
    return id;
  }

  function every(fn, ms) {
    const id = setInterval(fn, ms);
    app.intervals.add(id);
    return id;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        app.timers.delete(id);
        resolve();
      }, ms);
      app.timers.add(id);
    });
  }

  function randomHex() {
    return Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, '0');
  }

  function initAudio() {
    if (app.audio) return;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    try {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = app.muted ? 0 : 0.18;
      master.connect(ctx.destination);
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.045;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 240;
      droneGain.connect(filter);
      filter.connect(master);
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      o1.type = 'sawtooth';
      o2.type = 'sawtooth';
      o1.frequency.value = 46;
      o2.frequency.value = 47.7;
      o1.connect(droneGain);
      o2.connect(droneGain);
      o1.start();
      o2.start();
      app.audio = { ctx, master, droneGain, filter, o1, o2 };
      ctx.resume().catch(() => {});
    } catch (error) {
      app.audio = null;
    }
  }

  function beep(freq = 880, duration = 0.08, type = 'square', volume = 0.04) {
    if (!app.audio || app.muted || app.ended) return;
    const { ctx, master } = app.audio;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  function noiseBurst(duration = 0.14, volume = 0.035) {
    if (!app.audio || app.muted || app.ended) return;
    const { ctx, master } = app.audio;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 1200;
    band.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(band);
    band.connect(gain);
    gain.connect(master);
    source.start();
  }

  function alarm() {
    if (!app.audio || app.muted || app.ended) return;
    const { ctx, master } = app.audio;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(1180, now + 0.35);
    osc.frequency.linearRampToValueAtTime(520, now + 0.7);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.78);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.82);
  }

  function toggleSound() {
    app.muted = !app.muted;
    if (app.audio) {
      const now = app.audio.ctx.currentTime;
      app.audio.master.gain.cancelScheduledValues(now);
      app.audio.master.gain.setTargetAtTime(app.muted ? 0 : 0.18, now, 0.04);
    }
    const button = $('#mute-btn');
    button.textContent = app.muted ? 'SOUND: OFF' : 'SOUND: ON';
    button.classList.toggle('off', app.muted);
    if (!app.muted) beep(660, 0.06);
  }

  function banner(text, hold = 2800) {
    const element = $('#stage-banner');
    if (!element) return;
    element.textContent = text;
    element.classList.add('show');
    if (app.bannerTimer) clearTimeout(app.bannerTimer);
    app.bannerTimer = setTimeout(() => element.classList.remove('show'), hold);
  }

  function spawnToast() {
    if (!app.isActive || app.ended) return;
    const element = document.createElement('div');
    element.className = 'fake-toast';
    element.style.top = Math.max(48, rand(48, Math.max(48, window.innerHeight - 160))) + 'px';
    element.innerHTML = '<strong>' + pick(['SYSTEM ALERT', 'NEXUS ABYSS', 'MEMORY ERROR', 'SECURE_PORTAL', 'WARNING']) + '</strong><span>' + pick(TOASTS) + '</span>';
    document.body.appendChild(element);
    app.counters.toasts++;
    later(() => element.remove(), 4600);
    beep(rand(700, 1100), 0.04, 'square', 0.02);
  }

  function openVideoPopup() {
    let popup = null;
    try {
      popup = window.open('', 'nexusAbyssFeed', 'width=640,height=420,top=80,left=80');
    } catch (error) {
      popup = null;
    }
    if (!popup) {
      spawnVideoWindow();
      return;
    }
    app.popup = popup;
    app.counters.popups++;
    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>NEXUS_ABYSS.exe</title><style>' +
      'html,body{margin:0;height:100%;background:#000;overflow:hidden;font-family:monospace}' +
      'iframe{position:absolute;inset:0;width:100%;height:100%;border:0;filter:contrast(1.2) saturate(1.5)}' +
      '.tag{position:fixed;left:0;right:0;bottom:0;padding:10px;background:linear-gradient(transparent,rgba(0,0,0,.95));color:#00ff41;text-align:center;font-size:11px;letter-spacing:.25em;pointer-events:none;animation:pulse 1.4s ease-in-out infinite}' +
      '@keyframes pulse{50%{opacity:.35}}' +
      '</style></head><body><iframe src="https://player.vimeo.com/video/676247342?autoplay=1&muted=0" allow="autoplay; fullscreen" allowfullscreen></iframe><div class="tag">NEXUS ABYSS // DO NOT CLOSE</div></body></html>';
    try {
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
    } catch (error) {
      try {
        popup.close();
      } catch (closeError) {
        app.popup = null;
      }
      spawnVideoWindow();
    }
  }

  function removeWindow(element) {
    if (!element) return;
    if (element._timer) {
      clearInterval(element._timer);
      app.intervals.delete(element._timer);
      element._timer = null;
    }
    element.remove();
    app.windows = app.windows.filter((windowElement) => windowElement !== element);
  }

  function trimWindows() {
    while (app.windows.length > MAX_WINDOWS) {
      removeWindow(app.windows[0]);
    }
  }

  function spawnWindow(title, bodyHTML, options = {}) {
    if (!app.isActive || app.ended) return null;
    const width = Math.max(220, Math.min(options.width || 380, window.innerWidth - 20));
    const height = options.height || 0;
    const element = document.createElement('div');
    element.className = 'scam-window' + (Math.random() < 0.18 ? ' wobble' : '');
    element.style.width = width + 'px';
    if (height) element.style.height = height + 'px';
    element.style.left = Math.max(8, rand(8, Math.max(8, window.innerWidth - width - 8))) + 'px';
    element.style.top = Math.max(8, rand(8, Math.max(8, window.innerHeight - (height || 180) - 8))) + 'px';
    element.innerHTML = '<div class="scam-title"><span>' + title + '</span><button type="button" class="scam-x" aria-label="Close">X</button></div><div class="scam-body">' + bodyHTML + '</div>';
    document.body.appendChild(element);
    app.windows.push(element);
    app.counters.windows++;
    const close = $('.scam-x', element);
    if (close) {
      close.addEventListener('click', () => {
        removeWindow(element);
        if (Math.random() > 0.62 && app.windows.length < 20) spawnDialog('CLOSE_DENIED');
      });
    }
    trimWindows();
    return element;
  }

  function spawnCmd() {
    const element = spawnWindow('cmd.exe - NEXUS_ABYSS', '<div class="cmd-log"></div><div class="cmd-cursor">C:\\Windows\\system32&gt; <span class="caret">_</span></div>', { width: 440, height: 190 });
    if (!element) return;
    const log = $('.cmd-log', element);
    const add = () => {
      if (!element.isConnected) return;
      const line = document.createElement('div');
      const text = pick(CMD_LINES).replace('{file}', pick(FAKE_FILES)).replace('{hex}', randomHex());
      const isError = text.includes('ERROR') || text.includes('FAIL') || text.includes('DENIED') || text.includes('WARN');
      line.className = 'cmd-line' + (isError ? ' err' : '');
      line.textContent = '> ' + text;
      log.appendChild(line);
      if (log.childElementCount > 9) log.firstElementChild.remove();
      if (Math.random() > 0.72) beep(rand(240, 1500), 0.022, 'square', 0.01);
    };
    for (let i = 0; i < 4; i++) add();
    element._timer = every(add, 420);
  }

  function spawnProgress() {
    const element = spawnWindow('shredder.exe', '<div class="scam-file">' + pick(FAKE_FILES) + '</div><div class="progress-bar"><div class="progress-fill"></div></div><div class="scam-pct">0%</div>', { width: 330, height: 120 });
    if (!element) return;
    const fill = $('.progress-fill', element);
    const percent = $('.scam-pct', element);
    const file = $('.scam-file', element);
    let value = 0;
    element._timer = every(() => {
      if (!element.isConnected) return;
      value = Math.min(100, value + Math.floor(rand(2, 13)));
      fill.style.width = value + '%';
      percent.textContent = value + '%';
      if (value >= 100) {
        value = 0;
        file.textContent = pick(FAKE_FILES);
        fill.style.width = '0%';
        percent.textContent = '0%';
      }
    }, 240);
  }

  function spawnDialog(kind) {
    const message = kind === 'CLOSE_DENIED' ? 'You cannot close the abyss. It closes you.' : pick(DIALOG_MESSAGES);
    const element = spawnWindow('system32.exe', '<p class="dialog-text">' + message + '</p><div class="dialog-actions"><button type="button" class="scam-btn ok">OK</button><button type="button" class="scam-btn cancel">CANCEL</button></div>', { width: 380, height: 155 });
    if (!element) return;
    const ok = $('.ok', element);
    const cancel = $('.cancel', element);
    ok.addEventListener('click', () => {
      beep(1200, 0.05, 'square', 0.03);
      removeWindow(element);
    });
    cancel.addEventListener('click', () => {
      removeWindow(element);
      if (app.windows.length < 18) {
        spawnDialog();
        spawnDialog();
      }
    });
  }

  function spawnEncryptWindow() {
    const element = spawnWindow('encryptor.exe', '<div class="cmd-line err">AES-3.14x8 KEY ACCEPTED</div><div class="cmd-line">ENCRYPTING ' + pick(FAKE_FILES) + '</div><div class="progress-bar"><div class="progress-fill" style="width:' + Math.floor(rand(20, 95)) + '%"></div></div>', { width: 360, height: 150 });
    if (element) beep(rand(90, 190), 0.08, 'sawtooth', 0.018);
  }

  function spawnVideoWindow() {
    const element = spawnWindow('NEXUS_ABYSS.exe // LIVE FEED', '<div class="video-wrap"><div class="video-noise"></div><div class="video-lockup">SIGNAL CORRUPTED</div><div class="video-tag">POPUP BLOCKED // FEED UNAVAILABLE</div></div>', { width: 480, height: 250 });
    if (element) app.counters.popups++;
  }

  function stopVirusCascade() {
    if (app.virusRaf) {
      cancelAnimationFrame(app.virusRaf);
      app.virusRaf = 0;
    }
    if (app.virusSpawner) {
      clearInterval(app.virusSpawner);
      app.intervals.delete(app.virusSpawner);
      app.virusSpawner = null;
    }
    container.innerHTML = '';
    app.elements = [];
  }

  function clearWindows() {
    $$('.scam-window').forEach(removeWindow);
    $$('.fake-toast').forEach((element) => element.remove());
  }

  function startMatrix() {
    if (app.matrixStarted) return;
    const canvas = $('#matrix');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    app.matrixStarted = true;
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノACCESSDENIEDNEXUSABYSS3148';
    const fontSize = 16;
    let columns = 0;
    let drops = [];
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      columns = Math.ceil(window.innerWidth / fontSize);
      drops = Array.from({ length: columns }, () => rand(-window.innerHeight, 0));
    };
    resize();
    app.resizeHandler = resize;
    window.addEventListener('resize', resize);
    let last = 0;
    const draw = (time) => {
      if (!app.isActive || app.ended) return;
      app.matrixRaf = requestAnimationFrame(draw);
      if (time - last < 34) return;
      last = time;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < columns; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        const x = i * fontSize;
        const y = drops[i];
        ctx.fillStyle = Math.random() > 0.86 ? '#ff2a2a' : '#00ff41';
        ctx.fillText(text, x, y);
        if (y > window.innerHeight && Math.random() > 0.976) drops[i] = rand(-220, 0);
        drops[i] += fontSize;
      }
    };
    app.matrixRaf = requestAnimationFrame(draw);
  }

  function startCursorTrail() {
    if (app.mouseHandler) return;
    app.mouseHandler = (event) => {
      if (!app.isActive || app.ended) return;
      const now = performance.now();
      if (now - app.lastTrail < 55) return;
      app.lastTrail = now;
      const element = document.createElement('div');
      element.className = 'trail';
      element.textContent = pick(['ERR', '0x3.14x8', 'LOCKED', '404', 'SEGFAULT', 'NOPE', '!!!']);
      element.style.left = event.clientX + 'px';
      element.style.top = event.clientY + 'px';
      element.style.color = Math.random() > 0.5 ? '#00ff41' : '#ff2a2a';
      trailLayer.appendChild(element);
      later(() => element.remove(), 900);
    };
    document.addEventListener('pointermove', app.mouseHandler, { passive: true });
  }

  function spawnVirus(x = -220, y = null) {
    if (!app.isActive || app.ended || app.elements.length >= MAX_ELEMENTS) return;
    const element = document.createElement('div');
    element.className = 'virus-text' + (Math.random() < 0.12 ? ' v-big' : '') + (Math.random() < 0.3 ? ' v-dim' : '');
    element.textContent = pick(VIRUS_WORDS);
    element.style.color = Math.random() > 0.5 ? '#00ff41' : '#ff2a2a';
    const item = {
      dom: element,
      x,
      y: y === null ? rand(0, window.innerHeight) : y,
      speed: rand(7, 24),
      wobble: rand(0, Math.PI * 2),
      wobbleSpeed: rand(0.01, 0.07),
      rotation: rand(-8, 8)
    };
    container.appendChild(element);
    app.elements.push(item);
    app.counters.spawns++;
  }

  function virusBurst(count) {
    for (let i = 0; i < count; i++) {
      spawnVirus(rand(-240, window.innerWidth * 0.72), rand(0, window.innerHeight));
    }
  }

  function virusTick() {
    if (!app.isActive || app.ended) return;
    app.virusRaf = requestAnimationFrame(virusTick);
    app.virusFrame += 1;
    if (app.virusFrame % 2) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pending = [];
    for (let i = app.elements.length - 1; i >= 0; i--) {
      const item = app.elements[i];
      item.x += item.speed;
      item.wobble += item.wobbleSpeed;
      if (item.x > width + 120) {
        if (app.elements.length + pending.length < MAX_ELEMENTS) {
          for (let j = 0; j < MULTIPLIER; j++) pending.push(rand(0, height));
        }
        item.x = -240;
        item.y = rand(0, height);
      }
      if (Math.random() < 0.0003) {
        item.dom.textContent = pick(VIRUS_WORDS);
        item.dom.style.color = Math.random() > 0.5 ? '#00ff41' : '#ff2a2a';
      }
      const y = item.y + Math.sin(item.wobble) * 9;
      item.dom.style.transform = 'translate3d(' + item.x + 'px, ' + y + 'px, 0) rotate(' + item.rotation + 'deg)';
    }
    for (const y of pending) spawnVirus(-240, y);
    if (app.elements.length > 240 && !app.chaosStarted) {
      app.chaosStarted = true;
      startChaos();
    }
  }

  function startHud() {
    const files = $('#hud-files');
    const integrity = $('#hud-integrity');
    const stage = $('#hud-stage');
    let count = 0;
    every(() => {
      count += Math.floor(rand(400, 4200));
      const elapsed = (performance.now() - app.startTime) / 1000;
      const value = Math.max(0.314, 100 - elapsed * 3.14).toFixed(3);
      files.textContent = 'FILES ENCRYPTED: ' + count.toLocaleString();
      integrity.textContent = 'INTEGRITY: ' + value + '%';
      stage.textContent = 'STAGE ' + app.stage + '/5';
      if (Math.random() > 0.82) beep(rand(180, 900), 0.02, 'square', 0.008);
    }, 650);
  }

  function showBsodOnce() {
    const overlay = $('#takeover-overlay');
    const percent = $('#bsod-percent');
    if (!overlay || !percent) return;
    let value = 0;
    percent.textContent = '0';
    overlay.classList.add('active');
    alarm();
    noiseBurst(0.2, 0.04);
    const timer = every(() => {
      value = Math.min(100, value + Math.floor(rand(2, 13)));
      percent.textContent = String(value);
      if (value >= 100) {
        clearInterval(timer);
        app.intervals.delete(timer);
      }
    }, 130);
    later(() => overlay.classList.remove('active'), 3600);
  }

  function startBsodLoop() {
    app.bsodActive = true;
    const loop = () => {
      if (!app.isActive || app.ended || !app.bsodActive) return;
      showBsodOnce();
      later(loop, rand(4800, 7000));
    };
    loop();
  }

  function stopAmbient() {
    app.bsodActive = false;
    if (app.matrixRaf) {
      cancelAnimationFrame(app.matrixRaf);
      app.matrixRaf = 0;
    }
    if (app.mouseHandler) {
      document.removeEventListener('pointermove', app.mouseHandler);
      app.mouseHandler = null;
    }
  }

  function showRansom() {
    const overlay = $('#ransom-overlay');
    if (!overlay) return;
    overlay.classList.add('show');
    const clock = $('#ransom-clock');
    const fill = $('#ransom-progress-fill');
    const file = $('#ransom-file');
    let remain = 300;
    const update = () => {
      if (!app.isActive || app.ended) return;
      remain = Math.max(0, remain - 1);
      const minutes = String(Math.floor(remain / 60)).padStart(2, '0');
      const seconds = String(remain % 60).padStart(2, '0');
      clock.textContent = minutes + ':' + seconds;
      fill.style.width = ((300 - remain) / 300 * 100) + '%';
      if (Math.random() > 0.5) file.textContent = pick(FAKE_FILES);
      if (remain === 0) clock.textContent = '00:00';
    };
    update();
    app.ransomTimer = every(update, 1000);
    const ticker = $('#ransom-ticker');
    if (ticker) {
      every(() => {
        if (!app.isActive || app.ended) return;
        const line = pick(CMD_LINES)
          .replace('{file}', pick(FAKE_FILES))
          .replace('{hex}', randomHex());
        ticker.textContent = 'AES-3.14x8 // ' + line;
      }, 800);
    }
  }

  function showAbyss() {
    const overlay = $('#abyss-overlay');
    const text = $('.abyss-glitch-text', overlay);
    if (!overlay || !text) return;
    const label = 'NEXUS ABYSS // ' + randomHex();
    text.textContent = label;
    text.setAttribute('data-text', label);
    overlay.classList.add('show');
    alarm();
    noiseBurst(0.24, 0.05);
    later(() => overlay.classList.remove('show'), 5200);
  }

  function startChaos() {
    banner('MEMORY CORRUPTION DETECTED', 2200);
    document.body.classList.add('glitching');
    startMatrix();
    startCursorTrail();
    spawnCmd();
    spawnProgress();
    spawnDialog();
    spawnToast();
    virusBurst(60);
    if (!app.spawnTimer) {
      app.spawnTimer = every(() => {
        if (!app.isActive || app.ended) return;
        const roll = Math.random();
        if (roll < 0.38) spawnCmd();
        else if (roll < 0.66) spawnProgress();
        else if (roll < 0.84) spawnDialog();
        else spawnEncryptWindow();
        if (Math.random() > 0.6) spawnToast();
      }, 1200);
    }
    if (!app.virusSpawnerStarted) {
      app.virusSpawnerStarted = true;
      app.virusSpawner = every(() => {
        if (!app.isActive || app.ended) return;
        for (let i = 0; i < 2; i++) {
          spawnVirus(rand(-240, window.innerWidth * 0.7), rand(0, window.innerHeight));
        }
      }, 360);
    }
    beep(440, 0.1, 'square', 0.03);
  }

  async function runStages() {
    await wait(1400);
    if (!app.isActive || app.ended) return;
    app.stage = 1;
    banner('STAGE 1 // SYSTEM COMPROMISED');
    spawnCmd();
    spawnProgress();
    spawnToast();
    document.body.classList.add('v-sasser-shake');
    later(() => document.body.classList.remove('v-sasser-shake'), 4200);
    alarm();
    virusBurst(40);
    await wait(5600);
    if (!app.isActive || app.ended) return;
    app.stage = 2;
    banner('STAGE 2 // MEMORY CORRUPTION');
    document.body.classList.add('glitching');
    startMatrix();
    startCursorTrail();
    if (!app.chaosStarted) {
      app.chaosStarted = true;
      startChaos();
    }
    spawnCmd();
    spawnDialog();
    spawnToast();
    virusBurst(60);
    await wait(7000);
    if (!app.isActive || app.ended) return;
    app.stage = 3;
    banner('STAGE 3 // KERNEL PANIC');
    document.body.classList.add('v-nimda-blur');
    startBsodLoop();
    spawnEncryptWindow();
    virusBurst(90);
    for (let i = 0; i < 5; i++) {
      later(() => {
        if (!app.isActive || app.ended) return;
        spawnCmd();
        spawnProgress();
        spawnDialog();
        spawnToast();
      }, i * 350);
    }
    await wait(10000);
    if (!app.isActive || app.ended) return;
    app.stage = 4;
    banner('STAGE 4 // RANSOMWARE DEPLOYED');
    showRansom();
    document.body.classList.add('deep-fried');
    stopVirusCascade();
    stopAmbient();
    if (app.spawnTimer) {
      clearInterval(app.spawnTimer);
      app.intervals.delete(app.spawnTimer);
      app.spawnTimer = null;
    }
    clearWindows();
    await wait(13000);
    if (!app.isActive || app.ended) return;
    app.stage = 5;
    banner('STAGE 5 // NEXUS ABYSS');
    showAbyss();
    document.body.classList.add('v-brain-sepia');
    await wait(8500);
    if (!app.isActive || app.ended) return;
    finish('complete');
  }

  function stopAll() {
    app.bsodActive = false;
    for (const id of app.timers) clearTimeout(id);
    app.timers.clear();
    for (const id of app.intervals) clearInterval(id);
    app.intervals.clear();
    if (app.bannerTimer) clearTimeout(app.bannerTimer);
    if (app.panicTimer) clearTimeout(app.panicTimer);
    app.bannerTimer = null;
    app.panicTimer = null;
    if (app.virusRaf) cancelAnimationFrame(app.virusRaf);
    if (app.matrixRaf) cancelAnimationFrame(app.matrixRaf);
    app.virusRaf = 0;
    app.matrixRaf = 0;
    if (app.mouseHandler) {
      document.removeEventListener('pointermove', app.mouseHandler);
      app.mouseHandler = null;
    }
    if (app.resizeHandler) {
      window.removeEventListener('resize', app.resizeHandler);
      app.resizeHandler = null;
    }
    if (app.popup && !app.popup.closed) {
      try {
        app.popup.close();
      } catch (error) {
        app.popup = null;
      }
    }
    app.popup = null;
    container.innerHTML = '';
    trailLayer.innerHTML = '';
    $$('.scam-window').forEach(removeWindow);
    $$('.fake-toast').forEach((element) => element.remove());
    $$('.trail').forEach((element) => element.remove());
    $('#takeover-overlay').classList.remove('active');
    $('#ransom-overlay').classList.remove('show');
    $('#abyss-overlay').classList.remove('show');
    $('#stage-banner').classList.remove('show');
    document.body.classList.remove('deep-fried', 'glitching', 'v-sasser-shake', 'v-nimda-blur', 'v-brain-sepia');
    if (app.audio) {
      try {
        app.audio.ctx.suspend();
      } catch (error) {
        app.audio = null;
      }
    }
  }

  function finish(reason) {
    if (app.ended) return;
    app.ended = true;
    app.isActive = false;
    const seconds = Math.max(1, Math.round((performance.now() - app.startTime) / 1000));
    stopAll();
    const kicker = $('#reveal-kicker');
    const title = $('#reveal-title');
    if (reason === 'panic') {
      kicker.textContent = 'PANIC PROTOCOL // EXIT GRANTED';
      title.textContent = 'SAFE.';
    } else {
      kicker.textContent = 'NEXUS ABYSS v4.0 // SIMULATION COMPLETE';
      title.textContent = 'GOTCHA.';
    }
    $('#reveal-stats').innerHTML =
      '<div><strong>' + seconds + 's</strong><span>survived</span></div>' +
      '<div><strong>' + app.counters.spawns.toLocaleString() + '</strong><span>corrupt strings</span></div>' +
      '<div><strong>' + app.counters.windows + '</strong><span>fake windows</span></div>' +
      '<div><strong>' + app.counters.toasts + '</strong><span>alerts</span></div>';
    $('#reveal-overlay').classList.add('show');
    document.body.classList.remove('activated');
    const panic = $('#panic-btn');
    panic.disabled = true;
    panic.textContent = 'SYSTEM SAFE';
    panic.classList.remove('holding');
  }

  function safeMode() {
    $('#reveal-overlay').classList.remove('show');
    document.body.classList.add('safe');
    document.body.classList.remove('activated');
    const heading = $('#v-main-card h2');
    const copy = $('#v-main-card p');
    const light = $('.status-light');
    if (heading) heading.textContent = 'System Secure';
    if (copy) copy.textContent = 'Nothing was installed. Nothing was encrypted. This was a prank.';
    if (light) light.style.background = '#00ff41';
    banner('SYSTEM SECURE // NO HARM DONE', 3500);
  }

  function beginPanic(event) {
    if (event) event.preventDefault();
    if (!app.isActive || app.ended) return;
    const button = $('#panic-btn');
    if (app.panicTimer) clearTimeout(app.panicTimer);
    app.panicTimer = setTimeout(() => {
      app.panicTimer = null;
      finish('panic');
    }, 1200);
    button.classList.add('holding');
    button.textContent = 'RELEASE...';
  }

  function cancelPanic() {
    if (app.ended) return;
    if (app.panicTimer) {
      clearTimeout(app.panicTimer);
      app.panicTimer = null;
    }
    const button = $('#panic-btn');
    button.classList.remove('holding');
    button.textContent = 'PANIC [HOLD]';
  }

  function startPrank() {
    if (app.started || app.isActive) return;
    app.started = true;
    app.isActive = true;
    app.startTime = performance.now();
    $('#init-trigger').style.display = 'none';
    document.body.classList.add('activated');
    initAudio();
    beep(220, 0.15, 'sawtooth', 0.03);
    openVideoPopup();
    const request = document.documentElement.requestFullscreen;
    if (request) {
      try {
        const result = request.call(document.documentElement);
        if (result && result.catch) result.catch(() => {});
      } catch (error) {
        void error;
      }
    }
    startMatrix();
    virusBurst(16);
    spawnCmd();
    spawnProgress();
    spawnDialog();
    spawnToast();
    app.virusRaf = requestAnimationFrame(virusTick);
    startHud();
    runStages();
    later(() => spawnToast(), 700);
  }

  $('#init-trigger').addEventListener('click', startPrank);
  $('#init-trigger').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      startPrank();
    }
  });
  $('#mute-btn').addEventListener('click', toggleSound);
  $('#replay-btn').addEventListener('click', () => window.location.reload());
  $('#exit-btn').addEventListener('click', safeMode);

  const panicButton = $('#panic-btn');
  panicButton.addEventListener('pointerdown', beginPanic);
  panicButton.addEventListener('pointerup', cancelPanic);
  panicButton.addEventListener('pointercancel', cancelPanic);
  panicButton.addEventListener('pointerleave', cancelPanic);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!app.isActive || app.ended) return;
    event.preventDefault();
    finish('panic');
  });
})();
