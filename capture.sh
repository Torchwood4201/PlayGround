#!/usr/bin/env bash
# Capture desktop and mobile screenshots of the running preview.
set -euo pipefail

: "${CAPTURE_URL:?CAPTURE_URL is required}"
: "${CAPTURE_DIR:?CAPTURE_DIR is required}"
: "${RUNTIME_DIR:?RUNTIME_DIR is required}"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CAPTURE_DIR="$(realpath -m "$CAPTURE_DIR")"
PROJECT_DIR_ABS="$(realpath -m "$PROJECT_DIR")"

timed() {
  /usr/bin/time -p "$@"
}

[[ "$CAPTURE_URL" =~ ^https?:// ]] || {
  echo "CAPTURE_URL must be an http(s) URL." >&2
  exit 1
}
case "$CAPTURE_DIR/" in
  "$PROJECT_DIR_ABS"/*)
    echo "CAPTURE_DIR must be outside the project source tree." >&2
    exit 1
    ;;
esac

export CAPTURE_URL
export CAPTURE_DIR
export CAPTURE_READY_SELECTOR="${CAPTURE_READY_SELECTOR:-#init-trigger}"
export CAPTURE_AUTO_START="${CAPTURE_AUTO_START:-false}"

timed mkdir -p "$CAPTURE_DIR"

set +e
/usr/bin/time -p node "$RUNTIME_DIR/scripts/default-capture.mjs"
status=$?
set -e

if [[ "$status" -eq 75 ]]; then
  echo "Capture failed due to a temporary browser or navigation error." >&2
  exit 75
fi
if [[ "$status" -ne 0 ]]; then
  echo "Capture failed with status $status." >&2
  exit 1
fi

for view in desktop mobile; do
  [[ -s "$CAPTURE_DIR/final-$view.png" ]] || {
    echo "Missing or empty final-$view.png" >&2
    exit 1
  }
done

echo "Captured $CAPTURE_DIR/final-desktop.png and final-mobile.png"
