/**
 * ─── Store Tests ──────────────────────────────────────────────────
 * Tests for Zustand state management and analysis orchestration.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useStore } from '../store';
import type { AnalysisResponse } from '../store';

// Minimal mock response that satisfies the type checker
const mockResponse: AnalysisResponse = {
    ticker: 'AAPL',
    timestamp: new Date().toISOString(),
    financials: {
        ticker: 'AAPL', companyName: 'Apple Inc.', price: 178.72, change: 2.35,
        changePercent: 1.33, open: 176.15, high: 179.2, low: 175.82,
        previousClose: 176.37, volume: 52438100, marketCap: 2780000,
        pe: 28.52, eps: 6.27, beta: 1.24, weekHigh52: 199.62, weekLow52: 164.08,
        revenue: 383290000000, grossMargin: 45.96, debtToEquity: 1.87,
        dividendYield: 0.55, sector: 'Technology',
    },
    sentiment: {
        bullishPercent: 60, bearishPercent: 25, neutralPercent: 15,
        totalPosts: 50, posts: [], themes: ['growth'],
    },
    risks: [],
    catalysts: [],
    technicals: null,
    insiderActivity: null,
    earnings: null,
    peerComparison: null,
    secFilings: null,
    aiConsensus: null,
    investmentScore: null,
    financialHealth: null,
    nipunScore: null,
    scenarioAnalysis: null,
    revenueBreakdown: null,
    momentum: null,
    valueGrowth: null,
    competitiveMoat: null,
    riskReward: null,
    dividendAnalysis: null,
    analystConsensus: null,
    priceTarget: null,
    institutionalOwnership: null,
    extendedTechnicals: null,
    valuationModels: null,
    swotAnalysis: null,
    investmentThesis: null,
    newsHeadlines: null,
    earningsQualityScore: null,
    researchSources: {
        financialData: [], technicalAnalysis: [], secFilings: [],
        financialStatements: [], companyResearch: [], newsSentiment: [],
        analystData: [], valuationReferences: [], earningsDividends: [],
        riskCompliance: [],
    },
    report: 'Mock report text',
    audit: null,
    disclaimer: 'Not financial advice.',
    isDemo: true,
};

describe('store – basic state', () => {
    beforeEach(() => {
        useStore.setState({
            view: 'setup',
            ticker: '',
            result: null,
            error: null,
            isAnalyzing: false,
            analysisPhase: '',
            demoMode: false,
            keys: null,
            _inflightTicker: null,
        });
    });

    it('setTicker uppercases and trims', () => {
        useStore.getState().setTicker('  aapl  ');
        expect(useStore.getState().ticker).toBe('AAPL');
    });

    it('setView changes view state', () => {
        useStore.getState().setView('analysis');
        expect(useStore.getState().view).toBe('analysis');
    });

    it('clearResult resets result and error', () => {
        useStore.setState({ result: mockResponse, error: 'some error' });
        useStore.getState().clearResult();
        expect(useStore.getState().result).toBeNull();
        expect(useStore.getState().error).toBeNull();
    });

    it('setKeys stores API keys', () => {
        const keys = { finnhub: 'fk', groq: 'gk', gemini: 'gem', cohere: 'co' };
        useStore.getState().setKeys(keys);
        expect(useStore.getState().keys).toEqual(keys);
    });

    it('setDemoMode toggles demo mode', () => {
        useStore.getState().setDemoMode(true);
        expect(useStore.getState().demoMode).toBe(true);
        useStore.getState().setDemoMode(false);
        expect(useStore.getState().demoMode).toBe(false);
    });
});

describe('store – runAnalysis', () => {
    beforeEach(() => {
        localStorage.clear();
        useStore.setState({
            view: 'setup',
            ticker: 'AAPL',
            result: null,
            error: null,
            isAnalyzing: false,
            analysisPhase: '',
            demoMode: true,
            keys: null,
            _inflightTicker: null,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('sets result and view on successful analysis', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse),
        });
        vi.stubGlobal('fetch', fetchMock);

        await useStore.getState().runAnalysis('http://localhost:8787');

        expect(useStore.getState().result).toEqual(mockResponse);
        expect(useStore.getState().view).toBe('report');
        expect(useStore.getState().isAnalyzing).toBe(false);
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it('sets error on failed fetch', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
        }));

        await useStore.getState().runAnalysis('http://localhost:8787');

        expect(useStore.getState().error).toBe('Rate limit exceeded');
        expect(useStore.getState().result).toBeNull();
        expect(useStore.getState().isAnalyzing).toBe(false);
    });

    it('prevents duplicate concurrent requests', async () => {
        const fetchMock = vi.fn().mockImplementation(
            () => new Promise((resolve) =>
                setTimeout(() => resolve({ ok: true, json: () => Promise.resolve(mockResponse) }), 100)
            )
        );
        vi.stubGlobal('fetch', fetchMock);

        // Start two concurrent requests for the same ticker
        const p1 = useStore.getState().runAnalysis('http://localhost:8787');
        const p2 = useStore.getState().runAnalysis('http://localhost:8787');
        await Promise.all([p1, p2]);

        // Should only have made ONE fetch call (second was deduplicated)
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it('skips analysis when ticker is empty', async () => {
        useStore.setState({ ticker: '' });
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        await useStore.getState().runAnalysis('http://localhost:8787');

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('sends API keys in X-Nipun-Keys header', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse),
        });
        vi.stubGlobal('fetch', fetchMock);

        await useStore.getState().runAnalysis('http://localhost:8787');

        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('http://localhost:8787/analyze');
        expect(options.method).toBe('POST');
        expect(options.headers['X-Nipun-Keys']).toBeDefined();
    });
});
