import type { AnalysisResponse, AnalysisKeys, Env, FinancialData, TechnicalAnalysis, SentimentResult, RiskFactor, Catalyst, InsiderActivity, EarningsData, BalanceSheetData } from './types';
import { fetchFinancials, fetchTechnicalIndicators, fetchInsiderTrades, fetchEarningsSurprises, fetchPeers, fetchAnalystConsensus, fetchPriceTargets, fetchInstitutionalOwnership, fetchBalanceSheet } from './finnhub';
import { fetchRedditPosts } from './rss';
import { analyzeSentiment } from './groq';
import { extractRisks, synthesizeReport, generatePremiumInsights } from './gemini';
import { auditReport } from './cohere';
import { fetchSECFilings } from './edgar';
import { generateSecondOpinion } from './cerebras';
import { buildResearchSources } from './sources';
import { logger } from './logger';
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
                let body: { ticker?: string };
                try {
                    body = (await request.json()) as { ticker?: string };
                } catch {
                    return handleCORS(
                        request,
                        env,
                        Response.json({ error: 'Invalid JSON body. Send { "ticker": "AAPL" }' }, { status: 400 })
                    );
                }
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

                // Extract API keys from header (security: keys must be in X-Nipun-Keys header, not body)
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

                // Check if hosted instance is demo-only (set DEMO_ONLY=true in YOUR Cloudflare dashboard)
                const forceDemoOnly = env.DEMO_ONLY === 'true';

                // Check if we should use demo mode (any required key missing = demo)
                const isDemo =
                    forceDemoOnly ||
                    !keys ||
                    !keys.finnhub ||
                    !keys.groq ||
                    !keys.gemini ||
                    !keys.cohere;

                let result: AnalysisResponse;

                if (isDemo) {
                    result = buildDemoResponse(upperTicker);
                    if (forceDemoOnly && keys && keys.finnhub) {
                        // User supplied keys but we're in demo-only mode — tell them to self-host
                        result.hostedDemoNotice = '🏠 This hosted instance runs in demo mode only to keep it free. For live data, deploy your own instance in 5 minutes — it\'s free! See github.com/myProjectsRavi/Nipun-AI';
                    }
                } else {
                    result = await buildLiveResponse(upperTicker, keys!, env.SEC_API_EMAIL);
                }

                return handleCORS(request, env, Response.json(result));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                logger.error('handler', 'Analysis failed', err);
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
    const mockFilings = getMockSECFilings(upperTicker);
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
        secFilings: mockFilings,
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
        researchSources: buildResearchSources(upperTicker, null, mockFilings),
        report: getMockReport(upperTicker),
        audit: getMockAudit(upperTicker),
        disclaimer: DISCLAIMER,
        isDemo: true,
    };
}

async function buildLiveResponse(upperTicker: string, keys: AnalysisKeys, secEmail?: string): Promise<AnalysisResponse> {
    // ── Phase 1: Data Collection ─────────────────────────────
    const { financials, sentiment, risks, catalysts, newsHeadlines, technicals, candles, insiderActivity, earnings, peers, secFilings, secCik, analystConsensus, priceTarget, institutionalOwnership, balanceSheet, fallbacks: phase1Fallbacks } = await phaseFetchData(upperTicker, keys, secEmail);

    // ── Phase 2: Compute (ZERO API calls) ────────────────────
    const { investmentScore, financialHealth, momentum, valueGrowth, riskReward, dividendAnalysis, valuationModels, earningsQualityScore, extendedTechnicals, nipunScore } = phaseCompute(financials, technicals, candles, sentiment, risks, insiderActivity, earnings, balanceSheet);

    // ── Phase 3: AI Synthesis (parallel Gemini calls) ────────
    const { report, premiumInsights, fallbacks: phase3Fallbacks } = await phaseAISynth(financials, sentiment, risks, catalysts, keys, upperTicker);

    // ── Phase 4: Secondary AI opinions (parallel, non-fatal) ─
    const { aiConsensus, audit, fallbacks: phase4Fallbacks } = await phaseSecondaryAI(financials, sentiment, risks, catalysts, report, keys);

    // Collect all fallbacks
    const allFallbacks = [...phase1Fallbacks, ...phase3Fallbacks, ...phase4Fallbacks];

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
        researchSources: buildResearchSources(upperTicker, secCik, secFilings),
        report,
        audit,
        disclaimer: DISCLAIMER,
        isDemo: false,
        fallbacks: allFallbacks.length > 0 ? allFallbacks : undefined,
    };
}

/** Phase 1: Fetch all external data in parallel */
async function phaseFetchData(upperTicker: string, keys: AnalysisKeys, secEmail?: string) {
    const fallbacks: string[] = [];

    // Phase 1a: Core Financials (Finnhub)
    let financials;
    try {
        financials = await fetchFinancials(upperTicker, keys.finnhub);
    } catch (err) {
        logger.error('phase1', 'Finnhub financials failed, using mock', err, { ticker: upperTicker });
        financials = getMockFinancials(upperTicker);
        fallbacks.push('Financial data (Finnhub)');
    }

    // Phase 1b: Parallel data collection (all independent)
    const [
        sentimentResult, risksResult, technicalsResult,
        insiderActivity, earnings, peers, secFilingsResult,
        analystConsensus, priceTarget, institutionalOwnership,
        balanceSheet
    ] = await Promise.all([
        (async () => {
            try {
                const posts = await fetchRedditPosts(upperTicker);
                return await analyzeSentiment(upperTicker, posts, keys.groq);
            } catch (err) {
                logger.error('phase1', 'Sentiment analysis failed, using mock', err, { ticker: upperTicker });
                fallbacks.push('Sentiment analysis (Groq)');
                return getMockSentiment(upperTicker);
            }
        })(),
        (async () => {
            try {
                return await extractRisks(upperTicker, keys.gemini);
            } catch (err) {
                logger.error('phase1', 'Gemini risks failed, using mock', err, { ticker: upperTicker });
                fallbacks.push('Risk analysis (Gemini)');
                return { risks: getMockRisks(upperTicker), catalysts: getMockCatalysts(upperTicker), newsHeadlines: [] };
            }
        })(),
        (async () => {
            try {
                return await fetchTechnicalIndicators(upperTicker, keys.finnhub);
            } catch (err) {
                logger.error('phase1', 'Technical indicators failed, using mock', err, { ticker: upperTicker });
                fallbacks.push('Technical indicators');
                return { ...getMockTechnicals(upperTicker), _candles: null as { closes: number[]; highs: number[]; lows: number[] } | null };
            }
        })(),
        (async () => {
            try { return await fetchInsiderTrades(upperTicker, keys.finnhub); }
            catch (err) { logger.error('phase1', 'Insider trades failed, using mock', err); fallbacks.push('Insider trades'); return getMockInsiderActivity(upperTicker); }
        })(),
        (async () => {
            try { return await fetchEarningsSurprises(upperTicker, keys.finnhub); }
            catch (err) { logger.error('phase1', 'Earnings failed, using mock', err); fallbacks.push('Earnings data'); return getMockEarnings(upperTicker); }
        })(),
        (async () => {
            try { return await fetchPeers(upperTicker, keys.finnhub); }
            catch (err) { logger.error('phase1', 'Peers failed, using mock', err); fallbacks.push('Peer comparison'); return getMockPeers(upperTicker); }
        })(),
        (async () => {
            try { return await fetchSECFilings(upperTicker, secEmail); }
            catch (err) { logger.error('phase1', 'SEC filings failed', err); fallbacks.push('SEC filings'); return { filings: getMockSECFilings(upperTicker), cik: null }; }
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
        // Balance sheet data for real Altman Z-Score (non-fatal — falls back to estimates)
        (async (): Promise<BalanceSheetData | null> => {
            try { return await fetchBalanceSheet(upperTicker, keys.finnhub); }
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
        secFilings: secFilingsResult.filings,
        secCik: secFilingsResult.cik,
        analystConsensus,
        priceTarget,
        institutionalOwnership,
        balanceSheet,
        fallbacks,
    };
}

/** Phase 2: Compute all derived metrics (ZERO API calls) */
function phaseCompute(
    financials: FinancialData,
    technicals: TechnicalAnalysis,
    candles: { closes: number[]; highs: number[]; lows: number[] } | null,
    sentiment: SentimentResult,
    risks: RiskFactor[],
    insiderActivity: InsiderActivity | null,
    earnings: EarningsData | null,
    balanceSheet: BalanceSheetData | null,
) {
    const investmentScore = computeInvestmentScore(financials, technicals, sentiment, risks, insiderActivity, earnings);
    const financialHealth = computeFinancialHealth(financials, candles?.closes ?? null, balanceSheet);
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
            logger.error('phase2', 'Extended technicals computation failed', err);
        }
    }

    const nipunScore = computeNipunScore(investmentScore, financialHealth, technicals, sentiment, earnings);

    return { investmentScore, financialHealth, momentum, valueGrowth, riskReward, dividendAnalysis, valuationModels, earningsQualityScore, extendedTechnicals, nipunScore };
}

/** Phase 3: AI Synthesis (parallel Gemini calls) */
async function phaseAISynth(financials: FinancialData, sentiment: SentimentResult, risks: RiskFactor[], catalysts: Catalyst[], keys: AnalysisKeys, upperTicker: string) {
    const fallbacks: string[] = [];
    const [report, premiumInsights] = await Promise.all([
        (async () => {
            try { return await synthesizeReport(financials, sentiment, risks, catalysts, keys.gemini); }
            catch (err) { logger.error('phase3', 'Gemini synthesis failed, using mock', err); fallbacks.push('AI report (Gemini)'); return getMockReport(upperTicker); }
        })(),
        (async () => {
            try { return await generatePremiumInsights(financials, sentiment, risks, catalysts, keys.gemini); }
            catch (err) { logger.warn('phase3', 'Premium insights failed (non-fatal)', { ticker: upperTicker }); fallbacks.push('Premium insights (Gemini)'); return null; }
        })(),
    ]);
    return { report, premiumInsights, fallbacks };
}

/** Phase 4: Secondary AI opinions (parallel, non-fatal) */
async function phaseSecondaryAI(financials: FinancialData, sentiment: SentimentResult, risks: RiskFactor[], catalysts: Catalyst[], report: string, keys: AnalysisKeys) {
    const fallbacks: string[] = [];
    const [aiConsensus, audit] = await Promise.all([
        (async () => {
            if (keys.cerebras) {
                try { return await generateSecondOpinion(financials, sentiment, risks, catalysts, report, keys.cerebras); }
                catch (err) { logger.warn('phase4', 'Cerebras consensus failed (non-fatal)', { ticker: undefined }); fallbacks.push('AI consensus (Cerebras)'); return null; }
            }
            return null;
        })(),
        (async () => {
            try { return await auditReport(report, financials, keys.cohere); }
            catch (err) { logger.warn('phase4', 'Cohere audit failed (non-fatal)', { ticker: undefined }); fallbacks.push('Fact audit (Cohere)'); return null; }
        })(),
    ]);
    return { aiConsensus, audit, fallbacks };
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
    headers.set('Vary', 'Origin');

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
