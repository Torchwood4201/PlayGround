import { LEVELS } from './levels.js';
const WALLS = new Set(['#', 'M', 'C', 'W', 'R', 'L']);
const ALL = new Set([...WALLS, '.', '@', 'E', 'B', 'i', 'd', 's', 'm', '2', '3', '4', '5']);
let fails = 0;
LEVELS.forEach((lv, li) => {
  const errs = [];
  const m = lv.map, h = m.length, w = m[0].length;
  m.forEach((r, y) => { if (r.length !== w) errs.push(`row ${y} len ${r.length} != ${w}`); });
  let spawn = null;
  m.forEach((r, y) => [...r].forEach((c, x) => {
    if (!ALL.has(c)) errs.push(`bad char '${c}' at ${x},${y}`);
    if (c === '@') { if (spawn) errs.push('two spawns'); spawn = [x, y]; }
  }));
  if (!spawn) errs.push('no spawn');
  if (!m.some(r => r.includes('E'))) errs.push('no exit');
  m.forEach((r, y) => [...r].forEach((c, x) => {
    if ((y === 0 || y === h - 1 || x === 0 || x === w - 1) && !WALLS.has(c)) errs.push(`border leak '${c}' at ${x},${y}`);
  }));
  if (spawn) {
    const seen = new Set([spawn.join(',')]);
    const q = [spawn];
    while (q.length) {
      const [x, y] = q.pop();
      for (const [nx, ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
        const k = nx + ',' + ny;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || seen.has(k)) continue;
        if (WALLS.has(m[ny][nx])) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    const counts = {};
    m.forEach((r, y) => [...r].forEach((c, x) => {
      counts[c] = (counts[c] || 0) + 1;
      if ('EidBsm2345'.includes(c) && !seen.has(x + ',' + y)) errs.push(`unreachable '${c}' at ${x},${y}`);
    }));
    const foes = (counts.i || 0) + (counts.d || 0);
    if (foes === 0) errs.push('no enemies');
    lv._stats = { w, h, foes, barrels: counts.B || 0, guns: [counts['2']||0, counts['3']||0, counts['4']||0, counts['5']||0].join('/') };
  }
  if (errs.length) { fails++; console.log(`L${li+1} ${lv.name}: FAIL\n  - ` + errs.join('\n  - ')); }
  else console.log(`L${li+1} ${lv.name}: OK ${m[0].length}x${m.length} foes=${lv._stats.foes} barrels=${lv._stats.barrels} guns[2/3/4/5]=${lv._stats.guns}`);
});
console.log(fails ? `\n${fails} LEVELS FAILED` : '\nALL LEVELS VALID');
process.exit(fails ? 1 : 0);
