#!/usr/bin/env bash
# מוריד את סטאק Docker Compose (מהשורש של הריפו) ומסיר קונטיינרים יתומים.
# למה סקריפט נפרד ולא רק תיעוד: אפשר בפקודה אחת גם לשחרר פורט ש-host ng serve תפס — נפוץ אחרי פיתוח מקומי.
#
# אופציונלי: שחרור פורט של ng serve (ברירת מחדל 4200) על המחשב המארח:
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
