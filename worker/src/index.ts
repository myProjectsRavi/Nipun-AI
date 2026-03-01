import type { AnalysisRequest, AnalysisResponse, Env } from './types';
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
            try {
                const body = (await request.json()) as AnalysisRequest;
                const { ticker, keys } = body;

                if (!ticker || typeof ticker !== 'string') {
                    return handleCORS(
                        request,
                        env,
                        Response.json({ error: 'Missing or invalid ticker' }, { status: 400 })
                    );
                }

                const upperTicker = ticker.toUpperCase().trim();

                // Check if we should use demo mode (any required key missing = demo)
                const isDemo =
                    !keys ||
                    !keys.finnhub ||
                    !keys.groq ||
                    !keys.gemini ||
                    !keys.cohere;

                let result: AnalysisResponse;

                if (isDemo) {
                    // ── DEMO MODE: Return mock data ──────────────────────
                    result = {
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
                        // New premium fields — null in demo
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
                } else {
                    // ── LIVE MODE: Full enhanced pipeline ─────────────────
                    // Each phase has graceful fallback to mock data if API fails

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
                        // Sentiment (Reddit RSS → Groq)
                        (async () => {
                            try {
                                const posts = await fetchRedditPosts(upperTicker);
                                return await analyzeSentiment(upperTicker, posts, keys.groq);
                            } catch (err) {
                                console.error('Sentiment failed, using mock:', err);
                                return getMockSentiment(upperTicker);
                            }
                        })(),
                        // Risks & Catalysts & News (Gemini Flash-Lite)
                        (async () => {
                            try {
                                return await extractRisks(upperTicker, keys.gemini);
                            } catch (err) {
                                console.error('Gemini risks failed, using mock:', err);
                                return { risks: getMockRisks(upperTicker), catalysts: getMockCatalysts(upperTicker), newsHeadlines: [] };
                            }
                        })(),
                        // Technical Indicators + raw candle data (Finnhub)
                        (async () => {
                            try {
                                return await fetchTechnicalIndicators(upperTicker, keys.finnhub);
                            } catch (err) {
                                console.error('Technical indicators failed, using mock:', err);
                                return { ...getMockTechnicals(upperTicker), _candles: null as { closes: number[]; highs: number[]; lows: number[] } | null };
                            }
                        })(),
                        // Insider Trades (Finnhub)
                        (async () => {
                            try {
                                return await fetchInsiderTrades(upperTicker, keys.finnhub);
                            } catch (err) {
                                console.error('Insider trades failed, using mock:', err);
                                return getMockInsiderActivity(upperTicker);
                            }
                        })(),
                        // Earnings Surprises (Finnhub)
                        (async () => {
                            try {
                                return await fetchEarningsSurprises(upperTicker, keys.finnhub);
                            } catch (err) {
                                console.error('Earnings failed, using mock:', err);
                                return getMockEarnings(upperTicker);
                            }
                        })(),
                        // Peer Comparison (Finnhub)
                        (async () => {
                            try {
                                return await fetchPeers(upperTicker, keys.finnhub);
                            } catch (err) {
                                console.error('Peers failed, using mock:', err);
                                return getMockPeers(upperTicker);
                            }
                        })(),
                        // SEC Filings (EDGAR — no key needed)
                        (async () => {
                            try {
                                return await fetchSECFilings(upperTicker);
                            } catch (err) {
                                console.error('SEC filings failed:', err);
                                return getMockSECFilings(upperTicker);
                            }
                        })(),
                        // ── NEW: Analyst Consensus (Finnhub free)
                        (async () => {
                            try {
                                return await fetchAnalystConsensus(upperTicker, keys.finnhub);
                            } catch { return null; }
                        })(),
                        // ── NEW: Price Targets (Finnhub free)
                        (async () => {
                            try {
                                return await fetchPriceTargets(upperTicker, keys.finnhub, financials.price);
                            } catch { return null; }
                        })(),
                        // ── NEW: Institutional Ownership (Finnhub free)
                        (async () => {
                            try {
                                return await fetchInstitutionalOwnership(upperTicker, keys.finnhub);
                            } catch { return null; }
                        })(),
                    ]);

                    const sentiment = sentimentResult;
                    const risks = risksResult.risks;
                    const catalysts = risksResult.catalysts;
                    const newsHeadlines = risksResult.newsHeadlines;

                    // Extract candle data and clean technicals
                    const candles = technicalsResult._candles;
                    const technicals = {
                        rsi: technicalsResult.rsi,
                        macd: technicalsResult.macd,
                        sma50: technicalsResult.sma50,
                        sma200: technicalsResult.sma200,
                        overallSignal: technicalsResult.overallSignal,
                        goldenDeathCross: technicalsResult.goldenDeathCross,
                    };

                    // ── Phase 2: Compute all derived metrics (ZERO API calls) ──
                    const investmentScore = computeInvestmentScore(financials, technicals, sentiment, risks, insiderActivity, earnings);
                    const financialHealth = computeFinancialHealth(financials, candles?.closes ?? null);
                    const momentum = computeMomentum(candles?.closes ?? null, financials);
                    const valueGrowth = computeValueGrowth(financials);
                    const riskReward = computeRiskReward(financials, candles?.closes ?? null);
                    const dividendAnalysis = computeDividendAnalysis(financials);
                    const valuationModels = computeValuationModels(financials);
                    const earningsQualityScore = computeEarningsQuality(earnings);

                    // Extended technicals from candle data
                    let extendedTechnicals = null;
                    if (candles && candles.closes.length >= 30) {
                        try {
                            extendedTechnicals = computeExtendedTechnicals(candles.closes, candles.highs, candles.lows);
                        } catch (err) {
                            console.error('Extended technicals computation failed:', err);
                        }
                    }

                    // Nipun Score (depends on investmentScore + financialHealth)
                    const nipunScore = computeNipunScore(investmentScore, financialHealth, technicals, sentiment, earnings);

                    // ── Phase 3: AI Synthesis (parallel Gemini calls) ──
                    const [report, premiumInsights] = await Promise.all([
                        // Report synthesis (Gemini 2.5 Pro → 3.1 Pro → Flash)
                        (async () => {
                            try {
                                return await synthesizeReport(financials, sentiment, risks, catalysts, keys.gemini);
                            } catch (err) {
                                console.error('Gemini synthesis failed, using mock:', err);
                                return getMockReport(upperTicker);
                            }
                        })(),
                        // Premium insights mega-prompt (Gemini 2.5 Flash → 3.1 Flash → Lite)
                        (async () => {
                            try {
                                return await generatePremiumInsights(financials, sentiment, risks, catalysts, keys.gemini);
                            } catch (err) {
                                console.error('Premium insights failed (non-fatal):', err);
                                return null;
                            }
                        })(),
                    ]);

                    // ── Phase 4: Secondary AI opinions (parallel, non-fatal) ──
                    const [aiConsensus, audit] = await Promise.all([
                        // AI Consensus (Cerebras — optional)
                        (async () => {
                            if (keys.cerebras) {
                                try {
                                    return await generateSecondOpinion(financials, sentiment, risks, catalysts, report, keys.cerebras);
                                } catch (err) {
                                    console.error('Cerebras consensus failed (non-fatal):', err);
                                    return null;
                                }
                            }
                            return null;
                        })(),
                        // Fact audit (Cohere — non-fatal)
                        (async () => {
                            try {
                                return await auditReport(report, financials, keys.cohere);
                            } catch (err) {
                                console.error('Cohere audit failed (non-fatal):', err);
                                return null;
                            }
                        })(),
                    ]);

                    result = {
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
                        // ── Computed metrics (real data, not mock!) ──
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
                        // ── New premium fields ──
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

// ─── CORS Helper ───────────────────────────────────────────────────
function handleCORS(request: Request, env: Env, response: Response): Response {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());

    const isAllowed = allowed.includes(origin) || allowed.includes('*');
    const corsOrigin = isAllowed ? origin : allowed[0] || '*';

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', corsOrigin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Max-Age', '86400');

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}
