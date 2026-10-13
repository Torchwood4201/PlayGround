// PlayGround 2026: three.js FPS — 12 levels, 5 GLB guns, sprite enemies. Zero CDN (vendored).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LEVELS } from './levels.js';

const cv = document.getElementById('game');
const el = id => document.getElementById(id);
const pick = a => a[(Math.random() * a.length) | 0];

// ---------- renderer / scene ----------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
} catch (e) {
  el('overlay').innerHTML = '<h1>NO WEBGL</h1><p>This browser cannot do 2026 3D.</p>';
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
function fitRenderer() {
  const w = cv.clientWidth || 960, h = cv.clientHeight || 540;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', fitRenderer);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050507);
scene.fog = new THREE.FogExp2(0x060608, 0.045);
const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.05, 60);
camera.rotation.order = 'YXZ';
scene.add(camera);
scene.add(new THREE.HemisphereLight(0x9aa0c0, 0x3a2a18, 1.05));
const sun = new THREE.DirectionalLight(0xfff0dd, 0.5);
sun.position.set(3, 8, 2);
scene.add(sun);
const muzzleLight = new THREE.PointLight(0xffaa33, 0, 9, 1.8);
scene.add(muzzleLight);

// ---------- state ----------
const player = { x: 1.5, y: 1.5, dir: 0, pitch: 0, hp: 100, ammo: 50, cd: 0, muzzle: 0 };
let levelIdx = 0, kills = 0, t = 0, demo = true, paused = false;
let deadT = 0, lightT = 0, stepAcc = 0, stepIdx = 0, sayMsg = '', sayUntil = 0;
let MAP = [], MW = 0, MH = 0, exitPos = null;
let foes = [], items = [], shots = [], parts = [];
let cur = 0;
const say = m => { sayMsg = m; sayUntil = t + 2.5; };
const wallAt = (x, y) => {
  const ix = Math.floor(x), iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= MW || iy >= MH) return '#';
  return MAP[iy][ix];
};
const isWall = c => '#MCWRL'.includes(c);

// ---------- audio (synth + vendored kit samples) ----------
let AC = null;
const ac = () => { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } return AC; };
function blip(freq, dur, type, vol) {
  if (demo) return;
  const a = ac(); if (!a) return;
  try {
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur);
  } catch {}
}
const stepBuf = [null, null], shotBuf = [null, null, null, null, null];
function loadSample(url, store, i) {
  const a = ac(); if (!a) return;
  if (store[i]) return;
  fetch(url).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
    .then(ab => a.decodeAudioData(ab)).then(b => { store[i] = b; }).catch(() => {});
}
function loadSamples() {
  loadSample('assets/sfx/stepL.ogg', stepBuf, 0);
  loadSample('assets/sfx/stepR.ogg', stepBuf, 1);
  ['shot-pistol', 'shot-pump', 'shot-rifle', 'shot-smg', 'shot-sniper'].forEach((n, i) =>
    loadSample('assets/sfx/' + n + '.wav', shotBuf, i));
}
function playBuf(b, vol) {
  if (demo) return false;
  const a = ac(); if (!a || !b) return false;
  try {
    const src = a.createBufferSource(); src.buffer = b;
    const g = a.createGain(); g.gain.value = vol;
    src.connect(g); g.connect(a.destination); src.start();
    return true;
  } catch { return false; }
}
const playStep = () => { const b = stepBuf[stepIdx++ % 2]; if (!playBuf(b, 0.45)) return; };
function playShot(i) {
  if (!playBuf(shotBuf[i], 0.8)) { blip(180, 0.12, 'square', 0.25); setTimeout(() => blip(90, 0.15, 'sawtooth', 0.2), 20); }
}

// ---------- procedural sprite art (enemies, pickups, flash) ----------
function impFrame(pose, pal) {
  pal = pal || {};
  const SKIN = pal.skin || '#b07a4e', DARK = pal.dark || '#7a4f30',
        EYE = pal.eye || '#ff0', BLOOD = pal.blood || '#c00';
  const c = document.createElement('canvas'); c.width = 48; c.height = 56;
  const g = c.getContext('2d');
  const px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  if (pose === 'dead') { px(4, 44, 40, 8, DARK); px(10, 38, 24, 7, SKIN); px(14, 34, 8, 5, BLOOD); return c; }
  const legSwing = pose === 'walk2' ? 3 : -3;
  const skin = pose === 'hurt' ? '#e8c39a' : SKIN;
  px(18, 6, 12, 12, skin);
  px(20, 9, 3, 3, EYE); px(25, 9, 3, 3, EYE);
  px(21, 14, 6, 2, '#400');
  px(14, 4, 5, 6, DARK); px(29, 4, 5, 6, DARK);
  px(17, 19, 14, 16, skin);
  px(17, 19, 14, 4, DARK);
  px(11, 20, 6, 12, skin); px(31, 20, 6, 12, skin);
  px(11, 30, 6, 4, DARK); px(31, 30, 6, 4, DARK);
  px(18, 35, 5, 12 + legSwing, DARK); px(25, 35, 5, 12 - legSwing, DARK);
  return c;
}
const IMP = { walk1: impFrame('walk1'), walk2: impFrame('walk2'), hurt: impFrame('hurt'), dead: impFrame('dead') };
const DEMONPAL = { skin: '#cfc0b0', dark: '#8f8074', eye: '#f00', blood: '#a00' };
const DEMON = { walk1: impFrame('walk1', DEMONPAL), walk2: impFrame('walk2', DEMONPAL), hurt: impFrame('hurt', DEMONPAL), dead: impFrame('dead', DEMONPAL) };
const texOf = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
// prebuilt sprite textures — assigned (never re-created) in present()
const SPRTEX = {
  imp: { walk1: texOf(IMP.walk1), walk2: texOf(IMP.walk2), hurt: texOf(IMP.hurt), dead: texOf(IMP.dead) },
  demon: { walk1: texOf(DEMON.walk1), walk2: texOf(DEMON.walk2), hurt: texOf(DEMON.hurt), dead: texOf(DEMON.dead) },
};
function itemCanvas(kind) {
  const c = document.createElement('canvas'); c.width = 28; c.height = 20;
  const g = c.getContext('2d');
  if (kind === 'med') { g.fillStyle = '#ddd'; g.fillRect(4, 4, 20, 14); g.fillStyle = '#c00'; g.fillRect(12, 6, 4, 10); g.fillRect(7, 9, 14, 4); }
  else { g.fillStyle = '#274d27'; g.fillRect(4, 6, 20, 12); g.fillStyle = '#c90'; for (let i = 0; i < 4; i++) g.fillRect(7 + i * 5, 3, 3, 6); }
  return c;
}
const ITEMIMG = { shells: itemCanvas('shells'), med: itemCanvas('med') };
function flashCanvas() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,200,1)'); grad.addColorStop(0.4, 'rgba(255,180,80,0.9)'); grad.addColorStop(1, 'rgba(255,120,20,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  return c;
}
const customTex = []; // user drops (sprites/*.png) — same loader, now as 3D billboards
for (const n of ['imp.png', 'demon.png', 'baron.png']) {
  fetch('sprites/' + n, { method: 'HEAD' }).then(r => {
    if (!r.ok) return;
    new THREE.TextureLoader().load('sprites/' + n, t => { t.colorSpace = THREE.SRGBColorSpace; customTex.push(t); });
  }).catch(() => {});
}

// ---------- weapons: 5 real GLBs + stats ----------
const WPNS = [
  { key: 'pistol', name: 'PISTOL', rate: 0.32, pellets: 1, dmg: 11, spread: 0.03, grip: [0.30, -0.28, -0.55], flash: [0.30, -0.20, -1.05] },
  { key: 'pump', name: 'PUMP SHOTGUN', rate: 0.8, pellets: 6, dmg: 12, spread: 0.10, grip: [0.32, -0.30, -0.60], flash: [0.34, -0.18, -1.25] },
  { key: 'rifle', name: 'ASSAULT RIFLE', rate: 0.16, pellets: 1, dmg: 14, spread: 0.025, grip: [0.32, -0.30, -0.60], flash: [0.34, -0.20, -1.30] },
  { key: 'smg', name: 'SMG COMPACT', rate: 0.11, pellets: 1, dmg: 8, spread: 0.04, grip: [0.30, -0.28, -0.50], flash: [0.31, -0.20, -0.95] },
  { key: 'sniper', name: 'SNIPER RIFLE', rate: 1.1, pellets: 1, dmg: 95, spread: 0.005, grip: [0.32, -0.30, -0.62], flash: [0.34, -0.19, -1.45] },
];
const owned = [true, false, false, false, false];
const GUNPICK = { 2: 1, 3: 2, 4: 3, 5: 4 }; // map tile -> WPNS index
const gunModels = [null, null, null, null, null];
const gunGroup = new THREE.Group();
camera.add(gunGroup);
const flashTex = texOf(flashCanvas());
const flashSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, blending: THREE.AdditiveBlending, depthTest: false, transparent: true }));
flashSpr.visible = false;
camera.add(flashSpr);

// ---------- level geometry ----------
const texLoader = new THREE.TextureLoader();
function kitTex(name, rx, ry, tint) {
  const t = texLoader.load('assets/tex/' + name + '.png');
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const WALLTEX = { '#': 'brick', M: 'metal', C: 'concrete', W: 'wood', R: 'rock', L: 'plaster' };
const wallMats = {}, gunMats = {};
for (const [ch, nm] of Object.entries(WALLTEX)) wallMats[ch] = new THREE.MeshLambertMaterial({ map: kitTex(nm, 1, 1) });
const floorMat = new THREE.MeshLambertMaterial({ map: kitTex('rock', 1, 1), color: 0x777777 });
const ceilMat = new THREE.MeshLambertMaterial({ map: kitTex('concrete', 1, 1), color: 0x555566 });
const exitMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
exitMat.userData = { shared: true };
const exitLight = new THREE.PointLight(0x00ff66, 6, 7, 1.8);
const WALL_H = 2.4;
let levelGroup = null;

function buildLevel(idx) {
  if (levelGroup) {
    scene.remove(levelGroup);
    levelGroup.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of mats) {
        if (m.userData && m.userData.shared) continue;
        for (const v of Object.values(m)) {
          if (v && v.isTexture) v.dispose();
        }
        m.dispose();
      }
    });
  }
  levelGroup = new THREE.Group();
  scene.add(levelGroup);
  const rows = LEVELS[idx].map;
  MAP = rows.map(r => [...r]);
  MH = MAP.length; MW = MAP[0].length;
  exitPos = null;
  foes = []; items = []; shots = []; parts = [];
  // cleanup fireball meshes from previous level
  for (const s of shots) {
    if (s.mesh) {
      s.mesh.geometry.dispose();
      const mats = Array.isArray(s.mesh.material) ? s.mesh.material : s.mesh.material ? [s.mesh.material] : [];
      for (const m of mats) {
        if (!(m.userData && m.userData.shared)) {
          for (const v of Object.values(m)) {
            if (v && v.isTexture) v.dispose();
          }
          m.dispose();
        }
      }
    }
  }
  shots = [];
  pointCloud();
  // walls merged per material
  const buckets = {};
  const pushBox = (mat, x, y0, z, sx, sy, sz, ry) => {
    const g = new THREE.BoxGeometry(sx, sy, sz);
    if (ry) g.rotateY(ry);
    g.translate(x, y0, z);
    (buckets[mat] = buckets[mat] || []).push(g);
  };
  MAP.forEach((row, y) => row.forEach((c, x) => {
    if (isWall(c)) pushBox(c, x + 0.5, WALL_H / 2, y + 0.5, 1, WALL_H, 1);
    else if (c === '@') { player.x = x + 0.5; player.y = y + 0.5; player.dir = 0; player.pitch = 0; }
    else if (c === 'E') { exitPos = { x: x + 0.5, y: y + 0.5 }; }
    else if (c === 'i' || c === 'd') {
      const demon = c === 'd';
      foes.push({ x: x + 0.5, y: y + 0.5, kind: demon ? 'demon' : 'imp', hp: demon ? 70 : 30, spd: demon ? 2.1 : 1.4, state: 'walk', anim: Math.random() * 9, hurtT: 0, atkT: 1 + Math.random() * 3, dyingT: 0, spr: null });
    }
    else if (c === 'B') foes.push({ x: x + 0.5, y: y + 0.5, kind: 'barrel', isBarrel: true, hp: 10, spd: 0, state: 'walk', anim: 0, hurtT: 0, atkT: 99, dyingT: 0, spr: null });
    else if (c === 's' || c === 'm') items.push({ x: x + 0.5, y: y + 0.5, kind: c === 's' ? 'shells' : 'med', taken: false, mesh: null });
    else if (GUNPICK[c] !== undefined) items.push({ x: x + 0.5, y: y + 0.5, kind: 'gun', gun: GUNPICK[c], taken: owned[GUNPICK[c]], mesh: null });
  }));
  for (const [ch, list] of Object.entries(buckets)) {
    const merged = mergeGeometries(list);
    list.forEach(g => g.dispose());
    if (merged) {
      levelGroup.add(new THREE.Mesh(merged, wallMats[ch]));
    } else {
      console.warn('mergeGeometries failed for wall type:', ch);
    }
  }
  // floor + ceiling
  floorMat.map.repeat.set(MW, MH);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.set(MW / 2, 0, MH / 2);
  levelGroup.add(floor);
  ceilMat.map.repeat.set(MW, MH);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), ceilMat);
  ceil.rotation.x = Math.PI / 2; ceil.position.set(MW / 2, WALL_H, MH / 2);
  levelGroup.add(ceil);
  // exit beacon
  if (!exitPos) {
    console.warn(`Level ${idx}: missing E exit.`);
  } else {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.0, 0.15), exitMat);
    door.position.set(exitPos.x, 1.0, exitPos.y);
    levelGroup.add(door);
    exitLight.position.set(exitPos.x, 1.6, exitPos.y);
    levelGroup.add(exitLight);
  }
  // enemy sprites
  for (const f of foes) {
    if (f.isBarrel) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.7, 12),
        new THREE.MeshLambertMaterial({ color: 0x3a5f2e }));
      m.position.set(f.x, 0.35, f.y);
      f.mesh = m;
    } else {
      const sc = f.kind === 'demon' ? 1.28 : 1;
      const kind = f.kind === 'demon' ? 'demon' : 'imp';
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: SPRTEX[kind].walk1, fog: true, transparent: true }));
      m.scale.set(0.95 * sc, 1.1 * sc, 1);
      f.mesh = m;
    }
    levelGroup.add(f.mesh);
  }
  // item meshes
  for (const it of items) {
    if (it.taken) continue;
    let m;
    if (it.kind === 'gun' && gunModels[it.gun]) {
      m = gunModels[it.gun].clone();
      m.scale.setScalar(0.45);
    } else {
      const col = it.kind === 'med' ? 0xdddddd : 0x274d27;
      m = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), new THREE.MeshLambertMaterial({ color: col, emissive: col, emissiveIntensity: 0.25 }));
    }
    m.position.set(it.x, 0.55, it.y);
    it.mesh = m; levelGroup.add(m);
  }
  el('hud-lvl').textContent = LEVELS[idx].name;
  updateGun();
}

// ---------- particles (THREE.Points over the 2D parts sim) ----------
const PMAX = 300;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PMAX * 3), pCol = new Float32Array(PMAX * 3);
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.11, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false }));
points.frustumCulled = false;
scene.add(points);
const tmpC = new THREE.Color();
function pointCloud() {
  for (let i = 0; i < PMAX; i++) { pPos[i * 3 + 1] = -999; }
  pGeo.attributes.position.needsUpdate = true;
}
function burst(x, y, z, n, cols, spd, up, g, life, size) {
  for (let i = 0; i < n; i++) {
    if (parts.length > PMAX) parts.shift();
    const a = Math.random() * Math.PI * 2, s = spd * (0.3 + Math.random() * 0.7);
    parts.push({ x, y, z: z + Math.random() * 0.3, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: up * (0.5 + Math.random()), g, life: life * (0.6 + Math.random() * 0.7), maxLife: life, col: pick(cols), size: size * (0.6 + Math.random() * 0.8) });
  }
}
function explodeBarrel(b) {
  burst(b.x, b.y, 0.5, 26, ['#f80', '#ff0', '#888', '#f40'], 4, 3, 5, 0.9, 0.09);
  lightT = 1.2;
  blip(55, 0.5, 'sawtooth', 0.35);
  playShot(1);
  for (const f of foes) {
    if (f.state === 'gone' || f.state === 'dead' || f === b) continue;
    const d = Math.hypot(f.x - b.x, f.y - b.y);
    if (d < 3.5) {
      f.hp -= 60 * (1 - d / 4);
      if (f.hp <= 0) {
        if (f.isBarrel) { f.state = 'gone'; levelGroup.remove(f.mesh); explodeBarrel(f); }
        else { f.state = 'dying'; f.dyingT = 0.22; kills++; }
      } else { f.hurtT = 0.15; f.state = 'hurt'; }
    }
  }
  const pd = Math.hypot(player.x - b.x, player.y - b.y);
  if (pd < 3.5 && player.hp > 0) player.hp -= 45 * (1 - pd / 4);
}

// ---------- combat (proven 2D hitscan, 3D presentation) ----------
function hasLOS(x0, y0, x1, y1) {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 8);
  for (let i = 1; i < steps; i++) {
    if (isWall(wallAt(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps))) return false;
  }
  return true;
}
function fire() {
  const w = WPNS[cur];
  if (player.cd > 0 || player.ammo <= 0 || player.hp <= 0) return;
  player.ammo--; player.cd = w.rate; player.muzzle = 0.09;
  lightT = Math.max(lightT, 0.9);
  playShot(cur);
  burst(player.x + Math.cos(player.dir) * 0.6, player.y + Math.sin(player.dir) * 0.6, 1.3, 3, ['#999', '#666'], 0.5, 0.8, -1, 0.7, 0.06);
  for (let p = 0; p < w.pellets; p++) {
    const jit = (Math.random() - 0.5) * w.spread * 2;
    let best = null, bestD = 14;
    for (const f of foes) {
      if (f.state === 'dead' || f.state === 'gone') continue;
      const dx = f.x - player.x, dy = f.y - player.y;
      const d = Math.hypot(dx, dy);
      let ang = Math.atan2(dy, dx) - player.dir + jit;
      while (ang > Math.PI) ang -= 2 * Math.PI; while (ang < -Math.PI) ang += 2 * Math.PI;
      if (Math.abs(ang) < 0.12 + 0.3 / (d + 1) && d < bestD && hasLOS(player.x, player.y, f.x, f.y)) { best = f; bestD = d; }
    }
    if (best) {
      best.hp -= w.dmg * (0.7 + Math.random() * 0.6);
      burst(best.x, best.y, 0.7, 3, ['#a00', '#700'], 1.6, 1.2, 6, 0.4, 0.05);
      if (best.hp <= 0) {
        if (best.isBarrel) { if (best.state !== 'gone') { best.state = 'gone'; levelGroup.remove(best.mesh); explodeBarrel(best); } }
        else { best.state = 'dying'; best.dyingT = 0.22; kills++; say(pick(['IMP DOWN', 'DEMON SLAIN', 'TARGET DOWN'])); }
      } else { best.hurtT = 0.15; best.state = 'hurt'; }
    }
  }
}

// ---------- input ----------
const keys = {};
addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if ([' ', 'arrowup', 'arrowdown'].includes(e.key.toLowerCase())) e.preventDefault();
  const n = parseInt(e.key);
  if (n >= 1 && n <= 5 && owned[n - 1]) { cur = n - 1; updateGun(); }
});
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
cv.addEventListener('mousedown', e => {
  if (player.hp <= 0) { respawnLevel(); return; }
  if (levelIdx >= LEVELS.length) { restartGame(); return; }
  fire();
});
addEventListener('mousemove', e => {
  if (document.pointerLockElement !== cv || paused) return;
  player.dir += e.movementX * 0.0028;
  player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - e.movementY * 0.0028));
});
let touchTurn = null;
cv.addEventListener('touchstart', e => { touchTurn = { x: e.changedTouches[0].clientX, t: Date.now() }; }, { passive: true });
cv.addEventListener('touchmove', e => {
  const tc = e.changedTouches[0];
  if (touchTurn) player.dir += (tc.clientX - touchTurn.x) * 0.008;
  if (touchTurn) touchTurn.x = tc.clientX;
}, { passive: true });
cv.addEventListener('touchend', () => { if (touchTurn && Date.now() - touchTurn.t < 250) fire(); touchTurn = null; }, { passive: true });
function startPlay() {
  if (levelIdx >= LEVELS.length) { restartGame(); return; }
  demo = false; paused = false;
  el('overlay').style.display = 'none';
  el('pauseBtn').textContent = 'PAUSE';
  el('demoBtn').textContent = 'DEMO: OFF';
  try { cv.requestPointerLock(); } catch {}
  try { if (ac()) { ac().resume(); loadSamples(); } } catch {}
}
el('play').onclick = startPlay;
el('pauseBtn').onclick = () => { paused = !paused; el('pauseBtn').textContent = paused ? 'RESUME' : 'PAUSE'; };
el('demoBtn').onclick = () => {
  demo = !demo;
  el('demoBtn').textContent = 'DEMO: ' + (demo ? 'ON' : 'OFF');
  el('overlay').style.display = demo ? 'block' : 'none';
};
function updateGun() {
  gunGroup.clear();
  const m = gunModels[cur];
  if (m) gunGroup.add(m);
  const w = WPNS[cur];
  gunGroup.position.set(...w.grip);
  gunGroup.rotation.set(0.06, Math.PI, -0.04);
  flashSpr.position.set(...w.flash);
}

// ---------- flow ----------
function respawnLevel() {
  player.hp = 100; player.ammo = Math.max(player.ammo, 50);
  buildLevel(levelIdx);
}
function restartGame() {
  levelIdx = 0; kills = 0; player.ammo = 50; player.hp = 100;
  for (let i = 1; i < owned.length; i++) owned[i] = false;
  cur = 0; demo = false;
  el('overlay').style.display = 'none';
  buildLevel(0);
}
function cleared() { return foes.every(f => f.state === 'dead' || f.state === 'gone'); }

// ---------- update ----------
function move(dt) {
  const sp = 3.4 * dt;
  let fw = 0, st = 0;
  if (keys['w'] || keys['arrowup']) fw += 1;
  if (keys['s'] || keys['arrowdown']) fw -= 1;
  if (keys['a']) st -= 1;
  if (keys['d']) st += 1;
  if (keys['arrowleft']) player.dir -= 2.4 * dt;
  if (keys['arrowright']) player.dir += 2.4 * dt;
  if (demo) {
    if (cleared() && exitPos) {
      const want = Math.atan2(exitPos.y - player.y, exitPos.x - player.x);
      let d = want - player.dir;
      while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      player.dir += Math.max(-2 * dt, Math.min(2 * dt, d));
      fw = 0.7;
    } else {
      const ax = player.x + Math.cos(player.dir) * 1.2, ay = player.y + Math.sin(player.dir) * 1.2;
      const blocked = isWall(wallAt(ax, ay)) || (isWall(wallAt(player.x + Math.cos(player.dir) * 0.6, player.y)) && isWall(wallAt(player.x, player.y + Math.sin(player.dir) * 0.6)));
      if (blocked) { player.dir += 1.6 * dt; fw = 0; }
      else { player.dir += 0.25 * dt; fw = 0.6; }
      if (Math.floor(t * 2) % 8 === 0 && player.cd <= 0 && player.ammo > 0) fire();
    }
  }
  const nx = player.x + (Math.cos(player.dir) * fw + Math.cos(player.dir + Math.PI / 2) * st) * sp;
  const ny = player.y + (Math.sin(player.dir) * fw + Math.sin(player.dir + Math.PI / 2) * st) * sp;
  if (!isWall(wallAt(nx, player.y))) player.x = nx;
  if (!isWall(wallAt(player.x, ny))) player.y = ny;
  player.cd = Math.max(0, player.cd - dt);
  player.muzzle = Math.max(0, player.muzzle - dt);
  if (!demo && (fw || st) && player.hp > 0) {
    stepAcc += sp;
    if (stepAcc > 2.4) { stepAcc = 0; playStep(); }
  } else stepAcc = 0;
  // foes
  for (const f of foes) {
    if (f.state === 'dead' || f.state === 'gone') continue;
    if (f.state === 'dying') { f.dyingT -= dt; if (f.dyingT <= 0) { f.state = 'dead'; if (f.mesh) f.mesh.visible = false; } continue; }
    if (f.isBarrel) continue;
    f.anim += dt * 5; f.hurtT -= dt; f.atkT -= dt;
    if (f.state === 'hurt' && f.hurtT <= 0) f.state = 'walk';
    const dx = player.x - f.x, dy = player.y - f.y, d = Math.hypot(dx, dy);
    if (d < 9 && hasLOS(f.x, f.y, player.x, player.y)) {
      if (d > 0.9) {
        const vx = dx / d * f.spd * dt, vy = dy / d * f.spd * dt;
        if (!isWall(wallAt(f.x + vx, f.y))) f.x += vx;
        if (!isWall(wallAt(f.x, f.y + vy))) f.y += vy;
      } else if (player.hp > 0) player.hp -= 25 * dt;
      if (d < 6 && f.atkT <= 0) {
        f.atkT = 2 + Math.random() * 2;
        shots.push({ x: f.x, y: f.y, vx: dx / d * 4, vy: dy / d * 4, life: 2, mesh: null });
      }
    }
  }
  // fireballs
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    if (isWall(wallAt(s.x, s.y)) || s.life <= 0) { if (s.mesh) levelGroup.remove(s.mesh); shots.splice(i, 1); continue; }
    if (!s.mesh) {
      s.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff7700 }));
      s.mesh.position.set(s.x, 1.0, s.y);
      levelGroup.add(s.mesh);
    }
    s.mesh.position.set(s.x, 1.0, s.y);
    if (Math.hypot(s.x - player.x, s.y - player.y) < 0.35 && player.hp > 0) {
      player.hp -= 12; blip(140, 0.2, 'sawtooth', 0.25);
      if (s.mesh) levelGroup.remove(s.mesh);
      shots.splice(i, 1);
    }
  }
  // pickups
  for (const it of items) {
    if (it.taken) continue;
    if (Math.hypot(it.x - player.x, it.y - player.y) < 0.8) {
      it.taken = true;
      if (it.mesh) levelGroup.remove(it.mesh);
      if (it.kind === 'shells') { player.ammo = Math.min(299, player.ammo + 12); say('PICKED UP SHELLS'); }
      else if (it.kind === 'med') { player.hp = Math.min(100, player.hp + 30); say('PICKED UP MEDKIT'); }
      else if (it.kind === 'gun') {
        owned[it.gun] = true; cur = it.gun; updateGun();
        player.ammo = Math.min(299, player.ammo + 20);
        say('GOT THE ' + WPNS[it.gun].name);
      }
      blip(660, 0.09, 'square', 0.18);
    }
  }
  // exit
  if (cleared() && exitPos && Math.hypot(exitPos.x - player.x, exitPos.y - player.y) < 0.8) {
    if (levelIdx + 1 >= LEVELS.length) {
      levelIdx = LEVELS.length; // victory sentinel
      el('overlay').innerHTML = '<h1>VICTORY</h1><p>All 12 levels cleared. ' + kills + ' kills.</p><button id="play">PLAY AGAIN</button>';
      el('overlay').style.display = 'block';
      el('play').onclick = startPlay;
      try { document.exitPointerLock(); } catch {}
    } else {
      levelIdx++;
      player.ammo = Math.min(299, player.ammo + 30);
      if (player.hp < 60) player.hp = 60;
      say(LEVELS[levelIdx].name);
      buildLevel(levelIdx);
    }
  }
  // death
  if (player.hp <= 0) {
    player.hp = 0;
    if (demo) { deadT += dt; if (deadT > 2) { deadT = 0; respawnLevel(); } }
  } else deadT = 0;
  // particles + light
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i];
    q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; q.vz -= q.g * dt; q.life -= dt;
    if (q.z < 0) { q.z = 0; q.vz *= -0.4; }
    if (q.life <= 0) parts.splice(i, 1);
  }
  lightT = Math.max(0, lightT - dt * 2.5);
}

// ---------- present ----------
let statT = 0, fpsN = 0, fpsT = 0, fpsV = 60;
function hud() {
  el('ammo').textContent = player.ammo;
  el('health').textContent = Math.ceil(player.hp) + '%';
  el('health').style.color = player.hp > 60 ? '#6f6' : player.hp > 25 ? '#ff0' : '#f33';
  el('foes').textContent = cleared() ? 'EXIT OPEN' : foes.filter(f => f.state !== 'dead' && f.state !== 'gone' && !f.isBarrel).length + ' LEFT';
  el('hud-kills').textContent = 'KILLS ' + kills;
  el('face').textContent = player.hp <= 0 ? 'X_X' : player.hp < 35 ? ':-(' : player.muzzle > 0 ? ':-O' : ':-)';
  el('hud-msg').textContent = t < sayUntil ? sayMsg : WPNS[cur].name + ' · KEYS 1-5 · WASD · CLICK';
  el('diediv').style.display = (!demo && player.hp <= 0 && levelIdx < LEVELS.length) ? 'block' : 'none';
}
function present(dt) {
  camera.position.set(player.x, 1.15 + Math.sin(t * (demo ? 3 : 9)) * 0.02, player.y);
  camera.rotation.y = -player.dir - Math.PI / 2;
  camera.rotation.x = player.pitch;
  // gun bob + muzzle
  const w = WPNS[cur];
  gunGroup.position.set(w.grip[0] + Math.sin(t * 1.7) * 0.004, w.grip[1] + Math.abs(Math.sin(t * (demo ? 3 : 9))) * 0.008 - player.muzzle * 0.06, w.grip[2]);
  flashSpr.visible = player.muzzle > 0;
  if (flashSpr.visible) {
    const s = 0.35 + Math.random() * 0.15;
    flashSpr.scale.set(s, s, 1);
    flashSpr.material.rotation = Math.random() * Math.PI;
  }
  muzzleLight.intensity = lightT * 14;
  muzzleLight.position.set(player.x + Math.cos(player.dir) * 0.8, 1.4, player.y + Math.sin(player.dir) * 0.8);
  // foes
  for (const f of foes) {
    if (!f.mesh || f.state === 'gone') continue;
    if (f.isBarrel) continue;
    f.mesh.position.set(f.x, (f.kind === 'demon' ? 0.68 : 0.6), f.y);
    const FR = SPRTEX[f.kind === 'demon' ? 'demon' : 'imp'];
    let key = (Math.floor(f.anim) % 2) ? 'walk1' : 'walk2';
    if (f.state === 'hurt' || f.state === 'dying') key = 'hurt';
    else if (f.state === 'dead') key = 'dead';
    if (f.mesh.material.map !== FR[key]) { f.mesh.material.map = FR[key]; f.mesh.material.needsUpdate = true; }
    if (f.state === 'dead') f.mesh.position.y = 0.25;
  }
  // items spin/bob
  for (const it of items) {
    if (it.taken || !it.mesh) continue;
    it.mesh.rotation.y += dt * 1.5;
    it.mesh.position.y = 0.55 + Math.sin(t * 2 + it.x) * 0.08;
  }
  // particles -> Points
  for (let i = 0; i < PMAX; i++) {
    const q = parts[i];
    if (!q) { pPos[i * 3 + 1] = -999; continue; }
    pPos[i * 3] = q.x; pPos[i * 3 + 1] = Math.max(0.02, q.z); pPos[i * 3 + 2] = q.y;
    tmpC.set(q.col).multiplyScalar(Math.max(0.15, q.life / q.maxLife));
    pCol[i * 3] = tmpC.r; pCol[i * 3 + 1] = tmpC.g; pCol[i * 3 + 2] = tmpC.b;
  }
  pGeo.attributes.position.needsUpdate = true;
  pGeo.attributes.color.needsUpdate = true;
  renderer.render(scene, camera);
  fpsN++; fpsT += dt;
  if (fpsT >= 0.5) { fpsV = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; }
  statT += dt;
  if (statT > 0.25) {
    statT = 0;
    el('hud-pos').textContent = player.x.toFixed(1) + ',' + player.y.toFixed(1);
    el('hud-fps').textContent = fpsV;
  }
}

// ---------- boot ----------
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
  if (levelIdx >= LEVELS.length) { renderer.render(scene, camera); return; }
  if (!paused) move(dt);
  hud();
  present(dt);
}
async function boot() {
  fitRenderer();
  el('hud-msg').textContent = 'LOADING GUNS…';
  const loader = new GLTFLoader();
  for (let i = 0; i < WPNS.length; i++) {
    try {
      const gltf = await loader.loadAsync('assets/glb/' + WPNS[i].key + '.glb');
      const m = gltf.scene;
      const box = new THREE.Box3().setFromObject(m);
      const size = box.getSize(new THREE.Vector3()).length();
      m.scale.setScalar(0.9 / size);
      const c = box.getCenter(new THREE.Vector3());
      m.position.sub(c.multiplyScalar(0.9 / size));
      const holder = new THREE.Group();
      holder.add(m);
      gunModels[i] = holder;
    } catch (e) { gunModels[i] = null; }
  }
  buildLevel(0);
  el('hud-msg').textContent = WPNS[0].name + ' · KEYS 1-5 · WASD · CLICK';
  window.__game = { player, get foes() { return foes; }, get items() { return items; }, get parts() { return parts; }, get levelIdx() { return levelIdx; }, get kills() { return kills; }, gunModels, owned, fire, buildLevel, WPNS, get cur() { return cur; }, gunGroup, camera, scene, THREE };
  requestAnimationFrame(frame);
}
boot();
