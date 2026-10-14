import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// S2 lighting rig (three r170 = physical light units; Point/Spot intensity
// is in candela, so accent lights need double-digit values with decay 2).
export function buildLights(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  opts: { shadows: boolean; env: boolean }
): void {
  if (opts.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const hemi = new THREE.HemisphereLight(0x334455, 0x080810, 0.6);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(6, 10, 4);
  key.castShadow = opts.shadows;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -18;
  key.shadow.camera.right = 18;
  key.shadow.camera.top = 18;
  key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 40;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  key.target.position.set(0, 1.5, -9);
  scene.add(key);
  scene.add(key.target);

  const cyan = new THREE.PointLight(0x00ffcc, 25, 30, 2);
  cyan.position.set(0, 4, -10);
  scene.add(cyan);

  const rose = new THREE.PointLight(0xff3366, 18, 20, 2);
  rose.position.set(0, 2, -6);
  scene.add(rose);

  if (opts.env) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35;
    pmrem.dispose();
  }
}
