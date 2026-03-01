import type { FinancialData, TechnicalAnalysis, TechnicalSignal, InsiderTrade, InsiderActivity, EarningsSurprise, EarningsData, PeerMetrics, PeerComparison, AnalystConsensus, PriceTarget, InstitutionalOwnership, InstitutionalHolder } from './types';

const BASE = 'https://finnhub.io/api/v1';

/**
 * Fetch hard financial data from Finnhub API.
 * Numbers from this layer are NEVER passed through an LLM.
 */
export async function fetchFinancials(ticker: string, apiKey: string): Promise<FinancialData> {
    const [quoteRes, metricsRes, profileRes] = await Promise.all([
        fetch(`${BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`),
        fetch(`${BASE}/stock/metric?symbol=${encodeURIComponent(ticker)}&metric=all&token=${apiKey}`),
        fetch(`${BASE}/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`),
    ]);

    if (!quoteRes.ok) throw new Error(`Finnhub quote failed: ${quoteRes.status}`);
    if (!metricsRes.ok) throw new Error(`Finnhub metrics failed: ${metricsRes.status}`);

    const quote = (await quoteRes.json()) as Record<string, number>;
    const metricsData = (await metricsRes.json()) as { metric: Record<string, number | string>;[k: string]: unknown };
    const m = metricsData.metric || {};

    let companyName = ticker.toUpperCase();
    let sector = 'N/A';
    try {
        if (profileRes.ok) {
            const profile = (await profileRes.json()) as Record<string, string>;
            companyName = profile.name || companyName;
            sector = profile.finnhubIndustry || 'N/A';
        }
    } catch { /* profile is best effort */ }

    return {
        ticker: ticker.toUpperCase(),
        companyName,
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
        sector,
    };
}

/**
 * Fetch technical indicators from Finnhub.
 * Computes RSI, MACD interpretation and SMA 50/200 cross detection.
 */
export async function fetchTechnicalIndicators(ticker: string, apiKey: string): Promise<TechnicalAnalysis & { _candles: { closes: number[]; highs: number[]; lows: number[] } }> {
    const now = Math.floor(Date.now() / 1000);
    const oneYearAgo = now - 365 * 86400;

    // Fetch candle data for SMA calculation
    const candleRes = await fetch(
        `${BASE}/stock/candle?symbol=${encodeURIComponent(ticker)}&resolution=D&from=${oneYearAgo}&to=${now}&token=${apiKey}`
    );

    if (!candleRes.ok) throw new Error(`Finnhub candle data failed: ${candleRes.status}`);
    const candle = (await candleRes.json()) as { c?: number[]; s?: string };

    if (candle.s !== 'ok' || !candle.c || candle.c.length < 50) {
        throw new Error('Insufficient candle data for technical analysis');
    }

    const closes = candle.c;
    const latest = closes[closes.length - 1];

    // --- RSI (14-day) ---
    const rsiValue = calculateRSI(closes, 14);
    const rsi: TechnicalSignal = {
        name: 'RSI (14)',
        value: Math.round(rsiValue * 100) / 100,
        signal: rsiValue > 70 ? 'bearish' : rsiValue < 30 ? 'bullish' : 'neutral',
        interpretation: rsiValue > 70 ? 'Overbought — stock may be overvalued, potential pullback'
            : rsiValue < 30 ? 'Oversold — stock may be undervalued, potential bounce'
                : `Neutral territory (${rsiValue.toFixed(1)}) — no strong RSI signal`,
    };

    // --- SMA 50 ---
    const sma50Value = calculateSMA(closes, 50);
    const sma50: TechnicalSignal = {
        name: 'SMA 50',
        value: Math.round(sma50Value * 100) / 100,
        signal: latest > sma50Value ? 'bullish' : 'bearish',
        interpretation: latest > sma50Value
            ? `Price ($${latest.toFixed(2)}) above 50-day SMA ($${sma50Value.toFixed(2)}) — short-term uptrend`
            : `Price ($${latest.toFixed(2)}) below 50-day SMA ($${sma50Value.toFixed(2)}) — short-term weakness`,
    };

    // --- SMA 200 ---
    let sma200: TechnicalSignal;
    let goldenDeathCross: string | null = null;

    if (closes.length >= 200) {
        const sma200Value = calculateSMA(closes, 200);
        sma200 = {
            name: 'SMA 200',
            value: Math.round(sma200Value * 100) / 100,
            signal: latest > sma200Value ? 'bullish' : 'bearish',
            interpretation: latest > sma200Value
                ? `Price above 200-day SMA ($${sma200Value.toFixed(2)}) — long-term uptrend`
                : `Price below 200-day SMA ($${sma200Value.toFixed(2)}) — long-term weakness`,
        };

        if (sma50Value > sma200Value) {
            goldenDeathCross = '🟢 Golden Cross — 50-day SMA above 200-day SMA (bullish long-term signal)';
        } else {
            goldenDeathCross = '🔴 Death Cross — 50-day SMA below 200-day SMA (bearish long-term signal)';
        }
    } else {
        sma200 = {
            name: 'SMA 200',
            value: 0,
            signal: 'neutral',
            interpretation: 'Insufficient data for 200-day SMA',
        };
    }

    // --- MACD (12, 26, 9) ---
    const macdData = calculateMACD(closes);
    const macd: TechnicalSignal = {
        name: 'MACD',
        value: Math.round(macdData.histogram * 100) / 100,
        signal: macdData.histogram > 0 ? 'bullish' : macdData.histogram < 0 ? 'bearish' : 'neutral',
        interpretation: macdData.histogram > 0
            ? 'MACD histogram positive — bullish momentum building'
            : 'MACD histogram negative — bearish momentum',
    };

    // --- Overall signal ---
    const signals = [rsi.signal, macd.signal, sma50.signal, sma200.signal];
    const bullishCount = signals.filter(s => s === 'bullish').length;
    const bearishCount = signals.filter(s => s === 'bearish').length;
    const overallSignal = bullishCount > bearishCount ? 'bullish'
        : bearishCount > bullishCount ? 'bearish' : 'neutral';

    // Return raw candle data for extended technicals (computed in compute.ts)
    const _candles = {
        closes: candle.c!,
        highs: (candle as Record<string, unknown>).h as number[] || candle.c!,
        lows: (candle as Record<string, unknown>).l as number[] || candle.c!,
    };

    return { rsi, macd, sma50, sma200, overallSignal, goldenDeathCross, _candles };
}

/**
 * Fetch insider trading activity from Finnhub.
 */
export async function fetchInsiderTrades(ticker: string, apiKey: string): Promise<InsiderActivity> {
    const res = await fetch(
        `${BASE}/stock/insider-transactions?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`
    );
    if (!res.ok) throw new Error(`Finnhub insider transactions failed: ${res.status}`);

    const data = (await res.json()) as { data?: Array<Record<string, unknown>> };
    const raw = (data.data || []).slice(0, 20);

    let totalBuyValue = 0;
    let totalSellValue = 0;

    const trades: InsiderTrade[] = raw
        .filter(t => t.transactionCode === 'P' || t.transactionCode === 'S' || t.transactionCode === 'M')
        .slice(0, 10)
        .map(t => {
            const shares = Math.abs(Number(t.share) || 0);
            const price = Number(t.transactionPrice) || 0;
            const value = shares * price;
            const txType = t.transactionCode === 'P' ? 'buy'
                : t.transactionCode === 'S' ? 'sell' : 'exercise';

            if (txType === 'buy') totalBuyValue += value;
            if (txType === 'sell') totalSellValue += value;

            return {
                name: String(t.name || 'Unknown'),
                role: String(t.filingType || 'Insider'),
                transactionType: txType as 'buy' | 'sell' | 'exercise',
                shares,
                price,
                value,
                date: String(t.transactionDate || ''),
            };
        });

    const netSentiment: 'bullish' | 'bearish' | 'neutral' =
        totalBuyValue > totalSellValue * 1.2 ? 'bullish'
            : totalSellValue > totalBuyValue * 1.2 ? 'bearish' : 'neutral';

    const summary = trades.length === 0
        ? 'No recent insider transactions found'
        : `${trades.filter(t => t.transactionType === 'buy').length} buys, ${trades.filter(t => t.transactionType === 'sell').length} sells in recent filings`;

    return { trades, netSentiment, totalBuyValue, totalSellValue, summary };
}

/**
 * Fetch earnings surprise history from Finnhub.
 */
export async function fetchEarningsSurprises(ticker: string, apiKey: string): Promise<EarningsData> {
    const [surpriseRes, calendarRes] = await Promise.all([
        fetch(`${BASE}/stock/earnings?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`),
        fetch(`${BASE}/calendar/earnings?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`),
    ]);

    const surprises: EarningsSurprise[] = [];
    if (surpriseRes.ok) {
        const rawSurprises = (await surpriseRes.json()) as Array<Record<string, unknown>>;
        for (const s of rawSurprises.slice(0, 8)) {
            const estimate = Number(s.estimate) || 0;
            const actual = Number(s.actual) || 0;
            const diff = actual - estimate;
            surprises.push({
                quarter: String(s.period || ''),
                estimateEps: estimate,
                actualEps: actual,
                surprise: Math.round(diff * 100) / 100,
                surprisePercent: estimate !== 0 ? Math.round((diff / Math.abs(estimate)) * 10000) / 100 : 0,
                beat: actual >= estimate,
            });
        }
    }

    let nextEarningsDate: string | null = null;
    try {
        if (calendarRes.ok) {
            const cal = (await calendarRes.json()) as { earningsCalendar?: Array<Record<string, string>> };
            if (cal.earningsCalendar && cal.earningsCalendar.length > 0) {
                nextEarningsDate = cal.earningsCalendar[0].date || null;
            }
        }
    } catch { /* calendar is best effort */ }

    const beats = surprises.filter(s => s.beat).length;
    const total = surprises.length;
    const streak = total === 0 ? 'No earnings data'
        : beats === total ? `${total}-quarter beat streak 🔥`
            : beats === 0 ? `${total}-quarter miss streak ⚠️`
                : `Beat ${beats} of last ${total} quarters`;

    return { surprises, streak, nextEarningsDate };
}

/**
 * Fetch peer companies from Finnhub and retrieve basic metrics.
 */
export async function fetchPeers(ticker: string, apiKey: string): Promise<PeerComparison> {
    const peerRes = await fetch(
        `${BASE}/stock/peers?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`
    );
    if (!peerRes.ok) throw new Error(`Finnhub peers failed: ${peerRes.status}`);

    const peerTickers = ((await peerRes.json()) as string[])
        .filter(p => p !== ticker.toUpperCase())
        .slice(0, 5);

    if (peerTickers.length === 0) {
        return { peers: [], relativeValuation: 'No peer data available' };
    }

    // Fetch quotes for peers in parallel
    const peerQuotes = await Promise.all(
        peerTickers.map(async (pt): Promise<PeerMetrics | null> => {
            try {
                const [qRes, mRes] = await Promise.all([
                    fetch(`${BASE}/quote?symbol=${encodeURIComponent(pt)}&token=${apiKey}`),
                    fetch(`${BASE}/stock/metric?symbol=${encodeURIComponent(pt)}&metric=all&token=${apiKey}`),
                ]);
                if (!qRes.ok || !mRes.ok) return null;

                const q = (await qRes.json()) as Record<string, number>;
                const md = (await mRes.json()) as { metric: Record<string, number | string> };
                const mm = md.metric || {};

                return {
                    ticker: pt,
                    price: q.c ?? 0,
                    marketCap: (mm['marketCapitalization'] as number) ?? 0,
                    pe: (mm['peTTM'] as number) ?? 0,
                    eps: (mm['epsTTM'] as number) ?? 0,
                    change: q.dp ?? 0,
                };
            } catch {
                return null;
            }
        })
    );

    const peers = peerQuotes.filter((p): p is PeerMetrics => p !== null);

    // Calculate relative valuation
    const avgPeerPE = peers.length > 0
        ? peers.reduce((acc, p) => acc + (p.pe > 0 ? p.pe : 0), 0) / peers.filter(p => p.pe > 0).length
        : 0;

    const relativeValuation = avgPeerPE === 0
        ? 'Insufficient peer P/E data for comparison'
        : `Avg peer P/E: ${avgPeerPE.toFixed(1)} — check if this ticker trades at a premium or discount to peers`;

    return { peers, relativeValuation };
}


/**
 * Fetch analyst recommendation consensus from Finnhub (FREE endpoint).
 */
export async function fetchAnalystConsensus(ticker: string, apiKey: string): Promise<AnalystConsensus | null> {
    try {
        const res = await fetch(
            `${BASE}/stock/recommendation?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`
        );
        if (!res.ok) return null;

        const data = (await res.json()) as Array<Record<string, number | string>>;
        if (!data || data.length === 0) return null;

        const latest = data[0];
        const buy = Number(latest.buy) || 0;
        const hold = Number(latest.hold) || 0;
        const sell = Number(latest.sell) || 0;
        const strongBuy = Number(latest.strongBuy) || 0;
        const strongSell = Number(latest.strongSell) || 0;
        const total = buy + hold + sell + strongBuy + strongSell;

        let consensusRating: AnalystConsensus['consensusRating'] = 'Hold';
        if (total > 0) {
            const bullish = strongBuy + buy;
            const bearish = strongSell + sell;
            if (bullish > total * 0.6) consensusRating = strongBuy > buy ? 'Strong Buy' : 'Buy';
            else if (bearish > total * 0.6) consensusRating = strongSell > sell ? 'Strong Sell' : 'Sell';
        }

        return {
            buy, hold, sell, strongBuy, strongSell,
            consensusRating,
            period: String(latest.period || ''),
        };
    } catch {
        return null;
    }
}

/**
 * Fetch analyst price targets from Finnhub (FREE endpoint).
 */
export async function fetchPriceTargets(ticker: string, apiKey: string, currentPrice: number): Promise<PriceTarget | null> {
    try {
        const res = await fetch(
            `${BASE}/stock/price-target?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`
        );
        if (!res.ok) return null;

        const data = (await res.json()) as Record<string, number | string>;
        if (!data || !data.targetHigh) return null;

        const targetMean = Number(data.targetMean) || 0;
        return {
            targetHigh: Number(data.targetHigh) || 0,
            targetLow: Number(data.targetLow) || 0,
            targetMean,
            targetMedian: Number(data.targetMedian) || 0,
            numberOfAnalysts: Number(data.lastUpdated ? 1 : 0) || 0,
            currentPrice,
            upsidePercent: currentPrice > 0 ? Math.round(((targetMean - currentPrice) / currentPrice) * 10000) / 100 : 0,
        };
    } catch {
        return null;
    }
}

/**
 * Fetch institutional ownership from Finnhub (FREE endpoint).
 */
export async function fetchInstitutionalOwnership(ticker: string, apiKey: string): Promise<InstitutionalOwnership | null> {
    try {
        const res = await fetch(
            `${BASE}/institutional/ownership?symbol=${encodeURIComponent(ticker)}&limit=10&token=${apiKey}`
        );
        if (!res.ok) return null;

        const data = (await res.json()) as { data?: Array<{ name: string; share: number; change: number; value: number }> };
        if (!data?.data || data.data.length === 0) return null;

        const holders: InstitutionalHolder[] = data.data.slice(0, 10).map(h => ({
            name: h.name || 'Unknown',
            shares: h.share || 0,
            value: h.value || 0,
            changePercent: h.change || 0,
        }));

        const totalShares = holders.reduce((s, h) => s + h.shares, 0);

        return {
            totalOwnership: totalShares,
            holders,
            totalHolders: data.data.length,
        };
    } catch {
        return null;
    }
}


// ─── Math Helpers ──────────────────────────────────────────────────

function calculateRSI(closes: number[], period: number): number {
    if (closes.length < period + 1) return 50;
    let gains = 0, losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function calculateSMA(data: number[], period: number): number {
    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function calculateEMA(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const ema: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
}

function calculateMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
    if (closes.length < 26) return { macd: 0, signal: 0, histogram: 0 };
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signalLine = calculateEMA(macdLine.slice(-9), 9);
    const macd = macdLine[macdLine.length - 1];
    const signal = signalLine[signalLine.length - 1];
    return { macd, signal, histogram: macd - signal };
}
