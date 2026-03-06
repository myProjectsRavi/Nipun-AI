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
    echo "   Install it from: https://nodejs.org (LTS recommended)"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. You have $(node -v).${NC}"
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

# ─── 3. Install dependencies ───────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/4]${NC} Installing dependencies (this takes ~30 seconds)..."

echo "   📦 Worker..."
(cd worker && npm install --silent 2>&1) || { echo -e "${RED}❌ Worker install failed${NC}"; exit 1; }

echo "   📦 Frontend..."
(cd frontend && npm install --silent 2>&1) || { echo -e "${RED}❌ Frontend install failed${NC}"; exit 1; }

echo -e "   ✅ All dependencies installed."

# ─── 4. Start both services ────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/4]${NC} Starting Nipun AI..."
echo ""

# Kill anything already using these ports (prevents "Address already in use" on re-runs)
echo -e "   Freeing ports 8787 and 5173..."
lsof -ti:8787 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Start worker in background
(cd worker && npx wrangler dev --port 8787 2>&1 &)
sleep 2

# Start frontend in background
(cd frontend && npm run dev 2>&1 &)
sleep 2

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

# Wait for background processes
wait
