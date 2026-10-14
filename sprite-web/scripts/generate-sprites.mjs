#!/usr/bin/env node
/*
 * Generate vanilla Minecraft sprite data for the sprite browser.
 *
 *   npm run sprites:generate
 *   MINECRAFT_VERSION=26.3 npm run sprites:generate   (any release id)
 *
 * Without MINECRAFT_VERSION it uses the latest release from Mojang's
 * version manifest. Output goes to public/minecraft-sprites/:
 *   - one flattened PNG per atlas sprite (<atlas>/<a>__<b>.png)
 *   - the sibling .mcmeta next to animated sprites
 *   - manifest.json index consumed by the web app
 *
 * Atlas source types:
 *   directory / single / filter / unstitch  -> exported (supported)
 *   paletted_permutations (generated variants) and anything unknown
 *     -> listed in the manifest as unsupported, no PNG rendered
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const OUT_DIR = path.join(ROOT, 'public', 'minecraft-sprites');
const CACHE_DIR = path.join(HERE, '.cache');
const MOJANG_MANIFEST = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';

const log = (...a) => console.log('[sprites]', ...a);

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

async function resolveVersion() {
  const want = process.env.MINECRAFT_VERSION;
  const manifest = await getJson(MOJANG_MANIFEST);
  if (want) {
    const hit = manifest.versions.find((v) => v.id === want);
    if (!hit) throw new Error(`Minecraft version ${want} not found in manifest`);
    return hit;
  }
  const latest = manifest.versions.find((v) => v.id === manifest.latest.release);
  if (!latest) throw new Error('Latest release missing from manifest');
  return latest;
}

async function downloadJar(url, dest) {
  try {
    const st = await fs.stat(dest);
    if (st.size > 1_000_000) {
      log(`reusing cached ${path.basename(dest)}`);
      return;
    }
  } catch { /* download */ }
  log(`downloading ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`jar download -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  log(`saved ${(buf.length / 1048576).toFixed(1)} MB`);
}

function pngSize(buf) {
  // Minimal IHDR parse: 8-byte signature, then width/height BE u32 at 16/20.
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function normalizeAnimation(mcmeta) {
  const anim = mcmeta && mcmeta.animation;
  if (!anim) return null;
  const frametime = Number.isFinite(anim.frametime) ? anim.frametime : 1;
  let frames = [];
  if (Array.isArray(anim.frames)) {
    frames = anim.frames.map((f) =>
      typeof f === 'number' ? { index: f, time: frametime } : { index: f.index ?? 0, time: f.time ?? frametime },
    );
  }
  return {
    frametime,
    frames,
    interpolate: anim.interpolate === true,
    width: anim.width ?? null,
    height: anim.height ?? null,
  };
}

const titleize = (s) =>
  s
    .split('/') .pop()
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

const flatName = (spritePath) => `${spritePath.replaceAll('/', '__')}.png`;

async function main() {
  const t0 = Date.now();
  const entry = await resolveVersion();
  const versionId = entry.id;
  log(`Minecraft ${versionId} (${entry.type})`);
  const details = await getJson(entry.url);
  const jarUrl = details.downloads?.client?.url;
  if (!jarUrl) throw new Error('no client jar in version details');

  const jarPath = path.join(CACHE_DIR, `client-${versionId}.jar`);
  await downloadJar(jarUrl, jarPath);
  const zip = new AdmZip(jarPath);
  const zipNames = new Set(zip.getEntries().map((e) => e.entryName));
  const readBin = (name) => {
    const e = zip.getEntry(name);
    return e ? e.getData() : null;
  };

  const atlasFiles = [...zipNames].filter(
    (n) => n.startsWith('assets/minecraft/atlases/') && n.endsWith('.json'),
  );
  log(`atlases: ${atlasFiles.length}`);

  const sprites = [];
  const seen = new Set();
  const atlasCounts = new Map();
  const unsupported = {};
  let skippedDupes = 0;

  const pushSprite = (s) => {
    if (seen.has(s.id)) {
      skippedDupes += 1;
      return;
    }
    seen.add(s.id);
    sprites.push(s);
    atlasCounts.set(s.atlas, (atlasCounts.get(s.atlas) ?? 0) + 1);
  };

  const listDir = (source) => {
    // Recursive texture listing, mirroring vanilla's directory source.
    const prefix = `assets/minecraft/textures/${source}/`;
    const out = [];
    for (const n of zipNames) {
      if (!n.startsWith(prefix) || !n.endsWith('.png') || n.endsWith('.png.mcmeta')) continue;
      out.push(n.slice(prefix.length, -'.png'.length));
    }
    return out.sort();
  };

  const exportPng = async (atlasKey, spritePath, texRel) => {
    // texRel like "block/stone" -> assets/minecraft/textures/block/stone.png
    const pngName = `assets/minecraft/textures/${texRel}.png`;
    const buf = readBin(pngName);
    if (!buf) {
      log(`  missing texture ${pngName}`);
      return null;
    }
    const { w, h } = pngSize(buf);
    const mcmetaBuf = readBin(`${pngName}.mcmeta`);
    const mcmeta = mcmetaBuf ? JSON.parse(mcmetaBuf.toString('utf8')) : null;
    const dir = path.join(OUT_DIR, atlasKey);
    await fs.mkdir(dir, { recursive: true });
    const file = flatName(spritePath);
    await fs.writeFile(path.join(dir, file), buf);
    if (mcmetaBuf) await fs.writeFile(path.join(dir, `${file}.mcmeta`), mcmetaBuf);
    return { w, h, animation: normalizeAnimation(mcmeta) };
  };

  for (const atlasFile of atlasFiles.sort()) {
    const atlasKey = path.basename(atlasFile, '.json'); // e.g. "blocks"
    const atlasId = `minecraft:${atlasKey}`;
    const def = JSON.parse(zip.getEntry(atlasFile).getData().toString('utf8'));
    const sources = def.sources ?? [];
    // Pending renames from `filter` sources apply to sprites registered before them.
    let pendingFilters = [];
    const applyFilters = (spritePath) => {
      let cur = spritePath;
      for (const f of pendingFilters) {
        const re = new RegExp(f.pattern);
        if (!re.test(cur)) return null; // filtered out
        cur = cur.replace(re, f.replacement ?? '$0');
      }
      return cur;
    };

    for (const src of sources) {
      const type = (src.type ?? '').replace(/^minecraft:/, '');
      if (type === 'directory') {
        const prefix = src.prefix ?? '';
        for (const rel of listDir(src.source)) {
          const spritePath = `${prefix}${rel}`;
          const finalPath = applyFilters(spritePath);
          if (finalPath === null) continue;
          const texRel = `${src.source}/${rel}`;
          const meta = await exportPng(atlasKey, finalPath, texRel);
          if (!meta) continue;
          pushSprite({
            id: `${atlasKey}:${finalPath}`,
            name: titleize(finalPath),
            atlas: atlasId,
            atlasName: atlasKey,
            sprite: finalPath,
            image: `minecraft-sprites/${atlasKey}/${flatName(finalPath)}`,
            file: `minecraft-sprites/${atlasKey}/${flatName(finalPath)}`,
            w: meta.w,
            h: meta.h,
            animation: meta.animation,
            supported: true,
          });
        }
      } else if (type === 'single') {
        const resource = String(src.resource).replace(/^minecraft:/, '');
        const finalPath = applyFilters(resource);
        if (finalPath === null) continue;
        const meta = await exportPng(atlasKey, finalPath, resource);
        if (!meta) continue;
        pushSprite({
          id: `${atlasKey}:${finalPath}`,
          name: titleize(finalPath),
          atlas: atlasId,
          atlasName: atlasKey,
          sprite: finalPath,
          image: `minecraft-sprites/${atlasKey}/${flatName(finalPath)}`,
          file: `minecraft-sprites/${atlasKey}/${flatName(finalPath)}`,
          w: meta.w,
          h: meta.h,
          animation: meta.animation,
          supported: true,
        });
      } else if (type === 'filter') {
        pendingFilters.push({ pattern: src.pattern, replacement: src.replacement });
      } else if (type === 'unstitch') {
        const resource = String(src.resource).replace(/^minecraft:/, '');
        const parent = await exportPng(atlasKey, `__parent_${resource.replaceAll('/', '__')}`, resource).catch(() => null);
        void parent;
        for (const r of src.regions ?? []) {
          const finalPath = applyFilters(r.sprite);
          if (finalPath === null) continue;
          const dims = (() => {
            try {
              return pngSize(readBin(`assets/minecraft/textures/${resource}.png`));
            } catch {
              return { w: 0, h: 0 };
            }
          })();
          pushSprite({
            id: `${atlasKey}:${finalPath}`,
            name: titleize(finalPath),
            atlas: atlasId,
            atlasName: atlasKey,
            sprite: finalPath,
            image: `minecraft-sprites/${atlasKey}/${flatName(`__parent_${resource.replaceAll('/', '__')}`)}`,
            file: `minecraft-sprites/${atlasKey}/${flatName(`__parent_${resource.replaceAll('/', '__')}`)}`,
            w: dims.w,
            h: dims.h,
            region: { x: r.x, y: r.y, width: r.width, height: r.height },
            animation: null,
            supported: true,
          });
        }
      } else if (type === 'paletted_permutations') {
        // Generated variants: list them, but flag unsupported — the exporter
        // does not render the palette remap, so there is no PNG to preview.
        unsupported[atlasId] = unsupported[atlasId] ?? {};
        unsupported[atlasId].paletted_permutations = (unsupported[atlasId].paletted_permutations ?? 0) + 1;
        for (const tex of src.textures ?? []) {
          const base = String(tex).replace(/^minecraft:/, '');
          for (const name of Object.keys(src.permutations ?? {})) {
            const spritePath = `${base}_${name}`;
            pushSprite({
              id: `${atlasKey}:${spritePath}`,
              name: `${titleize(base)} (${titleize(name)} Trim)`,
              atlas: atlasId,
              atlasName: atlasKey,
              sprite: spritePath,
              image: null,
              file: null,
              w: null,
              h: null,
              region: null,
              animation: null,
              supported: false,
              reason: 'paletted_permutation — generated variant, palette remap not rendered by the exporter',
              paletteKey: src.palette_key ?? null,
              baseTexture: base,
              permutation: name,
            });
          }
        }
      } else {
        log(`  unsupported source type ${src.type} in ${atlasKey}`);
        unsupported[atlasId] = unsupported[atlasId] ?? {};
        unsupported[atlasId][type || 'unknown'] = (unsupported[atlasId][type || 'unknown'] ?? 0) + 1;
      }
    }
  }

  sprites.sort((a, b) => a.id.localeCompare(b.id));
  const animated = sprites.filter((s) => s.animation).length;
  const atlases = [...atlasCounts.entries()]
    .map(([id, count]) => ({
      id,
      name: id.replace(/^minecraft:/, '').split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
      key: id.replace(/^minecraft:/, ''),
      count,
      unsupported: unsupported[id] ?? {},
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const manifest = {
    version: versionId,
    generatedAt: new Date().toISOString(),
    source: 'Mojang client jar',
    compatibility: 'Minecraft Java 1.21.9+ sprite text components. Some atlas source types are listed as unsupported.',
    atlases,
    sprites,
    unsupportedSources: unsupported,
  };
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest));
  const unsupportedCount = sprites.filter((s) => !s.supported).length;
  log(`sprites: ${sprites.length} (${animated} animated, ${unsupportedCount} unsupported listed, ${skippedDupes} dupes skipped)`);
  log(`wrote ${path.join('public', 'minecraft-sprites', 'manifest.json')} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((err) => {
  console.error('[sprites] FAILED:', err.message);
  process.exit(1);
});
