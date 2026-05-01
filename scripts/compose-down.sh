#!/usr/bin/env bash
# From repo root: stops Docker Compose stack and removes orphans.
# Optional: also free the host dev server port used by `ng serve` (default 4200).
#
#   ./scripts/compose-down.sh
#   KILL_NG_SERVE_PORT=4200 ./scripts/compose-down.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

docker compose down --remove-orphans "$@"

if [ -n "${KILL_NG_SERVE_PORT:-}" ]; then
  pids=$(lsof -nP -iTCP:"${KILL_NG_SERVE_PORT}" -sTCP:LISTEN -t 2>/dev/null || true)
  if [ -n "${pids}" ]; then
    echo "Stopping host listener(s) on :${KILL_NG_SERVE_PORT} (PIDs: ${pids})"
    kill ${pids} 2>/dev/null || true
  fi
fi
