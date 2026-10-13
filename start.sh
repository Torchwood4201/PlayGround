#!/usr/bin/env bash
set -euo pipefail
time -p cd "$(dirname "$0")"
/usr/bin/time -p pwd
SCRIPT_DIR="$(pwd)"
/usr/bin/time -p bash -c 'test -f dist/index.html'
PORT="${PORT:-3000}"
OPENCODE_WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
DIST_DIR="${SCRIPT_DIR}/dist"
/usr/bin/time -p mkdir -p "${OPENCODE_WEB_DIR}"
if /usr/bin/time -p test -f "${SCRIPT_DIR}/package.json"; then
  if /usr/bin/time -p test -f "${SCRIPT_DIR}/package-lock.json"; then
    /usr/bin/time -p npm ci --no-audit --no-fund
  else
    /usr/bin/time -p npm install --no-audit --no-fund
  fi
  if /usr/bin/time -p test -f "${SCRIPT_DIR}/package.json"; then
    /usr/bin/time -p bash -c 'node -e "const p=require(\"./package.json\"); process.exit(p.scripts&&p.scripts.build?0:1)" && npm run build || true'
  fi
fi
/usr/bin/time -p test -f "${DIST_DIR}/index.html"
/usr/bin/time -p python3 -c "import json,os; d=os.environ.get('OPENCODE_WEB_DIR','/home/runner/work/_temp/omgithub-web'); open(os.path.join(d,'deployment-output.json'),'w').write(json.dumps({'project':'/home/runner/work/PlayGround/PlayGround','directory':'/home/runner/work/PlayGround/PlayGround/dist'}))"
/usr/bin/time -p cat "${OPENCODE_WEB_DIR}/deployment-output.json"
/usr/bin/time -p echo "Serving ${DIST_DIR} on port ${PORT}"
/usr/bin/time -p python3 -m http.server "${PORT}" --directory "${DIST_DIR}"
