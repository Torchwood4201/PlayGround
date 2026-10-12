#!/usr/bin/env bash
set -euo pipefail
time -p cd "$(dirname "$0")"
if [[ -z "${CAPTURE_URL:-}" || -z "${CAPTURE_DIR:-}" ]]; then
  echo "Set CAPTURE_URL and CAPTURE_DIR." >&2
  exit 1
fi
time -p mkdir -p "$CAPTURE_DIR"
time -p bash -c 'echo "CAPTURE_URL=$CAPTURE_URL CAPTURE_DIR=$CAPTURE_DIR"'
RUNTIME="${RUNTIME_DIR:-/home/runner/work/_temp/omgithub-runtime}"
# Delegate to the runtime capture (Chromium headed via Xvfb/SwiftShader):
# opens exact URL, waits for rendered content, captures desktop+mobile,
# closes its own browser, exit 75 transient / 1 defect.
set +e
time -p node "$RUNTIME/scripts/default-capture.mjs"
status=$?
set -e
if [[ $status -ne 0 ]]; then
  echo "capture backend exited $status" >&2
  exit $status
fi
time -p test -f "$CAPTURE_DIR/final-desktop.png"
time -p test -f "$CAPTURE_DIR/final-mobile.png"
time -p bash -c 'test -s "$CAPTURE_DIR/final-desktop.png" && test -s "$CAPTURE_DIR/final-mobile.png"'
echo "capture ok: $CAPTURE_DIR/final-desktop.png + final-mobile.png (app left running)"
