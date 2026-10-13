"""Stage 3 — Procedural automation: seeded heightfields cached as height.png.
Usage: python3 pipeline/stages/s3_automation.py [asset_id ...]
Writes pipeline/out/<id>/height.png (8-bit) + height.json {generator, size, seed}.
Tileable lattice for walls/surfaces; clamped for the rest.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from heightfield import GENERATORS, fbm, muscle
from png import write
from pipeutil import load_catalog, out_dir, log_stage
import json

# asset -> generator (size comes from catalog texPx so s3/s6 always agree)
GEN_FOR = {}
for w in ('brick', 'concrete', 'metal', 'wood', 'rock', 'plaster'):
    GEN_FOR['wall_' + w] = w
GEN_FOR['surf_floor'] = 'rock'
GEN_FOR['surf_ceiling'] = 'concrete'
for g in ('pistol', 'pump', 'rifle', 'smg', 'sniper'):
    GEN_FOR['gun_' + g] = 'knurl'
for e in ('imp', 'demon', 'baron'):
    GEN_FOR['enemy_' + e] = 'muscle'
GEN_FOR['prop_shells'] = 'knurl'
GEN_FOR['prop_medkit'] = 'concrete'
GEN_FOR['prop_barrel'] = 'metal'
for p in ('tracer', 'fireball', 'flash'):
    GEN_FOR['proj_' + p] = 'concrete'


def main(which):
    cat = load_catalog()
    ids = which or [a['id'] for a in cat['assets']]
    for aid in ids:
        asset = next(a for a in cat['assets'] if a['id'] == aid)
        gen_name = GEN_FOR[aid]
        size = asset['texPx']
        tile = bool(asset.get('tileable'))
        h = GENERATORS[gen_name](size, asset['seed']) if gen_name in GENERATORS else fbm(size, 4, asset['seed'], tile)
        px = [[(int(v * 255),) * 3 for v in row] for row in h]
        d = out_dir(aid)
        write(os.path.join(d, 'height.png'), size, size, [[(p[0], p[0], p[0], 255) for p in row] for row in px])
        info = {'generator': gen_name, 'size': size, 'seed': asset['seed'], 'tileable': tile}
        with open(os.path.join(d, 'height.json'), 'w') as f:
            json.dump(info, f, indent=1)
        log_stage(aid, 's3_automation', info)
        print(f'{aid}: height {gen_name} {size}px')


if __name__ == '__main__':
    main(sys.argv[1:])
