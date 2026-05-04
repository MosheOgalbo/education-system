#!/usr/bin/env bash
# מעדכן את העותקים תחת overlays/full-stack/assets מתוך database/ — הריצו אחרי שינוי במיגרציות.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEST="${SCRIPT_DIR}/overlays/full-stack/assets"
mkdir -p "${DEST}/migrations"
cp "${ROOT}/database/init-db.sh" "${DEST}/"
cp "${ROOT}/database/migrations/"*.sql "${DEST}/migrations/"
echo "Synced into ${DEST}"
