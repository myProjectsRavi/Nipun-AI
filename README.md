# 🧠 Nipun AI — The Open-Source Bloomberg Alternative

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Infrastructure: Cloudflare Workers](https://img.shields.io/badge/Infra-Cloudflare_Workers-orange?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)
[![Security: AES-256-GCM](https://img.shields.io/badge/Security-AES--256--GCM-red?style=for-the-badge)](SECURITY.md)
[![Zero Cost](https://img.shields.io/badge/Cost-$0%2Fmonth-brightgreen?style=for-the-badge)](https://github.com/myProjectsRavi/Nipun-AI)
[![Tests](https://img.shields.io/badge/Tests-74_passing-brightgreen?style=for-the-badge)](https://github.com/myProjectsRavi/Nipun-AI)
[![Open Source](https://img.shields.io/badge/Open_Source-100%25-blueviolet?style=for-the-badge&logo=github)](https://github.com/myProjectsRavi/Nipun-AI)

### 🚀 One-Click Deploy

| Component | Deploy |
|-----------|--------|
| **Worker** (API) | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/myProjectsRavi/Nipun-AI&authed=true&fields={"ALLOWED_ORIGINS":"*","ENVIRONMENT":"production"}&resourceType=workers&deploy-source=dir:worker) |
| **Frontend** (UI) | [![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange?style=for-the-badge&logo=cloudflare)](https://dash.cloudflare.com/?to=/:account/pages/new/provider/github) |

> **55+ data dimensions · 5 AI models · 3 valuation methods · Zero infrastructure — the institutional-grade financial analysis platform that costs $0/month.**

Bloomberg charges $24,000/year. Nipun AI delivers comparable depth for **free** - deployable in under 5 minutes on Cloudflare's free tier with zero servers, zero databases, and zero maintenance.

---

## ⚡ Quick Start (Under 1 Minute)

### Step 1 — Install Node.js (one-time, skip if already installed)

**🍎 macOS** — Open Terminal (`Cmd+Space`, type "Terminal"), then:
```bash
brew install node
```
> Don't have `brew`? Run this first: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

**🪟 Windows** — Open PowerShell (`Win+S`, search "PowerShell"), then:
```powershell
winget install OpenJS.NodeJS.LTS
```

**🐧 Linux** — Open Terminal (`Ctrl+Alt+T`), then:
```bash
sudo apt update && sudo apt install -y nodejs npm
```

### Step 2 — Launch Nipun AI

```bash
npx nipun-ai
```

**That's it.** Browser opens automatically. Click **Manage Keys** → try **Demo Mode** for instant preview, or enter your free API keys for real-time live analysis.

> **Already installed?** Just run `npx nipun-ai` again anytime — it starts instantly.

---

### 🔧 Manual Setup (Developers)

<details>
<summary>Click to expand — for contributors or those who prefer full control</summary>

```bash
# 1. Clone
git clone https://github.com/myProjectsRavi/Nipun-AI.git && cd Nipun-AI

# 2. Start the Worker (serverless backend)
cd worker && npm install && npx wrangler dev

# 3. Start the Frontend (in another terminal)
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173` → Enter API keys → Analyze any stock ticker.

</details>


---

## ☕ Support

Nipun AI is free, open-source, and always will be. If it's useful to you, a coffee is appreciated - never expected.

<p align="center">
  <a href="https://www.paypal.com/paypalme/rtnlabs"><img src="https://img.shields.io/badge/Donate-PayPal-blue?style=for-the-badge&logo=paypal" alt="PayPal" /></a>&nbsp;
  <a href="https://rtnlabs.lemonsqueezy.com/checkout/buy/1be9bcd1-5f3e-4c50-906e-deb661fcf64d"><img src="https://img.shields.io/badge/Support-Lemon_Squeezy-fbbf24?style=for-the-badge" alt="Lemon Squeezy" /></a>&nbsp;
  <a href="https://github.com/sponsors/myProjectsRavi"><img src="https://img.shields.io/badge/❤️_Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github" alt="GitHub Sponsors" /></a>
</p>

<p align="center"><em>Donations are a voluntary thank-you for existing work — not a support contract.</em></p>

> **🌐 Try It**: Run `npx nipun-ai` to launch Nipun AI locally. Try **Demo Mode** with zero API keys, or add your free keys for live data.

---

## 🏆 Why Nipun AI?

### The Feature Gap Nobody Talks About

| Feature | Nipun AI | Screener.in | Perplexity | Yahoo Finance | Bloomberg |
|---|:---:|:---:|:---:|:---:|:---:|
| Nipun Score™ (A+ to F grade) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Scenario Analysis (Bull/Base/Bear) | ✅ | ❌ | ❌ | ❌ | ✅ |
| Competitive Moat Assessment | ✅ | ❌ | ❌ | ❌ | ✅ |
| SWOT Analysis (AI-Generated) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Investment Thesis (Bull/Bear Case) | ✅ | ❌ | ❌ | ❌ | ✅ |
| DCF Intrinsic Value | ✅ | ❌ | ❌ | ❌ | ✅ |
| Graham Number + Lynch Fair Value | ✅ | ❌ | ❌ | ❌ | ❌ |
| Multi-AI Consensus (5+ Models) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fact Audit (Claim Verification) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Altman Z-Score + Piotroski F-Score | ✅ | ❌ | ❌ | ❌ | ✅ |
| Bollinger / Stochastic / ATR / Fibonacci | ✅ | ❌ | ❌ | ❌ | ✅ |
| Analyst Consensus + Price Targets | ✅ | ❌ | ✅ | ✅ | ✅ |
| Institutional Ownership | ✅ | ❌ | ❌ | ✅ | ✅ |
| Insider Trading Activity | ✅ | ✅ | ❌ | ✅ | ✅ |
| SEC Filing Links | ✅ | ✅ | ❌ | ✅ | ✅ |
| Social Sentiment Analysis | ✅ | ❌ | ✅ | ❌ | ✅ |
| Momentum Score (Multi-Timeframe) | ✅ | ❌ | ❌ | ❌ | ✅ |
| Risk-Reward Ratio | ✅ | ❌ | ❌ | ❌ | ✅ |
| Revenue Segment Breakdown | ✅ | ✅ | ❌ | ❌ | ✅ |
| PDF Export (20+ Sections) | ✅ | ❌ | ❌ | ❌ | ✅ |
| Earnings Quality Score | ✅ | ❌ | ❌ | ❌ | ✅ |
| Value vs Growth Classification | ✅ | ❌ | ❌ | ❌ | ✅ |
| Dividend Safety Analysis | ✅ | ✅ | ❌ | ✅ | ✅ |
| Verifiable Research Links | ✅ | ❌ | ❌ | ❌ | ✅ |
| 55+ Data Dimensions | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Completely Free** | **✅** | **✅** (basic) | **✅** | **✅** | **❌ ($24K/yr)** |
| **BYOK (Zero Server-Side Key Storage)** | **✅** | **N/A** | **N/A** | **N/A** | **N/A** |
| **Zero Infrastructure** | **✅** | **❌** | **❌** | **❌** | **❌** |

**Nipun AI: 28/28** · Screener.in: 6/28 · Perplexity: 4/28 · Yahoo Finance: 7/28 · Bloomberg: 23/28 (at $24K/year)

---

## 🎯 Key Features

### 🏆 Nipun Score™
Proprietary A+ to F letter grade — a weighted composite of technicals (25%), fundamentals (25%), sentiment (20%), risk (15%), and insider activity (15%). One grade to rule them all.

### 🧠 Multi-AI Consensus Engine
5 Gemini models (2.5 Pro → 2.0 Flash → 1.5 Pro → Flash → Lite) with cascading fallback, plus Cerebras for contrarian second opinions. Agreement score quantifies how much the AIs agree.

### ✅ Fact Audit
Cohere-powered claim verification — every AI-generated statement is classified as grounded, speculative, or unverifiable. No other free tool does this.

### 🧮 Triple Valuation
DCF (10-year projected cash flows), Benjamin Graham Number (√(22.5 × EPS × BVPS)), and Peter Lynch Fair Value — three models, one consensus price target.

### 🛡️ Military-Grade Security (BYOK)
Your API keys are encrypted client-side with AES-256-GCM (PBKDF2, 100K iterations). Keys travel in encrypted headers, never stored on any server, exist only in memory for the duration of the request. See [SECURITY.md](SECURITY.md) for the full security model.

### 🏗️ Zero Infrastructure
No servers. No databases. No Docker. No Kubernetes. Fork → `npx wrangler deploy` → Done. Runs entirely on Cloudflare's free tier (Workers + Pages).

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                               │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  KeyVault   │→│ AnalysisForm │→│ ReportViewer (lazy)     │  │
│  │  AES-256    │  │  Zustand     │  │ 25+ sections + charts  │  │
│  └────────────┘  └──────┬───────┘  └────────────────────────┘  │
│                         │ X-Nipun-Keys header (base64)          │
└─────────────────────────┼──────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              YOUR CLOUDFLARE WORKER (self-hosted, free tier)      │
│                                                                 │
│  Phase 1: phaseFetchData()     ← Finnhub, Reddit, SEC, Yahoo  │
│  Phase 2: phaseCompute()       ← Zero API calls, pure math     │
│  Phase 3: phaseAISynth()       ← Gemini (5 models, parallel)   │
│  Phase 4: phaseSecondaryAI()   ← Cerebras + Cohere (parallel)  │
│                                                                 │
│  Security: Rate limiting · Input validation · CSP headers       │
└─────────────────────────────────────────────────────────────────┘
```

### 4-Phase Pipeline

| Phase | What | API Calls | Latency |
|---|---|---|---|
| **Phase 1** - Data Collection | Finnhub financials, Reddit sentiment, SEC filings, technicals, peers, earnings, insider trades | 10+ parallel | ~2-3s |
| **Phase 2** - Compute | Investment score, Nipun Score™, financial health, momentum, valuation models, risk-reward, dividends, extended technicals | **Zero** | ~5ms |
| **Phase 3** - AI Synthesis | Report generation + premium insights (scenario analysis, moat, SWOT, thesis) | 2 parallel Gemini calls | ~3-5s |
| **Phase 4** - Second Opinions | Cerebras contrarian analysis + Cohere fact audit | 2 parallel (non-fatal) | ~1-2s |

**Total: ~6-10 seconds** for 55+ data dimensions across 5 AI models. Bloomberg takes longer.

---

## 🔑 API Keys Required (All Free Tier)

| Provider | Free Tier | Used For | Get Key |
|---|---|---|---|
| **Finnhub** | 60 calls/min | Financials, technicals, peers, earnings, insider trades | [finnhub.io](https://finnhub.io/) |
| **Groq** | 14,400 req/day | Sentiment analysis (LPU inference) | [console.groq.com](https://console.groq.com/) |
| **Google Gemini** | 1,500 req/day | Report synthesis + premium insights | [aistudio.google.com](https://aistudio.google.com/) |
| **Cohere** | 1,000 req/month | Fact audit / claim verification | [dashboard.cohere.com](https://dashboard.cohere.com/) |
| **Cerebras** *(optional)* | 30 req/min | Contrarian second opinion | [cloud.cerebras.ai](https://cloud.cerebras.ai/) |

> **No keys?** Nipun AI has a **full-featured Demo Mode** with realistic mock data for AAPL, MSFT, GOOGL, and any ticker.

---

## 📊 What You Get

Every analysis produces a comprehensive report with:

| Section | Metric Type |
|---|---|
| **Nipun Score™** | A+ to F grade, strengths, weaknesses, recommendation |
| **Investment Score** | 0-100 composite with 5 sub-scores |
| **Financial Health** | Altman Z-Score, Piotroski F-Score, current/quick ratio |
| **Scenario Analysis** | Bull/Base/Bear price targets with probabilities |
| **Valuation Models** | DCF, Graham, Lynch fair values with consensus |
| **Competitive Moat** | Wide/Narrow/None rating with moat sources |
| **SWOT Analysis** | AI-generated strengths, weaknesses, opportunities, threats |
| **Investment Thesis** | Bull case + Bear case summaries |
| **Technical Analysis** | RSI, MACD, SMA50/200, Golden/Death Cross |
| **Extended Technicals** | Bollinger Bands, Stochastic, ATR, Fibonacci, Support/Resistance |
| **Momentum** | 7D/30D/90D performance, relative strength |
| **Risk-Reward** | Quantified ratio with max drawdown estimate |
| **Value vs Growth** | Classification with PEG, P/B, P/S metrics |
| **Dividend Analysis** | Yield, payout ratio, safety score, growth streak |
| **Social Sentiment** | Bullish/Bearish/Neutral breakdown with themes |
| **Insider Activity** | Executive buy/sell tracking with net sentiment |
| **Analyst Consensus** | Wall Street Buy/Hold/Sell ratings + price targets |
| **Institutional Ownership** | Top 10 holders with position changes |
| **Earnings History** | 4-quarter surprise track record |
| **Peer Comparison** | Side-by-side metrics vs industry peers |
| **SEC Filings** | Direct links to 10-K, 10-Q, 8-K filings |
| **AI Consensus** | Multi-model agreement score with divergences |
| **Fact Audit** | Claim-by-claim verification (grounded/speculative) |
| **News Headlines** | Latest company news with risk assessment |
| **PDF Export** | 20+ section institutional-grade PDF report |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Runtime** | Cloudflare Workers | Edge compute, 330+ PoPs, near-zero cold start, free tier |
| **Frontend** | React 18 + Vite + TypeScript | Fast builds, type safety |
| **State** | Zustand | Lightweight, no boilerplate |
| **Styling** | Tailwind CSS | Utility-first, dark theme |
| **Charts** | Recharts | React-native charting |
| **PDF** | jsPDF | Client-side PDF generation |
| **Encryption** | Web Crypto API (AES-256-GCM) | Browser-native, zero dependencies |
| **AI Models** | Gemini · Groq · Cerebras · Cohere | Multi-provider, cascading fallback |
| **Data** | Finnhub · Reddit RSS · SEC EDGAR · Yahoo RSS | Free, comprehensive |

---

## 📁 Project Structure

```
Nipun-AI/
├── cli/                      # npx nipun-ai CLI package (npm)
├── setup.sh                  # One-command setup (macOS/Linux)
├── setup.bat                 # One-command setup (Windows)
├── frontend/                 # React SPA (Cloudflare Pages)
│   └── src/
│       ├── App.tsx           # Landing page, nav, routing
│       ├── store.ts          # Zustand state + analysis orchestration
│       ├── components/
│       │   ├── KeyVault.tsx       # BYOK key management
│       │   ├── AnalysisForm.tsx   # Ticker input + trigger
│       │   ├── ReportViewer.tsx   # 25+ section report display
│       │   ├── PDFExport.tsx      # 20+ section PDF generation
│       │   └── ErrorBoundary.tsx  # React error boundary
│       └── utils/
│           └── crypto.ts     # AES-256-GCM encryption
├── worker/                   # Cloudflare Worker (serverless API)
│   └── src/
│       ├── index.ts          # Main handler, 4-phase pipeline
│       ├── types.ts          # 30+ TypeScript interfaces
│       ├── compute.ts        # Pure-math metrics (zero API calls)
│       ├── finnhub.ts        # Finnhub API integration
│       ├── gemini.ts         # Gemini 5-model cascade
│       ├── groq.ts           # Groq LPU sentiment analysis
│       ├── cerebras.ts       # Cerebras contrarian opinions
│       ├── cohere.ts         # Cohere fact audit
│       ├── edgar.ts          # SEC EDGAR filings
│       ├── rss.ts            # Reddit + Yahoo RSS feeds
│       └── mock.ts           # Ticker-aware demo data
├── shared/
│   └── types.ts              # Single source of truth (450+ LOC)
├── .github/
│   └── workflows/ci.yml      # Lint + typecheck + tests on every PR
├── README.md
├── SECURITY.md
└── CONTRIBUTING.md
```

---

## 🚀 Deployment

### Cloudflare (Recommended - Free)

**Worker:**
```bash
cd worker
npm install
# Edit wrangler.toml → set ALLOWED_ORIGINS to your Pages URL
npx wrangler deploy
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Deploy to Cloudflare Pages via dashboard or:
npx wrangler pages deploy dist
```

### Local Development

**Quickest way** (runs both services):
```bash
./setup.sh        # macOS/Linux
setup.bat         # Windows
```

**Manual** (two terminals):
```bash
# Terminal 1: Worker
cd worker && npm install && npx wrangler dev

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

---

## 🔒 Security Model

Nipun AI follows a **Zero-Trust, Zero-Knowledge, BYOK** security model:

- **Client-side encryption**: API keys encrypted with AES-256-GCM (PBKDF2, 100K iterations) before storage
- **Header-only transmission**: Keys sent via `X-Nipun-Keys` header (base64-encoded), never in request body
- **Stateless processing**: Worker processes keys in memory, never persists them
- **Rate limiting**: 30 requests/hour per IP via `CF-Connecting-IP`
- **Input validation**: Ticker regex `^[A-Z0-9.]{1,10}$` prevents injection
- **Security headers**: CSP, X-Content-Type-Options, X-Frame-Options on all responses
- **Encrypted cache**: Analysis results encrypted in localStorage with AES-256-GCM

See [SECURITY.md](SECURITY.md) for the complete security architecture.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Found a bug? [Open an issue](https://github.com/myProjectsRavi/Nipun-AI/issues/new).

---

## 📄 License

MIT - use it, fork it, deploy it, profit from it. Just star the repo. ⭐

---

## ⚠️ Disclaimer

Nipun AI is an educational and informational tool. It is **not financial advice**. Always conduct your own research and consult with a qualified financial advisor before making investment decisions. AI-generated analysis may contain errors or speculative statements.

---

**Built with ❤️ by [RTN Labs](https://rtn-labs.vercel.app). Smart. Secure. Stateless. Supreme.**
