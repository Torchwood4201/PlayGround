// js/sf2.js — Minimal SoundFont2 reader + note-block sampler.
// Reads assets/Minecraft.sf2 ("Minecraft Note Block Studio 3") in the browser:
// sdta/smpl 16-bit mono samples + pdta/shdr sample headers + inst names.
// Melodic instruments pitch-shift from their root key (all are F#4 / MIDI 66);
// drums (snare/hat/bd) play at fixed rate like real note blocks.

export const NOTEBLOCKS = [
  { inst: 'Harp',       sample: 'harp2',      midi: false, color: '#7cbd6b', desc: 'piano / default' },
  { inst: 'Double Bass', sample: 'bassattack', midi: false, color: '#8e6cc9', desc: 'bass' },
  { inst: 'Bell',        sample: 'bell',       midi: false, color: '#e0c458', desc: 'bell' },
  { inst: 'Flute',       sample: 'flute',      midi: false, color: '#58c9c0', desc: 'flute' },
  { inst: 'Chime',       sample: 'icechime',   midi: false, color: '#7fb2e5', desc: 'chime' },
  { inst: 'Guitar',       sample: 'guitar',     midi: false, color: '#b08954', desc: 'guitar' },
  { inst: 'Xylophone',   sample: 'xylobone',   midi: false, color: '#a4d65e', desc: 'xylophone' },
  { inst: 'Snare Drum',  sample: 'snare',      midi: true,  color: '#b9bec7', desc: 'snare (fixed)' },
  { inst: 'Click',       sample: 'hat',        midi: true,  color: '#e5e07f', desc: 'hat (fixed)' },
  { inst: 'Bass Drum',   sample: 'bd',         midi: true,  color: '#5a5f6a', desc: 'bass drum (fixed)' },
];

function ascii(view, off, len) {
  let s = '';
  for (let i = 0; i < len; i++) {
    const c = view.getUint8(off + i);
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s;
}

export function parseSF2(buf) {
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);
  const tag = (o) => String.fromCharCode(bytes[o], bytes[o + 1], bytes[o + 2], bytes[o + 3]);
  if (tag(0) !== 'RIFF' || tag(8) !== 'sfbk') throw new Error('not a SoundFont (RIFF/sfbk)');
  let smplData = null, smplRateGuess = 48000;
  let shdrs = [], instNames = [], info = {};
  // walk top-level LISTs
  let o = 12;
  const end = bytes.length;
  while (o + 12 <= end) {
    const id = tag(o);
    const size = view.getUint32(o + 4, true);
    if (id !== 'LIST') { o += 8 + size + (size & 1); continue; }
    const type = tag(o + 8);
    let p = o + 12;
    const listEnd = o + 8 + size;
    if (type === 'INFO') {
      while (p + 8 <= listEnd) {
        const cid = tag(p), csz = view.getUint32(p + 4, true);
        if (cid === 'INAM' || cid === 'ISFT' || cid === 'ICMT' || cid === 'isng') {
          info[cid] = ascii(view, p + 8, Math.min(csz, 120));
        }
        p += 8 + csz + (csz & 1);
      }
    } else if (type === 'sdta') {
      while (p + 8 <= listEnd) {
        const cid = tag(p), csz = view.getUint32(p + 4, true);
        if (cid === 'smpl') smplData = { off: p + 8, size: csz };
        p += 8 + csz + (csz & 1);
      }
    } else if (type === 'pdta') {
      while (p + 8 <= listEnd) {
        const cid = tag(p), csz = view.getUint32(p + 4, true);
        if (cid === 'shdr') {
          const n = csz / 46;
          for (let i = 0; i < n; i++) {
            const q = p + 8 + i * 46;
            const name = ascii(view, q, 20);
            const start = view.getUint32(q + 20, true);
            const finish = view.getUint32(q + 24, true);
            const rate = view.getUint32(q + 36, true);
            const pitch = view.getUint8(q + 40);
            const corr = view.getInt8(q + 41);
            shdrs.push({ name, start, end: finish, rate, pitch, corr });
          }
        } else if (cid === 'inst') {
          const n = csz / 22;
          for (let i = 0; i < n; i++) instNames.push(ascii(view, p + 8 + i * 22, 20));
        }
        p += 8 + csz + (csz & 1);
      }
    }
    o = listEnd + (size & 1); // chunks are word-aligned
    if (o <= 12) break;
  }
  if (!smplData) throw new Error('sdta/smpl not found');
  const pcm = new Int16Array(buf, smplData.off, Math.floor(smplData.size / 2));
  void smplRateGuess;
  return { pcm, shdrs, instNames, info };
}

export function buildKit(parsed) {
  const { pcm, shdrs } = parsed;
  const byName = {};
  for (const s of shdrs) byName[s.name] = s;
  return NOTEBLOCKS.map((nb) => {
    const h = byName[nb.sample];
    if (!h || h.end <= h.start) return { ...nb, missing: true };
    const data = pcm.subarray(h.start, h.end);
    return { ...nb, rate: h.rate, root: h.pitch + h.corr / 100, data };
  });
}

export const midiName = (m) => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

// ---- Player: decodes kit into AudioBuffers, schedules notes ----
export class SF2Player {
  constructor() {
    this.ctx = null; this.buffers = []; this.kit = [];
    this.master = null; this.volume = 0.8;
  }
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  async load(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = await res.arrayBuffer();
    const parsed = parseSF2(buf);
    this.parsed = parsed;
    this.kit = buildKit(parsed);
    this.ensure();
    this.buffers = this.kit.map((k) => {
      if (k.missing) return null;
      const ab = this.ctx.createBuffer(1, k.data.length, k.rate);
      const ch = ab.getChannelData(0);
      for (let i = 0; i < k.data.length; i++) ch[i] = k.data[i] / 32768;
      return ab;
    });
    return this;
  }
  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }
  // Play instrument k at MIDI note m. Drums ignore pitch.
  play(k, m, when = 0, vel = 1) {
    if (!this.ctx || !this.buffers[k]) return;
    this.ensure();
    const t = Math.max(when, this.ctx.currentTime);
    const def = this.kit[k];
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers[k];
    src.playbackRate.value = def.midi ? 1 : Math.pow(2, (m - def.root) / 12);
    const g = this.ctx.createGain();
    const peak = 0.5 * vel;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0011), t + 0.008);
    const dur = def.midi ? 0.4 : 1.8;
    g.gain.setTargetAtTime(0.0001, t + 0.01, dur / 4);
    src.connect(g); g.connect(this.master);
    src.start(t);
    const stopAfter = def.midi ? 1 : Math.min(this.buffers[k].duration / src.playbackRate.value + 0.3, 4);
    src.stop(t + stopAfter);
  }
  now() { return this.ctx ? this.ctx.currentTime : 0; }
}
