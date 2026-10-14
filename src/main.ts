import * as THREE from 'three';
import {
  GAME_CONFIG,
  SCORING_ZONES,
  AXE_FRAMES,
  KILLSHOT_RADIUS,
  KILLSHOT_OFFSET,
  type AxeFrameConfig
} from './config/gameConfig';
import { LEVELS, BONUS_RESPAWN_GAP, levelById, type LevelDef } from './config/levels';
import { heroSolid, setSolidsLit } from './render/solids';
import { buildLights } from './render/lighting';
import { buildComposer, isSoftwareRenderer, type ComposerRig } from './render/composer';
import {
  initTextures,
  getFloorTexture,
  getHandleTexture,
  getBrushedTexture,
  getTargetDiscMaterial
} from './render/textures';

// Render-stage flags (URL overridable, no rebuild). Full revert to legacy
// wireframe = ?solid=0&lit=0&tex=0&disc=lines&bloom=0.
const RENDER_QUERY = new URLSearchParams(window.location.search);
const RENDER_FLAGS = {
  solid: RENDER_QUERY.get('solid') !== '0',
  lit: RENDER_QUERY.get('lit') !== '0', // S2 default ON (?lit=0 restores S1 look)
  shadows: RENDER_QUERY.get('shadows') !== '0',
  env: RENDER_QUERY.get('env') !== '0',
  tex: RENDER_QUERY.get('tex') !== '0', // S3 default ON (?tex=0 restores untextured)
  discLines: RENDER_QUERY.get('disc') === 'lines', // S3 default: textured disc
  bloom: RENDER_QUERY.get('bloom') as string | null,
  stats: RENDER_QUERY.has('stats')
};
setSolidsLit(RENDER_FLAGS.lit && RENDER_FLAGS.solid);

// ============================================================================
// AXE//VECTOR — zero-2D wireframe axe throwing across 7 level arenas.
// No DOM HUD, menus, or text: score, timer, throws, menus, results are all
// in-world 3D geometry. Level names/descriptions live in levels.ts as data.
// ============================================================================

type AppPhase = 'menu' | 'play' | 'resolve';
type AxeState = 'IDLE' | 'CHARGING' | 'FLYING' | 'STUCK' | 'DEFLECTED' | 'RECALLING';

const BOARD_UNIT = 1.35; // doc reference board radius; smaller boards scale down

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
initTextures(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000005);
scene.fog = new THREE.Fog(0x000005, 22, 70);

if (RENDER_FLAGS.lit) {
  buildLights(renderer, scene, { shadows: RENDER_FLAGS.shadows, env: RENDER_FLAGS.env });
  // Shadow-catcher floor (invisible except for shadows).
  const catcher = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 40),
    new THREE.ShadowMaterial({ opacity: 0.35 })
  );
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.set(0, 0.001, -20);
  catcher.receiveShadow = true;
  scene.add(catcher);
}

const camera = new THREE.PerspectiveCamera(
  GAME_CONFIG.camera.fov,
  window.innerWidth / window.innerHeight,
  GAME_CONFIG.camera.near,
  GAME_CONFIG.camera.far
);
const yawObject = new THREE.Object3D();
const pitchObject = new THREE.Object3D();
yawObject.position.set(0, GAME_CONFIG.camera.eyeHeight, 0);
yawObject.add(pitchObject);
pitchObject.add(camera);
scene.add(yawObject);

// ---------------------------------------------------------------------------
// Arena shell
// ---------------------------------------------------------------------------
const worldMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.38 });

function gridGeometry(w: number, d: number, nx: number, nz: number): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let i = 0; i <= nx; i++) {
    const x = -w / 2 + (w * i) / nx;
    pts.push(x, 0, 0, x, 0, -d);
  }
  for (let j = 0; j <= nz; j++) {
    const z = -(d * j) / nz;
    pts.push(-w / 2, 0, z, w / 2, 0, z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

function wallGeometry(w: number, h: number, nx: number, ny: number): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let i = 0; i <= nx; i++) {
    const x = -w / 2 + (w * i) / nx;
    pts.push(x, 0, 0, x, h, 0);
  }
  for (let j = 0; j <= ny; j++) {
    const y = (h * j) / ny;
    pts.push(-w / 2, y, 0, w / 2, y, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

const floor = new THREE.LineSegments(gridGeometry(20, 40, 20, 40), worldMat);
floor.position.set(0, 0, -20);
scene.add(floor);

const leftWall = new THREE.LineSegments(wallGeometry(40, 8, 40, 8), worldMat);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.set(-10, 0, -20);
scene.add(leftWall);
const rightWall = leftWall.clone();
rightWall.position.x = 10;
scene.add(rightWall);

const backWall = new THREE.LineSegments(wallGeometry(20, 8, 20, 8), worldMat);
backWall.position.set(0, 0, -38);
scene.add(backWall);

const ceiling = new THREE.LineSegments(
  gridGeometry(20, 40, 10, 20),
  new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.12 })
);
ceiling.rotation.x = Math.PI;
ceiling.position.set(0, 8, -20);
scene.add(ceiling);

const railMat = new THREE.LineBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.55 });
for (const x of [-1.5, 1.5]) {
  const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0.02, 0), new THREE.Vector3(x, 0.02, -38)]);
  scene.add(new THREE.Line(g, railMat));
}
{
  const prismMat = new THREE.LineBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.8 });
  for (const x of [-2.2, 2.2]) {
    const prism = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 3)), prismMat);
    prism.position.set(x, 1.0, -1.2);
    prism.userData.spin = x > 0 ? 1 : -1;
    scene.add(prism);
    (scene.userData.throwPrisms ??= []).push(prism);
  }
  const bar = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3, 1.0, -1.2), new THREE.Vector3(3, 1.0, -1.2)]);
  scene.add(new THREE.Line(bar, prismMat));
}

if (RENDER_FLAGS.tex && RENDER_FLAGS.lit) {
  // S3 textured floor under the kept grid lines. Walls stay pure wireframe:
  // solid side walls read as flat slabs and kill the infinite-void depth.
  const floorSolid = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 40),
    new THREE.MeshStandardMaterial({
      map: getFloorTexture(), roughness: 0.9, metalness: 0.05,
      emissive: 0xffffff, emissiveMap: getFloorTexture(), emissiveIntensity: 0.35
    })
  );
  floorSolid.rotation.x = -Math.PI / 2;
  floorSolid.position.set(0, -0.01, -20);
  floorSolid.receiveShadow = true;
  scene.add(floorSolid);
}

// ---------------------------------------------------------------------------
// Seven-segment 3D digits (no text assets, no screen-space text)
// ---------------------------------------------------------------------------
const SEG_PATTERNS: Record<string, number[]> = {
  '0': [1, 1, 1, 1, 1, 1, 0], '1': [0, 1, 1, 0, 0, 0, 0],
  '2': [1, 1, 0, 1, 1, 0, 1], '3': [1, 1, 1, 1, 0, 0, 1],
  '4': [0, 1, 1, 0, 0, 1, 1], '5': [1, 0, 1, 1, 0, 1, 1],
  '6': [1, 0, 1, 1, 1, 1, 1], '7': [1, 1, 1, 0, 0, 0, 0],
  '8': [1, 1, 1, 1, 1, 1, 1], '9': [1, 1, 1, 1, 0, 1, 1],
  ' ': [0, 0, 0, 0, 0, 0, 0], '-': [0, 0, 0, 0, 0, 0, 1]
};

function segEndpoints(i: number, w: number, h: number): [number, number, number, number] {
  const m = h / 2;
  switch (i) {
    case 0: return [0, h, w, h];
    case 1: return [w, m, w, h];
    case 2: return [w, 0, w, m];
    case 3: return [0, 0, w, 0];
    case 4: return [0, 0, 0, m];
    case 5: return [0, m, 0, h];
    default: return [0, m, w, m];
  }
}

class SevenSegDigit {
  readonly group = new THREE.Group();
  private positions: THREE.BufferAttribute;
  constructor(public w = 0.34, public h = 0.6, color = 0xffffff) {
    const arr = new Float32Array(7 * 2 * 3);
    const g = new THREE.BufferGeometry();
    this.positions = new THREE.BufferAttribute(arr, 3);
    g.setAttribute('position', this.positions);
    const lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 }));
    lines.frustumCulled = false;
    this.group.add(lines);
    this.setChar(' ');
  }
  setChar(c: string) {
    const pattern = SEG_PATTERNS[c] ?? SEG_PATTERNS[' '];
    const a = this.positions.array as Float32Array;
    for (let i = 0; i < 7; i++) {
      const on = pattern[i] === 1;
      const [x1, y1, x2, y2] = segEndpoints(i, this.w, this.h);
      const o = i * 6;
      if (on) { a[o] = x1; a[o + 1] = y1; a[o + 2] = 0; a[o + 3] = x2; a[o + 4] = y2; a[o + 5] = 0; }
      else { a[o] = 0; a[o + 1] = 0; a[o + 2] = 0; a[o + 3] = 0; a[o + 4] = 0; a[o + 5] = 0; }
    }
    this.positions.needsUpdate = true;
  }
}

class SevenSegNumber {
  readonly group = new THREE.Group();
  private digits: SevenSegDigit[] = [];
  constructor(maxDigits: number, digitW: number, digitH: number, color: number, spacing?: number) {
    const step = digitW + (spacing ?? digitW * 0.35);
    for (let i = 0; i < maxDigits; i++) {
      const d = new SevenSegDigit(digitW, digitH, color);
      d.group.position.x = i * step;
      this.group.add(d.group);
      this.digits.push(d);
    }
  }
  setValue(v: number) {
    const s = String(Math.max(0, Math.floor(v)));
    const n = this.digits.length;
    for (let i = 0; i < n; i++) {
      const ch = i < n - s.length ? ' ' : s[i - (n - s.length)];
      this.digits[i].setChar(ch);
    }
  }
  setPulse(opacity: number) {
    for (const d of this.digits) {
      for (const child of d.group.children) {
        ((child as THREE.LineSegments).material as THREE.LineBasicMaterial).opacity = opacity;
      }
    }
  }
}

// Single-canvas readout plane for the big HUD numbers (S3): one draw per
// number instead of one per digit segment group. Redrawn only on change.
class TextNumber {
  readonly group = new THREE.Group();
  private canvas: HTMLCanvasElement;
  private tex: THREE.CanvasTexture;
  private plane: THREE.Mesh;
  private last = '';
  constructor(maxChars: number, w: number, h: number, private css: string) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 128 * maxChars;
    this.canvas.height = 160;
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.anisotropy = 4;
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: this.tex, transparent: true })
    );
    this.group.add(this.plane);
    this.setValue(0);
  }
  setValue(v: number) {
    const s = String(Math.max(0, Math.floor(v)));
    if (s === this.last) return;
    this.last = s;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.font = `bold 118px "Courier New", monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = this.css;
    ctx.shadowBlur = 22;
    ctx.fillStyle = this.css;
    ctx.fillText(s, this.canvas.width - 10, this.canvas.height / 2 + 4);
    this.tex.needsUpdate = true;
  }
  setPulse(opacity: number) {
    (this.plane.material as THREE.MeshBasicMaterial).opacity = opacity;
  }
}

// Big readouts use texture planes when texturing is on, segment lines legacy.
function makeReadout(chars: number, w: number, h: number, hex: number, css: string): SevenSegNumber | TextNumber {
  if (RENDER_FLAGS.tex) return new TextNumber(chars, w, h, css);
  const stepW = w / (chars + (chars - 1) * 0.35);
  return new SevenSegNumber(chars, stepW, h, hex);
}

// Scoreboard + timer digits (both billboarded 3D).
const scoreboard = new THREE.Group();
const scoreDigits = makeReadout(4, 1.72, 0.6, 0x00ffcc, '#00ffcc');
scoreDigits.group.position.x = -0.75;
scoreboard.add(scoreDigits.group);
const scoreIconGeo = new THREE.OctahedronGeometry(0.16);
const scoreIcon = new THREE.LineSegments(
  new THREE.EdgesGeometry(scoreIconGeo),
  new THREE.LineBasicMaterial({ color: 0xffffff })
);
scoreIcon.position.set(0, 0.95, 0);
scoreboard.add(scoreIcon);
if (RENDER_FLAGS.solid) {
  const s = heroSolid(scoreIconGeo, 0xffffff);
  s.position.set(0, 0.95, 0);
  scoreboard.add(s);
}
scoreboard.position.set(-0.9, 4.9, -10.4);
scene.add(scoreboard);

const timerDigits = makeReadout(3, 0.96, 0.46, 0xff5566, '#ff5566');
const timerGroup = new THREE.Group();
timerGroup.add(timerDigits.group);
timerGroup.position.set(1.5, 4.85, -10.4);
timerGroup.visible = false;
scene.add(timerGroup);

// Throw-rack pips (resource display: axes left / misses left / unlimited).
const rackGroup = new THREE.Group();
const rackPips: THREE.LineSegments[] = [];
let rackInst: THREE.InstancedMesh | null = null;
const rackDummy = new THREE.Object3D();
{
  if (RENDER_FLAGS.solid) {
    // One instanced draw instead of ten line draws.
    rackInst = new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(0.09),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      10
    );
    for (let i = 0; i < 10; i++) {
      rackDummy.position.set(-1.35 + i * 0.3, 1.02, -2.3);
      rackDummy.scale.setScalar(1);
      rackDummy.updateMatrix();
      rackInst.setMatrixAt(i, rackDummy.matrix);
      rackInst.setColorAt(i, new THREE.Color(0x00ffcc));
    }
    rackInst.instanceMatrix.needsUpdate = true;
    if (rackInst.instanceColor) rackInst.instanceColor.needsUpdate = true;
    rackGroup.add(rackInst);
  } else {
    const pipGeo = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.09));
    for (let i = 0; i < 10; i++) {
      const pip = new THREE.LineSegments(pipGeo, new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.95 }));
      pip.position.set(-1.35 + i * 0.3, 1.02, -2.3);
      rackGroup.add(pip);
      rackPips.push(pip);
    }
  }
}
scene.add(rackGroup);

const pipColor = new THREE.Color();
function updateRack(level: LevelDef, throwsUsed: number, misses: number, time: number) {
  if (rackInst) {
    for (let i = 0; i < 10; i++) {
      let hex = 0x00ffcc;
      let bright = 1;
      let shown = true;
      if (level.maxMisses !== null) {
        // Endless: red pips = misses remaining.
        shown = i < level.maxMisses;
        const left = i < level.maxMisses - misses;
        hex = left ? 0xff3344 : 0x331111;
      } else if (level.maxAxes !== null) {
        shown = i < level.maxAxes;
        const remaining = i < level.maxAxes - throwsUsed;
        hex = remaining ? 0x00ffcc : 0x113333;
      } else {
        hex = 0xffcc00;
        bright = 0.55 + 0.35 * Math.sin(time * 3 + i * 0.6);
      }
      pipColor.setHex(hex).multiplyScalar(bright);
      rackInst.setColorAt(i, pipColor);
      rackDummy.position.set(-1.35 + i * 0.3, 1.02, -2.3);
      rackDummy.scale.setScalar(shown ? 1 : 0.0001);
      rackDummy.updateMatrix();
      rackInst.setMatrixAt(i, rackDummy.matrix);
    }
    if (rackInst.instanceColor) rackInst.instanceColor.needsUpdate = true;
    rackInst.instanceMatrix.needsUpdate = true;
    return;
  }
  for (let i = 0; i < rackPips.length; i++) {
    const pip = rackPips[i];
    const mat = pip.material as THREE.LineBasicMaterial;
    if (level.maxMisses !== null) {
      // Endless: red pips = misses remaining.
      pip.visible = i < level.maxMisses;
      const left = i < level.maxMisses - misses;
      mat.color.setHex(left ? 0xff3344 : 0x331111);
      mat.opacity = left ? 0.95 : 0.4;
    } else if (level.maxAxes !== null) {
      pip.visible = i < level.maxAxes;
      const remaining = i < level.maxAxes - throwsUsed;
      mat.color.setHex(remaining ? 0x00ffcc : 0x113333);
      mat.opacity = remaining ? 0.95 : 0.4;
    } else {
      pip.visible = true;
      mat.color.setHex(0xffcc00);
      mat.opacity = 0.55 + 0.35 * Math.sin(time * 3 + i * 0.6);
    }
  }
}

// ---------------------------------------------------------------------------
// Targets: scalable boards, motion kinds, bonus cycling, Killshot nodes.
// Boards are built at doc scale inside `face`; group.scale shrinks them.
// Collision runs in face-local space so rotation/motion just works.
// ---------------------------------------------------------------------------
import type { TargetKind } from './config/levels';

interface Target {
  group: THREE.Group;
  face: THREE.Group;
  kind: TargetKind;
  basePos: THREE.Vector3;
  amp: number;
  speed: number;
  phase: number;
  scoreMul: number;
  lifetime: number;
  spawnAt: number;
  active: boolean;
  bullseyeRing: THREE.LineLoop;
  killNodes: THREE.LineSegments[];
  killNodeLocals: THREE.Vector3[];
  killSpheres: THREE.Vector3[];
  bonusHalo: THREE.LineLoop | null;
}

let targets: Target[] = [];
let primaryTarget: Target | null = null;

function ringLine(radius: number, color: number, opacity: number, segments = 72): THREE.LineLoop {
  const pts: THREE.Vector3[] = [];
  for (let s = 0; s <= segments; s++) {
    const a = (s / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
  }
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
}

function disposeGroup(g: THREE.Object3D) {
  g.traverse(o => {
    const mesh = o as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) m.dispose();
    }
  });
}

function clearTargets() {
  for (const t of targets) {
    scene.remove(t.group);
    disposeGroup(t.group);
  }
  targets = [];
  primaryTarget = null;
}

function createTarget(
  kind: TargetKind,
  pos: [number, number, number],
  radius: number,
  opts: { amp?: number; speed?: number; phase?: number; scoreMul?: number; lifetime?: number; spawnAt?: number } = {}
): Target {
  const group = new THREE.Group();
  const face = new THREE.Group();
  group.add(face);
  const scale = radius / BOARD_UNIT;
  group.scale.setScalar(scale);

  let bullseyeRing!: THREE.LineLoop;
  if (RENDER_FLAGS.discLines || !RENDER_FLAGS.lit || !RENDER_FLAGS.solid || !RENDER_FLAGS.tex) {
    for (const zone of SCORING_ZONES) {
      const ring = ringLine(zone.radius, zone.color, zone.points >= 5 ? 1.0 : 0.85);
      if (zone.points === 6) bullseyeRing = ring;
      face.add(ring);
    }
  } else {
    // S3: one textured disc replaces six ring loops (draw-call rescue).
    // Spokes/kill nodes/rear ring stay as wireframe overlays.
    const disc = new THREE.Mesh(new THREE.CircleGeometry(BOARD_UNIT, 72), getTargetDiscMaterial());
    disc.position.z = -0.01;
    disc.castShadow = true;
    disc.receiveShadow = true;
    face.add(disc);
    bullseyeRing = ringLine(0.12, 0xffffff, 1.0, 48);
    face.add(bullseyeRing);
  }
  {
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s < 12; s++) {
      const a = (s / 12) * Math.PI * 2;
      pts.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0));
    }
    face.add(new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.9 })
    ));
  }
  const standMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 });
  const topY = -SCORING_ZONES[0].radius;
  // Leg bottom in local units chosen so the feet touch the floor (world y=0)
  // after the group scale is applied: baseY + scale * bottomLocalY = 0.
  const footY = -pos[1] / scale;
  for (const sx of [-0.5, 0.5]) {
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(sx * 0.8, topY, -0.05), new THREE.Vector3(sx * 2.2, footY, -0.4)
      ]),
      standMat
    ));
  }
  const rear = ringLine(SCORING_ZONES[0].radius, 0x00ffcc, 0.25, 36);
  rear.position.z = -0.25;
  group.add(rear);

  // Killshot nodes ride every board kind (upper corners, doc layout) — on
  // rotating faces they spin with the board; spheres update per frame.
  const killNodes: THREE.LineSegments[] = [];
  const killNodeLocals: THREE.Vector3[] = [];
  {
    const nodeGeo = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(KILLSHOT_RADIUS));
    for (const [ox, oy] of KILLSHOT_OFFSET) {
      const node = new THREE.LineSegments(nodeGeo, new THREE.LineBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.9 }));
      node.position.set(ox, oy, 0.05);
      face.add(node);
      killNodes.push(node);
      killNodeLocals.push(new THREE.Vector3(ox, oy, 0.05));
    }
  }

  // Bonus halo: gold ring marking high-value pop-ups.
  let bonusHalo: THREE.LineLoop | null = null;
  if (kind === 'bonus') {
    bonusHalo = ringLine(SCORING_ZONES[0].radius * 1.16, 0xffcc00, 0.9, 72);
    face.add(bonusHalo);
  }

  const basePos = new THREE.Vector3(pos[0], pos[1], pos[2]);
  group.position.copy(basePos);
  scene.add(group);
  const t: Target = {
    group, face, kind, basePos,
    amp: opts.amp ?? 0, speed: opts.speed ?? 0, phase: opts.phase ?? 0,
    scoreMul: opts.scoreMul ?? 1,
    lifetime: opts.lifetime ?? 0, spawnAt: opts.spawnAt ?? 0,
    active: kind !== 'bonus',
    bullseyeRing, killNodes, killNodeLocals,
    killSpheres: killNodeLocals.map(() => new THREE.Vector3()),
    bonusHalo
  };
  if (kind === 'bonus') group.visible = false;
  targets.push(t);
  return t;
}

function loadLevelTargets(level: LevelDef) {
  clearTargets();
  clearGhosts();
  for (const spec of level.targets) {
    createTarget(spec.type, spec.pos, spec.radius ?? 0.85, {
      amp: spec.amp, speed: spec.speed, phase: spec.phase,
      scoreMul: spec.scoreMul, lifetime: spec.lifetime, spawnAt: spec.spawnAt
    });
  }
  primaryTarget = targets.find(t => t.kind === 'static') ?? targets[0] ?? null;
  if (RENDER_FLAGS.solid && primaryTarget) {
    // Solid backing for the primary board's killshot nodes only (S1 budget).
    for (const local of primaryTarget.killNodeLocals) {
      const s = heroSolid(new THREE.OctahedronGeometry(KILLSHOT_RADIUS), 0xff3366);
      s.position.copy(local);
      primaryTarget.face.add(s);
    }
  }
}

function motionRamp(level: LevelDef, elapsed: number): number {
  if (!level.ramp) return 1;
  return Math.min(30, 1 + 0.2 * Math.floor(elapsed / 30));
}

const tmpNodeWorld = new THREE.Vector3();

function updateTargets(level: LevelDef, elapsed: number, time: number, inPlay: boolean) {
  const ramp = motionRamp(level, elapsed);
  for (const t of targets) {
    if (t.kind === 'sliding') {
      t.group.position.x = t.basePos.x + Math.sin(time * t.speed * ramp + t.phase) * t.amp;
    } else if (t.kind === 'oscillating') {
      t.group.position.z = t.basePos.z + Math.sin(time * t.speed * ramp + t.phase) * t.amp;
    } else if (t.kind === 'rotating') {
      t.face.rotation.y = t.phase + time * t.speed * ramp;
    } else if (t.kind === 'bonus') {
      let active = false;
      if (inPlay && elapsed >= t.spawnAt) {
        const period = t.lifetime + BONUS_RESPAWN_GAP;
        active = ((elapsed - t.spawnAt) % period) < t.lifetime;
      }
      t.active = active;
      t.group.visible = active;
      if (active && t.bonusHalo) {
        const s = 1 + 0.08 * Math.sin(time * 6);
        t.bonusHalo.scale.set(s, s, s);
        (t.bonusHalo.material as THREE.LineBasicMaterial).opacity = 0.6 + 0.4 * Math.sin(time * 6);
      }
    }
    for (let i = 0; i < t.killNodes.length; i++) {
      t.killNodes[i].getWorldPosition(tmpNodeWorld);
      t.killSpheres[i].copy(tmpNodeWorld);
    }
  }
  // Aim pulse on the primary board.
  if (primaryTarget) {
    const aimed = predictedPrimaryDist < 0.35 && (axeState === 'IDLE' || axeState === 'CHARGING');
    const s = aimed ? 1 + 0.15 * Math.sin(time * 8) : 1;
    primaryTarget.bullseyeRing.scale.setScalar(s);
  }
}

// ---------------------------------------------------------------------------
// Axe
// ---------------------------------------------------------------------------
let frame: AxeFrameConfig = AXE_FRAMES[0];
const axeGroup = new THREE.Group();
let spinEdge!: THREE.Line;

function buildAxe() {
  while (axeGroup.children.length > 0) axeGroup.remove(axeGroup.children[0]);
  const mat = (color: number) => new THREE.LineBasicMaterial({ color });
  const handleGeo = new THREE.BoxGeometry(0.05, 0.7, 0.05);
  const handle = new THREE.LineSegments(new THREE.EdgesGeometry(handleGeo), mat(frame.color));
  handle.position.y = -0.15;
  axeGroup.add(handle);
  if (RENDER_FLAGS.solid) {
    const hs = heroSolid(handleGeo, frame.color, RENDER_FLAGS.tex ? { map: getHandleTexture() } : {});
    hs.position.y = -0.15;
    axeGroup.add(hs);
  }
  const headGeo = new THREE.ConeGeometry(0.13, 0.28, 4);
  const head = new THREE.LineSegments(new THREE.EdgesGeometry(headGeo), mat(frame.color));
  head.rotation.z = Math.PI / 2;
  head.position.set(0.16, 0.25, 0);
  axeGroup.add(head);
  if (RENDER_FLAGS.solid) {
    const ds = heroSolid(headGeo, frame.color, RENDER_FLAGS.tex
      ? { roughness: 0.35, metalness: 0.9, roughnessMap: getBrushedTexture(), bumpMap: getBrushedTexture(), bumpScale: 0.02 }
      : { roughness: 0.35, metalness: 0.9 });
    ds.rotation.z = Math.PI / 2;
    ds.position.set(0.16, 0.25, 0);
    axeGroup.add(ds);
  }
  const bindPts: THREE.Vector3[] = [];
  for (let s = 0; s <= 24; s++) {
    const a = (s / 24) * Math.PI * 2;
    bindPts.push(new THREE.Vector3(Math.cos(a) * 0.05, 0.12 + Math.sin(a) * 0.05, 0));
  }
  axeGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(bindPts), mat(0xffcc00)));
  spinEdge = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.05, 0.25, 0), new THREE.Vector3(0.3, 0.25, 0)]),
    mat(frame.trailColor)
  );
  axeGroup.add(spinEdge);
}
buildAxe();
scene.add(axeGroup);

const ghosts: THREE.Group[] = [];
function spawnGhost() {
  const g = axeGroup.clone();
  g.position.copy(axeGroup.position);
  g.quaternion.copy(axeGroup.quaternion);
  g.scale.setScalar(1);
  scene.add(g);
  ghosts.push(g);
  if (ghosts.length > 14) {
    const old = ghosts.shift();
    if (old) scene.remove(old);
  }
}
function clearGhosts() {
  for (const g of ghosts) scene.remove(g);
  ghosts.length = 0;
}

const TRAIL_N = 48;
const trailPositions = new Float32Array(TRAIL_N * 3);
const trailGeom = new THREE.BufferGeometry();
trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
const trail = new THREE.Line(trailGeom, new THREE.LineBasicMaterial({ color: frame.trailColor, transparent: true, opacity: 0.7 }));
trail.frustumCulled = false;
scene.add(trail);
let trailCount = 0;
function pushTrail(p: THREE.Vector3) {
  for (let i = TRAIL_N - 1; i > 0; i--) {
    trailPositions[i * 3] = trailPositions[(i - 1) * 3];
    trailPositions[i * 3 + 1] = trailPositions[(i - 1) * 3 + 1];
    trailPositions[i * 3 + 2] = trailPositions[(i - 1) * 3 + 2];
  }
  trailPositions[0] = p.x; trailPositions[1] = p.y; trailPositions[2] = p.z;
  trailCount = Math.min(trailCount + 1, TRAIL_N);
  trailGeom.setDrawRange(0, trailCount);
  trailGeom.attributes.position.needsUpdate = true;
}
function clearTrail() { trailCount = 0; trailGeom.setDrawRange(0, 0); }

interface Burst { line: THREE.LineLoop; life: number; }
const bursts: Burst[] = [];
function spawnBurst(p: THREE.Vector3, color: number) {
  const line = ringLine(0.12, color, 1.0, 40);
  line.position.copy(p);
  scene.add(line);
  bursts.push({ line, life: 0 });
}
interface Crystal { group: THREE.Group; lines: THREE.LineSegments; solid: THREE.Mesh | null; vel: number; life: number; }
const crystals: Crystal[] = [];
function spawnCrystal(p: THREE.Vector3, color: number, size: number) {
  const group = new THREE.Group();
  const octaGeo = new THREE.OctahedronGeometry(size);
  const lines = new THREE.LineSegments(
    new THREE.EdgesGeometry(octaGeo),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 1 })
  );
  group.add(lines);
  let solid: THREE.Mesh | null = null;
  if (RENDER_FLAGS.solid) {
    solid = heroSolid(octaGeo, color, { transparent: true, opacity: 0.85, emissiveIntensity: 1.0 });
    group.add(solid);
  }
  group.position.copy(p);
  scene.add(group);
  crystals.push({ group, lines, solid, vel: 1.4, life: 0 });
}

// ---------------------------------------------------------------------------
// Hand-anchored 3D feedback
// ---------------------------------------------------------------------------
const HELD_POS = new THREE.Vector3(0.32, -0.3, -1.0);
const HELD_SCALE = 0.6;
const handWorld = new THREE.Vector3();
const camRight = new THREE.Vector3();
const camUp = new THREE.Vector3();
const camFwd = new THREE.Vector3();

function updateHandFrame() {
  camera.updateMatrixWorld();
  handWorld.copy(HELD_POS).applyMatrix4(camera.matrixWorld);
  const e = camera.matrixWorld.elements;
  camRight.set(e[0], e[1], e[2]).normalize();
  camUp.set(e[4], e[5], e[6]).normalize();
  camera.getWorldDirection(camFwd);
}

const ARC_N = 64;
const arcPositions = new Float32Array(ARC_N * 3);
const arcGeom = new THREE.BufferGeometry();
arcGeom.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
const arcMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.9 });
const chargeArc = new THREE.Line(arcGeom, arcMat);
chargeArc.frustumCulled = false;
scene.add(chargeArc);

function updateChargeArc(charge: number, time: number, overFraction: number, calledKillshot: boolean) {
  const visible = axeState === 'CHARGING';
  chargeArc.visible = visible;
  if (!visible) return;
  const radius = 0.16 + 0.3 * charge;
  const sweep = Math.max(0.4, charge * Math.PI * 1.6);
  const rot = time * (2 + charge * 5);
  const count = Math.max(4, Math.floor(ARC_N * charge));
  for (let i = 0; i < ARC_N; i++) {
    const a = rot + (i / (ARC_N - 1) - 0.5) * sweep * 2;
    const r = radius + 0.02 * Math.sin(a * 3 + time * 6);
    const jx = overFraction > 0 ? (Math.random() - 0.5) * 0.05 * overFraction : 0;
    const jy = overFraction > 0 ? (Math.random() - 0.5) * 0.05 * overFraction : 0;
    arcPositions[i * 3] = handWorld.x + (Math.cos(a) * camRight.x + Math.sin(a) * camUp.x) * r + jx;
    arcPositions[i * 3 + 1] = handWorld.y + (Math.cos(a) * camRight.y + Math.sin(a) * camUp.y) * r + jy;
    arcPositions[i * 3 + 2] = handWorld.z + (Math.cos(a) * camRight.z + Math.sin(a) * camUp.z) * r;
  }
  arcGeom.setDrawRange(0, count);
  arcGeom.attributes.position.needsUpdate = true;
  arcMat.color.setHex(calledKillshot ? 0xff3366 : charge >= 1 ? 0xff3366 : charge > 0.6 ? 0xffcc00 : 0x00ffcc);
}

const dialRing = ringLine(0.12, 0xffffff, 0.5, 32);
scene.add(dialRing);
const dialDot = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.02)),
  new THREE.LineBasicMaterial({ color: 0xffcc00 })
);
scene.add(dialDot);

const crossRing = ringLine(0.035, 0x00ffcc, 0.9, 24);
scene.add(crossRing);

const TRAJ_N = 80;
const trajPositions = new Float32Array(TRAJ_N * 3);
const trajGeom = new THREE.BufferGeometry();
trajGeom.setAttribute('position', new THREE.BufferAttribute(trajPositions, 3));
const trajLine = new THREE.Line(
  trajGeom,
  new THREE.LineDashedMaterial({ color: 0x66ffff, transparent: true, opacity: 0.55, dashSize: 0.18, gapSize: 0.12 })
);
trajLine.frustumCulled = false;
scene.add(trajLine);

const trajDir = new THREE.Vector3();
const trajPos = new THREE.Vector3();
let predictedPrimaryDist = Infinity;

function updateTrajectory(power: number) {
  const show = phase === 'play' && (axeState === 'IDLE' || axeState === 'CHARGING');
  trajLine.visible = show;
  if (!show) { predictedPrimaryDist = Infinity; return; }
  trajDir.copy(camFwd);
  trajDir.y += GAME_CONFIG.throw.arcCompensation;
  trajDir.normalize();
  trajPos.copy(handWorld);
  let n = 0;
  const step = 1 / 60;
  const vel = trajDir.clone().multiplyScalar(power);
  for (let i = 0; i < 400 && n < TRAJ_N; i++) {
    vel.y += GAME_CONFIG.gravity * step;
    trajPos.addScaledVector(vel, step);
    if (i % 3 === 0) {
      trajPositions[n * 3] = trajPos.x; trajPositions[n * 3 + 1] = trajPos.y; trajPositions[n * 3 + 2] = trajPos.z;
      n++;
    }
    if (trajPos.y <= 0.02 || trajPos.z < -26) break;
  }
  predictedPrimaryDist = Infinity;
  if (primaryTarget) {
    const v = trajDir.clone().multiplyScalar(power);
    const p = handWorld.clone();
    const pz = primaryTarget.group.position.z;
    for (let i = 0; i < 400; i++) {
      v.y += GAME_CONFIG.gravity * step;
      const prevX = p.x, prevY = p.y, prevZ = p.z;
      p.addScaledVector(v, step);
      if (prevZ > pz && p.z <= pz) {
        const a = (prevZ - pz) / (prevZ - p.z);
        const ix = prevX + (p.x - prevX) * a;
        const iy = prevY + (p.y - prevY) * a;
        predictedPrimaryDist = Math.hypot(ix - primaryTarget.group.position.x, iy - primaryTarget.group.position.y);
        break;
      }
      if (p.y <= 0.02) break;
    }
  }
  trajGeom.setDrawRange(0, n);
  trajGeom.attributes.position.needsUpdate = true;
  trajLine.computeLineDistances();
}

const orbiters: THREE.LineSegments[] = [];
let orbiterInst: THREE.InstancedMesh | null = null;
const orbiterDummy = new THREE.Object3D();
{
  if (RENDER_FLAGS.solid) {
    orbiterInst = new THREE.InstancedMesh(
      new THREE.TetrahedronGeometry(0.045),
      new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
      5
    );
    orbiterDummy.scale.setScalar(0.0001);
    orbiterDummy.updateMatrix();
    for (let i = 0; i < 5; i++) orbiterInst.setMatrixAt(i, orbiterDummy.matrix);
    orbiterInst.instanceMatrix.needsUpdate = true;
    scene.add(orbiterInst);
  } else {
    const geo = new THREE.EdgesGeometry(new THREE.TetrahedronGeometry(0.045));
    for (let i = 0; i < 5; i++) {
      const o = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.9 }));
      scene.add(o);
      orbiters.push(o);
    }
  }
}
function updateOrbiters(streak: number, time: number) {
  const n = Math.min(streak, 5);
  if (orbiterInst) {
    for (let i = 0; i < 5; i++) {
      const on = i < n && (axeState === 'IDLE' || axeState === 'CHARGING');
      const a = time * 2.2 + (i / Math.max(1, n)) * Math.PI * 2;
      if (on) {
        orbiterDummy.position.set(
          handWorld.x + Math.cos(a) * 0.35 * camRight.x + Math.sin(a * 2) * 0.05 * camUp.x,
          handWorld.y + Math.cos(a) * 0.35 * camRight.y + 0.12 + Math.sin(a * 2) * 0.05,
          handWorld.z + Math.cos(a) * 0.35 * camRight.z + Math.sin(a * 2) * 0.05 * camUp.z
        );
        orbiterDummy.rotation.set(a, a * 1.3, 0);
        orbiterDummy.scale.setScalar(1);
      } else {
        orbiterDummy.scale.setScalar(0.0001);
      }
      orbiterDummy.updateMatrix();
      orbiterInst.setMatrixAt(i, orbiterDummy.matrix);
    }
    orbiterInst.instanceMatrix.needsUpdate = true;
    return;
  }
  for (let i = 0; i < orbiters.length; i++) {
    const o = orbiters[i];
    o.visible = i < n && (axeState === 'IDLE' || axeState === 'CHARGING');
    if (!o.visible) continue;
    const a = time * 2.2 + (i / Math.max(1, n)) * Math.PI * 2;
    o.position.set(
      handWorld.x + Math.cos(a) * 0.35 * camRight.x + Math.sin(a * 2) * 0.05 * camUp.x,
      handWorld.y + Math.cos(a) * 0.35 * camRight.y + 0.12 + Math.sin(a * 2) * 0.05,
      handWorld.z + Math.cos(a) * 0.35 * camRight.z + Math.sin(a * 2) * 0.05 * camUp.z
    );
    o.rotation.set(a, a * 1.3, 0);
  }
}

// ---------------------------------------------------------------------------
// Selectable 3D totems (menus without 2D)
// ---------------------------------------------------------------------------
interface Selectable { hit: THREE.Mesh; action: () => void; }
const selectables: Selectable[] = [];
const raycaster = new THREE.Raycaster();
const centerNDC = new THREE.Vector2(0, 0);

function makeHitSphere(r: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
}
function registerSelectable(group: THREE.Group, hitRadius: number, action: () => void): Selectable {
  const hit = makeHitSphere(hitRadius);
  group.add(hit);
  const s: Selectable = { hit, action };
  selectables.push(s);
  return s;
}
let hovered: Selectable | null = null;
function updateHover() {
  raycaster.setFromCamera(centerNDC, camera);
  const hits = raycaster.intersectObjects(selectables.filter(s => s.hit.visible).map(s => s.hit), false);
  const found = hits.length > 0 ? selectables.find(s => s.hit === hits[0].object) ?? null : null;
  hovered = found;
  (crossRing.material as THREE.LineBasicMaterial).color.setHex(found ? 0xffcc00 : 0x00ffcc);
  const sc = found ? 1.35 : 1.0;
  crossRing.scale.setScalar(THREE.MathUtils.lerp(crossRing.scale.x, sc, 0.25));
}

const menuGroup = new THREE.Group();
scene.add(menuGroup);
function totemWireframe(geo: THREE.BufferGeometry, color: number): THREE.LineSegments {
  return new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 }));
}

// One totem per level: distinct shape + color + 3D resource digits
// (timed → seconds, precision → axes, endless → misses allowed).
const levelTotems: THREE.Group[] = [];
const levelTotemDigits: SevenSegNumber[] = [];
{
  const shapes: Array<{ geo: THREE.BufferGeometry; color: number }> = [
    { geo: new THREE.IcosahedronGeometry(0.5), color: 0x00ffcc },
    { geo: new THREE.OctahedronGeometry(0.55), color: 0xffffff },
    { geo: new THREE.TorusGeometry(0.42, 0.13, 6, 18), color: 0xffcc00 },
    { geo: new THREE.TetrahedronGeometry(0.58), color: 0xff3366 },
    { geo: new THREE.BoxGeometry(0.62, 0.62, 0.62), color: 0x00ccaa },
    { geo: new THREE.DodecahedronGeometry(0.5), color: 0xff6633 },
    { geo: new THREE.ConeGeometry(0.48, 0.8, 5), color: 0x66ffff }
  ];
  LEVELS.forEach((level, i) => {
    const totem = new THREE.Group();
    const shape = shapes[i % shapes.length];
    totem.add(totemWireframe(shape.geo, shape.color));
    if (RENDER_FLAGS.solid) totem.add(heroSolid(shape.geo, shape.color));
    const resource = level.time ?? level.maxAxes ?? level.maxMisses ?? 0;
    const digits = new SevenSegNumber(3, 0.15, 0.28, shapes[i % shapes.length].color);
    digits.setValue(resource);
    digits.group.position.set(-0.32, -1.05, 0);
    totem.add(digits.group);
    totem.position.set((i - 3) * 1.0, 2.05, -5.0);
    totem.userData.levelId = level.id;
    totem.userData.baseY = 2.05;
    totem.userData.spin = i % 2 === 0 ? 1 : -1;
    menuGroup.add(totem);
    levelTotems.push(totem);
    levelTotemDigits.push(digits);
  });
}

// Axe-frame rack (unchanged): three mini axes, click to equip.
const frameRack = new THREE.Group();
const frameMinis: THREE.Group[] = [];
for (let i = 0; i < AXE_FRAMES.length; i++) {
  const cfg = AXE_FRAMES[i];
  const mini = new THREE.Group();
  const m = new THREE.LineBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.9 });
  const miniHandleGeo = new THREE.BoxGeometry(0.05, 0.7, 0.05);
  mini.add(new THREE.LineSegments(new THREE.EdgesGeometry(miniHandleGeo), m));
  const miniHeadGeo = new THREE.ConeGeometry(0.13, 0.28, 4);
  const hd = new THREE.LineSegments(new THREE.EdgesGeometry(miniHeadGeo), m);
  hd.rotation.z = Math.PI / 2;
  hd.position.set(0.16, 0.25, 0);
  mini.add(hd);
  if (RENDER_FLAGS.solid) {
    mini.add(heroSolid(miniHandleGeo, cfg.color));
    const hs = heroSolid(miniHeadGeo, cfg.color);
    hs.rotation.z = Math.PI / 2;
    hs.position.set(0.16, 0.25, 0);
    mini.add(hs);
  }
  mini.scale.setScalar(0.8);
  mini.position.set((i - 1) * 0.8, 0.7, -4.6);
  mini.rotation.y = 0.4;
  frameRack.add(mini);
  frameMinis.push(mini);
}
menuGroup.add(frameRack);

// Resolve group: final + best digits, retry + menu totems.
const resolveGroup = new THREE.Group();
resolveGroup.visible = false;
scene.add(resolveGroup);
const finalDigits = makeReadout(4, 2.02, 0.72, 0xffffff, '#ffffff');
finalDigits.group.position.set(-0.9, 0, 0);
const resolveHead = new THREE.Group();
resolveHead.add(finalDigits.group);
const finalIconGeo = new THREE.OctahedronGeometry(0.2);
const finalIcon = new THREE.LineSegments(
  new THREE.EdgesGeometry(finalIconGeo),
  new THREE.LineBasicMaterial({ color: 0xffffff })
);
finalIcon.position.set(0, 1.25, 0);
resolveHead.add(finalIcon);
if (RENDER_FLAGS.solid) {
  const s = heroSolid(finalIconGeo, 0xffffff);
  s.position.set(0, 1.25, 0);
  resolveHead.add(s);
}
resolveHead.position.set(0, 3.3, -6);
resolveGroup.add(resolveHead);

const bestDigits = makeReadout(4, 1.21, 0.44, 0xffcc00, '#ffcc00');
bestDigits.group.position.set(-0.55, 0, 0);
const bestHead = new THREE.Group();
bestHead.add(bestDigits.group);
bestHead.position.set(0, 2.2, -6);
resolveGroup.add(bestHead);

const retryTotem = new THREE.Group();
{
  const retryGeo = new THREE.TorusGeometry(0.5, 0.12, 6, 18);
  retryTotem.add(totemWireframe(retryGeo, 0x00ffcc));
  if (RENDER_FLAGS.solid) retryTotem.add(heroSolid(retryGeo, 0x00ffcc));
}
retryTotem.position.set(-1.7, 1.0, -6);
resolveGroup.add(retryTotem);
const resolveMenuTotem = new THREE.Group();
{
  const menuGeo = new THREE.TetrahedronGeometry(0.55);
  resolveMenuTotem.add(totemWireframe(menuGeo, 0xffcc00));
  if (RENDER_FLAGS.solid) resolveMenuTotem.add(heroSolid(menuGeo, 0xffcc00));
}
resolveMenuTotem.position.set(1.7, 1.0, -6);
resolveGroup.add(resolveMenuTotem);

// ---------------------------------------------------------------------------
// Audio: oscillator SFX panned by world x
// ---------------------------------------------------------------------------
let audioCtx: AudioContext | null = null;
function audio(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    return audioCtx;
  } catch { return null; }
}
function blip(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.12, pan = 0) {
  const ctx = audio();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g);
    if (p) { p.pan.value = THREE.MathUtils.clamp(pan, -1, 1); g.connect(p); p.connect(ctx.destination); }
    else g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch { /* audio unavailable */ }
}
const panOf = (x: number) => THREE.MathUtils.clamp(x / 8, -1, 1);

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
let phase: AppPhase = 'menu';
let level: LevelDef = LEVELS[0];
let axeState: AxeState = 'IDLE';
const axeVel = new THREE.Vector3();
let spinPhase = 0;
let charge = 0;
let overcharge = 0;
let charging = false;
let paused = false;

let score = 0;
let throwsUsed = 0;
let misses = 0;
let hits = 0;
let bullseyes = 0;
let perfectStreak = 0;
let vectorLock = false;
let calledKillshot = false;
let levelElapsed = 0;
let bestForLevel = 0;
// Slow-motion outro: when the timer expires mid-flight, the world drops to
// quarter speed until the axe lands, then the level resolves.
let slowmo = false;
const SLOWMO_SCALE = 0.25;

let shake = 0;
let lean = 0;
const keys = new Set<string>();
const tmpDir = new THREE.Vector3();
const tmpNormal = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpLocal = new THREE.Vector3();
const tmpPrevLocal = new THREE.Vector3();
const tmpVelNorm = new THREE.Vector3();

function currentPower(): number {
  return THREE.MathUtils.lerp(frame.minSpeed, frame.maxSpeed, charging ? charge : 0.45);
}

function lockPointer() {
  try {
    const p = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
    if (p && typeof p.catch === 'function') p.catch(() => { /* headless/no-gesture */ });
  } catch { /* unavailable */ }
}

function placeAxeInHand(time: number) {
  let jx = 0, jy = 0;
  if (overcharge > 0 && axeState === 'CHARGING') {
    const f = Math.min(1, overcharge / GAME_CONFIG.throw.maxOverchargeSeconds);
    jx = (Math.random() - 0.5) * 0.03 * f;
    jy = (Math.random() - 0.5) * 0.03 * f;
  }
  axeGroup.position.set(handWorld.x + jx, handWorld.y + jy, handWorld.z);
  axeGroup.rotation.set(0, 0, charging ? charge * 0.5 : Math.sin(time * 1.4) * 0.06);
  axeGroup.scale.setScalar(HELD_SCALE);
}

function setScore(v: number) {
  score = v;
  scoreDigits.setValue(score);
}

function bestKey(id: string): string { return `axevector-best-${id}`; }
function loadBest(id: string): number {
  try {
    const n = Number(localStorage.getItem(bestKey(id)) ?? '0');
    return Number.isFinite(n) ? n : 0;
  } catch { return 0; }
}

// --- phase transitions -------------------------------------------------------
function showOnly(group: THREE.Group | null) {
  menuGroup.visible = group === menuGroup;
  resolveGroup.visible = group === resolveGroup;
  for (const s of selectables) {
    let o: THREE.Object3D | null = s.hit;
    let vis = true;
    while (o) {
      if (o === menuGroup) { vis = menuGroup.visible; break; }
      if (o === resolveGroup) { vis = resolveGroup.visible; break; }
      o = o.parent;
    }
    s.hit.visible = vis;
  }
}

function startLevel(id: string) {
  level = levelById(id);
  loadLevelTargets(level);
  bestForLevel = loadBest(level.id);
  phase = 'play';
  setScore(0);
  throwsUsed = 0; misses = 0; hits = 0; bullseyes = 0;
  perfectStreak = 0; vectorLock = false; calledKillshot = false;
  levelElapsed = 0;
  slowmo = false;
  timerGroup.scale.setScalar(1);
  timerDigits.setValue(level.time ?? 0);
  timerGroup.visible = level.time !== null;
  resetAxeToHand();
  showOnly(null);
  lockPointer();
  blip(440, 0.25, 'sine', 0.1);
}

function checkLevelEnd(): boolean {
  if (phase !== 'play') return false;
  if (level.time !== null && levelElapsed >= level.time) { enterResolve(); return true; }
  if (level.maxAxes !== null && throwsUsed >= level.maxAxes && axeState === 'IDLE') { enterResolve(); return true; }
  if (level.maxMisses !== null && misses >= level.maxMisses) { enterResolve(); return true; }
  return false;
}

function enterResolve() {
  phase = 'resolve';
  slowmo = false;
  // A charge interrupted by the clock is cancelled, never thrown.
  if (axeState === 'CHARGING') {
    charging = false; charge = 0; overcharge = 0;
    axeState = 'IDLE';
  }
  finalDigits.setValue(score);
  let isBest = false;
  if (score > bestForLevel) {
    bestForLevel = score;
    isBest = true;
    try { localStorage.setItem(bestKey(level.id), String(bestForLevel)); } catch { /* no storage */ }
  }
  bestDigits.setValue(bestForLevel);
  (finalIcon.material as THREE.LineBasicMaterial).color.setHex(isBest ? 0xff3366 : 0xffffff);
  showOnly(resolveGroup);
  document.exitPointerLock?.();
  if (isBest) { blip(523, 0.4, 'sine', 0.12); setTimeout(() => blip(659, 0.4, 'sine', 0.12), 140); setTimeout(() => blip(784, 0.6, 'sine', 0.12), 280); }
  else { blip(330, 0.4, 'triangle', 0.1); setTimeout(() => blip(220, 0.6, 'triangle', 0.1), 200); }
  console.log('LEVEL COMPLETE ' + JSON.stringify({ level: level.id, score, throwsUsed, misses, hits, bullseyes, best: bestForLevel }));
}

function enterMenu() {
  phase = 'menu';
  paused = false;
  slowmo = false;
  clearGhosts();
  clearTrail();
  resetAxeToHand();
  showOnly(menuGroup);
  document.exitPointerLock?.();
}

function resetAxeToHand() {
  axeState = 'IDLE';
  charge = 0; overcharge = 0; charging = false;
  axeVel.set(0, 0, 0);
  spinPhase = 0;
}

// --- throw -------------------------------------------------------------------
function startCharge() {
  if (phase !== 'play' || axeState !== 'IDLE' || paused) return;
  if (level.maxAxes !== null && throwsUsed >= level.maxAxes) return;
  charging = true;
  axeState = 'CHARGING';
  charge = 0; overcharge = 0;
  blip(160, 0.2, 'sawtooth', 0.04);
}

function releaseAxe() {
  if (phase !== 'play' || axeState !== 'CHARGING' || paused) return;
  charging = false;
  const power = THREE.MathUtils.lerp(frame.minSpeed, frame.maxSpeed, charge);
  camera.getWorldDirection(tmpDir);
  tmpDir.y += GAME_CONFIG.throw.arcCompensation;
  const overF = Math.min(1, overcharge / GAME_CONFIG.throw.maxOverchargeSeconds);
  if (overF > 0) {
    const err = THREE.MathUtils.degToRad(GAME_CONFIG.throw.maxLateralErrorDegrees * overF);
    tmpDir.x += (Math.random() - 0.5) * 2 * err;
    tmpDir.y += (Math.random() - 0.5) * 2 * err;
  }
  tmpDir.normalize();
  axeVel.copy(tmpDir).multiplyScalar(power);
  spinPhase = 0;
  axeState = 'FLYING';
  axeGroup.scale.setScalar(1);
  throwsUsed++;
  clearTrail();
  blip(700, 0.15, 'sawtooth', 0.08);
  camera.position.z += 0.08;
}

function scheduleRecall(ms = 650) {
  window.setTimeout(() => {
    if (axeState === 'STUCK' || axeState === 'DEFLECTED') axeState = 'RECALLING';
  }, ms);
}

// --- impact + scoring ----------------------------------------------------------
function bladeDeviationDegrees(): number {
  const half = Math.PI;
  const m = ((spinPhase % half) + half) % half;
  return THREE.MathUtils.radToDeg(Math.min(m, half - m));
}

function registerMiss() {
  misses++;
  perfectStreak = 0; vectorLock = false;
}

function resolveStick(dist: number, speed: number, target: Target, hitPoint: THREE.Vector3, impactVel: THREE.Vector3) {
  const cfg = GAME_CONFIG;
  // NOTE: axeVel is already zeroed by the caller on a stick; impact speed
  // must come through the `speed` parameter sampled during flight.
  let onNode = false;
  for (const n of target.killSpheres) {
    if (hitPoint.distanceTo(n) <= (KILLSHOT_RADIUS + 0.05) * target.group.scale.x) { onNode = true; break; }
  }
  if (calledKillshot) {
    calledKillshot = false;
    if (onNode) {
      setScore(score + Math.round(cfg.scoring.killshotPoints * target.scoreMul));
      hits++;
      spawnBurst(hitPoint, 0xff3366);
      spawnCrystal(hitPoint, 0xff3366, 0.3);
      blip(880, 0.3, 'sine', 0.14, panOf(hitPoint.x));
      setTimeout(() => blip(1174, 0.3, 'sine', 0.12, panOf(hitPoint.x)), 90);
      setTimeout(() => blip(1568, 0.4, 'sine', 0.1, panOf(hitPoint.x)), 180);
      scoreDigits.setValue(score);
      console.log('THROW_RESOLVED ' + JSON.stringify({ result: 'killshot', score }));
    } else {
      // Called Killshot off the node: a miss that visibly rebounds.
      scoreDigits.setValue(score);
      deflect(hitPoint, impactVel, 'called-miss');
    }
    return;
  }

  let points = 0;
  for (let i = SCORING_ZONES.length - 1; i >= 0; i--) {
    if (dist <= SCORING_ZONES[i].radius) { points = SCORING_ZONES[i].points; break; }
  }
  if (onNode && points < 1) points = 1;

  const dev = bladeDeviationDegrees();
  const R = cfg.rotation;
  let tier: 'perfect' | 'angled' | 'graze' | 'bounce';
  if (dev <= R.perfectWindowDegrees) tier = 'perfect';
  else if (dev <= R.angledWindowDegrees) tier = 'angled';
  else if (dev <= R.grazeWindowDegrees) tier = 'graze';
  else tier = 'bounce';

  const impactSpeed = speed;
  if (tier === 'bounce' || (tier === 'graze' && impactSpeed < frame.stickThreshold + R.grazeExtraSpeed - frame.grazeDiscount)) {
    deflect(hitPoint, impactVel);
    return;
  }

  hits++;
  let gained = points;
  if (tier === 'perfect') {
    gained += cfg.scoring.rotationBonus;
    perfectStreak++;
    if (dist <= 0.12) bullseyes++;
    if (perfectStreak >= cfg.scoring.vectorLockStreak) vectorLock = true;
  } else {
    if (vectorLock && points >= 4) {
      gained += cfg.scoring.vectorLockBonus;
      spawnCrystal(hitPoint, 0xffcc00, 0.34);
    }
    vectorLock = false;
    perfectStreak = 0;
  }
  if (tier === 'graze') gained = Math.max(1, gained - 1);
  gained = Math.round(gained * target.scoreMul);
  setScore(score + gained);

  const col = tier === 'perfect' ? 0xffffff : points >= 4 ? 0xffcc00 : 0x00ffcc;
  spawnBurst(hitPoint, col);
  spawnCrystal(hitPoint, col, tier === 'perfect' ? 0.3 : 0.2);
  if (tier === 'perfect') {
    shake = 0.3;
    blip(880, 0.3, 'sine', 0.14, panOf(hitPoint.x));
    setTimeout(() => blip(1320, 0.25, 'sine', 0.11, panOf(hitPoint.x)), 80);
  } else {
    blip(320, 0.15, 'triangle', 0.12, panOf(hitPoint.x));
  }
  scoreDigits.setValue(score);
  console.log('THROW_RESOLVED ' + JSON.stringify({ result: 'stick', tier, points, gained, score, dist: Number(dist.toFixed(2)) }));
}

function deflect(hitPoint: THREE.Vector3, incoming: THREE.Vector3, result = 'bounce') {
  // Rebound from the pre-impact velocity (caller snapshots before zeroing).
  axeVel.set(
    incoming.x + (Math.random() - 0.5) * 2,
    incoming.y * 0.5,
    Math.abs(incoming.z) * 0.35
  );
  axeState = 'DEFLECTED';
  registerMiss();
  spawnBurst(hitPoint, 0xff0033);
  blip(180, 0.2, 'square', 0.1, panOf(hitPoint.x));
  console.log('THROW_RESOLVED ' + JSON.stringify({ result, score }));
  window.setTimeout(() => { if (axeState === 'DEFLECTED') axeState = 'RECALLING'; }, 600);
}

const prevPos = new THREE.Vector3();
function stepAxe(dt: number) {
  if (axeState === 'CHARGING') {
    charge = Math.min(1, charge + dt / frame.chargeTime);
    if (charge >= 1) overcharge += dt;
    return;
  }
  if (axeState !== 'FLYING') return;
  prevPos.copy(axeGroup.position);
  axeVel.y += GAME_CONFIG.gravity * dt;
  axeGroup.position.addScaledVector(axeVel, dt);
  spinPhase += frame.spinRate * dt;
  axeGroup.rotation.z += frame.spinRate * dt;
  axeGroup.rotation.x += frame.spinRate * 0.35 * dt;
  pushTrail(axeGroup.position);

  const speed = axeVel.length();
  tmpVelNorm.copy(axeVel).normalize();
  for (const t of targets) {
    if (!t.active || !t.group.visible) continue;
    // Face-local crossing test (handles slide/oscillate/rotate).
    tmpPrevLocal.copy(prevPos);
    t.face.worldToLocal(tmpPrevLocal);
    tmpLocal.copy(axeGroup.position);
    t.face.worldToLocal(tmpLocal);
    if (tmpPrevLocal.z > 0 && tmpLocal.z <= 0) {
      const a = tmpPrevLocal.z / (tmpPrevLocal.z - tmpLocal.z);
      const ix = tmpPrevLocal.x + (tmpLocal.x - tmpPrevLocal.x) * a;
      const iy = tmpPrevLocal.y + (tmpLocal.y - tmpPrevLocal.y) * a;
      const dist = Math.hypot(ix, iy);
      if (dist <= SCORING_ZONES[0].radius + 0.15) {
        t.face.getWorldQuaternion(tmpQuat);
        tmpNormal.set(0, 0, 1).applyQuaternion(tmpQuat);
        const facing = tmpVelNorm.dot(tmpNormal); // ≈ -1 when square onto the face
        const hitPoint = t.face.localToWorld(new THREE.Vector3(ix, iy, 0.05));
        console.log('IMPACT_SPEED ' + JSON.stringify({ speed: Number(speed.toFixed(2)), threshold: frame.stickThreshold, dist: Number(dist.toFixed(2)), facing: Number(facing.toFixed(3)) }));
        if (dist <= SCORING_ZONES[0].radius && speed >= frame.stickThreshold && facing < -Math.cos(THREE.MathUtils.degToRad(55))) {
          const impactVel = axeVel.clone();
          axeGroup.position.copy(hitPoint);
          axeState = 'STUCK';
          axeVel.set(0, 0, 0);
          resolveStick(dist, speed, t, hitPoint, impactVel);
          // No persistent ghost on bonus boards: they blink out, which would
          // strand a floating axe in empty space.
          if (axeState === 'STUCK' && t.kind !== 'bonus') spawnGhost();
          scheduleRecall(dist <= 0.12 ? 900 : 650);
          return;
        }
        deflect(hitPoint, axeVel.clone());
        return;
      }
    }
  }
  if (axeGroup.position.y <= 0.05 || axeGroup.position.z < -38 || Math.abs(axeGroup.position.x) > 10 || axeGroup.position.y > 9) {
    registerMiss();
    if (axeGroup.position.y <= 0.05) spawnBurst(axeGroup.position.clone(), 0xffcc00);
    blip(110, 0.25, 'sine', 0.1, panOf(axeGroup.position.x));
    console.log('THROW_RESOLVED ' + JSON.stringify({ result: 'miss', score }));
    axeState = 'RECALLING';
  }
}

// ---------------------------------------------------------------------------
// Selectable wiring
// ---------------------------------------------------------------------------
function equipFrame(i: number) {
  frame = AXE_FRAMES[i];
  clearGhosts(); // ghosts share the old geometries being disposed below
  disposeGroup(axeGroup);
  buildAxe();
  (trail.material as THREE.LineBasicMaterial).color.set(frame.trailColor);
  resetAxeToHand();
  blip(520 + i * 160, 0.18, 'sine', 0.1);
}
for (const totem of levelTotems) {
  const id = totem.userData.levelId as string;
  registerSelectable(totem, 0.5, () => startLevel(id));
}
registerSelectable(retryTotem, 0.9, () => startLevel(level.id));
registerSelectable(resolveMenuTotem, 0.9, () => enterMenu());
for (let i = 0; i < frameMinis.length; i++) {
  const idx = i;
  const proxy = new THREE.Group();
  proxy.position.copy(frameMinis[i].position);
  menuGroup.add(proxy);
  registerSelectable(proxy, 0.55, () => equipFrame(idx));
}
// Menu backdrop: classic arena standing by.
loadLevelTargets(LEVELS[0]);
showOnly(menuGroup);

// ---------------------------------------------------------------------------
// Input (mouse-look works in every phase once locked; totems use center ray)
// ---------------------------------------------------------------------------
document.addEventListener('mousemove', (e: MouseEvent) => {
  if (!document.pointerLockElement || document.pointerLockElement !== canvas) return;
  if (paused) return;
  yawObject.rotation.y -= e.movementX * GAME_CONFIG.camera.sensitivity;
  pitchObject.rotation.x -= e.movementY * GAME_CONFIG.camera.sensitivity;
  yawObject.rotation.y = THREE.MathUtils.clamp(yawObject.rotation.y, -THREE.MathUtils.degToRad(GAME_CONFIG.camera.maxYaw), THREE.MathUtils.degToRad(GAME_CONFIG.camera.maxYaw));
  pitchObject.rotation.x = THREE.MathUtils.clamp(pitchObject.rotation.x, THREE.MathUtils.degToRad(GAME_CONFIG.camera.minPitch), THREE.MathUtils.degToRad(GAME_CONFIG.camera.maxPitch));
});

document.addEventListener('mousedown', (e: MouseEvent) => {
  if (e.button !== 0) return;
  audio();
  if (!document.pointerLockElement || document.pointerLockElement !== canvas) { lockPointer(); return; }
  if (phase === 'menu' || phase === 'resolve') {
    if (hovered) hovered.action();
    return;
  }
  if (paused) { paused = false; return; }
  startCharge();
});
document.addEventListener('mouseup', (e: MouseEvent) => { if (e.button === 0) releaseAxe(); });
document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('pointerlockchange', () => {
  if (phase === 'play' && (!document.pointerLockElement || document.pointerLockElement !== canvas)) {
    // Lock loss cancels a charged throw (no phantom throw) and pauses.
    if (axeState === 'CHARGING') {
      charging = false; charge = 0; overcharge = 0;
      axeState = 'IDLE';
    }
    paused = true;
  }
});

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.repeat) return;
  keys.add(e.code);
  audio();
  if (e.code === 'Digit1' && phase === 'play' && axeState === 'IDLE') equipFrame(0);
  if (e.code === 'Digit2' && AXE_FRAMES[1] && phase === 'play' && axeState === 'IDLE') equipFrame(1);
  if (e.code === 'Digit3' && AXE_FRAMES[2] && phase === 'play' && axeState === 'IDLE') equipFrame(2);
  if (e.code === 'Space') startCharge();
  if (e.code === 'KeyQ' && phase === 'play' && (axeState === 'IDLE' || axeState === 'CHARGING')) {
    calledKillshot = !calledKillshot;
    blip(calledKillshot ? 990 : 440, 0.2, 'sine', 0.1);
  }
  if (e.code === 'KeyR' && phase === 'play' && axeState !== 'IDLE') {
    charging = false; charge = 0; overcharge = 0;
    axeState = 'RECALLING';
  }
  if (e.code === 'KeyM') { if (phase !== 'menu') enterMenu(); }
  if (e.code === 'KeyP' && phase === 'play') paused = !paused;
  if (e.code === 'Enter' && phase === 'resolve') startLevel(level.id);
  if (e.code === 'Enter' && phase === 'menu') startLevel('classic');
});
document.addEventListener('keyup', (e: KeyboardEvent) => {
  keys.delete(e.code);
  if (e.code === 'Space') releaseAxe();
});

let touchAim: { x: number; y: number } | null = null;
let touchDownAt = 0;
let touchMoved = false;
canvas.addEventListener('touchstart', (e: TouchEvent) => {
  audio();
  const t = e.changedTouches[0];
  touchAim = { x: t.clientX, y: t.clientY };
  touchDownAt = performance.now();
  touchMoved = false;
  if (phase === 'play' && !paused) startCharge();
}, { passive: true });
canvas.addEventListener('touchmove', (e: TouchEvent) => {
  const t = e.changedTouches[0];
  if (!touchAim) return;
  const dx = t.clientX - touchAim.x;
  const dy = t.clientY - touchAim.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) touchMoved = true;
  touchAim = { x: t.clientX, y: t.clientY };
  if (phase === 'play' && !paused) {
    yawObject.rotation.y -= dx * 0.005;
    pitchObject.rotation.x -= dy * 0.005;
    yawObject.rotation.y = THREE.MathUtils.clamp(yawObject.rotation.y, -THREE.MathUtils.degToRad(GAME_CONFIG.camera.maxYaw), THREE.MathUtils.degToRad(GAME_CONFIG.camera.maxYaw));
    pitchObject.rotation.x = THREE.MathUtils.clamp(pitchObject.rotation.x, THREE.MathUtils.degToRad(GAME_CONFIG.camera.minPitch), THREE.MathUtils.degToRad(GAME_CONFIG.camera.maxPitch));
  }
}, { passive: true });
canvas.addEventListener('touchend', (e: TouchEvent) => {
  const quick = performance.now() - touchDownAt < 250 && !touchMoved;
  if ((phase === 'menu' || phase === 'resolve') && quick) {
    const t = e.changedTouches[0];
    const ndc = new THREE.Vector2((t.clientX / window.innerWidth) * 2 - 1, -(t.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hitsRay = raycaster.intersectObjects(selectables.filter(s => s.hit.visible).map(s => s.hit), false);
    if (hitsRay.length > 0) {
      const s = selectables.find(x => x.hit === hitsRay[0].object);
      if (s) s.action();
    }
  }
  if (phase === 'play') releaseAxe();
  touchAim = null;
}, { passive: true });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (composerRig) {
    composerRig.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composerRig.composer.setSize(window.innerWidth, window.innerHeight);
  }
});

// S4: composer is ON for real GPUs, auto-OFF under SwiftShader,
// reduced-motion, or CI hooks (?selftest/?audit) for determinism.
let composerRig: ComposerRig | null = null;
{
  const ci = RENDER_QUERY.has('selftest') || RENDER_QUERY.has('audit');
  let reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch { /* matchMedia unavailable */ }
  const software = isSoftwareRenderer(renderer);
  const forced = RENDER_FLAGS.bloom;
  const on = forced === '1' ? true : forced === '0' ? false : (!software && !reduced && !ci);
  if (on) {
    composerRig = buildComposer(renderer, scene, camera);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  }
  console.log(`[bloom] ${on ? 'on' : 'off'} (forced=${forced ?? 'auto'} software=${software} reduced=${reduced} ci=${ci})`);
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
let accumulator = 0;
let frameCount = 0;
let simTime = 0; // scaled world-clock (slows during the slow-mo outro)
const camWorldPos = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  frameCount++;
  const dt = Math.min(clock.getDelta(), 0.1);
  const time = clock.elapsedTime;
  const sdt = paused ? 0 : dt * (slowmo ? SLOWMO_SCALE : 1);
  simTime += sdt;

  if (phase === 'play' && !paused && !slowmo) {
    levelElapsed += dt;
    if (level.time !== null) {
      timerDigits.setValue(Math.max(0, Math.ceil(level.time - levelElapsed)));
      if (levelElapsed >= level.time) {
        // Clock expired mid-flight: slow motion until the axe lands.
        if (axeState === 'FLYING') slowmo = true;
        else enterResolve();
      }
    }
  }

  if (!paused) {
    updateTargets(level, levelElapsed, simTime, phase === 'play');
    accumulator += sdt;
    while (accumulator >= GAME_CONFIG.fixedStep) {
      stepAxe(GAME_CONFIG.fixedStep);
      accumulator -= GAME_CONFIG.fixedStep;
    }
    if (axeState === 'RECALLING') {
      updateHandFrame();
      placeAxeInHand(time);
      axeState = 'IDLE';
      clearTrail();
      checkLevelEnd();
    }
  }

  updateHandFrame();

  if (axeState === 'IDLE' || axeState === 'CHARGING') placeAxeInHand(time);
  const overF = axeState === 'CHARGING' ? Math.min(1, overcharge / GAME_CONFIG.throw.maxOverchargeSeconds) : 0;
  updateChargeArc(charge, time, overF, calledKillshot);

  dialRing.visible = dialDot.visible = phase === 'play' && (axeState === 'IDLE' || axeState === 'CHARGING');
  if (dialRing.visible) {
    dialRing.position.copy(handWorld).addScaledVector(camFwd, 0.1);
    dialRing.lookAt(camWorldPos.copy(handWorld).add(camFwd));
    dialDot.position.copy(dialRing.position).addScaledVector(camUp, 0.12);
  }

  crossRing.position.copy(camera.getWorldPosition(camWorldPos)).addScaledVector(camFwd, 2.2);
  crossRing.lookAt(camWorldPos);

  updateTrajectory(currentPower());
  updateOrbiters(perfectStreak, time);

  const leanTarget = (keys.has('KeyA') ? -0.35 : 0) + (keys.has('KeyD') ? 0.35 : 0);
  lean = THREE.MathUtils.lerp(lean, leanTarget, dt * 8);
  yawObject.position.x = lean;

  camera.getWorldPosition(camWorldPos);
  scoreboard.lookAt(camWorldPos);
  timerGroup.lookAt(camWorldPos);
  // Pulsing timer is the slow-mo outro cue.
  timerGroup.scale.setScalar(slowmo ? 1 + 0.12 * Math.sin(simTime * 10) : 1);
  scoreIcon.rotation.z += sdt * 1.2;
  scoreDigits.setPulse(0.75 + 0.25 * Math.sin(time * 2));

  for (const t of targets) {
    if (t.kind !== 'static' && t.kind !== 'bonus') continue;
    for (const n of t.killNodes) {
      const f = calledKillshot ? 10 : 3;
      n.scale.setScalar(1 + 0.25 * Math.sin(time * f));
      (n.material as THREE.LineBasicMaterial).opacity = calledKillshot ? 1 : 0.65 + 0.3 * Math.sin(time * 3);
    }
  }

  for (const p of (scene.userData.throwPrisms as THREE.Object3D[] ?? [])) p.rotation.y += dt * 0.8 * (p.userData.spin as number);
  if (menuGroup.visible) {
    levelTotems.forEach((totem, i) => {
      totem.rotation.y += dt * 0.6 * (totem.userData.spin as number);
      totem.position.y = (totem.userData.baseY as number) + Math.sin(time * 1.5 + i * 0.9) * 0.08;
      levelTotemDigits[i].group.lookAt(camWorldPos);
    });
    frameMinis.forEach((m, i) => {
      const selected = AXE_FRAMES[i] === frame;
      m.rotation.y += dt * (selected ? 1.6 : 0.4);
      m.scale.setScalar(selected ? 0.95 + 0.08 * Math.sin(time * 5) : 0.8);
    });
    updateHover();
  } else {
    if (!resolveGroup.visible) hovered = null;
  }
  if (resolveGroup.visible) {
    retryTotem.rotation.z += dt * 0.8;
    resolveMenuTotem.rotation.y += dt * 0.8;
    updateHover();
  }

  updateRack(level, throwsUsed, misses, time);

  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    b.life += sdt;
    const k = 1 + b.life * 7;
    b.line.scale.set(k, k, k);
    (b.line.material as THREE.LineBasicMaterial).opacity = Math.max(0, 1 - b.life * 2.2);
    if (b.life > 0.5) { scene.remove(b.line); b.line.geometry.dispose(); (b.line.material as THREE.Material).dispose(); bursts.splice(i, 1); }
  }
  for (let i = crystals.length - 1; i >= 0; i--) {
    const c = crystals[i];
    c.life += sdt;
    c.group.position.y += c.vel * sdt;
    c.vel *= 1 - sdt * 1.5;
    c.group.rotation.y += sdt * 3;
    c.group.scale.setScalar(Math.max(0.01, 1 - c.life * 0.7));
    (c.lines.material as THREE.LineBasicMaterial).opacity = Math.max(0, 1 - c.life * 0.8);
    if (c.solid) (c.solid.material as THREE.LineBasicMaterial).opacity = Math.max(0, 1 - c.life * 0.8);
    if (c.life > 1.3) { scene.remove(c.group); disposeGroup(c.group); crystals.splice(i, 1); }
  }

  if (shake > 0) {
    shake = Math.max(0, shake - sdt);
    pitchObject.rotation.z = (Math.random() - 0.5) * shake * 0.2;
  } else {
    pitchObject.rotation.z = 0;
  }
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, 0, sdt * 8);

  if (composerRig) composerRig.composer.render();
  else renderer.render(scene, camera);

  if (RENDER_FLAGS.stats && frameCount % 60 === 0) {
    const info = renderer.info.render;
    console.log(`[stats] calls=${info.calls} tris=${info.triangles} frame=${frameCount}`);
  }
}

scoreDigits.setValue(0);
resetAxeToHand();
// Prime world matrices so hand-anchored II placement is correct on the very
// first frame (before any render has updated the graph).
scene.updateMatrixWorld(true);
animate();

// CI hooks (not game UI): ?autostart=<levelId>, ?selftest=1 (sync precision
// run) or ?selftest=<levelId> (6 sync throws on any arena).
const query = new URLSearchParams(window.location.search);
const autostart = query.get('autostart');
const knownIds = LEVELS.map(l => l.id);
if (autostart) {
  if (!knownIds.includes(autostart)) console.warn(`AXE//VECTOR unknown autostart level "${autostart}", falling back to classic`);
  startLevel(levelById(autostart).id);
}
if (query.has('selftest')) {
  const simState = (): AxeState => axeState;
  const outcomes: string[] = [];
  const selftestLevel = query.get('selftest');
  if (selftestLevel && selftestLevel !== '1' && !knownIds.includes(selftestLevel)) {
    console.warn(`AXE//VECTOR unknown selftest level "${selftestLevel}", falling back to classic`);
  }
  const selftestId = selftestLevel && selftestLevel !== '1' ? levelById(selftestLevel).id : 'precision';
  const selftestThrows = selftestId === 'precision' ? 10 : 6;
  scene.updateMatrixWorld(true);
  startLevel(selftestId);
  for (let t = 0; t < selftestThrows; t++) {
    scene.updateMatrixWorld(true);
    updateHandFrame();
    // Sweep the motion clock per throw so movers sit at different phases —
    // exercises slider/oscillator/rotor poses, not just one snapshot.
    updateTargets(level, 0.5, 0.5 + t * 0.9, true);
    // Aim at the level's lead board (targets[0]) so layout changes can't
    // silently break selftest coverage. Uses the board's current position,
    // so movers are aimed at where they are, not where they were.
    const aimBoard = targets[0] ?? null;
    if (aimBoard) {
      const dx = aimBoard.group.position.x - yawObject.position.x;
      const dy = aimBoard.group.position.y - yawObject.position.y;
      const dz = aimBoard.group.position.z - yawObject.position.z;
      yawObject.rotation.y = THREE.MathUtils.clamp(
        Math.atan2(-dx, -dz),
        -THREE.MathUtils.degToRad(GAME_CONFIG.camera.maxYaw),
        THREE.MathUtils.degToRad(GAME_CONFIG.camera.maxYaw));
      pitchObject.rotation.x = THREE.MathUtils.clamp(
        Math.atan2(dy, Math.hypot(dx, dz)),
        THREE.MathUtils.degToRad(GAME_CONFIG.camera.minPitch),
        THREE.MathUtils.degToRad(GAME_CONFIG.camera.maxPitch));
      scene.updateMatrixWorld(true);
      updateHandFrame();
    }
    startCharge();
    charge = 1;
    // ?selftest=<level>&killshot=1 arms a called killshot on throw 0 to
    // exercise the called-miss rebound path (straight throws hit face,
    // never the node).
    if (t === 0 && query.has('killshot')) calledKillshot = true;
    releaseAxe();
    let guard = 0;
    while (simState() === 'FLYING' && guard++ < 1200) stepAxe(GAME_CONFIG.fixedStep);
    outcomes.push(`${simState()}@${axeGroup.position.x.toFixed(2)},${axeGroup.position.y.toFixed(2)},${axeGroup.position.z.toFixed(2)}`);
    if (simState() === 'STUCK' || simState() === 'DEFLECTED') axeState = 'RECALLING';
    if (simState() === 'RECALLING') {
      placeAxeInHand(0);
      axeState = 'IDLE';
      clearTrail();
      camera.position.z = 0; // simulate per-frame recoil recovery
      checkLevelEnd();
    }
  }
  document.title = `SELFTEST level=${selftestId} score=${score} throws=${throwsUsed} misses=${misses} hits=${hits} bullseyes=${bullseyes} phase=${phase} OUTCOMES=${outcomes.join('|')}`;
  console.log('SELFTEST ' + JSON.stringify({ score, throwsUsed, misses, hits, bullseyes, phase }));
}

// ?audit=1: verify every level spawns exactly its spec'd targets and that
// bonus boards are visible only inside their spawn windows.
if (query.has('audit')) {
  const auditLines: string[] = [];
  for (const lv of LEVELS) {
    scene.updateMatrixWorld(true);
    loadLevelTargets(lv);
    const dur = lv.time ?? 60;
    let countOk = targets.length === lv.targets.length;
    let kindOk = true;
    for (let i = 0; i < lv.targets.length; i++) {
      if (!targets[i] || targets[i].kind !== lv.targets[i].type) { kindOk = false; break; }
    }
    let visMismatch = 0;
    let bonusEverVisible = true;
    for (const spec of lv.targets) {
      if (spec.type !== 'bonus') continue;
      // A bonus must appear at least once within the level duration.
      const period = (spec.lifetime ?? 0) + BONUS_RESPAWN_GAP;
      let seen = false;
      for (let e = Math.floor(spec.spawnAt ?? 0); e <= dur && !seen; e++) {
        if (((e - (spec.spawnAt ?? 0)) % period) < (spec.lifetime ?? 0)) seen = true;
      }
      if (!seen) bonusEverVisible = false;
    }
    for (let e = 0; e <= dur; e += 1) {
      scene.updateMatrixWorld(true);
      updateTargets(lv, e, e, true);
      for (let i = 0; i < targets.length; i++) {
        const spec = lv.targets[i];
        const t = targets[i];
        let should = spec.type !== 'bonus';
        if (spec.type === 'bonus') {
          const period = (spec.lifetime ?? 0) + BONUS_RESPAWN_GAP;
          should = e >= (spec.spawnAt ?? 0) && (((e - (spec.spawnAt ?? 0)) % period) < (spec.lifetime ?? 0));
        }
        if (t.group.visible !== should || t.active !== should) visMismatch++;
      }
    }
    auditLines.push(`${lv.id}: n=${targets.length}/${lv.targets.length} kinds=${kindOk ? 'ok' : 'MISMATCH'} vis=${visMismatch === 0 ? 'ok' : `MISMATCH(${visMismatch})`} bonusSeen=${bonusEverVisible ? 'ok' : 'NEVER'}`);
  }
  document.title = `AUDIT ${auditLines.join(' | ')}`;
  console.log('AUDIT', auditLines);
}
