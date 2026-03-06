/**
 * ─── Shared Types ─────────────────────────────────────────────────
 * Single source of truth for all data-model interfaces used by both
 * the Cloudflare Worker (API) and the React frontend.
 *
 * NOTE: Only the `Env` interface (Cloudflare bindings) lives exclusively
 * in worker/src/types.ts; everything else is defined here.
 */

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

// ─── Investment Score ──────────────────────────────────────────────
export interface InvestmentScore {
    overall: number;
    signal: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    breakdown: {
        technicalScore: number;
        fundamentalScore: number;
        sentimentScore: number;
        riskScore: number;
        insiderScore: number;
    };
    summary: string;
}

// ─── Financial Health ──────────────────────────────────────────────
export interface FinancialHealth {
    altmanZScore: number;
    altmanZone: 'safe' | 'grey' | 'distress';
    piotroskiFScore: number;
    piotroskiRating: 'strong' | 'moderate' | 'weak';
    currentRatio: number;
    quickRatio: number;
    interestCoverage: number;
    pricePositionPercent: number;
    volatilityCategory: 'low' | 'moderate' | 'high';
    healthSummary: string;
}

// ─── Nipun Score™ (Letter Grade) ───────────────────────────────────
export interface NipunScore {
    grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
    numericScore: number;      // 0-100
    confidence: number;        // 0-100
    verdict: string;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
}

// ─── Scenario Analysis ─────────────────────────────────────────────
export interface ScenarioTarget {
    label: string;
    price: number;
    upside: number;            // % from current
    probability: number;       // %
    rationale: string;
}

export interface ScenarioAnalysis {
    bull: ScenarioTarget;
    base: ScenarioTarget;
    bear: ScenarioTarget;
    timeHorizon: string;
    methodology: string;
}

// ─── Revenue Breakdown ─────────────────────────────────────────────
export interface RevenueSegment {
    name: string;
    revenue: number;
    percent: number;
    growth: number;            // YoY %
}

export interface RevenueBreakdown {
    segments: RevenueSegment[];
    totalRevenue: number;
    revenueGrowth: number;
    summary: string;
}

// ─── Momentum Score ────────────────────────────────────────────────
export interface MomentumData {
    score: number;             // 0-100
    trend: 'strong-up' | 'up' | 'flat' | 'down' | 'strong-down';
    shortTerm: { period: string; performance: number };
    mediumTerm: { period: string; performance: number };
    longTerm: { period: string; performance: number };
    relativeStrength: number;  // vs S&P 500
    interpretation: string;
}

// ─── Value vs Growth ───────────────────────────────────────────────
export interface ValueGrowthProfile {
    classification: 'Deep Value' | 'Value' | 'Blend' | 'Growth' | 'High Growth';
    valueScore: number;        // 0-100
    growthScore: number;       // 0-100
    metrics: {
        pegRatio: number;
        priceToBook: number;
        priceToSales: number;
        epsGrowth5Y: number;
        revenueGrowth5Y: number;
    };
    interpretation: string;
}

// ─── Competitive Moat ──────────────────────────────────────────────
export interface CompetitiveMoat {
    rating: 'Wide' | 'Narrow' | 'None';
    score: number;             // 0-100
    sources: { name: string; strength: 'strong' | 'moderate' | 'weak'; description: string }[];
    durability: 'high' | 'medium' | 'low';
    interpretation: string;
}

// ─── Risk-Reward ───────────────────────────────────────────────────
export interface RiskRewardProfile {
    riskLevel: number;         // 1-10
    rewardPotential: number;   // 1-10
    ratio: number;             // reward/risk
    rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    maxDrawdownEstimate: number; // % potential loss
    upsidePotential: number;  // % potential gain
    interpretation: string;
}

// ─── Dividend Deep Dive ────────────────────────────────────────────
export interface DividendAnalysis {
    yield: number;
    annualDividend: number;
    payoutRatio: number;
    growthRate5Y: number;      // 5-year CAGR
    yearsOfGrowth: number;
    exDividendDate: string | null;
    frequency: 'quarterly' | 'monthly' | 'annually' | 'semi-annually';
    safety: 'very-safe' | 'safe' | 'moderate' | 'at-risk';
    interpretation: string;
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

// ─── Analyst Consensus (Finnhub) ───────────────────────────────────
export interface AnalystConsensus {
    buy: number;
    hold: number;
    sell: number;
    strongBuy: number;
    strongSell: number;
    consensusRating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    period: string;
}

// ─── Price Targets (Finnhub) ───────────────────────────────────────
export interface PriceTarget {
    targetHigh: number;
    targetLow: number;
    targetMean: number;
    targetMedian: number;
    numberOfAnalysts: number;
    currentPrice: number;
    upsidePercent: number;
}

// ─── Institutional Ownership (Finnhub) ────────────────────────────
export interface InstitutionalHolder {
    name: string;
    shares: number;
    value: number;
    changePercent: number;
}

export interface InstitutionalOwnership {
    totalOwnership: number;
    holders: InstitutionalHolder[];
    totalHolders: number;
}

// ─── SWOT Analysis (AI) ───────────────────────────────────────────
export interface SWOTAnalysis {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

// ─── Valuation Models (Computed) ──────────────────────────────────
export interface ValuationEstimate {
    value: number;
    upside: number;
    methodology: string;
}

export interface ValuationModels {
    dcf: ValuationEstimate;
    graham: ValuationEstimate;
    lynch: ValuationEstimate;
    consensus: { value: number; upside: number };
}

// ─── Extended Technicals (Computed) ───────────────────────────────
export interface ExtendedTechnicals {
    bollingerBands: {
        upper: number; middle: number; lower: number;
        bandwidth: number; signal: 'overbought' | 'oversold' | 'neutral';
    };
    stochastic: { k: number; d: number; signal: 'overbought' | 'oversold' | 'neutral' };
    atr: number;
    supportResistance: {
        resistance2: number; resistance1: number; pivot: number;
        support1: number; support2: number;
    };
    fibonacci: {
        level236: number; level382: number; level500: number;
        level618: number; level786: number;
    };
    historicalVolatility: number;
    vwap: number;
}

// ─── Investment Thesis (AI) ───────────────────────────────────────
export interface InvestmentThesis {
    summary: string;
    bullCase: string;
    bearCase: string;
}

// ─── News Headlines ───────────────────────────────────────────────
export interface NewsHeadline {
    title: string;
    source: string;
    date: string;
}

// ─── Research Sources (50+ links to primary data) ─────────────────
export interface ResearchSourceLink {
    label: string;
    url: string;
}

export interface ResearchSources {
    financialData: ResearchSourceLink[];
    technicalAnalysis: ResearchSourceLink[];
    secFilings: ResearchSourceLink[];
    financialStatements: ResearchSourceLink[];
    companyResearch: ResearchSourceLink[];
    newsSentiment: ResearchSourceLink[];
    analystData: ResearchSourceLink[];
    valuationReferences: ResearchSourceLink[];
    earningsDividends: ResearchSourceLink[];
    riskCompliance: ResearchSourceLink[];
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
    investmentScore: InvestmentScore | null;
    financialHealth: FinancialHealth | null;
    nipunScore: NipunScore | null;
    scenarioAnalysis: ScenarioAnalysis | null;
    revenueBreakdown: RevenueBreakdown | null;
    momentum: MomentumData | null;
    valueGrowth: ValueGrowthProfile | null;
    competitiveMoat: CompetitiveMoat | null;
    riskReward: RiskRewardProfile | null;
    dividendAnalysis: DividendAnalysis | null;
    analystConsensus: AnalystConsensus | null;
    priceTarget: PriceTarget | null;
    institutionalOwnership: InstitutionalOwnership | null;
    extendedTechnicals: ExtendedTechnicals | null;
    valuationModels: ValuationModels | null;
    swotAnalysis: SWOTAnalysis | null;
    investmentThesis: InvestmentThesis | null;
    newsHeadlines: NewsHeadline[] | null;
    earningsQualityScore: number | null;
    researchSources: ResearchSources;
    report: string;
    audit: AuditResult | null;
    disclaimer: string;
    isDemo: boolean;
    /** Present when hosted instance is in demo-only mode and user supplied API keys */
    hostedDemoNotice?: string;
}
