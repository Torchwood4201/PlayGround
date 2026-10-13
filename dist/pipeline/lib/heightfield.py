"""Seeded procedural heightfields + PBR map derivation. Stdlib only.

Generators return rows[y][x] floats in 0..1, tileable when tile=True.
height_to_normal(): Sobel gradient -> OpenGL (+Y) normal map rows of (r,g,b).
cavity_ao(): blurred-height cavity darkening. All deterministic per seed.
"""
import math
import random


def _lattice(rand, n):
    return [[rand.random() for _ in range(n)] for _ in range(n)]


def _fade(t):
    return t * t * (3 - 2 * t)


def _value_noise(size, cells, rand, tile=True):
    lat = _lattice(rand, cells + 1)
    if tile:
        for i in range(cells + 1):
            lat[i][cells] = lat[i][0]
            lat[cells][i] = lat[0][i]
    out = [[0.0] * size for _ in range(size)]
    step = size / cells
    for y in range(size):
        gy = y / step
        y0 = int(gy) % cells
        y1 = (y0 + 1) % cells
        fy = _fade(gy - int(gy))
        for x in range(size):
            gx = x / step
            x0 = int(gx) % cells
            x1 = (x0 + 1) % cells
            fx = _fade(gx - int(gx))
            a = lat[y0][x0] + (lat[y0][x1] - lat[y0][x0]) * fx
            b = lat[y1][x0] + (lat[y1][x1] - lat[y1][x0]) * fx
            out[y][x] = a + (b - a) * fy
    return out


def fbm(size, octaves, seed, tile=True, lacunarity=2.0, gain=0.5):
    rand = random.Random(seed)
    out = [[0.0] * size for _ in range(size)]
    amp, cells, total = 1.0, 4, 0.0
    for _ in range(octaves):
        n = _value_noise(size, cells, rand, tile)
        for y in range(size):
            row_o, row_n = out[y], n[y]
            for x in range(size):
                row_o[x] += row_n[x] * amp
        total += amp
        amp *= gain
        cells = int(cells * lacunarity)
    for y in range(size):
        for x in range(size):
            out[y][x] /= total
    return out


def ridged(size, seed, tile=True):
    h = fbm(size, 4, seed, tile)
    return [[1.0 - abs(v * 2 - 1) for v in row] for row in h]


def brick(size, seed, bw=32, bh=16, mortar=3):
    """Running-bond brick courses with per-brick height jitter + mortar recess."""
    rand = random.Random(seed)
    rows = size // bh
    jitter = {}
    out = [[0.0] * size for _ in range(size)]
    for y in range(size):
        course = y // bh
        off = (bw // 2) if (course % 2) else 0
        for x in range(size):
            xx = (x + off) % size
            bx = xx // bw
            lx, ly = xx % bw, y % bh
            if lx < mortar or ly < mortar:
                out[y][x] = 0.12
            else:
                key = (course, bx)
                if key not in jitter:
                    jitter[key] = 0.55 + rand.random() * 0.45
                out[y][x] = jitter[key]
    return out


def brushed_metal(size, seed, streaks=220):
    rand = random.Random(seed)
    base = fbm(size, 3, seed, True)
    cols = [rand.gauss(0, 0.06) for _ in range(size)]
    out = [[0.0] * size for _ in range(size)]
    for y in range(size):
        for x in range(size):
            out[y][x] = min(1.0, max(0.0, base[y][x] * 0.7 + 0.3 + cols[x]))
    # analytic rivet bumps on a grid
    for ry in range(0, size, size // 4):
        for rx in range(0, size, size // 4):
            for dy in range(-6, 7):
                for dx in range(-6, 7):
                    d = math.hypot(dx, dy)
                    if d < 6:
                        out[(ry + dy) % size][(rx + dx) % size] = max(
                            out[(ry + dy) % size][(rx + dx) % size], 0.9 - d * 0.08)
    return out


def wood(size, seed, planks=6, rings=26):
    rand = random.Random(seed)
    warp_seed = rand.randint(0, 10 ** 9)
    warp = fbm(size, 3, warp_seed, True)
    out = [[0.0] * size for _ in range(size)]
    ph = size // planks
    for y in range(size):
        plank = y // ph
        tone = 0.45 + ((plank * 37) % 10) / 10 * 0.3
        for x in range(size):
            g = math.sin((x / size * rings + warp[y][x] * 3.0) * math.pi * 2)
            v = tone + g * 0.08
            if y % ph < 2:
                v = 0.15
            out[y][x] = min(1.0, max(0.0, v))
    return out


def knurl(size, seed, freq=24):
    rand = random.Random(seed)
    ph = rand.random() * math.pi
    return [[0.5 + 0.5 * math.sin(x / size * freq * math.pi * 2 + ph)
             * math.sin(y / size * freq * math.pi * 2) for x in range(size)] for y in range(size)]


def muscle(size, seed, blobs=9):
    rand = random.Random(seed)
    cx = [[0.0] * size for _ in range(size)]
    for _ in range(blobs):
        bx, by = rand.random() * size, rand.random() * size
        r = size * (0.06 + rand.random() * 0.1)
        a = 0.3 + rand.random() * 0.5
        for y in range(size):
            for x in range(size):
                d = math.hypot(x - bx, y - by)
                if d < r:
                    cx[y][x] += a * (1 - d / r) ** 2
    mx = max(max(row) for row in cx) or 1.0
    return [[min(1.0, v / mx * 0.8 + 0.2) for v in row] for row in cx]


GENERATORS = {
    'brick': brick, 'concrete': lambda s, seed: fbm(s, 4, seed),
    'metal': brushed_metal, 'wood': wood, 'rock': lambda s, seed: ridged(s, seed),
    'plaster': lambda s, seed: fbm(s, 3, seed),
    'knurl': knurl, 'muscle': muscle,
}


def height_to_normal(h, strength=2.0):
    """Sobel gradient -> OpenGL (+Y up) normal map. Returns rows of (r,g,b)."""
    s = len(h)
    out = [[(128, 128, 255)] * s for _ in range(s)]

    def at(y, x):
        return h[y % s][x % s]

    for y in range(s):
        nrow = out[y]
        for x in range(s):
            dx = (at(y, x + 1) - at(y, x - 1)) * strength
            dy = (at(y + 1, x) - at(y - 1, x)) * strength
            inv = 1.0 / math.sqrt(dx * dx + dy * dy + 1.0)
            nrow[x] = (int((-dx * inv * 0.5 + 0.5) * 255),
                       int((dy * inv * 0.5 + 0.5) * 255),
                       int((inv * 0.5 + 0.5) * 255))
    return out


def cavity_ao(h, blur_r=3, depth=0.55):
    """Cheap cavity: low-frequency average minus local height -> darkening."""
    s = len(h)
    out = [[255] * s for _ in range(s)]
    for y in range(s):
        for x in range(s):
            total, n = 0.0, 0
            for dy in range(-blur_r, blur_r + 1):
                for dx in range(-blur_r, blur_r + 1):
                    total += h[(y + dy) % s][(x + dx) % s]
                    n += 1
            cav = total / n - h[y][x]
            out[y][x] = int(min(1.0, max(0.0, 1.0 - cav * depth * 4)) * 255)
    return out
