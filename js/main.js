// js/main.js — tabs + wiring between game, music studio, source explorer.
import { createGame, WORLD } from './game.js';
import { initMusic } from './music.js';
import { initSource } from './source.js';
import { TILE, TILE_NAME } from './world.js';

const $ = (id) => document.getElementById(id);
const inited = { play: false, music: false, source: false };
let game = null, music = null;

function toast(msg, ms = 2200) {
  const t = $('game-toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.add('hidden'), ms);
}

const HOTBAR = [1, 2, 3, 4, 5, 6];

function initPlay() {
  if (inited.play) return;
  inited.play = true;
  const canvas = $('game');
  game = createGame(canvas, {
    toast,
    atlasCanvas: () => buildHotbar(),
    stats: (c) => {
      $('world-stats').textContent =
        `seed ${game.state.seed} · ${WORLD.W}×${WORLD.H}×${WORLD.D} · rock ${c[1]} · grass ${c[2]} · dirt ${c[3]} · leaves ${c[6]}`;
    },
    frame: (fps, p) => {
      $('game-stats').textContent =
        `fps ${fps} · xyz ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)} · ${TILE_NAME[game.state.selected]} · ${document.pointerLockElement === canvas ? 'locked' : 'unlocked'}`;
    },
    lock: (on) => {
      $('crosshair').classList.toggle('hidden', !on);
      if (!on) toast('Click the world to re-grab the mouse');
    },
    hotkey: (n) => selectSlot(n - 1),
    broken: (y) => music && music.blockBroken(y),
    placed: (y) => music && music.blockPlaced(y),
  });

  $('btn-enter').onclick = async () => {
    $('btn-enter').disabled = true;
    $('btn-enter').textContent = '… growing terrain …';
    try {
      await game.boot($('seed').value | 0 || 1337);
      $('game-overlay').classList.add('hidden');
      try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* headless */ }
    } catch (e) {
      $('btn-enter').textContent = '▶ Click to play';
      $('btn-enter').disabled = false;
      toast('Failed to start: ' + e.message);
    }
  };
  $('btn-regen').onclick = () => { game.regenerate($('seed').value | 0 || 1337); };
  $('btn-respawn').onclick = () => game.state.built && game.respawn();
  $('btn-save').onclick = () => game.state.built && game.save();
  $('btn-load').onclick = () => game.state.built && game.load();
  $('chk-sing').onchange = (e) => { if (music) music.sing = e.target.checked; };
  $('chk-mobs').onchange = (e) => game.setMobs(e.target.checked);
  buildHotbar();
  window.__cavegame = game; // smoke-test hook
}

function buildHotbar() {
  const bar = $('hotbar');
  bar.innerHTML = '';
  HOTBAR.forEach((id, i) => {
    const d = document.createElement('div');
    d.className = 'slot' + (game && game.state.selected === id ? ' sel' : i === 1 ? ' sel' : '');
    d.title = `${TILE_NAME[id]} (${i + 1})`;
    const cv = document.createElement('canvas');
    cv.width = cv.height = 16;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    // preview: pull from the built atlas if available, else flat color
    drawPreview(ctx, id);
    d.appendChild(cv);
    const s = document.createElement('span');
    s.textContent = `${i + 1} ${TILE_NAME[id]}`;
    d.appendChild(s);
    d.onclick = () => selectSlot(i);
    bar.appendChild(d);
  });
  if (game && !game._hotbarInit) { game.setSelected(2); game._hotbarInit = true; }
}

const PREV_COLOR = { 1: '#7d7d7d', 2: '#6aaa4f', 3: '#866043', 4: '#9e4b3f', 5: '#8a6238', 6: '#348234' };
function drawPreview(ctx, id) {
  ctx.fillStyle = PREV_COLOR[id] || '#888';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.fillRect(0, 12, 16, 4);
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.fillRect(0, 0, 16, 3);
}

function selectSlot(i) {
  if (!game) return;
  game.setSelected(HOTBAR[i]);
  document.querySelectorAll('#hotbar .slot').forEach((x, k) => x.classList.toggle('sel', k === i));
}

function initMusicTab() {
  if (inited.music) return;
  inited.music = true;
  music = initMusic();
  music.sing = $('chk-sing').checked;
}

function initSourceTab() {
  if (inited.source) return;
  inited.source = true;
  initSource();
}

document.querySelectorAll('.tab').forEach((t) => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    $('tab-' + t.dataset.tab).classList.add('active');
    if (t.dataset.tab === 'play') initPlay();
    if (t.dataset.tab === 'music') initMusicTab();
    if (t.dataset.tab === 'source') initSourceTab();
  };
});

// boot the visible tab; footer stats
initPlay();
initMusicTab();
$('foot-stats').textContent = `${WORLD.W}×${WORLD.H}×${WORLD.D} world · ${TILE ? '6 tiles' : ''} · sf2 + java`;
