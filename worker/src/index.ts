import type { AnalysisRequest, AnalysisResponse, Env } from './types';
import { fetchFinancials } from './finnhub';
import { fetchRedditPosts } from './rss';
import { analyzeSentiment } from './groq';
import { extractRisks, synthesizeReport } from './gemini';
import { auditReport } from './cohere';
import {
    getMockFinancials,
    getMockSentiment,
    getMockRisks,
    getMockCatalysts,
    getMockAudit,
    getMockReport,
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
                Response.json({ status: 'ok', service: 'nipun-ai-worker', version: '1.0.0' })
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

                // Check if we should use demo mode (any key missing = demo)
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
                        report: getMockReport(upperTicker),
                        audit: getMockAudit(upperTicker),
                        disclaimer: DISCLAIMER,
                        isDemo: true,
                    };
                } else {
                    // ── LIVE MODE: Full 5-phase pipeline ─────────────────
                    // Each phase has graceful fallback to mock data if API fails

                    // Phase 2a: Financials (Finnhub)
                    let financials;
                    try {
                        financials = await fetchFinancials(upperTicker, keys.finnhub);
                    } catch (err) {
                        console.error('Finnhub failed, using mock:', err);
                        financials = getMockFinancials(upperTicker);
                    }

                    // Phase 2b: Sentiment (Reddit RSS → Groq)
                    let sentiment;
                    try {
                        const posts = await fetchRedditPosts(upperTicker);
                        sentiment = await analyzeSentiment(upperTicker, posts, keys.groq);
                    } catch (err) {
                        console.error('Groq sentiment failed, using mock:', err);
                        sentiment = getMockSentiment(upperTicker);
                    }

                    // Phase 2c: Risks & Catalysts (Gemini)
                    let risks, catalysts;
                    try {
                        const risksData = await extractRisks(upperTicker, keys.gemini);
                        risks = risksData.risks;
                        catalysts = risksData.catalysts;
                    } catch (err) {
                        console.error('Gemini risk extraction failed, using mock:', err);
                        risks = getMockRisks(upperTicker);
                        catalysts = getMockCatalysts(upperTicker);
                    }

                    // Phase 3: Synthesis (Gemini)
                    let report;
                    try {
                        report = await synthesizeReport(financials, sentiment, risks, catalysts, keys.gemini);
                    } catch (err) {
                        console.error('Gemini synthesis failed, using mock:', err);
                        report = getMockReport(upperTicker);
                    }

                    // Phase 4: Fact audit (Cohere) — already non-fatal
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

    // Allow if origin matches any allowed origin, or allow all in dev
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
