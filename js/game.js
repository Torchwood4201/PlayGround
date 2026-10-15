// js/game.js — WebGL voxel demo. Terrain/physics ported from the 0.8a source:
// LevelGen+NoiseMap (js/world.js), AABB clip collision (Entity.move),
// Player.tick movement, Tile.render face shading, Bush cross-quads.
// Upgrades: WebGL renderer, DDA picking, localStorage saves, zombie billboards.

import { Level, generateMap, sprinkleBushes, JavaRandom, TILE, TILE_NAME, tileTexture, isSolidId } from './world.js';

export const WORLD = { W: 64, H: 64, D: 48 };
const TICK = 1 / 20;
const EYE = 1.62;

// ---------- tiny mat4 ----------
function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan((fovy * Math.PI) / 360);
  const m = new Float32Array(16);
  m[0] = f / aspect; m[5] = f;
  m[10] = (far + near) / (near - far); m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}
function viewMatrix(eye, yawDeg, pitchDeg) {
  const yaw = (yawDeg * Math.PI) / 180, pitch = (pitchDeg * Math.PI) / 180;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  // forward = direction the player looks
  const fx = -sy * cp, fy = sp, fz = -cy * cp;
  const rx = cy, rz = -sy; // right
  const ux = -sy * sp * -1, uy = cp, uz = -cy * sp * -1;
  // build lookAt-style (column major for WebGL)
  const z = [-fx, -fy, -fz];
  const x = [rx, 0, rz];
  const y = [ux, uy, uz];
  const m = new Float32Array(16);
  m[0] = x[0]; m[1] = y[0]; m[2] = z[0]; m[3] = 0;
  m[4] = x[1]; m[5] = y[1]; m[6] = z[1]; m[7] = 0;
  m[8] = x[2]; m[9] = y[2]; m[10] = z[2]; m[11] = 0;
  m[12] = -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]);
  m[13] = -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]);
  m[14] = -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]);
  m[15] = 1;
  return m;
}
export function lookDir(yawDeg, pitchDeg) {
  const yaw = (yawDeg * Math.PI) / 180, pitch = (pitchDeg * Math.PI) / 180;
  return [-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
}

// ---------- AABB helpers (AABB.java) ----------
const box = (x0, y0, z0, x1, y1, z1) => ({ x0, y0, z0, x1, y1, z1 });
function expand(b, xa, ya, za) {
  return box(
    xa < 0 ? b.x0 + xa : b.x0, ya < 0 ? b.y0 + ya : b.y0, za < 0 ? b.z0 + za : b.z0,
    xa > 0 ? b.x1 + xa : b.x1, ya > 0 ? b.y1 + ya : b.y1, za > 0 ? b.z1 + za : b.z1);
}
function clipX(c, t, xa) {
  if (c.y1 > t.y0 && c.y0 < t.y1 && c.z1 > t.z0 && c.z0 < t.z1) {
    if (xa > 0 && c.x1 <= t.x0) { const m = t.x0 - c.x1; if (m < xa) xa = m; }
    if (xa < 0 && c.x0 >= t.x1) { const m = t.x1 - c.x0; if (m > xa) xa = m; }
  }
  return xa;
}
function clipY(c, t, ya) {
  if (c.x1 > t.x0 && c.x0 < t.x1 && c.z1 > t.z0 && c.z0 < t.z1) {
    if (ya > 0 && c.y1 <= t.y0) { const m = t.y0 - c.y1; if (m < ya) ya = m; }
    if (ya < 0 && c.y0 >= t.y1) { const m = t.y1 - c.y0; if (m > ya) ya = m; }
  }
  return ya;
}
function clipZ(c, t, za) {
  if (c.x1 > t.x0 && c.x0 < t.x1 && c.y1 > t.y0 && c.y0 < t.y1) {
    if (za > 0 && c.z1 <= t.z0) { const m = t.z0 - c.z1; if (m < za) za = m; }
    if (za < 0 && c.z0 >= t.z1) { const m = t.z1 - c.z0; if (m > za) za = m; }
  }
  return za;
}
function intersects(a, c) {
  return c.x1 > a.x0 && c.x0 < a.x1 && c.y1 > a.y0 && c.y0 < a.y1 && c.z1 > a.z0 && c.z0 < a.z1;
}

// ---------- atlas ----------
function px(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
function noiseTile(ctx, tx, ty, base, vary, rng, holes = 0) {
  const ox = tx * 16, oy = ty * 16;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (holes && rng.nextFloat() < holes) continue;
    const v = (rng.nextFloat() - 0.5) * vary;
    px(ctx, ox + x, oy + y, `rgb(${base[0] + v | 0},${base[1] + v | 0},${base[2] + v | 0})`);
  }
}
async function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
export async function buildAtlas() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  const rng = new JavaRandom(42);
  ctx.clearRect(0, 0, 256, 256);
  const at = (i) => [(i % 16) * 16, Math.floor(i / 16) * 16];
  try {
    const dirt = await loadImage('assets/textures/dirt.png');
    const grass = await loadImage('assets/textures/grass.png');
    let [dx, dy] = at(2); ctx.drawImage(dirt, dx, dy);
    let [gx, gy] = at(3); ctx.drawImage(grass, gx, gy);
  } catch (e) { /* offline fallback below */ }
  // fallbacks / procedural tiles (terrain.png was not in the zip)
  const ensure = (i, fn) => {
    const [x, y] = at(i);
    const d = ctx.getImageData(x, y, 16, 16).data;
    let empty = true;
    for (let k = 3; k < d.length; k += 4) if (d[k] !== 0) { empty = false; break; }
    if (empty) fn(x, y);
  };
  ensure(2, (x, y) => { ctx.save(); ctx.translate(x, y); noiseTile(ctx, 0, 0, [134, 96, 67], 36, rng); ctx.restore(); });
  ensure(3, (x, y) => { ctx.save(); ctx.translate(x, y); noiseTile(ctx, 0, 0, [110, 90, 60], 30, rng); ctx.fillStyle = '#6aaa4f'; ctx.fillRect(x, y, 16, 5); ctx.restore(); });
  let [zx, zy] = at(0); ctx.save(); ctx.translate(zx, zy); noiseTile(ctx, 0, 0, [106, 170, 79], 30, rng); ctx.restore();
  [zx, zy] = at(1); ctx.save(); ctx.translate(zx, zy); noiseTile(ctx, 0, 0, [125, 125, 125], 22, rng); ctx.restore();
  [zx, zy] = at(4); // wood planks
  ctx.save(); ctx.translate(zx, zy);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    let c = [138, 98, 56];
    if (y % 4 === 3) c = [90, 62, 34];
    if ((x + (y >> 2) * 7) % 8 === 0) c = [100, 70, 40];
    px(ctx, x, y, `rgb(${c[0]},${c[1]},${c[2]})`);
  }
  ctx.restore();
  [zx, zy] = at(15); ctx.save(); ctx.translate(zx, zy); noiseTile(ctx, 0, 0, [52, 130, 52], 46, rng, 0.22); ctx.restore();
  [zx, zy] = at(16); // brick
  ctx.save(); ctx.translate(zx, zy);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const mortar = y % 4 === 3 || (x + (y >> 2) * 4) % 8 === 7;
    px(ctx, x, y, mortar ? '#b8a89a' : '#9e4b3f');
  }
  ctx.restore();
  return cv;
}

// ---------- raycast (DDA) ----------
export function raycast(level, o, d, maxD) {
  let x = Math.floor(o[0]), y = Math.floor(o[1]), z = Math.floor(o[2]);
  const sx = Math.sign(d[0]), sy = Math.sign(d[1]), sz = Math.sign(d[2]);
  const tdx = sx !== 0 ? Math.abs(1 / d[0]) : Infinity;
  const tdy = sy !== 0 ? Math.abs(1 / d[1]) : Infinity;
  const tdz = sz !== 0 ? Math.abs(1 / d[2]) : Infinity;
  let tmx = sx !== 0 ? (sx > 0 ? (x + 1 - o[0]) : (o[0] - x)) * tdx : Infinity;
  let tmy = sy !== 0 ? (sy > 0 ? (y + 1 - o[1]) : (o[1] - y)) * tdy : Infinity;
  let tmz = sz !== 0 ? (sz > 0 ? (z + 1 - o[2]) : (o[2] - z)) * tdz : Infinity;
  let nx = 0, ny = 0, nz = 0, t = 0;
  for (let i = 0; i < 64; i++) {
    if (tmx < tmy && tmx < tmz) { x += sx; t = tmx; tmx += tdx; nx = -sx; ny = 0; nz = 0; }
    else if (tmy < tmz) { y += sy; t = tmy; tmy += tdy; nx = 0; ny = -sy; nz = 0; }
    else { z += sz; t = tmz; tmz += tdz; nx = 0; ny = 0; nz = -sz; }
    if (t > maxD) return null;
    if (level.getTile(x, y, z) !== 0) return { x, y, z, nx, ny, nz };
  }
  return null;
}

const TILE_COLORS = { 1: [125, 125, 125], 2: [106, 170, 79], 3: [134, 96, 67], 4: [158, 75, 63], 5: [138, 98, 56], 6: [52, 130, 52] };

// ---------- game ----------
export function createGame(canvas, hooks = {}) {
  const { W, H, D } = WORLD;
  const state = {
    gl: null, level: null, seed: 1337, built: false,
    player: null, keys: {}, jumpQueued: false, selected: 2,
    meshes: null, mobs: [], particles: [], cloudsTex: null, zombieTex: null,
    acc: 0, last: 0, fps: 0, frames: 0, fpsT: 0, running: false,
    mobsOn: true, tickRng: new JavaRandom(7), cloudT: 0,
  };
  const toast = (msg, ms = 2200) => hooks.toast && hooks.toast(msg, ms);

  function newPlayer(level, x, z) {
    const y = level.topY(Math.floor(x), Math.floor(z)) + 2.5;
    const w = 0.3, h = 0.9;
    return {
      x, y, z, xo: x, yo: y, zo: z, xd: 0, yd: 0, zd: 0,
      yaw: 45, pitch: -10, onGround: false,
      bb: box(x - w, y - h, z - w, x + w, y + h, z + w),
    };
  }
  function syncBB(p) {
    const w = 0.3, h = 0.9;
    p.bb = box(p.x - w, p.y - h, p.z - w, p.x + w, p.y + h, p.z + w);
  }

  // ----- world gen -----
  function genWorld(seed) {
    state.seed = seed;
    const t0 = performance.now();
    const blocks = generateMap(W, H, D, seed);
    state.level = new Level(W, H, D, blocks);
    sprinkleBushes(state.level, new JavaRandom(seed ^ 0x9e37), 160);
    const sx = W >> 1, sz = H >> 1;
    // clear a spawn clearing so the player doesn't wake up inside leaves
    for (let x = sx - 4; x <= sx + 4; x++) for (let z = sz - 4; z <= sz + 4; z++) {
      const y = state.level.topY(x, z);
      if (state.level.getTile(x, y, z) === TILE.GRASS && state.level.getTile(x, y + 1, z) === TILE.BUSH) {
        state.level.blocks[state.level.idx(x, y + 1, z)] = 0;
      }
    }
    state.level.calcLightDepths(sx - 4, sz - 4, 9, 9);
    state.player = newPlayer(state.level, sx + 0.5, sz + 0.5);
    state.player.yaw = 45; state.player.pitch = -4;
    state.tickRng = new JavaRandom(seed ^ 0x51f7);
    spawnMobs();
    rebuildMesh();
    hooks.stats && hooks.stats(counts());
    toast(`World grown from seed ${seed} in ${(performance.now() - t0) | 0} ms`);
  }
  function counts() {
    const c = [0, 0, 0, 0, 0, 0, 0];
    const b = state.level.blocks;
    for (let i = 0; i < b.length; i++) c[b[i]]++;
    return c;
  }

  function spawnMobs() {
    state.mobs = [];
    const rng = new JavaRandom((state.seed ^ 0x5bd1) | 0);
    for (let i = 0; i < 6; i++) {
      const x = 4 + rng.nextFloat() * (W - 8), z = 4 + rng.nextFloat() * (H - 8);
      state.mobs.push({ x, z, y: state.level.topY(x | 0, z | 0) + 1, dir: rng.nextFloat() * Math.PI * 2, t: rng.nextFloat() * 4, ph: rng.nextFloat() * 9 });
    }
  }

  // ----- meshing -----
  const FACES = [
    { d: [0, -1, 0], s: 0.55, c: [[0, 0, 1], [0, 0, 0], [1, 0, 0], [1, 0, 1]] },
    { d: [0, 1, 0], s: 1.0, c: [[1, 1, 1], [1, 1, 0], [0, 1, 0], [0, 1, 1]] },
    { d: [0, 0, -1], s: 0.8, c: [[0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 0]] },
    { d: [0, 0, 1], s: 0.8, c: [[0, 1, 1], [0, 0, 1], [1, 0, 1], [1, 1, 1]] },
    { d: [-1, 0, 0], s: 0.6, c: [[0, 1, 1], [0, 1, 0], [0, 0, 0], [0, 0, 1]] },
    { d: [1, 0, 0], s: 0.6, c: [[1, 1, 0], [1, 1, 1], [1, 0, 1], [1, 0, 0]] },
  ];
  function rebuildMesh() {
    const gl = state.gl;
    const pos = [], uv = [], sh = [], idx = [];
    const litMul = (x, y, z) => (state.level.isLit(x, y, z) ? 1 : 0.42);
    // subtle per-column tint variation so meadows don't look flat
    const tint = (x, z) => 0.93 + 0.07 * (Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1);
    const pushV = (x, y, z, u, v, s) => { pos.push(x, y, z); uv.push(u, v); sh.push(s); return pos.length / 3 - 1; };
    const tileUV = (t) => {
      const tx = t % 16, ty = Math.floor(t / 16);
      const e = 0.4 / 256;
      return [tx / 16 + e, ty / 16 + e, (tx + 1) / 16 - e, (ty + 1) / 16 - e];
    };
    for (let y = 0; y < D; y++) for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const id = state.level.getTile(x, y, z);
      if (!id) continue;
      if (id === TILE.BUSH) {
        // Cross-quads, double-sided — like Bush.render() (two diagonal planes).
        const [u0, v0, u1, v1] = tileUV(15);
        const s = litMul(x, y, z);
        const quad = (ax, az, bx, bz) => {
          const a = pushV(x + ax, y + 1, z + az, u0, v0, s), b = pushV(x + bx, y + 1, z + bz, u1, v0, s * 0.9),
            c = pushV(x + bx, y, z + bz, u1, v1, s * 0.9), d2 = pushV(x + ax, y, z + az, u0, v1, s);
          idx.push(a, d2, c, a, c, b, b, c, d2, b, d2, a);
        };
        quad(0.15, 0.15, 0.85, 0.85);
        quad(0.15, 0.85, 0.85, 0.15);
        continue;
      }
      for (let f = 0; f < 6; f++) {
        const F = FACES[f];
        const nx = x + F.d[0], ny = y + F.d[1], nz = z + F.d[2];
        const nid = state.level.getTile(nx, ny, nz);
        if (isSolidId(nid)) continue; // hidden face (matches shouldRenderFace for opaque)
        const [u0, v0, u1, v1] = tileUV(tileTexture(id, f));
        // map corners to uv: c[0]->(u0,v0) c[1]->(u1,v0) c[2]->(u1,v1) c[3]->(u0,v1)
        const s = F.s * litMul(x, y + (f === 0 ? -1 : 1), z) * (f === 1 ? tint(x, z) : 1);
        const v = F.c.map((p, k) => pushV(x + p[0], y + p[1], z + p[2], k === 0 || k === 3 ? u0 : u1, k < 2 ? v0 : v1, s));
        idx.push(v[0], v[1], v[2], v[0], v[2], v[3]);
      }
    }
    const mk = (arr, n) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW); return b; };
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(idx), gl.STATIC_DRAW);
    const fresh = { pos: mk(pos, 3), uv: mk(uv, 2), sh: mk(sh, 1), idx: ib, count: idx.length };
    // swap atomically: only after the new mesh is fully built do we drop the old one
    if (state.meshes) {
      for (const k of ['pos', 'uv', 'sh', 'idx']) gl.deleteBuffer(state.meshes[k]);
    }
    state.meshes = fresh;
  }

  // ----- GL init -----
  const VSRC = `attribute vec3 aPos;attribute vec2 aUV;attribute float aShade;
uniform mat4 uProj,uView;varying vec2 vUV;varying float vShade;varying float vDist;
void main(){vec4 vp=uView*vec4(aPos,1.0);vDist=-vp.z;gl_Position=uProj*vp;vUV=aUV;vShade=aShade;}`;
  const FSRC = `precision mediump float;varying vec2 vUV;varying float vShade;varying float vDist;
uniform sampler2D uTex;uniform vec3 uFog;uniform vec2 uFogRange;
void main(){vec4 c=texture2D(uTex,vUV);if(c.a<0.5)discard;
float f=clamp((vDist-uFogRange.x)/(uFogRange.y-uFogRange.x),0.0,1.0);
gl_FragColor=vec4(mix(c.rgb*vShade,uFog,f),1.0);}`;
  const PVSRC = `attribute vec3 aPos;attribute vec3 aCol;attribute float aSize;
uniform mat4 uProj,uView;uniform float uScale;varying vec3 vCol;varying float vDist;
void main(){vec4 vp=uView*vec4(aPos,1.0);vDist=-vp.z;gl_Position=uProj*vp;
gl_PointSize=clamp(aSize*uScale/max(0.1,-vp.z),1.0,22.0);vCol=aCol;}`;
  const PFSRC = `precision mediump float;varying vec3 vCol;varying float vDist;
uniform vec3 uFog;uniform vec2 uFogRange;
void main(){float f=clamp((vDist-uFogRange.x)/(uFogRange.y-uFogRange.x),0.0,1.0);
gl_FragColor=vec4(mix(vCol,uFog,f),1.0);}`;
  function prog(gl, vs, fs) {
    const c = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const p = gl.createProgram();
    gl.attachShader(p, c(gl.VERTEX_SHADER, vs)); gl.attachShader(p, c(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    return p;
  }

  let P = null, PP = null, atlasTex = null;
  async function initGL() {
    const gl = canvas.getContext('webgl', { antialias: false });
    if (!gl) throw new Error('WebGL unavailable');
    gl.getExtension('OES_element_index_uint');
    state.gl = gl;
    P = prog(gl, VSRC, FSRC);
    PP = prog(gl, PVSRC, PFSRC);
    P.aPos = gl.getAttribLocation(P, 'aPos'); P.aUV = gl.getAttribLocation(P, 'aUV'); P.aShade = gl.getAttribLocation(P, 'aShade');
    P.uProj = gl.getUniformLocation(P, 'uProj'); P.uView = gl.getUniformLocation(P, 'uView');
    P.uTex = gl.getUniformLocation(P, 'uTex'); P.uFog = gl.getUniformLocation(P, 'uFog'); P.uFogRange = gl.getUniformLocation(P, 'uFogRange');
    PP.aPos = gl.getAttribLocation(PP, 'aPos'); PP.aCol = gl.getAttribLocation(PP, 'aCol'); PP.aSize = gl.getAttribLocation(PP, 'aSize');
    PP.uProj = gl.getUniformLocation(PP, 'uProj'); PP.uView = gl.getUniformLocation(PP, 'uView');
    PP.uScale = gl.getUniformLocation(PP, 'uScale'); PP.uFog = gl.getUniformLocation(PP, 'uFog'); PP.uFogRange = gl.getUniformLocation(PP, 'uFogRange');
    const atlas = await buildAtlas();
    hooks.atlasCanvas && hooks.atlasCanvas(atlas);
    atlasTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    try {
      const clouds = await loadImage('assets/textures/clouds.png');
      state.cloudsTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, state.cloudsTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, clouds);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    } catch (e) { /* no clouds texture, skip */ }
    try {
      const ch = await loadImage('assets/textures/char.png');
      state.zombieTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, state.zombieTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ch);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } catch (e) { /* mobs render as boxes */ }
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }

  function bindMesh(gl, meshes) {
    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.pos);
    gl.vertexAttribPointer(P.aPos, 3, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(P.aPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.uv);
    gl.vertexAttribPointer(P.aUV, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(P.aUV);
    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.sh);
    gl.vertexAttribPointer(P.aShade, 1, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(P.aShade);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.idx);
  }
  function drawQuads(gl, verts /*flat [x,y,z,u,v,s]*/, tex) {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STREAM_DRAW);
    gl.vertexAttribPointer(P.aPos, 3, gl.FLOAT, false, 24, 0); gl.enableVertexAttribArray(P.aPos);
    gl.vertexAttribPointer(P.aUV, 2, gl.FLOAT, false, 24, 12); gl.enableVertexAttribArray(P.aUV);
    gl.vertexAttribPointer(P.aShade, 1, gl.FLOAT, false, 24, 20); gl.enableVertexAttribArray(P.aShade);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.drawArrays(gl.TRIANGLES, 0, verts.length / 6);
    gl.deleteBuffer(b);
  }

  // ----- physics tick (20 Hz, like Timer(20.0F)) -----
  function moveRelative(p, xa, za, speed) {
    // Adapted from Entity.moveRelative: original assumed LWJGL's rotation
    // handedness; here forward (W, za=-1) must equal lookDir horizontal.
    const dist = xa * xa + za * za;
    if (dist >= 0.01) {
      const s = speed / Math.sqrt(dist);
      xa *= s; za *= s;
      const sin = Math.sin((p.yaw * Math.PI) / 180), cos = Math.cos((p.yaw * Math.PI) / 180);
      p.xd += xa * cos + za * sin;
      p.zd += -xa * sin + za * cos;
    }
  }
  function moveEntity(p, level, xa, ya, za) {
    const xaOrg = xa, yaOrg = ya, zaOrg = za;
    const cubes = level.getCubes(expand(p.bb, xa, ya, za));
    for (const c of cubes) ya = clipY(p.bb, c, ya);
    p.bb = box(p.bb.x0, p.bb.y0 + ya, p.bb.z0, p.bb.x1, p.bb.y1 + ya, p.bb.z1);
    for (const c of cubes) xa = clipX(p.bb, c, xa);
    p.bb = box(p.bb.x0 + xa, p.bb.y0, p.bb.z0, p.bb.x1 + xa, p.bb.y1, p.bb.z1);
    for (const c of cubes) za = clipZ(p.bb, c, za);
    p.bb = box(p.bb.x0, p.bb.y0, p.bb.z0 + za, p.bb.x1, p.bb.y1, p.bb.z1 + za);
    p.onGround = yaOrg !== ya && yaOrg < 0;
    if (xaOrg !== xa) p.xd = 0;
    if (yaOrg !== ya) p.yd = 0;
    if (zaOrg !== za) p.zd = 0;
    p.x = (p.bb.x0 + p.bb.x1) / 2;
    p.y = p.bb.y0 + EYE;
    p.z = (p.bb.z0 + p.bb.z1) / 2;
  }
  function tick() {
    const p = state.player, level = state.level;
    p.xo = p.x; p.yo = p.y; p.zo = p.z;
    let xa = 0, ya = 0;
    const k = state.keys;
    if (k.KeyR) { respawn(); k.KeyR = false; }
    if (k.KeyW || k.ArrowUp) ya -= 1;
    if (k.KeyS || k.ArrowDown) ya += 1;
    if (k.KeyA || k.ArrowLeft) xa -= 1;
    if (k.KeyD || k.ArrowRight) xa += 1;
    if ((k.Space) && p.onGround) p.yd = 0.5;
    moveRelative(p, xa, ya, p.onGround ? 0.1 : 0.02);
    p.yd -= 0.08;
    moveEntity(p, level, p.xd, p.yd, p.zd);
    p.xd *= 0.91; p.yd *= 0.98; p.zd *= 0.91;
    if (p.onGround) { p.xd *= 0.7; p.zd *= 0.7; }
    if (p.y < -8) respawn();
    // mobs wander
    for (const m of state.mobs) {
      m.t -= TICK;
      if (m.t <= 0) { m.t = 2 + Math.random() * 4; m.dir = Math.random() * Math.PI * 2; }
      m.x += Math.sin(m.dir) * TICK * 1.2;
      m.z += Math.cos(m.dir) * TICK * 1.2;
      if (m.x < 1 || m.x > W - 1 || m.z < 1 || m.z > H - 1) m.dir += Math.PI;
      m.x = Math.max(1, Math.min(W - 1, m.x)); m.z = Math.max(1, Math.min(H - 1, m.z));
      const gy = level.topY(m.x | 0, m.z | 0) + 1;
      m.y += (gy - m.y) * 0.2;
      m.ph += TICK * 6;
    }
    if (state.level.randomTick(state.tickRng, 6)) rebuildMesh();
  }

  function respawn() {
    const p = state.player;
    p.x = W / 2 + 0.5; p.z = H / 2 + 0.5;
    p.y = state.level.topY(W >> 1, H >> 1) + 2.5;
    p.xd = p.yd = p.zd = 0;
    syncBB(p);
  }

  // ----- edit -----
  function eyePos(a) {
    const p = state.player;
    return [p.xo + (p.x - p.xo) * a, p.yo + (p.y - p.yo) * a + 0, p.zo + (p.z - p.zo) * a];
  }
  function breakBlock() {
    const e = eyePos(1), d = lookDir(state.player.yaw, state.player.pitch);
    const hit = raycast(state.level, e, d, 5);
    if (!hit) return;
    const id = state.level.getTile(hit.x, hit.y, hit.z);
    if (state.level.setTile(hit.x, hit.y, hit.z, 0)) {
      spawnBreak(hit.x, hit.y, hit.z, id);
      rebuildMesh();
      hooks.stats && hooks.stats(counts());
      hooks.broken && hooks.broken(hit.y);
    }
  }
  function placeBlock() {
    const p = state.player;
    const e = eyePos(1), d = lookDir(p.yaw, p.pitch);
    const hit = raycast(state.level, e, d, 5);
    if (!hit) return;
    const x = hit.x + hit.nx, y = hit.y + hit.ny, z = hit.z + hit.nz;
    if (!state.level.inBounds(x, y, z)) return;
    const cur = state.level.getTile(x, y, z);
    if (cur !== 0 && cur !== TILE.BUSH) return;
    const bb = box(x, y, z, x + 1, y + 1, z + 1);
    if (state.selected !== TILE.BUSH && intersects(p.bb, bb)) return; // isFree()
    if (state.level.setTile(x, y, z, state.selected)) {
      rebuildMesh();
      hooks.stats && hooks.stats(counts());
      hooks.placed && hooks.placed(y);
    }
  }
  function spawnBreak(x, y, z, id) {
    const col = TILE_COLORS[id] || [200, 200, 200];
    for (let i = 0; i < 14; i++) {
      state.particles.push({
        x: x + 0.2 + Math.random() * 0.6, y: y + 0.2 + Math.random() * 0.6, z: z + 0.2 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 2.4, vy: Math.random() * 2.6, vz: (Math.random() - 0.5) * 2.4,
        life: 0.5 + Math.random() * 0.3, col, size: 5 + Math.random() * 4,
      });
    }
  }

  // ----- render -----
  function render(a, dt) {
    const gl = state.gl;
    const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, canvas.width, canvas.height);
    const sky = [0.5, 0.8, 1.0];
    gl.clearColor(sky[0], sky[1], sky[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const p = state.player;
    const ex = p.xo + (p.x - p.xo) * a, ey = p.yo + (p.y - p.yo) * a, ez = p.zo + (p.z - p.zo) * a;
    const proj = perspective(70, canvas.width / canvas.height, 0.05, 400);
    const view = viewMatrix([ex, ey, ez], p.yaw, p.pitch);
    gl.useProgram(P);
    gl.uniformMatrix4fv(P.uProj, false, proj);
    gl.uniformMatrix4fv(P.uView, false, view);
    gl.uniform3f(P.uFog, sky[0], sky[1], sky[2]);
    gl.uniform2f(P.uFogRange, 28, 110);
    gl.uniform1i(P.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    bindMesh(gl, state.meshes);
    gl.drawElements(gl.TRIANGLES, state.meshes.count, gl.UNSIGNED_INT, 0);
    // clouds
    if (state.cloudsTex) {
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      const cy = D + 7, R = 3, off = (state.cloudT * 0.4) % 1;
      const X0 = W / 2 - W * R / 2, X1 = W / 2 + W * R / 2, Z0 = H / 2 - W * R / 2, Z1 = H / 2 + W * R / 2;
      drawQuads(gl, [
        X0, cy, Z1, off, 0, 1, X0, cy, Z0, off, R, 1, X1, cy, Z0, off + R, R, 1,
        X0, cy, Z1, off, 0, 1, X1, cy, Z0, off + R, R, 1, X1, cy, Z1, off + R, 0, 1,
      ], state.cloudsTex);
      gl.depthMask(true);
      gl.disable(gl.BLEND);
      gl.enable(gl.CULL_FACE);
    }
    // zombies (camera-yaw billboards with char.png)
    if (state.mobsOn && state.zombieTex && state.mobs.length) {
      const sy = Math.sin((p.yaw * Math.PI) / 180), cy2 = Math.cos((p.yaw * Math.PI) / 180);
      const v = [];
      for (const m of state.mobs) {
        const bob = Math.abs(Math.sin(m.ph)) * 0.08;
        const hw = 0.45, hgt = 1.8;
        const rx = cy2 * hw, rz = -sy * hw;
        const cx = m.x + 0.5, cz = m.z + 0.5, by = m.y + bob;
        v.push(
          cx - rx, by + hgt, cz - rz, 0, 0, 0.9, cx + rx, by + hgt, cz + rz, 1, 0, 0.9, cx + rx, by, cz + rz, 1, 1, 0.9,
          cx - rx, by + hgt, cz - rz, 0, 0, 0.9, cx + rx, by, cz + rz, 1, 1, 0.9, cx - rx, by, cz - rz, 0, 1, 0.9);
      }
      drawQuads(gl, v, state.zombieTex);
    }
    // particles
    if (state.particles.length) {
      const pos = [], col = [], siz = [];
      for (const q of state.particles) {
        pos.push(q.x, q.y, q.z);
        col.push(q.col[0] / 255, q.col[1] / 255, q.col[2] / 255);
        siz.push(q.size);
      }
      gl.useProgram(PP);
      gl.uniformMatrix4fv(PP.uProj, false, proj);
      gl.uniformMatrix4fv(PP.uView, false, view);
      gl.uniform1f(PP.uScale, canvas.height / (2 * Math.tan((70 * Math.PI / 360) / 2)) / 10);
      gl.uniform3f(PP.uFog, sky[0], sky[1], sky[2]);
      gl.uniform2f(PP.uFogRange, 28, 110);
      const mk = (a, n, loc, sz) => {
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a), gl.STREAM_DRAW);
        gl.vertexAttribPointer(loc, sz, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);
        return b;
      };
      const b1 = mk(pos, 3, PP.aPos, 3), b2 = mk(col, 3, PP.aCol, 3), b3 = mk(siz, 1, PP.aSize, 1);
      gl.drawArrays(gl.POINTS, 0, state.particles.length);
      gl.deleteBuffer(b1); gl.deleteBuffer(b2); gl.deleteBuffer(b3);
      gl.useProgram(P);
    }
  }

  function frame(t) {
    if (!state.running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.25, (t - state.last) / 1000 || 0.016);
    state.last = t;
    state.acc += dt;
    let n = 0;
    while (state.acc >= TICK && n < 5) { tick(); state.acc -= TICK; n++; }
    const a = state.acc / TICK;
    // particles update (render-rate)
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const q = state.particles[i];
      q.life -= dt;
      if (q.life <= 0) { state.particles.splice(i, 1); continue; }
      q.vy -= 9 * dt;
      q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
    }
    state.cloudT += dt;
    render(Math.min(1, a), dt);
    state.frames++;
    if (t - state.fpsT > 500) {
      state.fps = Math.round((state.frames * 1000) / (t - state.fpsT));
      state.frames = 0; state.fpsT = t;
      hooks.frame && hooks.frame(state.fps, state.player);
    }
  }

  // ----- input -----
  function bindInput() {
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      state.keys[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
      const n = { Digit1: 1, Digit2: 2, Digit3: 3, Digit4: 4, Digit5: 5, Digit6: 6 }[e.code];
      if (n) hooks.hotkey && hooks.hotkey(n);
    });
    window.addEventListener('keyup', (e) => { state.keys[e.code] = false; });
    canvas.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement !== canvas) {
        try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (err) { /* headless */ }
        return;
      }
      if (e.button === 0) breakBlock();
      if (e.button === 2) placeBlock();
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== canvas) return;
      state.player.yaw += e.movementX * 0.15;
      state.player.pitch -= e.movementY * 0.15;
      state.player.pitch = Math.max(-90, Math.min(90, state.player.pitch));
    });
    document.addEventListener('pointerlockchange', () => {
      hooks.lock && hooks.lock(document.pointerLockElement === canvas);
    });
  }

  async function boot(seed) {
    if (!state.gl) { await initGL(); bindInput(); }
    if (!state.built) { genWorld(seed); state.built = true; }
    state.running = true;
    state.last = performance.now(); state.fpsT = state.last;
    requestAnimationFrame(frame);
  }
  function save() {
    try {
      localStorage.setItem('cavegame-008a', JSON.stringify({ W, H, D, seed: state.seed, blocks: state.level.serialize() }));
      toast('Saved to localStorage');
    } catch (e) { toast('Save failed: ' + e.message); }
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem('cavegame-008a'));
      if (!s || s.W !== W || !s.blocks) { toast('No save found'); return false; }
      const { Level: L } = { Level };
      state.level = L.deserialize(W, H, D, s.blocks);
      state.seed = s.seed | 0;
      respawn(); rebuildMesh();
      hooks.stats && hooks.stats(counts());
      toast('Save loaded');
      return true;
    } catch (e) { toast('Load failed'); return false; }
  }

  return {
    state,
    boot,
    regenerate: (seed) => { genWorld(seed); },
    respawn,
    save, load,
    setSelected: (id) => { state.selected = id; },
    setMobs: (on) => { state.mobsOn = on; },
    counts: () => (state.level ? counts() : null),
    // used by automated smoke tests (and the console-curious)
    debug: { breakBlock, placeBlock, raycast, lookDir, eyePos },
  };
}
