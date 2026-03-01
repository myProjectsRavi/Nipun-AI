import type { FinancialData } from './types';

/**
 * Phase 2a — Fetch hard financial data from Finnhub API.
 * Numbers from this layer are NEVER passed through an LLM.
 */
export async function fetchFinancials(ticker: string, apiKey: string): Promise<FinancialData> {
    const [quoteRes, metricsRes] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`),
        fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(ticker)}&metric=all&token=${apiKey}`),
    ]);

    if (!quoteRes.ok) throw new Error(`Finnhub quote failed: ${quoteRes.status}`);
    if (!metricsRes.ok) throw new Error(`Finnhub metrics failed: ${metricsRes.status}`);

    const quote = (await quoteRes.json()) as Record<string, number>;
    const metricsData = (await metricsRes.json()) as { metric: Record<string, number | string>;[k: string]: unknown };
    const m = metricsData.metric || {};

    return {
        ticker: ticker.toUpperCase(),
        companyName: `${ticker.toUpperCase()}`,
        price: quote.c ?? 0,
        change: quote.d ?? 0,
        changePercent: quote.dp ?? 0,
        open: quote.o ?? 0,
        high: quote.h ?? 0,
        low: quote.l ?? 0,
        previousClose: quote.pc ?? 0,
        volume: (m['10DayAverageTradingVolume'] as number) ?? 0,
        marketCap: (m['marketCapitalization'] as number) ?? 0,
        pe: (m['peTTM'] as number) ?? 0,
        eps: (m['epsTTM'] as number) ?? 0,
        beta: (m['beta'] as number) ?? 0,
        weekHigh52: (m['52WeekHigh'] as number) ?? 0,
        weekLow52: (m['52WeekLow'] as number) ?? 0,
        revenue: (m['revenuePerShareTTM'] as number) ?? 0,
        grossMargin: (m['grossMarginTTM'] as number) ?? 0,
        debtToEquity: (m['totalDebt/totalEquityQuarterly'] as number) ?? 0,
        dividendYield: (m['dividendYieldIndicatedAnnual'] as number) ?? 0,
        sector: 'N/A',
    };
}
