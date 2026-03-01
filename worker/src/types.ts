// ─── Financial Data (Finnhub) ──────────────────────────────────────
export interface FinancialData {
    ticker: string;
    companyName: string;
    price: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    previousClose: number;
    volume: number;
    marketCap: number;
    pe: number;
    eps: number;
    beta: number;
    weekHigh52: number;
    weekLow52: number;
    revenue: number;
    grossMargin: number;
    debtToEquity: number;
    dividendYield: number;
    sector: string;
}

// ─── Technical Indicators ──────────────────────────────────────────
export interface TechnicalSignal {
    name: string;
    value: number;
    signal: 'bullish' | 'bearish' | 'neutral';
    interpretation: string;
}

export interface TechnicalAnalysis {
    rsi: TechnicalSignal;
    macd: TechnicalSignal;
    sma50: TechnicalSignal;
    sma200: TechnicalSignal;
    overallSignal: 'bullish' | 'bearish' | 'neutral';
    goldenDeathCross: string | null;
}

// ─── Insider Trading ───────────────────────────────────────────────
export interface InsiderTrade {
    name: string;
    role: string;
    transactionType: 'buy' | 'sell' | 'exercise';
    shares: number;
    price: number;
    value: number;
    date: string;
}

export interface InsiderActivity {
    trades: InsiderTrade[];
    netSentiment: 'bullish' | 'bearish' | 'neutral';
    totalBuyValue: number;
    totalSellValue: number;
    summary: string;
}

// ─── Earnings Surprises ────────────────────────────────────────────
export interface EarningsSurprise {
    quarter: string;
    estimateEps: number;
    actualEps: number;
    surprise: number;
    surprisePercent: number;
    beat: boolean;
}

export interface EarningsData {
    surprises: EarningsSurprise[];
    streak: string;
    nextEarningsDate: string | null;
}

// ─── Peer Comparison ───────────────────────────────────────────────
export interface PeerMetrics {
    ticker: string;
    price: number;
    marketCap: number;
    pe: number;
    eps: number;
    change: number;
}

export interface PeerComparison {
    peers: PeerMetrics[];
    relativeValuation: string;
}

// ─── SEC Filings ───────────────────────────────────────────────────
export interface SECFiling {
    type: string;
    dateFiled: string;
    description: string;
    url: string;
}

// ─── AI Consensus ──────────────────────────────────────────────────
export interface AIConsensus {
    geminiVerdict: string;
    secondaryVerdict: string;
    secondaryModel: string;
    agreementScore: number;
    divergences: string[];
    consensusSummary: string;
}

// ─── Sentiment (Groq) ─────────────────────────────────────────────
export interface SentimentPost {
    title: string;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    theme: string;
}

export interface SentimentResult {
    bullishPercent: number;
    bearishPercent: number;
    neutralPercent: number;
    totalPosts: number;
    posts: SentimentPost[];
    themes: string[];
}

// ─── Risk & Catalysts (Gemini) ─────────────────────────────────────
export interface RiskFactor {
    category: 'regulatory' | 'competitive' | 'macro' | 'company-specific';
    description: string;
    severity: 'high' | 'medium' | 'low';
}

export interface Catalyst {
    description: string;
    timeline: string;
    impact: 'positive' | 'negative' | 'neutral';
}

// ─── Fact Audit (Cohere) ───────────────────────────────────────────
export interface AuditClaim {
    claim: string;
    status: 'grounded' | 'speculative' | 'unverifiable';
    source: string;
}

export interface AuditResult {
    claims: AuditClaim[];
    groundedCount: number;
    speculativeCount: number;
    unverifiableCount: number;
}

// ─── API Contract ──────────────────────────────────────────────────
export interface AnalysisKeys {
    finnhub: string;
    groq: string;
    gemini: string;
    cohere: string;
    cerebras?: string;
}

export interface AnalysisRequest {
    ticker: string;
    keys: AnalysisKeys;
}

export interface AnalysisResponse {
    ticker: string;
    timestamp: string;
    financials: FinancialData;
    sentiment: SentimentResult;
    risks: RiskFactor[];
    catalysts: Catalyst[];
    technicals: TechnicalAnalysis | null;
    insiderActivity: InsiderActivity | null;
    earnings: EarningsData | null;
    peerComparison: PeerComparison | null;
    secFilings: SECFiling[] | null;
    aiConsensus: AIConsensus | null;
    report: string;
    audit: AuditResult | null;
    disclaimer: string;
    isDemo: boolean;
}

// ─── Worker Environment ────────────────────────────────────────────
export interface Env {
    ENVIRONMENT: string;
    ALLOWED_ORIGINS: string;
}
