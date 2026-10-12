#!/usr/bin/env bash
# Once-per-worker prerequisites (executed via the saved hook on worker start).
set -euo pipefail
/usr/bin/time -p playwright-cli install-browser chromium
