#!/usr/bin/env bash
# Capture desktop + mobile screenshots of CAPTURE_URL into CAPTURE_DIR.
# Exit 75 = temporary navigation/browser infrastructure failure (retryable).
# Exit 1 = script misuse or rendering defect (needs a code fix).
set -euo pipefail
cd "$(dirname "$0")"
SESSION="capture"
OPENED=0
cleanup() {
  if [[ "$OPENED" == 1 ]]; then
    playwright-cli -s="$SESSION" close >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT
fail_temp() {
  echo "capture: transient failure: $*" >&2
  exit 75
}
if [[ -z "${CAPTURE_URL:-}" ]]; then
  echo "capture: CAPTURE_URL is not set." >&2
  exit 1
fi
if [[ -z "${CAPTURE_DIR:-}" ]]; then
  echo "capture: CAPTURE_DIR is not set." >&2
  exit 1
fi
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
/usr/bin/time -p playwright-cli -s="$SESSION" close >/dev/null 2>&1 || true
HTTP_CODE="$(/usr/bin/time -p curl --silent --location --max-time 20 --output /dev/null --write-out '%{http_code}' "$CAPTURE_URL")" || HTTP_CODE="000"
case "$HTTP_CODE" in
  2*) ;;
  000|408|429|500|502|503|504)
    echo "capture: preview unavailable (HTTP $HTTP_CODE)." >&2
    exit 75
    ;;
  *)
    echo "capture: preview rejected the request (HTTP $HTTP_CODE)." >&2
    exit 1
    ;;
esac
/usr/bin/time -p playwright-cli -s="$SESSION" open "$CAPTURE_URL" || fail_temp "browser open failed for $CAPTURE_URL"
OPENED=1
/usr/bin/time -p sleep 3
FONTS="$(/usr/bin/time -p playwright-cli -s="$SESSION" eval "() => (document.fonts ? document.fonts.status : 'unknown')")" || fail_temp "fonts probe failed"
echo "capture: document.fonts.status=$FONTS"
/usr/bin/time -p playwright-cli -s="$SESSION" eval "() => new Promise((resolve) => setTimeout(() => resolve(document.readyState), 1000))" >/dev/null || fail_temp "settle wait failed"
BODY_TEXT="$(/usr/bin/time -p playwright-cli -s="$SESSION" eval "() => (document.body ? document.body.innerText.slice(0, 4000) : '')")" || fail_temp "content probe failed"
if ! grep -q "LIQUID" <<<"$BODY_TEXT"; then
  echo "capture: rendered content check failed (LIQUID SYNTH heading missing)." >&2
  exit 1
fi
/usr/bin/time -p playwright-cli -s="$SESSION" resize 1440 900 || fail_temp "desktop resize failed"
/usr/bin/time -p sleep 1
/usr/bin/time -p playwright-cli -s="$SESSION" screenshot --filename="$CAPTURE_DIR/final-desktop.png" || fail_temp "desktop screenshot failed"
/usr/bin/time -p test -s "$CAPTURE_DIR/final-desktop.png"
/usr/bin/time -p playwright-cli -s="$SESSION" resize 390 844 || fail_temp "mobile resize failed"
/usr/bin/time -p sleep 1
/usr/bin/time -p playwright-cli -s="$SESSION" screenshot --filename="$CAPTURE_DIR/final-mobile.png" || fail_temp "mobile screenshot failed"
/usr/bin/time -p test -s "$CAPTURE_DIR/final-mobile.png"
/usr/bin/time -p playwright-cli -s="$SESSION" close || echo "capture: warning: browser close failed." >&2
OPENED=0
/usr/bin/time -p ls -la "$CAPTURE_DIR/final-desktop.png" "$CAPTURE_DIR/final-mobile.png"
echo "capture: done."
