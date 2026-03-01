import type { RiskFactor, Catalyst, FinancialData, SentimentResult } from './types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GeminiResponse {
    candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
    }>;
}

/**
 * Phase 2c — Extract risk factors and catalysts from news context.
 * Uses Gemini 2.0 Flash for structured extraction.
 */
export async function extractRisks(
    ticker: string,
    apiKey: string
): Promise<{ risks: RiskFactor[]; catalysts: Catalyst[] }> {
    // Fetch news context from Yahoo Finance RSS
    let newsContext = '';
    try {
        const rssRes = await fetch(
            `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`,
            { headers: { 'User-Agent': 'NipunAI/1.0' } }
        );
        if (rssRes.ok) {
            const xml = await rssRes.text();
            const items = extractNewsItems(xml);
            newsContext = items.slice(0, 20).map((item) => `- ${item}`).join('\n');
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

    const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 4000,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!res.ok) {
        throw new Error(`Gemini risk extraction failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    let parsed: { risks?: RiskFactor[]; catalysts?: Catalyst[] };
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('Failed to parse Gemini risk response as JSON');
    }

    return {
        risks: parsed.risks ?? [],
        catalysts: parsed.catalysts ?? [],
    };
}

/**
 * Phase 3 — Synthesize all data into an institutional-grade report.
 * Verified numbers are injected with explicit "use verbatim" instructions.
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

    const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 8000,
            },
        }),
    });

    if (!res.ok) {
        throw new Error(`Gemini synthesis failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as GeminiResponse;
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Report generation failed.';
}

// ─── Helpers ───────────────────────────────────────────────────────
function extractNewsItems(xml: string): string[] {
    const items: string[] = [];
    const titleRegex = /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/gi;
    let match: RegExpExecArray | null;
    while ((match = titleRegex.exec(xml)) !== null) {
        items.push(match[1].trim());
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
