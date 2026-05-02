#!/bin/sh
set -eu

# mssql-tools image uses /opt/mssql-tools/bin/sqlcmd (not mssql-tools18)
SQLCMD="/opt/mssql-tools/bin/sqlcmd"
SERVER="${DB_HOST:-sqlserver},${DB_PORT:-1433}"
USER="${DB_USER:-sa}"
PASSWORD="${DB_PASSWORD:-Education@123!}"

echo "Waiting for SQL Server at ${SERVER}..."
until "${SQLCMD}" -S "${SERVER}" -U "${USER}" -P "${PASSWORD}" -C -Q "SELECT 1" >/dev/null 2>&1; do
  sleep 2
done

echo "SQL Server is ready. Checking existing schema..."
TABLE_EXISTS="$("${SQLCMD}" -S "${SERVER}" -U "${USER}" -P "${PASSWORD}" -C -h -1 -W -Q "SET NOCOUNT ON; IF DB_ID('EducationSystem') IS NULL SELECT 0 ELSE SELECT CASE WHEN OBJECT_ID('EducationSystem.dbo.Student', 'U') IS NULL THEN 0 ELSE 1 END;")"
TABLE_EXISTS="$(printf '%s' "${TABLE_EXISTS}" | tr -d '[:space:]\r')"

if [ "${TABLE_EXISTS}" != "1" ]; then
  echo "Applying database migrations..."
  "${SQLCMD}" -S "${SERVER}" -U "${USER}" -P "${PASSWORD}" -C -i "/migrations/01_create_tables.sql"
  "${SQLCMD}" -S "${SERVER}" -U "${USER}" -P "${PASSWORD}" -C -i "/migrations/02_indexes.sql"
  "${SQLCMD}" -S "${SERVER}" -U "${USER}" -P "${PASSWORD}" -C -i "/migrations/03_stored_procedure.sql"
else
  echo "Schema already exists. Skipping DDL migrations."
fi

echo "Applying seed data (idempotent)..."
"${SQLCMD}" -S "${SERVER}" -U "${USER}" -P "${PASSWORD}" -C -i "/migrations/04_seed_data.sql"

echo "Applying additive migrations (idempotent)..."
"${SQLCMD}" -S "${SERVER}" -U "${USER}" -P "${PASSWORD}" -C -i "/migrations/05_education_place_is_active.sql"

echo "Database initialization completed."
