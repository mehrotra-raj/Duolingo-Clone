#!/usr/bin/env bash
set -euo pipefail

# Simple startup script: run Alembic migrations, then start Uvicorn
cd "$(dirname "$0")"

echo "Running Alembic migrations..."
alembic -c alembic.ini upgrade head

echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
