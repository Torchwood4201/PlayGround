"""Generate tiny placeholder PNGs (pure stdlib) for sprites/ drop-ins."""
import struct, zlib, os

def png(path, w, h, px):
    raw = b''.join(b'\x00' + b''.join(px[y][x] for x in range(w)) for y in range(h))
    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    data = (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b''))
    open(path, 'wb').write(data)
    print(path, len(data), 'bytes')

d = os.path.dirname(os.path.abspath(__file__))
# 24x28 imp-ish placeholder: brown body, yellow eyes
W, H = 24, 28
T = bytes((0, 0, 0, 0))
S = bytes((138, 95, 67, 255))
D = bytes((94, 63, 44, 255))
E = bytes((255, 255, 0, 255))
M = bytes((64, 0, 0, 255))
grid = [[T]*W for _ in range(H)]
for y in range(3, 9):
    for x in range(8, 16): grid[y][x] = S
grid[5][10] = E; grid[5][13] = E
for y in range(7, 8):
    for x in range(10, 14): grid[y][x] = M
for y in range(9, 19):
    for x in range(7, 17): grid[y][x] = S
for y in range(19, 27):
    for x in range(8, 11): grid[y][x] = D
    for x in range(13, 16): grid[y][x] = D
png(os.path.join(d, 'imp.png'), W, H, grid)
png(os.path.join(d, 'demon.png'), W, H, grid)
png(os.path.join(d, 'baron.png'), W, H, grid)
# shotgun placeholder: gray barrel on transparent
W2, H2 = 32, 20
grid2 = [[T]*W2 for _ in range(H2)]
for y in range(2, 10):
    for x in range(13, 19): grid2[y][x] = bytes((40, 40, 40, 255))
for y in range(10, 18):
    for x in range(10, 22): grid2[y][x] = bytes((107, 86, 56, 255))
png(os.path.join(d, 'shotgun.png'), W2, H2, grid2)
