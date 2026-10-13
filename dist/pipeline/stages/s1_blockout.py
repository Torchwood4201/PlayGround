"""Stage 1 — Blockout: parametric primitives to game metrics. 1u=1m, Y-up.
Usage: python3 pipeline/stages/s1_blockout.py [asset_id ...]  (default: all)
Writes pipeline/out/<id>/block.obj + block.json.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from mesh import Mesh
from pipeutil import load_catalog, out_dir, log_stage
import json

WALL_H = 2.4


def build(asset):
    aid, cat = asset['id'], asset['category']
    m = Mesh()
    if cat in ('walls',):
        m.box('tile', 0, WALL_H / 2, 0, 1, WALL_H, 1)
    elif cat == 'surfaces':
        m.plane('tile', 0, 0, 0, 1, 1, '+y')
    elif cat == 'guns':
        key = aid.split('_')[1]
        # stylized gun from boxes/cylinders, ~0.9m long, origin at grip
        m.box('receiver', 0, 0.02, 0, 0.34, 0.09, 0.06)
        m.cylinder('barrel', 0, 0.05, 0.26, 0.022, 0.30, 8)
        m.box('grip', 0, -0.07, -0.10, 0.05, 0.12, 0.05)
        m.box('mag', 0, -0.07, 0.05, 0.05, 0.12, 0.06)
        if key in ('pump', 'rifle', 'sniper'):
            m.box('stock', 0, 0.0, -0.30, 0.07, 0.10, 0.24)
            m.cylinder('pump', 0, 0.0, 0.22, 0.032, 0.16, 8)
        if key in ('rifle', 'smg', 'sniper'):
            m.box('sight', 0, 0.09, -0.02, 0.03, 0.05, 0.04)
        if key == 'sniper':
            m.cylinder('scope', 0, 0.11, -0.02, 0.028, 0.22, 8)
    elif cat == 'enemies':
        h = asset['rig']['height']
        sc = h / 1.1
        # origin at feet; torso capsule, head box, limb capsules
        m.capsule('torso', 0, 0.62 * sc, 0, 0.20 * sc, 0.35 * sc, 10, 3)
        m.box('head', 0, 0.95 * sc, 0, 0.24 * sc, 0.22 * sc, 0.24 * sc)
        for s in (-1, 1):
            m.capsule('arm', s * 0.28 * sc, 0.62 * sc, 0, 0.06 * sc, 0.30 * sc, 8, 2)
            m.capsule('leg', s * 0.12 * sc, 0.28 * sc, 0, 0.08 * sc, 0.30 * sc, 8, 2)
        if aid == 'enemy_baron':
            for s in (-1, 1):
                m.box('pad', s * 0.34 * sc, 0.82 * sc, 0, 0.12 * sc, 0.10 * sc, 0.16 * sc)
    elif cat == 'props':
        if aid == 'prop_barrel':
            m.cylinder('body', 0, 0.35, 0, 0.28, 0.7, 12)
        elif aid == 'prop_medkit':
            m.box('case', 0, 0.15, 0, 0.4, 0.3, 0.4)
            m.box('crossA', 0, 0.15, 0.205, 0.2, 0.08, 0.01)
            m.box('crossB', 0, 0.15, 0.205, 0.08, 0.2, 0.01)
        elif aid == 'prop_shells':
            m.box('box', 0, 0.15, 0, 0.4, 0.3, 0.4)
            for i in range(4):
                m.cylinder(f'shell{i}', -0.12 + i * 0.08, 0.33, 0, 0.02, 0.08, 6)
    elif cat == 'projectiles':
        if aid == 'proj_tracer':
            m.box('bolt', 0, 0, 0, 0.3, 0.03, 0.03)
        elif aid == 'proj_fireball':
            m.capsule('ball', 0, 0, 0, 0.09, 0.02, 8, 2)
        elif aid == 'proj_flash':
            m.plane('flash', 0, 0, 0, 0.5, 0.5, '+y')
    else:
        raise ValueError('unknown category ' + cat)
    return m


def main(which):
    cat = load_catalog()
    ids = which or [a['id'] for a in cat['assets']]
    for aid in ids:
        asset = next(a for a in cat['assets'] if a['id'] == aid)
        m = build(asset)
        d = out_dir(aid)
        m.write_obj(os.path.join(d, 'block.obj'))
        info = {'tris': m.tri_count(), 'bounds': m.bounds(), 'groups': [g[0] for g in m.groups]}
        with open(os.path.join(d, 'block.json'), 'w') as f:
            json.dump(info, f, indent=1)
        log_stage(aid, 's1_blockout', info)
        print(f'{aid}: block {m.tri_count()} tris')


if __name__ == '__main__':
    main(sys.argv[1:])
