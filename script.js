import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = (id) => document.getElementById(id);

const app = $('app');
const canvas = $('game-canvas');
const introScreen = $('intro-screen');
const pauseScreen = $('pause-screen');
const gameoverScreen = $('gameover-screen');
const scoreEl = $('score');
const bestEl = $('best');
const integrityEl = $('integrity');
const levelEl = $('level');
const livesEl = $('lives');
const comboEl = $('combo');
const comboValueEl = $('combo-value');
const toastEl = $('toast');
const toastKickerEl = $('toast-kicker');
const toastMainEl = $('toast-main');
const statusbarEl = document.querySelector('.statusbar');
const statusTextEl = $('status-text');
const statusSubEl = $('status-sub');
const impactEl = $('impact-flash');
const introBestEl = $('intro-best');
const soundBtn = $('sound-btn');
const muteBtn = $('mute-btn');
const pauseBtn = $('pause-btn');

const CFG = {
  courtX: 8.0,
  floorY: 0.28,
  ceilingY: 9.25,
  wallZ: -5.4,
  paddleZ: 5.4,
  loseZ: 7.4,
  paddleWidth: 3.35,
  paddleHeight: 1.0,
  ballRadius: 0.19,
  ballSpeed: 13.4,
  cols: 13,
  rows: 7,
  gapX: 0.98,
  gapY: 0.8,
  wallCenterY: 5.15,
  brickRadius: 0.29,
  blastRadius: 1.32
};

const ROW_COLORS = [
  '#ff3fbe',
  '#c15cff',
  '#7a7dff',
  '#43c9ff',
  '#45ffd2',
  '#b6ff58',
  '#ffd166'
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => min + Math.random() * (max - min);

function formatScore(value) {
  return String(Math.max(0, Math.floor(value))).padStart(6, '0');
}

function loadBest() {
  try {
    const raw = localStorage.getItem('dot-matrix-wall-ball-best');
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  } catch (error) {
    return 0;
  }
}

function saveBest(value) {
  try {
    localStorage.setItem('dot-matrix-wall-ball-best', String(value));
  } catch (error) {
    return;
  }
}

const sound = (() => {
  let ctx = null;
  let master = null;
  let muted = false;
  let noiseBuffer = null;

  function ensure() {
    if (!ctx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return false;
      ctx = new AudioCtor();
      master = ctx.createGain();
      master.gain.value = 0.2;
      master.connect(ctx.destination);

      const length = Math.floor(ctx.sampleRate * 0.5);
      noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  function tone(freq, duration, options = {}) {
    if (muted || !ensure()) return;
    const {
      type = 'sine',
      volume = 0.1,
      endFreq = freq,
      delay = 0,
      detune = 0
    } = options;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + duration);
    osc.detune.value = detune;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  function noise(duration, volume, freq, delay = 0) {
    if (muted || !ensure()) return;
    const start = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(start);
    src.stop(start + duration + 0.02);
  }

  return {
    unlock: ensure,
    toggle() {
      muted = !muted;
      if (!muted) {
        ensure();
        tone(660, 0.08, { type: 'square', volume: 0.05 });
      }
      return muted;
    },
    isMuted: () => muted,
    ui() {
      tone(880, 0.045, { type: 'square', volume: 0.035, endFreq: 1040 });
    },
    launch() {
      tone(180, 0.26, { type: 'sawtooth', volume: 0.055, endFreq: 620 });
      noise(0.12, 0.035, 1200);
    },
    paddle() {
      tone(190, 0.11, { type: 'square', volume: 0.09, endFreq: 280 });
      tone(380, 0.09, { type: 'triangle', volume: 0.06, endFreq: 460 });
      noise(0.07, 0.035, 900);
    },
    brick(index) {
      const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
      const note = notes[clamp(index, 0, notes.length - 1)];
      tone(note, 0.16, { type: 'triangle', volume: 0.075, endFreq: note * 1.035 });
      tone(note * 2, 0.1, { type: 'sine', volume: 0.035, endFreq: note * 2.02 });
      noise(0.055, 0.028, 2200);
    },
    wall() {
      tone(90, 0.12, { type: 'sine', volume: 0.065, endFreq: 60 });
      noise(0.06, 0.018, 500);
    },
    lose() {
      tone(220, 0.5, { type: 'sawtooth', volume: 0.065, endFreq: 58 });
      noise(0.3, 0.03, 300);
    },
    clear() {
      [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => {
        tone(note, 0.25, {
          type: 'triangle',
          volume: 0.065,
          delay: index * 0.09,
          endFreq: note * 1.01
        });
      });
    },
    over() {
      [392, 329.63, 261.63, 174.61].forEach((note, index) => {
        tone(note, 0.4, {
          type: 'sawtooth',
          volume: 0.055,
          delay: index * 0.13,
          endFreq: note * 0.98
        });
      });
    }
  };
})();

const state = {
  mode: 'intro',
  beforePause: 'playing',
  score: 0,
  displayScore: 0,
  best: loadBest(),
  level: 1,
  lives: 3,
  link: 1,
  maxLink: 1,
  bricksTotal: 1,
  bricksLeft: 1,
  serveTimer: 0,
  lastStatus: '',
  lastSub: '',
  lastIntegrity: '',
  lastLevel: '',
  lastLives: -1,
  lastBest: -1,
  toastTimer: 0,
  comboTimer: 0
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040a);
scene.fog = new THREE.FogExp2(0x02040a, 0.0125);

const camera = new THREE.PerspectiveCamera(47, window.innerWidth / window.innerHeight, 0.1, 90);
camera.position.set(-2.1, 5.9, 15.6);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
const query = new URLSearchParams(window.location.search);
const glInfo = renderer.getContext();
const debugInfo = glInfo.getExtension('WEBGL_debug_renderer_info');
const rendererName = debugInfo ? glInfo.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
const lowPower = query.has('low') || /swiftshader|llvmpipe|software/i.test(rendererName);
const useBloom = query.get('bloom') === '1';

if (lowPower) app.classList.add('low-power');
renderer.setPixelRatio(lowPower ? 0.78 : Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.outputColorSpace = THREE.SRGBColorSpace;

let composer = null;
let bloomPass = null;
try {
  if (useBloom) {
    composer = new EffectComposer(renderer);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth * 0.55, window.innerHeight * 0.55),
      0.34,
      0.22,
      0.78
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
  }
} catch (error) {
  composer = null;
}

function makeGlowTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.12, 'rgba(255,255,255,0.98)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.42)');
  gradient.addColorStop(0.62, 'rgba(255,255,255,0.1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const glowTexture = makeGlowTexture();

function makeCatchTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 48, 4, 128, 48, 124);
  gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.36, 'rgba(255,255,255,0.22)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 96);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const catchTexture = makeCatchTexture();

function makePaddleFaceTexture() {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 256;
  const ctx = c.getContext('2d');
  const w = c.width;
  const h = c.height;
  const radius = 62;

  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(w - radius, 0);
  ctx.quadraticCurveTo(w, 0, w, radius);
  ctx.lineTo(w, h - radius);
  ctx.quadraticCurveTo(w, h, w - radius, h);
  ctx.lineTo(radius, h);
  ctx.quadraticCurveTo(0, h, 0, h - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();

  const fill = ctx.createLinearGradient(0, 0, w, h);
  fill.addColorStop(0, 'rgba(10, 43, 54, 0.97)');
  fill.addColorStop(0.48, 'rgba(3, 15, 23, 0.96)');
  fill.addColorStop(1, 'rgba(8, 34, 44, 0.97)');
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(78, 243, 255, 0.08)';
  ctx.lineWidth = 2;
  for (let x = -h; x < w + h; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(78, 243, 255, 0.22)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, h * 0.3);
  ctx.lineTo(w - 30, h * 0.3);
  ctx.moveTo(30, h * 0.7);
  ctx.lineTo(w - 30, h * 0.7);
  ctx.stroke();

  for (let i = 0; i < 9; i += 1) {
    const x = 72 + i * 78;
    const bright = i === 4;
    ctx.fillStyle = bright ? 'rgba(190, 255, 255, 0.9)' : 'rgba(78, 243, 255, 0.34)';
    ctx.beginPath();
    ctx.arc(x, h * 0.5, bright ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(93, 255, 189, 0.5)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(88, h * 0.5 - 22);
  ctx.lineTo(118, h * 0.5);
  ctx.lineTo(88, h * 0.5 + 22);
  ctx.moveTo(w - 88, h * 0.5 - 22);
  ctx.lineTo(w - 118, h * 0.5);
  ctx.lineTo(w - 88, h * 0.5 + 22);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = 'rgba(150, 252, 255, 0.9)';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(78, 243, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(radius + 8, 10);
  ctx.lineTo(w - radius - 8, 10);
  ctx.moveTo(radius + 8, h - 10);
  ctx.lineTo(w - radius - 8, h - 10);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

const paddleFaceTexture = makePaddleFaceTexture();

function makeTextTexture(text, color = '#63eaff') {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = '400 46px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.fillText(text, 512, 66);
  ctx.shadowBlur = 0;
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

function lineGeometry(points) {
  return new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
}

function addLines(points, color, opacity, parent = scene) {
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const lines = new THREE.LineSegments(lineGeometry(points), material);
  parent.add(lines);
  return lines;
}

function buildEnvironment() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70),
    new THREE.MeshBasicMaterial({ color: 0x01050b })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.015, 4);
  scene.add(floor);

  const minor = [];
  for (let x = -24; x <= 24; x += 1) {
    minor.push([x, 0.012, -16], [x, 0.012, 20]);
  }
  for (let z = -16; z <= 20; z += 1) {
    minor.push([-24, 0.012, z], [24, 0.012, z]);
  }
  addLines(minor, 0x0c7188, 0.11);

  const major = [];
  for (let x = -24; x <= 24; x += 4) {
    major.push([x, 0.016, -16], [x, 0.016, 20]);
  }
  for (let z = -16; z <= 20; z += 4) {
    major.push([-24, 0.016, z], [24, 0.016, z]);
  }
  addLines(major, 0x19c8df, 0.16);

  const court = [];
  const left = -CFG.courtX;
  const right = CFG.courtX;
  court.push([left, 0.03, CFG.wallZ], [left, 0.03, CFG.paddleZ + 1.4]);
  court.push([right, 0.03, CFG.wallZ], [right, 0.03, CFG.paddleZ + 1.4]);
  court.push([left, 0.03, CFG.wallZ], [right, 0.03, CFG.wallZ]);
  court.push([left, 0.03, CFG.paddleZ + 1.4], [right, 0.03, CFG.paddleZ + 1.4]);
  court.push([0, 0.032, CFG.wallZ], [0, 0.032, CFG.paddleZ + 1.4]);
  addLines(court, 0x37eaff, 0.3);

  const sideGrid = [];
  for (let z = CFG.wallZ; z <= CFG.paddleZ + 1.4; z += 1.1) {
    sideGrid.push([left, 0.05, z], [left, CFG.ceilingY, z]);
    sideGrid.push([right, 0.05, z], [right, CFG.ceilingY, z]);
  }
  for (let y = 0.4; y <= CFG.ceilingY; y += 1.1) {
    sideGrid.push([left, y, CFG.wallZ], [left, y, CFG.paddleZ + 1.4]);
    sideGrid.push([right, y, CFG.wallZ], [right, y, CFG.paddleZ + 1.4]);
  }
  addLines(sideGrid, 0x0b4a61, 0.08);

  const rails = [];
  [-CFG.courtX, CFG.courtX].forEach((x) => {
    rails.push([x, 0.04, CFG.wallZ], [x, 0.04, CFG.paddleZ + 1.4]);
    rails.push([x, 0.04, CFG.wallZ], [x, CFG.ceilingY, CFG.wallZ]);
  });
  rails.push([-CFG.courtX, CFG.ceilingY, CFG.wallZ], [CFG.courtX, CFG.ceilingY, CFG.wallZ]);
  addLines(rails, 0x237e94, 0.22);

  const backPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(14.4, 9.4),
    new THREE.MeshBasicMaterial({
      color: 0x030812,
      transparent: true,
      opacity: 0.94,
      depthWrite: false
    })
  );
  backPanel.position.set(0, 5.0, CFG.wallZ - 0.34);
  scene.add(backPanel);

  const dotPositions = [];
  for (let x = -7.1; x <= 7.1; x += 0.36) {
    for (let y = 1.0; y <= 9.4; y += 0.36) {
      if (Math.random() > 0.24) {
        dotPositions.push(x, y + (Math.random() - 0.5) * 0.02, CFG.wallZ - 0.31);
      }
    }
  }
  const dotGeometry = new THREE.BufferGeometry();
  dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
  const wallDots = new THREE.Points(
    dotGeometry,
    new THREE.PointsMaterial({
      color: 0x0b4658,
      map: glowTexture,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(wallDots);

  const framePoints = [];
  const fx = 6.62;
  const fy1 = 1.8;
  const fy2 = 8.52;
  framePoints.push([-fx, fy1, CFG.wallZ + 0.1], [fx, fy1, CFG.wallZ + 0.1]);
  framePoints.push([fx, fy1, CFG.wallZ + 0.1], [fx, fy2, CFG.wallZ + 0.1]);
  framePoints.push([fx, fy2, CFG.wallZ + 0.1], [-fx, fy2, CFG.wallZ + 0.1]);
  framePoints.push([-fx, fy2, CFG.wallZ + 0.1], [-fx, fy1, CFG.wallZ + 0.1]);
  addLines(framePoints, 0x45e9ff, 0.34);

  const tickPoints = [];
  for (let y = 2.15; y < 8.4; y += 0.31) {
    tickPoints.push([-fx - 0.13, y, CFG.wallZ + 0.1], [-fx, y, CFG.wallZ + 0.1]);
    tickPoints.push([fx, y, CFG.wallZ + 0.1], [fx + 0.13, y, CFG.wallZ + 0.1]);
  }
  addLines(tickPoints, 0x1f8fa8, 0.2);

  const haloRing = new THREE.Mesh(
    new THREE.RingGeometry(7.25, 7.3, 128),
    new THREE.MeshBasicMaterial({
      color: 0x1e8ea8,
      transparent: true,
      opacity: 0.23,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  haloRing.position.set(0, 5.1, CFG.wallZ - 0.5);
  scene.add(haloRing);

  const pinkRing = new THREE.Mesh(
    new THREE.RingGeometry(8.35, 8.38, 128, 1, Math.PI * 0.12, Math.PI * 0.64),
    new THREE.MeshBasicMaterial({
      color: 0xff3fbe,
      transparent: true,
      opacity: 0.13,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  pinkRing.position.set(0, 5.0, CFG.wallZ - 0.55);
  scene.add(pinkRing);

  const stars = [];
  const starColors = [];
  const palette = [new THREE.Color(0x45e9ff), new THREE.Color(0xff4fd8), new THREE.Color(0x5dffbd), new THREE.Color(0x4b6bff)];
  for (let i = 0; i < 900; i += 1) {
    stars.push(rand(-30, 30), rand(-1, 25), rand(-25, 14));
    const color = palette[Math.floor(Math.random() * palette.length)].clone();
    color.multiplyScalar(rand(0.25, 0.9));
    starColors.push(color.r, color.g, color.b);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
  starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
  const starField = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      size: 0.08,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(starField);

  const dust = [];
  const dustColors = [];
  for (let i = 0; i < 220; i += 1) {
    dust.push(rand(-12, 12), rand(0.2, 10), rand(-6, 11));
    const c = new THREE.Color(Math.random() > 0.72 ? 0xff4fd8 : 0x45e9ff);
    c.multiplyScalar(rand(0.2, 0.7));
    dustColors.push(c.r, c.g, c.b);
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dust, 3));
  dustGeometry.setAttribute('color', new THREE.Float32BufferAttribute(dustColors, 3));
  const dustField = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      size: 0.055,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(dustField);

  const wallGlowLeft = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x0b6c9a,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  wallGlowLeft.position.set(-7.2, 5.2, CFG.wallZ - 1.2);
  wallGlowLeft.scale.set(8, 11, 1);
  scene.add(wallGlowLeft);

  const wallGlowRight = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x7a165f,
      transparent: true,
      opacity: 0.13,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  wallGlowRight.position.set(7.4, 4.4, CFG.wallZ - 1.4);
  wallGlowRight.scale.set(8, 10, 1);
  scene.add(wallGlowRight);

  const poolGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 4.4),
    new THREE.MeshBasicMaterial({
      map: glowTexture,
      color: 0x0d6d8e,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  poolGlow.rotation.x = -Math.PI / 2;
  poolGlow.position.set(0, 0.025, CFG.wallZ + 1.9);
  scene.add(poolGlow);

  const poolGlowPink = poolGlow.clone();
  poolGlowPink.material = poolGlow.material.clone();
  poolGlowPink.material.color.set(0x7a1b67);
  poolGlowPink.material.opacity = 0.13;
  poolGlowPink.scale.set(0.7, 1, 1);
  poolGlowPink.position.set(5.1, 0.026, CFG.wallZ + 2.1);
  scene.add(poolGlowPink);

  const scanner = new THREE.Mesh(
    new THREE.PlaneGeometry(12.4, 0.035),
    new THREE.MeshBasicMaterial({
      color: 0x5dffd0,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  scanner.position.set(0, 3, CFG.wallZ + 0.12);
  scene.add(scanner);

  const pylons = [];
  [-1, 1].forEach((side) => {
    const color = side < 0 ? 0x3ee8ff : 0xff3fbe;
    const pylon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 9.4, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending })
    );
    pylon.position.set(side * 7.12, 4.75, CFG.wallZ - 0.02);
    scene.add(pylon);
    pylons.push(pylon);

    const pylonGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    pylonGlow.position.set(side * 7.12, 4.75, CFG.wallZ - 0.05);
    pylonGlow.scale.set(1.4, 9.8, 1);
    scene.add(pylonGlow);

    const baseGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    baseGlow.position.set(side * 7.12, 0.3, CFG.wallZ + 0.1);
    baseGlow.scale.set(2.4, 1.2, 1);
    scene.add(baseGlow);
  });

  return { haloRing, pinkRing, starField, dustField, wallDots, scanner, pylons, poolGlow };
}

const env = buildEnvironment();

const bricks = [];
const wallUniforms = {
  uTime: { value: 0 },
  uBuild: { value: 0 },
  uScale: { value: 500 }
};

const wallMaterial = new THREE.ShaderMaterial({
  uniforms: wallUniforms,
  vertexShader: `
    attribute float aSize;
    attribute float aPhase;
    attribute float aDelay;
    attribute vec3 color;
    uniform float uTime;
    uniform float uBuild;
    uniform float uScale;
    varying vec3 vColor;
    varying float vGrow;
    varying float vPhase;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      float grow = smoothstep(aDelay, aDelay + 0.3, uBuild);
      float pulse = 1.0 + 0.04 * sin(uTime * 1.8 + aPhase);
      gl_PointSize = aSize * pulse * grow * (uScale / max(0.1, -mvPosition.z));
      vColor = color;
      vGrow = grow;
      vPhase = aPhase;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vGrow;
    varying float vPhase;

    void main() {
      vec2 p = gl_PointCoord * 2.0 - 1.0;
      float d = length(p);
      if (d > 1.0) discard;
      float halo = pow(smoothstep(1.0, 0.0, d), 2.7);
      float core = pow(smoothstep(0.34, 0.0, d), 1.4);
      float ring = smoothstep(0.055, 0.0, abs(d - 0.61));
      float shimmer = 0.88 + 0.12 * sin(vPhase * 3.7);
      vec3 col = vColor * (halo * 0.6 + core * 1.18 + ring * 0.14) * shimmer;
      gl_FragColor = vec4(col * vGrow, 1.0);
    }
  `,
  transparent: true,
  depthWrite: false,
  depthTest: true,
  blending: THREE.AdditiveBlending
});

let wallPoints = null;
let wallGeometry = null;
let wallColorAttr = null;
let wallSizeAttr = null;

function updatePointScale() {
  wallUniforms.uScale.value = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  wallUniforms.uScale.value *= 0.9;
}

let wallLabel = null;
let wallLabelTexture = null;
let wallLabelCanvas = null;

function updateWallLabel() {
  if (!wallLabel) {
    wallLabelCanvas = document.createElement('canvas');
    wallLabelCanvas.width = 1024;
    wallLabelCanvas.height = 128;
    wallLabelTexture = new THREE.CanvasTexture(wallLabelCanvas);
    wallLabelTexture.colorSpace = THREE.SRGBColorSpace;
    wallLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 0.6),
      new THREE.MeshBasicMaterial({
        map: wallLabelTexture,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    wallLabel.position.set(0, 1.32, CFG.wallZ + 0.04);
    scene.add(wallLabel);
  }

  const ctx = wallLabelCanvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 128);
  ctx.font = '400 45px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4ed8e8';
  ctx.shadowColor = '#4ef3ff';
  ctx.shadowBlur = 18;
  ctx.fillText(`SECTOR ${String(state.level).padStart(2, '0')}  //  DOT MATRIX WALL`, 512, 66);
  ctx.shadowBlur = 0;
  wallLabelTexture.needsUpdate = true;
}

function isPatternOpen(col, row, level) {
  if (level <= 1) return false;
  if (level === 2) return (col + row) % 5 === 2;
  if (level === 3) {
    const dx = Math.abs(col - (CFG.cols - 1) / 2);
    const dy = Math.abs(row - (CFG.rows - 1) / 2);
    return dx * 0.8 + dy > 4.35;
  }
  if (level === 4) return (col * 3 + row * 5 + level * 2) % 7 === 0;
  return Math.random() < Math.min(0.19, 0.05 + level * 0.012);
}

function buildWall(level) {
  bricks.length = 0;
  if (wallPoints) {
    scene.remove(wallPoints);
    wallGeometry.dispose();
    wallPoints = null;
  }

  const colors = ROW_COLORS.map((hex) => new THREE.Color(hex));
  const list = [];

  for (let row = 0; row < CFG.rows; row += 1) {
    for (let col = 0; col < CFG.cols; col += 1) {
      if (isPatternOpen(col, row, level)) continue;
      const x = (col - (CFG.cols - 1) / 2) * CFG.gapX;
      const y = CFG.wallCenterY + (row - (CFG.rows - 1) / 2) * CFG.gapY;
      const isCore = (col * 7 + row * 5 + level) % 19 === 3;
      list.push({ x, y, row, col, isCore, color: colors[row].clone() });
    }
  }

  const count = Math.max(1, list.length);
  const positions = new Float32Array(count * 3);
  const colorValues = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const delays = new Float32Array(count);

  list.forEach((item, index) => {
    const color = item.color.clone();
    if (item.isCore) color.lerp(new THREE.Color(0xffffff), 0.48);
    const baseSize = item.isCore ? 1.56 : 1.06;
    item.index = index;
    positions[index * 3] = item.x;
    positions[index * 3 + 1] = item.y;
    positions[index * 3 + 2] = CFG.wallZ;
    colorValues[index * 3] = color.r;
    colorValues[index * 3 + 1] = color.g;
    colorValues[index * 3 + 2] = color.b;
    sizes[index] = baseSize;
    phases[index] = Math.random() * Math.PI * 2;
    delays[index] = index * 0.0065;
  });

  wallGeometry = new THREE.BufferGeometry();
  wallGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  wallColorAttr = new THREE.BufferAttribute(colorValues, 3).setUsage(THREE.DynamicDrawUsage);
  wallSizeAttr = new THREE.BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage);
  wallGeometry.setAttribute('color', wallColorAttr);
  wallGeometry.setAttribute('aSize', wallSizeAttr);
  wallGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  wallGeometry.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1));
  wallGeometry.computeBoundingSphere();

  wallPoints = new THREE.Points(wallGeometry, wallMaterial);
  wallPoints.frustumCulled = false;
  scene.add(wallPoints);

  list.forEach((item) => {
    const baseSize = item.isCore ? 1.56 : 1.06;
    bricks.push({
      x: item.x,
      y: item.y,
      row: item.row,
      col: item.col,
      radius: item.isCore ? 0.35 : CFG.brickRadius,
      hp: item.isCore ? 2 : 1,
      maxHp: item.isCore ? 2 : 1,
      core: item.isCore,
      color: item.color.clone(),
      baseColor: item.color.clone(),
      index: item.index,
      baseSize,
      alive: true,
      flash: 0
    });
  });

  wallUniforms.uBuild.value = 0;
  state.bricksTotal = Math.max(1, bricks.length);
  state.bricksLeft = bricks.length;
  updatePointScale();
  updateWallLabel();
  updateHUD(true);
}

function roundedRectShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  shape.closePath();
  return shape;
}

function createPaddle() {
  const group = new THREE.Group();
  group.position.set(0, 2.1, CFG.paddleZ);

  const field = new THREE.Mesh(
    new THREE.PlaneGeometry(CFG.paddleWidth * 1.06, 1.3),
    new THREE.MeshBasicMaterial({
      map: catchTexture,
      color: 0x4ef3ff,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  field.position.z = 0.2;
  group.add(field);

  const bladeGeometry = new THREE.ExtrudeGeometry(
    roundedRectShape(CFG.paddleWidth, CFG.paddleHeight, 0.32),
    {
      depth: 0.14,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      curveSegments: 14
    }
  );
  bladeGeometry.center();
  const blade = new THREE.Mesh(
    bladeGeometry,
    new THREE.MeshBasicMaterial({ color: 0x2bdcff, toneMapped: false })
  );
  blade.position.z = 0.02;
  group.add(blade);

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(CFG.paddleWidth - 0.14, CFG.paddleHeight - 0.12),
    new THREE.MeshBasicMaterial({
      map: paddleFaceTexture,
      transparent: true,
      toneMapped: false
    })
  );
  face.position.z = 0.13;
  group.add(face);

  const faceBack = face.clone();
  faceBack.material = face.material.clone();
  faceBack.rotation.y = Math.PI;
  faceBack.position.z = -0.1;
  group.add(faceBack);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.16, 0.26, 14),
    new THREE.MeshBasicMaterial({ color: 0x2bdcff, toneMapped: false })
  );
  neck.position.set(0, -0.54, 0.1);
  group.add(neck);

  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.125, 0.155, 0.64, 12),
    new THREE.MeshBasicMaterial({ color: 0x1b8fa8, toneMapped: false })
  );
  grip.position.set(0, -0.76, 0.14);
  group.add(grip);

  const gripCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.1, 0.55, 10),
    new THREE.MeshBasicMaterial({ color: 0x061c25, toneMapped: false })
  );
  gripCore.position.set(0, -0.76, 0.2);
  group.add(gripCore);

  [-0.62, -0.75, -0.88].forEach((y, index) => {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.132 - index * 0.004, 0.136 - index * 0.004, 0.026, 12),
      new THREE.MeshBasicMaterial({ color: index === 1 ? 0xffffff : 0x5dffbd, toneMapped: false })
    );
    band.position.set(0, y, 0.14);
    group.add(band);
  });

  const pommel = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.12, 0),
    new THREE.MeshBasicMaterial({ color: 0x9dffff, toneMapped: false })
  );
  pommel.position.set(0, -1.08, 0.14);
  pommel.rotation.z = Math.PI / 4;
  group.add(pommel);

  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.095, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
  );
  gem.position.z = 0.145;
  gem.rotation.z = Math.PI / 4;
  group.add(gem);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x31eaff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  glow.scale.set(5.2, 2.1, 1);
  glow.position.z = -0.12;
  group.add(glow);

  const endGlows = [];
  [-1, 1].forEach((side) => {
    const endGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0x9affff,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    endGlow.position.set(side * (CFG.paddleWidth / 2 - 0.08), 0, 0.1);
    endGlow.scale.set(0.62, 0.95, 1);
    group.add(endGlow);
    endGlows.push(endGlow);
  });

  const handleGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x5dffbd,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  handleGlow.position.set(0, -0.76, 0.28);
  handleGlow.scale.set(0.85, 1.7, 1);
  group.add(handleGlow);
  endGlows.push(handleGlow);

  const under = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x278db8,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  under.scale.set(4.8, 2.6, 1);
  under.position.set(0, -0.4, -0.28);
  group.add(under);

  scene.add(group);

  const tether = new THREE.Mesh(
    new THREE.PlaneGeometry(0.028, 1),
    new THREE.MeshBasicMaterial({
      color: 0x2bd9f5,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  tether.position.set(0, 1, CFG.paddleZ + 0.06);
  scene.add(tether);

  const floorPool = new THREE.Mesh(
    new THREE.PlaneGeometry(2.9, 1.4),
    new THREE.MeshBasicMaterial({
      map: glowTexture,
      color: 0x1fa7c8,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  floorPool.rotation.x = -Math.PI / 2;
  floorPool.position.set(0, 0.035, CFG.paddleZ + 0.34);
  scene.add(floorPool);

  return {
    group,
    field,
    blade,
    face,
    glow,
    endGlows,
    under,
    tether,
    floorPool,
    x: 0,
    y: 2.1,
    targetX: 0,
    targetY: 2.1,
    vx: 0,
    vy: 0,
    flash: 0
  };
}

const paddle = createPaddle();

function createBall() {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xf4ffff, toneMapped: false });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(CFG.ballRadius, 24, 18), material);
  group.add(sphere);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(CFG.ballRadius * 0.48, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
  );
  core.position.z = CFG.ballRadius * 0.45;
  group.add(core);

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x7dfbff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  halo.scale.set(1.08, 1.08, 1);
  group.add(halo);

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(0.27, 0.008, 5, 32),
    new THREE.MeshBasicMaterial({
      color: 0x7dfbff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  group.add(ringA);

  const ringB = ringA.clone();
  ringB.rotation.x = Math.PI / 2.3;
  ringB.rotation.y = Math.PI / 3;
  group.add(ringB);

  scene.add(group);

  const trail = [];
  for (let i = 0; i < 9; i += 1) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: i < 5 ? 0x9cfbff : 0x35a9d0,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    sprite.visible = false;
    scene.add(sprite);
    trail.push(sprite);
  }

  return {
    group,
    sphere,
    halo,
    ringA,
    ringB,
    trail,
    history: [],
    pos: new THREE.Vector3(0, 2.6, 4.6),
    prev: new THREE.Vector3(0, 2.6, 4.6),
    vel: new THREE.Vector3(0, 0, 0),
    radius: CFG.ballRadius,
    speed: CFG.ballSpeed,
    active: false
  };
}

const ball = createBall();
ball.group.visible = true;

function createParticles() {
  const max = 460;
  const positions = new Float32Array(max * 3);
  const colors = new Float32Array(max * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
  const material = new THREE.PointsMaterial({
    size: 0.24,
    map: glowTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const data = [];
  for (let i = 0; i < max; i += 1) {
    data.push({
      life: 0,
      maxLife: 1,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      color: new THREE.Color(0, 0, 0)
    });
  }

  let cursor = 0;

  function emit(position, color, count, power = 1) {
    for (let i = 0; i < count; i += 1) {
      const item = data[cursor];
      cursor = (cursor + 1) % max;
      item.life = rand(0.35, 0.82) * power;
      item.maxLife = item.life;
      item.position.copy(position);
      item.position.x += rand(-0.12, 0.12);
      item.position.y += rand(-0.12, 0.12);
      item.position.z += rand(-0.08, 0.08);
      item.velocity.set(rand(-1, 1), rand(-0.5, 1.3), rand(-1, 1)).normalize().multiplyScalar(rand(1.4, 5.4) * power);
      item.color.copy(color).multiplyScalar(rand(0.7, 1.4));
    }
  }

  function update(dt) {
    for (let i = 0; i < max; i += 1) {
      const item = data[i];
      const i3 = i * 3;
      if (item.life > 0) {
        item.life -= dt;
        item.velocity.y -= 2.4 * dt;
        item.velocity.multiplyScalar(1 - 1.1 * dt);
        item.position.addScaledVector(item.velocity, dt);
        const ratio = Math.max(0, item.life / item.maxLife);
        positions[i3] = item.position.x;
        positions[i3 + 1] = item.position.y;
        positions[i3 + 2] = item.position.z;
        colors[i3] = item.color.r * ratio * ratio;
        colors[i3 + 1] = item.color.g * ratio * ratio;
        colors[i3 + 2] = item.color.b * ratio * ratio;
      } else {
        colors[i3] = 0;
        colors[i3 + 1] = 0;
        colors[i3 + 2] = 0;
        positions[i3 + 1] = -20;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }

  return { emit, update };
}

const particles = createParticles();

function createRings() {
  const pool = [];
  const geometry = new THREE.RingGeometry(0.95, 1, 64);
  for (let i = 0; i < 16; i += 1) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    scene.add(mesh);
    pool.push({ mesh, material, life: 0, maxLife: 1, growth: 2, flat: false });
  }

  let index = 0;

  function spawn(position, color, size = 1, flat = false, duration = 0.55) {
    const item = pool[index];
    index = (index + 1) % pool.length;
    item.life = duration;
    item.maxLife = duration;
    item.growth = size * 3.4;
    item.flat = flat;
    item.mesh.position.copy(position);
    item.mesh.rotation.set(flat ? -Math.PI / 2 : 0, 0, 0);
    item.mesh.scale.setScalar(size);
    item.mesh.visible = true;
    item.material.color.set(color);
    item.material.opacity = 0.62;
  }

  function update(dt) {
    pool.forEach((item) => {
      if (item.life <= 0) return;
      item.life -= dt;
      const t = 1 - Math.max(0, item.life / item.maxLife);
      const scale = 1 + t * item.growth;
      item.mesh.scale.set(scale, scale, scale);
      item.material.opacity = (1 - t) * 0.58;
      if (item.life <= 0) item.mesh.visible = false;
    });
  }

  return { spawn, update };
}

const rings = createRings();

function updateHUD(force = false) {
  const integrity = Math.round((state.bricksLeft / state.bricksTotal) * 100);
  const integrityText = `${integrity}%`;
  const levelText = String(state.level).padStart(2, '0');

  if (force || integrityText !== state.lastIntegrity) {
    integrityEl.innerHTML = `${integrity}<i>%</i>`;
    state.lastIntegrity = integrityText;
  }

  if (force || levelText !== state.lastLevel) {
    levelEl.textContent = levelText;
    state.lastLevel = levelText;
  }

  if (force || state.lives !== state.lastLives) {
    const shown = Math.max(state.lives, 0);
    livesEl.innerHTML = '';
    for (let i = 0; i < 3; i += 1) {
      const pip = document.createElement('i');
      if (i >= shown) pip.className = 'spent';
      livesEl.appendChild(pip);
    }
    livesEl.setAttribute('aria-label', `${shown} shields remaining`);
    state.lastLives = state.lives;
  }

  if (force || state.best !== state.lastBest) {
    bestEl.textContent = formatScore(state.best);
    introBestEl.textContent = formatScore(state.best);
    state.lastBest = state.best;
  }

  const status = getStatus();
  if (force || status.text !== state.lastStatus) {
    statusTextEl.textContent = status.text;
    state.lastStatus = status.text;
  }
  if (force || status.sub !== state.lastSub) {
    statusSubEl.textContent = status.sub;
    state.lastSub = status.sub;
  }
  statusbarEl.classList.toggle('paused', state.mode === 'paused');
  statusbarEl.classList.toggle('danger', state.mode === 'over' || state.mode === 'dying');

  updateComboLabel();
}

function getStatus() {
  switch (state.mode) {
    case 'serving':
      return { text: 'BALL READY', sub: `LINK x${state.link}` };
    case 'playing':
      return { text: 'SIGNAL LIVE', sub: `LINK x${state.link}` };
    case 'paused':
      return { text: 'SIGNAL PAUSED', sub: 'GRID HOLDING' };
    case 'levelclear':
      return { text: 'SECTOR CLEAR', sub: 'RECALIBRATING' };
    case 'dying':
    case 'over':
      return { text: 'SIGNAL LOST', sub: 'CONNECTION LOST' };
    default:
      return { text: 'STANDBY', sub: 'SIGNAL 0.0' };
  }
}

function updateComboLabel() {
  if (state.link > 1 && state.mode !== 'intro' && state.mode !== 'over') {
    comboValueEl.textContent = `x${state.link}`;
    comboEl.classList.add('show');
  } else {
    comboEl.classList.remove('show');
  }
}

function addScore(amount) {
  state.score += amount;
  if (state.score > state.best) {
    state.best = state.score;
    saveBest(state.best);
  }
  updateHUD();
}

function showToast(kicker, main, duration = 1700) {
  toastKickerEl.textContent = kicker;
  toastMainEl.textContent = main;
  toastEl.classList.add('show');
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);
}

function flashImpact(strength = 1) {
  impactEl.classList.remove('fire');
  void impactEl.offsetWidth;
  impactEl.style.opacity = String(0.45 * strength);
  impactEl.classList.add('fire');
}

function setServe(delay = 0.7) {
  state.mode = 'serving';
  state.serveTimer = -delay;
  ball.active = false;
  ball.vel.set(0, 0, 0);
  ball.group.visible = true;
  ball.history.length = 0;
  ball.trail.forEach((sprite) => {
    sprite.visible = false;
    sprite.material.opacity = 0;
  });
  ball.pos.set(paddle.x, Math.min(paddle.y + 0.58, CFG.ceilingY - 0.4), CFG.paddleZ - 0.62);
  ball.group.position.copy(ball.pos);
  updateHUD(true);
}

function launchBall() {
  if (state.mode !== 'serving') return;
  state.mode = 'playing';
  state.serveTimer = 0;
  ball.active = true;
  const dir = new THREE.Vector3(
    rand(-0.34, 0.34),
    rand(0.1, 0.32),
    -1
  ).normalize();
  ball.speed = CFG.ballSpeed + (state.level - 1) * 0.42 + Math.min(1.8, state.bricksTotal * 0.002);
  ball.vel.copy(dir).multiplyScalar(ball.speed);
  rings.spawn(ball.pos, 0x4ef3ff, 0.18);
  particles.emit(ball.pos, new THREE.Color(0x9cfbff), 12, 0.6);
  sound.launch();
  updateHUD(true);
}

function startGame() {
  sound.unlock();
  introScreen.classList.add('hidden');
  introScreen.setAttribute('aria-hidden', 'true');
  gameoverScreen.classList.add('hidden');
  gameoverScreen.setAttribute('aria-hidden', 'true');
  pauseScreen.classList.add('hidden');
  pauseScreen.setAttribute('aria-hidden', 'true');
  app.classList.remove('is-intro', 'is-over', 'is-paused');
  app.classList.add('is-playing');

  state.mode = 'serving';
  state.score = 0;
  state.displayScore = 0;
  state.level = 1;
  state.lives = 3;
  state.link = 1;
  state.maxLink = 1;
  state.lastLives = -1;
  state.lastIntegrity = '';
  state.lastLevel = '';
  paddle.x = 0;
  paddle.y = 2.1;
  paddle.targetX = 0;
  paddle.targetY = 2.1;
  paddle.vx = 0;
  paddle.vy = 0;
  mouse.active = false;
  mouse.x = 0;
  mouse.y = 0;
  usingKeyboard = false;
  buildWall(1);
  setServe(1.15);
  showToast('SECTOR 01', 'BREAK THE WALL', 2200);
  updateHUD(true);
}

function loseBall() {
  if (state.mode !== 'playing') return;
  state.mode = 'dying';
  state.lives -= 1;
  state.link = 1;
  ball.active = false;
  ball.group.visible = false;
  ball.trail.forEach((sprite) => {
    sprite.visible = false;
    sprite.material.opacity = 0;
  });
  flashImpact(1);
  shake = Math.max(shake, 0.7);
  sound.lose();
  updateHUD(true);

  window.setTimeout(() => {
    if (state.mode !== 'dying') return;
    if (state.lives <= 0) {
      finishGame();
    } else {
      setServe(0.6);
      showToast(`SHIELD ${state.lives}`, 'SIGNAL REACQUIRED', 1500);
    }
  }, 850);
}

function finishGame() {
  state.mode = 'over';
  state.maxLink = Math.max(state.maxLink, state.link);
  app.classList.add('is-over');
  gameoverScreen.classList.remove('hidden');
  gameoverScreen.setAttribute('aria-hidden', 'false');
  $('final-score').textContent = formatScore(state.score);
  $('final-level').textContent = String(state.level).padStart(2, '0');
  $('final-combo').textContent = `x${state.maxLink}`;
  $('final-best').textContent = formatScore(state.best);
  sound.over();
  updateHUD(true);
}

function restartGame() {
  sound.ui();
  gameoverScreen.classList.add('hidden');
  gameoverScreen.setAttribute('aria-hidden', 'true');
  app.classList.remove('is-over');
  startGame();
}

function clearLevel() {
  if (state.mode !== 'playing') return;
  state.mode = 'levelclear';
  ball.active = false;
  ball.group.visible = false;
  ball.trail.forEach((sprite) => {
    sprite.visible = false;
    sprite.material.opacity = 0;
  });
  state.maxLink = Math.max(state.maxLink, state.link);
  const bonus = 1000 * state.level + state.lives * 250;
  addScore(bonus);
  sound.clear();
  flashImpact(0.5);
  const colors = [0x4ef3ff, 0x5dffbd, 0xff4fd8, 0xffd166];
  for (let i = 0; i < 7; i += 1) {
    const pos = new THREE.Vector3(rand(-5.4, 5.4), rand(2.6, 7.6), CFG.wallZ + 0.2);
    particles.emit(pos, new THREE.Color(colors[i % colors.length]), 12, 1.1);
    rings.spawn(pos, colors[i % colors.length], rand(0.35, 0.8));
  }
  showToast('SECTOR CLEARED', `BONUS +${bonus}`, 2100);
  updateHUD(true);

  window.setTimeout(() => {
    if (state.mode !== 'levelclear') return;
    state.level += 1;
    state.link = 1;
    buildWall(state.level);
    setServe(0.85);
    showToast(`SECTOR ${String(state.level).padStart(2, '0')}`, 'NEW WALL ONLINE', 2100);
    updateHUD(true);
  }, 2200);
}

function damageBrick(brick, damage) {
  if (!brick.alive) return 0;
  brick.hp -= damage;
  brick.flash = 0.18;
  let score = 0;

  if (brick.hp > 0) {
    score = (brick.core ? 160 : 70) * state.link;
    particles.emit(
      new THREE.Vector3(brick.x, brick.y, CFG.wallZ + 0.15),
      brick.color,
      brick.core ? 12 : 5,
      0.55
    );
    return score;
  }

  brick.alive = false;
  wallSizeAttr.array[brick.index] = 0;
  wallColorAttr.array[brick.index * 3] = 0;
  wallColorAttr.array[brick.index * 3 + 1] = 0;
  wallColorAttr.array[brick.index * 3 + 2] = 0;
  wallSizeAttr.needsUpdate = true;
  wallColorAttr.needsUpdate = true;
  state.bricksLeft = Math.max(0, state.bricksLeft - 1);
  score = (brick.core ? 260 : 120) * state.link;
  particles.emit(
    new THREE.Vector3(brick.x, brick.y, CFG.wallZ + 0.2),
    brick.color,
    brick.core ? 26 : 15,
    1
  );
  return score;
}

function blastWall(cx, cy) {
  const targets = bricks.filter((brick) => {
    if (!brick.alive) return false;
    const dx = brick.x - cx;
    const dy = brick.y - cy;
    return Math.hypot(dx, dy) <= CFG.blastRadius;
  });

  let total = 0;
  targets.forEach((brick) => {
    total += damageBrick(brick, 1);
  });

  if (total > 0) {
    addScore(total);
    sound.brick(6 - Math.round((cy - 2.5) / 0.8));
    shake = Math.max(shake, 0.3);
    rings.spawn(new THREE.Vector3(cx, cy, CFG.wallZ + 0.2), 0x9cfbff, 0.68);
  }
  updateHUD(true);

  if (state.bricksLeft <= 0) {
    clearLevel();
  }
}

function applyBallSpeed() {
  const len = ball.vel.length();
  if (len === 0) return;
  ball.vel.multiplyScalar(ball.speed / len);
}

function handleWallCollision() {
  const hitX = ball.pos.x;
  const hitY = ball.pos.y;
  let nearest = null;
  let nearestDist = Infinity;

  for (const brick of bricks) {
    if (!brick.alive) continue;
    const distance = Math.hypot(hitX - brick.x, hitY - brick.y);
    if (distance < nearestDist) {
      nearestDist = distance;
      nearest = brick;
    }
  }

  if (nearest && nearestDist <= nearest.radius + ball.radius + 0.16) {
    ball.vel.x += (hitX - nearest.x) * 1.45;
    ball.vel.y += (hitY - nearest.y) * 1.15;
    ball.speed = Math.min(20.5, ball.speed + 0.06);
    blastWall(nearest.x, nearest.y);
  } else {
    sound.wall();
    particles.emit(new THREE.Vector3(hitX, hitY, CFG.wallZ + 0.1), new THREE.Color(0x74d8e8), 5, 0.5);
    shake = Math.max(shake, 0.12);
  }

  ball.pos.z = CFG.wallZ + ball.radius;
  ball.vel.z = Math.abs(ball.vel.z);
  ball.vel.y = clamp(ball.vel.y, -7.5, 7.5);
  ball.vel.x = clamp(ball.vel.x, -8.6, 8.6);
  applyBallSpeed();
}

function handlePaddleHit() {
  const offsetX = clamp((ball.pos.x - paddle.x) / (CFG.paddleWidth / 2), -1, 1);
  const offsetY = clamp((ball.pos.y - paddle.y) / 0.52, -1, 1);
  const dir = new THREE.Vector3(
    offsetX * 1.18 + paddle.vx * 0.035,
    offsetY * 0.9 + clamp(ball.vel.y * 0.18, -1, 1),
    -1.3
  ).normalize();
  ball.speed = Math.min(20.5, ball.speed + 0.09);
  ball.vel.copy(dir).multiplyScalar(ball.speed);
  ball.pos.z = CFG.paddleZ - ball.radius - 0.02;
  state.link = Math.min(9, state.link + 1);
  state.maxLink = Math.max(state.maxLink, state.link);
  addScore(25 * state.link);
  paddle.flash = 0.25;
  shake = Math.max(shake, 0.14);
  sound.paddle();
  rings.spawn(new THREE.Vector3(ball.pos.x, ball.pos.y, CFG.paddleZ - 0.1), 0x9cfbff, 0.16, false, 0.35);
  particles.emit(new THREE.Vector3(ball.pos.x, ball.pos.y, CFG.paddleZ - 0.12), new THREE.Color(0x9cfbff), 8, 0.55);
  updateHUD(true);
}

function updateBall(dt) {
  if (!ball.active) return;
  const distance = ball.vel.length() * dt;
  const steps = clamp(Math.ceil(distance / 0.16), 1, 9);
  const stepDt = dt / steps;

  for (let step = 0; step < steps; step += 1) {
    ball.prev.copy(ball.pos);
    ball.pos.addScaledVector(ball.vel, stepDt);

    if (ball.pos.x < -CFG.courtX + ball.radius) {
      ball.pos.x = -CFG.courtX + ball.radius;
      ball.vel.x = Math.abs(ball.vel.x);
      shake = Math.max(shake, 0.06);
    } else if (ball.pos.x > CFG.courtX - ball.radius) {
      ball.pos.x = CFG.courtX - ball.radius;
      ball.vel.x = -Math.abs(ball.vel.x);
      shake = Math.max(shake, 0.06);
    }

    if (ball.pos.y < CFG.floorY + ball.radius) {
      ball.pos.y = CFG.floorY + ball.radius;
      ball.vel.y = Math.abs(ball.vel.y);
      rings.spawn(new THREE.Vector3(ball.pos.x, CFG.floorY + 0.02, ball.pos.z), 0x2a8fa8, 0.25, true, 0.4);
      shake = Math.max(shake, 0.05);
    } else if (ball.pos.y > CFG.ceilingY - ball.radius) {
      ball.pos.y = CFG.ceilingY - ball.radius;
      ball.vel.y = -Math.abs(ball.vel.y);
      shake = Math.max(shake, 0.05);
    }

    if (ball.pos.z <= CFG.wallZ + ball.radius && ball.vel.z < 0) {
      handleWallCollision();
    }

    if (ball.pos.z >= CFG.paddleZ - ball.radius && ball.vel.z > 0) {
      const withinX = Math.abs(ball.pos.x - paddle.x) <= CFG.paddleWidth / 2 + ball.radius;
      const withinY = Math.abs(ball.pos.y - paddle.y) <= CFG.paddleHeight / 2 + ball.radius;
      if (withinX && withinY) {
        handlePaddleHit();
      }
    }

    if (ball.pos.z > CFG.loseZ) {
      loseBall();
      return;
    }
  }

  ball.group.position.copy(ball.pos);
  ball.group.rotation.x += dt * 1.6;
  ball.group.rotation.y += dt * 2.2;
  ball.ringA.rotation.z += dt * 2.4;
  ball.ringB.rotation.y -= dt * 2;
  ball.halo.material.opacity = 0.62 + Math.sin(performance.now() * 0.012) * 0.16;

  ball.history.unshift(ball.pos.clone());
  if (ball.history.length > 29) ball.history.length = 29;

  ball.trail.forEach((sprite, index) => {
    const point = ball.history[Math.min(ball.history.length - 1, (index + 1) * 2)];
    if (!point) {
      sprite.visible = false;
      return;
    }
    sprite.visible = true;
    sprite.position.copy(point);
    const fade = 1 - index / ball.trail.length;
    sprite.material.opacity = fade * 0.33;
    const scale = 0.58 * fade + 0.04;
    sprite.scale.set(scale, scale, 1);
  });
}

let shake = 0;
const lookAt = new THREE.Vector3(0.6, 4.55, -1.0);
const desiredPos = new THREE.Vector3();
const desiredLook = new THREE.Vector3();

const mouse = { x: 0, y: 0, active: false };
const keys = new Set();
let usingKeyboard = false;

function updatePaddle(dt) {
  const previousX = paddle.x;
  const previousY = paddle.y;

  if (state.mode === 'intro') {
    paddle.targetX = Math.sin(performance.now() * 0.00052) * 2.25;
    paddle.targetY = 2.02 + Math.sin(performance.now() * 0.0008) * 0.34;
  } else if (usingKeyboard) {
    let dx = 0;
    let dy = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) dy += 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) dy -= 1;
    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy) || 1;
      paddle.targetX += (dx / length) * 8.8 * dt;
      paddle.targetY += (dy / length) * 8.2 * dt;
    }
    paddle.targetX = clamp(paddle.targetX, -6.75, 6.75);
    paddle.targetY = clamp(paddle.targetY, 1.12, 8.65);
  } else if (mouse.active) {
    paddle.targetX = mouse.x * 6.9;
    paddle.targetY = 4.55 - mouse.y * 4.1;
    paddle.targetX = clamp(paddle.targetX, -6.75, 6.75);
    paddle.targetY = clamp(paddle.targetY, 1.12, 8.65);
  } else if (state.mode === 'playing') {
    paddle.targetX = clamp(ball.pos.x + ball.vel.x * 0.055, -6.75, 6.75);
    paddle.targetY = clamp(ball.pos.y + ball.vel.y * 0.055, 1.12, 8.65);
  }

  const smoothing = 1 - Math.exp(-dt * (state.mode === 'intro' ? 2.2 : 15));
  paddle.x = lerp(paddle.x, paddle.targetX, smoothing);
  paddle.y = lerp(paddle.y, paddle.targetY, smoothing);
  paddle.vx = (paddle.x - previousX) / Math.max(dt, 0.001);
  paddle.vy = (paddle.y - previousY) / Math.max(dt, 0.001);
  paddle.group.position.set(paddle.x, paddle.y, CFG.paddleZ);
  paddle.group.rotation.z = clamp(paddle.vx * 0.006, -0.055, 0.055);

  paddle.tether.position.set(paddle.x, Math.max(0.025, paddle.y) / 2, CFG.paddleZ + 0.08);
  paddle.tether.scale.y = Math.max(0.05, paddle.y);
  paddle.floorPool.position.set(paddle.x, 0.035, CFG.paddleZ + 0.34);

  paddle.flash = Math.max(0, paddle.flash - dt);
  const flashBoost = paddle.flash * 2.5;
  paddle.field.material.opacity = 0.15 + Math.sin(performance.now() * 0.004) * 0.025 + flashBoost * 0.18;
  paddle.glow.material.opacity = 0.4 + Math.sin(performance.now() * 0.005) * 0.08 + flashBoost * 0.2;
  paddle.under.material.opacity = 0.18 + flashBoost * 0.16;
  paddle.tether.material.opacity = 0.12 + Math.sin(performance.now() * 0.004) * 0.04 + flashBoost * 0.16;
  paddle.floorPool.material.opacity = 0.12 + flashBoost * 0.2;
  paddle.endGlows.forEach((glow, index) => {
    glow.material.opacity = 0.55 + Math.sin(performance.now() * 0.008 + index * 1.7) * 0.2 + flashBoost * 0.15;
  });
}

function updateServing(dt) {
  state.serveTimer += dt;
  const bounce = Math.sin(performance.now() * 0.006) * 0.06;
  ball.pos.set(
    paddle.x,
    Math.min(paddle.y + 0.58 + bounce, CFG.ceilingY - 0.35),
    CFG.paddleZ - 0.62
  );
  ball.group.position.copy(ball.pos);
  ball.group.rotation.y += dt * 1.4;
  ball.ringA.rotation.z += dt * 2;
  ball.halo.material.opacity = 0.55 + Math.sin(performance.now() * 0.008) * 0.2;
  ball.trail.forEach((sprite) => {
    sprite.visible = false;
  });

  if (state.serveTimer >= 2.05) launchBall();
}

function updateBricks(dt) {
  const now = performance.now() / 1000;
  wallUniforms.uTime.value = now;
  if (wallUniforms.uBuild.value < 2) {
    wallUniforms.uBuild.value = Math.min(2, wallUniforms.uBuild.value + dt * 2.2);
  }

  const colors = wallColorAttr.array;
  const sizes = wallSizeAttr.array;
  const white = new THREE.Color(0xffffff);
  const temp = new THREE.Color();

  bricks.forEach((brick) => {
    if (!brick.alive) return;
    brick.flash = Math.max(0, brick.flash - dt);
    const mix = brick.flash / 0.18;
    temp.copy(brick.color).lerp(white, mix * 0.88);
    if (brick.hp < brick.maxHp) temp.multiplyScalar(0.58);
    colors[brick.index * 3] = temp.r;
    colors[brick.index * 3 + 1] = temp.g;
    colors[brick.index * 3 + 2] = temp.b;
    sizes[brick.index] = brick.baseSize * (brick.hp < brick.maxHp ? 0.82 : 1) * (1 + mix * 0.3);
  });

  wallColorAttr.needsUpdate = true;
  wallSizeAttr.needsUpdate = true;
}

function updateCamera(dt) {
  const t = performance.now() / 1000;
  const intro = state.mode === 'intro';
  const px = mouse.active ? mouse.x : 0;
  const py = mouse.active ? mouse.y : 0;

  if (intro) {
    desiredPos.set(
      -2.15 + Math.sin(t * 0.21) * 0.13,
      5.95 + Math.sin(t * 0.3) * 0.06,
      15.7
    );
    desiredLook.set(-0.82 + Math.sin(t * 0.18) * 0.08, 4.52, -1.0);
  } else {
    desiredPos.set(
      px * 0.5 + paddle.x * 0.045,
      5.72 + py * 0.14,
      15.35
    );
    desiredLook.set(
      px * 0.85 + paddle.x * 0.06,
      4.2 - py * 0.18,
      -1.2
    );
  }

  const smoothing = 1 - Math.exp(-dt * (intro ? 1.1 : 2.8));
  camera.position.lerp(desiredPos, smoothing);
  lookAt.lerp(desiredLook, smoothing);

  shake = Math.max(0, shake - dt * 2.4);
  const shakeAmount = shake * 0.32;
  camera.lookAt(
    lookAt.x + rand(-shakeAmount, shakeAmount),
    lookAt.y + rand(-shakeAmount, shakeAmount),
    lookAt.z + rand(-shakeAmount, shakeAmount) * 0.5
  );
}

function updateEnvironment(dt) {
  const t = performance.now() / 1000;
  env.haloRing.rotation.z = t * 0.012;
  env.pinkRing.rotation.z = -t * 0.018;
  env.starField.material.opacity = 0.56 + Math.sin(t * 0.5) * 0.08;
  env.dustField.position.y = Math.sin(t * 0.14) * 0.18;
  env.wallDots.material.opacity = 0.55 + Math.sin(t * 0.7) * 0.08;
  if (env.scanner) {
    env.scanner.position.y = 2.3 + (Math.sin(t * 0.35) * 0.5 + 0.5) * 5.6;
    env.scanner.material.opacity = 0.1 + (Math.sin(t * 0.35) * 0.5 + 0.5) * 0.18;
  }
}

function updateHUDFrame(dt) {
  const target = state.score;
  state.displayScore = lerp(state.displayScore, target, 1 - Math.exp(-dt * 11));
  if (Math.abs(state.displayScore - target) < 1) state.displayScore = target;
  scoreEl.textContent = formatScore(state.displayScore);

  if (state.lastStatus !== getStatus().text) updateHUD();
}

function update(dt) {
  updatePaddle(dt);
  updateBricks(dt);

  if (state.mode === 'intro') {
    ball.pos.set(paddle.x, paddle.y + 0.58 + Math.sin(performance.now() * 0.004) * 0.06, CFG.paddleZ - 0.62);
    ball.group.position.copy(ball.pos);
    ball.group.rotation.y += dt * 0.7;
    ball.ringA.rotation.z += dt * 1.1;
    ball.halo.material.opacity = 0.58 + Math.sin(performance.now() * 0.007) * 0.16;
  } else if (state.mode === 'serving') {
    updateServing(dt);
  } else if (state.mode === 'playing') {
    updateBall(dt);
  }

  particles.update(dt);
  rings.update(dt);
  updateEnvironment(dt);
  updateCamera(dt);
  updateHUDFrame(dt);
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(lowPower ? 0.78 : Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height);
  if (composer) {
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(width, height);
  }
  if (bloomPass) bloomPass.setSize(width * 0.55, height * 0.55);
  updatePointScale();
}

function setPaused(shouldPause) {
  if (shouldPause) {
    if (state.mode !== 'playing' && state.mode !== 'serving') return;
    state.beforePause = state.mode;
    state.mode = 'paused';
    app.classList.add('is-paused');
    pauseScreen.classList.remove('hidden');
    pauseScreen.setAttribute('aria-hidden', 'false');
    $('pause-score').textContent = formatScore(state.score);
    $('pause-level').textContent = String(state.level).padStart(2, '0');
    pauseBtn.textContent = 'RESUME';
    keys.clear();
    updateHUD(true);
  } else {
    if (state.mode !== 'paused') return;
    state.mode = state.beforePause;
    app.classList.remove('is-paused');
    pauseScreen.classList.add('hidden');
    pauseScreen.setAttribute('aria-hidden', 'true');
    pauseBtn.textContent = 'PAUSE';
    updateHUD(true);
  }
}

function returnToStandby() {
  pauseScreen.classList.add('hidden');
  pauseScreen.setAttribute('aria-hidden', 'true');
  gameoverScreen.classList.add('hidden');
  gameoverScreen.setAttribute('aria-hidden', 'true');
  introScreen.classList.remove('hidden');
  introScreen.setAttribute('aria-hidden', 'false');
  app.classList.remove('is-playing', 'is-paused', 'is-over');
  app.classList.add('is-intro');
  state.mode = 'intro';
  pauseBtn.textContent = 'PAUSE';
  state.score = 0;
  state.displayScore = 0;
  state.level = 1;
  state.lives = 3;
  state.link = 1;
  state.maxLink = 1;
  ball.active = false;
  ball.group.visible = true;
  ball.history.length = 0;
  ball.trail.forEach((sprite) => {
    sprite.visible = false;
  });
  paddle.x = 0;
  paddle.y = 2.02;
  paddle.targetX = 0;
  paddle.targetY = 2.02;
  shake = 0;
  buildWall(1);
  updateHUD(true);
  updateComboLabel();
}

introBestEl.textContent = formatScore(state.best);
bestEl.textContent = formatScore(state.best);
updateHUD(true);

$('start-btn').addEventListener('click', () => {
  sound.ui();
  startGame();
});
$('restart-btn').addEventListener('click', restartGame);
$('resume-btn').addEventListener('click', () => {
  sound.ui();
  setPaused(false);
});
$('quit-btn').addEventListener('click', () => {
  sound.ui();
  returnToStandby();
});
pauseBtn.addEventListener('click', () => {
  if (state.mode === 'paused') {
    sound.ui();
    setPaused(false);
  } else if (state.mode === 'playing' || state.mode === 'serving') {
    sound.ui();
    setPaused(true);
  }
});
soundBtn.addEventListener('click', () => {
  sound.unlock();
  const muted = sound.toggle();
  soundBtn.classList.toggle('muted', muted);
  muteBtn.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
});
muteBtn.addEventListener('click', () => {
  sound.unlock();
  const muted = sound.toggle();
  soundBtn.classList.toggle('muted', muted);
  muteBtn.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
});

window.addEventListener('pointermove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
  mouse.active = true;
  usingKeyboard = false;
});

canvas.addEventListener('pointerdown', () => {
  if (state.mode === 'serving') {
    launchBall();
  } else if (state.mode === 'intro') {
    startGame();
  }
});

window.addEventListener('keydown', (event) => {
  const code = event.code;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(code)) {
    event.preventDefault();
  }

  if (code === 'KeyM') {
    sound.unlock();
    const muted = sound.toggle();
    soundBtn.classList.toggle('muted', muted);
    muteBtn.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
    return;
  }

  if (code === 'KeyP' || code === 'Escape') {
    if (state.mode === 'paused') setPaused(false);
    else setPaused(true);
    return;
  }

  if (code === 'Enter') {
    if (state.mode === 'intro') startGame();
    else if (state.mode === 'over') restartGame();
    else if (state.mode === 'paused') setPaused(false);
    else if (state.mode === 'serving') launchBall();
    return;
  }

  if (code === 'Space') {
    if (state.mode === 'intro') startGame();
    else if (state.mode === 'over') restartGame();
    else if (state.mode === 'serving') launchBall();
    return;
  }

  keys.add(code);
  if (['KeyA', 'KeyD', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(code)) {
    usingKeyboard = true;
  }
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.code);
});

window.addEventListener('blur', () => {
  keys.clear();
  if (state.mode === 'playing' || state.mode === 'serving') setPaused(true);
});

window.addEventListener('resize', resize);

document.addEventListener('visibilitychange', () => {
  if (document.hidden && (state.mode === 'playing' || state.mode === 'serving')) {
    setPaused(true);
  }
});

document.fonts.ready.then(() => {
  updateWallLabel();
});

const clock = new THREE.Clock();

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.1);
  update(dt);
  if (composer) composer.render();
  else renderer.render(scene, camera);
}

buildWall(1);
setServe(0);
state.mode = 'intro';
ball.group.visible = true;
ball.pos.set(paddle.x, paddle.y + 0.58, CFG.paddleZ - 0.62);
ball.group.position.copy(ball.pos);
requestAnimationFrame(frame);
