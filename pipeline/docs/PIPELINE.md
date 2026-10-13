# Pipeline docs

## NAMING
- Assets: `<category>_<name>` (e.g. `enemy_imp`, `wall_brick`, `gun_rifle`).
- Finals: `<id>_low.glb`, `<id>_{albedo,normal,orm,mask}.png`.
- Interim (`pipeline/out/<id>/`, gitignored): `block.obj/json`, `high.obj/json`,
`height.png/json`, `low.obj/json`, `uv.json`, `bake.json`, `export.json`,
`manifest.json` (stage log).
- Bones: Unity-ready Generic names (`Hips, Spine, Head, Jaw, …Pads, …Arm,
…Thigh, …Shin`). Clips: `walk` (0.6s loop), `hurt` (0.15s), `dead` (0.22s),
`attack` (0.5s, baron only).

## BUDGETS (see `catalog.json` — source of truth)
- Enemies 2.5–6.5k tris @1024 · guns 1.5–3k @1024 · walls 12 tris/tile @1024 ·
floor/ceiling 2 tris @1024 · props 300–800 @512 · projectiles ≤200 @256
emissive-only. Scene ≈25–35k tris.

## Stage 7 deviation (approved rationale)
Plan named `s7_rig_export.mjs` (browser GLTFExporter roundtrip). Shipped
`s7_rig_export.py` instead: pure-Python glTF 2.0 writer is deterministic
headless with no browser dependency; output verified by real three.js
`GLTFLoader` (skins + clips load, walk plays, bind pose correct). Vendored
`GLTFExporter` remains for preview/roundtrip use.

## Channel packing
- `orm.png` (three preview): R=AO, G=roughness, B=metalness.
- `mask.png` (Unity MaskMap): R=metal, G=AO, B=128, A=smoothness (1−rough).
- Normals are OpenGL +Y; flip Y on Unity import if lighting inverts.

## Fidelity ceiling (honest)
Detail is statistical (subdivision + analytic displacement), not sculpted.
Enemies read stylized/blocky — the web billboard fallback stays until Unity
AI proves out. Sobel normals lack undercuts; URP looks flatter than Substance.
