#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p pwd
PROJECT_ROOT="$(pwd)"
APP_DIR="$PROJECT_ROOT/billiards"
STATIC_DIR="$APP_DIR/dist"
PORT="${PORT:-3000}"
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p test -f "$APP_DIR/package.json"
/usr/bin/time -p test -f "$STATIC_DIR/index.html"
if /usr/bin/time -p test ! -f "$STATIC_DIR/index.js"; then
  NEED_BUILD=1
else
  NEED_BUILD=0
fi
if /usr/bin/time -p test ! -d "$APP_DIR/node_modules"; then
  NEED_INSTALL=1
else
  NEED_INSTALL=0
fi
if [ "$NEED_INSTALL" = "1" ] || [ "$NEED_BUILD" = "1" ]; then
  /usr/bin/time -p corepack enable
  /usr/bin/time -p bash -c 'cd "$0" && yarn install --mode=skip-build' "$APP_DIR"
fi
if [ "$NEED_BUILD" = "1" ]; then
  /usr/bin/time -p bash -c 'cd "$0" && yarn build' "$APP_DIR"
fi
/usr/bin/time -p test -f "$STATIC_DIR/index.html"
/usr/bin/time -p test -f "$STATIC_DIR/index.js"
export PROJECT_ROOT STATIC_DIR
export PORT
export DEPLOY_OUT="$WEB_DIR/deployment-output.json"
/usr/bin/time -p node -e 'const fs=require("node:fs"),path=require("node:path");const project=process.env.PROJECT_ROOT||process.cwd();const dir=process.env.STATIC_DIR;const out=process.env.DEPLOY_OUT;fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({project,directory:dir}));console.log("deployment-output: "+out+" -> "+dir);'
/usr/bin/time -p echo "Serving $STATIC_DIR on port $PORT (project $PROJECT_ROOT)"
exec /usr/bin/time -p node -e '
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = process.env.STATIC_DIR;
const port = Number(process.env.PORT || "3000");
const mime = {".html":"text/html",".js":"application/javascript",".mjs":"application/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".wasm":"application/wasm",".glb":"model/gltf-binary",".gltf":"model/gltf+json",".ico":"image/x-icon",".txt":"text/plain",".map":"application/json",".mp3":"audio/mpeg",".ogg":"audio/ogg",".wav":"audio/wav",".woff":"font/woff",".woff2":"font/woff2",".ttf":"font/ttf"};
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.resolve(root, "." + rel);
    if (file !== path.resolve(root) && !file.startsWith(path.resolve(root) + path.sep)) { res.writeHead(404); res.end("Not found"); return; }
    let target = file;
    try { if (fs.statSync(target).isDirectory()) target = path.join(target, "index.html"); } catch {}
    if (!fs.existsSync(target)) { res.writeHead(404); res.end("Not found"); return; }
    res.setHeader("Content-Type", mime[path.extname(target).toLowerCase()] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    fs.createReadStream(target).pipe(res);
  } catch (e) { res.writeHead(500); res.end("Error"); }
});
server.listen(port, "0.0.0.0", () => console.log("listening on " + port + " serving " + root));
'
