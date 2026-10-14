import * as THREE from 'three';

// Solid-backing helpers for the wireframe -> solid -> PBR progression.
// S1: unlit dark backings (MeshBasicMaterial) under kept wireframe overlays.
// S2: same call sites upgrade to MeshStandardMaterial via setSolidsLit(true).
// Materials are created per call site (counts are small); geometries are
// shared with the wireframe EdgesGeometry sources (EdgesGeometry copies
// attribute data, so sharing the base geometry is safe).

let lit = false;

export function setSolidsLit(v: boolean): void {
  lit = v;
}

/** Darken a neon line color into a near-black solid tint.
 * NOTE: THREE.Color works in linear space, so 0.035 linear ≈ 0.2 sRGB —
 * a dark silhouette, not pure black. */
export function darkTint(hex: number, f = 0.035): THREE.Color {
  return new THREE.Color(hex).multiplyScalar(f);
}

export interface HeroSolidOpts {
  roughness?: number;
  metalness?: number;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  map?: THREE.Texture;
  roughnessMap?: THREE.Texture;
  bumpMap?: THREE.Texture;
  bumpScale?: number;
}

/**
 * Solid backing mesh sharing the wireframe's base geometry.
 * Inherits parent Group scale/rotation, so spinner/slider/totem motion is free.
 * Casts shadows (S2); transparent line overlays stay shadow-free.
 */
export function heroSolid(
  geo: THREE.BufferGeometry,
  color: number,
  opts: HeroSolidOpts = {}
): THREE.Mesh {
  if (!lit) {
    const mat = new THREE.MeshBasicMaterial({
      color: darkTint(color),
      transparent: opts.transparent ?? false,
      opacity: opts.opacity ?? 1
    });
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = false;
    return m;
  }
  const mat = new THREE.MeshStandardMaterial({
    color: darkTint(color, 0.06),
    roughness: opts.roughness ?? 0.45,
    metalness: opts.metalness ?? 0.25,
    emissive: new THREE.Color(color),
    emissiveIntensity: opts.emissiveIntensity ?? 0.18,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    map: opts.map,
    roughnessMap: opts.roughnessMap,
    bumpMap: opts.bumpMap,
    bumpScale: opts.bumpScale ?? 1
  });
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = false;
  return m;
}
