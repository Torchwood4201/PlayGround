// levels.js — PlayGround 2026
// 12 large Doom-style levels with secret rooms.
//
// Legend:
// # brick   M metal   C concrete   W wood   R rock   L plaster
// . floor   @ spawn   E exit       B barrel
// i imp     d demon
// s shells  m medkit
// 2 pump    3 rifle   4 smg        5 sniper
// S secret-room floor — walkable; hidden behind one-tile gaps.
//
// Every map is generated deterministically from a fixed seed,
// so the same 12 layouts appear every time.

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeLevel(index, name, seed) {
  const W = 48 + index * 2;
  const H = 34 + index * 2;
  const rnd = mulberry32(seed);
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const chance = p => rnd() < p;

  const g = Array.from({ length: H }, () => Array(W).fill('#'));
  const rooms = [];
  const secrets = [];

  const inside = (x, y) => x >= 1 && y >= 1 && x < W - 1 && y < H - 1;
  const areaClear = (x, y, w, h) => {
    if (!inside(x, y) || !inside(x + w - 1, y + h - 1)) return false;
    for (let j = y - 1; j < y + h + 1; j++) {
      for (let i = x - 1; i < x + w + 1; i++) {
        if (g[j][i] !== '#') return false;
      }
    }
    return true;
  };
  const carve = (x, y, w, h, ch) => {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) g[j][i] = ch;
    }
  };
  const carveCorridor = (x0, y0, x1, y1) => {
    let x = x0, y = y0;
    const horizontalFirst = chance(0.5);
    const h = () => { while (x !== x1) { x += Math.sign(x1 - x); g[y][x] = '.'; } };
    const v = () => { while (y !== y1) { y += Math.sign(y1 - y); g[y][x] = '.'; } };
    if (horizontalFirst) { h(); v(); } else { v(); h(); }
  };

  // ---------- rooms ----------
  const roomTarget = 12 + Math.min(12, index);
  for (let tries = 0; tries < 900 && rooms.length < roomTarget; tries++) {
    const w = ri(6, 14);
    const h = ri(5, 10);
    const x = ri(2, W - w - 3);
    const y = ri(2, H - h - 3);
    if (!areaClear(x, y, w, h)) continue;
    carve(x, y, w, h, '.');
    rooms.push({
      x, y, w, h,
      cx: x + (w >> 1),
      cy: y + (h >> 1)
    });
  }

  // Guaranteed fallback layout if room placement somehow fails.
  if (rooms.length < 4) {
    rooms.length = 0;
    const fallback = [
      [4, 4, 12, 8],
      [22, 4, 12, 8],
      [4, 18, 12, 8],
      [22, 18, 12, 8],
      [12, 12, 10, 7]
    ];
    for (const [x, y, w, h] of fallback) {
      carve(x, y, w, h, '.');
      rooms.push({ x, y, w, h, cx: x + (w >> 1), cy: y + (h >> 1) });
    }
  }

  // ---------- connect rooms ----------
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1];
    const b = rooms[i];
    carveCorridor(a.cx, a.cy, b.cx, b.cy);
  }

  // Add loops so maps are less linear and more Doom-like.
  const extraPaths = 3 + Math.floor(index * 0.8);
  for (let i = 0; i < extraPaths; i++) {
    const a = rooms[ri(0, rooms.length - 1)];
    const b = rooms[ri(0, rooms.length - 1)];
    if (a !== b) carveCorridor(a.cx, a.cy, b.cx, b.cy);
  }

  // ---------- Doom-style secret rooms ----------
  const secretCount = 2 + (index >= 4 ? 1 : 0) + (index >= 8 ? 1 : 0);
  const secretLoot = [];

  if (index === 1) secretLoot.push('2');
  if (index === 2) secretLoot.push('3');
  if (index === 4) secretLoot.push('4');
  if (index === 6) secretLoot.push('5');

  while (secretLoot.length < secretCount) {
    secretLoot.push(chance(0.55) ? 'm' : 's');
  }

  for (let n = 0; n < secretCount; n++) {
    let placed = false;

    for (let tries = 0; tries < 300 && !placed; tries++) {
      const room = rooms[ri(0, rooms.length - 1)];
      const side = ri(0, 3);
      const sw = ri(5, 9);
      const sh = ri(4, 7);
      let sx, sy, gapX, gapY;

      if (side === 0) { // above
        sy = room.y - sh - 1;
        sx = ri(2, W - sw - 3);
        gapY = room.y - 1;
        // secret must horizontally overlap the room, else the gap misses
        const loX = Math.max(room.x, sx), hiX = Math.min(room.x + room.w - 1, sx + sw - 1);
        if (hiX < loX) continue;
        gapX = ri(loX, hiX);
      } else if (side === 1) { // below
        sy = room.y + room.h + 1;
        sx = ri(2, W - sw - 3);
        gapY = room.y + room.h;
        const loX = Math.max(room.x, sx), hiX = Math.min(room.x + room.w - 1, sx + sw - 1);
        if (hiX < loX) continue;
        gapX = ri(loX, hiX);
      } else if (side === 2) { // left
        sx = room.x - sw - 1;
        sy = ri(2, H - sh - 3);
        gapX = room.x - 1;
        // secret must vertically overlap the room, else the gap misses
        const loY = Math.max(room.y, sy), hiY = Math.min(room.y + room.h - 1, sy + sh - 1);
        if (hiY < loY) continue;
        gapY = ri(loY, hiY);
      } else { // right
        sx = room.x + room.w + 1;
        sy = ri(2, H - sh - 3);
        gapX = room.x + room.w;
        const loY = Math.max(room.y, sy), hiY = Math.min(room.y + room.h - 1, sy + sh - 1);
        if (hiY < loY) continue;
        gapY = ri(loY, hiY);
      }

      if (!areaClear(sx, sy, sw, sh)) continue;
      if (g[gapY][gapX] !== '#') continue;

      carve(sx, sy, sw, sh, 'S');
      g[gapY][gapX] = '.';

      const loot = secretLoot[n];
      const lx = sx + (sw >> 1);
      const ly = sy + (sh >> 1);
      g[ly][lx] = loot;

      if (chance(0.6)) {
        const bx = sx + ri(1, sw - 2);
        const by = sy + ri(1, sh - 2);
        if (g[by][bx] === 'S') g[by][bx] = chance(0.5) ? 'm' : 's';
      }

      secrets.push({ x: sx, y: sy, w: sw, h: sh });
      placed = true;
    }
  }

  // ---------- spawn and exit ----------
  const start = rooms[0];
  g[start.cy][start.cx] = '@';

  let exitRoom = rooms[rooms.length - 1];
  let bestD = -1;
  for (const r of rooms) {
    const d = Math.hypot(r.cx - start.cx, r.cy - start.cy);
    if (d > bestD) { bestD = d; exitRoom = r; }
  }
  g[exitRoom.cy][exitRoom.cx] = 'E';

  // ---------- helpers for decoration ----------
  const openTiles = [];
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (g[y][x] === '.') openTiles.push({ x, y });
    }
  }

  const farFromSpawn = (x, y, minDist) =>
    Math.hypot(x - start.cx, y - start.cy) >= minDist;

  const takeRandomOpenTile = (minDist = 0) => {
    for (let tries = 0; tries < 200; tries++) {
      const p = openTiles[ri(0, openTiles.length - 1)];
      if (!p || g[p.y][p.x] !== '.') continue;
      if (!farFromSpawn(p.x, p.y, minDist)) continue;
      return p;
    }
    return null;
  };

  const place = (ch, count, minDist = 0) => {
    for (let n = 0; n < count; n++) {
      const p = takeRandomOpenTile(minDist);
      if (p) g[p.y][p.x] = ch;
    }
  };

  // ---------- enemies ----------
  const imps = 6 + index * 3;
  const demons = index < 2 ? 0 : 1 + Math.floor(index * 0.9);
  place('i', imps, 9);
  place('d', demons, 12);

  // ---------- barrels ----------
  place('B', 4 + index, 6);

  // ---------- normal pickups ----------
  place('s', 5 + index, 5);
  place('m', 2 + Math.floor(index / 2), 7);

  // ---------- weapon pickups in normal rooms ----------
  if (index === 1) place('2', 1, 14);
  if (index === 2) place('3', 1, 14);
  if (index === 4) place('4', 1, 14);
  if (index === 6) place('5', 1, 14);

  // ---------- convert to strings ----------
  const map = g.map(row => row.join(''));
  return { name, map };
}

export const LEVELS = [
  makeLevel(0, 'L1 · BOOT CAMP', 0x1001),
  makeLevel(1, 'L2 · CROSSFIRE', 0x2002),
  makeLevel(2, 'L3 · FOUNDRY', 0x3003),
  makeLevel(3, 'L4 · ARMORY', 0x4004),
  makeLevel(4, 'L5 · CISTERNS', 0x5005),
  makeLevel(5, 'L6 · CRUSHER', 0x6006),
  makeLevel(6, 'L7 · OVERLOOK', 0x7007),
  makeLevel(7, 'L8 · LABYRINTH', 0x8008),
  makeLevel(8, 'L9 · FURNACE', 0x9009),
  makeLevel(9, 'L10 · CITADEL', 0xA00A),
  makeLevel(10, 'L11 · ABYSS', 0xB00B),
  makeLevel(11, 'L12 · THRONE', 0xC00C)
];
