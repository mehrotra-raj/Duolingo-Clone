#!/usr/bin/env bash
# Run the FastAPI backend — always use this script to avoid path errors.
set -e
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

if ! python -c "import fastapi" 2>/dev/null; then
  echo "Installing dependencies..."
  pip install -r requirements.txt
fi

if [ ! -f "duolingo.db" ]; then
  echo "Seeding database (first run)..."
  python seed.py
fi

PORT="${PORT:-8000}"
if command -v lsof >/dev/null 2>&1 && lsof -i ":$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Port $PORT is already in use. Kill the old process or run: PORT=8001 ./run.sh"
  exit 1
fi

echo "Starting backend at http://localhost:$PORT"
echo "API docs: http://localhost:$PORT/docs"
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload
