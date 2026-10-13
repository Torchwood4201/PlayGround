# Asset pointers (2026 build: real WebGL, vendored engine + art)

The game (`game.js`, ES module) runs on **three.js r160 vendored** in `vendor/`
(`three.module.js` + `addons/` GLTFLoader/BufferGeometryUtils, ~1.4 MB) —
fully offline, no CDN. Twelve validated levels live in `levels.js`
(`validate-levels.mjs` proves borders, spawn/exit and flood-fill connectivity).

## 0. Vendored in `assets/` (CC0, safe to ship — ~2.4 MB total)

- `assets/tex/*.png` — 6 tileable ambientCG color maps at 256px
  (brick/concrete/metal/wood/rock/plaster), one per wall type (`KITWALL`).
  Downscaled from the 2K JPGs via headless-Chromium canvas (no PIL/ffmpeg here).
- `assets/vm/pump.png` + `rifle.png` — Flat Guns West GLBs rendered to
  transparent viewmodel sprites with three.js r160 (headless WebGL), cropped
  to alpha bbox (4 KB + 11 KB). Muzzle flash composited at load.
- `assets/sfx/shot-pump.wav` + `shot-rifle.wav` — Mossberg / AR-15 field
  recordings resampled 96kHz/24-bit stereo → 22kHz/16-bit mono, trimmed and
  capped at 1 s (44 KB each). Synth SFX remains the fallback.
- `assets/sfx/stepL.ogg` / `stepR.ogg` — Fantozzi stone footsteps, alternated
  every ~2.4 units walked (post-gesture only; demo stays silent).
- `assets/glb/*.glb` — 5 Flat Guns West models loaded live as camera-attached
  viewmodels (pistol/pump/rifle/smg/sniper, ~1.3 MB). The old `assets/vm/`
  pre-rendered PNGs are superseded but kept as fallback reference.

## 1. FPS Asset Kit (CC0 — safe to use commercially)
- Repo: https://github.com/petroulacl/fps-asset-kit.git (`a19b745`, ~1.1GB)
- Local checkout used for reference: `/tmp/opencode/fps-asset-kit`
- ⚠️ **LFS caveat:** the kit tracks `*.png/*.jpg/*.wav/*.glb/...` via Git LFS
  (see its `.gitattributes`). A plain `--depth 1` clone leaves
  `sfx/gunshots/*.wav` as HTML "Freesound - Login" stubs (17KB, unusable) —
  hence synth gunshots in-game. Real: texture JPGs (e.g. 2048px), weapon GLBs
  (120–460KB, need a Three.js renderer — not wired into this canvas engine),
  `sfx/firearm_sfx/*.wav` (24-bit/96kHz, 2.6MB+ each — too heavy to vendor),
  footstep OGGs (real, ~9KB — vendored, see §0).
- Contents: 24 ambientCG PBR texture sets (`textures/`), 20 Flat-Guns
  models in GLB/FBX/OBJ (`weapons/flat_guns_{west,east}/`), firearm + footstep
  SFX (`sfx/`), HDRIs via `download_hdris.py`.
- To upgrade this prototype: copy ONE texture set (e.g.
  `textures/Concrete048/*_Color.jpg`) and ONE GLB (e.g.
  `weapons/flat_guns_west/Flat Guns West/GLB/Rifle_Assault_West.glb`)
  into `assets/` and wire to a Three.js build. Do not commit the full 1.6GB.

## 2. id Software sources (reference only, need retail data)
- https://github.com/id-Software/DOOM.git (`a77dfb9`, linuxdoom-1.10 + ipx/sersrc, GPL)
- https://code.idtech.space/id/doom.git (`0075ace`, pristine 1997 release)
- https://github.com/id-Software/DOOM-3.git (`a9c49da`, true-3D C++ engine, GPL 2011)
- Local checkouts: `/tmp/opencode/{DOOM,DOOM-3,idtech-doom}`

## 3. DOOM sprites — Spriters-Resource (copyrighted, DO NOT commit)
- Index: https://www.spriters-resource.com/ms_dos/doomdoomii/ (35 sheets)
- `game.js:loadCustomSprites()` auto-loads these **optional** drop-ins if YOU
  add them locally (loader ignores 404, nothing ships in git):
  - `sprites/imp.png` — enemy (e.g. asset/27878 Troopers / 234945 Imp)
  - `sprites/demon.png` — enemy (e.g. asset/234240 Demon / 234161 Pinky)
  - `sprites/baron.png` — boss (e.g. asset/234154 Baron / 234335 Knights)
  - `sprites/shotgun.png` — viewmodel (e.g. asset/4111 Weapons)
- Full pasted set covers: enemies, weapons, HUD (27913), pickups (27912),
  projectiles/effects (91724), palette (221688), widescreen gfx (206731),
  incinerator/calamity (233315). Rips belong to Bethesda/id — local
  prototype/reference only. Prefer extracting from a WAD you own
  (SLADE/wadextract) over redistributing PNG rips.
