import type { AIConsensus, FinancialData, SentimentResult, RiskFactor, Catalyst } from './types';

const CEREBRAS_BASE = 'https://api.cerebras.ai/v1/chat/completions';

/**
 * Generate a second independent AI verdict using Cerebras (Llama 4).
 * This is compared with Gemini's synthesis to produce a consensus score.
 */
export async function generateSecondOpinion(
    financials: FinancialData,
    sentiment: SentimentResult,
    risks: RiskFactor[],
    catalysts: Catalyst[],
    geminiReport: string,
    apiKey: string
): Promise<AIConsensus> {
    const prompt = `You are an independent financial analyst. Given the following data for ${financials.ticker}, provide your INDEPENDENT verdict. Do NOT simply agree with any previous analysis.

KEY FINANCIALS:
- Price: $${financials.price} | P/E: ${financials.pe} | EPS: $${financials.eps}
- Market Cap: $${financials.marketCap} | Beta: ${financials.beta}
- 52W Range: $${financials.weekLow52} - $${financials.weekHigh52}

SENTIMENT: ${sentiment.bullishPercent}% bullish, ${sentiment.bearishPercent}% bearish

RISKS: ${risks.map(r => `[${r.severity}] ${r.description}`).join('; ')}

CATALYSTS: ${catalysts.map(c => `${c.description} (${c.timeline})`).join('; ')}

Respond in this EXACT JSON format:
{
  "verdict": "bullish|bearish|neutral",
  "confidence": 0.0-1.0,
  "keyReasons": ["reason1", "reason2", "reason3"],
  "contrarian_view": "What could go wrong with your thesis"
}`;

    const res = await fetch(CEREBRAS_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: [
                { role: 'system', content: 'You are a contrarian financial analyst who provides independent, data-driven opinions. Always respond with valid JSON.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: 'json_object' },
        }),
    });

    if (!res.ok) {
        throw new Error(`Cerebras failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content ?? '{}';
    let parsed: {
        verdict?: string;
        confidence?: number;
        keyReasons?: string[];
        contrarian_view?: string;
    };

    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('Failed to parse Cerebras response as JSON');
    }

    // Extract Gemini's verdict from the report
    const geminiVerdict = extractGeminiVerdict(geminiReport);
    const secondaryVerdict = parsed.verdict || 'neutral';

    // Calculate agreement
    const agree = geminiVerdict.toLowerCase() === secondaryVerdict.toLowerCase();
    const confidence = parsed.confidence || 0.5;
    const agreementScore = agree ? Math.round((0.5 + confidence * 0.5) * 100) : Math.round((0.5 - confidence * 0.3) * 100);

    // Identify divergences
    const divergences: string[] = [];
    if (!agree) {
        divergences.push(`Gemini sees ${geminiVerdict} outlook vs Cerebras sees ${secondaryVerdict} outlook`);
    }
    if (parsed.contrarian_view) {
        divergences.push(parsed.contrarian_view);
    }

    const consensusSummary = agree
        ? `Both AI models agree on a ${geminiVerdict} outlook (${agreementScore}% agreement). ${parsed.keyReasons?.[0] || ''}`
        : `AI models diverge: Gemini is ${geminiVerdict} while Cerebras (Llama 4) is ${secondaryVerdict}. Key disagreement: ${divergences[0] || 'Different weighting of risk factors.'}`;

    return {
        geminiVerdict,
        secondaryVerdict,
        secondaryModel: 'Cerebras Llama 3.3 70B',
        agreementScore,
        divergences,
        consensusSummary,
    };
}

function extractGeminiVerdict(report: string): string {
    const lower = report.toLowerCase();
    const bullishWords = ['bullish', 'positive', 'strong buy', 'outperform', 'upside', 'growth potential'];
    const bearishWords = ['bearish', 'negative', 'underperform', 'downside', 'overvalued', 'risk'];

    let bullishScore = 0;
    let bearishScore = 0;

    for (const word of bullishWords) {
        bullishScore += (lower.match(new RegExp(word, 'g')) || []).length;
    }
    for (const word of bearishWords) {
        bearishScore += (lower.match(new RegExp(word, 'g')) || []).length;
    }

    return bullishScore > bearishScore * 1.3 ? 'bullish'
        : bearishScore > bullishScore * 1.3 ? 'bearish' : 'neutral';
}
