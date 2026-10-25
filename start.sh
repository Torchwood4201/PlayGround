#!/usr/bin/env bash
# Build (when needed) and serve the static site in the foreground.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCODE_WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
PORT="${PORT:-3000}"
SERVE_DIR="$PROJECT_DIR"

timed() {
  /usr/bin/time -p "$@"
}

cd "$PROJECT_DIR"

# Install dependencies and build only for package-based projects.
if [[ -f package.json ]]; then
  if [[ -f package-lock.json ]]; then
    timed npm ci --no-audit --no-fund
  else
    timed npm install --no-audit --no-fund
  fi
  if timed node -e 'const p=require("./package.json"); process.exit(p.scripts && p.scripts.build ? 0 : 1)'; then
    timed npm run build
  fi
  if [[ -d "$PROJECT_DIR/dist" ]]; then
    SERVE_DIR="$PROJECT_DIR/dist"
  fi
fi

[[ -f "$SERVE_DIR/index.html" ]] || {
  echo "No index.html found in $SERVE_DIR" >&2
  exit 1
}

timed mkdir -p "$OPENCODE_WEB_DIR"
timed printf '{"project":"%s","directory":"%s"}\n' "$PROJECT_DIR" "$SERVE_DIR" \
  > "$OPENCODE_WEB_DIR/deployment-output.json"
timed python3 -c 'import json,sys; json.load(open(sys.argv[1], encoding="utf-8"))' \
  "$OPENCODE_WEB_DIR/deployment-output.json"

echo "Serving $SERVE_DIR on http://0.0.0.0:$PORT"
exec /usr/bin/time -p python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$SERVE_DIR"
