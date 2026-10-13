"""Stdlib-only PNG codec: 8-bit RGB/RGBA read + RGBA write. No PIL."""
import struct
import zlib


def _chunks(data):
    assert data[:8] == b'\x89PNG\r\n\x1a\n', 'not a PNG'
    pos, out = 8, []
    while pos < len(data):
        ln = struct.unpack('>I', data[pos:pos + 4])[0]
        typ, dat = data[pos + 4:pos + 8], data[pos + 8:pos + 8 + ln]
        crc = struct.unpack('>I', data[pos + 8 + ln:pos + 12 + ln])[0]
        assert zlib.crc32(typ + dat) & 0xffffffff == crc, f'CRC fail {typ}'
        out.append((typ, dat))
        pos += 12 + ln
    return out


def read(path):
    """Return (w, h, pixels) where pixels[y][x] = (r,g,b,a). Supports 8-bit RGB/RGBA, all filters."""
    data = open(path, 'rb').read()
    w = h = ctype = depth = None
    idat = b''
    for typ, dat in _chunks(data):
        if typ == b'IHDR':
            w, h, depth, ctype, _, _, _ = struct.unpack('>IIBBBBB', dat)
        elif typ == b'IDAT':
            idat += dat
    assert depth == 8 and ctype in (2, 6), f'need 8-bit RGB/RGBA, got depth={depth} ctype={ctype}'
    ch = 3 if ctype == 2 else 4
    raw = zlib.decompress(idat)
    stride = w * ch
    px = [[(0, 0, 0, 255)] * w for _ in range(h)]
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        f = raw[p]
        p += 1
        line = bytearray(raw[p:p + stride])
        p += stride
        if f == 1:
            for i in range(ch, stride):
                line[i] = (line[i] + line[i - ch]) & 255
        elif f == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 255
        elif f == 3:
            for i in range(stride):
                a = line[i - ch] if i >= ch else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif f == 4:
            for i in range(stride):
                a = line[i - ch] if i >= ch else 0
                b = prev[i]
                c = prev[i - ch] if i >= ch else 0
                pr = a + b - c
                pa, pb, pc = abs(pr - a), abs(pr - b), abs(pr - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 255
        elif f != 0:
            raise ValueError(f'unknown filter {f}')
        for x in range(w):
            o = x * ch
            if ch == 3:
                px[y][x] = (line[o], line[o + 1], line[o + 2], 255)
            else:
                px[y][x] = (line[o], line[o + 1], line[o + 2], line[o + 3])
        prev = line
    return w, h, px


def write(path, w, h, px):
    """px[y][x] = (r,g,b[,a]). Writes 8-bit RGBA."""
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            p = px[y][x]
            raw += bytes((p[0] & 255, p[1] & 255, p[2] & 255, (p[3] if len(p) > 3 else 255) & 255))

    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)

    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(bytes(raw)))
           + chunk(b'IEND', b''))
    open(path, 'wb').write(png)
    return len(png)


def header(path):
    """Lightweight (w, h) without full decode."""
    data = open(path, 'rb').read(33)
    assert data[:8] == b'\x89PNG\r\n\x1a\n', 'not a PNG'
    w, h, depth, ctype, _, _, _ = struct.unpack('>IIBBBBB', data[16:29])
    return w, h, depth, ctype
