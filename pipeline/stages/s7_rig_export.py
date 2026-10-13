"""Stage 7 — Rig + export .glb (pure Python, deterministic headless).
Usage: python3 pipeline/stages/s7_rig_export.py [asset_id ...]
Reads low.obj (+uv) + dist tex PNGs; writes pipeline/dist/glb/<id>_low.glb.
Statics: skinless. Enemies: 12-14 bone skeleton (catalog names), rigid
nearest-joint weights, coded clips (walk/hurt/dead[/attack]).
NOTE: plan named this s7_rig_export.mjs (GLTFExporter path); pure-Python chosen
because it is deterministic without a browser roundtrip. Vendored GLTFExporter
remains for preview/roundtrip checks. glTF output is standard 2.0.
"""
import sys
import os
import math
import struct
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from mesh import Mesh, build_gltf, write_glb
from pipeutil import load_catalog, out_dir, dist_dirs, log_stage
import json

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DIST_GLB = os.path.join(ROOT, 'pipeline', 'dist', 'glb')
DIST_TEX = os.path.join(ROOT, 'pipeline', 'dist', 'tex')


def quat(axis, ang):
    x, y, z = axis
    s = math.sin(ang / 2)
    return (x * s, y * s, z * s, math.cos(ang / 2))


def quat_mul(a, b):
    ax, ay, az, aw = a
    bx, by, bz, bw = b
    return (aw * bx + ax * bw + ay * bz - az * by,
            aw * by - ax * bz + ay * bw + az * bx,
            aw * bz + ax * by - ay * bx + az * bw,
            aw * bw - ax * bx - ay * by - az * bz)


IDENT_Q = (0.0, 0.0, 0.0, 1.0)


def skeleton(asset):
    """Return (bones, parents, local_pos, world_pos). Y-up, feet origin."""
    h = asset['rig']['height']
    s = h / 1.1
    P = {
        'Hips': (0, 0.55 * s, 0),
        'Spine': (0, 0.75 * s, 0),
        'Head': (0, 0.95 * s, 0),
        'Jaw': (0, 0.90 * s, 0.08 * s),
        'LeftShoulderPad': (-0.34 * s, 0.82 * s, 0),
        'RightShoulderPad': (0.34 * s, 0.82 * s, 0),
        'LeftUpperArm': (-0.28 * s, 0.80 * s, 0),
        'LeftForeArm': (-0.28 * s, 0.60 * s, 0),
        'RightUpperArm': (0.28 * s, 0.80 * s, 0),
        'RightForeArm': (0.28 * s, 0.60 * s, 0),
        'LeftThigh': (-0.12 * s, 0.50 * s, 0),
        'LeftShin': (-0.12 * s, 0.25 * s, 0),
        'RightThigh': (0.12 * s, 0.50 * s, 0),
        'RightShin': (0.12 * s, 0.25 * s, 0),
    }
    PAR = {'Spine': 'Hips', 'Head': 'Spine', 'Jaw': 'Head',
           'LeftShoulderPad': 'Spine', 'RightShoulderPad': 'Spine',
           'LeftUpperArm': 'Spine', 'LeftForeArm': 'LeftUpperArm',
           'RightUpperArm': 'Spine', 'RightForeArm': 'RightUpperArm',
           'LeftThigh': 'Hips', 'LeftShin': 'LeftThigh',
           'RightThigh': 'Hips', 'RightShin': 'RightThigh'}
    bones = asset['rig']['bones']
    local, world = {}, {}
    for b in bones:
        parent = PAR.get(b)
        pw = world[parent] if parent else (0, 0, 0)
        bp = P[b]
        local[b] = (bp[0] - pw[0], bp[1] - pw[1], bp[2] - pw[2])
        world[b] = bp
    return bones, PAR, local, world


def assign_weights(mesh, bones, world):
    joints, weights = [], []
    for v in mesh.verts:
        best, bd = 0, 1e18
        for i, b in enumerate(bones):
            p = world[b]
            d = (v[0] - p[0]) ** 2 + (v[1] - p[1]) ** 2 + (v[2] - p[2]) ** 2
            if d < bd:
                bd, best = d, i
        joints.append((best, 0, 0, 0))
        weights.append((1.0, 0.0, 0.0, 0.0))
    return joints, weights


def clips_for(asset):
    aid = asset['id']
    clips = {}
    # walk 0.6s loop: limb swing + hip bob
    WT = [0.0, 0.3, 0.6]
    clips['walk'] = {'times': WT, 'loop': True, 'bones': {
        'LeftUpperArm': [quat((1, 0, 0), a) for a in (0.35, -0.35, 0.35)],
        'RightUpperArm': [quat((1, 0, 0), a) for a in (-0.35, 0.35, -0.35)],
        'LeftThigh': [quat((1, 0, 0), a) for a in (-0.35, 0.35, -0.35)],
        'RightThigh': [quat((1, 0, 0), a) for a in (0.35, -0.35, 0.35)],
        'Hips_pos': [(0, y, 0) for y in (0.0, -0.03, 0.0)],
    }}
    clips['hurt'] = {'times': [0.0, 0.15], 'loop': False, 'bones': {
        'Spine': [IDENT_Q, quat((1, 0, 0), -0.3)],
    }}
    clips['dead'] = {'times': [0.0, 0.22], 'loop': False, 'bones': {
        'Spine': [IDENT_Q, quat((1, 0, 0), 1.4)],
        'Hips_pos': [(0, 0, 0), (0, -0.4, 0)],
    }}
    if aid == 'enemy_baron':
        clips['attack'] = {'times': [0.0, 0.25, 0.5], 'loop': False, 'bones': {
            'RightUpperArm': [IDENT_Q, quat((1, 0, 0), -2.0), IDENT_Q],
            'Spine': [IDENT_Q, quat((1, 0, 0), 0.2), IDENT_Q],
        }}
    return clips


def build_skin_gltf(mesh, bones, par, local, world, joints, weights, mat_def, image_files, clips):
    gltf, blob = build_gltf(mesh, [mat_def], [os.path.basename(p) for p in image_files])
    blob = bytearray(blob)
    nverts = len(mesh.verts)

    def push(data_fmt, vals):
        nonlocal blob
        while len(blob) % 4:
            blob.append(0)
        off = len(blob)
        blob += struct.pack('<' + data_fmt, *vals)
        return off

    # JOINTS_0 (UBYTE VEC4) + WEIGHTS_0 (FLOAT VEC4)
    jflat = [c for j in joints for c in j]
    wflat = [c for w in weights for c in w]
    joff = push(f'{len(jflat)}B', jflat)
    woff = push(f'{len(wflat)}f', wflat)
    # inverse bind matrices (translation-only chains)
    ibm = []
    for b in bones:
        wx, wy, wz = world[b]
        ibm += [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -wx, -wy, -wz, 1]
    ioff = push(f'{len(ibm)}f', ibm)

    def add_view(off, length, target=None):
        gltf['bufferViews'].append({'buffer': 0, 'byteOffset': off, 'byteLength': length} | ({'target': target} if target else {}))
        return len(gltf['bufferViews']) - 1

    def add_acc(bv, ctype, count, typ):
        gltf['accessors'].append({'bufferView': bv, 'componentType': ctype, 'count': count, 'type': typ})
        return len(gltf['accessors']) - 1

    jbv = add_view(joff, len(jflat), 34962)
    wbv = add_view(woff, len(wflat) * 4, 34962)
    ibv = add_view(ioff, len(ibm) * 4)
    jacc = add_acc(jbv, 5121, nverts, 'VEC4')
    wacc = add_acc(wbv, 5126, nverts, 'VEC4')
    iacc = add_acc(ibv, 5126, len(bones), 'MAT4')
    for prim in gltf['meshes'][0]['primitives']:
        prim['attributes']['JOINTS_0'] = jacc
        prim['attributes']['WEIGHTS_0'] = wacc
    # joint nodes (after mesh node 0)
    jnode = {}
    for b in bones:
        parent = par.get(b)
        node = {'name': b, 'translation': list(local[b])}
        if parent:
            node.setdefault('children', [])
        gltf['nodes'].append(node)
        jnode[b] = len(gltf['nodes']) - 1
    for b in bones:
        parent = par.get(b)
        if parent:
            gltf['nodes'][jnode[parent]].setdefault('children', []).append(jnode[b])
        else:
            gltf['nodes'][0].setdefault('children', [])
    # attach roots to scene via mesh node children
    roots = [jnode[b] for b in bones if not par.get(b)]
    gltf['nodes'][0]['children'] = roots
    gltf['nodes'][0]['skin'] = 0
    gltf['skins'] = [{'joints': [jnode[b] for b in bones], 'inverseBindMatrices': iacc}]
    # animations
    gltf['animations'] = []
    for cname, clip in clips.items():
        times = clip['times']
        toff = push(f'{len(times)}f', times)
        tbv = add_view(toff, len(times) * 4)
        tacc = add_acc(tbv, 5126, len(times), 'SCALAR')
        samplers, channels = [], []
        for bname, keys in clip['bones'].items():
            is_pos = bname.endswith('_pos')
            bone = bname[:-4] if is_pos else bname
            if bone not in jnode:
                continue
            flat = [c for k in keys for c in k]
            comp = 3 if is_pos else 4
            ooff = push(f'{len(flat)}f', flat)
            obv = add_view(ooff, len(flat) * 4)
            oacc = add_acc(obv, 5126, len(times), 'VEC3' if is_pos else 'VEC4')
            samplers.append({'input': tacc, 'output': oacc, 'interpolation': 'LINEAR'})
            channels.append({'sampler': len(samplers) - 1,
                             'target': {'node': jnode[bone], 'path': 'translation' if is_pos else 'rotation'}})
        gltf['animations'].append({'name': cname, 'samplers': samplers, 'channels': channels})
    gltf['buffers'][0]['byteLength'] = len(blob)
    return gltf, bytes(blob)


def main(which):
    from pipeutil import load_catalog as _lc
    cat = _lc()
    dist_dirs()
    os.makedirs(DIST_GLB, exist_ok=True)
    ids = which or [a['id'] for a in cat['assets']]
    for aid in ids:
        asset = next(a for a in cat['assets'] if a['id'] == aid)
        d = out_dir(aid)
        mesh = Mesh.read_obj(os.path.join(d, 'low.obj'))
        if not mesh.uvs or len(mesh.uvs) != len(mesh.verts):
            mesh.planar_uv()
        imgs = []
        if asset['category'] == 'projectiles':
            imgs = [os.path.join(DIST_TEX, f'{aid}_albedo.png')]
            mat = {'name': aid, 'emissive': [1, 1, 1]}
        else:
            imgs = [os.path.join(DIST_TEX, f'{aid}_{k}.png') for k in ('albedo', 'normal', 'orm')]
            m = asset['material']
            mat = {'name': aid, 'roughness': m['roughness'], 'metallic': m['metalness'],
                   'albedoUri': f'{aid}_albedo.png', 'normalUri': f'{aid}_normal.png', 'ormUri': f'{aid}_orm.png'}
        for p in imgs:
            assert os.path.exists(p), f'{aid}: missing baked {p} (run s6 first)'
        if asset.get('rig'):
            bones, par, local, world = skeleton(asset)
            joints, weights = assign_weights(mesh, bones, world)
            gltf, blob = build_skin_gltf(mesh, bones, par, local, world, joints, weights, mat, imgs, clips_for(asset))
        else:
            gltf, blob = build_gltf(mesh, [mat], [os.path.basename(p) for p in imgs])
            blob = bytes(blob)
        size = write_glb(os.path.join(DIST_GLB, f'{aid}_low.glb'), gltf, blob, imgs)
        info = {'tris': mesh.tri_count(), 'bytes': size, 'rigged': bool(asset.get('rig'))}
        with open(os.path.join(d, 'export.json'), 'w') as f:
            json.dump(info, f, indent=1)
        log_stage(aid, 's7_rig_export', info)
        print(f'{aid}: {aid}_low.glb {mesh.tri_count()} tris {size} bytes')


if __name__ == '__main__':
    main(sys.argv[1:])
