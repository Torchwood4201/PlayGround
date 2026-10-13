"""Stage 4 — Retopo cage by construction: subdivide block toward budget, apply the
SAME analytic displacement as Stage 2 (exact, no projection error), weld, drop
degenerates. Usage: python3 pipeline/stages/s4_retopo.py [asset_id ...]
Reads block.obj; writes low.obj (no UVs yet) + low.json {tris, budget}.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from mesh import Mesh
from heightfield import GENERATORS
from s3_automation import GEN_FOR
from s2_highpoly import AMP, sampler
from pipeutil import load_catalog, out_dir, log_stage
import json


def main(which):
    cat = load_catalog()
    ids = which or [a['id'] for a in cat['assets']]
    for aid in ids:
        asset = next(a for a in cat['assets'] if a['id'] == aid)
        d = out_dir(aid)
        m = Mesh.read_obj(os.path.join(d, 'block.obj'))
        budget = asset['triBudget']
        while m.tri_count() * 4 <= budget:
            m.subdivide()
        gen_name = GEN_FOR[aid]
        amp = AMP[asset['category']]
        if amp > 0:
            fn = sampler(gen_name, asset['seed'])
            m.box_uv(scale=1.0)
            normals = m.vertex_normals()
            nv = []
            for i, v in enumerate(m.verts):
                u, vv = m.uvs[i]
                hh = fn(u % 1.0, vv % 1.0)
                n = normals[i]
                nv.append((v[0] + n[0] * hh * amp, v[1] + n[1] * hh * amp, v[2] + n[2] * hh * amp))
            m.verts = nv
        m.weld()
        m.write_obj(os.path.join(d, 'low.obj'))
        info = {'tris': m.tri_count(), 'budget': budget}
        with open(os.path.join(d, 'low.json'), 'w') as f:
            json.dump(info, f, indent=1)
        log_stage(aid, 's4_retopo', info)
        print(f'{aid}: low {m.tri_count()}/{budget} tris')


if __name__ == '__main__':
    main(sys.argv[1:])
