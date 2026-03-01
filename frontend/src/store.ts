import { create } from 'zustand';
import type { APIKeys } from './utils/crypto';

// ─── Types matching the Worker response ────────────────────────────
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

export interface SECFiling {
    type: string;
    dateFiled: string;
    description: string;
    url: string;
}

export interface AIConsensus {
    geminiVerdict: string;
    secondaryVerdict: string;
    secondaryModel: string;
    agreementScore: number;
    divergences: string[];
    consensusSummary: string;
}

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

export interface NipunScore {
    grade: string;
    numericScore: number;
    confidence: number;
    verdict: string;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
}

export interface ScenarioTarget {
    label: string;
    price: number;
    upside: number;
    probability: number;
    rationale: string;
}

export interface ScenarioAnalysis {
    bull: ScenarioTarget;
    base: ScenarioTarget;
    bear: ScenarioTarget;
    timeHorizon: string;
    methodology: string;
}

export interface RevenueSegment {
    name: string;
    revenue: number;
    percent: number;
    growth: number;
}

export interface RevenueBreakdown {
    segments: RevenueSegment[];
    totalRevenue: number;
    revenueGrowth: number;
    summary: string;
}

export interface MomentumData {
    score: number;
    trend: string;
    shortTerm: { period: string; performance: number };
    mediumTerm: { period: string; performance: number };
    longTerm: { period: string; performance: number };
    relativeStrength: number;
    interpretation: string;
}

export interface ValueGrowthProfile {
    classification: string;
    valueScore: number;
    growthScore: number;
    metrics: {
        pegRatio: number;
        priceToBook: number;
        priceToSales: number;
        epsGrowth5Y: number;
        revenueGrowth5Y: number;
    };
    interpretation: string;
}

export interface CompetitiveMoat {
    rating: string;
    score: number;
    sources: { name: string; strength: string; description: string }[];
    durability: string;
    interpretation: string;
}

export interface RiskRewardProfile {
    riskLevel: number;
    rewardPotential: number;
    ratio: number;
    rating: string;
    maxDrawdownEstimate: number;
    upsidePotential: number;
    interpretation: string;
}

export interface DividendAnalysis {
    yield: number;
    annualDividend: number;
    payoutRatio: number;
    growthRate5Y: number;
    yearsOfGrowth: number;
    exDividendDate: string | null;
    frequency: string;
    safety: string;
    interpretation: string;
}

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

export interface RiskFactor {
    category: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
}

export interface Catalyst {
    description: string;
    timeline: string;
    impact: 'positive' | 'negative' | 'neutral';
}

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
    report: string;
    audit: AuditResult | null;
    disclaimer: string;
    isDemo: boolean;
}

// ─── App State ─────────────────────────────────────────────────────
type AppView = 'setup' | 'analysis' | 'report';

interface AppState {
    view: AppView;
    setView: (v: AppView) => void;
    keys: APIKeys | null;
    demoMode: boolean;
    setKeys: (k: APIKeys | null) => void;
    setDemoMode: (d: boolean) => void;
    ticker: string;
    isAnalyzing: boolean;
    analysisPhase: string;
    result: AnalysisResponse | null;
    error: string | null;
    setTicker: (t: string) => void;
    runAnalysis: (workerUrl?: string) => Promise<void>;
    clearResult: () => void;
}

const DEFAULT_WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

export const useStore = create<AppState>((set, get) => ({
    view: 'setup',
    setView: (v) => set({ view: v }),
    keys: null,
    demoMode: false,
    setKeys: (k) => set({ keys: k }),
    setDemoMode: (d) => set({ demoMode: d }),
    ticker: '',
    isAnalyzing: false,
    analysisPhase: '',
    result: null,
    error: null,
    setTicker: (t) => set({ ticker: t }),
    clearResult: () => set({ result: null, error: null }),

    runAnalysis: async (workerUrl?: string) => {
        const { ticker, keys, demoMode } = get();
        if (!ticker) return;

        set({ isAnalyzing: true, error: null, result: null, analysisPhase: '⚡ Collecting financial data, sentiment & risks...' });

        try {
            const url = workerUrl || DEFAULT_WORKER_URL;
            const requestKeys = demoMode
                ? { finnhub: '', groq: '', gemini: '', cohere: '', cerebras: '' }
                : keys || { finnhub: '', groq: '', gemini: '', cohere: '' };

            const res = await fetch(`${url}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker, keys: requestKeys }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Request failed' })) as { error?: string };
                throw new Error(err.error || `HTTP ${res.status}`);
            }

            set({ analysisPhase: '📊 Processing results...' });
            const data = (await res.json()) as AnalysisResponse;

            set({ result: data, view: 'report', analysisPhase: '' });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Analysis failed';
            set({ error: msg, analysisPhase: '' });
        } finally {
            set({ isAnalyzing: false });
        }
    },
}));
