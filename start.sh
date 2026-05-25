#!/bin/bash
set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         GRC Engineering Platform — Starting Up              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

BASE="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$BASE/backend"
FRONTEND="$BASE/frontend"

# ── Backend ──────────────────────────────────────────────────────────
echo "▶ Setting up Python backend..."
cd "$BACKEND"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate

pip install -q -r requirements.txt

echo "▶ Seeding database..."
# Always use the venv python — never system/conda python
.venv/bin/python seed.py

echo "▶ Starting FastAPI backend on http://localhost:8000"
# Explicitly use the venv uvicorn so system Anaconda python doesn't intercept
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# ── Frontend ─────────────────────────────────────────────────────────
echo ""
echo "▶ Setting up React frontend..."
cd "$FRONTEND"

if [ ! -d "node_modules" ]; then
  npm install
fi

echo "▶ Starting Vite dev server on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  GRC Engineering Platform is running!                       ║"
echo "║                                                              ║"
echo "║  Frontend:  http://localhost:3000                           ║"
echo "║  API Docs:  http://localhost:8000/docs                      ║"
echo "║                                                              ║"
echo "║  Demo credentials:                                          ║"
echo "║    Admin   → admin@grc.com    / Admin@2026                  ║"
echo "║    Analyst → analyst@grc.com  / Analyst@2026                ║"
echo "║    Auditor → auditor@grc.com  / Auditor@2026                ║"
echo "║                                                              ║"
echo "║  To enable AI features, set ANTHROPIC_API_KEY in .env       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
