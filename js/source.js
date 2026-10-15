// js/source.js — Source explorer, texture gallery, live SF2 metadata.
import { parseSF2, buildKit } from './sf2.js';

const FILES = [
  'com/mojang/minecraft/Minecraft.java',
  'com/mojang/minecraft/MinecraftApplet.java',
  'com/mojang/minecraft/Entity.java',
  'com/mojang/minecraft/Player.java',
  'com/mojang/minecraft/Timer.java',
  'com/mojang/minecraft/HitResult.java',
  'com/mojang/minecraft/level/Level.java',
  'com/mojang/minecraft/level/LevelGen.java',
  'com/mojang/minecraft/level/NoiseMap.java',
  'com/mojang/minecraft/level/LevelRenderer.java',
  'com/mojang/minecraft/level/Chunk.java',
  'com/mojang/minecraft/level/DirtyChunkSorter.java',
  'com/mojang/minecraft/level/LevelListener.java',
  'com/mojang/minecraft/level/tile/Tile.java',
  'com/mojang/minecraft/level/tile/GrassTile.java',
  'com/mojang/minecraft/level/tile/DirtTile.java',
  'com/mojang/minecraft/level/tile/Bush.java',
  'com/mojang/minecraft/character/Zombie.java',
  'com/mojang/minecraft/character/ZombieModel.java',
  'com/mojang/minecraft/character/Cube.java',
  'com/mojang/minecraft/character/Polygon.java',
  'com/mojang/minecraft/character/Vec3.java',
  'com/mojang/minecraft/character/Vertex.java',
  'com/mojang/minecraft/gui/Font.java',
  'com/mojang/minecraft/particle/Particle.java',
  'com/mojang/minecraft/particle/ParticleEngine.java',
  'com/mojang/minecraft/phys/AABB.java',
  'com/mojang/minecraft/renderer/Tesselator.java',
  'com/mojang/minecraft/renderer/Textures.java',
  'com/mojang/minecraft/renderer/Frustum.java',
  'com/mojang/minecraft/comm/SocketServer.java',
  'com/mojang/minecraft/comm/SocketConnection.java',
  'com/mojang/minecraft/comm/ServerListener.java',
  'com/mojang/minecraft/comm/ConnectionListener.java',
  'com/mojang/minecraft/server/MinecraftServer.java',
  'com/mojang/minecraft/server/Client.java',
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Tokenizer-based highlighter: split comments/strings first so inserted
// <span> tags are never re-scanned for keywords.
function highlight(src) {
  const re = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')/g;
  const code = (s) => esc(s)
    .replace(/\b(package|import|public|protected|private|static|final|class|interface|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|void|int|long|float|double|boolean|byte|char|short|this|super|null|true|false|try|catch|finally|throw|throws|synchronized|volatile|transient|abstract|native|strictfp|instanceof|assert|enum)\b/g, '<span class="tok-k">$1</span>')
    .replace(/(@\w+)/g, '<span class="tok-a">$1</span>')
    .replace(/\b(\d[\d_]*(?:\.\d+)?[fFdDlL]?)\b/g, '<span class="tok-n">$1</span>');
  let out = '', last = 0, m;
  while ((m = re.exec(src))) {
    out += code(src.slice(last, m.index));
    const t = m[0];
    out += t[0] === '/' || t.startsWith('*')
      ? `<span class="tok-c">${esc(t)}</span>`
      : `<span class="tok-s">${esc(t)}</span>`;
    last = m.index + t.length;
  }
  return out + code(src.slice(last));
}

const TEXTURES = [
  ['grass.png', '16×16', 'Grass side — used as atlas tile 3 (sides); top is procedural'],
  ['dirt.png', '16×16', 'Dirt — atlas tile 2 (also grass bottom)'],
  ['char.png', '64×32', 'Steve skin — worn by the roaming zombie billboards'],
  ['clouds.png', '256×256', 'Clouds — tiled drifting plane above the world'],
  ['default.gif', '128×128', 'Font glyph sheet (shown as-is; HUD uses system type)'],
];

export function initSource() {
  const tree = document.getElementById('src-tree');
  const code = document.getElementById('src-code');
  const pathEl = document.getElementById('src-path');
  document.getElementById('src-count').textContent = FILES.length + ' java files';
  let currentDir = null;
  FILES.forEach((f) => {
    const dir = f.split('/').slice(0, -1).join('/');
    if (dir !== currentDir) {
      currentDir = dir;
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.className = 'dir';
      b.textContent = '📁 ' + dir.split('/').pop();
      b.title = dir;
      li.appendChild(b);
      tree.appendChild(li);
    }
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.className = 'file';
    b.textContent = f.split('/').pop();
    b.title = f;
    b.onclick = async () => {
      tree.querySelectorAll('.file').forEach((x) => x.classList.remove('sel'));
      b.classList.add('sel');
      pathEl.textContent = 'sources/' + f;
      code.textContent = 'loading…';
      try {
        const r = await fetch('sources/' + f);
        const t = await r.text();
        code.innerHTML = highlight(t);
      } catch (e) {
        code.textContent = 'failed to load: ' + e.message;
      }
    };
    li.appendChild(b);
    tree.appendChild(li);
  });
  // open the most interesting file first
  const first = tree.querySelector('.file');
  if (first) { /* don't autoload; user picks */ }

  const gal = document.getElementById('tex-gallery');
  for (const [name, size, note] of TEXTURES) {
    const d = document.createElement('div');
    d.className = 'tex';
    d.innerHTML = `<img src="assets/textures/${name}" alt="${name}" style="${name === 'char.png' || name === 'clouds.png' ? 'width:100%' : ''}"><p><b>${name}</b> · ${size}<br>${note}</p>`;
    gal.appendChild(d);
  }

  // live SF2 metadata
  (async () => {
    const infoEl = document.getElementById('sf2-info');
    const tbody = document.querySelector('#sf2-table tbody');
    try {
      const r = await fetch('assets/Minecraft.sf2');
      const buf = await r.arrayBuffer();
      const parsed = parseSF2(buf);
      const kit = buildKit(parsed);
      const i = parsed.info;
      infoEl.textContent = `INAM="${i.INAM || ''}" ISFT="${i.ISFT || ''}" ICMT="${i.ICMT || ''}" isng="${i.isng || ''}" · ${parsed.pcm.length} samples · ${kit.length} mapped`;
      kit.forEach((k, n) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${n}</td><td>${k.inst}</td><td>${k.sample}</td><td>${k.missing ? '—' : k.rate + ' Hz'}</td><td>${k.missing ? '—' : k.data.length}</td><td>${k.missing ? '—' : 'F#4 (66)'}</td>`;
        tbody.appendChild(tr);
      });
    } catch (e) {
      infoEl.textContent = 'parse failed: ' + e.message;
    }
  })();
}
