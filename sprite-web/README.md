# Sprite Feature Web

React + Vite webpage for browsing vanilla Minecraft sprite atlas entries and copying:

- MiniMessage sprite format (`<sprite:atlas:sprite>`, adventure ≥ 4.25)
- JSON sprite text component (`object`/`atlas`)
- Vanilla `/tellraw` chat command
- Vanilla `/title ... actionbar` command
- Vanilla `/title ... title` and subtitle commands

Sprite text components are for Minecraft Java `1.21.9+`. Some atlas source types are still marked unsupported by the local exporter, especially generated variants such as paletted permutations (armor-trim permutations in the `items` atlas): they are listed with metadata but no rendered preview.

## Current Data

The checked-in generated data is from Minecraft Java `26.3` (the `26.2` client jar is no longer hosted by Mojang, so regeneration targets the latest release by default).

It contains `3269` exported sprites in `public/minecraft-sprites`, including `63` animated textures with `.mcmeta` frame data and `64` listed-but-unsupported paletted permutations.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

Regenerate the latest release sprites:

```bash
npm run sprites:generate
```

Regenerate a specific Minecraft version:

```powershell
$env:MINECRAFT_VERSION='1.21.9'; npm run sprites:generate; Remove-Item Env:MINECRAFT_VERSION
```

```bash
MINECRAFT_VERSION=26.3 npm run sprites:generate
```

## How it works

`scripts/generate-sprites.mjs` downloads the Mojang client jar, parses every `assets/minecraft/atlases/*.json` definition (`directory`, `single`, `filter`, `unstitch` sources are exported; `paletted_permutations` and unknown types are recorded as unsupported), copies each texture PNG plus its sibling `.mcmeta` into `public/minecraft-sprites/<atlas>/`, and writes `public/minecraft-sprites/manifest.json` — the index the app fetches at runtime.

The app (`src/`) renders the searchable atlas grid, canvas-based `.mcmeta` animation playback, and the six copy formats from `src/lib/formats.js`.
