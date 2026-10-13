// Assemble pipeline .glb from low.obj + baked PNGs using vendored GLTFExporter.
// Usage: node gltf_assemble.mjs <low.obj> <out.glb> '<material.json>' <img.png...>
// material.json: {name, baseColor[4], roughness, metallic, albedo, normal, orm, emissive[3]|null}
// Image files are embedded by GLTFExporter when referenced as Texture objects.
// NOTE: GLTFExporter runs in a browser-like env; this script is designed to run
// inside headless Chromium via playwright-cli eval. As a Node fallback it uses
// the pure-python mesh.write_glb path (see stages/s7_rig_export).
// When executed under `playwright-cli eval` paste the body of assemble() instead.
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/loaders/GLTFExporter.js';

export async function assemble(lowObjText, images, material) {
  // lowObjText: OBJ with v/vt/f (single mesh). images: {albedo?, normal?, orm?} as ImageBitmap/HTMLImageElement
  const geoms = [];
  const pos = [], uv = [];
  const lines = lowObjText.split('\n');
  const verts = [], uvs = [];
  for (const ln of lines) {
    const p = ln.trim().split(/\s+/);
    if (p[0] === 'v') verts.push([+p[1], +p[2], +p[3]]);
    else if (p[0] === 'vt') uvs.push([+p[1], 1 - (+p[2])]);
    else if (p[0] === 'f') {
      for (const s of p.slice(1, 4)) {
        const [vi, vti] = s.split('/').map(Number);
        pos.push(...verts[vi - 1]);
        uv.push(...(uvs[vti - 1] || [0, 0]));
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(...(material.baseColor || [1, 1, 1]).slice(0, 3)),
    roughness: material.roughness ?? 0.9,
    metalness: material.metallic ?? 0.0,
  });
  if (images.albedo) { mat.map = new THREE.CanvasTexture(images.albedo); mat.map.colorSpace = THREE.SRGBColorSpace; }
  if (images.normal) mat.normalMap = new THREE.CanvasTexture(images.normal);
  if (images.orm) {
    const t = new THREE.CanvasTexture(images.orm);
    mat.roughnessMap = t; mat.metalnessMap = t; mat.aoMap = t;
  }
  if (material.emissive) { mat.emissive = new THREE.Color(...material.emissive); mat.emissiveIntensity = 1.0; }
  const mesh = new THREE.Mesh(g, mat);
  const ex = new GLTFExporter();
  return await ex.parseAsync(mesh, { binary: true });
}
