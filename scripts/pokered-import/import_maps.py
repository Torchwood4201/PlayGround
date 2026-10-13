#!/usr/bin/env python3
"""Generate remake maps (TS + colorized PNG) from pret/pokered disassembly.

Usage:
  python3 scripts/pokered-import/import_maps.py [--map CERULEAN_CITY ...]
      [--render-only] [--emit-only] [--list]

Outputs:
  src/maps/gen/<slug>.ts          map data in remake schema
  src/assets/map/gen/<slug>.png   colorized render (32px per pokered block)

Then run with --registry to print the MapId/map-data.ts patch block.
"""
import os
import re
import sys
import json
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
POKERED = os.path.join(ROOT, 'pokered')
GEN_TS = os.path.join(ROOT, 'src', 'maps', 'gen')
GEN_IMG = os.path.join(ROOT, 'src', 'assets', 'map', 'gen')

# ---------------------------------------------------------------- parsing

def parse_map_consts():
    order, dims = [], {}
    for line in open(f'{POKERED}/constants/map_constants.asm'):
        m = re.match(r'\s*map_const\s+(\w+),\s*(\d+),\s*(\d+)', line)
        if m:
            order.append(m.group(1))
            dims[m.group(1)] = (int(m.group(2)), int(m.group(3)))
    return order, dims


def parse_tileset_files():
    """tileset NAME -> (png_path, bst_path) via gfx/tilesets.asm INCBINs
    (labels share one INCBIN across consecutive lines)."""
    gfx, bst = {}, {}
    pend_g, pend_b = [], []
    for line in open(f'{POKERED}/gfx/tilesets.asm'):
        m = re.match(r'(\w+)_GFX::(.*)', line)
        if m:
            pend_g.append(m.group(1))
            inc = re.search(r'INCBIN\s+"([^"]+)"', m.group(2))
            if inc:
                for label in pend_g:
                    gfx[label] = inc.group(1).replace('.2bpp', '.png')
                pend_g = []
            continue
        m = re.match(r'(\w+)_Block::(.*)', line)
        if m:
            pend_b.append(m.group(1))
            inc = re.search(r'INCBIN\s+"([^"]+)"', m.group(2))
            if inc:
                for label in pend_b:
                    bst[label] = inc.group(1)
                pend_b = []
    return gfx, bst


def parse_tileset_headers():
    ts = {}
    for line in open(f'{POKERED}/data/tilesets/tileset_headers.asm'):
        m = re.match(r'\s*tileset\s+(\w+),\s*(\S+),\s*(\S+),\s*(\S+),\s*(\S+),\s*(\S+)', line)
        if m:
            def num(s):
                return None if s == '-1' else int(s.lstrip('$'), 16)
            ts[m.group(1)] = {'grass': num(m.group(5))}
    return ts


def parse_collisions():
    colls, cur = {}, None
    for line in open(f'{POKERED}/data/tilesets/collision_tile_ids.asm'):
        m = re.match(r'(\w+)_Coll::', line)
        if m:
            cur = m.group(1).upper().replace('_', '')
            colls[cur] = set()
            continue
        m = re.match(r'\s*coll_tiles\s+(.*)', line)
        if m and cur:
            for tok in m.group(1).split(','):
                tok = tok.strip()
                if tok.startswith('$'):
                    colls[cur].add(int(tok[1:], 16))
    return colls


def parse_song_map(order):
    songs = {}
    for line in open(f'{POKERED}/data/maps/songs.asm'):
        m = re.match(r'\s*db\s+MUSIC_(\w+),.*;\s*(\w+)', line)
        if m:
            songs[m.group(2)] = m.group(1)
    return songs


def parse_headers():
    """map file name -> (tileset, [(dir, dest_map, dest_id, offset)])."""
    headers = {}
    hdr_dir = f'{POKERED}/data/maps/headers'
    for fn in os.listdir(hdr_dir):
        if not fn.endswith('.asm'):
            continue
        name = fn[:-4]
        tileset, conns = None, []
        for line in open(os.path.join(hdr_dir, fn)):
            m = re.match(r'\s*map_header\s+\w+,\s*\w+,\s*(\w+)', line)
            if m:
                tileset = m.group(1)
            m = re.match(r'\s*connection\s+(north|south|west|east),\s*(\w+),\s*(\w+),\s*(-?\d+)', line)
            if m:
                conns.append((m.group(1), m.group(2), m.group(3), int(m.group(4))))
        headers[name] = (tileset, conns)
    return headers


def parse_objects():
    """map file name -> {warps:[(x,y,dest,id)], bg:[(x,y,text)], obj:[dict]}."""
    out = {}
    obj_dir = f'{POKERED}/data/maps/objects'
    for fn in os.listdir(obj_dir):
        if not fn.endswith('.asm'):
            continue
        name = fn[:-4]
        warps, bg, objs = [], [], []
        for line in open(os.path.join(obj_dir, fn)):
            m = re.match(r'\s*warp_event\s+(\d+),\s*(\d+),\s*(\w+),\s*(\d+)', line)
            if m:
                warps.append((int(m.group(1)), int(m.group(2)), m.group(3), int(m.group(4))))
                continue
            m = re.match(r'\s*bg_event\s+(\d+),\s*(\d+),\s*TEXT_(\w+)', line)
            if m:
                bg.append((int(m.group(1)), int(m.group(2)), m.group(3)))
                continue
            m = re.match(r'\s*object_event\s+(\d+),\s*(\d+),\s*SPRITE_(\w+),\s*(\w+),\s*(\w+),\s*TEXT_(\w+)(?:,\s*(?:OPP_(\w+),\s*(\d+)|([A-Z_0-9♀♂]+)(?:,\s*(\d+))?))?', line)
            if m:
                item = m.group(9)
                opp = m.group(7)
                party = int(m.group(8)) - 1 if m.group(8) else None
                objs.append({'x': int(m.group(1)), 'y': int(m.group(2)),
                             'sprite': m.group(3), 'move': m.group(4), 'face': m.group(5),
                             'text': m.group(6), 'opp': opp, 'item': item,
                             'party': party, 'mon_level': int(m.group(10)) if m.group(10) else None})
        out[name] = {'warps': warps, 'bg': bg, 'obj': objs}
    return out


def parse_text_file(path, single_colon=False):
    """label -> list of ops [(kind, arg)]. scripts/ uses single-colon labels;
    dot-sub-labels are keyed as Parent.sub."""
    texts, cur, parent = {}, None, None
    for raw in open(path, errors='replace'):
        line = raw.strip()
        m = re.match(r'^_?(\w+)::$', line)
        if not m and single_colon:
            m = re.match(r'^([A-Za-z_]\w*):$', line)
        if m:
            cur = m.group(1)
            parent = cur
            texts[cur] = []
            continue
        if single_colon:
            m = re.match(r'^\.(\w+):$', line)
            if m and parent:
                cur = parent + '.' + m.group(1)
                texts[cur] = []
                continue
        if cur is None:
            continue
        if cur is None:
            continue
        m = re.match(r'^(text|line|cont|para)\s+"(.*)"$', line)
        if m:
            texts[cur].append((m.group(1), m.group(2)))
            continue
        if line in ('prompt', 'done') or line.startswith('text_end'):
            texts[cur].append(('end', ''))
            continue
        m = re.match(r'^text_ram\s+(\w+)', line)
        if m:
            texts[cur].append(('ram', m.group(1)))
            continue
        if line.startswith('text_start'):
            texts[cur].append(('br', ''))
            continue
        if line.startswith('text_far'):
            m = re.match(r'^text_far\s+_?(\w+)', line)
            if m:
                texts[cur].append(('far', m.group(1)))
            continue
        # ignore: text_decimal/text_bcd/sound_/lb/etc best-effort
    return texts


def load_all_texts():
    texts = {}
    # scripts/ first: mostly text_far stubs that share keys with the real
    # content in text/ (which must win).
    for fn in os.listdir(f'{POKERED}/scripts'):
        if fn.endswith('.asm'):
            texts.update(parse_text_file(f'{POKERED}/scripts/{fn}', single_colon=True))
    for fn in os.listdir(f'{POKERED}/data/text'):
        if fn.endswith('.asm'):
            texts.update(parse_text_file(f'{POKERED}/data/text/{fn}'))
    for fn in os.listdir(f'{POKERED}/text'):
        if fn.endswith('.asm'):
            texts.update(parse_text_file(f'{POKERED}/text/{fn}'))
    return texts


def parse_script_pointers():
    """(map, TEXT_ID) -> label; trainer headers per map; TEXT_ID -> header idx."""
    ptrs, trainers, text_header = {}, {}, {}
    for fn in os.listdir(f'{POKERED}/scripts'):
        if not fn.endswith('.asm'):
            continue
        mapname = fn[:-4]
        cur_label, cur_header = None, None
        for line in open(f'{POKERED}/scripts/{fn}'):
            m = re.match(r'\s*dw_const\s+(\w+),\s*TEXT_(\w+)', line)
            if m:
                ptrs[(mapname, m.group(2))] = m.group(1)
            m = re.match(r'(\w+TrainerHeader\d+):', line)
            if m:
                cur_header = m.group(1)
                continue
            if cur_header and line.strip().startswith('trainer '):
                parts = [p.strip() for p in line.strip()[len('trainer '):].split(',')]
                if len(parts) >= 5:
                    trainers.setdefault(mapname, {})[cur_header] = {
                        'battle': parts[2], 'end': parts[3], 'after': parts[4]}
                cur_header = None
                continue
            m = re.match(r'^([A-Za-z_]\w*):$', line.strip())
            if m:
                cur_label = m.group(1)
                continue
            m = re.search(r'ld hl, (\w+TrainerHeader\d+)\s*$', line)
            if m and cur_label:
                text_header[(mapname, cur_label)] = m.group(1)
    return ptrs, trainers, text_header


def parse_parties():
    """group name -> list of parties; each party = [(level, mon)]."""
    groups, cur = {}, None
    for line in open(f'{POKERED}/data/trainers/parties.asm'):
        m = re.match(r'(\w+)Data:', line)
        if m:
            cur = m.group(1) + 'Data'
            groups[cur] = []
            continue
        if cur is None:
            continue
        line = line.split(';')[0].strip()
        if not line.startswith('db '):
            continue
        toks = [t.strip() for t in line[3:].split(',')]
        if toks and toks[0] == '$FF':
            # level+mon pairs
            party, i = [], 1
            while i + 1 < len(toks) and toks[i] != '0':
                try:
                    party.append((int(toks[i]), toks[i + 1]))
                except ValueError:
                    break
                i += 2
            groups[cur].append(party)
        else:
            # single level then mons
            try:
                lvl = int(toks[0])
            except ValueError:
                continue
            party = [(lvl, t) for t in toks[1:] if t != '0' and re.match(r'^[A-Z_♀♂]+$', t)]
            if party:
                groups[cur].append(party)
    return groups


def parse_money():
    out = {}
    for line in open(f'{POKERED}/data/trainers/pic_pointers_money.asm'):
        m = re.match(r'\s*pic_money\s+(\w+)Pic,\s*(\d+)', line)
        if m:
            out[m.group(1).upper()] = int(m.group(2))
    return out


def parse_species_consts():
    """internal mon name -> internal id (1-based order)."""
    consts = []
    for line in open(f'{POKERED}/constants/pokemon_constants.asm'):
        m = re.match(r'\s*const\s+([A-Z_♀♂]+)', line)
        if m:
            consts.append(m.group(1))
    return {name: i + 1 for i, name in enumerate(consts)}


# signs with scripted (conditional) text: fall back to a static variant
SPECIAL_TEXTS = {
    ('FuchsiaCity', 'FUCHSIACITY_FOSSIL_SIGN'): 'FuchsiaCityFossilSignUndeterminedText',
}


# trainers with custom (non-TrainerHeader) scripts: (intro, outtro, after, items)
CUSTOM_TRAINERS = {
    ('CeruleanCity', 'CERULEANCITY_ROCKET'):
        ('CeruleanCityRocketText.Text', 'CeruleanCityRocketText.IGiveUpText',
         'CeruleanCityRocketText.IllReturnTheTMText', ['Tm28']),
    ('Route24', 'ROUTE24_COOLTRAINER_M1'):
        ('Route24CooltrainerM1Text.JoinTeamRocketText', 'Route24CooltrainerM1Text.DefeatedText',
         'Route24CooltrainerM1Text.YouCouldBecomeATopLeaderText', ['Nugget']),
    ('GameCorner', 'GAMECORNER_ROCKET'):
        ('GameCornerRocketText.ImGuardingThisPosterText', 'GameCornerRocketText.BattleEndText',
         'GameCornerRocketAfterBattleText', []),
    ('FightingDojo', 'FIGHTINGDOJO_KARATE_MASTER'):
        ('FightingDojoKarateMasterText.Text', 'FightingDojoKarateMasterText.DefeatedText',
         'FightingDojoKarateMasterText.IWillGiveYouAPokemonText', []),
    ('SilphCo11F', 'SILPHCO11F_GIOVANNI'):
        ('SilphCo11FGiovanniText', 'SilphCo11FGiovanniILostAgainText',
         'SilphCo11FGiovanniYouRuinedOurPlansText', []),
    ('RocketHideoutB4F', 'ROCKETHIDEOUTB4F_GIOVANNI'):
        ('RocketHideoutB4FGiovanniText.ImpressedYouGotHereText',
         'RocketHideoutB4FGiovanniText.WhatCannotBeText',
         'RocketHideoutB4FGiovanniHopeWeMeetAgainText', []),
}


# rival fights on generated maps: mapfile -> (tier, intro, outtro, after, money, postgame_extra)
RIVAL_SPOTS = {
    'CeruleanCity': (2, 'CeruleanCityRivalText.PreBattleText', 'CeruleanCityRivalDefeatedText',
                     'CeruleanCityRivalVictoryText', 595, []),
    'SSAnne2F': (3, 'SSAnne2FRivalText.Text', 'SSAnne2FRivalDefeatedText',
                 'SSAnne2FRivalVictoryText', 1300, []),
    'PokemonTower2F': (4, 'PokemonTower2FRivalText.WhatBringsYouHereText',
                       'PokemonTower2FRivalDefeatedText', 'PokemonTower2FRivalVictoryText', 1625, []),
    'SilphCo7F': (5, 'SilphCo7FRivalText.Text', 'SilphCo7FRivalDefeatedText',
                  'SilphCo7FRivalVictoryText', 2600, []),
    'ChampionsRoom': (7, 'ChampionsRoomRivalText.IntroText', 'RivalDefeatedText',
                      'ChampionsRoomRivalAfterBattleText', 6435,
                      ['PROF.OAK: Congratulations!', 'Welcome to the HALL OF FAME!']),
}
# placeholder team: tier -> (party group, variant-0 index)
RIVAL_PLACEHOLDER = {2: ('Rival1Data', 6), 3: ('Rival2Data', 0), 4: ('Rival2Data', 3),
                     5: ('Rival2Data', 6), 7: ('Rival3Data', 0)}


def parse_tm_tables():
    """TM_<MOVE>/HM_<MOVE> item const -> remake ItemType member."""
    out, ntm, nhm = {}, 0, 0
    for line in open(f'{POKERED}/constants/item_constants.asm'):
        m = re.match(r'\s*add_tm\s+([A-Z_]+)', line)
        if m:
            ntm += 1
            out['TM_' + m.group(1)] = 'Tm%02d' % ntm
            continue
        m = re.match(r'\s*add_hm\s+([A-Z_]+)', line)
        if m:
            nhm += 1
            out['HM_' + m.group(1)] = 'Hm%02d' % nhm
    return out


def parse_wild():
    """wild label stem -> {'rate', 'mons', 'water_rate', 'water'}."""
    wild = {}
    d = f'{POKERED}/data/wild/maps'
    for fn in os.listdir(d):
        if not fn.endswith('.asm'):
            continue
        with open(os.path.join(d, fn)) as f:
            lines = f.readlines()
        # figure out map const from label prefix: XxxWildMons
        m0 = re.match(r'(\w+)WildMons:', lines[0]) if lines else None
        if not m0:
            continue
        # find map const by label stem: convert CamelCase-ish? labels are like Route4WildMons
        stem = m0.group(1)
        entries, water, rate, wrate = [], [], 0, 0
        cond, section = [], None
        for line in lines:
            s = line.strip()
            m = re.match(r'IF\s+DEF\(_(\w+)\)', s)
            if m:
                cond.append(m.group(1))
                continue
            if s.startswith('ENDC'):
                cond = cond[:-1]
                continue
            m = re.match(r'def_grass_wildmons\s+(\d+)', s)
            if m:
                rate, section = int(m.group(1)), 'grass'
                continue
            m = re.match(r'def_water_wildmons\s+(\d+)', s)
            if m:
                wrate, section = int(m.group(1)), 'water'
                continue
            if s.startswith('end_grass_wildmons') or s.startswith('end_water_wildmons'):
                section = None
                continue
            m = re.match(r'db\s+(\d+),\s*([A-Z_♀♂]+)', s)
            if m and section and (not cond or cond == ['_BLUE']):
                (entries if section == 'grass' else water).append((int(m.group(1)), m.group(2)))
        # key by raw stem (e.g. Route4); resolved to map const later by
        # comparing with underscores stripped (ROUTE_4 -> ROUTE4).
        wild[stem] = {'rate': rate, 'mons': entries, 'water_rate': wrate, 'water': water}
    return wild


def resolve_wild_key(stem, consts):
    flat = stem.upper()
    for c in consts:
        if c.replace('_', '') == flat:
            return c
    return None


if __name__ == '__main__':
    if '--list' in sys.argv:
        order, dims = parse_map_consts()
        print(len(order), 'maps')
        print(' '.join(order))

# ---------------------------------------------------------------- rendering

GB_LUM = [235, 168, 110, 40]

# hand-made remake art aligned 1:1 with pokered layouts (for palette learning)

LEARN_PAIRS = [
    # (remake art, pokered map const, tileset)
    ('pallet-town', 'PALLET_TOWN', 'Overworld'),
    ('route-1', 'ROUTE_1', 'Overworld'),
    ('viridian-city', 'VIRIDIAN_CITY', 'Overworld'),
    ('pewter-city', 'PEWTER_CITY', 'Overworld'),
    ('viridian-forrest', 'VIRIDIAN_FOREST', 'Forest'),
    ('mt-moon-1f', 'MT_MOON_1F', 'Cavern'),
    ('viridian-city-poke-mart', 'VIRIDIAN_MART', 'Mart'),
    ('viridian-city-pokemon-center', 'VIRIDIAN_POKECENTER', 'Pokecenter'),
    ('route-3-pokemon-center', 'MT_MOON_POKECENTER', 'Pokecenter'),
    ('house-a-1f', 'REDS_HOUSE_1F', 'RedsHouse1'),
    ('house-a-2f', 'REDS_HOUSE_2F', 'RedsHouse2'),
    ('house-b', 'BLUES_HOUSE', 'House'),
    ('lab', 'OAKS_LAB', 'Lab'),
    ('pewter-museum-1f', 'MUSEUM_1F', 'Museum'),
    ('gate-house', 'ROUTE_22_GATE', 'Gate'),
    ('route-2-gate', 'ROUTE_2_GATE', 'ForestGate'),
]


def load_tiles_png(path):
    im = Image.open(path).convert('L')
    W, H = im.size[0] // 8, im.size[1] // 8
    px = im.load()
    tiles = []
    for ty in range(H):
        for tx in range(W):
            vals = [px[tx * 8 + x, ty * 8 + y] for y in range(8) for x in range(8)]
            tiles.append([3 - min(3, v * 4 // 256) for v in vals])
    return tiles


class Renderer:
    def __init__(self):
        order, self.dims = parse_map_consts()
        self.order = order
        gfx, bst = parse_tileset_files()
        self.gfx = {k.upper().replace('_', ''): v for k, v in gfx.items()}
        self.bst = {k.upper().replace('_', ''): v for k, v in bst.items()}
        self.tiles = {}   # tileset NAME -> tiles
        self.blocks = {}  # tileset NAME -> bytes
        self.tsheaders = parse_tileset_headers()
        self.colls = parse_collisions()
        self.learned = {}  # (tileset, block) -> (r, g, b)
        self.patterns = {}  # (tileset, block) -> tuple of 16 shade means (for similarity)

    def tileset_of_map(self, map_file):
        for line in open(f'{POKERED}/data/maps/headers/{map_file}.asm'):
            m = re.match(r'\s*map_header\s+(\w+),\s*(\w+),\s*(\w+)', line)
            if m:
                return m.group(3)
        raise ValueError(f'no tileset for {map_file}')

    def const_of_file(self, map_file):
        for line in open(f'{POKERED}/data/maps/headers/{map_file}.asm'):
            m = re.match(r'\s*map_header\s+\w+,\s*(\w+),\s*\w+', line)
            if m:
                return m.group(1)
        raise ValueError(f'no const for {map_file}')

    def file_of_const(self, const):
        if not hasattr(self, '_const2file'):
            self._const2file = {}
            for fn in os.listdir(f'{POKERED}/data/maps/headers'):
                if not fn.endswith('.asm'):
                    continue
                for line in open(os.path.join(f'{POKERED}/data/maps/headers', fn)):
                    m = re.match(r'\s*map_header\s+\w+,\s*(\w+),\s*\w+', line)
                    if m:
                        # prefer the file whose stem matches the const exactly
                        # (copies share consts with their base map)
                        stem = fn[:-4].upper().replace('_', '')
                        if m.group(1).replace('_', '') == stem:
                            self._const2file[m.group(1)] = fn[:-4]
                        else:
                            self._const2file.setdefault(m.group(1), fn[:-4])
        if const not in self._const2file:
            raise ValueError(f'no file for {const}')
        return self._const2file[const]

    @staticmethod
    @staticmethod
    def tskey(name):
        return name.upper().replace('_', '')

    def load_tileset(self, tsname):
        tsname = self.tskey(tsname)
        if tsname in self.tiles:
            return
        png = self.gfx[self.tskey(tsname)].replace('gfx/tilesets/', '')
        self.tiles[tsname] = load_tiles_png(f'{POKERED}/gfx/tilesets/{png}')
        bfile = self.bst[self.tskey(tsname)].replace('gfx/blocksets/', '')
        self.blocks[tsname] = open(f'{POKERED}/gfx/blocksets/{bfile}', 'rb').read()

    def block_shades(self, tsname, block):
        tsname = self.tskey(tsname)
        bst = self.blocks[tsname]
        if block * 16 + 16 > len(bst):
            return tuple([0.0] * 16)
        tiles = self.tiles[tsname]
        out = []
        for i in range(16):
            t = bst[block * 16 + i]
            tp = tiles[t] if t < len(tiles) else [0] * 64
            out.append(sum(tp) / 64.0)
        return tuple(round(v, 2) for v in out)

    def learn_palettes(self):
        for art, mapconst, _ts in LEARN_PAIRS:
            tsname = _ts.upper()
            w, h = self.dims[mapconst]
            self.load_tileset(tsname)
            tiles = self.tiles[tsname]
            bst = self.blocks[tsname]
            art_path = f'{ROOT}/src/assets/map/{art}.png'
            if not os.path.exists(art_path):
                print(f'  learn: missing art {art}')
                continue
            im = Image.open(art_path).convert('RGB')
            if im.size != (w * 32, h * 32):
                print(f'  learn: size mismatch {art} {im.size} vs {(w*32, h*32)}')
                continue
            blk = open(f'{POKERED}/maps/{self.file_of_const(mapconst)}.blk', 'rb').read()
            px = im.load()
            seen = set()
            for by in range(h):
                for bx in range(w):
                    b = blk[by * w + bx]
                    key = (self.tskey(tsname), b)
                    if key in seen:
                        continue
                    if b * 16 + 16 > len(bst):
                        # hand art references blocks outside the tileset
                        continue
                    seen.add(key)
                    # mean color per GB shade: shade -> [r,g,b,n]
                    acc = [[0, 0, 0, 0] for _ in range(4)]
                    for ty in range(4):
                        for tx in range(4):
                            t = bst[b * 16 + ty * 4 + tx]
                            tp = tiles[t] if t < len(tiles) else [0] * 64
                            for py in range(8):
                                for px_ in range(8):
                                    s = tp[py * 8 + px_]
                                    pr, pg, pb = px[bx * 32 + tx * 8 + px_, by * 32 + ty * 8 + py]
                                    acc[s][0] += pr
                                    acc[s][1] += pg
                                    acc[s][2] += pb
                                    acc[s][3] += 1
                    cols = []
                    for s in range(4):
                        if acc[s][3]:
                            cols.append((acc[s][0] / acc[s][3], acc[s][1] / acc[s][3], acc[s][2] / acc[s][3]))
                        else:
                            cols.append(None)
                    # fill missing shades from nearest present neighbor
                    for s in range(4):
                        if cols[s] is None:
                            for d in (1, 2, 3):
                                rep = None
                                if s - d >= 0 and cols[s - d] is not None:
                                    rep = cols[s - d]
                                if s + d <= 3 and cols[s + d] is not None:
                                    rep = cols[s + d]
                                    break
                                if rep is not None:
                                    break
                            cols[s] = rep or (150, 150, 150)
                    self.learned[key] = cols
            print(f'  learn: {art} -> {len(seen)} blocks')
        print(f'  learned {len(self.learned)} (tileset, block) colors')

    def nearest_learned(self, tsname, block):
        if not hasattr(self, '_patcache'):
            self._patcache = [(self.block_shades(lts, lb), col)
                              for (lts, lb), col in self.learned.items()]
        pat = self.block_shades(tsname, block)
        best, bestd = None, 1e9
        for lpat, col in self._patcache:
            d = 0.0
            for a, b in zip(pat, lpat):
                dd = a - b
                d += dd * dd
                if d >= bestd:
                    break
            if d < bestd:
                bestd, best = d, col
        return best

    def render_color(self, map_file, tsname=None, out_path=None, scale_note=True):
        # map_file may be a file stem (PalletTown) or const (PALLET_TOWN)
        const = map_file if map_file in self.dims else self.const_of_file(map_file)
        map_file = self.file_of_const(const)
        w, h = self.dims[const]
        blk = open(f'{POKERED}/maps/{map_file}.blk', 'rb').read()
        if len(blk) < w * h:
            h = len(blk) // w
        tsname = self.tskey(tsname or self.tileset_of_map(map_file))
        self.load_tileset(tsname)
        tiles = self.tiles[tsname]
        bst = self.blocks[tsname]
        nblocks = len(bst) // 16
        img = Image.new('RGB', (w * 32, h * 32))
        stats = {'learned': 0, 'borrowed': 0}
        for by in range(h):
            for bx in range(w):
                b = blk[by * w + bx]
                cols = self.learned.get((self.tskey(tsname), b))
                if cols is None:
                    ncol = self.nearest_learned(tsname, b) or [(150, 150, 150)] * 4
                    cols = ncol if isinstance(ncol[0], tuple) else [ncol] * 4
                    stats['borrowed'] += 1
                else:
                    stats['learned'] += 1
                for ty in range(4):
                    for tx in range(4):
                        t = bst[b * 16 + ty * 4 + tx] if b < nblocks else 0
                        tp = tiles[t] if t < len(tiles) else [0] * 64
                        for py in range(8):
                            for px in range(8):
                                s = tp[py * 8 + px]
                                c = cols[s]
                                img.putpixel((bx * 32 + tx * 8 + px, by * 32 + ty * 8 + py),
                                             (min(255, int(c[0])), min(255, int(c[1])), min(255, int(c[2]))))
        if out_path:
            img.save(out_path)
        return img, stats


if __name__ == '__main__' and ('--render-test' in sys.argv or '--learn' in sys.argv):
    r = Renderer()
    r.learn_palettes()
    if '--render-test' in sys.argv:
        idx = sys.argv.index('--render-test')
        target = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else 'CeruleanCity'
        # map const name guess: file stem
        img, stats = r.render_color(target, out_path=f'/tmp/gen-{target.lower()}.png')
        # upscale for viewing
        big = img.resize((img.width * 2, img.height * 2), Image.NEAREST)
        big.save(f'/tmp/gen-{target.lower()}-big.png')
        print(target, img.size, stats)

# ---------------------------------------------------------------- emit

# pokered consts already covered by hand-made remake maps (skip generation)
HANDMADE = {
    'PALLET_TOWN': 'PalletTown', 'VIRIDIAN_CITY': 'ViridianCity',
    'PEWTER_CITY': 'PewterCity', 'ROUTE_1': 'Route1', 'ROUTE_2': 'Route2',
    'ROUTE_3': 'Route3', 'ROUTE_22': 'Route22', 'REDS_HOUSE_1F': 'PalletTownHouseA1F',
    'REDS_HOUSE_2F': 'PalletTownHouseA2F', 'BLUES_HOUSE': 'PalletTownHouseB',
    'OAKS_LAB': 'PalletTownLab', 'VIRIDIAN_POKECENTER': 'ViridianCityPokemonCenter',
    'VIRIDIAN_MART': 'ViridianCityPokeMart', 'VIRIDIAN_SCHOOL_HOUSE': 'ViridianCityPokemonAcadamy',
    'VIRIDIAN_NICKNAME_HOUSE': 'ViridianCityNpcHouse', 'VIRIDIAN_GYM': 'ViridianCityGym',
    'VIRIDIAN_FOREST_NORTH_GATE': 'Route2GateNorth', 'ROUTE_2_GATE': 'Route2Gate',
    'VIRIDIAN_FOREST_SOUTH_GATE': 'Route2Gate', 'VIRIDIAN_FOREST': 'ViridianForrest',
    'MUSEUM_1F': 'PewterCityMuseum1f', 'MUSEUM_2F': 'PewterCityMuseum2f',
    'PEWTER_GYM': 'PewterCityGym', 'PEWTER_NIDORAN_HOUSE': 'PewterCityNpcA',
    'PEWTER_MART': 'PewterCityPokeMart', 'PEWTER_SPEECH_HOUSE': 'PewterCityNpcB',
    'PEWTER_POKECENTER': 'PewterCityPokemonCenter', 'MT_MOON_1F': 'MtMoon1f',
    'MT_MOON_B1F': 'MtMoon2f', 'MT_MOON_B2F': 'MtMoon3f',
    'MT_MOON_POKECENTER': 'Route3PokemonCenter', 'ROUTE_22_GATE': 'GateHouse',
}

SKIP_MAPS = {'TRADE_CENTER', 'COLOSSEUM', 'CERULEAN_TRASHED_HOUSE_COPY',
             'UNDERGROUND_PATH_ROUTE_6_COPY', 'UNDERGROUND_PATH_ROUTE_7_COPY',
             'CINNABAR_MART_COPY', 'CELADON_MART_ELEVATOR', 'ROCKET_HIDEOUT_ELEVATOR',
             'SILPH_CO_ELEVATOR'}

SONG_MP3 = {
    'PALLET_TOWN': 'pallet-town.mp3', 'CITIES1': 'pewter-city.mp3',
    'CITIES2': 'pewter-city.mp3', 'LAVENDER': 'pewter-city.mp3',
    'VERMILION': 'pewter-city.mp3', 'CELADON': 'pewter-city.mp3',
    'CINNABAR': 'pewter-city.mp3', 'ROUTES1': 'route-1.mp3',
    'ROUTES2': 'route-3.mp3', 'ROUTES3': 'route-3.mp3', 'ROUTES4': 'route-3.mp3',
    'DUNGEON1': 'mt-moon.mp3', 'DUNGEON2': 'mt-moon.mp3', 'DUNGEON3': 'mt-moon.mp3',
    'GYM': 'pokemon-gym.mp3', 'POKECENTER': 'pokemon-center.mp3',
    'OAKS_LAB': 'oaks-laboratory.mp3', 'INDIGO_PLATEAU': 'pokemon-gym.mp3',
    'SS_ANNE': 'route-3.mp3', 'SURF': 'route-3.mp3', 'CREDITS': 'pallet-town.mp3',
    'GAME_CORNER': 'pokemon-gym.mp3', 'MEET_RIVAL': 'oaks-laboratory.mp3',
}

OPP_NPC = {
    'YOUNGSTER': 'youngster', 'BUG_CATCHER': 'bugCatcher', 'LASS': 'lass',
    'SAILOR': 'sailor', 'JR_TRAINER_M': 'jrTrainerMale', 'JR_TRAINER_F': 'jrTrainerFemale',
    'POKEMANIAC': 'pokeManiac', 'SUPER_NERD': 'superNerd', 'HIKER': 'hiker',
    'BIKER': 'biker', 'BURGLAR': 'burglar', 'ENGINEER': 'engineer',
    'JUGGLER': 'juggler', 'FISHER': 'fisher', 'SWIMMER': 'swimmer',
    'CUE_BALL': 'cueBall', 'GAMBLER': 'gambler', 'BEAUTY': 'beauty',
    'PSYCHIC_TR': 'psychic', 'ROCKER': 'rocker', 'JR_TRAINER': 'jrTrainerMale',
    'BIRD_KEEPER': 'birdKeeper', 'BLACKBELT': 'blackBelt', 'GENTLEMAN': 'gentleman',
    'CHANNELER': 'channeler', 'TAMER': 'tamer', 'COOLTRAINER_M': 'aceTrainerMale',
    'COOLTRAINER_F': 'aceTrainerFemale', 'RIVAL1': 'rival', 'RIVAL2': 'rival',
    'RIVAL3': 'rival', 'ROCKET': 'teamRocketGrunt', 'SCIENTIST': 'scientist',
    'GIOVANNI': 'giovanni', 'BROCK': 'brock', 'MISTY': 'misty',
    'LT_SURGE': 'ltSurge', 'ERIKA': 'erica', 'KOGA': 'koga', 'SABRINA': 'sabrina',
    'BLAINE': 'blaine', 'LORELEI': 'lorelei', 'BRUNO': 'bruno',
    'AGATHA': 'agatha', 'LANCE': 'lance',
}

LEADER_SCRIPT = {'MISTY': 'Misty', 'LT_SURGE': 'LTSurge', 'ERIKA': 'Erika',
                 'KOGA': 'Koga', 'SABRINA': 'Sabrina', 'BLAINE': 'Blaine',
                 'GIOVANNI': 'Giovanni', 'BROCK': 'Brock'}
LEADER_BADGE = {'MISTY': 'Cascade', 'LT_SURGE': 'Thunder', 'ERIKA': 'Rainbow',
                'KOGA': 'Soul', 'SABRINA': 'Marsh', 'BLAINE': 'Volcano',
                'GIOVANNI': 'Earth', 'BROCK': 'Boulder'}

# flavor (non-battle) overworld sprites -> remake npc key
FLAVOR_NPC = {
    'YOUNGSTER': 'youngster', 'BUG_CATCHER': 'bugCatcher', 'LASS': 'lass',
    'SAILOR': 'sailor', 'JR_TRAINER_M': 'jrTrainerMale', 'JR_TRAINER_F': 'jrTrainerFemale',
    'POKEMANIAC': 'pokeManiac', 'SUPER_NERD': 'superNerd', 'HIKER': 'hiker',
    'BIKER': 'biker', 'BURGLAR': 'burglar', 'ENGINEER': 'engineer',
    'JUGGLER': 'juggler', 'FISHER': 'fisher', 'SWIMMER': 'swimmer',
    'CUE_BALL': 'cueBall', 'GAMBLER': 'gambler', 'BEAUTY': 'beauty',
    'PSYCHIC_TR': 'psychic', 'ROCKER': 'rocker', 'JR_TRAINER': 'jrTrainerMale',
    'BIRD_KEEPER': 'birdKeeper', 'BLACKBELT': 'blackBelt', 'GENTLEMAN': 'gentleman',
    'CHANNELER': 'channeler', 'TAMER': 'tamer', 'COOLTRAINER_M': 'aceTrainerMale',
    'COOLTRAINER_F': 'aceTrainerFemale', 'ROCKET': 'teamRocketGrunt', 'SCIENTIST': 'scientist',
    'GIOVANNI': 'giovanni', 'BROCK': 'brock', 'MISTY': 'misty',
    'LT_SURGE': 'ltSurge', 'ERIKA': 'erica', 'KOGA': 'koga', 'SABRINA': 'sabrina',
    'BLAINE': 'blaine', 'LORELEI': 'lorelei', 'BRUNO': 'bruno',
    'AGATHA': 'agatha', 'LANCE': 'lance', 'OAK': 'oak', 'BLUE': 'rival',
    'RED': 'ash', 'GIRL': 'lass', 'LITTLE_GIRL': 'lass', 'BRUNETTE_GIRL': 'beauty',
    'MIDDLE_AGED_MAN': 'gentleman', 'MIDDLE_AGED_WOMAN': 'beauty',
    'GRAMPS': 'gentleman', 'GRANNY': 'beauty', 'LITTLE_BOY': 'youngster',
    'BALDING_GUY': 'gentleman', 'COOK': 'gentleman', 'WAITER': 'sailor',
    'FISHING_GURU': 'fisher', 'GUARD': 'gentleman', 'GYM_GUIDE': 'gentleman',
    'CLERK': 'gentleman', 'NURSE': 'lass', 'LINK_RECEPTIONIST': 'lass',
    'SILPH_WORKER_M': 'scientist', 'SILPH_WORKER_F': 'lass',
    'SAFARI_ZONE_WORKER': 'hiker', 'GAMEBOY_KID': 'youngster',
    'FAIRY': 'lass', 'MR_FUJI': 'oak', 'DAISY': 'lass', 'MOM': 'beauty',
    'WARDEN': 'hiker', 'CAPTAIN': 'sailor', 'BIKE_SHOP_CLERK': 'gentleman',
    'SILPH_PRESIDENT': 'gentleman', 'MONSTER': 'youngster', 'BIRD': 'birdKeeper',
    'SEEL': 'youngster', 'GAMBLER_ASLEEP': 'gambler',
}

# inanimate sprites: no NPC, dialogue stays as sign text only
INANIMATE_SPRITES = {'BOULDER', 'FOSSIL', 'POKEDEX', 'PAPER', 'CLIPBOARD', 'OLD_AMBER'}

# gym leader badge + TM rewards (postGame items)
LEADER_REWARDS = {
    'MISTY': (['CascadeBadge', 'Tm11'], 'The CASCADEBADGE makes all POKEMON up to L30 obey!'),
    'LT_SURGE': (['ThunderBadge', 'Tm24'], 'The THUNDERBADGE makes all POKEMON up to L50 obey!'),
    'ERIKA': (['RainbowBadge', 'Tm21'], 'The RAINBOWBADGE makes all POKEMON up to L50 obey!'),
    'KOGA': (['SoulBadge', 'Tm06'], 'The SOULBADGE makes all POKEMON up to L70 obey!'),
    'SABRINA': (['MarshBadge', 'Tm46'], 'The MARSHBADGE makes all POKEMON up to L70 obey!'),
    'BLAINE': (['VolcanoBadge', 'Tm38'], 'The VOLCANOBADGE makes all POKEMON obey!'),
    'GIOVANNI': (['EarthBadge', 'Tm27'], 'The EARTHBADGE makes all POKEMON obey!'),
    'BROCK': (['BoulderBadge', 'Tm34'], 'The BOULDERBADGE makes all POKEMON obey!'),
}

FACING = {'UP': 'Up', 'DOWN': 'Down', 'LEFT': 'Left', 'RIGHT': 'Right'}

# water blocks per tileset (surfable)
WATER_BLOCKS = {
    'OVERWORLD': {0x04, 0x1D, 0x1E, 0x1F, 0x2D, 0x2E, 0x43, 0x64, 0x65, 0x66, 0x6A, 0x6B, 0x78},
    'CAVERN': {0x76},
}
# cuttable tree blocks (overworld-style tilesets only)
CUT_BLOCKS = {0x32, 0x33, 0x34, 0x35, 0x60}
CUT_TILESETS = {'OVERWORLD', 'FOREST'}

OPP_PARTY_GROUP = {
    'JR_TRAINER': 'JrTrainerMData', 'JR_TRAINER_F': 'JrTrainerFData',
    'PSYCHIC_TR': 'PsychicData', 'BLACKBELT': 'BlackbeltData',
    'JUGGLER': 'JugglerData',
}
OPP_MONEY_ALIAS = {'PSYCHICTR': 'PSYCHIC', 'JRTRAINER': 'JRTRAINERM'}


def opp_party_group(opp, parties):
    if opp in OPP_PARTY_GROUP:
        return parties.get(OPP_PARTY_GROUP[opp])
    cand = opp.title().replace('_', '') + 'Data'
    if cand in parties:
        return parties[cand]
    for k in parties:
        if k.lower() == cand.lower():
            return parties[k]
    return None


def opp_money_key(opp):
    key = opp.replace('_', '')
    return OPP_MONEY_ALIAS.get(key, key)


ENCOUNTER_KEYS = ['walk', 'oldRod', 'goodRod', 'superRod', 'surf', 'rockSmash',
                  'headbutt', 'darkGrass', 'grassSpots', 'caveSpots', 'bridgeSpots',
                  'superRodSpots', 'surfSpots', 'yellowFlowers', 'purpleFlowers',
                  'redFlowers', 'roughTerrain', 'gift', 'giftEgg', 'onlyOne']
SLOT_CHANCE = [20, 20, 15, 10, 10, 10, 5, 5, 3, 2]

NAME_OVERRIDES = {
    'MT_MOON_B1F': 'Mt Moon B1F', 'MT_MOON_B2F': 'Mt Moon B2F',
}


def pretty_name(const):
    if const in NAME_OVERRIDES:
        return NAME_OVERRIDES[const]
    s = const.replace('_', ' ').title()
    s = re.sub(r'\bMt\b', 'Mt', s)
    s = re.sub(r'\bSs Anne\b', 'SS Anne', s)
    s = re.sub(r'\bB(\d)F\b', r'B\1F', s)
    s = re.sub(r'\b(\d)F\b', r'\1F', s)
    return s


def const_to_slug(const):
    return const.lower().replace('_', '-')


def const_to_member(const):
    parts = const.lower().split('_')
    return parts[0].capitalize() + ''.join(p.capitalize() for p in parts[1:])


def wrap_lines(text, width=38):
    out = []
    for para in text.split('\n'):
        words, line = para.split(' '), ''
        for w in words:
            if len(line) + len(w) + 1 > width and line:
                out.append(line)
                line = w
            else:
                line = (line + ' ' + w).strip()
        if line:
            out.append(line)
    return out


def render_text_ops(ops, subs):
    """ops -> flowing string with \\n paragraph breaks."""
    chunks, cur = [], ''
    for kind, arg in ops:
        if kind in ('text', 'line'):
            if cur:
                chunks.append(cur)
            cur = arg
        elif kind == 'cont':
            cur = (cur + ' ' + arg).strip()
        elif kind == 'para':
            if cur:
                chunks.append(cur)
            chunks.append('')
            cur = arg
        elif kind == 'ram':
            cur = (cur + ' ' + subs.get(arg, '')).strip()
        elif kind == 'br':
            if cur:
                chunks.append(cur)
            cur = ''
        elif kind == 'end':
            if cur:
                chunks.append(cur)
            cur = ''
            break
        elif kind == 'far':
            chunks.append(f'@@FAR:{arg}@@')
    if cur:
        chunks.append(cur)
    text = '\n'.join(chunks)
    text = re.sub(r'\n{3,}', '\n\n', text).strip()
    # resolve inlined far refs is handled by caller; drop markers safely
    return text

# ---------------------------------------------------------------- emitter

class Emitter:
    def __init__(self, renderer):
        self.r = renderer
        order, dims = parse_map_consts()
        self.order, self.dims = order, dims
        self.headers = parse_headers()
        self.objects = parse_objects()
        self.texts = load_all_texts()
        self.ptrs, self.theaders, self.text_to_header = parse_script_pointers()
        self.header_to_text = {}
        for (mf, _), h in self.text_to_header.items():
            self.header_to_text.setdefault((mf, h), None)
        self.parties = parse_parties()
        self.money = parse_money()
        self.wild = parse_wild()
        self.marts = parse_marts()
        self.songs = parse_song_map(order)
        self.species_consts = parse_species_consts()
        self.tm_tables = parse_tm_tables()
        self.remake_ids = self.load_remake_species()
        self.itemtypes = self.load_itemtypes()
        self.report = {'skipped_npc': [], 'skipped_text': [], 'skipped_warp': [],
                       'skipped_trainer': [], 'skipped_item': [], 'rival_fights': []}

    def load_remake_species(self):
        src = open(f'{ROOT}/src/app/pokemon-metadata.ts').read()
        out = {}
        for m in re.finditer(r'^  "(\d+)": \{$', src, re.MULTILINE):
            chunk = src[m.end():m.end() + 3000]
            n = re.search(r'^    name: "([^"]+)"', chunk, re.MULTILINE)
            i = re.search(r'^    id: (\d+)', chunk, re.MULTILINE)
            if n and i:
                out[n.group(1)] = int(i.group(1))
        return out

    def load_itemtypes(self):
        src = open(f'{ROOT}/src/app/use-item-data.ts').read()
        m = re.search(r'export enum ItemType \{(.*?)\n\}', src, re.DOTALL)
        return set(re.findall(r'^\s*([A-Za-z0-9]+)\s*=', m.group(1), re.MULTILINE))

    def species_id(self, mon):
        key = mon.lower().replace('_M', '-m').replace('_F', '-f').replace('_', '-')
        key = key.replace('♂', '-m').replace('♀', '-f')
        rid = self.remake_ids.get(key)
        if rid is None:
            self.report['skipped_trainer'].append(f'species {mon}')
        return rid

    def item_member(self, item):
        if item in self.tm_tables:
            member = self.tm_tables[item]
            if member in self.itemtypes:
                return member
            self.report['skipped_item'].append(item)
            return None
        parts = item.lower().split('_')
        member = parts[0].capitalize() + ''.join(p.capitalize() for p in parts[1:])
        if member in self.itemtypes:
            return member
        self.report['skipped_item'].append(item)
        return None

    def opp_money_base(self, opp):
        return self.money.get(opp.replace('_', ''), 1000)

    def resolve_ops(self, label, depth=0):
        if depth > 3 or label not in self.texts:
            return []
        out = []
        for kind, arg in self.texts[label]:
            if kind == 'far':
                out.extend(self.resolve_ops(arg, depth + 1))
            else:
                out.append((kind, arg))
        return out

    def finalize_lines(self, lines):
        out = []
        for ln in lines:
            ln = ln.replace('#MON', 'POKEMON').replace('# BALL', 'POKE BALL')
            ln = ln.replace('#DEX', 'POKEDEX').replace('@', '')
            ln = ln.replace('<PLAYER>', 'Blue').replace('<RIVAL>', 'Rival')
            ln = re.sub(r'\s+', ' ', ln).strip()
            if ln:
                out.append(ln)
        return out or ['...']

    def label_text(self, mapfile, textid, subs):
        """TEXT id on a map -> wrapped lines."""
        label = self.ptrs.get((mapfile, textid))
        if label is None:
            # trainer-talk labels sometimes live without pointers; try direct
            label = textid
        ops = self.resolve_ops(label)
        if not ops:
            # scripted/conditional signs: static fallback variant
            special = SPECIAL_TEXTS.get((mapfile, textid))
            if special:
                ops = self.resolve_ops(special)
        if not ops:
            # try raw label with/without underscore prefix variants
            for cand in (textid, '_' + textid, mapfile + textid):
                ops = self.resolve_ops(cand)
                if ops:
                    break
        if not ops:
            self.report['skipped_text'].append(f'{mapfile}:{textid}')
            return ['...']
        flowing = render_text_ops(ops, subs)
        lines = []
        for para in flowing.split('\n\n'):
            lines.extend(wrap_lines(para) or [''])
        return self.finalize_lines([ln for ln in lines if ln.strip()])

    def trainer_texts(self, mapfile, header_name, subs):
        """Trainer header name -> (intro, outtro, after) line lists."""
        headers = self.theaders.get(mapfile, {})
        h = headers.get(header_name)
        if not h:
            return ['...'], ['...'], []
        intro = self.ops_to_lines(h['battle'], subs)
        outtro = self.ops_to_lines(h['end'], subs)
        after = self.ops_to_lines(h['after'], subs)
        return intro, outtro, after

    def leader_texts(self, mapfile, opp, subs):
        """Gym leader script sub-labels -> (intro, outtro, after)."""
        base = mapfile + LEADER_SCRIPT[opp]
        badge = LEADER_BADGE[opp]
        def first(*labels):
            for lab in labels:
                ops = self.resolve_ops(lab)
                if ops:
                    flowing = render_text_ops(ops, subs)
                    lines = []
                    for para in flowing.split('\n\n'):
                        lines.extend(wrap_lines(para) or [''])
                    lines = self.finalize_lines([ln for ln in lines if ln.strip()])
                    if lines != ['...']:
                        return lines
            self.report['skipped_text'].append(labels[0])
            return ['...']
        intro = first(base + 'Text.PreBattleText', base + 'PreBattleText',
                      base + 'Text.BeforeBattleText', base + 'Text.Text')
        outtro = first(base + 'Text.Received' + badge + 'BadgeText',
                       base + 'Received' + badge + 'BadgeText')
        after = first(base + 'Text.PostBattleAdviceText',
                      base + 'PostBattleAdviceText',
                      base + 'Text.TM11ExplanationText')
        return intro, outtro, after

    def ops_to_lines(self, label, subs):
        ops = self.resolve_ops(label)
        if not ops:
            self.report['skipped_text'].append(label)
            return ['...']
        flowing = render_text_ops(ops, subs)
        lines = []
        for para in flowing.split('\n\n'):
            lines.extend(wrap_lines(para) or [''])
        return self.finalize_lines([ln for ln in lines if ln.strip()])

    # ------------------------------------------------------------ assembly
    def target_map_id(self, dest_const):
        """pokered map const -> remake MapId member (generated or hand-made)."""
        if dest_const == 'LAST_MAP':
            return None
        if dest_const in HANDMADE:
            return HANDMADE[dest_const]
        if dest_const in SKIP_MAPS or dest_const.startswith('UNUSED_MAP'):
            return None
        if dest_const not in self.dims:
            return None
        return const_to_member(dest_const)

    def subs_for(self, mapfile):
        city = pretty_name(self.r.const_of_file(mapfile)).upper()
        leader = {'CeruleanGym': 'MISTY', 'VermilionGym': 'LT.SURGE',
                  'CeladonGym': 'ERIKA', 'FuchsiaGym': 'KOGA',
                  'SaffronGym': 'SABRINA', 'CinnabarGym': 'BLAINE',
                  'ViridianGym': 'GIOVANNI', 'PewterGym': 'BROCK'}.get(mapfile, '')
        return {'wGymCityName': city, 'wGymLeaderName': leader,
                'wStringBuffer': '', '<PLAYER>': 'Blue', '<RIVAL>': 'Rival'}

    def assemble(self, mapfile):
        """Build all remake tables for a pokered map file stem."""
        const = self.r.const_of_file(mapfile)
        w, h = self.dims[const]
        tsname = self.r.tskey(self.r.tileset_of_map(mapfile))
        self.r.load_tileset(tsname)
        bst = self.r.blocks[tsname]
        nblocks = len(bst) // 16
        blk = open(f'{POKERED}/maps/{mapfile}.blk', 'rb').read()
        if len(blk) < w * h:
            # trust the file (e.g. NorthSouth is 4x23, consted 4x24)
            h = len(blk) // w
        coll = self.r.colls.get(self.r.tskey(tsname), set())
        grass_block = self.r.tsheaders.get(self.r.tskey(tsname), {}).get('grass')
        water = WATER_BLOCKS.get(tsname, set())
        cuttable = CUT_BLOCKS if tsname in CUT_TILESETS else set()
        obj = self.objects.get(mapfile, {'warps': [], 'bg': [], 'obj': []})
        subs = self.subs_for(mapfile)

        def block_at(bx, by):
            if 0 <= bx < w and 0 <= by < h:
                return blk[by * w + bx]
            return None

        walls, grass, water_t, cut = {}, {}, {}, {}

        def add(rec, tx, ty):
            rec.setdefault(ty, [])
            if tx not in rec[ty]:
                rec[ty].append(tx)

        warp_blocks = {(x, y) for x, y, _, _ in obj['warps']}
        for by in range(h):
            for bx in range(w):
                b = blk[by * w + bx]
                tiles = [(2 * bx + dx, 2 * by + dy) for dx in (0, 1) for dy in (0, 1)]
                if (bx, by) in warp_blocks:
                    continue  # warp tiles stay walkable
                if grass_block is not None and b == grass_block:
                    for tx, ty in tiles:
                        add(grass, tx, ty)
                    continue
                if b in water:
                    for tx, ty in tiles:
                        add(water_t, tx, ty)
                    continue
                if b in cuttable:
                    for tx, ty in tiles:
                        add(cut, tx, ty)
                    continue
                if b in coll:
                    for tx, ty in tiles:
                        add(walls, tx, ty)
        for rec in (walls, grass, water_t, cut):
            for k in rec:
                rec[k] = sorted(rec[k])

        # ---- warps: maps{} (doors) with plain MapId; ladders positioned
        maps_tbl, teleports_tbl = {}, {}
        reverse_links = []  # (dest_const, warp_index) for LAST_MAP resolution later
        dest_warps = {}     # filled in second pass
        for i, (x, y, dest, wid) in enumerate(obj['warps']):
            mid = self.target_map_id(dest)
            tiles = [(2 * x + dx, 2 * y + dy) for dx in (0, 1) for dy in (0, 1)]
            if dest == 'LAST_MAP':
                reverse_links.append((x, y))
                continue
            if mid is None:
                self.report['skipped_warp'].append(f'{mapfile} {x},{y} -> {dest}')
                continue
            # outdoor doors land on dest start; ladders/stairs need exact pos
            for tx, ty in tiles:
                maps_tbl.setdefault(ty, {})[tx] = ('POS', mid, dest, wid)

        # ---- signs
        text_tbl = {}
        for x, y, tid in obj['bg']:
            lines = self.label_text(mapfile, tid, subs)
            for tx in (2 * x, 2 * x + 1):
                text_tbl.setdefault(2 * y + 1, {})[tx] = lines

        # ---- trainers / items / flavor npcs / stationary
        trainers, items, npcs, stationary = [], [], [], []
        for o in obj['obj']:
            if o['sprite'] == 'POKE_BALL':
                item = o['item']
                if item and item in self.species_consts:
                    # disguised Voltorb/Electrode or stationary legendary
                    rid = self.species_id(item)
                    if rid is not None:
                        stationary.append({'id': rid, 'level': o.get('mon_level') or 40,
                                           'x': 2 * o['x'], 'y': 2 * o['y']})
                    self.report.setdefault('stationary', []).append(
                        f"{mapfile} {item} lv{o['mon_level']} at {o['x']},{o['y']}")
                    continue
                member = self.item_member(item) if item else None
                if member:
                    items.append({'item': member, 'x': 2 * o['x'], 'y': 2 * o['y'] + 1})
                else:
                    self.report['skipped_item'].append(f"{mapfile} ball {o['x']},{o['y']}")
                continue
            if not o['opp']:
                if o['item'] and o['item'] in self.species_consts:
                    rid = self.species_id(o['item'])
                    if rid is not None:
                        stationary.append({'id': rid, 'level': o.get('mon_level') or 30,
                                           'x': 2 * o['x'], 'y': 2 * o['y']})
                    self.report.setdefault('stationary', []).append(
                        f"{mapfile} {o['item']} lv{o['mon_level']} at {o['x']},{o['y']}")
                    continue
                if o['sprite'] == 'BLUE' and mapfile in RIVAL_SPOTS:
                    tier, il, ol, al, money, extra = RIVAL_SPOTS[mapfile]
                    intro, outtro, after = (self.ops_to_lines(il, subs), self.ops_to_lines(ol, subs),
                                            self.ops_to_lines(al, subs))
                    gname, gidx = RIVAL_PLACEHOLDER[tier]
                    party = []
                    for lvl, mon in self.parties[gname][gidx]:
                        rid = self.species_id(mon)
                        if rid is not None:
                            party.append({'id': rid, 'level': lvl})
                    entry = {'npc': 'rival', 'rivalTier': tier, 'party': party,
                             'money': money, 'x': 2 * o['x'], 'y': 2 * o['y'],
                             'facing': FACING.get(o['face'], 'Down'),
                             'intro': intro, 'outtro': outtro,
                             'postGame': {'message': after + extra}}
                    trainers.append(entry)
                    continue
                if o['sprite'] == 'BLUE':
                    self.report['rival_fights'].append(f"{mapfile} rival NPC {o['x']},{o['y']}")
                elif o['sprite'] == 'SNORLAX':
                    stationary.append({'id': 143, 'level': 30,
                                       'x': 2 * o['x'], 'y': 2 * o['y']})
                    lines = self.label_text(mapfile, o['text'], subs)
                    text_tbl.setdefault(2 * o['y'], {})[2 * o['x']] = lines
                elif o['sprite'] in INANIMATE_SPRITES:
                    lines = self.label_text(mapfile, o['text'], subs)
                    text_tbl.setdefault(2 * o['y'], {})[2 * o['x']] = lines
                else:
                    key = FLAVOR_NPC.get(o['sprite'])
                    if key is None:
                        self.report['skipped_npc'].append(f"{mapfile} {o['sprite']} {o['x']},{o['y']}")
                        continue
                    lines = self.label_text(mapfile, o['text'], subs)
                    npcs.append({'npc': key, 'x': 2 * o['x'], 'y': 2 * o['y'],
                                 'facing': FACING.get(o['face'], 'Down')})
                    text_tbl.setdefault(2 * o['y'], {})[2 * o['x']] = lines
                continue
            if o['opp'] in ('RIVAL1', 'RIVAL2', 'RIVAL3'):
                if mapfile in RIVAL_SPOTS:
                    tier, il, ol, al, money, extra = RIVAL_SPOTS[mapfile]
                    intro, outtro, after = (self.ops_to_lines(il, subs), self.ops_to_lines(ol, subs),
                                            self.ops_to_lines(al, subs))
                    gname, gidx = RIVAL_PLACEHOLDER[tier]
                    party = []
                    for lvl, mon in self.parties[gname][gidx]:
                        rid = self.species_id(mon)
                        if rid is not None:
                            party.append({'id': rid, 'level': lvl})
                    trainers.append({'npc': 'rival', 'rivalTier': tier, 'party': party,
                                     'money': money, 'x': 2 * o['x'], 'y': 2 * o['y'],
                                     'facing': FACING.get(o['face'], 'Down'),
                                     'intro': intro, 'outtro': outtro,
                                     'postGame': {'message': after + extra}})
                    continue
                self.report['rival_fights'].append(f"{mapfile} {o['x']},{o['y']} {o['opp']} party {o['party']}")
                continue
            npc = OPP_NPC.get(o['opp'])
            group = opp_party_group(o['opp'], self.parties)
            if npc is None or group is None or o['party'] is None or o['party'] >= len(group) or o['party'] < 0:
                self.report['skipped_trainer'].append(f"{mapfile} {o['opp']} party {o['party']}")
                continue
            party = []
            ok = True
            for lvl, mon in group[o['party']]:
                rid = self.species_id(mon)
                if rid is None:
                    ok = False
                    break
                party.append({'id': rid, 'level': lvl})
            if not ok or not party:
                self.report['skipped_trainer'].append(f"{mapfile} {o['opp']} party {o['party']} (species)")
                continue
            money = max(30, self.opp_money_base(opp_money_key(o['opp'])) // 100 * party[-1]['level'])
            if (mapfile, o['text']) in CUSTOM_TRAINERS:
                il, ol, al, citems = CUSTOM_TRAINERS[(mapfile, o['text'])]
                intro, outtro, after = (self.ops_to_lines(il, subs), self.ops_to_lines(ol, subs),
                                        self.ops_to_lines(al, subs))
                entry_items = citems
                custom_hit = True
            elif o['opp'] in LEADER_REWARDS:
                intro, outtro, after = self.leader_texts(mapfile, o['opp'], subs)
                custom_hit = False
            else:
                custom_hit = False
                script_label = self.ptrs.get((mapfile, o['text']), o['text'])
                header = self.text_to_header.get((mapfile, script_label))
                if header is None:
                    # quiz-gym style: sub-labels directly under the talk script
                    sub = lambda s: self.ops_to_lines(script_label + '.' + s, subs)
                    intro, outtro, after = sub('BattleText'), sub('EndBattleText'), sub('AfterBattleText')
                    if intro == ['...'] and outtro == ['...']:
                        self.report['skipped_text'].append(f'{mapfile} header for {o["text"]}')
                else:
                    intro, outtro, after = self.trainer_texts(mapfile, header, subs)
            entry = {'npc': npc, 'opp': o['opp'], 'party': party,
                     'money': money, 'x': 2 * o['x'], 'y': 2 * o['y'],
                     'facing': FACING.get(o['face'], 'Down'),
                     'intro': intro, 'outtro': outtro}
            if o['opp'] in LEADER_REWARDS and 'Gym' in mapfile:
                (items_rw, line) = LEADER_REWARDS[o['opp']]
                entry['postGame'] = {'message': after + [line], 'items': items_rw}
            elif (mapfile, o['text']) in CUSTOM_TRAINERS:
                citems = CUSTOM_TRAINERS[(mapfile, o['text'])][3]
                if citems:
                    entry['postGame'] = {'message': after, 'items': citems}
                elif after and after != ['...']:
                    entry['postGame'] = {'message': after}
            elif after and after != ['...']:
                entry['postGame'] = {'message': after}
            trainers.append(entry)

        # ---- marts & centers
        mart_stock = self.marts.get(mapfile, [])
        store_items = []
        for it in mart_stock:
            if it in self.tm_tables:
                member = self.tm_tables[it]
            else:
                parts = it.lower().split('_')
                member = parts[0].capitalize() + ''.join(p.capitalize() for p in parts[1:])
            if member in self.itemtypes:
                if member not in store_items:
                    store_items.append(member)
            else:
                self.report['skipped_item'].append(f'{mapfile} mart {it}')
        mart = {'store': None, 'items': store_items} if store_items else None
        center = None
        for o in obj['obj']:
            if o['sprite'] == 'CLERK' and mart:
                for cand in ((2 * o['x'] + 1, 2 * o['y'] + 1), (2 * o['x'], 2 * o['y'] + 1)):
                    # clerk tile whose east neighbor is walkable (player side)
                    if self._walkable_tbl(walls, 2 * w, 2 * h, cand[0] + 1, cand[1]):
                        mart['store'] = cand
                        break
                if mart['store'] is None:
                    mart['store'] = (2 * o['x'] + 1, 2 * o['y'] + 1)
            if o['sprite'] == 'NURSE':
                center = {'nurse': (o['x'], o['y'])}
        # pc tile: rightmost solid block of block-row 1
        pc_tile = None
        if center is not None:
            row = [bx for bx in range(w) if blk[1 * w + bx] in coll] if h > 1 else []
            if row:
                pc_tile = (2 * max(row) + 1, 3)
            nx, ny = center['nurse']
            cands = [(2 * nx, 2 * ny + 1), (2 * nx + 1, 2 * ny + 1)]
            # pokemonCenter tile needs walkable tile below (player stands there)
            poke_tile = None
            for cx, cy in cands:
                if self._walkable_tbl(walls, 2 * w, 2 * h, cx, cy + 1):
                    poke_tile = (cx, cy)
                    break
            center['tile'] = poke_tile or cands[0]
            center['pc'] = pc_tile

        # ---- encounters
        encounters = self.build_encounters(const)

        # ---- music / meta
        song = self.songs.get(const, '')
        music = SONG_MP3.get(song, 'route-3.mp3')
        cave = tsname in ('CAVERN', 'UNDERGROUND')

        return {'const': const, 'file': mapfile, 'w': w, 'h': h, 'ts': tsname,
                'walls': walls, 'grass': grass, 'water': water_t, 'cut': cut,
                'maps': maps_tbl, 'warps_raw': obj['warps'], 'reverse_links': reverse_links,
                'text': text_tbl, 'trainers': trainers, 'items': items,
                'npcs': npcs, 'stationary': stationary,
                'encounters': encounters, 'music': music, 'cave': cave,
                'name': pretty_name(const), 'subs': subs,
                'mart': mart, 'center': center}

    def build_encounters(self, const):
        stem = self.r.file_of_const(const)
        key = resolve_wild_key(stem, self.order)
        wild = self.wild.get(key or '', {'rate': 0, 'mons': [], 'water_rate': 0, 'water': []})
        def conv(mons):
            out = []
            for i, (lvl, mon) in enumerate(mons[:10]):
                rid = self.species_id(mon)
                if rid is None:
                    continue
                out.append({'id': rid, 'chance': SLOT_CHANCE[i] if i < len(SLOT_CHANCE) else 5,
                            'minLevel': lvl, 'maxLevel': lvl})
            return out
        walk = {'rate': wild['rate'], 'pokemon': conv(wild['mons'])}
        surf = {'rate': wild['water_rate'], 'pokemon': conv(wild['water'])}
        empty = {'rate': 0, 'pokemon': []}
        return {'walk': walk, 'oldRod': dict(empty), 'goodRod': dict(empty),
                'superRod': dict(empty), 'surf': surf, 'rockSmash': dict(empty),
                'headbutt': dict(empty), 'darkGrass': dict(empty), 'grassSpots': dict(empty),
                'caveSpots': dict(empty), 'bridgeSpots': dict(empty),
                'superRodSpots': dict(empty), 'surfSpots': dict(empty),
                'yellowFlowers': dict(empty), 'purpleFlowers': dict(empty),
                'redFlowers': dict(empty), 'roughTerrain': dict(empty),
                'gift': dict(empty), 'giftEgg': dict(empty), 'onlyOne': dict(empty)}

    # ------------------------------------------------------------ pass 2
    def resolve_all(self, targets):
        """Assemble + cross-link warps/connections for target map consts."""
        asm = {}
        # also assemble hand-made equivalents (for links inward, not emitted)
        wanted = list(dict.fromkeys(list(targets) + list(HANDMADE)))
        for const in wanted:
            try:
                asm[const] = self.assemble(self.r.file_of_const(const))
            except Exception as e:
                print(f'  ASSEMBLE FAIL {const}: {e}')
        # index: dest const -> list of (src_const, x, y) outdoor door warps
        reverse = {}
        for const, a in asm.items():
            for x, y, dest, wid in a['warps_raw']:
                if dest == 'LAST_MAP' or dest not in self.dims:
                    continue
                reverse.setdefault(dest, []).append((const, x, y))
        for const, a in asm.items():
            self.resolve_warps(a, asm, reverse)
            self.resolve_connections(a, asm)
        return asm

    def dest_warp_tile(self, asm, dest_const, wid):
        """Nth (1-based) warp tile of dest map in remake tiles, or None."""
        da = asm.get(dest_const)
        if da is None:
            return None
        warps = [w for w in da['warps_raw'] if w[2] != 'LAST_MAP' or True]
        # warp ids count ALL warp_events in file order (1-based)
        if wid < 1 or wid > len(da['warps_raw']):
            return None
        x, y, _, _ = da['warps_raw'][wid - 1]
        return (2 * x, 2 * y + 1)

    def resolve_warps(self, a, asm, reverse):
        maps_tbl = a['maps']
        # direct warps
        for x, y, dest, wid in a['warps_raw']:
            tiles = [(2 * x + dx, 2 * y + dy) for dx in (0, 1) for dy in (0, 1)]
            if dest == 'LAST_MAP':
                continue  # handled below via reverse links
            mid = self.target_map_id(dest)
            if mid is None:
                continue
            pos = self.dest_warp_tile(asm, dest, wid)
            for tx, ty in tiles:
                if pos is None:
                    maps_tbl.setdefault(ty, {})[tx] = ('ID', mid)
                else:
                    maps_tbl.setdefault(ty, {})[tx] = ('POS', mid, pos[0], pos[1])
        # LAST_MAP doors: exits + exitReturn via reverse index
        if a['reverse_links']:
            outs = reverse.get(a['const'], [])
            if outs:
                src_const, ox, oy = outs[0]
                src_mid = self.target_map_id(src_const)
                a['exitReturnMap'] = src_mid
                a['exitReturnPos'] = (2 * ox, 2 * oy + 1)
                for x, y in a['reverse_links']:
                    for tx in (2 * x, 2 * x + 1):
                        a.setdefault('exits', {}).setdefault(2 * y + 1, [])
                        if tx not in a['exits'][2 * y + 1]:
                            a['exits'][2 * y + 1].append(tx)
        # default exitReturn: south connection or first warp dest
        if 'exitReturnMap' not in a:
            a['exitReturnMap'] = None
            a['exitReturnPos'] = None

    @staticmethod
    def _walkable_tbl(walls, W, H, tx, ty):
        if not (0 <= tx < W and 0 <= ty < H):
            return False
        return not (ty in walls and tx in walls[ty])

    def walkable(self, a, tx, ty):
        W, H = a['w'] * 2, a['h'] * 2
        if not (0 <= tx < W and 0 <= ty < H):
            return False
        if ty in a['walls'] and tx in a['walls'][ty]:
            return False
        return True

    def inward_dest(self, a, tx, ty, dx, dy):
        """Step inward from an edge tile to a safe landing tile."""
        for i in range(1, 6):
            nx, ny = tx + dx * i, ty + dy * i
            if self.walkable(a, nx, ny):
                # avoid landing on another edge trigger row/col
                return (nx, ny)
        return None

    def resolve_connections(self, a, asm):
        mapfile = a['file']
        headers = self.headers.get(mapfile, (None, []))[1]
        W, H = a['w'], a['h']
        for direction, destfile, destconst, off in headers:
            if destconst in SKIP_MAPS or destconst.startswith('UNUSED_MAP'):
                continue
            da = asm.get(destconst)
            if da is None:
                continue
            DW, DH = da['w'], da['h']
            handmade_dest = destconst in HANDMADE
            if direction == 'north':
                for bx in range(W):
                    nbx = bx - off
                    if 0 <= nbx < DW:
                        for tx in (2 * bx, 2 * bx + 1):
                            if not self.walkable(a, tx, 0):
                                continue
                            if handmade_dest:
                                # hand-made maps are custom-sized: land on start
                                a['maps'].setdefault(0, {})[tx] = ('ID', const_to_member(destconst))
                                continue
                            dest = self.inward_dest(da, 2 * nbx, DH * 2 - 1, 0, -1)
                            if dest:
                                a['maps'].setdefault(0, {})[tx] = ('POS', const_to_member(destconst), dest[0], dest[1])
            elif direction == 'south':
                for bx in range(W):
                    nbx = bx - off
                    if 0 <= nbx < DW:
                        for tx in (2 * bx, 2 * bx + 1):
                            if not self.walkable(a, tx, H * 2 - 1):
                                continue
                            if handmade_dest:
                                a['maps'].setdefault(H * 2 - 1, {})[tx] = ('ID', const_to_member(destconst))
                                continue
                            dest = self.inward_dest(da, 2 * nbx, 0, 0, 1)
                            if dest:
                                a['maps'].setdefault(H * 2 - 1, {})[tx] = ('POS', const_to_member(destconst), dest[0], dest[1])
            elif direction == 'west':
                for by in range(H):
                    nby = by - off
                    if 0 <= nby < DH:
                        for ty in (2 * by, 2 * by + 1):
                            if not self.walkable(a, 0, ty):
                                continue
                            if handmade_dest:
                                a['maps'].setdefault(ty, {})[0] = ('ID', const_to_member(destconst))
                                continue
                            dest = self.inward_dest(da, DW * 2 - 1, 2 * nby, -1, 0)
                            if dest:
                                a['maps'].setdefault(ty, {})[0] = ('POS', const_to_member(destconst), dest[0], dest[1])
            elif direction == 'east':
                for by in range(H):
                    nby = by - off
                    if 0 <= nby < DH:
                        for ty in (2 * by, 2 * by + 1):
                            if not self.walkable(a, W * 2 - 1, ty):
                                continue
                            if handmade_dest:
                                a['maps'].setdefault(ty, {})[W * 2 - 1] = ('ID', const_to_member(destconst))
                                continue
                            dest = self.inward_dest(da, 0, 2 * nby, 1, 0)
                            if dest:
                                a['maps'].setdefault(ty, {})[W * 2 - 1] = ('POS', const_to_member(destconst), dest[0], dest[1])
        # default exitReturn = first south connection, else first warp dest
        if a.get('exitReturnMap') is None:
            for direction, destfile, destconst, off in headers:
                mid = self.target_map_id(destconst)
                if mid and direction == 'south':
                    da = asm.get(destconst)
                    a['exitReturnMap'] = mid
                    if da is not None and destconst not in HANDMADE:
                        land = self.inward_dest(da, da['w'], 0, 0, 1)
                        a['exitReturnPos'] = land or (4, 2)
                    else:
                        a['exitReturnPos'] = (4, 2)
                    break

    # ------------------------------------------------------------ write
    def compute_start(self, a):
        W, H = a['w'] * 2, a['h'] * 2
        warps = [(x, y, d, i) for x, y, d, i in a['warps_raw'] if d == 'LAST_MAP']
        if warps:
            x, y, _, _ = warps[0]
            return (2 * x, 2 * y + 1)
        # south edge center, else map center walkable
        for tx in (W // 2, W // 2 - 1, W // 2 + 1):
            if self.walkable(a, tx, H - 2):
                return (tx, H - 2)
        for ty in range(H):
            for tx in range(W):
                if self.walkable(a, tx, ty):
                    return (tx, ty)
        return (2, 2)

    @staticmethod
    def rec_str(rec):
        if not rec:
            return '{}'
        parts = []
        for k in sorted(rec):
            parts.append(f'    {k}: [{", ".join(str(v) for v in rec[k])}],')
        return '{\n' + '\n'.join(parts) + '\n  }'

    @staticmethod
    def ts_str(s):
        return s.replace('\\', '\\\\').replace('"', '\\"')

    def maps_str(self, maps_tbl):
        if not maps_tbl:
            return '{}'
        parts = []
        for y in sorted(maps_tbl):
            inner = []
            for x in sorted(maps_tbl[y]):
                v = maps_tbl[y][x]
                if v[0] == 'ID':
                    inner.append(f'{x}: MapId.{v[1]}')
                else:
                    inner.append(f'{x}: {{ map: MapId.{v[1]}, pos: {{ x: {v[2]}, y: {v[3]} }} }}')
            parts.append(f'    {y}: {{\n      ' + ',\n      '.join(inner) + ',\n    },')
        return '{\n' + '\n'.join(parts) + '\n  }'

    def text_str(self, text_tbl):
        if not text_tbl:
            return '{}'
        parts = []
        for y in sorted(text_tbl):
            inner = []
            for x in sorted(text_tbl[y]):
                lines = ', '.join(f'"{self.ts_str(ln)}"' for ln in text_tbl[y][x])
                inner.append(f'{x}: [{lines}]')
            parts.append(f'    {y}: {{\n      ' + ',\n      '.join(inner) + ',\n    },')
        return '{\n' + '\n'.join(parts) + '\n  }'

    def trainers_str(self, trainers):
        if not trainers:
            return '[]'
        out = []
        for t in trainers:
            intro = ', '.join(f'"{self.ts_str(s)}"' for s in t['intro'])
            outtro = ', '.join(f'"{self.ts_str(s)}"' for s in t['outtro'])
            party = ', '.join('{ id: %d, level: %d }' % (p['id'], p['level']) for p in t['party'])
            s = ('    {\n      npc: %s,\n' % (t['npc'],))
            if 'rivalTier' in t:
                s += '      rivalTier: %d,\n' % t['rivalTier']
            s += ('      facing: Direction.%s,\n'
                 '      pokemon: [%s],\n      intro: [%s],\n      outtro: [%s],\n'
                 '      money: %d,\n      pos: { x: %d, y: %d },' % (
                     t['facing'], party, intro, outtro, t['money'], t['x'], t['y']))
            if 'postGame' in t:
                msg = ', '.join(f'"{self.ts_str(m)}"' for m in t['postGame']['message'])
                if 'items' in t['postGame']:
                    items = ', '.join(f'ItemType.{i}' for i in t['postGame']['items'])
                    s += f'\n      postGame: {{ message: [{msg}], items: [{items}] }},'
                else:
                    s += f'\n      postGame: {{ message: [{msg}] }},'
            s += '\n    },'
            out.append(s)
        return '[\n' + '\n'.join(out) + '\n  ]'

    def items_str(self, items):
        if not items:
            return '[]'
        return '[\n' + '\n'.join(
            '    { item: ItemType.%s, pos: { x: %d, y: %d } },' % (i['item'], i['x'], i['y'])
            for i in items) + '\n  ]'

    def npcs_str(self, npcs):
        if not npcs:
            return '[]'
        return '[\n' + '\n'.join(
            '    { npc: %s, pos: { x: %d, y: %d }, facing: Direction.%s },' % (
                n['npc'], n['x'], n['y'], n['facing']) for n in npcs) + '\n  ]'

    def stationary_str(self, spots):
        if not spots:
            return '[]'
        return '[\n' + '\n'.join(
            '    { id: %d, level: %d, pos: { x: %d, y: %d } },' % (
                s['id'], s['level'], s['x'], s['y']) for s in spots) + '\n  ]'

    def encounters_str(self, enc):
        def one(e):
            mons = ', '.join(
                '{ id: %d, chance: %d, conditionValues: [], minLevel: %d, maxLevel: %d }' % (
                    m['id'], m['chance'], m['minLevel'], m['maxLevel']) for m in e['pokemon'])
            return '{ rate: %d, pokemon: [%s] }' % (e['rate'], mons)
        return '{ ' + ', '.join(f'{k}: {one(enc[k])}' for k in ENCOUNTER_KEYS) + ' }'

    def emit_ts(self, a):
        slug = const_to_slug(a['const'])
        member = const_to_member(a['const'])
        W, H = a['w'] * 2, a['h'] * 2
        start = self.compute_start(a)
        needs_dir = bool(a['trainers']) or bool(a.get('npcs'))
        needs_item = (bool(a['items']) or bool((a.get('mart') or {}).get('items'))
                      or any('postGame' in t and 'items' in t['postGame'] for t in a['trainers']))
        lines = []
        lines.append(f'import {slug.replace("-", "")}Image from "../../assets/map/gen/{slug}.png";')
        lines.append('import { MapId, MapType } from "../map-types";')
        if needs_dir:
            lines.append('import { Direction } from "../../state/state-types";')
        npcs = sorted({t['npc'] for t in a['trainers']} | {n['npc'] for n in a.get('npcs', [])})
        if npcs:
            lines.append('import { %s } from "../../app/npcs";' % ', '.join(npcs))
        if needs_item:
            lines.append('import { ItemType } from "../../app/use-item-data";')
        lines.append(f'import music from "../../assets/music/maps/{a["music"]}";')
        lines.append('')
        lines.append(f'// Generated from pret/pokered {a["const"]} - do not hand-edit.')
        lines.append(f'const {member[0].lower() + member[1:]}: MapType = {{')
        lines.append(f'  name: "{a["name"]}",')
        lines.append(f'  image: {slug.replace("-", "")}Image,')
        lines.append(f'  height: {H},')
        lines.append(f'  width: {W},')
        lines.append(f'  start: {{ x: {start[0]}, y: {start[1]} }},')
        lines.append(f'  walls: {self.rec_str(a["walls"])},')
        lines.append(f'  text: {self.text_str(a["text"])},')
        lines.append(f'  maps: {self.maps_str(a["maps"])},')
        if a.get('exits'):
            lines.append(f'  exits: {self.rec_str(a["exits"])},')
        else:
            lines.append('  exits: {},')
        if a['cave']:
            lines.append('  cave: true,')
        if a.get('exitReturnMap'):
            erp = a.get('exitReturnPos') or (4, 2)
            lines.append(f'  exitReturnMap: MapId.{a["exitReturnMap"]},')
            lines.append(f'  exitReturnPos: {{ x: {erp[0]}, y: {erp[1]} }},')
        lines.append('  music,')
        lines.append(f'  encounters: {self.encounters_str(a["encounters"])},')
        lines.append('  grass: %s,' % self.rec_str(a['grass']))
        if a['water']:
            lines.append('  water: %s,' % self.rec_str(a['water']))
        if a['cut']:
            lines.append('  cut: %s,' % self.rec_str(a['cut']))
        if a['trainers']:
            lines.append(f'  trainers: {self.trainers_str(a["trainers"])},')
        if a['items']:
            lines.append(f'  items: {self.items_str(a["items"])},')
        if a.get('npcs'):
            lines.append(f'  npcs: {self.npcs_str(a["npcs"])},')
        if a.get('stationary'):
            lines.append(f'  stationary: {self.stationary_str(a["stationary"])},')
        mart = a.get('mart')
        if mart and mart.get('store') and mart.get('items'):
            sx, sy = mart['store']
            lines.append(f'  store: {{ x: {sx}, y: {sy} }},')
            lines.append('  storeItems: [%s],' % ', '.join(f'ItemType.{m}' for m in mart['items']))
        center = a.get('center')
        if center and center.get('tile'):
            cx, cy = center['tile']
            lines.append(f'  pokemonCenter: {{ x: {cx}, y: {cy} }},')
            if center.get('pc'):
                lines.append(f'  pc: {{ x: {center["pc"][0]}, y: {center["pc"][1]} }},')
        lines.append('};')
        lines.append('')
        lines.append(f'export default {member[0].lower() + member[1:]};')
        lines.append('')
        return '\n'.join(lines), slug, member

    def write_all(self, asm, render=True):
        os.makedirs(GEN_TS, exist_ok=True)
        os.makedirs(GEN_IMG, exist_ok=True)
        reg = []
        for const, a in asm.items():
            ts, slug, member = self.emit_ts(a)
            with open(f'{GEN_TS}/{slug}.ts', 'w') as f:
                f.write(ts)
            if render:
                img, stats = self.r.render_color(const, out_path=f'{GEN_IMG}/{slug}.png')
                print(f'  {slug}: {len(a["trainers"])} trainers, {len(a["items"])} items, '
                      f'{len(a.get("npcs", []))} npcs, {len(a.get("stationary", []))} stationary, '
                      f'{sum(len(v) for v in a["text"].values())} signs, img {img.size} {stats}')
            reg.append((member, slug))
        return reg


def parse_marts():
    """mart map file stem -> [item consts] (merged across clerks)."""
    out = {}
    cur = None
    for raw in open(f'{POKERED}/data/items/marts.asm'):
        line = raw.split(';')[0].strip()
        m = re.match(r'^(\w+)Clerk\d*Text::$', line)
        if m:
            cur = None
            stem = m.group(1)
            # e.g. CeruleanMart, CeladonMart2F, IndigoPlateauLobby
            if stem.endswith('Mart') or stem.endswith('Lobby') or 'Shop' in stem:
                cur = stem
                out.setdefault(cur, [])
            continue
        if cur:
            m = re.match(r'\s*script_mart\s+(.*)', line)
            if m:
                out[cur].extend(t.strip() for t in m.group(1).split(','))
    return out


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--map', action='append', default=[])
    ap.add_argument('--all-targets', action='store_true')
    ap.add_argument('--no-render', action='store_true')
    ap.add_argument('--registry', action='store_true')
    args = ap.parse_args()

    r = Renderer()
    r.learn_palettes()
    em = Emitter(r)
    if args.all_targets:
        targets = [c for c in em.order
                   if c not in HANDMADE and c not in SKIP_MAPS and not c.startswith('UNUSED_MAP')]
    else:
        targets = args.map or ['ROUTE_4']
    print(f'{len(targets)} target maps')
    asm = em.resolve_all(targets)
    reg = em.write_all(asm, render=not args.no_render)
    if args.registry:
        print('---REGISTRY-START---')
        for member, slug in sorted(reg):
            var = member[0].lower() + member[1:]
            print(f'IMP:{var}:{slug}')
            print(f'ENTRY:{member}:{var}')
        print('---REGISTRY-END---')
    print('report keys:', {k: len(v) for k, v in em.report.items()})
    for k, v in em.report.items():
        for item in v[:15]:
            print(f'  {k}: {item}')


if __name__ == '__main__' and not ('--render-test' in sys.argv or '--learn' in sys.argv):
    main()

