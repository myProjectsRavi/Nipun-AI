import type { AuditResult, AuditClaim, FinancialData } from './types';

/**
 * Phase 4 — Send draft report + sources to Cohere Command R+
 * for RAG-based fact auditing. Each claim is classified as
 * grounded, speculative, or unverifiable.
 */
export async function auditReport(
    report: string,
    financials: FinancialData,
    apiKey: string
): Promise<AuditResult> {
    // Build source documents for grounding
    const sourceDocuments = [
        {
            id: 'finnhub-data',
            title: 'Verified Financial Data (Finnhub API)',
            text: `Ticker: ${financials.ticker}, Price: $${financials.price}, Change: ${financials.change} (${financials.changePercent}%), P/E: ${financials.pe}, EPS: $${financials.eps}, Market Cap: ${financials.marketCap}, Beta: ${financials.beta}, 52W High: $${financials.weekHigh52}, 52W Low: $${financials.weekLow52}, Revenue: ${financials.revenue}, Gross Margin: ${financials.grossMargin}%, Debt/Equity: ${financials.debtToEquity}, Dividend Yield: ${financials.dividendYield}%`,
        },
    ];

    const res = await fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `bearer ${apiKey}`,
            'X-Client-Name': 'NipunAI',
        },
        body: JSON.stringify({
            model: 'command-r-plus',
            messages: [
                {
                    role: 'system',
                    content: `You are a financial fact auditor. Given a financial analysis report and source documents, identify the key factual claims in the report and classify each as:
- "grounded": The claim can be verified from the provided source documents
- "speculative": The claim makes forward-looking projections or analyst opinions
- "unverifiable": The claim cannot be verified from any provided source

Return ONLY a JSON object:
{
  "claims": [
    {"claim": "exact quote from report", "status": "grounded|speculative|unverifiable", "source": "which source document or N/A"}
  ]
}`,
                },
                {
                    role: 'user',
                    content: `Audit this financial report:\n\n${report}`,
                },
            ],
            documents: sourceDocuments.map((d) => ({
                id: d.id,
                data: { title: d.title, snippet: d.text },
            })),
            temperature: 0.1,
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cohere audit failed: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as {
        message?: { content?: Array<{ text?: string }> };
    };

    const content = data.message?.content?.[0]?.text ?? '{}';
    let parsed: { claims?: AuditClaim[] };
    try {
        // Try to extract JSON from the response (Cohere may wrap it in text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
        // If parsing fails, return a minimal audit
        return {
            claims: [
                {
                    claim: 'Audit parsing failed — report delivered without verification',
                    status: 'unverifiable',
                    source: 'N/A',
                },
            ],
            groundedCount: 0,
            speculativeCount: 0,
            unverifiableCount: 1,
        };
    }

    const claims = parsed.claims ?? [];
    return {
        claims,
        groundedCount: claims.filter((c) => c.status === 'grounded').length,
        speculativeCount: claims.filter((c) => c.status === 'speculative').length,
        unverifiableCount: claims.filter((c) => c.status === 'unverifiable').length,
    };
}
