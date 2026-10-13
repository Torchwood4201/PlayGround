"""Shared stage helpers: catalog access, out/dist paths, manifest logging."""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'pipeline', 'lib'))

CATALOG = os.path.join(ROOT, 'pipeline', 'catalog.json')
OUT = os.path.join(ROOT, 'pipeline', 'out')
DIST = os.path.join(ROOT, 'pipeline', 'dist')


def load_catalog():
    with open(CATALOG) as f:
        return json.load(f)


def asset_by_id(cat, aid):
    for a in cat['assets']:
        if a['id'] == aid:
            return a
    raise KeyError(aid)


def out_dir(aid):
    d = os.path.join(OUT, aid)
    os.makedirs(d, exist_ok=True)
    return d


def dist_dirs():
    for sub in ('glb', 'tex'):
        os.makedirs(os.path.join(DIST, sub), exist_ok=True)


def manifest(aid):
    """Load or create per-asset manifest (params+seeds+stage log)."""
    path = os.path.join(out_dir(aid), 'manifest.json')
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f), path
    return {'id': aid, 'log': []}, path


def save_manifest(m, path):
    with open(path, 'w') as f:
        json.dump(m, f, indent=1)


def log_stage(aid, stage, info):
    m, path = manifest(aid)
    m['log'].append({'stage': stage, 'info': info})
    save_manifest(m, path)
