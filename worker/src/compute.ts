/**
 * ─── Pure-Math Compute Module ──────────────────────────────────────
 * All functions here compute metrics from data already fetched.
 * ZERO additional API calls. Every formula is documented.
 */
import type {
    FinancialData, TechnicalAnalysis, InsiderActivity,
    EarningsData, SentimentResult, RiskFactor,
    InvestmentScore, FinancialHealth, NipunScore,
    MomentumData, ValueGrowthProfile, RiskRewardProfile,
    DividendAnalysis, ExtendedTechnicals, ValuationModels,
} from './types';

// ─── Investment Score ──────────────────────────────────────────────
// Weighted composite: Technical 25% + Fundamental 25% + Sentiment 20% + Risk 15% + Insider 15%
export function computeInvestmentScore(
    financials: FinancialData,
    technicals: TechnicalAnalysis | null,
    sentiment: SentimentResult | null,
    risks: RiskFactor[],
    insider: InsiderActivity | null,
    earnings: EarningsData | null
): InvestmentScore {
    // Technical score (0-100)
    let technicalScore = 50;
    if (technicals) {
        const signals = [technicals.rsi, technicals.macd, technicals.sma50, technicals.sma200];
        const bullish = signals.filter(s => s.signal === 'bullish').length;
        technicalScore = (bullish / signals.length) * 100;
        if (technicals.goldenDeathCross?.includes('Golden')) technicalScore = Math.min(100, technicalScore + 10);
        if (technicals.goldenDeathCross?.includes('Death')) technicalScore = Math.max(0, technicalScore - 10);
    }

    // Fundamental score (0-100) — PE, Margin, D/E, EPS
    let fundamentalScore = 50;
    const pe = financials.pe;
    if (pe > 0 && pe < 15) fundamentalScore += 20;
    else if (pe >= 15 && pe < 25) fundamentalScore += 10;
    else if (pe >= 25 && pe < 40) fundamentalScore -= 5;
    else if (pe >= 40) fundamentalScore -= 15;
    if (financials.grossMargin > 50) fundamentalScore += 10;
    else if (financials.grossMargin > 30) fundamentalScore += 5;
    if (financials.debtToEquity < 0.5) fundamentalScore += 10;
    else if (financials.debtToEquity > 2) fundamentalScore -= 10;
    if (financials.eps > 0) fundamentalScore += 5;
    fundamentalScore = clamp(fundamentalScore, 0, 100);

    // Sentiment score (0-100)
    let sentimentScore = 50;
    if (sentiment) {
        sentimentScore = sentiment.bullishPercent;
    }

    // Risk score (0-100, higher = less risky = better)
    const highRisks = risks.filter(r => r.severity === 'high').length;
    const medRisks = risks.filter(r => r.severity === 'medium').length;
    let riskScore = 100 - (highRisks * 20 + medRisks * 10);
    riskScore = clamp(riskScore, 0, 100);

    // Insider score (0-100)
    let insiderScore = 50;
    if (insider) {
        if (insider.netSentiment === 'bullish') insiderScore = 75;
        else if (insider.netSentiment === 'bearish') insiderScore = 25;
        if (insider.totalBuyValue > insider.totalSellValue * 2) insiderScore = Math.min(100, insiderScore + 15);
    }
    // Boost for earnings consistency
    if (earnings && earnings.surprises.length > 0) {
        const beatRate = earnings.surprises.filter(s => s.beat).length / earnings.surprises.length;
        insiderScore = clamp(insiderScore + (beatRate - 0.5) * 20, 0, 100);
    }

    const overall = Math.round(
        technicalScore * 0.25 +
        fundamentalScore * 0.25 +
        sentimentScore * 0.20 +
        riskScore * 0.15 +
        insiderScore * 0.15
    );

    const signal: InvestmentScore['signal'] =
        overall >= 80 ? 'Strong Buy' :
            overall >= 65 ? 'Buy' :
                overall >= 45 ? 'Hold' :
                    overall >= 30 ? 'Sell' : 'Strong Sell';

    return {
        overall,
        signal,
        breakdown: {
            technicalScore: Math.round(technicalScore),
            fundamentalScore: Math.round(fundamentalScore),
            sentimentScore: Math.round(sentimentScore),
            riskScore: Math.round(riskScore),
            insiderScore: Math.round(insiderScore),
        },
        summary: `Overall ${signal} signal (${overall}/100). Technical: ${Math.round(technicalScore)}, Fundamental: ${Math.round(fundamentalScore)}, Sentiment: ${Math.round(sentimentScore)}, Risk: ${Math.round(riskScore)}, Insider: ${Math.round(insiderScore)}.`,
    };
}

// ─── Financial Health ──────────────────────────────────────────────
// Altman Z-Score (simplified for public companies): 1.2*WC/TA + 1.4*RE/TA + 3.3*EBIT/TA + 0.6*MC/TL + 1.0*S/TA
// Piotroski F-Score: 9-point scoring system
export function computeFinancialHealth(
    financials: FinancialData,
    candles: number[] | null
): FinancialHealth {
    const pe = financials.pe || 0;
    const eps = financials.eps || 0;
    const grossMargin = financials.grossMargin || 0;
    const debtToEquity = financials.debtToEquity || 0;
    const price = financials.price || 0;
    const h52 = financials.weekHigh52 || price;
    const l52 = financials.weekLow52 || price;

    // Simplified Altman Z — using available metrics as proxies
    // Z = 1.2*(working capital proxy) + 1.4*(retained earnings proxy) + 3.3*(EBIT proxy) + 0.6*(market cap/debt) + 1.0*(revenue efficiency)
    const wcProxy = grossMargin > 30 ? 0.3 : grossMargin > 10 ? 0.15 : 0.05;
    const reProxy = eps > 0 ? 0.2 : -0.1;
    const ebitProxy = grossMargin > 0 ? (grossMargin / 100) * 0.5 : 0;
    const mcDebtProxy = debtToEquity > 0 ? Math.min(2, 1 / debtToEquity) : 1.5;
    const revProxy = financials.revenue > 0 ? 0.3 : 0.1;

    const altmanZScore = Math.round((1.2 * wcProxy + 1.4 * reProxy + 3.3 * ebitProxy + 0.6 * mcDebtProxy + 1.0 * revProxy) * 100) / 100;
    const altmanZone: FinancialHealth['altmanZone'] =
        altmanZScore >= 2.99 ? 'safe' :
            altmanZScore >= 1.81 ? 'grey' : 'distress';

    // Piotroski F-Score (simplified — 0 to 9)
    let piotroskiFScore = 0;
    if (eps > 0) piotroskiFScore++;                          // Positive net income
    if (financials.revenue > 0) piotroskiFScore++;           // Positive operating CF proxy
    if (grossMargin > 30) piotroskiFScore++;                 // Good ROA proxy
    if (eps > 0 && grossMargin > 0) piotroskiFScore++;       // CF > NI proxy
    if (debtToEquity < 1.0) piotroskiFScore++;               // Decreasing leverage proxy
    if (grossMargin > 20) piotroskiFScore++;                 // Current ratio proxy
    if (financials.marketCap > 1000) piotroskiFScore++;      // No dilution proxy (large cap)
    if (grossMargin > pe * 0.5) piotroskiFScore++;           // Improving margins proxy
    if (financials.revenue > 0) piotroskiFScore++;           // Revenue growth proxy

    const piotroskiRating: FinancialHealth['piotroskiRating'] =
        piotroskiFScore >= 7 ? 'strong' :
            piotroskiFScore >= 4 ? 'moderate' : 'weak';

    // Current & Quick ratio proxies from debt/equity
    const currentRatio = debtToEquity > 0 ? Math.round((1 / debtToEquity + 0.5) * 100) / 100 : 2.0;
    const quickRatio = Math.round(currentRatio * 0.8 * 100) / 100;
    const interestCoverage = eps > 0 && debtToEquity > 0 ? Math.round((eps / (debtToEquity * 0.05)) * 100) / 100 : 10;

    // Price position within 52-week range
    const range = h52 - l52;
    const pricePositionPercent = range > 0 ? Math.round(((price - l52) / range) * 10000) / 100 : 50;

    // Volatility from candle data
    let volatilityCategory: FinancialHealth['volatilityCategory'] = 'moderate';
    if (candles && candles.length > 20) {
        const returns = [];
        for (let i = 1; i < candles.length; i++) {
            if (candles[i - 1] !== 0) {
                returns.push((candles[i] - candles[i - 1]) / candles[i - 1]);
            }
        }
        const stdDev = returns.length > 0 ? Math.sqrt(returns.reduce((s, r) => s + r * r, 0) / returns.length) : 0;
        const annualVol = stdDev * Math.sqrt(252);
        volatilityCategory = annualVol > 0.5 ? 'high' : annualVol > 0.25 ? 'moderate' : 'low';
    } else if (financials.beta > 1.5) {
        volatilityCategory = 'high';
    } else if (financials.beta < 0.8) {
        volatilityCategory = 'low';
    }

    return {
        altmanZScore,
        altmanZone,
        piotroskiFScore,
        piotroskiRating,
        currentRatio,
        quickRatio,
        interestCoverage,
        pricePositionPercent,
        volatilityCategory,
        healthSummary: `Altman Z-Score: ${altmanZScore} (${altmanZone}), Piotroski F-Score: ${piotroskiFScore}/9 (${piotroskiRating}). ${volatilityCategory} volatility. Price at ${pricePositionPercent.toFixed(0)}% of 52-week range.`,
    };
}

// ─── Nipun Score™ ──────────────────────────────────────────────────
// Proprietary composite grade from all dimensions
export function computeNipunScore(
    investmentScore: InvestmentScore,
    financialHealth: FinancialHealth,
    technicals: TechnicalAnalysis | null,
    sentiment: SentimentResult | null,
    earnings: EarningsData | null
): NipunScore {
    const base = investmentScore.overall;

    // Boost/penalty from financial health
    let healthBonus = 0;
    if (financialHealth.altmanZone === 'safe') healthBonus += 5;
    if (financialHealth.altmanZone === 'distress') healthBonus -= 10;
    if (financialHealth.piotroskiRating === 'strong') healthBonus += 5;
    if (financialHealth.piotroskiRating === 'weak') healthBonus -= 5;

    // Earnings consistency bonus
    let earningsBonus = 0;
    if (earnings && earnings.surprises.length >= 4) {
        const allBeat = earnings.surprises.every(s => s.beat);
        if (allBeat) earningsBonus = 8;
        else {
            const beatRate = earnings.surprises.filter(s => s.beat).length / earnings.surprises.length;
            earningsBonus = Math.round((beatRate - 0.5) * 10);
        }
    }

    const numericScore = clamp(base + healthBonus + earningsBonus, 0, 100);

    const grade: NipunScore['grade'] =
        numericScore >= 95 ? 'A+' :
            numericScore >= 90 ? 'A' :
                numericScore >= 85 ? 'A-' :
                    numericScore >= 80 ? 'B+' :
                        numericScore >= 70 ? 'B' :
                            numericScore >= 60 ? 'B-' :
                                numericScore >= 50 ? 'C+' :
                                    numericScore >= 40 ? 'C' :
                                        numericScore >= 30 ? 'C-' :
                                            numericScore >= 20 ? 'D' : 'F';

    // Calculate confidence based on data availability
    let dataPoints = 2; // financials always available + investment score
    if (technicals) dataPoints += 1;
    if (sentiment && sentiment.totalPosts > 0) dataPoints += 1;
    if (earnings && earnings.surprises.length > 0) dataPoints += 1;
    const confidence = Math.min(100, dataPoints * 20);

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (investmentScore.breakdown.technicalScore >= 60) strengths.push('Strong technical momentum');
    else if (investmentScore.breakdown.technicalScore <= 30) weaknesses.push('Weak technical setup');

    if (investmentScore.breakdown.fundamentalScore >= 60) strengths.push('Solid fundamentals');
    else if (investmentScore.breakdown.fundamentalScore <= 30) weaknesses.push('Weak fundamentals');

    if (investmentScore.breakdown.sentimentScore >= 60) strengths.push('Positive market sentiment');
    else if (investmentScore.breakdown.sentimentScore <= 30) weaknesses.push('Negative sentiment');

    if (financialHealth.piotroskiRating === 'strong') strengths.push('Excellent financial health (Piotroski)');
    if (financialHealth.altmanZone === 'distress') weaknesses.push('Bankruptcy risk (Altman Z)');

    if (earnings && earnings.surprises.length >= 4 && earnings.surprises.every(s => s.beat)) {
        strengths.push(`${earnings.surprises.length}-quarter earnings beat streak`);
    }

    const verdict = numericScore >= 70
        ? `Strong investment profile with ${strengths.length} key strengths identified`
        : numericScore >= 50
            ? `Mixed outlook — review strengths and weaknesses before investing`
            : `Below-average profile — significant concerns identified`;

    const recommendation = numericScore >= 80
        ? 'Consider for growth or core portfolio position'
        : numericScore >= 60
            ? 'May suit risk-tolerant investors — monitor closely'
            : numericScore >= 40
                ? 'Exercise caution — significant headwinds identified'
                : 'High-risk position — only for speculative portfolios';

    return { grade, numericScore, confidence, verdict, strengths, weaknesses, recommendation };
}

// ─── Momentum ──────────────────────────────────────────────────────
// Multi-timeframe performance from candle data
export function computeMomentum(candles: number[] | null, financials: FinancialData): MomentumData {
    if (!candles || candles.length < 30) {
        return {
            score: 50, trend: 'flat',
            shortTerm: { period: '7D', performance: 0 },
            mediumTerm: { period: '30D', performance: 0 },
            longTerm: { period: '90D', performance: 0 },
            relativeStrength: 50,
            interpretation: 'Insufficient data for momentum analysis',
        };
    }

    const latest = candles[candles.length - 1];
    const d7 = candles.length >= 7 ? candles[candles.length - 7] : candles[0];
    const d30 = candles.length >= 30 ? candles[candles.length - 30] : candles[0];
    const d90 = candles.length >= 90 ? candles[candles.length - 90] : candles[0];

    const shortPerf = d7 > 0 ? ((latest - d7) / d7) * 100 : 0;
    const medPerf = d30 > 0 ? ((latest - d30) / d30) * 100 : 0;
    const longPerf = d90 > 0 ? ((latest - d90) / d90) * 100 : 0;

    // Momentum score: weighted average of timeframes (guard against NaN)
    const rawScore = shortPerf * 0.4 + medPerf * 0.35 + longPerf * 0.25;
    const score = clamp(Math.round(isFinite(rawScore) ? 50 + rawScore * 3 : 50), 0, 100);

    const trend: MomentumData['trend'] =
        score >= 80 ? 'strong-up' :
            score >= 60 ? 'up' :
                score >= 40 ? 'flat' :
                    score >= 20 ? 'down' : 'strong-down';

    // Relative strength proxy (vs typical market return ~10%/yr → ~0.27%/week)
    const relativeStrength = clamp(Math.round(50 + (shortPerf - 0.27) * 10), 0, 100);

    return {
        score,
        trend,
        shortTerm: { period: '7D', performance: round2(shortPerf) },
        mediumTerm: { period: '30D', performance: round2(medPerf) },
        longTerm: { period: '90D', performance: round2(longPerf) },
        relativeStrength,
        interpretation: `Momentum ${trend} (${score}/100). Short-term: ${shortPerf > 0 ? '+' : ''}${round2(shortPerf)}%, Medium: ${medPerf > 0 ? '+' : ''}${round2(medPerf)}%, Long: ${longPerf > 0 ? '+' : ''}${round2(longPerf)}%.`,
    };
}

// ─── Value/Growth Profile ──────────────────────────────────────────
export function computeValueGrowth(financials: FinancialData): ValueGrowthProfile {
    const pe = financials.pe || 0;
    const eps = financials.eps || 0;
    const price = financials.price || 1;
    const revenue = financials.revenue || 0;

    // Simplified PEG: PE / (EPS growth estimate of 10% default)
    const epsGrowthEst = eps > 0 ? 10 : 0;
    const pegRatio = pe > 0 && epsGrowthEst > 0 ? round2(pe / epsGrowthEst) : 0;

    // P/B proxy: price / (eps * 10 estimate for book value)
    const bvpsEstimate = eps > 0 ? eps * 8 : price * 0.5;
    const priceToBook = bvpsEstimate > 0 ? round2(price / bvpsEstimate) : 0;

    // P/S: price / revenue per share (guard against zero revenue)
    const priceToSales = revenue > 0 ? round2(price / revenue) : 0;

    // Value score: lower PE + PEG + P/B = more value
    let valueScore = 50;
    if (pe > 0 && pe < 15) valueScore += 20;
    else if (pe > 0 && pe < 25) valueScore += 10;
    else if (pe > 40) valueScore -= 15;
    if (pegRatio > 0 && pegRatio < 1) valueScore += 15;
    else if (pegRatio > 2) valueScore -= 10;
    if (priceToBook > 0 && priceToBook < 1.5) valueScore += 10;
    valueScore = clamp(valueScore, 0, 100);

    // Growth score: higher margins + EPS
    let growthScore = 50;
    if (financials.grossMargin > 60) growthScore += 20;
    else if (financials.grossMargin > 40) growthScore += 10;
    if (eps > 5) growthScore += 10;
    if (financials.beta > 1.2) growthScore += 5;
    growthScore = clamp(growthScore, 0, 100);

    const classification: ValueGrowthProfile['classification'] =
        valueScore >= 70 && growthScore < 40 ? 'Deep Value' :
            valueScore >= 55 && growthScore < 55 ? 'Value' :
                growthScore >= 70 && valueScore < 40 ? 'High Growth' :
                    growthScore >= 55 && valueScore < 55 ? 'Growth' : 'Blend';

    return {
        classification,
        valueScore,
        growthScore,
        metrics: { pegRatio, priceToBook, priceToSales, epsGrowth5Y: epsGrowthEst, revenueGrowth5Y: 0 },
        interpretation: `${classification} profile. Value: ${valueScore}/100, Growth: ${growthScore}/100. PEG: ${pegRatio}, P/B: ${priceToBook}, P/S: ${priceToSales}.`,
    };
}

// ─── Risk/Reward Profile ───────────────────────────────────────────
export function computeRiskReward(financials: FinancialData, candles: number[] | null): RiskRewardProfile {
    const beta = financials.beta || 1;
    const price = financials.price || 0;
    const h52 = financials.weekHigh52 || price;
    const l52 = financials.weekLow52 || price;

    // Max drawdown estimate from 52-week range
    const maxDrawdownEstimate = h52 > 0 ? round2(((h52 - l52) / h52) * 100) : 20;

    // Upside potential from 52-week high
    const upsidePotential = price > 0 ? round2(((h52 - price) / price) * 100) : 0;

    // Historical max drawdown from candles
    if (candles && candles.length > 50) {
        let peak = candles[0];
        let maxDD = 0;
        for (const c of candles) {
            if (c > peak) peak = c;
            const dd = (peak - c) / peak;
            if (dd > maxDD) maxDD = dd;
        }
    }

    // Risk level: beta + volatility + drawdown
    const riskLevel = clamp(Math.round(beta * 3 + (maxDrawdownEstimate > 30 ? 3 : maxDrawdownEstimate > 15 ? 1 : 0)), 1, 10);
    const rewardPotential = clamp(Math.round(upsidePotential / 5 + (financials.eps > 0 ? 2 : 0) + (financials.grossMargin > 40 ? 2 : 0)), 1, 10);
    const ratio = riskLevel > 0 ? round2(rewardPotential / riskLevel) : 0;

    const rating: RiskRewardProfile['rating'] =
        ratio >= 2 ? 'Excellent' :
            ratio >= 1.2 ? 'Good' :
                ratio >= 0.8 ? 'Fair' : 'Poor';

    return {
        riskLevel,
        rewardPotential,
        ratio,
        rating,
        maxDrawdownEstimate,
        upsidePotential,
        interpretation: `${rating} risk/reward (${ratio}:1). Risk: ${riskLevel}/10, Reward: ${rewardPotential}/10. Max drawdown estimate: ${maxDrawdownEstimate}%, Upside potential: ${upsidePotential}%.`,
    };
}

// ─── Dividend Analysis ─────────────────────────────────────────────
export function computeDividendAnalysis(financials: FinancialData): DividendAnalysis {
    const yield_ = financials.dividendYield || 0;
    const eps = financials.eps || 0;
    const price = financials.price || 1;

    // Annual dividend = yield * price
    const annualDividend = round2((yield_ / 100) * price);
    // Payout ratio = dividend / EPS
    const payoutRatio = eps > 0 ? round2((annualDividend / eps) * 100) : 0;

    // Safety assessment based on payout ratio
    const safety: DividendAnalysis['safety'] =
        payoutRatio === 0 ? 'moderate' :
            payoutRatio < 40 ? 'very-safe' :
                payoutRatio < 60 ? 'safe' :
                    payoutRatio < 85 ? 'moderate' : 'at-risk';

    return {
        yield: yield_,
        annualDividend,
        payoutRatio,
        growthRate5Y: 0,  // Would need historical data
        yearsOfGrowth: 0,
        exDividendDate: null,
        frequency: 'quarterly',
        safety,
        interpretation: yield_ > 0
            ? `${yield_}% yield ($${annualDividend}/share). Payout ratio: ${payoutRatio}% — ${safety}. ${payoutRatio < 60 ? 'Well-covered dividend.' : payoutRatio < 85 ? 'Moderate payout — monitor earnings.' : 'High payout ratio — sustainability concern.'}`
            : 'No dividend currently paid.',
    };
}

// ─── Extended Technical Indicators ─────────────────────────────────
export function computeExtendedTechnicals(candles: number[], highs?: number[], lows?: number[]): ExtendedTechnicals {
    const latest = candles[candles.length - 1];

    // Bollinger Bands (20-day, 2σ)
    const bbPeriod = 20;
    const bbSlice = candles.slice(-bbPeriod);
    const bbMean = bbSlice.length > 0 ? bbSlice.reduce((a, b) => a + b, 0) / bbSlice.length : 0;
    const bbStdDev = bbSlice.length > 0 ? Math.sqrt(bbSlice.reduce((s, v) => s + (v - bbMean) ** 2, 0) / bbSlice.length) : 0;
    const bollingerBands = {
        upper: round2(bbMean + 2 * bbStdDev),
        middle: round2(bbMean),
        lower: round2(bbMean - 2 * bbStdDev),
        bandwidth: round2((4 * bbStdDev / bbMean) * 100),
        signal: latest > bbMean + 2 * bbStdDev ? 'overbought' as const :
            latest < bbMean - 2 * bbStdDev ? 'oversold' as const : 'neutral' as const,
    };

    // Stochastic Oscillator (14-day)
    const stochPeriod = 14;
    const stochSlice = candles.slice(-stochPeriod);
    const stochHigh = Math.max(...stochSlice);
    const stochLow = Math.min(...stochSlice);
    const stochK = stochHigh !== stochLow ? round2(((latest - stochLow) / (stochHigh - stochLow)) * 100) : 50;
    // %D = 3-period SMA of %K (simplified)
    const stochD = stochK; // Simplified since we're computing a snapshot
    const stochastic = {
        k: stochK,
        d: stochD,
        signal: stochK > 80 ? 'overbought' as const :
            stochK < 20 ? 'oversold' as const : 'neutral' as const,
    };

    // ATR (14-day Average True Range)
    let atr = 0;
    if (candles.length >= 15) {
        let trSum = 0;
        for (let i = candles.length - 14; i < candles.length; i++) {
            const h = highs ? highs[i] : candles[i] * 1.01;
            const l = lows ? lows[i] : candles[i] * 0.99;
            const prevC = candles[i - 1];
            const tr = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
            trSum += tr;
        }
        atr = round2(trSum / 14);
    }

    // Support/Resistance from pivot points
    const pivotSlice = candles.slice(-20);
    const pivotHigh = Math.max(...pivotSlice);
    const pivotLow = Math.min(...pivotSlice);
    const pivot = round2((pivotHigh + pivotLow + latest) / 3);
    const supportResistance = {
        resistance2: round2(pivot + (pivotHigh - pivotLow)),
        resistance1: round2(2 * pivot - pivotLow),
        pivot,
        support1: round2(2 * pivot - pivotHigh),
        support2: round2(pivot - (pivotHigh - pivotLow)),
    };

    // Fibonacci from recent swing
    const allTimeHigh = Math.max(...candles);
    const allTimeLow = Math.min(...candles);
    const fibRange = allTimeHigh - allTimeLow;
    const fibonacci = {
        level236: round2(allTimeHigh - fibRange * 0.236),
        level382: round2(allTimeHigh - fibRange * 0.382),
        level500: round2(allTimeHigh - fibRange * 0.5),
        level618: round2(allTimeHigh - fibRange * 0.618),
        level786: round2(allTimeHigh - fibRange * 0.786),
    };

    // Historical volatility (annualized)
    const returns: number[] = [];
    for (let i = 1; i < candles.length; i++) {
        if (candles[i - 1] > 0) {
            returns.push(Math.log(candles[i] / candles[i - 1]));
        }
    }
    const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const variance = returns.length > 0 ? returns.reduce((s, r) => s + (r - meanReturn) ** 2, 0) / returns.length : 0;
    const historicalVolatility = round2(Math.sqrt(variance * 252) * 100);

    // VWAP proxy (using close as proxy since we don't have intraday volume)
    const vwap = round2(candles.slice(-20).reduce((a, b) => a + b, 0) / 20);

    return {
        bollingerBands,
        stochastic,
        atr,
        supportResistance,
        fibonacci,
        historicalVolatility,
        vwap,
    };
}

// ─── Valuation Models ──────────────────────────────────────────────
export function computeValuationModels(financials: FinancialData): ValuationModels {
    const eps = financials.eps || 0;
    const pe = financials.pe || 0;
    const price = financials.price || 1;

    // ─ DCF (Simplified Gordon Growth Model) ─
    // Intrinsic Value = EPS * (1+g)^10 / (1+r)^10, where g=8%, r=10%
    const growthRate = 0.08;
    const discountRate = 0.10;
    let dcfValue = 0;
    if (eps > 0) {
        let pvSum = 0;
        for (let y = 1; y <= 10; y++) {
            pvSum += (eps * Math.pow(1 + growthRate, y)) / Math.pow(1 + discountRate, y);
        }
        // Terminal value: Year 10 earnings * 15 multiple / discount
        const terminalValue = (eps * Math.pow(1 + growthRate, 10) * 15) / Math.pow(1 + discountRate, 10);
        dcfValue = round2(pvSum + terminalValue);
    }
    const dcfUpside = price > 0 ? round2(((dcfValue - price) / price) * 100) : 0;

    // ─ Graham Number ─
    // √(22.5 × EPS × BVPS) — BVPS estimated as EPS * 8
    const bvps = eps > 0 ? eps * 8 : 0;
    const grahamNumber = eps > 0 && bvps > 0 ? round2(Math.sqrt(22.5 * eps * bvps)) : 0;
    const grahamUpside = price > 0 && grahamNumber > 0 ? round2(((grahamNumber - price) / price) * 100) : 0;

    // ─ Peter Lynch Fair Value ─
    // Fair PE = EPS growth rate (estimated ~ 10-15%)
    // Fair Value = EPS * growth rate
    const lynchGrowthRate = eps > 0 ? 12 : 0;
    const lynchFairValue = eps > 0 ? round2(eps * lynchGrowthRate) : 0;
    const lynchUpside = price > 0 && lynchFairValue > 0 ? round2(((lynchFairValue - price) / price) * 100) : 0;

    // Consensus
    const estimates = [dcfValue, grahamNumber, lynchFairValue].filter(v => v > 0);
    const consensusValue = estimates.length > 0 ? round2(estimates.reduce((a, b) => a + b, 0) / estimates.length) : 0;
    const consensusUpside = price > 0 && consensusValue > 0 ? round2(((consensusValue - price) / price) * 100) : 0;

    return {
        dcf: { value: dcfValue, upside: dcfUpside, methodology: '10-year discounted cash flow (8% growth, 10% discount, 15x terminal)' },
        graham: { value: grahamNumber, upside: grahamUpside, methodology: 'Graham Number: √(22.5 × EPS × Book Value Per Share)' },
        lynch: { value: lynchFairValue, upside: lynchUpside, methodology: 'Peter Lynch fair value: EPS × estimated growth rate' },
        consensus: { value: consensusValue, upside: consensusUpside },
    };
}

// ─── Earnings Quality Score ────────────────────────────────────────
export function computeEarningsQuality(earnings: EarningsData | null): number {
    if (!earnings || !earnings.surprises || earnings.surprises.length === 0) return 50;
    const beats = earnings.surprises.filter(s => s.beat).length;
    const total = earnings.surprises.length;
    if (total === 0) return 50;
    const beatRate = beats / total;
    // Average surprise magnitude
    const avgSurprise = earnings.surprises.reduce((s, e) => s + Math.abs(e.surprisePercent), 0) / total;
    // Score: beat rate * 60 + consistency bonus + magnitude bonus
    const score = beatRate * 60 + (total >= 4 ? 10 : 0) + Math.min(30, avgSurprise * 2);
    return clamp(Math.round(score), 0, 100);
}


// ─── Helpers ───────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}

function round2(v: number): number {
    return Math.round(v * 100) / 100;
}
