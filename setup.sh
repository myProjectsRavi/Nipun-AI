#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# 🧠 Nipun AI — One-Command Local Setup
#
# Usage (if you already cloned the repo):
#   chmod +x setup.sh && ./setup.sh
#
# Usage (without cloning):
#   curl -fsSL https://raw.githubusercontent.com/myProjectsRavi/Nipun-AI/main/setup.sh | bash
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}🧠 Nipun AI — The Open-Source Bloomberg Alternative${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── 1. Check prerequisites ────────────────────────────────────────
echo -e "${YELLOW}[1/4]${NC} Checking prerequisites..."

if ! command -v node &>/dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed.${NC}"
    echo "   Install Node.js 22 or newer from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo -e "${RED}❌ Node.js 22+ required. You have $(node -v).${NC}"
    echo "   Update from: https://nodejs.org"
    exit 1
fi

if ! command -v npm &>/dev/null; then
    echo -e "${RED}❌ npm is required but not installed.${NC}"
    exit 1
fi

echo -e "   ✅ Node.js $(node -v) · npm $(npm -v)"

# ─── 2. Clone if needed ────────────────────────────────────────────
if [ ! -f "package.json" ] || ! grep -q '"nipun-ai"' package.json 2>/dev/null; then
    echo ""
    echo -e "${YELLOW}[2/4]${NC} Cloning Nipun AI..."
    if ! command -v git &>/dev/null; then
        echo -e "${RED}❌ Git is required. Install from: https://git-scm.com${NC}"
        exit 1
    fi
    git clone https://github.com/myProjectsRavi/Nipun-AI.git
    cd Nipun-AI
else
    echo ""
    echo -e "${YELLOW}[2/4]${NC} Already in Nipun AI directory — skipping clone."
fi

# ─── 3. Install dependencies ────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/4]${NC} Installing dependencies from lockfiles..."

echo "   📦 Worker..."
(cd worker && npm ci --no-fund) || { echo -e "${RED}❌ Worker install failed${NC}"; exit 1; }

echo "   📦 Frontend..."
(cd frontend && npm ci --no-fund) || { echo -e "${RED}❌ Frontend install failed${NC}"; exit 1; }

echo -e "   ✅ All dependencies installed."

# ─── 4. Start both services ────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/4]${NC} Starting Nipun AI..."
echo ""
echo "   Default ports: frontend 5173 · worker 8787"
echo "   This script never terminates unrelated processes."
echo "   If a default port is busy, use the recommended launcher: npx nipun-ai@latest"

WORKER_PID=''
FRONTEND_PID=''
cleanup() {
    trap - EXIT INT TERM
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
    [ -n "$WORKER_PID" ] && kill "$WORKER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(cd worker && exec npx wrangler dev --port 8787) &
WORKER_PID=$!
sleep 2
if ! kill -0 "$WORKER_PID" 2>/dev/null; then
    echo -e "${RED}❌ Worker failed to start. Check whether port 8787 is already in use.${NC}"
    exit 1
fi

(cd frontend && exec npm run dev) &
FRONTEND_PID=$!
sleep 2
if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo -e "${RED}❌ Frontend failed to start. Check whether port 5173 is already in use.${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Nipun AI is running!${NC}"
echo ""
echo -e "   🌐 Frontend: ${CYAN}http://localhost:5173${NC}"
echo -e "   ⚙️  Worker:   ${CYAN}http://localhost:8787${NC}"
echo ""
echo -e "   ${YELLOW}Next steps:${NC}"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Click 'Demo Mode' to try instantly (no API keys needed)"
echo "   3. Or enter your free API keys for live data"
echo ""
echo -e "   ${YELLOW}Get free API keys (2 minutes):${NC}"
echo "   • Finnhub:  https://finnhub.io"
echo "   • Gemini:   https://aistudio.google.com"
echo "   • Groq:     https://console.groq.com"
echo "   • Cohere:   https://dashboard.cohere.com"
echo "   • Cerebras: https://cloud.cerebras.ai (optional)"
echo ""
echo "   Press Ctrl+C to stop both services."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

wait "$WORKER_PID" "$FRONTEND_PID"
