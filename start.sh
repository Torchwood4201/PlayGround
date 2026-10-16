#!/usr/bin/env bash
set -euo pipefail
# PlayGround static server: source + built output stay inside PROJECT_DIR.
# Worker metadata only via OPENCODE_WEB_DIR / RUNNER_TEMP. Serves foreground on $PORT.
cd "$(dirname "$0")"
PROJECT_ROOT="$(pwd)"
/usr/bin/time -p pwd
PORT="${PORT:-3000}"
DIST="$PROJECT_ROOT/dist"
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
/usr/bin/time -p mkdir -p "$DIST"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p cp -f "$PROJECT_ROOT/index.html" "$DIST/index.html"
/usr/bin/time -p test -f "$DIST/index.html"
# Install dependencies when a package project exists (no-op for pure static).
if [ -f "$PROJECT_ROOT/package.json" ]; then
  if [ -f "$PROJECT_ROOT/package-lock.json" ]; then
    /usr/bin/time -p npm ci --no-audit --no-fund --prefix "$PROJECT_ROOT"
  else
    /usr/bin/time -p npm install --no-audit --no-fund --prefix "$PROJECT_ROOT"
  fi
  if [ -f "$PROJECT_ROOT/package.json" ] && /usr/bin/time -p grep -q '"build"' "$PROJECT_ROOT/package.json"; then
    /usr/bin/time -p npm run build --prefix "$PROJECT_ROOT"
  fi
fi
/usr/bin/time -p python3 -c "import json,os; root=os.path.abspath('.'); dist=os.path.join(root,'dist'); web=os.environ.get('OPENCODE_WEB_DIR','/home/runner/work/_temp/omgithub-web'); import pathlib; pathlib.Path(web).mkdir(parents=True,exist_ok=True); pathlib.Path(os.path.join(web,'deployment-output.json')).write_text(json.dumps({'project': root, 'directory': dist}))"
/usr/bin/time -p cat "$WEB_DIR/deployment-output.json"
echo "Serving $DIST on port $PORT (project=$PROJECT_ROOT)"
exec /usr/bin/time -p python3 -m http.server "$PORT" --directory "$DIST"
