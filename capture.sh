#!/usr/bin/env bash
set -euo pipefail
# Capture desktop + mobile screenshots of CAPTURE_URL into CAPTURE_DIR.
# Leaves the app running; output stays outside source. 75 = transient infra, 1 = script/render defect.
cd "$(dirname "$0")"
/usr/bin/time -p pwd
RUNTIME_FALLBACK="/home/runner/work/_temp/omgithub-runtime"
RUNTIME_DIR="${RUNTIME_DIR:-$RUNTIME_FALLBACK}"
/usr/bin/time -p test -n "${CAPTURE_URL:-}" || { echo "Set CAPTURE_URL." >&2; exit 1; }
/usr/bin/time -p test -n "${CAPTURE_DIR:-}" || { echo "Set CAPTURE_DIR." >&2; exit 1; }
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
/usr/bin/time -p test -f "$RUNTIME_DIR/scripts/default-capture.mjs" || { echo "Missing default-capture.mjs in $RUNTIME_DIR" >&2; exit 1; }
set +e
/usr/bin/time -p node "$RUNTIME_DIR/scripts/default-capture.mjs"
status=$?
set -e
if [ $status -eq 75 ]; then
  echo "Transient navigation/browser infrastructure failure." >&2
  exit 75
fi
if [ $status -ne 0 ]; then
  echo "Capture script failed with status $status." >&2
  exit 1
fi
/usr/bin/time -p test -f "$CAPTURE_DIR/final-desktop.png" || { echo "Missing $CAPTURE_DIR/final-desktop.png" >&2; exit 1; }
/usr/bin/time -p test -f "$CAPTURE_DIR/final-mobile.png" || { echo "Missing $CAPTURE_DIR/final-mobile.png" >&2; exit 1; }
/usr/bin/time -p ls -l "$CAPTURE_DIR/final-desktop.png" "$CAPTURE_DIR/final-mobile.png"
echo "Capture complete: $CAPTURE_DIR/final-desktop.png + final-mobile.png from $CAPTURE_URL"
