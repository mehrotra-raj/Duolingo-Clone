#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

echo "Starting frontend at http://localhost:3000"
exec npm run dev
