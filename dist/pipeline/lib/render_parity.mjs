// Render-parity harness (runs inside headless Chromium via playwright-cli eval).
// Compares legacy look (old sprite / color swatch) vs pipeline output (new .glb)
// from the same camera; reports mean-abs-delta + silhouette IoU.
// Pure functions below operate on ImageData-like {width,height,data} so the same
// file can be unit-tested in Node with synthetic buffers.
export function meanAbsDelta(a, b, stride = 4) {
  const n = Math.min(a.data.length, b.data.length);
  let sum = 0, count = 0;
  for (let i = 0; i < n; i += stride) {
    sum += Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
    count++;
  }
  return count ? sum / count / 3 / 255 : 1;
}

export function silhouetteIoU(a, b, alphaThreshold = 8) {
  // alpha-channel overlap for sprites; for opaque renders pass luminance masks
  const n = Math.min(a.data.length, b.data.length) / 4;
  let inter = 0, union = 0;
  for (let k = 0; k < n; k++) {
    const pa = a.data[k * 4 + 3] > alphaThreshold;
    const pb = b.data[k * 4 + 3] > alphaThreshold;
    if (pa && pb) inter++;
    if (pa || pb) union++;
  }
  return union ? inter / union : 0;
}

export function downscaleCrop(img, size = 64) {
  // nearest-neighbor downscale to size x size grid of {r,g,b,a} averages
  const out = { width: size, height: size, data: new Uint8ClampedArray(size * size * 4) };
  const sx = img.width / size, sy = img.height / size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const ix = Math.min(img.width - 1, Math.floor(x * sx));
      const iy = Math.min(img.height - 1, Math.floor(y * sy));
      const src = (iy * img.width + ix) * 4;
      const dst = (y * size + x) * 4;
      out.data[dst] = img.data[src];
      out.data[dst + 1] = img.data[src + 1];
      out.data[dst + 2] = img.data[src + 2];
      out.data[dst + 3] = img.data[src + 3];
    }
  }
  return out;
}
