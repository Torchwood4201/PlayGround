#!/usr/bin/env bash
# Capture desktop + mobile screenshots of the running app.
#
# - Reads CAPTURE_URL (exact page to open) and CAPTURE_DIR (output dir).
# - Launches its own headless Chromium, waits for rendered content via a
#   virtual-time budget, writes final-desktop.png and final-mobile.png.
# - Capture evidence stays in CAPTURE_DIR (outside the project source);
#   the app server is left running.
# - Exit 75: temporary navigation / browser infrastructure failure.
# - Exit 1: script usage error or rendering defect (missing/invalid output).
set -euo pipefail

URL="${CAPTURE_URL:?CAPTURE_URL environment variable must be set.}"
DIR="${CAPTURE_DIR:?CAPTURE_DIR environment variable must be set.}"

# timed <label> <command...> — run a command, log wall time, keep its exit code.
timed() {
  local label="$1"
  shift
  local start end code
  start="$(date +%s%N)"
  "$@"
  code=$?
  end="$(date +%s%N)"
  echo "[timing] $label: $(( (end - start) / 1000000 )) ms (exit $code)" >&2
  return "$code"
}

CHROME="$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)"
[[ -n "$CHROME" ]] || { echo "No Chromium browser found on PATH." >&2; exit 75; }
command -v timeout >/dev/null || { echo "GNU timeout not found on PATH." >&2; exit 1; }

timed "mkdir CAPTURE_DIR" mkdir -p "$DIR"
[[ -w "$DIR" ]] || { echo "CAPTURE_DIR is not writable: $DIR" >&2; exit 1; }

# Navigation pre-check: unreachable / 5xx tunnel means temporary infrastructure
# failure (exit 75). Anything else proceeds to the browser capture.
http_code="$(curl --silent --max-time 15 --output /dev/null --write-out '%{http_code}' "$URL" || echo 000)"
echo "[capture] pre-check $URL -> HTTP $http_code" >&2
if [[ "$http_code" == 000 || "$http_code" == 5* ]]; then
  echo "Navigation pre-check failed (HTTP $http_code); temporary infrastructure failure." >&2
  exit 75
fi

# capture <output> — one headless run, own browser process that exits by
# itself; timeout guards against hangs (exit 75). Honors $SIZE and the
# optional $USER_AGENT set by the caller.
capture() {
  local output="$1"
  local extra_args=()
  if [[ -n "${USER_AGENT:-}" ]]; then
    extra_args+=(--user-agent="$USER_AGENT")
  fi
  if ! timed "chromium $(basename "$output")" timeout 120 "$CHROME" \
    --headless=new --no-sandbox --disable-dev-shm-usage \
    --enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader \
    --hide-scrollbars \
    --window-size="$SIZE" \
    "${extra_args[@]}" \
    --screenshot="$output" \
    --virtual-time-budget=20000 \
    "$URL"; then
    echo "Browser capture failed for $output; temporary infrastructure failure." >&2
    return 75
  fi
  return 0
}

# Desktop view.
SIZE="1440,900"
unset USER_AGENT
capture "$DIR/final-desktop.png" || exit 75

# Mobile view (narrow viewport + mobile user agent).
SIZE="390,844"
USER_AGENT="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
capture "$DIR/final-mobile.png" || exit 75

# Validate rendering output: both files must exist, be non-empty, valid PNGs.
start_validate="$(date +%s%N)"
for shot in final-desktop.png final-mobile.png; do
  [[ -s "$DIR/$shot" ]] || { echo "Rendering defect: $DIR/$shot missing or empty." >&2; exit 1; }
  if command -v file >/dev/null; then
    filetype="$(file --brief "$DIR/$shot")"
    [[ "$filetype" == PNG* ]] || { echo "Rendering defect: $DIR/$shot is not a PNG ($filetype)." >&2; exit 1; }
  fi
done
echo "[timing] validate screenshots: $(( ($(date +%s%N) - start_validate) / 1000000 )) ms (exit 0)" >&2
timed "list CAPTURE_DIR" ls -la "$DIR" >&2

echo "[capture] done: $DIR/final-desktop.png + $DIR/final-mobile.png" >&2
exit 0
