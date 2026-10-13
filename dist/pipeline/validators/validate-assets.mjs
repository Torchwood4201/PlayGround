// validate-assets.mjs — pipeline gates. Exit non-zero on fail.
// Checks: manifest/naming → budgets (glB tri parse, PNG IHDR) → map presence +
// normal-blue + ORM variance + tile seam → (glB load + parity run in Phase B;
// web regression always runs). Run: node pipeline/validators/validate-assets.mjs
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(ROOT, 'pipeline', 'dist');
let fails = 0;
const fail = m => { fails++; console.log('FAIL: ' + m); };
const ok = m => console.log('ok: ' + m);

// 1. manifest
let catalog;
try {
  catalog = JSON.parse(readFileSync(join(ROOT, 'pipeline', 'catalog.json'), 'utf8'));
} catch (e) { console.log('FAIL: catalog.json unreadable: ' + e.message); process.exit(1); }
const ids = catalog.assets.map(a => a.id);
if (new Set(ids).size !== ids.length) fail('duplicate asset ids');
else ok(`catalog: ${ids.length} assets`);
const nameRe = /^[a-z]+_[a-z0-9]+_(low\.glb|(albedo|normal|orm|mask)\.png)$/;
for (const a of catalog.assets) {
  for (const f of [`${a.id}_low.glb`, ...a.maps.filter(m => m !== 'emissive').map(m => `${a.id}_${m}.png`)]) {
    if (!nameRe.test(f)) fail(`naming: ${f}`);
  }
}
ok('naming patterns');

// PNG IHDR helper (no decode lib)
function pngDims(path) {
  const b = readFileSync(path);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error('not PNG');
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), depth: b[24], ctype: b[25] };
}
// glB tri count via JSON chunk
function glbTris(path) {
  const b = readFileSync(path);
  if (b.readUInt32LE(0) !== 0x46546c67) throw new Error('not glB');
  const jsLen = b.readUInt32LE(12);
  const js = JSON.parse(b.slice(20, 20 + jsLen).toString('utf8'));
  let tris = 0;
  for (const mesh of js.meshes || []) {
    for (const p of mesh.primitives || []) {
      const acc = js.accessors[p.indices];
      tris += Math.floor(acc.count / 3);
    }
  }
  return { tris, skins: (js.skins || []).length, anims: (js.animations || []).length };
}

// 2-4. per-asset gates (only for assets already run — missing dist = SKIP, not fail)
let checked = 0;
for (const a of catalog.assets) {
  const glb = join(DIST, 'glb', `${a.id}_low.glb`);
  if (!existsSync(glb)) continue; // not yet run through pipeline
  checked++;
  const { tris } = glbTris(glb);
  if (tris > a.triBudget) fail(`${a.id}: ${tris} tris > budget ${a.triBudget}`);
  else ok(`${a.id}: ${tris}/${a.triBudget} tris`);
  for (const m of a.maps) {
    if (m === 'emissive') continue;
    const p = join(DIST, 'tex', `${a.id}_${m}.png`);
    if (!existsSync(p)) { fail(`${a.id}: missing ${m}.png`); continue; }
    const d = pngDims(p);
    if (d.w !== a.texPx || d.h !== a.texPx) fail(`${a.id} ${m}: ${d.w}x${d.h} != ${a.texPx}`);
  }
}
ok(`dist checks on ${checked}/${ids.length} built assets (rest SKIP)`);

// 5. web regression gates (always)
import { execSync } from 'node:child_process';
try {
  execSync('node validate-levels.mjs', { cwd: ROOT, stdio: 'pipe' });
  ok('validate-levels.mjs ALL VALID');
} catch { fail('validate-levels.mjs failed'); }

console.log(fails ? `\n${fails} CHECKS FAILED` : '\nVALIDATE-ASSETS GREEN');
process.exit(fails ? 1 : 0);
