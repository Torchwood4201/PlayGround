#!/usr/bin/env bash
set -euo pipefail
time -p cd "$(dirname "$0")"
time -p bash -c 'PROJECT_DIR="$(pwd)"; echo "project root: $PROJECT_DIR"'
PROJECT_DIR="$(pwd)"
PORT="${PORT:-3000}"
export PORT
DIST_DIR="$PROJECT_DIR/dist"
OPENCODE_WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
LEGACY_OUTPUT="/home/runner/work/_temp/omgithub-web/deployment-output.json"
time -p test -d "$DIST_DIR"
time -p test -f "$DIST_DIR/index.html"
time -p command -v python3
time -p python3 --version
time -p mkdir -p "$OPENCODE_WEB_DIR"
time -p python3 -c "import json,sys; json.dump({'project':sys.argv[1],'directory':sys.argv[2]}, open(sys.argv[3]+'/deployment-output.json','w'))" "$PROJECT_DIR" "$DIST_DIR" "$OPENCODE_WEB_DIR"
time -p cat "$OPENCODE_WEB_DIR/deployment-output.json"
time -p bash -c 'if [ "$1" != "$2" ]; then cp "$1" "$2"; fi' _ "$OPENCODE_WEB_DIR/deployment-output.json" "$LEGACY_OUTPUT"
time -p ls -lh "$DIST_DIR/index.html"
time -p python3 -c "import json,sys; d=json.load(open(sys.argv[1])); assert d['project']==sys.argv[2], d; assert d['directory']==sys.argv[3], d; print('deployment-output ok:', d)" "$OPENCODE_WEB_DIR/deployment-output.json" "$PROJECT_DIR" "$DIST_DIR"
time -p echo "serving $DIST_DIR on 0.0.0.0:$PORT (foreground)"
time -p python3 -m http.server "$PORT" --directory "$DIST_DIR"
