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

// ---------- courses: real Vespra Hills nines + procedural wire tour ----------
// Yardages: Still Valley blue tees (Offcourse), Sand Hills (GolfView).
// Valley = low relief + creek water; ridge = high relief + dense hardwoods.
const YD = 0.9144; // yards -> metres
const COURSES = [
  {
    id: 'still', name: 'STILL VALLEY', sub: 'VESPRA HILLS GC • MINESING, ON • PAR 36',
    desc: 'VALLEY LAND • CREEK • WARREN 2006',
    pars: [4, 5, 4, 3, 4, 4, 4, 3, 5],
    yards: [420, 540, 340, 222, 412, 444, 371, 150, 562],
    seed: 6101, relief: 0.8, greenBase: 0.5, greenVar: 2.5,
    trees: 26, bunkers: [2, 4], waterR: [20, 30],
  },
  {
    id: 'sand', name: 'SAND HILLS', sub: 'VESPRA HILLS GC • MINESING, ON • PAR 35',
    desc: 'RIDGE • HARDWOODS • DOGLEG FINISH',
    pars: [4, 4, 3, 5, 3, 4, 3, 5, 4],
    yards: [392, 413, 189, 531, 178, 430, 165, 500, 434],
    seed: 6207, relief: 1.35, greenBase: 4, greenVar: 5,
    trees: 46, bunkers: [3, 5], waterR: [12, 18],
  },
  {
    id: 'wire', name: 'WIRE TOUR', sub: 'PROCEDURAL • 9 HOLES • PAR 35',
    desc: 'PURE LINES • SEEDED CHAOS',
    pars: [4, 3, 5, 4, 4, 3, 5, 4, 3],
    yards: null, // generated
    seed: 1986, relief: 1.0, greenBase: 2, greenVar: 4,
    trees: 34, bunkers: [2, 4], waterR: [17, 28],
  },
];
const N_HOLES = 9;
function coursePars() { return COURSES[G.course].pars; }
const WORLD = 620;            // half-extent of playable area (fits 514 m championship holes)
// Fixed physics timestep: 120 Hz. Rendering runs independently at display rate.
const FIXED_DT = 1 / 120;
const GRAVITY = 9.81;         // m/s^2
const BALL_MASS = 0.0459;     // kg
const BALL_RADIUS = 0.02135;  // m (real ball; used for aero forces)
const BALL_VIS_R = 0.35;      // m (visual wire sphere radius; used for ground contact/render)
const AIR_DENSITY = 1.225;    // kg/m^3 at sea level
const CD = 0.22;              // drag coefficient (dimpled ball, lively arcade air)
const CL_SLOPE = 0.75;        // lift slope vs spin parameter (tour-like carry)
const CL_MAX = 0.32;          // lift coefficient cap
const HOLE_CAPTURE_R = 0.55;  // visual cup radius (real hole: 0.108 m diameter/2 — scaled up so it is playable)
const HOLE_MAX_SPEED = 1.9;   // m/s capture limit (spec: 1.6; +margin for visual scale)
const CLUBS = [
  // maxHeadSpeed ~= tour clubhead speed; smash transfers to ball speed.
  // Driver ~70 m/s ball speed, ~50+ rps backspin. Wedge slower, much more spin.
  // Putter tuned so a full stroke rolls ~20 m on a normal green.
  { name: 'DRIVER', max: 260, maxHeadSpeed: 95, quality: 0.85, baseLoft: 12 * Math.PI / 180, backspin: 320, sideSpin: 70, key: '1' },
  { name: 'IRON',   max: 170, maxHeadSpeed: 72, quality: 0.80, baseLoft: 22 * Math.PI / 180, backspin: 480, sideSpin: 45, key: '2' },
  { name: 'WEDGE',  max: 95,  maxHeadSpeed: 50, quality: 0.75, baseLoft: 36 * Math.PI / 180, backspin: 680, sideSpin: 28, key: '3' },
  { name: 'PUTTER', max: 25,  maxHeadSpeed: 12, quality: 0.60, baseLoft: 2.5 * Math.PI / 180, backspin: 12, sideSpin: 6, key: '4' },
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
scene.fog = new THREE.Fog(0x000000, 150, 1500);
const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 3000);

// ---------- game state ----------
const G = {
  started: false,
  course: 0,           // index into COURSES
  holeIndex: 0,
  strokes: 0,
  scores: [],          // per-hole strokes
  totalVsPar: 0,
  club: 0,
  aimAngle: 0,         // radians, 0 = -Z (toward default pin)
  // Core sim ball: position/velocity/spin/state. pos/vel/rest/flying/holed
  // are legacy aliases kept in sync for HUD/camera code.
  ball: null,
  prevPos: new THREE.Vector3(),   // for OB/water drops
  swing: { stage: 'idle', power: 0, acc: 0, t: 0, dirP: 1, dirA: 1 },
  loftAdjust: 0,          // radians, player loft tweak (W/S, dpad)
  spinTweak: { x: 0, y: 0 }, // -1..1 sidespin/backspin tweak (IJKL, right stick, spin pad)
  aimAssist: true,        // predicted-trajectory overlay toggle (Y / Triangle / X)
  paused: false,
  curTrail: [],           // live shot trail (for replay)
  lastTrail: [],          // previous finished shot (for replay ghost)
  replay: { active: false, t: 0 },
  camMode: 0,          // 0 follow, 1 broadcast, 2 top, 3 green
  orbit: { yaw: 0, pitch: 0.38, dist: 16 },
  dragging: false,
  msgTimer: 0,
  pickingUp: false,
};

// ---------- hole data ----------
let H = null; // current hole course object

// Core ball factory: state is 'tee' | 'air' | 'ground' | 'rest' | 'hole' | 'water'
function makeBall() {
  const pos = new THREE.Vector3();
  const vel = new THREE.Vector3();
  const b = {
    position: pos, velocity: vel,
    pos, vel, // aliases
    spin: new THREE.Vector3(),
    state: 'tee',
    rest: true, flying: false, holed: false, sunk: 0,
  };
  return b;
}
function syncBallFlags() {
  const b = G.ball;
  b.pos.copy(b.position); // keep alias refs identical content (same object actually)
  b.vel.copy(b.velocity);
  b.rest = (b.state === 'tee' || b.state === 'rest');
  b.flying = (b.state === 'air');
  b.holed = (b.state === 'hole');
}
G.ball = makeBall();

function buildHoleSpec(index) {
  const course = COURSES[G.course];
  const rnd = mulberry32(course.seed + index * 7919);
  const par = course.pars[index];
  const dist = course.yards
    ? course.yards[index] * YD
    : par === 3 ? 150 + rnd() * 45 : par === 4 ? 300 + rnd() * 90 : 450 + rnd() * 90;
  const dirAng = (index * 0.55) + (rnd() - 0.5) * 0.5; // fan the holes around
  const dirX = Math.sin(dirAng), dirZ = -Math.cos(dirAng);
  const tee = new THREE.Vector3(0, 0, 0);
  const green = new THREE.Vector3(dirX * dist, 0, dirZ * dist);
  const greenH = course.greenBase + rnd() * course.greenVar;
  green.y = greenH;
  // dogleg mids (Sand Hills #9 style: late bend)
  const perpX = -dirZ, perpZ = dirX;
  const bend = index === 8 && course.id === 'sand' ? 70 : 0;
  const d1 = (rnd() - 0.5) * 90, d2 = (rnd() - 0.5) * 90 + bend;
  const midA = new THREE.Vector3(dirX * dist * 0.36 + perpX * d1, 0, dirZ * dist * 0.36 + perpZ * d1);
  const midB = new THREE.Vector3(dirX * dist * 0.7 + perpX * d2, 0, dirZ * dist * 0.7 + perpZ * d2);
  midA.y = lerp(0, greenH, 0.36); midB.y = lerp(0, greenH, 0.7);
  const line = [tee.clone(), midA, midB, green.clone()];

  // water: off to the side of mid-fairway (Still Valley creek runs bigger)
  const side = rnd() > 0.5 ? 1 : -1;
  const wT = 0.35 + rnd() * 0.35;
  const wBase = new THREE.Vector3(
    dirX * dist * wT + perpX * side * (34 + rnd() * 22),
    0,
    dirZ * dist * wT + perpZ * side * (34 + rnd() * 22));
  const water = { x: wBase.x, z: wBase.z, r: course.waterR[0] + rnd() * (course.waterR[1] - course.waterR[0]), level: 0 };
  // bunkers: near green + one fairway (sandy subsoil = more on Sand Hills)
  const bunkers = [];
  const nB = course.bunkers[0] + Math.floor(rnd() * (course.bunkers[1] - course.bunkers[0] + 1));
  for (let i = 0; i < nB; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = i === 0 ? 20 + rnd() * 14 : 10 + rnd() * 16;
    bunkers.push({ x: green.x + Math.cos(a) * rr, z: green.z + Math.sin(a) * rr, r: 3.5 + rnd() * 3 });
  }
  // trees (Sand Hills: dense mature hardwoods on the ridges)
  const trees = [];
  const launchLen = line[0].distanceTo(line[1]);
  let guard = 0;
  while (trees.length < course.trees && guard++ < 1200) {
    const x = (rnd() - 0.5) * 1240, z = (rnd() - 0.5) * 1240;
    // keep clear of corridor / green / tee / water
    const dc = corridorDist(x, z, line).d;
    if (dc < 22) continue;
    // ...plus a wider funnel off the tee so an opening drive can't be
    // thrown straight back onto the box by one overhanging canopy
    const dl = distToSeg2D(x, z, line[0].x, line[0].z, line[1].x, line[1].z);
    if (dl.t * launchLen < 90 && dl.d < 30) continue;
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
  return { index, par, dist, tee, green, greenH, line, water, bunkers, trees, wind, pin, rndSeed: course.seed + index * 7919, relief: course.relief };
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
    const b = baseHeight(x, z, spec.rndSeed * 0.001) * (spec.relief || 1);
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
    return { type: 'water', h, ...SURFACE_PHYS.water };
  for (const bk of H.spec.bunkers) {
    if (Math.hypot(x - bk.x, z - bk.z) < bk.r) return { type: 'sand', h, ...SURFACE_PHYS.sand };
  }
  if (Math.hypot(x - H.spec.green.x, z - H.spec.green.z) < 13) return { type: 'green', h, ...SURFACE_PHYS.green };
  if (Math.hypot(x - H.spec.tee.x, z - H.spec.tee.z) < 6.5) return { type: 'tee', h, ...SURFACE_PHYS.tee };
  if (corridorDist(x, z, H.spec.line).d < 13) return { type: 'fairway', h, ...SURFACE_PHYS.fairway };
  return { type: 'rough', h, ...SURFACE_PHYS.rough };
}

// Surface physics table: restitution / friction / roll / spin interaction
const SURFACE_PHYS = {
  green:   { restitution: 0.35, friction: 0.06, rollFriction: 0.32, spinGrip: 1.0, spinDecay: 0.55 },
  fairway: { restitution: 0.45, friction: 0.12, rollFriction: 0.55, spinGrip: 0.7, spinDecay: 0.5 },
  tee:     { restitution: 0.45, friction: 0.10, rollFriction: 0.55, spinGrip: 0.5, spinDecay: 0.5 },
  rough:   { restitution: 0.22, friction: 0.35, rollFriction: 1.15, spinGrip: 0.4, spinDecay: 0.65 },
  sand:    { restitution: 0.08, friction: 0.65, rollFriction: 1.9, spinGrip: 0.3, spinDecay: 0.85 },
  water:   { restitution: 0.0, friction: 1.0, rollFriction: 3.0, spinGrip: 0, spinDecay: 1.0 },
};

// Terrain heightfield accessors (collision geometry, separate from visuals)
function getTerrainHeight(x, z) { return H.groundHeight(x, z); }
function getTerrainNormal(x, z, out = new THREE.Vector3()) {
  const e = 0.6;
  const hx = getTerrainHeight(x + e, z) - getTerrainHeight(x - e, z);
  const hz = getTerrainHeight(x, z + e) - getTerrainHeight(x, z - e);
  out.set(-hx / (2 * e), 1, -hz / (2 * e)).normalize();
  return out;
}

// ---------- scene builders (ALL wireframe) ----------
let courseGroup = null;
let ballMesh, ghostMesh, aimLine, aimMarker, trailLine, flagGroup, pinMesh;
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
  const SIZE = 1400, SEG = 128;
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
  if (!ghostMesh) {
    ghostMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), wireMat(0x00ffee, 1));
    ghostMesh.visible = false;
    scene.add(ghostMesh);
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
  G.ball.position.set(spec.tee.x, ty + BALL_VIS_R, spec.tee.z);
  G.ball.velocity.set(0, 0, 0);
  G.ball.spin.set(0, 0, 0);
  G.ball.state = 'tee'; G.ball.sunk = 0;
  syncBallFlags();
  G.prevPos.copy(G.ball.position);
  trailPts.length = 0; updateTrail();
  // aim at pin
  const dx = spec.pin.x - spec.tee.x, dz = spec.pin.z - spec.tee.z;
  G.aimAngle = Math.atan2(dx, -dz); // angle from -Z axis... define fwd=(sin a, -cos a)
  G.orbit.yaw = 0; G.orbit.pitch = 0.38; G.orbit.dist = 16;
  // auto club: driver off tee
  G.club = spec.par === 3 ? 1 : 0;
  G.swing.stage = 'idle'; G.swing.power = 0; G.swing.acc = 0;
  // shot-shaping tweaks must never leak between holes/shots — a stuck
  // loft would silently shorten every drive with no obvious cause
  G.loftAdjust = 0; G.spinTweak.x = 0; G.spinTweak.y = 0;
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
  if (!G.started || G.paused) return;
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

// Impact model: power -> clubhead speed -> ball speed via smash factor,
// loft -> launch angle, accuracy -> sidespin (draw/fade).
function strike() {
  const s = G.swing;
  const club = CLUBS[G.club];
  const b = G.ball;
  const surf = getSurface(b.position.x, b.position.z);
  const lie = surf.type;
  const meter = clamp(s.power, 0.05, 1);
  const accErr = clamp(s.acc, -1, 1);
  // Distance scales with ball-speed², so a linear meter would make 50% power
  // go ~25% distance — mid-power putts/chips would always come up dying.
  // Square-root the meter: distance comes out roughly linear in the needle,
  // full power is unchanged. (Spin still uses the raw meter.)
  const effMeter = Math.sqrt(Math.max(0.02, meter));
  // Player loft/spin tweaks from W/S + IJKL / dpad + right stick / spin pad
  const playerLoftAdjust = clamp(G.loftAdjust, -0.09, 0.09);

  const clubSpeed = effMeter * club.maxHeadSpeed * lieFactor(lie, G.club);
  const smash = 0.68 + club.quality * 0.12;
  let ballSpeed = clubSpeed * smash;
  if (G.club === 3 && lie !== 'green') ballSpeed *= 0.7;
  if (G.club !== 3 && lie === 'green') ballSpeed *= 0.5;

  const launchAngle = club.baseLoft + playerLoftAdjust;
  const az = G.aimAngle + accErr * 0.045 + (lie === 'rough' || lie === 'sand' ? (Math.random() - 0.5) * 0.03 : 0);
  const direction = new THREE.Vector3(Math.sin(az), 0, -Math.cos(az));

  const v = new THREE.Vector3(
    Math.cos(launchAngle) * direction.x,
    Math.sin(launchAngle),
    Math.cos(launchAngle) * direction.z
  ).normalize().multiplyScalar(Math.max(1.5, ballSpeed));

  // Spin: backspin about the shot's lateral axis + sidespin about vertical.
  // Backspin (upward Magnus) lengthens carry; sidespin curves draw/fade.
  // spinTweak.y adds/reduces backspin, spinTweak.x adds draw/fade.
  const backspinAmount = club.backspin * (0.35 + 0.65 * meter) * (1 + clamp(G.spinTweak.y, -1, 1) * 0.3) * (lie === 'rough' || lie === 'sand' ? 0.6 : 1);
  const sidespinAmount = accErr * club.sideSpin + clamp(G.spinTweak.x, -1, 1) * 30;
  const sideAxis = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
  const spin = sideAxis.multiplyScalar(backspinAmount)
    .add(new THREE.Vector3(0, sidespinAmount, 0));

  G.prevPos.copy(b.position);
  b.velocity.copy(v);
  b.spin.copy(spin);
  b.state = (G.club === 3 && v.length() < 12) ? 'ground' : 'air';
  if (G.club === 3) {
    // putter: keep launch nearly flat
    b.velocity.y = Math.min(b.velocity.y, 0.8);
    if (getSurface(b.position.x, b.position.z).type === 'green') b.state = 'ground';
  }
  syncBallFlags();
  G.strokes++;
  trailPts.length = 0; G.curTrail.length = 0;
  AudioSys.swing();
  // Honest distance promise: simulate the shot with the same integrator.
  // Airborne clubs → predicted carry (first landing); putter → rolling estimate.
  let promiseM;
  if (G.club === 3) {
    const s0 = getSurface(b.position.x, b.position.z);
    const aRoll = (s0.rollFriction || 0.5) * GRAVITY * 0.55;
    promiseM = Math.round((v.length() ** 2) / (2 * Math.max(0.5, aRoll)));
  } else {
    const sim = predictShot(b.position, v, spin);
    const last = sim[sim.length - 1];
    promiseM = Math.round(Math.hypot(last.x - b.position.x, last.z - b.position.z));
  }
  const loftTxt = Math.abs(G.loftAdjust) > 0.005 ? ` LOFT ${(G.loftAdjust * 180 / Math.PI).toFixed(1)}°` : '';
  const quality = Math.abs(accErr) < 0.18 ? 'PURE!' : Math.abs(accErr) < 0.5 ? 'OK' : 'WILD!';
  $('swing-hint').innerHTML = club.name + ' • ' + promiseM + 'm' + loftTxt + ' • ' + quality;
  // consume one-shot tweaks so they can't linger into future shots
  G.loftAdjust = 0; G.spinTweak.x = 0; G.spinTweak.y = 0;
  // permanent per-shot receipt: power YOU set, speed out, predicted carry
  G.lastShot = { club: club.name, power: Math.round(meter * 100), ballSpeed: Math.round(ballSpeed * 10) / 10, promise: promiseM, quality };
  renderShotInfo();
  updateHUD();
}
function renderShotInfo() {
  const el = $('shotinfo');
  if (!el) return;
  if (!G.lastShot) { el.textContent = 'NO SHOT YET — HOLD SWING/SPACE TO CHARGE'; return; }
  const s = G.lastShot;
  el.textContent = `LAST SHOT — ${s.club} • YOU SET ${s.power}% • ${s.ballSpeed} m/s • ~${s.promise}m • ${s.quality}`;
}

// --- Aerodynamics ------------------------------------------------
// F_D = 1/2 rho C_D A v^2 (opposes relative airflow), F_L = 1/2 rho C_L A v^2.
// Wind enters via relative velocity: drag uses (v - wind), so a headwind
// shortens more than a tailwind lengthens.
const _aero = { tmp: null };
function getWindForce(ballVelocity, wind) {
  const rel = ballVelocity.clone().sub(wind);
  const speed = rel.length();
  if (speed < 1e-4) return new THREE.Vector3();
  const area = Math.PI * BALL_RADIUS * BALL_RADIUS;
  return rel.normalize().multiplyScalar(-0.5 * AIR_DENSITY * speed * speed * CD * area);
}
function updateFlight(ball, dt) {
  const v = ball.velocity;
  const speed = v.length();
  const area = Math.PI * BALL_RADIUS * BALL_RADIUS;
  const wind = H.spec.wind;

  // Drag against relative airflow
  const rel = v.clone().sub(wind);
  const relSpeed = rel.length();
  const drag = relSpeed > 1e-4
    ? rel.normalize().multiplyScalar(-0.5 * AIR_DENSITY * relSpeed * relSpeed * CD * area)
    : new THREE.Vector3();

  // Magnus lift: perpendicular to velocity and spin axis, C_L grows with spin
  const magnus = new THREE.Vector3();
  const spinLen = ball.spin.length();
  if (speed > 0.5 && spinLen > 1e-3) {
    const spinAxis = ball.spin.clone().normalize();
    const mdir = spinAxis.clone().cross(v);
    if (mdir.lengthSq() > 1e-6) {
      mdir.normalize();
      const spinParameter = (spinLen * BALL_RADIUS) / Math.max(speed, 0.001);
      // Slope matches measured dimpled-ball lift (driver S≈0.09 → CL≈0.07,
      // ≈7 m/s² of carry-extending lift sustains tour-like flight).
      const CL = Math.min(CL_MAX, CL_SLOPE * spinParameter);
      const liftMag = 0.5 * AIR_DENSITY * speed * speed * CL * area;
      magnus.copy(mdir).multiplyScalar(liftMag);
    }
  }

  const acceleration = new THREE.Vector3(0, -GRAVITY, 0)
    .add(drag.divideScalar(BALL_MASS))
    .add(magnus.divideScalar(BALL_MASS));

  ball.velocity.addScaledVector(acceleration, dt);
  ball.position.addScaledVector(ball.velocity, dt);
  ball.spin.multiplyScalar(Math.max(0, 1 - 0.04 * dt)); // slow spin decay in flight
  syncBallFlags();
}

// ---------- ground / rolling / hole ----------
const _n = new THREE.Vector3();
function groundCollision(ball) {
  const groundY = getTerrainHeight(ball.position.x, ball.position.z);
  getTerrainNormal(ball.position.x, ball.position.z, _n);
  const normal = _n.clone();
  if (ball.position.y <= groundY + BALL_VIS_R) {
    ball.position.y = groundY + BALL_VIS_R;
    const surface = getSurface(ball.position.x, ball.position.z);
    if (surface.type === 'water') return 'water';
    const restitution = surface.restitution;
    const friction = surface.friction;
    // Split velocity into normal and tangential parts
    const vn = normal.clone().multiplyScalar(ball.velocity.dot(normal));
    const vt = ball.velocity.clone().sub(vn);
    // Bounce
    vn.multiplyScalar(-restitution);
    // Friction and spin interaction
    vt.multiplyScalar(1 - friction);
    ball.velocity.copy(vt).add(vn);
    // Backspin checks / pulls the ball on landing
    const fwd = ball.velocity.clone();
    if (fwd.lengthSq() > 1e-6) {
      fwd.normalize();
      const backspinEffect = -ball.spin.dot(new THREE.Vector3(-fwd.z, 0, fwd.x)) * surface.spinGrip * 0.004;
      ball.velocity.addScaledVector(fwd, backspinEffect);
    }
    // Kill spin after impact
    ball.spin.multiplyScalar(1 - surface.spinDecay);
    AudioSys.bounce();
    if (ball.velocity.length() < 0.9) ball.state = 'ground';
    else if (Math.abs(ball.velocity.y) < 0.6 && ball.velocity.length() < 8) {
      ball.velocity.y = 0;
      ball.state = 'ground';
    }
    syncBallFlags();
    return 'bounced';
  }
  return null;
}

function updateRolling(ball, dt) {
  const groundY = getTerrainHeight(ball.position.x, ball.position.z);
  getTerrainNormal(ball.position.x, ball.position.z, _n);
  const normal = _n.clone();
  // Gravity component along slope — subtle (2-3%) green slopes visibly break putts
  const slopeAcceleration = new THREE.Vector3(0, -GRAVITY, 0)
    .addScaledVector(normal, GRAVITY * normal.y);
  ball.velocity.addScaledVector(slopeAcceleration, dt);
  const surface = getSurface(ball.position.x, ball.position.z);
  const rollingResistance = surface.rollFriction * GRAVITY * 0.55;
  const sp = Math.hypot(ball.velocity.x, ball.velocity.z);
  if (sp > 0) {
    const ns = Math.max(0, sp - rollingResistance * dt);
    ball.velocity.x *= ns / sp; ball.velocity.z *= ns / sp;
  }
  ball.velocity.y = 0;
  ball.position.addScaledVector(ball.velocity, dt);
  ball.position.y = getTerrainHeight(ball.position.x, ball.position.z) + BALL_VIS_R;
  if (ball.velocity.length() < 0.12) {
    getTerrainNormal(ball.position.x, ball.position.z, _n);
    const slope = Math.hypot(_n.x, _n.z) / Math.max(_n.y, 0.2);
    if (slope < 0.035 || surface.type !== 'green') {
      ball.velocity.set(0, 0, 0);
      ball.state = 'rest';
      syncBallFlags();
      onBallRest();
    }
  }
  syncBallFlags();
}

// Capture requires: inside radius + near cup height + slow enough.
// Too fast across the cup -> lip-out impulse instead.
function checkHole(ball) {
  const hole = H.spec.pin;
  const dx = ball.position.x - hole.x;
  const dz = ball.position.z - hole.z;
  const horizontalDistance = Math.hypot(dx, dz);
  if (horizontalDistance >= 1.1) return null;
  const cupY = H.spec.greenH;
  if (ball.position.y > cupY + 0.6) return null;
  const spd = ball.velocity.length();
  if (horizontalDistance < HOLE_CAPTURE_R && spd < HOLE_MAX_SPEED) {
    ball.state = 'hole';
    syncBallFlags();
    doHole();
    return 'holed';
  }
  if (horizontalDistance < 0.9 && spd >= HOLE_MAX_SPEED && spd < 8) {
    const nx = dx / (horizontalDistance || 1), nz = dz / (horizontalDistance || 1);
    const dot = ball.velocity.x * nx + ball.velocity.z * nz;
    ball.velocity.x -= 1.6 * dot * nx;
    ball.velocity.z -= 1.6 * dot * nz;
    ball.velocity.multiplyScalar(0.55);
    flashSmall('LIP OUT!');
    return 'lip';
  }
  return null;
}

// One fixed-dt physics step. Render runs independently.
function physicsStep(dt) {
  const ball = G.ball;
  if (ball.state === 'air') {
    updateFlight(ball, dt);
    // tree canopy hit
    for (const t of H.spec.trees) {
      const dx = ball.position.x - t.x, dz = ball.position.z - t.z;
      if (dx * dx + dz * dz < 9 && ball.position.y < t.h && ball.position.y > t.h - 12) {
        ball.velocity.x *= -0.35; ball.velocity.z *= -0.35; ball.velocity.y *= 0.4;
        AudioSys.bounce();
      }
    }
    // pin strike
    {
      const dx = ball.position.x - H.spec.pin.x, dz = ball.position.z - H.spec.pin.z;
      if (dx * dx + dz * dz < 0.35 && ball.position.y < H.spec.greenH + 3.4 && ball.position.y > H.spec.greenH) {
        ball.velocity.x *= -0.3; ball.velocity.z *= -0.3;
        AudioSys.bounce();
      }
    }
    const hit = groundCollision(ball);
    if (hit === 'water') { doWater(); return; }
    checkHole(ball);
    if (Math.abs(ball.position.x) > WORLD || Math.abs(ball.position.z) > WORLD) { doOB(); return; }
  } else if (ball.state === 'ground') {
    updateRolling(ball, dt);
    if (ball.state !== 'rest' && ball.state !== 'hole') {
      const s = getSurface(ball.position.x, ball.position.z);
      if (s.type === 'water') { doWater(); return; }
      // trunk collision
      for (const t of H.spec.trees) {
        const dx = ball.position.x - t.x, dz = ball.position.z - t.z, d = Math.hypot(dx, dz);
        if (d < 0.9 && ball.position.y < t.h - 6) {
          const nx = dx / (d || 1), nz = dz / (d || 1);
          ball.position.x = t.x + nx * 0.9; ball.position.z = t.z + nz * 0.9;
          const dot = ball.velocity.x * nx + ball.velocity.z * nz;
          ball.velocity.x -= 2 * dot * nx; ball.velocity.z -= 2 * dot * nz;
          ball.velocity.multiplyScalar(0.4);
          AudioSys.bounce();
        }
      }
      checkHole(ball);
      if (Math.abs(ball.position.x) > WORLD || Math.abs(ball.position.z) > WORLD) { doOB(); return; }
    }
  }
}

// Predicted shot line: same integrator as the live shot, on a scratch
// state, so the preview matches real flight (aero + first bounces).
function predictShot(startPos, startVel, startSpin, maxPts = 60) {
  const p = startPos.clone(), v = startVel.clone(), spin = startSpin.clone();
  const pts = [p.clone()];
  const dt = 1 / 60;
  const scratch = { position: p, velocity: v, spin };
  for (let i = 0; i < 360 && pts.length < maxPts; i++) {
    // inline flight without tree/pin fx
    const speed = v.length();
    const area = Math.PI * BALL_RADIUS * BALL_RADIUS;
    const wind = H.spec.wind;
    const rel = v.clone().sub(wind);
    const rs = rel.length();
    const drag = rs > 1e-4 ? rel.normalize().multiplyScalar(-0.5 * AIR_DENSITY * rs * rs * CD * area) : new THREE.Vector3();
    const mag = new THREE.Vector3();
    if (speed > 0.5 && spin.length() > 1) {
      const ax = spin.clone().normalize();
      const md = ax.cross(v);
      if (md.lengthSq() > 1e-6) {
        md.normalize();
        const sp = (spin.length() * BALL_RADIUS) / Math.max(speed, 0.001);
        mag.copy(md).multiplyScalar(0.5 * AIR_DENSITY * speed * speed * Math.min(CL_MAX, CL_SLOPE * sp) * area);
      }
    }
    v.addScaledVector(new THREE.Vector3(0, -GRAVITY, 0).add(drag.divideScalar(BALL_MASS)).add(mag.divideScalar(BALL_MASS)), dt);
    p.addScaledVector(v, dt);
    const g = H.groundHeight(p.x, p.z);
    if (p.y <= g + BALL_VIS_R) break; // stop preview at first landing
    if (i % 6 === 0) pts.push(p.clone());
  }
  pts.push(p.clone());
  return pts;
}

function updateTrail() {
  if (!trailLine) return;
  trailLine.geometry.dispose();
  trailLine.geometry = new THREE.BufferGeometry().setFromPoints(trailPts.length ? trailPts : [G.ball.pos, G.ball.pos]);
}

function doWater() {
  AudioSys.splash();
  G.ball.state = 'water';
  G.strokes += 1; // penalty
  G.ball.position.copy(G.prevPos);
  G.ball.position.y = H.groundHeight(G.ball.position.x, G.ball.position.z) + BALL_VIS_R;
  // nudge away from water
  const w = H.spec.water;
  const dx = G.ball.position.x - w.x, dz = G.ball.position.z - w.z;
  const d = Math.hypot(dx, dz) || 1;
  G.ball.position.x = w.x + dx / d * (w.r + 4);
  G.ball.position.z = w.z + dz / d * (w.r + 4);
  G.ball.position.y = H.groundHeight(G.ball.position.x, G.ball.position.z) + BALL_VIS_R;
  G.ball.velocity.set(0, 0, 0); G.ball.spin.set(0, 0, 0);
  G.ball.state = 'rest';
  syncBallFlags();
  flash('SPLASH!', '+1 PENALTY • DROP');
  autoClub();
  updateHUD();
}

function doOB() {
  G.strokes += 1;
  G.ball.position.copy(G.prevPos);
  G.ball.position.y = H.groundHeight(G.ball.position.x, G.ball.position.z) + BALL_VIS_R;
  G.ball.velocity.set(0, 0, 0); G.ball.spin.set(0, 0, 0);
  G.ball.state = 'rest';
  syncBallFlags();
  flash('OUT OF BOUNDS', '+1 PENALTY');
  autoClub();
  updateHUD();
}

function doHole() {
  const b = G.ball;
  b.state = 'hole'; b.velocity.set(0, 0, 0);
  b.position.set(H.spec.pin.x, H.spec.greenH + 0.1, H.spec.pin.z);
  syncBallFlags();
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
  if (G.curTrail.length > 3) G.lastTrail = G.curTrail.slice();
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
  const brandSub = document.querySelector('#topbar .brand span');
  if (brandSub) brandSub.textContent = `// ${COURSES[G.course].name}`;
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
  const loftEl = $('hud-loft'), spinEl = $('hud-spin');
  if (loftEl) loftEl.textContent = `${G.loftAdjust >= 0 ? '+' : ''}${(G.loftAdjust * 180 / Math.PI).toFixed(1)}°`;
  if (spinEl) spinEl.textContent = `${G.spinTweak.x.toFixed(1)} / ${G.spinTweak.y.toFixed(1)}`;
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
  const pars = coursePars();
  const h2 = document.querySelector('#scorecard h2');
  if (h2) h2.textContent = `SCORECARD • ${COURSES[G.course].name}`;
  let html = '<tr><th>HOLE</th>' + pars.map((_, i) => `<th>${i + 1}</th>`).join('') + '<th>TOT</th></tr>';
  html += '<tr><th>PAR</th>' + pars.map((p) => `<td>${p}</td>`).join('') + `<td>${pars.reduce((a, b) => a + b, 0)}</td></tr>`;
  html += '<tr><th>YOU</th>' + pars.map((_, i) => `<td>${G.scores[i] ?? '–'}</td>`).join('') +
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

// ---------- aim visuals (predicted trajectory = same integrator) ----------
function aimShotEstimate(powerMeter) {
  const club = CLUBS[G.club];
  const b = G.ball;
  const surf = getSurface(b.position.x, b.position.z);
  const meter = clamp(powerMeter, 0.05, 1);
  const effMeter = Math.sqrt(Math.max(0.02, meter)); // must match strike()
  const clubSpeed = effMeter * club.maxHeadSpeed * lieFactor(surf.type, G.club);
  const smash = 0.68 + club.quality * 0.12;
  let ballSpeed = Math.max(1.5, clubSpeed * smash);
  if (G.club === 3 && surf.type !== 'green') ballSpeed *= 0.7;
  const launchAngle = club.baseLoft;
  const direction = aimDir();
  const v = new THREE.Vector3(
    Math.cos(launchAngle) * direction.x, Math.sin(launchAngle), Math.cos(launchAngle) * direction.z
  ).normalize().multiplyScalar(ballSpeed);
  if (G.club === 3) v.y = Math.min(v.y, 0.8);
  const sideAxis = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
  const spin = sideAxis.multiplyScalar(club.backspin * (0.35 + 0.65 * meter));
  return { v, spin };
}
function updateAim() {
  if (!aimLine) return;
  const show = G.ball.rest && !G.ball.holed && G.started && G.aimAssist;
  aimLine.visible = show; aimMarker.visible = show;
  if (!show) return;
  const b = G.ball;
  const meter = G.swing.stage === 'power' ? Math.max(0.15, G.swing.power) : 0.85;
  const { v, spin } = aimShotEstimate(G.club === 3 ? meter : meter);
  const pts = G.club === 3
    ? (() => { // putter: flat ground preview
        const dir = aimDir();
        const carry = CLUBS[3].max * meter * 0.85;
        const ex = b.position.x + dir.x * carry, ez = b.position.z + dir.z * carry;
        return [b.position.clone().add(new THREE.Vector3(0, 0.2, 0)),
          new THREE.Vector3(ex, H.groundHeight(ex, ez) + 0.3, ez)];
      })()
    : predictShot(b.position, v, spin);
  aimLine.geometry.dispose();
  aimLine.geometry = new THREE.BufferGeometry().setFromPoints(pts.length > 1 ? pts : [b.position, b.position]);
  aimLine.computeLineDistances();
  aimMarker.position.copy(pts[pts.length - 1]);
  const s = 1 + Math.sin(performance.now() * 0.006) * 0.12;
  aimMarker.scale.set(s, 1, s);
}

// ---------- unified input: one abstract map, every platform ----------
// Gameplay reads ONLY `Input.state` — never raw keyboard/touch/gamepad.
// Standard gamepad layout: 0 bottom(A/Cross/B) 1 right(B/Circle/A)
// 2 left(X/Square/Y) 3 top(Y/Triangle/X) 4 LB 5 RB 6 LT 7 RT 8 view 9 menu
// 12-15 dpad, axes 0/1 left stick, 2/3 right stick.
const keys = {};
const touchState = { aimX: 0, aimY: 0, cameraX: 0, cameraY: 0, swing: 0, accuracy: 0, spinX: 0, spinY: 0 };

class InputManager {
  constructor() {
    const blank = () => ({
      aimX: 0, aimY: 0, cameraX: 0, cameraY: 0, swing: 0, accuracy: 0,
      loft: 0, spinX: 0, spinY: 0, clubCycle: 0, clubNext: false, clubPrev: false,
      confirm: false, cancel: false, pause: false, map: false, replay: false,
      aimAssist: false, zoom: 0,
    });
    this.state = blank();
    this.keyboard = blank();
    this.gamepad = blank();
    this.touch = blank();
    this.prev = blank(); // edge detection on merged swing/club buttons
  }
  updateKeyboard() {
    const k = this.keyboard;
    k.aimX = ((keys['KeyD'] || keys['ArrowRight']) ? 1 : 0) - ((keys['KeyA'] || keys['ArrowLeft']) ? 1 : 0);
    k.aimY = 0;
    k.cameraX = (keys['KeyE'] ? 1 : 0) - (keys['KeyQ'] ? 1 : 0);
    k.cameraY = 0;
    k.swing = keys['Space'] ? 1 : 0;
    // A/D doubles as analog accuracy nudge during the impact window
    k.accuracy = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
    k.loft = (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) - ((keys['KeyS'] || keys['ArrowDown']) ? 1 : 0);
    k.spinX = (keys['KeyL'] ? 1 : 0) - (keys['KeyJ'] ? 1 : 0);
    k.spinY = (keys['KeyI'] ? 1 : 0) - (keys['KeyK'] ? 1 : 0);
    k.clubCycle = 0;
    k.confirm = !!(keys['Enter'] || keys['Space']);
    k.cancel = false;
    k.pause = false; k.map = false; k.replay = false; k.aimAssist = false;
    k.zoom = (keys['KeyZ'] ? 1 : 0) - (keys['KeyX'] ? 1 : 0);
  }
  updateGamepad() {
    const pads = (typeof navigator !== 'undefined' && navigator.getGamepads) ? navigator.getGamepads() : [];
    const pad = Array.from(pads).find((p) => p && p.connected);
    const g = this.gamepad;
    if (!pad) {
      const blank = { aimX: 0, aimY: 0, cameraX: 0, cameraY: 0, swing: 0, accuracy: 0, loft: 0, spinX: 0, spinY: 0, clubCycle: 0, clubNext: false, clubPrev: false, confirm: false, cancel: false, pause: false, map: false, replay: false, aimAssist: false, zoom: 0 };
      Object.assign(g, blank);
      return;
    }
    const dz = 0.18;
    const axis = (i) => { const v = pad.axes[i] || 0; return Math.abs(v) < dz ? 0 : v; };
    const pressed = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);
    const value = (i) => (pad.buttons[i] ? pad.buttons[i].value : 0);
    g.aimX = axis(0); g.aimY = axis(1);
    g.cameraX = axis(2); g.cameraY = axis(3);
    g.swing = value(0);                       // A / Cross / B held = backswing
    g.accuracy = axis(0);                     // left-stick X during impact window
    g.loft = (pressed(12) ? 1 : 0) - (pressed(13) ? 1 : 0);   // dpad up/down
    g.spinX = axis(2); g.spinY = -axis(3);    // right stick during setup
    g.clubNext = pressed(5); g.clubPrev = pressed(4);         // RB/R1, LB/L1
    g.clubCycle = (pressed(5) ? 1 : 0) - (pressed(4) ? 1 : 0);
    g.confirm = pressed(0); g.cancel = pressed(1);
    g.pause = pressed(9);                     // Menu / Options / +
    g.map = pressed(8);                       // View / Share / -
    g.replay = pressed(2);
    g.aimAssist = pressed(3);                 // Y / Triangle / X
    g.zoom = value(7) - value(6);             // RT in / LT out (+ right stick)
  }
  updateTouch() {
    const t = this.touch;
    t.aimX = touchState.aimX; t.aimY = touchState.aimY;
    t.cameraX = touchState.cameraX; t.cameraY = touchState.cameraY;
    t.swing = touchState.swing;
    t.accuracy = touchState.accuracy;
    t.spinX = touchState.spinX; t.spinY = touchState.spinY;
    t.clubCycle = 0; t.clubNext = false; t.clubPrev = false;
    t.confirm = false; t.cancel = false; t.pause = false;
    t.map = false; t.replay = false; t.aimAssist = false;
    t.zoom = 0;
  }
  update() {
    this.updateKeyboard();
    this.updateGamepad();
    this.updateTouch();
    const s = this.state, k = this.keyboard, g = this.gamepad, t = this.touch;
    s.aimX = clamp(k.aimX + g.aimX + t.aimX, -1, 1);
    s.aimY = clamp(k.aimY + g.aimY + t.aimY, -1, 1);
    s.cameraX = clamp(k.cameraX + g.cameraX + t.cameraX, -1, 1);
    s.cameraY = clamp(k.cameraY + g.cameraY + t.cameraY, -1, 1);
    s.swing = Math.max(k.swing, g.swing, t.swing);
    s.accuracy = clamp(k.accuracy + g.accuracy + t.accuracy, -1, 1);
    s.loft = clamp(k.loft + g.loft, -1, 1);
    s.spinX = clamp(k.spinX + g.spinX + t.spinX, -1, 1);
    s.spinY = clamp(k.spinY + g.spinY + t.spinY, -1, 1);
    s.clubCycle = clamp(k.clubCycle + g.clubCycle, -1, 1);
    s.clubNext = g.clubNext; s.clubPrev = g.clubPrev;
    s.confirm = k.confirm || g.confirm;
    s.cancel = k.cancel || g.cancel;
    s.pause = g.pause;
    s.map = g.map;
    s.replay = g.replay;
    s.aimAssist = g.aimAssist;
    s.zoom = clamp(k.zoom + g.zoom, -1, 1);
  }
  // rising-edge helpers consumed once per frame by gameplay
  rose(name) { return this.state[name] > 0.1 && this.prev[name] <= 0.1; }
  fell(name) { return this.state[name] <= 0.1 && this.prev[name] > 0.1; }
  latch() { Object.assign(this.prev, this.state); }
}
const Input = new InputManager();

// Discrete keyboard actions (menus, clubs, swing taps). Analog aim/camera/
// accuracy flow through Input.state every frame — see animate().
window.addEventListener('keydown', (e) => {
  if (e.code === 'Tab') { e.preventDefault(); if (!e.repeat) { $('scorecard').classList.toggle('hidden'); renderScorecard(); } return; }
  if (e.repeat) { if (e.code === 'Space') e.preventDefault(); return; }
  keys[e.code] = true;
  AudioSys.ensure();
  // Space flows through Input rose/fell edges in animate() (press = start,
  // release = lock power, press = strike). Calling advanceSwing here too
  // would fire every stage TWICE and lock power near zero — weak shots.
  // Enter is not part of Input.swing, so it keeps the direct call.
  if (e.code === 'Enter') { e.preventDefault(); advanceSwing(); }
  if (e.code === 'Space') { e.preventDefault(); }
  if (e.code === 'Digit1') G.club = 0;
  if (e.code === 'Digit2') G.club = 1;
  if (e.code === 'Digit3') G.club = 2;
  if (e.code === 'Digit4') G.club = 3;
  if (e.code === 'KeyQ') cycleClub(-1);
  if (e.code === 'KeyE') cycleClub(1);
  if (e.code === 'KeyC') { G.camMode = (G.camMode + 1) % 4; updateHUD(); }
  if (e.code === 'KeyM') { AudioSys.muted = !AudioSys.muted; flashSmall(AudioSys.muted ? 'SOUND OFF' : 'SOUND ON'); }
  if (e.code === 'KeyN') nextHole();
  if (e.code === 'KeyO') openCourseMenu();
  if (e.code === 'KeyT') {
    if (G.holeIndex >= N_HOLES - 1 && (G.ball.holed || G.scores[N_HOLES - 1] !== undefined)) restartTour();
    else startHole(G.holeIndex);           // retry hole
  }
  if (e.code === 'KeyR') startReplay();                   // watch last shot
  if (e.code === 'KeyY') toggleAimAssist();
  if (e.code === 'Escape') togglePause();
  updateHUD();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function cycleClub(d) {
  AudioSys.ensure(); AudioSys.click();
  G.club = (G.club + d + CLUBS.length) % CLUBS.length;
  updateHUD();
}
function toggleAimAssist() {
  G.aimAssist = !G.aimAssist;
  flashSmall(G.aimAssist ? 'AIM ASSIST ON' : 'AIM ASSIST OFF');
}
function togglePause() {
  G.paused = !G.paused;
  if (G.paused) { renderScorecard(); $('scorecard').classList.remove('hidden'); flash('PAUSED', 'ESC TO RESUME • R REPLAY • T RETRY HOLE'); }
  else { $('scorecard').classList.add('hidden'); flashSmall('RESUMED'); }
}
function startReplay() {
  if (!G.lastTrail.length) { flashSmall('NO REPLAY YET'); return; }
  if (G.replay.active) return;
  G.replay.active = true; G.replay.t = 0;
  flashSmall('REPLAY ▸ LAST SHOT');
}

document.querySelectorAll('.club').forEach((el) => {
  el.addEventListener('click', () => { AudioSys.ensure(); AudioSys.click(); G.club = Number(el.dataset.club); updateHUD(); });
});
// SWING buttons (mouse + touch) are press-and-HOLD, exactly like SPACE:
// hold = charge the meter, release = set your power, next press = hit.
// A plain instant click can never build power (it would save ~0%), so there
// is deliberately NO 'click' handler here — holding is the only way.
const pointerSwing = (on) => { AudioSys.ensure(); touchState.swing = on ? 1 : 0; };
// Fallback for taps faster than the frame loop (dead clicks on slow machines):
// if no stage change registered between press and release, count the tap once.
// Safe: whenever a real hold registered (stage changed), this never fires.
let btnDownStage = null;
$('swing-btn').addEventListener('mousedown', (e) => {
  if (e.button !== undefined && e.button !== 0) return;
  btnDownStage = G.swing.stage; pointerSwing(true);
});
window.addEventListener('mouseup', () => {
  pointerSwing(false);
  if (btnDownStage !== null && btnDownStage === G.swing.stage) advanceSwing();
  btnDownStage = null;
});
function selectCourse(i) {
  AudioSys.ensure(); AudioSys.cheer();
  G.course = i;
  G.scores = []; G.totalVsPar = 0;
  G.started = true;
  $('title').classList.add('hidden');
  $('scorecard').classList.add('hidden');
  startHole(0);
  const c = COURSES[i];
  flash(`${c.name} • HOLE 1`, `PAR ${c.pars[0]} • ${Math.round(c.yards ? c.yards[0] * YD : 0)}m • GOOD LUCK`);
}
function openCourseMenu() {
  G.started = false;
  G.swing.stage = 'idle';
  renderCourseButtons();
  $('title').classList.remove('hidden');
}
function renderCourseButtons() {
  const box = $('course-btns');
  if (!box) return;
  box.innerHTML = '';
  COURSES.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'course-btn' + (i === G.course ? ' sel' : '');
    const total = c.pars.reduce((a, x) => a + x, 0);
    b.innerHTML = `▶ ${c.name} <em>PAR ${total}</em><small>${c.desc}</small>`;
    b.addEventListener('click', () => selectCourse(i));
    box.appendChild(b);
  });
}
// touch SWING button: press-and-HOLD to charge, release to set power,
// tap again to hit — same as SPACE / mouse button (see pointerSwing above)
let touchDownStage = null;
$('touch-swing').addEventListener('touchstart', (e) => { e.preventDefault(); touchDownStage = G.swing.stage; pointerSwing(true); }, { passive: false });
const touchSwingEnd = (e) => {
  e.preventDefault(); pointerSwing(false);
  if (touchDownStage !== null && touchDownStage === G.swing.stage) advanceSwing();
  touchDownStage = null;
};
$('touch-swing').addEventListener('touchend', touchSwingEnd, { passive: false });
$('touch-swing').addEventListener('touchcancel', touchSwingEnd, { passive: false });
// spin pad: drag from center -> spinTweak (x = sidespin, y = backspin +/-)
{
  const pad = $('spin-pad'), dot = $('spin-dot');
  let spinning = false;
  const setSpin = (t) => {
    const r = pad.getBoundingClientRect();
    const nx = ((t.clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((t.clientY - r.top) / r.height) * 2 - 1);
    touchState.spinX = clamp(nx, -1, 1); touchState.spinY = clamp(ny, -1, 1);
    dot.style.transform = `translate(${nx * 28}px, ${-ny * 28}px)`;
  };
  pad.addEventListener('touchstart', (e) => { spinning = true; setSpin(e.changedTouches[0]); e.preventDefault(); }, { passive: false });
  pad.addEventListener('touchmove', (e) => { if (spinning) setSpin(e.changedTouches[0]); e.preventDefault(); }, { passive: false });
  pad.addEventListener('touchend', () => { spinning = false; touchState.spinX = 0; touchState.spinY = 0; dot.style.transform = ''; }, { passive: false });
}
renderCourseButtons();
// mouse orbit (drag = camera; wheel = zoom)
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

// ---------- touch event layer ----------
// 1 finger: drag to aim (+ sets accuracy nudge during impact window).
// 2 fingers: orbit camera + pinch zoom. SWING/spin UI lives in #touch-ui.
const activeTouches = new Map();
let pinchStart = 0, pinchDist0 = 16;
function touchAim(dx, dy) {
  if (G.swing.stage === 'acc') {
    touchState.accuracy = clamp(dx / 140, -1, 1);
  } else if (G.ball.rest) {
    G.aimAngle += dx * 0.004;
  }
}
canvas.addEventListener('touchstart', (e) => {
  AudioSys.ensure();
  for (const t of e.changedTouches) activeTouches.set(t.identifier, { x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY });
  if (activeTouches.size === 2) {
    const [a, b] = [...activeTouches.values()];
    pinchStart = G.orbit.dist;
    pinchDist0 = Math.max(20, Math.hypot(a.x - b.x, a.y - b.y));
  }
  document.body.classList.add('touch');
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) {
    const r = activeTouches.get(t.identifier);
    if (!r) continue;
    const dx = t.clientX - r.x, dy = t.clientY - r.y;
    r.x = t.clientX; r.y = t.clientY;
    if (activeTouches.size === 1) touchAim(dx, dy);
    else if (activeTouches.size === 2) {
      G.orbit.yaw -= dx * 0.004;
      G.orbit.pitch = clamp(G.orbit.pitch + dy * 0.003, 0.05, 1.25);
      const [a, b] = [...activeTouches.values()];
      const d = Math.max(20, Math.hypot(a.x - b.x, a.y - b.y));
      G.orbit.dist = clamp(pinchStart * (pinchDist0 / d), 6, 70);
    }
  }
  e.preventDefault();
}, { passive: false });
const endTouch = (e) => {
  for (const t of e.changedTouches) activeTouches.delete(t.identifier);
  if (!activeTouches.size) { touchState.accuracy = 0; }
  e.preventDefault();
};
canvas.addEventListener('touchend', endTouch, { passive: false });
canvas.addEventListener('touchcancel', endTouch, { passive: false });

function nextHole() {
  if (G.holeIndex >= N_HOLES - 1) {
    // tour over: show scorecard
    renderScorecard();
    $('scorecard').classList.remove('hidden');
    const tot = G.scores.reduce((a, b) => a + b, 0);
    flash('TOUR COMPLETE', `${tot} • ${fmtScore(G.totalVsPar)} • T TO PLAY AGAIN`);
    return;
  }
  if (!G.ball.holed && !G.pickingUp) { flashSmall('FINISH THE HOLE FIRST (OR PRESS T TO RETRY HOLE)'); return; }
  AudioSys.click();
  startHole(G.holeIndex + 1);
}
function restartTour() {
  G.scores = []; G.totalVsPar = 0;
  $('scorecard').classList.add('hidden');
  startHole(0);
}

// ---------- main loop: fixed-step physics, independent render ----------
buildSky();
startHole(0);
renderScorecard();
updateHUD();

let last = performance.now();
let accumulator = 0;
function animate(now) {
  requestAnimationFrame(animate);
  const frameTime = Math.min((now - last) / 1000, 0.05);
  last = now;

  // unified input first: gameplay reads Input.state only
  Input.update();

  // gamepad / touch discrete edges -> same actions as keyboard taps
  if (G.started && !G.paused) {
    if (Input.rose('swing')) advanceSwing();          // A / Cross / B press
    else if (Input.fell('swing') && G.swing.stage === 'power') advanceSwing(); // release locks power
    if (Input.state.clubNext && !Input.prev.clubNext) cycleClub(1);
    if (Input.state.clubPrev && !Input.prev.clubPrev) cycleClub(-1);
    if (Input.rose('aimAssist')) toggleAimAssist();
    if (Input.rose('pause')) togglePause();
    if (Input.rose('map')) { $('scorecard').classList.toggle('hidden'); renderScorecard(); }
    if (Input.rose('replay')) startReplay();
  }
  Input.latch();

  // analog aim (keys + left stick + touch drag) — per-render.
  // While the meter runs, directional input steers accuracy, not aim.
  if (G.started && G.ball.rest && !G.ball.holed && !G.paused) {
    const turn = 1.15 * frameTime;
    if (G.swing.stage === 'idle') G.aimAngle += Input.state.aimX * turn;
    // analog camera: right stick / Q-E / two-finger drag (touch moves orbit directly)
    G.orbit.yaw -= Input.state.cameraX * 1.8 * frameTime;
    G.orbit.pitch = clamp(G.orbit.pitch + Input.state.cameraY * 1.2 * frameTime, 0.05, 1.25);
    if (Input.state.zoom) G.orbit.dist = clamp(G.orbit.dist - Input.state.zoom * 30 * frameTime, 6, 70);
    // loft adjust: W/S, arrows, dpad — ±5°
    if (Input.state.loft) {
      G.loftAdjust = clamp(G.loftAdjust + Input.state.loft * 0.25 * frameTime, -0.09, 0.09);
    }
    // spin adjust: IJKL / right stick / spin pad — decays back to neutral slowly
    G.spinTweak.x = clamp(G.spinTweak.x + Input.state.spinX * 1.6 * frameTime, -1, 1);
    G.spinTweak.y = clamp(G.spinTweak.y + Input.state.spinY * 1.6 * frameTime, -1, 1);
  } else {
    G.spinTweak.x *= (1 - frameTime * 0.4);
    G.spinTweak.y *= (1 - frameTime * 0.4);
  }
  // swing meters (per-render)
  const sw = G.swing;
  if (!G.paused && sw.stage === 'power') {
    sw.power += sw.dirP * frameTime * 0.8;
    if (sw.power >= 1) { sw.power = 1; sw.dirP = -1; }
    if (sw.power <= 0) { sw.power = 0; sw.dirP = 1; }
  } else if (!G.paused && sw.stage === 'acc') {
    // base oscillation + live analog nudge (stick / A-D / swipe)
    sw.acc += (sw.dirA * 1.7 + Input.state.accuracy * 2.2) * frameTime;
    if (sw.acc >= 1) { sw.acc = 1; sw.dirA = -1; }
    if (sw.acc <= -1) { sw.acc = -1; sw.dirA = 1; }
  }
  // meter DOM
  $('power-fill').style.width = `${(sw.stage === 'idle' ? 0 : sw.power) * 100}%`;
  $('power-needle').style.left = `${(sw.stage === 'idle' ? 0 : sw.power) * 100}%`;
  $('acc-needle').style.left = `${50 + (sw.stage === 'acc' ? sw.acc * 48 : 0)}%`;
  $('acc-needle').style.background = sw.stage === 'acc' && Math.abs(sw.acc) < 0.18 ? '#00ff66' : '#ffcc00';
  if (G.started && sw.stage === 'idle' && G.ball.rest && !G.ball.holed)
    $('swing-hint').innerHTML = `HOLD <b>SPACE</b> ▸ RELEASE TO SET POWER ▸ PRESS TO HIT`;
  if (sw.stage === 'power') $('swing-hint').innerHTML = `RELEASE <b>SPACE</b> TO SET YOUR POWER — ${Math.round(sw.power * 100)}%`;
  if (sw.stage === 'acc') $('swing-hint').innerHTML = `PRESS <b>SPACE</b> IN THE GREEN — STICK / A-D NUDGES`;
  // touch UI fades in only when a shot can be taken (keeps course readable)
  {
    const tui = $('touch-ui');
    if (tui) tui.classList.toggle('ready', document.body.classList.contains('touch') && G.started && G.ball.rest && !G.ball.holed && !G.paused);
  }

  // fixed-step physics (skipped while paused)
  if (!G.paused) {
    accumulator += frameTime;
    let steps = 0;
    while (accumulator >= FIXED_DT && steps < 12) {
      physicsStep(FIXED_DT);
      accumulator -= FIXED_DT;
      steps++;
    }
    if (steps === 12) accumulator = 0;
  }

  // trail sampling per render (+ replay recording)
  if (!G.ball.rest && !G.ball.holed) {
    trailPts.push(G.ball.position.clone());
    G.curTrail.push(G.ball.position.clone());
    if (trailPts.length > 240) trailPts.shift();
    if (G.curTrail.length > 1200) G.curTrail.shift();
    updateTrail();
  }
  // replay ghost: cyan wire ball re-flying the stored trail
  if (ghostMesh) {
    if (G.replay.active && G.lastTrail.length > 1) {
      ghostMesh.visible = true;
      G.replay.t += frameTime / Math.max(0.5, G.lastTrail.length / 60);
      const idx = Math.min(G.lastTrail.length - 1, Math.floor(G.replay.t * (G.lastTrail.length - 1)));
      ghostMesh.position.copy(G.lastTrail[idx]);
      ghostMesh.rotation.x += frameTime * 6;
      if (G.replay.t >= 1) { G.replay.active = false; ghostMesh.visible = false; }
    } else ghostMesh.visible = false;
  }

  // ball mesh
  ballMesh.position.copy(G.ball.position);
  if (!G.ball.rest) ballMesh.rotation.x += frameTime * 6;
  const halo = ballMesh.getObjectByName('halo');
  if (halo) { halo.rotation.x = Math.PI / 2 + Math.sin(now * 0.003) * 0.2; halo.rotation.y += frameTime; }
  // holed sink animation
  if (G.ball.holed && G.ball.sunk < 1) {
    G.ball.sunk += frameTime;
    ballMesh.position.y -= frameTime * 0.8;
    ballMesh.scale.setScalar(Math.max(0.2, 1 - G.ball.sunk * 0.7));
  } else if (!G.ball.holed) ballMesh.scale.setScalar(1);
  // flag wave
  if (flagGroup) flagGroup.children[1].rotation.y = Math.sin(now * 0.004) * 0.35;

  updateAim();
  updateCamera(frameTime);
  if ((animate.f = (animate.f || 0) + 1) % 6 === 0) {
    updateHUD(); drawMinimap();
    // live input lamp: proves your hands are reaching the game
    const lamp = $('inputlive');
    if (lamp) {
      const holding = Input.state.swing > 0.1;
      lamp.textContent = holding ? '● CHARGING — RELEASE TO SET POWER' : '○ HOLD SPACE OR SWING BUTTON TO CHARGE';
      lamp.classList.toggle('hot', holding);
    }
  }
  renderer.render(scene, camera);
}
// Debug/test hook (used by automated playtests; harmless in production)
window.__golf = {
  G, COURSES,
  version: 8,
  get H() { return H; },
  get WORLD() { return WORLD; },
  play(course, idx) {
    G.course = course; G.scores = []; G.totalVsPar = 0; G.pickingUp = false;
    G.started = true; $('title').classList.add('hidden');
    startHole(idx);
    const s = H.spec;
    return { par: s.par, dist: Math.round(s.dist), green: { x: Math.round(s.green.x), z: Math.round(s.green.z) } };
  },
  // Full-power-equivalent strike bypassing the meter (power/acc set directly)
  testStrike(power = 1, acc = 0, club = null) {
    if (club !== null) G.club = club;
    G.started = true;
    G.ball.state = 'rest'; G.ball.velocity.set(0, 0, 0); G.ball.spin.set(0, 0, 0);
    syncBallFlags();
    G.swing.power = power; G.swing.acc = acc; G.swing.stage = 'idle';
    G.prevPos.copy(G.ball.position);
    strike();
    return {
      ballSpeed: Math.round(G.ball.velocity.length() * 10) / 10,
      spin: Math.round(G.ball.spin.length()),
    };
  },
  // Horizontal metres from a reference point (default: shot origin)
  shotDist(from = null) {
    const o = from || G.prevPos;
    return Math.round(Math.hypot(G.ball.position.x - o.x, G.ball.position.z - o.z) * 10) / 10;
  },
};
requestAnimationFrame(animate);
