import * as THREE from './vendor/three.module.js';

/* ============================================================
   WIREFRAME GOLF — Wire Tour '86
   Pure-wireframe 3D golf. Desktop. Three.js, no fills, all lines.
   ============================================================ */

// ---------- utils ----------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function distToSeg2D(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const L2 = dx * dx + dz * dz;
  let t = L2 === 0 ? 0 : ((px - ax) * dx + (pz - az) * dz) / L2;
  t = clamp(t, 0, 1);
  const cx = ax + dx * t, cz = az + dz * t;
  return { d: Math.hypot(px - cx, pz - cz), t };
}
function fmtScore(total) {
  if (total === 0) return 'E';
  return (total > 0 ? '+' : '') + total;
}
function scoreName(strokes, par) {
  const d = strokes - par;
  if (strokes === 1) return 'HOLE IN ONE!';
  if (d <= -3) return 'ALBATROSS!';
  if (d === -2) return 'EAGLE!';
  if (d === -1) return 'BIRDIE!';
  if (d === 0) return 'PAR.';
  if (d === 1) return 'BOGEY.';
  if (d === 2) return 'DOUBLE BOGEY.';
  if (d === 3) return 'TRIPLE BOGEY.';
  return `+${d}.`;
}

// ---------- audio (tiny synth) ----------
const AudioSys = {
  ctx: null, muted: false,
  ensure() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  beep(freq, dur = 0.09, type = 'square', vol = 0.05, when = 0) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  swing() { this.beep(220, 0.18, 'sawtooth', 0.06); this.beep(440, 0.1, 'square', 0.05, 0.12); },
  bounce() { this.beep(180, 0.06, 'square', 0.04); },
  splash() { this.beep(90, 0.4, 'sawtooth', 0.07); this.beep(60, 0.5, 'sine', 0.08, 0.08); },
  cheer() { [523, 659, 784, 1046].forEach((f, i) => this.beep(f, 0.16, 'square', 0.06, i * 0.12)); },
  click() { this.beep(880, 0.05, 'square', 0.04); },
};

// ---------- constants ----------
const PARS = [4, 3, 5, 4, 4, 3, 5, 4, 3];
const N_HOLES = 9;
const WORLD = 340;            // half-extent of playable area
const GRAV = 19.62;           // snappy arcade gravity (2x real)
const CLUBS = [
  { name: 'DRIVER', max: 260, loft: 12 * Math.PI / 180, key: '1' },
  { name: 'IRON',   max: 170, loft: 22 * Math.PI / 180, key: '2' },
  { name: 'WEDGE',  max: 95,  loft: 36 * Math.PI / 180, key: '3' },
  { name: 'PUTTER', max: 25,  loft: 2.5 * Math.PI / 180, key: '4' },
];
const C = {
  rough: new THREE.Color('#0d5c2c'),
  fairway: new THREE.Color('#00ff66'),
  green: new THREE.Color('#c8ff1e'),
  tee: new THREE.Color('#00ffee'),
  sand: new THREE.Color('#ffcc00'),
  water: new THREE.Color('#00ccff'),
  white: new THREE.Color('#e8fff0'),
  red: new THREE.Color('#ff3355'),
};

// ---------- dom ----------
const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}
window.addEventListener('resize', resize); resize();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x000000, 120, 640);
const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 3000);

// ---------- game state ----------
const G = {
  started: false,
  holeIndex: 0,
  strokes: 0,
  scores: [],          // per-hole strokes
  totalVsPar: 0,
  club: 0,
  aimAngle: 0,         // radians, 0 = -Z (toward default pin)
  ball: { pos: new THREE.Vector3(), vel: new THREE.Vector3(), rest: true, flying: false, holed: false, sunk: 0 },
  prevPos: new THREE.Vector3(),   // for OB/water drops
  swing: { stage: 'idle', power: 0, acc: 0, t: 0, dirP: 1, dirA: 1 },
  camMode: 0,          // 0 follow, 1 broadcast, 2 top, 3 green
  orbit: { yaw: 0, pitch: 0.38, dist: 16 },
  dragging: false,
  msgTimer: 0,
  pickingUp: false,
};

// ---------- hole data ----------
let H = null; // current hole course object

function buildHoleSpec(index) {
  const rnd = mulberry32(1986 + index * 7919);
  const par = PARS[index];
  const dist = par === 3 ? 150 + rnd() * 45 : par === 4 ? 300 + rnd() * 90 : 450 + rnd() * 90;
  const dirAng = (index * 0.55) + (rnd() - 0.5) * 0.5; // fan the holes around
  const dirX = Math.sin(dirAng), dirZ = -Math.cos(dirAng);
  const tee = new THREE.Vector3(0, 0, 0);
  const green = new THREE.Vector3(dirX * dist, 0, dirZ * dist);
  const greenH = 2 + rnd() * 4;
  green.y = greenH;
  // dogleg mids
  const perpX = -dirZ, perpZ = dirX;
  const d1 = (rnd() - 0.5) * 90, d2 = (rnd() - 0.5) * 90;
  const midA = new THREE.Vector3(dirX * dist * 0.36 + perpX * d1, 0, dirZ * dist * 0.36 + perpZ * d1);
  const midB = new THREE.Vector3(dirX * dist * 0.7 + perpX * d2, 0, dirZ * dist * 0.7 + perpZ * d2);
  midA.y = lerp(0, greenH, 0.36); midB.y = lerp(0, greenH, 0.7);
  const line = [tee.clone(), midA, midB, green.clone()];

  // water: off to the side of mid-fairway
  const side = rnd() > 0.5 ? 1 : -1;
  const wT = 0.35 + rnd() * 0.35;
  const wBase = new THREE.Vector3(
    dirX * dist * wT + perpX * side * (34 + rnd() * 22),
    0,
    dirZ * dist * wT + perpZ * side * (34 + rnd() * 22));
  const water = { x: wBase.x, z: wBase.z, r: 17 + rnd() * 11, level: 0 };
  // bunkers: near green + one fairway
  const bunkers = [];
  const nB = 2 + Math.floor(rnd() * 3);
  for (let i = 0; i < nB; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = i === 0 ? 20 + rnd() * 14 : 10 + rnd() * 16;
    bunkers.push({ x: green.x + Math.cos(a) * rr, z: green.z + Math.sin(a) * rr, r: 3.5 + rnd() * 3 });
  }
  // trees
  const trees = [];
  let guard = 0;
  while (trees.length < 34 && guard++ < 600) {
    const x = (rnd() - 0.5) * 560, z = (rnd() - 0.5) * 560;
    // keep clear of corridor / green / tee / water
    const dc = corridorDist(x, z, line).d;
    if (dc < 22) continue;
    if (Math.hypot(x - green.x, z - green.z) < 24) continue;
    if (Math.hypot(x - tee.x, z - tee.z) < 18) continue;
    if (Math.hypot(x - water.x, z - water.z) < water.r + 8) continue;
    let ok = true;
    for (const b of bunkers) if (Math.hypot(x - b.x, z - b.z) < b.r + 4) { ok = false; break; }
    if (!ok) continue;
    trees.push({ x, z, s: 0.8 + rnd() * 1.3, h: 0 });
  }
  // wind
  const wAng = rnd() * Math.PI * 2, wSpd = 1 + rnd() * 7;
  const wind = new THREE.Vector3(Math.cos(wAng) * wSpd, 0, Math.sin(wAng) * wSpd);
  // pin offset on green
  const pinOff = new THREE.Vector3((rnd() - 0.5) * 9, 0, (rnd() - 0.5) * 9);
  const pin = green.clone().add(pinOff); pin.y = greenH;
  return { index, par, dist, tee, green, greenH, line, water, bunkers, trees, wind, pin, rndSeed: 1986 + index * 7919 };
}

function corridorDist(x, z, line) {
  let best = { d: 1e9, tGlobal: 0 };
  for (let i = 0; i < line.length - 1; i++) {
    const r = distToSeg2D(x, z, line[i].x, line[i].z, line[i + 1].x, line[i + 1].z);
    if (r.d < best.d) best = { d: r.d, tGlobal: (i + r.t) / (line.length - 1), seg: i, t: r.t };
  }
  return best;
}

function baseHeight(x, z, seed) {
  return 2.2 * Math.sin(x * 0.018 + seed) * Math.cos(z * 0.02)
       + 1.4 * Math.sin(x * 0.045 + seed * 2.0) * Math.cos(z * 0.038 + 1.7)
       + 0.5 * Math.sin(x * 0.11) * Math.sin(z * 0.09);
}

function makeHeightFn(spec) {
  const { line, green, tee, water, bunkers } = spec;
  // fairway target height along corridor
  function corridorH(tG) {
    const segH = [0, lerp(0, spec.greenH, 0.36), lerp(0, spec.greenH, 0.7), spec.greenH];
    const f = tG * (line.length - 1);
    const i = Math.min(line.length - 2, Math.floor(f));
    const t = f - i;
    return lerp(segH[i], segH[i + 1], t);
  }
  // water level sampled once
  water.level = baseHeight(water.x, water.z, spec.rndSeed * 0.001) + 0.4;
  return function groundHeight(x, z) {
    const b = baseHeight(x, z, spec.rndSeed * 0.001);
    const cd = corridorDist(x, z, line);
    const dGreen = Math.hypot(x - green.x, z - green.z);
    const dTee = Math.hypot(x - tee.x, z - tee.z);
    let h = b;
    // fairway blend
    const FW = 13, FEATHER = 26;
    if (cd.d < FW + FEATHER) {
      const target = corridorH(cd.tGlobal);
      const k = cd.d <= FW ? 1 : 1 - (cd.d - FW) / FEATHER;
      const s = k * k * (3 - 2 * k);
      h = lerp(b, target, s);
    }
    // green flat
    const GR = 13, GRF = 7;
    if (dGreen < GR + GRF) {
      const k = dGreen <= GR ? 1 : 1 - (dGreen - GR) / GRF;
      const s = k * k * (3 - 2 * k);
      h = lerp(h, spec.greenH, s);
    }
    // tee flat
    if (dTee < 10) {
      const k = dTee <= 6 ? 1 : 1 - (dTee - 6) / 4;
      const s = k * k * (3 - 2 * k);
      h = lerp(h, 0, s);
    }
    // bunkers: shallow dish
    for (const bk of bunkers) {
      const d = Math.hypot(x - bk.x, z - bk.z);
      if (d < bk.r) h -= 0.5 * (1 - (d / bk.r) ** 2);
    }
    // water: basin
    {
      const d = Math.hypot(x - water.x, z - water.z);
      if (d < water.r + 6) {
        const depth = d <= water.r ? 2.2 : 2.2 * (1 - (d - water.r) / 6);
        h = Math.min(h, water.level - depth);
      }
    }
    return h;
  };
}

function getSurface(x, z) {
  const h = H.groundHeight(x, z);
  if (Math.hypot(x - H.spec.water.x, z - H.spec.water.z) < H.spec.water.r && h < H.spec.water.level - 0.15)
    return { type: 'water', h };
  for (const bk of H.spec.bunkers) {
    if (Math.hypot(x - bk.x, z - bk.z) < bk.r) return { type: 'sand', h };
  }
  if (Math.hypot(x - H.spec.green.x, z - H.spec.green.z) < 13) return { type: 'green', h };
  if (Math.hypot(x - H.spec.tee.x, z - H.spec.tee.z) < 6.5) return { type: 'tee', h };
  if (corridorDist(x, z, H.spec.line).d < 13) return { type: 'fairway', h };
  return { type: 'rough', h };
}

// ---------- scene builders (ALL wireframe) ----------
let courseGroup = null;
let ballMesh, aimLine, aimMarker, trailLine, flagGroup, pinMesh;
const trailPts = [];

function wireMat(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: opacity < 1, opacity });
}

function buildSky() {
  // starfield
  const n = 700, pos = new Float32Array(n * 3);
  const r = mulberry32(42);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, e = r() * Math.PI * 0.45 + 0.05, R = 1400;
    pos[i * 3] = Math.cos(a) * Math.cos(e) * R;
    pos[i * 3 + 1] = Math.sin(e) * R;
    pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * R;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x0f5132, size: 2.2, sizeAttenuation: false }));
  scene.add(stars);
  // horizon grid
  const grid = new THREE.GridHelper(1600, 80, 0x00ff66, 0x063d1c);
  grid.position.y = -6;
  grid.material.transparent = true; grid.material.opacity = 0.5;
  scene.add(grid);
  // distant wire mountains
  const mr = mulberry32(7);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + mr() * 0.3;
    const R = 950 + mr() * 250, hh = 60 + mr() * 130, rr = 90 + mr() * 120;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(rr, hh, 5, 2), wireMat(0x0a5a2a, 0.8));
    cone.position.set(Math.cos(a) * R, hh / 2 - 8, Math.sin(a) * R);
    scene.add(cone);
  }
}

function buildCourse(spec, groundHeight) {
  if (courseGroup) {
    scene.remove(courseGroup);
    courseGroup.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose?.(); });
  }
  courseGroup = new THREE.Group();
  trailPts.length = 0;

  // --- terrain with per-vertex wire colors ---
  const SIZE = 640, SEG = 96;
  const tg = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  tg.rotateX(-Math.PI / 2);
  const p = tg.attributes.position;
  const colors = new Float32Array(p.count * 3);
  const tmp = new THREE.Color();
  const saveH = H?.groundHeight;
  H = { spec, groundHeight }; // temp so getSurface works during coloring
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const s = getSurface(x, z);
    p.setY(i, s.h);
    if (s.type === 'green') tmp.copy(C.green);
    else if (s.type === 'fairway') tmp.copy(C.fairway);
    else if (s.type === 'tee') tmp.copy(C.tee);
    else if (s.type === 'sand') tmp.copy(C.sand);
    else if (s.type === 'water') tmp.copy(C.water);
    else tmp.copy(C.rough);
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  tg.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ wireframe: true, vertexColors: true }));
  courseGroup.add(terrain);

  // --- water surface disc (wire rings) ---
  const w = spec.water;
  const wg = new THREE.CircleGeometry(w.r, 40);
  wg.rotateX(-Math.PI / 2);
  const wm = new THREE.Mesh(wg, wireMat(0x00ccff, 0.9));
  wm.position.set(w.x, w.level + 0.05, w.z);
  courseGroup.add(wm);
  const wring = new THREE.Mesh(new THREE.RingGeometry(w.r, w.r + 1.2, 48), wireMat(0x00ccff, 0.7));
  wring.geometry.rotateX(-Math.PI / 2);
  wring.position.set(w.x, w.level + 0.06, w.z);
  courseGroup.add(wring);

  // --- green rings + tee ring ---
  for (const [cx, cz, rr, col] of [
    [spec.green.x, spec.green.z, 13, 0xc8ff1e],
    [spec.green.x, spec.green.z, 9, 0xc8ff1e],
    [spec.green.x, spec.green.z, 5, 0xc8ff1e],
    [spec.tee.x, spec.tee.z, 6, 0x00ffee],
  ]) {
    const gy = groundHeight(cx, cz);
    const ring = new THREE.Mesh(new THREE.RingGeometry(rr - 0.35, rr, 48), wireMat(col, 0.85));
    ring.geometry.rotateX(-Math.PI / 2);
    ring.position.set(cx, gy + 0.12, cz);
    courseGroup.add(ring);
  }

  // --- bunkers outline ---
  for (const b of spec.bunkers) {
    const by = groundHeight(b.x, b.z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(b.r - 0.4, b.r, 32), wireMat(0xffcc00, 0.9));
    ring.geometry.rotateX(-Math.PI / 2);
    ring.position.set(b.x, by + 0.25, b.z);
    courseGroup.add(ring);
  }

  // --- fairway center dashes ---
  {
    const pts = [];
    for (let i = 0; i < spec.line.length - 1; i++) {
      const a = spec.line[i], b = spec.line[i + 1];
      for (let k = 0; k < 12; k++) {
        const t = k / 12;
        const x = lerp(a.x, b.x, t), z = lerp(a.z, b.z, t);
        pts.push(new THREE.Vector3(x, groundHeight(x, z) + 0.15, z));
      }
    }
    const dg = new THREE.BufferGeometry().setFromPoints(pts);
    courseGroup.add(new THREE.Line(dg, new THREE.LineBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.35 })));
  }

  // --- trees (trunk + canopy, wire only) ---
  for (const t of spec.trees) {
    const gy = groundHeight(t.x, t.z);
    const th = 5 * t.s + 3, ch = 7 * t.s + 3;
    t.h = gy + th + ch;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * t.s, 0.55 * t.s, th, 6, 2), wireMat(0x1a8a4a, 0.9));
    trunk.position.set(t.x, gy + th / 2, t.z);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2 * t.s, ch, 7, 3), wireMat(0x00ff66, 0.85));
    cone.position.set(t.x, gy + th + ch / 2, t.z);
    courseGroup.add(trunk, cone);
  }

  // --- flag / pin / cup ---
  flagGroup = new THREE.Group();
  const cupY = spec.greenH;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 8), wireMat(0xffffff, 1));
  pole.position.set(spec.pin.x, cupY + 1.6, spec.pin.z);
  // flag triangle
  const fg = new THREE.BufferGeometry();
  fg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0, 0, 0,  1.7, -0.35, 0,  0, -0.8, 0,
  ]), 3));
  fg.setIndex([0, 1, 2]);
  fg.computeVertexNormals();
  const flag = new THREE.Mesh(fg, wireMat(0xff3355, 1));
  flag.position.set(spec.pin.x + 0.07, cupY + 3.0, spec.pin.z);
  // cup ring
  const cup = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.07, 6, 24), wireMat(0xffffff, 1));
  cup.geometry.rotateX(Math.PI / 2);
  cup.position.set(spec.pin.x, cupY + 0.08, spec.pin.z);
  // glow pole base rings
  const base = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.05, 24), wireMat(0xff3355, 0.8));
  base.geometry.rotateX(-Math.PI / 2);
  base.position.set(spec.pin.x, cupY + 0.1, spec.pin.z);
  flagGroup.add(pole, flag, cup, base);
  courseGroup.add(flagGroup);
  pinMesh = pole;

  // --- tee markers ---
  for (const s of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), wireMat(0x00ffee, 1));
    m.position.set(spec.tee.x + s * 2.2, groundHeight(spec.tee.x, spec.tee.z) + 0.6, spec.tee.z + 2);
    courseGroup.add(m);
  }

  // --- ball ---
  if (!ballMesh) {
    ballMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), wireMat(0xffffff, 1));
    scene.add(ballMesh);
    // halo
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.03, 6, 24), wireMat(0x00ffee, 0.7));
    halo.name = 'halo';
    ballMesh.add(halo);
  }
  // --- aim line ---
  if (!aimLine) {
    aimLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineDashedMaterial({ color: 0x00ffee, dashSize: 1.2, gapSize: 0.9, transparent: true, opacity: 0.95 }));
    scene.add(aimLine);
    aimMarker = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 28), wireMat(0x00ffee, 0.9));
    aimMarker.geometry.rotateX(Math.PI / 2);
    scene.add(aimMarker);
    trailLine = new THREE.Line(
      new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.8 }));
    scene.add(trailLine);
  }

  scene.add(courseGroup);
  H = { spec, groundHeight };
}

// ---------- hole lifecycle ----------
function startHole(idx) {
  G.holeIndex = idx;
  G.strokes = 0;
  G.pickingUp = false;
  const spec = buildHoleSpec(idx);
  const gh = makeHeightFn(spec);
  buildCourse(spec, gh);
  // ball on tee
  const ty = gh(spec.tee.x, spec.tee.z);
  G.ball.pos.set(spec.tee.x, ty + 0.35, spec.tee.z);
  G.ball.vel.set(0, 0, 0);
  G.ball.rest = true; G.ball.flying = false; G.ball.holed = false; G.ball.sunk = 0;
  G.prevPos.copy(G.ball.pos);
  trailPts.length = 0; updateTrail();
  // aim at pin
  const dx = spec.pin.x - spec.tee.x, dz = spec.pin.z - spec.tee.z;
  G.aimAngle = Math.atan2(dx, -dz); // angle from -Z axis... define fwd=(sin a, -cos a)
  G.orbit.yaw = 0; G.orbit.pitch = 0.38; G.orbit.dist = 16;
  // auto club: driver off tee
  G.club = spec.par === 3 ? 1 : 0;
  G.swing.stage = 'idle'; G.swing.power = 0; G.swing.acc = 0;
  flash(`HOLE ${idx + 1}`, `PAR ${spec.par} • ${Math.round(spec.dist)}m • WIND ${spec.wind.length().toFixed(1)} m/s`);
  AudioSys.beep(660, 0.12, 'square', 0.05);
  updateHUD();
}

function aimDir() {
  return new THREE.Vector3(Math.sin(G.aimAngle), 0, -Math.cos(G.aimAngle));
}

// ---------- swing / shots ----------
function advanceSwing() {
  AudioSys.ensure(); AudioSys.click();
  const s = G.swing;
  if (!G.ball.rest || G.ball.holed || G.pickingUp) return;
  if (s.stage === 'idle') { s.stage = 'power'; s.t = 0; s.dirP = 1; s.power = 0; }
  else if (s.stage === 'power') { s.stage = 'acc'; s.t = 0; s.dirA = Math.random() > 0.5 ? 1 : -1; s.acc = 0; }
  else if (s.stage === 'acc') { strike(); s.stage = 'idle'; }
  updateHUD();
}

function lieFactor(lie, clubIdx) {
  if (lie === 'tee' || lie === 'fairway' || lie === 'green') return 1;
  if (lie === 'rough') return clubIdx === 0 ? 0.72 : 0.85;
  if (lie === 'sand') return clubIdx === 2 ? 0.8 : 0.55;
  return 1;
}

function strike() {
  const s = G.swing;
  const club = CLUBS[G.club];
  const surf = getSurface(G.ball.pos.x, G.ball.pos.z);
  const lie = surf.type;
  const power = clamp(s.power, 0.05, 1);
  const accErr = clamp(s.acc, -1, 1);
  // Putter from off-green is allowed but weak
  let carry = club.max * (0.15 + 0.85 * power) * lieFactor(lie, G.club);
  if (G.club === 3 && lie !== 'green') carry *= 0.55;
  if (G.club !== 3 && lie === 'green') carry *= 0.45; // chipping off green with iron = duff guard
  const az = G.aimAngle + accErr * 0.10 + (lie === 'rough' || lie === 'sand' ? (Math.random() - 0.5) * 0.06 : 0);
  const dir = new THREE.Vector3(Math.sin(az), 0, -Math.cos(az));
  let v;
  if (G.club === 3) {
    const aGreen = 3.2; // tuned roll decel
    const speed = Math.sqrt(2 * aGreen * carry);
    v = new THREE.Vector3(dir.x * speed, 0.6, dir.z * speed);
    G.ball.flying = false;
  } else {
    const th = club.loft;
    const R = Math.max(4, carry);
    const speed = Math.sqrt(R * GRAV / Math.max(0.15, Math.sin(2 * th)));
    // mishit penalty on accuracy
    const mishit = 1 - Math.abs(accErr) * 0.25;
    v = new THREE.Vector3(
      dir.x * Math.cos(th) * speed * mishit,
      Math.sin(th) * speed,
      dir.z * Math.cos(th) * speed * mishit);
    G.ball.flying = true;
  }
  G.prevPos.copy(G.ball.pos);
  G.ball.vel.copy(v);
  G.ball.rest = false;
  G.strokes++;
  trailPts.length = 0;
  AudioSys.swing();
  $('swing-hint').innerHTML = club.name + ' • ' + Math.round(carry) + 'm • ' +
    (Math.abs(accErr) < 0.18 ? 'PURE!' : Math.abs(accErr) < 0.5 ? 'OK' : 'WILD!');
  updateHUD();
}

// ---------- physics ----------
function stepBall(dt) {
  const b = G.ball;
  if (b.rest || b.holed) return;
  const sub = 3, h = dt / sub;
  for (let i = 0; i < sub; i++) {
    const surf = getSurface(b.pos.x, b.pos.z);
    const gh = surf.h;
    if (b.flying || b.pos.y > gh + 0.4) {
      // flight
      b.vel.y -= GRAV * h;
      // drag + wind
      const drag = 0.10;
      b.vel.multiplyScalar(1 - drag * h);
      b.vel.x += H.spec.wind.x * 0.32 * h;
      b.vel.z += H.spec.wind.z * 0.32 * h;
      b.pos.addScaledVector(b.vel, h);
      // tree canopy hit
      for (const t of H.spec.trees) {
        const dx = b.pos.x - t.x, dz = b.pos.z - t.z;
        if (dx * dx + dz * dz < 9 && b.pos.y < t.h && b.pos.y > t.h - 12) {
          b.vel.x *= -0.35; b.vel.z *= -0.35; b.vel.y *= 0.4;
          b.pos.x += b.vel.x * h * 2; b.pos.z += b.vel.z * h * 2;
          AudioSys.bounce();
        }
      }
      // pin hit
      {
        const dx = b.pos.x - H.spec.pin.x, dz = b.pos.z - H.spec.pin.z;
        if (dx * dx + dz * dz < 0.35 && b.pos.y < H.spec.greenH + 3.4 && b.pos.y > H.spec.greenH) {
          b.vel.x *= -0.3; b.vel.z *= -0.3;
          AudioSys.bounce();
        }
      }
      // ground contact
      const s2 = getSurface(b.pos.x, b.pos.z);
      const g2 = s2.h;
      if (b.pos.y <= g2 + 0.35) {
        b.pos.y = g2 + 0.35;
        // water?
        if (s2.type === 'water') { doWater(); return; }
        const horiz = Math.hypot(b.vel.x, b.vel.z);
        const vyIn = -b.vel.y;
        // restitution / keep by surface + club
        let rest = 0.32, keep = 0.78;
        if (s2.type === 'green') { rest = 0.18; keep = 0.62; }
        if (s2.type === 'rough') { rest = 0.22; keep = 0.55; }
        if (s2.type === 'sand') { rest = 0.08; keep = 0.3; }
        if (G.club === 2) { keep *= 0.55; rest *= 0.7; } // wedge spin
        if (G.club === 0) { keep = Math.min(0.86, keep + 0.08); }
        if (vyIn < 1.2 && horiz < 7) {
          b.flying = false; b.vel.y = 0;
        } else {
          b.vel.y = vyIn * rest;
          b.vel.x *= keep; b.vel.z *= keep;
          if (Math.abs(b.vel.y) < 0.8) { b.vel.y = 0; b.flying = false; }
          AudioSys.bounce();
        }
      }
    } else {
      // rolling
      const e = 0.6;
      const gx = (H.groundHeight(b.pos.x + e, b.pos.z) - H.groundHeight(b.pos.x - e, b.pos.z)) / (2 * e);
      const gz = (H.groundHeight(b.pos.x, b.pos.z + e) - H.groundHeight(b.pos.x, b.pos.z - e)) / (2 * e);
      b.vel.x += -gx * GRAV * 0.55 * h;
      b.vel.z += -gz * GRAV * 0.55 * h;
      // friction by surface
      let fr = 5.0;
      if (surf.type === 'green') fr = 3.1;
      else if (surf.type === 'fairway' || surf.type === 'tee') fr = 5.2;
      else if (surf.type === 'rough') fr = 10.5;
      else if (surf.type === 'sand') fr = 16.0;
      const sp = Math.hypot(b.vel.x, b.vel.z);
      if (sp > 0) {
        const ns = Math.max(0, sp - fr * h);
        b.vel.x *= ns / sp; b.vel.z *= ns / sp;
      }
      b.pos.x += b.vel.x * h; b.pos.z += b.vel.z * h;
      const s3 = getSurface(b.pos.x, b.pos.z);
      if (s3.type === 'water') { doWater(); return; }
      b.pos.y = s3.h + 0.35;
      b.vel.y = 0;
      // trunk collision
      for (const t of H.spec.trees) {
        const dx = b.pos.x - t.x, dz = b.pos.z - t.z, d = Math.hypot(dx, dz);
        if (d < 0.9 && b.pos.y < t.h - 6) {
          const nx = dx / (d || 1), nz = dz / (d || 1);
          b.pos.x = t.x + nx * 0.9; b.pos.z = t.z + nz * 0.9;
          const dot = b.vel.x * nx + b.vel.z * nz;
          b.vel.x -= 2 * dot * nx; b.vel.z -= 2 * dot * nz;
          b.vel.multiplyScalar(0.4);
          AudioSys.bounce();
        }
      }
      // cup capture / lip-out
      const dc = Math.hypot(b.pos.x - H.spec.pin.x, b.pos.z - H.spec.pin.z);
      const spd = Math.hypot(b.vel.x, b.vel.z);
      if (dc < 0.62 && Math.abs(b.pos.y - (H.spec.greenH + 0.35)) < 0.6) {
        if (spd < 5.2) { doHole(); return; }
        else {
          // lip out: deflect tangentially
          const nx = (b.pos.x - H.spec.pin.x) / (dc || 1), nz = (b.pos.z - H.spec.pin.z) / (dc || 1);
          const dot = b.vel.x * nx + b.vel.z * nz;
          b.vel.x -= 1.6 * dot * nx; b.vel.z -= 1.6 * dot * nz;
          b.vel.multiplyScalar(0.55);
          flashSmall('LIP OUT!');
        }
      }
      if (spd < 0.35) {
        const slope = Math.hypot(gx, gz);
        if (slope < 0.09) {
          b.vel.set(0, 0, 0);
          b.rest = true;
          onBallRest();
          return;
        }
      }
    }
    // OB?
    if (Math.abs(b.pos.x) > WORLD || Math.abs(b.pos.z) > WORLD) { doOB(); return; }
  }
  // trail
  trailPts.push(G.ball.pos.clone());
  if (trailPts.length > 240) trailPts.shift();
  updateTrail();
}

function updateTrail() {
  if (!trailLine) return;
  trailLine.geometry.dispose();
  trailLine.geometry = new THREE.BufferGeometry().setFromPoints(trailPts.length ? trailPts : [G.ball.pos, G.ball.pos]);
}

function doWater() {
  AudioSys.splash();
  G.strokes += 1; // penalty
  G.ball.pos.copy(G.prevPos);
  G.ball.pos.y = H.groundHeight(G.ball.pos.x, G.ball.pos.z) + 0.35;
  // nudge away from water
  const w = H.spec.water;
  const dx = G.ball.pos.x - w.x, dz = G.ball.pos.z - w.z;
  const d = Math.hypot(dx, dz) || 1;
  G.ball.pos.x = w.x + dx / d * (w.r + 4);
  G.ball.pos.z = w.z + dz / d * (w.r + 4);
  G.ball.pos.y = H.groundHeight(G.ball.pos.x, G.ball.pos.z) + 0.35;
  G.ball.vel.set(0, 0, 0); G.ball.rest = true; G.ball.flying = false;
  flash('SPLASH!', '+1 PENALTY • DROP');
  autoClub();
  updateHUD();
}

function doOB() {
  G.strokes += 1;
  G.ball.pos.copy(G.prevPos);
  G.ball.pos.y = H.groundHeight(G.ball.pos.x, G.ball.pos.z) + 0.35;
  G.ball.vel.set(0, 0, 0); G.ball.rest = true; G.ball.flying = false;
  flash('OUT OF BOUNDS', '+1 PENALTY');
  autoClub();
  updateHUD();
}

function doHole() {
  const b = G.ball;
  b.holed = true; b.rest = true; b.vel.set(0, 0, 0);
  b.pos.set(H.spec.pin.x, H.spec.greenH + 0.1, H.spec.pin.z);
  AudioSys.cheer();
  const strokes = G.strokes;
  const par = H.spec.par;
  G.scores[G.holeIndex] = strokes;
  G.totalVsPar += strokes - par;
  const name = scoreName(strokes, par);
  if (G.holeIndex < N_HOLES - 1)
    flash(name, `${strokes} ON PAR ${par} • PRESS N FOR HOLE ${G.holeIndex + 2}`);
  else
    flash(name, `TOUR COMPLETE • ${fmtScore(G.totalVsPar)} • PRESS N FOR SCORECARD`);
  updateHUD(); renderScorecard();
}

function onBallRest() {
  // max strokes pickup
  if (G.strokes >= 12) {
    G.scores[G.holeIndex] = 12;
    G.totalVsPar += 12 - H.spec.par;
    flash('PICKED UP', 'MAX 12 • PRESS N FOR NEXT HOLE');
    G.pickingUp = true;
    renderScorecard(); updateHUD();
    return;
  }
  autoClub();
  updateHUD();
  // tap-in check helper text
  const d = Math.hypot(G.ball.pos.x - H.spec.pin.x, G.ball.pos.z - H.spec.pin.z);
  if (d < 6 && getSurface(G.ball.pos.x, G.ball.pos.z).type === 'green')
    $('swing-hint').innerHTML = 'ON THE GREEN • PUTTER READY • <b>SPACE</b> TO PUTT';
}

function autoClub() {
  const d = Math.hypot(G.ball.pos.x - H.spec.pin.x, G.ball.pos.z - H.spec.pin.z);
  const lie = getSurface(G.ball.pos.x, G.ball.pos.z).type;
  if (lie === 'green') G.club = 3;
  else if (d < 22) G.club = 3;
  else if (d < 110) G.club = 2;
  else if (d < 195) G.club = 1;
  else G.club = 0;
  document.querySelectorAll('.club').forEach((el) => {
    el.classList.toggle('active', Number(el.dataset.club) === G.club);
  });
}

// ---------- cameras ----------
const camPos = new THREE.Vector3(0, 8, 18);
const camLook = new THREE.Vector3();

function updateCamera(dt) {
  const b = G.ball.pos;
  const dir = aimDir();
  // apply orbit yaw offset around aim
  const yaw = G.aimAngle + G.orbit.yaw;
  const fwd = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
  let want, look;
  if (G.camMode === 0) {          // follow
    const d = G.orbit.dist, p = G.orbit.pitch;
    want = b.clone().addScaledVector(fwd, -d * Math.cos(p)).add(new THREE.Vector3(0, d * Math.sin(p) + 1.5, 0));
    look = b.clone().addScaledVector(dir, 8);
  } else if (G.camMode === 1) {   // broadcast side
    const side = new THREE.Vector3(-fwd.z, 0, fwd.x);
    want = b.clone().addScaledVector(fwd, -6).addScaledVector(side, 22).add(new THREE.Vector3(0, 10, 0));
    look = b.clone().addScaledVector(dir, 14);
  } else if (G.camMode === 2) {   // top
    want = b.clone().add(new THREE.Vector3(0, 120, 0.01));
    look = b.clone();
  } else {                        // green
    const pin = new THREE.Vector3(H.spec.pin.x, H.spec.greenH + 1, H.spec.pin.z);
    want = pin.clone().add(new THREE.Vector3(14, 9, 14));
    look = b.clone().lerp(pin, 0.45);
  }
  // keep camera above terrain
  const gy = H ? H.groundHeight(want.x, want.z) + 1.2 : want.y;
  if (want.y < gy) want.y = gy;
  const k = 1 - Math.pow(0.001, dt); // smooth
  camPos.lerp(want, k);
  camLook.lerp(look, k);
  camera.position.copy(camPos);
  camera.lookAt(camLook);
  // snap on hole start
  if (camPos.distanceTo(want) > 200) { camPos.copy(want); camLook.copy(look); }
}

// ---------- HUD ----------
function updateHUD() {
  $('hud-hole').textContent = `${G.holeIndex + 1}/${N_HOLES}`;
  $('hud-par').textContent = H.spec.par;
  $('hud-stroke').textContent = G.strokes;
  $('hud-score').textContent = fmtScore(G.totalVsPar);
  const d = Math.hypot(G.ball.pos.x - H.spec.pin.x, G.ball.pos.z - H.spec.pin.z);
  $('hud-dist').textContent = G.ball.holed ? 'HOLED' : `${Math.round(d)}m`;
  const lie = G.ball.holed ? '—' : getSurface(G.ball.pos.x, G.ball.pos.z).type.toUpperCase();
  $('hud-lie').textContent = lie;
  const w = H.spec.wind, spd = w.length();
  const arrow = windArrow(w);
  $('hud-wind').textContent = `${arrow} ${spd.toFixed(1)} m/s`;
  $('hud-cam').textContent = ['FOLLOW', 'TV', 'TOP', 'GREEN'][G.camMode];
  document.querySelectorAll('.club').forEach((el) => {
    el.classList.toggle('active', Number(el.dataset.club) === G.club);
  });
}
function windArrow(w) {
  // relative to aim: headwind/tailwind arrows
  const a = Math.atan2(w.x, -w.z) - G.aimAngle;
  const deg = ((a * 180 / Math.PI) % 360 + 360) % 360;
  const dirs = ['↓', '↙', '←', '↖', '↑', '↗', '→', '↘'];
  return dirs[Math.round(deg / 45) % 8];
}

let flashTO = null;
function flash(main, sub = '') {
  const m = $('msg'), s = $('submsg');
  m.textContent = main; s.textContent = sub;
  m.classList.add('show'); s.classList.add('show');
  clearTimeout(flashTO);
  flashTO = setTimeout(() => { m.classList.remove('show'); s.classList.remove('show'); }, 2600);
}
function flashSmall(sub) {
  const s = $('submsg');
  s.textContent = sub; s.classList.add('show');
  clearTimeout(flashTO);
  flashTO = setTimeout(() => { $('msg').classList.remove('show'); s.classList.remove('show'); }, 1400);
}

function renderScorecard() {
  const t = $('score-table');
  let html = '<tr><th>HOLE</th>' + PARS.map((_, i) => `<th>${i + 1}</th>`).join('') + '<th>TOT</th></tr>';
  html += '<tr><th>PAR</th>' + PARS.map((p) => `<td>${p}</td>`).join('') + `<td>${PARS.reduce((a, b) => a + b, 0)}</td></tr>`;
  html += '<tr><th>YOU</th>' + PARS.map((_, i) => `<td>${G.scores[i] ?? '–'}</td>`).join('') +
    `<td>${G.scores.length ? G.scores.reduce((a, b) => a + b, 0) : '–'}</td></tr>`;
  t.innerHTML = html;
}

// ---------- minimap ----------
function drawMinimap() {
  const cv = $('minimap'), ctx = cv.getContext('2d');
  const W = cv.width, Hh = cv.height;
  ctx.fillStyle = '#001008'; ctx.fillRect(0, 0, W, Hh);
  ctx.strokeStyle = 'rgba(0,255,102,.25)'; ctx.strokeRect(4.5, 4.5, W - 9, Hh - 9);
  if (!H) return;
  // world->map: fit tee..green
  const xs = [H.spec.tee.x, H.spec.green.x], zs = [H.spec.tee.z, H.spec.green.z];
  let minX = Math.min(...xs) - 60, maxX = Math.max(...xs) + 60;
  let minZ = Math.min(...zs) - 60, maxZ = Math.max(...zs) + 60;
  // include water
  minX = Math.min(minX, H.spec.water.x - H.spec.water.r - 10); maxX = Math.max(maxX, H.spec.water.x + H.spec.water.r + 10);
  minZ = Math.min(minZ, H.spec.water.z - H.spec.water.r - 10); maxZ = Math.max(maxZ, H.spec.water.z + H.spec.water.r + 10);
  const sx = (W - 20) / (maxX - minX), sz = (Hh - 20) / (maxZ - minZ);
  const s = Math.min(sx, sz);
  const ox = 10 - minX * s + ((W - 20) - (maxX - minX) * s) / 2;
  const oy = 10 - minZ * s + ((Hh - 20) - (maxZ - minZ) * s) / 2;
  const X = (x) => ox + x * s, Y = (z) => oy + z * s;
  // corridor
  ctx.strokeStyle = '#00ff66'; ctx.lineWidth = 5; ctx.beginPath();
  H.spec.line.forEach((p, i) => { i ? ctx.lineTo(X(p.x), Y(p.z)) : ctx.moveTo(X(p.x), Y(p.z)); });
  ctx.stroke();
  // water
  ctx.strokeStyle = '#00ccff'; ctx.lineWidth = 1.5; ctx.beginPath();
  ctx.arc(X(H.spec.water.x), Y(H.spec.water.z), H.spec.water.r * s, 0, 7); ctx.stroke();
  // green
  ctx.strokeStyle = '#c8ff1e'; ctx.beginPath();
  ctx.arc(X(H.spec.green.x), Y(H.spec.green.z), 13 * s, 0, 7); ctx.stroke();
  // pin
  ctx.fillStyle = '#ff3355'; ctx.fillRect(X(H.spec.pin.x) - 2, Y(H.spec.pin.z) - 2, 4, 4);
  // ball
  ctx.fillStyle = '#ffffff'; ctx.beginPath();
  ctx.arc(X(G.ball.pos.x), Y(G.ball.pos.z), 3, 0, 7); ctx.fill();
  // aim tick
  const d = aimDir();
  ctx.strokeStyle = '#00ffee'; ctx.beginPath();
  ctx.moveTo(X(G.ball.pos.x), Y(G.ball.pos.z));
  ctx.lineTo(X(G.ball.pos.x + d.x * 30), Y(G.ball.pos.z + d.z * 30));
  ctx.stroke();
  // wind arrow (screen corner)
  ctx.fillStyle = '#00ffee'; ctx.font = '11px monospace';
  const wa = Math.atan2(H.spec.wind.x, H.spec.wind.z);
  ctx.fillText(`W ${H.spec.wind.length().toFixed(0)}`, 10, Hh - 8);
  ctx.save(); ctx.translate(W - 18, Hh - 16); ctx.rotate(-wa);
  ctx.fillText('↑', -4, 4); ctx.restore();
}

// ---------- aim visuals ----------
function updateAim() {
  if (!aimLine) return;
  const show = G.ball.rest && !G.ball.holed && G.started;
  aimLine.visible = show; aimMarker.visible = show;
  if (!show) return;
  const b = G.ball.pos, dir = aimDir();
  const club = CLUBS[G.club];
  const surf = getSurface(b.x, b.z);
  let carry = club.max * 0.85 * lieFactor(surf.type, G.club);
  if (G.club === 3 && surf.type !== 'green') carry *= 0.55;
  // swing power preview while charging
  if (G.swing.stage === 'power') carry *= (0.15 + 0.85 * G.swing.power);
  const ex = b.x + dir.x * carry, ez = b.z + dir.z * carry;
  const p0 = b.clone(); p0.y += 0.2;
  const p1 = new THREE.Vector3(ex, H.groundHeight(ex, ez) + 0.3, ez);
  // arc midpoint lift for非 putter
  const mid = p0.clone().lerp(p1, 0.5); mid.y += G.club === 3 ? 0.5 : carry * 0.18;
  const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1);
  aimLine.geometry.dispose();
  aimLine.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
  aimLine.computeLineDistances();
  aimMarker.position.copy(p1);
  const s = 1 + Math.sin(performance.now() * 0.006) * 0.12;
  aimMarker.scale.set(s, 1, s);
}

// ---------- input ----------
const keys = {};
window.addEventListener('keydown', (e) => {
  if (e.code === 'Tab') { e.preventDefault(); $('scorecard').classList.toggle('hidden'); renderScorecard(); return; }
  if (e.repeat) { if (e.code === 'Space') e.preventDefault(); return; }
  keys[e.code] = true;
  AudioSys.ensure();
  if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); advanceSwing(); }
  if (e.code === 'Digit1') G.club = 0;
  if (e.code === 'Digit2') G.club = 1;
  if (e.code === 'Digit3') G.club = 2;
  if (e.code === 'Digit4') G.club = 3;
  if (e.code === 'KeyC') { G.camMode = (G.camMode + 1) % 4; updateHUD(); }
  if (e.code === 'KeyM') { AudioSys.muted = !AudioSys.muted; flashSmall(AudioSys.muted ? 'SOUND OFF' : 'SOUND ON'); }
  if (e.code === 'KeyN') nextHole();
  if (e.code === 'KeyR') {
    if (G.holeIndex >= N_HOLES - 1 && G.ball.holed) restartTour();
    else startHole(G.holeIndex);
  }
  updateHUD();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

document.querySelectorAll('.club').forEach((el) => {
  el.addEventListener('click', () => { AudioSys.ensure(); AudioSys.click(); G.club = Number(el.dataset.club); updateHUD(); });
});
$('swing-btn').addEventListener('click', () => advanceSwing());
$('tee-btn').addEventListener('click', () => {
  AudioSys.ensure(); AudioSys.cheer();
  G.started = true;
  $('title').classList.add('hidden');
  flash(`HOLE 1`, `PAR ${PARS[0]} • GOOD LUCK`);
});
// mouse orbit
let lastM = null;
canvas.addEventListener('mousedown', (e) => { G.dragging = true; lastM = [e.clientX, e.clientY]; });
window.addEventListener('mouseup', () => { G.dragging = false; lastM = null; });
window.addEventListener('mousemove', (e) => {
  if (!G.dragging || !lastM) return;
  const dx = e.clientX - lastM[0], dy = e.clientY - lastM[1];
  lastM = [e.clientX, e.clientY];
  G.orbit.yaw -= dx * 0.005;
  G.orbit.pitch = clamp(G.orbit.pitch + dy * 0.004, 0.05, 1.25);
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  G.orbit.dist = clamp(G.orbit.dist + Math.sign(e.deltaY) * 2.2, 6, 70);
}, { passive: false });

function nextHole() {
  if (G.holeIndex >= N_HOLES - 1) {
    // tour over: show scorecard
    renderScorecard();
    $('scorecard').classList.remove('hidden');
    const tot = G.scores.reduce((a, b) => a + b, 0);
    flash('TOUR COMPLETE', `${tot} • ${fmtScore(G.totalVsPar)} • R TO PLAY AGAIN`);
    return;
  }
  if (!G.ball.holed && !G.pickingUp) { flashSmall('FINISH THE HOLE FIRST (OR PRESS R TO RESTART HOLE)'); return; }
  AudioSys.click();
  startHole(G.holeIndex + 1);
}
function restartTour() {
  G.scores = []; G.totalVsPar = 0;
  $('scorecard').classList.add('hidden');
  startHole(0);
}

// ---------- main loop ----------
buildSky();
startHole(0);
renderScorecard();
updateHUD();

let last = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  // aim keys
  if (G.started && G.ball.rest && !G.ball.holed) {
    const turn = 1.15 * dt;
    if (keys['KeyA'] || keys['ArrowLeft']) G.aimAngle -= turn;
    if (keys['KeyD'] || keys['ArrowRight']) G.aimAngle += turn;
  }
  // swing meters
  const sw = G.swing;
  if (sw.stage === 'power') {
    sw.power += sw.dirP * dt * 1.15;
    if (sw.power >= 1) { sw.power = 1; sw.dirP = -1; }
    if (sw.power <= 0) { sw.power = 0; sw.dirP = 1; }
  } else if (sw.stage === 'acc') {
    sw.acc += sw.dirA * dt * 1.7;
    if (sw.acc >= 1) { sw.acc = 1; sw.dirA = -1; }
    if (sw.acc <= -1) { sw.acc = -1; sw.dirA = 1; }
  }
  // meter DOM
  $('power-fill').style.width = `${(sw.stage === 'idle' ? 0 : sw.power) * 100}%`;
  $('power-needle').style.left = `${(sw.stage === 'idle' ? 0 : sw.power) * 100}%`;
  $('acc-needle').style.left = `${50 + (sw.stage === 'acc' ? sw.acc * 48 : 0)}%`;
  $('acc-needle').style.background = sw.stage === 'acc' && Math.abs(sw.acc) < 0.18 ? '#00ff66' : '#ffcc00';
  if (G.started && sw.stage === 'idle' && G.ball.rest && !G.ball.holed)
    $('swing-hint').innerHTML = `HOLD <b>SPACE</b> — POWER ▸ ACCURACY ▸ STRIKE`;
  if (sw.stage === 'power') $('swing-hint').innerHTML = `LOCK POWER — <b>SPACE</b>`;
  if (sw.stage === 'acc') $('swing-hint').innerHTML = `HIT THE GREEN ZONE — <b>SPACE</b>`;

  stepBall(dt);

  // ball mesh
  ballMesh.position.copy(G.ball.pos);
  if (!G.ball.rest) ballMesh.rotation.x += dt * 6;
  const halo = ballMesh.getObjectByName('halo');
  if (halo) { halo.rotation.x = Math.PI / 2 + Math.sin(now * 0.003) * 0.2; halo.rotation.y += dt; }
  // holed sink animation
  if (G.ball.holed && G.ball.sunk < 1) {
    G.ball.sunk += dt;
    ballMesh.position.y -= dt * 0.8;
    ballMesh.scale.setScalar(Math.max(0.2, 1 - G.ball.sunk * 0.7));
  } else if (!G.ball.holed) ballMesh.scale.setScalar(1);
  // flag wave
  if (flagGroup) flagGroup.children[1].rotation.y = Math.sin(now * 0.004) * 0.35;

  updateAim();
  updateCamera(dt);
  if ((animate.f = (animate.f || 0) + 1) % 6 === 0) { updateHUD(); drawMinimap(); }
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
