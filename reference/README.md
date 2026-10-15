# Uploaded reference material

Two issue attachments are vendored into the game. They are the real
thing — not re-implementations from memory.

## 1. `minecraft-decompiled-0.8-alpha-main.zip`
→ `reference/minecraft-decompiled-0.8-alpha/`

Decompiled-ish Java source of early Minecraft (0.8 alpha era) plus four
authentic textures: `grass.png`, `dirt.png`, `clouds.png`, `char.png`
(plus `default.gif`). Used in-game as the **Classic 0.8 texture pack**
(`textures/classic08/`, sidebar → Texture pack):

- `grass.png` / `dirt.png` → grass top, dirt, and the grass-side lip
- `clouds.png` → cloud-layer texture
- `char.png` → zombie mob skin (classic zombies bound `/char.png`)

Ported mechanics (same file paths, same constants):

- `com/mojang/minecraft/phys/AABB.java` → `clipXCollide` /
  `clipYCollide` / `clipZCollide` with `epsilon = 0`, Y-then-X-then-Z
  resolution order per `Entity.move`, `onGround = yaOrg != ya && yaOrg < 0`.
- `com/mojang/minecraft/level/tile/Tile.java#destroy` → 4×4×4 = 64
  block shards per break.
- `com/mojang/minecraft/particle/Particle.java` → shard gravity
  `−0.04`/tick, drag `0.98`, ground friction `0.7`,
  lifetime `4/(rand*0.9+0.1)` ticks.
- `com/mojang/minecraft/character/Zombie.java#tick` → wander steering:
  `rot += rotA`, `rotA *= 0.99` + random-walk kicks, 8% hop when
  grounded, ground/air control `0.1` / `0.02`, friction `0.91` (+`0.7`
  grounded), `yd *= 0.98` — all frame-rate-normalized to 20tps.

## 2. `Minecraft.sf2`
→ `assets/Minecraft.sf2` (Grand Piano + full GM set, ~394 KB)

Played live in the browser by a minimal SoundFont sampler in `app.js`
(`Sf2Piano`: RIFF/`sdta` PCM + `pdta` preset→instrument→sample zones,
key-range lookup, pitch-shifted one-shots). No pre-rendered audio.

- Piano layers on pickup / craft / smelt / hurt / death / break / place
- Generative ambient piano phrases while playing (sidebar toggles:
  *Piano sounds*, *Ambient music*)
- Falls back to the existing retro synth if the file can't load
