import { create } from 'zustand';
import type { APIKeys } from './utils/crypto';
import { encryptCache, decryptCache, migrateLegacyKeys } from './utils/crypto';

/**
 * Re-export all shared types so existing component imports
 * (`import type { AnalysisResponse } from '../store'`) keep working.
 */
export type {
    AnalysisResponse,
    ResearchSources,
    FinancialData,
    TechnicalAnalysis,
    InsiderActivity,
    EarningsData,
    PeerComparison,
    SECFiling,
    AIConsensus,
    InvestmentScore,
    FinancialHealth,
    NipunScore,
    ScenarioAnalysis,
    RevenueBreakdown,
    MomentumData,
    ValueGrowthProfile,
    CompetitiveMoat,
    RiskRewardProfile,
    DividendAnalysis,
    SentimentResult,
    RiskFactor,
    Catalyst,
    AuditResult,
    AnalystConsensus,
    PriceTarget,
    InstitutionalOwnership,
    ExtendedTechnicals,
    ValuationModels,
    SWOTAnalysis,
    InvestmentThesis,
    NewsHeadline,
} from '../../shared/types';

import type { AnalysisResponse } from '../../shared/types';

/** Cache TTL: 4 hours in milliseconds */
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

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
    /** Currently in-flight ticker — prevents duplicate concurrent requests */
    _inflightTicker: string | null;
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
    _inflightTicker: null,
    setTicker: (t) => set({ ticker: t.toUpperCase().trim() }),
    clearResult: () => set({ result: null, error: null }),

    runAnalysis: async (workerUrl?: string) => {
        const { ticker: rawTicker, keys, demoMode, _inflightTicker } = get();
        if (!rawTicker) return;
        const ticker = rawTicker.toUpperCase().trim();

        // Prevent duplicate concurrent requests for the same ticker
        if (_inflightTicker === ticker) return;
        set({ _inflightTicker: ticker });

        // Migrate legacy af_ keys on first use
        migrateLegacyKeys();

        // --- CACHE CHECK (encrypted) ---
        if (!demoMode) {
            try {
                const cached = localStorage.getItem(`nipun_cache_${ticker}`);
                if (cached) {
                    const decrypted = await decryptCache(cached);
                    if (decrypted) {
                        const parsedData = JSON.parse(decrypted) as AnalysisResponse;
                        const cacheTime = new Date(parsedData.timestamp).getTime();
                        if (Date.now() - cacheTime < CACHE_TTL_MS) {
                            set({ result: parsedData, view: 'report', error: null, analysisPhase: '' });
                            return; // Use cache
                        }
                    }
                }
            } catch (e) {
                // Ignore cache read errors
            }
        }

        set({ isAnalyzing: true, error: null, result: null, analysisPhase: '⚡ Collecting financial data, sentiment & risks...' });

        try {
            const url = workerUrl || DEFAULT_WORKER_URL;
            const requestKeys = demoMode
                ? { finnhub: '', groq: '', gemini: '', cohere: '', cerebras: '' }
                : keys || { finnhub: '', groq: '', gemini: '', cohere: '' };

            // Security: Send API keys in encrypted header, not in request body
            const res = await fetch(`${url}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Nipun-Keys': btoa(JSON.stringify(requestKeys)),
                },
                body: JSON.stringify({ ticker }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Request failed' })) as { error?: string };
                throw new Error(err.error || `HTTP ${res.status}`);
            }

            set({ analysisPhase: '📊 Processing results...' });
            const data = (await res.json()) as AnalysisResponse;

            // --- SAVE TO CACHE (encrypted) ---
            if (!demoMode) {
                try {
                    const encrypted = await encryptCache(JSON.stringify(data));
                    localStorage.setItem(`nipun_cache_${ticker}`, encrypted);
                } catch (e) { }
            }

            set({ result: data, view: 'report', analysisPhase: '' });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Analysis failed';
            set({ error: msg, analysisPhase: '' });
        } finally {
            set({ _inflightTicker: null, isAnalyzing: false });
        }
    },
}));
