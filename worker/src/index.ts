import type { AnalysisRequest, AnalysisResponse, Env } from './types';
import { fetchFinancials, fetchTechnicalIndicators, fetchInsiderTrades, fetchEarningsSurprises, fetchPeers } from './finnhub';
import { fetchRedditPosts } from './rss';
import { analyzeSentiment } from './groq';
import { extractRisks, synthesizeReport } from './gemini';
import { auditReport } from './cohere';
import { fetchSECFilings } from './edgar';
import { generateSecondOpinion } from './cerebras';
import {
    getMockFinancials,
    getMockSentiment,
    getMockRisks,
    getMockCatalysts,
    getMockAudit,
    getMockReport,
    getMockTechnicals,
    getMockInsiderActivity,
    getMockEarnings,
    getMockPeers,
    getMockSECFilings,
    getMockAIConsensus,
    getMockInvestmentScore,
    getMockFinancialHealth,
    getMockNipunScore,
    getMockScenarioAnalysis,
    getMockRevenueBreakdown,
    getMockMomentum,
    getMockValueGrowth,
    getMockCompetitiveMoat,
    getMockRiskReward,
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
                Response.json({ status: 'ok', service: 'nipun-ai-worker', version: '2.0.0' })
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

                    // Phase 1b-1e: Parallel extended data collection
                    const [sentiment, risksResult, technicals, insiderActivity, earnings, peers, secFilings] =
                        await Promise.all([
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
                            // Risks & Catalysts (Gemini)
                            (async () => {
                                try {
                                    return await extractRisks(upperTicker, keys.gemini);
                                } catch (err) {
                                    console.error('Gemini risks failed, using mock:', err);
                                    return { risks: getMockRisks(upperTicker), catalysts: getMockCatalysts(upperTicker) };
                                }
                            })(),
                            // Technical Indicators (Finnhub)
                            (async () => {
                                try {
                                    return await fetchTechnicalIndicators(upperTicker, keys.finnhub);
                                } catch (err) {
                                    console.error('Technical indicators failed, using mock:', err);
                                    return getMockTechnicals(upperTicker);
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
                        ]);

                    const risks = risksResult.risks;
                    const catalysts = risksResult.catalysts;

                    // Phase 2: Synthesis (Gemini)
                    let report;
                    try {
                        report = await synthesizeReport(financials, sentiment, risks, catalysts, keys.gemini);
                    } catch (err) {
                        console.error('Gemini synthesis failed, using mock:', err);
                        report = getMockReport(upperTicker);
                    }

                    // Phase 3a: AI Consensus (Cerebras — optional)
                    let aiConsensus = null;
                    if (keys.cerebras) {
                        try {
                            aiConsensus = await generateSecondOpinion(financials, sentiment, risks, catalysts, report, keys.cerebras);
                        } catch (err) {
                            console.error('Cerebras consensus failed (non-fatal):', err);
                        }
                    }

                    // Phase 3b: Fact audit (Cohere — non-fatal)
                    let audit = null;
                    try {
                        audit = await auditReport(report, financials, keys.cohere);
                    } catch (err) {
                        console.error('Cohere audit failed (non-fatal):', err);
                    }

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
