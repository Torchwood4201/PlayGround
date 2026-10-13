"""Stage 2 — High-poly detail by construction: subdivide + analytic displacement.
Usage: python3 pipeline/stages/s2_highpoly.py [asset_id ...]
Reads block.obj (+height params); writes high.obj (capped ~60k tris, never shipped).
Displacement amp per category (meters): walls 0.02, surfaces 0.015, guns 0.004,
enemies 0.03, props 0.008, projectiles 0.0 (skip subdivide: keep block).
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from mesh import Mesh
from heightfield import GENERATORS, fbm
from s3_automation import GEN_FOR
from pipeutil import load_catalog, out_dir, log_stage
import json

AMP = {'walls': 0.02, 'surfaces': 0.015, 'guns': 0.004, 'enemies': 0.03,
       'props': 0.008, 'projectiles': 0.0}
SUBDIV = {'walls': 2, 'surfaces': 1, 'guns': 1, 'enemies': 2, 'props': 1, 'projectiles': 0}
CAP = 60000


def sampler(gen_name, seed, size=128):
    h = GENERATORS[gen_name](size, seed)
    s = len(h)
    def fn(u, v):
        return h[int(v * s) % s][int(u * s) % s]
    return fn


def main(which):
    cat = load_catalog()
    ids = which or [a['id'] for a in cat['assets']]
    for aid in ids:
        asset = next(a for a in cat['assets'] if a['id'] == aid)
        d = out_dir(aid)
        m = Mesh.read_obj(os.path.join(d, 'block.obj'))
        for _ in range(SUBDIV[asset['category']]):
            if m.tri_count() * 4 > CAP:
                break
            m.subdivide()
        amp = AMP[asset['category']]
        gen_name = GEN_FOR[aid]
        if amp > 0:
            fn = sampler(gen_name, asset['seed'])
            # planar XZ hint works for walls/floors; parts use box-projected uvs below
            m.box_uv(scale=1.0)
            normals = m.vertex_normals()
            nv = []
            for i, v in enumerate(m.verts):
                u, vv = m.uvs[i]
                hh = fn(u % 1.0, vv % 1.0)
                n = normals[i]
                nv.append((v[0] + n[0] * hh * amp, v[1] + n[1] * hh * amp, v[2] + n[2] * hh * amp))
            m.verts = nv
        m.write_obj(os.path.join(d, 'high.obj'))
        info = {'tris': m.tri_count(), 'amp': amp}
        with open(os.path.join(d, 'high.json'), 'w') as f:
            json.dump(info, f, indent=1)
        log_stage(aid, 's2_highpoly', info)
        print(f'{aid}: high {m.tri_count()} tris')


if __name__ == '__main__':
    main(sys.argv[1:])
