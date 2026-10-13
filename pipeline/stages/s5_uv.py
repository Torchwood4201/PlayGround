"""Stage 5 — Analytic UVs (no unwrapper). Usage: python3 pipeline/stages/s5_uv.py [...]
Reads low.obj (drops incoming uvs); writes low.obj with uvs + uv.json stats.
Rules: walls/surfaces planar 0-1 per tile (tiling via material repeat, exempt
from coverage); guns/props per-part box-project atlas rows; enemies cylindrical
wrap; projectiles planar. Validates 0-1 range, no NaN.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from mesh import Mesh
from pipeutil import load_catalog, out_dir, log_stage
import json


def main(which):
    cat = load_catalog()
    ids = which or [a['id'] for a in cat['assets']]
    for aid in ids:
        asset = next(a for a in cat['assets'] if a['id'] == aid)
        d = out_dir(aid)
        m = Mesh.read_obj(os.path.join(d, 'low.obj'))
        m.uvs = []
        kind = asset['category']
        if kind in ('walls', 'surfaces', 'projectiles'):
            m.planar_uv(scale=1.0)
        elif kind == 'enemies':
            h = asset['rig']['height']
            m.cylindrical_uv(cy=h / 2, h=h, scale=1.0)
        else:
            m.box_uv(scale=1.0)
        stats = m.uv_stats()
        assert stats['outOfRange'] == 0, f'{aid}: UVs out of range'
        assert not any(u != u or v != v for u, v in m.uvs), f'{aid}: NaN UV'
        m.write_obj(os.path.join(d, 'low.obj'))
        info = {'stats': stats, 'texelPxPerM': asset['texPx'], 'tiling': bool(asset.get('tileable'))}
        with open(os.path.join(d, 'uv.json'), 'w') as f:
            json.dump(info, f, indent=1)
        log_stage(aid, 's5_uv', info)
        print(f'{aid}: uv coverage {stats["coverage"]} outOfRange 0')


if __name__ == '__main__':
    main(sys.argv[1:])
