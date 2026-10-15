// js/world.js — Faithful port of the 0.0.8a terrain + physics core.
// Java: com.mojang.minecraft.level.{LevelGen, NoiseMap, Level}, phys.AABB,
//       level.tile.{Tile, GrassTile, Bush}, Entity.move / Player.tick.
//
// One deliberate upgrade: every `new Random()` in the original was unseeded.
// Here all randomness flows from an explicit seed (Java LCG, ported exactly),
// so worlds are shareable. Pass a time-based seed to get the 2009 behaviour.

export const TILE = { AIR: 0, ROCK: 1, GRASS: 2, DIRT: 3, BRICK: 4, WOOD: 5, BUSH: 6 };
export const TILE_NAME = { 0: 'air', 1: 'rock', 2: 'grass', 3: 'dirt', 4: 'brick', 5: 'wood', 6: 'leaves' };
// GrassTile.getTexture(face): top(1)->0, bottom(0)->2, sides->3
export function tileTexture(id, face) {
  if (id === TILE.GRASS) return face === 1 ? 0 : face === 0 ? 2 : 3;
  if (id === TILE.ROCK) return 1;
  if (id === TILE.DIRT) return 2;
  if (id === TILE.BRICK) return 16;
  if (id === TILE.WOOD) return 4;
  if (id === TILE.BUSH) return 15;
  return 1;
}
export const isSolidId = (id) => id !== TILE.AIR && id !== TILE.BUSH;
export const blocksLightId = (id) => id !== TILE.AIR && id !== TILE.BUSH;

// ---- java.util.Random, bit-exact (LCG48) ----
const MASK48 = (1n << 48n) - 1n;
export class JavaRandom {
  constructor(seed = 1) {
    this.seed = (BigInt(seed | 0) ^ 0x5DEECE66Dn) & MASK48;
  }
  next(bits) {
    this.seed = (this.seed * 0x5DEECE66Dn + 0xBn) & MASK48;
    return Number(this.seed >> (48n - BigInt(bits)));
  }
  nextInt(bound) {
    if (bound <= 0) throw new Error('bound must be positive');
    if ((bound & -bound) === bound) {
      // power of two fast path (bound * next(31)) >> 31
      return Math.floor((bound * this.next(31)) / 2147483648);
    }
    let bits, val;
    do {
      bits = this.next(31);
      val = bits % bound;
    } while (bits - val + (bound - 1) < 0);
    return val;
  }
  nextFloat() { return this.next(24) / 16777216; }
}

// ---- NoiseMap.read — ported 1:1, quirks included ----
export function noiseMapRead(width, height, levels, rng) {
  const fuzz = 16;
  const tmp = new Int32Array(width * height);
  const step0 = width >> levels;
  for (let y = 0; y < height; y += step0) {
    for (let x = 0; x < width; x += step0) {
      tmp[x + y * width] = (rng.nextInt(256) - 128) * fuzz;
    }
  }
  const trunc = Math.trunc;
  for (let step = step0; step > 1; step = trunc(step / 2)) {
    const val = 256 * (step << levels);
    const ss = trunc(step / 2);
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const c = tmp[((x + 0) % width) + (((y + 0) % height) * width)];
        const r = tmp[((x + step) % width) + (((y + 0) % height) * width)];
        const d = tmp[((x + 0) % width) + (((y + step) % height) * width)];
        const mu = tmp[((x + step) % width) + (((y + step) % height) * width)];
        tmp[x + ss + (y + ss) * width] = trunc((c + d + r + mu) / 4) + rng.nextInt(val * 2) - val;
      }
    }
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const c = tmp[x + y * width];
        const r = tmp[((x + step) % width) + y * width];
        const d = tmp[x + (((y + step) % width) * width)]; // sic: % width, as in the original
        const mu = tmp[(((x + ss) & (width - 1))) + ((((y + ss - step) & (height - 1))) * width)];
        const ml = tmp[(((x + ss - step) & (width - 1))) + ((((y + ss) & (height - 1))) * width)];
        const m = tmp[((x + ss) % width) + (((y + ss) % height) * width)];
        tmp[x + ss + y * width] = trunc((c + r + m + mu) / 4) + rng.nextInt(val * 2) - val;
        tmp[x + (y + ss) * width] = trunc((c + d + m + ml) / 4) + rng.nextInt(val * 2) - val;
      }
    }
  }
  const result = new Int32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      result[x + y * width] = trunc(tmp[(x % width) + ((y % height) * width)] / 512) + 128;
    }
  }
  return result;
}

// ---- LevelGen.generateMap — ported from LevelGen.java ----
// W: x size, H: z size, D: vertical (y) size. Index: (y*H + z)*W + x
export function generateMap(W, H, D, seed) {
  const rng = new JavaRandom(seed);
  const heightmap1 = noiseMapRead(W, H, 0, rng);
  const heightmap2 = noiseMapRead(W, H, 0, rng);
  const cf = noiseMapRead(W, H, 1, rng);
  const rockMap = noiseMapRead(W, H, 1, rng);
  const blocks = new Uint8Array(W * H * D);
  for (let x = 0; x < W; x++) {
    for (let z = 0; z < H; z++) {
      for (let y = 0; y < D; y++) {
        let dh1 = heightmap1[x + z * W];
        let dh2 = heightmap2[x + z * W];
        const cliff = cf[x + z * W];
        if (cliff < 128) dh2 = dh1;
        let dh = dh1;
        if (dh2 > dh1) dh = dh2;
        dh = Math.trunc(dh / 8) + Math.trunc(D / 3);
        let rh = Math.trunc(rockMap[x + z * W] / 8) + Math.trunc(D / 3);
        if (rh > dh - 2) rh = dh - 2;
        const i = (y * H + z) * W + x;
        let id = 0;
        if (y === dh) id = TILE.GRASS;
        if (y < dh) id = TILE.DIRT;
        if (y <= rh) id = TILE.ROCK;
        blocks[i] = id;
      }
    }
  }
  // worm caves
  const count = Math.trunc((W * H * D) / 256 / 64);
  for (let c = 0; c < count; c++) {
    let fx = rng.nextFloat() * W, fy = rng.nextFloat() * D, fz = rng.nextFloat() * H;
    const length = Math.trunc(rng.nextFloat() + rng.nextFloat() * 150);
    let dir1 = rng.nextFloat() * Math.PI * 2, dira1 = 0;
    let dir2 = rng.nextFloat() * Math.PI * 2, dira2 = 0;
    for (let l = 0; l < length; l++) {
      fx += Math.sin(dir1) * Math.cos(dir2);
      fz += Math.cos(dir1) * Math.cos(dir2);
      fy += Math.sin(dir2);
      dir1 += dira1 * 0.2; dira1 *= 0.9; dira1 += rng.nextFloat() - rng.nextFloat();
      dir2 += dira2 * 0.5; dir2 *= 0.5; dira2 *= 0.9; dira2 += rng.nextFloat() - rng.nextFloat();
      const size = Math.sin((l * Math.PI) / length) * 2.5 + 1.0;
      for (let xx = Math.trunc(fx - size); xx <= Math.trunc(fx + size); xx++) {
        for (let yy = Math.trunc(fy - size); yy <= Math.trunc(fy + size); yy++) {
          for (let zz = Math.trunc(fz - size); zz <= Math.trunc(fz + size); zz++) {
            const xd = xx - fx, yd = yy - fy, zd = zz - fz;
            if (xd * xd + yd * yd * 2 + zd * zd < size * size &&
                xx >= 1 && yy >= 1 && zz >= 1 && xx < W - 1 && yy < D - 1 && zz < H - 1) {
              const ii = (yy * H + zz) * W + xx;
              if (blocks[ii] === TILE.ROCK) blocks[ii] = 0;
            }
          }
        }
      }
    }
  }
  return blocks;
}

// ---- Level: block store + light depths (Level.java) ----
export class Level {
  constructor(W, H, D, blocks) {
    this.W = W; this.H = H; this.D = D;
    this.blocks = blocks || new Uint8Array(W * H * D);
    this.lightDepths = new Int32Array(W * H);
    this.calcLightDepths(0, 0, W, H);
  }
  idx(x, y, z) { return (y * this.H + z) * this.W + x; }
  inBounds(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < this.W && y < this.D && z < this.H; }
  getTile(x, y, z) { return this.inBounds(x, y, z) ? this.blocks[this.idx(x, y, z)] : 0; }
  setTile(x, y, z, id) {
    if (!this.inBounds(x, y, z)) return false;
    const i = this.idx(x, y, z);
    if (this.blocks[i] === id) return false;
    this.blocks[i] = id;
    this.calcLightDepths(x, z, 1, 1);
    return true;
  }
  isSolidTile(x, y, z) { return isSolidId(this.getTile(x, y, z)); }
  isLightBlocker(x, y, z) { return blocksLightId(this.getTile(x, y, z)); }
  isLit(x, y, z) {
    if (!this.inBounds(x, y, z)) return true;
    return y >= this.lightDepths[x + z * this.W];
  }
  calcLightDepths(x0, z0, w, h) {
    for (let x = x0; x < x0 + w; x++) {
      for (let z = z0; z < z0 + h; z++) {
        let y;
        for (y = this.D - 1; y > 0 && !this.isLightBlocker(x, y, z); y--) ;
        this.lightDepths[x + z * this.W] = y;
      }
    }
  }
  // Level.getCubes — solid AABBs overlapping an expanded box
  getCubes(box) {
    const out = [];
    let x0 = Math.floor(box.x0), x1 = Math.floor(box.x1 + 1);
    let y0 = Math.floor(box.y0), y1 = Math.floor(box.y1 + 1);
    let z0 = Math.floor(box.z0), z1 = Math.floor(box.z1 + 1);
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); z0 = Math.max(0, z0);
    x1 = Math.min(this.W, x1); y1 = Math.min(this.D, y1); z1 = Math.min(this.H, z1);
    for (let x = x0; x < x1; x++) for (let y = y0; y < y1; y++) for (let z = z0; z < z1; z++) {
      if (this.isSolidTile(x, y, z)) out.push({ x0: x, y0: y, z0: z, x1: x + 1, y1: y + 1, z1: z + 1 });
    }
    return out;
  }
  topY(x, z) {
    for (let y = this.D - 1; y >= 0; y--) if (this.getTile(x, y, z)) return y;
    return 0;
  }
  // Random tile ticks: grass spreads to lit dirt, dark grass -> dirt, floating bushes pop.
  // Returns number of changed blocks.
  randomTick(rng, n = 24) {
    let changed = 0;
    const set = (x, y, z, id) => { if (this.setTile(x, y, z, id)) changed++; };
      const x = rng.nextInt(this.W), y = rng.nextInt(this.D), z = rng.nextInt(this.H);
    for (let i = 0; i < n; i++) {
      const x = rng.nextInt(this.W), y = rng.nextInt(this.D), z = rng.nextInt(this.H);
      const id = this.getTile(x, y, z);
      if (id === TILE.GRASS && !this.isLit(x, y, z)) set(x, y, z, TILE.DIRT);
      else if (id === TILE.DIRT && this.isLit(x, y, z)) {
        const xt = x + rng.nextInt(3) - 1, yt = y + rng.nextInt(3) - 1, zt = z + rng.nextInt(3) - 1;
        if (this.getTile(xt, yt, zt) === TILE.GRASS) set(x, y, z, TILE.GRASS);
      } else if (id === TILE.BUSH) {
        const below = this.getTile(x, y - 1, z);
        if (!this.isLit(x, y, z) || (below !== TILE.DIRT && below !== TILE.GRASS)) set(x, y, z, 0);
      }
    }
    return changed;
  }
  serialize() {
    let bin = '';
    const b = this.blocks;
    for (let i = 0; i < b.length; i += 4096) {
      bin += String.fromCharCode.apply(null, b.subarray(i, i + 4096));
    }
    return btoa(bin);
  }
  static deserialize(W, H, D, s) {
    const bin = atob(s);
    const blocks = new Uint8Array(W * H * D);
    for (let i = 0; i < blocks.length && i < bin.length; i++) blocks[i] = bin.charCodeAt(i);
    return new Level(W, H, D, blocks);
  }
}

// Sprinkle a few bushes on lit grass (upgrade; 0.8a terrain had none).
export function sprinkleBushes(level, rng, count) {
  let placed = 0, guard = count * 40;
  while (placed < count && guard-- > 0) {
    const x = rng.nextInt(level.W), z = rng.nextInt(level.H);
    const y = level.topY(x, z);
    if (level.getTile(x, y, z) === TILE.GRASS && level.isLit(x, y + 1, z) && !level.getTile(x, y + 1, z)) {
      level.blocks[level.idx(x, y + 1, z)] = TILE.BUSH;
      placed++;
    }
  }
  return placed;
}
