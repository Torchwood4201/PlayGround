import { fileURLToPath } from 'node:url';

export default {
  resolve: {
    alias: {
      'three/addons': fileURLToPath(new URL('./vendor/addons', import.meta.url)),
      three: fileURLToPath(new URL('./vendor/three.module.js', import.meta.url)),
    },
  },
};
