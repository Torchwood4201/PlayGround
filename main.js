import * as THREE from 'three';

// ============ Config ============
const W = 128, H = 128, D = 32, CHUNK = 16;
const BLOCK = { AIR:0, STONE:1, GRASS:2, DIRT:3, BRICK:4, WOOD:5, LEAVES:6, FLOWER:7 };
const HOTBAR = [
  { id: BLOCK.GRASS, name: 'grass' },
  { id: BLOCK.DIRT, name: 'dirt' },
  { id: BLOCK.STONE, name: 'stone' },
  { id: BLOCK.WOOD, name: 'wood' },
  { id: BLOCK.BRICK, name: 'brick' },
  { id: BLOCK.LEAVES, name: 'leaves' },
];
const BASE_COLOR = { 1:[128,128,128], 2:[106,190,48], 3:[134,96,67], 4:[150,60,50], 5:[102,81,44], 6:[46,125,50], 7:[220,80,80] };

// ============ RNG ============
function mulberry32(seed){ let a = seed >>> 0; return function(){ a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ============ NoiseMap (port of Java diamond-square) ============
function noiseMap(w, h, levels, rng) {
  const fuzz = 16;
  const tmp = new Int32Array(w * h);
  let step = w >> levels;
  if (step < 1) step = 1;
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step)
      tmp[x + y * w] = ((Math.floor(rng() * 256) - 128)) * fuzz;
  for (; step > 1; step = Math.floor(step / 2)) {
    const val = 256 * (step << levels);
    const ss = Math.floor(step / 2);
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const c = tmp[(x) % w + ((y) % h) * w];
        const r = tmp[(x + step) % w + ((y) % h) * w];
        const d = tmp[(x) % w + ((y + step) % h) * w];
        const mu = tmp[(x + step) % w + ((y + step) % h) * w];
        const ml = Math.floor((c + d + r + mu) / 4 + rng() * val * 2 - val);
        tmp[x + ss + (y + ss) * w] = ml;
      }
    }
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const c = tmp[x + y * w];
        const r = tmp[(x + step) % w + y * w];
        const d = tmp[x + ((y + step) % h) * w];
        const mu = tmp[((x + ss) & (w - 1)) + (((y + ss - step) & (h - 1)) * w)];
        const ml = tmp[((x + ss - step) & (w - 1)) + (((y + ss) & (h - 1)) * w)];
        const m = tmp[(x + ss) % w + ((y + ss) % h) * w];
        tmp[x + ss + y * w] = Math.floor((c + r + m + mu) / 4 + rng() * val * 2 - val);
        tmp[x + (y + ss) * w] = Math.floor((c + d + m + ml) / 4 + rng() * val * 2 - val);
      }
    }
  }
  const out = new Int32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    out[x + y * w] = Math.floor(tmp[(x % w) + (y % h) * w] / 512 + 128);
  return out;
}

function generateMap(seed) {
  const rng = mulberry32(seed);
  const h1 = noiseMap(W, H, 0, rng);
  const h2 = noiseMap(W, H, 0, rng);
  const cf = noiseMap(W, H, 1, rng);
  const rock = noiseMap(W, H, 1, rng);
  const blocks = new Uint8Array(W * H * D);
  const idx = (x, y, z) => (y * H + z) * W + x;
  for (let x = 0; x < W; x++) for (let z = 0; z < H; z++) {
    let dh1 = h1[x + z * W], dh2 = h2[x + z * W];
    const c = cf[x + z * W];
    if (c < 128) dh2 = dh1;
    let dh = dh1 > dh2 ? dh1 : dh2; // max
    dh = Math.floor(dh / 8 + D / 3);
    let rh = Math.floor(rock[x + z * W] / 8 + D / 3);
    if (rh > dh - 2) rh = dh - 2;
    for (let y = 0; y < D; y++) {
      let id = 0;
      if (y === dh) id = BLOCK.GRASS;
      if (y < dh) id = BLOCK.DIRT;
      if (y <= rh) id = BLOCK.STONE;
      blocks[idx(x, y, z)] = id;
    }
  }
  // caves (worms)
  const count = Math.floor(W * H * D / 256 / 64);
  for (let i = 0; i < count; i++) {
    let x = rng() * W, y = rng() * D, z = rng() * H;
    const len = Math.floor(rng() + rng() * 150);
    let dir1 = rng() * Math.PI * 2, dira1 = 0, dir2 = rng() * Math.PI * 2, dira2 = 0;
    for (let l = 0; l < len; l++) {
      x += Math.sin(dir1) * Math.cos(dir2);
      z += Math.cos(dir1) * Math.cos(dir2);
      y += Math.sin(dir2);
      dir1 += dira1 * 0.2; dira1 *= 0.9; dira1 += rng() - rng();
      dir2 += dira2 * 0.5; dir2 *= 0.5; dira2 *= 0.9; dira2 += rng() - rng();
      const size = Math.sin(l * Math.PI / len) * 2.5 + 1.0;
      for (let xx = Math.floor(x - size); xx <= Math.floor(x + size); xx++)
        for (let yy = Math.floor(y - size); yy <= Math.floor(y + size); yy++)
          for (let zz = Math.floor(z - size); zz <= Math.floor(z + size); zz++) {
            const xd = xx - x, yd = yy - y, zd = zz - z;
            if (xd*xd + yd*yd*2 + zd*zd < size*size && xx>=1 && yy>=1 && zz>=1 && xx<W-1 && yy<D-1 && zz<H-1) {
              const ii = idx(xx, yy, zz);
              if (blocks[ii] === BLOCK.STONE) blocks[ii] = 0;
            }
          }
    }
  }
  // trees + flowers
  for (let x = 4; x < W - 4; x++) for (let z = 4; z < H - 4; z++) {
    // find surface
    let top = -1;
    for (let y = D - 1; y >= 0; y--) { if (blocks[idx(x, y, z)] !== 0) { top = y; break; } }
    if (top < 2 || top > D - 8) continue;
    if (blocks[idx(x, top, z)] !== BLOCK.GRASS) continue;
    const r = rng();
    if (r < 0.008) {
      const th = 3 + Math.floor(rng() * 2); // 3-4
      for (let k = 1; k <= th; k++) blocks[idx(x, top + k, z)] = BLOCK.WOOD;
      for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dy = 0; dy <= 2; dy++) {
        if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
        if (dy === 2 && (Math.abs(dx) > 1 || Math.abs(dz) > 1)) continue;
        const lx = x + dx, ly = top + th - 1 + dy, lz = z + dz;
        if (lx < 0 || lz < 0 || lx >= W || lz >= H || ly >= D) continue;
        if (blocks[idx(lx, ly, lz)] === 0) blocks[idx(lx, ly, lz)] = BLOCK.LEAVES;
      }
      blocks[idx(x, top + th + 1, z)] = BLOCK.LEAVES;
    } else if (r < 0.03) {
      if (top + 1 < D && blocks[idx(x, top + 1, z)] === 0) blocks[idx(x, top + 1, z)] = BLOCK.FLOWER;
    }
  }
  return blocks;
}

// ============ World state ============
let seed = 1337;
let blocks = generateMap(seed);
const bidx = (x, y, z) => (y * H + z) * W + x;
function getTile(x, y, z) {
  if (y < 0) return BLOCK.STONE;
  if (x < 0 || y >= D || z < 0 || z >= H || x >= W) return 0;
  return blocks[bidx(x, y, z)];
}
function isSolid(x, y, z) {
  const t = getTile(x, y, z);
  if (t === 0 || t === BLOCK.FLOWER) return false;
  return true;
}
function setTile(x, y, z, id) {
  if (x < 0 || y < 0 || z < 0 || x >= W || y >= D || z >= H) return false;
  const i = bidx(x, y, z);
  if (blocks[i] === id) return false;
  blocks[i] = id;
  rebuildChunkAt(x, z);
  return true;
}

// ============ Texture atlas ============
function makeAtlas() {
  const S = 256, T = 16, C = S / T;
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, S, S);
  const rnd = mulberry32(42);
  function cell(i, fn) {
    const cx = (i % 16) * 16, cy = Math.floor(i / 16) * 16;
    fn(cx, cy);
  }
  function noiseFill(cx, cy, base, vary, n = 60) {
    g.fillStyle = base; g.fillRect(cx, cy, 16, 16);
    for (let i = 0; i < n; i++) {
      g.fillStyle = vary[Math.floor(rnd() * vary.length)];
      g.fillRect(cx + Math.floor(rnd() * 16), cy + Math.floor(rnd() * 16), 2, 2);
    }
  }
  cell(0, (x, y) => noiseFill(x, y, '#6abe30', ['#5aa82a', '#7bd13f', '#4e9c26']));
  cell(1, (x, y) => noiseFill(x, y, '#7d7d7d', ['#6e6e6e', '#8c8c8c', '#5f5f5f']));
  cell(2, (x, y) => noiseFill(x, y, '#866043', ['#755136', '#946f4d', '#6b4a30']));
  cell(3, (x, y) => { noiseFill(x, y, '#866043', ['#755136', '#946f4d']); g.fillStyle = '#6abe30'; g.fillRect(x, y, 16, 5); g.fillStyle = '#5aa82a'; for (let i = 0; i < 16; i += 2) g.fillRect(x + i, y + 5, 1, 2); });
  cell(4, (x, y) => { g.fillStyle = '#6b5433'; g.fillRect(x, y, 16, 16); g.fillStyle = '#54401f'; for (let i = 0; i < 16; i += 4) g.fillRect(x + i, y, 2, 16); g.fillStyle = '#7d653d'; for (let i = 2; i < 16; i += 4) g.fillRect(x + i, y, 1, 16); });
  cell(14, (x, y) => { g.clearRect(x, y, 16, 16); g.fillStyle = '#2f7a28'; g.fillRect(x + 7, y + 8, 2, 8); g.fillStyle = '#e23b3b'; g.fillRect(x + 5, y + 4, 6, 5); g.fillStyle = '#ffd54a'; g.fillRect(x + 7, y + 5, 2, 2); });
  cell(15, (x, y) => { g.fillStyle = '#2e8b33'; g.fillRect(x, y, 16, 16); g.fillStyle = '#256f29'; for (let i = 0; i < 46; i++) g.fillRect(x + Math.floor(rnd() * 16), y + Math.floor(rnd() * 16), 2, 2); g.fillStyle = '#3aa340'; for (let i = 0; i < 26; i++) g.fillRect(x + Math.floor(rnd() * 16), y + Math.floor(rnd() * 16), 1, 1); });
  cell(16, (x, y) => { g.fillStyle = '#9e4a3f'; g.fillRect(x, y, 16, 16); g.fillStyle = '#c9c9c9'; g.fillRect(x, y + 3, 16, 1); g.fillRect(x, y + 7, 16, 1); g.fillRect(x, y + 11, 16, 1); g.fillRect(x, y + 15, 16, 1); g.fillRect(x + 7, y, 1, 3); g.fillRect(x + 3, y + 4, 1, 3); g.fillRect(x + 11, y + 4, 1, 3); });
  cell(17, (x, y) => { g.fillStyle = '#a0824a'; g.fillRect(x, y, 16, 16); g.strokeStyle = '#6b5433'; for (let r = 7; r > 0; r -= 2) { g.strokeRect(x + 8 - r, y + 8 - r, r * 2, r * 2); } });
  const tex = new THREE.CanvasTexture(cv);
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false;
  return { canvas: cv, texture: tex };
}
function tileTex(id, face) {
  // face: 0 bottom, 1 top, 2..5 side
  if (id === BLOCK.GRASS) return face === 1 ? 0 : face === 0 ? 2 : 3;
  if (id === BLOCK.STONE) return 1;
  if (id === BLOCK.DIRT) return 2;
  if (id === BLOCK.BRICK) return 16;
  if (id === BLOCK.WOOD) return face <= 1 ? 17 : 4;
  if (id === BLOCK.LEAVES) return 15;
  if (id === BLOCK.FLOWER) return 14;
  return 1;
}
function uvFor(tex) {
  const u0 = (tex % 16) / 16, v0 = 1 - (Math.floor(tex / 16) + 1) / 16;
  const u1 = u0 + 1 / 16, v1 = v0 + 1 / 16;
  const e = 0.5 / 256;
  return [u0 + e, v0 + e, u1 - e, v1 - e];
}

// ============ Three setup ============
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b5e8);
scene.fog = new THREE.Fog(0x9cc8f0, 30, 140);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.08, 1000);
addEventListener('resize', resize);
const sun = new THREE.DirectionalLight(0xffffff, 1.15); sun.position.set(60, 100, 30); scene.add(sun);
scene.add(new THREE.AmbientLight(0xbfd4ff, 0.75));
const hemi = new THREE.HemisphereLight(0xbdd7ff, 0x6b5a44, 0.5); scene.add(hemi);
const atlas = makeAtlas();
// Repaint dirt/grass cells with the original attachment pixels when available.
{
  const load = (url) => new Promise((res) => { const img = new Image(); img.onload = () => res(img); img.onerror = () => res(null); img.src = url; });
  Promise.all([load('assets/dirt.png'), load('assets/grass.png')]).then(([dirt, grass]) => {
    if (!dirt && !grass) return;
    const g = atlas.canvas.getContext('2d');
    if (dirt) {
      g.clearRect(2 * 16, 0, 16, 16); g.drawImage(dirt, 0, 0, dirt.width, dirt.height, 2 * 16, 0, 16, 16);
      // grass side (cell 3): real dirt below + green cap on top
      g.clearRect(3 * 16, 0, 16, 16); g.drawImage(dirt, 0, 0, dirt.width, dirt.height, 3 * 16, 0, 16, 16);
      g.fillStyle = grass ? '#6abe30' : '#6abe30'; g.fillRect(3 * 16, 0, 16, 5);
      if (grass) g.drawImage(grass, 0, 0, grass.width, 5, 3 * 16, 0, 16, 5);
    }
    if (grass) { g.clearRect(0, 0, 16, 16); g.drawImage(grass, 0, 0, grass.width, grass.height, 0, 0, 16, 16); }
    atlas.texture.needsUpdate = true;
    buildAll(); updateHotbar();
  });
}
const worldMat = new THREE.MeshLambertMaterial({ map: atlas.texture, vertexColors: true, alphaTest: 0.5, side: THREE.FrontSide });
const crossMat = new THREE.MeshLambertMaterial({ map: atlas.texture, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide });

// clouds
let cloudMesh;
{
  const loader = new THREE.TextureLoader();
  loader.load('assets/clouds.png', (t) => {
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.55, fog: false, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(W / 2, D + 12, H / 2); scene.add(m); cloudMesh = m;
  }, undefined, () => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, fog: false, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(W / 2, D + 12, H / 2); scene.add(m); cloudMesh = m;
  });
}

// highlight
const hl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.002, 1.002, 1.002)), new THREE.LineBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.7 }));
hl.visible = false; scene.add(hl);

// ============ Chunk meshing ============
const chunkMeshes = new Map();
function chunkKey(cx, cz) { return cx + ',' + cz; }
function buildChunk(cx, cz) {
  const x0 = cx * CHUNK, z0 = cz * CHUNK;
  const pos = [], nrm = [], uv = [], col = [], idxArr = [];
  const cpos = [], cnrm = [], cuv = [], ccol = [], cidx = [];
  const pushFace = (arr, v, n, uvs, shade) => {
    const b = arr.pos.length / 3;
    for (let i = 0; i < 4; i++) { arr.pos.push(...v[i]); arr.nrm.push(...n); arr.uv.push(...uvs[i]); arr.col.push(shade, shade, shade); }
    arr.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  };
  const F = [
    { n: [0, -1, 0], s: 0.55, c: [[0, 0, 1], [0, 0, 0], [1, 0, 0], [1, 0, 1]] },
    { n: [0, 1, 0], s: 1.0, c: [[1, 1, 1], [1, 1, 0], [0, 1, 0], [0, 1, 1]] },
    { n: [0, 0, -1], s: 0.8, c: [[0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 0]] },
    { n: [0, 0, 1], s: 0.8, c: [[0, 1, 1], [0, 0, 1], [1, 0, 1], [1, 1, 1]] },
    { n: [-1, 0, 0], s: 0.6, c: [[0, 1, 1], [0, 1, 0], [0, 0, 0], [0, 0, 1]] },
    { n: [1, 0, 0], s: 0.6, c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] },
  ];
  for (let x = x0; x < Math.min(x0 + CHUNK, W); x++) for (let z = z0; z < Math.min(z0 + CHUNK, H); z++) for (let y = 0; y < D; y++) {
    const t = blocks[bidx(x, y, z)];
    if (!t) continue;
    if (t === BLOCK.FLOWER) {
      const tx = uvFor(tileTex(t, 1)); const [u0, v0, u1, v1] = tx;
      const quads = [
        [[x, y, z], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z]],
        [[x + 1, y, z], [x, y, z + 1], [x, y + 1, z + 1], [x + 1, y + 1, z]],
      ];
      const uvsList = [[[u0, v0], [u1, v0], [u1, v1], [u0, v1]], [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]];
      for (let q = 0; q < 2; q++) {
        const b = cpos.length / 3;
        for (let i = 0; i < 4; i++) { cpos.push(...quads[q][i]); cnrm.push(0, 1, 0); cuv.push(...uvsList[q][i]); ccol.push(1, 1, 1); }
        cidx.push(b, b + 1, b + 2, b, b + 2, b + 3, b + 2, b + 1, b, b + 3, b + 2, b);
      }
      continue;
    }
    const isLeaves = t === BLOCK.LEAVES;
    const neigh = [[x, y - 1, z], [x, y + 1, z], [x, y, z - 1], [x, y, z + 1], [x - 1, y, z], [x + 1, y, z]];
    for (let f = 0; f < 6; f++) {
      const [nx, ny, nz] = neigh[f];
      const nt = getTile(nx, ny, nz);
      const solid = nt !== 0 && nt !== BLOCK.FLOWER;
      if (solid && !(isLeaves && nt === BLOCK.LEAVES)) {
        if (isLeaves && nt === BLOCK.LEAVES) continue;
        continue;
      }
      if (isLeaves && nt === BLOCK.LEAVES) continue;
      const tex = tileTex(t, f); const [u0, v0, u1, v1] = uvFor(tex);
      const corners = F[f].c.map(([dx, dy, dz]) => [x + dx, y + dy, z + dz]);
      // Build UVs from vertex offsets so textures stay upright:
      // side faces: V follows block height (top verts -> canvas-top v1).
      // top/bottom faces: UVs follow x/z.
      const faceUV = corners.map(([vx, vy, vz]) => {
        let uOff, vOff;
        if (f <= 1) { uOff = vx - x; vOff = vz - z; }
        else { uOff = (f === 4 || f === 5) ? (vz - z) : (vx - x); vOff = vy - y; }
        return [uOff > 0.5 ? u1 : u0, vOff > 0.5 ? v1 : v0];
      });
      const arr = { pos, nrm, uv, col, idx: idxArr };
      const b = arr.pos.length / 3;
      for (let i = 0; i < 4; i++) { arr.pos.push(...corners[i]); arr.nrm.push(...F[f].n); arr.uv.push(...faceUV[i]); arr.col.push(F[f].s, F[f].s, F[f].s); }
      arr.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
  }
  const key = chunkKey(cx, cz);
  const old = chunkMeshes.get(key);
  if (old) { if (old.mesh) { scene.remove(old.mesh); old.mesh.geometry.dispose(); } if (old.cross) { scene.remove(old.cross); old.cross.geometry.dispose(); } chunkMeshes.delete(key); }
  const entry = {};
  if (idxArr.length) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idxArr);
    const mesh = new THREE.Mesh(geo, worldMat);
    mesh.matrixAutoUpdate = false; scene.add(mesh); entry.mesh = mesh;
  }
  if (cidx.length) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(cpos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(cnrm, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(cuv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(ccol, 3));
    geo.setIndex(cidx);
    const mesh = new THREE.Mesh(geo, crossMat);
    mesh.matrixAutoUpdate = false; scene.add(mesh); entry.cross = mesh;
  }
  chunkMeshes.set(key, entry);
}
function buildAll() { for (let cx = 0; cx < W / CHUNK; cx++) for (let cz = 0; cz < H / CHUNK; cz++) buildChunk(cx, cz); }
function rebuildChunkAt(x, z) {
  const cx = Math.floor(x / CHUNK), cz = Math.floor(z / CHUNK);
  buildChunk(cx, cz);
  if (x % CHUNK === 0 && cx > 0) buildChunk(cx - 1, cz);
  if (x % CHUNK === CHUNK - 1 && cx < W / CHUNK - 1) buildChunk(cx + 1, cz);
  if (z % CHUNK === 0 && cz > 0) buildChunk(cx, cz - 1);
  if (z % CHUNK === CHUNK - 1 && cz < H / CHUNK - 1) buildChunk(cx, cz + 1);
}

// ============ Player ============
const player = { x: W / 2 + 0.5, y: D + 2, z: H / 2 + 0.5, xd: 0, yd: 0, zd: 0, yaw: 0.6, pitch: -0.15, onGround: false, w: 0.6, h: 1.8, eye: 1.62, invert: 1 };
function surfaceY(x, z) {
  x = Math.floor(x); z = Math.floor(z);
  for (let y = D - 1; y >= 0; y--) if (isSolid(x, y, z)) return y + 1;
  return D / 2;
}
function respawn() {
  const s = findSpawn();
  player.x = s.x; player.z = s.z;
  player.y = surfaceY(player.x, player.z) + player.h / 2 + 0.1;
  player.xd = player.yd = player.zd = 0; player.onGround = false;
}
function collideMove(dt) {
  // Y (yd is velocity m/s) — resolve against highest/lowest penetration
  player.y += player.yd * dt;
  let bb = aabb();
  let hit = false;
  if (player.yd <= 0) {
    let best = -Infinity;
    for (const b of cubesAround(bb)) if (overlap(bb, b) && b.y1 > best) { best = b.y1; hit = true; }
    if (hit) { player.y = best + player.h / 2 + 0.001; player.yd = 0; player.onGround = true; bb = aabb(); }
    else {
      // standing? probe slightly below feet
      const below = { x0: bb.x0 + 0.05, y0: bb.y0 - 0.12, z0: bb.z0 + 0.05, x1: bb.x1 - 0.05, y1: bb.y0, z1: bb.z1 - 0.05 };
      player.onGround = false;
      for (const b of cubesAround(below)) if (overlap(below, b)) { player.onGround = true; break; }
    }
  } else {
    let best = Infinity;
    for (const b of cubesAround(bb)) if (overlap(bb, b) && b.y0 < best) { best = b.y0; hit = true; }
    if (hit) { player.y = best - player.h / 2 - 0.001; player.yd = 0; bb = aabb(); }
  }
  // X
  player.x += player.xd * dt;
  bb = aabb();
  for (const b of cubesAround(bb)) {
    if (overlap(bb, b)) {
      if (player.xd > 0) player.x = b.x0 - player.w / 2 - 0.001;
      else if (player.xd < 0) player.x = b.x1 + player.w / 2 + 0.001;
      player.xd = 0; bb = aabb();
    }
  }
  // Z
  player.z += player.zd * dt;
  bb = aabb();
  for (const b of cubesAround(bb)) {
    if (overlap(bb, b)) {
      if (player.zd > 0) player.z = b.z0 - player.w / 2 - 0.001;
      else if (player.zd < 0) player.z = b.z1 + player.w / 2 + 0.001;
      player.zd = 0; bb = aabb();
    }
  }
  if (player.y < -10) respawn();
}
function aabb() {
  return { x0: player.x - player.w / 2, y0: player.y - player.h / 2, z0: player.z - player.w / 2, x1: player.x + player.w / 2, y1: player.y + player.h / 2, z1: player.z + player.w / 2 };
}
function overlap(a, b) { return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0 && a.z0 < b.z1 && a.z1 > b.z0; }
function cubesAround(bb) {
  const out = [];
  for (let x = Math.floor(bb.x0); x <= Math.floor(bb.x1); x++) for (let y = Math.floor(bb.y0); y <= Math.floor(bb.y1); y++) for (let z = Math.floor(bb.z0); z <= Math.floor(bb.z1); z++)
    if (isSolid(x, y, z)) out.push({ x0: x, y0: y, z0: z, x1: x + 1, y1: y + 1, z1: z + 1 });
  return out;
}

// raycast DDA
function raycast(maxDist = 6) {
  const ex = player.x, ey = player.y - player.h / 2 + player.eye, ez = player.z;
  const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ'));
  let x = Math.floor(ex), y = Math.floor(ey), z = Math.floor(ez);
  const stepX = dir.x > 0 ? 1 : -1, stepY = dir.y > 0 ? 1 : -1, stepZ = dir.z > 0 ? 1 : -1;
  const tDeltaX = Math.abs(1 / (dir.x || 1e-8)), tDeltaY = Math.abs(1 / (dir.y || 1e-8)), tDeltaZ = Math.abs(1 / (dir.z || 1e-8));
  let tMaxX = (stepX > 0 ? (x + 1 - ex) : (ex - x)) * tDeltaX;
  let tMaxY = (stepY > 0 ? (y + 1 - ey) : (ey - y)) * tDeltaY;
  let tMaxZ = (stepZ > 0 ? (z + 1 - ez) : (ez - z)) * tDeltaZ;
  let face = null, t = 0;
  for (let i = 0; i < 64; i++) {
    if (tMaxX < tMaxY && tMaxX < tMaxZ) { x += stepX; t = tMaxX; tMaxX += tDeltaX; face = stepX > 0 ? 4 : 5; }
    else if (tMaxY < tMaxZ) { y += stepY; t = tMaxY; tMaxY += tDeltaY; face = stepY > 0 ? 0 : 1; }
    else { z += stepZ; t = tMaxZ; tMaxZ += tDeltaZ; face = stepZ > 0 ? 2 : 3; }
    if (t > maxDist) return null;
    const id = getTile(x, y, z);
    if (id && id !== BLOCK.FLOWER) return { x, y, z, face, id };
    if (id === BLOCK.FLOWER) return { x, y, z, face, id };
  }
  return null;
}

// ============ Zombies (boxy, wander) ============
const zombies = [];
function makeZombieMesh() {
  const grp = new THREE.Group();
  const skin = new THREE.MeshLambertMaterial({ color: 0x9db38a });
  const shirt = new THREE.MeshLambertMaterial({ color: 0x3a6ea5 });
  const pants = new THREE.MeshLambertMaterial({ color: 0x4a3b6b });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skin); head.position.y = 1.5; grp.add(head);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.32), shirt); body.position.y = 0.9; grp.add(body);
  const mkLimb = (mat, w, h) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat); grp.add(m); return m; };
  const la = mkLimb(skin, 0.18, 0.7); la.position.set(-0.38, 0.9, 0);
  const ra = mkLimb(skin, 0.18, 0.7); ra.position.set(0.38, 0.9, 0);
  const ll = mkLimb(pants, 0.22, 0.75); ll.position.set(-0.14, 0.35, 0);
  const rl = mkLimb(pants, 0.22, 0.75); rl.position.set(0.14, 0.35, 0);
  return { grp, la, ra, ll, rl };
}
function spawnZombie(x, y, z) {
  const { grp, la, ra, ll, rl } = makeZombieMesh();
  scene.add(grp);
  zombies.push({ x: x ?? W / 2 + (Math.random() - 0.5) * 40, y: y ?? D + 2, z: z ?? H / 2 + (Math.random() - 0.5) * 40, xd: 0, yd: 0, zd: 0, yaw: Math.random() * Math.PI * 2, timer: 0, walk: Math.random() * 10, onGround: false, mesh: grp, la, ra, ll, rl });
}
function zombiePhysics(z, dt) {
  z.timer -= dt;
  if (z.timer <= 0) { z.timer = 2 + Math.random() * 3; z.yaw = Math.random() * Math.PI * 2; }
  const sp = 1.2;
  z.xd = Math.sin(z.yaw) * sp * dt * 10 * 0.12;
  z.zd = Math.cos(z.yaw) * sp * dt * 10 * 0.12;
  z.yd -= 25 * dt; if (z.yd < -20) z.yd = -20;
  // integrate with simple collision (reuse block test, size 0.6x1.8)
  const w = 0.3;
  let nx = z.x + z.xd, ny = z.y + z.yd * dt * 3, nz = z.z + z.zd;
  // Y
  const bbY = { x0: z.x - w, y0: ny - 0.9, z0: z.z - w, x1: z.x + w, y1: ny + 0.9, z1: z.z + w };
  let hitY = false;
  for (let x = Math.floor(bbY.x0); x <= Math.floor(bbY.x1); x++) for (let y = Math.floor(bbY.y0); y <= Math.floor(bbY.y1); y++) for (let zz = Math.floor(bbY.z0); zz <= Math.floor(bbY.z1); zz++)
    if (isSolid(x, y, zz)) { hitY = true; if (z.yd < 0) { ny = y + 1 + 0.9; z.onGround = true; } z.yd = 0; break; }
  z.y = hitY && z.onGround ? ny : ny;
  if (!hitY) z.onGround = false;
  // X/Z with step: if blocked and onGround, hop
  const tryMove = (px, pz) => {
    const bb = { x0: px - w, y0: z.y - 0.9, z0: pz - w, x1: px + w, y1: z.y + 0.9, z1: pz + w };
    for (let x = Math.floor(bb.x0); x <= Math.floor(bb.x1); x++) for (let y = Math.floor(bb.y0); y <= Math.floor(bb.y1); y++) for (let zz = Math.floor(bb.z0); zz <= Math.floor(bb.z1); zz++)
      if (isSolid(x, y, zz)) return false;
    return true;
  };
  if (tryMove(nx, z.z)) z.x = nx; else if (z.onGround) z.yd = 7;
  if (tryMove(z.x, nz)) z.z = nz; else if (z.onGround) z.yd = 7;
  if (z.y < -10) { z.x = W / 2; z.z = H / 2; z.y = D + 2; }
  z.walk += dt * 5;
  const sw = Math.sin(z.walk) * 0.55;
  z.la.rotation.x = sw; z.ra.rotation.x = -sw; z.ll.rotation.x = -sw; z.rl.rotation.x = sw;
  z.mesh.position.set(z.x, z.y - 0.9, z.z);
  z.mesh.rotation.y = z.yaw;
}

// ============ Particles ============
const PMAX = 400;
const pGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
const pMat = new THREE.MeshBasicMaterial({ vertexColors: false });
const pMesh = new THREE.InstancedMesh(pGeo, new THREE.MeshLambertMaterial(), PMAX);
pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); pMesh.count = PMAX; pMesh.frustumCulled = false; scene.add(pMesh);
const parts = Array.from({ length: PMAX }, () => ({ life: 0, x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0 }));
const dummy = new THREE.Object3D(); const tmpC = new THREE.Color();
let pCursor = 0;
function burst(x, y, z, id) {
  const base = BASE_COLOR[id] || [200, 200, 200];
  for (let i = 0; i < 24; i++) {
    const p = parts[pCursor]; pCursor = (pCursor + 1) % PMAX;
    p.life = 0.5 + Math.random() * 0.5;
    p.x = x + 0.2 + Math.random() * 0.6; p.y = y + 0.2 + Math.random() * 0.6; p.z = z + 0.2 + Math.random() * 0.6;
    p.vx = (Math.random() - 0.5) * 4; p.vy = Math.random() * 4 + 1; p.vz = (Math.random() - 0.5) * 4;
    p.c = [base[0] * (0.7 + Math.random() * 0.5), base[1] * (0.7 + Math.random() * 0.5), base[2] * (0.7 + Math.random() * 0.5)];
  }
}
function tickParticles(dt) {
  for (let i = 0; i < PMAX; i++) {
    const p = parts[i];
    if (p.life > 0) {
      p.life -= dt; p.vy -= 12 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.life <= 0) p.y = -99;
    }
    dummy.position.set(p.x, p.y, p.z); dummy.updateMatrix();
    pMesh.setMatrixAt(i, dummy.matrix);
    if (p.c) pMesh.setColorAt(i, tmpC.setRGB(p.c[0] / 255, p.c[1] / 255, p.c[2] / 255));
  }
  pMesh.instanceMatrix.needsUpdate = true; if (pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true;
}

// ============ Audio: WebAudio SFX + generative pad; SF2 asset status ============
let AC = null, soundOn = true, sf2Info = 'loading…';
async function audio() { if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); } if (AC.state === 'suspended') await AC.resume(); return AC; }
async function sfxBreak() {
  if (!soundOn) return; try {
    const ac = await audio();
    const dur = 0.12, buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900 + Math.random() * 600;
    const g = ac.createGain(); g.gain.value = 0.25;
    src.connect(f).connect(g).connect(ac.destination); src.start();
  } catch {}
}
async function sfxPlace() {
  if (!soundOn) return; try {
    const ac = await audio();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square'; o.frequency.value = 190 + Math.random() * 40;
    g.gain.setValueAtTime(0.12, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.09);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.1);
  } catch {}
}
const PENTA = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3];
async function padNote() {
  if (!soundOn || document.hidden) return; try {
    const ac = await audio();
    const f = PENTA[Math.floor(Math.random() * PENTA.length)];
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter();
    o1.type = 'sine'; o1.frequency.value = f; o2.type = 'triangle'; o2.frequency.value = f / 2;
    fl.type = 'lowpass'; fl.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.07, ac.currentTime + 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 3.5);
    o1.connect(fl); o2.connect(fl); fl.connect(g).connect(ac.destination);
    o1.start(); o2.start(); o1.stop(ac.currentTime + 3.6); o2.stop(ac.currentTime + 3.6);
  } catch {}
}
setInterval(padNote, 5000);
fetch('assets/Minecraft.sf2').then(async (r) => {
  const b = await r.arrayBuffer();
  sf2Info = (b.byteLength / 1024).toFixed(0) + 'KB ready (WebAudio synth)';
  document.getElementById('sf2-label').textContent = 'soundfont: ' + sf2Info;
}).catch(() => { document.getElementById('sf2-label').textContent = 'soundfont: procedural synth'; });

// ============ Input ============
const keys = {};
let selected = 0, locked = false;
addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Digit1') selected = 0;
  if (e.code === 'Digit2') selected = 1;
  if (e.code === 'Digit3') selected = 2;
  if (e.code === 'Digit4') selected = 3;
  if (e.code === 'Digit5') selected = 4;
  if (e.code === 'Digit6') selected = 5;
  if (e.code === 'KeyY') player.invert *= -1;
  if (e.code === 'KeyR') respawn();
  if (e.code === 'KeyG') spawnZombie(player.x + 2, player.y, player.z + 2);
  if (e.code === 'Enter') saveGame();
  updateHotbar();
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => keys[e.code] = false);
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; });
const isTouch = () => matchMedia('(pointer:coarse)').matches;
function lockPointer() { if (!locked && overlayHidden && canvas.requestPointerLock) { try { const r = canvas.requestPointerLock(); if (r?.catch) r.catch(() => {}); } catch {} } }
canvas.addEventListener('click', () => { lockPointer(); });
addEventListener('mousemove', (e) => {
  if (!locked) return;
  player.yaw -= e.movementX * 0.0025;
  player.pitch -= e.movementY * 0.0025 * player.invert;
  player.pitch = Math.max(-1.55, Math.min(1.55, player.pitch));
});
let curHit = null;
canvas.addEventListener('mousedown', (e) => {
  if (!overlayHidden) return;
  audio();
  // First click only acquires pointer lock — it must not break/place.
  if (!locked && !isTouch()) { lockPointer(); return; }
  if (e.button === 0) doBreak();
  if (e.button === 2) doPlace();
});
addEventListener('contextmenu', (e) => e.preventDefault());
function doBreak() {
  const h = raycast(); if (!h) return;
  if (h.y === 0) return;
  burst(h.x, h.y, h.z, h.id); setTile(h.x, h.y, h.z, 0); sfxBreak();
}
function doPlace() {
  const h = raycast(); if (!h) return;
  let { x, y, z } = h;
  if (h.face === 0) y--; if (h.face === 1) y++;
  if (h.face === 2) z--; if (h.face === 3) z++;
  if (h.face === 4) x--; if (h.face === 5) x++;
  const id = HOTBAR[selected].id;
  // avoid placing inside player/zombies
  const pb = aabb();
  if (x + 1 > pb.x0 && x < pb.x1 && y + 1 > pb.y0 && y < pb.y1 && z + 1 > pb.z0 && z < pb.z1) return;
  if (getTile(x, y, z) !== 0 && getTile(x, y, z) !== BLOCK.FLOWER) return;
  setTile(x, y, z, id); sfxPlace();
}
// touch
const joy = document.getElementById('joy'), stick = document.getElementById('stick');
let joyVec = { x: 0, y: 0 }, joyId = null;
joy?.addEventListener('touchstart', (e) => { joyId = e.changedTouches[0].identifier; e.preventDefault(); }, { passive: false });
addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) if (t.identifier === joyId) {
    const r = joy.getBoundingClientRect();
    let dx = (t.clientX - (r.left + r.width / 2)) / (r.width / 2), dy = (t.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
    joyVec = { x: dx, y: dy }; stick.style.transform = `translate(calc(-50% + ${dx * 32}px), calc(-50% + ${dy * 32}px))`;
  }
}, { passive: true });
addEventListener('touchend', (e) => { for (const t of e.changedTouches) if (t.identifier === joyId) { joyId = null; joyVec = { x: 0, y: 0 }; stick.style.transform = 'translate(-50%,-50%)'; } });
let lastTouch = null;
canvas.addEventListener('touchstart', (e) => { lastTouch = e.changedTouches[0]; audio(); }, { passive: true });
canvas.addEventListener('touchmove', (e) => {
  const t = e.changedTouches[0];
  if (lastTouch && joyId === null) { player.yaw -= (t.clientX - lastTouch.clientX) * 0.005; player.pitch -= (t.clientY - lastTouch.clientY) * 0.005; player.pitch = Math.max(-1.55, Math.min(1.55, player.pitch)); }
  lastTouch = t;
}, { passive: true });
document.getElementById('t-jump')?.addEventListener('touchstart', (e) => { e.preventDefault(); if (player.onGround) player.yd = 8.2; }, { passive: false });
document.getElementById('t-break')?.addEventListener('touchstart', (e) => { e.preventDefault(); doBreak(); }, { passive: false });
document.getElementById('t-place')?.addEventListener('touchstart', (e) => { e.preventDefault(); doPlace(); }, { passive: false });

// ============ HUD / overlay ============
const hotbarEl = document.getElementById('hotbar');
function drawPreview(id) {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const tex = tileTex(id, 2);
  const sx = (tex % 16) * 16, sy = Math.floor(tex / 16) * 16;
  g.drawImage(atlas.canvas, sx, sy, 16, 16, 0, 0, 32, 32);
  if (id === BLOCK.GRASS) { g.drawImage(atlas.canvas, 0, 0, 16, 16, 0, 0, 32, 12); }
  return c;
}
function updateHotbar() {
  hotbarEl.innerHTML = '';
  HOTBAR.forEach((s, i) => {
    const d = document.createElement('div'); d.className = 'slot' + (i === selected ? ' active' : '');
    const b = document.createElement('b'); b.textContent = (i + 1); d.appendChild(b);
    d.appendChild(drawPreview(s.id));
    const sp = document.createElement('span'); sp.textContent = s.name; d.appendChild(sp);
    d.onclick = () => { selected = i; updateHotbar(); };
    hotbarEl.appendChild(d);
  });
  document.getElementById('sel-label').textContent = HOTBAR[selected].name;
}
let overlayHidden = false;
const overlay = document.getElementById('overlay');
function hideOverlay() { overlayHidden = true; overlay.style.display = 'none'; }
document.getElementById('play').onclick = async () => { hideOverlay(); await audio(); try { await canvas.requestPointerLock(); } catch {} toast('WASD move • LMB break • RMB place • 1-6 blocks'); };
document.getElementById('btn-preview').onclick = () => hideOverlay();
document.getElementById('btn-help').onclick = document.getElementById('btn-help2').onclick = () => { overlay.style.display = 'flex'; overlayHidden = false; };
document.getElementById('btn-new').onclick = () => { seed = Math.floor(Math.random() * 1e9); blocks = generateMap(seed); buildAll(); respawn(); zombies.length = 0; for (let i = 0; i < 8; i++) spawnZombie(); toast('New world • seed ' + seed); };
document.getElementById('btn-save').onclick = () => saveGame();
document.getElementById('btn-zombie').onclick = () => spawnZombie(player.x + 2, player.y, player.z + 2);
document.getElementById('btn-sound').onclick = (e) => { soundOn = !soundOn; e.target.textContent = soundOn ? '🔊 Sound: on' : '🔇 Sound: off'; };
let toastT = null;
function toast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg; t.style.display = 'block';
  clearTimeout(toastT); toastT = setTimeout(() => t.style.display = 'none', 2600);
}
function saveGame() {
  try {
    let bin = ''; const CH = 8192;
    for (let i = 0; i < blocks.length; i += CH) bin += String.fromCharCode.apply(null, blocks.subarray(i, i + CH));
    localStorage.setItem('mc008a-save-v1', JSON.stringify({ seed, px: player.x, py: player.y, pz: player.z, data: btoa(bin) }));
    toast('World saved (localStorage)');
  } catch { toast('Save failed (quota)'); }
}
function loadGame() {
  try {
    const s = JSON.parse(localStorage.getItem('mc008a-save-v1'));
    if (!s?.data) return false;
    const bin = atob(s.data); const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    if (arr.length !== blocks.length) return false;
    blocks = arr; seed = s.seed; player.x = s.px; player.y = s.py; player.z = s.pz;
    return true;
  } catch { return false; }
}

// ============ Boot ============
function columnHasTree(x, z) {
  for (let y = 0; y < D; y++) { const t = getTile(x, y, z); if (t === BLOCK.WOOD || t === BLOCK.LEAVES) return true; }
  return false;
}
function findSpawn() {
  let best = null;
  for (let r = 0; r < 2000; r++) {
    const x = 20 + Math.floor(Math.random() * (W - 40)), z = 20 + Math.floor(Math.random() * (H - 40));
    const top = surfaceY(x + 0.5, z + 0.5) - 1;
    if (top < 12 || top > D - 8) continue;
    if (getTile(x, top, z) !== BLOCK.GRASS) continue;
    // no trees nearby, thick ground (no cave within 4 below)
    let ok = true;
    for (let dx = -3; dx <= 3 && ok; dx++) for (let dz = -3; dz <= 3 && ok; dz++) if (columnHasTree(x + dx, z + dz)) ok = false;
    for (let k = 1; k <= 4 && ok; k++) if (!isSolid(x, top - k, z)) ok = false;
    if (ok) return { x: x + 0.5, z: z + 0.5, top };
    if (!best) best = { x: x + 0.5, z: z + 0.5, top };
  }
  return best || { x: W / 2 + 0.5, z: H / 2 + 0.5, top: surfaceY(W / 2, H / 2) - 1 };
}
function clearSpawn(x, z) {
  x = Math.floor(x); z = Math.floor(z);
  for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) for (let y = 0; y < D; y++) {
    const t = getTile(x + dx, y, z + dz);
    if (t === BLOCK.WOOD || t === BLOCK.LEAVES || t === BLOCK.FLOWER) setTile(x + dx, y, z + dz, 0);
  }
}
document.getElementById('load-status').textContent = 'Generating world (seed 1337, 128×128×32)…';
const hadSave = loadGame();
buildAll();
if (!hadSave) { respawn(); clearSpawn(player.x, player.z); player.yaw = 2.4; player.pitch = -0.08; }
resize(); updateHotbar();
for (let i = 0; i < 8; i++) spawnZombie();
window.__mc = { player, getTile, setTile, respawn, get blocks() { return blocks; } };
document.getElementById('load-status').textContent = hadSave ? 'Save loaded from this browser ✔ — click Play.' : 'World ready ✔ — 8 zombies wandering. Click Play.';
document.getElementById('ver').textContent = '0.0.8a';

// ============ Loop ============
const fpsEl = document.getElementById('fps'), posEl = document.getElementById('pos');
let last = performance.now(), acc = 0, frames = 0, fpsT = 0;
function tick(dt) {
  // movement input
  let xa = 0, za = 0;
  if (keys.KeyW || keys.ArrowUp) za -= 1;
  if (keys.KeyS || keys.ArrowDown) za += 1;
  if (keys.KeyA || keys.ArrowLeft) xa -= 1;
  if (keys.KeyD || keys.ArrowRight) xa += 1;
  xa += joyVec.x; za += joyVec.y;
  const m = Math.hypot(xa, za); if (m > 1) { xa /= m; za /= m; }
  const sp = 4.4;
  const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
  // Camera (YXZ, yaw about Y): forward = (-sin, -cos), right = (cos, -sin).
  // Input: xa=+1 right (D), za=+1 back (S). vel = right*xa + back*za, back = -forward.
  const ix = (xa * cos + za * sin) * sp;
  const iz = (-xa * sin + za * cos) * sp;
  const k = Math.min(1, dt * 12);
  player.xd += (ix - player.xd) * k;
  player.zd += (iz - player.zd) * k;
  if ((keys.Space) && player.onGround) { player.yd = 8.4; player.onGround = false; }
  player.yd -= 26 * dt; if (player.yd < -22) player.yd = -22;
  collideMove(dt);
  for (const z of zombies) zombiePhysics(z, dt);
  tickParticles(dt);
  if (cloudMesh) cloudMesh.position.x = W / 2 + ((performance.now() / 1000 * 0.7) % 64);
}
function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000; last = now;
  if (dt > 0.1) dt = 0.1;
  tick(dt);
  camera.position.set(player.x, player.y - player.h / 2 + player.eye, player.z);
  camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
  curHit = overlayHidden || locked ? raycast() : raycast();
  if (curHit) { hl.visible = true; hl.position.set(curHit.x + 0.5, curHit.y + 0.5, curHit.z + 0.5); }
  else hl.visible = false;
  renderer.render(scene, camera);
  frames++; fpsT += dt;
  if (fpsT >= 0.5) {
    fpsEl.textContent = Math.round(frames / fpsT) + ' fps';
    posEl.textContent = `${player.x.toFixed(0)}, ${player.y.toFixed(0)}, ${player.z.toFixed(0)}`;
    frames = 0; fpsT = 0;
  }
}
requestAnimationFrame(frame);
