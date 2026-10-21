#!/usr/bin/env bash
# Capture the rendered app at desktop and mobile sizes without interacting with it.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$SCRIPT_DIR"

CAPTURE_URL="${CAPTURE_URL:?CAPTURE_URL must be set}"
CAPTURE_DIR="${CAPTURE_DIR:?CAPTURE_DIR must be set}"

run() {
    printf '\n[capture] +' >&2
    printf ' %q' "$@" >&2
    printf '\n' >&2
    /usr/bin/time -p "$@"
}

case "$CAPTURE_URL" in
    http://*|https://*) ;;
    *) echo "CAPTURE_URL must be an absolute http(s) URL, got: $CAPTURE_URL" >&2; exit 1 ;;
esac

run mkdir -p "$CAPTURE_DIR"
run rm -f "$CAPTURE_DIR/final-desktop.png" "$CAPTURE_DIR/final-mobile.png"
run env CAPTURE_URL="$CAPTURE_URL" CAPTURE_DIR="$CAPTURE_DIR" node "$SCRIPT_DIR/scripts/capture.mjs"
