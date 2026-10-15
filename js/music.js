// js/music.js — Note-block studio on top of the real Minecraft.sf2 samples.
import { SF2Player, NOTEBLOCKS, midiName } from './sf2.js';

export const SEQ_STEPS = 16;
export const SEQ_LO = 42;   // F#3 — bottom of the note-block range
export const SEQ_ROWS = 25; // …up to F#5 (66)

const DEMOS = {
  sunrise: {
    title: 'Sunrise Shaft', inst: 0, bpm: 112,
    notes: [60, 64, 66, 64, 62, 64, 60, 59, 60, 62, 64, 62, 60, -1, 55, -1],
  },
  gravel: {
    title: 'Gravel Steps', inst: 6, bpm: 132,
    notes: [57, 0, 60, 0, 62, 0, 64, 62, 60, 0, 57, 0, 55, 55, 53, 50],
  },
};

export function initMusic() {
  const player = new SF2Player();
  const api = { player, ready: false, selected: 0 };
  const $ = (id) => document.getElementById(id);
  const statusEl = $('sf2-status');
  const setStatus = (t) => { statusEl.textContent = t; };

  async function ensureLoaded() {
    if (api.ready) return true;
    setStatus('loading assets/Minecraft.sf2…');
    try {
      await player.load('assets/Minecraft.sf2');
      player.setVolume(($('mus-vol').value | 0) / 100);
      api.ready = true;
      const got = player.kit.filter((k) => !k.missing).length;
      setStatus(`ready — ${got}/10 note-block instruments from “${player.parsed.info.INAM || 'Minecraft.sf2'}”`);
      document.querySelectorAll('#inst-grid .inst').forEach((b) => { b.disabled = false; });
      return true;
    } catch (e) {
      setStatus('could not load Minecraft.sf2: ' + e.message + ' (serve over http, not file://)');
      return false;
    }
  }

  // ---- instrument grid ----
  const grid = $('inst-grid');
  NOTEBLOCKS.forEach((nb, i) => {
    const b = document.createElement('button');
    b.className = 'inst' + (i === 0 ? ' sel' : '');
    b.style.borderLeftColor = nb.color;
    b.disabled = true;
    b.innerHTML = `${i + 1}. ${nb.inst}<small>${nb.desc} · ${nb.sample}.sf2</small>`;
    b.title = `keys 1–9,0 select instrument (${nb.desc})`;
    b.onclick = async () => {
      if (!(await ensureLoaded())) return;
      api.selected = i;
      document.querySelectorAll('#inst-grid .inst').forEach((x) => x.classList.remove('sel'));
      b.classList.add('sel');
      player.play(i, 66, 0, 1);
    };
    grid.appendChild(b);
  });

  // ---- piano F#3..F#5 ----
  const piano = $('piano');
  const keyEls = {};
  for (let m = SEQ_LO; m <= SEQ_LO + SEQ_ROWS - 1; m++) {
    const pc = m % 12;
    const black = [1, 3, 6, 8, 10].includes(pc);
    const k = document.createElement('div');
    k.className = 'key ' + (black ? 'black' : 'white');
    k.dataset.midi = m;
    if (!black && pc === 0) k.innerHTML = `<small>${midiName(m)}</small>`;
    const hit = async () => {
      if (!(await ensureLoaded())) return;
      k.classList.add('hit');
      setTimeout(() => k.classList.remove('hit'), 120);
      player.play(api.selected, m, 0, 1);
    };
    k.addEventListener('pointerdown', hit);
    piano.appendChild(k);
    keyEls[m] = k;
  }
  // computer-keyboard piano (A row = C4 up chromatically)
  const kbMap = { KeyA: 60, KeyW: 61, KeyS: 62, KeyE: 63, KeyD: 64, KeyF: 65, KeyT: 66 };
  window.addEventListener('keydown', async (e) => {
    if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (document.querySelector('#tab-music').classList.contains('active') === false) return;
    const m = kbMap[e.code];
    if (m === undefined || e.repeat) return;
    if (!(await ensureLoaded())) return;
    player.play(api.selected, m, 0, 1);
    keyEls[m] && keyEls[m].classList.add('hit');
    setTimeout(() => keyEls[m] && keyEls[m].classList.remove('hit'), 120);
  });

  // ---- sequencer ----
  const seqEl = $('seq');
  const cells = [];
  for (let r = SEQ_ROWS - 1; r >= 0; r--) {
    const m = SEQ_LO + r;
    const row = document.createElement('div');
    row.className = 'seq-row';
    const lab = document.createElement('div');
    lab.className = 'seq-lab';
    lab.textContent = midiName(m);
    row.appendChild(lab);
    const rowCells = [];
    for (let s = 0; s < SEQ_STEPS; s++) {
      const c = document.createElement('button');
      c.className = 'cell';
      c.title = `${midiName(m)} · step ${s + 1}`;
      c.onclick = () => { c.classList.toggle('on'); rowCells[s] = c.classList.contains('on'); };
      row.appendChild(c);
      rowCells.push(false);
    }
    seqEl.appendChild(row);
    cells.push(rowCells); // cells[0] = top row (highest pitch)
  }
  const setCell = (step, midi, on) => {
    const r = SEQ_ROWS - 1 - (midi - SEQ_LO);
    if (r < 0 || r >= SEQ_ROWS) return;
    const rowEl = seqEl.children[r];
    const c = rowEl.children[step + 1];
    cells[r][step] = on;
    c.classList.toggle('on', on);
  };
  const clearSeq = () => {
    for (let r = 0; r < SEQ_ROWS; r++) for (let s = 0; s < SEQ_STEPS; s++) setCell(s, SEQ_LO + SEQ_ROWS - 1 - r, false);
  };
  const loadDemo = (d) => {
    clearSeq();
    api.selected = d.inst;
    document.querySelectorAll('#inst-grid .inst').forEach((x, i) => x.classList.toggle('sel', i === d.inst));
    $('seq-bpm').value = d.bpm;
    d.notes.forEach((m, s) => { if (m > 0) setCell(s, m, true); });
  };

  let seqTimer = null, seqStep = 0, seqNext = 0;
  const stopSeq = () => {
    if (seqTimer) clearInterval(seqTimer);
    seqTimer = null;
    $('seq-play').textContent = '▶ Play loop';
    $('seq-play').classList.remove('playing');
    seqEl.querySelectorAll('.playhead').forEach((c) => c.classList.remove('playhead'));
  };
  $('seq-play').onclick = async () => {
    if (seqTimer) { stopSeq(); return; }
    if (!(await ensureLoaded())) return;
    stopCalm();
    seqStep = 0;
    seqNext = player.now() + 0.06;
    $('seq-play').textContent = '⏸ Stop loop';
    $('seq-play').classList.add('playing');
    seqTimer = setInterval(() => {
      const bpm = Math.max(60, Math.min(200, $('seq-bpm').value | 0 || 112));
      const stepDur = 60 / bpm / 2;
      while (seqNext < player.now() + 0.15) {
        const s = seqStep;
        for (let r = 0; r < SEQ_ROWS; r++) {
          if (cells[r][s]) player.play(api.selected, SEQ_LO + SEQ_ROWS - 1 - r, seqNext, 0.9);
        }
        const at = (seqNext - player.now()) * 1000;
        setTimeout(() => {
          seqEl.querySelectorAll('.playhead').forEach((c) => c.classList.remove('playhead'));
          for (let r = 0; r < SEQ_ROWS; r++) seqEl.children[r].children[s + 1].classList.add('playhead');
        }, Math.max(0, at));
        seqNext += stepDur;
        seqStep = (seqStep + 1) % SEQ_STEPS;
      }
    }, 30);
  };
  $('seq-clear').onclick = clearSeq;
  $('demo-1').onclick = async () => { if (await ensureLoaded()) { stopSeq(); loadDemo(DEMOS.sunrise); $('seq-play').click(); } };
  $('demo-2').onclick = async () => { if (await ensureLoaded()) { stopSeq(); loadDemo(DEMOS.gravel); $('seq-play').click(); } };

  // ---- generative "Calm" (multi-instrument ambient) ----
  let calmTimers = [];
  const stopCalm = () => { calmTimers.forEach(clearTimeout); calmTimers = []; };
  $('btn-stop-all').onclick = () => { stopSeq(); stopCalm(); };
  $('btn-calm').onclick = async () => {
    if (!(await ensureLoaded())) return;
    stopSeq(); stopCalm();
    const scale = [57, 59, 60, 62, 64, 66, 64, 62];
    let deg = 2, t = player.now() + 0.1;
    const instPool = [0, 0, 0, 4, 2, 5];
    for (let i = 0; i < 28; i++) {
      deg += [0, 1, -1, 2, -2, 0, 1][Math.floor(Math.random() * 7)];
      deg = Math.max(0, Math.min(scale.length - 1, deg));
      const midi = scale[deg];
      const inst = instPool[Math.floor(Math.random() * instPool.length)];
      const at = t;
      calmTimers.push(setTimeout(() => player.play(inst, midi, 0, 0.55), (at - player.now()) * 1000));
      if (i % 7 === 3) {
        const root = midi - 12 >= SEQ_LO ? midi - 12 : 45;
        calmTimers.push(setTimeout(() => player.play(1, root, 0, 0.5), (at - player.now()) * 1000));
      }
      t += 0.55 + Math.random() * 0.9;
    }
    setStatus('playing a generated “Calm” sketch (28 notes, harp/bell/chime/flute over bass)…');
  };

  $('mus-vol').oninput = (e) => player.setVolume(e.target.value / 100);

  // number keys select instruments on music tab
  window.addEventListener('keydown', (e) => {
    if (!document.querySelector('#tab-music').classList.contains('active')) return;
    const map = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4, Digit6: 5, Digit7: 6, Digit8: 7, Digit9: 8, Digit0: 9 };
    if (e.code in map) grid.children[map[e.code]].click();
  });

  // ---- game block sounds ----
  api.sing = true;
  api.blockBroken = (y) => {
    if (!api.ready || !api.sing) return;
    player.play(0, Math.max(SEQ_LO, Math.min(66, 50 + (y % 12))), 0, 0.6);
  };
  api.blockPlaced = (y) => {
    if (!api.ready || !api.sing) return;
    player.play(1, Math.max(SEQ_LO, Math.min(66, 44 + (y % 12))), 0, 0.7);
  };
  // pre-fetch + decode in the background (AudioContext may start suspended;
  // every play path resumes it on its user gesture)
  ensureLoaded();
  return api;
}
