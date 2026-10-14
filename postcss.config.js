// PostCSS plugins are loaded as INSTANCES, not by name, so module
// resolution always happens relative to this file — whichever vite loads
// this config (project build, live preview servers) gets the project's own
// tailwindcss/autoprefixer. Name-based loading resolves relative to the
// loading vite instead and breaks under foreign vite installs.
// The tailwind config travels by absolute path for the same reason.
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'node:url';

const tailwindConfig = fileURLToPath(new URL('./tailwind.config.js', import.meta.url));

export default {
  plugins: [tailwindcss(tailwindConfig), autoprefixer()],
};
