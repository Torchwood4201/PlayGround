#!/usr/bin/env bash
# Start the AXE//VECTOR static build and serve it in the foreground.
#
# - Runs from the project directory, installs dependencies when needed,
#   rebuilds dist/ when sources are newer, then serves dist/ foreground.
# - Writes worker metadata (deployment-output.json) to OPENCODE_WEB_DIR.
# - Source and built output stay inside PROJECT_DIR; OPENCODE_WEB_DIR and
#   RUNNER_TEMP are used only for worker metadata / capture evidence.
set -euo pipefail
cd "$(dirname "$0")"
PROJECT_DIR="$PWD"
PORT="${PORT:-3000}"
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"

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

[[ "$PORT" =~ ^[0-9]+$ ]] || { echo "PORT must be numeric, got '$PORT'." >&2; exit 1; }
[[ -f package.json ]] || { echo "package.json not found in $PROJECT_DIR." >&2; exit 1; }
command -v node >/dev/null || { echo "node not found on PATH." >&2; exit 1; }
command -v npm >/dev/null || { echo "npm not found on PATH." >&2; exit 1; }

timed "node --version" node --version
timed "npm --version" npm --version

# Install dependencies when node_modules is missing or manifests are newer.
need_install=false
if [[ ! -d node_modules ]]; then
  need_install=true
elif [[ package.json -nt node_modules ]]; then
  need_install=true
elif [[ -f package-lock.json && package-lock.json -nt node_modules ]]; then
  need_install=true
fi
if [[ "$need_install" == true ]]; then
  timed "npm install" npm install --no-audit --no-fund
else
  echo "[timing] npm install: skipped (node_modules up to date)" >&2
fi

# Rebuild dist/ when it is missing or any source is newer than the output.
need_build=false
if [[ ! -f dist/index.html ]]; then
  need_build=true
elif [[ -n "$(find src index.html vite.config.ts tsconfig.json package.json -newer dist/index.html -print -quit 2>/dev/null)" ]]; then
  need_build=true
fi
if [[ "$need_build" == true ]]; then
  timed "npm run build" npm run build
else
  echo "[timing] npm run build: skipped (dist up to date)" >&2
fi
[[ -f dist/index.html ]] || { echo "Build defect: dist/index.html missing after build step." >&2; exit 1; }

# Publish deployment metadata for the controller (worker metadata only).
mkdir -p "$WEB_DIR"
start_meta="$(date +%s%N)"
printf '{"project":"%s","directory":"%s"}\n' "$PROJECT_DIR" "$PROJECT_DIR/dist" > "$WEB_DIR/deployment-output.json"
echo "[timing] write deployment-output.json: $(( ($(date +%s%N) - start_meta) / 1000000 )) ms (exit 0)" >&2

# Serve the built static directory in the foreground.
echo "Serving $PROJECT_DIR/dist on 0.0.0.0:$PORT" >&2
timed "vite preview (foreground)" ./node_modules/.bin/vite preview --port "$PORT" --host 0.0.0.0 --strictPort
