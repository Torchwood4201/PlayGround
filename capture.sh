#!/usr/bin/env bash
set -euo pipefail
time -p cd "$(dirname "$0")"
if /usr/bin/time -p test -z "${CAPTURE_URL:-}"; then
  echo "CAPTURE_URL is required" >&2
  exit 1
fi
if /usr/bin/time -p test -z "${CAPTURE_DIR:-}"; then
  echo "CAPTURE_DIR is required" >&2
  exit 1
fi
case "${CAPTURE_URL}" in
  http://*|https://*) ;;
  *) echo "CAPTURE_URL must start with http:// or https://" >&2; exit 1 ;;
esac
/usr/bin/time -p mkdir -p "${CAPTURE_DIR}"
case "${CAPTURE_DIR}" in
  /home/runner/work/PlayGround/PlayGround/*) echo "CAPTURE_DIR must be outside source (use RUNNER_TEMP)" >&2; exit 1 ;;
esac

cleanup() {
  /usr/bin/time -p /usr/local/bin/playwright-cli close >/dev/null 2>&1 || true
}
trap cleanup EXIT

fail_temp() { echo "TEMP FAILURE: $1" >&2; exit 75; }
fail_defect() { echo "DEFECT: $1" >&2; exit 1; }

/usr/bin/time -p /usr/local/bin/playwright-cli open --browser chrome "${CAPTURE_URL}" || fail_temp "browser open / navigation failed for ${CAPTURE_URL}"

capture_one() {
  local name="$1" width="$2" height="$3"
  /usr/bin/time -p /usr/local/bin/playwright-cli resize "${width}" "${height}" || fail_temp "resize ${width}x${height} failed"
  /usr/bin/time -p /usr/local/bin/playwright-cli goto "${CAPTURE_URL}" || fail_temp "goto ${CAPTURE_URL} failed (${name})"
  /usr/bin/time -p sleep 3 || fail_temp "sleep failed"
  local state
  state="$(/usr/bin/time -p /usr/local/bin/playwright-cli eval "() => document.readyState")" || fail_temp "readyState check failed (${name})"
  echo "${state}" | /usr/bin/time -p grep -q complete || fail_defect "document not complete (${name}): ${state}"
  local has_body
  has_body="$(/usr/bin/time -p /usr/local/bin/playwright-cli eval "() => !!document.querySelector('body')")" || fail_temp "body check failed (${name})"
  echo "${has_body}" | /usr/bin/time -p grep -q true || fail_defect "body missing (${name})"
  local has_canvas
  has_canvas="$(/usr/bin/time -p /usr/local/bin/playwright-cli eval "() => !!document.querySelector('canvas')")" || fail_temp "canvas check failed (${name})"
  echo "${has_canvas}" | /usr/bin/time -p grep -q true || fail_defect "rendered canvas missing (${name})"
  local title
  title="$(/usr/bin/time -p /usr/local/bin/playwright-cli eval "() => document.title")" || fail_temp "title check failed (${name})"
  echo "Capture ${name}: title=${title}"
  if ! /usr/bin/time -p /usr/local/bin/playwright-cli screenshot --filename "${CAPTURE_DIR}/final-${name}.png"; then
    if /usr/bin/time -p /usr/local/bin/playwright-cli list >/dev/null 2>&1; then
      fail_defect "screenshot failed (${name})"
    else
      fail_temp "browser disconnected during screenshot (${name})"
    fi
  fi
  /usr/bin/time -p test -s "${CAPTURE_DIR}/final-${name}.png" || fail_defect "screenshot missing/empty (${name})"
  local size
  size="$(/usr/bin/time -p wc -c < "${CAPTURE_DIR}/final-${name}.png")"
  echo "Captured ${name}: ${size} bytes"
  if /usr/bin/time -p test "${size}" -lt 5000; then
    fail_defect "screenshot suspiciously small (${name}, ${size} bytes)"
  fi
}

/usr/bin/time -p bash -c 'true'
capture_one desktop 1440 900
capture_one mobile 390 844

/usr/bin/time -p ls -lh "${CAPTURE_DIR}/final-desktop.png" "${CAPTURE_DIR}/final-mobile.png"
trap - EXIT
/usr/bin/time -p /usr/local/bin/playwright-cli close || fail_temp "browser close failed"
echo "Capture complete: ${CAPTURE_DIR}/final-desktop.png ${CAPTURE_DIR}/final-mobile.png"
