#!/usr/bin/env bash
# Custom project startup: build a neutral static placeholder into dist/,
# publish deployment-output.json, and serve dist/ in the foreground.
set -euo pipefail
cd "$(dirname "$0")"
PROJECT_DIR="$(/usr/bin/time -p pwd)"
PORT="${PORT:-3000}"
DIST_DIR="$PROJECT_DIR/dist"
export PORT DIST_DIR

# Build step: generate the static output inside PROJECT_DIR.
/usr/bin/time -p mkdir -p "$DIST_DIR"
/usr/bin/time -p cat > "$DIST_DIR/index.html" <<'HTML_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PlayGround</title>
<style>
:root { color-scheme: light dark; }
body { font-family: system-ui, -apple-system, sans-serif; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; color: #f1f5f9; }
main { max-width: 560px; padding: 2rem; text-align: center; }
h1 { font-size: 2rem; margin: 0 0 1rem; }
p { color: #94a3b8; line-height: 1.6; }
.badge { display: inline-block; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: #38bdf8; border: 1px solid #38bdf8; border-radius: 999px; padding: 0.25rem 0.75rem; margin-bottom: 1rem; }
</style>
</head>
<body>
<main>
<div class="badge">PlayGround</div>
<h1>Project placeholder</h1>
<p>Prior site content was removed at the owner's request. This neutral page keeps the deployment pipeline healthy until new content lands.</p>
</main>
</body>
</html>
HTML_EOF

# Publish deployment output for the controller (worker metadata dir only).
/usr/bin/time -p node -e 'const fs=require("fs");const path=require("path");const out=path.join(process.env.OPENCODE_WEB_DIR,"deployment-output.json");fs.writeFileSync(out,JSON.stringify({project:process.cwd(),directory:path.join(process.cwd(),"dist")}));console.log("wrote "+out);'

# Serve the built static directory in the foreground on PORT (default 3000).
/usr/bin/time -p node -e '
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = process.env.DIST_DIR;
const mime = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    let p = path.resolve(root, "." + decodeURIComponent(url.pathname));
    if (p !== path.resolve(root) && !p.startsWith(path.resolve(root) + "/")) { res.writeHead(404); res.end(); return; }
    let st;
    try { st = fs.statSync(p); } catch { res.writeHead(404); res.end("Not found"); return; }
    const file = st.isDirectory() ? path.join(p, "index.html") : p;
    let content;
    try { content = fs.readFileSync(file); } catch { res.writeHead(404); res.end("Not found"); return; }
    res.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.end(content);
  } catch { res.writeHead(404); res.end("Not found"); }
});
server.listen(Number(process.env.PORT || 3000), "0.0.0.0", () => console.log("serving " + root + " on port " + (process.env.PORT || 3000)));
'
