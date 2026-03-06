import type { AnalysisRequest, AnalysisResponse, AnalysisKeys, Env } from './types';
import { fetchFinancials, fetchTechnicalIndicators, fetchInsiderTrades, fetchEarningsSurprises, fetchPeers, fetchAnalystConsensus, fetchPriceTargets, fetchInstitutionalOwnership } from './finnhub';
import { fetchRedditPosts } from './rss';
import { analyzeSentiment } from './groq';
import { extractRisks, synthesizeReport, generatePremiumInsights } from './gemini';
import { auditReport } from './cohere';
import { fetchSECFilings } from './edgar';
import { generateSecondOpinion } from './cerebras';
import {
    computeInvestmentScore, computeFinancialHealth, computeNipunScore,
    computeMomentum, computeValueGrowth, computeRiskReward,
    computeDividendAnalysis, computeExtendedTechnicals, computeValuationModels,
    computeEarningsQuality,
} from './compute';
import {
    getMockFinancials, getMockSentiment, getMockRisks, getMockCatalysts,
    getMockAudit, getMockReport, getMockTechnicals, getMockInsiderActivity,
    getMockEarnings, getMockPeers, getMockSECFilings, getMockAIConsensus,
    getMockInvestmentScore, getMockFinancialHealth, getMockNipunScore,
    getMockScenarioAnalysis, getMockRevenueBreakdown, getMockMomentum,
    getMockValueGrowth, getMockCompetitiveMoat, getMockRiskReward,
    getMockDividendAnalysis,
} from './mock';

const DISCLAIMER =
    '⚠️ This is not financial advice. This report is for educational and informational purposes only. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.';

// ─── Input Validation ──────────────────────────────────────────────
const TICKER_REGEX = /^[A-Z0-9.]{1,10}$/;

// ─── Rate Limiting (in-memory, per-isolate) ────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return true;
    }
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // ── CORS Preflight ───────────────────────────────────────────
        if (request.method === 'OPTIONS') {
            return handleCORS(request, env, new Response(null, { status: 204 }));
        }

        // ── Health check ─────────────────────────────────────────────
        if (new URL(request.url).pathname === '/health') {
            return handleCORS(
                request,
                env,
                Response.json({ status: 'ok', service: 'nipun-ai-worker', version: '3.0.0' })
            );
        }

        // ── Main analyze endpoint ────────────────────────────────────
        if (request.method === 'POST' && new URL(request.url).pathname === '/analyze') {
            // Rate limiting by IP
            const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
            if (!checkRateLimit(clientIP)) {
                return handleCORS(
                    request,
                    env,
                    Response.json({ error: 'Rate limit exceeded. Maximum 30 requests per hour.' }, { status: 429 })
                );
            }

            try {
                const body = (await request.json()) as { ticker?: string };
                const ticker = body.ticker;

                if (!ticker || typeof ticker !== 'string') {
                    return handleCORS(
                        request,
                        env,
                        Response.json({ error: 'Missing or invalid ticker' }, { status: 400 })
                    );
                }

                const upperTicker = ticker.toUpperCase().trim();

                // Input validation: ticker must be 1-10 alphanumeric chars or dots
                if (!TICKER_REGEX.test(upperTicker)) {
                    return handleCORS(
                        request,
                        env,
                        Response.json({ error: 'Invalid ticker format. Use 1-10 alphanumeric characters (e.g., AAPL, MSFT, BRK.B).' }, { status: 400 })
                    );
                }

                // Extract API keys from header (security: not in body)
                let keys: AnalysisKeys | null = null;
                const keysHeader = request.headers.get('X-Nipun-Keys');
                if (keysHeader) {
                    try {
                        keys = JSON.parse(atob(keysHeader)) as AnalysisKeys;
                    } catch {
                        // Malformed header — treat as demo mode
                        keys = null;
                    }
                }

                // Fallback: check body for backward compatibility
                if (!keys) {
                    const bodyWithKeys = body as { keys?: AnalysisKeys };
                    if (bodyWithKeys.keys) keys = bodyWithKeys.keys;
                }

                // Check if we should use demo mode (any required key missing = demo)
                const isDemo =
                    !keys ||
                    !keys.finnhub ||
                    !keys.groq ||
                    !keys.gemini ||
                    !keys.cohere;

                let result: AnalysisResponse;

                if (isDemo) {
                    result = buildDemoResponse(upperTicker);
                } else {
                    result = await buildLiveResponse(upperTicker, keys!);
                }

                return handleCORS(request, env, Response.json(result));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                console.error('Analysis error:', message);
                return handleCORS(
                    request,
                    env,
                    Response.json({ error: message, disclaimer: DISCLAIMER }, { status: 500 })
                );
            }
        }

        // ── 404 ──────────────────────────────────────────────────────
        return handleCORS(
            request,
            env,
            Response.json({ error: 'Not found. Use POST /analyze' }, { status: 404 })
        );
    },
} satisfies ExportedHandler<Env>;

// ─── Phase Extraction ──────────────────────────────────────────────

function buildDemoResponse(upperTicker: string): AnalysisResponse {
    return {
        ticker: upperTicker,
        timestamp: new Date().toISOString(),
        financials: getMockFinancials(upperTicker),
        sentiment: getMockSentiment(upperTicker),
        risks: getMockRisks(upperTicker),
        catalysts: getMockCatalysts(upperTicker),
        technicals: getMockTechnicals(upperTicker),
        insiderActivity: getMockInsiderActivity(upperTicker),
        earnings: getMockEarnings(upperTicker),
        peerComparison: getMockPeers(upperTicker),
        secFilings: getMockSECFilings(upperTicker),
        aiConsensus: getMockAIConsensus(upperTicker),
        investmentScore: getMockInvestmentScore(upperTicker),
        financialHealth: getMockFinancialHealth(upperTicker),
        nipunScore: getMockNipunScore(upperTicker),
        scenarioAnalysis: getMockScenarioAnalysis(upperTicker),
        revenueBreakdown: getMockRevenueBreakdown(upperTicker),
        momentum: getMockMomentum(upperTicker),
        valueGrowth: getMockValueGrowth(upperTicker),
        competitiveMoat: getMockCompetitiveMoat(upperTicker),
        riskReward: getMockRiskReward(upperTicker),
        dividendAnalysis: getMockDividendAnalysis(upperTicker),
        analystConsensus: null,
        priceTarget: null,
        institutionalOwnership: null,
        extendedTechnicals: null,
        valuationModels: null,
        swotAnalysis: null,
        investmentThesis: null,
        newsHeadlines: null,
        earningsQualityScore: null,
        report: getMockReport(upperTicker),
        audit: getMockAudit(upperTicker),
        disclaimer: DISCLAIMER,
        isDemo: true,
    };
}

async function buildLiveResponse(upperTicker: string, keys: AnalysisKeys): Promise<AnalysisResponse> {
    // ── Phase 1: Data Collection ─────────────────────────────
    const { financials, sentiment, risks, catalysts, newsHeadlines, technicals, candles, insiderActivity, earnings, peers, secFilings, analystConsensus, priceTarget, institutionalOwnership } = await phaseFetchData(upperTicker, keys);

    // ── Phase 2: Compute (ZERO API calls) ────────────────────
    const { investmentScore, financialHealth, momentum, valueGrowth, riskReward, dividendAnalysis, valuationModels, earningsQualityScore, extendedTechnicals, nipunScore } = phaseCompute(financials, technicals, candles, sentiment, risks, insiderActivity, earnings);

    // ── Phase 3: AI Synthesis (parallel Gemini calls) ────────
    const { report, premiumInsights } = await phaseAISynth(financials, sentiment, risks, catalysts, keys, upperTicker);

    // ── Phase 4: Secondary AI opinions (parallel, non-fatal) ─
    const { aiConsensus, audit } = await phaseSecondaryAI(financials, sentiment, risks, catalysts, report, keys);

    return {
        ticker: upperTicker,
        timestamp: new Date().toISOString(),
        financials,
        sentiment,
        risks,
        catalysts,
        technicals,
        insiderActivity,
        earnings,
        peerComparison: peers,
        secFilings,
        aiConsensus,
        investmentScore,
        financialHealth,
        nipunScore,
        scenarioAnalysis: premiumInsights?.scenarioAnalysis ?? getMockScenarioAnalysis(upperTicker),
        revenueBreakdown: premiumInsights?.revenueBreakdown ?? getMockRevenueBreakdown(upperTicker),
        momentum,
        valueGrowth,
        competitiveMoat: premiumInsights?.competitiveMoat ?? getMockCompetitiveMoat(upperTicker),
        riskReward,
        dividendAnalysis,
        analystConsensus,
        priceTarget,
        institutionalOwnership,
        extendedTechnicals,
        valuationModels,
        swotAnalysis: premiumInsights?.swotAnalysis ?? null,
        investmentThesis: premiumInsights?.investmentThesis ?? null,
        newsHeadlines,
        earningsQualityScore,
        report,
        audit,
        disclaimer: DISCLAIMER,
        isDemo: false,
    };
}

/** Phase 1: Fetch all external data in parallel */
async function phaseFetchData(upperTicker: string, keys: AnalysisKeys) {
    // Phase 1a: Core Financials (Finnhub)
    let financials;
    try {
        financials = await fetchFinancials(upperTicker, keys.finnhub);
    } catch (err) {
        console.error('Finnhub financials failed, using mock:', err);
        financials = getMockFinancials(upperTicker);
    }

    // Phase 1b: Parallel data collection (all independent)
    const [
        sentimentResult, risksResult, technicalsResult,
        insiderActivity, earnings, peers, secFilings,
        analystConsensus, priceTarget, institutionalOwnership
    ] = await Promise.all([
        (async () => {
            try {
                const posts = await fetchRedditPosts(upperTicker);
                return await analyzeSentiment(upperTicker, posts, keys.groq);
            } catch (err) {
                console.error('Sentiment failed, using mock:', err);
                return getMockSentiment(upperTicker);
            }
        })(),
        (async () => {
            try {
                return await extractRisks(upperTicker, keys.gemini);
            } catch (err) {
                console.error('Gemini risks failed, using mock:', err);
                return { risks: getMockRisks(upperTicker), catalysts: getMockCatalysts(upperTicker), newsHeadlines: [] };
            }
        })(),
        (async () => {
            try {
                return await fetchTechnicalIndicators(upperTicker, keys.finnhub);
            } catch (err) {
                console.error('Technical indicators failed, using mock:', err);
                return { ...getMockTechnicals(upperTicker), _candles: null as { closes: number[]; highs: number[]; lows: number[] } | null };
            }
        })(),
        (async () => {
            try { return await fetchInsiderTrades(upperTicker, keys.finnhub); }
            catch (err) { console.error('Insider trades failed, using mock:', err); return getMockInsiderActivity(upperTicker); }
        })(),
        (async () => {
            try { return await fetchEarningsSurprises(upperTicker, keys.finnhub); }
            catch (err) { console.error('Earnings failed, using mock:', err); return getMockEarnings(upperTicker); }
        })(),
        (async () => {
            try { return await fetchPeers(upperTicker, keys.finnhub); }
            catch (err) { console.error('Peers failed, using mock:', err); return getMockPeers(upperTicker); }
        })(),
        (async () => {
            try { return await fetchSECFilings(upperTicker); }
            catch (err) { console.error('SEC filings failed:', err); return getMockSECFilings(upperTicker); }
        })(),
        (async () => {
            try { return await fetchAnalystConsensus(upperTicker, keys.finnhub); }
            catch { return null; }
        })(),
        (async () => {
            try { return await fetchPriceTargets(upperTicker, keys.finnhub, financials.price); }
            catch { return null; }
        })(),
        (async () => {
            try { return await fetchInstitutionalOwnership(upperTicker, keys.finnhub); }
            catch { return null; }
        })(),
    ]);

    const candles = technicalsResult._candles;
    const technicals = {
        rsi: technicalsResult.rsi,
        macd: technicalsResult.macd,
        sma50: technicalsResult.sma50,
        sma200: technicalsResult.sma200,
        overallSignal: technicalsResult.overallSignal,
        goldenDeathCross: technicalsResult.goldenDeathCross,
    };

    return {
        financials,
        sentiment: sentimentResult,
        risks: risksResult.risks,
        catalysts: risksResult.catalysts,
        newsHeadlines: risksResult.newsHeadlines,
        technicals,
        candles,
        insiderActivity,
        earnings,
        peers,
        secFilings,
        analystConsensus,
        priceTarget,
        institutionalOwnership,
    };
}

/** Phase 2: Compute all derived metrics (ZERO API calls) */
function phaseCompute(
    financials: ReturnType<typeof getMockFinancials>,
    technicals: { rsi: any; macd: any; sma50: any; sma200: any; overallSignal: any; goldenDeathCross: any },
    candles: { closes: number[]; highs: number[]; lows: number[] } | null,
    sentiment: ReturnType<typeof getMockSentiment>,
    risks: ReturnType<typeof getMockRisks>,
    insiderActivity: any,
    earnings: any,
) {
    const investmentScore = computeInvestmentScore(financials, technicals, sentiment, risks, insiderActivity, earnings);
    const financialHealth = computeFinancialHealth(financials, candles?.closes ?? null);
    const momentum = computeMomentum(candles?.closes ?? null, financials);
    const valueGrowth = computeValueGrowth(financials);
    const riskReward = computeRiskReward(financials, candles?.closes ?? null);
    const dividendAnalysis = computeDividendAnalysis(financials);
    const valuationModels = computeValuationModels(financials);
    const earningsQualityScore = computeEarningsQuality(earnings);

    let extendedTechnicals = null;
    if (candles && candles.closes.length >= 30) {
        try {
            extendedTechnicals = computeExtendedTechnicals(candles.closes, candles.highs, candles.lows);
        } catch (err) {
            console.error('Extended technicals computation failed:', err);
        }
    }

    const nipunScore = computeNipunScore(investmentScore, financialHealth, technicals, sentiment, earnings);

    return { investmentScore, financialHealth, momentum, valueGrowth, riskReward, dividendAnalysis, valuationModels, earningsQualityScore, extendedTechnicals, nipunScore };
}

/** Phase 3: AI Synthesis (parallel Gemini calls) */
async function phaseAISynth(financials: any, sentiment: any, risks: any, catalysts: any, keys: AnalysisKeys, upperTicker: string) {
    const [report, premiumInsights] = await Promise.all([
        (async () => {
            try { return await synthesizeReport(financials, sentiment, risks, catalysts, keys.gemini); }
            catch (err) { console.error('Gemini synthesis failed, using mock:', err); return getMockReport(upperTicker); }
        })(),
        (async () => {
            try { return await generatePremiumInsights(financials, sentiment, risks, catalysts, keys.gemini); }
            catch (err) { console.error('Premium insights failed (non-fatal):', err); return null; }
        })(),
    ]);
    return { report, premiumInsights };
}

/** Phase 4: Secondary AI opinions (parallel, non-fatal) */
async function phaseSecondaryAI(financials: any, sentiment: any, risks: any, catalysts: any, report: string, keys: AnalysisKeys) {
    const [aiConsensus, audit] = await Promise.all([
        (async () => {
            if (keys.cerebras) {
                try { return await generateSecondOpinion(financials, sentiment, risks, catalysts, report, keys.cerebras); }
                catch (err) { console.error('Cerebras consensus failed (non-fatal):', err); return null; }
            }
            return null;
        })(),
        (async () => {
            try { return await auditReport(report, financials, keys.cohere); }
            catch (err) { console.error('Cohere audit failed (non-fatal):', err); return null; }
        })(),
    ]);
    return { aiConsensus, audit };
}

// ─── CORS Helper (with wildcard pattern support + CSP headers) ─────
function handleCORS(request: Request, env: Env, response: Response): Response {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());

    // Support wildcard subdomains: *.nipun-ai.pages.dev
    const isAllowed = allowed.includes(origin) ||
        allowed.includes('*') ||
        /^https:\/\/[a-z0-9-]+\.nipun-ai\.pages\.dev$/.test(origin);

    const corsOrigin = isAllowed ? origin : allowed[0] || '*';

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', corsOrigin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Nipun-Keys');
    headers.set('Access-Control-Max-Age', '86400');

    // Security headers
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}
