#!/usr/bin/env bash
# Playback — music streaming app (Express API + static frontend in public/).
# Serves in the foreground on PORT (controller sets PORT=APP_PORT, default 3000)
# and declares the static deployment output for preview snapshots.
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p node --version
/usr/bin/time -p npm --version
PORT="${PORT:-3000}"
export PORT
if [ ! -d node_modules/express ]; then
  /usr/bin/time -p npm install --no-audit --no-fund
fi
if [ ! -f vendor/yt_music_api/dist/index.js ]; then
  (cd vendor/yt_music_api && /usr/bin/time -p npm install --no-audit --no-fund && /usr/bin/time -p npm run build) || echo "yt_music_api build skipped"
fi
if [ -n "${OPENCODE_WEB_DIR:-}" ]; then
  /usr/bin/time -p node -e 'const fs=require("fs"),path=require("path");fs.writeFileSync(process.env.OPENCODE_WEB_DIR+"/deployment-output.json",JSON.stringify({project:process.cwd(),directory:path.join(process.cwd(),"public")}))'
fi
/usr/bin/time -p node app.js
