#!/usr/bin/env bash
# Build the static player into ./dist and serve it in the foreground.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_DIR="$(cd -- "${PROJECT_DIR:-$SCRIPT_DIR}" && pwd -P)"
cd "$PROJECT_DIR"

OPENCODE_WEB_DIR="${OPENCODE_WEB_DIR:?OPENCODE_WEB_DIR must be set}"
PORT="${PORT:-3000}"
DIST="$PROJECT_DIR/dist"
OUTPUT="$OPENCODE_WEB_DIR/deployment-output.json"

run() {
    printf '\n[start] +' >&2
    printf ' %q' "$@" >&2
    printf '\n' >&2
    /usr/bin/time -p "$@"
}

case "$PORT" in
    ''|*[!0-9]*) echo "PORT must be a number, got: $PORT" >&2; exit 1 ;;
esac
if (( PORT < 1 || PORT > 65535 )); then
    echo "PORT must be between 1 and 65535, got: $PORT" >&2
    exit 1
fi

for asset in index.html style.css script.js favicon.svg; do
    [[ -f "$PROJECT_DIR/$asset" ]] || { echo "Missing static asset: $PROJECT_DIR/$asset" >&2; exit 1; }
done

printf '[build] Static project: no package dependencies to install.\n' >&2
run mkdir -p "$OPENCODE_WEB_DIR"
run rm -rf "$DIST"
run mkdir -p "$DIST"
for asset in index.html style.css script.js favicon.svg; do
    run cp -- "$PROJECT_DIR/$asset" "$DIST/$asset"
done
for asset_dir in assets static media images fonts; do
    if [[ -d "$PROJECT_DIR/$asset_dir" ]]; then
        run cp -R -- "$PROJECT_DIR/$asset_dir" "$DIST/$asset_dir"
    fi
done

run python3 - "$PROJECT_DIR" "$DIST" "$OUTPUT" <<'PY'
import json
import os
import sys

project, directory, output = sys.argv[1:4]
os.makedirs(os.path.dirname(output), exist_ok=True)
with open(output, "w", encoding="utf-8") as handle:
    json.dump({"project": project, "directory": directory}, handle, separators=(",", ":"))
    handle.write("\n")
PY

printf '[start] serving %s on 0.0.0.0:%s\n' "$DIST" "$PORT" >&2
exec /usr/bin/time -p python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$DIST"
