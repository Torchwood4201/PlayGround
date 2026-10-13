"""Stage 6 — Bake PBR maps CPU-only from height.png + material params.
Usage: python3 pipeline/stages/s6_bake.py [asset_id ...]
Writes pipeline/dist/tex/<id>_{albedo,normal,orm,mask}.png (+emissive-only set
for projectiles: <id>_albedo.png).
albedo sRGB; normal linear OpenGL+Y (Sobel); orm linear (R=AO,G=rough,B=metal);
mask pre-swizzled for URP MaskMap (R=metal,G=AO,B=128,A=smoothness).
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
from png import read as png_read, write as png_write
from heightfield import height_to_normal, cavity_ao
from pipeutil import load_catalog, out_dir, dist_dirs, log_stage
import json
import random

DIST_TEX = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'pipeline', 'dist', 'tex')

BASE = {
    'wall_brick': (148, 104, 82), 'wall_concrete': (140, 138, 132),
    'wall_metal': (110, 118, 128), 'wall_wood': (132, 96, 60),
    'wall_rock': (112, 104, 94), 'wall_plaster': (196, 190, 178),
    'surf_floor': (104, 98, 88), 'surf_ceiling': (150, 148, 142),
    'gun_pistol': (52, 54, 60), 'gun_pump': (70, 58, 48),
    'gun_rifle': (48, 50, 54), 'gun_smg': (52, 54, 58), 'gun_sniper': (44, 48, 52),
    'enemy_imp': (176, 122, 78), 'enemy_demon': (207, 192, 176),
    'enemy_baron': (150, 60, 50),
    'prop_shells': (60, 90, 50), 'prop_medkit': (220, 220, 220),
    'prop_barrel': (74, 110, 60),
    'proj_tracer': (255, 220, 150), 'proj_fireball': (255, 140, 40), 'proj_flash': (255, 240, 200),
}


def main(which):
    cat = load_catalog()
    dist_dirs()
    ids = which or [a['id'] for a in cat['assets']]
    for aid in ids:
        asset = next(a for a in cat['assets'] if a['id'] == aid)
        size = asset['texPx']
        d = out_dir(aid)
        _, _, hpx = png_read(os.path.join(d, 'height.png'))
        h = [[p[0] / 255 for p in row] for row in hpx]
        assert len(h) == size, f'{aid}: height {len(h)} != texPx {size}'
        base = BASE[aid]
        rand = random.Random(asset['seed'])
        jitter = [[0.92 + rand.random() * 0.16 for _ in range(size)] for _ in range(size)]
        if asset['category'] == 'projectiles':
            alb = [[(base[0], base[1], base[2], 255) for _ in range(size)] for _ in range(size)]
            png_write(os.path.join(DIST_TEX, f'{aid}_albedo.png'), size, size, alb)
            info = {'size': size, 'emissive': True}
        else:
            mat = asset['material']
            alb = [[(min(255, int(base[0] * (0.7 + 0.6 * h[y][x]) * jitter[y][x])),
                     min(255, int(base[1] * (0.7 + 0.6 * h[y][x]) * jitter[y][x])),
                     min(255, int(base[2] * (0.7 + 0.6 * h[y][x]) * jitter[y][x])), 255)
                    for x in range(size)] for y in range(size)]
            nrm = height_to_normal(h, mat['normalStrength'])
            nrm_px = [[(r, g, b, 255) for (r, g, b) in row] for row in nrm]
            ao = cavity_ao(h)
            rough = mat['roughness']
            metal = mat['metalness']
            orm = [[(ao[y][x],
                     int(min(1, max(0, rough + (h[y][x] - 0.5) * 0.2)) * 255),
                     int(min(1, max(0, metal + (h[y][x] - 0.5) * 0.1)) * 255), 255)
                    for x in range(size)] for y in range(size)]
            mask = [[(orm[y][x][2], orm[y][x][0], 128,
                      255 - orm[y][x][1], ) for x in range(size)] for y in range(size)]
            mask = [[(r, g, b, a if isinstance(a, int) else 255) for (r, g, b, a) in row] for row in mask]
            png_write(os.path.join(DIST_TEX, f'{aid}_albedo.png'), size, size, alb)
            png_write(os.path.join(DIST_TEX, f'{aid}_normal.png'), size, size, nrm_px)
            png_write(os.path.join(DIST_TEX, f'{aid}_orm.png'), size, size, orm)
            png_write(os.path.join(DIST_TEX, f'{aid}_mask.png'), size, size, mask)
            info = {'size': size, 'normalStrength': mat['normalStrength']}
        with open(os.path.join(d, 'bake.json'), 'w') as f:
            json.dump(info, f, indent=1)
        log_stage(aid, 's6_bake', info)
        print(f'{aid}: baked {size}px')


if __name__ == '__main__':
    main(sys.argv[1:])
