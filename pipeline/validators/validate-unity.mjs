// validate-unity.mjs — unity/ folder mapping + SmokeTest content checks.
// Run: node pipeline/validators/validate-unity.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const U = join(ROOT, 'unity', 'Assets', 'PlayGround');
let fails = 0;
const fail = m => { fails++; console.log('FAIL: ' + m); };
const ok = m => console.log('ok: ' + m);

const catalog = JSON.parse(readFileSync(join(ROOT, 'pipeline', 'catalog.json'), 'utf8'));
for (const a of catalog.assets) {
  const distGlb = join(ROOT, 'pipeline', 'dist', 'glb', `${a.id}_low.glb`);
  if (!existsSync(distGlb)) continue;
  const cat = { walls: 'Walls', surfaces: 'Walls', guns: 'Guns', enemies: 'Enemies', props: 'Props', projectiles: 'Projectiles' }[a.category];
  const up = join(U, 'Models', cat, `${a.id}_low.glb`);
  if (!existsSync(up)) fail(`unity mapping missing: Models/${cat}/${a.id}_low.glb`);
}
ok('unity model mapping checked');
const smoke = join(U, 'Scripts', 'Editor', 'SmokeTest.cs');
if (!existsSync(smoke)) fail('SmokeTest.cs missing');
else {
  const s = readFileSync(smoke, 'utf8');
  for (const needle of ['FindAssets', 'BoxCollider', 'CapsuleCollider', 'WALL_H', 'Smoke Test']) {
    if (!s.includes(needle)) fail(`SmokeTest.cs missing "${needle}"`);
  }
  ok('SmokeTest.cs content');
}
console.log(fails ? `\n${fails} CHECKS FAILED` : '\nVALIDATE-UNITY GREEN');
process.exit(fails ? 1 : 0);
