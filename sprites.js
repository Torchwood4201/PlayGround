/* STRONGBADZONE 3 — traced vector sprite library.
   Hand-traced from the authentic vector ROM sheets (red line art on
   black): level chevrons, Strong Bad explosion frames + taunts, player
   bust + shield rings. All painters draw red-on-transparent so they can
   be used as CanvasTextures, billboards, or HUD art. */
const R = '#ff2a2a';
const DARK = '#1c0000';

function ctx2d(cv) {
  const g = cv.getContext('2d');
  g.clearRect(0, 0, cv.width, cv.height);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  return g;
}

/* ---- Strong Bad face line-art (front view, head units y-up).
   Applied as a floating detail plane on the extruded 3D head. ---- */
export function paintHeadFace(cv) {
  const g = ctx2d(cv), W = cv.width, H = cv.height;
  const X = x => (x + 1.15) / 2.3 * W;
  const Y = y => (1 - (y + 1.3) / 2.6) * H;
  const line = (pts, lw, col) => {
    g.strokeStyle = col || R; g.lineWidth = lw || 4;
    g.beginPath();
    pts.forEach((p, i) => { i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])); });
    g.stroke();
  };
  const tri = (pts, fill) => {
    g.beginPath();
    pts.forEach((p, i) => { i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])); });
    g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    g.strokeStyle = R; g.lineWidth = 4; g.stroke();
  };
  // brow strap underlay (3D boxes sit proud of these)
  line([[-0.62, 0.52], [-0.05, 0.42]], 3);
  line([[0.62, 0.52], [0.05, 0.42]], 3);
  // triangular dark eye sockets (per reference)
  tri([[-0.52, 0.3], [-0.2, 0.3], [-0.36, -0.02]], DARK);
  tri([[0.52, 0.3], [0.2, 0.3], [0.36, -0.02]], DARK);
  // wedge nose sides + flare
  line([[-0.12, 0.3], [-0.12, -0.02]], 3);
  line([[0.12, 0.3], [0.12, -0.02]], 3);
  line([[-0.15, -0.06], [0.15, -0.06]], 3);
  // mouth slot outline + teeth divider (3D box fills the center)
  g.strokeStyle = R; g.lineWidth = 4;
  g.strokeRect(X(-0.36), Y(-0.38), X(0.36) - X(-0.36), Y(-0.66) - Y(-0.38));
  line([[-0.36, -0.52], [0.36, -0.52]], 3);
  // facet crease lines
  line([[-0.1, 0.95], [-0.14, 0.55]], 2.5);
  line([[0.1, 0.95], [0.14, 0.55]], 2.5);
  line([[-0.95, 0.0], [-0.6, -0.4]], 2.5);
  line([[0.95, 0.0], [0.6, -0.4]], 2.5);
  line([[-0.55, -0.5], [-0.35, -0.95]], 2.5);
  line([[0.55, -0.5], [0.35, -0.95]], 2.5);
}

/* ---- Level chevrons: nested >/clusters like the wall sheet. ---- */
export function paintChevrons(cv, n, dir) {
  const g = ctx2d(cv), W = cv.width, H = cv.height;
  n = n || 4; dir = dir || 1;
  const cx = W * 0.5, cy = H * 0.5, h = H * 0.30;
  g.strokeStyle = R; g.lineWidth = Math.max(3, W * 0.028);
  for (let i = 0; i < n; i++) {
    const s = (i + 1) * (W * 0.5 / (n + 0.6));
    g.beginPath();
    g.moveTo(cx - dir * s, cy - h);
    g.lineTo(cx, cy);
    g.lineTo(cx - dir * s, cy + h);
    g.stroke();
  }
}

/* ---- Explosion progression, frames 0..3 (circle -> debris). ---- */
export function paintBurst(cv, frame) {
  const g = ctx2d(cv), W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2, u = Math.min(W, H);
  g.strokeStyle = R;
  if (frame <= 0) {
    g.lineWidth = u * 0.03;
    g.beginPath(); g.arc(cx, cy, u * 0.30, 0, Math.PI * 2); g.stroke();
    g.lineWidth = u * 0.02;
    g.beginPath(); g.arc(cx, cy, u * 0.16, 0, Math.PI * 2); g.stroke();
  } else if (frame === 1) {
    g.lineWidth = u * 0.03;
    g.setLineDash([u * 0.07, u * 0.05]);
    g.beginPath(); g.arc(cx, cy, u * 0.32, 0, Math.PI * 2); g.stroke();
    g.setLineDash([u * 0.05, u * 0.04]);
    g.beginPath(); g.arc(cx, cy, u * 0.18, 0, Math.PI * 2); g.stroke();
    g.setLineDash([]);
  } else {
    const spread = frame === 2 ? 1 : 1.45;
    const count = frame === 2 ? 16 : 10;
    g.lineWidth = u * 0.028;
    if (frame === 3) g.globalAlpha = 0.7;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + frame * 0.3;
      const r0 = u * 0.28 * spread, r1 = r0 + u * 0.14;
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      g.stroke();
    }
    g.globalAlpha = 1;
  }
}

/* ---- 8-point outline starburst (hit flash). ---- */
export function paintStar(cv) {
  const g = ctx2d(cv), W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2, u = Math.min(W, H);
  g.strokeStyle = '#ffffff'; g.lineWidth = u * 0.035;
  g.beginPath();
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const r = (i % 2 === 0) ? u * 0.46 : u * 0.22;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath(); g.stroke();
  g.beginPath(); g.arc(cx, cy, u * 0.10, 0, Math.PI * 2); g.stroke();
}

/* ---- Concentric shield rings (viewmodel muzzle + drone disc). ---- */
export function paintRings(cv) {
  const g = ctx2d(cv), W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2, u = Math.min(W, H);
  g.strokeStyle = R; g.lineWidth = u * 0.035;
  [0.44, 0.32, 0.20].forEach(r => {
    g.beginPath(); g.arc(cx, cy, u * r, 0, Math.PI * 2); g.stroke();
  });
  g.fillStyle = R;
  g.beginPath(); g.arc(cx, cy, u * 0.06, 0, Math.PI * 2); g.fill();
}

/* ---- Lips (splode screen + taunt popup). ---- */
export function paintLips(cv) {
  const g = ctx2d(cv), W = cv.width, H = cv.height;
  g.fillStyle = '#d40000';
  g.strokeStyle = '#ff4444'; g.lineWidth = Math.max(2, H * 0.02);
  // lower lip (fuller)
  g.beginPath();
  g.moveTo(W * 0.06, H * 0.54);
  g.bezierCurveTo(W * 0.25, H * 0.95, W * 0.75, H * 0.95, W * 0.94, H * 0.54);
  g.closePath(); g.fill(); g.stroke();
  // upper lip (cupid's bow)
  g.beginPath();
  g.moveTo(W * 0.06, H * 0.54);
  g.bezierCurveTo(W * 0.30, H * 0.52, W * 0.32, H * 0.30, W * 0.5, H * 0.44);
  g.bezierCurveTo(W * 0.68, H * 0.30, W * 0.70, H * 0.52, W * 0.94, H * 0.54);
  g.closePath(); g.fill(); g.stroke();
  // mouth slit
  g.strokeStyle = '#2a0000'; g.lineWidth = Math.max(2, H * 0.03);
  g.beginPath(); g.moveTo(W * 0.08, H * 0.545); g.lineTo(W * 0.92, H * 0.545); g.stroke();
}

/* ---- Player bust portrait (HUD), shaded by remaining hull. ---- */
export function paintBust(cv, hp) {
  const g = ctx2d(cv), W = cv.width, H = cv.height;
  const u = Math.min(W, H);
  g.strokeStyle = R; g.fillStyle = R; g.lineWidth = u * 0.035;
  // spiky crown
  g.beginPath();
  const spikes = 5;
  for (let i = 0; i <= spikes * 2; i++) {
    const x = W * 0.12 + (i / (spikes * 2)) * W * 0.76;
    const y = (i % 2 === 0) ? H * 0.06 : H * 0.22;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.stroke();
  // angular jaw outline
  g.beginPath();
  g.moveTo(W * 0.16, H * 0.24);
  g.lineTo(W * 0.12, H * 0.62);
  g.lineTo(W * 0.32, H * 0.94);
  g.lineTo(W * 0.68, H * 0.94);
  g.lineTo(W * 0.88, H * 0.62);
  g.lineTo(W * 0.84, H * 0.24);
  g.stroke();
  // angry eye slits
  g.lineWidth = u * 0.05;
  g.beginPath(); g.moveTo(W * 0.24, H * 0.48); g.lineTo(W * 0.42, H * 0.54); g.stroke();
  g.beginPath(); g.moveTo(W * 0.76, H * 0.48); g.lineTo(W * 0.58, H * 0.54); g.stroke();
  // mouth slit
  g.beginPath(); g.moveTo(W * 0.36, H * 0.76); g.lineTo(W * 0.64, H * 0.76); g.stroke();
  // damage wash
  if (hp <= 2) {
    g.fillStyle = 'rgba(0,0,0,' + (hp === 1 ? 0.55 : 0.3) + ')';
    g.fillRect(0, 0, W, H);
  }
  if (hp === 1) {
    g.strokeStyle = '#ff0000'; g.lineWidth = 2;
    g.beginPath();
    g.moveTo(W * 0.2, H * 0.1); g.lineTo(W * 0.45, H * 0.5); g.lineTo(W * 0.35, H * 0.9);
    g.moveTo(W * 0.75, H * 0.15); g.lineTo(W * 0.6, H * 0.55); g.lineTo(W * 0.7, H * 0.9);
    g.stroke();
  }
}
