import type {
    RiskFactor, Catalyst, FinancialData, SentimentResult,
    ScenarioAnalysis, RevenueBreakdown, CompetitiveMoat,
    SWOTAnalysis, InvestmentThesis, NewsHeadline,
} from './types';

// ─── Multi-Model Gemini Strategy ───────────────────────────────────
// Uses all 5 Gemini models based on task complexity with cascading fallback.
// This maximizes free-tier budget across all model quotas.
//
// Model Allocation:
// ┌──────────────────────┬────────────┬─────────┬─────────┐
// │ Task                 │ Primary    │ Backup  │ RPD     │
// ├──────────────────────┼────────────┼─────────┼─────────┤
// │ Report Synthesis     │ 2.5 Pro    │ 3.1 Pro │ 100     │
// │ Premium Insights     │ 2.5 Flash  │ 3.1 Fl  │ 250     │
// │ Risk/Catalyst Extract│ Flash-Lite │ 2.5 Fl  │ 1,000   │
// └──────────────────────┴────────────┴─────────┴─────────┘

const GEMINI_MODELS = {
    // Complex reasoning — report synthesis
    pro: 'gemini-2.5-pro',
    // Fast reasoning — premium insights (scenario, moat, SWOT)
    flash: 'gemini-2.5-flash',
    // Lightweight — structured extraction (risks, catalysts)
    lite: 'gemini-2.5-flash-lite',
    // Preview fallbacks — next-gen capabilities
    pro3: 'gemini-3.1-pro-preview',
    flash3: 'gemini-3.1-flash-preview',
} as const;

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiResponse {
    candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
    }>;
    error?: { message?: string; code?: number };
}

/**
 * Call Gemini with cascading model fallback.
 * Tries primary model first, falls back to backup models on failure.
 */
async function callGemini(
    prompt: string,
    apiKey: string,
    models: string[],
    config: { temperature: number; maxOutputTokens: number; json?: boolean }
): Promise<string> {
    for (const model of models) {
        try {
            const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: config.temperature,
                        maxOutputTokens: config.maxOutputTokens,
                        ...(config.json ? { responseMimeType: 'application/json' } : {}),
                    },
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.warn(`Gemini ${model} failed (${res.status}): ${errText.slice(0, 200)}`);
                continue; // Try next model
            }

            const data = (await res.json()) as GeminiResponse;
            if (data.error) {
                console.warn(`Gemini ${model} error: ${data.error.message}`);
                continue;
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                console.warn(`Gemini ${model} returned empty response`);
                continue;
            }

            console.log(`✅ Gemini ${model} succeeded`);
            return text;
        } catch (err) {
            console.warn(`Gemini ${model} threw:`, err);
            continue;
        }
    }

    throw new Error('All Gemini models failed');
}

/**
 * Phase 2c — Extract risk factors and catalysts from news context.
 * Uses Flash-Lite (cheapest, 1000 RPD) for structured extraction.
 * Fallback: Flash → Pro
 */
export async function extractRisks(
    ticker: string,
    apiKey: string
): Promise<{ risks: RiskFactor[]; catalysts: Catalyst[]; newsHeadlines: NewsHeadline[] }> {
    // Fetch news context from Yahoo Finance RSS
    let newsContext = '';
    const newsHeadlines: NewsHeadline[] = [];
    try {
        const rssRes = await fetch(
            `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`,
            { headers: { 'User-Agent': 'NipunAI/2.0' } }
        );
        if (rssRes.ok) {
            const xml = await rssRes.text();
            const items = extractNewsItems(xml);
            newsContext = items.slice(0, 20).map((item) => `- ${item.title}`).join('\n');
            newsHeadlines.push(...items.slice(0, 10));
        }
    } catch {
        newsContext = `Recent news headlines for ${ticker} (news feed unavailable — using general knowledge)`;
    }

    const prompt = `Analyze the following news headlines for stock ticker ${ticker} and extract:
1. Risk factors (regulatory, competitive, macro, company-specific) with severity (high/medium/low)
2. Catalysts (upcoming events, product launches, earnings) with timeline and impact

News context:
${newsContext || `General analysis for ${ticker}`}

Return ONLY a JSON object with this exact structure:
{
  "risks": [{"category": "regulatory|competitive|macro|company-specific", "description": "...", "severity": "high|medium|low"}],
  "catalysts": [{"description": "...", "timeline": "...", "impact": "positive|negative|neutral"}]
}`;

    const text = await callGemini(prompt, apiKey, [
        GEMINI_MODELS.lite, GEMINI_MODELS.flash, GEMINI_MODELS.flash3
    ], { temperature: 0.2, maxOutputTokens: 4000, json: true });

    let parsed: { risks?: RiskFactor[]; catalysts?: Catalyst[] };
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('Failed to parse Gemini risk response as JSON');
    }

    return {
        risks: parsed.risks ?? [],
        catalysts: parsed.catalysts ?? [],
        newsHeadlines,
    };
}

/**
 * Phase 3 — Synthesize all data into an institutional-grade report.
 * Uses 2.5 Pro (highest quality, 100 RPD) for complex reasoning.
 * Fallback: 3.1 Pro Preview → 2.5 Flash
 */
export async function synthesizeReport(
    financials: FinancialData,
    sentiment: SentimentResult,
    risks: RiskFactor[],
    catalysts: Catalyst[],
    apiKey: string
): Promise<string> {
    const prompt = `<VERIFIED_NUMBERS>
Ticker: ${financials.ticker}
Price: $${financials.price}
Change: ${financials.change > 0 ? '+' : ''}${financials.change} (${financials.changePercent > 0 ? '+' : ''}${financials.changePercent}%)
Market Cap: $${formatNumber(financials.marketCap)}
P/E Ratio: ${financials.pe}
EPS: $${financials.eps}
Beta: ${financials.beta}
52-Week High: $${financials.weekHigh52}
52-Week Low: $${financials.weekLow52}
Revenue: $${formatNumber(financials.revenue)}
Gross Margin: ${financials.grossMargin}%
Debt-to-Equity: ${financials.debtToEquity}
Dividend Yield: ${financials.dividendYield}%
Volume: ${formatNumber(financials.volume)}
</VERIFIED_NUMBERS>

<SENTIMENT_DATA>
Bullish: ${sentiment.bullishPercent}% | Bearish: ${sentiment.bearishPercent}% | Neutral: ${sentiment.neutralPercent}%
Total Posts Analyzed: ${sentiment.totalPosts}
Key Themes: ${sentiment.themes.join(', ')}
</SENTIMENT_DATA>

<RISK_FACTORS>
${risks.map((r) => `[${r.severity.toUpperCase()}] ${r.category}: ${r.description}`).join('\n')}
</RISK_FACTORS>

<CATALYSTS>
${catalysts.map((c) => `[${c.impact.toUpperCase()}] ${c.description} — Timeline: ${c.timeline}`).join('\n')}
</CATALYSTS>

<INSTRUCTIONS>
Write a comprehensive 800-1000 word institutional-grade financial analysis report for ${financials.ticker}. Structure it with:
1. Executive Summary (2-3 sentences)
2. Financial Health Assessment (quote VERIFIED_NUMBERS verbatim — do NOT modify, interpolate, or calculate from these numbers)
3. Social Sentiment Analysis (reference SENTIMENT_DATA)
4. Risk Factor Analysis (reference RISK_FACTORS, group by severity)
5. Catalyst Outlook (reference CATALYSTS)
6. Conclusion with balanced outlook

CRITICAL: Every number you cite MUST come from VERIFIED_NUMBERS. Do not invent statistics. Do not make price predictions. Do not give buy/sell recommendations.

Format as markdown with headers. End with this exact disclaimer:
"⚠️ DISCLAIMER: This is not financial advice. This report is for educational and informational purposes only. Always conduct your own research and consult with a qualified financial advisor before making investment decisions."
</INSTRUCTIONS>`;

    return await callGemini(prompt, apiKey, [
        GEMINI_MODELS.pro, GEMINI_MODELS.pro3, GEMINI_MODELS.flash
    ], { temperature: 0.4, maxOutputTokens: 8000 });
}

/**
 * Phase 2d — Generate premium AI insights in a single batched call.
 * Returns scenario analysis, revenue breakdown, competitive moat, SWOT, and investment thesis.
 * Uses 2.5 Flash (250 RPD) for fast structured reasoning.
 * Fallback: 3.1 Flash Preview → 2.5 Flash-Lite
 */
export async function generatePremiumInsights(
    financials: FinancialData,
    sentiment: SentimentResult,
    risks: RiskFactor[],
    catalysts: Catalyst[],
    apiKey: string
): Promise<{
    scenarioAnalysis: ScenarioAnalysis;
    revenueBreakdown: RevenueBreakdown;
    competitiveMoat: CompetitiveMoat;
    swotAnalysis: SWOTAnalysis;
    investmentThesis: InvestmentThesis;
}> {
    const prompt = `You are an expert financial analyst. Analyze ${financials.ticker} (${financials.companyName}) using these verified data points:

Price: $${financials.price} | P/E: ${financials.pe} | EPS: $${financials.eps}
Market Cap: $${formatNumber(financials.marketCap)} | Beta: ${financials.beta}
52W High: $${financials.weekHigh52} | 52W Low: $${financials.weekLow52}
Gross Margin: ${financials.grossMargin}% | D/E: ${financials.debtToEquity}
Dividend Yield: ${financials.dividendYield}% | Sector: ${financials.sector}
Sentiment: ${sentiment.bullishPercent}% bullish, ${sentiment.bearishPercent}% bearish
Key Risks: ${risks.slice(0, 3).map(r => r.description).join('; ')}
Key Catalysts: ${catalysts.slice(0, 3).map(c => c.description).join('; ')}

Return a JSON object with ALL of these sections:

{
  "scenarioAnalysis": {
    "bull": { "label": "Bull Case", "price": <number>, "upside": <% from current>, "probability": <0-100>, "rationale": "..." },
    "base": { "label": "Base Case", "price": <number>, "upside": <% from current>, "probability": <0-100>, "rationale": "..." },
    "bear": { "label": "Bear Case", "price": <number>, "upside": <negative % from current>, "probability": <0-100>, "rationale": "..." },
    "timeHorizon": "12 months",
    "methodology": "..."
  },
  "revenueBreakdown": {
    "segments": [{ "name": "...", "revenue": <number>, "percent": <0-100>, "growth": <YoY %> }],
    "totalRevenue": <number>,
    "revenueGrowth": <YoY %>,
    "summary": "..."
  },
  "competitiveMoat": {
    "rating": "Wide|Narrow|None",
    "score": <0-100>,
    "sources": [{ "name": "...", "strength": "strong|moderate|weak", "description": "..." }],
    "durability": "high|medium|low",
    "interpretation": "..."
  },
  "swotAnalysis": {
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "opportunities": ["...", "..."],
    "threats": ["...", "..."]
  },
  "investmentThesis": {
    "summary": "2-3 sentence thesis",
    "bullCase": "Why this could outperform",
    "bearCase": "What could go wrong"
  }
}

IMPORTANT: Use ONLY the verified numbers above. Do not invent data. Provide realistic price targets based on the fundamentals.`;

    const text = await callGemini(prompt, apiKey, [
        GEMINI_MODELS.flash, GEMINI_MODELS.flash3, GEMINI_MODELS.lite
    ], { temperature: 0.3, maxOutputTokens: 6000, json: true });

    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('Failed to parse Gemini premium insights as JSON');
    }

    // Provide defaults for any missing sections
    const defaultScenario = {
        bull: { label: 'Bull Case', price: financials.price * 1.3, upside: 30, probability: 25, rationale: 'Optimistic outlook based on catalysts' },
        base: { label: 'Base Case', price: financials.price * 1.05, upside: 5, probability: 50, rationale: 'Current trajectory maintained' },
        bear: { label: 'Bear Case', price: financials.price * 0.8, upside: -20, probability: 25, rationale: 'Key risks materialize' },
        timeHorizon: '12 months',
        methodology: 'Multi-factor analysis',
    };

    return {
        scenarioAnalysis: parsed.scenarioAnalysis || defaultScenario,
        revenueBreakdown: parsed.revenueBreakdown || { segments: [], totalRevenue: 0, revenueGrowth: 0, summary: 'Revenue breakdown unavailable' },
        competitiveMoat: parsed.competitiveMoat || { rating: 'Narrow', score: 50, sources: [], durability: 'medium', interpretation: 'Insufficient data' },
        swotAnalysis: parsed.swotAnalysis || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        investmentThesis: parsed.investmentThesis || { summary: '', bullCase: '', bearCase: '' },
    };
}

// ─── Helpers ───────────────────────────────────────────────────────
interface NewsItem {
    title: string;
    source: string;
    date: string;
}

function extractNewsItems(xml: string): NewsItem[] {
    const items: NewsItem[] = [];
    const itemRegex = /<item>[\s\S]*?<\/item>/gi;
    let itemMatch: RegExpExecArray | null;
    while ((itemMatch = itemRegex.exec(xml)) !== null) {
        const block = itemMatch[0];
        const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(block);
        const dateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(block);
        if (titleMatch) {
            items.push({
                title: titleMatch[1].trim(),
                source: 'Yahoo Finance',
                date: dateMatch ? dateMatch[1].trim() : '',
            });
        }
    }
    return items;
}

function formatNumber(n: number): string {
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
    return n.toFixed(2);
}
