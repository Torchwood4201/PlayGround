#!/usr/bin/env bash
set -euo pipefail
time -p cd "$(dirname "$0")"
time -p bash -c 'PROJECT_ROOT="$(pwd)"; echo "PROJECT_ROOT=$PROJECT_ROOT"'
PROJECT_ROOT="$(pwd)"
STATIC_DIR="$PROJECT_ROOT/dist"
PORT="${PORT:-3000}"
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
time -p test -f "$STATIC_DIR/index.html"
time -p test -f "$STATIC_DIR/three.min.js"
time -p mkdir -p "$WEB_DIR"
time -p bash -c 'echo "STATIC_DIR='"$STATIC_DIR"' PORT='"$PORT"'"'
# No npm dependencies for this static build; build step is a no-op verification.
if time -p test -f "$PROJECT_ROOT/package.json"; then
  time -p npm install --no-audit --no-fund
  time -p npm run build --if-present
fi
time -p python3 -c "import json,os; d=os.environ.get('OPENCODE_WEB_DIR','/home/runner/work/_temp/omgithub-web'); import pathlib; pathlib.Path(d).mkdir(parents=True,exist_ok=True); open(d+'/deployment-output.json','w').write(json.dumps({'project':'/home/runner/work/PlayGround/PlayGround','directory':'/home/runner/work/PlayGround/PlayGround/dist'})); print(open(d+'/deployment-output.json').read())"
echo "Serving $STATIC_DIR on PORT $PORT (foreground)"
exec python3 -m http.server "$PORT" --directory "$STATIC_DIR"
