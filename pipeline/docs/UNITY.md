# Unity import guide (PlayGround pipeline output)

## Project setup
1. Unity **2022.3+ LTS** with the **URP template** (or install URP into a 3D project).
2. Color space: **Linear** (`Project Settings > Player > Color Space`).
3. Install glB import: Package Manager > `+` > Add package from git URL >
`https://github.com/KhronosGroup/UnityGLTF.git` (provides `GLTFSceneImporter`).
4. Copy this repo's `unity/Assets/PlayGround/` into your project's `Assets/`.

## After import
- Textures: `_albedo` must be **sRGB**, `_normal` set **Texture Type = Normal Map**,
`_orm`/`_mask` linear (sRGB off). SmokeTest checks this.
- Materials: create **URP/Lit** materials per asset:
  - Base Map ← `*_albedo`; Normal Map ← `*_normal` (if lighting looks inverted,
    flip **Normal Scale Y** — our normals are OpenGL +Y);
  - Metallic ← `*_mask.R`, Occlusion ← `*_mask.G`,
    Smoothness source = Mask alpha (`*_mask.A` = 1 − roughness).
  - Projectiles/medkit: enable **Emission** with the albedo as Emission Map.
- Rigs: enemy glBs contain skins + clips (`walk` 0.6s loop, `hurt` 0.15s,
`dead` 0.22s, baron `attack` 0.5s). Import rig as **Generic** (not Humanoid);
avatar bones are named Unity-ready (`Hips, Spine, Head, …`).
- Scale: **1 unit = 1 m**; wall tile 1×2.4×1 (`WALL_H`); gun `grip`/`flash`
offsets from the web game's `WPNS` table are meters.
- Collision: walls BoxCollider per merged chunk (grid authoritative in web:
`wallAt`/`isWall`); enemies CapsuleCollider (imp H1.1, demon H1.4, baron H1.6);
pickups Box triggers 0.4³; barrels cylinder R0.28 H0.7 (radial damage 3.5 m,
chain — same numbers as `explodeBarrel`).

## Verify
Unity menu **PlayGround > Smoke Test** (no Play mode needed). All PASS =
import healthy. Gameplay port (spawner, AI, WPNS stats) is Phase D — out of
scope for this drop; the web build stays the canonical level-design source.
