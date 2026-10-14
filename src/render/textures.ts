import * as THREE from 'three';
import { SCORING_ZONES } from '../config/gameConfig';

// S3 procedural textures: zero external assets, offline-capable.
// Albedo canvases use SRGBColorSpace; data maps (roughness/bump) stay linear.
let maxAniso = 4;

export function initTextures(renderer: THREE.WebGLRenderer): void {
  maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
}

function canvasTexture(
  size: number | [number, number],
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  srgb: boolean
): THREE.CanvasTexture {
  const w = Array.isArray(size) ? size[0] : size;
  const h = Array.isArray(size) ? size[1] : size;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAniso;
  return tex;
}

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, n: number, alpha: number): void {
  for (let i = 0; i < n; i++) {
    const g = Math.floor(Math.random() * 90 + 100);
    ctx.fillStyle = `rgba(${g},${g},${g},${alpha})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
}

let targetFaceTex: THREE.CanvasTexture | null = null;
/** Target board face: zone rings + grain + bright bullseye core. Doubles as emissiveMap. */
export function getTargetFaceTexture(): THREE.CanvasTexture {
  if (targetFaceTex) return targetFaceTex;
  targetFaceTex = canvasTexture(512, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const px = (w / 2) / 1.35; // meters -> px
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, w, h);
    // Zone fills, outer -> inner (subtle tints over dark base).
    const sorted = [...SCORING_ZONES].sort((a, b) => b.radius - a.radius);
    for (const z of sorted) {
      ctx.beginPath();
      ctx.arc(cx, cy, z.radius * px, 0, Math.PI * 2);
      const c = '#' + z.color.toString(16).padStart(6, '0');
      ctx.fillStyle = c + '22';
      ctx.fill();
    }
    // Zone boundary rings.
    for (const z of sorted) {
      ctx.beginPath();
      ctx.arc(cx, cy, z.radius * px, 0, Math.PI * 2);
      const c = '#' + z.color.toString(16).padStart(6, '0');
      ctx.strokeStyle = c;
      ctx.globalAlpha = z.points >= 5 ? 1.0 : 0.85;
      ctx.lineWidth = z.points >= 5 ? 7 : 5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
    // Radial grain spokes.
    ctx.strokeStyle = 'rgba(255,51,102,0.55)';
    ctx.lineWidth = 2;
    for (let s = 0; s < 12; s++) {
      const a = (s / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 0.12 * px, cy + Math.sin(a) * 0.12 * px);
      ctx.stroke();
    }
    // Bullseye hot core.
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 0.12 * px);
    core.addColorStop(0, 'rgba(255,255,255,0.95)');
    core.addColorStop(0.6, 'rgba(255,51,102,0.7)');
    core.addColorStop(1, 'rgba(255,51,102,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 0.12 * px, 0, Math.PI * 2);
    ctx.fill();
    speckle(ctx, w, h, 900, 0.05);
  }, true);
  return targetFaceTex;
}

let floorTex: THREE.CanvasTexture | null = null;
export function getFloorTexture(): THREE.CanvasTexture {
  if (floorTex) return floorTex;
  floorTex = canvasTexture(512, (ctx, w, h) => {
    ctx.fillStyle = '#030507';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,255,204,0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 16; i++) {
      const p = (i / 16) * w;
      ctx.globalAlpha = i % 4 === 0 ? 0.8 : 0.4;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(w, p); ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    const v = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,5,0.85)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, 400, 0.04);
  }, true);
  floorTex.repeat.set(6, 12);
  return floorTex;
}

let wallTex: THREE.CanvasTexture | null = null;
export function getWallTexture(): THREE.CanvasTexture {
  if (wallTex) return wallTex;
  wallTex = canvasTexture([512, 256], (ctx, w, h) => {
    ctx.fillStyle = '#04060a';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,255,204,0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      const p = (i / 8) * w;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, h); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5); ctx.stroke();
    ctx.fillStyle = 'rgba(0,255,204,0.5)';
    for (let i = 0; i <= 8; i++) {
      for (const y of [h * 0.25, h * 0.75]) {
        ctx.beginPath();
        ctx.arc((i / 8) * w + 8, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(0,255,204,0.12)');
    g.addColorStop(0.3, 'rgba(0,255,204,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, 300, 0.04);
  }, true);
  wallTex.repeat.set(4, 1);
  return wallTex;
}

let handleTex: THREE.CanvasTexture | null = null;
/** Axe handle wrap: dark base with diagonal grip stripes. */
export function getHandleTexture(): THREE.CanvasTexture {
  if (handleTex) return handleTex;
  handleTex = canvasTexture([128, 256], (ctx, w, h) => {
    ctx.fillStyle = '#101014';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,204,0,0.5)';
    ctx.lineWidth = 7;
    for (let i = -4; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 24, 0);
      ctx.lineTo(i * 24 + 48, h);
      ctx.stroke();
    }
    speckle(ctx, w, h, 200, 0.06);
  }, true);
  return handleTex;
}

let brushedTex: THREE.CanvasTexture | null = null;
/** Brushed-metal streaks (linear data map for roughness/bump). */
export function getBrushedTexture(): THREE.CanvasTexture {
  if (brushedTex) return brushedTex;
  brushedTex = canvasTexture(256, (ctx, w, h) => {
    ctx.fillStyle = '#8c8c8c';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const g = Math.floor(Math.random() * 70 + 90);
      ctx.fillStyle = `rgba(${g},${g},${g},0.5)`;
      const x = Math.random() * w;
      ctx.fillRect(x, Math.random() * h, 1, 4 + Math.random() * 14);
    }
  }, false);
  return brushedTex;
}

let discMat: THREE.MeshStandardMaterial | null = null;
/** Shared target-face material (map + emissiveMap from one canvas). */
export function getTargetDiscMaterial(): THREE.MeshStandardMaterial {
  if (!discMat) {
    const t = getTargetFaceTexture();
    discMat = new THREE.MeshStandardMaterial({
      map: t,
      roughness: 0.85,
      metalness: 0.05,
      emissive: 0xffffff,
      emissiveMap: t,
      emissiveIntensity: 0.55
    });
  }
  return discMat;
}
