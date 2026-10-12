#!/usr/bin/env bash
# Start the Liquid Synth static app: install deps, build dist/ when needed,
# record deployment-output.json, serve dist/ in the foreground on PORT.
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p pwd
PROJECT_DIR="$(/usr/bin/time -p pwd)"
PORT="${PORT:-3000}"
DIST_DIR="$PROJECT_DIR/dist"
/usr/bin/time -p node --version
/usr/bin/time -p npm --version
if [[ ! -x "$PROJECT_DIR/node_modules/.bin/vite" ]]; then
  if [[ -f "$PROJECT_DIR/package-lock.json" ]]; then
    /usr/bin/time -p npm ci --no-audit --no-fund
  else
    /usr/bin/time -p npm install --no-audit --no-fund
  fi
fi
NEED_BUILD=0
if [[ ! -f "$DIST_DIR/index.html" ]]; then
  NEED_BUILD=1
elif [[ -n "$(/usr/bin/time -p find "$PROJECT_DIR" -maxdepth 1 \( -name '*.tsx' -o -name '*.ts' -o -name '*.js' -o -name '*.html' -o -name 'package.json' -o -name 'package-lock.json' -o -name 'vite.config.*' \) -newer "$DIST_DIR/index.html" -print -quit)" ]]; then
  NEED_BUILD=1
elif [[ -n "$(/usr/bin/time -p find "$PROJECT_DIR/components" "$PROJECT_DIR/hooks" "$PROJECT_DIR/utils" -newer "$DIST_DIR/index.html" -print -quit 2>/dev/null)" ]]; then
  NEED_BUILD=1
fi
if [[ "$NEED_BUILD" == 1 ]]; then
  /usr/bin/time -p "$PROJECT_DIR/node_modules/.bin/vite" build
fi
/usr/bin/time -p test -f "$DIST_DIR/index.html"
if [[ -n "${OPENCODE_WEB_DIR:-}" ]]; then
  /usr/bin/time -p mkdir -p "$OPENCODE_WEB_DIR"
  /usr/bin/time -p printf '{"project":"%s","directory":"%s"}\n' "$PROJECT_DIR" "$DIST_DIR" > "$OPENCODE_WEB_DIR/deployment-output.json"
fi
/usr/bin/time -p echo "Serving $DIST_DIR on port $PORT"
exec "$PROJECT_DIR/node_modules/.bin/vite" preview --port "$PORT" --host 0.0.0.0 --strictPort
