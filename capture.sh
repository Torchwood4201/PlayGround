#!/usr/bin/env bash
set -euo pipefail
time -p cd "$(dirname "$0")"
time -p bash -c 'echo "capture cwd: $(pwd)"'
time -p bash -c 'test -n "${CAPTURE_URL:-}" || { echo "CAPTURE_URL is required" >&2; exit 1; }'
time -p bash -c 'test -n "${CAPTURE_DIR:-}" || { echo "CAPTURE_DIR is required" >&2; exit 1; }'
time -p bash -c 'test -n "${RUNTIME_DIR:-}" || { echo "RUNTIME_DIR is required" >&2; exit 1; }'
time -p mkdir -p "${CAPTURE_DIR:?}"
time -p bash -c 'echo "capturing URL: $CAPTURE_URL -> $CAPTURE_DIR"'
set +e
time -p node "${RUNTIME_DIR:?}/scripts/default-capture.mjs"
status=$?
set -e
time -p bash -c 'echo "capture exit: $0"' "$status"
time -p ls -lh "${CAPTURE_DIR:?}"
time -p bash -c 'test -f "$0/final-desktop.png" || { echo "missing final-desktop.png" >&2; exit 1; }' "$CAPTURE_DIR"
time -p bash -c 'test -f "$0/final-mobile.png" || { echo "missing final-mobile.png" >&2; exit 1; }' "$CAPTURE_DIR"
time -p bash -c 'echo "capture output kept outside source; app left running"'
exit "$status"
