"""Stdlib mesh toolkit: parametric primitives, subdivision, displacement,
weld, analytic UVs, OBJ I/O, glTF 2.0 JSON builder. Y-up, meters, tris only."""
import json
import math


def _sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def _add(a, b):
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def _mul(a, s):
    return (a[0] * s, a[1] * s, a[2] * s)


def _dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def _cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def _norm(a):
    l = math.sqrt(_dot(a, a)) or 1.0
    return (a[0] / l, a[1] / l, a[2] / l)


class Mesh:
    def __init__(self):
        self.verts = []   # [(x,y,z)]
        self.tris = []    # [(i,j,k)]
        self.uvs = []     # [(u,v)] parallel to verts (may be [] until assigned)
        self.groups = []  # [(name, tri_start, tri_end)] part ranges for per-part UV/material

    def add_vert(self, v):
        self.verts.append((float(v[0]), float(v[1]), float(v[2])))
        return len(self.verts) - 1

    def add_tri(self, a, b, c):
        self.tris.append((a, b, c))

    def tri_count(self):
        return len(self.tris)

    # ---- primitives (each records a named group) ----
    def _box_group(self, name, cx, cy, cz, sx, sy, sz):
        t0 = len(self.tris)
        x0, x1 = cx - sx / 2, cx + sx / 2
        y0, y1 = cy - sy / 2, cy + sy / 2
        z0, z1 = cz - sz / 2, cz + sz / 2
        v = [self.add_vert(p) for p in [
            (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
            (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]]
        for a, b, c, d in [(0, 1, 2, 3), (5, 4, 7, 6), (4, 0, 3, 7),
                            (1, 5, 6, 2), (4, 5, 1, 0), (3, 2, 6, 7)]:
            self.add_tri(v[a], v[b], v[c])
            self.add_tri(v[a], v[c], v[d])
        self.groups.append((name, t0, len(self.tris)))

    def box(self, name, cx, cy, cz, sx, sy, sz):
        self._box_group(name, cx, cy, cz, sx, sy, sz)
        return self

    def cylinder(self, name, cx, cy, cz, r, h, seg=12):
        t0 = len(self.tris)
        y0, y1 = cy - h / 2, cy + h / 2
        ring0 = [self.add_vert((cx + r * math.cos(i / seg * 2 * math.pi), y0, cz + r * math.sin(i / seg * 2 * math.pi))) for i in range(seg)]
        ring1 = [self.add_vert((cx + r * math.cos(i / seg * 2 * math.pi), y1, cz + r * math.sin(i / seg * 2 * math.pi))) for i in range(seg)]
        cb, ct = self.add_vert((cx, y0, cz)), self.add_vert((cx, y1, cz))
        for i in range(seg):
            j = (i + 1) % seg
            self.add_tri(ring0[i], ring0[j], ring1[j])
            self.add_tri(ring0[i], ring1[j], ring1[i])
            self.add_tri(cb, ring0[j], ring0[i])
            self.add_tri(ct, ring1[i], ring1[j])
        self.groups.append((name, t0, len(self.tris)))
        return self

    def plane(self, name, cx, cy, cz, sx, sz, facing='+y'):
        t0 = len(self.tris)
        x0, x1 = cx - sx / 2, cx + sx / 2
        z0, z1 = cz - sz / 2, cz + sz / 2
        a = self.add_vert((x0, cy, z0))
        b = self.add_vert((x1, cy, z0))
        c = self.add_vert((x1, cy, z1))
        d = self.add_vert((x0, cy, z1))
        if facing == '+y':
            self.add_tri(a, b, c)
            self.add_tri(a, c, d)
        else:
            self.add_tri(a, c, b)
            self.add_tri(a, d, c)
        self.groups.append((name, t0, len(self.tris)))
        return self

    def capsule(self, name, cx, cy, cz, r, h, seg=10, rings=4):
        """Y-axis capsule: cylinder + hemisphere stacks. Origin at center."""
        t0 = len(self.tris)
        # profile from bottom pole to top pole
        prof = []
        prof.append((cy - h / 2 - r, 0.0))
        for i in range(1, rings + 1):
            a = -math.pi / 2 + (i / rings) * (math.pi / 2)
            prof.append((cy - h / 2 + r * math.sin(a), r * math.cos(a)))
        for i in range(1, rings + 1):
            a = (i / rings) * (math.pi / 2)
            prof.append((cy + h / 2 + r * math.sin(a), r * math.cos(a)))
        prof.append((cy + h / 2 + r, 0.0))
        rings_v = []
        for (py, pr) in prof:
            rr = max(pr, 0.0)
            rings_v.append([self.add_vert((cx + rr * math.cos(i / seg * 2 * math.pi), py, cz + rr * math.sin(i / seg * 2 * math.pi))) for i in range(seg)])
        # bottom pole fan
        for i in range(seg):
            self.add_tri(rings_v[0][0], rings_v[1][(i + 1) % seg], rings_v[1][i])
        for ri in range(1, len(rings_v) - 2):
            for i in range(seg):
                j = (i + 1) % seg
                self.add_tri(rings_v[ri][i], rings_v[ri][j], rings_v[ri + 1][j])
                self.add_tri(rings_v[ri][i], rings_v[ri + 1][j], rings_v[ri + 1][i])
        top = len(rings_v) - 1
        for i in range(seg):
            self.add_tri(rings_v[top][0], rings_v[top - 1][i], rings_v[top - 1][(i + 1) % seg])
        self.groups.append((name, t0, len(self.tris)))
        return self

    # ---- topology ops ----
    def vertex_normals(self):
        acc = [[0.0, 0.0, 0.0] for _ in self.verts]
        for a, b, c in self.tris:
            n = _cross(_sub(self.verts[b], self.verts[a]), _sub(self.verts[c], self.verts[a]))
            for i in (a, b, c):
                acc[i][0] += n[0]
                acc[i][1] += n[1]
                acc[i][2] += n[2]
        return [_norm(tuple(v)) for v in acc]

    def subdivide(self, smooth=True):
        """Midpoint subdivision: each tri -> 4. Optional neighbor-average smoothing."""
        mid = {}

        def midpoint(i, j):
            key = (i, j) if i < j else (j, i)
            if key not in mid:
                a, b = self.verts[i], self.verts[j]
                mid[key] = self.add_vert(((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2))
            return mid[key]

        old = list(self.tris)
        new_tris = []
        for a, b, c in old:
            ab, bc, ca = midpoint(a, b), midpoint(b, c), midpoint(c, a)
            new_tris += [(a, ab, ca), (ab, b, bc), (ca, bc, c), (ab, bc, ca)]
        self.tris = new_tris
        if smooth:
            adj = {}
            for a, b, c in self.tris:
                for i, j in ((a, b), (b, c), (c, a)):
                    adj.setdefault(i, set()).add(j)
                    adj.setdefault(j, set()).add(i)
            nv = []
            for i, v in enumerate(self.verts):
                nb = adj.get(i, set())
                if not nb:
                    nv.append(v)
                    continue
                ax = sum(self.verts[j][0] for j in nb) / len(nb)
                ay = sum(self.verts[j][1] for j in nb) / len(nb)
                az = sum(self.verts[j][2] for j in nb) / len(nb)
                nv.append(((v[0] + ax) / 2, (v[1] + ay) / 2, (v[2] + az) / 2))
            self.verts = nv
        # groups span everything now (single merged range per original order kept simple)
        self.groups = [(n, 0, len(self.tris)) for n, _, _ in self.groups] or self.groups
        return self

    def displace(self, fn):
        """fn(u_hint, v_hint, normal) -> height. Uses current UVs if present else planar XZ."""
        normals = self.vertex_normals()
        if not self.uvs or len(self.uvs) != len(self.verts):
            self.planar_uv(scale=1.0)
        nv = []
        for i, v in enumerate(self.verts):
            u, vv = self.uvs[i]
            h = fn(u % 1.0, vv % 1.0)
            n = normals[i]
            nv.append((v[0] + n[0] * h, v[1] + n[1] * h, v[2] + n[2] * h))
        self.verts = nv
        return self

    def weld(self, tol=1e-4):
        """Quantize-merge duplicate verts; drop degenerate tris."""
        key_of = {}
        remap = []
        new_verts = []
        q = lambda x: round(x / tol)
        for v in self.verts:
            k = (q(v[0]), q(v[1]), q(v[2]))
            if k in key_of:
                remap.append(key_of[k])
            else:
                key_of[k] = len(new_verts)
                remap.append(len(new_verts))
                new_verts.append(v)
        new_tris = []
        for a, b, c in self.tris:
            na, nb, nc = remap[a], remap[b], remap[c]
            if na == nb or nb == nc or nc == na:
                continue
            # drop zero-area
            n = _cross(_sub(new_verts[nb], new_verts[na]), _sub(new_verts[nc], new_verts[na]))
            if _dot(n, n) < 1e-12:
                continue
            new_tris.append((na, nb, nc))
        self.verts, self.tris = new_verts, new_tris
        if self.uvs:
            # keep first uv per surviving vert
            seen = {}
            new_uvs = []
            for old_i, new_i in enumerate(remap):
                if new_i not in seen and old_i < len(self.uvs):
                    seen[new_i] = self.uvs[old_i]
            self.uvs = [seen.get(i, (0.0, 0.0)) for i in range(len(new_verts))]
        return self

    # ---- analytic UVs ----
    def planar_uv(self, scale=1.0):
        self.uvs = [((v[0] * scale) % 1.0, (v[2] * scale) % 1.0) for v in self.verts]
        return self

    def box_uv(self, scale=1.0):
        normals = self.vertex_normals()
        uvs = []
        for v, n in zip(self.verts, normals):
            ax = abs(n[0])
            ay = abs(n[1])
            az = abs(n[2])
            if ax >= ay and ax >= az:
                uvs.append(((v[2] * scale) % 1.0, (v[1] * scale) % 1.0))
            elif ay >= ax and ay >= az:
                uvs.append(((v[0] * scale) % 1.0, (v[2] * scale) % 1.0))
            else:
                uvs.append(((v[0] * scale) % 1.0, (v[1] * scale) % 1.0))
        self.uvs = uvs
        return self

    def cylindrical_uv(self, cy=0.0, h=1.0, scale=1.0):
        uvs = []
        for v in self.verts:
            u = (math.atan2(v[2], v[0]) / (2 * math.pi) + 0.5) % 1.0
            uvs.append((u, min(1.0, max(0.0, (v[1] - (cy - h / 2)) / h)) * scale % 1.0))
        self.uvs = uvs
        return self

    def uv_stats(self):
        if not self.uvs:
            return {'assigned': False}
        bad = sum(1 for u, v in self.uvs if not (0.0 <= u <= 1.0 and 0.0 <= v <= 1.0)
                  or u != u or v != v)
        # coverage on 32x32 grid
        grid = [[False] * 32 for _ in range(32)]
        for u, v in self.uvs:
            if 0.0 <= u <= 1.0 and 0.0 <= v <= 1.0:
                grid[min(31, int(v * 32))][min(31, int(u * 32))] = True
        cov = sum(sum(1 for c in row if c) for row in grid) / 1024
        return {'assigned': True, 'count': len(self.uvs), 'outOfRange': bad, 'coverage': round(cov, 3)}

    # ---- I/O ----
    def write_obj(self, path):
        with open(path, 'w') as f:
            f.write('# PlayGround pipeline\n')
            for v in self.verts:
                f.write(f'v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n')
            if self.uvs and len(self.uvs) == len(self.verts):
                for u, v in self.uvs:
                    f.write(f'vt {u:.6f} {v:.6f}\n')
                for a, b, c in self.tris:
                    f.write(f'f {a + 1}/{a + 1} {b + 1}/{b + 1} {c + 1}/{c + 1}\n')
            else:
                for a, b, c in self.tris:
                    f.write(f'f {a + 1} {b + 1} {c + 1}\n')

    @staticmethod
    def read_obj(path):
        m = Mesh()
        uv_acc = []
        for line in open(path):
            p = line.split()
            if not p:
                continue
            if p[0] == 'v':
                m.verts.append((float(p[1]), float(p[2]), float(p[3])))
            elif p[0] == 'vt':
                uv_acc.append((float(p[1]), float(p[2])))
            elif p[0] == 'f':
                idx = [int(s.split('/')[0]) - 1 for s in p[1:4]]
                m.tris.append(tuple(idx))
                if p[1].count('/') >= 1 and uv_acc:
                    while len(m.uvs) < len(m.verts):
                        m.uvs.append((0.0, 0.0))
        if uv_acc and len(uv_acc) == len(m.verts):
            m.uvs = uv_acc
        return m

    def bounds(self):
        xs = [v[0] for v in self.verts]
        ys = [v[1] for v in self.verts]
        zs = [v[2] for v in self.verts]
        return ((min(xs), min(ys), min(zs)), (max(xs), max(ys), max(zs)))


def build_gltf(mesh, material_defs, image_uris):
    """Minimal glTF 2.0 dict: one mesh, per-group primitives sharing accessors.

    material_defs: [{name, baseColor, roughness, metallic, albedoUri, normalUri,
                      ormUri, emissive}] — images referenced by URI (packed later
    into .glb bufferViews by gltf_assemble.mjs).
    """
    import struct as _st
    pos = []
    for v in mesh.verts:
        pos += [v[0], v[1], v[2]]
    normals = mesh.vertex_normals()
    nrm = []
    for n in normals:
        nrm += [n[0], n[1], n[2]]
    uv = []
    for u, v in (mesh.uvs or [(0.0, 0.0)] * len(mesh.verts)):
        uv += [u, 1.0 - v]
    # per-group index ranges (groups recorded at blockout time)
    prims = []
    for gi, (name, t0, t1) in enumerate(mesh.groups or [('default', 0, len(mesh.tris))]):
        idx = []
        for t in mesh.tris[t0:t1]:
            idx += list(t)
        prims.append((name, idx, gi % max(1, len(material_defs))))
    # single binary blob: positions, normals, uvs, then per-prim indices
    blob = bytearray()
    blob += _st.pack(f'<{len(pos)}f', *pos)
    while len(blob) % 4:
        blob.append(0)
    blob += _st.pack(f'<{len(nrm)}f', *nrm)
    while len(blob) % 4:
        blob.append(0)
    blob += _st.pack(f'<{len(uv)}f', *uv)
    while len(blob) % 4:
        blob.append(0)
    index_meta = []
    for name, idx, mi in prims:
        while len(blob) % 4:
            blob.append(0)
        off = len(blob)
        n = len(mesh.verts)
        if n < 65536:
            blob += _st.pack(f'<{len(idx)}H', *idx)
            ctype = 5123
        else:
            blob += _st.pack(f'<{len(idx)}I', *idx)
            ctype = 5125
        index_meta.append((name, off, len(idx), ctype, mi))
    accessors = [
        {'bufferView': 0, 'componentType': 5126, 'count': len(mesh.verts), 'type': 'VEC3',
         'max': list(mesh.bounds()[1]), 'min': list(mesh.bounds()[0])},
        {'bufferView': 1, 'componentType': 5126, 'count': len(mesh.verts), 'type': 'VEC3'},
        {'bufferView': 2, 'componentType': 5126, 'count': len(mesh.verts), 'type': 'VEC2'},
    ]
    # exact view lengths
    pos_len = len(pos) * 4
    nrm_len = len(nrm) * 4
    uv_len = len(uv) * 4
    buffer_views = [
        {'buffer': 0, 'byteOffset': 0, 'byteLength': pos_len, 'target': 34962},
        {'buffer': 0, 'byteOffset': pos_len, 'byteLength': nrm_len, 'target': 34962},
        {'buffer': 0, 'byteOffset': pos_len + nrm_len, 'byteLength': uv_len, 'target': 34962},
    ]
    bv_base = 3
    for k, (name, off, count, ctype, mi) in enumerate(index_meta):
        accessors.append({'bufferView': bv_base + k, 'componentType': ctype, 'count': count, 'type': 'SCALAR'})
        buffer_views.append({'buffer': 0, 'byteOffset': off, 'byteLength': len(blob) - off if k == len(index_meta) - 1 else None, 'target': 34963})
    # fix byteLengths precisely
    for k in range(len(index_meta)):
        start = index_meta[k][1]
        end = index_meta[k + 1][1] if k + 1 < len(index_meta) else len(blob)
        buffer_views[bv_base + k]['byteLength'] = end - start
    images = [{'uri': u} for u in image_uris]
    textures = [{'source': i} for i in range(len(images))]
    materials = []
    for mi, md in enumerate(material_defs):
        mat = {'name': md.get('name', f'mat{mi}'), 'pbrMetallicRoughness': {
            'baseColorFactor': md.get('baseColor', [1, 1, 1, 1]),
            'metallicFactor': md.get('metallic', 0.0),
            'roughnessFactor': md.get('roughness', 0.9)}}
        ti = 0
        if md.get('albedoUri') is not None:
            mat['pbrMetallicRoughness']['baseColorTexture'] = {'index': image_uris.index(md['albedoUri'])}
        if md.get('normalUri') is not None:
            mat['normalTexture'] = {'index': image_uris.index(md['normalUri'])}
        if md.get('ormUri') is not None:
            # three: R=AO? three uses G=rough B=metal; R unused-ish. Keep packed; remap documented.
            mat['occlusionTexture'] = {'index': image_uris.index(md['ormUri'])}
            mat['pbrMetallicRoughness']['roughnessTexture'] = {'index': image_uris.index(md['ormUri'])}
            mat['pbrMetallicRoughness']['metallicTexture'] = {'index': image_uris.index(md['ormUri'])}
        if md.get('emissive'):
            mat['emissiveFactor'] = md.get('emissive')
        materials.append(mat)
    primitives = [{'attributes': {'POSITION': 0, 'NORMAL': 1, 'TEXCOORD_0': 2},
                   'indices': bv_base + k, 'material': mi} for k, (_, _, _, _, mi) in enumerate(index_meta)]
    gltf = {'asset': {'version': '2.0', 'generator': 'PlayGround pipeline'},
            'buffers': [{'byteLength': len(blob)}],
            'bufferViews': buffer_views, 'accessors': accessors,
            'images': images, 'textures': textures, 'materials': materials,
            'meshes': [{'primitives': primitives}], 'nodes': [{'mesh': 0}], 'scenes': [{'nodes': [0]}], 'scene': 0}
    return gltf, bytes(blob)


def write_glb(path, gltf, blob, image_files):
    """Pack glTF JSON + blob + PNG files into binary .glb. image_files: list of paths
    matching the images[] uri order; appended as bufferViews with mimeType."""
    import struct as _st
    images = gltf.get('images', [])
    assert len(images) == len(image_files), 'image count mismatch'
    full_blob = bytearray(blob)
    for i, (img, fp) in enumerate(zip(images, image_files)):
        while len(full_blob) % 4:
            full_blob.append(0)
        data = open(fp, 'rb').read()
        off = len(full_blob)
        full_blob += data
        while len(full_blob) % 4:
            full_blob.append(0)
        bv_idx = len(gltf['bufferViews'])
        gltf['bufferViews'].append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data)})
        img.pop('uri', None)
        img['bufferView'] = bv_idx
        img['mimeType'] = 'image/png'
    gltf['buffers'][0]['byteLength'] = len(full_blob)
    js = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    while len(js) % 4:
        js += b' '
    total = 12 + 8 + len(js) + 8 + len(full_blob)
    out = bytearray()
    out += _st.pack('<III', 0x46546C67, 2, total)
    out += _st.pack('<II', len(js), 0x4E4F534A)
    out += js
    out += _st.pack('<II', len(full_blob), 0x004E4942)
    out += full_blob
    open(path, 'wb').write(out)
    return len(out)
