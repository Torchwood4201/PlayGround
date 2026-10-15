#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p pwd
: "${CAPTURE_URL:?Set CAPTURE_URL.}"
: "${CAPTURE_DIR:?Set CAPTURE_DIR.}"
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
if [ -z "${CAPTURE_READY_SELECTOR:-}" ]; then
  export CAPTURE_READY_SELECTOR="canvas[data-engine]"
fi
/usr/bin/time -p echo "Capturing $CAPTURE_URL -> $CAPTURE_DIR (selector: $CAPTURE_READY_SELECTOR)"
set +e
/usr/bin/time -p node "${RUNTIME_DIR:?}/scripts/default-capture.mjs"
status=$?
set -e
/usr/bin/time -p echo "capture backend exited with status $status"
/usr/bin/time -p test -f "$CAPTURE_DIR/final-desktop.png"
/usr/bin/time -p test -f "$CAPTURE_DIR/final-mobile.png"
/usr/bin/time -p ls -lh "$CAPTURE_DIR/final-desktop.png" "$CAPTURE_DIR/final-mobile.png"
exit $status
