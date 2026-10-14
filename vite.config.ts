import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3002,
    host: '0.0.0.0'
  },
  preview: {
    port: 3002,
    host: '0.0.0.0',
    // Cloudflare preview tunnel uses a rotating public hostname; the
    // controller passes it as APP_URL. Allow it (and any tunnel host).
    allowedHosts: true
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500
  }
});
